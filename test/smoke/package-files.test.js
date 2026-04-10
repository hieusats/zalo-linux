const { expect } = require('chai');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

describe('Package Files', function () {
  this.timeout(10000);

  const PKG_DATA = path.resolve(__dirname, '../../build/package-data');
  const OPT_DIR = path.join(PKG_DATA, 'opt', 'zalo');

  before(function () {
    if (!fs.existsSync(OPT_DIR)) {
      this.skip();
    }
  });

  const REQUIRED_FILES = [
    { path: 'zalo', type: 'file', desc: 'Electron binary (renamed to zalo)' },
    { path: 'icudtl.dat', type: 'file', desc: 'ICU data' },
    { path: 'v8_context_snapshot.bin', type: 'file', desc: 'V8 context snapshot' },
    { path: 'snapshot_blob.bin', type: 'file', desc: 'V8 snapshot blob' },
    { path: 'chrome_100_percent.pak', type: 'file', desc: 'Chrome 100% resources' },
    { path: 'chrome_200_percent.pak', type: 'file', desc: 'Chrome 200% resources (HiDPI)' },
    { path: 'resources.pak', type: 'file', desc: 'Chrome resources pak' },
    { path: 'libffmpeg.so', type: 'file', desc: 'FFmpeg (media playback)' },
    { path: 'libGLESv2.so', type: 'file', desc: 'GLESv2 (GPU rendering)' },
    { path: 'libEGL.so', type: 'file', desc: 'EGL (GPU rendering)' },
    { path: 'libvulkan.so.1', type: 'file', desc: 'Vulkan loader' },
    { path: 'chrome-sandbox', type: 'file', desc: 'Chrome sandbox' },
    { path: 'chrome_crashpad_handler', type: 'file', desc: 'Crashpad handler' },
    { path: 'resources/app.asar', type: 'file', desc: 'Application bundle' },
    { path: 'locales', type: 'dir', desc: 'Locale files' },
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
