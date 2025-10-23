<script setup lang="ts">
import { message } from 'ant-design-vue';
import dayjs from 'dayjs';
import { computed, h, onBeforeUnmount, onMounted, reactive } from 'vue';
import { useI18n } from 'vue-i18n';

import { useDataStore } from '@/stores/dataStore';

const { t } = useI18n();
const dataStore = useDataStore();

const filters = reactive({
  errorsOnly: false,
  method: 'all',
  search: '',
});

let timer: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  timer = setInterval(() => {
    dataStore.appendLog();
  }, 6000);
});

onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer);
  }
});

const methods = ['all', 'get', 'add', 'update', 'delete', 'suspend', 'resume'];

const filteredLogs = computed(() =>
  dataStore.logs
    .filter((log) => (filters.errorsOnly ? log.status === 'error' : true))
    .filter((log) => (filters.method === 'all' ? true : log.method === filters.method))
    .filter((log) => log.operation.toLowerCase().includes(filters.search.trim().toLowerCase())),
);

const tableData = computed(() =>
  filteredLogs.value.map((log) => ({
    key: log.id,
    ...log,
  })),
);

const columns = computed(() => [
  {
    title: t('logs.columns.time'),
    dataIndex: 'timestamp',
    key: 'timestamp',
    customRender: ({ text }: { text: string }) => dayjs(text).format('DD.MM.YYYY HH:mm'),
  },
  { title: t('logs.columns.method'), dataIndex: 'method', key: 'method' },
  { title: t('logs.columns.operation'), dataIndex: 'operation', key: 'operation' },
  {
    title: t('logs.columns.status'),
    dataIndex: 'status',
    key: 'status',
    customRender: ({ text }: { text: string }) =>
      h('a-tag', { color: text === 'success' ? 'success' : 'error' }, () => text),
  },
  { title: t('logs.columns.code'), dataIndex: 'httpCode', key: 'httpCode' },
  { title: t('logs.columns.duration'), dataIndex: 'duration', key: 'duration' },
  { title: t('logs.columns.message'), dataIndex: 'message', key: 'message' },
]);

const clearLogs = () => {
  dataStore.clearLogs();
  message.success(t('logs.buttons.clear'));
};

const downloadLogs = () => {
  const headers = columns.value.map((column) => column.title).join(';');
  const rows = tableData.value
    .map((row) =>
      [
        row.timestamp,
        row.method,
        row.operation,
        row.status,
        row.httpCode,
        row.duration,
        row.message,
      ].join(';'),
    )
    .join('\n');
  const csvContent = `${headers}\n${rows}`;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'logs.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
  message.success(t('logs.buttons.download'));
};
</script>

<template>
  <a-card bordered hoverable>
    <template #title>
      <div class="card-header">
        <span class="section-title">{{ t('logs.title') }}</span>
        <a-space>
          <a-button @click="clearLogs">{{ t('logs.buttons.clear') }}</a-button>
          <a-button type="primary" @click="downloadLogs">{{ t('logs.buttons.download') }}</a-button>
        </a-space>
      </div>
    </template>
    <a-space style="margin-bottom: 16px" size="middle">
      <a-checkbox v-model:checked="filters.errorsOnly">{{
        t('logs.filters.errorsOnly')
      }}</a-checkbox>
      <a-select v-model:value="filters.method" style="width: 160px">
        <a-select-option v-for="method in methods" :key="method" :value="method">
          {{ method }}
        </a-select-option>
      </a-select>
      <a-input-search
        v-model:value="filters.search"
        :placeholder="t('logs.filters.search')"
        style="width: 220px"
      />
    </a-space>
    <a-table
      :columns="columns"
      :data-source="tableData"
      bordered
      :pagination="{ pageSize: 12 }"
      :locale="{ emptyText: t('logs.empty') }"
    />
  </a-card>
</template>
