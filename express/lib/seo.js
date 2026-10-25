import fs from "node:fs/promises";
import path from "path";
import { marked } from "marked";
import { loadProjectsConfig, resolveProjectLangDir, resolveInside, pathExists, readJsonFile } from "../modules/api.js";

// What search engines and link previews get before the app's JavaScript runs:
// a title, a description and the page text for every public page.

const SITE_NAME = "INotSleep";
const LANG = "en";
const PAGE_ID_RE = /^[a-z0-9_-]+$/i;

export const siteUrl = (process.env.BASE_URL || "https://inotsleep.com").replace(/\/+$/, "");

// UI strings are shared with the frontend, so titles read the same before and after it loads.
const stringsDir = path.join(process.cwd(), "..", "vite", "src", "i18n", "resources", LANG);
let stringsPromise = null;

function loadStrings() {
    if (!stringsPromise) {
        const read = async (ns) => {
            try {
                return await readJsonFile(path.join(stringsDir, `${ns}.json`));
            } catch {
                return {};
            }
        };
        stringsPromise = Promise.all(["home", "header", "notfound", "wiki", "i18n"].map(read))
            .then(([home, header, notfound, wiki, i18n]) => ({ home, header, notfound, wiki, i18n }));
    }
    return stringsPromise;
}

export function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (c) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[c]);
}

function inlineText(tokens) {
    return (tokens || [])
        .map((t) => (t.type === "image" ? "" : t.tokens ? inlineText(t.tokens) : (t.text ?? "")))
        .join("");
}

function truncate(text, max = 160) {
    if (text.length <= max) return text;
    const cut = text.slice(0, max - 1);
    const space = cut.lastIndexOf(" ");
    return `${(space > 80 ? cut.slice(0, space) : cut).replace(/[\s,.;:]+$/, "")}…`;
}

/** The opening paragraphs of a Markdown page, enough for a search snippet. */
function summary(markdown) {
    let text = "";
    for (const token of marked.lexer(markdown)) {
        if (token.type !== "paragraph") continue;
        const paragraph = inlineText(token.tokens).replace(/\s+/g, " ").trim();
        if (paragraph) text = text ? `${text} ${paragraph}` : paragraph;
        if (text.length >= 120) break;
    }
    return text ? truncate(text) : null;
}

const renderMarkdown = (markdown) => marked.parse(markdown, { gfm: true });

async function loadProjects() {
    const config = await loadProjectsConfig();
    const list = config?.[LANG] || config?.en;
    return Array.isArray(list) ? list : [];
}

async function readText(filePath) {
    if (!filePath || !(await pathExists(filePath))) return null;
    return fs.readFile(filePath, "utf-8");
}

async function mtime(filePath) {
    try {
        return (await fs.stat(filePath)).mtime;
    } catch {
        return null;
    }
}

/** Every wiki page with the URL segments the frontend uses for it. */
function flattenWiki(tree) {
    const pages = [];
    const walk = (nodes, parents) => {
        for (const node of nodes || []) {
            if (node.type === "index") {
                pages.push({ id: node.id || "index", label: node.label, segments: [] });
            } else if (node.type === "category") {
                walk(node.children, [...parents, node.id]);
            } else if (node.type === "page") {
                pages.push({ id: node.id, label: node.label, segments: [...parents, node.id] });
            }
        }
    };
    walk(tree, []);
    return pages;
}

async function loadWiki(projectId) {
    const resolved = await resolveProjectLangDir(projectId, LANG);
    if (!resolved?.langDir) return null;

    const dir = resolveInside(resolved.langDir, "wiki");
    const indexPath = dir && resolveInside(dir, "pages.json");
    if (!indexPath || !(await pathExists(indexPath))) return null;

    let tree;
    try {
        tree = await readJsonFile(indexPath);
    } catch {
        return null;
    }
    if (!Array.isArray(tree)) return null;

    return { dir, tree, pages: flattenWiki(tree) };
}

function pageFile(wiki, pageId) {
    return PAGE_ID_RE.test(pageId) ? resolveInside(wiki.dir, "pages", `${pageId}.md`) : null;
}

const wikiBase = (projectId) => `/projects/${projectId}/wiki`;
const wikiPath = (projectId, page) =>
    page.segments.length ? `${wikiBase(projectId)}/${page.segments.join("/")}` : wikiBase(projectId);

function wikiNav(projectId, nodes, parents = []) {
    const items = (nodes || []).map((node) => {
        if (node.type === "category") {
            const segments = [...parents, node.id];
            return `<li>${escapeHtml(node.label)}${wikiNav(projectId, node.children, segments)}</li>`;
        }
        const segments = node.type === "index" ? [] : [...parents, node.id];
        return `<li><a href="${escapeHtml(wikiPath(projectId, { segments }))}">${escapeHtml(node.label)}</a></li>`;
    });
    return `<ul>${items.join("")}</ul>`;
}

function projectList(projects) {
    const items = projects.map((p) =>
        `<li><a href="/projects/${escapeHtml(p.id)}">${escapeHtml(p.name)}</a><p>${escapeHtml(p.description)}</p></li>`
    );
    return `<ul>${items.join("")}</ul>`;
}

const withSite = (title) => `${title} | ${SITE_NAME}`;

async function notFound() {
    const { notfound } = await loadStrings();
    return {
        status: 404,
        title: withSite(notfound.title || "Page not found"),
        noindex: true,
        body: `<h1>${escapeHtml(notfound.title || "Page not found")}</h1>`
    };
}

async function homePage() {
    const { home, header } = await loadStrings();
    const projects = await loadProjects();
    return {
        status: 200,
        path: "/",
        title: home.meta_title || SITE_NAME,
        description: home.hero?.subtitle,
        body: `<h1>${escapeHtml(home.hero?.title || SITE_NAME)}</h1>` +
            `<p>${escapeHtml(home.hero?.subtitle)}</p>` +
            `<h2>${escapeHtml(header.projects || "Projects")}</h2>${projectList(projects)}`
    };
}

async function projectsPage() {
    const { home, header } = await loadStrings();
    const projects = await loadProjects();
    return {
        status: 200,
        path: "/projects",
        title: withSite(header.projects || "Projects"),
        description: home.hero?.subtitle,
        body: `<h1>${escapeHtml(header.projects || "Projects")}</h1>${projectList(projects)}`
    };
}

async function projectPage(projectId) {
    const { header, wiki: wikiStrings } = await loadStrings();
    const project = (await loadProjects()).find((p) => p.id === projectId);
    if (!project) return notFound();

    const resolved = await resolveProjectLangDir(projectId, LANG);
    const readme = resolved?.langDir ? await readText(resolveInside(resolved.langDir, "README.md")) : null;
    const wiki = await loadWiki(projectId);

    const links = (project.buttons || []).map((b) => ({ label: b.label, url: b.url }));
    if (wiki) links.push({ label: wikiStrings.title || "Documentation", url: wikiBase(projectId) });
    if (project.repo) links.push({ label: "GitHub", url: `https://github.com/${project.repo}` });

    return {
        status: 200,
        path: `/projects/${projectId}`,
        title: withSite(project.pageTitle || project.name),
        description: project.description,
        body: `<p><a href="/projects">${escapeHtml(header.projects || "Projects")}</a></p>` +
            `<h1>${escapeHtml(project.name)}</h1><p>${escapeHtml(project.description)}</p>` +
            `<ul>${links.map((l) => `<li><a href="${escapeHtml(l.url)}">${escapeHtml(l.label)}</a></li>`).join("")}</ul>` +
            (readme ? `<article>${renderMarkdown(readme)}</article>` : "")
    };
}

async function wikiPage(projectId, segments) {
    const { wiki: wikiStrings } = await loadStrings();
    const project = (await loadProjects()).find((p) => p.id === projectId);
    const wiki = project && await loadWiki(projectId);
    if (!wiki) return notFound();

    // The frontend shows the page named by the last segment, so that decides here too.
    const page = segments.length
        ? wiki.pages.find((p) => p.segments.length && p.id === segments[segments.length - 1])
        : wiki.pages.find((p) => !p.segments.length) || { id: "index", label: null, segments: [] };
    const markdown = page && await readText(pageFile(wiki, page.id));
    if (markdown == null) return notFound();

    const docTitle = (wikiStrings.doc_title || "{{project}} documentation").replace("{{project}}", project.name);
    return {
        status: 200,
        path: wikiPath(projectId, page),
        title: page.segments.length ? `${page.label} | ${docTitle}` : withSite(docTitle),
        description: summary(markdown) || project.description,
        body: `<p><a href="/projects/${escapeHtml(projectId)}">${escapeHtml(project.name)}</a></p>` +
            `<nav>${wikiNav(projectId, wiki.tree)}</nav>` +
            `<article>${renderMarkdown(markdown)}</article>`
    };
}

async function translationsPage(segments) {
    const { i18n } = await loadStrings();
    const title = withSite(i18n.title || "Translations");
    if (!segments.length) {
        return { status: 200, path: "/i18n", title, body: `<h1>${escapeHtml(i18n.title || "Translations")}</h1>` };
    }
    const known = segments.length === 1 || (segments.length === 2 && ["manage", "moderate"].includes(segments[1]));
    if (!known) return notFound();
    return { status: 200, title, noindex: true, body: "" };
}

/**
 * What to send for a URL path: status, title, description, canonical path,
 * whether to keep it out of search, and the page text.
 */
export async function describePage(urlPath) {
    let segments;
    try {
        segments = urlPath.split("/").filter(Boolean).map(decodeURIComponent);
    } catch {
        return notFound();
    }

    const [first, second, third, ...rest] = segments;
    if (!first) return homePage();
    if (first === "projects") {
        if (!second) return projectsPage();
        if (!third) return projectPage(second);
        if (third === "wiki") return wikiPage(second, rest);
        return notFound();
    }
    if (first === "i18n") return translationsPage(segments.slice(1));
    return notFound();
}

/** Puts the page's head tags and text into the built index.html. */
export function renderHtml(template, page) {
    const url = page.path ? `${siteUrl}${page.path}` : null;
    const tags = [
        `<title>${escapeHtml(page.title)}</title>`,
        page.description && `<meta name="description" content="${escapeHtml(page.description)}" />`,
        url && `<link rel="canonical" href="${escapeHtml(url)}" />`,
        page.noindex && `<meta name="robots" content="noindex" />`,
        `<meta property="og:site_name" content="${SITE_NAME}" />`,
        `<meta property="og:type" content="website" />`,
        `<meta property="og:title" content="${escapeHtml(page.title)}" />`,
        page.description && `<meta property="og:description" content="${escapeHtml(page.description)}" />`,
        url && `<meta property="og:url" content="${escapeHtml(url)}" />`,
        `<meta property="og:image" content="${siteUrl}/icon-512.png" />`,
        `<meta name="twitter:card" content="summary" />`,
        // With JavaScript the app draws the page itself; the plain text is for crawlers and no-JS readers.
        `<script>document.documentElement.classList.add("js")</script>`,
        `<style>.js #prerender{display:none}</style>`
    ].filter(Boolean).join("\n    ");

    return template
        .replace(/<title>[\s\S]*?<\/title>/, tags)
        .replace('<div id="root"></div>', `<div id="root"><div id="prerender">${page.body || ""}</div></div>`);
}

export async function sitemapXml() {
    const entries = [{ path: "/" }, { path: "/projects" }, { path: "/i18n" }];

    for (const project of await loadProjects()) {
        const resolved = await resolveProjectLangDir(project.id, LANG);
        const readmePath = resolved?.langDir ? resolveInside(resolved.langDir, "README.md") : null;
        entries.push({ path: `/projects/${project.id}`, lastmod: readmePath && await mtime(readmePath) });

        const wiki = await loadWiki(project.id);
        for (const page of wiki?.pages || []) {
            const file = pageFile(wiki, page.id);
            if (!file || !(await pathExists(file))) continue;
            entries.push({ path: wikiPath(project.id, page), lastmod: await mtime(file) });
        }
    }

    const urls = entries.map((e) =>
        `  <url><loc>${escapeHtml(siteUrl + e.path)}</loc>` +
        (e.lastmod ? `<lastmod>${e.lastmod.toISOString().slice(0, 10)}</lastmod>` : "") +
        `</url>`
    );
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
}

export function robotsTxt() {
    return `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`;
}
