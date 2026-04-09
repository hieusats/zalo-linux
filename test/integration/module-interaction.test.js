const { expect } = require('chai');
const path = require('path');
const { NATIVE_ROOT } = require('../helpers');

describe('Module Interaction (nativelibs index)', function () {
  this.timeout(10000);

  let nativeLibs;

  before(function () {
    nativeLibs = require(path.join(NATIVE_ROOT, 'index.js'));
  });

  describe('Lazy loaders', function () {
    it('fileUtils() returns platform stub', function () {
      const fu = nativeLibs.fileUtils();
      expect(fu).to.be.an('object');
      expect(fu.error).to.equal('not support');
      expect(fu.platform).to.equal('linux');
    });

    it('sqlite3() returns working binding', function () {
      const sqlite3 = nativeLibs.sqlite3();
      expect(sqlite3).to.be.an('object');
      expect(sqlite3.Database).to.be.a('function');
      expect(sqlite3.cached).to.be.an('object');
    });

    it('dbUtils() returns working binding', function () {
      const dbUtils = nativeLibs.dbUtils();
      expect(dbUtils).to.be.an('object');
      expect(dbUtils.getVersion).to.be.a('function');
      expect(dbUtils.parseBinNet).to.be.a('function');
    });

    it('zcall() returns stub with methods', function () {
      const zc = nativeLibs.zcall();
      expect(zc).to.be.an('object');
      expect(zc.makeCall).to.be.a('function');
      expect(zc.incomingCall).to.be.a('function');
      expect(zc.stop).to.be.a('function');
    });

    it('mp4thumb() returns stub', function () {
      const mp4 = nativeLibs.mp4thumb();
      expect(mp4).to.be.an('object');
      expect(mp4.generateThumbnail).to.be.a('function');
    });

    it('v8Profiles() returns stub', function () {
      const v8 = nativeLibs.v8Profiles();
      expect(v8).to.be.an('object');
      expect(v8.startProfiling).to.be.a('function');
      expect(v8.profiles).to.be.an('array');
    });

    it('zjxl() returns error stub', function () {
      const zjxl = nativeLibs.zjxl();
      expect(zjxl).to.be.an('object');
      expect(zjxl.error).to.equal('not support');
    });

    it('fileUtilities() returns stub', function () {
      const ful = nativeLibs.fileUtilities();
      expect(ful).to.be.an('object');
      expect(ful.getDirectorySizeSync).to.be.a('function');
    });
  });

  describe('Cross-module interaction', function () {
    it('sqlite3 and dbUtils should be independent', function () {
      const sqlite3 = nativeLibs.sqlite3();
      const dbUtils = nativeLibs.dbUtils();
      expect(sqlite3.Database).to.not.equal(dbUtils.getVersion);
    });

    it('multiple calls return consistent results', function () {
      const fu1 = nativeLibs.fileUtils();
      const fu2 = nativeLibs.fileUtils();
      expect(fu1.error).to.equal(fu2.error);
      expect(fu1.platform).to.equal(fu2.platform);
    });
  });
});
