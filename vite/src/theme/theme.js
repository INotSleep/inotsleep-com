import { createTheme } from "@mui/material/styles";

const darkPalette = {
    mode: "dark",
    primary: {
        main: "#6dddff",
        light: "#94ebff",
        dark: "#00c3eb",
        contrastText: "#06202e"
    },
    secondary: {
        main: "#82a3ff",
        light: "#abc2ff",
        dark: "#5b7de0",
        contrastText: "#071329"
    },
    success: { main: "#58d68d" },
    warning: { main: "#ffcf70" },
    error: { main: "#ff716c" },
    info: { main: "#67cfff" },
    background: {
        default: "#060e20",
        paper: "#0f1930"
    },
    text: {
        primary: "#dee5ff",
        secondary: "#a3aac4",
        disabled: "rgba(163,170,196,0.45)"
    },
    divider: "rgba(64,72,93,0.5)",
    action: {
        hover: "rgba(109,221,255,0.10)",
        selected: "rgba(109,221,255,0.16)",
        disabled: "rgba(163,170,196,0.42)",
        disabledBackground: "rgba(64,72,93,0.32)",
        focus: "rgba(109,221,255,0.20)"
    }
};

const lightPalette = {
    mode: "light",
    primary: {
        main: "#0c6e8f",
        light: "#2b8fb1",
        dark: "#0a536f",
        contrastText: "#ffffff"
    },
    secondary: {
        main: "#3c589f",
        light: "#5f7ac1",
        dark: "#2d447f",
        contrastText: "#ffffff"
    },
    success: { main: "#2f7f58" },
    warning: { main: "#9f7722" },
    error: { main: "#b54846" },
    info: { main: "#2d79a6" },
    background: {
        default: "#f5f8fd",
        paper: "#ffffff"
    },
    text: {
        primary: "#15243f",
        secondary: "#566381",
        disabled: "rgba(86,99,129,0.42)"
    },
    divider: "rgba(85,100,133,0.2)",
    action: {
        hover: "rgba(12,110,143,0.08)",
        selected: "rgba(12,110,143,0.14)",
        disabled: "rgba(86,99,129,0.36)",
        disabledBackground: "rgba(85,100,133,0.14)",
        focus: "rgba(12,110,143,0.16)"
    }
};

const common = {
    spacing: 8,
    shape: {
        borderRadius: 12
    },
    typography: {
        fontFamily: [
            "Inter",
            "Segoe UI",
            "Roboto",
            "Helvetica Neue",
            "Arial",
            "Noto Sans"
        ].join(","),
        h1: {
            fontFamily: '"Space Grotesk", Inter, sans-serif',
            fontWeight: 700,
            fontSize: "clamp(2rem, 4vw, 3.4rem)",
            lineHeight: 1.05,
            letterSpacing: "-0.02em"
        },
        h2: {
            fontFamily: '"Space Grotesk", Inter, sans-serif',
            fontWeight: 700,
            fontSize: "clamp(1.6rem, 2.5vw, 2.4rem)",
            lineHeight: 1.12,
            letterSpacing: "-0.015em"
        },
        h3: {
            fontFamily: '"Space Grotesk", Inter, sans-serif',
            fontWeight: 700,
            fontSize: "1.5rem",
            lineHeight: 1.2
        },
        h4: {
            fontFamily: '"Space Grotesk", Inter, sans-serif',
            fontWeight: 700,
            fontSize: "1.25rem",
            lineHeight: 1.25
        },
        h5: {
            fontFamily: '"Space Grotesk", Inter, sans-serif',
            fontWeight: 600,
            fontSize: "1.125rem",
            lineHeight: 1.35
        },
        h6: {
            fontFamily: '"Space Grotesk", Inter, sans-serif',
            fontWeight: 600,
            fontSize: "1rem",
            lineHeight: 1.4
        },
        body1: {
            fontSize: "1rem",
            lineHeight: 1.65
        },
        body2: {
            fontSize: "0.875rem",
            lineHeight: 1.6
        },
        subtitle2: {
            fontFamily: '"Manrope", Inter, sans-serif',
            fontWeight: 700,
            letterSpacing: "0.01em"
        },
        button: {
            fontFamily: '"Manrope", Inter, sans-serif',
            fontWeight: 700,
            textTransform: "none",
            letterSpacing: "0.02em"
        },
        caption: {
            fontFamily: '"Manrope", Inter, sans-serif',
            letterSpacing: "0.03em"
        }
    }
};

function buildTheme(palette) {
    return createTheme({
        ...common,
        palette,
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    body: {
                        backgroundColor: palette.background.default,
                        backgroundImage:
                            palette.mode === "dark"
                                ? "radial-gradient(circle at 10% -10%, rgba(109,221,255,0.15), transparent 46%), radial-gradient(circle at 90% -20%, rgba(130,163,255,0.18), transparent 42%), linear-gradient(160deg, #060e20 0%, #091328 52%, #060e20 100%)"
                                : "radial-gradient(circle at 10% -10%, rgba(12,110,143,0.11), transparent 46%), radial-gradient(circle at 90% -20%, rgba(60,88,159,0.10), transparent 42%), linear-gradient(160deg, #f9fbff 0%, #f2f6fc 52%, #f8fbff 100%)",
                        backgroundAttachment: "fixed"
                    },
                    "*": {
                        scrollbarWidth: "thin",
                        scrollbarColor:
                            palette.mode === "dark"
                                ? "#6dddff #0f1930"
                                : "#0c6e8f #e5ecf7"
                    },
                    "*::-webkit-scrollbar": {
                        width: "8px",
                        height: "8px"
                    },
                    "*::-webkit-scrollbar-thumb": {
                        backgroundColor:
                            palette.mode === "dark"
                                ? "rgba(109,221,255,0.65)"
                                : "rgba(12,110,143,0.62)",
                        borderRadius: "99px"
                    },
                    "*::-webkit-scrollbar-track": {
                        backgroundColor:
                            palette.mode === "dark" ? "#0b1428" : "#e5ecf7"
                    },
                    "::selection": {
                        backgroundColor:
                            palette.mode === "dark"
                                ? "rgba(109,221,255,0.25)"
                                : "rgba(12,110,143,0.24)",
                        color: palette.mode === "dark" ? "#e9f5ff" : "#09253d"
                    }
                }
            },
            MuiPaper: {
                defaultProps: {
                    elevation: 0
                },
                styleOverrides: {
                    root: {
                        borderRadius: 14,
                        border: "1px solid",
                        borderColor: palette.divider,
                        background:
                            palette.mode === "dark"
                                ? "linear-gradient(170deg, rgba(15,25,48,0.78) 0%, rgba(9,19,40,0.88) 100%)"
                                : "linear-gradient(170deg, rgba(255,255,255,0.95) 0%, rgba(245,249,255,0.98) 100%)",
                        backdropFilter: "blur(14px)",
                        boxShadow:
                            palette.mode === "dark"
                                ? "0 14px 42px rgba(0,0,0,0.35), 0 0 0 1px rgba(109,221,255,0.05)"
                                : "0 12px 28px rgba(28,51,94,0.08), 0 0 0 1px rgba(21,36,63,0.03)"
                    }
                }
            },
            MuiButton: {
                defaultProps: {
                    disableElevation: true
                },
                styleOverrides: {
                    root: {
                        borderRadius: 12,
                        paddingInline: 16,
                        paddingBlock: 8
                    },
                    containedPrimary: {
                        background:
                            palette.mode === "dark"
                                ? "linear-gradient(135deg, #6dddff 0%, #00d2fd 100%)"
                                : "linear-gradient(135deg, #0c6e8f 0%, #3c589f 100%)",
                        color:
                            palette.mode === "dark"
                                ? "#002f3c"
                                : "#ffffff",
                        boxShadow:
                            palette.mode === "dark"
                                ? "0 0 22px rgba(109,221,255,0.24)"
                                : "0 0 16px rgba(12,110,143,0.20)",
                        "&:hover": {
                            filter: "brightness(1.05)"
                        }
                    },
                    outlined: {
                        borderColor:
                            palette.mode === "dark"
                                ? "rgba(109,221,255,0.30)"
                                : "rgba(12,110,143,0.34)"
                    }
                }
            },
            MuiChip: {
                styleOverrides: {
                    root: {
                        borderRadius: 10
                    }
                }
            },
            MuiOutlinedInput: {
                styleOverrides: {
                    root: {
                        borderRadius: 12,
                        backgroundColor:
                            palette.mode === "dark"
                                ? "rgba(9,19,40,0.78)"
                                : "rgba(255,255,255,0.92)",
                        "& .MuiOutlinedInput-notchedOutline": {
                            borderColor:
                                palette.mode === "dark"
                                    ? "rgba(64,72,93,0.9)"
                                    : "rgba(85,100,133,0.24)"
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor:
                                palette.mode === "dark"
                                    ? "rgba(109,221,255,0.42)"
                                    : "rgba(12,110,143,0.45)"
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: palette.primary.main
                        }
                    }
                }
            },
            MuiToggleButtonGroup: {
                styleOverrides: {
                    root: {
                        borderRadius: 12
                    }
                }
            },
            MuiToggleButton: {
                styleOverrides: {
                    root: {
                        borderRadius: "10px !important",
                        borderColor: palette.divider
                    }
                }
            },
            MuiDialog: {
                styleOverrides: {
                    paper: {
                        borderRadius: 16
                    }
                }
            }
        }
    });
}

export const darkTheme = buildTheme(darkPalette);
export const lightTheme = buildTheme(lightPalette);

export const getTheme = (mode = "dark") =>
    mode === "light" ? lightTheme : darkTheme;

export const theme = darkTheme;
