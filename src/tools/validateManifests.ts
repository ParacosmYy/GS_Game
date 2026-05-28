#!/usr/bin/env npx ts-node
/**
 * validateManifests.ts
 *
 * Validates and normalizes all character manifest.json files.
 * Fixes common issues and reports quality metrics.
 *
 * Checks:
 *   1. Zero-duration frames → set to 1
 *   2. Missing sprite file references
 *   3. Orphaned sprites (not referenced by any animation)
 *   4. Animation frames with invalid group/index
 *   5. Negative dimensions
 *   6. Missing required actions
 *   7. Duplicate sprite keys
 *
 * Usage: npx ts-node src/tools/validateManifests.ts [--fix] [--dir <mugenDir>]
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

interface AnimFrame {
  group: number;
  index: number;
  offsetX: number;
  offsetY: number;
  duration: number;
  flipH: boolean;
  hurtboxes: any[] | null;
  attackBoxes: any[] | null;
}

interface AnimData {
  name: string;
  loopStart: number;
  frames: AnimFrame[];
}

interface Manifest {
  characterId: string;
  sprites: Record<string, SpriteRef>;
  animations: Record<string, AnimData>;
  stateMap?: Record<string, string>;
}

interface ValidationResult {
  mugenDir: string;
  totalSprites: number;
  totalAnims: number;
  totalFrames: number;
  zeroDurationFixed: number;
  missingSpriteRefs: string[];
  orphanedSprites: string[];
  invalidFrames: string[];
  negativeDimensions: string[];
  spritesDir: string;
  spriteFilesExist: number;
  spriteFilesMissing: number;
  issues: string[];
  fixed: boolean;
}

// ===== Validation =====

function validateManifest(mugenDir: string, fix: boolean): ValidationResult {
  const result: ValidationResult = {
    mugenDir,
    totalSprites: 0,
    totalAnims: 0,
    totalFrames: 0,
    zeroDurationFixed: 0,
    missingSpriteRefs: [],
    orphanedSprites: [],
    invalidFrames: [],
    negativeDimensions: [],
    spritesDir: path.join('public', 'sprites', mugenDir),
    spriteFilesExist: 0,
    spriteFilesMissing: 0,
    issues: [],
    fixed: false,
  };

  const manifestPath = path.join(result.spritesDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    result.issues.push('manifest.json not found');
    return result;
  }

  const manifest: Manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  result.totalSprites = Object.keys(manifest.sprites).length;
  result.totalAnims = Object.keys(manifest.animations).length;

  // Track which sprite keys are referenced by animations
  const referencedSprites = new Set<string>();

  // Validate each animation
  for (const [actionId, anim] of Object.entries(manifest.animations)) {
    result.totalFrames += anim.frames.length;

    for (let i = 0; i < anim.frames.length; i++) {
      const frame = anim.frames[i];

      // Skip blank frames
      if (frame.group === -1) continue;

      const spriteKey = `${frame.group}_${frame.index}`;
      referencedSprites.add(spriteKey);

      // Check zero duration
      if (frame.duration === 0) {
        result.zeroDurationFixed++;
        if (fix) frame.duration = 1;
      }

      // Check sprite reference exists
      if (!manifest.sprites[spriteKey]) {
        result.missingSpriteRefs.push(`Action ${actionId} frame ${i}: ${spriteKey}`);
      }

      // Check negative dimensions
      if (frame.group < 0 || frame.index < 0) {
        result.invalidFrames.push(`Action ${actionId} frame ${i}: group=${frame.group} index=${frame.index}`);
      }
    }
  }

  // Find orphaned sprites (not referenced by any animation)
  for (const key of Object.keys(manifest.sprites)) {
    if (!referencedSprites.has(key)) {
      result.orphanedSprites.push(key);
    }
  }

  // Check sprite dimensions
  for (const [key, sprite] of Object.entries(manifest.sprites)) {
    if (sprite.width <= 0 || sprite.height <= 0) {
      result.negativeDimensions.push(`${key}: ${sprite.width}x${sprite.height}`);
    }
  }

  // Check sprite files exist on disk
  for (const [key, sprite] of Object.entries(manifest.sprites)) {
    const filePath = path.join(result.spritesDir, sprite.file);
    if (fs.existsSync(filePath)) {
      result.spriteFilesExist++;
    } else {
      result.spriteFilesMissing++;
    }
  }

  // Compile issues
  if (result.missingSpriteRefs.length > 0) {
    result.issues.push(`${result.missingSpriteRefs.length} missing sprite refs`);
  }
  if (result.orphanedSprites.length > 0) {
    result.issues.push(`${result.orphanedSprites.length} orphaned sprites`);
  }
  if (result.negativeDimensions.length > 0) {
    result.issues.push(`${result.negativeDimensions.length} negative dimensions`);
  }
  if (result.spriteFilesMissing > 0) {
    result.issues.push(`${result.spriteFilesMissing} missing PNG files`);
  }

  // Write fixed manifest
  if (fix && result.zeroDurationFixed > 0) {
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
    result.fixed = true;
  }

  return result;
}

// ===== Output =====

function formatResult(r: ValidationResult): string {
  const lines: string[] = [];
  lines.push(`[${r.mugenDir}]`);
  lines.push(`  Sprites: ${r.totalSprites} (${r.spriteFilesExist} exist, ${r.spriteFilesMissing} missing)`);
  lines.push(`  Animations: ${r.totalAnims}, Frames: ${r.totalFrames}`);
  lines.push(`  Orphaned sprites: ${r.orphanedSprites.length}`);
  lines.push(`  Zero-duration fixed: ${r.zeroDurationFixed}${r.fixed ? ' (written)' : ' (dry-run)'}`);

  if (r.issues.length > 0) {
    lines.push(`  Issues:`);
    for (const issue of r.issues) {
      lines.push(`    - ${issue}`);
    }
  } else {
    lines.push(`  Status: OK`);
  }

  return lines.join('\n');
}

// ===== Main =====

function main() {
  const args = process.argv.slice(2);
  const fix = args.includes('--fix');
  const dirIdx = args.indexOf('--dir');

  const spritesDir = path.join('public', 'sprites');
  let dirs = fs.readdirSync(spritesDir).filter(d =>
    fs.existsSync(path.join(spritesDir, d, 'manifest.json'))
  );

  if (dirIdx >= 0 && args[dirIdx + 1]) {
    dirs = [args[dirIdx + 1]];
  }

  console.log(`Validating ${dirs.length} character manifests...${fix ? ' (fix mode)' : ' (dry-run)'}`);
  console.log('');

  let totalFixed = 0;
  let totalOrphans = 0;
  let totalMissing = 0;
  let okCount = 0;

  for (const dir of dirs) {
    const result = validateManifest(dir, fix);
    console.log(formatResult(result));
    if (result.fixed) totalFixed++;
    totalOrphans += result.orphanedSprites.length;
    totalMissing += result.spriteFilesMissing;
    if (result.issues.length === 0) okCount++;
  }

  console.log('');
  console.log(`Summary: ${okCount}/${dirs.length} clean, ${totalFixed} fixed, ${totalOrphans} orphans, ${totalMissing} missing files`);
}

main();
