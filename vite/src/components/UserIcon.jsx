import { useState } from "react";
import {
    Avatar,
    Button,
    Divider,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Tooltip,
    Typography
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import GitHubIcon from "@mui/icons-material/GitHub";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { startLogin, useCurrentUser } from "../lib/auth.js";
import { useToast } from "../lib/toast.js";

export default function UserIcon({ compact = false }) {
    const { t } = useTranslation("header");
    const toast = useToast();
    const queryClient = useQueryClient();
    const { data: user, isPending } = useCurrentUser();
    const [anchorEl, setAnchorEl] = useState(null);
    const [loggingIn, setLoggingIn] = useState(false);

    if (isPending) return null;

    const handleLogin = () => {
        setLoggingIn(true);
        startLogin();
    };

    if (!user) {
        if (compact) {
            return (
                <Tooltip title={t("login")}>
                    <IconButton onClick={handleLogin} aria-label={t("login")} disabled={loggingIn}>
                        <GitHubIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            );
        }

        return (
            <Button
                variant="outlined"
                size="small"
                onClick={handleLogin}
                disabled={loggingIn}
                startIcon={<GitHubIcon fontSize="small" />}
            >
                {t("login")}
            </Button>
        );
    }

    const login = user.github_login || user.login || "user";
    const avatarUrl = user.github_avatar_url || user.avatar_url || null;

    const handleCopyId = async () => {
        setAnchorEl(null);
        try {
            await navigator.clipboard.writeText(user.id);
            toast(t("copied"));
        } catch {
            toast(t("copyFailed"), "error");
        }
    };

    const handleLogout = async () => {
        setAnchorEl(null);
        try {
            await axios.post("/api/auth/logout");
            queryClient.setQueryData(["me"], null);
            queryClient.removeQueries({ queryKey: ["permissions"] });
            toast(t("loggedOut"));
        } catch {
            toast(t("logoutFailed"), "error");
        }
    };

    return (
        <>
            <Tooltip title={login}>
                <IconButton
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    aria-label={t("accountMenu")}
                    sx={{ p: 0.5 }}
                >
                    <Avatar
                        src={avatarUrl || undefined}
                        alt={login}
                        sx={{ width: 30, height: 30, bgcolor: "primary.main", color: "primary.contrastText", fontSize: 14 }}
                    >
                        {login.charAt(0).toUpperCase()}
                    </Avatar>
                </IconButton>
            </Tooltip>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                slotProps={{ paper: { sx: { minWidth: 200 } } }}
            >
                <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
                    {login}
                </Typography>
                <Divider />
                {user.id && (
                    <MenuItem onClick={handleCopyId}>
                        <ListItemIcon>
                            <ContentCopyIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={t("copyId")} />
                    </MenuItem>
                )}
                <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                        <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={t("logout")} />
                </MenuItem>
            </Menu>
        </>
    );
}
