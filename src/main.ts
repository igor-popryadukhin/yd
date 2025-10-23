import Antd from 'ant-design-vue';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import {
  DatasetComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
} from 'echarts/components';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import VueECharts from 'vue-echarts';

import App from './App.vue';
import { i18n } from './i18n';
import router from './router';

import 'ant-design-vue/dist/reset.css';
import './style.css';

use([
  CanvasRenderer,
  LineChart,
  BarChart,
  PieChart,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  DatasetComponent,
  TitleComponent,
  ToolboxComponent,
]);

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(i18n);
app.use(Antd);
app.component('VChart', VueECharts);

app.mount('#app');
