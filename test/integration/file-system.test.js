const { expect } = require('chai');
const path = require('path');
const { NATIVE_ROOT } = require('../helpers');

describe('File System Modules', function () {
  this.timeout(10000);

  describe('file-utils', function () {
    let mod;
    before(function () {
      mod = require(path.join(NATIVE_ROOT, 'file-utils'));
    });

    it('should return not-support error on Linux', function () {
      expect(mod).to.be.an('object');
      expect(mod.error).to.equal('not support');
      expect(mod.platform).to.equal('linux');
    });

    it('should have no callable methods', function () {
      const keys = Object.keys(mod);
      expect(keys).to.include('error', 'platform');
      const methods = keys.filter(k => typeof mod[k] === 'function');
      expect(methods).to.have.length(0);
    });
  });

  describe('file-utilities', function () {
    let mod;
    before(function () {
      mod = require(path.join(NATIVE_ROOT, 'file-utilities'));
    });

    it('should export sync and async variants', function () {
      expect(mod.getDirectorySizeSync).to.be.a('function');
      expect(mod.getDirectorySizeAsync).to.be.a('function');
      expect(mod.detectHardlinksSync).to.be.a('function');
      expect(mod.detectHardlinksAsync).to.be.a('function');
      expect(mod.detectFilesystemSync).to.be.a('function');
      expect(mod.detectFilesystemAsync).to.be.a('function');
      expect(mod.getDirectorySizeByGlobSync).to.be.a('function');
      expect(mod.getDirectorySizeByGlobAsync).to.be.a('function');
    });

    it('sync methods should return error objects', function () {
      const result = mod.getDirectorySizeSync('/tmp');
      expect(result).to.be.an('object');
      expect(result.error).to.equal('not support');
    });

    it('async methods should reject', async function () {
      try {
        await mod.getDirectorySizeAsync('/tmp');
        throw new Error('should have rejected');
      } catch (e) {
        expect(e.message).to.include('not supported');
      }
    });
  });

  describe('zfile', function () {
    let mod;
    before(function () {
      mod = require(path.join(NATIVE_ROOT, 'zfile'));
    });

    it('should return stub on Linux', function () {
      expect(mod).to.be.an('object');
      expect(mod.stat).to.be.a('function');
      expect(mod.diskInfo).to.be.a('function');
      expect(mod.statFolder).to.be.a('function');
    });

    it('stat() should return undefined on Linux', async function () {
      const result = await mod.stat('/tmp', false);
      expect(result).to.be.undefined;
    });

    it('diskInfo() should return undefined on Linux', async function () {
      const result = await mod.diskInfo();
      expect(result).to.be.undefined;
    });
  });
});
