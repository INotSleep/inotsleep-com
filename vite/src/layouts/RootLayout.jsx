import { Box } from "@mui/material";
import { Outlet, ScrollRestoration } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export default function RootLayout() {
    return (
        <Box sx={{ minHeight: "100dvh", display: "flex", flexDirection: "column", overflowX: "clip" }}>
            <Header />

            <Box
                component="main"
                sx={{
                    width: "100%",
                    flexGrow: 1,
                    px: { xs: 2, md: 4 },
                    pt: { xs: 3, md: 5 },
                    pb: { xs: 6, md: 8 }
                }}
            >
                <Box
                    sx={{
                        maxWidth: 1120,
                        mx: "auto",
                        display: "flex",
                        flexDirection: "column",
                        gap: { xs: 3, md: 4 }
                    }}
                >
                    <Outlet />
                </Box>
            </Box>

            <Footer />
            <ScrollRestoration />
        </Box>
    );
}
