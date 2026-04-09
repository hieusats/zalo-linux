#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "========================================"
echo "  Zalo Linux - Native Module Tests"
echo "========================================"

cd "$PROJECT_ROOT"

npx mocha test/native/*.test.js --timeout 15000 --reporter spec

echo ""
echo "========================================"
echo "  All tests completed"
echo "========================================"
