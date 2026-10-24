import { useMemo, useState } from "react";
import { Navigate, useParams, useSearchParams, Link as RouterLink } from "react-router-dom";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Box, Button, Drawer, IconButton, Paper, Stack, Typography } from "@mui/material";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import CloseIcon from "@mui/icons-material/Close";
import WikiSidebar from "../components/WikiSidebar.jsx";
import MarkdownView from "../components/MarkdownView.jsx";
import { BackLink, EmptyState, ErrorState, LoadingState, PageHeader } from "../components/ui.jsx";

function findLabel(nodes, id) {
    for (const node of nodes || []) {
        if (node.id === id && node.type !== "category") return node.label;
        const found = findLabel(node.children, id);
        if (found) return found;
    }
    return null;
}

export default function Wiki() {
    const { projectId = "", "*": wikiPath = "" } = useParams();
    const [searchParams] = useSearchParams();
    const { t, i18n } = useTranslation("wiki");
    const [navOpen, setNavOpen] = useState(false);

    const lang = searchParams.get("lang") || i18n.language || "en";

    const segments = useMemo(() => wikiPath.split("/").filter(Boolean), [wikiPath]);

    const { data: project } = useQuery({
        queryKey: ["project-meta", projectId, lang],
        queryFn: async () => (await axios.get(`/api/projects/${projectId}`, { params: { lang } })).data
    });

    const indexQuery = useQuery({
        queryKey: ["wiki-pages", projectId, lang],
        enabled: !!projectId,
        queryFn: async () => {
            const res = await axios.get(`/api/projects/${projectId}/wiki/pages`, { params: { lang } });
            return Array.isArray(res.data) ? res.data : [];
        }
    });
    const tree = indexQuery.data;

    const indexPageId = useMemo(
        () => tree?.find((x) => x.type === "index")?.id || "index",
        [tree]
    );
    const currentPageId = segments.length ? segments[segments.length - 1] : indexPageId;

    const pageQuery = useQuery({
        queryKey: ["wiki-page", projectId, lang, currentPageId],
        enabled: !!projectId && !!tree,
        queryFn: async () => {
            const res = await axios.get(
                `/api/projects/${projectId}/wiki/pages/${currentPageId}`,
                { params: { lang } }
            );
            return res.data?.content || "";
        }
    });

    const back = { to: `/projects/${projectId}`, label: project?.name || projectId };
    const homeTo = `/projects/${projectId}/wiki${searchParams.get("lang") ? `?lang=${lang}` : ""}`;

    if (indexQuery.isPending) return <LoadingState minHeight="50vh" />;

    if (indexQuery.isError) {
        if (indexQuery.error?.response?.status === 404) {
            return <Navigate to={`/404?path=/projects/${projectId}/wiki`} replace />;
        }
        return (
            <>
                <PageHeader title={t("title")} back={back} />
                <ErrorState error={indexQuery.error} onRetry={indexQuery.refetch} />
            </>
        );
    }

    const sidebar = (
        <WikiSidebar
            projectId={projectId}
            tree={tree}
            currentSegments={segments}
            lang={searchParams.get("lang")}
            onNavigate={() => setNavOpen(false)}
        />
    );

    const pageLabel = segments.length ? findLabel(tree, currentPageId) : null;

    let content;
    if (pageQuery.isPending) {
        content = <LoadingState />;
    } else if (pageQuery.isError) {
        content =
            pageQuery.error?.response?.status === 404 ? (
                <EmptyState
                    title={t("page_not_found")}
                    action={
                        <Button component={RouterLink} to={homeTo} variant="outlined">
                            {t("go_home")}
                        </Button>
                    }
                />
            ) : (
                <ErrorState error={pageQuery.error} onRetry={pageQuery.refetch} />
            );
    } else {
        content = (
            <Paper component="article" sx={{ p: { xs: 2.5, md: 5 }, minWidth: 0 }}>
                <MarkdownView>{pageQuery.data}</MarkdownView>
            </Paper>
        );
    }

    return (
        <>
            <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
                <BackLink {...back} />
                <Button
                    variant="outlined"
                    startIcon={<MenuOpenIcon />}
                    onClick={() => setNavOpen(true)}
                    sx={{ display: { md: "none" } }}
                >
                    {pageLabel || t("contents")}
                </Button>
            </Stack>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "240px minmax(0, 1fr)" },
                    gap: { md: 4 },
                    alignItems: "start",
                    mt: { md: -1 }
                }}
            >
                <Box
                    component="aside"
                    sx={{
                        display: { xs: "none", md: "block" },
                        position: "sticky",
                        top: 84,
                        maxHeight: "calc(100dvh - 108px)",
                        overflowY: "auto"
                    }}
                >
                    {sidebar}
                </Box>

                {content}
            </Box>

            <Drawer
                anchor="left"
                open={navOpen}
                onClose={() => setNavOpen(false)}
                PaperProps={{ sx: { width: 300, maxWidth: "85vw", border: "none" } }}
            >
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, height: 60 }}>
                    <Typography variant="h6" component="p">
                        {project?.name || t("contents")}
                    </Typography>
                    <IconButton onClick={() => setNavOpen(false)} aria-label={t("close")}>
                        <CloseIcon />
                    </IconButton>
                </Stack>
                <Box sx={{ p: 1 }}>{sidebar}</Box>
            </Drawer>
        </>
    );
}
