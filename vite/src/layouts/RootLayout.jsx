// src/layout/RootLayout.jsx
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
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
            }}
        >
            <Header />

            <Box
                component="main"
                sx={{
                    width: "90%",
                    maxWidth: 1200,
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Outlet />
            </Box>

            <Footer />
        </Box>
    );
}