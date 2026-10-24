import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import ProjectCard from "../components/ProjectCard.jsx";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "../components/ui.jsx";
import { useProjects } from "../lib/queries.js";

export default function Projects() {
    const { t } = useTranslation("projects");
    const { data: projects = [], isPending, isError, error, refetch } = useProjects();

    return (
        <>
            <PageHeader title={t("title")} />

            {isPending ? (
                <LoadingState />
            ) : isError ? (
                <ErrorState error={error} onRetry={refetch} />
            ) : projects.length === 0 ? (
                <EmptyState title={t("no_projects")} />
            ) : (
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
                        gap: 2
                    }}
                >
                    {projects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </Box>
            )}
        </>
    );
}
