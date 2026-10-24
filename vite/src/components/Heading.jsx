import { Box, Typography, Link } from "@mui/material";

const VARIANTS = { 1: "h2", 2: "h3", 3: "h4" };

export default function Heading({ level, children, ...rest }) {
    const { node: _node, ...props } = rest;
    const id = props.id;

    return (
        <Box
            component={`h${level}`}
            sx={{
                scrollMarginTop: 84,
                mt: level === 1 ? 0 : 4,
                mb: 1.5,
                "&:hover .anchor-link": { opacity: 1 }
            }}
            {...props}
        >
            <Typography variant={VARIANTS[level] || "h5"} component="span">
                {children}
            </Typography>
            {id && (
                <Link
                    href={`#${id}`}
                    className="anchor-link"
                    underline="none"
                    aria-label="#"
                    sx={{
                        ml: 1,
                        opacity: 0,
                        color: "text.secondary",
                        transition: "opacity .15s, color .15s",
                        "&:hover": { color: "primary.main" },
                        "&:focus-visible": { opacity: 1 }
                    }}
                >
                    #
                </Link>
            )}
        </Box>
    );
}
