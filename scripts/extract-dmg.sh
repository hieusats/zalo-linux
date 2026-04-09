#!/usr/bin/env bash
set -euo pipefail

BUILD_DIR="$(cd "$(dirname "$0")/../build" && pwd)"
DMG_SOURCE="${1:-/home/hieusats/dev/zalo/ZaloSetup-universal-26.3.20.dmg}"

if ! command -v 7z &>/dev/null; then
  echo "ERROR: 7z (p7zip-full) required. Install: sudo apt install p7zip-full"; exit 1
fi
[ ! -f "$DMG_SOURCE" ] && { echo "ERROR: DMG not found: $DMG_SOURCE"; exit 1; }

echo "Extracting DMG: $DMG_SOURCE"
mkdir -p "$BUILD_DIR/zalo-macOS"
7z x "$DMG_SOURCE" -o"$BUILD_DIR/zalo-macOS" -y >/dev/null 2>&1 || true

APP_DIR=$(find "$BUILD_DIR/zalo-macOS" -name "Zalo.app" -type d | head -1)
[ -z "$APP_DIR" ] && { echo "ERROR: Zalo.app not found in DMG"; exit 1; }

cp "$APP_DIR/Contents/Resources/app.asar" "$BUILD_DIR/app.asar"
echo "Copied app.asar"

if [ -d "$APP_DIR/Contents/Resources/app.asar.unpacked" ]; then
  cp -r "$APP_DIR/Contents/Resources/app.asar.unpacked/native" "$BUILD_DIR/native"
  echo "Copied native modules"
fi

rm -rf "$BUILD_DIR/zalo-macOS"
echo "Done."
