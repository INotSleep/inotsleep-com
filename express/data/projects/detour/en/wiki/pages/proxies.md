# Jump hosts and proxies

When a server can't be reached directly, set **Connection** in the host's form:

| Option | What it does |
|---|---|
| **Direct** | plain `ssh` |
| **Via host** | through another host from your list, like `ssh -J` |
| **Via proxy** | through a proxy from the **Proxies** section |

## Proxies

Proxies are set up once, in **Proxies** in the sidebar, and any number of hosts go through them. Each proxy belongs to a vault, like hosts: your own proxies are synced between your devices, and a team's proxies are shared with the team.

| Kind | What it is |
|---|---|
| **SOCKS5** | a SOCKS5 proxy, with or without a login |
| **HTTP** | an HTTP proxy that tunnels with `CONNECT` |
| **WireGuard** | a WireGuard server. Only Detour's own connections go through it: no system VPN, no driver, no administrator rights |
| **VLESS** | a VLESS server (Xray and compatible): over TCP or **XHTTP**, with no security, **TLS** or **REALITY**, and **XTLS Vision** over TCP |

To add one:

- **Paste** takes a `vless://` link or a WireGuard config from the clipboard and opens it as a new proxy to look over and save.
- **From file** does the same with a `.conf` file; dropping the file onto the page works too.
- **Add proxy** opens an empty form.

**Check** tries a proxy and shows how long it took or what went wrong. For WireGuard that is the handshake with the server; for the others, a connection through the proxy to `1.1.1.1:443`.

In a proxy's menu, **Copy link** (VLESS) or **Copy config** (WireGuard) puts it on the clipboard as a link or a config to use elsewhere, keys included.

Deleting a proxy makes the hosts that went through it connect directly; **Undo** brings both back.

### WireGuard

The tunnel starts with the first connection through it and closes a couple of minutes after the last. Host names are resolved by the config's `DNS` servers inside the tunnel, or by your computer if there are none. `AllowedIPs` is kept for copying the config back, but doesn't limit anything: a host behind a WireGuard proxy always goes through it.

A config with several `[Peer]` sections isn't supported.

### VLESS

What a `vless://` link holds is used as it is: the server, the user id, `security`, `sni`, `pbk` and `sid` for REALITY, `flow`, `type`, and for XHTTP `path`, `host`, `mode` and `extra` (the padding, placement and upload settings). Parameters Detour doesn't need (such as `fp` or `spx`) are kept, so a copied link is the same as the pasted one.

| Setting | Supported |
|---|---|
| `security` | `none`, `tls` (with the system's trusted certificates, or one pinned by `pcs`), `reality` |
| `type` | `tcp` (`raw`), `xhttp` |
| XHTTP `mode` | `auto`, `stream-one`, `stream-up`, `packet-up`. Over plain HTTP or TLS with `alpn=http/1.1`, only `packet-up` |
| `flow` | `xtls-rprx-vision`, over TCP with TLS or REALITY |

Not supported: `encryption` other than `none`, WebSocket, gRPC and other transports, XHTTP over HTTP/3, and `downloadSettings`. A link that uses one of them is refused with what it uses.

## Teams

A team host can go through a proxy of the same team. A proxy's key (a WireGuard private key, a VLESS user id, a proxy password) is its secret part: to connect through it, a member needs **Secret** access to the proxy, not only to the host. Members with **View** see the proxy without its key. See [Access and roles](/projects/detour/wiki/sync-and-teams/access).

## Chains of jump hosts

A jump host can have its own **Via host**, so `bastion → internal-gw → db` is three hosts, each pointing at the one before. Detour connects through them in order. Imported `ProxyJump a,b` lines become chains like this ([Importing from ~/.ssh](/projects/detour/wiki/getting-started/import-ssh)). A jump host can itself go through a proxy.

- Every hop is a normal host with its own login and its own trusted server key. The first time, Detour asks you to trust each new key on the way.
- A jump host that logs in with a password needs that password saved in the vault: Detour can't stop halfway to ask for it.
- Hosts that point at each other in a loop are refused.

## Exporting to ~/.ssh/config

Hosts behind a SOCKS5 or HTTP proxy are exported with a `ProxyCommand`. OpenSSH can't go through WireGuard or VLESS, so those hosts get a comment naming the proxy instead.

## Older versions

SOCKS5 and HTTP proxies that earlier versions kept in each host become saved proxies by themselves. Those hosts keep the old setting too, so a device still on an older version keeps reaching them. Hosts behind the new kinds of proxy connect directly on older versions: update every device.

## Proxy errors

| Message | Meaning |
|---|---|
| The proxy is not responding | Wrong proxy address or port, or it's down |
| The proxy didn't accept the login | Wrong user, password, user id or REALITY key |
| The proxy couldn't reach the host | The proxy works, but can't connect to the server's address and port, or its path is wrong |
| The proxy gave an unexpected answer | The address is not a proxy of the chosen kind, or its settings don't match the server's |
| The WireGuard server is not answering | No handshake: wrong endpoint, keys, or the server isn't running |
| The proxy's certificate didn't match | TLS: the certificate isn't trusted and isn't the pinned one |
| You have no access to this proxy | A team proxy without **Secret** access for you |
| The host's proxy was deleted | Choose another one in the host's **Connection** |
| The proxy uses …, which Detour doesn't support | See the table above |
