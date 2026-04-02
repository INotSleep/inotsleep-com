// Add/disable markdown code languages here.
// Keep only languages you really use to avoid bloating bundles.
const LANGUAGE_DEFINITIONS = [
    {
        id: "bash",
        aliases: ["bash", "sh", "shell", "zsh", "console", "terminal"],
        loader: () => import("react-syntax-highlighter/dist/esm/languages/prism/bash"),
    },
    {
        id: "markup",
        aliases: ["markup", "html", "xml", "svg", "xhtml", "mathml"],
        loader: () => import("react-syntax-highlighter/dist/esm/languages/prism/markup"),
    },
    {
        id: "css",
        aliases: ["css", "scss", "less"],
        loader: () => import("react-syntax-highlighter/dist/esm/languages/prism/css"),
    },
    {
        id: "javascript",
        aliases: ["javascript", "js", "node", "nodejs"],
        loader: () => import("react-syntax-highlighter/dist/esm/languages/prism/javascript"),
    },
    {
        id: "jsx",
        aliases: ["jsx", "react", "react-jsx"],
        loader: () => import("react-syntax-highlighter/dist/esm/languages/prism/jsx"),
    },
    {
        id: "typescript",
        aliases: ["typescript", "ts"],
        loader: () => import("react-syntax-highlighter/dist/esm/languages/prism/typescript"),
    },
    {
        id: "tsx",
        aliases: ["tsx"],
        loader: () => import("react-syntax-highlighter/dist/esm/languages/prism/tsx"),
    },
    {
        id: "json",
        aliases: ["json", "jsonc", "json5"],
        loader: () => import("react-syntax-highlighter/dist/esm/languages/prism/json"),
    },
    {
        id: "yaml",
        aliases: ["yaml", "yml"],
        loader: () => import("react-syntax-highlighter/dist/esm/languages/prism/yaml"),
    },
    {
        id: "sql",
        aliases: ["sql"],
        loader: () => import("react-syntax-highlighter/dist/esm/languages/prism/sql"),
    },
    {
        id: "java",
        aliases: ["java"],
        loader: () => import("react-syntax-highlighter/dist/esm/languages/prism/java"),
    },
    {
        id: "kotlin",
        aliases: ["kotlin", "kt"],
        loader: () => import("react-syntax-highlighter/dist/esm/languages/prism/kotlin"),
    },
    {
        id: "go",
        aliases: ["go", "golang"],
        loader: () => import("react-syntax-highlighter/dist/esm/languages/prism/go"),
    },
    {
        id: "c",
        aliases: ["c", "h"],
        loader: () => import("react-syntax-highlighter/dist/esm/languages/prism/c"),
    },
    {
        id: "cpp",
        aliases: ["cpp", "c++", "cc", "cxx", "hpp", "hxx"],
        loader: () => import("react-syntax-highlighter/dist/esm/languages/prism/cpp"),
    },
    {
        id: "csharp",
        aliases: ["csharp", "c#", "cs", "dotnet"],
        loader: () => import("react-syntax-highlighter/dist/esm/languages/prism/csharp"),
    },
    {
        id: "diff",
        aliases: ["diff", "patch", "git-diff"],
        loader: () => import("react-syntax-highlighter/dist/esm/languages/prism/diff"),
    },
    {
        id: "docker",
        aliases: ["docker", "dockerfile"],
        loader: () => import("react-syntax-highlighter/dist/esm/languages/prism/docker"),
    },
    {
        id: "toml",
        aliases: ["toml"],
        loader: () => import("react-syntax-highlighter/dist/esm/languages/prism/toml"),
    },
    {
        id: "ini",
        aliases: ["ini", "cfg", "conf"],
        loader: () => import("react-syntax-highlighter/dist/esm/languages/prism/ini"),
    },
    {
        id: "groovy",
        aliases: ["groovy", "gradle"],
        loader: () => import("react-syntax-highlighter/dist/esm/languages/prism/groovy"),
    },
];

const languageById = new Map();
const aliasToId = new Map();

for (const definition of LANGUAGE_DEFINITIONS) {
    languageById.set(definition.id, definition);
    for (const alias of definition.aliases) {
        aliasToId.set(alias.toLowerCase(), definition.id);
    }
}

export const markdownCodeLanguageConfig = LANGUAGE_DEFINITIONS.map(
    ({ id, aliases }) => ({
        id,
        aliases: [...aliases],
    })
);

export function resolveMarkdownCodeLanguage(rawLanguage) {
    if (!rawLanguage) return null;
    const normalized = rawLanguage.trim().toLowerCase();
    return aliasToId.get(normalized) ?? null;
}

export function getMarkdownCodeLanguageLoader(languageId) {
    return languageById.get(languageId)?.loader ?? null;
}
