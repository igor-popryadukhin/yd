import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'vue'],
  transform: {
    '^.+\\.vue$': '@vue/vue3-jest',
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.app.json', isolatedModules: true }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '^@vue/test-utils$': '<rootDir>/node_modules/@vue/test-utils/dist/vue-test-utils.cjs.js',
    '^vue-i18n$': '<rootDir>/tests/mocks/vue-i18n.ts',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  transformIgnorePatterns: ['node_modules/(?!ant-design-vue/es/.*|lodash-es/.*|vue-i18n/.*)'],
  collectCoverageFrom: ['src/**/*.{ts,vue}', '!src/**/index.ts', '!src/**/types.ts'],
};

export default config;
