#!/usr/bin/env bash
set -euo pipefail

[ $# -lt 4 ] && { echo "Usage: $0 <electron-dir> <app-asar> <native-dir> <output-dir>"; exit 1; }

ELECTRON_DIR="$(cd "$1" && pwd)"
APP_ASAR="$(cd "$(dirname "$2")" && pwd)/$(basename "$2")"
NATIVE_DIR="$(cd "$3" && pwd)"
OUTPUT_DIR="$(cd "$4" && pwd)"

echo "Assembling /opt/zalo/..."
mkdir -p "$OUTPUT_DIR/opt/zalo"

cp "$ELECTRON_DIR/electron" "$OUTPUT_DIR/opt/zalo/zalo"
chmod 0755 "$OUTPUT_DIR/opt/zalo/zalo"

for so_file in "$ELECTRON_DIR"/*.so*; do
    [ -f "$so_file" ] && { cp "$so_file" "$OUTPUT_DIR/opt/zalo/"; chmod 0755 "$OUTPUT_DIR/opt/zalo/$(basename "$so_file")"; }
done

for pak_file in "$ELECTRON_DIR"/*.pak; do
    [ -f "$pak_file" ] && { cp "$pak_file" "$OUTPUT_DIR/opt/zalo/"; chmod 0644 "$OUTPUT_DIR/opt/zalo/$(basename "$pak_file")"; }
done

for data_file in "$ELECTRON_DIR"/*.dat "$ELECTRON_DIR"/*.bin; do
    [ -f "$data_file" ] && { cp "$data_file" "$OUTPUT_DIR/opt/zalo/"; chmod 0644 "$OUTPUT_DIR/opt/zalo/$(basename "$data_file")"; }
done

[ -f "$ELECTRON_DIR/chrome-sandbox" ] && { cp "$ELECTRON_DIR/chrome-sandbox" "$OUTPUT_DIR/opt/zalo/"; chmod 4755 "$OUTPUT_DIR/opt/zalo/chrome-sandbox"; }

[ -f "$ELECTRON_DIR/chrome_crashpad_handler" ] && { cp "$ELECTRON_DIR/chrome_crashpad_handler" "$OUTPUT_DIR/opt/zalo/"; chmod 0755 "$OUTPUT_DIR/opt/zalo/chrome_crashpad_handler"; }

for license_file in "$ELECTRON_DIR/LICENSE" "$ELECTRON_DIR/LICENSES.chromium.html"; do
    [ -f "$license_file" ] && { cp "$license_file" "$OUTPUT_DIR/opt/zalo/"; chmod 0644 "$OUTPUT_DIR/opt/zalo/$(basename "$license_file")"; }
done

[ -f "$ELECTRON_DIR/version" ] && cp "$ELECTRON_DIR/version" "$OUTPUT_DIR/opt/zalo/"

[ -f "$ELECTRON_DIR/vk_swiftshader_icd.json" ] && cp "$ELECTRON_DIR/vk_swiftshader_icd.json" "$OUTPUT_DIR/opt/zalo/"

[ -d "$ELECTRON_DIR/locales" ] && { cp -r "$ELECTRON_DIR/locales" "$OUTPUT_DIR/opt/zalo/"; find "$OUTPUT_DIR/opt/zalo/locales" -type f -exec chmod 0644 {} \;; }
[ -d "$ELECTRON_DIR/swiftshader" ] && { cp -r "$ELECTRON_DIR/swiftshader" "$OUTPUT_DIR/opt/zalo/"; find "$OUTPUT_DIR/opt/zalo/swiftshader" -type f -exec chmod 0755 {} \;; }

[ -f "$ELECTRON_DIR/resources/electron.asar" ] && cp "$ELECTRON_DIR/resources/electron.asar" "$OUTPUT_DIR/opt/zalo/resources/"

mkdir -p "$OUTPUT_DIR/opt/zalo/resources"
cp "$APP_ASAR" "$OUTPUT_DIR/opt/zalo/resources/app.asar"
chmod 0644 "$OUTPUT_DIR/opt/zalo/resources/app.asar"

mkdir -p "$OUTPUT_DIR/opt/zalo/resources/app.asar.unpacked/native/nativelibs"
[ -d "$NATIVE_DIR/nativelibs" ] && cp -r "$NATIVE_DIR/nativelibs/"* "$OUTPUT_DIR/opt/zalo/resources/app.asar.unpacked/native/nativelibs/"
find "$OUTPUT_DIR/opt/zalo/resources/app.asar.unpacked" -name '*.node' -exec chmod 0755 {} \;

mkdir -p "$OUTPUT_DIR/usr/bin"
ln -sf /opt/zalo/zalo "$OUTPUT_DIR/usr/bin/zalo"

echo "Assembly complete."
find "$OUTPUT_DIR/opt/zalo" -maxdepth 3 -type f | sort
