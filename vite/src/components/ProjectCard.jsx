import { Box, Chip, Stack, Typography } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import LinkCard from "./LinkCard.jsx";
import { cardActionsSx } from "../lib/utils.js";
import { ExternalOrInternalButton } from "./ui.jsx";

function ProjectTags({ tags }) {
    if (!tags?.length) return null;

    return (
        <Stack direction="row" gap={0.75} flexWrap="wrap">
            {tags.map((tag) => (
                <Chip key={tag} label={tag} size="small" variant="outlined" sx={{ color: "text.secondary" }} />
            ))}
        </Stack>
    );
}

function ProjectButtons({ buttons }) {
    if (!buttons?.length) return null;

    return (
        <Box sx={cardActionsSx}>
            {buttons.map((button) => (
                <ExternalOrInternalButton
                    key={button.url}
                    url={button.url}
                    size="small"
                    variant="outlined"
                    endIcon={
                        button.url.startsWith("/") ? null : <OpenInNewIcon sx={{ fontSize: "16px !important" }} />
                    }
                >
                    {button.label}
                </ExternalOrInternalButton>
            ))}
        </Box>
    );
}

export default function ProjectCard({ project }) {
    return (
        <LinkCard to={`/projects/${project.id}`} title={project.name}>
            {project.description && (
                <Typography color="text.secondary">{project.description}</Typography>
            )}
            <ProjectTags tags={project.tags} />
            <Box sx={{ mt: "auto", pt: 0.5 }}>
                <ProjectButtons buttons={project.buttons} />
            </Box>
        </LinkCard>
    );
}
