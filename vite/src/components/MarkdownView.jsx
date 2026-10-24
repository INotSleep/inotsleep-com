import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import {
    Typography,
    Link as MuiLink,
    Box,
    useTheme,
} from "@mui/material";
import Heading from "./Heading";
import {
    getMarkdownCodeLanguageLoader,
    resolveMarkdownCodeLanguage,
} from "../config/markdownCodeLanguages";
import { fontMono } from "../theme/theme.js";

let syntaxBasePromise = null;
const loadedLanguageIds = new Set();
const pendingLanguageLoads = new Map();

async function ensureSyntaxBase() {
    if (!syntaxBasePromise) {
        syntaxBasePromise = Promise.all([
            import("react-syntax-highlighter/dist/esm/prism-light"),
            import("react-syntax-highlighter/dist/esm/styles/prism/one-dark"),
            import("react-syntax-highlighter/dist/esm/styles/prism/one-light"),
        ]).then(([highlighter, darkTheme, lightTheme]) => ({
            Highlighter: highlighter.default,
            darkTheme: darkTheme.default,
            lightTheme: lightTheme.default,
        }));
    }
    return syntaxBasePromise;
}

async function ensureLanguageLoaded(Highlighter, languageId) {
    if (!languageId || loadedLanguageIds.has(languageId)) return;

    const inFlight = pendingLanguageLoads.get(languageId);
    if (inFlight) {
        await inFlight;
        return;
    }

    const loader = getMarkdownCodeLanguageLoader(languageId);
    if (!loader) return;

    const languagePromise = loader()
        .then((module) => {
            Highlighter.registerLanguage(languageId, module.default || module);
            loadedLanguageIds.add(languageId);
        })
        .catch((error) => {
            console.warn(`[MarkdownView] Failed to load language "${languageId}"`, error);
        })
        .finally(() => {
            pendingLanguageLoads.delete(languageId);
        });

    pendingLanguageLoads.set(languageId, languagePromise);
    await languagePromise;
}

async function loadSyntaxForLanguage(languageId) {
    const syntaxBase = await ensureSyntaxBase();
    await ensureLanguageLoaded(syntaxBase.Highlighter, languageId);
    return syntaxBase;
}

function MarkdownCode({ className, children, ...props }) {
    const theme = useTheme();
    const raw = String(children).replace(/\n$/, "");
    const match = /language-([A-Za-z0-9_+#-]+)/i.exec(className || "");
    const languageToken = match ? match[1] : null;
    const syntaxLanguage = resolveMarkdownCodeLanguage(languageToken);
    const hasLineBreak = raw.includes("\n");
    const isBlock = hasLineBreak || !!match;
    const shouldHighlight = isBlock && !!syntaxLanguage;

    const [syntaxModule, setSyntaxModule] = useState(null);

    useEffect(() => {
        if (!shouldHighlight || syntaxModule) return undefined;

        let alive = true;

        loadSyntaxForLanguage(syntaxLanguage).then((loadedModule) => {
            if (!alive) return;
            setSyntaxModule(loadedModule);
        });

        return () => {
            alive = false;
        };
    }, [shouldHighlight, syntaxLanguage, syntaxModule]);

    if (!isBlock) {
        return (
            <Box
                component="code"
                sx={{
                    fontFamily: fontMono,
                    bgcolor: "action.selected",
                    px: 0.6,
                    py: 0.1,
                    borderRadius: 1,
                    fontSize: "0.85em",
                }}
                {...props}
            >
                {raw}
            </Box>
        );
    }

    if (!syntaxModule) {
        return (
            <Box
                component="pre"
                sx={{
                    margin: 0,
                    my: 1.5,
                    p: 2,
                    borderRadius: 2,
                    overflowX: "auto",
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "action.hover"
                }}
            >
                <Box component="code" sx={{ fontFamily: fontMono, fontSize: "0.875rem" }}>
                    {raw}
                </Box>
            </Box>
        );
    }

    const SyntaxHighlighter = syntaxModule.Highlighter;
    const syntaxTheme =
        theme.palette.mode === "dark"
            ? syntaxModule.darkTheme
            : syntaxModule.lightTheme;

    return (
        <Box
            sx={(themeObj) => ({
                my: 1.5,
                "& > div": {
                    maxHeight: "70vh",
                    overflow: "auto",
                    scrollbarWidth: "thin",
                    scrollbarColor: `${themeObj.palette.primary.main} ${themeObj.palette.background.paper}`,
                    "&::-webkit-scrollbar": {
                        width: 8,
                        height: 8,
                    },
                    "&::-webkit-scrollbar-track": {
                        backgroundColor: themeObj.palette.background.paper,
                    },
                    "&::-webkit-scrollbar-thumb": {
                        backgroundColor: themeObj.palette.primary.main,
                        borderRadius: 4,
                    },
                },
            })}
        >
            <SyntaxHighlighter
                PreTag="div"
                language={syntaxLanguage || undefined}
                style={syntaxTheme}
                customStyle={{
                    margin: 0,
                    borderRadius: 12,
                    fontSize: "0.875rem",
                    border: `1px solid ${theme.palette.divider}`
                }}
                codeTagProps={{ style: { fontFamily: fontMono } }}
                wrapLongLines
                {...props}
            >
                {raw}
            </SyntaxHighlighter>
        </Box>
    );
}

const markdownSx = {
    maxWidth: 820,
    "& > :first-child": { mt: 0 },
    "& > :last-child": { mb: 0 },
    "& ul, & ol": { pl: 3, my: 1.5 },
    "& li": { my: 0.5 },
    "& li > p": { m: 0 },
    "& hr": { border: 0, borderTop: "1px solid", borderColor: "divider", my: 4 },
    "& blockquote": {
        m: 0,
        my: 2,
        pl: 2,
        borderLeft: "3px solid",
        borderColor: "primary.main",
        color: "text.secondary"
    },
    "& table": {
        width: "100%",
        borderCollapse: "collapse",
        my: 2,
        fontSize: "0.9rem",
        display: "block",
        overflowX: "auto"
    },
    "& th, & td": {
        textAlign: "left",
        px: 1.5,
        py: 1,
        borderBottom: "1px solid",
        borderColor: "divider"
    },
    "& th": { fontWeight: 600 }
};

// react-markdown passes its AST node as a prop; keep it off the DOM.
function omitNode(props) {
    const { node: _node, ...rest } = props;
    return rest;
}

export default function MarkdownView({ children }) {
    return (
        <Box sx={markdownSx}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSlug]}
                components={{
                    h1: (props) => <Heading level={1} {...props} />,
                    h2: (props) => <Heading level={2} {...props} />,
                    h3: (props) => <Heading level={3} {...props} />,
                    p: (props) => (
                        <Typography variant="body1" sx={{ my: 1.5 }} {...omitNode(props)} />
                    ),
                    a: (props) => {
                        const href = props.href || "";
                        return href.startsWith("#") || href.startsWith("/") ? (
                            <MuiLink {...omitNode(props)} />
                        ) : (
                            <MuiLink target="_blank" rel="noopener noreferrer" {...omitNode(props)} />
                        );
                    },
                    img: (props) => (
                        <Box
                            component="img"
                            sx={{
                                maxWidth: "100%",
                                height: "auto",
                                display: "block",
                                my: 2,
                                borderRadius: 2,
                            }}
                            {...omitNode(props)}
                        />
                    ),

                    code: (props) => <MarkdownCode {...omitNode(props)} />,
                }}
            >
                {children}
            </ReactMarkdown>
        </Box>
    );
}
