import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend) // Charge les traductions depuis le serveur (dossier public)
  .use(LanguageDetector) // Détecte la langue de l'utilisateur
  .use(initReactI18next) // Passe l'instance i18n à react-i18next
  .init({
    fallbackLng: 'en', // Langue de secours si la langue détectée n'est pas disponible
    debug: true, // Active le mode debug pour voir les messages de i18next dans la console
    interpolation: {
      escapeValue: false, // React est déjà protégé contre les attaques XSS
    },
    backend: {
      loadPath: '/locales/{{lng}}/translation.json', // Chemin correct pour charger les fichiers de traduction
    },
  });

export default i18n;