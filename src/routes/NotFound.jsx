import { Box, Stack, Typography, Button, Paper } from '@mui/material';
import { Link as RouterLink, useLocation, useNavigate, useRouteError } from 'react-router-dom';
import SearchOffOutlinedIcon from '@mui/icons-material/SearchOffOutlined'; // убери импорт, если нет иконок
import { Trans, useTranslation } from 'react-i18next';

export default function NotFound() {
    const { t } = useTranslation("notfound");
    const navigate = useNavigate();
    const { pathname } = useLocation();

    return (
            <Paper elevation={2} sx={{
                    maxWidth: 'min(70ch, 90vw)',
                    textAlign: 'center',
                    p: 4,
                }}>
                <Stack spacing={2} alignItems="center">
                    <SearchOffOutlinedIcon sx={{ fontSize: 56, opacity: 0.8 }} />
                    <Typography variant="h3" component="h1" sx={{ letterSpacing: 1 }}>
                        {t("title")}
                    </Typography>

                    <Typography variant="body1">
                        <Trans
                            ns="notfound"
                            i18nKey="subtitle"
                            values={{ path: pathname }}
                            components={{
                                code: <code />,
                                strong: <strong />
                            }}
                        />

                    </Typography>

                    <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
                        <Button onClick={() => navigate(-1)} variant="contained">
                            {t("goBackButton")}
                        </Button>
                        <Button component={RouterLink} to="/" variant="contained">
                            {t("homeButton")}
                        </Button>
                    </Stack>
                </Stack>
            </Paper>
    );
}
    