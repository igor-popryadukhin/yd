<script setup lang="ts">
import { message } from 'ant-design-vue';
import { computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';

import { useUiStore } from '@/stores/uiStore';

const { t } = useI18n();
const uiStore = useUiStore();

const profile = reactive({ ...uiStore.profile });
const themeMode = computed({
  get: () => uiStore.theme,
  set: (value: 'light' | 'dark') => uiStore.setTheme(value),
});

const accentColors = ['#1677ff', '#10b981', '#8b5cf6', '#f97316', '#ec4899'];

const saveProfile = () => {
  uiStore.updateProfile(profile);
  message.success(t('profile.success'));
};

const selectAccent = (color: string) => {
  uiStore.setAccentColor(color);
};

const logout = () => {
  message.info(t('profile.buttons.logout'));
};
</script>

<template>
  <a-card bordered hoverable>
    <template #title>
      <span class="section-title">{{ t('profile.title') }}</span>
    </template>
    <a-row :gutter="24">
      <a-col :span="12">
        <a-form layout="vertical">
          <a-form-item :label="t('profile.fields.name')">
            <a-input v-model:value="profile.name" />
          </a-form-item>
          <a-form-item :label="t('profile.fields.email')">
            <a-input v-model:value="profile.email" />
          </a-form-item>
          <a-form-item :label="t('profile.fields.company')">
            <a-input v-model:value="profile.company" />
          </a-form-item>
          <a-space>
            <a-button type="primary" @click="saveProfile">{{ t('profile.buttons.save') }}</a-button>
            <a-button danger @click="logout">{{ t('profile.buttons.logout') }}</a-button>
          </a-space>
        </a-form>
      </a-col>
      <a-col :span="12">
        <a-card type="inner" :title="t('profile.theme.title')">
          <a-space direction="vertical" size="middle" style="width: 100%">
            <div>
              <span>{{ t('profile.theme.light') }}</span>
              <a-switch
                checked-children="🌞"
                un-checked-children="🌙"
                :checked="themeMode === 'light'"
                @change="(value: boolean) => (themeMode.value = value ? 'light' : 'dark')"
              />
              <span style="margin-left: 12px">{{
                themeMode === 'light' ? t('profile.theme.light') : t('profile.theme.dark')
              }}</span>
            </div>
            <div>
              <div>{{ t('profile.theme.accent') }}</div>
              <a-space>
                <a-tag
                  v-for="color in accentColors"
                  :key="color"
                  :color="color"
                  :class="{ active: uiStore.accentColor === color }"
                  @click="selectAccent(color)"
                >
                  {{ color }}
                </a-tag>
              </a-space>
            </div>
          </a-space>
        </a-card>
      </a-col>
    </a-row>
  </a-card>
</template>

<style scoped>
.active {
  border: 2px solid #0f172a;
  cursor: pointer;
}
</style>
