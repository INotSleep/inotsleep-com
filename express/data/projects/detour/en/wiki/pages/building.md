# Building from source

Detour is a [Tauri 2](https://tauri.app) app: a Rust core (`crates/detour-core`), a thin Tauri shell (`src-tauri`) and a React + TypeScript interface with an xterm.js terminal (`src`).

## Requirements

- Node.js 20 or newer
- Rust, stable
- The [Tauri prerequisites](https://tauri.app/start/prerequisites/) for your system (on Windows: Visual Studio Build Tools with the C++ workload, and WebView2)

## Run it

```bash
git clone https://github.com/INotSleep/Detour.git
cd Detour
npm install
npm run tauri dev        # the desktop app
```

`npm run dev` starts only the interface in a browser at `http://localhost:1420`, with demo data, which is handy for UI work.

## Tests

```bash
cargo test --workspace
npx tsc --noEmit
```

The SFTP tests use OpenSSH's `sftp-server` (Git for Windows ships one; on Linux install `openssh-sftp-server`) and are skipped if it isn't found.

## Installers

```bash
npm run tauri build -- --config "{\"bundle\":{\"createUpdaterArtifacts\":false}}"
```

Official releases also sign their update files with the project's updater key, which isn't in the repository; the command above builds without them.

## Layout

```
crates/detour-core/   SSH, SFTP, vaults, team sync, crypto. No UI dependencies.
src-tauri/            Tauri 2 shell: thin commands over detour-core
src/                  React + TypeScript interface
  lib/api.ts          the only boundary between the UI and the core
  i18n/               interface text in English and Russian
```

## License

Detour is under the [GNU AGPL v3](https://github.com/INotSleep/Detour/blob/main/LICENSE) with the additional terms in [NOTICE](https://github.com/INotSleep/Detour/blob/main/NOTICE): a modified version must keep the "Based on Detour" attribution and must not call itself Detour.
