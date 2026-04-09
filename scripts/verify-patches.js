#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const SOURCE_DIR = process.argv[2] || path.join(__dirname, '..', 'build', 'app-extracted');

const CRITICAL = [
  { pattern: /\b\w+\.dock\.\w+\(/g, file: 'main-dist/main.js', desc: 'Direct app.dock calls' },
  { pattern: /~\/Library\/LaunchAgents/g, file: 'main-dist/main.js', desc: 'LaunchAgent paths' },
  { pattern: /"osascript"/g, file: 'main-dist/main.js', desc: 'AppleScript string literals' },
  { pattern: /\.app\/Contents\/MacOS\//g, file: 'main-dist/main.js', desc: '.app bundle paths' },
];

function main() {
  console.log(`Verifying patches in ${SOURCE_DIR}\n`);
  let issues = 0;

  for (const check of CRITICAL) {
    const fp = path.join(SOURCE_DIR, check.file);
    if (!fs.existsSync(fp)) continue;
    const content = fs.readFileSync(fp, 'utf-8');
    const matches = content.match(check.pattern);
    const icon = matches ? '[FAIL]' : '[PASS]';
    console.log(`  ${icon} ${check.desc}: ${matches ? matches.length + ' match(es)' : 'clean'}`);
    if (matches) issues++;
  }

  console.log(`\nCritical issues: ${issues}`);
  process.exit(issues > 0 ? 1 : 0);
}

main();
