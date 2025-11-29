import express from 'express';
import path from 'path';

/**
 * @param {express.Express} app
 */
function init(app) {
    app.use(express.static(path.join(process.cwd(), 'dist')));

    app.get('*path', (req, res) => {
        res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    });
}

export default {
    init,
    priority: -1000
}