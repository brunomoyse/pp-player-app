import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

import i18n, { SUPPORTED_LOCALES, type AppLocale } from './index';

const STORAGE_KEY = 'pp-locale';

export const LOCALE_LABELS: Record<AppLocale, string> = {
  en: 'English',
  fr: 'Français',
  nl: 'Nederlands',
};

/** Restore the persisted locale on app start (call once, before first render ideally). */
export async function loadPersistedLocale(): Promise<void> {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved && (SUPPORTED_LOCALES as readonly string[]).includes(saved)) {
      await i18n.changeLanguage(saved);
    }
  } catch {
    // fall back to the device locale already set at init
  }
}

/** Locale-aware helpers + a persisted language switcher. */
export function useI18n() {
  const { t, i18n: instance } = useTranslation();
  const locale = (instance.language as AppLocale) ?? 'en';

  const setLocale = async (next: AppLocale) => {
    await instance.changeLanguage(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, next);
    } catch {
      // best-effort persistence
    }
  };

  return { t, locale, setLocale, locales: SUPPORTED_LOCALES };
}
