#!/usr/bin/env bash
set -euo pipefail

TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT

cat > "$TMPDIR/sample.js" << 'SAMPLE'
var x = h.dock.setBadge("3");
var y = h.dock.bounce("critical");
var z = "~/Library/LaunchAgents/com.vng.zalo.plist";
SAMPLE

cat > "$TMPDIR/test-patches.json" << 'PATCHES'
{
  "version": "1.0.0",
  "patches": [
    { "id": "test-badge", "file": "sample.js", "search": "h\\.dock\\.setBadge\\([^)]*\\)", "replace": "h.setBadgeCount(3)" },
    { "id": "test-bounce", "file": "sample.js", "search": "h\\.dock\\.bounce\\([^)]*\\)", "replace": "void 0" },
    { "id": "test-path", "file": "sample.js", "search": "~/Library/LaunchAgents/", "replace": "~/.config/autostart/" }
  ]
}
PATCHES

node "$(dirname "$0")/../scripts/patch-asar.js" "$TMPDIR" "$TMPDIR/test-patches.json"

if grep -q 'h.setBadgeCount(3)' "$TMPDIR/sample.js" && \
   grep -q 'void 0' "$TMPDIR/sample.js" && \
   grep -q '~/.config/autostart/' "$TMPDIR/sample.js"; then
  echo "=== TEST PASSED ==="; exit 0
else
  echo "=== TEST FAILED ==="; exit 1
fi
