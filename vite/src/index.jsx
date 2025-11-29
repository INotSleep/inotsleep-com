import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n';
import {
    QueryClient,
    QueryClientProvider,
} from "@tanstack/react-query";
import ThemeWrapper from './theme/ThemeWrapper.jsx';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: false
        },
    },
});

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <ThemeWrapper/>
        </QueryClientProvider>
    </StrictMode>
);