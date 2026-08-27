import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import translationEN from "./locales/en/translation.json";
import translationUZ from "./locales/uz/translation.json";
import translationRU from "./locales/ru/translation.json";

const resources = {
  en: { translation: translationEN },
  uz: { translation: translationUZ },
  ru: { translation: translationRU },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    supportedLngs: ["en", "uz", "ru"],
    // Detected codes like "en-US" are reduced to "en" so they match `resources`
    // and so the value sent in the Accept-Language header is one the API knows.
    load: "languageOnly",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
