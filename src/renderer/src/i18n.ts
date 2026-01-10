import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Import translation files
import zhCN from './locales/zh-CN'
import enUS from './locales/en-US'
import ruRU from './locales/ru-RU'

const resources = {
  'zh-CN': { translation: zhCN },
  'en-US': { translation: enUS },
  'ru-RU': { translation: ruRU }
}

// Get saved language from localStorage or use system language
const getSavedLanguage = (): string => {
  const saved = localStorage.getItem('language')
  if (saved && ['zh-CN', 'en-US', 'ru-RU'].includes(saved)) {
    return saved
  }

  // Try to detect system language
  const systemLang = navigator.language || 'zh-CN'
  if (systemLang.startsWith('zh')) return 'zh-CN'
  if (systemLang.startsWith('ru')) return 'ru-RU'
  if (systemLang.startsWith('en')) return 'en-US'

  return 'ru-RU' // Default to Chinese
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getSavedLanguage(),
    fallbackLng: 'en-US',
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  })

export default i18n
