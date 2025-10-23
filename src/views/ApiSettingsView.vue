<script setup lang="ts">
import { message } from 'ant-design-vue';
import { computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';

import { useDataStore } from '@/stores/dataStore';

const { t } = useI18n();
const dataStore = useDataStore();

const settings = reactive({ ...dataStore.apiSettings });

const apiUsagePercent = computed(() => Math.round((settings.apiUsage / settings.apiLimit) * 100));

const saveSettings = () => {
  dataStore.updateApiSettings({ ...settings });
  message.success(t('campaignEdit.buttons.save'));
};

const resetUsage = () => {
  dataStore.resetApiUsage();
  settings.apiUsage = dataStore.apiSettings.apiUsage;
  message.success(t('dashboard.queue.active'));
};

const queue = computed(() => dataStore.queue);
</script>

<template>
  <a-card bordered hoverable>
    <template #title>
      <span class="section-title">{{ t('apiSettings.title') }}</span>
    </template>
    <a-row :gutter="16">
      <a-col :span="12">
        <a-form layout="vertical">
          <a-form-item :label="t('apiSettings.fields.token')">
            <a-input
              v-model:value="settings.token"
              :placeholder="t('campaignEdit.placeholders.token')"
            />
          </a-form-item>
          <a-form-item :label="t('apiSettings.fields.clientId')">
            <a-input
              v-model:value="settings.clientId"
              :placeholder="t('campaignEdit.placeholders.client')"
            />
          </a-form-item>
          <a-form-item :label="t('apiSettings.fields.parallel')">
            <a-slider v-model:value="settings.parallelStreams" :min="1" :max="10" />
          </a-form-item>
          <a-form-item :label="t('apiSettings.fields.delay')">
            <a-input-number
              v-model:value="settings.delayMs"
              :min="0"
              addon-after="мс"
              style="width: 100%"
            />
          </a-form-item>
          <a-form-item :label="t('apiSettings.fields.autoPause')">
            <a-slider
              v-model:value="settings.autoPauseThreshold"
              :min="0.5"
              :max="1"
              :step="0.05"
            />
          </a-form-item>
          <a-form-item>
            <a-switch v-model:checked="settings.notifications.limit" />
            <span style="margin-left: 8px">{{ t('apiSettings.notifications.limit') }}</span>
          </a-form-item>
          <a-form-item>
            <a-switch v-model:checked="settings.notifications.errors" />
            <span style="margin-left: 8px">{{ t('apiSettings.notifications.errors') }}</span>
          </a-form-item>
          <a-button type="primary" @click="saveSettings">{{
            t('campaignEdit.buttons.save')
          }}</a-button>
        </a-form>
      </a-col>
      <a-col :span="12">
        <a-card type="inner" :title="t('apiSettings.limit.title')" style="margin-bottom: 16px">
          <p>{{ t('apiSettings.limit.description') }}</p>
          <a-progress
            :percent="apiUsagePercent"
            :status="apiUsagePercent >= 80 ? 'exception' : 'active'"
          />
          <a-space>
            <a-tag color="processing">{{ settings.apiUsage }} / {{ settings.apiLimit }}</a-tag>
            <a-button size="small" @click="resetUsage">{{
              t('apiSettings.queue.resume')
            }}</a-button>
          </a-space>
        </a-card>
        <a-card type="inner" :title="t('apiSettings.queue.title')">
          <p>
            {{ t('apiSettings.queue.pending') }}: <strong>{{ queue.pending }}</strong>
          </p>
          <a-alert
            v-if="queue.paused"
            type="warning"
            :message="t('apiSettings.queue.paused')"
            show-icon
          />
          <a-alert v-else type="success" :message="t('dashboard.queue.active')" show-icon />
        </a-card>
      </a-col>
    </a-row>
  </a-card>
</template>
