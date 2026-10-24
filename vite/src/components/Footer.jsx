import { Box, Typography, Link, Stack } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";

export function Footer() {
    const year = new Date().getFullYear();

    return (
        <Box
            component="footer"
            sx={{
                borderTop: "1px solid",
                borderColor: "divider",
                px: { xs: 2, md: 4 },
                py: 3
            }}
        >
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                gap={2}
                sx={{ maxWidth: 1120, mx: "auto" }}
            >
                <Typography variant="body2" color="text.secondary">
                    © {year} INotSleep
                </Typography>
                <Link
                    href="https://github.com/inotsleep"
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.75,
                        borderRadius: 1,
                        "&:hover": { color: "text.primary" }
                    }}
                >
                    <GitHubIcon sx={{ fontSize: 18 }} />
                    GitHub
                </Link>
            </Stack>
        </Box>
    );
}
