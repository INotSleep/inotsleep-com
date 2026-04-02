import { useState } from "react";
import { useLocation, Link as RouterLink } from "react-router-dom";
import {
    Box,
    Typography,
    Button,
    IconButton,
    Stack,
    Drawer,
    Divider,
    List,
    ListItem,
    ListItemButton,
    ListItemText
} from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import UserPreferences from "./UserPreferences.jsx";
import UserIcon from "./UserIcon.jsx";
import { useTranslation } from "react-i18next";

export function Header() {
    const location = useLocation();
    const { t } = useTranslation("header");
    const currentPath = location.pathname;
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    const links = [
        { to: "/", label: t("home") },
        { to: "/projects", label: t("projects") },
        { to: "/i18n", label: t("i18nHub") }
    ];

    const handleMobileNavOpen = () => {
        setMobileNavOpen(true);
    };

    const handleMobileNavClose = () => {
        setMobileNavOpen(false);
    };

    const isLinkActive = (to) =>
        to !== "/" ? currentPath.startsWith(to) : currentPath === to;

    return (
        <Box
            sx={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: (theme) => theme.zIndex.appBar,
                borderBottom: "1px solid",
                borderColor: "divider",
                background: (theme) =>
                    theme.palette.mode === "dark"
                        ? "linear-gradient(180deg, rgba(6,14,32,0.94) 0%, rgba(6,14,32,0.68) 100%)"
                        : "linear-gradient(180deg, rgba(249,252,255,0.94) 0%, rgba(249,252,255,0.78) 100%)",
                backdropFilter: "blur(16px)",
                px: { xs: 2, md: 4 },
                py: { xs: 1.25, md: 1.5 },
                display: "flex",
                justifyContent: "center"
            }}
        >
            <Box
                sx={{
                    width: "100%",
                    maxWidth: 1320,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: { xs: 1, md: 2 },
                        minWidth: 0,
                        flexShrink: 1
                    }}
                >
                    <Typography
                        component={RouterLink}
                        to="/"
                        sx={{
                            textDecoration: "none",
                            color: "primary.main",
                            fontFamily: '"Space Grotesk", Inter, sans-serif',
                            fontWeight: 700,
                            letterSpacing: "-0.02em",
                            fontSize: { xs: "1.1rem", md: "1.35rem" },
                            whiteSpace: "nowrap"
                        }}
                    >
                        INotSleep
                    </Typography>

                    <Stack
                        direction="row"
                        spacing={0.75}
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
                                    color="inherit"
                                    sx={{
                                        minWidth: "unset",
                                        px: 1.5,
                                        py: 0.8,
                                        borderRadius: "10px",
                                        fontFamily:
                                            '"Space Grotesk", Inter, sans-serif',
                                        fontWeight: isActive ? 700 : 500,
                                        color: isActive
                                            ? "primary.main"
                                            : "text.primary",
                                        backgroundColor: isActive
                                            ? "action.selected"
                                            : "transparent",
                                        borderBottom: isActive
                                            ? "2px solid"
                                            : "2px solid transparent",
                                        borderColor: isActive
                                            ? "primary.main"
                                            : "transparent",
                                        "&:hover": {
                                            backgroundColor: "action.hover",
                                            borderColor: isActive
                                                ? "primary.main"
                                                : "divider"
                                        }
                                    }}
                                >
                                    {link.label}
                                </Button>
                            );
                        })}
                    </Stack>
                </Box>

                <Stack
                    direction="row"
                    spacing={1.2}
                    alignItems="center"
                    sx={{
                        display: { xs: "none", sm: "flex" },
                        flexShrink: 0
                    }}
                >
                    <IconButton
                        size="small"
                        component="a"
                        href="https://github.com/inotsleep"
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                            color: "primary.main",
                            border: "1px solid",
                            borderColor: "divider",
                            bgcolor: "action.hover"
                        }}
                    >
                        <GitHubIcon fontSize="small" />
                    </IconButton>

                    <UserIcon />
                    <UserPreferences />
                </Stack>

                <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ display: { xs: "flex", sm: "none" } }}
                >
                    <UserIcon compact />
                    <IconButton
                        size="small"
                        onClick={handleMobileNavOpen}
                        aria-label={t("openMenu")}
                        sx={{
                            border: "1px solid",
                            borderColor: "divider",
                            bgcolor: "action.hover",
                            color: "primary.main"
                        }}
                    >
                        <MenuIcon fontSize="small" />
                    </IconButton>
                </Stack>
            </Box>   

            <Drawer
                anchor="right"
                open={mobileNavOpen}
                onClose={handleMobileNavClose}
                PaperProps={{
                    sx: {
                        width: 292,
                        maxWidth: "92vw",
                        borderLeft: "1px solid",
                        borderColor: "divider",
                        backgroundColor: "background.paper",
                        backgroundImage: "none"
                    }
                }}
            >
                <Box
                    sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column"
                    }}
                >
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{ px: 2, py: 1.5 }}
                    >
                        <Typography
                            sx={{
                                fontFamily: '"Space Grotesk", Inter, sans-serif',
                                fontWeight: 700,
                                color: "text.primary"
                            }}
                        >
                            {t("menu")}
                        </Typography>
                        <IconButton
                            size="small"
                            onClick={handleMobileNavClose}
                            aria-label={t("closeMenu")}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Stack>

                    <Divider />

                    <List sx={{ py: 1 }}>
                        {links.map((link) => (
                            <ListItem key={link.to} disablePadding>
                                <ListItemButton
                                    component={RouterLink}
                                    to={link.to}
                                    selected={isLinkActive(link.to)}
                                    onClick={handleMobileNavClose}
                                    sx={{
                                        px: 2.2,
                                        py: 1.1,
                                        "&.Mui-selected": {
                                            backgroundColor: "action.selected"
                                        },
                                        "&.Mui-selected .MuiListItemText-primary": {
                                            color: "primary.main",
                                            fontWeight: 700
                                        }
                                    }}
                                >
                                    <ListItemText
                                        primary={link.label}
                                        primaryTypographyProps={{
                                            fontFamily:
                                                '"Space Grotesk", Inter, sans-serif',
                                            fontWeight: 500
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>

                    <Divider sx={{ mt: "auto" }} />

                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{ px: 2, py: 1.5 }}
                    >
                        <IconButton
                            size="small"
                            component="a"
                            href="https://github.com/inotsleep"
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                                color: "primary.main",
                                border: "1px solid",
                                borderColor: "divider",
                                bgcolor: "action.hover"
                            }}
                        >
                            <GitHubIcon fontSize="small" />
                        </IconButton>

                        <UserPreferences />
                    </Stack>
                </Box>
            </Drawer>
        </Box>
    );
}
