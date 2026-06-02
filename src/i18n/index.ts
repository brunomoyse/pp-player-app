import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import fr from './locales/fr.json';
import nl from './locales/nl.json';

export const SUPPORTED_LOCALES = ['en', 'fr', 'nl'] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

function deviceLocale(): AppLocale {
  const code = Localization.getLocales()[0]?.languageCode ?? 'en';
  return (SUPPORTED_LOCALES as readonly string[]).includes(code) ? (code as AppLocale) : 'en';
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
    nl: { translation: nl },
  },
  lng: deviceLocale(),
  fallbackLng: 'en',
  // The locale JSON (ported from the Vue app) uses vue-i18n's single-brace
  // placeholders like "{count}", so align i18next's interpolation delimiters.
  interpolation: { escapeValue: false, prefix: '{', suffix: '}' },
  returnNull: false,
});

export default i18n;
