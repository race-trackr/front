import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Importez directement vos fichiers de traduction
import enTranslation from './locales/en/translation.json'
import frTranslation from './locales/fr/translation.json'
import itTranslation from './locales/it/translation.json'
import esTranslation from './locales/es/translation.json'

i18n
  .use(LanguageDetector) // Détecte la langue de l'utilisateur
  .use(initReactI18next) // Passe l'instance i18n à react-i18next
  .init({
    resources: {
      en: {
        translation: enTranslation,
      },
      fr: {
        translation: frTranslation,
      },
      it: {
        translation: itTranslation,
      },
      es: {
        translation: esTranslation,
      },
    },
    fallbackLng: 'en', // Langue de secours si la langue détectée n'est pas disponible
    debug: true, // Active le mode debug pour voir les messages de i18next dans la console
    interpolation: {
      escapeValue: false, // React est déjà protégé contre les attaques XSS
    },
    // Le backend n'est plus nécessaire car les ressources sont chargées directement
  })

export default i18n
