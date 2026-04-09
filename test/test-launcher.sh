#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BUILD_DIR="$SCRIPT_DIR/build"
LAUNCHER="$SCRIPT_DIR/electron-launcher.sh"

echo "=== Test: Electron Launcher ==="

[ ! -f "$LAUNCHER" ] && { echo "  FAIL: electron-launcher.sh not found"; exit 1; }
[ ! -x "$LAUNCHER" ] && { echo "  FAIL: not executable"; exit 1; }
[ ! -f "$BUILD_DIR/app.asar" ] && { echo "  FAIL: app.asar not found"; exit 1; }
[ ! -x "$BUILD_DIR/electron-v22.3.9-linux-x64/electron" ] && { echo "  FAIL: Electron binary not found"; exit 1; }

echo "  PASS: launcher script exists and is executable"
echo "  PASS: app.asar present"
echo "  PASS: Electron binary present"
echo "Results: 3 passed, 0 failed"
