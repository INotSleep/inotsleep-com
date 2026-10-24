# Access and roles

## Roles

A member's role decides who manages the team.

| Role | Add and remove members | Change admins and owners | Grant and revoke access |
|---|---|---|---|
| **Owner** | yes | yes | yes, up to their own access |
| **Admin** | yes | no | yes, up to their own access |
| **Member** | no | no | no |

The team's **recovery key** is also an owner, so the team can get a new owner if every owner loses their devices.

## Access levels

Access is set per record (each host, key, snippet and tunnel) and per member:

| Level | The member gets | They can |
|---|---|---|
| **None** | nothing | not even learn the record exists |
| **View** | name, address, port, login | see the host and connect with a [personal login](/projects/detour/wiki/sync-and-teams/teams) of their own |
| **Secret** | plus the shared password or private key | connect with the shared login, view and copy the password, export the key |
| **Edit** | the same as Secret | change and delete the record |

Snippets and tunnels have no secret part, so they're **View** or **Edit**.

**Edit** always includes the secret: whoever can change a host's address could point it at their own server and catch the shared password from the next person who connects, so Detour doesn't pretend to separate the two.

## The access table

The **Access** tab on the team page is a table of records and members. Each cell is a member's level on a record; **All** at the top of a column sets one level for a whole section.

![Access table](/api/projects/detour/assets/access.png)

Giving someone **Secret** on a host also gives them **Secret** on the team key the host uses; Detour says when that key opens other hosts too.

## Why this holds even against a modified app

Access isn't a setting the app promises to respect. A member literally receives only the encryption keys for what they may see, so a patched copy of Detour has nothing more to decrypt. The flip side: you can grant only what you have yourself, and anyone who can read something can copy it. See the [Security model](/projects/detour/wiki/reference/security).

Detour never changes accounts on your servers: it doesn't create users or edit `authorized_keys`. Personal logins are whatever the member already has on that server.
