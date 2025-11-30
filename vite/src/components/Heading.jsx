import { Box, Typography, Link } from "@mui/material";

export default function Heading({ level, children, ...props }) {
    const id = props.id;
    const variant =
        level === 1 ? "h3" :
        level === 2 ? "h4" :
        "h5";

    const Component = `h${level}`;

    return (
        <Box
            component={Component}
            id={id}
            sx={{
                position: "relative",
                scrollMarginTop: 10,
                mb: 1.5,
                "&:hover .anchor-link": {
                    opacity: 1,
                },
            }}
            {...props}
        >
            {id ? (
                <Link
                    href={`#${id}`}
                    underline="none"
                    sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 1,
                        color: "inherit",
                        cursor: "pointer",
                    }}
                >
                    <Typography
                        variant={variant}
                        component="span"
                        sx={{
                            m: 0,
                            "&:hover": {
                                textDecoration: "underline"
                            }
                        }}
                    >
                        {children}
                    </Typography>

                    <Typography
                        component="span"
                        className="anchor-link"
                        sx={(theme) => ({
                            opacity: 0,
                            fontSize: "0.9rem",
                            color: "text.secondary",
                            transition: "opacity 0.15s ease",
                            "&:hover": {
                                color: theme.palette.text.primary,
                            },
                        })}
                    >
                        #
                    </Typography>
                </Link>
            ) : (
                <Typography
                    variant={variant}
                    component="span"
                    sx={{ m: 0 }}
                >
                    {children}
                </Typography>
            )}
        </Box>
    );
}
