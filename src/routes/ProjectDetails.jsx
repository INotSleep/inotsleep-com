import { useNavigate, useParams, Link as RouterLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Box, Paper, Typography, Button, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import axios from "axios";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import MarkdownView from "../components/MarkdownView"; // поправь путь, если другой

export default function ProjectDetails() {
    const navigate = useNavigate();
    const { projectId } = useParams();
    const { t, i18n } = useTranslation("projects");

    const {
        data,
        isPending,
        isError,
        error,
        isFetching,
    } = useQuery({
        queryKey: ["project", i18n.language, projectId],
        queryFn: async () => {
            const projectRes = await axios.get(`/api/projects/${projectId}`, {
                params: { lang: i18n.language },
            });

            let readmeText = "";
            try {
                const readmeRes = await axios.get(
                    `/api/projects/${projectId}/readme`,
                    {
                        params: { lang: i18n.language },
                    }
                );
                readmeText = (readmeRes.data?.readme || "").replace("{{LANG}}", i18n.language);
            } catch (err) {
                const axiosError = err;
                if (axiosError?.response?.status !== 404) {
                    throw err;
                }
            }

            let hasWiki = false;
            try {
                const wikiRes = await axios.get(
                    `/api/projects/${projectId}/wiki`,
                    {
                        params: { lang: i18n.language },
                    }
                );
                hasWiki = Boolean(
                    wikiRes.data?.provided !== undefined
                        ? wikiRes.data.provided
                        : wikiRes.data
                );
            } catch (err) {
                const axiosError = err;
                if (axiosError?.response?.status !== 404) {
                    throw err;
                }
            }

            return {
                project: projectRes.data, 
                readme: readmeText,       
                hasWiki,                  
            };
        },
        refetchOnWindowFocus: false,
    });

    if (isPending) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography>{t("loading_project")}</Typography>
            </Box>
        );
    }

    if (isError) {
        const axiosError = error;

        if (
            axiosError?.response?.status === 404 ||
            axiosError?.message?.includes("404")
        ) {
            navigate(`/404?path=/projects/${projectId}`);
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

    const { project, readme, hasWiki } = data;

    return (
        <Paper
            elevation={2}
            sx={{
                width: "100%",
                p: 3,
                display: "flex",
                flexDirection: "column",
                gap: 3,
            }}
        >
            <Box>
                <Typography variant="h4" sx={{ mb: 1 }}>
                    {project.name}
                </Typography>
                {project.description && (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        {project.description}
                    </Typography>
                )}
            </Box>

            <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                spacing={2}
            >
                <Stack direction="row" spacing={1} flexWrap="wrap">
                    {project.buttons?.map((button, index) => {
                        const isInternal = button.url.startsWith("/");

                        return (
                            <Button
                                key={index}
                                variant="outlined"
                                size="small"
                                {...(isInternal
                                    ? {
                                          component: RouterLink,
                                          to: button.url,
                                      }
                                    : {
                                          href: button.url,
                                          target: "_blank",
                                          rel: "noopener noreferrer",
                                      })}
                            >
                                {button.label}
                            </Button>
                        );
                    })}
                </Stack>

                {hasWiki && (
                    <Button
                        component={RouterLink}
                        to="wiki"
                        variant="contained"
                        color="secondary"
                        startIcon={<MenuBookIcon />}
                        size="small"
                    >
                        {t("open_wiki")}
                    </Button>
                )}
            </Stack>

            {readme && (
                <Box sx={{ mt: 1 }}>
                    <Typography
                        variant="h6"
                        sx={{ mb: 1.5 }}
                    >
                        {t("readme_title")}
                    </Typography>
                    <MarkdownView>{readme}</MarkdownView>
                </Box>
            )}

            {isFetching && (
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontStyle: "italic", mt: 1 }}
                >
                    {t("updating_project")}
                </Typography>
            )}
        </Paper>
    );
}
