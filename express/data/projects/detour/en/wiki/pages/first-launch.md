# First launch

On first start Detour asks for a **master password** and creates your personal vault: an encrypted file on this computer that holds your hosts, keys, passwords, snippets and tunnels.

- The password must be at least 8 characters.
- **A forgotten master password can't be recovered.** Nobody, including the Detour authors, can open the vault without it. If you turn on [sync between devices](/projects/detour/wiki/sync-and-teams/device-sync), you also get a recovery key for the synced vault.

## Locking

Detour locks itself after 15 minutes without activity. You can change the time, lock right away, or change the master password in [Settings](/projects/detour/wiki/reference/settings). **Ctrl+K** and the word "Lock" also lock it.

Locking closes open tunnels and file browsers. Terminal sessions keep running behind the lock screen; enter the master password to get back to them.

## The window

- **Sidebar:** the vault switcher (your personal vault and every team you're in), quick connect (**Ctrl+K**), and the sections: Hosts, Keys, Snippets, Tunnels, Team (or Teams in the personal vault) and Settings.
- **Tabs:** terminals and file browsers open as tabs next to the current section.

## Language and theme

The interface is in English and Russian. By default Detour follows the system language: Russian if Russian is among your system languages, English otherwise. Switch it in **Settings → Appearance → Language**; the change applies at once.

## Next

[Connect to your first host](/projects/detour/wiki/getting-started/connecting).
