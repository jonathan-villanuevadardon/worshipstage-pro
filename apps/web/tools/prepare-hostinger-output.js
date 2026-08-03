#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const outputDir = path.resolve(process.cwd(), '../../dist');
const compatibilityDir = path.join(outputDir, 'apps', 'web');
const requiredFiles = ['index.html', '.htaccess'];
const optionalFiles = ['llms.txt', 'worshipstage-icon.png'];

for (const fileName of requiredFiles) {
  const sourcePath = path.join(outputDir, fileName);
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Missing required build file: ${sourcePath}`);
  }
}

fs.mkdirSync(compatibilityDir, { recursive: true });

for (const fileName of [...requiredFiles, ...optionalFiles]) {
  const sourcePath = path.join(outputDir, fileName);
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, path.join(compatibilityDir, fileName));
  }
}

const assetsDir = path.join(outputDir, 'assets');
if (fs.existsSync(assetsDir)) {
  fs.cpSync(assetsDir, path.join(compatibilityDir, 'assets'), { recursive: true });
}

console.log('Hostinger output prepared: dist and dist/apps/web');
