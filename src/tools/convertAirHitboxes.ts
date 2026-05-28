#!/usr/bin/env npx ts-node
/**
 * convertAirHitboxes.ts
 *
 * Converts MUGEN AIR Clsn (collision) data to our FrameBox format.
 * Reads the animations.json from parseAir and outputs hitbox data
 * compatible with the game's ATTACK_FRAMES tables.
 *
 * Usage: npx ts-node src/tools/convertAirHitboxes.ts <animations.json> <output.json>
 *
 * MUGEN Clsn format: left, top, right, bottom
 *   - Y axis: top is negative (upward from character feet)
 *   - Origin is character center at feet
 *
 * Our FrameBox format: ox, oy, w, h
 *   - oy negative = upward
 *   - Origin is fighter position
 */

import * as fs from 'fs';

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
  hurtboxes: AirBox[] | null;
  attackBoxes: AirBox[] | null;
}

interface AirAnim {
  name: string;
  loopStart: number;
  defaultHurtboxes: AirBox[];
  frames: AirFrame[];
}

interface FrameBox {
  ox: number;
  oy: number;
  w: number;
  h: number;
}

interface AttackFrameData {
  attack: FrameBox[];
  bodyOverride: FrameBox | null;
}

interface HitboxOutput {
  characterId: string;
  /** Map of MUGEN action number to per-frame hitbox data */
  actions: Record<string, {
    name: string;
    /** startup frames (no collision) */
    startup: number;
    /** active frames (with attack boxes) */
    active: number;
    /** recovery frames (no collision) */
    recovery: number;
    /** Per-frame data for active phase */
    frames: AttackFrameData[];
  }>;
}

// ===== Conversion =====

function clsnToFrameBox(box: AirBox): FrameBox {
  return {
    ox: box.left,
    oy: box.top,
    w: box.right - box.left,
    h: box.bottom - box.top,
  };
}

function convertHitboxes(animData: { animations: Record<string, AirAnim> }, characterId: string): HitboxOutput {
  const result: HitboxOutput = { characterId, actions: {} };

  for (const [actionId, anim] of Object.entries(animData.animations)) {
    // Only process animations that have attack boxes
    const hasAttack = anim.frames.some(f => f.attackBoxes !== null);
    if (!hasAttack) continue;

    // Count startup/active/recovery
    let startup = 0;
    let active = 0;
    let recovery = 0;
    let phase: 'startup' | 'active' | 'recovery' = 'startup';

    const activeFrames: AttackFrameData[] = [];

    for (const frame of anim.frames) {
      if (phase === 'startup') {
        if (frame.attackBoxes !== null) {
          phase = 'active';
          active++;
          activeFrames.push({
            attack: frame.attackBoxes.map(clsnToFrameBox),
            bodyOverride: frame.hurtboxes
              ? { ox: -9999, oy: -9999, w: 0, h: 0 } // simplified: use first hurtbox as body override indicator
              : null,
          });
        } else {
          startup++;
        }
      } else if (phase === 'active') {
        if (frame.attackBoxes !== null) {
          active++;
          activeFrames.push({
            attack: frame.attackBoxes.map(clsnToFrameBox),
            bodyOverride: null,
          });
        } else {
          phase = 'recovery';
          recovery++;
        }
      } else {
        recovery++;
      }
    }

    result.actions[actionId] = {
      name: anim.name,
      startup,
      active,
      recovery,
      frames: activeFrames,
    };
  }

  return result;
}

// ===== Main =====

function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: npx ts-node src/tools/convertAirHitboxes.ts <animations.json> <output.json>');
    process.exit(1);
  }

  const [inputPath, outputPath] = args;
  const animData = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
  const characterId = inputPath.match(/([^/\\]+)\.animations\.json/)?.[1] || 'unknown';

  const result = convertHitboxes(animData, characterId);

  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');

  const actionCount = Object.keys(result.actions).length;
  let totalAttackFrames = 0;
  for (const a of Object.values(result.actions)) {
    totalAttackFrames += a.frames.length;
  }

  console.log(`Converted ${actionCount} attack actions with ${totalAttackFrames} active frames`);
  console.log(`Output: ${outputPath}`);

  // Print summary
  for (const [id, action] of Object.entries(result.actions)) {
    console.log(`  Action ${id} (${action.name}): startup=${action.startup} active=${action.active} recovery=${action.recovery}`);
  }
}

main();
