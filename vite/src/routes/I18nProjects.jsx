import { useState } from "react";
import {
    Box,
    Button,
    LinearProgress,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import LinkCard from "../components/LinkCard.jsx";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import axios from "axios";
import LanguageSelect from "../components/LanguageSelect.jsx";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "../components/ui.jsx";
import { FormDialog } from "../components/dialogs.jsx";
import { usePermissions } from "../lib/auth.js";
import { useToast } from "../lib/toast.js";
import { cardActionsSx, errorMessage, monoSx } from "../lib/utils.js";
import {
    getSavedTargetLang,
    pickLanguage,
    saveTargetLang,
    useI18nLanguages,
    useProjects
} from "../lib/queries.js";
import { useDocumentTitle, withSite } from "../lib/title.js";

function I18nProjectCard({ project, lang, canManage }) {
    const { t } = useTranslation("i18n");
    const percent = project.progressPercent ?? 0;
    const query = `?lang=${encodeURIComponent(lang)}`;

    return (
        <LinkCard to={`${project.slug}${query}`} title={project.name}>
            {project.description && (
                <Typography color="text.secondary">{project.description}</Typography>
            )}

            <Box>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {t("percent_translated", { percent })}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={monoSx}>
                        {project.translatedCount ?? 0}/{project.totalCount ?? 0}
                    </Typography>
                </Stack>
                <LinearProgress
                    variant="determinate"
                    value={percent}
                    color={percent === 100 ? "success" : "primary"}
                    sx={{ height: 6 }}
                />
            </Box>

            {canManage && (
                <Box sx={cardActionsSx}>
                    <Button
                        component={RouterLink}
                        to={`${project.slug}/manage${query}`}
                        size="small"
                        variant="outlined"
                    >
                        {t("manage")}
                    </Button>
                </Box>
            )}
        </LinkCard>
    );
}

export default function I18nProjects() {
    const { t } = useTranslation("i18n");
    useDocumentTitle(withSite(t("title")));
    const toast = useToast();
    const queryClient = useQueryClient();
    const { canManage, canModerate } = usePermissions();

    const { data: languages } = useI18nLanguages();
    const { data: siteProjects = [] } = useProjects();
    const [chosenLang, setChosenLang] = useState(getSavedTargetLang);
    const lang = pickLanguage(languages, chosenLang);

    const progressQuery = useQuery({
        queryKey: ["i18n-progress", lang],
        enabled: Boolean(languages),
        queryFn: async () => {
            const res = await axios.get("/api/i18n/projects/progress", { params: { lang } });
            return Array.isArray(res.data) ? res.data : [];
        },
        placeholderData: (prev) => prev
    });

    const projects = (progressQuery.data || []).map((project) => {
        const extra = siteProjects.find((p) => p.id === project.slug || String(p.id) === String(project.id));
        return { ...project, description: extra?.description };
    });

    const handleLangChange = (code) => {
        setChosenLang(code);
        saveTargetLang(code);
    };

    // ---- add language ----
    const [langDialogOpen, setLangDialogOpen] = useState(false);
    const [langCode, setLangCode] = useState("");
    const [langError, setLangError] = useState("");

    const addLanguageMutation = useMutation({
        mutationFn: (code) => axios.post("/api/i18n/languages", { code }),
        onSuccess: (_res, code) => {
            setLangDialogOpen(false);
            setLangCode("");
            queryClient.invalidateQueries({ queryKey: ["i18n-languages"] });
            toast(t("language_added", { code }));
        },
        onError: (e) => setLangError(errorMessage(e, t("generic_error")))
    });

    const submitLanguage = () => {
        const code = langCode.trim();
        if (!code) {
            setLangError(t("add_lang_empty"));
            return;
        }
        addLanguageMutation.mutate(code);
    };

    // ---- add project ----
    const [projectDialogOpen, setProjectDialogOpen] = useState(false);
    const [projectSlug, setProjectSlug] = useState("");
    const [projectName, setProjectName] = useState("");
    const [projectErrors, setProjectErrors] = useState({});

    const addProjectMutation = useMutation({
        mutationFn: ({ slug, name }) => axios.post("/api/i18n/projects", { slug, name }),
        onSuccess: (_res, { name }) => {
            setProjectDialogOpen(false);
            setProjectSlug("");
            setProjectName("");
            queryClient.invalidateQueries({ queryKey: ["i18n-progress"] });
            toast(t("project_added", { name }));
        },
        onError: (e) => setProjectErrors({ form: errorMessage(e, t("generic_error")) })
    });

    const submitProject = () => {
        const slug = projectSlug.trim();
        const name = projectName.trim();
        const errors = {};
        if (!slug) errors.slug = t("add_project_slug_required");
        if (!name) errors.name = t("add_project_name_required");
        setProjectErrors(errors);
        if (Object.keys(errors).length === 0) {
            addProjectMutation.mutate({ slug, name });
        }
    };

    const actions = (
        <>
            {canModerate && (
                <Button component={RouterLink} to="moderation" variant="outlined">
                    {t("moderation")}
                </Button>
            )}
            {canManage && (
                <>
                    <Button
                        variant="outlined"
                        onClick={() => {
                            setLangError("");
                            setLangDialogOpen(true);
                        }}
                    >
                        {t("add_language")}
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => {
                            setProjectErrors({});
                            setProjectDialogOpen(true);
                        }}
                    >
                        {t("add_project")}
                    </Button>
                </>
            )}
        </>
    );

    return (
        <>
            <PageHeader title={t("title")} actions={canManage || canModerate ? actions : null}>
                {languages?.length > 0 && (
                    <LanguageSelect
                        label={t("your_language")}
                        languages={languages}
                        value={lang}
                        onChange={handleLangChange}
                        sx={{ width: 240, mt: 1 }}
                    />
                )}
            </PageHeader>

            {progressQuery.isPending ? (
                <LoadingState />
            ) : progressQuery.isError ? (
                <ErrorState error={progressQuery.error} onRetry={progressQuery.refetch} />
            ) : projects.length === 0 ? (
                <EmptyState title={t("no_projects")} />
            ) : (
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
                        gap: 2
                    }}
                >
                    {projects.map((project) => (
                        <I18nProjectCard
                            key={project.id}
                            project={project}
                            lang={lang}
                            canManage={canManage}
                        />
                    ))}
                </Box>
            )}

            <FormDialog
                open={langDialogOpen}
                title={t("add_language")}
                onClose={() => setLangDialogOpen(false)}
                onSubmit={submitLanguage}
                submitLabel={t("add")}
                pending={addLanguageMutation.isPending}
            >
                <TextField
                    autoFocus
                    label={t("language_code")}
                    placeholder="de_de"
                    value={langCode}
                    onChange={(e) => {
                        setLangCode(e.target.value);
                        setLangError("");
                    }}
                    error={Boolean(langError)}
                    helperText={langError || " "}
                    InputProps={{ sx: monoSx }}
                />
            </FormDialog>

            <FormDialog
                open={projectDialogOpen}
                title={t("add_project")}
                onClose={() => setProjectDialogOpen(false)}
                onSubmit={submitProject}
                submitLabel={t("add")}
                pending={addProjectMutation.isPending}
            >
                <TextField
                    autoFocus
                    label={t("project_slug")}
                    placeholder="my-plugin"
                    value={projectSlug}
                    onChange={(e) => setProjectSlug(e.target.value)}
                    error={Boolean(projectErrors.slug)}
                    helperText={projectErrors.slug || " "}
                    InputProps={{ sx: monoSx }}
                />
                <TextField
                    label={t("project_name")}
                    placeholder="My Plugin"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    error={Boolean(projectErrors.name || projectErrors.form)}
                    helperText={projectErrors.name || projectErrors.form || " "}
                />
            </FormDialog>
        </>
    );
}
