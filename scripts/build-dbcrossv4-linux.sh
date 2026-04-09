#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DB_CROSS_DIR="$PROJECT_ROOT/build/app-extracted/native/nativelibs/db-cross-v4"
ELECTRON_HEADERS_DIR="$PROJECT_ROOT/.cache/electron-headers"
NODE_VERSION="16.17.1"

echo "=== Building db-cross-v4 for Linux ==="

if [ ! -f "$ELECTRON_HEADERS_DIR/include/node/node.h" ]; then
  echo "Downloading Node headers v$NODE_VERSION..."
  mkdir -p "$ELECTRON_HEADERS_DIR"
  curl -fSL "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-headers.tar.gz" | \
    tar xz -C "$ELECTRON_HEADERS_DIR" --strip-components=1
fi

cd "$DB_CROSS_DIR/src"
rm -rf build

npx node-gyp rebuild --nodedir="$ELECTRON_HEADERS_DIR" 2>&1 | tail -5

mkdir -p "$DB_CROSS_DIR/prebuilt/linux/electron/x64"
cp build/Release/dbcrossv4_native.node "$DB_CROSS_DIR/prebuilt/linux/electron/x64/db-cross-v4-native.node"

echo "=== db-cross-v4 built successfully ==="
echo "Output: $DB_CROSS_DIR/prebuilt/linux/electron/x64/db-cross-v4-native.node"
file "$DB_CROSS_DIR/prebuilt/linux/electron/x64/db-cross-v4-native.node"
