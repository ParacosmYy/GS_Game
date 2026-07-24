import { describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { AttackType, FighterState } from '../src/core/types.js';
import {
  getCharacterConfig,
  resolveGenericMugenAction,
} from '../src/rendering/sprites/shared/characterSpriteRegistry.js';
import {
  MAI_MUGEN_ACTION_MAP,
} from '../src/content/characters/mai/index.js';

import '../src/rendering/sprites/shared/characterSpriteConfigs.js';

const MAI_SPRITE_DIR = path.resolve(__dirname, '../public/sprites/mai');

const MAI_NORMAL_ATTACK_TYPE_BY_KEY: Record<string, AttackType> = {
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
};

const MAI_RUNTIME_TO_CONTENT_KEY: Record<string, string> = {
  MAI_HISSATSU_SHINOBIBACHI: 'MAI_HISSATSU_SHINOBIBACHI',
  MAI_YUSURA_UMA: 'MAI_YUSURA_UMA',
  MAI_KA_CHO_SEN: 'MAI_KA_CHO_SEN',
  MAI_KA_CHO_SEN_C: 'MAI_KA_CHO_SEN_C',
  MAI_HISHO_RYU_EN_JIN: 'MAI_HISHO_RYU_EN_JIN',
  MAI_RYU_EN_BU: 'MAI_RYU_EN_BU',
  DM_HAKA_OTOSHI: 'DM_HAKA_OTOSHI',
  SDM_HAKA_OTOSHI: 'SDM_HAKA_OTOSHI',
};

const EXPECTED_RUNTIME_CONTENT_DRIFT: Record<string, { runtimeAction: string; contentAction: string }> = {
  STAND_B: { runtimeAction: '230', contentAction: '530' },
  STAND_C: { runtimeAction: '210', contentAction: '510' },
};

function loadMaiAssetActions(): { manifestActions: Set<string>; hitboxActions: Set<string> } {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(MAI_SPRITE_DIR, 'manifest.json'), 'utf8'),
  ) as { animations: Record<string, unknown> };
  const hitboxes = JSON.parse(
    fs.readFileSync(path.join(MAI_SPRITE_DIR, 'hitboxes.json'), 'utf8'),
  ) as { actions: Record<string, unknown> };

  return {
    manifestActions: new Set(Object.keys(manifest.animations ?? {})),
    hitboxActions: new Set(Object.keys(hitboxes.actions ?? {})),
  };
}

function runtimeActionFor(runtimeAttackType: AttackType | string): string {
  const config = getCharacterConfig('mai');
  expect(config, 'mai sprite config').toBeDefined();
  const resolved = resolveGenericMugenAction(
    config!,
    FighterState.STAND_ATTACK,
    runtimeAttackType as AttackType,
    0,
    1,
  );
  expect(resolved, `mai runtime ${runtimeAttackType} action`).toBeDefined();
  return resolved!;
}

function collectRuntimeBackedActions(): Record<string, string> {
  const entries = Object.entries(MAI_NORMAL_ATTACK_TYPE_BY_KEY).map(([contentKey, attackType]) => [
    contentKey,
    runtimeActionFor(attackType),
  ]);
  for (const [runtimeAttackType, contentKey] of Object.entries(MAI_RUNTIME_TO_CONTENT_KEY)) {
    entries.push([contentKey, runtimeActionFor(runtimeAttackType)]);
  }
  return Object.fromEntries(entries);
}

describe('Mai runtime/content MUGEN action alignment', () => {
  it('keeps Mai runtime-backed actions aligned with content MUGEN actions except documented far-stand drift', () => {
    const runtimeActions = collectRuntimeBackedActions();
    const drift: Record<string, { runtimeAction: string; contentAction: string }> = {};

    for (const [contentKey, runtimeAction] of Object.entries(runtimeActions)) {
      const contentAction = MAI_MUGEN_ACTION_MAP[contentKey];
      expect(contentAction, `Mai content action ${contentKey}`).toBeDefined();
      if (contentAction !== runtimeAction) {
        drift[contentKey] = { runtimeAction, contentAction };
        continue;
      }
      expect(
        runtimeAction,
        `Mai runtime ${contentKey} should match content MUGEN action`,
      ).toBe(contentAction);
    }

    expect(drift).toEqual(EXPECTED_RUNTIME_CONTENT_DRIFT);
  });

  it('backs every Mai runtime action with manifest and hitbox data', () => {
    const assets = loadMaiAssetActions();
    const runtimeActions = collectRuntimeBackedActions();

    for (const [contentKey, actionId] of Object.entries(runtimeActions)) {
      expect(
        assets.manifestActions.has(actionId),
        `mai manifest should include runtime-backed ${contentKey} -> ${actionId}`,
      ).toBe(true);
      expect(
        assets.hitboxActions.has(actionId),
        `mai hitboxes should include runtime-backed ${contentKey} -> ${actionId}`,
      ).toBe(true);
    }
  });

  it('does not route Mai runtime normals through absent generic action ids', () => {
    const runtimeActions = collectRuntimeBackedActions();
    expect(Object.values(runtimeActions)).not.toEqual(expect.arrayContaining(['240', '630', '640']));
    expect(runtimeActions).toMatchObject({
      CLOSE_D: '550',
      STAND_D: '550',
      JUMP_B: '601',
      JUMP_D: '1800',
    });
  });
});
