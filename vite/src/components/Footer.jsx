// src/components/Footer.jsx
import React from "react";
import { Box, Typography, Link, Stack } from "@mui/material";

export function Footer() {
    const year = new Date().getFullYear();

    return (
        <Box
            sx={{
                width: "100%",
                borderTop: "1px solid",
                borderColor: "divider",
                background: (theme) =>
                    theme.palette.mode === "dark"
                        ? "linear-gradient(180deg, rgba(6,14,32,0.60) 0%, rgba(6,14,32,0.88) 100%)"
                        : "linear-gradient(180deg, rgba(250,252,255,0.78) 0%, rgba(246,250,255,0.95) 100%)",
                backdropFilter: "blur(12px)",
                px: { xs: 2, md: 4 },
                py: 2.2,
                display: "flex",
                justifyContent: "center",
                mt: "auto"
            }}
        >
            <Box
                sx={{
                    width: "100%",
                    maxWidth: 1320,
                    display: "flex",
                    alignItems: { xs: "flex-start", md: "center" },
                    justifyContent: "space-between",
                    gap: 1.5,
                    flexWrap: "wrap"
                }}
            >
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ letterSpacing: "0.08em", textTransform: "uppercase" }}
                >
                    © {year} INotSleep
                </Typography>

                <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
                    <Link
                        href="https://github.com/inotsleep"
                        target="_blank"
                        rel="noopener"
                        underline="hover"
                        variant="body2"
                        color="text.secondary"
                        sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
                    >
                        GitHub
                    </Link>
                </Stack>
            </Box>
        </Box>
    );
}
