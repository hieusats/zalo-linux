# Installing Zalo on Linux

## From .deb (Debian/Ubuntu)

```bash
sudo dpkg -i zalo_26.3.20-1_amd64.deb
sudo apt-get install -f
```

## Launch

```bash
zalo
```

Or launch from your desktop environment's application menu.

## Keyring Setup (Required for encrypted storage)

Zalo uses libsecret for storing sensitive data (session tokens, encryption keys).

**GNOME:**
```bash
sudo apt-get install gnome-keyring
```

**KDE:**
```bash
sudo apt-get install kwalletmanager
```

If no keyring is available, Zalo will fall back to file-based storage (less secure).

## Auto-Launch at Startup

Zalo creates an XDG autostart entry at `~/.config/autostart/zalo.desktop`.

To disable:
```bash
rm ~/.config/autostart/zalo.desktop
```

To re-enable:
```bash
cp /usr/share/applications/zalo.desktop ~/.config/autostart/
```

## Deep Links (zalo://)

After installation, `zalo://` URLs open conversations directly in Zalo.

To verify:
```bash
xdg-mime query default x-scheme-handler/zalo
```

Should return `zalo.desktop`.

## Uninstall

```bash
sudo dpkg -r zalo
```

User data at `~/.config/Zalo/` is preserved. To remove completely:
```bash
rm -rf ~/.config/Zalo/
```
