#!/usr/bin/env npx ts-node
/**
 * buildSpriteManifest.ts
 *
 * Combines SFF sprite metadata + AIR animation data into a single
 * per-character manifest that the runtime spriteLoader can consume.
 *
 * Usage: npx ts-node src/tools/buildSpriteManifest.ts <spritesDir> <animations.json> <output.json>
 *
 * Input:
 *   spritesDir/ - directory with PNG sprites named {group}_{index}.png
 *   animations.json - output from parseAir.ts
 *
 * Output:
 *   manifest.json with sprite dimensions, animation frames, hitbox data
 */

import * as fs from 'fs';
import * as path from 'path';

// ===== Types =====

interface SpriteInfo {
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
  hurtboxes: { left: number; top: number; right: number; bottom: number }[] | null;
  attackBoxes: { left: number; top: number; right: number; bottom: number }[] | null;
}

interface AnimInfo {
  name: string;
  loopStart: number;
  defaultHurtboxes: { left: number; top: number; right: number; bottom: number }[];
  frames: AnimFrame[];
}

interface SpriteManifest {
  characterId: string;
  sprites: Record<string, SpriteInfo>;
  animations: Record<string, AnimInfo>;
  // MUGEN→KOF state mapping
  stateMap: Record<string, string>;
}

// ===== MUGEN→KOF State Mapping =====

const DEFAULT_STATE_MAP: Record<string, string> = {
  '0': 'IDLE',
  '5': 'IDLE_TURN',
  '6': 'CROUCH_TURN',
  '10': 'STAND_TO_CROUCH',
  '11': 'CROUCH',
  '12': 'CROUCH_TO_STAND',
  '20': 'WALK_FORWARD',
  '21': 'WALK_BACKWARD',
  '40': 'JUMP_START',
  '41': 'JUMP_UP',
  '42': 'JUMP_FWD',
  '43': 'JUMP_BACK',
  '47': 'JUMP_LAND',
  '100': 'RUN',
  '105': 'BACKDASH',
  '120': 'GUARD_START_STAND',
  '121': 'GUARD_STAND',
  '122': 'GUARD_END_STAND',
  '130': 'GUARD_START_CROUCH',
  '131': 'GUARD_CROUCH',
  '132': 'GUARD_END_CROUCH',
  '140': 'GUARD_START_AIR',
  '141': 'GUARD_AIR',
  '142': 'GUARD_END_AIR',
  '150': 'DODGE',
  '151': 'DODGE_FWD',
  '152': 'DODGE_BACK',
  '170': 'LOSE',
  '181': 'WIN',
  '190': 'INTRO',
  '195': 'TAUNT',
  '200': 'STAND_A',
  '210': 'STAND_C',
  '230': 'STAND_B',
  '240': 'STAND_D',
  '400': 'CROUCH_A',
  '410': 'CROUCH_C',
  '430': 'CROUCH_B',
  '440': 'CROUCH_D',
  '600': 'AIR_A',
  '610': 'AIR_C',
  '630': 'AIR_B',
  '640': 'AIR_D',
  '800': 'THROW',
  '1000': 'SPECIAL_1',
  '1010': 'SPECIAL_2',
  '1020': 'SPECIAL_3',
  '1050': 'DM_1',
  '1060': 'DM_2',
  '1100': 'DM_3',
  '1200': 'SUPER_1',
  '1300': 'SPECIAL_4',
  '1400': 'SPECIAL_5',
  '5000': 'HIT_LIGHT_HIGH',
  '5001': 'HIT_MEDIUM_HIGH',
  '5002': 'HIT_HARD_HIGH',
  '5005': 'HIT_LIGHT_LOW',
  '5006': 'HIT_MEDIUM_LOW',
  '5007': 'HIT_HARD_LOW',
  '5010': 'HIT_TRIP',
  '5011': 'HIT_TRIP2',
  '5020': 'HIT_AIR_HIGH',
  '5030': 'HIT_AIR_TRIP',
  '5035': 'HIT_AIR_FALL',
  '5040': 'RISE',
  '5050': 'FALL',
  '5061': 'FALL_FROM_HIT',
  '5070': 'BOUNCE',
  '5080': 'BOUNCE2',
  '5090': 'BOUNCE3',
  '5100': 'LIE_DOWN',
  '5160': 'LIE_DEAD',
  '5300': 'LIE_DOWN_FACE_UP',
  '9000': 'PORTRAIT',
};

// ===== Sprite Discovery =====

function discoverSprites(spritesDir: string): Record<string, SpriteInfo> {
  const sprites: Record<string, SpriteInfo> = {};
  const files = fs.readdirSync(spritesDir).filter(f => f.endsWith('.png'));

  for (const file of files) {
    const match = file.match(/^(\d+)_(\d+)\.png$/);
    if (!match) continue;

    const group = parseInt(match[1]);
    const index = parseInt(match[2]);
    const key = `${group}_${index}`;

    // Read PNG header to get dimensions (IHDR chunk)
    const filePath = path.join(spritesDir, file);
    const buf = fs.readFileSync(filePath);
    let width = 0;
    let height = 0;
    if (buf.length >= 24) {
      width = buf.readUInt32BE(16);
      height = buf.readUInt32BE(20);
    } else {
      // Fallback: use sprites.json dimensions if available
      continue;
    }

    if (width === 0 || height === 0) continue;
    sprites[key] = { group, index, file, width, height };
  }

  return sprites;
}

// ===== Main =====

function main() {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.error('Usage: npx ts-node src/tools/buildSpriteManifest.ts <spritesDir> <animations.json> <output.json>');
    process.exit(1);
  }

  const [spritesDir, animationsPath, outputPath] = args;

  // Load sprite file info
  const sprites = discoverSprites(spritesDir);

  // Load animation data
  const animData = JSON.parse(fs.readFileSync(animationsPath, 'utf-8'));

  // Extract character ID from directory name
  const characterId = path.basename(spritesDir);

  const manifest: SpriteManifest = {
    characterId,
    sprites,
    animations: animData.animations,
    stateMap: DEFAULT_STATE_MAP,
  };

  fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2), 'utf-8');

  const spriteCount = Object.keys(sprites).length;
  const animCount = Object.keys(animData.animations).length;
  const missing = [];

  // Verify all animation frames reference existing sprites
  for (const [actionId, anim] of Object.entries(animData.animations as Record<string, AnimInfo>)) {
    for (const frame of anim.frames) {
      if (frame.group === -1) continue; // blank frame
      const key = `${frame.group}_${String(frame.index).padStart(4, '0')}`;
      if (!sprites[key]) {
        // Try without padding
        const altKey = `${frame.group}_${frame.index}`;
        if (!sprites[altKey]) {
          missing.push(`Action ${actionId}: group=${frame.group} index=${frame.index}`);
        }
      }
    }
  }

  console.log(`Character: ${characterId}`);
  console.log(`Sprites: ${spriteCount}`);
  console.log(`Animations: ${animCount}`);
  if (missing.length > 0) {
    console.log(`Missing sprite references: ${missing.length}`);
    missing.slice(0, 10).forEach(m => console.log(`  ${m}`));
    if (missing.length > 10) console.log(`  ... and ${missing.length - 10} more`);
  } else {
    console.log('All sprite references valid');
  }
  console.log(`Output: ${outputPath}`);
}

main();
