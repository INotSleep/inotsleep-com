import session from 'express-session';
import SQLiteStoreFactory from 'better-sqlite3-session-store';
import { db } from '../database.js';

/**
 * @param {import('express').Express} app
 */
function init(app) {
    const SQLiteStore = SQLiteStoreFactory(session);
    const store = new SQLiteStore({
        client: db,
        expired: {
            clear: true,
            intervalMs: 900000 // 15 minutes
        }
    });

    app.use(session({
        store: store,
        secret: process.env.SESSION_SECRET || 'default_secret',
        resave: false,
        saveUninitialized: false,
    }));
}

export default {
    init,
    priority: 1000
}