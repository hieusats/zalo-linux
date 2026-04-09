#!/usr/bin/env bash
set -euo pipefail

ELECTRON_VERSION="22.3.9"
BUILD_DIR="$(cd "$(dirname "$0")/../build" && pwd)"

download_and_extract() {
  local arch="$1"
  local platform="linux-$arch"
  local url="https://github.com/electron/electron/releases/download/v${ELECTRON_VERSION}/electron-v${ELECTRON_VERSION}-${platform}.zip"
  local dest="$BUILD_DIR/electron-v${ELECTRON_VERSION}-${platform}"

  if [ -f "$dest/electron" ]; then
    echo "Already downloaded: $dest"; return 0
  fi

  echo "Downloading Electron ${ELECTRON_VERSION} for ${platform}..."
  mkdir -p "$dest"
  tmp_zip="/tmp/electron-${platform}.zip"

  if command -v wget &>/dev/null; then
    wget -q --show-progress -O "$tmp_zip" "$url"
  elif command -v curl &>/dev/null; then
    curl -fSL -o "$tmp_zip" "$url"
  else
    echo "ERROR: wget or curl required"; exit 1
  fi

  echo "Extracting..."
  unzip -qo "$tmp_zip" -d "$dest"
  rm -f "$tmp_zip"
  chmod +x "$dest/electron"
  echo "Done: $dest/electron"
}

download_and_extract "x64"
echo ""
echo "Electron ${ELECTRON_VERSION} ready."
