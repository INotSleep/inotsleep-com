import React from "react";
import {
    Box,
    Typography,
    Stack,
    Chip,
    Button,
    Divider,
    Paper
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { itemCardSx, monoLabelSx, pagePanelSx, sectionTitleSx, subtleTextSx } from "../theme/neoStyles.js";

function Home() {
    const { t } = useTranslation("home");

    return (
        <Paper
            sx={pagePanelSx}
        >
            <Stack
                direction={{ xs: "column", lg: "row" }}
                spacing={3}
                alignItems="stretch"
            >
                <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" sx={{ ...monoLabelSx, color: "primary.main" }}>
                        {t("meta.breadcrumb")}
                    </Typography>
                    <Typography variant="h1" sx={{ mt: 1.2, mb: 1 }}>
                        {t("hero.title")}
                    </Typography>
                    <Typography variant="body1" sx={{ ...subtleTextSx, maxWidth: 780 }}>
                        {t("hero.subtitle")}
                    </Typography>

                    <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        sx={{ mt: 2.2, rowGap: 1 }}
                    >
                        <Button
                            component={RouterLink}
                            to="/projects"
                            size="small"
                            variant="contained"
                        >
                            {t("blocks.projects.button")}
                        </Button>
                        <Button
                            component={RouterLink}
                            to="/i18n"
                            size="small"
                            variant="outlined"
                        >
                            {t("blocks.insutils.buttonI18n")}
                        </Button>
                    </Stack>

                    <Stack
                        direction="row"
                        spacing={0}
                        flexWrap="wrap"
                        sx={{ mt: 2.4, rowGap: 1, columnGap: 1 }}
                    >
                        {[
                            "Java",
                            "Bukkit",
                            "Paper",
                            "Forge",
                            "NeoForge",
                            "Fabric",
                            "Quilt",
                            "React",
                            "Node.js"
                        ].map((item) => (
                            <Chip key={item} label={item} size="small" />
                        ))}
                    </Stack>
                </Box>

                <Box sx={{ minWidth: { lg: 300 }, width: { xs: "100%", lg: 360 } }}>
                    <Box sx={{ ...itemCardSx, height: "100%" }}>
                        <Typography variant="subtitle2" sx={{ ...sectionTitleSx, color: "primary.main" }}>
                            {t("meta.quickStart")}
                        </Typography>
                        <Stack spacing={1.2}>
                            <Typography variant="body2" sx={subtleTextSx}>
                                {t("blocks.projects.text")}
                            </Typography>
                            <Typography variant="body2" sx={subtleTextSx}>
                                {t("blocks.insutils.text")}
                            </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                            <Button
                                component={RouterLink}
                                to="/projects"
                                size="small"
                                variant="contained"
                            >
                                {t("blocks.projects.button")}
                            </Button>
                            <Button
                                component={RouterLink}
                                to="/i18n"
                                size="small"
                                variant="outlined"
                            >
                                {t("blocks.insutils.buttonI18n")}
                            </Button>
                        </Stack>
                    </Box>
                </Box>
            </Stack>

            <Divider sx={{ my: 0.5 }} />

            <Box>
                <Typography variant="h5" sx={sectionTitleSx}>
                    {t("meta.explore")}
                </Typography>
                <Box
                    sx={{
                        mt: 1.2,
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
                        gap: 1.5
                    }}
                >
                    <Box sx={{ ...itemCardSx, p: 1.8 }}>
                        <Typography variant="caption" sx={{ ...monoLabelSx, color: "primary.main" }}>
                            {t("blocks.projects.label")}
                        </Typography>
                        <Typography variant="h6" sx={{ mt: 0.4 }}>
                            {t("blocks.projects.title")}
                        </Typography>
                        <Typography variant="body2" sx={{ ...subtleTextSx, mt: 0.7, mb: 1.2 }}>
                            {t("blocks.projects.text")}
                        </Typography>
                        <Button
                            component={RouterLink}
                            to="/projects"
                            size="small"
                            variant="outlined"
                        >
                            {t("blocks.projects.button")}
                        </Button>
                    </Box>
                    <Box sx={{ ...itemCardSx, p: 1.8 }}>
                        <Typography variant="caption" sx={{ ...monoLabelSx, color: "primary.main" }}>
                            {t("blocks.insutils.label")}
                        </Typography>
                        <Typography variant="h6" sx={{ mt: 0.4 }}>
                            {t("blocks.insutils.title")}
                        </Typography>
                        <Typography variant="body2" sx={{ ...subtleTextSx, mt: 0.7, mb: 1.2 }}>
                            {t("blocks.insutils.text")}
                        </Typography>
                        <Stack direction="row" spacing={1}>
                            <Button
                                component={RouterLink}
                                to="/projects"
                                size="small"
                                variant="outlined"
                            >
                                {t("blocks.insutils.buttonProject")}
                            </Button>
                            <Button
                                component={RouterLink}
                                to="/i18n"
                                size="small"
                                variant="outlined"
                            >
                                {t("blocks.insutils.buttonI18n")}
                            </Button>
                        </Stack>
                    </Box>
                </Box>
            </Box>

            <Box
                sx={{
                    mt: 0.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1.5,
                    flexWrap: "wrap"
                }}
            >
                <Typography variant="body2" color="text.secondary">
                    {t("links.caption")}
                </Typography>

                <Stack direction="row" spacing={1}>
                    <Button
                        size="small"
                        variant="outlined"
                        href="https://github.com/inotsleep"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {t("links.github")}
                    </Button>
                </Stack>
            </Box>
        </Paper>
    );
}

export default Home;
