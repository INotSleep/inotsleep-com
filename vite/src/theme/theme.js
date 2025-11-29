import { createTheme } from '@mui/material/styles';

const paletteBase = {
    primary: { main: '#2563eb', light: '#60a5fa', dark: '#1e40af', contrastText: '#ffffff' },
    secondary: { main: '#7c3aed', light: '#a78bfa', dark: '#5b21b6', contrastText: '#ffffff' },
    success: { main: '#16a34a' },
    warning: { main: '#f59e0b' },
    error:   { main: '#dc2626' },
    info:    { main: '#0284c7' }
};

const common = {
    spacing: 8,
    shape: { borderRadius: 16 },
    typography: {
        fontFamily: [
            'Inter',
            'Segoe UI',
            'Roboto',
            'Helvetica Neue',
            'Arial',
            'Noto Sans',
            'Apple Color Emoji',
            'Segoe UI Emoji'
        ].join(','),
        h1: { fontWeight: 800, fontSize: '2.25rem', lineHeight: 1.2 },
        h2: { fontWeight: 700, fontSize: '1.875rem', lineHeight: 1.25 },
        h3: { fontWeight: 700, fontSize: '1.5rem',  lineHeight: 1.3 },
        h4: { fontWeight: 700, fontSize: '1.25rem', lineHeight: 1.35 },
        h5: { fontWeight: 600, fontSize: '1.125rem',lineHeight: 1.4 },
        h6: { fontWeight: 600, fontSize: '1rem',   lineHeight: 1.5 },
        body1: { fontSize: '1rem',   lineHeight: 1.6 },
        body2: { fontSize: '.875rem',lineHeight: 1.6 },
        button: { textTransform: 'none', fontWeight: 600 }
    },
    components: {
        MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: {
                root: { borderRadius: 12, paddingInline: 16, paddingBlock: 10 }
            }
        },
        MuiPaper: { styleOverrides: { root: { borderRadius: 16 } } },
        MuiCard:  { styleOverrides: { root: { borderRadius: 16 } } },
        MuiLink:  { styleOverrides: { root: { fontWeight: 600 } } },
        MuiAppBar:{ defaultProps: { elevation: 0 } }
    }
};

export const lightTheme = createTheme({
    ...common,
    palette: {
        mode: 'light',
        ...paletteBase,
        background: { default: '#f7f7fb', paper: '#ffffff' },
        text: { primary: '#0b1220', secondary: '#3a4664', disabled: 'rgba(2,6,23,0.38)' },
        divider: 'rgba(3,7,18,0.08)',
        action: {
            hover: 'rgba(2,6,23,0.06)',
            selected: 'rgba(2,6,23,0.10)',
            disabled: 'rgba(2,6,23,0.38)',
            disabledBackground: 'rgba(2,6,23,0.12)',
            focus: 'rgba(37,99,235,0.32)'
        }
    },
    components: {
        ...common.components,
        MuiCssBaseline: { styleOverrides: { body: { backgroundColor: '#f7f7fb' } } },
        MuiAppBar: {
            styleOverrides: {
                colorPrimary: {
                    backgroundColor: '#ffffff',
                    color: '#0b1220',
                    borderBottom: '1px solid rgba(3,7,18,0.06)'
                }
            }
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: { borderRadius: 12 },
                notchedOutline: { borderColor: 'rgba(2,6,23,0.16)' }
            }
        }
    }
});

export const darkTheme = createTheme({
    ...common,
    palette: {
        mode: 'dark',
        primary: { main: '#60a5fa', light: '#93c5fd', dark: '#2563eb', contrastText: '#0b1220' },
        secondary:{ main: '#a78bfa', light: '#c4b5fd', dark: '#7c3aed', contrastText: '#0b1220' },
        success:  { main: '#22c55e' },
        warning:  { main: '#fbbf24' },
        error:    { main: '#f87171' },
        info:     { main: '#38bdf8' },
        background: { default: '#0b1220', paper: '#111827' },
        text: { primary: '#e5e7eb', secondary: '#b6c3e0', disabled: 'rgba(226,232,240,0.38)' },
        divider: 'rgba(148,163,184,0.16)',
        action: {
            hover: 'rgba(148,163,184,0.08)',
            selected: 'rgba(148,163,184,0.16)',
            disabled: 'rgba(148,163,184,0.38)',
            disabledBackground: 'rgba(148,163,184,0.12)',
            focus: 'rgba(96,165,250,0.28)'
        }
    },
    components: {
        ...common.components,
        MuiCssBaseline: { styleOverrides: { body: { backgroundColor: '#0b1220' } } },
        MuiAppBar: {
            styleOverrides: {
                colorPrimary: {
                    backgroundColor: '#0b1220',
                    color: '#e5e7eb',
                    borderBottom: '1px solid rgba(148,163,184,0.12)'
                }
            }
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: { borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.03)' },
                notchedOutline: { borderColor: 'rgba(148,163,184,0.25)' }
            }
        }
    }
});

export const getTheme = (mode = 'light') => (mode === 'dark' ? darkTheme : lightTheme);

export const theme = lightTheme;