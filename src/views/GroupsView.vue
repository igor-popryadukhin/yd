<script setup lang="ts">
import {
  CopyOutlined,
  NodeIndexOutlined,
  PlusOutlined,
  ScissorOutlined,
} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { computed, h, reactive } from 'vue';
import { useI18n } from 'vue-i18n';

import { useDataStore } from '@/stores/dataStore';

const { t } = useI18n();
const dataStore = useDataStore();

const filters = reactive({
  statuses: ['ACTIVE', 'PAUSED', 'ARCHIVED'] as string[],
});

const statusColor = (status: string) => {
  if (status === 'ACTIVE') return 'success';
  if (status === 'PAUSED') return 'warning';
  return 'default';
};

const filteredGroups = computed(() =>
  dataStore.adGroups.filter((group) => filters.statuses.includes(group.status)),
);

const treeData = computed(() =>
  filteredGroups.value.map((group) => ({
    key: `group-${group.id}`,
    type: 'group',
    ...group,
    children: group.ads.map((ad) => ({
      key: `ad-${ad.id}`,
      type: 'ad',
      id: ad.id,
      name: ad.name,
      status: ad.status,
      bid: ad.bid,
      ctr: ad.ctr,
      url: ad.url,
    })),
  })),
);

const columns = computed(() => [
  { title: t('groups.columns.id'), dataIndex: 'id', key: 'id', width: 90 },
  { title: t('groups.columns.name'), dataIndex: 'name', key: 'name' },
  {
    title: t('groups.columns.status'),
    dataIndex: 'status',
    key: 'status',
    customRender: ({ text }: { text: string }) =>
      h('a-tag', { color: statusColor(text) }, () => t(`common.statuses.${text}`)),
  },
  { title: t('groups.columns.bid'), dataIndex: 'bid', key: 'bid' },
  { title: t('groups.columns.ctr'), dataIndex: 'ctr', key: 'ctr' },
  { title: t('groups.columns.url'), dataIndex: 'url', key: 'url' },
]);

const performAction = (messageKey: string) => {
  message.success(messageKey);
};
</script>

<template>
  <a-card bordered hoverable>
    <template #title>
      <div class="card-header">
        <span class="section-title">{{ t('groups.title') }}</span>
        <a-space>
          <a-button type="primary" @click="performAction(t('groups.buttons.addGroup'))">
            <PlusOutlined />
            {{ t('groups.buttons.addGroup') }}
          </a-button>
          <a-button @click="performAction(t('groups.buttons.addAd'))">
            <NodeIndexOutlined />
            {{ t('groups.buttons.addAd') }}
          </a-button>
          <a-button @click="performAction(t('groups.buttons.massEdit'))">
            <ScissorOutlined />
            {{ t('groups.buttons.massEdit') }}
          </a-button>
          <a-button @click="performAction(t('groups.buttons.duplicate'))">
            <CopyOutlined />
            {{ t('groups.buttons.duplicate') }}
          </a-button>
        </a-space>
      </div>
    </template>
    <a-space style="margin-bottom: 16px" size="middle">
      <a-checkbox-group v-model:value="filters.statuses">
        <a-checkbox value="ACTIVE">{{ t('groups.filters.active') }}</a-checkbox>
        <a-checkbox value="PAUSED">{{ t('groups.filters.paused') }}</a-checkbox>
        <a-checkbox value="ARCHIVED">{{ t('groups.filters.archived') }}</a-checkbox>
      </a-checkbox-group>
    </a-space>
    <a-table
      :columns="columns"
      :data-source="treeData"
      :pagination="false"
      :children-column-name="'children'"
      bordered
      default-expand-all-rows
    />
  </a-card>
</template>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
