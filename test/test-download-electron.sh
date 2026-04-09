#!/usr/bin/env bash
set -euo pipefail

BUILD_DIR="$(cd "$(dirname "$0")/.." && pwd)/build"

echo "=== Test: Electron Download ==="

if [ ! -d "$BUILD_DIR/electron-v22.3.9-linux-x64" ]; then
  echo "  FAIL: electron-v22.3.9-linux-x64 not found"; exit 1
fi

ELECTRON_BIN="$BUILD_DIR/electron-v22.3.9-linux-x64/electron"
if [ ! -x "$ELECTRON_BIN" ]; then
  echo "  FAIL: $ELECTRON_BIN is not executable"; exit 1
fi

VERSION=$("$ELECTRON_BIN" --version 2>/dev/null || echo "ERROR")
if [[ "$VERSION" != *"v22.3.9"* ]]; then
  echo "  FAIL: electron --version returned '$VERSION'"; exit 1
fi

echo "  PASS: Electron v22.3.9 linux-x64 binary verified"
