import dayjs from 'dayjs';

import {
  type AdGroup,
  type ApiSettings,
  type Campaign,
  type CampaignStatus,
  type CampaignType,
  type DeviceShare,
  type ExtensionItem,
  type Keyword,
  type LogEntry,
  type MetricPoint,
  type PlacementOption,
  type ReportRow,
  type SchedulerConfig,
} from '@/types/entities';
import { createRandomGenerator, pickOne } from '@/utils/random';

const random = createRandomGenerator(42);

const campaignNames = [
  'Весна 2025',
  'Тестовая кампания 1',
  'Летняя распродажа',
  'Зимние подарки',
  'Осень в городе',
  'Запуск приложения',
  'Ремаркетинг ноябрь',
  'Заявки с лендинга',
  'Smart-кампания А',
  'Универсальная B2B',
  'Новая коллекция',
  'Имиджевая поддержка',
  'Февральский промоушен',
  'Performance United',
  'Локальные показы',
  'Премьера сервиса',
];

const campaignTypes: CampaignType[] = [
  'TEXT_CAMPAIGN',
  'UNIFIED_CAMPAIGN',
  'SMART_CAMPAIGN',
  'DYNAMIC_CAMPAIGN',
  'MOBILE_APP_CAMPAIGN',
];

const strategies = [
  'SERVING_OFF',
  'MAXIMUM_CLICKS',
  'AVERAGE_CPC',
  'HIGHEST_POSITION',
  'MANUAL_BIDS',
];

const regions = [
  'Москва и область',
  'Санкт-Петербург и область',
  'Новосибирск',
  'Екатеринбург',
  'Россия (все регионы)',
  'Казань',
];

const adjustmentsPool = [
  '+25% на мобильных',
  '+15% в выходные',
  '+35% на аудиторию 25-34',
  '−20% на десктопах',
  '+10% в вечернее время',
];

const methods = ['get', 'add', 'update', 'delete', 'suspend', 'resume'];
const operations = [
  'Campaigns.add',
  'Campaigns.update',
  'Campaigns.delete',
  'Ads.get',
  'Bids.update',
  'Keywords.suspend',
  'Reports.schedule',
  'Clients.get',
];

const errorMessages = [
  'Превышен лимит баллов',
  'Неверный токен авторизации',
  'Сервис временно недоступен',
  'Ошибка валидации запроса',
];

const createCampaign = (index: number): Campaign => {
  const type = campaignTypes[index % campaignTypes.length];
  const status: CampaignStatus =
    index % 6 === 4 ? 'ARCHIVED' : index % 5 === 1 ? 'PAUSED' : 'ACTIVE';
  const startDate = dayjs()
    .subtract(45 - index, 'day')
    .format('YYYY-MM-DD');
  const endDate = dayjs(startDate)
    .add(60 + (index % 5) * 5, 'day')
    .format('YYYY-MM-DD');
  const budget = 40000 + index * 4500 + Math.round(random() * 9000);
  const spend = Math.round(budget * (0.42 + random() * 0.4));
  const clicks = Math.max(120, Math.round(spend / (32 + random() * 18)));
  const impressions = clicks * (9 + Math.round(random() * 12));
  const conversions = Math.max(8, Math.round(clicks * (0.03 + random() * 0.05)));

  const adjustmentCount = 2 + (index % 2);
  const adjustments = Array.from({ length: adjustmentCount }, () =>
    pickOne(adjustmentsPool, random),
  );

  return {
    id: index + 1,
    name: campaignNames[index],
    type,
    status,
    strategy: strategies[index % strategies.length],
    budget,
    dailyBudget: Math.round(budget / 30),
    startDate,
    endDate,
    region: regions[index % regions.length],
    adjustments,
    spend,
    clicks,
    impressions,
    conversions,
  };
};

export const campaigns: Campaign[] = campaignNames.map((_, index) => createCampaign(index));

let entityCounter = 1;

const createAdGroups = (): AdGroup[] =>
  campaigns.flatMap((campaign, campaignIndex) => {
    const groupsCount = 5 + (campaignIndex % 4);
    return Array.from({ length: groupsCount }).map((_, groupIndex) => {
      const id = entityCounter++;
      const adsCount = 2 + ((groupIndex + campaignIndex) % 2);
      const ads = Array.from({ length: adsCount }).map((__, adIndex) => ({
        id: entityCounter++,
        name: `Объявление ${groupIndex + 1}.${adIndex + 1}`,
        status: groupIndex % 3 === 2 ? 'PAUSED' : 'ACTIVE',
        bid: Number((3.5 + random() * 2.5).toFixed(2)),
        ctr: Number((3 + random() * 4).toFixed(2)),
        url: `https://example.com/${campaign.id}/ad-${groupIndex + 1}-${adIndex + 1}`,
      }));

      return {
        id,
        campaignId: campaign.id,
        name: `Группа ${groupIndex + 1}`,
        status: groupIndex % 4 === 3 ? 'PAUSED' : 'ACTIVE',
        bid: Number((4 + random() * 3).toFixed(2)),
        ctr: Number((4 + random() * 3).toFixed(2)),
        url: `https://example.com/${campaign.id}/group-${groupIndex + 1}`,
        ads,
      };
    });
  });

export const adGroups: AdGroup[] = createAdGroups();

const matchTypes = ['EXACT', 'PHRASE', 'BROAD'] as const;
const keywordSeeds = [
  'купить',
  'цена',
  'скидка',
  'заказать',
  'онлайн',
  'доставка',
  'официальный',
  'акция',
  'отзывы',
  'лучший',
];

export const keywords: Keyword[] = campaigns.flatMap((campaign, index) => {
  const keywordCount = 6 + (index % 5);
  return Array.from({ length: keywordCount }).map((_, keywordIndex) => {
    const phrase = `${keywordSeeds[(index + keywordIndex) % keywordSeeds.length]} ${campaign.name.toLowerCase()}`;
    const impressions = 800 + Math.round(random() * 1500);
    const clicks = Math.max(25, Math.round(impressions * (0.06 + random() * 0.04)));
    const ctr = Number(((clicks / impressions) * 100).toFixed(2));
    return {
      id: entityCounter++,
      campaignId: campaign.id,
      phrase,
      matchType: matchTypes[(index + keywordIndex) % matchTypes.length],
      bid: Number((2 + random() * 3).toFixed(2)),
      status: keywordIndex % 5 === 4 ? 'PAUSED' : 'ACTIVE',
      impressions,
      clicks,
      ctr,
      negative: keywordIndex % 7 === 0,
    };
  });
});

const daysRange = Array.from({ length: 30 }).map((_, offset) =>
  dayjs()
    .subtract(29 - offset, 'day')
    .format('YYYY-MM-DD'),
);

export const metrics: MetricPoint[] = campaigns.flatMap((campaign) =>
  daysRange.map((date) => {
    const base = campaign.impressions / daysRange.length;
    const impressions = Math.round(base * (0.7 + random() * 0.6));
    const clicks = Math.max(12, Math.round(impressions * (0.05 + random() * 0.04)));
    const conversions = Math.max(1, Math.round(clicks * (0.04 + random() * 0.03)));
    const cost = Number(((campaign.spend / daysRange.length) * (0.75 + random() * 0.5)).toFixed(2));
    return {
      campaignId: campaign.id,
      date,
      impressions,
      clicks,
      conversions,
      cost,
    };
  }),
);

export const deviceSplit: DeviceShare[] = (() => {
  const mobile = Math.round(35 + random() * 30);
  const tablet = Math.round(8 + random() * 12);
  const desktop = 100 - mobile - tablet;
  return [
    { device: 'desktop', value: desktop },
    { device: 'mobile', value: mobile },
    { device: 'tablet', value: tablet },
  ];
})();

export const reportRows: ReportRow[] = campaigns.map((campaign) => {
  const cpc = campaign.clicks ? Number((campaign.spend / campaign.clicks).toFixed(2)) : 0;
  const roi = campaign.spend
    ? Number(((campaign.conversions * 3000) / campaign.spend).toFixed(2))
    : 0;
  return {
    campaignId: campaign.id,
    campaign: campaign.name,
    impressions: campaign.impressions,
    clicks: campaign.clicks,
    spend: campaign.spend,
    cpc,
    conversions: campaign.conversions,
    roi,
  };
});

export const placements: PlacementOption[] = [
  { id: 1, name: 'Поиск Яндекса', enabled: true },
  { id: 2, name: 'Рекламная сеть Яндекса', enabled: true },
  { id: 3, name: 'Яндекс.Карты', enabled: true },
  { id: 4, name: 'Яндекс.Маркет', enabled: false },
  { id: 5, name: 'Сеть партнёров', enabled: true },
  { id: 6, name: 'Видео-сеть', enabled: false },
];

export const extensions: ExtensionItem[] = [
  { id: 1, type: 'sitelink', label: 'Быстрая ссылка', value: 'https://example.com/catalog' },
  { id: 2, type: 'call', label: 'Телефон', value: '+7 (495) 123-45-67' },
  { id: 3, type: 'image', label: 'Изображение', value: 'image_hero.jpg' },
  { id: 4, type: 'sitelink', label: 'Оплата и доставка', value: 'https://example.com/delivery' },
];

export const initialApiSettings: ApiSettings = {
  token: 't1.demo.fake.token',
  clientId: '12345-demo-client',
  apiUsage: 420,
  apiLimit: 1000,
  autoPauseThreshold: 0.8,
  parallelStreams: 4,
  delayMs: 250,
  notifications: {
    limit: true,
    errors: true,
  },
  isPaused: false,
};

export const schedulerConfig: SchedulerConfig = {
  frequency: 'daily',
  email: 'reports@example.com',
  time: '09:00',
  lastRun: dayjs().subtract(1, 'day').toISOString(),
};

const buildLogEntry = (id: number): LogEntry => {
  const success = random() > 0.22;
  const httpCode = success ? 200 : pickOne([400, 401, 403, 429, 500], random);
  return {
    id,
    timestamp: dayjs()
      .subtract(random() * 72, 'hour')
      .toISOString(),
    method: pickOne(methods, random),
    operation: pickOne(operations, random),
    status: success ? 'success' : 'error',
    httpCode,
    duration: Math.round(120 + random() * 750),
    message: success ? 'Выполнено успешно' : pickOne(errorMessages, random),
  };
};

export const logs: LogEntry[] = Array.from({ length: 90 }).map((_, index) =>
  buildLogEntry(index + 1),
);

export const queueState = {
  pending: Math.round(5 + random() * 12),
  paused: false,
};

export const dashboardDates = daysRange;
