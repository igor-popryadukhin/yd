import { defineStore } from 'pinia';

interface Profile {
  name: string;
  email: string;
  company: string;
}

type ThemeMode = 'light' | 'dark';

export const useUiStore = defineStore('ui', {
  state: () => ({
    collapsed: false,
    theme: 'light' as ThemeMode,
    accentColor: '#1677ff',
    profile: {
      name: 'Алексей Иванов',
      email: 'alexey.ivanov@example.com',
      company: 'Demo Agency',
    } as Profile,
  }),
  actions: {
    toggleCollapsed() {
      this.collapsed = !this.collapsed;
    },
    setTheme(theme: ThemeMode) {
      this.theme = theme;
    },
    setAccentColor(color: string) {
      this.accentColor = color;
    },
    updateProfile(profile: Partial<Profile>) {
      this.profile = { ...this.profile, ...profile };
    },
  },
});
