// NotFound.jsx
import { Box, Stack, Typography, Button } from '@mui/material';
import { Link as RouterLink, useLocation, useNavigate, useRouteError } from 'react-router-dom';
import SearchOffOutlinedIcon from '@mui/icons-material/SearchOffOutlined'; // убери импорт, если нет иконок
import { GlassPaper } from '../objects/GlassPaper';

export function NotFound() {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    return (
        <GlassPaper elevation={0} sx={{ maxWidth: 'min(70ch, 90vw)', textAlign: 'center' }}>
            <Stack spacing={2} alignItems="center">
                <SearchOffOutlinedIcon sx={{ fontSize: 56, opacity: 0.8 }} />
                <Typography variant="h3" component="h1" sx={{ letterSpacing: 1 }}>
                    404 — Not Found
                </Typography>

                <Typography variant="body1">
                    Requested page <code>{pathname}</code> was not found.
                </Typography>

                <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
                    <Button onClick={() => navigate(-1)} variant="contained">
                        Go Back
                    </Button>
                    <Button component={RouterLink} to="/" variant="contained">
                        Home
                    </Button>
                </Stack>
            </Stack>
        </GlassPaper>
    );
}
    