# Privacy policy

Effective 17 November 2026.

Detour is an open-source SSH client made by INotSleep. This policy covers the Detour apps (desktop and mobile) and the `detour` command line. The source code is public at [github.com/INotSleep/Detour](https://github.com/INotSleep/Detour), so everything below can be checked.

## In short

Detour has no servers, no accounts, no analytics and no telemetry. Your data stays on your devices and in the storage you choose. The developer never receives any of it.

## What Detour keeps, and where

Detour keeps your hosts, keys, passwords, snippets, settings and teams in a vault on your device, encrypted with your master password. Where the folder is: see [Data and privacy](/projects/detour/wiki/reference/data).

If you turn on sync or use teams, Detour also writes encrypted, signed files to the storage you pick: a Git repository, a folder, or a folder in a cloud drive (OneDrive, Google Drive, Dropbox). Those files are encrypted on your device before they leave it; the storage provider can't read them. See [Storage](/projects/detour/wiki/sync-and-teams/storage) for what the storage can and can't see.

## Who Detour connects to

Only:

- the SSH servers you add, and the jump hosts and proxies you set for them;
- the storage you choose for sync and teams;
- GitHub, to check for updates (you can turn this off) and, if you sign in with GitHub, to reach the repositories you allowed;
- Microsoft, Google or Dropbox, if you sign in to that drive, to reach the folders you use.

## Cloud drives: Google Drive, OneDrive and Dropbox

When you sign in to a cloud drive in Detour, you grant Detour access to your files in that drive. With Google Drive this is the `https://www.googleapis.com/auth/drive` scope; with OneDrive, `Files.ReadWrite.All` and `User.Read`; with Dropbox, access to your files and shared folders.

**What Detour does with it.** Detour uses this access only to do what you ask in the app:

- show your folders and the folders shared with you, so you can pick one for sync or a team, and create a new folder when you ask;
- open a folder from a share link you paste;
- read and write Detour's own encrypted files in the folder you picked, and delete old ones of them, to keep your devices and your team in step;
- read your account's name or email address, to show which account you signed in with.

Detour doesn't read, change or delete any other files, and doesn't look inside folders you haven't picked.

**Where it goes.** All of this happens directly between the app on your device and the drive's servers. Nothing passes through, or is kept on, any server of Detour's or its developer's. Your files, their contents and your account details are never sent to the developer or to anyone else, never sold, never used for advertising, and never used to train AI or machine learning models.

**How the sign-in is kept.** The access and refresh tokens the drive gives Detour are kept only on that device, inside your encrypted vault. They are never synced to your other devices or shared with your team; each device signs in on its own.

**Limited Use.** Detour's use and transfer to any other app of information received from Google APIs will adhere to the [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy), including the Limited Use requirements.

## How long it's kept, and removing it

Your vault stays on your device until you delete it. The files Detour wrote to your storage stay there until you delete them.

To take Detour's access to a drive back:

- sign out of the drive with `detour drive logout <drive>` on the command line, which deletes its tokens from the device;
- or revoke it in your account: [Google](https://myaccount.google.com/permissions), [Microsoft](https://account.live.com/consent/Manage) (for work or school accounts, [My Apps](https://myapps.microsoft.com)), [Dropbox](https://www.dropbox.com/account/connected_apps).

Uninstalling Detour and deleting its data folder removes everything it kept on that device.

## Children

Detour is a tool for managing servers and is not directed at children.

## Changes

If this policy changes, the new version is published on this page with a new effective date.

## Contact

Questions about privacy: open an issue at [github.com/INotSleep/Detour/issues](https://github.com/INotSleep/Detour/issues).
