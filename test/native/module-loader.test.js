const { expect } = require('chai');
const path = require('path');

const NATIVE_INDEX = path.resolve(__dirname, '../../build/app-extracted/native/nativelibs/index.js');

describe('Native Module Loader', function () {
  this.timeout(10000);

  let nativeLibs;

  before(function () {
    nativeLibs = require(NATIVE_INDEX);
  });

  it('should load the central nativelibs index', function () {
    expect(nativeLibs).to.be.an('object');
  });

  it('should have expected lazy loader entries', function () {
    expect(nativeLibs.fileUtils).to.be.a('function');
    expect(nativeLibs.sqlite3).to.be.a('function');
    expect(nativeLibs.dbUtils).to.be.a('function');
    expect(nativeLibs.zcall).to.be.a('function');
    expect(nativeLibs.zimage).to.be.a('function');
    expect(nativeLibs.mp4thumb).to.be.a('function');
    expect(nativeLibs.zjxl).to.be.a('function');
    expect(nativeLibs.zwalker).to.be.a('function');
    expect(nativeLibs.v8Profiles).to.be.a('function');
    expect(nativeLibs.fileUtilities).to.be.a('function');
  });

  it('sqlite3() should return a working native binding', function () {
    const sqlite3 = nativeLibs.sqlite3();
    expect(sqlite3).to.be.an('object');
    expect(sqlite3.Database).to.be.a('function');
  });

  it('dbUtils() should return a working native binding', function () {
    const dbCross = nativeLibs.dbUtils();
    expect(dbCross).to.be.an('object');
    expect(dbCross.getVersion).to.be.a('function');
    const version = dbCross.getVersion();
    expect(version).to.be.a('string');
  });

  it('fileUtils() should return error stub on Linux', function () {
    const fu = nativeLibs.fileUtils();
    expect(fu).to.be.an('object');
    expect(fu.error).to.equal('not support');
    expect(fu.platform).to.equal('linux');
  });

  it('zcall() should return Linux stub', function () {
    const zc = nativeLibs.zcall();
    expect(zc).to.be.an('object');
    expect(zc.incomingCall).to.be.a('function');
    expect(zc.makeCall).to.be.a('function');
  });

  it('mp4thumb() should return Linux stub', function () {
    const mp4 = nativeLibs.mp4thumb();
    expect(mp4).to.be.an('object');
    expect(mp4.generateThumbnail).to.be.a('function');
  });

  it('v8Profiles() should return stub on Linux', function () {
    const v8 = nativeLibs.v8Profiles();
    expect(v8).to.be.an('object');
    expect(v8.startProfiling).to.be.a('function');
  });

  it('zjxl() should return error stub on Linux', function () {
    const zjxl = nativeLibs.zjxl();
    expect(zjxl).to.be.an('object');
    expect(zjxl.error).to.equal('not support');
  });

  it('fileUtilities() should return Linux stub', function () {
    const ful = nativeLibs.fileUtilities();
    expect(ful).to.be.an('object');
    expect(ful.getDirectorySizeSync).to.be.a('function');
  });
});
