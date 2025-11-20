import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";


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