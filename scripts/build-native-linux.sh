#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ELECTRON_HEADERS_DIR="$PROJECT_ROOT/.cache/electron-headers"
NODE_VERSION="16.17.1"

echo "========================================"
echo "  Zalo Linux - Native Module Builder"
echo "========================================"

if [ ! -f "$ELECTRON_HEADERS_DIR/include/node/node.h" ]; then
  echo ""
  echo "Downloading Node headers v$NODE_VERSION for Electron 22.3.9..."
  mkdir -p "$ELECTRON_HEADERS_DIR"
  curl -fSL "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-headers.tar.gz" | \
    tar xz -C "$ELECTRON_HEADERS_DIR" --strip-components=1
  if [ ! -f "$ELECTRON_HEADERS_DIR/include/node/node.h" ]; then
    echo "ERROR: Failed to download Node headers"
    exit 1
  fi
  echo "Headers downloaded to $ELECTRON_HEADERS_DIR"
fi

FAILED=0
PASSED=0

echo ""
echo "--- Building sqlite3 ---"
if bash "$SCRIPT_DIR/build-sqlite3-linux.sh"; then
  echo "  [OK] sqlite3"
  PASSED=$((PASSED + 1))
else
  echo "  [FAIL] sqlite3"
  FAILED=$((FAILED + 1))
fi

echo ""
echo "--- Building db-cross-v4 ---"
if bash "$SCRIPT_DIR/build-dbcrossv4-linux.sh"; then
  echo "  [OK] db-cross-v4"
  PASSED=$((PASSED + 1))
else
  echo "  [FAIL] db-cross-v4"
  FAILED=$((FAILED + 1))
fi

echo ""
echo "========================================"
echo "  Build Summary: $PASSED passed, $FAILED failed"
echo "========================================"

if [ $FAILED -gt 0 ]; then
  exit 1
fi
