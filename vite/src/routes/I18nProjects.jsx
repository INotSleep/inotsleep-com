import {
    Box,
    Button,
    Paper,
    Stack,
    Typography,
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
            const i18nProjectsRes = await axios.get("/api/i18n/projects");
            const projectsRes = await axios.get("/api/projects", {
                params: { lang: i18n.language }
            });

            const i18nProjects = Array.isArray(i18nProjectsRes.data)
                ? i18nProjectsRes.data
                : [];

            const rawProjects = Array.isArray(projectsRes.data)
                ? projectsRes.data
                : [];

            const projectsMap = {};
            for (const p of rawProjects) {
                if (p && p.id != null) {
                    projectsMap[p.id] = p;
                }
            }

            return i18nProjects.map((p) => {
                const extra = projectsMap[p.slug] || {};
                return { ...p, ...extra };
            });
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
                    "Error"
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
                    "Error"
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
            <Box sx={{ p: 3 }}>
                <Typography>{t("loading_projects")}</Typography>
            </Box>
        );
    }

    if (isError) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography color="error">
                    {t("loading_error")}{" "}
                    {error?.message || String(error)}
                </Typography>
            </Box>
        );
    }

    const list = Array.isArray(projects) ? projects : [];

    return (
        <>
            <Paper
                elevation={2}
                sx={{
                    width: "100%",
                    p: 3,
                    display: "flex",
                    flexDirection: "column",
                    gap: 3
                }}
            >
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                >
                    <Typography variant="h5">{t("title")}</Typography>

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

                {list.length === 0 ? (
                    <Typography textAlign="center">
                        {t("no_projects")}
                    </Typography>
                ) : (
                    list.map((project) => (
                        <Box
                            key={project.id}
                            sx={{
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: 1,
                                p: 2
                            }}
                        >
                            <Typography
                                variant="h6"
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
                                    color="text.secondary"
                                    sx={{ mb: 2 }}
                                >
                                    {project.description}
                                </Typography>
                            )}

                            <Box
                                sx={{
                                    display: "flex",
                                    gap: 1,
                                    flexWrap: "wrap"
                                }}
                            >
                                <Button
                                    variant="outlined"
                                    size="small"
                                    component={RouterLink}
                                    to={project.slug}
                                >
                                    {t("open_project")}
                                </Button>
                                {
                                    canManage &&
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        component={RouterLink}
                                        to={project.slug+"/manage"}
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
                                        to={project.slug+"/moderate"}
                                    >
                                        {t("moderate")}
                                    </Button>
                                }
                            </Box>
                        </Box>
                    ))
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
