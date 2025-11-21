import { useLocation, Link as RouterLink } from "react-router-dom";
import { Paper, Box, Typography, Button } from "@mui/material";
import UserPreferences from "./UserPreferences.jsx";
import { useTranslation } from "react-i18next";

export function Header() {
    const location = useLocation();
    const { t } = useTranslation("header");
    const currentPath = location.pathname;

    const links = [
        { to: "/", label: t("home") },
        { to: "/projects", label: t("projects") },
        { to: "/i18n", label: t("i18nHub") }
    ];

    return (
        <Paper
            elevation={2}
            sx={{
                width: "90%",
                maxWidth: 1200,
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
                p: 2,
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
                    gap: 2,
                    flexGrow: 1
                }}
            >
                <Typography
                    component={RouterLink}
                    to="/"
                    variant="h6"
                    sx={{
                        textDecoration: "none",
                        color: "inherit",
                        fontWeight: 700,
                        letterSpacing: 1
                    }}
                >
                    INotSleep
                </Typography>

                <Box
                    sx={{
                        display: { xs: "none", sm: "flex" },
                        alignItems: "center",
                        gap: 1
                    }}
                >
                    {links.map((link) => {
                        const isActive = link.to != "/" ? currentPath.startsWith(link.to) : currentPath === link.to;

                        return (
                            <Button
                                key={link.to}
                                component={RouterLink}
                                to={link.to}
                                size="small"
                                color="inherit"
                                sx={{
                                    color: "inherit",
                                    textTransform: "none",
                                    fontWeight: isActive ? 700 : 400,
                                    borderRadius: "999px",
                                    px: 1.5,
                                    ...(isActive && {
                                        backgroundColor: "action.selected",
                                        color: "primary.main",
                                        "&:hover": {
                                            backgroundColor: "action.selected"
                                        }
                                    })
                                }}
                            >
                                {link.label}
                            </Button>
                        );
                    })}
                </Box>
            </Box>

            <UserPreferences />
        </Paper>
    );
}
