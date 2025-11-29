// src/components/Footer.jsx
import React from "react";
import { Paper, Box, Typography, Link } from "@mui/material";

export function Footer() {
    const year = new Date().getFullYear();

    return (
        <Paper
            elevation={2}
            sx={{
                width: "90%",
                maxWidth: 1200,
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
                p: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                mt: 2
            }}
        >
            <Typography variant="body2" color="text.secondary">
                © {year} INotSleep
            </Typography>

            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2
                }}
            >
                <Link
                    href="https://github.com/inotsleep"
                    target="_blank"
                    rel="noopener"
                    underline="hover"
                    variant="body2"
                    color="text.secondary"
                >
                    GitHub
                </Link>
                    {/* <Link
                        href="https://discord.gg/..."
                        target="_blank"
                        rel="noopener"
                        underline="hover"
                        variant="body2"
                        color="text.secondary"
                    >
                        Discord
                    </Link> */}
            </Box>
        </Paper>
    );
}