import { Paper } from "@mui/material";
import UserPreferences from "./UserPreferences.jsx";


export function Header() {
    return <Paper elevation={2} sx={{
            width: '90%',
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
        }}>
            Header
            <UserPreferences />
        </Paper>;
}