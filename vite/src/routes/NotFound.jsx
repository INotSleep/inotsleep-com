import { Stack, Typography, Button, Paper } from '@mui/material';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import SearchOffOutlinedIcon from '@mui/icons-material/SearchOffOutlined';
import { Trans, useTranslation } from 'react-i18next';
import { pagePanelSx, subtleTextSx } from "../theme/neoStyles.js";

export default function NotFound() {
    const { t } = useTranslation("notfound");
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const path = new URLSearchParams(window.location.search).get("path") || pathname

    return (
            <Paper sx={{
                    ...pagePanelSx,
                    maxWidth: 'min(72ch, 100%)',
                    textAlign: 'center',
                    mx: "auto",
                    py: { xs: 5, md: 7 }
                }}>
                <Stack spacing={2} alignItems="center">
                    <SearchOffOutlinedIcon sx={{ fontSize: 64, opacity: 0.85, color: "primary.main" }} />
                    <Typography variant="h1" component="h1">
                        {t("title")}
                    </Typography>

                    <Typography variant="body1" sx={subtleTextSx}>
                        <Trans
                            ns="notfound"
                            i18nKey="subtitle"
                            values={{ path: path }}
                            components={{
                                code: <code />,
                                strong: <strong />
                            }}
                        />

                    </Typography>

                    <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
                        <Button onClick={() => navigate(-1)} variant="outlined">
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
    
