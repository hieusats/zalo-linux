#!/usr/bin/env bash
set -euo pipefail

BUILD_DIR="$(cd "$(dirname "$0")/.." && pwd)/build"
DMG_SOURCE="/home/hieusats/dev/zalo/ZaloSetup-universal-26.3.20.dmg"

echo "=== Test: DMG Extraction ==="

[ ! -f "$DMG_SOURCE" ] && { echo "  SKIP: Source DMG not found"; exit 0; }
[ ! -f "$BUILD_DIR/app.asar" ] && { echo "  FAIL: app.asar not found"; exit 1; }
[ ! -d "$BUILD_DIR/native" ] && { echo "  FAIL: native/ not found"; exit 1; }
[ ! -d "$BUILD_DIR/app-extracted" ] && { echo "  FAIL: app-extracted/ not found"; exit 1; }
[ ! -f "$BUILD_DIR/app-extracted/bootstrap.js" ] && { echo "  FAIL: bootstrap.js not found"; exit 1; }
[ ! -f "$BUILD_DIR/app-extracted/package.json" ] && { echo "  FAIL: package.json not found"; exit 1; }

echo "  PASS: All DMG extraction artifacts present"
