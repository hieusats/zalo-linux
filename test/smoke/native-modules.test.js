const { expect } = require('chai');
const fs = require('fs');
const path = require('path');
const { NATIVE_ROOT, NATIVE_MODULES, nativeModuleExists } = require('../helpers');

const MODULE_PATH_OVERRIDES = {
  'db-cross-v4': 'dist/binding.js'
};

describe('Native Modules - Loadability', function () {
  this.timeout(10000);

  NATIVE_MODULES.forEach(mod => {
    it(`${mod}: index.js should exist`, function () {
      const override = MODULE_PATH_OVERRIDES[mod];
      if (override) {
        const p = path.join(NATIVE_ROOT, mod, override);
        expect(fs.existsSync(p), `${mod} ${override} missing`).to.be.true;
      } else {
        expect(nativeModuleExists(mod), `${mod} index.js missing`).to.be.true;
      }
    });
  });

  describe('Central nativelibs index', function () {
    it('should load without crash', function () {
      const mod = require(path.join(NATIVE_ROOT, 'index.js'));
      expect(mod).to.be.an('object');
    });

    it('should expose all expected lazy loaders', function () {
      const mod = require(path.join(NATIVE_ROOT, 'index.js'));
      const expectedLoaders = [
        'fileUtils', 'sqlite3', 'dbUtils', 'zcall',
        'zimage', 'mp4thumb', 'v8Profiles', 'zjxl',
        'zwalker', 'zfile', 'fileUtilities', 'zaloLogger'
      ];
      expectedLoaders.forEach(key => {
        expect(mod[key], `missing loader: ${key}`).to.be.a('function');
      });
    });
  });
});
