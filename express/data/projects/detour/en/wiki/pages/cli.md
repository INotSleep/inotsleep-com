# Command line

`detour` does in a terminal what the app does in its window: hosts, terminals, commands, files, tunnels, keys, snippets, sync and teams. It works with the same vault, at the same time as the window, and on servers that have no desktop at all.

## Install

The installers put `detour` next to the app and on your `PATH`:

| System | Where |
|---|---|
| Windows | the install folder; the `.exe` installer adds it to your `PATH`, the `.msi` to the system's. Open a new terminal after installing |
| Debian, Ubuntu, Fedora | `/usr/bin/detour` |
| macOS | inside `Detour.app`. **Settings → Command line → Install** links it into `/usr/local/bin` (macOS asks for your password) |
| AppImage | not on the `PATH`: use the archive below |

For a server without a desktop, download `detour` alone from the [latest release](https://github.com/INotSleep/Detour/releases/latest): `detour-cli-<version>-linux-x86_64.tar.gz`, `linux-arm64`, `macos` or `windows-x86_64.zip`. Each comes with a `.sha256` to check it against.

```bash
tar xzf detour-cli-*-linux-x86_64.tar.gz
sudo mv detour /usr/local/bin/
detour --version
```

The macOS archive isn't notarized: run `xattr -d com.apple.quarantine detour` once before using it.

## The core

Detour runs in two parts: the **core**, which holds the unlocked vault, sessions, tunnels and sync, and its clients: the window, `detour` and [AI agents](/projects/detour/wiki/command-line/agents). Whichever starts first starts the core; the others join it. So:

- a vault unlocked in the window is unlocked for `detour` too, and the other way round;
- terminals keep running when you close the window, and come back as tabs when you open it again;
- a host added with `detour hosts add` shows up in the window at once.

```bash
detour status   # is the core running, is the vault locked
detour unlock   # unlock with the master password
detour lock     # lock: tunnels and file browsers close, terminals keep running
detour quit     # stop the core: every session and tunnel ends
```

A locked core with nothing running stops by itself after a few minutes.

On a computer with a desktop, a core that `detour` or an [AI agent](/projects/detour/wiki/command-line/agents) started brings Detour up in the tray, its window hidden: the tray shows the core is running, and a request from an agent or a terminal opens the window. It goes away with the core unless you opened it. Over SSH, and with `DETOUR_NO_TRAY` set, it doesn't.

## Trusted terminals

Any program on your computer can run `detour`, an AI agent in your shell included. So `detour` works only in a terminal you trusted:

- with the Detour window open, the window asks **A terminal asks to use Detour** and shows which one; click **Allow**;
- without the window, `detour` asks for the master password in that terminal.

Once trusted, the terminal stays trusted for 12 hours, or until you lock Detour. In Git Bash, every command started from the same window counts as one terminal.

The master password is read from the terminal itself, never from a pipe, so a script or an agent can't type it in.

## Hosts

```bash
detour ls                       # every host; `detour ls web` filters by name, address, user or group
detour hosts add web --address 203.0.113.10 --user deploy --key laptop
detour hosts edit web --port 2222 --group Production
detour hosts rm web
detour hosts import             # everything new from ~/.ssh/config; or name the aliases
detour hosts export web db > detour.conf               # as ~/.ssh/config entries
detour hosts export web --keys ~/.ssh/detour -o ~/.ssh/detour.conf   # with their keys as files
```

A host is named by its name or its id. A name that matches several hosts is an error that lists them.

`hosts add` logs in with ssh-agent unless you give `--key`, `--password` (asked right away; leave it empty to be asked on every connection) or `--agent`. `--via` goes through a jump host, `--proxy` through a [saved proxy](#proxies), `--forward-agent true` forwards ssh-agent.

## Groups

```bash
detour groups ls                                # in order, with the proxy and login each gives
detour groups add Databases
detour groups move Databases --before Web       # or --last
detour hosts move db1 --group Databases --before db2
detour -T acme groups ls --mine                 # your own grouping of a team's hosts
detour -T acme groups set Production --proxy my-vpn --user vlad --key laptop
detour -T acme groups set Production --team-proxy office   # for everyone in the team
```

`rename` and `rm` work like `add`; `--mine` works with all of them and with `hosts move`. [Groups of hosts](/projects/detour/wiki/everyday/groups) says which proxy and login a host ends up with.

## Working on a host

```bash
detour ssh web                          # a terminal, like ssh
detour exec web -- df -h /              # a command; detour exits with its exit code
detour cp ./build.tar.gz web:/srv/      # upload; folders too
detour cp web:/var/log/app.log .        # download
detour files ls web:/srv
detour files mkdir web:/srv/new
detour files mv web:/srv/old /srv/archive
detour files chmod web:/srv/run.sh 755
detour files rm web:/srv/tmp
```

A server seen for the first time shows its key fingerprint and asks whether to trust it. A changed key stops the connection, as in the app. Passwords that aren't saved are asked in the terminal.

`exec` sends the command's output to stdout and its errors to stderr, so it fits into scripts:

```bash
for h in web db cache; do detour exec "$h" -- uptime; done
pg_dump app | detour exec backup -- "cat > /srv/backups/app.sql"   # what is piped in is the command's input (up to 32 MB)
```

## Tunnels, keys, snippets

```bash
detour tunnels ls
detour tunnels up postgres
detour tunnels down postgres

detour keys ls
detour keys gen laptop                  # ed25519 by default; prints the public key
detour keys gen ci --type rsa --passphrase
detour keys import ~/.ssh/id_ed25519
detour keys export laptop -o ~/.ssh/laptop

detour snippets add disk -- df -h
detour snippets run disk web
```

## Proxies

```bash
detour proxies ls
detour proxies add nl --link 'vless://…'             # a vless:// link
detour proxies add office --wireguard office.conf    # a WireGuard config; - reads it from stdin
detour proxies add corp --http proxy.corp:3128 --user me   # the password is asked
detour proxies check nl                              # how long a connection through it takes
detour proxies export nl                             # back as a link or config, keys included
detour proxies rm nl                                 # its hosts connect directly
detour hosts edit db --proxy office                  # --proxy none: directly
```

[Jump hosts and proxies](/projects/detour/wiki/everyday/proxies) lists the kinds of proxy and what of VLESS is supported.

## Sync between your devices

A server gets the vault you use everywhere else the same way a new laptop does: with a one-time code from one of your devices.

```bash
# on a device that has the vault (or in the app: Settings → Sync → New device)
detour sync add-device

# on the new one
detour keys import ~/.ssh/id_ed25519                 # the key that opens the repository
detour sync join git@github.com:me/vault.git --key id_ed25519 --code XXXX-XXXX-XXXX-XXXX
```

The place is a folder (Syncthing, a network share) or a Git repository: `git@host:path` or `ssh://` with a key of the vault (`--key`) or ssh-agent (the default), `https://` with a token (`--token`, asked) or **Sign in with GitHub** (`--github`). Without `--code` it is asked; the recovery key works too. A server seen for the first time shows its key fingerprint and asks whether to trust it.

```bash
detour sync                       # the state
detour sync --now                 # sync now; a changed server key is asked about
detour sync enable ~/Sync/detour  # start syncing this vault (a new, empty folder or repository)
detour sync recovery-key
detour sync token                 # a new token for the repository, or --github
detour sync disable               # stop on this device; the synced copy stays
```

### Signing in with GitHub

```bash
detour github login               # shows a code to enter at github.com/login/device, from any device
detour github                     # who is signed in
detour github logout
```

`--github` signs in by itself when needed, and waits while you install Detour Sync on the repository if it isn't yet.

## Teams

```bash
detour id                         # your Detour ID, to send to a team admin
detour teams join git@github.com:acme/detour.git --key id_ed25519   # shows the creator's fingerprint to compare
detour teams ls
detour -T acme teams members
detour -T acme teams add detour1q… Alice --role member --access view
detour -T acme teams access web Alice secret
detour -T acme ls                 # the team's hosts
```

`teams create <place> --name Acme --me Alice` makes a team in an empty folder or repository and shows its recovery key once; `teams recover <place> --me Alice` takes a team back with that key. `-T acme teams token` sets a new token for the team's repository.

`-T` (`--team`) works with every command: `detour -T acme exec web -- uptime`.

## Scripts

`--json` prints JSON instead of tables, for `jq` and scripts. Messages go to stderr, results to stdout, and the exit code is non-zero on failure (with `exec`, it is the command's).

`--data-dir` (or `DETOUR_DATA_DIR`) uses another vault folder, for example a test vault beside your real one.

Messages and help are in English or Russian, as your system is; `DETOUR_LANG=en` or `ru` picks one.

## Everything

`detour --help` lists every command; `detour <command> --help` shows its options.

| Command | |
|---|---|
| `status`, `unlock`, `lock`, `quit` | the core and the vault |
| `ls`, `hosts ls / add / edit / rm / import / export` | hosts |
| `ssh`, `exec`, `cp`, `files ls / mkdir / rm / mv / chmod` | working on a host |
| `tunnels ls / up / down` | tunnels |
| `proxies ls / add / rm / check / export` | [proxies](#proxies) |
| `keys ls / gen / import / export / rm` | keys |
| `snippets ls / add / rm / run` | snippets |
| `sync`, `sync enable / join / add-device / recovery-key / token / disable` | [sync between your devices](#sync-between-your-devices) |
| `github`, `github login / logout` | signing in with GitHub |
| `id`, `teams ls / create / join / recover / sync / members / add / remove / role / access / token / leave` | [teams](#teams) |
| `approve`, `agents ls / revoke`, `mcp …` | [AI agents](/projects/detour/wiki/command-line/agents) |
