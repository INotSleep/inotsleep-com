import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import {
    Typography,
    Link as MuiLink,
    Box,
    useTheme,
} from "@mui/material";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import Heading from "./Heading";

export default function MarkdownView({ children }) {
    const theme = useTheme();
    const syntaxTheme = theme.palette.mode === "dark" ? oneDark : oneLight;

    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSlug]}
            components={{
                h1: (props) => <Heading level={1} {...props} />,
                h2: (props) => <Heading level={2} {...props} />,
                h3: (props) => <Heading level={3} {...props} />,
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

                code: ({ node, className, children, ...props }) => {
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
                        <Box
                            sx={(theme) => ({
                                my: 1.5,
                                // сам SyntaxHighlighter рендерит <pre>, красим скроллбар у него
                                "& > div": {
                                    maxHeight: "70vh",
                                    overflow: "auto",
                                    scrollbarWidth: "thin", // Firefox
                                    scrollbarColor: `${theme.palette.primary.main} ${theme.palette.background.paper}`,
                                    "&::-webkit-scrollbar": {
                                        width: 8,
                                        height: 8,
                                    },
                                    "&::-webkit-scrollbar-track": {
                                        backgroundColor: theme.palette.background.paper,
                                    },
                                    "&::-webkit-scrollbar-thumb": {
                                        backgroundColor: theme.palette.primary.main,
                                        borderRadius: 4,
                                    },
                                },
                            })}
                        >
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