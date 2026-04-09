const path = require('path');
const fs = require('fs');

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const BUILD_DIR = path.join(PROJECT_ROOT, 'build');
const APP_EXTRACTED = path.join(BUILD_DIR, 'app-extracted');
const NATIVE_ROOT = path.join(APP_EXTRACTED, 'native', 'nativelibs');
const PACKAGING_DIR = path.join(PROJECT_ROOT, 'packaging');
const SCRIPTS_DIR = path.join(PROJECT_ROOT, 'scripts');
const DIST_DIR = path.join(BUILD_DIR, 'dist');

const NATIVE_MODULES = [
  'logger', 'sqlite3', 'db-cross-v4', 'file-utils',
  'file-utilities', 'zjxl', 'zwalker', 'zfile',
  'mp4thumb', 'zimage', 'v8-profiles', 'zcall'
];

function resolveNativeModule(name) {
  return path.join(NATIVE_ROOT, name, 'index.js');
}

function nativeModuleExists(name) {
  const indexPath = resolveNativeModule(name);
  return fs.existsSync(indexPath);
}

function getPackagingPath(file) {
  return path.join(PACKAGING_DIR, file);
}

function getScriptPath(file) {
  return path.join(SCRIPTS_DIR, file);
}

module.exports = {
  PROJECT_ROOT,
  BUILD_DIR,
  APP_EXTRACTED,
  NATIVE_ROOT,
  PACKAGING_DIR,
  SCRIPTS_DIR,
  DIST_DIR,
  NATIVE_MODULES,
  resolveNativeModule,
  nativeModuleExists,
  getPackagingPath,
  getScriptPath
};
