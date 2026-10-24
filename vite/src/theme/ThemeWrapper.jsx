import { ThemeProvider, CssBaseline } from '@mui/material';
import { getTheme } from './theme.js';
import { RouterProvider } from 'react-router-dom';
import { router } from '../router.jsx';
import { ColorModeContext } from './ColorModeContext.jsx';
import ToastProvider from '../components/ToastProvider.jsx';
import { useCallback, useEffect, useMemo, useState } from 'react';

export default function ThemeWrapper() {
    const [mode, setMode] = useState(getInitialMode);

    const toggleMode = useCallback(() => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
    }, []);

    useEffect(() => {
        try {
            window.localStorage.setItem("color-mode", mode);
        } catch {
            // storage unavailable
        }
        document.documentElement.style.colorScheme = mode;
    }, [mode]);

    const contextValue = useMemo(
        () => ({ mode, toggleMode }),
        [mode, toggleMode]
    );

    return (
        <ColorModeContext.Provider value={contextValue}>
            <ThemeProvider theme={getTheme(mode)}>
                <CssBaseline />
                <ToastProvider>
                    <RouterProvider router={router} />
                </ToastProvider>
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
}

function getInitialMode() {
    if (typeof window === "undefined") {
        return "dark";
    }

    let stored = null;
    try {
        stored = window.localStorage.getItem("color-mode");
    } catch {
        // storage unavailable
    }
    if (stored === "light" || stored === "dark") {
        return stored;
    }

    const prefersDark = window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;

    return prefersDark ? "dark" : "light";
}
