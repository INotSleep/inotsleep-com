import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { describePage, renderHtml, robotsTxt, sitemapXml } from '../lib/seo.js';

const distDir = path.join(process.cwd(), 'dist');
let templatePromise = null;

function loadTemplate() {
    if (!templatePromise) {
        templatePromise = fs.readFile(path.join(distDir, 'index.html'), 'utf-8')
            .catch((error) => {
                templatePromise = null;
                throw error;
            });
    }
    return templatePromise;
}

/**
 * @param {express.Express} app
 */
function init(app) {
    app.get('/robots.txt', (req, res) => {
        res.type('text/plain').send(robotsTxt());
    });

    app.get('/sitemap.xml', async (req, res, next) => {
        try {
            res.type('application/xml').send(await sitemapXml());
        } catch (error) {
            next(error);
        }
    });

    app.use(express.static(distDir, {
        index: false,
        setHeaders(res, filePath) {
            // Vite puts a content hash in every file name under assets/, so a URL never changes meaning.
            if (filePath.startsWith(path.join(distDir, 'assets') + path.sep)) {
                res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            }
        }
    }));

    app.get('*path', async (req, res, next) => {
        let template;
        try {
            template = await loadTemplate();
        } catch (error) {
            return next(error);
        }

        try {
            const page = await describePage(req.path);
            res.status(page.status).type('html').send(renderHtml(template, page));
        } catch (error) {
            // The app still works without the server-side extras.
            console.error('Page description failed', req.path, error);
            res.type('html').send(template);
        }
    });
}

export default {
    init,
    priority: -1000
}
