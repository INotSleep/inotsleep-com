import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";


export function RootLayout() {
    return <Box
        sx={{
            minHeight: '100dvh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-evenly',
            alignItems: 'center',
        }}>
        <Outlet />
    </Box>;
}