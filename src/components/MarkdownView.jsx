import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
    Typography,
    Link as MuiLink,
    Box,
    useTheme,
} from "@mui/material";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function MarkdownView({ children }) {
    const theme = useTheme();
    const syntaxTheme = theme.palette.mode === "dark" ? oneDark : oneLight;

    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                h1: ({ node, ...props }) => (
                    <Typography variant="h3" gutterBottom {...props} />
                ),
                h2: ({ node, ...props }) => (
                    <Typography variant="h4" gutterBottom {...props} />
                ),
                h3: ({ node, ...props }) => (
                    <Typography variant="h5" gutterBottom {...props} />
                ),
                p: ({ node, ...props }) => (
                    <Typography variant="body1" paragraph {...props} />
                ),
                a: ({ node, ...props }) => (
                    <MuiLink
                        {...props}
                        target="_blank"
                        rel="noopener noreferrer"
                    />
                ),
                li: ({ node, ...props }) => (
                    <li>
                        <Typography
                            component="span"
                            variant="body1"
                            {...props}
                        />
                    </li>
                ),

                img: ({ node, ...props }) => (
                    <Box
                        component="img"
                        sx={{
                            maxWidth: "80%",
                            ml: 2,
                            height: "auto",
                            display: "block",
                            my: 2,
                            borderRadius: "5px",
                        }}
                        {...props}
                    />
                ),

                code: ({ node, className, children, ...props }) =>{
                    const raw = String(children).replace(/\n$/, "");
                    const match = /language-(\w+)/.exec(className || "");
                    const hasLineBreak = raw.includes("\n");
                    const isBlock = hasLineBreak || !!match;

                    if (!isBlock) {
                        return (
                            <Box
                                component="code"
                                sx={{
                                    fontFamily: "monospace",
                                    bgcolor: "action.hover",
                                    px: 0.5,
                                    borderRadius: 0.5,
                                    fontSize: "0.9em",
                                }}
                                {...props}
                            >
                                {raw}
                            </Box>
                        );
                    }
                    return (
                        <Box sx={{ my: 1.5 }}>
                            <SyntaxHighlighter
                                PreTag="div"
                                language={match ? match[1] : undefined}
                                style={syntaxTheme}
                                customStyle={{
                                    margin: 0,
                                    borderRadius: 8,
                                    fontSize: "0.9rem",
                                }}
                                wrapLongLines
                                {...props}
                            >
                                {raw}
                            </SyntaxHighlighter>
                        </Box>
                    );
                },
            }}
        >
            {children}
        </ReactMarkdown>
    );
}