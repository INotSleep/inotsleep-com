import express from 'express';
import axios from 'axios';
import { getUser } from '../database.js';
import path from 'path';
import fs from 'fs';

const projectsRoot = path.join(process.cwd(), "data", "projects");
const projectsJsonPath = path.join(process.cwd(), "data", "projects.json");

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
                github_id: user.github_id,
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
        const lang = (req.query.lang || "en").toString();

        if (!fs.existsSync(projectsJsonPath)) {
            return res.status(500).send({ error: "projects.json not found" });
        }

        const projects = JSON.parse(fs.readFileSync(projectsJsonPath, "utf-8"));
        const result = projects[lang] || projects["en"] || [];

        res.send(result);
    });

    app.get("/api/projects/:projectId", async (req, res) => {
        const projectId = req.params.projectId;
        let lang = (req.query.lang || "en").toString();

        if (!lang.match(/^[a-z]/i)) {
            return res.status(400).send({ error: "Invalid lang" })
        }

        if (!projectId.match(/^[a-z0-9_-]+$/i)) {
            return res.status(400).send({ error: "Invalid project ID" });
        }

        if (!fs.existsSync(projectsJsonPath)) {
            return res.status(500).send({ error: "projects.json not found" });
        }

        const projects = JSON.parse(fs.readFileSync(projectsJsonPath, "utf-8"));

        let list = projects[lang];
        if (!Array.isArray(list)) {
            lang = "en";
            list = projects[lang] || [];
        }

        const project = list.find((p) => p.id === projectId);
        if (!project) {
            return res.status(404).send({ error: "Project not found" });
        }

        res.send(project);
    });

    app.get("/api/projects/:projectId/readme", async (req, res) => {
        const projectId = req.params.projectId;
        let lang = (req.query.lang || "en").toString();

        if (!lang.match(/^[a-z]/i)) {
            return res.status(400).send({ error: "Invalid lang" })
        }

        if (!projectId.match(/^[a-z0-9_-]+$/i)) {
            return res.status(400).send({ error: "Invalid project ID" });
        }

        const projectDir = path.join(projectsRoot, projectId);

        if (!fs.existsSync(projectDir)) {
            return res.status(404).send({ error: "Project not found" });
        }

        const langDir = path.join(projectDir, lang);
        if (!fs.existsSync(langDir)) {
            lang = "en";
        }

        const readmePath = path.join(projectsRoot, projectId, lang, "README.md");
        if (!fs.existsSync(readmePath)) {
            return res.status(404).send({ error: "README not found" });
        }

        const readmeContent = fs.readFileSync(readmePath, "utf-8");
        res.send({ readme: readmeContent });
    });

    
    app.get("/api/projects/:projectId/assets/:assetName", async (req, res) => {
        const projectId = req.params.projectId;
        const assetName = req.params.assetName;
        let lang = (req.query.lang || "en").toString();

        if (!lang.match(/^[a-z]/i)) {
            return res.status(400).send({ error: "Invalid lang" })
        }

        if (!projectId.match(/^[a-z0-9_-]+$/i) || !assetName.match(/^[a-z0-9._-]+$/i)) {
            return res.status(400).send({ error: "Invalid project ID or asset name" });
        }

        const assetPath = path.join(process.cwd(), 'data', 'assets', 'projects', projectId, lang, assetName);

        if (!fs.existsSync(assetPath)) {
            return res.status(404).send({ error: "Asset not found" });
        }


        res.sendFile(assetPath);
    });

        
    app.get("/api/assets/:assetName", async (req, res) => {
        const assetName = req.params.assetName;

        if (!assetName.match(/^[a-z0-9._-]+$/i)) {
            return res.status(400).send({ error: "Invalid asset name" });
        }

        const assetPath = path.join(process.cwd(), 'data', 'assets', 'global', assetName);

        if (!fs.existsSync(assetPath)) {
            return res.status(404).send({ error: "Asset not found" });
        }


        res.sendFile(assetPath);
    });

    app.get("/api/projects/:projectId/wiki", async(req, res) => {
        const projectId = req.params.projectId;
        const lang = req.query.lang || 'en';

        if (!projectId.match(/^[a-z0-9_-]+$/i)) {
            return res.status(400).send({ error: "Invalid project ID" });
        }

        if (!fs.existsSync(path.join(process.cwd(), 'data', 'projects', projectId))) {
            return res.status(404).send({ error: "Project not found" });
        }

        if (!fs.existsSync(path.join(process.cwd(), 'data', 'projects', projectId, lang))) {
            lang = 'en';
        }

        return res.status(200).send({
            provided: fs.existsSync(path.join(process.cwd(), 'data', 'projects', projectId, lang, 'wiki', 'pages.json'))
        })
    })

    app.get("/api/projects/:projectId/wiki/pages", async (req, res) => {
        const projectId = req.params.projectId;
        const lang = req.query.lang || 'en';

        if (!projectId.match(/^[a-z0-9_-]+$/i)) {
            return res.status(400).send({ error: "Invalid project ID" });
        }

        if (!fs.existsSync(path.join(process.cwd(), 'data', 'projects', projectId))) {
            return res.status(404).send({ error: "Project not found" });
        }

        if (!fs.existsSync(path.join(process.cwd(), 'data', 'projects', projectId, lang))) {
            lang = 'en';
        }

        if (!fs.existsSync(path.join(process.cwd(), 'data', 'projects', projectId, lang, 'wiki', 'pages.json'))) {
            return res.status(404).send({ error: "Wiki not found" });
        }

        const pagesIndexPath = path.join(process.cwd(), 'data', 'projects', projectId, lang, 'wiki', 'pages.json');
        const pagesIndex = JSON.parse(fs.readFileSync(pagesIndexPath, 'utf-8'));

        res.send(pagesIndex);
    });

    app.get("/api/projects/:projectId/wiki/pages/:pageId", async (req, res) => {
        const projectId = req.params.projectId;
        const pageId = req.params.pageId;
        const lang = req.query.lang || 'en';

        if (!projectId.match(/^[a-z0-9_-]+$/i)) {
            return res.status(400).send({ error: "Invalid project ID" });
        }

        if (!pageId.match(/^[a-z0-9_-]+$/i)) {
            return res.status(400).send({ error: "Invalid page ID" });
        }

        if (!fs.existsSync(path.join(process.cwd(), 'data', 'projects', projectId))) {
            return res.status(404).send({ error: "Project not found" });
        }

        if (!fs.existsSync(path.join(process.cwd(), 'data', 'projects', projectId, lang))) {
            lang = 'en';
        }

        if (!fs.existsSync(path.join(process.cwd(), 'data', 'projects', projectId, lang, 'wiki'))) {
            return res.status(404).send({ error: "Wiki not found" });
        }

        const pagePath = path.join(process.cwd(), 'data', 'projects', projectId, lang, 'wiki', 'pages', `${pageId}.md`);
        if (!fs.existsSync(pagePath)) {
            return res.status(404).send({ error: "Page not found" });
        }

        const pageContent = fs.readFileSync(pagePath, 'utf-8');
        res.send({ content: pageContent });
    });
}

export default {
    init,
    priority: 0
}