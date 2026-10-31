# Troubleshooting

## Connecting

| Message | What to do |
|---|---|
| `host:port` is not responding | Check the address and port, that the server is up, and that a firewall lets you through. |
| Wrong password | Re-enter it. If it's saved, **Forget** it in the host form and connect again. |
| The server didn't accept the key | The public key isn't in `~/.ssh/authorized_keys` for that user, or the user is wrong. Copy the public key from [Keys](/projects/detour/wiki/everyday/keys) and add it on the server. |
| Wrong key passphrase | Re-enter it. If a wrong one was saved, use **Change passphrase** on the key or import the key again. |
| ssh-agent is not running | Start your agent (on Windows: the **OpenSSH Authentication Agent** service) or switch the host to a key from your vault. |
| The host key has changed | Detour stopped before logging in. If the server was reinstalled or its keys rotated, choose **Replace key**; otherwise don't connect and find out why. |
| The jump host needs a saved password | Save the jump host's password, or give it a key. See [Jump hosts and proxies](/projects/detour/wiki/everyday/proxies). |
| These hosts connect through each other in a loop | Two hosts use each other as jump hosts. Fix one of them. |
| Connection to the server lost | The network dropped or the server closed the session. Press **Enter** in the terminal to reconnect. |

## Tunnels

| Message | What to do |
|---|---|
| Port N is used by another program | Pick another local port, or close the program using it. |
| The server doesn't allow opening port N | The server forbids remote forwarding, or the port is taken there. Check `AllowTcpForwarding` and `GatewayPorts` in `sshd_config`. |

## Keys

| Message | What to do |
|---|---|
| This is a public key, a private one is needed | Import the private key file (without `.pub`). |
| PuTTY format: export the key to OpenSSH | In PuTTYgen: **Conversions → Export OpenSSH key**, then import that file. |
| This doesn't look like a private key | The file is damaged or in an unsupported format. |

## Sync and teams

| Message | What to do |
|---|---|
| Storage unavailable / Folder unavailable | The folder was moved, or a network drive isn't mounted. Point Detour at it again. |
| Can't reach the repository | Check the network and the repository URL. |
| The repository rejected the token | The token expired or lacks write access. Use **New token**. |
| Sign in with GitHub again | GitHub no longer accepts this device's sign-in. Use **Check GitHub access** and sign in. |
| Detour Sync isn't installed on this repository | Install the Detour Sync app on that repository (**Install on GitHub**), or check that your account can reach it. |
| The code expired, start again | The GitHub sign-in code lasts 15 minutes. Click **Sign in with GitHub** again. |
| Access was not granted on GitHub | Access was refused on GitHub. Sign in again and allow it. |
| A token is only sent over https | Use an `https://` URL for token logins. |
| The repository server key has changed | Compare the new fingerprint with your Git host's published ones before **Replace key**. |
| There's no team vault in this folder | You chose the wrong folder, or it hasn't synced to this device yet. |
| The folder isn't empty / The repository isn't empty | A new team or sync needs an empty folder or repository. |
| Invalid code / The code has expired | Device codes last one hour. Create a new one on your other device. |
| This device is in teams: leave them first | A device with its own team identity can't join another person's synced vault. |
| Waiting to be added | Send your Detour ID to a team admin. |

## Command line and AI agents

| Message | What to do |
|---|---|
| Allow this terminal in the Detour window | The window asks whether this terminal may use Detour; click **Allow** there. |
| Detour asks for the master password here, but this is not a terminal | `detour` was run from a script or a pipe in a terminal that isn't trusted yet. Run any `detour` command in that terminal by hand first. |
| The Detour core running now is an older version | After an update an old core can still be running with sessions in it. Run `detour quit` (or **Quit Detour** in the tray) and start again. |
| Several hosts are called that | Use the host's full name, `team/name`, or its id. |
| (agent) Detour has not confirmed this server's key | Connect to the host once yourself in Detour and confirm its key; an agent can't. |
| (agent) The host's login needs a password or passphrase Detour has not saved | Save the password for the host in Detour. Agents never type one. |
| (agent) Nobody approved the command in time | Watch the Detour window, or run `detour approve`, while the agent works with **Open terminals**; or give it **Run commands without asking**. |

## Updates

| Message | What to do |
|---|---|
| Can't reach the update server | Check the network; GitHub may be blocked where you are. |
| The update failed the signature check | Don't install it. Download the release from GitHub yourself and report it. |

## Still stuck

Open an issue at [github.com/INotSleep/Detour/issues](https://github.com/INotSleep/Detour/issues) with the message you see, your system and Detour version (**Settings → About**).
