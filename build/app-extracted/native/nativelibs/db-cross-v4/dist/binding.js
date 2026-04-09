"use strict";
let addon;
if (process.platform === 'darwin') {
    addon = require(`../prebuilt/darwin/electron/${process.arch}/db-cross-v4-native.node`);
}
else if (process.platform === 'linux') {
    try {
        addon = require(`../prebuilt/linux/electron/${process.arch}/db-cross-v4-native.node`);
    } catch (e) {
        console.warn('db-cross-v4: Linux native binary not found, falling back to prebuilt darwin. Error:', e.message);
        addon = require(`../prebuilt/darwin/electron/x64/db-cross-v4-native.node`);
    }
}
else {
    if (process.arch === 'x64') {
        addon = require('../prebuilt/window/electron_x86_64/db-cross-v4-native.node');
    }
    else {
        addon = require('../prebuilt/window/electron_x86/db-cross-v4-native.node');
    }
}
module.exports = addon;
