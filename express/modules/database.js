import sqlite from 'better-sqlite3';

let db;

function init() {
    db = new sqlite('database.db');
    db.pragma('journal_mode = WAL');

    prepareDB();
}

function ensureI18nKeyTypeColumn() {
    const cols = db.prepare(`PRAGMA table_info(i18n_keys);`).all().map((c) => c.name);
    if (!cols.includes("value_type")) {
        db.prepare(
            `ALTER TABLE i18n_keys
             ADD COLUMN value_type TEXT NOT NULL DEFAULT 'string';`
        ).run();
    }

    db.prepare(
        `UPDATE i18n_keys
         SET value_type = 'string'
         WHERE value_type IS NULL OR TRIM(value_type) = '';`
    ).run();
}


function prepareDB() {
    db.prepare(
        `CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY,
            github_id TEXT UNIQUE,
            github_login TEXT,
            github_avatar_url TEXT,
            access_token TEXT
        );`
    ).run();

    db.prepare(
        `CREATE TABLE IF NOT EXISTS permissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id UUID,
            permission TEXT,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        );`
    ).run();

    db.prepare(
        `CREATE TABLE IF NOT EXISTS i18n_supported_projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            slug TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL
        );`
    ).run()

    db.prepare(
        `CREATE TABLE IF NOT EXISTS i18n_keys (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id BIGINT NOT NULL REFERENCES i18n_supported_projects(id),
            key_name TEXT NOT NULL,
            value_type TEXT NOT NULL DEFAULT 'string',
            description TEXT,
            UNIQUE (project_id, key_name)
        );`
    ).run();    

    
    db.prepare(
        `CREATE TABLE IF NOT EXISTS i18n_languages (
            code TEXT PRIMARY KEY
        );`
    ).run()
    
    db.prepare(
        `CREATE TABLE IF NOT EXISTS i18n_translations (
            key_id BIGINT NOT NULL REFERENCES i18n_keys(id) ON DELETE CASCADE,
            language TEXT NOT NULL REFERENCES i18n_languages(code) ON DELETE CASCADE,
            value TEXT NOT NULL,
            PRIMARY KEY (key_id, language)
        );`
    ).run()
    
    db.prepare(
        `CREATE TABLE IF NOT EXISTS i18n_suggestions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key_id BIGINT NOT NULL REFERENCES i18n_keys(id) ON DELETE CASCADE,
            language TEXT NOT NULL REFERENCES i18n_languages(code) ON DELETE CASCADE,
            value TEXT NOT NULL,
            author UUID REFERENCES users(id) ON DELETE SET NULL,
            status INT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
            reviewed_at TIMESTAMPTZ
        );`
    ).run()
    
    db.prepare(
        `CREATE TABLE IF NOT EXISTS i18n_audit (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id BIGINT NOT NULL REFERENCES i18n_supported_projects(id) ON DELETE CASCADE,
            key_id BIGINT NOT NULL REFERENCES i18n_keys(id) ON DELETE CASCADE,
            language TEXT REFERENCES i18n_languages(code) ON DELETE CASCADE,
            action INT NOT NULL,
            old_value TEXT,
            new_value TEXT,
            author UUID REFERENCES users(id) ON DELETE SET NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
        );`
    ).run()

    db.prepare(`
        CREATE INDEX IF NOT EXISTS idx_i18n_suggestions_status
            ON i18n_suggestions(status);
    `).run();

    ensureI18nKeyTypeColumn();
}

function normalizeKeyType(type) {
    if (typeof type !== "string") return "string";
    const v = type.trim().toLowerCase();
    if (v === "list" || v === "array") return "list";
    return "string";
}

function inferKeyTypeFromValue(value) {
    return Array.isArray(value) ? "list" : "string";
}


const SUGGESTION_STATUS = {
    PENDING: 0,
    APPROVED: 1,
    REJECTED: 2
};

const AUDIT_ACTION = {
    IMPORT_BULK: 1,
    SUGGESTION_APPROVED: 2,
    SUGGESTION_REJECTED: 3,
    MANUAL_EDIT: 4,
    DELETE: 5
};

function getUser(id) {
    return db.prepare('SELECT * FROM users WHERE id = ?;').get(id);
}

function getUserByGitHubId(githubId) {
    return db.prepare('SELECT * FROM users WHERE github_id = ?;').get(githubId);
}

function createUser(githubId, githubLogin, githubAvatarUrl, accessToken) {
    const id = crypto.randomUUID();
    db.prepare(
        'INSERT INTO users (id, github_id, github_login, github_avatar_url, access_token) VALUES (?, ?, ?, ?, ?);'
    ).run(id, githubId, githubLogin, githubAvatarUrl, accessToken);
    return getUser(id);
}

function modifyUser(id, githubLogin, githubAvatarUrl, accessToken) {
    db.prepare(
        'UPDATE users SET github_login = ?, github_avatar_url = ?, access_token = ? WHERE id = ?;'
    ).run(githubLogin, githubAvatarUrl, accessToken, id);
    return getUser(id);
}

function addPermission(userId, permission) {
    db.prepare(
        'INSERT INTO permissions (user_id, permission) VALUES (?, ?);'
    ).run(userId, permission);
}

function getPermissions(userId) {
    return db.prepare(
        'SELECT permission FROM permissions WHERE user_id = ?;'
    ).all(userId).map(row => row.permission);
}

function removePermission(userId, permission) {
    db.prepare(
        'DELETE FROM permissions WHERE user_id = ? AND permission = ?;'
    ).run(userId, permission);
}

function getOrCreateI18nKey(projectId, keyName, valueType = "string", description = null) {
    const normalizedType = normalizeKeyType(valueType);

    const existing = getI18nKeyByProjectAndName(projectId, keyName);
    if (existing) {
        // если ключ старый и у него пустой тип — проставим
        const currentType = existing.value_type ? normalizeKeyType(existing.value_type) : null;
        if (!currentType) {
            db.prepare(
                `UPDATE i18n_keys
                 SET value_type = ?
                 WHERE id = ?;`
            ).run(normalizedType, existing.id);

            return getI18nKey(existing.id);
        }

        return existing;
    }

    const info = db.prepare(
        `INSERT INTO i18n_keys (project_id, key_name, value_type, description)
         VALUES (?, ?, ?, ?);`
    ).run(projectId, keyName, normalizedType, description);

    return db.prepare(
        `SELECT * FROM i18n_keys WHERE id = ?;`
    ).get(info.lastInsertRowid);
}


function getI18nKey(id) {
    return db.prepare(
        'SELECT * FROM i18n_keys WHERE id = ?;'
    ).get(id);
}

function addI18nLanguage(language) {
    db.prepare(
        'INSERT OR IGNORE INTO i18n_languages (code) VALUES (?);'
    ).run(language);
}

function getI18nLanguages() {
    return db.prepare(
        'SELECT * from i18n_languages'
    ).all().map(lang => lang.code);
}

function writeI18nAudit(projectId, keyId, language, action, oldValue, newValue, authorId) {
    db.prepare(
        `INSERT INTO i18n_audit (
            project_id,
            key_id,
            language,
            action,
            old_value,
            new_value,
            author
        ) VALUES (?, ?, ?, ?, ?, ?, ?);`
    ).run(
        projectId,
        keyId,
        language || null,
        action,
        oldValue ?? null,
        newValue ?? null,
        authorId ?? null
    );
}

function getI18nTranslationsForProjectLanguage(projectId, language) {
    const rows = db.prepare(
        `SELECT k.key_name, t.value
         FROM i18n_keys k
         LEFT JOIN i18n_translations t
            ON t.key_id = k.id AND t.language = ?
         WHERE k.project_id = ?;`
    ).all(language, projectId);

    const result = {};
    for (const row of rows) {
        if (row.value != null) {
            result[row.key_name] = JSON.parse(row.value);
        }
    }
    return result;
}

/**
 * bulk импорт key->value в translations + audit
 * flatTranslations: { "path.to.key": "Value", ... }
 */
function bulkImportI18nTranslations(projectId, language, flatTranslations, authorId) {
    const selectExistingStmt = db.prepare(
        `SELECT value
         FROM i18n_translations
         WHERE key_id = ? AND language = ?;`
    );
    const updateStmt = db.prepare(
        `UPDATE i18n_translations
         SET value = ?
         WHERE key_id = ? AND language = ?;`
    );
    const insertStmt = db.prepare(
        `INSERT INTO i18n_translations (key_id, language, value)
         VALUES (?, ?, ?);`
    );

    const tx = db.transaction(() => {
        for (let [keyName, value] of Object.entries(flatTranslations)) {
            if (value == null) continue;

            const inferredType = inferKeyTypeFromValue(value);
            value = JSON.stringify(value);

            const keyRow = getOrCreateI18nKey(projectId, keyName, inferredType, null);

            const keyType = normalizeKeyType(keyRow.value_type ?? "string");
            if (keyType === "string") {
                const parsed = JSON.parse(value);
                if (Array.isArray(parsed)) {
                    throw new Error(`KEY_TYPE_MISMATCH:${keyName}:expected string, got list`);
                }
            }
            if (keyType === "list") {
                const parsed = JSON.parse(value);
                if (!Array.isArray(parsed)) {
                    throw new Error(`KEY_TYPE_MISMATCH:${keyName}:expected list, got string`);
                }
            }

            const existing = selectExistingStmt.get(keyRow.id, language);

            if (existing) {
                updateStmt.run(value, keyRow.id, language);
                writeI18nAudit(
                    projectId,
                    keyRow.id,
                    language,
                    AUDIT_ACTION.IMPORT_BULK,
                    existing.value,
                    value,
                    authorId
                );
            } else {
                
                insertStmt.run(keyRow.id, language, value);
                writeI18nAudit(
                    projectId,
                    keyRow.id,
                    language,
                    AUDIT_ACTION.IMPORT_BULK,
                    null,
                    value,
                    authorId
                );
            }
        }
    });

    tx();
}

function createI18nSuggestion(keyId, language, value, authorId) {
    db.prepare(
        `INSERT INTO i18n_suggestions (
            key_id,
            language,
            value,
            author,
            status,
            created_at
        ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP);`
    ).run(
        keyId,
        language,
        JSON.stringify(value),
        authorId,
        SUGGESTION_STATUS.PENDING
    );
}

function getI18nSuggestionsByStatus(status, limit, offset) {
    return db.prepare(
        `SELECT s.id,
                s.language,
                s.value,
                s.status,
                s.created_at,
                s.reviewed_at,
                s.author,
                k.key_name,
                p.slug AS project_slug,
                p.name AS project_name
         FROM i18n_suggestions s
         JOIN i18n_keys k ON k.id = s.key_id
         JOIN i18n_supported_projects p ON p.id = k.project_id
         WHERE s.status = ?
         ORDER BY s.created_at ASC
         LIMIT ? OFFSET ?;`
    ).all(status, limit, offset).map(suggestion => {
        suggestion.value = JSON.parse(suggestion.value)
        return suggestion
    });
}

function approveI18nSuggestion(id, moderatorId) {
    const sugg = db.prepare(
        `SELECT s.*, k.project_id
         FROM i18n_suggestions s
         JOIN i18n_keys k ON k.id = s.key_id
         WHERE s.id = ?;`
    ).get(id);

    if (!sugg) {
        return { status: 'not_found' };
    }
    if (sugg.status !== SUGGESTION_STATUS.PENDING) {
        return { status: 'not_pending', suggestion: sugg };
    }

    const selectExisting = db.prepare(
        `SELECT value FROM i18n_translations
         WHERE key_id = ? AND language = ?;`
    );
    const updateTr = db.prepare(
        `UPDATE i18n_translations
         SET value = ?
         WHERE key_id = ? AND language = ?;`
    );
    const insertTr = db.prepare(
        `INSERT INTO i18n_translations (key_id, language, value)
         VALUES (?, ?, ?);`
    );
    const updateSuggestion = db.prepare(
        `UPDATE i18n_suggestions
         SET status = ?, reviewed_at = CURRENT_TIMESTAMP
         WHERE id = ?;`
    );

    const tx = db.transaction(() => {
        const existing = selectExisting.get(sugg.key_id, sugg.language);

        if (existing) {
            updateTr.run(sugg.value, sugg.key_id, sugg.language);
            writeI18nAudit(
                sugg.project_id,
                sugg.key_id,
                sugg.language,
                AUDIT_ACTION.SUGGESTION_APPROVED,
                JSON.stringify(existing.value),
                JSON.stringify(sugg.value),
                moderatorId
            );
        } else {
            insertTr.run(sugg.key_id, sugg.language, sugg.value);
            writeI18nAudit(
                sugg.project_id,
                sugg.key_id,
                sugg.language,
                AUDIT_ACTION.SUGGESTION_APPROVED,
                null,
                JSON.stringify(sugg.value),
                moderatorId
            );
        }

        updateSuggestion.run(
            SUGGESTION_STATUS.APPROVED,
            sugg.id
        );
    });

    tx();

    return { status: 'ok', suggestion: sugg };
}

function rejectI18nSuggestion(id, moderatorId) {
    const sugg = db.prepare(
        `SELECT s.*, k.project_id
         FROM i18n_suggestions s
         JOIN i18n_keys k ON k.id = s.key_id
         WHERE s.id = ?;`
    ).get(id);

    if (!sugg) {
        return { status: 'not_found' };
    }
    if (sugg.status !== SUGGESTION_STATUS.PENDING) {
        return { status: 'not_pending', suggestion: sugg };
    }

    const updateSuggestion = db.prepare(
        `UPDATE i18n_suggestions
         SET status = ?, reviewed_at = CURRENT_TIMESTAMP
         WHERE id = ?;`
    );

    const tx = db.transaction(() => {
        updateSuggestion.run(
            SUGGESTION_STATUS.REJECTED,
            sugg.id
        );
        writeI18nAudit(
            sugg.project_id,
            sugg.key_id,
            sugg.language,
            AUDIT_ACTION.SUGGESTION_REJECTED,
            null,
            JSON.stringify(sugg.value),
            moderatorId
        );
    });

    tx();

    return { status: 'ok', suggestion: sugg };
}

function getI18nProjects() {
    return db.prepare(
        'SELECT id, slug, name FROM i18n_supported_projects ORDER BY slug ASC;'
    ).all();
}

function getI18nProjectBySlug(slug) {
    return db.prepare(
        'SELECT * FROM i18n_supported_projects WHERE slug = ?;'
    ).get(slug);
}

function createI18nProject(slug, name) {
    const info = db.prepare(
        'INSERT INTO i18n_supported_projects (slug, name) VALUES (?, ?);'
    ).run(slug, name);
    return db.prepare(
        'SELECT * FROM i18n_supported_projects WHERE id = ?;'
    ).get(info.lastInsertRowid);
}

function getI18nKeyByProjectAndName(projectId, keyName) {
    return db.prepare(
        'SELECT * FROM i18n_keys WHERE project_id = ? AND key_name = ?;'
    ).get(projectId, keyName);
}

function getI18nKeysForProject(projectId) {
    return db.prepare(
        'SELECT * FROM i18n_keys WHERE project_id = ? ORDER BY key_name ASC;'
    ).all(projectId);
}

function deleteI18nKey(id) {
    return db.prepare(
        'DELETE FROM i18n_keys WHERE id = ?'
    ).run(id);
}

/**
 * keys: [{ keyName, valueType, description }]
 */
function createI18nKeysBulk(projectId, keys) {
    const selectStmt = db.prepare(
        `SELECT * FROM i18n_keys WHERE project_id = ? AND key_name = ?;`
    );

    const insertStmt = db.prepare(
        `INSERT INTO i18n_keys (project_id, key_name, value_type, description)
         VALUES (?, ?, ?, ?);`
    );

    const updateDescStmt = db.prepare(
        `UPDATE i18n_keys SET description = ? WHERE id = ?;`
    );

    const updateTypeStmt = db.prepare(
        `UPDATE i18n_keys SET value_type = ? WHERE id = ?;`
    );

    const selectByIdStmt = db.prepare(
        `SELECT id, key_name, value_type, description FROM i18n_keys WHERE id = ?;`
    );

    const results = [];

    const tx = db.transaction(() => {
        for (const item of keys) {
            const keyName = item.keyName;
            const description = item.description ?? null;

            const valueType = normalizeKeyType(item.valueType ?? item.value_type ?? item.type ?? "string");

            let existing = selectStmt.get(projectId, keyName);
            if (existing) {
                let changed = false;

                // обновим описание при необходимости
                if (description !== null && description !== undefined && description !== existing.description) {
                    updateDescStmt.run(description, existing.id);
                    changed = true;
                }

                // обновим тип если он отличается (я делаю это разрешённым)
                const currentType = normalizeKeyType(existing.value_type ?? "string");
                if (valueType && currentType !== valueType) {
                    updateTypeStmt.run(valueType, existing.id);
                    changed = true;
                }

                results.push(changed ? selectByIdStmt.get(existing.id) : existing);
            } else {
                const info = insertStmt.run(projectId, keyName, valueType, description);
                results.push(selectByIdStmt.get(info.lastInsertRowid));
            }
        }
    });

    tx();

    return results;
}

function upsertI18nTranslation(keyId, language, jsValue, authorId) {
    const encoded = JSON.stringify(jsValue);

    const oldRow = db
        .prepare(
            `SELECT value FROM i18n_translations
             WHERE key_id = ? AND language = ?`
        )
        .get(keyId, language);

    db.prepare(
        `INSERT INTO i18n_translations (key_id, language, value)
         VALUES (?, ?, ?)
         ON CONFLICT(key_id, language)
         DO UPDATE SET value = excluded.value`
    ).run(keyId, language, encoded);

    // опционально: пишем в аудит (action = 3 — ручное редактирование)
    db.prepare(
        `INSERT INTO i18n_audit (
            project_id,
            key_id,
            language,
            action,
            old_value,
            new_value,
            author,
            created_at
        )
        VALUES (
            (SELECT project_id FROM i18n_keys WHERE id = ?),
            ?, ?, 3, ?, ?, ?, CURRENT_TIMESTAMP
        )`
    ).run(
        keyId,
        keyId,
        language,
        oldRow ? oldRow.value : null,
        encoded,
        authorId
    );
}

function updateI18nKeyDescription(keyId, description) {
    db.prepare(
        `UPDATE i18n_keys
         SET description = ?
         WHERE id = ?`
    ).run(description, keyId);
}


export default {
    init: init,
    priority: 5000
}

export {
    db,
    getUser,
    createUser,
    modifyUser,
    addPermission,
    getPermissions,
    removePermission,
    getUserByGitHubId,
    SUGGESTION_STATUS,
    AUDIT_ACTION,
    getI18nProjects,
    getI18nProjectBySlug,
    createI18nProject,
    getI18nKeyByProjectAndName,
    getI18nKeysForProject,
    createI18nKeysBulk,
    getI18nTranslationsForProjectLanguage,
    bulkImportI18nTranslations,
    createI18nSuggestion,
    getI18nSuggestionsByStatus,
    approveI18nSuggestion,
    rejectI18nSuggestion,
    upsertI18nTranslation,
    updateI18nKeyDescription,
    deleteI18nKey,
    writeI18nAudit,
    getI18nKey,
    addI18nLanguage,
    getI18nLanguages
};