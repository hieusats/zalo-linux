const { expect } = require('chai');
const path = require('path');
const os = require('os');

const DBCROSS_INDEX = path.resolve(__dirname, '../../build/app-extracted/native/nativelibs/db-cross-v4/dist/binding.js');

describe('db-cross-v4 Encrypted Database', function () {
  this.timeout(15000);

  let dbUtils;

  before(function () {
    try {
      dbUtils = require(DBCROSS_INDEX);
    } catch (e) {
      console.log('db-cross-v4 not loadable:', e.message);
      this.skip();
    }
  });

  it('should export getVersion function', function () {
    expect(dbUtils).to.be.an('object');
    expect(dbUtils.getVersion).to.be.a('function');
  });

  it('should return a version string', function () {
    const version = dbUtils.getVersion();
    expect(version).to.be.a('string');
    expect(version.length).to.be.at.least(1);
  });

  it('should export parseBinNet function', function () {
    expect(dbUtils.parseBinNet).to.be.a('function');
  });

  it('should parse binary buffer with parseBinNet', function () {
    const buf = Buffer.alloc(8);
    buf.writeUInt32LE(42, 0);
    buf.writeUInt32LE(100, 4);

    const result = dbUtils.parseBinNet(buf);
    expect(result).to.be.an('object');
    expect(result.cliMsgId).to.equal(42);
    expect(result.length).to.equal(8);
  });

  it('should return null for parseBinNet with too-small buffer', function () {
    const buf = Buffer.alloc(2);
    const result = dbUtils.parseBinNet(buf);
    expect(result).to.be.null;
  });

  it('should return null for parseBinNet with non-buffer argument', function () {
    const result = dbUtils.parseBinNet('not a buffer');
    expect(result).to.be.null;
  });

  it('should export decompressAndDecryptDb function', function () {
    expect(dbUtils.decompressAndDecryptDb).to.be.a('function');
  });

  it('should export decompressAndDecryptDb_V2 function', function () {
    expect(dbUtils.decompressAndDecryptDb_V2).to.be.a('function');
  });

  it('should return false for decompressAndDecryptDb with nonexistent file', function () {
    const fakeInput = path.join(os.tmpdir(), `nonexistent-${Date.now()}.db.enc`);
    const fakeOutput = path.join(os.tmpdir(), `output-${Date.now()}.db`);
    const result = dbUtils.decompressAndDecryptDb(fakeInput, fakeOutput, 'test-key');
    expect(result).to.be.false;
  });
});
