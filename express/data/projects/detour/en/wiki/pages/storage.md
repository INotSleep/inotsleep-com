# Storage: Git or a folder

Teams and your synced personal vault are kept in storage you provide. Detour treats it as untrusted: it holds only encrypted, signed files, and every client checks that nothing was forged, hidden or rolled back.

## Git repository

Use a **private, empty** repository on any Git host (GitHub, GitLab, Gitea, your own server). Detour has its own Git client, so you don't need `git` installed.

**Over SSH** (`git@github.com:you/team-vault.git`):

1. Choose a key from your vault, or ssh-agent, as the **Repository login**.
2. Add that key's **Public key** (Detour shows a copy button) as a deploy key with write access, or to your account.
3. The first time, compare the server's fingerprint with the one your Git host publishes, then trust it.

**On GitHub over HTTPS** (`https://github.com/you/team-vault.git`), signing in with GitHub is the easiest:

1. Click **Sign in with GitHub**. Detour shows a short code; **Copy code and open GitHub**, paste it there and allow access.
2. If the repository doesn't have the **Detour Sync** app yet, Detour says so and offers **Install on GitHub**: install it on that repository only. Detour notices by itself once it's done.

The sign-in only reaches the repositories you installed Detour Sync on, with read and write access to their contents, and only those you can reach anyway. It belongs to this device: it's kept in your personal vault but doesn't sync, and each device signs in on its own. It renews itself; if GitHub stops accepting it, the team page or **Settings → Sync** offers **Check GitHub access** to sign in again.

**With an access token** (any Git host over HTTPS, or GitHub if you prefer; on GitHub choose **Use an access token**):

1. Create a token with read and write access to that repository only. On a github.com repository, **Create on GitHub** opens GitHub's form already filled in (a fine-grained token with **Contents: Read and write**, valid for a year); pick the repository there.
2. Paste it into **Access token**. Each member uses a token of their own; it stays in their personal vault.

If a token expires or is revoked, the team page shows it and offers **New token**.

Detour pushes after every change and pulls every 20 seconds. A leaked repository login gives access to ciphertext only.

## Shared folder

Any folder that a sync tool keeps the same on every machine works: Syncthing, Dropbox, OneDrive, Google Drive, a network share (SMB). When creating, choose an **empty folder**; when joining, choose the folder that already holds the team.

Each device writes only its own files, so the sync tool never sees two devices editing the same file.

On another device, a team in a folder shows **Not connected** until you **Choose folder** there.

## What the storage can see

| Visible | Hidden |
|---|---|
| How many devices write, when, and how much | Team and member names, roles, Detour IDs |
| Which changes touch the same (random) record id | Record types, names, addresses, logins |
| | Passwords, keys, snippets, who can see what |
