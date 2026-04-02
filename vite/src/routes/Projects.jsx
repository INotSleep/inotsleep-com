import { Box, Paper, Typography, Button, Stack } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { Link as RouterLink } from "react-router-dom";
import { itemCardSx, monoLabelSx, pagePanelSx, sectionTitleSx, subtleTextSx } from "../theme/neoStyles.js";

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

    return (
        <Paper
            sx={pagePanelSx}
        >
            <Box>
                <Typography variant="caption" sx={{ ...monoLabelSx, color: "primary.main" }}>
                    {t("breadcrumb")}
                </Typography>
                <Typography variant="h1" sx={{ mt: 1 }}>
                    {t("title")}
                </Typography>
                <Typography variant="body1" sx={{ ...subtleTextSx, maxWidth: 760, mt: 0.8 }}>
                    {t("subtitle")}
                </Typography>
            </Box>

            {projects.length === 0 ? (
                <Typography textAlign="center">
                    {t("no_projects")}
                </Typography>
            ) : (
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
                        gap: 2
                    }}
                >
                    {projects.map((project, index) => (
                        <Box
                            key={project.id}
                            sx={{
                                ...itemCardSx,
                                boxShadow:
                                    index === 0
                                        ? "0 0 30px rgba(109,221,255,0.16)"
                                        : "none"
                            }}
                        >
                            <Stack
                                direction={{ xs: "column", md: "row" }}
                                justifyContent="space-between"
                                alignItems={{ xs: "flex-start", md: "center" }}
                                spacing={1}
                                sx={{ mb: 1 }}
                            >
                                <Typography
                                    variant="h5"
                                    sx={sectionTitleSx}
                                    component={RouterLink}
                                    to={`/projects/${project.id}`}
                                    style={{ color: "inherit", textDecoration: "none" }}
                                >
                                    {project.name}
                                </Typography>

                                {index === 0 && (
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            px: 1.2,
                                            py: 0.5,
                                            borderRadius: 999,
                                            bgcolor: "action.selected",
                                            color: "primary.main",
                                            ...monoLabelSx
                                        }}
                                    >
                                        {t("featured")}
                                    </Typography>
                                )}
                            </Stack>

                            <Typography
                                variant="body2"
                                sx={{ ...subtleTextSx, mb: 2 }}
                            >
                                {project.description}
                            </Typography>

                            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ rowGap: 1, mt: "auto" }}>
                                <Button
                                    variant="contained"
                                    size="small"
                                    component={RouterLink}
                                    to={`/projects/${project.id}`}
                                >
                                    {t("open_details")}
                                </Button>
                                {project.buttons?.map((button, indexButton) => {
                                    const isInternal = button.url.startsWith("/");

                                    return (
                                        <Button
                                            key={indexButton}
                                            variant="outlined"
                                            size="small"
                                            {...(isInternal
                                                ? {
                                                      component: RouterLink,
                                                      to: button.url
                                                  }
                                                : {
                                                      href: button.url,
                                                      target: "_blank",
                                                      rel: "noopener noreferrer"
                                                  })}
                                        >
                                            {button.label}
                                        </Button>
                                    );
                                })}
                            </Stack>
                        </Box>
                    ))}
                </Box>
            )}

            {isFetching && (
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontStyle: "italic", alignSelf: "flex-end" }}
                >
                    {t("updating_projects")}
                </Typography>
            )}
        </Paper>
    );
}
