import { Box, Button, CircularProgress, Link, Paper, Stack, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { errorMessage } from "../lib/utils.js";

export function BackLink({ to, label }) {
    return (
        <Link
            component={RouterLink}
            to={to}
            underline="none"
            sx={{
                alignSelf: "flex-start",
                display: "inline-flex",
                alignItems: "center",
                gap: 0.75,
                minWidth: 0,
                color: "text.secondary",
                fontWeight: 500,
                fontSize: "0.875rem",
                borderRadius: 1,
                transition: "color .15s",
                "&:hover": { color: "primary.main" }
            }}
        >
            <ArrowBackIcon sx={{ fontSize: 18 }} />
            <Box component="span" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {label}
            </Box>
        </Link>
    );
}

export function PageHeader({ title, back, actions, children }) {
    return (
        <Box component="header" sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {back && <BackLink {...back} />}
            <Stack
                direction={{ xs: "column", sm: "row" }}
                alignItems={{ xs: "flex-start", sm: "center" }}
                justifyContent="space-between"
                gap={2}
            >
                <Typography variant="h1" component="h1" sx={{ minWidth: 0, overflowWrap: "anywhere" }}>
                    {title}
                </Typography>
                {actions && (
                    <Stack direction="row" gap={1} flexWrap="wrap" sx={{ flexShrink: 0 }}>
                        {actions}
                    </Stack>
                )}
            </Stack>
            {children}
        </Box>
    );
}

export function LoadingState({ minHeight = 240 }) {
    return (
        <Box
            role="progressbar"
            sx={{ minHeight, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
            <CircularProgress size={28} />
        </Box>
    );
}

export function ErrorState({ error, onRetry }) {
    const { t } = useTranslation("common");

    return (
        <Paper sx={{ p: { xs: 3, md: 4 }, textAlign: "center" }}>
            <Typography variant="h5" component="p">
                {t("error_title")}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                {errorMessage(error, t("unknown_error"))}
            </Typography>
            {onRetry && (
                <Button variant="contained" onClick={onRetry} sx={{ mt: 2 }}>
                    {t("retry")}
                </Button>
            )}
        </Paper>
    );
}

export function EmptyState({ title, action }) {
    return (
        <Paper
            sx={{
                p: { xs: 3, md: 5 },
                textAlign: "center",
                borderStyle: "dashed",
                bgcolor: "transparent"
            }}
        >
            <Typography color="text.secondary">{title}</Typography>
            {action && <Box sx={{ mt: 2 }}>{action}</Box>}
        </Paper>
    );
}

export function SectionTitle({ children, action }) {
    return (
        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
            <Typography variant="h4" component="h2">
                {children}
            </Typography>
            {action}
        </Stack>
    );
}

export function ExternalOrInternalButton({ url, children, ...props }) {
    const isInternal = url.startsWith("/");
    const linkProps = isInternal
        ? { component: RouterLink, to: url }
        : { href: url, target: "_blank", rel: "noopener noreferrer" };

    return (
        <Button {...linkProps} {...props}>
            {children}
        </Button>
    );
}
