import { alpha, createTheme } from "@mui/material/styles";

export const fontHeading = '"Space Grotesk Variable", "Inter Variable", system-ui, sans-serif';
export const fontBody = '"Inter Variable", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
export const fontMono =
    '"JetBrains Mono Variable", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

const darkPalette = {
    mode: "dark",
    primary: {
        main: "#5fd4f5",
        light: "#8fe2fa",
        dark: "#2bb8e0",
        contrastText: "#03202b"
    },
    secondary: {
        main: "#8ea6ff",
        contrastText: "#0a1330"
    },
    success: { main: "#4fd18b", contrastText: "#03230f" },
    warning: { main: "#f5c66b" },
    error: { main: "#ff7b76" },
    info: { main: "#5fd4f5" },
    background: {
        default: "#0a1020",
        paper: "#111a2d"
    },
    text: {
        primary: "#e7edf9",
        secondary: "#9ba7c0",
        disabled: "rgba(155,167,192,0.5)"
    },
    divider: "rgba(148,163,196,0.16)"
};

const lightPalette = {
    mode: "light",
    primary: {
        main: "#0b6f8e",
        light: "#2b8fb1",
        dark: "#085570",
        contrastText: "#ffffff"
    },
    secondary: {
        main: "#3c589f",
        contrastText: "#ffffff"
    },
    success: { main: "#23794c", contrastText: "#ffffff" },
    warning: { main: "#9a6b12" },
    error: { main: "#c0413d" },
    info: { main: "#0b6f8e" },
    background: {
        default: "#f5f7fb",
        paper: "#ffffff"
    },
    text: {
        primary: "#101a2c",
        secondary: "#56627a",
        disabled: "rgba(86,98,122,0.5)"
    },
    divider: "rgba(16,26,44,0.11)"
};

function buildTheme(palette) {
    const isDark = palette.mode === "dark";
    const focusRing = `0 0 0 3px ${alpha(palette.primary.main, 0.45)}`;
    const hoverBg = alpha(palette.primary.main, isDark ? 0.1 : 0.07);
    const selectedBg = alpha(palette.primary.main, isDark ? 0.16 : 0.11);

    return createTheme({
        palette: {
            ...palette,
            action: {
                hover: hoverBg,
                selected: selectedBg,
                focus: alpha(palette.primary.main, 0.2)
            }
        },
        spacing: 8,
        shape: { borderRadius: 10 },
        typography: {
            fontFamily: fontBody,
            h1: {
                fontFamily: fontHeading,
                fontWeight: 700,
                fontSize: "clamp(2rem, 1.4rem + 2.4vw, 3rem)",
                lineHeight: 1.08,
                letterSpacing: "-0.025em"
            },
            h2: {
                fontFamily: fontHeading,
                fontWeight: 700,
                fontSize: "clamp(1.5rem, 1.2rem + 1.2vw, 2rem)",
                lineHeight: 1.15,
                letterSpacing: "-0.02em"
            },
            h3: {
                fontFamily: fontHeading,
                fontWeight: 700,
                fontSize: "1.5rem",
                lineHeight: 1.2,
                letterSpacing: "-0.01em"
            },
            h4: {
                fontFamily: fontHeading,
                fontWeight: 700,
                fontSize: "1.25rem",
                lineHeight: 1.25
            },
            h5: {
                fontFamily: fontHeading,
                fontWeight: 600,
                fontSize: "1.125rem",
                lineHeight: 1.3
            },
            h6: {
                fontFamily: fontHeading,
                fontWeight: 600,
                fontSize: "1rem",
                lineHeight: 1.35
            },
            body1: { fontSize: "1rem", lineHeight: 1.65 },
            body2: { fontSize: "0.875rem", lineHeight: 1.55 },
            subtitle2: { fontWeight: 600, fontSize: "0.875rem" },
            caption: { fontSize: "0.78rem", lineHeight: 1.45 },
            overline: {
                fontWeight: 600,
                fontSize: "0.72rem",
                letterSpacing: "0.08em",
                lineHeight: 1.6
            },
            button: {
                fontWeight: 600,
                textTransform: "none",
                letterSpacing: 0
            }
        },
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    html: { scrollPaddingTop: 80 },
                    body: {
                        backgroundColor: palette.background.default,
                        WebkitFontSmoothing: "antialiased"
                    },
                    "*": {
                        scrollbarWidth: "thin",
                        scrollbarColor: `${alpha(palette.text.secondary, 0.45)} transparent`
                    },
                    "::selection": {
                        backgroundColor: alpha(palette.primary.main, 0.3)
                    },
                    // Inputs show focus through MuiOutlinedInput instead.
                    "a, button, [role=button]": {
                        "&:focus-visible": {
                            outline: "none",
                            boxShadow: focusRing
                        }
                    }
                }
            },
            MuiButtonBase: {
                defaultProps: { disableRipple: true }
            },
            MuiPaper: {
                defaultProps: { elevation: 0 },
                styleOverrides: {
                    root: {
                        backgroundImage: "none",
                        backgroundColor: palette.background.paper,
                        border: `1px solid ${palette.divider}`,
                        borderRadius: 14
                    }
                }
            },
            MuiMenu: {
                styleOverrides: {
                    paper: {
                        marginTop: 6,
                        boxShadow: isDark
                            ? "0 16px 40px rgba(0,0,0,0.45)"
                            : "0 16px 40px rgba(16,26,44,0.14)"
                    }
                }
            },
            MuiDrawer: {
                styleOverrides: {
                    paper: { borderRadius: 0 }
                }
            },
            MuiDialog: {
                styleOverrides: {
                    paper: {
                        borderRadius: 16,
                        boxShadow: isDark
                            ? "0 24px 64px rgba(0,0,0,0.55)"
                            : "0 24px 64px rgba(16,26,44,0.2)"
                    }
                }
            },
            MuiDialogTitle: {
                styleOverrides: {
                    root: {
                        fontFamily: fontHeading,
                        fontWeight: 700,
                        fontSize: "1.2rem",
                        paddingBottom: 8
                    }
                }
            },
            MuiDialogActions: {
                styleOverrides: {
                    root: { padding: "12px 24px 20px", gap: 4 }
                }
            },
            MuiButton: {
                defaultProps: { disableElevation: true },
                styleOverrides: {
                    root: {
                        borderRadius: 10,
                        minHeight: 38,
                        paddingInline: 16,
                        transition:
                            "background-color .15s, border-color .15s, color .15s, transform .08s",
                        "&:active": { transform: "translateY(1px)" }
                    },
                    sizeSmall: { minHeight: 32, paddingInline: 12 },
                    sizeLarge: { minHeight: 46, paddingInline: 22, fontSize: "1rem" },
                    containedPrimary: {
                        "&:hover": { backgroundColor: palette.primary.light }
                    },
                    outlined: {
                        borderColor: palette.divider,
                        color: palette.text.primary,
                        "&:hover": {
                            borderColor: alpha(palette.primary.main, 0.6),
                            backgroundColor: hoverBg
                        }
                    },
                    text: {
                        "&:hover": { backgroundColor: hoverBg }
                    }
                }
            },
            MuiIconButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 10,
                        transition: "background-color .15s, color .15s, transform .08s",
                        "&:hover": { backgroundColor: hoverBg },
                        "&:active": { transform: "translateY(1px)" }
                    }
                }
            },
            MuiCardActionArea: {
                styleOverrides: {
                    focusHighlight: { display: "none" }
                }
            },
            MuiChip: {
                styleOverrides: {
                    root: { borderRadius: 8, fontWeight: 500 },
                    sizeSmall: { height: 24 }
                }
            },
            MuiOutlinedInput: {
                styleOverrides: {
                    root: {
                        borderRadius: 10,
                        backgroundColor: isDark
                            ? alpha("#000", 0.18)
                            : palette.background.paper,
                        "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: palette.divider
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: alpha(palette.primary.main, 0.5)
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: palette.primary.main,
                            borderWidth: 1
                        },
                        "&.Mui-focused": { boxShadow: focusRing }
                    }
                }
            },
            MuiToggleButtonGroup: {
                styleOverrides: {
                    root: {
                        backgroundColor: isDark ? alpha("#000", 0.18) : alpha(palette.text.primary, 0.04),
                        borderRadius: 10,
                        padding: 3,
                        gap: 2
                    },
                    grouped: {
                        border: "none !important",
                        borderRadius: "8px !important",
                        margin: "0 !important"
                    }
                }
            },
            MuiToggleButton: {
                styleOverrides: {
                    root: {
                        textTransform: "none",
                        fontWeight: 600,
                        color: palette.text.secondary,
                        paddingInline: 14,
                        "&:hover": { backgroundColor: hoverBg, color: palette.text.primary },
                        "&.Mui-selected": {
                            backgroundColor: palette.background.paper,
                            color: palette.text.primary,
                            boxShadow: isDark
                                ? "0 1px 2px rgba(0,0,0,0.4)"
                                : "0 1px 2px rgba(16,26,44,0.12)",
                            "&:hover": { backgroundColor: palette.background.paper }
                        }
                    }
                }
            },
            MuiLinearProgress: {
                styleOverrides: {
                    root: {
                        borderRadius: 99,
                        backgroundColor: alpha(palette.text.secondary, 0.16)
                    },
                    bar: { borderRadius: 99 }
                }
            },
            MuiTooltip: {
                defaultProps: { enterDelay: 400 },
                styleOverrides: {
                    tooltip: {
                        fontSize: "0.78rem",
                        backgroundColor: isDark ? "#1f2a42" : "#1b2538",
                        color: "#e7edf9"
                    }
                }
            },
            MuiAlert: {
                styleOverrides: {
                    root: { borderRadius: 12, alignItems: "center" }
                }
            },
            MuiListItemButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 8,
                        "&:hover": { backgroundColor: hoverBg },
                        "&.Mui-selected": {
                            backgroundColor: selectedBg,
                            "&:hover": { backgroundColor: selectedBg }
                        }
                    }
                }
            },
            MuiLink: {
                defaultProps: { underline: "hover" }
            }
        }
    });
}

export const darkTheme = buildTheme(darkPalette);
export const lightTheme = buildTheme(lightPalette);

export const getTheme = (mode = "dark") =>
    mode === "light" ? lightTheme : darkTheme;
