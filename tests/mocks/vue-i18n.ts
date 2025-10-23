type MessageTree = Record<string, unknown>;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ruMessages = require('../../src/i18n/ru.json') as MessageTree;

const lookupMessage = (key: string): string => {
  const segments = key.split('.');
  let current: unknown = ruMessages;

  for (const segment of segments) {
    if (current && typeof current === 'object' && segment in (current as MessageTree)) {
      current = (current as MessageTree)[segment];
    } else {
      return key;
    }
  }

  if (typeof current === 'string') {
    return current;
  }

  return key;
};

const translate = (key: string) => lookupMessage(key);

export const createI18n = () => ({
  global: {
    t: translate,
  },
  install(app: { config: { globalProperties: Record<string, unknown> } }) {
    app.config.globalProperties.$t = translate;
  },
});

export const useI18n = () => ({
  t: translate,
});
