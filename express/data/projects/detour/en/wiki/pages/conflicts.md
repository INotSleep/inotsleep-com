# Conflicts and storage problems

## Conflicts

Several people, or several of your devices, can edit while offline. When they sync:

- Changes to **different fields** of the same record merge by themselves.
- If the **same field** was changed in two places, the later change applies for now and Detour shows a **Conflict**: in the sidebar, on the host and on the team page.
- If someone **deleted** a record that someone else changed, that's a conflict too.

Click **Resolve**. For each field Detour shows the versions with who made them and when; pick the one to keep and click **Apply**. Your choice syncs to everyone like any other change.

## Storage problems

Every Detour checks the storage on each sync. If something is off, the team page shows **N storage problems** with details:

| Problem | Meaning |
|---|---|
| Rejected change | A change by someone who wasn't allowed to make it, or made after losing access. It's ignored. |
| Change missing from storage | A change others have seen is gone. The storage, or someone with access to it, removed it. |
| Two versions of one change | The same change exists in two different forms, for example a sync tool conflict copy with altered content. |
| Storage rolled back changes | The storage shows an older state than this device has already seen. |
| Unexpected file | A file that isn't part of the vault format. |

A problem doesn't mean data is lost: the affected change is just not trusted. Check who has access to the storage, and restore the folder or repository from a backup if needed.

## State fingerprint

**⋯ → State fingerprint** on the team page shows a short code built from everything this device has read. Members who have synced can compare their codes over another channel: if the codes match, the storage showed everyone the same history.
