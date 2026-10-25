import { Box, Button, Stack, Typography } from '@mui/material';
import { Link as RouterLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { monoSx } from '../lib/utils.js';
import { fontHeading } from '../theme/theme.js';
import { useDocumentTitle, withSite } from "../lib/title.js";

export default function NotFound() {
    const { t } = useTranslation("notfound");
    useDocumentTitle(withSite(t("title")));
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [searchParams] = useSearchParams();

    const path = searchParams.get("path") || pathname;
    const canGoBack = window.history.state?.idx > 0;

    return (
        <Box sx={{ py: { xs: 6, md: 12 }, textAlign: "center" }}>
            <Typography
                aria-hidden
                sx={{ fontFamily: fontHeading, fontWeight: 700, fontSize: "4.5rem", lineHeight: 1, color: "primary.main" }}
            >
                404
            </Typography>
            <Typography variant="h2" component="h1" sx={{ mt: 2 }}>
                {t("title")}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1, overflowWrap: "anywhere" }}>
                <Box component="code" sx={monoSx}>{path}</Box>
            </Typography>

            <Stack direction="row" gap={1.5} justifyContent="center" sx={{ mt: 4 }}>
                {canGoBack && (
                    <Button onClick={() => navigate(-1)} variant="outlined">
                        {t("goBackButton")}
                    </Button>
                )}
                <Button component={RouterLink} to="/" variant="contained">
                    {t("homeButton")}
                </Button>
            </Stack>
        </Box>
    );
}
