import dayjs from 'dayjs';
import { defineStore } from 'pinia';

import {
  adGroups as initialAdGroups,
  campaigns as initialCampaigns,
  dashboardDates,
  deviceSplit,
  extensions as initialExtensions,
  initialApiSettings,
  keywords as initialKeywords,
  logs as initialLogs,
  metrics as initialMetrics,
  placements as initialPlacements,
  queueState as initialQueueState,
  reportRows as initialReportRows,
  schedulerConfig as initialScheduler,
} from '@/data/mockData';
import {
  type AdGroup,
  type ApiSettings,
  type Campaign,
  type CampaignStatus,
  type ExtensionItem,
  type Keyword,
  type LogEntry,
  type MetricPoint,
  type PlacementOption,
  type QueueState,
  type ReportRow,
  type SchedulerConfig,
} from '@/types/entities';
import { createRandomGenerator, pickOne } from '@/utils/random';

const runtimeRandom = createRandomGenerator(2025);
const httpCodes = [200, 201, 202, 204, 400, 401, 403, 404, 409, 429, 500];
const methods = ['get', 'add', 'update', 'delete', 'suspend', 'resume'];
const operations = [
  'Campaigns.add',
  'Campaigns.update',
  'Campaigns.delete',
  'Ads.add',
  'Keywords.suspend',
  'Reports.get',
  'Clients.get',
];
const errorMessages = [
  'Превышен лимит баллов',
  'Недостаточно прав доступа',
  'Валидация данных не пройдена',
  'Повторите попытку позже',
];

const cloneDeep = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const computeNextEntityId = () => {
  const groupIds = initialAdGroups
    .map((group) => [group.id, ...group.ads.map((ad) => ad.id)])
    .flat();
  const keywordIds = initialKeywords.map((keyword) => keyword.id);
  return Math.max(...groupIds, ...keywordIds, 0) + 1;
};

const computePerformanceTrend = (metrics: MetricPoint[]) => {
  const aggregated = new Map<string, { impressions: number; clicks: number }>();
  metrics.forEach((metric) => {
    const current = aggregated.get(metric.date) ?? { impressions: 0, clicks: 0 };
    current.impressions += metric.impressions;
    current.clicks += metric.clicks;
    aggregated.set(metric.date, current);
  });
  const sorted = Array.from(aggregated.entries()).sort((a, b) => (a[0] > b[0] ? 1 : -1));
  return {
    dates: sorted.map(([date]) => date),
    impressions: sorted.map(([, value]) => value.impressions),
    clicks: sorted.map(([, value]) => value.clicks),
  };
};

const computeConversionTrend = (metrics: MetricPoint[]) => {
  const aggregated = new Map<string, number>();
  metrics.forEach((metric) => {
    aggregated.set(metric.date, (aggregated.get(metric.date) ?? 0) + metric.conversions);
  });
  return Array.from(aggregated.entries())
    .sort((a, b) => (a[0] > b[0] ? 1 : -1))
    .map(([date, conversions]) => ({ date, conversions }));
};

const computeSpendByCampaign = (campaigns: Campaign[]) =>
  campaigns.map((campaign) => ({ name: campaign.name, value: campaign.spend }));

const sortedLogs = [...initialLogs].sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));

export const useDataStore = defineStore('data', {
  state: () => ({
    campaigns: cloneDeep(initialCampaigns) as Campaign[],
    adGroups: cloneDeep(initialAdGroups) as AdGroup[],
    keywords: cloneDeep(initialKeywords) as Keyword[],
    metrics: cloneDeep(initialMetrics) as MetricPoint[],
    deviceSplit,
    reportRows: cloneDeep(initialReportRows) as ReportRow[],
    placements: cloneDeep(initialPlacements) as PlacementOption[],
    extensions: cloneDeep(initialExtensions) as ExtensionItem[],
    apiSettings: { ...initialApiSettings } as ApiSettings,
    scheduler: { ...initialScheduler } as SchedulerConfig,
    queue: { ...initialQueueState } as QueueState,
    logs: sortedLogs as LogEntry[],
    dashboardDates,
    nextEntityId: computeNextEntityId(),
    lastSyncAt: dayjs().subtract(2, 'hour').toISOString(),
  }),
  getters: {
    activeCampaignsCount: (state) =>
      state.campaigns.filter((campaign) => campaign.status === 'ACTIVE').length,
    totalSpend: (state) => state.campaigns.reduce((acc, campaign) => acc + campaign.spend, 0),
    totalClicks: (state) => state.campaigns.reduce((acc, campaign) => acc + campaign.clicks, 0),
    totalConversions: (state) =>
      state.campaigns.reduce((acc, campaign) => acc + campaign.conversions, 0),
    performanceTrend: (state) => computePerformanceTrend(state.metrics),
    spendByCampaign: (state) => computeSpendByCampaign(state.campaigns),
    conversionTrend: (state) => computeConversionTrend(state.metrics),
    campaignById: (state) => (id: number) => state.campaigns.find((campaign) => campaign.id === id),
    adGroupsByCampaign: (state) => (campaignId: number) =>
      state.adGroups.filter((group) => group.campaignId === campaignId),
    keywordsByCampaign: (state) => (campaignId: number) =>
      state.keywords.filter((keyword) => keyword.campaignId === campaignId),
  },
  actions: {
    generateEntityId() {
      const value = this.nextEntityId;
      this.nextEntityId += 1;
      return value;
    },
    async synchronizeData() {
      this.queue.pending = Math.round(3 + runtimeRandom() * 9);
      await new Promise((resolve) => setTimeout(resolve, 800));
      this.lastSyncAt = dayjs().toISOString();
      this.queue.pending = Math.max(0, this.queue.pending - 2);
    },
    async refreshStatistics() {
      await new Promise((resolve) => setTimeout(resolve, 600));
      this.campaigns = this.campaigns.map((campaign) => {
        const multiplier = 0.96 + runtimeRandom() * 0.08;
        const spend = Math.round(campaign.spend * multiplier);
        const clicks = Math.max(80, Math.round(campaign.clicks * (0.95 + runtimeRandom() * 0.1)));
        const conversions = Math.max(
          5,
          Math.round(campaign.conversions * (0.92 + runtimeRandom() * 0.12)),
        );
        return { ...campaign, spend, clicks, conversions };
      });
      this.lastSyncAt = dayjs().toISOString();
    },
    addCampaign(campaign: Omit<Campaign, 'id'>) {
      const newId = Math.max(...this.campaigns.map((item) => item.id), 0) + 1;
      const created: Campaign = { ...campaign, id: newId };
      this.campaigns.push(created);
      this.reportRows.push({
        campaignId: created.id,
        campaign: created.name,
        impressions: created.impressions,
        clicks: created.clicks,
        spend: created.spend,
        cpc: created.clicks ? Number((created.spend / created.clicks).toFixed(2)) : 0,
        conversions: created.conversions,
        roi: created.spend ? Number(((created.conversions * 3000) / created.spend).toFixed(2)) : 0,
      });
      return newId;
    },
    updateCampaign(id: number, payload: Partial<Campaign>) {
      const index = this.campaigns.findIndex((campaign) => campaign.id === id);
      if (index === -1) {
        return;
      }
      this.campaigns[index] = { ...this.campaigns[index], ...payload };
      const reportIndex = this.reportRows.findIndex((row) => row.campaignId === id);
      if (reportIndex !== -1) {
        const campaign = this.campaigns[index];
        this.reportRows[reportIndex] = {
          campaignId: campaign.id,
          campaign: campaign.name,
          impressions: campaign.impressions,
          clicks: campaign.clicks,
          spend: campaign.spend,
          cpc: campaign.clicks ? Number((campaign.spend / campaign.clicks).toFixed(2)) : 0,
          conversions: campaign.conversions,
          roi: campaign.spend
            ? Number(((campaign.conversions * 3000) / campaign.spend).toFixed(2))
            : 0,
        };
      }
    },
    toggleCampaignStatus(id: number, status: CampaignStatus) {
      this.updateCampaign(id, { status });
      this.queue.pending = Math.max(0, this.queue.pending - 1);
    },
    archiveCampaign(id: number) {
      this.updateCampaign(id, { status: 'ARCHIVED' });
    },
    duplicateCampaign(id: number) {
      const campaign = this.campaigns.find((item) => item.id === id);
      if (!campaign) {
        return;
      }
      const newId = Math.max(...this.campaigns.map((item) => item.id), 0) + 1;
      const clone: Campaign = {
        ...campaign,
        id: newId,
        name: `${campaign.name} (копия)`,
        status: 'PAUSED',
        startDate: dayjs().format('YYYY-MM-DD'),
        endDate: dayjs().add(60, 'day').format('YYYY-MM-DD'),
      };
      this.campaigns.push(clone);

      const relatedGroups = this.adGroups.filter((group) => group.campaignId === campaign.id);
      relatedGroups.forEach((group) => {
        const newGroupId = this.generateEntityId();
        const ads = group.ads.map((ad) => ({
          ...ad,
          id: this.generateEntityId(),
          status: 'PAUSED',
        }));
        this.adGroups.push({
          ...group,
          id: newGroupId,
          campaignId: newId,
          status: 'PAUSED',
          ads,
        });
      });

      const relatedKeywords = this.keywords.filter((keyword) => keyword.campaignId === campaign.id);
      relatedKeywords.forEach((keyword) => {
        this.keywords.push({
          ...keyword,
          id: this.generateEntityId(),
          campaignId: newId,
          status: 'PAUSED',
        });
      });

      this.metrics.push(
        ...this.metrics
          .filter((metric) => metric.campaignId === campaign.id)
          .map((metric) => ({ ...metric, campaignId: newId })),
      );

      this.reportRows.push({
        campaignId: newId,
        campaign: clone.name,
        impressions: clone.impressions,
        clicks: clone.clicks,
        spend: clone.spend,
        cpc: clone.clicks ? Number((clone.spend / clone.clicks).toFixed(2)) : 0,
        conversions: clone.conversions,
        roi: clone.spend ? Number(((clone.conversions * 3000) / clone.spend).toFixed(2)) : 0,
      });
    },
    removeCampaign(id: number) {
      this.archiveCampaign(id);
      this.logs.unshift({
        id: this.logs.length + 1,
        timestamp: dayjs().toISOString(),
        method: 'delete',
        operation: 'Campaigns.delete',
        status: 'success',
        httpCode: 200,
        duration: 120,
        message: `Кампания ${id} отправлена в архив`,
      });
    },
    updateKeywordBid(id: number, bid: number) {
      const index = this.keywords.findIndex((keyword) => keyword.id === id);
      if (index === -1) {
        return;
      }
      this.keywords[index] = { ...this.keywords[index], bid };
    },
    bulkIncreaseBids(percent: number, predicate?: (keyword: Keyword) => boolean) {
      this.keywords = this.keywords.map((keyword) => {
        if (predicate && !predicate(keyword)) {
          return keyword;
        }
        const multiplier = 1 + percent / 100;
        return { ...keyword, bid: Number((keyword.bid * multiplier).toFixed(2)) };
      });
    },
    bulkChangeKeywordStatus(status: CampaignStatus, predicate?: (keyword: Keyword) => boolean) {
      this.keywords = this.keywords.map((keyword) => {
        if (predicate && !predicate(keyword)) {
          return keyword;
        }
        return { ...keyword, status };
      });
    },
    consumeApiPoints(points: number) {
      this.apiSettings.apiUsage = Math.min(
        this.apiSettings.apiLimit,
        this.apiSettings.apiUsage + points,
      );
      this.checkApiPause();
    },
    resetApiUsage() {
      this.apiSettings.apiUsage = 0;
      this.apiSettings.isPaused = false;
      this.queue.paused = false;
    },
    updateApiSettings(payload: Partial<ApiSettings>) {
      this.apiSettings = { ...this.apiSettings, ...payload };
      this.checkApiPause();
    },
    updateScheduler(payload: Partial<SchedulerConfig>) {
      this.scheduler = { ...this.scheduler, ...payload };
    },
    togglePlacement(id: number, enabled: boolean) {
      const index = this.placements.findIndex((placement) => placement.id === id);
      if (index !== -1) {
        this.placements[index] = { ...this.placements[index], enabled };
      }
    },
    appendLog(entry?: Partial<LogEntry>) {
      const log: LogEntry = {
        id: this.logs.length + 1,
        timestamp: dayjs().toISOString(),
        method: entry?.method ?? pickOne(methods, runtimeRandom),
        operation: entry?.operation ?? pickOne(operations, runtimeRandom),
        status: entry?.status ?? (runtimeRandom() > 0.18 ? 'success' : 'error'),
        httpCode: entry?.httpCode ?? pickOne(httpCodes, runtimeRandom),
        duration: entry?.duration ?? Math.round(90 + runtimeRandom() * 800),
        message:
          entry?.message ??
          (runtimeRandom() > 0.2
            ? 'Запрос успешно обработан'
            : pickOne(errorMessages, runtimeRandom)),
      };
      this.logs.unshift(log);
      if (this.logs.length > 250) {
        this.logs.pop();
      }
    },
    clearLogs() {
      this.logs = [];
    },
    checkApiPause() {
      const thresholdValue = this.apiSettings.apiLimit * this.apiSettings.autoPauseThreshold;
      const shouldPause = this.apiSettings.apiUsage >= thresholdValue;
      this.apiSettings.isPaused = shouldPause;
      this.queue.paused = shouldPause;
    },
    setQueueState(partial: Partial<QueueState>) {
      this.queue = { ...this.queue, ...partial };
    },
  },
});
