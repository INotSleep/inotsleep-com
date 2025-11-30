import React from "react";
import {
    Box,
    Typography,
    Stack,
    Chip,
    Card,
    CardContent,
    Button,
    Divider,
    Paper
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

function Home() {
    const { t } = useTranslation("home");

    return (
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
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {t("hero.title")}
                </Typography>

                <Typography variant="body1" color="text.secondary">
                    {t("hero.subtitle")}
                </Typography>

                <Stack direction="row" spacing={0} flexWrap="wrap" sx={{ mt: 1, rowGap: 1, columnGap: 1 }}>
                    {["Java", "Bukkit", "Paper", "Forge", "NeoForge", "Fabric", "Quilt", "React", "Node.js"].map(
                        (item) => (
                            <Chip key={item} label={item} size="small" />
                        )
                    )}
                </Stack>
            </Box>

            <Divider sx={{ my: 1 }} />

            {/* ДВЕ КАРТОЧКИ: Projects и INSUtils (внутри — и i18n) */}
            <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                sx={{ alignItems: "stretch" }}
            >
                {/* PROJECTS */}
                <Card
                    variant="outlined"
                    sx={{ flex: 1, display: "flex", flexDirection: "column" }}
                >
                    <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" sx={{ opacity: 0.7 }}>
                            {t("blocks.projects.label")}
                        </Typography>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                            {t("blocks.projects.title")}
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            {t("blocks.projects.text")}
                        </Typography>
                    </CardContent>
                    <CardContent sx={{ pt: 0 }}>
                        <Button
                            component={RouterLink}
                            to="/projects"
                            size="small"
                            variant="contained"
                        >
                            {t("blocks.projects.button")}
                        </Button>
                    </CardContent>
                </Card>

                {/* INSUtils (внутри упоминаем logging/config/i18n) */}
                <Card
                    variant="outlined"
                    sx={{ flex: 1, display: "flex", flexDirection: "column" }}
                >
                    <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" sx={{ opacity: 0.7 }}>
                            {t("blocks.insutils.label")}
                        </Typography>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                            {t("blocks.insutils.title")}
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1.5 }}
                        >
                            {t("blocks.insutils.text")}
                        </Typography>
                    </CardContent>
                    <CardContent
                        sx={{
                            pt: 0,
                            display: "flex",
                            gap: 1,
                            flexWrap: "wrap"
                        }}
                    >
                        <Button
                            component={RouterLink}
                            to="/projects/insutils"
                            size="small"
                            variant="outlined"
                        >
                            {t("blocks.insutils.buttonProject")}
                        </Button>
                        <Button
                            component={RouterLink}
                            to="/i18n"
                            size="small"
                            variant="contained"
                        >
                            {t("blocks.insutils.buttonI18n")}
                        </Button>
                    </CardContent>
                </Card>
            </Stack>

            {/* ССЫЛКИ (только GitHub; Discord закомментирован) */}
            <Box
                sx={{
                    mt: 1,
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
                        GitHub
                    </Button>

                    {/*
                    <Button
                        size="small"
                        variant="outlined"
                        href="https://discord.gg/..."
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Discord
                    </Button>
                    */}

                    {/*
                    <Button
                        size="small"
                        variant="outlined"
                        href="https://donate-link-here"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Donate
                    </Button>
                    */}
                </Stack>
            </Box>
        </Paper>
    );
}

export default Home;
