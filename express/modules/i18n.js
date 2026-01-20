import express from 'express';
import YAML from 'yaml';

import {
    requireAuth,
    requirePermission
} from './api.js';

import {
    getUser,
    getPermissions,
    getI18nProjects,
    getI18nProjectBySlug,
    getI18nKeyByProjectAndName,
    getI18nKeysForProject,
    createI18nProject,
    createI18nKeysBulk,
    getI18nTranslationsForProjectLanguage,
    bulkImportI18nTranslations,
    createI18nSuggestion,
    getI18nSuggestionsByStatus,
    approveI18nSuggestion,
    rejectI18nSuggestion,
    SUGGESTION_STATUS,
    upsertI18nTranslation,
    updateI18nKeyDescription,
    deleteI18nKey,
    writeI18nAudit,
    AUDIT_ACTION,
    getI18nKey,
    getI18nLanguages,
    addI18nLanguage
} from './database.js';

function flattenObject(obj, prefix = '') {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            Object.assign(result, flattenObject(value, newKey));
        } else {
            result[newKey] = value;
        }
    }
    return result;
}

function normalizeKeyType(type) {
    if (typeof type !== 'string') return 'string';
    const v = type.trim().toLowerCase();
    if (v === 'list' || v === 'array') return 'list';
    if (v === 'string') return 'string';
    return null;
}


function isValidTranslationValue(value) {
    if (typeof value === 'string') {
        return value.trim().length > 0;
    }
    if (Array.isArray(value)) {
        if (value.length === 0) return false;
        return value.every(
            (v) => typeof v === 'string' && v.trim().length > 0
        );
    }
    return false;
}

function isValidProjectSlug(slug) {
    return typeof slug === 'string' && /^[a-z0-9_-]+$/i.test(slug);
}

function isValidKeyName(key) {
    return typeof key === 'string' && key.trim().length > 0;
}

/**
 * 
 * @param {express.Express} app 
 */
function init(app) {
    app.get('/api/i18n/projects', (req, res) => {
        try {
            const projects = getI18nProjects();
            res.send(projects);
        } catch (err) {
            console.error('Error fetching i18n projects', err);
            res.status(500).send({ error: 'Internal server error' });
        }
    });

    app.post('/api/i18n/projects', (req, res) => {
        const user = requirePermission(req, res, 'i18n.manage');
        if (!user) return;

        const { slug, name } = req.body || {};

        if (!isValidProjectSlug(slug)) {
            return res.status(400).send({ error: 'Invalid slug' });
        }
        if (!name || typeof name !== 'string' || !name.trim()) {
            return res.status(400).send({ error: 'name is required' });
        }

        try {
            const existing = getI18nProjectBySlug(slug);
            if (existing) {
                return res
                    .status(409)
                    .send({ error: 'Project with this slug already exists' });
            }

            const project = createI18nProject(slug, name.trim());
            res.status(201).send(project);
        } catch (err) {
            console.error('Error creating i18n project', err);
            res.status(500).send({ error: 'Internal server error' });
        }
    });

    app.get('/api/i18n/projects/:slug/keys', (req, res) => {
        const slug = req.params.slug;

        if (!isValidProjectSlug(slug)) {
            return res.status(400).send({ error: 'Invalid project slug' });
        }

        try {
            const project = getI18nProjectBySlug(slug);
            if (!project) {
                return res.status(404).send({ error: 'Project not found' });
            }

            const keys = getI18nKeysForProject(project.id);
            res.send({
                project: {
                    id: project.id,
                    slug: project.slug,
                    name: project.name
                },
                keys
            });
        } catch (err) {
            console.error('Error fetching i18n keys', err);
            res.status(500).send({ error: 'Internal server error' });
        }
    });

    app.post('/api/i18n/projects/:slug/keys', (req, res) => {
        const user = requirePermission(req, res, 'i18n.manage');
        if (!user) return;

        const slug = req.params.slug;
        const { keys } = req.body || {};

        if (!isValidProjectSlug(slug)) {
            return res.status(400).send({ error: 'Invalid project slug' });
        }

        if (!Array.isArray(keys) || keys.length === 0) {
            return res
                .status(400)
                .send({ error: 'keys must be a non-empty array' });
        }

        const normalizedKeys = [];
        for (const item of keys) {
            if (!item || typeof item !== 'object') continue;

            const keyName = item.key ?? item.key_name;
            const description = item.description ?? null;

            const typeRaw = item.type ?? item.value_type ?? item.valueType ?? 'string';
            const valueType = normalizeKeyType(typeRaw);
            if (!valueType) {
                return res.status(400).send({ error: `Invalid key type for ${keyName}` });
            }

            if (!isValidKeyName(keyName)) {
                return res.status(400).send({ error: `Invalid key: ${keyName}` });
            }

            normalizedKeys.push({
                keyName: keyName,
                valueType: valueType,
                description: typeof description === 'string' ? description : null
            });
        }


        if (normalizedKeys.length === 0) {
            return res
                .status(400)
                .send({ error: 'No valid keys provided' });
        }

        try {
            const project = getI18nProjectBySlug(slug);
            if (!project) {
                return res.status(404).send({ error: 'Project not found' });
            }

            const createdKeys = createI18nKeysBulk(
                project.id,
                normalizedKeys
            );

            res.status(201).send({
                project: {
                    id: project.id,
                    slug: project.slug,
                    name: project.name
                },
                keys: createdKeys
            });
        } catch (err) {
            console.error('Error creating i18n keys bulk', err);
            res.status(500).send({ error: 'Internal server error' });
        }
    });

    app.get('/api/i18n/projects/:slug/translations', (req, res) => {
        const slug = req.params.slug;
        const lang = (req.query.lang || 'en_us').toString();

        try {
            const project = getI18nProjectBySlug(slug);
            if (!project) {
                return res.status(404).send({ error: 'Project not found' });
            }

            const translations = getI18nTranslationsForProjectLanguage(
                project.id,
                lang
            );

            res.send({
                project: {
                    id: project.id,
                    slug: project.slug,
                    name: project.name
                },
                language: lang,
                translations
            });
        } catch (err) {
            console.error('Error fetching translations', err);
            res.status(500).send({ error: 'Internal server error' });
        }
    });

    app.post('/api/i18n/projects/:slug/import', (req, res) => {
        const user = requirePermission(req, res, 'i18n.upload');
        if (!user) return;

        const slug = req.params.slug;
        const { language, yaml } = req.body || {};

        if (!language || typeof language !== 'string') {
            return res.status(400).send({ error: 'language is required' });
        }
        if (!yaml || typeof yaml !== 'string') {
            return res.status(400).send({ error: 'yaml is required' });
        }

        const langs = getI18nLanguages()
        if (!langs.includes(language)) {
            return res.status(400).send({ error: 'language is not exists' });
        }

        try {
            const project = getI18nProjectBySlug(slug);
            if (!project) {
                return res.status(404).send({ error: 'Project not found' });
            }

            const parsed = YAML.parse(yaml);
            if (!parsed || typeof parsed !== 'object') {
                return res.status(400).send({ error: 'Invalid YAML content' });
            }

            const flat = flattenObject(parsed);

            try {
                bulkImportI18nTranslations(project.id, language, flat, user.id);
                res.send({ success: true });
            } catch (err) {
                if (String(err?.message || "").startsWith("KEY_TYPE_MISMATCH:")) {
                    return res.status(400).send({ error: err.message });
                }
                throw err;
            }

        } catch (err) {
            console.error('Error importing i18n YAML', err);
            res.status(500).send({ error: 'Internal server error' });
        }
    });

    app.post('/api/i18n/projects/:slug/suggestions', (req, res) => {
        const user = requireAuth(req, res);
        if (!user) return;

        const slug = req.params.slug;
        const { language, key, value } = req.body || {};

        if (!language || typeof language !== 'string') {
            return res.status(400).send({ error: 'language is required' });
        }

        const langs = getI18nLanguages()
        if (!langs.includes(language)) {
            return res.status(400).send({ error: 'language is not exists' });
        }

        if (!key || typeof key !== 'string') {
            return res.status(400).send({ error: 'key is required' });
        }
        if (!isValidTranslationValue(value)) {
            return res.status(400).send({ error: 'value is invalid' });
        }

        try {
            const project = getI18nProjectBySlug(slug);
            if (!project) {
                return res.status(404).send({ error: 'Project not found' });
            }

            const keyRow = getI18nKeyByProjectAndName(project.id, key);
            if (!keyRow) {
                return res
                    .status(400)
                    .send({ error: 'Key does not exist for this project' });
            }

            // value может быть строкой или массивом строк — DB-слой сам сериализует в JSON
            createI18nSuggestion(keyRow.id, language, value, user.id);

            res.send({ success: true });
        } catch (err) {
            console.error('Error creating suggestion', err);
            res.status(500).send({ error: 'Internal server error' });
        }
    });

    app.get('/api/i18n/moderation/suggestions', (req, res) => {
        const user = requirePermission(req, res, 'i18n.moderate');
        if (!user) return;

        const statusName = (req.query.status || 'pending').toString();
        const map = {
            pending: SUGGESTION_STATUS.PENDING,
            approved: SUGGESTION_STATUS.APPROVED,
            rejected: SUGGESTION_STATUS.REJECTED
        };
        const status = map[statusName];
        if (status === undefined) {
            return res.status(400).send({ error: 'Invalid status' });
        }

        const limit = Math.min(
            100,
            Math.max(1, parseInt(req.query.limit ?? '50', 10) || 50)
        );
        const offset = Math.max(
            0,
            parseInt(req.query.offset ?? '0', 10) || 0
        );

        try {
            const rows = getI18nSuggestionsByStatus(status, limit, offset);
            res.send(rows);
        } catch (err) {
            console.error('Error fetching suggestions', err);
            res.status(500).send({ error: 'Internal server error' });
        }
    });

    app.post('/api/i18n/moderation/suggestions/:id/approve', (req, res) => {
        const user = requirePermission(req, res, 'i18n.moderate');
        if (!user) return;

        const id = parseInt(req.params.id, 10);
        if (!Number.isFinite(id)) {
            return res.status(400).send({ error: 'Invalid suggestion id' });
        }

        try {
            const result = approveI18nSuggestion(id, user.id);
            if (result.status === 'not_found') {
                return res.status(404).send({ error: 'Suggestion not found' });
            }
            if (result.status === 'not_pending') {
                return res
                    .status(400)
                    .send({ error: 'Suggestion is not pending' });
            }

            res.send({ success: true });
        } catch (err) {
            console.error('Error approving suggestion', err);
            res.status(500).send({ error: 'Internal server error' });
        }
    });

    app.post('/api/i18n/moderation/suggestions/:id/reject', (req, res) => {
        const user = requirePermission(req, res, 'i18n.moderate');
        if (!user) return;

        const id = parseInt(req.params.id, 10);
        if (!Number.isFinite(id)) {
            return res.status(400).send({ error: 'Invalid suggestion id' });
        }

        try {
            const result = rejectI18nSuggestion(id, user.id);
            if (result.status === 'not_found') {
                return res.status(404).send({ error: 'Suggestion not found' });
            }
            if (result.status === 'not_pending') {
                return res
                    .status(400)
                    .send({ error: 'Suggestion is not pending' });
            }

            res.send({ success: true });
        } catch (err) {
            console.error('Error rejecting suggestion', err);
            res.status(500).send({ error: 'Internal server error' });
        }
    });

    app.post('/api/i18n/projects/:slug/translations', (req, res) => {
        const user = requirePermission(req, res, 'i18n.manage');
        if (!user) return;

        const slug = req.params.slug;
        const { key, language, value, description } = req.body || {};

        // --- валидация ---
        if (!key || typeof key !== 'string') {
            return res.status(400).send({ error: 'key is required' });
        }
        if (!language || typeof language !== 'string') {
            return res.status(400).send({ error: 'language is required' });
        }

        const langs = getI18nLanguages()
        if (!langs.includes(language)) {
            return res.status(400).send({ error: 'language is not exists' });
        }

        // value может быть string или массивом строк
        if (
            typeof value !== 'string' &&
            !(
                Array.isArray(value) &&
                value.every((v) => typeof v === 'string')
            )
        ) {
            return res.status(400).send({
                error: 'value must be a string or an array of strings'
            });
        }

        try {
            const project = getI18nProjectBySlug(slug);
            if (!project) {
                return res.status(404).send({ error: 'Project not found' });
            }

            const keyRow = getI18nKeyByProjectAndName(project.id, key);
            if (!keyRow) {
                return res.status(404).send({ error: 'Key not found in this project' });
            }

            const keyType = (keyRow.value_type || 'string').toString().toLowerCase();
            if (keyType === 'string' && typeof value !== 'string') {
                return res.status(400).send({ error: 'This key expects a string value' });
            }
            if (keyType === 'list' && !Array.isArray(value)) {
                return res.status(400).send({ error: 'This key expects a list value' });
            }

            upsertI18nTranslation(keyRow.id, language, value, user.id);

            if (typeof description === 'string') {
                updateI18nKeyDescription(keyRow.id, description);
            } else if (description === null) {
                updateI18nKeyDescription(keyRow.id, null);
            }

            res.send({ success: true });
        } catch (err) {
            console.error('Error updating translation', err);
            res.status(500).send({ error: 'Internal server error' });
        }
    });

    app.delete("/api/i18n/projects/:slug/keys/:id", (req, res) => {
        const user = requirePermission(req, res, 'i18n.manage');
        if (!user) return;

        const id = req.params.id;
        const slug = req.params.slug

        try {
            const project = getI18nProjectBySlug(slug);
            if (!project) return res.status(404).send({ error: "Project not found" })

            const key = getI18nKey(id)
            if (!key) return res.status(404).send({ error: "Key not found" })

            console.log(project)

            deleteI18nKey(id);

            res.send({ success: true });
        } catch (err) {
            console.error('Error deleting key', err);
            res.status(500).send({ error: 'Internal server error' });
        }
    })

    app.get("/api/i18n/languages", (req, res) => {
        try {
            const langs = getI18nLanguages();
            res.send(langs);
        } catch (err) {
            console.error('Error loading languages', err);
            res.status(500).send({ error: 'Internal server error' });
        }
    })

    app.post("/api/i18n/languages", (req, res) => {
        const user = requirePermission(req, res, 'i18n.manage');
        if (!user) return;

        const { code } = req.body || {};

        if (!code || typeof code !== 'string') {
            return res.status(400).send({ error: 'code is required' });
        }

        try {
            addI18nLanguage(code)
            res.send({ success: true });
        } catch (err) {
            console.error('Error adding language', err);
            res.status(500).send({ error: 'Internal server error' });
        }
    })
}

export default {
    init,
    priority: 0
};