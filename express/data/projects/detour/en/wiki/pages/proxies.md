# Jump hosts and proxies

When a server can't be reached directly, set **Connection** in the host's form:

| Option | Same as | Fields |
|---|---|---|
| **Direct** | plain `ssh` | none |
| **Via host** | `ssh -J` | **Jump host**: another host from your list |
| **SOCKS5** | `ProxyCommand nc -X 5` | **Proxy address**, optional **Proxy user** and **Proxy password** |
| **HTTP** | an HTTP `CONNECT` proxy | **Proxy address**, optional **Proxy user** and **Proxy password** |

## Chains of jump hosts

A jump host can have its own **Via host**, so `bastion → internal-gw → db` is three hosts, each pointing at the one before. Detour connects through them in order. Imported `ProxyJump a,b` lines become chains like this ([Importing from ~/.ssh](/projects/detour/wiki/getting-started/import-ssh)).

- Every hop is a normal host with its own login and its own trusted server key. The first time, Detour asks you to trust each new key on the way.
- A jump host that logs in with a password needs that password saved in the vault: Detour can't stop halfway to ask for it.
- Hosts that point at each other in a loop are refused.

## Proxy errors

| Message | Meaning |
|---|---|
| The proxy is not responding | Wrong proxy address or port, or it's down |
| The proxy didn't accept the login | Wrong proxy user or password |
| The proxy couldn't reach the host | The proxy works, but can't connect to the server's address and port |
| The proxy gave an unexpected answer | The address is not a SOCKS5 or HTTP proxy of the chosen kind |
