import { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
    Box,
    Divider,
    Typography,
    List,
    ListItemButton,
    ListItemText,
    Collapse,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";

export default function WikiSidebar({ projectId, tree, currentSegments, lang, fullWidth = false }) {
    const [openCats, setOpenCats] = useState(new Set());

    const currentPageId =
        currentSegments.length === 0
            ? "index"
            : currentSegments[currentSegments.length - 1];

    const indexNode = tree.find((n) => n.type === "index");
    const otherNodes = tree.filter((n) => n.type !== "index");

    useEffect(() => {
        if (!currentSegments.length) return;

        const pathPrefixes = [];
        for (let i = 0; i < currentSegments.length - 1; i++) {
            pathPrefixes.push(currentSegments.slice(0, i + 1).join("/"));
        }

        setOpenCats((prev) => {
            const next = new Set(prev);
            pathPrefixes.forEach((p) => next.add(p));
            return next;
        });
    }, [currentSegments.join("/")]);

    const toggleCat = (key) => {
        setOpenCats((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const baseWikiPath = `/projects/${projectId}/wiki`;

    const makeTo = (segments) => {
        const tail = segments.length ? `/${segments.join("/")}` : "";
        const path = `${baseWikiPath}${tail}`;
        return lang ? `${path}?lang=${lang}` : path;
    };

    const renderNodes = (nodes, parentSegments = [], depth = 0) =>
        nodes.map((node) => {
            if (node.type === "category") {
                const catSegments = [...parentSegments, node.id];
                const catKey = catSegments.join("/");
                const isOpen = openCats.has(catKey);
                const isActiveBranch =
                    currentSegments.slice(0, catSegments.length).join("/") ===
                    catKey;

                return (
                    <Box
                        key={catKey}
                        sx={{
                            ml: depth > 0 ? 2 : 0,
                            mb: depth < 1 ? 1 : 0
                        }}
                    >
                        <ListItemButton
                            dense
                            onClick={() => toggleCat(catKey)}
                            sx={{
                                pl: depth > 0 ? 1 : 0.5,
                                pr: 1,
                                borderRadius: 1,
                                bgcolor: isActiveBranch
                                    ? "action.selected"
                                    : "transparent",
                                mb: 0.5,
                            }}
                        >
                            <ListItemText
                                primary={
                                    <Typography
                                        variant="body2"
                                        fontWeight={500}
                                        paddingLeft={1.5}
                                    >
                                        {node.label}
                                    </Typography>
                                }
                            />
                            {isOpen ? (
                                <ExpandLess fontSize="small" />
                            ) : (
                                <ExpandMore fontSize="small" />
                            )}
                        </ListItemButton>

                        <Collapse in={isOpen} timeout="auto" unmountOnExit>
                            <Box
                                sx={(theme) => ({
                                    position: "relative",
                                    // тонкая вертикальная полоска, без влияния на layout
                                    "&::before": {
                                        content: '""',
                                        position: "absolute",
                                        left: 8,              // можно подрегулировать под твой вкус
                                        top: 4,
                                        bottom: 4,
                                        borderLeft: "1px solid",
                                        borderColor: isActiveBranch
                                            ? theme.palette.primary.main
                                            : theme.palette.divider,
                                        pointerEvents: "none",
                                    },
                                })}
                            >
                                <List disablePadding>
                                    {renderNodes(
                                        node.children || [],
                                        catSegments,
                                        depth + 1
                                    )}
                                </List>
                            </Box>
                        </Collapse>
                    </Box>
                );
            }

            if (node.type === "page") {
                const pathSegments = [...parentSegments, node.id];
                const to = makeTo(pathSegments);
                const isActive = currentPageId === node.id;

                return (
                    <ListItemButton
                        key={pathSegments.join("/")}
                        dense
                        component={RouterLink}
                        to={to}
                        sx={{
                            ml: depth > 0 ? 2 : 0,
                            pl: 2,
                            borderRadius: 1,
                            bgcolor: isActive
                                ? "action.selected"
                                : "transparent",
                        }}
                    >
                        <ListItemText
                            primary={
                                <Typography variant="body2">
                                    {node.label}
                                </Typography>
                            }
                        />
                    </ListItemButton>
                );
            }

            return null;
        });

    return (
        <Box
            sx={{
                width: fullWidth ? "100%" : 280,
                flexShrink: 0,
                borderRight: fullWidth ? "none" : "1px solid",
                borderColor: "divider",
                pr: fullWidth ? 0 : 1,
                pt: 1,
            }}
        >
            <Typography
                variant="subtitle2"
                sx={{ px: 1, mb: 0.5, color: "text.secondary" }}
            >
                Wiki
            </Typography>

            <List dense disablePadding>
                {indexNode && (
                    <ListItemButton
                        dense
                        component={RouterLink}
                        to={makeTo([])}
                        sx={{
                            borderRadius: 1,
                            bgcolor:
                                currentPageId === "index"
                                    ? "action.selected"
                                    : "transparent",
                            mb: 0.5,
                        }}
                    >
                        <ListItemText
                            primary={
                                <Typography variant="body2" fontWeight={500}>
                                    {indexNode.label}
                                </Typography>
                            }
                        />
                    </ListItemButton>
                )}

                <Divider sx={{ my: 1 }} />

                {renderNodes(otherNodes)}
            </List>
        </Box>
    );
}
