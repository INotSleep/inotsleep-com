#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

git fetch origin main
git reset --hard origin/main

cd ./vite
npm ci
npm run build

cd ../
rsync -a --delete ./vite/dist/ ./express/dist/

cd ./express
npm ci
pm2 startOrReload ecosystem.config.cjs