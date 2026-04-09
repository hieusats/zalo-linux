const { expect } = require('chai');
const path = require('path');
const { NATIVE_ROOT } = require('../helpers');

const ZWALKER_INDEX = path.join(NATIVE_ROOT, 'zwalker');

describe('zwalker File Scanner', function () {
  this.timeout(10000);

  let zwalker;

  before(function () {
    try {
      zwalker = require(ZWALKER_INDEX);
    } catch (e) {
      console.log('zwalker not loadable:', e.message);
      this.skip();
    }
  });

  it('should export scanDirectory', function () {
    expect(zwalker.scanDirectory).to.be.a('function');
  });

  it('should export updateReferenceMessageId', function () {
    expect(zwalker.updateReferenceMessageId).to.be.a('function');
  });

  it('should export deleteHomelessFiles', function () {
    expect(zwalker.deleteHomelessFiles).to.be.a('function');
  });

  it('should export statUnmarkedFiles', function () {
    expect(zwalker.statUnmarkedFiles).to.be.a('function');
  });

  it('should export deleteEmptyFolders', function () {
    expect(zwalker.deleteEmptyFolders).to.be.a('function');
  });
});
