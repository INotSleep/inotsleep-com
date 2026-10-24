import axios from "axios";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export function useProjects() {
    const { i18n } = useTranslation();

    return useQuery({
        queryKey: ["projects", i18n.language],
        queryFn: async () => {
            const res = await axios.get("/api/projects", {
                params: { lang: i18n.language }
            });
            return Array.isArray(res.data) ? res.data : [];
        }
    });
}

export function useI18nLanguages() {
    return useQuery({
        queryKey: ["i18n-languages"],
        queryFn: async () => {
            const res = await axios.get("/api/i18n/languages");
            return (Array.isArray(res.data) ? res.data : [])
                .map((it) => (typeof it === "string" ? it : it?.code))
                .filter(Boolean);
        },
        staleTime: 5 * 60 * 1000
    });
}

const TARGET_LANG_KEY = "i18n-target-lang";

export function getSavedTargetLang() {
    try {
        return window.localStorage.getItem(TARGET_LANG_KEY);
    } catch {
        return null;
    }
}

export function saveTargetLang(code) {
    try {
        window.localStorage.setItem(TARGET_LANG_KEY, code);
    } catch {
        // storage unavailable
    }
}

/** Picks the best available language: wanted, then UI language, then English, then first. */
export function pickLanguage(available, ...wanted) {
    const norm = (c) => String(c || "").trim().toLowerCase().replace("-", "_");
    const list = Array.isArray(available) ? available : [];
    const uiLang = typeof navigator !== "undefined" ? navigator.language : "";

    for (const want of [...wanted, uiLang]) {
        if (!want) continue;
        const exact = list.find((c) => norm(c) === norm(want));
        if (exact) return exact;
        const prefix = list.find((c) => norm(c).split("_")[0] === norm(want).split("_")[0]);
        if (prefix) return prefix;
    }
    return list.find((c) => norm(c) === "en_us") || list.find((c) => norm(c).startsWith("en")) || list[0] || "en_us";
}

/** Latest GitHub release of every project that has a `repo`; failures are skipped. */
export function useLatestReleases(projects) {
    const withRepo = (projects || []).filter((p) => p.repo);

    return useQueries({
        queries: withRepo.map((project) => ({
            queryKey: ["github-release", project.repo],
            queryFn: async () => {
                const res = await axios.get(`https://api.github.com/repos/${project.repo}/releases/latest`);
                return {
                    project,
                    tag: res.data.tag_name,
                    url: res.data.html_url,
                    publishedAt: res.data.published_at
                };
            },
            staleTime: 30 * 60 * 1000,
            retry: false
        })),
        combine: (results) => ({
            releases: results
                .map((r) => r.data)
                .filter(Boolean)
                .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)),
            isPending: results.some((r) => r.isPending)
        })
    });
}
