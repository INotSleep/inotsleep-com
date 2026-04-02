import React from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export default function RootLayout() {
    return (
        <Box
            sx={{
                minHeight: "100dvh",
                display: "flex",
                flexDirection: "column"
            }}
        >
            <Header />

            <Box
                component="main"
                sx={{
                    width: "100%",
                    flexGrow: 1,
                    px: { xs: 2, md: 4 },
                    pt: { xs: 11, md: 13 },
                    pb: { xs: 4, md: 6 }
                }}
            >
                <Box
                    sx={{
                        maxWidth: 1320,
                        mx: "auto",
                        display: "flex",
                        flexDirection: "column",
                        gap: 2
                    }}
                >
                    <Outlet />
                </Box>
            </Box>

            <Footer />
        </Box>
    );
}
