const { expect } = require('chai');
const path = require('path');
const os = require('os');

const DBCROSS_INDEX = path.resolve(__dirname, '../../build/app-extracted/native/nativelibs/db-cross-v4/dist/binding.js');

describe('db-cross-v4 Integration Operations', function () {
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

  describe('getVersion', function () {
    it('should return a non-empty version string', function () {
      const version = dbUtils.getVersion();
      expect(version).to.be.a('string');
      expect(version.length).to.be.at.least(1);
    });
  });

  describe('parseBinNet', function () {
    it('should parse a buffer with header', function () {
      const buf = Buffer.alloc(12);
      buf.writeUInt32LE(42, 0);
      buf.writeUInt32LE(100, 4);
      buf.writeUInt32LE(200, 8);

      const result = dbUtils.parseBinNet(buf);
      expect(result).to.be.an('object');
      expect(result.cliMsgId).to.equal(42);
      expect(result.length).to.be.at.least(8);
    });

    it('should return null for zero-length buffer', function () {
      const result = dbUtils.parseBinNet(Buffer.alloc(0));
      expect(result).to.be.null;
    });

    it('should handle large buffer', function () {
      const buf = Buffer.alloc(1024);
      buf.writeUInt32LE(9999, 0);
      const result = dbUtils.parseBinNet(buf);
      expect(result).to.be.an('object');
      expect(result.cliMsgId).to.equal(9999);
    });
  });

  describe('decompressAndDecryptDb', function () {
    it('should return false for nonexistent input file', function () {
      const fakeInput = path.join(os.tmpdir(), `nonexistent-${Date.now()}.enc`);
      const fakeOutput = path.join(os.tmpdir(), `output-${Date.now()}.db`);
      const result = dbUtils.decompressAndDecryptDb(fakeInput, fakeOutput, 'test-key');
      expect(result).to.be.false;
    });

    it('should return false for empty key', function () {
      const fakeInput = path.join(os.tmpdir(), `nonexistent-${Date.now()}.enc`);
      const fakeOutput = path.join(os.tmpdir(), `output-${Date.now()}.db`);
      const result = dbUtils.decompressAndDecryptDb(fakeInput, fakeOutput, '');
      expect(result).to.be.false;
    });
  });

  describe('decompressAndDecryptDb_V2', function () {
    it('should be a function', function () {
      expect(dbUtils.decompressAndDecryptDb_V2).to.be.a('function');
    });

    it('should return false for nonexistent input file', function () {
      const fakeInput = path.join(os.tmpdir(), `nonexistent-v2-${Date.now()}.enc`);
      const fakeOutput = path.join(os.tmpdir(), `output-v2-${Date.now()}.db`);
      const result = dbUtils.decompressAndDecryptDb_V2(fakeInput, fakeOutput, 'test-key');
      expect(result).to.be.false;
    });
  });
});
