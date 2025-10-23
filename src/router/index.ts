import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { title: 'menu.dashboard', icon: 'DashboardOutlined' },
  },
  {
    path: '/campaigns',
    name: 'campaigns',
    component: () => import('@/views/CampaignsView.vue'),
    meta: { title: 'menu.campaigns', icon: 'DeploymentUnitOutlined' },
  },
  {
    path: '/campaigns/:id',
    name: 'campaign-edit',
    component: () => import('@/views/CampaignEditView.vue'),
    meta: { title: 'menu.campaignEdit', hideInMenu: true },
  },
  {
    path: '/groups',
    name: 'groups',
    component: () => import('@/views/GroupsView.vue'),
    meta: { title: 'menu.groups', icon: 'AppstoreOutlined' },
  },
  {
    path: '/keywords',
    name: 'keywords',
    component: () => import('@/views/KeywordsView.vue'),
    meta: { title: 'menu.keywords', icon: 'NumberOutlined' },
  },
  {
    path: '/reports',
    name: 'reports',
    component: () => import('@/views/ReportsView.vue'),
    meta: { title: 'menu.reports', icon: 'AreaChartOutlined' },
  },
  {
    path: '/api-settings',
    name: 'api-settings',
    component: () => import('@/views/ApiSettingsView.vue'),
    meta: { title: 'menu.apiSettings', icon: 'ApiOutlined' },
  },
  {
    path: '/logs',
    name: 'logs',
    component: () => import('@/views/LogsView.vue'),
    meta: { title: 'menu.logs', icon: 'FileSearchOutlined' },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { title: 'menu.profile', icon: 'UserOutlined' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

export default router;
