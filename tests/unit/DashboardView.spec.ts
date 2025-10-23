import { render, screen } from '@testing-library/vue';
import { createPinia } from 'pinia';

import DashboardView from '@/views/DashboardView.vue';
import { i18n } from '@/i18n';

const stubs = {
  'a-card': { template: '<div><slot name="title"></slot><slot></slot></div>' },
  'a-space': { template: '<div><slot></slot></div>' },
  'a-row': { template: '<div><slot></slot></div>' },
  'a-col': { template: '<div><slot></slot></div>' },
  'a-statistic': {
    props: ['title', 'value'],
    template: '<div><span>{{ title }}</span><span>{{ value }}</span><slot></slot></div>',
  },
  'a-tooltip': { template: '<div><slot></slot></div>' },
  'a-button': { template: '<button><slot></slot></button>' },
  'a-tag': { template: '<div><slot></slot></div>' },
  'a-alert': { template: '<div><slot></slot></div>' },
  'a-descriptions': { template: '<div><slot></slot></div>' },
  'a-descriptions-item': { template: '<div><slot></slot></div>' },
  'a-progress': { template: '<div><slot></slot></div>' },
  VChart: { template: '<div class="chart"></div>' },
};

describe('DashboardView', () => {
  it('renders quick actions and statistics', () => {
    render(DashboardView, {
      global: {
        plugins: [createPinia(), i18n],
        stubs,
      },
    });

    expect(screen.getByText('Панель управления')).toBeInTheDocument();
    expect(screen.getByText('Активные кампании')).toBeInTheDocument();
    expect(screen.getByText('Создать кампанию')).toBeInTheDocument();
  });
});
