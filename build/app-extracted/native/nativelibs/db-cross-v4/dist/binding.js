"use strict";
// @ts-ignore
let addon;
if (process.platform === 'darwin') {
    addon = require(`../prebuilt/darwin/electron/${process.arch}/db-cross-v4-native.node`);
} else if (process.platform === 'linux') {
    // Linux stub: db-cross-v4 native not available, provide minimal shim
    addon = {
        open: () => { throw new Error('db-cross-v4 native not available on Linux'); },
        close: () => {},
        query: () => { throw new Error('db-cross-v4 native not available on Linux'); },
    };
} else {
    if (process.arch === 'x64') {
        addon = require('../prebuilt/window/electron_x86_64/db-cross-v4-native.node');
    } else {
        addon = require('../prebuilt/window/electron_x86/db-cross-v4-native.node');
    }
}
module.exports = addon;
