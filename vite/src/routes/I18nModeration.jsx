import { useState } from "react";
import {
    Box,
    Paper,
    Stack,
    Typography,
    CircularProgress,
    Chip,
    Button,
    Divider,
    ToggleButtonGroup,
    ToggleButton,
    IconButton
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import axios from "axios";

const PAGE_SIZE = 30;

export default function I18nModeration() {
    const { t } = useTranslation("i18n");
    const queryClient = useQueryClient();

    const [statusFilter, setStatusFilter] = useState("pending"); // pending | approved | rejected
    const [page, setPage] = useState(0);

    const {
        data: suggestions,
        isPending,
        isError,
        error,
        isFetching
    } = useQuery({
        queryKey: ["i18n-moderation", statusFilter, page],
        queryFn: async () => {
            const res = await axios.get("/api/i18n/moderation/suggestions", {
                params: {
                    status: statusFilter,
                    limit: PAGE_SIZE,
                    offset: page * PAGE_SIZE
                }
            });

            return Array.isArray(res.data) ? res.data : [];
        },
        staleTime: 5_000
    });

    const approveMutation = useMutation({
        mutationFn: async (id) => {
            await axios.post(
                `/api/i18n/moderation/suggestions/${id}/approve`
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["i18n-moderation"]
            });
        }
    });

    const rejectMutation = useMutation({
        mutationFn: async (id) => {
            await axios.post(
                `/api/i18n/moderation/suggestions/${id}/reject`
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["i18n-moderation"]
            });
        }
    });

    const handleChangeStatusFilter = (_e, value) => {
        if (!value) return;
        setStatusFilter(value);
        setPage(0);
    };

    const handleRefresh = () => {
        queryClient.invalidateQueries({
            queryKey: ["i18n-moderation"]
        });
    };

    const handlePrevPage = () => {
        setPage((p) => Math.max(0, p - 1));
    };

    const handleNextPage = () => {
        if (Array.isArray(suggestions) && suggestions.length === PAGE_SIZE) {
            setPage((p) => p + 1);
        }
    };

    const renderStatusChip = (status) => {
        if (status === 0 || status === "pending") {
            return (
                <Chip
                    size="small"
                    label={t("mod_status_pending")}
                    color="warning"
                    variant="outlined"
                />
            );
        }
        if (status === 1 || status === "approved") {
            return (
                <Chip
                    size="small"
                    label={t("mod_status_approved")}
                    color="success"
                    variant="outlined"
                />
            );
        }
        if (status === 2 || status === "rejected") {
            return (
                <Chip
                    size="small"
                    label={t("mod_status_rejected")}
                    color="error"
                    variant="outlined"
                />
            );
        }
        return (
            <Chip
                size="small"
                label={String(status)}
                variant="outlined"
            />
        );
    };

    const renderValue = (parsed) => {
        if (parsed == null) {
            return (
                <Typography
                    variant="body2"
                    sx={{ opacity: 0.6, fontStyle: "italic" }}
                >
                    {t("mod_value_empty")}
                </Typography>
            );
        }

        if (Array.isArray(parsed)) {
            if (parsed.length === 0) {
                return (
                    <Typography
                        variant="body2"
                        sx={{ opacity: 0.6, fontStyle: "italic" }}
                    >
                        {t("mod_value_empty_list")}
                    </Typography>
                );
            }
            return (
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
                    {parsed.map((line, idx) => (
                        <li key={idx}>{String(line)}</li>
                    ))}
                </Box>
            );
        }

        if (typeof parsed === "string") {
            return (
                <Typography
                    variant="body2"
                    sx={{ whiteSpace: "pre-wrap" }}
                >
                    {parsed}
                </Typography>
            );
        }

        // fallback — как обычный текст
        return (
            <Typography
                variant="body2"
                sx={{ whiteSpace: "pre-wrap" }}
            >
                {String(raw)}
            </Typography>
        );
    };

    // ------ состояния загрузки / ошибок ------

    if (isPending) {
        return (
            <Box sx={{ p: 3, display: "flex", gap: 2, alignItems: "center" }}>
                <CircularProgress size={20} />
                <Typography>{t("mod_loading")}</Typography>
            </Box>
        );
    }

    if (isError) {
        const axiosError = error;
        const status = axiosError?.response?.status;

        if (status === 403) {
            return (
                <Box sx={{ p: 3 }}>
                    <Typography color="error">
                        {t("mod_forbidden")}
                    </Typography>
                </Box>
            );
        }

        if (status === 401) {
            return (
                <Box sx={{ p: 3 }}>
                    <Typography color="error">
                        {t("mod_auth_required")}
                    </Typography>
                </Box>
            );
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

    const list = Array.isArray(suggestions) ? suggestions : [];
    const hasNext = list.length === PAGE_SIZE;
    const isPendingStatus = statusFilter === "pending";

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
            {/* Заголовок + фильтры */}
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={2}
                flexWrap="wrap"
            >
                <Box>
                    <Typography variant="h5" sx={{ mb: 0.5 }}>
                        {t("mod_title")}
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{ maxWidth: 600, opacity: 0.8 }}
                    >
                        {t("mod_intro")}
                    </Typography>
                </Box>

                <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    flexWrap="wrap"
                >
                    <ToggleButtonGroup
                        size="small"
                        exclusive
                        value={statusFilter}
                        onChange={handleChangeStatusFilter}
                    >
                        <ToggleButton value="pending">
                            {t("mod_tab_pending")}
                        </ToggleButton>
                        <ToggleButton value="approved">
                            {t("mod_tab_approved")}
                        </ToggleButton>
                        <ToggleButton value="rejected">
                            {t("mod_tab_rejected")}
                        </ToggleButton>
                    </ToggleButtonGroup>

                    <IconButton
                        size="small"
                        onClick={handleRefresh}
                        disabled={isFetching}
                    >
                        <RefreshIcon fontSize="small" />
                    </IconButton>
                </Stack>
            </Stack>

            <Divider />

            {/* Навигация по страницам */}
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 1 }}
            >
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {t("mod_page_info", {
                        page: page + 1,
                        count: list.length
                    })}
                </Typography>

                <Stack direction="row" spacing={1}>
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={handlePrevPage}
                        disabled={page === 0}
                    >
                        {t("mod_prev_page")}
                    </Button>
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={handleNextPage}
                        disabled={!hasNext}
                    >
                        {t("mod_next_page")}
                    </Button>
                </Stack>
            </Stack>

            {/* Список предложений */}
            <Box sx={{ flex: 1 }}>
                {list.length === 0 ? (
                    <Typography
                        variant="body2"
                        sx={{ opacity: 0.8, mt: 1 }}
                    >
                        {statusFilter === "pending"
                            ? t("mod_no_pending")
                            : t("mod_no_suggestions")}
                    </Typography>
                ) : (
                    <Stack spacing={1.5}>
                        {list.map((s) => (
                            <Box
                                key={s.id}
                                sx={{
                                    borderRadius: 1,
                                    border: "1px solid rgba(255,255,255,0.16)",
                                    p: 1.5
                                }}
                            >
                                {/* Верхняя строка: проект + язык + статус */}
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    justifyContent="space-between"
                                    spacing={1}
                                >
                                    <Box>
                                        <Typography variant="subtitle1">
                                            {s.project_name ||
                                                s.project_slug ||
                                                t("mod_unknown_project")}
                                        </Typography>
                                        {s.project_slug && (
                                            <Typography
                                                variant="caption"
                                                sx={{ opacity: 0.7 }}
                                            >
                                                {t("mod_project_slug", {
                                                    slug: s.project_slug
                                                })}
                                            </Typography>
                                        )}
                                    </Box>

                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        alignItems="center"
                                    >
                                        <Chip
                                            size="small"
                                            label={s.language}
                                            variant="outlined"
                                        />
                                        {renderStatusChip(s.status)}
                                    </Stack>
                                </Stack>

                                {/* Ключ */}
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        mt: 1,
                                        fontFamily:
                                            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
                                    }}
                                >
                                    {s.key_name}
                                </Typography>

                                {/* Автор / даты */}
                                <Typography
                                    variant="caption"
                                    sx={{ mt: 0.5, opacity: 0.8 }}
                                >
                                    {t("mod_meta", {
                                        author:
                                            s.author ||
                                            t("mod_author_unknown"),
                                        created: s.created_at
                                            ? new Date(
                                                  s.created_at
                                              ).toLocaleString()
                                            : "–",
                                        reviewed: s.reviewed_at
                                            ? new Date(
                                                  s.reviewed_at
                                              ).toLocaleString()
                                            : "–"
                                    })}
                                </Typography>

                                {/* Значение */}
                                <Box sx={{ mt: 1.5 }}>
                                    <Typography
                                        variant="caption"
                                        sx={{ opacity: 0.7 }}
                                    >
                                        {t("mod_suggested_value")}
                                    </Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        {renderValue(s.value)}
                                    </Box>
                                </Box>

                                {/* Кнопки действий только для pending */}
                                {isPendingStatus && (
                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        sx={{ mt: 1.5, justifyContent: "flex-end" }}
                                    >
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            color="error"
                                            startIcon={
                                                <CloseIcon fontSize="small" />
                                            }
                                            onClick={() =>
                                                rejectMutation.mutate(s.id)
                                            }
                                            disabled={
                                                rejectMutation.isPending ||
                                                approveMutation.isPending
                                            }
                                        >
                                            {t("mod_reject")}
                                        </Button>
                                        <Button
                                            size="small"
                                            variant="contained"
                                            color="success"
                                            startIcon={
                                                <CheckIcon fontSize="small" />
                                            }
                                            onClick={() =>
                                                approveMutation.mutate(s.id)
                                            }
                                            disabled={
                                                approveMutation.isPending ||
                                                rejectMutation.isPending
                                            }
                                        >
                                            {t("mod_approve")}
                                        </Button>
                                    </Stack>
                                )}
                            </Box>
                        ))}
                    </Stack>
                )}
            </Box>
        </Paper>
    );
}
