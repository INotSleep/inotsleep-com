import { Link as RouterLink } from "react-router-dom";
import { Paper, Stack, Typography } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

/**
 * Card that opens `to` when clicked anywhere. The title link is stretched over
 * the card; wrap extra buttons in a box with `cardActionsSx` so they stay
 * clickable.
 */
export default function LinkCard({ to, title, children }) {
    return (
        <Paper
            sx={{
                position: "relative",
                p: { xs: 2.5, md: 3 },
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                transition: "border-color .15s",
                "&:hover": { borderColor: "primary.main" },
                "&:hover .card-arrow": { transform: "translateX(3px)", color: "primary.main" },
                "&:has(.card-title:focus-visible)": {
                    borderColor: "primary.main",
                    boxShadow: (theme) => `0 0 0 3px ${theme.palette.action.focus}`
                }
            }}
        >
            <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
                <Typography
                    variant="h4"
                    component={RouterLink}
                    to={to}
                    className="card-title"
                    sx={{
                        color: "text.primary",
                        textDecoration: "none",
                        outline: "none",
                        "&:focus-visible": { boxShadow: "none" },
                        "&::after": { content: '""', position: "absolute", inset: 0, borderRadius: "inherit" }
                    }}
                >
                    {title}
                </Typography>
                <ArrowForwardIcon
                    className="card-arrow"
                    sx={{ color: "text.secondary", transition: "transform .15s, color .15s" }}
                />
            </Stack>
            {children}
        </Paper>
    );
}
