#!/usr/bin/env bash
set -euo pipefail

DEB_PATH="${DEB_PATH:-/packages/zalo_amd64.deb}"
TEST_RESULT="/test-results/results.json"
SCREENSHOT_DIR="/test-results/screenshots"

mkdir -p "$(dirname "$TEST_RESULT")" "$SCREENSHOT_DIR"

echo "=== Zalo Linux Docker Smoke Test ==="
echo "Distro: $(cat /etc/os-release | grep PRETTY_NAME | cut -d= -f2)"
echo "Arch: $(uname -m)"
echo "DEB: $DEB_PATH"

if [ ! -f "$DEB_PATH" ]; then
    echo "FAIL: .deb not found at $DEB_PATH"
    echo '{"status":"fail","reason":"deb_not_found"}' > "$TEST_RESULT"
    exit 1
fi

echo "--- Installing .deb ---"
dpkg -i "$DEB_PATH" || apt-get install -f -y

echo "--- Checking installation ---"
if [ -f "/opt/zalo/zalo" ]; then
    echo "OK: /opt/zalo/zalo exists"
else
    echo "FAIL: /opt/zalo/zalo not found"
    echo '{"status":"fail","reason":"binary_missing"}' > "$TEST_RESULT"
    exit 1
fi

if [ -f "/usr/share/applications/zalo.desktop" ]; then
    echo "OK: .desktop file exists"
else
    echo "FAIL: .desktop file not found"
    echo '{"status":"fail","reason":"desktop_missing"}' > "$TEST_RESULT"
    exit 1
fi

echo "--- Checking dependencies ---"
MISSING=$(ldd /opt/zalo/zalo 2>/dev/null | grep -c "not found" || true)
if [ "$MISSING" -gt 0 ]; then
    echo "WARN: $MISSING missing shared libraries"
    ldd /opt/zalo/zalo 2>/dev/null | grep "not found"
fi

echo "--- Checking shared library deps ---"
REQUIRED_LIBS="libgtk-3 libnotify libnss3 libsecret"
for lib in $REQUIRED_LIBS; do
    if ldconfig -p 2>/dev/null | grep -q "$lib"; then
        echo "  OK: $lib found"
    else
        echo "  WARN: $lib not found in ldconfig"
    fi
done

echo "--- Launching app ---"
export DISPLAY=:99
Xvfb :99 -screen 0 1024x768x24 &
XVFB_PID=$!
sleep 1

eval $(dbus-launch --exit-with-session) || true
sleep 1

timeout 15 /opt/zalo/zalo --no-sandbox --disable-gpu --test-mode &
APP_PID=$!
sleep 5

APP_RUNNING=false
if kill -0 "$APP_PID" 2>/dev/null; then
    APP_RUNNING=true
    echo "OK: App is running (PID: $APP_PID)"
else
    echo "FAIL: App crashed on launch"
fi

echo "--- Taking screenshot ---"
if [ "$APP_RUNNING" = true ]; then
    import -window root "$SCREENSHOT_DIR/launch.png" 2>/dev/null || \
        xwd -root -out "$SCREENSHOT_DIR/launch.xwd" 2>/dev/null || \
        echo "WARN: screenshot tools not available"
    kill "$APP_PID" 2>/dev/null || true
fi

kill "$XVFB_PID" 2>/dev/null || true

if [ "$APP_RUNNING" = true ]; then
    echo '{"status":"pass"}' > "$TEST_RESULT"
    echo "=== PASS ==="
    exit 0
else
    echo '{"status":"fail","reason":"app_crashed"}' > "$TEST_RESULT"
    echo "=== FAIL ==="
    exit 1
fi
