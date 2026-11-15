# Exporting hosts

Hosts can leave Detour as `~/.ssh/config` entries, for `ssh` and other tools, or as a **Detour file** that another Detour takes in with everything that logs in to them.

Open **Hosts**, then **⋯ → Export hosts** for the whole list, or **Export hosts** in a host's menu for that one. Untick the hosts you don't want.

## As an ssh config

- Each host becomes a `Host` entry with `HostName`, `User`, `Port`, `IdentityFile` and `ProxyJump` for [jump hosts](/projects/detour/wiki/everyday/proxies). Jump hosts are added even if you didn't pick them.
- **Copy** puts the entries on the clipboard; **Save…** writes them to a file.
- **Save N keys next to the file** writes the hosts' keys as OpenSSH files next to it, and `IdentityFile` points to them.
- Passwords can't go into an ssh config, and neither can WireGuard or VLESS proxies: such a host gets a comment instead.

## As a Detour file

Pick **Detour file**, choose what goes in, and set a password for the file:

- **Passwords**: saved passwords of the hosts and their proxies, and saved key passphrases
- **Keys** the hosts log in with. Without them the hosts log in with ssh-agent
- **Proxies** the hosts go through, with their keys or passwords
- **Server keys**: the servers' trusted keys, so they don't have to be confirmed again
- **Groups and order**

For a team host the file has the login you use: your own login or your group's if you have one, otherwise the shared one.

The file is encrypted with its password ([age](https://age-encryption.org), as the vault's master password is). Without the password nothing in it can be read, so send the password some other way than the file.

### Importing it

**⋯ → Import from ~/.ssh**, then **From a Detour file…**: pick the file and enter its password. Hosts already in your vault (the same address, port and user, or name) are unticked; tick one to get a copy of it.

The hosts go into your personal vault. Keys and proxies that are already there are used, not added again, and a jump host that is already there is gone through.

## From the command line

```bash
detour hosts export web db > detour.conf                    # as ~/.ssh/config entries
detour hosts export --file hosts.detour                     # every host to a Detour file; asks for its password
detour hosts export web --file web.detour --no-passwords    # also --no-keys, --no-proxies, --no-known-hosts, --no-groups
detour hosts import --file hosts.detour                     # the hosts that aren't here yet; or name them
```
