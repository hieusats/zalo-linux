const { expect } = require('chai');
const path = require('path');

const BASE = path.resolve(__dirname, '../../build/app-extracted/native/nativelibs');

describe('Stub Modules - Graceful Degradation', function () {
  this.timeout(5000);

  describe('file-utils', function () {
    let mod;
    before(function () {
      mod = require(path.resolve(BASE, 'file-utils'));
    });

    it('should return error object on Linux', function () {
      expect(mod).to.be.an('object');
      expect(mod.error).to.equal('not support');
      expect(mod.platform).to.equal('linux');
    });
  });

  describe('file-utilities', function () {
    let mod;
    before(function () {
      mod = require(path.resolve(BASE, 'file-utilities'));
    });

    it('should export all expected functions', function () {
      expect(mod.getDirectorySizeSync).to.be.a('function');
      expect(mod.getDirectorySizeAsync).to.be.a('function');
      expect(mod.detectHardlinksSync).to.be.a('function');
      expect(mod.detectHardlinksAsync).to.be.a('function');
      expect(mod.detectFilesystemSync).to.be.a('function');
      expect(mod.detectFilesystemAsync).to.be.a('function');
      expect(mod.getDirectorySizeByGlobSync).to.be.a('function');
      expect(mod.getDirectorySizeByGlobAsync).to.be.a('function');
    });

    it('sync methods should return error object', function () {
      const result = mod.getDirectorySizeSync('/tmp');
      expect(result).to.be.an('object');
      expect(result.error).to.equal('not support');
      expect(result.platform).to.equal('linux');
    });

    it('async methods should reject with error', async function () {
      try {
        await mod.getDirectorySizeAsync('/tmp');
        throw new Error('Should have rejected');
      } catch (e) {
        expect(e.message).to.include('not supported on Linux');
      }
    });
  });

  describe('mp4thumb', function () {
    let mod;
    before(function () {
      mod = require(path.resolve(BASE, 'mp4thumb'));
    });

    it('should export generateThumbnail and cancel', function () {
      expect(mod.generateThumbnail).to.be.a('function');
      expect(mod.cancel).to.be.a('function');
    });

    it('generateThumbnail should reject on Linux', async function () {
      try {
        await mod.generateThumbnail('/fake/input.mp4', '/fake/output.jpg', 100, 100);
        throw new Error('Should have thrown');
      } catch (e) {
        expect(e.error).to.equal('LIB_ERR');
      }
    });
  });

  describe('zcall', function () {
    let mod;
    before(function () {
      mod = require(path.resolve(BASE, 'zcall'));
    });

    it('should export all VoIP methods', function () {
      expect(mod.bindCanvas).to.be.a('function');
      expect(mod.stop).to.be.a('function');
      expect(mod.incomingCall).to.be.a('function');
      expect(mod.makeCall).to.be.a('function');
      expect(mod.getListDevices).to.be.a('function');
    });

    it('makeCall should reject on Linux', async function () {
      try {
        await mod.makeCall({});
        throw new Error('Should have rejected');
      } catch (e) {
        expect(e.message).to.include('VoIP not supported on Linux');
      }
    });

    it('getActiveAudioCodecs should return empty array', function () {
      expect(mod.getActiveAudioCodecs()).to.deep.equal([]);
    });

    it('getCallInfo should return null', function () {
      expect(mod.getCallInfo()).to.be.null;
    });

    it('getJsonStats406 should return empty object', function () {
      expect(mod.getJsonStats406()).to.deep.equal({});
    });
  });

  describe('v8-profiles', function () {
    let mod;
    before(function () {
      mod = require(path.resolve(BASE, 'v8-profiles'));
    });

    it('should export profiler methods', function () {
      expect(mod.startProfiling).to.be.a('function');
      expect(mod.stopProfiling).to.be.a('function');
      expect(mod.setSamplingInterval).to.be.a('function');
      expect(mod.deleteAllProfiles).to.be.a('function');
    });

    it('stopProfiling should return null on Linux', function () {
      expect(mod.stopProfiling('test')).to.be.null;
    });

    it('profiles should be an empty array', function () {
      expect(mod.profiles).to.be.an('array');
      expect(mod.profiles).to.have.length(0);
    });
  });

  describe('zjxl', function () {
    it('should return error object on Linux', function () {
      const mod = require(path.resolve(BASE, 'zjxl'));
      expect(mod).to.be.an('object');
      expect(mod.error).to.equal('not support');
    });
  });
});
