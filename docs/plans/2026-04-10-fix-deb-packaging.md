# Fix .deb Package Missing Electron Runtime Files

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Fix `assemble-package.sh` to include ALL required Electron runtime files so the installed .deb works out of the box without manual file copying.

**Architecture:** The root cause is in `scripts/assemble-package.sh` — it only copies the electron binary, chrome-sandbox, app.asar, locales, and libvulkan. It misses 14+ critical Electron runtime files (.pak, .dat, .bin, .so) that Chromium needs at startup. The fix is to copy ALL files from the Electron dist (except the electron binary itself, which gets renamed to `zalo`).

**Tech Stack:** Bash, dpkg-deb, Electron 22.3.9

---

## Root Cause Summary

`scripts/assemble-package.sh` selectively copies files from the Electron dist into `/opt/zalo/`. It misses:

| Missing File | Impact |
|---|---|
| `libffmpeg.so` | FATAL: crash at startup — "cannot open shared object file" |
| `icudtl.dat` | FATAL: "Invalid file descriptor to ICU data" |
| `v8_context_snapshot.bin` | FATAL: "Error loading V8 startup snapshot file" |
| `snapshot_blob.bin` | FATAL: V8 initialization failure |
| `chrome_100_percent.pak` | ERROR: "Failed to load chrome_100_percent.pak" — UI broken |
| `chrome_200_percent.pak` | ERROR: same as above, HiDPI broken |
| `resources.pak` | ERROR: "Failed to load resources.pak" — UI broken |
| `libGLESv2.so` | ERROR: "Failed to load GLES library" — GPU crash |
| `libEGL.so` | ERROR: EGL initialization failure |
| `libvk_swiftshader.so` | Missing software renderer fallback |
| `chrome_crashpad_handler` | Crash reporting broken |
| `vk_swiftshader_icd.json` | Vulkan ICD config missing |
| `LICENSE` | Legal/compliance issue |
| `LICENSES.chromium.html` | Legal/compliance issue |
| `version` | Minor: version file missing |

---

## Task 1: Fix `assemble-package.sh` to copy all Electron runtime files

**Objective:** Replace selective file copying with a bulk copy of the entire Electron dist, then overlay app-specific files.

**Files:**
- Modify: `scripts/assemble-package.sh`

**Step 1: Rewrite the file copy logic**

Replace the current selective copy approach with a bulk copy of everything from the Electron dist, then overlay the app-specific files (renamed binary, app.asar, native modules).

```bash
#!/usr/bin/env bash
set -euo pipefail

[ $# -lt 4 ] && { echo "Usage: $0 <electron-dir> <app-asar> <native-dir> <output-dir>"; exit 1; }

ELECTRON_DIR="$(cd "$1" && pwd)"
APP_ASAR="$(cd "$(dirname "$2")" && pwd)/$(basename "$2")"
NATIVE_DIR="$(cd "$3" && pwd)"
OUTPUT_DIR="$(cd "$4" && pwd)"

echo "Assembling /opt/zalo/..."
mkdir -p "$OUTPUT_DIR/opt/zalo"

# Copy ALL Electron runtime files (binaries, libs, data files)
cp "$ELECTRON_DIR/electron" "$OUTPUT_DIR/opt/zalo/zalo"
chmod 0755 "$OUTPUT_DIR/opt/zalo/zalo"

# Copy all shared libraries (.so)
for so_file in "$ELECTRON_DIR"/*.so*; do
    [ -f "$so_file" ] && { cp "$so_file" "$OUTPUT_DIR/opt/zalo/"; chmod 0755 "$OUTPUT_DIR/opt/zalo/$(basename "$so_file")"; }
done

# Copy all .pak files (Chrome UI resources)
for pak_file in "$ELECTRON_DIR"/*.pak; do
    [ -f "$pak_file" ] && { cp "$pak_file" "$OUTPUT_DIR/opt/zalo/"; chmod 0644 "$OUTPUT_DIR/opt/zalo/$(basename "$pak_file")"; }
done

# Copy all .dat and .bin files (ICU, V8 snapshots)
for data_file in "$ELECTRON_DIR"/*.dat "$ELECTRON_DIR"/*.bin; do
    [ -f "$data_file" ] && { cp "$data_file" "$OUTPUT_DIR/opt/zalo/"; chmod 0644 "$OUTPUT_DIR/opt/zalo/$(basename "$data_file")"; }
done

# Copy chrome-sandbox with setuid bit
[ -f "$ELECTRON_DIR/chrome-sandbox" ] && { cp "$ELECTRON_DIR/chrome-sandbox" "$OUTPUT_DIR/opt/zalo/"; chmod 4755 "$OUTPUT_DIR/opt/zalo/chrome-sandbox"; }

# Copy chrome_crashpad_handler
[ -f "$ELECTRON_DIR/chrome_crashpad_handler" ] && { cp "$ELECTRON_DIR/chrome_crashpad_handler" "$OUTPUT_DIR/opt/zalo/"; chmod 0755 "$OUTPUT_DIR/opt/zalo/chrome_crashpad_handler"; }

# Copy license files
for license_file in "$ELECTRON_DIR/LICENSE" "$ELECTRON_DIR/LICENSES.chromium.html"; do
    [ -f "$license_file" ] && { cp "$license_file" "$OUTPUT_DIR/opt/zalo/"; chmod 0644 "$OUTPUT_DIR/opt/zalo/$(basename "$license_file")"; }
done

# Copy version file
[ -f "$ELECTRON_DIR/version" ] && cp "$ELECTRON_DIR/version" "$OUTPUT_DIR/opt/zalo/"

# Copy vk_swiftshader_icd.json
[ -f "$ELECTRON_DIR/vk_swiftshader_icd.json" ] && cp "$ELECTRON_DIR/vk_swiftshader_icd.json" "$OUTPUT_DIR/opt/zalo/"

# Copy directories: locales, swiftshader, resources
[ -d "$ELECTRON_DIR/locales" ] && { cp -r "$ELECTRON_DIR/locales" "$OUTPUT_DIR/opt/zalo/"; find "$OUTPUT_DIR/opt/zalo/locales" -type f -exec chmod 0644 {} \;; }
[ -d "$ELECTRON_DIR/swiftshader" ] && { cp -r "$ELECTRON_DIR/swiftshader" "$OUTPUT_DIR/opt/zalo/"; find "$OUTPUT_DIR/opt/zalo/swiftshader" -type f -exec chmod 0755 {} \;; }

# Copy electron.asar (Electron's internal app shell)
[ -f "$ELECTRON_DIR/resources/electron.asar" ] && cp "$ELECTRON_DIR/resources/electron.asar" "$OUTPUT_DIR/opt/zalo/resources/"

# --- App-specific files ---

mkdir -p "$OUTPUT_DIR/opt/zalo/resources"
cp "$APP_ASAR" "$OUTPUT_DIR/opt/zalo/resources/app.asar"
chmod 0644 "$OUTPUT_DIR/opt/zalo/resources/app.asar"

mkdir -p "$OUTPUT_DIR/opt/zalo/resources/app.asar.unpacked/native/nativelibs"
[ -d "$NATIVE_DIR/nativelibs" ] && cp -r "$NATIVE_DIR/nativelibs/"* "$OUTPUT_DIR/opt/zalo/resources/app.asar.unpacked/native/nativelibs/"
find "$OUTPUT_DIR/opt/zalo/resources/app.asar.unpacked" -name '*.node' -exec chmod 0755 {} \;

# Symlink for CLI access
mkdir -p "$OUTPUT_DIR/usr/bin"
ln -sf /opt/zalo/zalo "$OUTPUT_DIR/usr/bin/zalo"

echo "Assembly complete."
find "$OUTPUT_DIR/opt/zalo" -maxdepth 3 -type f | sort
```

**Step 2: Verify script syntax**

Run: `bash -n scripts/assemble-package.sh`
Expected: no output (syntax OK)

**Step 3: Commit**

```bash
git add scripts/assemble-package.sh
git commit -m "fix: copy all Electron runtime files in assemble-package.sh"
```

---

## Task 2: Add smoke test for installed package completeness

**Objective:** Add a test that verifies ALL required Electron runtime files are present after .deb installation, preventing regression.

**Files:**
- Create: `test/smoke/package-files.test.js`

**Step 1: Write the test**

```javascript
const { expect } = require('chai');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

describe('Package Files', function () {
  this.timeout(10000);

  // Determine the package data directory (where files get assembled)
  const PKG_DATA = path.resolve(__dirname, '../../build/package-data');
  const OPT_DIR = path.join(PKG_DATA, 'opt', 'zalo');

  // Only run if package has been assembled
  before(function () {
    if (!fs.existsSync(OPT_DIR)) {
      this.skip();
    }
  });

  const REQUIRED_FILES = [
    // Core binary
    { path: 'zalo', type: 'file', desc: 'Electron binary (renamed to zalo)' },

    // Chromium data files
    { path: 'icudtl.dat', type: 'file', desc: 'ICU data' },
    { path: 'v8_context_snapshot.bin', type: 'file', desc: 'V8 context snapshot' },
    { path: 'snapshot_blob.bin', type: 'file', desc: 'V8 snapshot blob' },
    { path: 'chrome_100_percent.pak', type: 'file', desc: 'Chrome 100% resources' },
    { path: 'chrome_200_percent.pak', type: 'file', desc: 'Chrome 200% resources (HiDPI)' },
    { path: 'resources.pak', type: 'file', desc: 'Chrome resources pak' },

    // Shared libraries
    { path: 'libffmpeg.so', type: 'file', desc: 'FFmpeg (media playback)' },
    { path: 'libGLESv2.so', type: 'file', desc: 'GLESv2 (GPU rendering)' },
    { path: 'libEGL.so', type: 'file', desc: 'EGL (GPU rendering)' },
    { path: 'libvulkan.so.1', type: 'file', desc: 'Vulkan loader' },

    // Sandbox & crash handling
    { path: 'chrome-sandbox', type: 'file', desc: 'Chrome sandbox' },
    { path: 'chrome_crashpad_handler', type: 'file', desc: 'Crashpad handler' },

    // App resources
    { path: 'resources/app.asar', type: 'file', desc: 'Application bundle' },

    // Locales
    { path: 'locales', type: 'dir', desc: 'Locale files' },

    // License files
    { path: 'LICENSE', type: 'file', desc: 'Electron license' },
    { path: 'LICENSES.chromium.html', type: 'file', desc: 'Chromium licenses' },
  ];

  REQUIRED_FILES.forEach(({ path: relPath, type, desc }) => {
    it(`should include ${desc} (${relPath})`, function () {
      const fullPath = path.join(OPT_DIR, relPath);
      expect(fs.existsSync(fullPath), `${relPath} missing — ${desc}`).to.be.true;
      if (type === 'file') {
        expect(fs.statSync(fullPath).isFile(), `${relPath} should be a file`).to.be.true;
      } else {
        expect(fs.statSync(fullPath).isDirectory(), `${relPath} should be a directory`).to.be.true;
      }
    });
  });

  it('should have executable zalo binary', function () {
    const binary = path.join(OPT_DIR, 'zalo');
    expect(fs.statSync(binary).mode & 0o111).to.be.greaterThan(0);
  });

  it('chrome-sandbox should have setuid bit', function () {
    const sandbox = path.join(OPT_DIR, 'chrome-sandbox');
    expect(fs.statSync(sandbox).mode & 0o4000).to.be.greaterThan(0);
  });

  it('should have symlink /usr/bin/zalo -> /opt/zalo/zalo', function () {
    const symlink = path.join(PKG_DATA, 'usr', 'bin', 'zalo');
    expect(fs.existsSync(symlink), '/usr/bin/zalo symlink missing').to.be.true;
    expect(fs.readlinkSync(symlink)).to.equal('/opt/zalo/zalo');
  });

  it('should have desktop entry', function () {
    const desktop = path.join(PKG_DATA, 'usr', 'share', 'applications', 'zalo.desktop');
    expect(fs.existsSync(desktop), 'zalo.desktop missing').to.be.true;
    const content = fs.readFileSync(desktop, 'utf8');
    expect(content).to.include('Exec=/opt/zalo/zalo');
  });
});
```

**Step 2: Run test (should FAIL with current package)**

Run: `cd /home/hieusats/dev/zalo/linux-port && npx mocha test/smoke/package-files.test.js`
Expected: FAIL — multiple missing files

**Step 3: Commit**

```bash
git add test/smoke/package-files.test.js
git commit -m "test: add smoke test for package file completeness"
```

---

## Task 3: Rebuild .deb and verify installation

**Objective:** Rebuild the .deb with the fixed assemble script, install it, and verify it works.

**Step 1: Clean previous package data and rebuild**

```bash
cd /home/hieusats/dev/zalo/linux-port
rm -rf build/package-data
bash scripts/build-deb.sh
```

Expected: Build completes successfully, .deb file created.

**Step 2: Verify .deb contents**

```bash
dpkg-deb -c build/zalo_26.3.20-1_amd64.deb | grep -E "\.(pak|dat|bin|so)" | head -20
```

Expected: Should see `libffmpeg.so`, `icudtl.dat`, `v8_context_snapshot.bin`, `snapshot_blob.bin`, `*.pak`, `libGLESv2.so`, `libEGL.so` in the output.

**Step 3: Install the new .deb**

```bash
sudo dpkg -r zalo 2>/dev/null || true
sudo dpkg -i build/zalo_26.3.20-1_amd64.deb
```

**Step 4: Verify no missing shared libraries**

```bash
ldd /opt/zalo/zalo 2>&1 | grep "not found"
```

Expected: empty output (all libs resolved)

**Step 5: Run the new smoke test**

```bash
npx mocha test/smoke/package-files.test.js
```

Expected: ALL PASS

**Step 6: Test app launch (basic check)**

```bash
timeout 5 /opt/zalo/zalo --no-sandbox --disable-gpu 2>&1 | grep -c "FATAL\|not found"
```

Expected: output is `0` (no fatal errors about missing files)

**Step 7: Commit and push**

```bash
git add -A
git commit -m "fix: complete Electron runtime files in .deb package"
git push
```

---

## Summary of Changes

| File | Change |
|---|---|
| `scripts/assemble-package.sh` | Rewrite: copy ALL Electron runtime files instead of selective subset |
| `test/smoke/package-files.test.js` | New: smoke test verifying package completeness |

**Files NOT changed** (already correct):
- `scripts/build-deb.sh` — calls assemble correctly
- `packaging/debian/control` — dependencies are correct
- `packaging/zalo.desktop` — Exec path is correct
- `packaging/debian/postinst` — post-install script is correct
