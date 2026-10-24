import { useContext, useState } from "react";
import { Button, IconButton, Menu, MenuItem, Stack, Tooltip } from "@mui/material";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import { useTranslation } from "react-i18next";
import "flag-icons/css/flag-icons.min.css";
import { ColorModeContext } from "../theme/ColorModeContext";

const LANGUAGES = [
    { code: "en", labelKey: "languageEnglish", flag: "gb" }
];

function UserPreferences({ showLabels = false }) {
    const { mode, toggleMode } = useContext(ColorModeContext);
    const { i18n, t } = useTranslation("header");
    const [anchorEl, setAnchorEl] = useState(null);

    const current =
        LANGUAGES.find((lang) =>
            (i18n.language || "").toLowerCase().startsWith(lang.code)
        ) || LANGUAGES[0];

    const handleSelectLang = (code) => {
        i18n.changeLanguage(code);
        setAnchorEl(null);
    };

    // The button switches to the other theme, so it names the target theme.
    const toggleLabel = mode === "dark" ? t("lightTheme") : t("darkTheme");
    const ThemeIcon = mode === "dark" ? LightModeOutlinedIcon : DarkModeOutlinedIcon;

    return (
        <Stack direction="row" gap={0.5} alignItems="center">
            {showLabels ? (
                <Button
                    variant="outlined"
                    onClick={toggleMode}
                    startIcon={<ThemeIcon />}
                    fullWidth
                >
                    {toggleLabel}
                </Button>
            ) : (
                <Tooltip title={toggleLabel}>
                    <IconButton onClick={toggleMode} aria-label={toggleLabel}>
                        <ThemeIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            )}

            {LANGUAGES.length > 1 && (
                <>
                    <Tooltip title={t(current.labelKey)}>
                        <IconButton
                            onClick={(e) => setAnchorEl(e.currentTarget)}
                            aria-label={t(current.labelKey)}
                        >
                            <span className={`fi fi-${current.flag}`} style={{ fontSize: 18, borderRadius: 3 }} />
                        </IconButton>
                    </Tooltip>

                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={() => setAnchorEl(null)}
                        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                        transformOrigin={{ vertical: "top", horizontal: "right" }}
                    >
                        {LANGUAGES.map((lang) => (
                            <MenuItem
                                key={lang.code}
                                onClick={() => handleSelectLang(lang.code)}
                                selected={lang.code === current.code}
                                sx={{ gap: 1.5 }}
                            >
                                <span className={`fi fi-${lang.flag}`} style={{ borderRadius: 3 }} />
                                {t(lang.labelKey)}
                            </MenuItem>
                        ))}
                    </Menu>
                </>
            )}
        </Stack>
    );
}

export default UserPreferences;
