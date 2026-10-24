import { Navigate, useParams, Link as RouterLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button, Paper, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import axios from "axios";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import MarkdownView from "../components/MarkdownView";
import { ErrorState, ExternalOrInternalButton, LoadingState, PageHeader } from "../components/ui.jsx";

async function getOptional(url, params) {
    try {
        return (await axios.get(url, { params })).data;
    } catch (err) {
        if (err?.response?.status === 404) return null;
        throw err;
    }
}

export default function ProjectDetails() {
    const { projectId } = useParams();
    const { t, i18n } = useTranslation("projects");

    const { data, isPending, isError, error, refetch } = useQuery({
        queryKey: ["project", i18n.language, projectId],
        queryFn: async () => {
            const params = { lang: i18n.language };
            const [projectRes, readmeData, wikiData] = await Promise.all([
                axios.get(`/api/projects/${projectId}`, { params }),
                getOptional(`/api/projects/${projectId}/readme`, params),
                getOptional(`/api/projects/${projectId}/wiki`, params)
            ]);

            return {
                project: projectRes.data,
                readme: (readmeData?.readme || "").replace("{{LANG}}", i18n.language),
                hasWiki: Boolean(
                    wikiData?.provided !== undefined ? wikiData.provided : wikiData
                )
            };
        }
    });

    const back = { to: "/projects", label: t("back_to_projects") };

    if (isPending) return <LoadingState minHeight="50vh" />;

    if (isError) {
        if (error?.response?.status === 404) {
            return <Navigate to={`/404?path=/projects/${projectId}`} replace />;
        }
        return (
            <>
                <PageHeader title={projectId} back={back} />
                <ErrorState error={error} onRetry={refetch} />
            </>
        );
    }

    const { project, readme, hasWiki } = data;
    const buttons = project.buttons || [];

    return (
        <>
            <PageHeader title={project.name} back={back}>
                {project.description && (
                    <Typography color="text.secondary" sx={{ maxWidth: 760, fontSize: "1.1rem" }}>
                        {project.description}
                    </Typography>
                )}
                {(hasWiki || buttons.length > 0) && (
                    <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 1 }}>
                        {hasWiki && (
                            <Button
                                component={RouterLink}
                                to="wiki"
                                variant="contained"
                                startIcon={<MenuBookOutlinedIcon />}
                            >
                                {t("open_wiki")}
                            </Button>
                        )}
                        {buttons.map((button, index) => (
                            <ExternalOrInternalButton
                                key={button.url}
                                url={button.url}
                                variant={!hasWiki && index === 0 ? "contained" : "outlined"}
                                endIcon={button.url.startsWith("/") ? null : <OpenInNewIcon sx={{ fontSize: "16px !important" }} />}
                            >
                                {button.label}
                            </ExternalOrInternalButton>
                        ))}
                    </Stack>
                )}
            </PageHeader>

            {readme && (
                <Paper component="article" sx={{ p: { xs: 2.5, md: 5 } }}>
                    <MarkdownView>{readme}</MarkdownView>
                </Paper>
            )}
        </>
    );
}
