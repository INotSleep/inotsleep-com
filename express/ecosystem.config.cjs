module.exports = {
    apps: [
        {
            name: 'inotsleep-com-server',
            script: 'index.js',
            cwd: __dirname,
            instances: 1,
            exec_mode: 'fork',
            env: {
                NODE_ENV: 'production',
            },
        },
    ],
};
