const { expect } = require('chai');
const fs = require('fs');
const path = require('path');
const { SCRIPTS_DIR } = require('../helpers');

const BUILD_SCRIPTS = [
  'build-deb.sh', 'assemble-package.sh', 'package-deb.sh',
  'download-electron.sh', 'extract-asar.sh', 'extract-dmg.sh',
  'patch-asar.js', 'repack-asar.sh', 'build-native-linux.sh',
  'build-sqlite3-linux.sh', 'build-dbcrossv4-linux.sh'
];

describe('Build Artifacts', function () {
  this.timeout(5000);

  describe('Build scripts', function () {
    BUILD_SCRIPTS.forEach(script => {
      it(`${script} should exist`, function () {
        const scriptPath = path.join(SCRIPTS_DIR, script);
        expect(fs.existsSync(scriptPath), `${script} missing`).to.be.true;
      });
    });

    BUILD_SCRIPTS.filter(s => s.endsWith('.sh')).forEach(script => {
      it(`${script} should be executable`, function () {
        const scriptPath = path.join(SCRIPTS_DIR, script);
        try {
          fs.accessSync(scriptPath, fs.constants.X_OK);
        } catch {
          expect.fail(`${script} is not executable`);
        }
      });
    });
  });

  describe('Build scripts syntax', function () {
    it('patch-asar.js should be a readable JS file', function () {
      const content = fs.readFileSync(path.join(SCRIPTS_DIR, 'patch-asar.js'), 'utf8');
      expect(content.length).to.be.at.least(50);
      expect(content).to.include('use strict');
    });

    it('verify-patches.js should be a readable JS file', function () {
      const content = fs.readFileSync(path.join(SCRIPTS_DIR, 'verify-patches.js'), 'utf8');
      expect(content.length).to.be.at.least(50);
      expect(content).to.include('use strict');
    });
  });

  describe('Packaging structure', function () {
    it('should have packaging directory', function () {
      expect(fs.existsSync(path.join(__dirname, '../../packaging'))).to.be.true;
    });

    it('should have packaging/debian directory', function () {
      expect(fs.existsSync(path.join(__dirname, '../../packaging/debian'))).to.be.true;
    });

    it('should have packaging/icons directory', function () {
      expect(fs.existsSync(path.join(__dirname, '../../packaging/icons'))).to.be.true;
    });
  });
});
