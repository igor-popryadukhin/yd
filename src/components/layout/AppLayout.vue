<script setup lang="ts">
import {
  ApiOutlined,
  AppstoreOutlined,
  AreaChartOutlined,
  DashboardOutlined,
  DeploymentUnitOutlined,
  FileSearchOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  NumberOutlined,
  SyncOutlined,
  UserOutlined,
} from '@ant-design/icons-vue';
import dayjs from 'dayjs';
import { computed, h } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import { useDataStore } from '@/stores/dataStore';
import { useUiStore } from '@/stores/uiStore';

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const uiStore = useUiStore();
const dataStore = useDataStore();

const iconRegistry: Record<string, any> = {
  DashboardOutlined,
  DeploymentUnitOutlined,
  AppstoreOutlined,
  NumberOutlined,
  AreaChartOutlined,
  ApiOutlined,
  FileSearchOutlined,
  UserOutlined,
};

const menuItems = computed(() =>
  router
    .getRoutes()
    .filter((item) => item.meta?.title && !item.meta.hideInMenu)
    .map((item) => ({
      key: item.path,
      icon: () =>
        h(iconRegistry[item.meta?.icon as string] ?? DashboardOutlined, {
          style: 'font-size:18px',
        }),
      label: t(item.meta?.title as string),
    })),
);

const selectedKeys = computed(() => {
  const active = menuItems.value.find((item) => route.path.startsWith(item.key));
  return active ? [active.key] : [route.path];
});

const currentTitle = computed(() => {
  const metaTitle = route.meta?.title as string | undefined;
  return metaTitle ? t(metaTitle) : '';
});

const formattedSyncDate = computed(() => dayjs(dataStore.lastSyncAt).format('DD MMM YYYY, HH:mm'));

const handleMenuSelect = ({ key }: { key: string }) => {
  if (key !== route.path) {
    router.push(key);
  }
};

const toggleSidebar = () => uiStore.toggleCollapsed();
</script>

<template>
  <a-layout class="app-shell">
    <a-layout-sider
      :collapsed="uiStore.collapsed"
      collapsible
      :trigger="null"
      theme="light"
      width="230"
      class="app-sider"
    >
      <div class="logo" :class="{ collapsed: uiStore.collapsed }">
        <span>S360</span>
      </div>
      <a-menu
        mode="inline"
        :selected-keys="selectedKeys"
        @select="handleMenuSelect"
        :items="menuItems"
      />
    </a-layout-sider>
    <a-layout>
      <a-layout-header class="app-header">
        <div class="header-left">
          <a-button type="text" @click="toggleSidebar">
            <component :is="uiStore.collapsed ? MenuUnfoldOutlined : MenuFoldOutlined" />
          </a-button>
          <div class="header-title">{{ currentTitle }}</div>
        </div>
        <div class="header-right">
          <a-tag color="processing">
            <SyncOutlined />
            <span class="ml-8">{{ t('dashboard.updated') }}: {{ formattedSyncDate }}</span>
          </a-tag>
          <a-avatar size="large" style="background-color: var(--accent-color)">
            {{ uiStore.profile.name.slice(0, 1) }}
          </a-avatar>
        </div>
      </a-layout-header>
      <a-layout-content class="app-content">
        <slot />
      </a-layout-content>
      <a-layout-footer class="app-footer">
        © {{ new Date().getFullYear() }} S360 Demo. {{ t('apiSettings.limit.description') }}
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>

<style scoped>
.app-sider {
  background: linear-gradient(180deg, #ffffff 0%, #f6f8fc 100%);
  border-right: 1px solid rgba(15, 23, 42, 0.06);
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 64px;
  font-weight: 700;
  font-size: 18px;
  letter-spacing: 0.12em;
  color: #0f172a;
}

.logo.collapsed span {
  font-size: 16px;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.app-footer {
  text-align: center;
  background: transparent;
  color: rgba(15, 23, 42, 0.65);
}

.ml-8 {
  margin-left: 8px;
}
</style>
