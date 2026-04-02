import express from 'express';
import fs from 'fs/promises';
import { db } from './modules/database.js'
import dotenv from 'dotenv';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

async function start() {
    const isProduction = process.env.NODE_ENV === "production";

    app.disable("x-powered-by");
    app.set("trust proxy", isProduction ? 1 : false);

    app.use(
        helmet({
            contentSecurityPolicy: false,
            crossOriginEmbedderPolicy: false
        })
    );

    app.use(
        "/api",
        rateLimit({
            windowMs: 60 * 1000,
            max: 120,
            standardHeaders: true,
            legacyHeaders: false
        })
    );

    app.use(express.json({ limit: "1mb" }));
    app.use(express.urlencoded({ extended: false, limit: "1mb" }));


    let modules = [];

    let files = await fs.readdir('./modules')

    for (const file of files) {
        if (file.endsWith('.js')) {
            const modulePath = `./modules/${file}`;
            modules.push(
                import(modulePath).then(m => {
                    const init = m.default.init || m.default;
                    const priority = m.default.priority || 0;

                    return {
                        init,
                        priority,
                        name: file
                    };
                })
            );
        }
    }

    modules = (await Promise.all(modules));

    // Less priority init last

    modules.sort((a, b) => b.priority - a.priority);

    modules.forEach(module => {
        console.log(`Initializing module ${module.name}`);
        module.init(app);
    });

    app.listen(PORT, "127.0.0.1", () => {
        console.log(`Listening on 127.0.0.1:${PORT}`);
    });
}

let isShuttingDown = false;

function shutdown(code = 0) {
    if (isShuttingDown) return;
    isShuttingDown = true;

    try {
        db.close();
    } catch (err) {
        console.error('Failed to close DB on shutdown:', err);
    }

    process.exit(code);
}

process.on('SIGINT', () => {
    shutdown(0);
});

process.on('SIGTERM', () => {
    shutdown(0);
});

process.on('exit', () => {
    if (!isShuttingDown) {
        try {
            db.close();
        } catch {

        }
    }
});

start();

export {
    shutdown
}
