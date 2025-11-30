import React, { useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Paper,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import WikiSidebar from "../components/WikiSidebar.jsx";
import MarkdownView from "../components/MarkdownView.jsx";



export default function Wiki() {
    const { projectId = "", "*": wikiPath = "" } = useParams();
    const [searchParams] = useSearchParams();
    const { i18n } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const urlLang = searchParams.get("lang");
    const lang = urlLang || i18n.language || "en";

    const segments = useMemo(
        () => wikiPath.split("/").filter(Boolean),
        [wikiPath]
    );

    const {
        data: indexTree = [],
        isPending: isIndexPending,
        error: indexError,
    } = useQuery({
        queryKey: ["wiki-pages", projectId, lang],
        enabled: !!projectId,
        queryFn: async () => {
            const res = await axios.get(
                `/api/projects/${projectId}/wiki/pages`,
                { params: { lang } }
            );
            return res.data;
        },
    });

    const indexPageId = useMemo(() => {
        if (!indexTree || !Array.isArray(indexTree)) return "index";
        const n = indexTree.find((x) => x.type === "index");
        return (n && n.id) || "index";
    }, [indexTree]);

    const currentPageId = useMemo(() => {
        if (segments.length) return segments[segments.length - 1];
        return indexPageId; // запрос index страницы идёт по id из wiki
    }, [segments, indexPageId]);

    const {
        data: pageData,
        isPending: isPagePending,
        error: pageError,
    } = useQuery({
        queryKey: ["wiki-page", projectId, lang, currentPageId],
        enabled: !!projectId && !!currentPageId,
        queryFn: async () => {
            const res = await axios.get(
                `/api/projects/${projectId}/wiki/pages/${currentPageId}`,
                { params: { lang } }
            );
            return res.data; // { content: string }
        },
    });

    const pageContent = pageData?.content || "";

    const anyError = indexError || pageError;
    const errorMessage =
        anyError?.response?.data?.error || anyError?.message || null;

    // ---- контент (одинаковый и для десктопа, и для мобилки) ----
    const contentNode = (
        <>
            {errorMessage && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {errorMessage}
                </Alert>
            )}

            {isPagePending && !errorMessage ? (
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100%",
                    }}
                >
                    <CircularProgress />
                </Box>
            ) : pageContent && !errorMessage ? (
                <MarkdownView>{pageContent}</MarkdownView>
            ) : !errorMessage ? (
                <Typography color="text.secondary">
                    No content for this page.
                </Typography>
            ) : null}
        </>
    );

    // ---- навигация (разная обёртка для мобилки/десктопа) ----
    const sidebarDesktop = isIndexPending ? (
        <Box
            sx={{
                width: 280,
                flexShrink: 0,
                borderRight: "1px solid",
                borderColor: "divider",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <CircularProgress size={20} />
        </Box>
    ) : indexTree && indexTree.length ? (
        <WikiSidebar
            projectId={projectId}
            tree={indexTree}
            currentSegments={segments}
            lang={lang}
        />
    ) : (
        <Box
            sx={{
                width: 280,
                flexShrink: 0,
                borderRight: "1px solid",
                borderColor: "divider",
                p: 2,
            }}
        >
            <Typography variant="body2" color="text.secondary">
                No wiki index.
            </Typography>
        </Box>
    );

    const sidebarMobileInner = isIndexPending ? (
        <Box
            sx={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                py: 2,
            }}
        >
            <CircularProgress size={20} />
        </Box>
    ) : indexTree && indexTree.length ? (
        <WikiSidebar
            projectId={projectId}
            tree={indexTree}
            currentSegments={segments}
            lang={lang}
            fullWidth
        />
    ) : (
        <Box sx={{ width: "100%" }}>
            <Typography
                variant="subtitle2"
                sx={{ px: 1, mb: 0.5, color: "text.secondary" }}
            >
                Wiki
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>
                No wiki index.
            </Typography>
        </Box>
    );

    // ---- разный layout ----

    if (isMobile) {
        // Мобила: Paper с контентом, ниже Paper с навигацией
        return (
            <>
                <Paper
                    elevation={2}
                    sx={{
                        width: "100%",
                        p: 3,
                        display: "flex",
                        flexDirection: "column",
                        gap: 3,
                    }}
                >
                    {contentNode}
                </Paper>

                <Paper
                    elevation={2}
                    sx={{
                        width: "100%",
                        p: 3,
                        mt: 2,
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                    }}
                >
                    {sidebarMobileInner}
                </Paper>
            </>
        );
    }

    // Десктоп: твой исходный layout, вообще не трогаем
    return (
        <Paper
            elevation={2}
            sx={{
                width: "100%",
                p: 3,
                display: "flex",
                flexDirection: "column",
                gap: 3,
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    flex: 1,
                    minHeight: 0,
                }}
            >
                {/* Навигация слева */}
                {sidebarDesktop}

                {/* Контент справа */}
                <Box
                    sx={{
                        flexGrow: 1,
                        minWidth: 0,
                        pl: 2,
                        overflow: "auto",
                    }}
                >
                    {contentNode}
                </Box>
            </Box>
        </Paper>
    );
}
