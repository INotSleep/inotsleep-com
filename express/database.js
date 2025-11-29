import sqlite from 'better-sqlite3';

const db = new sqlite('database.db');
db.pragma('journal_mode = WAL');

db.prepare(
    `CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        github_id TEXT UNIQUE,
        github_login TEXT,
        github_avatar_url TEXT,
        access_token TEXT
    )`
).run();

db.prepare(
    `CREATE TABLE IF NOT EXISTS permissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id UUID,
        permission TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )`
).run();

function getUser(id) {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

function getUserByGitHubId(githubId) {
    return db.prepare('SELECT * FROM users WHERE github_id = ?').get(githubId);
}

function createUser(githubId, githubLogin, githubAvatarUrl, accessToken) {
    const id = crypto.randomUUID();
    db.prepare(
        'INSERT INTO users (id, github_id, github_login, github_avatar_url, access_token) VALUES (?, ?, ?, ?, ?)'
    ).run(id, githubId, githubLogin, githubAvatarUrl, accessToken);
    return getUser(id);
}

function modifyUser(id, githubLogin, githubAvatarUrl, accessToken) {
    db.prepare(
        'UPDATE users SET github_login = ?, github_avatar_url = ?, access_token = ? WHERE id = ?'
    ).run(githubLogin, githubAvatarUrl, accessToken, id);
    return getUser(id);
}

function addPermission(userId, permission) {
    db.prepare(
        'INSERT INTO permissions (user_id, permission) VALUES (?, ?)'
    ).run(userId, permission);
}

function getPermissions(userId) {
    return db.prepare(
        'SELECT permission FROM permissions WHERE user_id = ?'
    ).all(userId).map(row => row.permission);
}

function removePermission(userId, permission) {
    db.prepare(
        'DELETE FROM permissions WHERE user_id = ? AND permission = ?'
    ).run(userId, permission);
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
};