<script setup lang="ts">
import { message } from 'ant-design-vue';
import dayjs from 'dayjs';
import { Form, Field } from 'vee-validate';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { array, mixed, number, object, string } from 'yup';

import { useDataStore } from '@/stores/dataStore';
import type { Campaign } from '@/types/entities';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const dataStore = useDataStore();

const isNew = computed(() => route.params.id === 'new');
const campaignId = computed(() => (isNew.value ? null : Number(route.params.id)));

const currentCampaign = computed(() =>
  campaignId.value ? (dataStore.campaignById(campaignId.value) ?? null) : null,
);

const defaultStart = dayjs().format('YYYY-MM-DD');
const defaultEnd = dayjs().add(30, 'day').format('YYYY-MM-DD');

const initialValues = computed(() => ({
  name: currentCampaign.value?.name ?? '',
  type: currentCampaign.value?.type ?? 'TEXT_CAMPAIGN',
  strategy: currentCampaign.value?.strategy ?? 'MAXIMUM_CLICKS',
  budget: currentCampaign.value?.budget ?? 50000,
  dailyBudget: currentCampaign.value?.dailyBudget ?? 2500,
  dates: [
    dayjs(currentCampaign.value?.startDate ?? defaultStart),
    dayjs(currentCampaign.value?.endDate ?? defaultEnd),
  ],
  region: currentCampaign.value?.region ?? 'Россия (все регионы)',
  adjustments: currentCampaign.value?.adjustments ?? [],
}));

const validationSchema = object({
  name: string().required(t('campaignEdit.validation.name')),
  type: string().required(),
  strategy: string().required(),
  budget: number().required().min(1, t('campaignEdit.validation.budget')),
  dailyBudget: number().required().min(1, t('campaignEdit.validation.dailyBudget')),
  dates: array()
    .of(mixed())
    .test(
      'range',
      t('campaignEdit.validation.dates'),
      (value) => Array.isArray(value) && value.length === 2,
    ),
  region: string().required(),
  adjustments: array().of(string()),
});

const strategies = [
  'MAXIMUM_CLICKS',
  'AVERAGE_CPC',
  'HIGHEST_POSITION',
  'MANUAL_BIDS',
  'SERVING_OFF',
];

const handleSubmit = async (values: any) => {
  const payload: Omit<Campaign, 'id'> = {
    name: values.name,
    type: values.type,
    strategy: values.strategy,
    budget: Number(values.budget),
    dailyBudget: Number(values.dailyBudget),
    startDate: values.dates[0].format('YYYY-MM-DD'),
    endDate: values.dates[1].format('YYYY-MM-DD'),
    region: values.region,
    adjustments: values.adjustments,
    spend: currentCampaign.value?.spend ?? Math.round(Number(values.budget) * 0.55),
    clicks: currentCampaign.value?.clicks ?? 0,
    impressions: currentCampaign.value?.impressions ?? 0,
    conversions: currentCampaign.value?.conversions ?? 0,
  };

  if (campaignId.value) {
    dataStore.updateCampaign(campaignId.value, payload);
    message.success(t('campaignEdit.buttons.save'));
    router.push('/campaigns');
    return;
  }

  const newId = dataStore.addCampaign(payload);
  message.success(t('campaignEdit.buttons.save'));
  router.push(`/campaigns/${newId}`);
};

const handleDuplicate = () => {
  if (!campaignId.value) {
    return;
  }
  dataStore.duplicateCampaign(campaignId.value);
  message.success(t('campaignEdit.buttons.duplicate'));
};

const handleArchive = () => {
  if (!campaignId.value) {
    return;
  }
  dataStore.archiveCampaign(campaignId.value);
  message.warning(t('campaignEdit.buttons.archive'));
  router.push('/campaigns');
};

const handleCancel = () => {
  router.back();
};

const groups = computed(() => {
  const baseId = campaignId.value ?? dataStore.campaigns[0]?.id ?? 0;
  return dataStore.adGroupsByCampaign(baseId);
});

const budgetChart = computed(() => ({
  tooltip: { trigger: 'item' },
  legend: { orient: 'horizontal', bottom: 0 },
  series: [
    {
      type: 'pie',
      radius: ['45%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      data: groups.value.map((group) => ({
        name: group.name,
        value: Number((group.bid * group.ads.length).toFixed(2)),
      })),
    },
  ],
}));

const placements = computed(() => dataStore.placements);
const extensions = computed(() => dataStore.extensions);
</script>

<template>
  <a-card bordered hoverable>
    <template #title>
      <span class="section-title">{{ t('campaignEdit.title') }}</span>
    </template>
    <Form
      :initial-values="initialValues"
      :validation-schema="validationSchema"
      @submit="handleSubmit"
    >
      <template #default="{ errors, setFieldValue, submitForm }">
        <a-row :gutter="16">
          <a-col :span="16">
            <a-tabs default-active-key="basic">
              <a-tab-pane key="basic" :tab="t('campaignEdit.tabs.basic')">
                <a-form layout="vertical">
                  <a-form-item
                    :label="t('campaignEdit.fields.name')"
                    :validate-status="errors.name ? 'error' : ''"
                    :help="errors.name"
                  >
                    <Field name="name" v-slot="{ field }">
                      <a-input
                        v-bind="field"
                        :placeholder="t('campaignEdit.placeholders.name')"
                        allow-clear
                      />
                    </Field>
                  </a-form-item>
                  <a-row :gutter="16">
                    <a-col :span="12">
                      <a-form-item :label="t('campaignEdit.fields.type')">
                        <Field name="type" v-slot="{ field }">
                          <a-select
                            v-bind="field"
                            @change="(value) => setFieldValue('type', value)"
                          >
                            <a-select-option value="TEXT_CAMPAIGN">{{
                              t('campaigns.types.TEXT_CAMPAIGN')
                            }}</a-select-option>
                            <a-select-option value="UNIFIED_CAMPAIGN">{{
                              t('campaigns.types.UNIFIED_CAMPAIGN')
                            }}</a-select-option>
                            <a-select-option value="SMART_CAMPAIGN">{{
                              t('campaigns.types.SMART_CAMPAIGN')
                            }}</a-select-option>
                            <a-select-option value="DYNAMIC_CAMPAIGN">{{
                              t('campaigns.types.DYNAMIC_CAMPAIGN')
                            }}</a-select-option>
                            <a-select-option value="MOBILE_APP_CAMPAIGN">{{
                              t('campaigns.types.MOBILE_APP_CAMPAIGN')
                            }}</a-select-option>
                          </a-select>
                        </Field>
                      </a-form-item>
                    </a-col>
                    <a-col :span="12">
                      <a-form-item :label="t('campaignEdit.fields.strategy')">
                        <Field name="strategy" v-slot="{ field }">
                          <a-radio-group
                            v-bind="field"
                            :options="strategies.map((value) => ({ value, label: value }))"
                            @change="(event) => setFieldValue('strategy', event.target.value)"
                          />
                        </Field>
                      </a-form-item>
                    </a-col>
                  </a-row>
                  <a-row :gutter="16">
                    <a-col :span="12">
                      <a-form-item
                        :label="t('campaignEdit.fields.budget')"
                        :validate-status="errors.budget ? 'error' : ''"
                        :help="errors.budget"
                      >
                        <Field name="budget" v-slot="{ field }">
                          <a-input-number
                            v-bind="field"
                            style="width: 100%"
                            :min="0"
                            :formatter="(value) => `${value} ₽`"
                            :parser="(value) => value?.replace(' ₽', '') ?? ''"
                          />
                        </Field>
                      </a-form-item>
                    </a-col>
                    <a-col :span="12">
                      <a-form-item
                        :label="t('campaignEdit.fields.dailyBudget')"
                        :validate-status="errors.dailyBudget ? 'error' : ''"
                        :help="errors.dailyBudget"
                      >
                        <Field name="dailyBudget" v-slot="{ field }">
                          <a-input-number
                            v-bind="field"
                            style="width: 100%"
                            :min="0"
                            :formatter="(value) => `${value} ₽`"
                            :parser="(value) => value?.replace(' ₽', '') ?? ''"
                          />
                        </Field>
                      </a-form-item>
                    </a-col>
                  </a-row>
                  <a-row :gutter="16">
                    <a-col :span="12">
                      <a-form-item
                        :label="t('campaignEdit.fields.dates')"
                        :validate-status="errors.dates ? 'error' : ''"
                        :help="errors.dates"
                      >
                        <Field name="dates" v-slot="{ field }">
                          <a-range-picker
                            v-bind="field"
                            style="width: 100%"
                            format="YYYY-MM-DD"
                            @change="(values) => setFieldValue('dates', values ?? [])"
                          />
                        </Field>
                      </a-form-item>
                    </a-col>
                    <a-col :span="12">
                      <a-form-item :label="t('campaignEdit.fields.region')">
                        <Field name="region" v-slot="{ field }">
                          <a-input v-bind="field" allow-clear />
                        </Field>
                      </a-form-item>
                    </a-col>
                  </a-row>
                  <a-form-item :label="t('campaignEdit.fields.adjustments')">
                    <Field name="adjustments" v-slot="{ field }">
                      <a-select
                        v-bind="field"
                        mode="tags"
                        style="width: 100%"
                        :token-separators="[',']"
                        @change="(value) => setFieldValue('adjustments', value)"
                      />
                    </Field>
                  </a-form-item>
                  <a-alert type="info" :message="t('campaignEdit.info.limits')" show-icon />
                </a-form>
              </a-tab-pane>
              <a-tab-pane key="placements" :tab="t('campaignEdit.tabs.placements')">
                <a-list :data-source="placements">
                  <template #renderItem="{ item }">
                    <a-list-item>
                      <a-switch
                        :checked="item.enabled"
                        @change="(value: boolean) => dataStore.togglePlacement(item.id, value)"
                      />
                      <span style="margin-left: 12px">{{ item.name }}</span>
                    </a-list-item>
                  </template>
                </a-list>
              </a-tab-pane>
              <a-tab-pane key="extensions" :tab="t('campaignEdit.tabs.extensions')">
                <a-list :data-source="extensions">
                  <template #renderItem="{ item }">
                    <a-list-item>
                      <a-list-item-meta :title="item.label" :description="item.value" />
                    </a-list-item>
                  </template>
                </a-list>
              </a-tab-pane>
            </a-tabs>
            <a-space style="margin-top: 24px" size="middle">
              <a-button type="primary" @click="submitForm">{{
                t('campaignEdit.buttons.save')
              }}</a-button>
              <a-button @click="handleCancel">{{ t('campaignEdit.buttons.cancel') }}</a-button>
              <a-button type="dashed" @click="handleDuplicate" :disabled="!campaignId">
                {{ t('campaignEdit.buttons.duplicate') }}
              </a-button>
              <a-button danger @click="handleArchive" :disabled="!campaignId">
                {{ t('campaignEdit.buttons.archive') }}
              </a-button>
            </a-space>
          </a-col>
          <a-col :span="8">
            <a-card :title="t('campaignEdit.budgetDistribution')" hoverable>
              <div class="chart-card">
                <VChart :option="budgetChart" autoresize />
              </div>
            </a-card>
          </a-col>
        </a-row>
      </template>
    </Form>
  </a-card>
</template>
