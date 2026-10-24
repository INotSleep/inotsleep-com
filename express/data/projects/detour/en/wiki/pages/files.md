# Files (SFTP)

Open a host's files with **Files** in its side panel or **⋯** menu. The file browser opens as a tab, in your home folder on the server.

![File browser](/api/projects/detour/assets/files.png)

## Moving around

- Double-click a folder or press **Enter** to open it; **Backspace** goes up.
- Click the path to type one (**Ctrl+L**).
- **F5** refreshes. Sort by clicking a column header.
- **Terminal in this folder** (toolbar) opens a terminal already `cd`'d into the folder.

## Uploading

- **Upload** sends files, **Upload folder** a whole folder with everything inside.
- You can also drag files and folders from your system onto the window.
- If a file or folder with that name exists, Detour asks before replacing it.

## Downloading

Select one or more items and click **Download** (or use the row's download button). One file asks where to save it; several items go into a folder you choose.

## Selecting and editing

- **Ctrl+click** adds to the selection, **Shift+click** selects a range, **Ctrl+A** selects everything, **Esc** clears it.
- **F2** renames, **Del** deletes (with a confirmation: deleting on a server can't be undone). Folders are deleted with their contents.
- **⋯ → Permissions** sets read, write and execute for owner, group and others, or an octal mode such as `755`.
- **⋯ → Copy path** copies the full path.

## Transfers

Transfers show progress and speed, and can be cancelled. A transfer that fails or is cancelled never leaves a half-written file: uploads are written to a temporary file and only then renamed over the original, and partial downloads are removed.
