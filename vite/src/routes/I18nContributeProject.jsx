import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import {
    Box,
    Typography,
    CircularProgress,
    Paper,
    Stack,
    TextField,
    MenuItem,
    Button,
    Divider,
    Chip,
    LinearProgress,
    ToggleButtonGroup,
    ToggleButton
} from "@mui/material";
import { itemCardSx, monoLabelSx, pagePanelSx, sectionTitleSx, subtleTextSx } from "../theme/neoStyles.js";

export default function I18nContributeProject() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation("i18n");

    const [selectedTargetLang, setSelectedTargetLang] = useState(() => {
        const params = new URLSearchParams(location.search);
        return params.get("lang") || "en_us";
    });

    const [selectedSourceLang, setSelectedSourceLang] = useState(() => {
        const params = new URLSearchParams(location.search);
        return params.get("source") || "en_us";
    });

    const {
        data: langsData,
        isLoading: langsLoading
    } = useQuery({
        queryKey: ["i18n-languages"],
        queryFn: async () => {
            const res = await axios.get("/api/i18n/languages");
            return res.data || [];
        }
    });

    const languageCodes = useMemo(() => {
        const arr = Array.isArray(langsData) ? langsData : [];
        const fromApi = arr
            .map((it) => (typeof it === "string" ? it : it.code))
            .filter(Boolean);
        return fromApi.length > 0 ? fromApi : ["en_us"];
    }, [langsData]);

    const normalizeKeyType = (type) => {
        if (typeof type !== "string") return null;
        const v = type.trim().toLowerCase();
        if (v === "list" || v === "array") return "list";
        if (v === "string") return "string";
        return null;
    };


    // если выбранный язык выпал из списка — аккуратно чиним
    useEffect(() => {
        if (languageCodes.length === 0) return;

        if (!languageCodes.includes(selectedSourceLang)) {
            setSelectedSourceLang(languageCodes[0]);
        }
        if (!languageCodes.includes(selectedTargetLang)) {
            setSelectedTargetLang(languageCodes[0]);
        }
    }, [languageCodes, selectedSourceLang, selectedTargetLang]);

    // ---------- синхронизация lang/source в URL ----------
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get("lang") === selectedTargetLang) return;
        params.set("lang", selectedTargetLang);
        navigate(
            { pathname: location.pathname, search: params.toString() },
            { replace: true }
        );
    }, [selectedTargetLang, location.pathname, location.search, navigate]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get("source") === selectedSourceLang) return;
        params.set("source", selectedSourceLang);
        navigate(
            { pathname: location.pathname, search: params.toString() },
            { replace: true }
        );
    }, [selectedSourceLang, location.pathname, location.search, navigate]);

    // ---------- данные проекта + ключи + переводы ----------
    const {
        data,
        isPending,
        isError,
        error,
        isFetching
    } = useQuery({
        queryKey: [
            "i18n-contribute-project",
            slug,
            selectedSourceLang,
            selectedTargetLang
        ],
        enabled: Boolean(slug) && languageCodes.length > 0,
        queryFn: async () => {
            if (!slug) throw new Error(t("missing_slug"));

            const [keysRes, srcRes, trgRes] = await Promise.all([
                axios.get(`/api/i18n/projects/${encodeURIComponent(slug)}/keys`),
                axios.get(
                    `/api/i18n/projects/${encodeURIComponent(
                        slug
                    )}/translations`,
                    { params: { lang: selectedSourceLang } }
                ),
                axios.get(
                    `/api/i18n/projects/${encodeURIComponent(
                        slug
                    )}/translations`,
                    { params: { lang: selectedTargetLang } }
                )
            ]);

            return {
                project: keysRes.data.project,
                keys: keysRes.data.keys || [],
                source: srcRes.data.translations || {},
                translations: trgRes.data.translations || {}
            };
        }
    });

    // ---------- локальное состояние для формы ----------
    const [filterMode, setFilterMode] = useState("untranslated"); // "untranslated" | "all"
    const [stringDrafts, setStringDrafts] = useState({});
    const [listDrafts, setListDrafts] = useState({});
    const [submitError, setSubmitError] = useState("");
    const [lastSubmittedKey, setLastSubmittedKey] = useState(null);

    const suggestionMutation = useMutation({
        mutationFn: async ({ keyName, value }) => {
            return axios.post(
                `/api/i18n/projects/${encodeURIComponent(slug)}/suggestions`,
                {
                    language: selectedTargetLang,
                    key: keyName,
                    value
                }
            );
        },
        onSuccess: (_res, variables) => {
            setSubmitError("");
            setLastSubmittedKey(variables.keyName);
        },
        onError: (e) => {
            if (e?.response?.status === 401) {
                setSubmitError(t("must_login_to_suggest"));
            } else {
                setSubmitError(
                    `${t("suggestion_error_prefix")} ${
                        e?.response?.data?.error ||
                        e?.message ||
                        t("unknown_error")
                    }`
                );
            }
        }
    });

    // ---------- безопасный разбор data до return'ов ----------
    const { project, keys, source, translations } = data || {
        project: null,
        keys: [],
        source: {},
        translations: {}
    };

    const filteredKeys = useMemo(() => {
        if (!Array.isArray(keys)) return [];
        if (filterMode === "untranslated") {
            return keys.filter((k) => translations[k.key_name] === undefined);
        }
        return keys;
    }, [keys, translations, filterMode]);

    const totalCount = Array.isArray(keys) ? keys.length : 0;
    const shownCount = filteredKeys.length;
    const untranslatedCount = Array.isArray(keys)
        ? keys.filter((k) => translations[k.key_name] === undefined).length
        : 0;
    const translatedCount = Math.max(totalCount - untranslatedCount, 0);
    const progressPercent =
        totalCount > 0
            ? Math.round((translatedCount / totalCount) * 100)
            : 0;

    // ---------- helpers для драфтов ----------
    const handleChangeStringDraft = (keyName, value) => {
        setStringDrafts((prev) => ({ ...prev, [keyName]: value }));
    };

    const handleChangeListItem = (keyName, index, value, baseArray) => {
        setListDrafts((prev) => {
            const base = Array.isArray(prev[keyName])
                ? prev[keyName]
                : Array.isArray(baseArray)
                ? baseArray
                : [];
            const next = [...base];
            next[index] = value;
            return { ...prev, [keyName]: next };
        });
    };

    const handleAddListItem = (keyName, baseArray) => {
        setListDrafts((prev) => {
            const base = Array.isArray(prev[keyName])
                ? prev[keyName]
                : Array.isArray(baseArray)
                ? baseArray
                : [""];
            return { ...prev, [keyName]: [...base, ""] };
        });
    };

    const handleRemoveListItem = (keyName, index) => {
        setListDrafts((prev) => {
            const current = Array.isArray(prev[keyName]) ? prev[keyName] : [];
            const next = current.filter((_, i) => i !== index);
            return { ...prev, [keyName]: next };
        });
    };

    const handleSubmitSuggestion = (keyName, isListType) => {
        setLastSubmittedKey(null);

        if (isListType) {
            const rawItems = Array.isArray(listDrafts[keyName])
                ? listDrafts[keyName]
                : [];
            const items = rawItems
                .map((s) => (s ?? "").trim())

            if (items.length === 0) {
                setSubmitError(t("edit_list_empty"));
                return;
            }

            suggestionMutation.mutate({ keyName, value: items });
        } else {
            const text = (stringDrafts[keyName] || "").trim();
            if (!text) {
                setSubmitError(t("your_suggestion_empty"));
                return;
            }
            suggestionMutation.mutate({ keyName, value: text });
        }
    };

    // ---------- LOADING / ERROR (после всех хуков) ----------
    if (isPending || langsLoading) {
        return (
            <Paper sx={{ ...pagePanelSx, display: "flex", flexDirection: "row", alignItems: "center" }}>
                <CircularProgress size={20} />
                <Typography>{t("loading_project")}</Typography>
            </Paper>
        );
    }

    if (isError) {
        const axiosError = error;
        const status = axiosError?.response?.status;

        if (status === 404 || axiosError?.message?.includes?.("404")) {
            navigate(`/404?path=/i18n/${slug}/translate`);
            return null;
        }

        return (
            <Paper sx={pagePanelSx}>
                <Typography color="error">
                    {t("loading_error")}{" "}
                    {axiosError?.message || String(axiosError)}
                </Typography>
            </Paper>
        );
    }

    if (!data) {
        return (
            <Paper sx={pagePanelSx}>
                <Typography color="error">
                    {t("loading_error")}: {t("empty_response")}
                </Typography>
            </Paper>
        );
    }

    // ---------- RENDER ----------
    return (
        <Paper
            sx={pagePanelSx}
        >
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) auto" },
                    gap: 2,
                    alignItems: "stretch"
                }}
            >
                <Box>
                    <Typography variant="caption" sx={{ ...monoLabelSx, color: "primary.main" }}>
                        {t("breadcrumb_contribute", {
                            slug: project?.slug || slug
                        })}
                    </Typography>
                    <Typography variant="h2" sx={{ ...sectionTitleSx, mt: 0.8 }}>
                        {t("contribute_title")} — {project.name}
                    </Typography>

                    {isFetching && (
                        <Typography
                            variant="caption"
                            sx={{ opacity: 0.7, display: "block" }}
                        >
                            {t("refreshing")}…
                        </Typography>
                    )}

                    <Typography
                        variant="body2"
                        sx={{
                            ...subtleTextSx,
                            mt: 1,
                            maxWidth: 760,
                            whiteSpace: { xs: "normal", lg: "nowrap" }
                        }}
                    >
                        {t("contribute_intro")}
                    </Typography>

                    <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                            mt: 1,
                            flexWrap: "nowrap",
                            overflowX: "auto",
                            pb: 0.4
                        }}
                    >
                        <Chip
                            size="small"
                            label={t("progress_translated_label", { percent: progressPercent })}
                        />
                        <Chip
                            size="small"
                            label={t("progress_keys_label", {
                                translated: translatedCount,
                                total: totalCount
                            })}
                            variant="outlined"
                        />
                    </Stack>

                    <Typography
                        variant="caption"
                        sx={{
                            mt: 0.8,
                            opacity: 0.8,
                            display: "block",
                            whiteSpace: { xs: "normal", lg: "nowrap" }
                        }}
                    >
                        {t("keys_stats", {
                            shown: shownCount,
                            total: totalCount,
                            untranslated: untranslatedCount
                        })}
                    </Typography>

                    <LinearProgress
                        variant="determinate"
                        value={progressPercent}
                        sx={{ mt: 1, height: 8, borderRadius: 999 }}
                    />
                </Box>

                <Box
                    sx={{
                        minWidth: { lg: 360 },
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column"
                    }}
                >
                    <Stack
                        direction={{ xs: "row", lg: "column" }}
                        spacing={1}
                    >
                        <TextField
                            size="small"
                            select
                            label={t("source_language")}
                            value={selectedSourceLang}
                            onChange={(e) =>
                                setSelectedSourceLang(e.target.value)
                            }
                            sx={{ flex: 1, minWidth: 0 }}
                        >
                            {languageCodes.map((lng) => (
                                <MenuItem key={lng} value={lng}>
                                    {lng}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            size="small"
                            select
                            label={t("target_language")}
                            value={selectedTargetLang}
                            onChange={(e) =>
                                setSelectedTargetLang(e.target.value)
                            }
                            sx={{ flex: 1, minWidth: 0 }}
                        >
                            {languageCodes.map((lng) => (
                                <MenuItem key={lng} value={lng}>
                                    {lng}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Stack>

                    <Box sx={{ mt: "auto", pt: 1.2 }}>
                        <ToggleButtonGroup
                            size="small"
                            exclusive
                            value={filterMode}
                            onChange={(_e, val) => {
                                if (!val) return;
                                setFilterMode(val);
                            }}
                            sx={{
                                width: "100%",
                                "& .MuiToggleButtonGroup-grouped": {
                                    flex: 1,
                                    borderRadius: "0 !important"
                                },
                                "& .MuiToggleButtonGroup-firstButton": {
                                    borderTopLeftRadius: "10px !important",
                                    borderBottomLeftRadius: "10px !important"
                                },
                                "& .MuiToggleButtonGroup-lastButton": {
                                    borderTopRightRadius: "10px !important",
                                    borderBottomRightRadius: "10px !important"
                                }
                            }}
                        >
                            <ToggleButton value="untranslated">
                                {t("filter_untranslated")}
                            </ToggleButton>
                            <ToggleButton value="all">
                                {t("filter_all")}
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Box>
                </Box>
            </Box>

            <Divider />

            {/* глобальные сообщения */}
            {submitError && (
                <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                    {submitError}
                </Typography>
            )}
            {lastSubmittedKey && !submitError && (
                <Typography variant="body2" color="success.main" sx={{ mb: 1 }}>
                    {t("suggestion_sent")}
                </Typography>
            )}

            {/* Список ключей — без внутреннего скролла */}
            <Box sx={{ flex: 1 }}>
                {filteredKeys.length === 0 ? (
                    <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                        {totalCount === 0
                            ? t("no_keys_for_project")
                            : t("all_keys_translated")}
                    </Typography>
                ) : (
                    <Stack spacing={1.5}>
                        {filteredKeys.map((k) => {
                            const srcValue = source[k.key_name];
                            const trgValue = translations[k.key_name];

                            const srcIsArray = Array.isArray(srcValue);
                            const trgIsArray = Array.isArray(trgValue);

                            const keyType =
                                normalizeKeyType(k.value_type) ??
                                (trgIsArray ? "list" : typeof trgValue === "string" ? "string" : null) ??
                                (srcIsArray ? "list" : typeof srcValue === "string" ? "string" : "string");

                            const isListType = keyType === "list";


                            const effectiveStringDraft =
                                stringDrafts[k.key_name] ??
                                (typeof trgValue === "string"
                                    ? String(trgValue)
                                    : "");

                            const draft = listDrafts[k.key_name];
                            const baseList =
                                Array.isArray(draft)
                                    ? (draft.length > 0 ? draft : [""])
                                    : Array.isArray(trgValue) && trgValue.length > 0
                                    ? trgValue.map((v) => (v != null ? String(v) : ""))
                                    : Array.isArray(srcValue) && srcValue.length > 0
                                    ? srcValue.map((v) => (v != null ? String(v) : ""))
                                    : [""];


                            return (
                                <Box
                                    key={k.id}
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        ...itemCardSx,
                                        p: 2
                                    }}
                                >
                                    {/* Заголовок + статус */}
                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        alignItems="center"
                                        justifyContent="space-between"
                                    >
                                        <Typography
                                            variant="subtitle2"
                                            sx={{
                                                fontFamily:
                                                    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
                                            }}
                                        >
                                            {k.key_name}
                                        </Typography>

                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Chip
                                                size="small"
                                                label={isListType ? t("type_list") : t("type_string")}
                                                variant="filled"
                                            />
                                            {trgValue === undefined && (
                                                <Chip
                                                    size="small"
                                                    label={t("status_untranslated")}
                                                    color="warning"
                                                    variant="outlined"
                                                />
                                            )}
                                        </Stack>
                                    </Stack>

                                    {k.description && (
                                        <Typography
                                            variant="caption"
                                            sx={{ mt: 0.5, opacity: 0.7 }}
                                        >
                                            {k.description}
                                        </Typography>
                                    )}

                                    <Box
                                        sx={{
                                            mt: 1,
                                            display: "grid",
                                            gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" },
                                            gap: 1.5
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                border: "1px solid",
                                                borderColor: "divider",
                                                borderRadius: 1.5,
                                                p: 1.2,
                                                background: (theme) =>
                                                    theme.palette.mode === "dark"
                                                        ? "linear-gradient(180deg, rgba(6,14,32,0.52) 0%, rgba(10,18,34,0.62) 100%)"
                                                        : "linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(248,251,255,0.98) 100%)"
                                            }}
                                        >
                                            <Typography
                                                variant="caption"
                                                sx={{ opacity: 0.74 }}
                                            >
                                                {t("source_value", {
                                                    lang: selectedSourceLang
                                                })}
                                            </Typography>
                                            <Box sx={{ mt: 0.6 }}>
                                                {srcValue === undefined ? (
                                                    <Typography
                                                        variant="body2"
                                                        sx={{ opacity: 0.56 }}
                                                    >
                                                        {t(
                                                            "no_translation_for_lang"
                                                        )}
                                                    </Typography>
                                                ) : srcIsArray ? (
                                                    <Stack spacing={0.8}>
                                                        {srcValue.map(
                                                            (line, idx) => (
                                                                <Box
                                                                    key={idx}
                                                                    sx={{
                                                                        display: "grid",
                                                                        gridTemplateColumns: "28px minmax(0,1fr)",
                                                                        gap: 1,
                                                                        alignItems: "start",
                                                                        border: "1px solid",
                                                                        borderColor: "divider",
                                                                        borderRadius: 1.2,
                                                                        px: 1,
                                                                        py: 0.75,
                                                                        bgcolor: (theme) =>
                                                                            theme.palette.mode === "dark"
                                                                                ? "rgba(255,255,255,0.02)"
                                                                                : "rgba(12,110,143,0.03)"
                                                                    }}
                                                                >
                                                                    <Typography
                                                                        variant="caption"
                                                                        sx={{
                                                                            ...monoLabelSx,
                                                                            color: "text.secondary",
                                                                            opacity: 0.9
                                                                        }}
                                                                    >
                                                                        {idx + 1}.
                                                                    </Typography>
                                                                    <Typography
                                                                        variant="body2"
                                                                        sx={{
                                                                            whiteSpace: "pre-wrap",
                                                                            wordBreak: "break-word",
                                                                            lineHeight: 1.55
                                                                        }}
                                                                    >
                                                                        {line}
                                                                    </Typography>
                                                                </Box>
                                                            )
                                                        )}
                                                    </Stack>
                                                ) : (
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            whiteSpace: "pre-wrap",
                                                            wordBreak: "break-word",
                                                            lineHeight: 1.55
                                                        }}
                                                    >
                                                        {srcValue}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>

                                        <Box
                                            sx={{
                                                border: "1px solid",
                                                borderColor: "divider",
                                                borderRadius: 1.5,
                                                p: 1.2
                                            }}
                                        >
                                            {isListType ? (
                                                <Stack spacing={1.5}>
                                                    <Typography
                                                        variant="caption"
                                                        sx={{ opacity: 0.74 }}
                                                    >
                                                        {t("your_suggestion")} ({t("value_type_list")})
                                                    </Typography>

                                                    {baseList.map(
                                                        (item, index) => (
                                                            <Stack
                                                                key={index}
                                                                direction={{ xs: "column", md: "row" }}
                                                                spacing={1}
                                                                alignItems={{ xs: "stretch", md: "center" }}
                                                            >
                                                                <TextField
                                                                    fullWidth
                                                                    multiline
                                                                    size="small"
                                                                    minRows={1}
                                                                    maxRows={6}
                                                                    label={t("list_item_label", { index: index + 1 })}
                                                                    value={item}
                                                                    onChange={(e) =>
                                                                        handleChangeListItem(
                                                                            k.key_name,
                                                                            index,
                                                                            e.target.value,
                                                                            baseList
                                                                        )
                                                                    }
                                                                    onKeyDown={(e) => {
                                                                        const isMac = navigator.platform?.toLowerCase().includes("mac");
                                                                        const addNew =
                                                                            (isMac && e.metaKey && e.key === "Enter") ||
                                                                            (!isMac && e.ctrlKey && e.key === "Enter");

                                                                        if (addNew) {
                                                                            e.preventDefault();
                                                                            handleAddListItem(k.key_name, baseList);
                                                                        }
                                                                    }}
                                                                />

                                                                {baseList.length > 1 && (
                                                                    <Button
                                                                        size="small"
                                                                        color="error"
                                                                        onClick={() =>
                                                                            handleRemoveListItem(
                                                                                k.key_name,
                                                                                index
                                                                            )
                                                                        }
                                                                    >
                                                                        {t("remove")}
                                                                    </Button>
                                                                )}
                                                            </Stack>
                                                        )
                                                    )}

                                                    <Box>
                                                        <Button
                                                            size="small"
                                                            variant="text"
                                                            onClick={() =>
                                                                handleAddListItem(
                                                                    k.key_name,
                                                                    baseList
                                                                )
                                                            }
                                                        >
                                                            {t("add_list_item")}
                                                        </Button>
                                                    </Box>
                                                </Stack>
                                            ) : (
                                                <>
                                                    <Typography
                                                        variant="caption"
                                                        sx={{ opacity: 0.74 }}
                                                    >
                                                        {t("your_suggestion")} ({t("value_type_string")})
                                                    </Typography>
                                                    <TextField
                                                        fullWidth
                                                        multiline
                                                        size="small"
                                                        minRows={1}
                                                        maxRows={10}
                                                        value={
                                                            effectiveStringDraft
                                                        }
                                                        onChange={(e) =>
                                                            handleChangeStringDraft(
                                                                k.key_name,
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder={t(
                                                            "suggestion_placeholder"
                                                        )}
                                                        sx={{ mt: 0.6 }}
                                                    />
                                                </>
                                            )}

                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    justifyContent: "flex-end",
                                                    mt: 1.2
                                                }}
                                            >
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    onClick={() =>
                                                        handleSubmitSuggestion(
                                                            k.key_name,
                                                            isListType
                                                        )
                                                    }
                                                    disabled={
                                                        suggestionMutation.isPending
                                                    }
                                                >
                                                    {t("submit_suggestion")}
                                                </Button>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                            );
                        })}
                    </Stack>
                )}
            </Box>
        </Paper>
    );
}
