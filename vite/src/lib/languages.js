// Translation language codes look like Minecraft locales: "en_us", "uk_ua", "de".

const FLAG_FOR_LANGUAGE = {
    en: "gb", uk: "ua", be: "by", cs: "cz", da: "dk", el: "gr", et: "ee", fa: "ir",
    he: "il", hi: "in", ja: "jp", ka: "ge", kk: "kz", ko: "kr", nb: "no", nn: "no",
    sl: "si", sr: "rs", sv: "se", vi: "vn", zh: "cn", ar: "sa", ga: "ie", hy: "am"
};

function parseCode(code) {
    const [language = "", region = ""] = String(code || "").toLowerCase().split(/[_-]/);
    return { language, region };
}

function displayName(locale, tag) {
    try {
        const name = new Intl.DisplayNames([locale], { type: "language" }).of(tag);
        return name && name.toLowerCase() !== tag.toLowerCase() ? name : null;
    } catch {
        return null;
    }
}

const capitalize = (s) => s.charAt(0).toLocaleUpperCase() + s.slice(1);

export function languageFlag(code) {
    const { language, region } = parseCode(code);
    return region || FLAG_FOR_LANGUAGE[language] || language;
}

/**
 * Native name of the language ("Українська"). The region is added only when
 * `withRegion` is set, e.g. to tell en_us from en_gb.
 */
export function languageName(code, withRegion = false) {
    const { language, region } = parseCode(code);
    const tag = withRegion && region ? `${language}-${region.toUpperCase()}` : language;
    const name = displayName(tag, tag) || displayName("en", tag);
    return name ? capitalize(name) : String(code);
}

/** Codes whose base language appears more than once and need the region shown. */
export function ambiguousLanguages(codes) {
    const counts = {};
    for (const code of codes || []) {
        const { language } = parseCode(code);
        counts[language] = (counts[language] || 0) + 1;
    }
    return new Set((codes || []).filter((code) => counts[parseCode(code).language] > 1));
}
