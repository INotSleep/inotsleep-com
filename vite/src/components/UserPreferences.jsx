import React from "react";
import { Box, IconButton, Menu, MenuItem, Paper } from "@mui/material";
import Fade from "@mui/material/Fade";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useTranslation } from "react-i18next";
import "flag-icons/css/flag-icons.min.css";
import { ColorModeContext } from "../theme/ColorModeContext";

const LANGUAGES = [
    { code: "en", label: "English", flag: "gb" }
];

function UserPreferences() {
    
    const { mode, toggleMode } = React.useContext(ColorModeContext);
    const { i18n } = useTranslation();
    const [anchorEl, setAnchorEl] = React.useState(null);

    const open = Boolean(anchorEl);

    const current =
        LANGUAGES.find((lang) =>
            (i18n.language || "").toLowerCase().startsWith(lang.code)
        ) || LANGUAGES[0];

    const handleLangOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleLangClose = () => {
        setAnchorEl(null);
    };

    const handleSelectLang = (code) => {
        i18n.changeLanguage(code);
        handleLangClose();
    };

    const isDark = mode === "dark";
    const ThemeIcon = isDark ? DarkModeIcon : LightModeIcon;

    return (
        <>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        borderRadius: "5px",
                    }}
                >
                    <IconButton
                        size="small"
                        onClick={toggleMode}
                        sx={{
                            borderRadius: "5px",
                        }}
                        aria-label="Toggle light/dark mode"
                    >
                        <ThemeIcon fontSize="small" />
                    </IconButton>
                </Paper>

                <IconButton
                    onClick={handleLangOpen}
                    size="small"
                    sx={{
                        p: 0,
                        borderRadius: "5px",
                        overflow: "hidden"
                    }}
                >
                    <span
                        className={`fi fi-${current.flag}`}
                        style={{
                            display: "block",
                            fontSize: 24,
                            lineHeight: 1
                        }}
                        title={current.label}
                    />
                </IconButton>
            </Box>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleLangClose}
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "center"
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "center"
                }}
                slots={{
                    transition: Fade
                }}
                slotProps={{
                    transition: {
                        timeout: 150
                    },
                    paper: {
                        sx: {
                            borderRadius: "5px",
                            minWidth: "unset",
                            mt: -1.4
                        }
                    },
                    list: {
                        dense: true
                    }
                }}
            >
                {LANGUAGES.sort((a, b) => a.code.localeCompare(b.code)).map((lang) => (
                    <MenuItem
                        key={lang.code}
                        onClick={() => handleSelectLang(lang.code)}
                        selected={lang.code === current.code}
                        sx={{
                            py: 0.5,
                            px: 1,
                            minWidth: "unset",
                            justifyContent: "center"
                        }}
                    >
                        <span
                            className={`fi fi-${lang.flag}`}
                            style={{
                                display: "block",
                                fontSize: 24,
                                lineHeight: 1,
                                borderRadius: "5px"
                            }}
                            title={lang.label}
                        />
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
}

export default UserPreferences;
