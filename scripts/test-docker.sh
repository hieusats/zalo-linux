#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
RESULTS_DIR="$PROJECT_ROOT/test-results"
mkdir -p "$RESULTS_DIR"

DEB_PATH="${1:-$PROJECT_ROOT/build/dist/zalo_amd64.deb}"
if [ ! -f "$DEB_PATH" ]; then
    echo "Usage: $0 <path-to-zalo.deb>"
    echo "  or set DEB_PATH env var"
    exit 1
fi

DISTROS=(
    "ubuntu-22.04:test/docker/Dockerfile.ubuntu-22.04"
    "ubuntu-24.04:test/docker/Dockerfile.ubuntu-24.04"
    "debian-12:test/docker/Dockerfile.debian-12"
    "fedora-39:test/docker/Dockerfile.fedora-39"
)

echo "=== Cross-Distribution Test Matrix ==="
echo "DEB: $DEB_PATH"
echo "Results: $RESULTS_DIR"
echo ""

PASS_COUNT=0
FAIL_COUNT=0
SKIP_COUNT=0

for entry in "${DISTROS[@]}"; do
    IFS=':' read -r name dockerfile <<< "$entry"
    echo "--- Testing $name ---"

    if [ ! -f "$PROJECT_ROOT/$dockerfile" ]; then
        echo "SKIP: $dockerfile not found"
        SKIP_COUNT=$((SKIP_COUNT + 1))
        continue
    fi

    tag="zalo-test-$name"
    docker build \
        -f "$PROJECT_ROOT/$dockerfile" \
        -t "$tag" \
        "$PROJECT_ROOT" \
        --progress=plain 2>&1 | tail -3

    docker run --rm \
        -e DEB_PATH="/packages/zalo.deb" \
        -v "$DEB_PATH:/packages/zalo.deb:ro" \
        -v "$RESULTS_DIR/$name:/test-results" \
        "$tag" \
        && PASS_COUNT=$((PASS_COUNT + 1)) \
        || FAIL_COUNT=$((FAIL_COUNT + 1))

    echo ""
done

echo "=== Summary ==="
echo "Pass: $PASS_COUNT"
echo "Fail: $FAIL_COUNT"
echo "Skip: $SKIP_COUNT"

if [ "$FAIL_COUNT" -gt 0 ]; then
    exit 1
fi
