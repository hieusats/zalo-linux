const { expect } = require('chai');
const path = require('path');
const { NATIVE_ROOT } = require('../helpers');

const ZIMAGE_INDEX = path.join(NATIVE_ROOT, 'zimage');

describe('zimage Thumbnail Generator', function () {
  this.timeout(10000);

  it('should export a factory function', function () {
    const getLib = require(ZIMAGE_INDEX);
    expect(getLib).to.be.a('function');
  });

  it('should reject on Linux (no native binary)', async function () {
    const getLib = require(ZIMAGE_INDEX);
    try {
      await getLib();
      this.skip();
    } catch (e) {
      expect(e).to.be.an('object');
      expect(e.error).to.be.a('number');
    }
  });

  it('should pass options through', async function () {
    const getLib = require(ZIMAGE_INDEX);
    try {
      await getLib({ decompress: null, rimraf: null });
      this.skip();
    } catch (e) {
      expect(e).to.be.an('object');
    }
  });
});
