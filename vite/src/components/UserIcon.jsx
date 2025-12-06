import { useEffect, useState } from "react";
import {
    Button,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Tooltip
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import GitHubIcon from "@mui/icons-material/GitHub";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import axios from "axios";
import { useTranslation } from "react-i18next";

export default function UserIcon() {
    const { t } = useTranslation("header");

    const [user, setUser] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [copyHint, setCopyHint] = useState(null);

    const menuOpen = Boolean(anchorEl);

    useEffect(() => {
        let cancelled = false;

        async function fetchCurrentUser() {
            try {
                const res = await axios.get("/api/auth/me");

                if (!cancelled) {
                    setUser(res.data.user || null);
                }
            } catch {
                if (!cancelled) {
                    setUser(null);
                }
            }
        }

        fetchCurrentUser();

        return () => {
            cancelled = true;
        };
    }, []);

    const handleLogin = () => {
        const redirectAfter =
            window.location.pathname +
            window.location.search +
            window.location.hash;

        const url =
            "/api/oauth/start?redirect_after=" +
            encodeURIComponent(redirectAfter || "/");

        window.location.href = url;
    };

    const handleAvatarClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setCopyHint(null);
    };

    const handleLogout = async () => {
        try {
            await axios.post("/api/auth/logout");
        } catch {
            // Ignore
        }

        setUser(null);
        handleMenuClose();
    };

    if (!user) {
        return (
            <Button
                size="small"
                variant="outlined"
                onClick={handleLogin}
                startIcon={<GitHubIcon fontSize="small" />}
            >
                {t("login")}
            </Button>
        );
    }

    const login = user.github_login || user.login || "user";
    const userId = user.id;
    const avatarUrl = user.github_avatar_url || user.avatar_url || null;
    const avatarLetter = login.charAt(0).toUpperCase();

    const handleCopyId = async () => {
        if (!userId) return;

        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(userId);
            } else {
                const textarea = document.createElement("textarea");
                textarea.value = userId;
                textarea.style.position = "fixed";
                textarea.style.left = "-9999px";
                document.body.appendChild(textarea);
                textarea.select();
                try {
                    document.execCommand("copy");
                } finally {
                    document.body.removeChild(textarea);
                }
            }
            setCopyHint("Copied!");
        } catch {
            setCopyHint("Failed to copy");
        }
    };

    return (
        <>
            <Tooltip title={`Logged in as ${login}`}>
                <IconButton
                    size="small"
                    onClick={handleAvatarClick}
                    sx={{ p: 0 }}
                >
                    <Avatar
                        src={avatarUrl || undefined}
                        alt={login}
                        sx={{ width: 32, height: 32 }}
                    >
                        {!avatarUrl && avatarLetter}
                    </Avatar>
                </IconButton>
            </Tooltip>

            <Menu
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={handleMenuClose}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right"
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right"
                }}
            >
                <MenuItem onClick={handleCopyId} disabled={!userId}>
                    <ListItemIcon>
                        <ContentCopyIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                        primary={copyHint || "Copy ID"}
                    />
                </MenuItem>

                <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                        <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Logout" />
                </MenuItem>
            </Menu>
        </>
    );
}