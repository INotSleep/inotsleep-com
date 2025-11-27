import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import './index.css'
import { getTheme } from './theme/theme.js';
import { RouterProvider } from 'react-router-dom';
import { router } from './router.jsx';
import './i18n';
import { ColorModeContext } from './theme/ColorModeContext.jsx';
import {
    QueryClient,
    QueryClientProvider,
} from "@tanstack/react-query";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: false
        },
    },
});

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

function ThemeWrapper() {
    const [mode, setMode] = React.useState(getInitialMode);

    const toggleMode = React.useCallback(() => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
    }, []);

    React.useEffect(() => {
        if (typeof window !== "undefined") {
            window.localStorage.setItem("color-mode", mode);
        }
    }, [mode]);

    const contextValue = React.useMemo(
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



createRoot(document.getElementById("root")).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <ThemeWrapper />
        </QueryClientProvider>
    </StrictMode>
);