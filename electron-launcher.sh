#!/usr/bin/env bash
set -euo pipefail

BUILD_DIR="$(cd "$(dirname "$0")" && pwd)/build"

ELECTRON_BIN="$BUILD_DIR/electron-v22.3.9-linux-x64/electron"
APP_ASAR="$BUILD_DIR/app.asar"

[ ! -x "$ELECTRON_BIN" ] && { echo "ERROR: Electron not found. Run: npm run download-electron"; exit 1; }
[ ! -f "$APP_ASAR" ] && { echo "ERROR: app.asar not found. Run: npm run extract:all"; exit 1; }

export ELECTRON_ENABLE_LOGGING=1

echo "Launching Zalo with Electron 22.3.9..."
exec "$ELECTRON_BIN" --no-sandbox --enable-logging "$APP_ASAR" "$@"
