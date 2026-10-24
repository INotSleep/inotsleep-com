# Importing from ~/.ssh

If you already use OpenSSH, Detour can take your hosts, keys and known server keys from `~/.ssh`.

Open **Hosts** and click **Import from ~/.ssh** (when the list isn't empty, it's in the **⋯** menu next to **Add host**). Detour reads your files and shows what it found; pick the hosts you want and click **Import N hosts**.

## What is read

- **`~/.ssh/config`**, the way `ssh` reads it: the first value for an option wins, `Host *` defaults apply, patterns and negations (`!host`) work, and `Include` files (with wildcards) are followed. Wildcard-only blocks such as `Host *` aren't hosts themselves.
- **`HostName`, `Port`, `User`, `IdentityFile`** become the host's address, port, user and key.
- **`ProxyJump`**, including chains, becomes a [jump host](/projects/detour/wiki/everyday/proxies). Jump hosts that aren't in your config are imported too.
- **Keys** named by `IdentityFile` are imported into [Keys](/projects/detour/wiki/everyday/keys). A key with a passphrase is imported as is; Detour asks for the passphrase when it's first used.
- **`~/.ssh/known_hosts`**: plain entries become trusted server keys, so you don't confirm them again. Hashed entries, wildcard patterns and `@cert-authority` or `@revoked` lines are skipped.

Imported hosts go into the group **SSH config**; rename or regroup them afterwards as you like.

## What isn't

- **`ProxyCommand`** can't be imported; such hosts are marked. Set up a [jump host or proxy](/projects/detour/wiki/everyday/proxies) instead.
- If a key file is missing, the host is imported with **ssh-agent** as its login.
- Hosts already in Detour are marked **Already added** and skipped.

Nothing in `~/.ssh` is changed.
