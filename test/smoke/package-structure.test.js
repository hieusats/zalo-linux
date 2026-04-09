const { expect } = require('chai');
const fs = require('fs');
const path = require('path');
const { PACKAGING_DIR, PROJECT_ROOT } = require('../helpers');

describe('Package Structure', function () {
  this.timeout(5000);

  describe('.desktop file', function () {
    const desktopFile = path.join(PACKAGING_DIR, 'zalo.desktop');

    it('should exist', function () {
      expect(fs.existsSync(desktopFile), `${desktopFile} missing`).to.be.true;
    });

    it('should be a valid Desktop Entry', function () {
      const content = fs.readFileSync(desktopFile, 'utf8');
      expect(content).to.include('[Desktop Entry]');
      expect(content).to.match(/Type=Application/);
      expect(content).to.match(/Name=Zalo/);
      expect(content).to.match(/Exec=\/opt\/zalo\/zalo/);
      expect(content).to.match(/Icon=zalo/);
      expect(content).to.match(/MimeType=x-scheme-handler\/zalo/);
      expect(content).to.match(/Categories=.*Network.*InstantMessaging/);
    });
  });

  describe('Icons', function () {
    it('should have 256x256 icon', function () {
      const icon = path.join(PACKAGING_DIR, 'icons', 'icon_256x256.png');
      expect(fs.existsSync(icon), `${icon} missing`).to.be.true;
      const stats = fs.statSync(icon);
      expect(stats.size).to.be.greaterThan(100);
    });

    it('should have 512x512 icon', function () {
      const icon = path.join(PACKAGING_DIR, 'icons', 'icon_512x512.png');
      expect(fs.existsSync(icon), `${icon} missing`).to.be.true;
      const stats = fs.statSync(icon);
      expect(stats.size).to.be.greaterThan(100);
    });
  });

  describe('Debian control files', function () {
    const debianDir = path.join(PACKAGING_DIR, 'debian');

    it('should have control file', function () {
      const control = path.join(debianDir, 'control');
      expect(fs.existsSync(control), `${control} missing`).to.be.true;
      const content = fs.readFileSync(control, 'utf8');
      expect(content).to.match(/Package: zalo/);
      expect(content).to.match(/Architecture: amd64/);
      expect(content).to.match(/Depends:/);
      expect(content).to.match(/libgtk-3-0/);
      expect(content).to.match(/libsecret-1-0/);
    });

    it('should have postinst script', function () {
      const postinst = path.join(debianDir, 'postinst');
      expect(fs.existsSync(postinst), `${postinst} missing`).to.be.true;
    });

    it('should have postrm script', function () {
      const postrm = path.join(debianDir, 'postrm');
      expect(fs.existsSync(postrm), `${postrm} missing`).to.be.true;
    });

    it('should have changelog', function () {
      const changelog = path.join(debianDir, 'changelog');
      expect(fs.existsSync(changelog), `${changelog} missing`).to.be.true;
    });

    it('should have metainfo.xml', function () {
      const metainfo = path.join(debianDir, 'zalo.metainfo.xml');
      expect(fs.existsSync(metainfo), `${metainfo} missing`).to.be.true;
    });
  });

  describe('Project root files', function () {
    it('should have package.json', function () {
      expect(fs.existsSync(path.join(PROJECT_ROOT, 'package.json'))).to.be.true;
    });

    it('should have Makefile', function () {
      expect(fs.existsSync(path.join(PROJECT_ROOT, 'Makefile'))).to.be.true;
    });

    it('should have .gitignore', function () {
      expect(fs.existsSync(path.join(PROJECT_ROOT, '.gitignore'))).to.be.true;
    });
  });
});
