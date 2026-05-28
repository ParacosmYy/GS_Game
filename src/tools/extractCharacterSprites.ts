#!/usr/bin/env npx ts-node
/**
 * extractCharacterSprites.ts
 *
 * Extracts sprites from a MUGEN SFF file as proper PNGs with MUGEN-native naming.
 * Also parses the AIR file, builds manifest, and converts hitboxes.
 *
 * Usage: npx ts-node src/tools/extractCharacterSprites.ts <characterDir> <outputDir>
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { PNG } from 'pngjs';

// ===== Inline SFF Extraction =====
// We import the sff-extractor dynamically since it's ESM-only

function extractSff(sffPath: string, outDir: string, charName: string): number {
  // Use a subprocess because sff-extractor is ESM
  const script = `
const fs = require('fs');
const PNG = require('pngjs').PNG;
const extract = require('./index.mjs').default;

const buf = fs.readFileSync('${sffPath.replace(/\\/g, '/')}');
const data = extract(buf, { sprites: true, spriteBuffer: true, palettes: true, paletteBuffer: true, decodeSpriteBuffer: true });

let saved = 0;
const meta = {};
for (const sprite of data.sprites) {
  if (!sprite.decodedBuffer) continue;
  const w = sprite.width;
  const h = sprite.height;
  const fileName = String(sprite.group).padStart(5, '0') + '_' + String(sprite.number).padStart(4, '0') + '.png';
  const key = sprite.group + '_' + sprite.number;

  const png = new PNG({ width: w, height: h });
  const expectedLen = w * h * 4;
  if (sprite.decodedBuffer.length >= expectedLen) {
    sprite.decodedBuffer.copy(png.data, 0, 0, expectedLen);
  } else {
    sprite.decodedBuffer.copy(png.data, 0, 0, sprite.decodedBuffer.length);
  }

  const buffer = PNG.sync.write(png, { colorType: 6 });
  fs.writeFileSync('${outDir.replace(/\\/g, '/')}/' + fileName, buffer);
  meta[key] = { group: sprite.group, index: sprite.number, file: fileName, width: w, height: h };
  saved++;
}
fs.writeFileSync('${outDir.replace(/\\/g, '/')}/sprites.json', JSON.stringify({ characterId: '${charName}', totalSprites: saved, sprites: meta }, null, 2));
console.log(saved);
`;

  const sffExtractorDir = path.resolve('references/mugen/sff-extractor');
  const tmpScript = path.join(sffExtractorDir, '_extract_tmp.cjs');
  fs.writeFileSync(tmpScript, script);

  try {
    const output = execSync(`node _extract_tmp.cjs`, { cwd: sffExtractorDir, encoding: 'utf-8' });
    return parseInt(output.trim());
  } finally {
    fs.unlinkSync(tmpScript);
  }
}

function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: npx ts-node src/tools/extractCharacterSprites.ts <characterDir> <outputDir>');
    process.exit(1);
  }

  const [charDir, outDir] = args;
  const resolvedCharDir = path.resolve(charDir);
  const resolvedOutDir = path.resolve(outDir);

  if (!fs.existsSync(resolvedCharDir)) {
    console.error(`Character directory not found: ${resolvedCharDir}`);
    process.exit(1);
  }

  fs.mkdirSync(resolvedOutDir, { recursive: true });

  // Find SFF file (prefer non-_ex)
  const sffFiles = fs.readdirSync(resolvedCharDir)
    .filter(f => f.endsWith('.sff') && !f.includes('_ex'));
  if (sffFiles.length === 0) {
    console.error(`No .sff file found in ${resolvedCharDir}`);
    process.exit(1);
  }
  const sffFile = path.join(resolvedCharDir, sffFiles[0]);

  // Find AIR file
  const airFiles = fs.readdirSync(resolvedCharDir).filter(f => f.endsWith('.air'));
  const airFile = airFiles.length > 0 ? path.join(resolvedCharDir, airFiles[0]) : null;

  const charName = path.basename(resolvedCharDir);

  console.log(`Extracting: ${charName}`);
  console.log(`  SFF: ${sffFile}`);
  if (airFile) console.log(`  AIR: ${airFile}`);
  console.log(`  Output: ${resolvedOutDir}`);

  // Step 1: Extract sprites
  const spriteCount = extractSff(sffFile, resolvedOutDir, charName);
  console.log(`  Sprites: ${spriteCount}`);

  // Step 2: Parse AIR
  if (airFile) {
    const animOut = path.join(resolvedOutDir, 'animations.json');
    try {
      execSync(`npx ts-node src/tools/parseAir.ts "${airFile}" "${animOut}"`, { stdio: 'pipe' });
      console.log('  Animations: parsed');
    } catch {
      console.warn('  Animations: parse failed');
    }
  }

  // Step 3: Build manifest
  const animJson = path.join(resolvedOutDir, 'animations.json');
  if (fs.existsSync(animJson)) {
    const manifestOut = path.join(resolvedOutDir, 'manifest.json');
    try {
      execSync(`npx ts-node src/tools/buildSpriteManifest.ts "${resolvedOutDir}" "${animJson}" "${manifestOut}"`, { stdio: 'pipe' });
      console.log('  Manifest: built');
    } catch {
      console.warn('  Manifest: build failed');
    }
  }

  // Step 4: Convert hitboxes
  if (fs.existsSync(animJson)) {
    const hitboxOut = path.join(resolvedOutDir, 'hitboxes.json');
    try {
      const result = execSync(`npx ts-node src/tools/convertAirHitboxes.ts "${animJson}" "${hitboxOut}"`, { encoding: 'utf-8' });
      const match = result.match(/Converted (\d+) attack actions/);
      console.log(`  Hitboxes: ${match ? match[1] : '?'} attack actions`);
    } catch {
      console.warn('  Hitboxes: conversion failed');
    }
  }

  console.log(`Done! ${spriteCount} sprites extracted to ${resolvedOutDir}`);
}

main();
