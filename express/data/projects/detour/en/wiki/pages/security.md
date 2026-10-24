# Security model

Detour treats the storage, the network and every other member's computer as hostile. There is no Detour server to trust or to breach.

## What happens if

| If | Then |
|---|---|
| your Git host or shared folder leaks | the attacker gets ciphertext. Names, addresses, logins, members and who can see what are encrypted. |
| the storage alters, reorders, hides or rolls back changes others have seen | every member's Detour detects it and says so. |
| a teammate's copy of Detour is modified | it still holds only the keys that teammate was given. Access is enforced by encryption, not by the app. |
| someone is removed from a team | the rest of the team moves to new keys. Nothing written afterwards is readable to them. |
| your laptop is stolen | the vault is sealed with your master password and locks itself when idle. |
| a server's host key changes | the connection stops before any password or key is sent. |
| a Detour ID is swapped on its way to an admin | the fingerprints you compare don't match. |
| someone publishes a fake update | the app refuses it: updates must carry the project's signature. |

## How it's built

- **Your vault** is encrypted with [age](https://age-encryption.org): an X25519 identity sealed with your master password through scrypt.
- **Team data** is split into per-record parts, each encrypted with ChaCha20-Poly1305 under its own key. Members receive only the keys for what they may see, sealed to their Detour ID.
- **Every change** is signed with Ed25519 and chained to the device's previous change. Each change also records how far its author had read every other device, so missing or rolled-back changes show up.
- **SSH** is [russh](https://github.com/Eugeny/russh), TLS for Git over HTTPS is [rustls](https://github.com/rustls/rustls) with your system's certificate store.
- **Updates** are signed with the project's key, which is built into the app.
- No accounts, no telemetry.

## What cryptography can't do

Detour doesn't pretend to solve these:

- Anyone allowed to read something can copy it and pass it on.
- Connecting with a shared password means having it: "may connect with the shared password" and "may see it" are the same right.
- Someone removed from a team keeps what they already had. Change the shared passwords and keys they could see.
- With one storage and no other channel, the storage can show a member a consistent but *old* state and hold back the newest changes nobody has acknowledged yet. It can't hide what someone has already acknowledged, roll a client back, or show two members different histories without that showing up. Compare the [state fingerprint](/projects/detour/wiki/sync-and-teams/conflicts) over another channel to be sure.

The full design: [docs/teams.md](https://github.com/INotSleep/Detour/blob/main/docs/teams.md).

## Reporting a vulnerability

Please don't open a public issue. Write to the author through [GitHub](https://github.com/INotSleep) and give them time to release a fix.
