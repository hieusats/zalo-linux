#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const SOURCE_DIR = process.argv[2] || path.join(__dirname, '..', 'build', 'app-extracted');
const PATCH_FILE = process.argv[3] || path.join(__dirname, '..', 'patches', 'linux.json');

function loadPatches(patchFile) {
  const raw = JSON.parse(fs.readFileSync(patchFile, 'utf-8'));
  return raw.patches.filter(p => p.enabled !== false);
}

function applyPatch(filePath, patch) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const regex = new RegExp(patch.search, patch.flags || 'g');
  const matches = content.match(regex);
  if (!matches) {
    console.warn(`  [SKIP] ${patch.id}: no match`);
    return false;
  }
  const newContent = content.replace(regex, patch.replace);
  if (newContent === content) {
    console.warn(`  [NO-CHANGE] ${patch.id}`);
    return false;
  }
  fs.writeFileSync(filePath, newContent, 'utf-8');
  console.log(`  [OK] ${patch.id}: ${matches.length} replacement(s)`);
  return true;
}

function main() {
  console.log(`Loading patches from ${PATCH_FILE}`);
  const patches = loadPatches(PATCH_FILE);
  console.log(`Found ${patches.length} enabled patches\n`);

  let applied = 0;
  let skipped = 0;

  for (const patch of patches) {
    const targetPath = path.join(SOURCE_DIR, patch.file);
    if (!fs.existsSync(targetPath)) {
      console.warn(`  [MISS] ${patch.id}: ${patch.file} not found`);
      skipped++;
      continue;
    }
    const result = applyPatch(targetPath, patch);
    if (result) applied++;
    else skipped++;
  }

  console.log(`\nDone: ${applied} applied, ${skipped} skipped`);
  process.exit(skipped > 0 && applied === 0 ? 1 : 0);
}

main();
