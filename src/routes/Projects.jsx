import { Box, Paper, Typography, Button, Stack } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { Link as RouterLink } from "react-router-dom";

export default function Projects() {
    const { t, i18n } = useTranslation("projects");

    const {
        data: projects = [],
        isPending,
        isError,
        error,
        isFetching,
    } = useQuery({
        queryKey: ["projects", i18n.language],
        queryFn: async () => {
            const res = await axios.get("/api/projects", {
                params: { lang: i18n.language },
            });
            return res.data;
        },
    });

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
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
            >
                <Typography variant="h5">
                    {t("title")}
                </Typography>
                {isFetching && (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontStyle: "italic" }}
                    >
                        {t("updating_projects", "Updating…")}
                    </Typography>
                )}
            </Stack>

            {projects.length === 0 ? (
                <Typography textAlign="center">
                    {t("no_projects")}
                </Typography>
            ) : (
                projects.map((project) => (
                    <Box
                        key={project.id}
                        sx={{
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 2,
                            p: 2,
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{ mb: 1 }}
                            component={RouterLink}
                            to={`/projects/${project.id}`}
                            style={{ color: "inherit", textDecoration: "none" }}
                        >
                            {project.name}
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 2 }}
                        >
                            {project.description}
                        </Typography>

                        <Box
                            sx={{
                                display: "flex",
                                gap: 1,
                                flexWrap: "wrap",
                            }}
                        >
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
                        </Box>
                    </Box>
                ))
            )}
        </Paper>
    );
}