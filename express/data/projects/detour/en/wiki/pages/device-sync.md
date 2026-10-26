# Sync between your devices

Your personal vault can follow you to your other computers. It syncs through storage you already have: an empty folder that a sync tool keeps in step (Syncthing, Dropbox, OneDrive, a network share), or a private Git repository. The storage only ever sees encrypted, signed files. See [Storage: Git or a folder](/projects/detour/wiki/sync-and-teams/storage).

## Turn it on (first device)

1. **Settings → Sync → Between your devices → Turn on**.
2. Choose an **empty folder**, or a **Git repository** with its login.
3. Detour shows a **recovery key**. Save it somewhere safe: it opens the synced vault even if all your devices are lost.

## Add another device

1. On a device that already syncs: **Settings → Sync → Another device → Add**. Detour shows a one-time code like `ABCD-EFGH-JKMN-PQRS`, valid for one hour.
2. On the new device, after creating its vault: **Settings → Sync → Connect**. Choose the same folder or repository and enter the code.

The recovery key works in place of the code when no other device is at hand.

## What syncs

| Syncs | Stays on each device |
|---|---|
| Hosts and their saved passwords | The master password (each device has its own) |
| Keys, with private parts and saved passphrases | Last connected times |
| Snippets and tunnels | Where a team's folder is on this device |
| Trusted server keys | Sync settings |
| Personal logins for team hosts | |
| The list of teams you're in | |

Edits made on different devices at the same time merge field by field; if the same field changed on both, the later change wins.

Teams kept in a Git repository connect on your other devices by themselves. A team kept in a folder shows as **Not connected** until you point it at its folder on that device (**Choose folder**).

## Status and problems

The sidebar shows when the vault last synced. **Sync** in Settings syncs right away. If the storage can't be reached, or a repository's token or server key changed, the status says so and offers the fix (**New token** or **Check GitHub access**, **Replace server key**).

## Turn it off

**Settings → Sync → Sync on this device → Turn off** stops syncing on this device. Your local vault stays as it is, and the storage isn't touched.

A device that is already in teams with its own identity can't join someone else's synced vault, since its teams know it by that identity.
