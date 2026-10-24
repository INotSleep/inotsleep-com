# Keys

**Keys** lists the SSH keys in the current vault, with their type, fingerprint and how many hosts use them.

![Keys](/api/projects/detour/assets/keys.png)

## Create a key

Click **Create key**, give it a name, choose **Ed25519** (recommended) or **RSA 4096**, and optionally set a passphrase. Then copy the public key and add it to `~/.ssh/authorized_keys` on your servers, or to your Git hosting.

## Import a key

Click **Import**, then paste the private key, **Choose file**, or drop the file onto the dialog. Detour recognizes the format and fills in a name.

- If the key has a passphrase, enter it. With **Save passphrase to vault** checked, Detour won't ask for it again; otherwise it asks when the key is used.
- PuTTY `.ppk` files aren't supported. Export the key to OpenSSH format in PuTTYgen (**Conversions → Export OpenSSH key**) and import that.
- A public key (`ssh-ed25519 AAAA…`) isn't enough: Detour needs the private one.

## Key actions

The **⋯** menu on a key has:

- **Copy public key** and **Save public key**
- **Export private key**: saves an OpenSSH file, protected with the passphrase you choose
- **Set passphrase** or **Change passphrase**; leave the new one empty to remove it
- **Delete**: if hosts use the key, Detour says how many will stop connecting

## Where keys are kept

Private keys never leave the vault unencrypted: they are stored inside your [encrypted vault](/projects/detour/wiki/reference/data), not as files in `~/.ssh`. In a [team](/projects/detour/wiki/sync-and-teams/teams), a key's private part is only given to members with **Secret** access or higher.
