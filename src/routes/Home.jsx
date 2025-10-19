import { Paper } from "@mui/material";  

export function Home() {
    return <Paper elevation={2} sx={{
            maxWidth: 'min(70ch, 90vw)',
            textAlign: 'center',
            p: 4,
        }}>
        Home Page
    </Paper>;
}