import session from 'express-session';
import SQLiteStoreFactory from 'better-sqlite3-session-store';
import crypto from 'node:crypto';
import { db } from './database.js';

/**
 * @param {import('express').Express} app
 */
function init(app) {
    const isProduction = process.env.NODE_ENV === "production";
    const configuredSecret = typeof process.env.SESSION_SECRET === "string"
        ? process.env.SESSION_SECRET.trim()
        : "";

    if (isProduction && configuredSecret.length < 32) {
        throw new Error("SESSION_SECRET must be set and at least 32 chars in production");
    }

    const sessionSecret = configuredSecret.length >= 32
        ? configuredSecret
        : crypto.randomBytes(48).toString("hex");

    if (configuredSecret.length < 32) {
        console.warn(
            "SESSION_SECRET is missing or too short; generated ephemeral secret is used for this process."
        );
    }

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
        secret: sessionSecret,
        resave: false,
        saveUninitialized: false,
        name: "inotsleep.sid",
        cookie: {
            httpOnly: true,
            secure: isProduction,
            sameSite: "lax",
            maxAge: 30 * 24 * 60 * 60 * 1000
        }
    }));
}

export default {
    init,
    priority: 1000
}
