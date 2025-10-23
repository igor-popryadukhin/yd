<script setup lang="ts">
import { ConfigProvider, theme } from 'ant-design-vue';
import { computed, watchEffect } from 'vue';
import { RouterView } from 'vue-router';

import AppLayout from '@/components/layout/AppLayout.vue';
import { useUiStore } from '@/stores/uiStore';

const uiStore = useUiStore();

const themeConfig = computed(() => ({
  algorithm: uiStore.theme === 'dark' ? [theme.darkAlgorithm] : [theme.defaultAlgorithm],
  token: {
    colorPrimary: uiStore.accentColor,
    borderRadius: 12,
  },
}));

watchEffect(() => {
  document.documentElement.setAttribute('data-theme', uiStore.theme);
  document.documentElement.style.setProperty('--accent-color', uiStore.accentColor);
});
</script>

<template>
  <ConfigProvider :theme="themeConfig">
    <AppLayout>
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </AppLayout>
  </ConfigProvider>
</template>
