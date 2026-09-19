import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en';
import ar from './locales/ar';

export const SUPPORTED_LOCALES = ['en', 'ar'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
const RTL_LOCALES: SupportedLocale[] = ['ar'];

export function isRtl(locale: string): boolean {
  return RTL_LOCALES.includes(locale as SupportedLocale);
}

export function applyDocumentDirection(locale: string): void {
  document.documentElement.dir = isRtl(locale) ? 'rtl' : 'ltr';
  document.documentElement.lang = locale;
}

const STORAGE_KEY = 'taskforge-admin.locale';
const stored = (typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY)) || 'en';
const initialLocale = SUPPORTED_LOCALES.includes(stored as SupportedLocale) ? stored : 'en';

void i18n
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, ar: { translation: ar } },
    lng: initialLocale,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

applyDocumentDirection(initialLocale);

i18n.on('languageChanged', (lng) => {
  applyDocumentDirection(lng);
  try {
    localStorage.setItem(STORAGE_KEY, lng);
  } catch {
    /* private mode / storage disabled — language still works, just doesn't persist */
  }
});

export default i18n;
