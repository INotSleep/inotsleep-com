import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enCommon from "./resources/en/common.json";
import enHome from "./resources/en/home.json";
import enNotFound from "./resources/en/notfound.json";
import enHeader from "./resources/en/header.json";
import enProjects from "./resources/en/projects.json";
import enWiki from "./resources/en/wiki.json";
import enI18n from "./resources/en/i18n.json";

const resources = {
    en: {
        common: enCommon,
        home: enHome,
        notfound: enNotFound,
        header: enHeader,
        projects: enProjects,
        wiki: enWiki,
        i18n: enI18n,
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: "en",
        supportedLngs: [
            "en"
        ],
        ns: Object.keys(resources.en),
        defaultNS: "common",
        interpolation: {
            escapeValue: false
        },
        detection: {
            order: ["querystring", "localStorage", "navigator"],
            caches: ["localStorage"]
        }
    });

export default i18n;
