# Installation

Download the installer for your system from the [latest release](https://github.com/INotSleep/Detour/releases/latest).

| System | File |
|---|---|
| Windows 10 and 11 (x64) | `Detour_<version>_x64-setup.exe`, or the `.msi` for managed installs |
| macOS (Apple Silicon and Intel) | `Detour_<version>_universal.dmg` |
| Debian, Ubuntu and derivatives | `Detour_<version>_amd64.deb` |
| Fedora, openSUSE and other RPM systems | `Detour-<version>-1.x86_64.rpm` |
| Any other Linux | `Detour_<version>_amd64.AppImage` |

## First start on Windows

The Windows installers and the app are signed by "Open Source Developer Vladyslav Muntian" with a Certum code signing certificate. Until the certificate builds up a reputation with Microsoft, SmartScreen may still show "Windows protected your PC": check that the publisher is the one above, click **More info**, then **Run anyway**.

## First start on macOS

The app isn't notarized yet. If macOS refuses to open it, run this once in Terminal after moving Detour to Applications:

```bash
xattr -cr /Applications/Detour.app
```

## AppImage

Make the file executable and run it:

```bash
chmod +x Detour_*_amd64.AppImage
./Detour_*_amd64.AppImage
```

## Updates

Detour checks GitHub releases a few seconds after you unlock it and shows **Version X is available** with an **Update** button. Updates are signed, and the app installs only files signed with the project's key. You can check by hand or turn the check off in [Settings](/projects/detour/wiki/reference/settings).

## Next

[Create your vault](/projects/detour/wiki/getting-started/first-launch).
