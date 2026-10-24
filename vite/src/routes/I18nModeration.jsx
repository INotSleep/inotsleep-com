import { useState } from "react";
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    IconButton,
    Paper,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Typography
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import GitHubIcon from "@mui/icons-material/GitHub";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "../components/ui.jsx";
import { startLogin } from "../lib/auth.js";
import { useToast } from "../lib/toast.js";
import { errorMessage, monoSx } from "../lib/utils.js";
import { languageFlag, languageName } from "../lib/languages.js";
import "flag-icons/css/flag-icons.min.css";

const PAGE_SIZE = 30;

function SuggestedValue({ value }) {
    const { t } = useTranslation("i18n");

    if (value == null || (Array.isArray(value) && value.length === 0)) {
        return (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                {t("mod_value_empty")}
            </Typography>
        );
    }
    if (Array.isArray(value)) {
        return (
            <Box component="ol" sx={{ m: 0, pl: 2.5 }}>
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
            {String(value)}
        </Typography>
    );
}

export default function I18nModeration() {
    const { t } = useTranslation("i18n");
    const toast = useToast();
    const queryClient = useQueryClient();

    const [statusFilter, setStatusFilter] = useState("pending");
    const [page, setPage] = useState(0);

    const { data: suggestions = [], isPending, isError, error, isFetching, refetch } = useQuery({
        queryKey: ["i18n-moderation", statusFilter, page],
        queryFn: async () => {
            const res = await axios.get("/api/i18n/moderation/suggestions", {
                params: { status: statusFilter, limit: PAGE_SIZE, offset: page * PAGE_SIZE }
            });
            return Array.isArray(res.data) ? res.data : [];
        },
        staleTime: 5_000
    });

    const reviewMutation = useMutation({
        mutationFn: ({ id, action }) => axios.post(`/api/i18n/moderation/suggestions/${id}/${action}`),
        onSuccess: (_res, { action, suggestion }) => {
            queryClient.setQueryData(["i18n-moderation", statusFilter, page], (prev) =>
                Array.isArray(prev) ? prev.filter((s) => s.id !== suggestion.id) : prev
            );
            queryClient.invalidateQueries({ queryKey: ["i18n-moderation"] });
            queryClient.invalidateQueries({ queryKey: ["i18n-progress"] });
            toast(t(action === "approve" ? "mod_approved_toast" : "mod_rejected_toast", { key: suggestion.key_name }));
        },
        onError: (e) => toast(errorMessage(e, t("generic_error")), "error")
    });

    const review = (suggestion, action) => reviewMutation.mutate({ id: suggestion.id, action, suggestion });

    const back = { to: "/i18n", label: t("title") };
    const status = error?.response?.status;

    const header = (
        <PageHeader
            title={t("mod_title")}
            back={back}
            actions={
                !isError && (
                    <Tooltip title={t("refresh")}>
                        <span>
                            <IconButton onClick={() => refetch()} disabled={isFetching} aria-label={t("refresh")}>
                                <RefreshIcon />
                            </IconButton>
                        </span>
                    </Tooltip>
                )
            }
        />
    );

    if (isError && (status === 401 || status === 403)) {
        return (
            <>
                {header}
                <EmptyState
                    title={status === 401 ? t("mod_auth_required") : t("mod_forbidden")}
                    action={
                        status === 401 && (
                            <Button variant="contained" startIcon={<GitHubIcon />} onClick={startLogin}>
                                {t("login")}
                            </Button>
                        )
                    }
                />
            </>
        );
    }

    const hasNext = suggestions.length === PAGE_SIZE;
    const isPendingTab = statusFilter === "pending";

    return (
        <>
            {header}

            <ToggleButtonGroup
                size="small"
                exclusive
                value={statusFilter}
                onChange={(_e, value) => {
                    if (!value) return;
                    setStatusFilter(value);
                    setPage(0);
                }}
                sx={{ alignSelf: "flex-start" }}
            >
                <ToggleButton value="pending">{t("mod_tab_pending")}</ToggleButton>
                <ToggleButton value="approved">{t("mod_tab_approved")}</ToggleButton>
                <ToggleButton value="rejected">{t("mod_tab_rejected")}</ToggleButton>
            </ToggleButtonGroup>

            {isPending ? (
                <LoadingState />
            ) : isError ? (
                <ErrorState error={error} onRetry={refetch} />
            ) : suggestions.length === 0 ? (
                <EmptyState title={isPendingTab ? t("mod_no_pending") : t("mod_no_suggestions")} />
            ) : (
                <Stack gap={2}>
                    {suggestions.map((s) => {
                        const busy = reviewMutation.isPending && reviewMutation.variables?.id === s.id;
                        const busyAction = busy ? reviewMutation.variables.action : null;

                        return (
                            <Paper key={s.id} sx={{ p: { xs: 2, md: 2.5 }, opacity: busy ? 0.7 : 1, transition: "opacity .15s" }}>
                                <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                                    <Typography variant="subtitle2">
                                        {s.project_name || s.project_slug || t("mod_unknown_project")}
                                    </Typography>
                                    <Chip
                                        size="small"
                                        variant="outlined"
                                        icon={<Box component="span" className={`fi fi-${languageFlag(s.language)}`} sx={{ borderRadius: "2px", ml: "8px !important" }} />}
                                        label={languageName(s.language)}
                                        title={s.language}
                                    />
                                    <Typography variant="caption" color="text.secondary" sx={{ ml: "auto" }}>
                                        {s.created_at ? new Date(s.created_at).toLocaleString() : ""}
                                    </Typography>
                                </Stack>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ ...monoSx, mt: 1, wordBreak: "break-all" }}
                                >
                                    {s.key_name}
                                </Typography>

                                <Box sx={{ mt: 1.5, p: 1.5, borderRadius: 2.5, bgcolor: "action.hover" }}>
                                    <SuggestedValue value={s.value} />
                                </Box>

                                {isPendingTab && (
                                    <Stack direction="row" gap={1} justifyContent="flex-end" sx={{ mt: 2 }}>
                                        <Button
                                            variant="outlined"
                                            startIcon={busyAction === "reject" ? <CircularProgress size={16} color="inherit" /> : <CloseIcon />}
                                            onClick={() => review(s, "reject")}
                                            disabled={busy}
                                            sx={{ "&:hover": { color: "error.main", borderColor: "error.main" } }}
                                        >
                                            {t("mod_reject")}
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="success"
                                            startIcon={busyAction === "approve" ? <CircularProgress size={16} color="inherit" /> : <CheckIcon />}
                                            onClick={() => review(s, "approve")}
                                            disabled={busy}
                                        >
                                            {t("mod_approve")}
                                        </Button>
                                    </Stack>
                                )}
                            </Paper>
                        );
                    })}
                </Stack>
            )}

            {(page > 0 || hasNext) && (
                <Stack direction="row" alignItems="center" justifyContent="center" gap={2}>
                    <Button variant="outlined" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
                        {t("mod_prev_page")}
                    </Button>
                    <Typography variant="body2" color="text.secondary">
                        {t("page_n", { page: page + 1 })}
                    </Typography>
                    <Button variant="outlined" onClick={() => setPage((p) => p + 1)} disabled={!hasNext}>
                        {t("mod_next_page")}
                    </Button>
                </Stack>
            )}
        </>
    );
}
