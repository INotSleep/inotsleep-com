# Terminal

Every connection opens as a tab. Click a tab to switch, middle-click or **×** to close it, and **+** (or **Ctrl+K**) to open another connection.

## Split panes

Right-click in the terminal and choose **Split right** or **Split down**, or press **Ctrl+Shift+D** / **Ctrl+Shift+E**. Each pane is its own session to the same host. A tab holds up to 6 panes; drag the dividers to resize them.

## Search

**Ctrl+Shift+F** (or **Find** in the right-click menu) searches the scrollback. **Enter** goes to the next match, **Shift+Enter** to the previous one, **Esc** closes the search.

## Copy and paste

Choose how it works in **Settings → Terminal → Copy and paste**:

| | Right click, Ctrl+C and Ctrl+V | Ctrl+Shift+C and Ctrl+Shift+V |
|---|---|---|
| Works like | the terminal on your system | Termius |
| Copy | select text, then **Ctrl+C** or right click | **Ctrl+Shift+C** |
| Paste | **Ctrl+V** or right click | **Ctrl+Shift+V** |
| **Ctrl+C** with nothing selected | interrupts the running program | always goes to the server |
| Right click | copies the selection, or pastes | opens a menu |

**Ctrl+Shift+C** and **Ctrl+Shift+V** work in both modes.

## When the connection drops

The terminal says **Connection closed. Enter: reconnect**. Press **Enter** in that pane to connect again. If a connection fails, the reason is shown in the terminal with **Enter: retry**.

## Running a command on connect

[Snippets](/projects/detour/wiki/everyday/snippets) open a new terminal on the host you pick and run their command there.

## Settings

Font size and scrollback length are in **Settings → Terminal**.
