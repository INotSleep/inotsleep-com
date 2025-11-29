import { ThemeProvider, CssBaseline } from '@mui/material';
import { getTheme } from './theme.js';
import { RouterProvider } from 'react-router-dom';
import { router } from '../router.jsx';
import { ColorModeContext } from './ColorModeContext.jsx';
import { useCallback, useEffect, useMemo, useState } from 'react';

export default function ThemeWrapper() {
    const [mode, setMode] = useState(getInitialMode);

    const toggleMode = useCallback(() => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
    }, []);

    useEffect(() => {
        if (typeof window !== "undefined") {
            window.localStorage.setItem("color-mode", mode);
        }
    }, [mode]);

    const contextValue = useMemo(
        () => ({ mode, toggleMode }),
        [mode, toggleMode]
    );

    return (
        <ColorModeContext.Provider value={contextValue}>
            <ThemeProvider theme={getTheme(mode)}>
                <CssBaseline />
                <RouterProvider router={router} />
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
}

function getInitialMode() {
    if (typeof window === "undefined") {
        return "light";
    }

    const stored = window.localStorage.getItem("color-mode");
    if (stored === "light" || stored === "dark") {
        return stored;
    }

    const prefersDark = window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;

    return prefersDark ? "dark" : "light";
}