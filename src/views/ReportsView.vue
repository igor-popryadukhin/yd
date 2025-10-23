<script setup lang="ts">
import { message } from 'ant-design-vue';
import dayjs from 'dayjs';
import { computed, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useDataStore } from '@/stores/dataStore';

const { t } = useI18n();
const dataStore = useDataStore();

const dateRange = ref<[dayjs.Dayjs, dayjs.Dayjs]>([dayjs().subtract(6, 'day'), dayjs()]);

const presets = [
  { label: t('reports.presets.today'), value: [dayjs(), dayjs()] as [dayjs.Dayjs, dayjs.Dayjs] },
  { label: t('reports.presets.seven'), value: [dayjs().subtract(6, 'day'), dayjs()] },
  { label: t('reports.presets.thirty'), value: [dayjs().subtract(29, 'day'), dayjs()] },
];

const spendOptions = computed(() => ({
  tooltip: { trigger: 'axis' },
  xAxis: {
    type: 'category',
    data: dataStore.spendByCampaign.map((item) => item.name),
    axisLabel: { interval: 0, rotate: 30 },
  },
  yAxis: { type: 'value' },
  series: [
    {
      name: t('reports.charts.spend'),
      type: 'bar',
      data: dataStore.spendByCampaign.map((item) => item.value),
      itemStyle: { borderRadius: [6, 6, 0, 0] },
    },
  ],
}));

const conversionsOptions = computed(() => ({
  tooltip: { trigger: 'axis' },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: dataStore.conversionTrend.map((item) => item.date),
  },
  yAxis: { type: 'value' },
  series: [
    {
      name: t('reports.charts.conversions'),
      type: 'line',
      smooth: true,
      areaStyle: {},
      data: dataStore.conversionTrend.map((item) => item.conversions),
    },
  ],
}));

const devicesOptions = computed(() => ({
  tooltip: { trigger: 'item' },
  legend: { bottom: 0 },
  series: [
    {
      type: 'pie',
      radius: ['40%', '70%'],
      data: dataStore.deviceSplit.map((item) => ({
        name: item.device,
        value: item.value,
      })),
    },
  ],
}));

const tableData = computed(() =>
  dataStore.reportRows.map((row) => ({ key: row.campaignId, ...row })),
);

const columns = computed(() => [
  { title: t('reports.table.campaign'), dataIndex: 'campaign', key: 'campaign' },
  { title: t('reports.table.impressions'), dataIndex: 'impressions', key: 'impressions' },
  { title: t('reports.table.clicks'), dataIndex: 'clicks', key: 'clicks' },
  { title: t('reports.table.spend'), dataIndex: 'spend', key: 'spend' },
  { title: t('reports.table.cpc'), dataIndex: 'cpc', key: 'cpc' },
  { title: t('reports.table.conversions'), dataIndex: 'conversions', key: 'conversions' },
  { title: t('reports.table.roi'), dataIndex: 'roi', key: 'roi' },
]);

const scheduler = reactive({
  email: dataStore.scheduler.email,
  frequency: dataStore.scheduler.frequency,
  time: dayjs(dataStore.scheduler.time, 'HH:mm'),
});

const exportCsv = () => {
  const headers = columns.value.map((column) => column.title).join(';');
  const rows = tableData.value
    .map((row) =>
      [
        row.campaign,
        row.impressions,
        row.clicks,
        row.spend,
        row.cpc,
        row.conversions,
        row.roi,
      ].join(';'),
    )
    .join('\n');
  const csvContent = `${headers}\n${rows}`;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'report.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
  message.success(t('reports.exportSuccess'));
};

const saveScheduler = () => {
  dataStore.updateScheduler({
    email: scheduler.email,
    frequency: scheduler.frequency,
    time: scheduler.time ? dayjs(scheduler.time).format('HH:mm') : dataStore.scheduler.time,
  });
  message.success(t('reports.scheduler.success'));
};
</script>

<template>
  <a-space direction="vertical" size="large" style="width: 100%">
    <a-card hoverable>
      <template #title>
        <div class="card-header">
          <span class="section-title">{{ t('reports.title') }}</span>
          <a-space>
            <a-button
              v-for="preset in presets"
              :key="preset.label"
              @click="dateRange = preset.value"
            >
              {{ preset.label }}
            </a-button>
          </a-space>
        </div>
      </template>
      <a-space align="center" size="middle">
        <span>{{ t('reports.period') }}:</span>
        <a-range-picker v-model:value="dateRange" format="YYYY-MM-DD" />
        <a-button type="primary" @click="exportCsv">{{ t('common.downloadCsv') }}</a-button>
      </a-space>
    </a-card>

    <a-row :gutter="16">
      <a-col :span="12">
        <a-card hoverable>
          <template #title>
            <span>{{ t('reports.charts.spend') }}</span>
          </template>
          <div class="chart-card">
            <VChart :option="spendOptions" autoresize />
          </div>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card hoverable>
          <template #title>
            <span>{{ t('reports.charts.conversions') }}</span>
          </template>
          <div class="chart-card">
            <VChart :option="conversionsOptions" autoresize />
          </div>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16">
      <a-col :span="8">
        <a-card hoverable>
          <template #title>
            <span>{{ t('reports.charts.devices') }}</span>
          </template>
          <div class="chart-card">
            <VChart :option="devicesOptions" autoresize />
          </div>
        </a-card>
      </a-col>
      <a-col :span="16">
        <a-card hoverable>
          <a-table
            :columns="columns"
            :data-source="tableData"
            :pagination="{ pageSize: 6 }"
            bordered
          />
        </a-card>
      </a-col>
    </a-row>

    <a-card hoverable>
      <template #title>
        <span>{{ t('reports.scheduler.title') }}</span>
      </template>
      <p>{{ t('reports.scheduler.description') }}</p>
      <a-row :gutter="16">
        <a-col :span="8">
          <a-form-item :label="t('common.email')">
            <a-input v-model:value="scheduler.email" placeholder="reports@example.com" />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item :label="t('common.frequency')">
            <a-select v-model:value="scheduler.frequency">
              <a-select-option value="daily">{{
                t('reports.scheduler.frequency.daily')
              }}</a-select-option>
              <a-select-option value="weekly">{{
                t('reports.scheduler.frequency.weekly')
              }}</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item :label="t('common.time')">
            <a-time-picker v-model:value="scheduler.time" format="HH:mm" />
          </a-form-item>
        </a-col>
      </a-row>
      <a-button type="primary" @click="saveScheduler">{{ t('reports.scheduler.save') }}</a-button>
    </a-card>
  </a-space>
</template>
