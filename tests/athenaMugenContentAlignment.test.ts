import { describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { AttackType } from '../src/core/types.js';
import {
  ATHENA_ATTACK_KEYS,
  ATHENA_MOVES,
  ATHENA_MUGEN_ACTION_MAP,
  generateAthenaMugenActionReport,
} from '../src/content/characters/athena/index.js';
import { getCharacterConfig } from '../src/rendering/sprites/shared/characterSpriteRegistry.js';

import '../src/rendering/sprites/shared/characterSpriteConfigs.js';

const SPRITES_DIR = path.resolve(__dirname, '../public/sprites/cvsathena');

const RUNTIME_BACKED_ATHENA_KEYS: Record<string, AttackType> = {
  STAND_A: AttackType.STAND_A,
  STAND_B: AttackType.STAND_B,
  STAND_C: AttackType.STAND_C,
  STAND_D: AttackType.STAND_D,
  CLOSE_A: AttackType.CLOSE_A,
  CLOSE_B: AttackType.CLOSE_B,
  CLOSE_C: AttackType.CLOSE_C,
  CLOSE_D: AttackType.CLOSE_D,
  CROUCH_A: AttackType.CROUCH_A,
  CROUCH_B: AttackType.CROUCH_B,
  CROUCH_C: AttackType.CROUCH_C,
  CROUCH_D: AttackType.CROUCH_D,
  JUMP_A: AttackType.JUMP_A,
  JUMP_B: AttackType.JUMP_B,
  JUMP_C: AttackType.JUMP_C,
  JUMP_D: AttackType.JUMP_D,
  ATHENA_PHOENIX_REFLECT: AttackType.ATHENA_PHOENIX_REFLECT,
  ATHENA_LOW_B: AttackType.ATHENA_LOW_B,
  ATHENA_AIR_B: AttackType.ATHENA_AIR_B,
  ATHENA_PSYCHO_BALL: AttackType.ATHENA_PSYCHO_BALL,
  ATHENA_PSYCHO_BALL_C: AttackType.ATHENA_PSYCHO_BALL_C,
  ATHENA_PSYCHO_SWORD: AttackType.ATHENA_PSYCHO_SWORD,
  ATHENA_PSYCHO_SWORD_C: AttackType.ATHENA_PSYCHO_SWORD_C,
  ATHENA_PHOENIX_ARROW: AttackType.ATHENA_PHOENIX_ARROW,
  DM_SHINING_CRYSTAL_BIT: AttackType.DM_SHINING_CRYSTAL_BIT,
  SDM_SHINING_CRYSTAL_BIT: AttackType.SDM_SHINING_CRYSTAL_BIT,
};

function loadManifestActions(): Set<string> {
  const manifest = JSON.parse(fs.readFileSync(path.join(SPRITES_DIR, 'manifest.json'), 'utf8')) as {
    animations: Record<string, unknown>;
  };
  return new Set(Object.keys(manifest.animations));
}

function loadHitboxActions(): Set<string> {
  const hitboxes = JSON.parse(fs.readFileSync(path.join(SPRITES_DIR, 'hitboxes.json'), 'utf8')) as {
    actions: Record<string, unknown>;
  };
  return new Set(Object.keys(hitboxes.actions));
}

function collectMoveVersionKeys(): string[] {
  return [...new Set(ATHENA_MOVES.flatMap(move => move.versions.map(version => version.attackTypeKey)))].sort();
}

describe('Athena MUGEN content action alignment', () => {
  it('keeps content MUGEN actions aligned with runtime-backed Athena sprite actions', () => {
    const config = getCharacterConfig('athena');
    expect(config, 'athena sprite config').toBeDefined();

    for (const [attackKey, attackType] of Object.entries(RUNTIME_BACKED_ATHENA_KEYS)) {
      expect(ATHENA_MUGEN_ACTION_MAP[attackKey], `${attackKey} content MUGEN action`).toBeDefined();
      expect(ATHENA_MUGEN_ACTION_MAP[attackKey], `${attackKey} content/runtime action`).toBe(
        config!.specialMap[attackType],
      );
    }
  });

  it('keeps Athena content MUGEN actions backed by manifest animations', () => {
    const manifestActions = loadManifestActions();

    for (const [attackKey, actionId] of Object.entries(ATHENA_MUGEN_ACTION_MAP)) {
      expect(manifestActions.has(actionId), `${attackKey} -> ${actionId} should exist in manifest`).toBe(true);
    }
  });

  it('reports Athena move keys that still lack a MUGEN action mapping', () => {
    const mappedKeys = new Set(Object.keys(ATHENA_MUGEN_ACTION_MAP));
    const moveVersionKeys = collectMoveVersionKeys();
    const missingMoveActions = moveVersionKeys.filter(key => !mappedKeys.has(key));
    const report = generateAthenaMugenActionReport();

    expect(report.missingMoveActionKeys).toEqual(missingMoveActions);
    expect(report.missingMoveActionKeys).toContain('ATHENA_PSYCHO_TELEPORT');
    expect(report.missingMoveActionKeys).toContain('DM_PHOENIX_FANG_ARROW');
  });

  it('reports mapped Athena actions that still need legacy hitbox fallback', () => {
    const hitboxActions = loadHitboxActions();
    const expectedFallbackKeys = Object.entries(ATHENA_MUGEN_ACTION_MAP)
      .filter(([, actionId]) => !hitboxActions.has(actionId))
      .map(([attackKey]) => attackKey)
      .sort();
    const report = generateAthenaMugenActionReport();

    expect(report.fallbackHitboxKeys).toEqual(expectedFallbackKeys);
    expect(report.fallbackHitboxKeys).toContain('ATHENA_PSYCHO_BALL');
    expect(report.fallbackHitboxKeys).toContain('DM_SHINING_CRYSTAL_BIT');
  });

  it('keeps Athena report counts tied to the content package contract', () => {
    const report = generateAthenaMugenActionReport();

    expect(report.characterId).toBe('athena');
    expect(report.mugenDir).toBe('cvsathena');
    expect(report.attackKeyCount).toBe(ATHENA_ATTACK_KEYS.length);
    expect(report.mappedActionCount).toBe(Object.keys(ATHENA_MUGEN_ACTION_MAP).length);
    expect(report.runtimeBackedActionCount).toBe(Object.keys(RUNTIME_BACKED_ATHENA_KEYS).length);
    expect(report.manifestBackedActionCount).toBe(report.mappedActionCount);
    expect(report.manifestClean).toBe(false);
    expect(report.manifestMissingSpriteRefCount).toBe(140);
    expect(report.manifestOrphanedSpriteCount).toBe(50);
    expect(report.notes.join(' ')).toContain('validateManifests');
  });
});
