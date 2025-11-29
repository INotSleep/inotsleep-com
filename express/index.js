import express from 'express';
import fs from 'fs/promises';
import { db } from './database.js'
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

async function start() {
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

    app.listen(PORT, () => {
        console.log(`Listening on ::${PORT}`);
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