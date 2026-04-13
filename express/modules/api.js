import express from 'express';
import { getPermissions, getUser } from './database.js';
import path from 'path';
import fs from 'node:fs/promises';

const projectsRoot = path.join(process.cwd(), "data", "projects");
const projectsJsonPath = path.join(process.cwd(), "data", "projects.json");
const projectAssetsRoot = path.join(process.cwd(), "data", "assets", "projects");
const globalAssetsRoot = path.join(process.cwd(), "data", "assets", "global");

const LANG_RE = /^[a-z0-9]{2,12}(?:[_-][a-z0-9]{2,12})?$/i;
const PROJECT_ID_RE = /^[a-z0-9_-]+$/i;
const ASSET_NAME_RE = /^[a-z0-9._-]+$/i;
const PAGE_ID_RE = /^[a-z0-9_-]+$/i;

function isValidProjectId(value) {
    return typeof value === "string" && PROJECT_ID_RE.test(value);
}

function isSafePathSegment(value) {
    return typeof value === "string" &&
        !value.includes("..") &&
        !value.includes("/") &&
        !value.includes("\\");
}

function isValidAssetName(value) {
    return typeof value === "string" &&
        ASSET_NAME_RE.test(value) &&
        isSafePathSegment(value);
}

function isValidLang(value) {
    return typeof value === "string" && LANG_RE.test(value);
}

function normalizeLang(value, fallback = "en") {
    const normalized = String(value ?? fallback)
        .trim()
        .toLowerCase()
        .replaceAll("-", "_");

    if (!isValidLang(normalized)) {
        return null;
    }

    return normalized;
}

function resolveInside(baseDir, ...segments) {
    const baseResolved = path.resolve(baseDir);
    const target = path.resolve(baseResolved, ...segments);
    const normalizedBase = `${baseResolved}${path.sep}`;

    if (target !== baseResolved && !target.startsWith(normalizedBase)) {
        return null;
    }

    return target;
}

async function pathExists(targetPath) {
    if (!targetPath) return false;
    try {
        await fs.access(targetPath);
        return true;
    } catch {
        return false;
    }
}

async function readJsonFile(targetPath) {
    const raw = await fs.readFile(targetPath, "utf-8");
    return JSON.parse(raw);
}

async function loadProjectsConfig() {
    if (!(await pathExists(projectsJsonPath))) {
        return null;
    }

    try {
        return await readJsonFile(projectsJsonPath);
    } catch {
        return null;
    }
}

async function resolveProjectLangDir(projectId, lang) {
    const projectDir = resolveInside(projectsRoot, projectId);
    if (!projectDir || !(await pathExists(projectDir))) {
        return null;
    }

    const preferredLangDir = resolveInside(projectDir, lang);
    if (preferredLangDir && await pathExists(preferredLangDir)) {
        return { projectDir, lang, langDir: preferredLangDir };
    }

    const fallbackLang = "en";
    const fallbackLangDir = resolveInside(projectDir, fallbackLang);
    if (fallbackLangDir && await pathExists(fallbackLangDir)) {
        return { projectDir, lang: fallbackLang, langDir: fallbackLangDir };
    }

    return { projectDir, lang: fallbackLang, langDir: null };
}

function requireAuth(req, res) {
    if (!req.session || !req.session.userId) {
        res.status(401).send({ error: 'Not authenticated' });
        return null;
    }
    const user = getUser(req.session.userId);
    if (!user) {
        res.status(401).send({ error: 'User not found' });
        return null;
    }
    return user;
}


function requirePermission(req, res, permission) {
    const user = requireAuth(req, res);
    if (!user) return null;

    const perms = getPermissions(user.id) || [];
    if (!perms.includes(permission)) {
        res.status(403).send({ error: 'Forbidden' });
        return null;
    }
    return user;
}

/**
 * 
 * @param {express.Express} app 
 */
function init(app) {
    app.get("/api/auth/me", async (req, res) => {
        if (!req.session || !req.session.userId) {
            return res.status(401).send({ error: "Not authenticated" });
        }
        
        const user = getUser(req.session.userId);
        if (!user) {
            return res.status(401).send({ error: "User not found" });
        }

        res.send({
            user: {
                id: user.id,
                github_login: user.github_login,
                avatar_url: user.github_avatar_url
            }
        });
    });

    app.post("/api/auth/logout", (req, res) => {
        if (req.session) {
            req.session.destroy(err => {
                if (err) {
                    return res.status(500).send({ error: "Failed to logout" });
                }
                res.send({ success: true });
            });
        } else {
            res.send({ success: true });
        }
    });

    app.get("/api/projects", async (req, res) => {
        const lang = normalizeLang(req.query.lang || "en");
        if (!lang) {
            return res.status(400).send({ error: "Invalid lang" });
        }

        const projects = await loadProjectsConfig();
        if (!projects) {
            return res.status(500).send({ error: "projects.json not found" });
        }

        const result = projects[lang] || projects["en"] || [];

        res.send(result);
    });

    app.get("/api/permissions", async (req, res) => {
        const user = requireAuth(req, res);
        if (!user) return;

        const perms = getPermissions(user.id) || [];
        
        res.status(200).send(perms)
    })

    app.get("/api/projects/:projectId", async (req, res) => {
        const projectId = req.params.projectId;
        const lang = normalizeLang(req.query.lang || "en");

        if (!lang) {
            return res.status(400).send({ error: "Invalid lang" })
        }

        if (!isValidProjectId(projectId)) {
            return res.status(400).send({ error: "Invalid project ID" });
        }

        const projects = await loadProjectsConfig();
        if (!projects) {
            return res.status(500).send({ error: "projects.json not found" });
        }

        let list = projects[lang];
        if (!Array.isArray(list)) {
            list = projects["en"] || [];
        }

        const project = list.find((p) => p.id === projectId);
        if (!project) {
            return res.status(404).send({ error: "Project not found" });
        }

        res.send(project);
    });

    app.get("/api/projects/:projectId/readme", async (req, res) => {
        const projectId = req.params.projectId;
        const lang = normalizeLang(req.query.lang || "en");

        if (!lang) {
            return res.status(400).send({ error: "Invalid lang" })
        }

        if (!isValidProjectId(projectId)) {
            return res.status(400).send({ error: "Invalid project ID" });
        }

        const resolvedProject = await resolveProjectLangDir(projectId, lang);
        if (!resolvedProject) {
            return res.status(404).send({ error: "Project not found" });
        }

        if (!resolvedProject.langDir) {
            return res.status(404).send({ error: "README not found" });
        }

        const readmePath = resolveInside(resolvedProject.langDir, "README.md");
        if (!readmePath || !(await pathExists(readmePath))) {
            return res.status(404).send({ error: "README not found" });
        }

        const readmeContent = await fs.readFile(readmePath, "utf-8");
        res.send({ readme: readmeContent });
    });

    
    app.get("/api/projects/:projectId/assets/:assetName", async (req, res) => {
        const projectId = req.params.projectId;
        const assetName = req.params.assetName;
        const lang = normalizeLang(req.query.lang || "en");

        if (!lang) {
            return res.status(400).send({ error: "Invalid lang" })
        }

        if (!isValidProjectId(projectId) || !isValidAssetName(assetName)) {
            return res.status(400).send({ error: "Invalid project ID or asset name" });
        }

        const projectAssetBase = resolveInside(projectAssetsRoot, projectId);
        if (!projectAssetBase || !(await pathExists(projectAssetBase))) {
            return res.status(404).send({ error: "Asset not found" });
        }

        let assetPath = resolveInside(projectAssetBase, lang, assetName);
        if (!assetPath || !(await pathExists(assetPath))) {
            assetPath = resolveInside(projectAssetBase, "en", assetName);
        }

        if (!assetPath || !(await pathExists(assetPath))) {
            return res.status(404).send({ error: "Asset not found" });
        }


        res.sendFile(assetPath);
    });

        
    app.get("/api/assets/:assetName", async (req, res) => {
        const assetName = req.params.assetName;

        if (!isValidAssetName(assetName)) {
            return res.status(400).send({ error: "Invalid asset name" });
        }

        const assetPath = resolveInside(globalAssetsRoot, assetName);

        if (!assetPath || !(await pathExists(assetPath))) {
            return res.status(404).send({ error: "Asset not found" });
        }

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("cross-origin-resource-policy", "cross-origin");
        
        res.sendFile(assetPath);
    });
    
    app.get("/api/projects/:projectId/wiki", async(req, res) => {
        const projectId = req.params.projectId;
        const lang = normalizeLang(req.query.lang || "en");

        if (!isValidProjectId(projectId)) {
            return res.status(400).send({ error: "Invalid project ID" });
        }
        if (!lang) {
            return res.status(400).send({ error: "Invalid lang" });
        }

        const resolvedProject = await resolveProjectLangDir(projectId, lang);
        if (!resolvedProject) {
            return res.status(404).send({ error: "Project not found" });
        }

        if (!resolvedProject.langDir) {
            return res.status(200).send({ provided: false });
        }

        const pagesJson = resolveInside(resolvedProject.langDir, "wiki", "pages.json");
        const provided = pagesJson ? await pathExists(pagesJson) : false;

        return res.status(200).send({
            provided
        })
    })

    app.get("/api/projects/:projectId/wiki/pages", async (req, res) => {
        const projectId = req.params.projectId;
        const lang = normalizeLang(req.query.lang || "en");

        if (!isValidProjectId(projectId)) {
            return res.status(400).send({ error: "Invalid project ID" });
        }
        if (!lang) {
            return res.status(400).send({ error: "Invalid lang" });
        }

        const resolvedProject = await resolveProjectLangDir(projectId, lang);
        if (!resolvedProject) {
            return res.status(404).send({ error: "Project not found" });
        }

        if (!resolvedProject.langDir) {
            return res.status(404).send({ error: "Wiki not found" });
        }

        const pagesIndexPath = resolveInside(resolvedProject.langDir, "wiki", "pages.json");
        if (!pagesIndexPath || !(await pathExists(pagesIndexPath))) {
            return res.status(404).send({ error: "Wiki not found" });
        }

        const pagesIndex = await readJsonFile(pagesIndexPath);

        res.send(pagesIndex);
    });

    app.get("/api/projects/:projectId/wiki/pages/:pageId", async (req, res) => {
        const projectId = req.params.projectId;
        const pageId = req.params.pageId;
        const lang = normalizeLang(req.query.lang || "en");

        if (!isValidProjectId(projectId)) {
            return res.status(400).send({ error: "Invalid project ID" });
        }
        if (!lang) {
            return res.status(400).send({ error: "Invalid lang" });
        }

        if (!PAGE_ID_RE.test(pageId)) {
            return res.status(400).send({ error: "Invalid page ID" });
        }

        const resolvedProject = await resolveProjectLangDir(projectId, lang);
        if (!resolvedProject) {
            return res.status(404).send({ error: "Project not found" });
        }

        if (!resolvedProject.langDir) {
            return res.status(404).send({ error: "Wiki not found" });
        }

        const wikiDir = resolveInside(resolvedProject.langDir, "wiki");
        if (!wikiDir || !(await pathExists(wikiDir))) {
            return res.status(404).send({ error: "Wiki not found" });
        }

        const pagePath = resolveInside(wikiDir, "pages", `${pageId}.md`);
        if (!pagePath || !(await pathExists(pagePath))) {
            return res.status(404).send({ error: "Page not found" });
        }

        const pageContent = await fs.readFile(pagePath, 'utf-8');
        res.send({ content: pageContent });
    });
}

export default {
    init,
    priority: 0
}

export {
    requireAuth,
    requirePermission
}
