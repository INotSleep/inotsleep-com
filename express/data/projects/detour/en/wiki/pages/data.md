# Data and privacy

## What Detour sends, and where

Detour connects only to:

- the servers you add, and the jump hosts and proxies you set for them;
- the Git repositories or folders you choose for sync and teams;
- GitHub releases, to check for updates. Turn this off with **Settings → About → Check at startup**.

There are no accounts, no analytics and no telemetry.

## Where your data is

Everything lives in one folder:

| System | Folder |
|---|---|
| Windows | `%APPDATA%\detour\Detour\data` |
| macOS | `~/Library/Application Support/dev.detour.Detour` |
| Linux | `~/.local/share/detour` |

Inside, the vault and the device identity are encrypted; nothing in that folder is readable without your master password. Set the `DETOUR_DATA_DIR` environment variable to keep the data elsewhere, for example on a USB drive.

Appearance and terminal settings are kept separately by the app's web view, per device.

## Backups

Back up the data folder like any other file: it's useless without the master password. For an off-site copy, [sync](/projects/detour/wiki/sync-and-teams/device-sync) to a private repository and keep the recovery key safe.

## Removing Detour

Uninstall the app, then delete the data folder above. Teams and synced vaults stay in their storage; remove those folders or repositories yourself if you no longer need them.
