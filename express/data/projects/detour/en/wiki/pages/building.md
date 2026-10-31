# Building from source

Detour is a [Tauri 2](https://tauri.app) app: a Rust core (`crates/detour-core`) that runs as a process of its own (`crates/detour-daemon`), the `detour` command line (`crates/detour-cli`), a thin Tauri shell (`src-tauri`) and a React + TypeScript interface with an xterm.js terminal (`src`).

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

The command line:

```bash
cargo build -p detour-cli          # target/debug/detour
cargo run -p detour-cli -- --help
```

Set `DETOUR_DATA_DIR` to a folder of its own to try things on a test vault beside your real one.

## Tests

```bash
cargo test --workspace
npx tsc --noEmit
```

The SFTP tests use OpenSSH's `sftp-server` (Git for Windows ships one; on Linux install `openssh-sftp-server`) and are skipped if it isn't found.

## Installers

```bash
npm run tauri build -- --config src-tauri/tauri.bundle.conf.json --config "{\"bundle\":{\"createUpdaterArtifacts\":false}}"
```

`tauri.bundle.conf.json` builds the command line and puts it into the installers, with the `PATH` set up on Windows. Official releases also sign their update files with the project's updater key, which isn't in the repository; the command above builds without them.

## Layout

```
crates/detour-core/   SSH, SFTP, vaults, team sync, crypto. No UI dependencies.
crates/detour-ipc/    the protocol between the core and its clients
crates/detour-daemon/ the core as a process: sessions, tunnels, sync, AI agents
crates/detour-cli/    the `detour` command line and MCP server
src-tauri/            Tauri 2 shell: the window, the tray, a proxy to the core
src/                  React + TypeScript interface
  lib/api.ts          the only boundary between the UI and the core
  i18n/               interface text in English and Russian
```

## License

Detour is under the [GNU AGPL v3](https://github.com/INotSleep/Detour/blob/main/LICENSE) with the additional terms in [NOTICE](https://github.com/INotSleep/Detour/blob/main/NOTICE): a modified version must keep the "Based on Detour" attribution and must not call itself Detour.
