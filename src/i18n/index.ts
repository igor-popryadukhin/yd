import { createI18n } from 'vue-i18n';

import ru from './ru.json';

export const i18n = createI18n({
  legacy: false,
  locale: 'ru',
  fallbackLocale: 'ru',
  messages: {
    ru,
  },
});
