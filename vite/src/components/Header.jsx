import { useState } from "react";
import { useLocation, Link as RouterLink } from "react-router-dom";
import { useIsFetching } from "@tanstack/react-query";
import {
    Box,
    Typography,
    Button,
    IconButton,
    Stack,
    Drawer,
    Divider,
    LinearProgress,
    List,
    ListItemButton,
    ListItemText
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import UserPreferences from "./UserPreferences.jsx";
import UserIcon from "./UserIcon.jsx";
import { useTranslation } from "react-i18next";
import { fontHeading } from "../theme/theme.js";

export function Header() {
    const { pathname } = useLocation();
    const { t } = useTranslation("header");
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const isFetching = useIsFetching() > 0;

    const links = [
        { to: "/projects", label: t("projects") },
        { to: "/i18n", label: t("i18nHub") }
    ];

    const isLinkActive = (to) => pathname === to || pathname.startsWith(`${to}/`);

    return (
        <Box
            component="header"
            sx={{
                position: "sticky",
                top: 0,
                zIndex: (theme) => theme.zIndex.appBar,
                borderBottom: "1px solid",
                borderColor: "divider",
                bgcolor: (theme) => alpha(theme.palette.background.default, 0.85),
                backdropFilter: "saturate(180%) blur(12px)",
                px: { xs: 2, md: 4 }
            }}
        >
            <Box
                sx={{
                    maxWidth: 1120,
                    height: 60,
                    mx: "auto",
                    display: "flex",
                    alignItems: "center",
                    gap: { xs: 1, sm: 3 }
                }}
            >
                <Typography
                    component={RouterLink}
                    to="/"
                    sx={{
                        textDecoration: "none",
                        color: "text.primary",
                        fontFamily: fontHeading,
                        fontWeight: 700,
                        fontSize: "1.2rem",
                        letterSpacing: "-0.02em",
                        whiteSpace: "nowrap",
                        borderRadius: 1,
                        transition: "color .15s",
                        "&:hover": { color: "primary.main" }
                    }}
                >
                    INotSleep
                </Typography>

                <Stack
                    component="nav"
                    direction="row"
                    gap={0.5}
                    sx={{ display: { xs: "none", sm: "flex" } }}
                >
                    {links.map((link) => {
                        const isActive = isLinkActive(link.to);

                        return (
                            <Button
                                key={link.to}
                                component={RouterLink}
                                to={link.to}
                                size="small"
                                aria-current={isActive ? "page" : undefined}
                                sx={{
                                    color: isActive ? "text.primary" : "text.secondary",
                                    bgcolor: isActive ? "action.selected" : "transparent",
                                    "&:hover": {
                                        color: "text.primary",
                                        bgcolor: isActive ? "action.selected" : "action.hover"
                                    }
                                }}
                            >
                                {link.label}
                            </Button>
                        );
                    })}
                </Stack>

                <Stack
                    direction="row"
                    gap={1}
                    alignItems="center"
                    sx={{ ml: "auto", display: { xs: "none", sm: "flex" } }}
                >
                    <UserPreferences />
                    <UserIcon />
                </Stack>

                <Stack
                    direction="row"
                    gap={0.5}
                    alignItems="center"
                    sx={{ ml: "auto", display: { xs: "flex", sm: "none" } }}
                >
                    <UserIcon compact />
                    <IconButton
                        onClick={() => setMobileNavOpen(true)}
                        aria-label={t("openMenu")}
                    >
                        <MenuIcon />
                    </IconButton>
                </Stack>
            </Box>

            {isFetching && (
                <LinearProgress
                    aria-label={t("loading")}
                    sx={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: -1,
                        height: 2,
                        borderRadius: 0,
                        bgcolor: "transparent"
                    }}
                />
            )}

            <Drawer
                anchor="right"
                open={mobileNavOpen}
                onClose={() => setMobileNavOpen(false)}
                PaperProps={{ sx: { width: 300, maxWidth: "88vw", border: "none" } }}
            >
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ px: 2, height: 60 }}
                >
                    <Typography sx={{ fontFamily: fontHeading, fontWeight: 700, fontSize: "1.2rem" }}>
                        INotSleep
                    </Typography>
                    <IconButton onClick={() => setMobileNavOpen(false)} aria-label={t("closeMenu")}>
                        <CloseIcon />
                    </IconButton>
                </Stack>

                <Divider />

                <List component="nav" sx={{ p: 1 }}>
                    {[{ to: "/", label: t("home") }, ...links].map((link) => (
                        <ListItemButton
                            key={link.to}
                            component={RouterLink}
                            to={link.to}
                            selected={link.to === "/" ? pathname === "/" : isLinkActive(link.to)}
                            onClick={() => setMobileNavOpen(false)}
                            sx={{ py: 1.25 }}
                        >
                            <ListItemText
                                primary={link.label}
                                primaryTypographyProps={{ fontWeight: 600 }}
                            />
                        </ListItemButton>
                    ))}
                </List>

                <Box sx={{ mt: "auto", p: 2, borderTop: "1px solid", borderColor: "divider" }}>
                    <UserPreferences showLabels />
                </Box>
            </Drawer>
        </Box>
    );
}
