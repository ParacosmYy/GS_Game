#!/usr/bin/env npx ts-node
/**
 * parseAir.ts
 *
 * MUGEN AIR file parser.
 * Reads a .air file and outputs a JSON animation manifest.
 *
 * Usage: npx ts-node src/tools/parseAir.ts <input.air> <output.json>
 *
 * Output format:
 * {
 *   "animations": {
 *     "0": { "name": "Standing", "loopStart": -1, "frames": [...] },
 *     ...
 *   }
 * }
 */

import * as fs from 'fs';
import * as path from 'path';

// ===== Types =====

interface AirBox {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

interface AirFrame {
  group: number;
  index: number;
  offsetX: number;
  offsetY: number;
  duration: number;
  flipH: boolean;
  hurtboxes: AirBox[] | null;   // null = use default
  attackBoxes: AirBox[] | null; // null = no attack this frame
}

interface AirAnimation {
  name: string;
  loopStart: number;
  defaultHurtboxes: AirBox[];
  frames: AirFrame[];
}

interface AirManifest {
  source: string;
  animations: Record<string, AirAnimation>;
}

// ===== Parser =====

function parseAir(content: string, sourceFile: string): AirManifest {
  const manifest: AirManifest = { source: sourceFile, animations: {} };
  const lines = content.split(/\r?\n/);

  let currentAction: string | null = null;
  let currentName = '';
  let currentDefaultHurtboxes: AirBox[] = [];
  let loopStart = -1;
  let currentHurtboxes: AirBox[] | null = null;
  let currentAttackBoxes: AirBox[] | null = null;
  let frameLines: AirFrame[] = [];

  function flushAction() {
    if (currentAction !== null) {
      manifest.animations[currentAction] = {
        name: currentName,
        loopStart,
        defaultHurtboxes: currentDefaultHurtboxes,
        frames: frameLines,
      };
    }
  }

  let i = 0;
  while (i < lines.length) {
    const rawLine = lines[i];
    const line = rawLine.trim();
    i++;

    // Skip empty lines and comments
    if (!line || line.startsWith(';')) {
      // Check if comment contains a section name
      if (line.startsWith(';') && currentAction === null) {
        const nameMatch = line.match(/^;\s*(.+)/);
        if (nameMatch) {
          currentName = nameMatch[1].trim();
        }
      }
      continue;
    }

    // Parse [Begin Action N]
    const actionMatch = line.match(/^\[Begin Action\s+(\d+)\]$/i);
    if (actionMatch) {
      flushAction();
      currentAction = actionMatch[1];
      currentDefaultHurtboxes = [];
      loopStart = -1;
      currentHurtboxes = null;
      currentAttackBoxes = null;
      frameLines = [];
      currentName = currentName || `Action ${currentAction}`;
      continue;
    }

    if (currentAction === null) continue;

    // Parse Loopstart
    if (line.toLowerCase() === 'loopstart') {
      loopStart = frameLines.length;
      continue;
    }

    // Parse Clsn2Default
    const clsn2DefaultMatch = line.match(/^Clsn2Default:\s*(\d+)/i);
    if (clsn2DefaultMatch) {
      const count = parseInt(clsn2DefaultMatch[1]);
      currentDefaultHurtboxes = [];
      for (let j = 0; j < count && i < lines.length; j++) {
        const boxLine = lines[i].trim();
        const boxMatch = boxLine.match(/Clsn2\[\d+\]\s*=\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)/);
        if (boxMatch) {
          currentDefaultHurtboxes.push({
            left: parseInt(boxMatch[1]),
            top: parseInt(boxMatch[2]),
            right: parseInt(boxMatch[3]),
            bottom: parseInt(boxMatch[4]),
          });
        }
        i++;
      }
      continue;
    }

    // Parse Clsn2 (per-frame override)
    const clsn2Match = line.match(/^Clsn2:\s*(\d+)/i);
    if (clsn2Match) {
      const count = parseInt(clsn2Match[1]);
      currentHurtboxes = [];
      for (let j = 0; j < count && i < lines.length; j++) {
        const boxLine = lines[i].trim();
        const boxMatch = boxLine.match(/Clsn2\[\d+\]\s*=\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)/);
        if (boxMatch) {
          currentHurtboxes!.push({
            left: parseInt(boxMatch[1]),
            top: parseInt(boxMatch[2]),
            right: parseInt(boxMatch[3]),
            bottom: parseInt(boxMatch[4]),
          });
        }
        i++;
      }
      continue;
    }

    // Parse Clsn1 (attack boxes)
    const clsn1Match = line.match(/^Clsn1:\s*(\d+)/i);
    if (clsn1Match) {
      const count = parseInt(clsn1Match[1]);
      currentAttackBoxes = [];
      for (let j = 0; j < count && i < lines.length; j++) {
        const boxLine = lines[i].trim();
        const boxMatch = boxLine.match(/Clsn1\[\d+\]\s*=\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)/);
        if (boxMatch) {
          currentAttackBoxes!.push({
            left: parseInt(boxMatch[1]),
            top: parseInt(boxMatch[2]),
            right: parseInt(boxMatch[3]),
            bottom: parseInt(boxMatch[4]),
          });
        }
        i++;
      }
      continue;
    }

    // Parse frame line: group,index, offsetX,offsetY, duration[, flags]
    const frameMatch = line.match(/^(-?\d+)\s*,\s*(\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)(?:\s*,\s*(.*))?$/);
    if (frameMatch) {
      const group = parseInt(frameMatch[1]);
      const index = parseInt(frameMatch[2]);
      const offsetX = parseInt(frameMatch[3]);
      const offsetY = parseInt(frameMatch[4]);
      const duration = parseInt(frameMatch[5]);
      const flags = frameMatch[6] || '';
      const flipH = flags.toUpperCase().includes('H');

      frameLines.push({
        group,
        index,
        offsetX,
        offsetY,
        duration,
        flipH,
        hurtboxes: currentHurtboxes,
        attackBoxes: currentAttackBoxes,
      });

      // Reset per-frame collision after consuming
      currentHurtboxes = null;
      currentAttackBoxes = null;
      continue;
    }
  }

  flushAction();
  return manifest;
}

// ===== Main =====

function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Usage: npx ts-node src/tools/parseAir.ts <input.air> [output.json]');
    process.exit(1);
  }

  const inputPath = args[0];
  const outputPath = args[1] || inputPath.replace(/\.air$/i, '.animations.json');

  const content = fs.readFileSync(inputPath, 'utf-8');
  const manifest = parseAir(content, path.basename(inputPath));

  fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2), 'utf-8');

  const actionCount = Object.keys(manifest.animations).length;
  let totalFrames = 0;
  let framesWithAttack = 0;
  for (const anim of Object.values(manifest.animations)) {
    totalFrames += anim.frames.length;
    framesWithAttack += anim.frames.filter(f => f.attackBoxes !== null).length;
  }

  console.log(`Parsed ${actionCount} animations, ${totalFrames} frames (${framesWithAttack} with attack boxes)`);
  console.log(`Output: ${outputPath}`);
}

main();
