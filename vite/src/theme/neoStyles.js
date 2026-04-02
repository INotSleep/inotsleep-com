export const pagePanelSx = {
    width: "100%",
    p: { xs: 2, md: 3 },
    display: "flex",
    flexDirection: "column",
    gap: 2
};

export const sectionTitleSx = {
    mb: 0.5,
    fontFamily: '"Space Grotesk", Inter, sans-serif',
    letterSpacing: "-0.01em"
};

export const monoLabelSx = {
    fontFamily:
        '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Courier New", monospace',
    letterSpacing: "0.02em"
};

export const itemCardSx = {
    borderRadius: 2,
    border: "1px solid",
    borderColor: "divider",
    background: (theme) =>
        theme.palette.mode === "dark"
            ? "linear-gradient(170deg, rgba(15,25,48,0.62) 0%, rgba(9,19,40,0.84) 100%)"
            : "linear-gradient(170deg, rgba(255,255,255,0.92) 0%, rgba(244,248,253,0.96) 100%)",
    p: 2
};

export const subtleTextSx = {
    color: "text.secondary",
    opacity: 0.95
};
