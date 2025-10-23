<script setup lang="ts">
import {
  DeleteOutlined,
  EditOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { computed, h, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { useDataStore } from '@/stores/dataStore';

const router = useRouter();
const { t } = useI18n();
const dataStore = useDataStore();

const filters = reactive({
  search: '',
  status: 'all',
  type: 'all',
});

const pagination = reactive({
  current: 1,
  pageSize: 8,
});

const typeOptions = computed(() =>
  [
    'TEXT_CAMPAIGN',
    'UNIFIED_CAMPAIGN',
    'SMART_CAMPAIGN',
    'DYNAMIC_CAMPAIGN',
    'MOBILE_APP_CAMPAIGN',
  ].map((value) => ({ value, label: t(`campaigns.types.${value}`) })),
);

const numberFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

const filteredCampaigns = computed(() => {
  return dataStore.campaigns
    .filter((campaign) => campaign.name.toLowerCase().includes(filters.search.trim().toLowerCase()))
    .filter((campaign) => (filters.status === 'all' ? true : campaign.status === filters.status))
    .filter((campaign) => (filters.type === 'all' ? true : campaign.type === filters.type));
});

const tableData = computed(() =>
  filteredCampaigns.value.map((campaign) => ({
    key: campaign.id,
    ...campaign,
  })),
);

const handleEdit = (id: number) => router.push({ path: `/campaigns/${id}` });

const handlePause = (id: number) => {
  dataStore.toggleCampaignStatus(id, 'PAUSED');
  message.success(t('campaigns.actions.pause'));
};

const handleResume = (id: number) => {
  dataStore.toggleCampaignStatus(id, 'ACTIVE');
  message.success(t('campaigns.actions.resume'));
};

const handleDelete = (id: number) => {
  dataStore.removeCampaign(id);
  message.warning(t('campaigns.actions.delete'));
};

const statusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'PAUSED':
      return 'warning';
    default:
      return 'default';
  }
};

const columns = computed(() => [
  {
    title: t('campaigns.columns.id'),
    dataIndex: 'id',
    key: 'id',
    sorter: (a: any, b: any) => a.id - b.id,
  },
  {
    title: t('campaigns.columns.name'),
    dataIndex: 'name',
    key: 'name',
    sorter: (a: any, b: any) => a.name.localeCompare(b.name),
  },
  {
    title: t('campaigns.columns.type'),
    dataIndex: 'type',
    key: 'type',
    customRender: ({ text }: { text: string }) => t(`campaigns.types.${text}`),
    sorter: (a: any, b: any) => a.type.localeCompare(b.type),
  },
  {
    title: t('campaigns.columns.status'),
    dataIndex: 'status',
    key: 'status',
    customRender: ({ text }: { text: string }) =>
      h(
        'a-tag',
        {
          color: statusColor(text),
        },
        () => t(`common.statuses.${text}`),
      ),
  },
  {
    title: t('campaigns.columns.strategy'),
    dataIndex: 'strategy',
    key: 'strategy',
  },
  {
    title: t('campaigns.columns.budget'),
    dataIndex: 'budget',
    key: 'budget',
    customRender: ({ text }: { text: number }) => numberFormatter.format(text),
    sorter: (a: any, b: any) => a.budget - b.budget,
  },
  {
    title: t('campaigns.columns.dates'),
    key: 'dates',
    customRender: ({ record }: { record: any }) => `${record.startDate} — ${record.endDate}`,
  },
  {
    title: t('campaigns.columns.actions'),
    key: 'actions',
    customRender: ({ record }: { record: any }) =>
      h('div', { class: 'actions-cell' }, [
        h(
          'a-tooltip',
          { title: t('campaigns.actions.edit') },
          {
            default: () =>
              h(
                'a-button',
                {
                  type: 'text',
                  onClick: () => handleEdit(record.id),
                },
                { default: () => h(EditOutlined) },
              ),
          },
        ),
        record.status === 'ACTIVE'
          ? h(
              'a-tooltip',
              { title: t('campaigns.actions.pause') },
              {
                default: () =>
                  h(
                    'a-button',
                    {
                      type: 'text',
                      onClick: () => handlePause(record.id),
                    },
                    { default: () => h(PauseCircleOutlined) },
                  ),
              },
            )
          : h(
              'a-tooltip',
              { title: t('campaigns.actions.resume') },
              {
                default: () =>
                  h(
                    'a-button',
                    {
                      type: 'text',
                      onClick: () => handleResume(record.id),
                    },
                    { default: () => h(PlayCircleOutlined) },
                  ),
              },
            ),
        h(
          'a-tooltip',
          { title: t('campaigns.actions.delete') },
          {
            default: () =>
              h(
                'a-button',
                {
                  type: 'text',
                  danger: true,
                  onClick: () => handleDelete(record.id),
                },
                { default: () => h(DeleteOutlined) },
              ),
          },
        ),
      ]),
  },
]);

const goToCreate = () => router.push({ path: '/campaigns/new' });
</script>

<template>
  <a-card bordered hoverable>
    <template #title>
      <div class="card-header">
        <span class="section-title">{{ t('campaigns.title') }}</span>
        <a-button type="primary" @click="goToCreate">
          <PlusOutlined />
          {{ t('dashboard.actions.create') }}
        </a-button>
      </div>
    </template>
    <a-space style="margin-bottom: 16px" size="middle">
      <a-input-search
        v-model:value="filters.search"
        :placeholder="t('campaigns.searchPlaceholder')"
        allow-clear
        style="width: 240px"
      />
      <a-select v-model:value="filters.status" style="width: 180px">
        <a-select-option value="all">{{ t('campaigns.filters.status') }}</a-select-option>
        <a-select-option value="ACTIVE">{{ t('common.statuses.ACTIVE') }}</a-select-option>
        <a-select-option value="PAUSED">{{ t('common.statuses.PAUSED') }}</a-select-option>
        <a-select-option value="ARCHIVED">{{ t('common.statuses.ARCHIVED') }}</a-select-option>
      </a-select>
      <a-select v-model:value="filters.type" style="width: 220px">
        <a-select-option value="all">{{ t('campaigns.filters.type') }}</a-select-option>
        <a-select-option v-for="option in typeOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </a-select-option>
      </a-select>
    </a-space>
    <a-table
      :columns="columns"
      :data-source="tableData"
      :pagination="{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: tableData.length,
        showSizeChanger: false,
      }"
      @change="(paginationInfo) => (pagination.current = paginationInfo.current ?? 1)"
      :locale="{ emptyText: t('campaigns.empty') }"
      bordered
    />
  </a-card>
</template>

<style scoped>
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.actions-cell {
  display: flex;
  gap: 8px;
  align-items: center;
}
</style>
