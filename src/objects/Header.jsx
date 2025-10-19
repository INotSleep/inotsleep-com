import { Paper } from "@mui/material";


export function Header() {
    return <Paper elevation={2} sx={{
            width: '90%',
            
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            p: 2
        }}>
            Header
        </Paper>;
}