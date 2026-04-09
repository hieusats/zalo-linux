#!/usr/bin/env bash
set -euo pipefail

BUILD_DIR="$(cd "$(dirname "$0")/../build" && pwd)"
SOURCE="$BUILD_DIR/app-extracted"
OUTPUT="$BUILD_DIR/app.asar"

[ ! -d "$SOURCE" ] && { echo "ERROR: app-extracted/ not found."; exit 1; }

echo "Repacking app.asar..."
npx --yes @electron/asar pack "$SOURCE" "$OUTPUT"
echo "Done: $OUTPUT ($(du -h "$OUTPUT" | cut -f1))"
