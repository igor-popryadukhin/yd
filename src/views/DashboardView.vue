<script setup lang="ts">
import { PlusOutlined, ReloadOutlined, SyncOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { useDataStore } from '@/stores/dataStore';

const router = useRouter();
const { t } = useI18n();
const dataStore = useDataStore();

const loading = ref(true);

onMounted(() => {
  setTimeout(() => {
    loading.value = false;
  }, 800);
});

const numberFormatter = new Intl.NumberFormat('ru-RU');
const currencyFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

const statsCards = computed(() => [
  {
    title: t('dashboard.cards.active'),
    value: dataStore.activeCampaignsCount,
    suffix: '',
  },
  {
    title: t('dashboard.cards.budget'),
    value: currencyFormatter.format(dataStore.totalSpend),
  },
  {
    title: t('dashboard.cards.clicks'),
    value: numberFormatter.format(dataStore.totalClicks),
  },
  {
    title: t('dashboard.cards.conversions'),
    value: numberFormatter.format(dataStore.totalConversions),
  },
]);

const performanceOptions = computed(() => ({
  grid: { left: 32, right: 24, top: 48, bottom: 32 },
  tooltip: { trigger: 'axis' },
  legend: {
    data: ['Показы', 'Клики'],
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: dataStore.performanceTrend.dates,
  },
  yAxis: {
    type: 'value',
  },
  series: [
    {
      name: 'Показы',
      type: 'line',
      smooth: true,
      areaStyle: {},
      symbol: 'circle',
      data: dataStore.performanceTrend.impressions,
    },
    {
      name: 'Клики',
      type: 'line',
      smooth: true,
      areaStyle: {},
      symbol: 'circle',
      data: dataStore.performanceTrend.clicks,
    },
  ],
}));

const apiUsage = computed(() =>
  Math.round((dataStore.apiSettings.apiUsage / dataStore.apiSettings.apiLimit) * 100),
);

const queueStatus = computed(() => ({
  pending: dataStore.queue.pending,
  paused: dataStore.queue.paused || dataStore.apiSettings.isPaused,
}));

const handleCreate = () => {
  router.push({ path: '/campaigns/new' });
};

const handleSync = async () => {
  loading.value = true;
  await dataStore.synchronizeData();
  loading.value = false;
  message.success(t('dashboard.actions.sync'));
};

const handleRefresh = async () => {
  loading.value = true;
  await dataStore.refreshStatistics();
  loading.value = false;
  message.success(t('dashboard.actions.refresh'));
};
</script>

<template>
  <a-space direction="vertical" size="large" style="width: 100%">
    <a-row :gutter="16">
      <a-col :span="18">
        <a-card :loading="loading" bordered hoverable>
          <template #title>
            <span class="section-title">{{ t('dashboard.title') }}</span>
          </template>
          <a-row :gutter="16">
            <a-col v-for="card in statsCards" :key="card.title" :span="6">
              <a-statistic :title="card.title" :value="card.value" />
            </a-col>
          </a-row>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card bordered hoverable>
          <template #title>
            <span>{{ t('dashboard.queue.title') }}</span>
          </template>
          <a-space direction="vertical" size="middle" style="width: 100%">
            <div>
              <div>{{ t('dashboard.queue.pending') }}</div>
              <a-statistic :value="queueStatus.pending" suffix="шт." />
            </div>
            <a-alert
              v-if="queueStatus.paused"
              type="warning"
              show-icon
              :message="t('dashboard.queue.paused')"
            />
            <a-alert v-else type="success" show-icon :message="t('dashboard.queue.active')" />
            <div>
              <div>{{ t('apiSettings.limit.title') }}</div>
              <a-progress :percent="apiUsage" :status="apiUsage >= 80 ? 'exception' : 'active'" />
            </div>
          </a-space>
        </a-card>
      </a-col>
    </a-row>

    <a-card hoverable :loading="loading">
      <template #title>
        <span class="section-title">{{ t('dashboard.performanceChart') }}</span>
      </template>
      <div class="chart-card">
        <VChart :option="performanceOptions" autoresize />
      </div>
    </a-card>

    <a-row :gutter="16">
      <a-col :span="8">
        <a-card hoverable>
          <a-space direction="vertical" size="middle" style="width: 100%">
            <a-tooltip :title="t('dashboard.tooltips.create')">
              <a-button block type="primary" size="large" @click="handleCreate">
                <PlusOutlined />
                {{ t('dashboard.actions.create') }}
              </a-button>
            </a-tooltip>
            <a-tooltip :title="t('dashboard.tooltips.sync')">
              <a-button block size="large" @click="handleSync">
                <SyncOutlined />
                {{ t('dashboard.actions.sync') }}
              </a-button>
            </a-tooltip>
            <a-tooltip :title="t('dashboard.tooltips.refresh')">
              <a-button block size="large" @click="handleRefresh">
                <ReloadOutlined />
                {{ t('dashboard.actions.refresh') }}
              </a-button>
            </a-tooltip>
          </a-space>
        </a-card>
      </a-col>
      <a-col :span="16">
        <a-card hoverable>
          <a-descriptions bordered :column="2" size="small">
            <a-descriptions-item :label="t('campaignEdit.fields.type')">
              {{ t(`campaigns.types.${dataStore.campaigns[0].type}`) }}
            </a-descriptions-item>
            <a-descriptions-item :label="t('campaignEdit.fields.strategy')">
              {{ dataStore.campaigns[0].strategy }}
            </a-descriptions-item>
            <a-descriptions-item :label="t('campaignEdit.fields.region')">
              {{ dataStore.campaigns[0].region }}
            </a-descriptions-item>
            <a-descriptions-item :label="t('campaignEdit.fields.dates')">
              {{ dataStore.campaigns[0].startDate }} — {{ dataStore.campaigns[0].endDate }}
            </a-descriptions-item>
          </a-descriptions>
        </a-card>
      </a-col>
    </a-row>
  </a-space>
</template>
