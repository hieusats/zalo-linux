#!/usr/bin/env bash
set -euo pipefail

BUILD_DIR="$(cd "$(dirname "$0")/../build" && pwd)"
ASAR="$BUILD_DIR/app.asar"
DEST="$BUILD_DIR/app-extracted"

[ ! -f "$ASAR" ] && { echo "ERROR: app.asar not found. Run extract-dmg.sh first."; exit 1; }
[ -d "$DEST" ] && rm -rf "$DEST"

UNPACKED="$BUILD_DIR/app.asar.unpacked"
if [ -d "$BUILD_DIR/native" ] && [ ! -e "$UNPACKED" ]; then
  mkdir -p "$UNPACKED"
  ln -s "$BUILD_DIR/native" "$UNPACKED/native"
  echo "Linked native/ as app.asar.unpacked/native"
fi

echo "Extracting app.asar to $DEST..."
npx --yes @electron/asar extract "$ASAR" "$DEST"
echo "Done. Extracted $(find "$DEST" -type f | wc -l) files."
