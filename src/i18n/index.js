import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enHome from "./resources/en/home.json";

const resources = {
    en: {
        home: enHome
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: "en",
        supportedLngs: ["en"],
        ns: ["home"],
        defaultNS: "home",
        interpolation: {
            escapeValue: false
        },
        detection: {
            order: ["querystring", "localStorage", "navigator"],
            caches: ["localStorage"]
        }
    });

export default i18n;
