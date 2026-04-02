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
                    fontFamily: "monospace",
                    bgcolor: "action.selected",
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

    if (!syntaxModule) {
        return (
            <Box
                component="pre"
                sx={{
                    margin: 0,
                    my: 1.5,
                    p: 1.6,
                    borderRadius: 1,
                    overflowX: "auto",
                    border: "1px solid rgba(64,72,93,0.5)",
                    bgcolor: "action.selected"
                }}
            >
                <Box component="code" sx={{ fontFamily: "monospace", fontSize: "0.9rem" }}>
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
                    borderRadius: 8,
                    fontSize: "0.9rem",
                    border: "1px solid rgba(64,72,93,0.5)"
                }}
                wrapLongLines
                {...props}
            >
                {raw}
            </SyntaxHighlighter>
        </Box>
    );
}

export default function MarkdownView({ children }) {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSlug]}
            components={{
                h1: (props) => <Heading level={1} {...props} />,
                h2: (props) => <Heading level={2} {...props} />,
                h3: (props) => <Heading level={3} {...props} />,
                p: ({ ...props }) => (
                    <Typography variant="body1" paragraph sx={{ color: "text.secondary" }} {...props} />
                ),
                a: ({ ...props }) => (
                    <MuiLink
                        {...props}
                        target="_blank"
                        rel="noopener noreferrer"
                    />
                ),
                li: ({ ...props }) => (
                    <li>
                        <Typography
                            component="span"
                            variant="body1"
                            {...props}
                        />
                    </li>
                ),

                img: ({ ...props }) => (
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

                code: (props) => <MarkdownCode {...props} />,
            }}
        >
            {children}
        </ReactMarkdown>
    );
}
