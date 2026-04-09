#!/usr/bin/env bash
set -euo pipefail

[ $# -lt 2 ] && { echo "Usage: $0 <package-data-dir> <output-deb>"; exit 1; }

PKG_DATA="$(cd "$1" && pwd)"
OUTPUT_DEB="$2"

[ ! -f "$PKG_DATA/DEBIAN/control" ] && { echo "Error: control not found"; exit 1; }
chmod 0755 "$PKG_DATA/DEBIAN/postinst" "$PKG_DATA/DEBIAN/postrm" 2>/dev/null || true
find "$PKG_DATA" -type d -exec chmod 0755 {} \;

dpkg-deb --root-owner-group --build "$PKG_DATA" "$OUTPUT_DEB"
echo "Built: $OUTPUT_DEB ($(du -h "$OUTPUT_DEB" | cut -f1))"
