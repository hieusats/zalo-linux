#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
NATIVE_DIR="$PROJECT_ROOT/build/app-extracted/native/nativelibs/sqlite3"
ELECTRON_VERSION="22.3.9"
ELECTRON_HEADERS_DIR="$PROJECT_ROOT/.cache/electron-headers"
NODE_VERSION="16.17.1"

echo "=== Building sqlite3 for Linux ==="
echo "Electron version: $ELECTRON_VERSION (Node $NODE_VERSION)"
echo "Target: napi-v6-linux-x64"

if [ ! -f "$ELECTRON_HEADERS_DIR/include/node/node.h" ]; then
  echo "Downloading Node headers v$NODE_VERSION for Electron $ELECTRON_VERSION..."
  mkdir -p "$ELECTRON_HEADERS_DIR"
  curl -fSL "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-headers.tar.gz" | \
    tar xz -C "$ELECTRON_HEADERS_DIR" --strip-components=1

  if [ ! -f "$ELECTRON_HEADERS_DIR/include/node/node.h" ]; then
    echo "ERROR: Failed to download Node headers"
    exit 1
  fi
  echo "Headers downloaded to $ELECTRON_HEADERS_DIR"
fi

BUILD_WORKDIR="$NATIVE_DIR/build-workdir"
rm -rf "$BUILD_WORKDIR"
mkdir -p "$BUILD_WORKDIR"
cd "$BUILD_WORKDIR"

echo "Installing sqlite3 npm package..."
npm init -y --silent 2>/dev/null || true
npm install sqlite3@5.1.7 --build-from-source \
  --target="$ELECTRON_VERSION" \
  --arch=x64 \
  --dist-url=https://electronjs.org/headers \
  --nodedir="$ELECTRON_HEADERS_DIR" \
  2>&1 | tail -30

BUILD_OUTPUT="node_modules/sqlite3/build/Release/node_sqlite3.node"
if [ ! -f "$BUILD_OUTPUT" ]; then
  echo "Primary build failed, attempting @electron/rebuild..."
  npx @electron/rebuild \
    --version="$ELECTRON_VERSION" \
    --module-dir="$BUILD_WORKDIR" \
    --only=sqlite3 \
    2>&1 | tail -30
fi

if [ ! -f "$BUILD_OUTPUT" ]; then
  echo "ERROR: Build output not found at $BUILD_OUTPUT"
  find node_modules/sqlite3/build -name "*.node" 2>/dev/null || true
  exit 1
fi

TARGET_DIR="$NATIVE_DIR/binding/napi-v6-linux-x64"
TARGET_FILE="$TARGET_DIR/node_sqlite3.node"

mkdir -p "$TARGET_DIR"
cp "$BUILD_OUTPUT" "$TARGET_FILE"

echo "=== sqlite3 built successfully ==="
echo "Output: $TARGET_FILE"
file "$TARGET_FILE"
