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
    ToggleButtonGroup,
    ToggleButton
} from "@mui/material";

export default function I18nContributeProject() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation("i18n");

    // ---------- initial langs из URL ----------
    const [selectedTargetLang, setSelectedTargetLang] = useState(() => {
        const params = new URLSearchParams(location.search);
        return params.get("lang") || "en";
    });

    const [selectedSourceLang, setSelectedSourceLang] = useState(() => {
        const params = new URLSearchParams(location.search);
        return params.get("source") || "en";
    });

    // ---------- список языков с сервера ----------
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
        return fromApi.length > 0 ? fromApi : ["en"];
    }, [langsData]);

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
            if (!slug) throw new Error("Missing slug");

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
                        "Unknown error"
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
                .filter((s) => s.length > 0);

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
            <Box sx={{ p: 3, display: "flex", gap: 2, alignItems: "center" }}>
                <CircularProgress size={20} />
                <Typography>{t("loading_project")}</Typography>
            </Box>
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
            <Box sx={{ p: 3 }}>
                <Typography color="error">
                    {t("loading_error")}{" "}
                    {axiosError?.message || String(axiosError)}
                </Typography>
            </Box>
        );
    }

    if (!data) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography color="error">
                    {t("loading_error")}: empty response
                </Typography>
            </Box>
        );
    }

    // ---------- RENDER ----------
    return (
        <Paper
            sx={{
                p: 3,
                width: "100%",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                gap: 2
            }}
        >
            {/* Хедер */}
            <Box
                sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2
                }}
            >
                <Box>
                    <Typography variant="h5" sx={{ mb: 0.5 }}>
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
                        sx={{ mt: 1, opacity: 0.8, maxWidth: 600 }}
                    >
                        {t("contribute_intro")}
                    </Typography>

                    <Typography
                        variant="caption"
                        sx={{ mt: 0.5, opacity: 0.8, display: "block" }}
                    >
                        {t("keys_stats", {
                            shown: shownCount,
                            total: totalCount,
                            untranslated: untranslatedCount
                        })}
                    </Typography>
                </Box>

                {/* языки + фильтр */}
                <Stack spacing={1} alignItems="flex-end">
                    <Stack direction="row" spacing={2} alignItems="center">
                        <TextField
                            size="small"
                            select
                            label={t("source_language")}
                            value={selectedSourceLang}
                            onChange={(e) =>
                                setSelectedSourceLang(e.target.value)
                            }
                            sx={{ minWidth: 140 }}
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
                            sx={{ minWidth: 140 }}
                        >
                            {languageCodes.map((lng) => (
                                <MenuItem key={lng} value={lng}>
                                    {lng}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Stack>

                    <ToggleButtonGroup
                        size="small"
                        exclusive
                        value={filterMode}
                        onChange={(_e, val) => {
                            if (!val) return;
                            setFilterMode(val);
                        }}
                    >
                        <ToggleButton value="untranslated">
                            {t("filter_untranslated")}
                        </ToggleButton>
                        <ToggleButton value="all">
                            {t("filter_all")}
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Stack>
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
                            const isListType = srcIsArray || trgIsArray;

                            const effectiveStringDraft =
                                stringDrafts[k.key_name] ??
                                (typeof trgValue === "string"
                                    ? String(trgValue)
                                    : "");

                            const baseList =
                                Array.isArray(listDrafts[k.key_name]) &&
                                listDrafts[k.key_name].length > 0
                                    ? listDrafts[k.key_name]
                                    : Array.isArray(trgValue) &&
                                      trgValue.length > 0
                                    ? trgValue.map((v) =>
                                          v != null ? String(v) : ""
                                      )
                                    : Array.isArray(srcValue) &&
                                      srcValue.length > 0
                                    ? srcValue.map((v) =>
                                          v != null ? String(v) : ""
                                      )
                                    : [""];

                            return (
                                <Box
                                    key={k.id}
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        borderRadius: 1,
                                        border: "1px solid rgba(255,255,255,0.12)",
                                        p: 1.5
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

                                        <Chip
                                            size="small"
                                            label={
                                                trgValue === undefined
                                                    ? t("status_untranslated")
                                                    : isListType
                                                    ? t("type_list")
                                                    : t("type_string")
                                            }
                                            color={
                                                trgValue === undefined
                                                    ? "warning"
                                                    : "default"
                                            }
                                            variant={
                                                trgValue === undefined
                                                    ? "outlined"
                                                    : "filled"
                                            }
                                        />
                                    </Stack>

                                    {k.description && (
                                        <Typography
                                            variant="caption"
                                            sx={{ mt: 0.5, opacity: 0.7 }}
                                        >
                                            {k.description}
                                        </Typography>
                                    )}

                                    {/* Оригинал */}
                                    <Box sx={{ mt: 1 }}>
                                        <Typography
                                            variant="caption"
                                            sx={{ opacity: 0.7 }}
                                        >
                                            {t("source_value", {
                                                lang: selectedSourceLang
                                            })}
                                        </Typography>
                                        <Box sx={{ mt: 0.5 }}>
                                            {srcValue === undefined ? (
                                                <Typography
                                                    variant="body2"
                                                    sx={{ opacity: 0.5 }}
                                                >
                                                    {t(
                                                        "no_translation_for_lang"
                                                    )}
                                                </Typography>
                                            ) : srcIsArray ? (
                                                <Box
                                                    component="ul"
                                                    sx={{
                                                        pl: 2,
                                                        m: 0,
                                                        "& li": {
                                                            fontSize: "0.9rem"
                                                        }
                                                    }}
                                                >
                                                    {srcValue.map(
                                                        (line, idx) => (
                                                            <li key={idx}>
                                                                {line}
                                                            </li>
                                                        )
                                                    )}
                                                </Box>
                                            ) : (
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        whiteSpace: "pre-wrap"
                                                    }}
                                                >
                                                    {srcValue}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>

                                    {/* Ввод предложения */}
                                    <Box sx={{ mt: 1.5 }}>
                                        {isListType ? (
                                            <Stack spacing={1.5}>
                                                <Typography
                                                    variant="caption"
                                                    sx={{ opacity: 0.7 }}
                                                >
                                                    {t("your_suggestion")} (
                                                    {t("value_type_list")})
                                                </Typography>

                                                {baseList.map(
                                                    (item, index) => (
                                                        <Stack
                                                            key={index}
                                                            direction="row"
                                                            spacing={1}
                                                            alignItems="center"
                                                        >
                                                            <TextField
                                                                fullWidth
                                                                label={t(
                                                                    "list_item_label",
                                                                    {
                                                                        index:
                                                                            index +
                                                                            1
                                                                    }
                                                                )}
                                                                value={item}
                                                                onChange={(e) =>
                                                                    handleChangeListItem(
                                                                        k.key_name,
                                                                        index,
                                                                        e.target
                                                                            .value,
                                                                        baseList
                                                                    )
                                                                }
                                                                onKeyDown={(
                                                                    e
                                                                ) => {
                                                                    if (
                                                                        e.key ===
                                                                            "Enter" &&
                                                                        !e.shiftKey
                                                                    ) {
                                                                        e.preventDefault();
                                                                        handleAddListItem(
                                                                            k.key_name,
                                                                            baseList
                                                                        );
                                                                    }
                                                                }}
                                                            />
                                                            {baseList.length >
                                                                1 && (
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
                                                                    {t(
                                                                        "remove"
                                                                    )}
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
                                                    sx={{ opacity: 0.7 }}
                                                >
                                                    {t("your_suggestion")} (
                                                    {t(
                                                        "value_type_string"
                                                    )}
                                                    )
                                                </Typography>
                                                <TextField
                                                    fullWidth
                                                    multiline
                                                    minRows={3}
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
                                                    sx={{ mt: 0.5 }}
                                                />
                                            </>
                                        )}

                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "flex-end",
                                                mt: 1
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
                            );
                        })}
                    </Stack>
                )}
            </Box>
        </Paper>
    );
}
