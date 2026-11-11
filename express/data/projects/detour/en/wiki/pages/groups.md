# Groups of hosts

The host list is split into groups. A host's group is set in its form (**Group**) or by dragging it.

## Arranging

- Drag a host to another place in its group or into another group. Drag a group's header to move the whole group.
- **⋯ → New group** adds an empty group at the end, to drag hosts into.
- A group's menu (**⋯** on its header) has **Rename** and **Delete**. Deleting a group leaves its hosts without a group; **Undo** brings it back.

The order of groups and of hosts in them is part of the vault: it's synced between your devices and, in a team, shared with it.

## Shared and Mine

In a team, a switch above the list picks how its hosts are grouped:

| View | What it is |
|---|---|
| **Shared** | the team's groups, the same for everyone. Whoever has **Edit** on a group (owners and admins) renames it, moves it and sets its proxy; moving a host needs **Edit** on the host |
| **Mine** | your own groups of the team's hosts. Only you see them; they're synced between your devices |

The first time you open **Mine**, it's a copy of the shared groups, and from then on it's yours to change: anyone in the team can arrange their own view, whatever their access. Hosts you haven't put in a group of yours are listed after your groups, under their shared groups; dragging one of them, or its group, makes it yours. Deleting a group of yours puts its hosts back there.

Each device remembers which view it showed last.

## A group's settings

**Settings** in a group's menu gives its hosts a proxy and a login:

| Setting | What it does |
|---|---|
| **Proxy** | your proxy for the group's hosts: one of your own or one of the team's |
| **User** | your user name on its hosts |
| **Login** | **My key**, **Password** or **ssh-agent** |
| **Proxy for the whole team** | shared groups, for those who can change them: the proxy everyone's connections to its hosts go through when a host has no way of its own |

Everything but the last is yours alone: it stays in your personal vault, is synced between your devices, and the team doesn't see it. A password is kept encrypted like any other.

In your personal vault every group is yours, so its settings work the same way.

### Which one is used

The proxy and the login are each looked up on their own, top to bottom, and the first level that has one is used:

1. Your settings of the group of **Mine** the host is in; if it's in none of yours or that group has none, your settings of its shared group.
2. The host itself: your [personal login](/projects/detour/wiki/sync-and-teams/teams) or the shared one, its proxy or jump host.
3. The shared group's **Proxy for the whole team**.

With no proxy at any level, the host is reached directly.

So a group of yours with your own VPN takes all its hosts through it, whatever the team set; and a team can send every host of a group through its office proxy without editing each host.

The host's panel shows what comes from a group: next to **Via** or **User** it names the group.

## Command line

```bash
detour groups ls                          # groups in order, with the proxy and login they give
detour groups add Databases
detour groups rename Databases DB
detour groups move DB --before Web        # or --last
detour groups rm DB                       # its hosts stay, without a group
detour hosts move db1 --group DB --before db2   # --group none: no group
```

With `-T acme`, these work on the team's shared groups; add `--mine` for your own:

```bash
detour -T acme groups ls --mine
detour -T acme hosts move db1 --group Mine --mine     # a group of that name is made if there is none
```

A group's settings:

```bash
detour -T acme groups set Production --proxy my-vpn --user vlad --key laptop
detour -T acme groups set Fav --mine --agent
detour -T acme groups set Production --team-proxy office   # for everyone
detour -T acme groups set Production --proxy none --no-login
```

`--password` asks for the password right away; leave it empty to be asked on every connection.

## Older versions

Earlier versions list hosts by group name in their own order and don't use groups' settings. They keep what newer devices save, so nothing is lost when they edit a host.
