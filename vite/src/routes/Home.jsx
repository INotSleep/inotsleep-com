import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Avatar, Box, Button, IconButton, LinearProgress, Paper, Stack, Tooltip, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import GitHubIcon from "@mui/icons-material/GitHub";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ProjectCard from "../components/ProjectCard.jsx";
import { ErrorState, LoadingState, SectionTitle } from "../components/ui.jsx";
import {
    getSavedTargetLang,
    pickLanguage,
    useI18nLanguages,
    useLatestReleases,
    useProjects
} from "../lib/queries.js";
import { languageName } from "../lib/languages.js";
import { monoSx } from "../lib/utils.js";
import { useDocumentTitle } from "../lib/title.js";

const GITHUB_URL = "https://github.com/inotsleep";
const KOFI_URL = "https://ko-fi.com/inotsleep";

function LatestReleases({ projects }) {
    const { t, i18n } = useTranslation("home");
    const { releases } = useLatestReleases(projects);

    if (releases.length === 0) return null;

    const formatDate = (iso) =>
        new Date(iso).toLocaleDateString(i18n.language, { day: "numeric", month: "short", year: "numeric" });

    return (
        <Paper sx={{ p: 1, alignSelf: "center", width: "100%" }}>
            <Typography variant="overline" color="text.secondary" component="h2" sx={{ display: "block", px: 1.5, pt: 1 }}>
                {t("latest_releases")}
            </Typography>
            {releases.map((release) => (
                <Stack
                    key={release.project.id}
                    direction="row"
                    alignItems="center"
                    gap={1.5}
                    sx={{
                        position: "relative",
                        px: 1.5,
                        py: 1.25,
                        borderRadius: 2,
                        transition: "background-color .15s",
                        "&:hover": { bgcolor: "action.hover" }
                    }}
                >
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                            component={RouterLink}
                            to={`/projects/${release.project.id}`}
                            sx={{
                                fontWeight: 600,
                                color: "text.primary",
                                textDecoration: "none",
                                "&::after": { content: '""', position: "absolute", inset: 0 }
                            }}
                        >
                            {release.project.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            <Box component="span" sx={{ ...monoSx, color: "primary.main" }}>
                                {release.tag}
                            </Box>
                            {" · "}
                            {formatDate(release.publishedAt)}
                        </Typography>
                    </Box>
                    <Tooltip title={t("open_release")}>
                        <IconButton
                            href={release.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${t("open_release")}: ${release.project.name} ${release.tag}`}
                            sx={{ position: "relative", zIndex: 1 }}
                        >
                            <FileDownloadOutlinedIcon />
                        </IconButton>
                    </Tooltip>
                </Stack>
            ))}
        </Paper>
    );
}

function Hero({ projects }) {
    const { t } = useTranslation("home");

    return (
        <Box
            component="section"
            sx={{
                position: "relative",
                py: { xs: 3, md: 7 },
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) 340px" },
                gap: { xs: 4, md: 6 },
                // Accent glow; it fades out on its own and reaches under the translucent header.
                "&::before": {
                    content: '""',
                    position: "absolute",
                    zIndex: -1,
                    top: { xs: -260, md: -320 },
                    left: { xs: -240, md: -320 },
                    width: { xs: 640, md: 1000 },
                    height: { xs: 640, md: 900 },
                    pointerEvents: "none",
                    background: (theme) =>
                        `radial-gradient(closest-side, ${alpha(theme.palette.primary.main, 0.16)}, transparent)`
                },
                // Dot grid that fades towards every edge.
                "&::after": {
                    content: '""',
                    position: "absolute",
                    zIndex: -1,
                    inset: { xs: "-24px -16px", md: "-40px -64px" },
                    pointerEvents: "none",
                    background: (theme) =>
                        `radial-gradient(circle at 1px 1px, ${alpha(theme.palette.text.primary, 0.1)} 1px, transparent 0) 0 0 / 22px 22px`,
                    maskImage: "radial-gradient(closest-side at 30% 50%, #000, transparent)"
                }
            }}
        >
            <Box>
                <Avatar
                    src={`${GITHUB_URL}.png?size=160`}
                    alt="INotSleep"
                    sx={{
                        width: { xs: 64, md: 80 },
                        height: { xs: 64, md: 80 },
                        mb: 3,
                        bgcolor: "primary.main",
                        boxShadow: (theme) => `0 0 0 4px ${theme.palette.background.default}, 0 0 0 5px ${theme.palette.divider}`
                    }}
                >
                    I
                </Avatar>
                <Typography variant="h1" sx={{ maxWidth: 760, fontSize: { md: "3.5rem" } }}>
                    {t("hero.title")}
                </Typography>
                <Typography
                    color="text.secondary"
                    sx={{ mt: 2, maxWidth: 620, fontSize: { xs: "1.05rem", md: "1.2rem" } }}
                >
                    {t("hero.subtitle")}
                </Typography>
                <Stack direction="row" gap={1.5} flexWrap="wrap" sx={{ mt: 4 }}>
                    <Button
                        component={RouterLink}
                        to="/projects"
                        variant="contained"
                        size="large"
                        endIcon={<ArrowForwardIcon />}
                    >
                        {t("hero.projects")}
                    </Button>
                    <Button
                        href={GITHUB_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="outlined"
                        size="large"
                        startIcon={<GitHubIcon />}
                    >
                        GitHub
                    </Button>
                </Stack>
            </Box>

            <LatestReleases projects={projects} />
        </Box>
    );
}

function TranslationsSummary() {
    const { t } = useTranslation("home");
    const { data: languages } = useI18nLanguages();
    const lang = pickLanguage(languages, getSavedTargetLang());

    const { data: progress = [] } = useQuery({
        queryKey: ["i18n-progress", lang],
        enabled: Boolean(languages),
        queryFn: async () => {
            const res = await axios.get("/api/i18n/projects/progress", { params: { lang } });
            return Array.isArray(res.data) ? res.data : [];
        }
    });

    return (
        <Paper sx={{ p: { xs: 2.5, md: 4 }, display: "flex", flexDirection: "column", gap: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2} flexWrap="wrap">
                <Typography variant="h3" component="h2">
                    {t("translate.title")}
                </Typography>
                <Button component={RouterLink} to="/i18n" variant="outlined" endIcon={<ArrowForwardIcon />}>
                    {t("translate.button")}
                </Button>
            </Stack>

            {progress.length > 0 && (
                <Stack gap={2}>
                    <Typography variant="body2" color="text.secondary">
                        {languageName(lang)}
                    </Typography>
                    {progress.map((p) => (
                        <Box key={p.id}>
                            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {p.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={monoSx}>
                                    {p.progressPercent}%
                                </Typography>
                            </Stack>
                            <LinearProgress
                                variant="determinate"
                                value={p.progressPercent}
                                aria-label={p.name}
                                color={p.progressPercent === 100 ? "success" : "primary"}
                                sx={{ height: 6 }}
                            />
                        </Box>
                    ))}
                </Stack>
            )}
        </Paper>
    );
}

function SupportCard() {
    const { t } = useTranslation("home");

    return (
        <Paper
            sx={{
                p: { xs: 2.5, md: 4 },
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 3,
                background: (theme) =>
                    `linear-gradient(160deg, ${alpha(theme.palette.primary.main, 0.14)}, ${theme.palette.background.paper} 70%)`
            }}
        >
            <Box
                sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 3,
                    display: "grid",
                    placeItems: "center",
                    color: "primary.main",
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.14)
                }}
            >
                <FavoriteBorderIcon />
            </Box>
            <Typography variant="h3" component="h2">
                {t("support.title")}
            </Typography>
            <Button href={KOFI_URL} target="_blank" rel="noopener noreferrer" variant="contained">
                {t("support.button")}
            </Button>
        </Paper>
    );
}

function Home() {
    const { t } = useTranslation("home");
    useDocumentTitle(t("meta_title"));
    const { data: projects = [], isPending, isError, error, refetch } = useProjects();

    return (
        <>
            <Hero projects={projects} />

            <Stack component="section" gap={2.5}>
                <SectionTitle
                    action={
                        <Button component={RouterLink} to="/projects" endIcon={<ArrowForwardIcon />}>
                            {t("all_projects")}
                        </Button>
                    }
                >
                    {t("projects")}
                </SectionTitle>
                {isPending ? (
                    <LoadingState minHeight={240} />
                ) : isError ? (
                    <ErrorState error={error} onRetry={refetch} />
                ) : (
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
                            gap: 2
                        }}
                    >
                        {projects.slice(0, 4).map((project) => (
                            <ProjectCard key={project.id} project={project} />
                        ))}
                    </Box>
                )}
            </Stack>

            <Box
                component="section"
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "minmax(0, 2fr) minmax(0, 1fr)" },
                    gap: 2
                }}
            >
                <TranslationsSummary />
                <SupportCard />
            </Box>
        </>
    );
}

export default Home;
