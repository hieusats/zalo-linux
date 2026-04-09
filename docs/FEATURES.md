# Feature Status on Linux

## Working (MVP)

| Feature | Status | Notes |
|---------|--------|-------|
| Login (QR code) | Working | |
| Login (phone number) | Working | |
| Text messaging | Working | Send and receive |
| Image messaging | Working | Send and receive |
| File messaging | Working | Send and receive |
| Conversation list | Working | |
| Contact list | Working | |
| Group chats | Working | |
| Search | Working | |
| Notification badge | Working | Uses `app.setBadgeCount()` |
| Close to tray | Working | System tray via libappindicator |
| Auto-launch | Working | XDG autostart |
| Deep links (zalo://) | Working | Protocol handler registered |
| Session persistence | Working | SQLite database |
| Encrypted storage | Working | libsecret / GNOME Keyring |
| Theme switching | Working | Light/dark mode |
| Proxy configuration | Working | System proxy |

## Partial / Stub

| Feature | Status | Notes |
|---------|--------|-------|
| File utilities | Stub | Returns `not support` on Linux |
| Image thumbnails | Stub | zimage has no Linux binary |
| JPEG XL | Stub | zjxl returns `not support` |
| File scanner | Stub | zwalker has no Linux binary |

## Not Working

| Feature | Status | Notes |
|---------|--------|-------|
| VoIP calls | Not working | zcall has no Linux binary |
| Video calls | Not working | zcall has no Linux binary |
| Video thumbnails | Not working | mp4thumb has no Linux binary |
| Auto-update | Not working | Disabled; use `apt upgrade` |
| Screen sharing | Not working | Requires PipeWire support |

## Native Module Status

| Module | Linux Build | Status |
|--------|-------------|--------|
| sqlite3 | Built from source | Working |
| db-cross-v4 | Built from source | Working |
| logger | Pure JS | Working |
| file-utils | Stub | Returns error |
| file-utilities | Stub | Returns error |
| zcall | Stub | VoIP not supported |
| mp4thumb | Stub | No Linux binary |
| zjxl | Stub | No Linux binary |
| zimage | Stub | No Linux binary |
| zwalker | Stub | No Linux binary |
| zfile | Stub | No Linux binary |
| v8-profiles | Stub | No-op on Linux |
