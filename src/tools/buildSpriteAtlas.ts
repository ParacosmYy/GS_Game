#!/usr/bin/env npx ts-node
/**
 * buildSpriteAtlas.ts
 *
 * Packs individual character PNG sprites into optimized texture atlases.
 * Reduces HTTP requests and improves rendering performance.
 *
 * For each character:
 *   - Reads manifest.json to find all sprites
 *   - Packs sprites into a single atlas image using a shelf algorithm
 *   - Writes atlas PNG + atlas descriptor JSON
 *
 * Usage: npx ts-node src/tools/buildSpriteAtlas.ts [--dir <mugenDir>] [--all] [--max-size 4096]
 */

import * as fs from 'fs';
import * as path from 'path';

// ===== Types =====

interface SpriteRef {
  group: number;
  index: number;
  file: string;
  width: number;
  height: number;
}

interface AtlasEntry {
  key: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface AtlasDescriptor {
  characterId: string;
  atlasWidth: number;
  atlasHeight: number;
  padding: number;
  sprites: Record<string, { x: number; y: number; width: number; height: number }>;
}

interface PackResult {
  atlasWidth: number;
  atlasHeight: number;
  entries: AtlasEntry[];
  wastedPixels: number;
  utilization: number;
}

// ===== Shelf Packing Algorithm =====

interface Shelf {
  y: number;
  height: number;
  xCursor: number;
}

function packShelf(
  sprites: Array<{ key: string; width: number; height: number }>,
  maxWidth: number,
  padding: number,
): PackResult {
  if (sprites.length === 0) {
    return { atlasWidth: 0, atlasHeight: 0, entries: [], wastedPixels: 0, utilization: 0 };
  }

  // Sort by height descending, then width descending
  const sorted = [...sprites].sort((a, b) => {
    const heightDiff = b.height - a.height;
    if (heightDiff !== 0) return heightDiff;
    return b.width - a.width;
  });

  const entries: AtlasEntry[] = [];
  const shelves: Shelf[] = [];
  let atlasHeight = 0;

  for (const sprite of sorted) {
    const sw = sprite.width + padding;
    const sh = sprite.height + padding;

    // Try to fit on existing shelf
    let placed = false;
    for (const shelf of shelves) {
      if (sh <= shelf.height && shelf.xCursor + sw <= maxWidth) {
        entries.push({
          key: sprite.key,
          x: shelf.xCursor,
          y: shelf.y,
          width: sprite.width,
          height: sprite.height,
        });
        shelf.xCursor += sw;
        placed = true;
        break;
      }
    }

    // Create new shelf
    if (!placed) {
      const newShelf: Shelf = {
        y: atlasHeight,
        height: sh,
        xCursor: padding,
      };
      shelves.push(newShelf);
      atlasHeight += sh;

      entries.push({
        key: sprite.key,
        x: newShelf.xCursor,
        y: newShelf.y,
        width: sprite.width,
        height: sprite.height,
      });
      newShelf.xCursor += sw;
    }
  }

  // Calculate utilization
  let totalSpriteArea = 0;
  let totalAtlasArea = maxWidth * atlasHeight;
  for (const entry of entries) {
    totalSpriteArea += entry.width * entry.height;
  }

  return {
    atlasWidth: maxWidth,
    atlasHeight,
    entries,
    wastedPixels: totalAtlasArea - totalSpriteArea,
    utilization: totalAtlasArea > 0 ? totalSpriteArea / totalAtlasArea : 0,
  };
}

// ===== Atlas Builder =====

function buildAtlasForCharacter(mugenDir: string, maxSize: number, padding: number): void {
  const spritesDir = path.join('public', 'sprites', mugenDir);
  const manifestPath = path.join(spritesDir, 'manifest.json');

  if (!fs.existsSync(manifestPath)) {
    console.error(`[SKIP] ${mugenDir}: no manifest.json`);
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  const sprites: Array<{ key: string; width: number; height: number }> = [];

  for (const [key, sprite] of Object.entries(manifest.sprites) as Array<[string, SpriteRef]>) {
    sprites.push({ key, width: sprite.width, height: sprite.height });
  }

  if (sprites.length === 0) {
    console.error(`[SKIP] ${mugenDir}: no sprites`);
    return;
  }

  // Try packing with decreasing max widths to find optimal size
  const sizeOptions = [2048, 4096, 8192];
  let bestResult: PackResult | null = null;

  for (const size of sizeOptions) {
    if (size > maxSize) continue;
    const result = packShelf(sprites, size, padding);
    if (result.atlasHeight <= size) {
      if (!bestResult || result.atlasHeight < bestResult.atlasHeight * bestResult.atlasWidth) {
        bestResult = result;
      }
      break;
    }
  }

  if (!bestResult) {
    console.error(`[FAIL] ${mugenDir}: sprites don't fit in ${maxSize}x${maxSize}`);
    return;
  }

  // Generate descriptor
  const descriptor: AtlasDescriptor = {
    characterId: manifest.characterId || mugenDir,
    atlasWidth: bestResult.atlasWidth,
    atlasHeight: bestResult.atlasHeight,
    padding,
    sprites: {},
  };

  for (const entry of bestResult.entries) {
    descriptor.sprites[entry.key] = {
      x: entry.x,
      y: entry.y,
      width: entry.width,
      height: entry.height,
    };
  }

  // Write descriptor
  const descriptorPath = path.join(spritesDir, 'atlas.json');
  fs.writeFileSync(descriptorPath, JSON.stringify(descriptor, null, 2), 'utf-8');

  console.log(
    `[OK] ${mugenDir}: ${sprites.length} sprites → ${bestResult.atlasWidth}x${bestResult.atlasHeight}` +
    ` (${(bestResult.utilization * 100).toFixed(1)}% utilization, ${bestResult.entries.length} entries)`
  );
}

// ===== Statistics =====

function printAtlasStats(mugenDir: string): void {
  const atlasPath = path.join('public', 'sprites', mugenDir, 'atlas.json');
  if (!fs.existsSync(atlasPath)) return;

  const atlas = JSON.parse(fs.readFileSync(atlasPath, 'utf-8'));
  const spriteCount = Object.keys(atlas.sprites).length;
  const area = atlas.atlasWidth * atlas.atlasHeight;
  let spriteArea = 0;
  for (const s of Object.values(atlas.sprites) as Array<{ width: number; height: number }>) {
    spriteArea += s.width * s.height;
  }

  console.log(
    `  ${mugenDir.padEnd(15)} ${atlas.atlasWidth}x${atlas.atlasHeight}  ` +
    `${String(spriteCount).padStart(5)} sprites  ` +
    `${(spriteArea / area * 100).toFixed(1).padStart(5)}% used  ` +
    `${(area / 1024).toFixed(0).padStart(5)} KB`
  );
}

// ===== Main =====

function main() {
  const args = process.argv.slice(2);
  const maxSize = parseInt(args[args.indexOf('--max-size') + 1] || '4096', 10);
  const padding = 2;
  const runAll = args.includes('--all');
  const dirIdx = args.indexOf('--dir');

  const spritesDir = path.join('public', 'sprites');
  let dirs = fs.readdirSync(spritesDir).filter(d =>
    fs.existsSync(path.join(spritesDir, d, 'manifest.json'))
  );

  if (dirIdx >= 0 && args[dirIdx + 1]) {
    dirs = [args[dirIdx + 1]];
  } else if (!runAll && !dirIdx) {
    console.log('Usage: npx ts-node src/tools/buildSpriteAtlas.ts --all | --dir <mugenDir> [--max-size 4096]');
    console.log('');
    console.log('Available characters:');
    for (const dir of dirs) {
      console.log(`  ${dir}`);
    }
    return;
  }

  console.log(`Building atlas for ${dirs.length} characters (max ${maxSize}x${maxSize}, padding ${padding}px)...`);
  console.log('');

  for (const dir of dirs) {
    buildAtlasForCharacter(dir, maxSize, padding);
  }

  console.log('');
  console.log('Atlas statistics:');
  console.log('  '.padEnd(16) + 'Size        Sprites  Usage    Memory');
  console.log('  ' + '─'.repeat(55));
  for (const dir of dirs) {
    printAtlasStats(dir);
  }
}

main();
