const { expect } = require('chai');

exports.mochaGlobalSetup = function () {
};

exports.mochaGlobalTeardown = function () {
};

global.expect = expect;
