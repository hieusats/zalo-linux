#!/usr/bin/env bash
set -euo pipefail

PASS=0
FAIL=0

assert_file() {
  if [ -f "$1" ]; then echo "  PASS: $1 exists"; PASS=$((PASS+1))
  else echo "  FAIL: $1 missing"; FAIL=$((FAIL+1)); fi
}

assert_dir() {
  if [ -d "$1" ]; then echo "  PASS: $1 exists"; PASS=$((PASS+1))
  else echo "  FAIL: $1 missing"; FAIL=$((FAIL+1)); fi
}

cd "$(dirname "$0")/.."
echo "=== Project Structure Smoke Test ==="

assert_file package.json
assert_file .gitignore
assert_dir scripts/
assert_dir build/
assert_dir patches/
assert_dir test/

echo ""
echo "Results: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ] && exit 0 || exit 1
