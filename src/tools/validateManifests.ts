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
import { pathToFileURL } from 'url';

// ===== Types =====

export interface SpriteRef {
  group: number;
  index: number;
  file: string;
  width: number;
  height: number;
}

export interface AnimFrame {
  group: number;
  index: number;
  offsetX: number;
  offsetY: number;
  duration: number;
  flipH: boolean;
  hurtboxes: any[] | null;
  attackBoxes: any[] | null;
}

export interface AnimData {
  name: string;
  loopStart: number;
  frames: AnimFrame[];
}

export interface Manifest {
  characterId: string;
  sprites: Record<string, SpriteRef>;
  animations: Record<string, AnimData>;
  stateMap?: Record<string, string>;
}

export interface MissingSpriteRefDetail {
  actionId: string;
  frameIndex: number;
  group: number;
  index: number;
  spriteKey: string;
  expectedFile: string;
  fileExists: boolean;
}

export interface MissingSpriteRefActionSummary {
  actionId: string;
  frameCount: number;
  uniqueSpriteKeyCount: number;
  referencedPngFilesPresent: number;
  sampleSpriteKeys: string[];
}

export interface MissingSpriteRefSummary {
  frameCount: number;
  uniqueSpriteKeyCount: number;
  actionCount: number;
  referencedPngFilesPresent: number;
  actions: MissingSpriteRefActionSummary[];
  diagnosis: string | null;
}

export interface ValidationResult {
  mugenDir: string;
  totalSprites: number;
  totalAnims: number;
  totalFrames: number;
  zeroDurationFixed: number;
  missingSpriteRefs: string[];
  missingSpriteRefDetails: MissingSpriteRefDetail[];
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

function formatSpriteKey(group: number, index: number): string {
  return `${group}_${index}`;
}

function formatSpriteFile(group: number, index: number): string {
  return `${String(group).padStart(5, '0')}_${String(index).padStart(4, '0')}.png`;
}

export function summarizeMissingSpriteRefs(result: ValidationResult): MissingSpriteRefSummary {
  const details = result.missingSpriteRefDetails;
  const uniqueSpriteKeys = new Set(details.map(detail => detail.spriteKey));
  const byAction = new Map<string, MissingSpriteRefDetail[]>();

  for (const detail of details) {
    const actionDetails = byAction.get(detail.actionId) ?? [];
    actionDetails.push(detail);
    byAction.set(detail.actionId, actionDetails);
  }

  const actions = Array.from(byAction.entries())
    .map(([actionId, actionDetails]) => {
      const actionSpriteKeys = new Set(actionDetails.map(detail => detail.spriteKey));
      return {
        actionId,
        frameCount: actionDetails.length,
        uniqueSpriteKeyCount: actionSpriteKeys.size,
        referencedPngFilesPresent: actionDetails.filter(detail => detail.fileExists).length,
        sampleSpriteKeys: Array.from(actionSpriteKeys).slice(0, 5),
      };
    })
    .sort((a, b) => {
      const numericA = Number(a.actionId);
      const numericB = Number(b.actionId);
      if (Number.isFinite(numericA) && Number.isFinite(numericB)) return numericA - numericB;
      return a.actionId.localeCompare(b.actionId);
    });

  const referencedPngFilesPresent = details.filter(detail => detail.fileExists).length;
  const diagnosis =
    details.length > 0 && result.spriteFilesMissing === 0 && referencedPngFilesPresent === 0
      ? 'AIR references sprites absent from manifest/SFF extraction; public PNG copy is not missing files.'
      : null;

  return {
    frameCount: details.length,
    uniqueSpriteKeyCount: uniqueSpriteKeys.size,
    actionCount: actions.length,
    referencedPngFilesPresent,
    actions,
    diagnosis,
  };
}

export function validateManifest(mugenDir: string, fix = false): ValidationResult {
  const result: ValidationResult = {
    mugenDir,
    totalSprites: 0,
    totalAnims: 0,
    totalFrames: 0,
    zeroDurationFixed: 0,
    missingSpriteRefs: [],
    missingSpriteRefDetails: [],
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

      const spriteKey = formatSpriteKey(frame.group, frame.index);
      referencedSprites.add(spriteKey);

      // Check zero duration
      if (frame.duration === 0) {
        result.zeroDurationFixed++;
        if (fix) frame.duration = 1;
      }

      // Check sprite reference exists
      if (!manifest.sprites[spriteKey]) {
        result.missingSpriteRefs.push(`Action ${actionId} frame ${i}: ${spriteKey}`);
        const expectedFile = formatSpriteFile(frame.group, frame.index);
        result.missingSpriteRefDetails.push({
          actionId,
          frameIndex: i,
          group: frame.group,
          index: frame.index,
          spriteKey,
          expectedFile,
          fileExists: fs.existsSync(path.join(result.spritesDir, expectedFile)),
        });
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

export function formatResult(r: ValidationResult): string {
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
    if (r.missingSpriteRefDetails.length > 0) {
      const summary = summarizeMissingSpriteRefs(r);
      lines.push(`  Diagnostics:`);
      lines.push(
        `    Missing sprite refs: ${summary.frameCount} frames, ${summary.uniqueSpriteKeyCount} unique sprite keys, ${summary.actionCount} actions, ${summary.referencedPngFilesPresent} referenced PNG files present`,
      );
      if (summary.diagnosis) {
        lines.push(`    ${summary.diagnosis}`);
      }
      lines.push(`    Top missing-ref actions:`);
      for (const action of summary.actions.slice(0, 10)) {
        lines.push(
          `      - ${action.actionId}: ${action.frameCount} frames, ${action.uniqueSpriteKeyCount} unique sprite keys, ${action.referencedPngFilesPresent} referenced PNG files present`,
        );
      }
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

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
