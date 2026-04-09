#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BUILD_DIR="$PROJECT_ROOT/build"
ZALO_VERSION="26.3.20"
DEB_VERSION="${ZALO_VERSION}-1"
ELECTRON_VERSION="22.3.9"

detect_arch() {
    local machine="$(uname -m)"
    case "$machine" in
        x86_64)  echo "amd64" ;;
        aarch64) echo "arm64" ;;
        *) echo "Error: unsupported arch '$machine'" >&2; exit 1 ;;
    esac
}

ARCH="${1:-$(detect_arch)}"

case "$ARCH" in
    amd64) ELECTRON_ARCH="x64" ;;
    arm64) ELECTRON_ARCH="arm64" ;;
    *) echo "Error: unsupported arch '$ARCH'"; exit 1 ;;
esac

ELECTRON_DIST="electron-v${ELECTRON_VERSION}-linux-${ELECTRON_ARCH}"
STAGE_DIR="$BUILD_DIR/stage"
PKG_DATA="$BUILD_DIR/package-data"

echo "=== Zalo Linux Build ==="
echo "Version:  $ZALO_VERSION | Arch: $ARCH | Electron: $ELECTRON_VERSION"
echo ""

mkdir -p "$BUILD_DIR" "$STAGE_DIR" "$PKG_DATA"

echo "[1/9] Downloading Electron..."
ELECTRON_URL="https://github.com/electron/electron/releases/download/v${ELECTRON_VERSION}/electron-v${ELECTRON_VERSION}-linux-${ELECTRON_ARCH}.zip"
[ ! -f "$BUILD_DIR/${ELECTRON_DIST}.zip" ] && curl -L -o "$BUILD_DIR/${ELECTRON_DIST}.zip" "$ELECTRON_URL"
[ ! -d "$STAGE_DIR/$ELECTRON_DIST" ] && unzip -q "$BUILD_DIR/${ELECTRON_DIST}.zip" -d "$STAGE_DIR/"

echo "[2/9] Checking app source..."
[ ! -f "$BUILD_DIR/app-extracted/bootstrap.js" ] && { echo "Error: extract DMG first"; exit 1; }

echo "[3/9] Applying Linux patches..."
[ -f "$SCRIPT_DIR/patch-asar.js" ] && node "$SCRIPT_DIR/patch-asar.js" "$BUILD_DIR/app-extracted" "$PROJECT_ROOT/patches/linux.json"

echo "[4/9] Building native modules..."
[ -f "$SCRIPT_DIR/build-native-modules.sh" ] && bash "$SCRIPT_DIR/build-native-modules.sh" "$BUILD_DIR/app-extracted/native" "$ARCH"

echo "[5/9] Repacking app.asar..."
[ ! -f "$BUILD_DIR/node_modules/.bin/asar" ] && npm install --prefix "$BUILD_DIR" @electron/asar
"$BUILD_DIR/node_modules/.bin/asar" pack "$BUILD_DIR/app-extracted" "$BUILD_DIR/app.asar"

echo "[6/9] Assembling package..."
bash "$SCRIPT_DIR/assemble-package.sh" "$STAGE_DIR/$ELECTRON_DIST" "$BUILD_DIR/app.asar" "$BUILD_DIR/native" "$PKG_DATA"

echo "[7/9] Copying desktop files..."
mkdir -p "$PKG_DATA/usr/share/applications" "$PKG_DATA/usr/share/icons/hicolor/256x256/apps" \
         "$PKG_DATA/usr/share/icons/hicolor/512x512/apps" "$PKG_DATA/usr/share/metainfo"
cp "$PROJECT_ROOT/packaging/zalo.desktop" "$PKG_DATA/usr/share/applications/"
cp "$PROJECT_ROOT/packaging/icons/icon_256x256.png" "$PKG_DATA/usr/share/icons/hicolor/256x256/apps/zalo.png"
cp "$PROJECT_ROOT/packaging/icons/icon_512x512.png" "$PKG_DATA/usr/share/icons/hicolor/512x512/apps/zalo.png"
cp "$PROJECT_ROOT/packaging/debian/zalo.metainfo.xml" "$PKG_DATA/usr/share/metainfo/"

echo "[8/9] Adding DEBIAN control..."
mkdir -p "$PKG_DATA/DEBIAN"
cp "$PROJECT_ROOT/packaging/debian/control" "$PKG_DATA/DEBIAN/"
cp "$PROJECT_ROOT/packaging/debian/postinst" "$PKG_DATA/DEBIAN/"
cp "$PROJECT_ROOT/packaging/debian/postrm" "$PKG_DATA/DEBIAN/"
chmod 0755 "$PKG_DATA/DEBIAN/postinst" "$PKG_DATA/DEBIAN/postrm"
sed -i "s/^Architecture: .*/Architecture: $ARCH/" "$PKG_DATA/DEBIAN/control"

echo "[9/9] Building .deb..."
DEB_FILE="$BUILD_DIR/zalo_${DEB_VERSION}_${ARCH}.deb"
dpkg-deb --root-owner-group --build "$PKG_DATA" "$DEB_FILE"

echo ""
echo "=== Build Complete ==="
echo "Output: $DEB_FILE ($(du -h "$DEB_FILE" | cut -f1))"
