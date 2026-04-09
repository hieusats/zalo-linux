# Building Zalo Linux from Source

## Prerequisites

- Ubuntu 22.04+ (or Debian 12+, Fedora 39+)
- Node.js 18+
- Python 3 + node-gyp
- Build tools and libraries:

```bash
sudo apt-get install -y build-essential libsecret-1-dev libsqlite3-dev \
  libgtk-3-0 libnotify4 libnss3 libxss1 libgbm1 libasound2 \
  libatspi2.0-0 libx11-xcb1 libxcb-dri3-0 libdrm2 libgbm-dev \
  libxkbcommon0 libcups2 libdbus-1-3 libexpat1 libxcomposite1 \
  libxdamage1 libxrandr2 libxfixes3 libxext6 libxi6 libxtst6 \
  ca-certificates dpkg-dev fakeroot
```

## Steps

1. **Extract the macOS DMG**

```bash
bash scripts/extract-dmg.sh
```

2. **Extract app.asar**

```bash
bash scripts/extract-asar.sh
```

3. **Download Electron 22.3.9 Linux binary**

```bash
bash scripts/download-electron.sh
```

4. **Patch app.asar for Linux**

```bash
node scripts/patch-asar.js build/app-extracted patches/linux.json
```

5. **Build native modules**

```bash
bash scripts/build-native-linux.sh build/app-extracted/native amd64
```

Or individually:

```bash
bash scripts/build-sqlite3-linux.sh build/app-extracted/native/nativelibs/sqlite3
bash scripts/build-dbcrossv4-linux.sh build/app-extracted/native/nativelibs/db-cross-v4
```

6. **Package as .deb**

```bash
bash scripts/build-deb.sh
```

Output: `build/zalo_26.3.20-1_amd64.deb`

## Cross-compile for arm64

```bash
bash scripts/build-deb.sh --arch arm64
```

## Quick Build (all steps)

```bash
make extract-all
bash scripts/download-electron.sh
bash scripts/build-deb.sh
```
