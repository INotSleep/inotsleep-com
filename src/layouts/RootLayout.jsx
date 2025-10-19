import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import { Header } from "../objects/Header";
import { Footer } from "../objects/Footer";


export function RootLayout() {
    return <Box
        sx={{
            minHeight: '100dvh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
        }}>
        <Header />
        <Outlet />
        <Footer />
    </Box>;
}