import { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, List, ListItemButton, ListItemText, Collapse } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";

export default function WikiSidebar({ projectId, tree, currentSegments, lang, onNavigate }) {
    const [openCats, setOpenCats] = useState(new Set());
    const currentSegmentsKey = currentSegments.join("/");

    const currentPageId =
        currentSegments.length === 0
            ? "index"
            : currentSegments[currentSegments.length - 1];

    const indexNode = tree.find((n) => n.type === "index");
    const otherNodes = tree.filter((n) => n.type !== "index");

    // Open every category on the path to the current page.
    useEffect(() => {
        const segments = currentSegmentsKey ? currentSegmentsKey.split("/") : [];
        if (segments.length < 2) return;

        setOpenCats((prev) => {
            const next = new Set(prev);
            for (let i = 0; i < segments.length - 1; i++) {
                next.add(segments.slice(0, i + 1).join("/"));
            }
            return next;
        });
    }, [currentSegmentsKey]);

    const toggleCat = (key) => {
        setOpenCats((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const makeTo = (segments) => {
        const tail = segments.length ? `/${segments.join("/")}` : "";
        const path = `/projects/${projectId}/wiki${tail}`;
        return lang ? `${path}?lang=${lang}` : path;
    };

    const itemSx = (depth) => ({ pl: 1.5 + depth * 1.5, py: 0.6, mb: 0.25 });

    const renderNodes = (nodes, parentSegments = [], depth = 0) =>
        nodes.map((node) => {
            if (node.type === "category") {
                const catSegments = [...parentSegments, node.id];
                const catKey = catSegments.join("/");
                const isOpen = openCats.has(catKey);

                return (
                    <Box key={catKey}>
                        <ListItemButton
                            onClick={() => toggleCat(catKey)}
                            aria-expanded={isOpen}
                            sx={itemSx(depth)}
                        >
                            <ListItemText
                                primary={node.label}
                                primaryTypographyProps={{ variant: "body2", fontWeight: 600 }}
                            />
                            {isOpen ? (
                                <ExpandLess fontSize="small" sx={{ color: "text.secondary" }} />
                            ) : (
                                <ExpandMore fontSize="small" sx={{ color: "text.secondary" }} />
                            )}
                        </ListItemButton>

                        <Collapse in={isOpen} timeout="auto" unmountOnExit>
                            <List disablePadding>
                                {renderNodes(node.children || [], catSegments, depth + 1)}
                            </List>
                        </Collapse>
                    </Box>
                );
            }

            if (node.type === "page") {
                const pathSegments = [...parentSegments, node.id];
                const isActive = currentPageId === node.id;

                return (
                    <ListItemButton
                        key={pathSegments.join("/")}
                        component={RouterLink}
                        to={makeTo(pathSegments)}
                        selected={isActive}
                        aria-current={isActive ? "page" : undefined}
                        onClick={onNavigate}
                        sx={itemSx(depth)}
                    >
                        <ListItemText
                            primary={node.label}
                            primaryTypographyProps={{
                                variant: "body2",
                                color: isActive ? "primary.main" : "text.secondary",
                                fontWeight: isActive ? 600 : 400
                            }}
                        />
                    </ListItemButton>
                );
            }

            return null;
        });

    return (
        <List component="nav" dense disablePadding>
            {indexNode && (
                <ListItemButton
                    component={RouterLink}
                    to={makeTo([])}
                    selected={currentPageId === "index"}
                    aria-current={currentPageId === "index" ? "page" : undefined}
                    onClick={onNavigate}
                    sx={itemSx(0)}
                >
                    <ListItemText
                        primary={indexNode.label}
                        primaryTypographyProps={{
                            variant: "body2",
                            fontWeight: 600,
                            color: currentPageId === "index" ? "primary.main" : "text.primary"
                        }}
                    />
                </ListItemButton>
            )}

            {renderNodes(otherNodes)}
        </List>
    );
}
