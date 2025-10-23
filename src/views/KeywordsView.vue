<script setup lang="ts">
import {
  ArrowUpOutlined,
  PauseOutlined,
  PlayCircleOutlined,
  RestOutlined,
} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { computed, h, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useDataStore } from '@/stores/dataStore';
import type { Keyword } from '@/types/entities';

const { t } = useI18n();
const dataStore = useDataStore();

const filters = reactive({
  status: 'all',
  matchType: 'all',
  negative: false,
});

const percentIncrease = ref(10);

const statusColor = (status: string) => {
  if (status === 'ACTIVE') return 'success';
  if (status === 'PAUSED') return 'warning';
  return 'default';
};

const filteredKeywords = computed(() =>
  dataStore.keywords
    .filter((keyword) => (filters.status === 'all' ? true : keyword.status === filters.status))
    .filter((keyword) =>
      filters.matchType === 'all' ? true : keyword.matchType === filters.matchType,
    )
    .filter((keyword) => (filters.negative ? keyword.negative : true)),
);

const tableData = computed(() =>
  filteredKeywords.value.map((keyword) => ({
    key: keyword.id,
    ...keyword,
  })),
);

const updateBid = (keyword: Keyword, value: number) => {
  dataStore.updateKeywordBid(keyword.id, Number(value));
  message.success(`${t('keywords.columns.bid')} обновлена`);
};

const bulkIncrease = () => {
  dataStore.bulkIncreaseBids(percentIncrease.value, (keyword) =>
    filteredKeywords.value.some((item) => item.id === keyword.id),
  );
  message.success(t('keywords.buttons.increase', { value: percentIncrease.value }));
};

const bulkPause = () => {
  dataStore.bulkChangeKeywordStatus('PAUSED', (keyword) =>
    filteredKeywords.value.some((item) => item.id === keyword.id),
  );
  message.success(t('keywords.buttons.pause'));
};

const bulkResume = () => {
  dataStore.bulkChangeKeywordStatus('ACTIVE', (keyword) =>
    filteredKeywords.value.some((item) => item.id === keyword.id),
  );
  message.success(t('keywords.buttons.resume'));
};

const bulkDelete = () => {
  dataStore.bulkChangeKeywordStatus('ARCHIVED', (keyword) =>
    filteredKeywords.value.some((item) => item.id === keyword.id),
  );
  message.success(t('keywords.buttons.delete'));
};

const columns = computed(() => [
  { title: t('keywords.columns.phrase'), dataIndex: 'phrase', key: 'phrase' },
  {
    title: t('keywords.columns.matchType'),
    dataIndex: 'matchType',
    key: 'matchType',
    customRender: ({ text }: { text: string }) => t(`common.matchTypes.${text}`),
  },
  {
    title: t('keywords.columns.bid'),
    dataIndex: 'bid',
    key: 'bid',
    customRender: ({ record }: { record: Keyword }) =>
      h('a-input-number', {
        value: record.bid,
        min: 0,
        step: 0.1,
        style: 'width:120px',
        'onUpdate:value': (value: number) => updateBid(record, value),
      }),
  },
  {
    title: t('keywords.columns.status'),
    dataIndex: 'status',
    key: 'status',
    customRender: ({ text }: { text: string }) =>
      h('a-tag', { color: statusColor(text) }, () => t(`common.statuses.${text}`)),
  },
  { title: t('keywords.columns.impressions'), dataIndex: 'impressions', key: 'impressions' },
  { title: t('keywords.columns.clicks'), dataIndex: 'clicks', key: 'clicks' },
  { title: t('keywords.columns.ctr'), dataIndex: 'ctr', key: 'ctr' },
]);
</script>

<template>
  <a-card bordered hoverable>
    <template #title>
      <span class="section-title">{{ t('keywords.title') }}</span>
    </template>
    <a-space direction="vertical" size="middle" style="width: 100%">
      <a-space wrap>
        <a-select v-model:value="filters.status" style="width: 200px">
          <a-select-option value="all">{{ t('keywords.filters.status') }}</a-select-option>
          <a-select-option value="ACTIVE">{{ t('common.statuses.ACTIVE') }}</a-select-option>
          <a-select-option value="PAUSED">{{ t('common.statuses.PAUSED') }}</a-select-option>
          <a-select-option value="ARCHIVED">{{ t('common.statuses.ARCHIVED') }}</a-select-option>
        </a-select>
        <a-select v-model:value="filters.matchType" style="width: 220px">
          <a-select-option value="all">{{ t('keywords.filters.matchType') }}</a-select-option>
          <a-select-option value="EXACT">{{ t('common.matchTypes.EXACT') }}</a-select-option>
          <a-select-option value="PHRASE">{{ t('common.matchTypes.PHRASE') }}</a-select-option>
          <a-select-option value="BROAD">{{ t('common.matchTypes.BROAD') }}</a-select-option>
        </a-select>
        <a-checkbox v-model:checked="filters.negative">{{
          t('keywords.filters.negative')
        }}</a-checkbox>
        <a-input-number v-model:value="percentIncrease" :min="1" :max="100" />
        <a-button type="primary" @click="bulkIncrease">
          <ArrowUpOutlined />
          {{ t('keywords.buttons.increase', { value: percentIncrease.value }) }}
        </a-button>
        <a-button @click="bulkPause">
          <PauseOutlined />
          {{ t('keywords.buttons.pause') }}
        </a-button>
        <a-button @click="bulkResume">
          <PlayCircleOutlined />
          {{ t('keywords.buttons.resume') }}
        </a-button>
        <a-button danger @click="bulkDelete">
          <RestOutlined />
          {{ t('keywords.buttons.delete') }}
        </a-button>
      </a-space>
      <a-table
        :columns="columns"
        :data-source="tableData"
        bordered
        :pagination="{ pageSize: 10 }"
      />
    </a-space>
  </a-card>
</template>
