import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    IconButton,
    LinearProgress,
    Paper,
    Stack,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Typography
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import GitHubIcon from "@mui/icons-material/GitHub";
import LanguageSelect from "../components/LanguageSelect.jsx";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "../components/ui.jsx";
import { startLogin, useCurrentUser } from "../lib/auth.js";
import { errorMessage, monoSx } from "../lib/utils.js";
import { getSavedTargetLang, pickLanguage, saveTargetLang, useI18nLanguages } from "../lib/queries.js";

function keyTypeOf(keyRow, ...values) {
    const raw = typeof keyRow?.value_type === "string" ? keyRow.value_type.trim().toLowerCase() : "";
    if (raw === "list" || raw === "array") return "list";
    if (raw === "string") return "string";
    return values.some(Array.isArray) ? "list" : "string";
}

function toLines(value) {
    return Array.isArray(value) ? value.map((v) => (v != null ? String(v) : "")) : null;
}

const isSubmitShortcut = (e) => e.key === "Enter" && (e.ctrlKey || e.metaKey);

function SourceValue({ value }) {
    const { t } = useTranslation("i18n");

    if (value === undefined) {
        return (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                {t("no_translation_for_lang")}
            </Typography>
        );
    }

    if (Array.isArray(value)) {
        return (
            <Box component="ol" sx={{ m: 0, pl: 2.5, "& li": { py: 0.25 } }}>
                {value.map((line, idx) => (
                    <Typography key={idx} component="li" variant="body2" sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                        {line}
                    </Typography>
                ))}
            </Box>
        );
    }

    return (
        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {value}
        </Typography>
    );
}

function SuggestionCard({ slug, keyRow, sourceValue, targetValue, targetLang, canSend }) {
    const { t } = useTranslation("i18n");
    const isList = keyTypeOf(keyRow, targetValue, sourceValue) === "list";

    const [text, setText] = useState(typeof targetValue === "string" ? targetValue : "");
    const [lines, setLines] = useState(
        () => toLines(targetValue)?.length ? toLines(targetValue) : toLines(sourceValue)?.length ? toLines(sourceValue) : [""]
    );
    const [status, setStatus] = useState({ state: "idle" }); // idle | sending | sent | error

    const markEdited = () => {
        if (status.state === "sent" || status.state === "error") setStatus({ state: "idle" });
    };

    const send = async () => {
        if (!canSend) {
            startLogin();
            return;
        }
        if (status.state === "sending") return;

        let value;
        if (isList) {
            value = lines.map((s) => (s ?? "").trim());
            if (value.every((s) => !s)) {
                setStatus({ state: "error", message: t("your_suggestion_empty") });
                return;
            }
        } else {
            value = text.trim();
            if (!value) {
                setStatus({ state: "error", message: t("your_suggestion_empty") });
                return;
            }
        }

        setStatus({ state: "sending" });
        try {
            await axios.post(`/api/i18n/projects/${encodeURIComponent(slug)}/suggestions`, {
                language: targetLang,
                key: keyRow.key_name,
                value
            });
            setStatus({ state: "sent" });
        } catch (e) {
            if (e?.response?.status === 401) {
                startLogin();
                return;
            }
            setStatus({ state: "error", message: errorMessage(e, t("generic_error")) });
        }
    };

    const onKeyDown = (e) => {
        if (isSubmitShortcut(e)) {
            e.preventDefault();
            send();
        }
    };

    const isUntranslated = targetValue === undefined;

    return (
        <Paper
            sx={{
                p: { xs: 2, md: 2.5 },
                borderColor: status.state === "sent" ? "success.main" : undefined,
                transition: "border-color .2s"
            }}
        >
            <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                <Typography variant="subtitle2" sx={{ ...monoSx, fontSize: "0.85rem", wordBreak: "break-all" }}>
                    {keyRow.key_name}
                </Typography>
                {isList && <Chip size="small" label={t("type_list")} />}
                {isUntranslated && (
                    <Chip size="small" label={t("status_untranslated")} color="warning" variant="outlined" />
                )}
            </Stack>

            {keyRow.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {keyRow.description}
                </Typography>
            )}

            <Box
                sx={{
                    mt: 2,
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
                    gap: 2
                }}
            >
                <Box
                    sx={{
                        p: 1.5,
                        borderRadius: 2.5,
                        bgcolor: "action.hover",
                        alignSelf: "start"
                    }}
                >
                    <SourceValue value={sourceValue} />
                </Box>

                <Box>
                    {isList ? (
                        <Stack gap={1}>
                            {lines.map((line, index) => (
                                <Stack key={index} direction="row" gap={0.5} alignItems="flex-start">
                                    <TextField
                                        fullWidth
                                        multiline
                                        size="small"
                                        maxRows={6}
                                        value={line}
                                        placeholder={t("line_n", { index: index + 1 })}
                                        inputProps={{ "aria-label": t("line_n", { index: index + 1 }) }}
                                        onChange={(e) => {
                                            markEdited();
                                            setLines((prev) => prev.map((v, i) => (i === index ? e.target.value : v)));
                                        }}
                                        onKeyDown={onKeyDown}
                                    />
                                    {lines.length > 1 && (
                                        <Tooltip title={t("remove_line")}>
                                            <IconButton
                                                size="small"
                                                aria-label={t("remove_line")}
                                                onClick={() => {
                                                    markEdited();
                                                    setLines((prev) => prev.filter((_, i) => i !== index));
                                                }}
                                                sx={{ mt: 0.5 }}
                                            >
                                                <CloseIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </Stack>
                            ))}
                            <Box>
                                <Button
                                    size="small"
                                    startIcon={<AddIcon />}
                                    onClick={() => {
                                        markEdited();
                                        setLines((prev) => [...prev, ""]);
                                    }}
                                >
                                    {t("add_line")}
                                </Button>
                            </Box>
                        </Stack>
                    ) : (
                        <TextField
                            fullWidth
                            multiline
                            minRows={2}
                            maxRows={10}
                            value={text}
                            placeholder={t("suggestion_placeholder")}
                            inputProps={{ "aria-label": t("your_suggestion") }}
                            onChange={(e) => {
                                markEdited();
                                setText(e.target.value);
                            }}
                            onKeyDown={onKeyDown}
                        />
                    )}

                    <Stack direction="row" alignItems="center" justifyContent="flex-end" gap={1.5} sx={{ mt: 1.5 }}>
                        {status.state === "error" && (
                            <Typography variant="body2" color="error" sx={{ mr: "auto" }}>
                                {status.message}
                            </Typography>
                        )}
                        {status.state === "sent" ? (
                            <Button variant="outlined" color="success" startIcon={<CheckIcon />} disabled sx={{ "&.Mui-disabled": { color: "success.main", borderColor: "success.main" } }}>
                                {t("sent_for_review")}
                            </Button>
                        ) : (
                            <Tooltip title={canSend ? "Ctrl+Enter" : ""}>
                                <span>
                                    <Button
                                        variant="contained"
                                        onClick={send}
                                        disabled={status.state === "sending"}
                                        startIcon={
                                            status.state === "sending" ? (
                                                <CircularProgress size={16} color="inherit" />
                                            ) : canSend ? null : (
                                                <GitHubIcon />
                                            )
                                        }
                                    >
                                        {canSend ? t("submit_suggestion") : t("login_to_send")}
                                    </Button>
                                </span>
                            </Tooltip>
                        )}
                    </Stack>
                </Box>
            </Box>
        </Paper>
    );
}

export default function I18nContributeProject() {
    const { slug } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const { t } = useTranslation("i18n");
    const { data: user, isPending: userPending } = useCurrentUser();

    const { data: languages, isPending: langsPending, isError: langsError, error: langsErr, refetch: refetchLangs } =
        useI18nLanguages();

    const targetLang = pickLanguage(languages, searchParams.get("lang"), getSavedTargetLang());
    const sourceLang = pickLanguage(languages, searchParams.get("source"), "en_us");

    const setParam = (name, value) => {
        setSearchParams(
            (prev) => {
                const next = new URLSearchParams(prev);
                next.set(name, value);
                return next;
            },
            { replace: true }
        );
    };

    const [filterMode, setFilterMode] = useState("untranslated");

    const { data, isPending, isError, error, refetch, dataUpdatedAt, isPlaceholderData } = useQuery({
        queryKey: ["i18n-contribute-project", slug, sourceLang, targetLang],
        enabled: Boolean(slug) && Boolean(languages),
        queryFn: async () => {
            const base = `/api/i18n/projects/${encodeURIComponent(slug)}`;
            const [keysRes, srcRes, trgRes] = await Promise.all([
                axios.get(`${base}/keys`),
                axios.get(`${base}/translations`, { params: { lang: sourceLang } }),
                axios.get(`${base}/translations`, { params: { lang: targetLang } })
            ]);

            return {
                project: keysRes.data.project,
                keys: keysRes.data.keys || [],
                source: srcRes.data.translations || {},
                translations: trgRes.data.translations || {}
            };
        },
        placeholderData: (prev) => (prev?.project?.slug === slug ? prev : undefined)
    });

    const keys = useMemo(() => data?.keys || [], [data]);
    const translations = useMemo(() => data?.translations || {}, [data]);

    const untranslatedCount = keys.filter((k) => translations[k.key_name] === undefined).length;
    const totalCount = keys.length;
    const translatedCount = totalCount - untranslatedCount;
    const percent = totalCount > 0 ? Math.round((translatedCount / totalCount) * 100) : 0;

    const visibleKeys = filterMode === "untranslated"
        ? keys.filter((k) => translations[k.key_name] === undefined)
        : keys;

    // Nothing left to translate: show everything instead of an empty list.
    useEffect(() => {
        if (data && totalCount > 0 && untranslatedCount === 0) setFilterMode("all");
    }, [data, totalCount, untranslatedCount]);

    const back = { to: "/i18n", label: t("title") };

    if (langsPending || isPending) return <LoadingState minHeight="50vh" />;

    if (langsError || isError) {
        if (error?.response?.status === 404) {
            return <Navigate to={`/404?path=/i18n/${slug}`} replace />;
        }
        return (
            <>
                <PageHeader title={slug} back={back} />
                <ErrorState error={langsErr || error} onRetry={langsError ? refetchLangs : refetch} />
            </>
        );
    }

    const canSend = Boolean(user);

    return (
        <>
            <PageHeader title={data.project?.name || slug} back={back}>
                <Box sx={{ maxWidth: 420 }}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {t("percent_translated", { percent })}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={monoSx}>
                            {translatedCount}/{totalCount}
                        </Typography>
                    </Stack>
                    <LinearProgress
                        variant="determinate"
                        value={percent}
                        color={percent === 100 ? "success" : "primary"}
                        sx={{ height: 6 }}
                    />
                </Box>
            </PageHeader>

            {!userPending && !user && (
                <Alert
                    severity="info"
                    action={
                        <Button color="inherit" size="small" startIcon={<GitHubIcon />} onClick={startLogin}>
                            {t("login")}
                        </Button>
                    }
                >
                    {t("must_login_to_suggest")}
                </Alert>
            )}

            <Stack
                direction={{ xs: "column", md: "row" }}
                alignItems={{ xs: "stretch", md: "center" }}
                justifyContent="space-between"
                gap={2}
            >
                <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "stretch", sm: "center" }} gap={1}>
                    <LanguageSelect
                        label={t("source_language")}
                        languages={languages}
                        value={sourceLang}
                        onChange={(code) => setParam("source", code)}
                        sx={{ flex: 1, minWidth: 0, width: { sm: 220 } }}
                    />
                    <ArrowForwardIcon sx={{ color: "text.secondary", flexShrink: 0, alignSelf: "center", transform: { xs: "rotate(90deg)", sm: "none" } }} />
                    <LanguageSelect
                        label={t("target_language")}
                        languages={languages}
                        value={targetLang}
                        onChange={(code) => {
                            saveTargetLang(code);
                            setParam("lang", code);
                        }}
                        sx={{ flex: 1, minWidth: 0, width: { sm: 220 } }}
                    />
                </Stack>

                <ToggleButtonGroup
                    size="small"
                    exclusive
                    value={filterMode}
                    onChange={(_e, val) => val && setFilterMode(val)}
                    sx={{ alignSelf: { xs: "flex-start", md: "auto" } }}
                >
                    <ToggleButton value="untranslated">
                        {t("filter_untranslated", { count: untranslatedCount })}
                    </ToggleButton>
                    <ToggleButton value="all">
                        {t("filter_all", { count: totalCount })}
                    </ToggleButton>
                </ToggleButtonGroup>
            </Stack>

            {visibleKeys.length === 0 ? (
                <EmptyState title={totalCount === 0 ? t("no_keys_for_project") : t("all_keys_translated")} />
            ) : (
                <Stack
                    gap={2}
                    aria-busy={isPlaceholderData}
                    sx={{
                        transition: "opacity .15s",
                        ...(isPlaceholderData && { opacity: 0.5, pointerEvents: "none" })
                    }}
                >
                    {visibleKeys.map((k) => (
                        <SuggestionCard
                            key={`${k.id}-${dataUpdatedAt}`}
                            slug={slug}
                            keyRow={k}
                            sourceValue={data.source[k.key_name]}
                            targetValue={translations[k.key_name]}
                            targetLang={targetLang}
                            canSend={canSend}
                        />
                    ))}
                </Stack>
            )}
        </>
    );
}
