import {
    Box,
    Button,
    Paper,
    Stack,
    Typography,
    Divider,
    Chip,
    LinearProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import axios from "axios";
import { useState } from "react";
import { itemCardSx, monoLabelSx, pagePanelSx, subtleTextSx } from "../theme/neoStyles.js";

function normalizeLangCode(code) {
    return String(code || "")
        .trim()
        .toLowerCase()
        .replace("-", "_");
}

function pickProgressLang(available, preferred) {
    const safe = Array.isArray(available) ? available : [];
    if (safe.length === 0) {
        return "en_us";
    }

    const exact = safe.find((code) => normalizeLangCode(code) === normalizeLangCode(preferred));
    if (exact) {
        return exact;
    }

    const enUs = safe.find((code) => normalizeLangCode(code) === "en_us");
    if (enUs) {
        return enUs;
    }

    const en = safe.find((code) => normalizeLangCode(code) === "en");
    if (en) {
        return en;
    }

    return safe[0];
}

function hasTranslationValue(value) {
    if (typeof value === "string") {
        return value.trim().length > 0;
    }
    if (Array.isArray(value)) {
        return value.length > 0 && value.some((item) => String(item || "").trim().length > 0);
    }
    return false;
}

export default function I18nProjects() {
    const { t, i18n } = useTranslation("i18n");
    const queryClient = useQueryClient();

    const { data: permissions } = useQuery({
        queryKey: ["permissions"],
        queryFn: async () => {
            const res = await axios.get("/api/permissions");
            return res.data || [];
        },
        retry: false
    });

    const canManage =
        Array.isArray(permissions) && permissions.includes("i18n.manage");
    const canModerate =
        Array.isArray(permissions) && permissions.includes("i18n.moderate");

    const {
        data: projects,
        isPending,
        isError,
        error,
        isFetching
    } = useQuery({
        queryKey: ["i18n-projects", i18n.language],
        queryFn: async () => {
            const [i18nProjectsRes, projectsRes, langsRes] = await Promise.all([
                axios.get("/api/i18n/projects"),
                axios.get("/api/projects", {
                    params: { lang: i18n.language }
                }),
                axios.get("/api/i18n/languages")
            ]);

            const i18nProjects = Array.isArray(i18nProjectsRes.data)
                ? i18nProjectsRes.data
                : [];

            const rawProjects = Array.isArray(projectsRes.data)
                ? projectsRes.data
                : [];

            const languages = Array.isArray(langsRes.data)
                ? langsRes.data
                      .map((it) => (typeof it === "string" ? it : it?.code))
                      .filter(Boolean)
                : [];

            const progressLang = pickProgressLang(languages, i18n.language);

            const projectsMap = {};
            for (const p of rawProjects) {
                if (p && p.id != null) {
                    projectsMap[p.id] = p;
                }
            }

            const withMeta = i18nProjects.map((p) => {
                const extra = projectsMap[p.slug] || {};
                return { ...p, ...extra, progressLang };
            });

            return await Promise.all(
                withMeta.map(async (project) => {
                    try {
                        const [keysRes, translationsRes] = await Promise.all([
                            axios.get(
                                `/api/i18n/projects/${encodeURIComponent(project.slug)}/keys`
                            ),
                            axios.get(
                                `/api/i18n/projects/${encodeURIComponent(project.slug)}/translations`,
                                { params: { lang: progressLang } }
                            )
                        ]);

                        const keys = Array.isArray(keysRes.data?.keys)
                            ? keysRes.data.keys
                            : [];
                        const translations = translationsRes.data?.translations || {};

                        const totalCount = keys.length;
                        const translatedCount = keys.reduce((acc, keyRow) => {
                            if (hasTranslationValue(translations[keyRow.key_name])) {
                                return acc + 1;
                            }
                            return acc;
                        }, 0);
                        const progressPercent =
                            totalCount > 0
                                ? Math.round((translatedCount / totalCount) * 100)
                                : 0;

                        return {
                            ...project,
                            totalCount,
                            translatedCount,
                            progressPercent
                        };
                    } catch {
                        return {
                            ...project,
                            totalCount: 0,
                            translatedCount: 0,
                            progressPercent: 0
                        };
                    }
                })
            );
        }
    });

    const [langDialogOpen, setLangDialogOpen] = useState(false);
    const [langCode, setLangCode] = useState("");
    const [langError, setLangError] = useState("");

    const addLanguageMutation = useMutation({
        mutationFn: async ({ code }) => {
            return axios.post("/api/i18n/languages", { code });
        },
        onSuccess: () => {
            setLangDialogOpen(false);
            setLangCode("");
            setLangError("");
            // на всякий случай инвалидируем
            queryClient.invalidateQueries({ queryKey: ["i18n-projects"] });
        },
        onError: (e) => {
            setLangError(
                (e && e.response && e.response.data && e.response.data.error) ||
                    e.message ||
                    t("generic_error")
            );
        }
    });

    const handleOpenAddLanguage = () => {
        setLangDialogOpen(true);
        setLangError("");
    };

    const handleCloseAddLanguage = () => {
        if (addLanguageMutation.isPending) return;
        setLangDialogOpen(false);
        setLangError("");
    };

    const handleSubmitAddLanguage = () => {
        const code = langCode.trim();
        if (!code) {
            setLangError(t("add_lang_empty"));
            return;
        }
        addLanguageMutation.mutate({ code });
    };

    const [projectDialogOpen, setProjectDialogOpen] = useState(false);
    const [projectSlug, setProjectSlug] = useState("");
    const [projectName, setProjectName] = useState("");
    const [projectError, setProjectError] = useState("");

    const addProjectMutation = useMutation({
        mutationFn: async ({ slug, name }) => {
            return axios.post("/api/i18n/projects", { slug, name });
        },
        onSuccess: () => {
            setProjectDialogOpen(false);
            setProjectSlug("");
            setProjectName("");
            setProjectError("");
            queryClient.invalidateQueries({ queryKey: ["i18n-projects"] });
        },
        onError: (e) => {
            setProjectError(
                (e && e.response && e.response.data && e.response.data.error) ||
                    e.message ||
                    t("generic_error")
            );
        }
    });

    const handleOpenAddProject = () => {
        setProjectDialogOpen(true);
        setProjectError("");
    };

    const handleCloseAddProject = () => {
        if (addProjectMutation.isPending) return;
        setProjectDialogOpen(false);
        setProjectError("");
    };

    const handleSubmitAddProject = () => {
        const slug = projectSlug.trim();
        const name = projectName.trim();

        if (!slug) {
            setProjectError(t("add_project_slug_required"));
            return;
        }
        if (!name) {
            setProjectError(t("add_project_name_required"));
            return;
        }

        addProjectMutation.mutate({ slug, name });
    };


    if (isPending) {
        return (
            <Paper sx={pagePanelSx}>
                <Typography>{t("loading_projects")}</Typography>
            </Paper>
        );
    }

    if (isError) {
        return (
            <Paper sx={pagePanelSx}>
                <Typography color="error">
                    {t("loading_error")}{" "}
                    {error?.message || String(error)}
                </Typography>
            </Paper>
        );
    }

    const list = Array.isArray(projects) ? projects : [];

    return (
        <>
            <Paper
                sx={pagePanelSx}
            >
                <Box>
                    <Typography variant="caption" sx={{ ...monoLabelSx, color: "primary.main" }}>
                        {t("breadcrumb_hub")}
                    </Typography>
                    <Typography variant="h1" sx={{ mt: 1 }}>
                        {t("title")}
                    </Typography>
                    <Typography variant="body1" sx={{ ...subtleTextSx, mt: 0.8, maxWidth: 860 }}>
                        {t("hub_intro")}
                    </Typography>
                </Box>

                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    flexWrap="wrap"
                    gap={1.5}
                >
                    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ rowGap: 1 }}>
                        <Chip
                            size="small"
                            label={t("projects_count", { count: list.length })}
                            variant="outlined"
                        />
                    </Stack>

                    <Stack direction="row" spacing={2} alignItems="center">
                        {isFetching && (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontStyle: "italic" }}
                            >
                                {t("updating_projects")}
                            </Typography>
                        )}

                        {canManage && (
                            <>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={handleOpenAddLanguage}
                                >
                                    {t("add_language")}
                                </Button>
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={handleOpenAddProject}
                                >
                                    {t("add_project")}
                                </Button>
                            </>
                        )}
                    </Stack>
                </Stack>

                <Divider />

                {list.length === 0 ? (
                    <Typography textAlign="center">
                        {t("no_projects")}
                    </Typography>
                ) : (
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
                            gap: 1.8
                        }}
                    >
                    {list.map((project) => (
                        <Box
                            key={project.id}
                            sx={itemCardSx}
                        >
                            <Typography
                                variant="h5"
                                sx={{ mb: 1 }}
                                style={{
                                    color: "inherit",
                                    textDecoration: "none"
                                }}
                            >
                                {project.name}
                            </Typography>

                            {project.description && (
                                <Typography
                                    variant="body2"
                                    sx={{ ...subtleTextSx, mb: 2 }}
                                >
                                    {project.description}
                                </Typography>
                            )}

                            <Box sx={{ mb: 1.4 }}>
                                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.7 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        {t("translation_progress", {
                                            lang: project.progressLang || "en_us"
                                        })}
                                    </Typography>
                                    <Typography variant="caption" sx={{ ...monoLabelSx, color: "primary.main" }}>
                                        {project.translatedCount ?? 0}/{project.totalCount ?? 0}
                                    </Typography>
                                </Stack>
                                <LinearProgress
                                    variant="determinate"
                                    value={project.progressPercent ?? 0}
                                    sx={{
                                        height: 8,
                                        borderRadius: 999,
                                        bgcolor: "rgba(64,72,93,0.45)"
                                    }}
                                />
                            </Box>

                            <Box
                                sx={{
                                    display: "flex",
                                    gap: 1,
                                    flexWrap: "wrap",
                                    rowGap: 1
                                }}
                            >
                                <Button
                                    variant="contained"
                                    size="small"
                                    component={RouterLink}
                                    to={`${project.slug}?lang=${encodeURIComponent(project.progressLang || "en_us")}`}
                                >
                                    {t("open_project")}
                                </Button>
                                {
                                    canManage &&
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        component={RouterLink}
                                        to={`${project.slug}/manage?lang=${encodeURIComponent(project.progressLang || "en_us")}`}
                                    >
                                        {t("manage")}
                                    </Button>
                                }
                                {
                                    canModerate &&
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        component={RouterLink}
                                        to={`${project.slug}/moderate`}
                                    >
                                        {t("moderate")}
                                    </Button>
                                }
                            </Box>
                        </Box>
                    ))}
                    </Box>
                )}
            </Paper>

            {/* Диалог добавления языка */}
            <Dialog open={langDialogOpen} onClose={handleCloseAddLanguage} fullWidth>
                <DialogTitle>{t("add_language_title")}</DialogTitle>
                <DialogContent sx={{ pt: 1 }}>
                    <TextField
                        label={t("language_code")}
                        fullWidth
                        value={langCode}
                        onChange={(e) => setLangCode(e.target.value)}
                        sx={{ mt: 1 }}
                    />
                    {langError && (
                        <Typography
                            variant="caption"
                            color="error"
                            sx={{ mt: 1, display: "block" }}
                        >
                            {langError}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAddLanguage}>
                        {t("cancel")}
                    </Button>
                    <Button
                        onClick={handleSubmitAddLanguage}
                        disabled={addLanguageMutation.isPending}
                    >
                        {t("save")}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Диалог добавления проекта */}
            <Dialog
                open={projectDialogOpen}
                onClose={handleCloseAddProject}
                fullWidth
            >
                <DialogTitle>{t("add_project_title")}</DialogTitle>
                <DialogContent sx={{ pt: 1 }}>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            label={t("project_slug")}
                            fullWidth
                            value={projectSlug}
                            onChange={(e) => setProjectSlug(e.target.value)}
                        />
                        <TextField
                            label={t("project_name")}
                            fullWidth
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            placeholder={t("project_name_placeholder")}
                        />
                    </Stack>

                    {projectError && (
                        <Typography
                            variant="caption"
                            color="error"
                            sx={{ mt: 1, display: "block" }}
                        >
                            {projectError}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAddProject}>
                        {t("cancel")}
                    </Button>
                    <Button
                        onClick={handleSubmitAddProject}
                        disabled={addProjectMutation.isPending}
                    >
                        {t("save")}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
