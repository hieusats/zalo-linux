# Troubleshooting

## App won't launch

**Symptom:** Nothing happens when running `zalo`.

**Fix:** Check missing shared libraries:
```bash
ldd /opt/zalo/zalo | grep "not found"
```

Install any missing libraries from the output.

## Blank window / white screen

**Symptom:** App launches but shows a blank white window.

**Fix:** Try disabling GPU acceleration:
```bash
zalo --disable-gpu --disable-software-rasterizer
```

If this works, add `--disable-gpu` to the .desktop Exec line:
```
Exec=/opt/zalo/zalo --no-sandbox --disable-gpu %U
```

## safeStorage errors in logs

**Symptom:** Logs show "safeStorage is not available" or encryption errors.

**Fix:** Install a keyring backend:
```bash
sudo apt-get install gnome-keyring
```

Then restart your session (log out and back in).

## Close-to-tray doesn't work

**Symptom:** Closing the window quits the app instead of minimizing to tray.

**Fix:** Ensure libappindicator is installed for system tray support:
```bash
sudo apt-get install libappindicator3-1
```

## Notifications not showing

**Symptom:** No desktop notifications for new messages.

**Fix:** Ensure libnotify is installed:
```bash
sudo apt-get install libnotify4
```

Check notification settings in System Settings > Notifications.

## Font rendering issues

**Symptom:** Text looks blurry or incorrect.

**Fix:** Install fontconfig:
```bash
sudo apt-get install fontconfig
fc-cache -f -v
```

## Electron 22 compatibility

**Symptom:** App crashes on newer distributions (Fedora 40+, Ubuntu 25.04+).

**Cause:** Electron 22 bundles Chromium 108, which may not be compatible with newer glibc versions.

**Fix:** Use a compatible distribution (Ubuntu 22.04/24.04, Debian 12, Fedora 39).

## Known Limitations

- VoIP/video calls do not work (`zcall` has no Linux binary)
- JPEG XL images cannot be viewed
- Video thumbnails are not generated
- Auto-update is disabled (use `sudo apt upgrade` instead)
- Screen capture requires PipeWire permissions on Wayland
