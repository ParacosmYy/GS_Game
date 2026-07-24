import { describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { AttackType, FighterState } from '../src/core/types.js';
import {
  getCharacterConfig,
  resolveGenericMugenAction,
} from '../src/rendering/sprites/shared/characterSpriteRegistry.js';
import {
  TAKUMA_ATTACK_KEYS,
  TAKUMA_MOVES,
  TAKUMA_HITBOX_KEYS,
  TAKUMA_MUGEN_ACTION_MAP,
  getTakumaHitboxOffsets,
} from '../src/content/characters/takuma/index.js';

import '../src/rendering/sprites/shared/characterSpriteConfigs.js';

const TAKUMA_SPRITE_DIR = path.resolve(__dirname, '../public/sprites/takuma');

const TAKUMA_NORMAL_ATTACK_TYPE_BY_KEY: Record<string, AttackType> = {
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

const EXPECTED_RUNTIME_BACKED_NORMAL_ACTIONS: Record<string, string> = {
  STAND_A: '200',
  STAND_B: '230',
  STAND_C: '210',
  STAND_D: '240',
  CLOSE_A: '205',
  CLOSE_B: '230',
  CLOSE_C: '210',
  CLOSE_D: '240',
  CROUCH_A: '400',
  CROUCH_B: '430',
  CROUCH_C: '410',
  CROUCH_D: '440',
  JUMP_A: '600',
  JUMP_B: '630',
  JUMP_C: '610',
  JUMP_D: '640',
};

const TAKUMA_RUNTIME_TO_CONTENT_KEY: Record<string, string> = {
  TAKUMA_FUU_GA: 'TAKUMA_FUU_GA',
  TAKUMA_GOUSOU: 'TAKUMA_GOUSOU',
  TAKUMA_KO_OU_KEN: 'TAKUMA_KO_OU_KEN',
  TAKUMA_KO_OU_KEN_C: 'TAKUMA_KO_OU_KEN_C',
  TAKUMA_HAOH_SHOU_KOU_KEN: 'TAKUMA_HAOH_SHOU_KOU_KEN',
  TAKUMA_HIEN_SHIPPUU: 'TAKUMA_HIEN_SHIPPUU',
  DM_RYUKO_RANBU_TAKUMA: 'DM_RYUKO_RANBU_TAKUMA',
  SDM_RYUKO_RANBU_TAKUMA: 'SDM_RYUKO_RANBU_TAKUMA',
};

interface TakumaAssetActions {
  manifestActions: Set<string>;
  hitboxActions: Set<string>;
}

function loadTakumaAssetActions(): TakumaAssetActions {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(TAKUMA_SPRITE_DIR, 'manifest.json'), 'utf8'),
  ) as { animations: Record<string, unknown> };
  const hitboxes = JSON.parse(
    fs.readFileSync(path.join(TAKUMA_SPRITE_DIR, 'hitboxes.json'), 'utf8'),
  ) as { actions: Record<string, unknown> };

  return {
    manifestActions: new Set(Object.keys(manifest.animations ?? {})),
    hitboxActions: new Set(Object.keys(hitboxes.actions ?? {})),
  };
}

function runtimeActionFor(runtimeAttackType: AttackType | string): string {
  const config = getCharacterConfig('takuma');
  expect(config, 'takuma sprite config').toBeDefined();

  const resolved = resolveGenericMugenAction(
    config!,
    FighterState.STAND_ATTACK,
    runtimeAttackType as AttackType,
    0,
    1,
  );
  expect(resolved, `takuma runtime ${runtimeAttackType} action`).toBeDefined();
  return resolved!;
}

function collectMoveVersionKeys(): string[] {
  return [
    ...new Set(TAKUMA_MOVES.flatMap(move => move.versions.map(version => version.attackTypeKey))),
  ].sort();
}

function collectRuntimeBackedActionIds(): string[] {
  const actionIds = new Set<string>();

  for (const attackType of Object.values(TAKUMA_NORMAL_ATTACK_TYPE_BY_KEY)) {
    actionIds.add(runtimeActionFor(attackType));
  }
  for (const attackType of Object.keys(TAKUMA_RUNTIME_TO_CONTENT_KEY)) {
    actionIds.add(runtimeActionFor(attackType));
  }

  return [...actionIds].sort((a, b) => Number(a) - Number(b));
}

describe('Takuma runtime/content MUGEN action alignment', () => {
  it('keeps content attack and move keys inside one Takuma action contract', () => {
    const contentMapKeys = Object.keys(TAKUMA_MUGEN_ACTION_MAP).sort();
    const attackKeys = [...TAKUMA_ATTACK_KEYS].sort();
    const moveKeys = TAKUMA_MOVES.map(move => move.key).sort();
    const moveVersionKeys = collectMoveVersionKeys();

    expect(attackKeys, 'Takuma attack keys should match MUGEN action map keys').toEqual(contentMapKeys);
    expect(
      moveKeys.filter(key => !TAKUMA_MUGEN_ACTION_MAP[key]),
      'Takuma move keys missing MUGEN actions',
    ).toEqual([]);
    expect(
      moveVersionKeys.filter(key => !TAKUMA_MUGEN_ACTION_MAP[key]),
      'Takuma move version keys missing MUGEN actions',
    ).toEqual([]);
  });

  it('keeps runtime-backed normal actions aligned with Takuma content map', () => {
    expect(TAKUMA_MUGEN_ACTION_MAP).toMatchObject(EXPECTED_RUNTIME_BACKED_NORMAL_ACTIONS);

    for (const [contentKey, attackType] of Object.entries(TAKUMA_NORMAL_ATTACK_TYPE_BY_KEY)) {
      const contentAction = TAKUMA_MUGEN_ACTION_MAP[contentKey];
      expect(contentAction, `Takuma content normal ${contentKey}`).toBeDefined();
      expect(
        runtimeActionFor(attackType),
        `Takuma runtime normal ${contentKey} should match content MUGEN action`,
      ).toBe(contentAction);
    }
  });

  it('keeps runtime-backed specials and DMs aligned with Takuma content map', () => {
    for (const [runtimeAttackType, contentKey] of Object.entries(TAKUMA_RUNTIME_TO_CONTENT_KEY)) {
      const contentAction = TAKUMA_MUGEN_ACTION_MAP[contentKey];
      expect(contentAction, `Takuma content key ${contentKey}`).toBeDefined();

      const resolvedAction = runtimeActionFor(runtimeAttackType);
      expect(
        resolvedAction,
        `Takuma runtime ${runtimeAttackType} should resolve to content ${contentKey}`,
      ).toBe(contentAction);
      expect(resolvedAction, `${runtimeAttackType} must not fall back to stand attack`).not.toBe('201');
    }
  });

  it('backs every runtime-consumed Takuma action with manifest animation data', () => {
    const { manifestActions } = loadTakumaAssetActions();

    for (const actionId of collectRuntimeBackedActionIds()) {
      expect(
        manifestActions.has(actionId),
        `takuma manifest should include runtime-backed action ${actionId}`,
      ).toBe(true);
    }
  });

  it('keeps declared Takuma hitbox offsets pointed at converted MUGEN hitbox data', () => {
    const { manifestActions, hitboxActions } = loadTakumaAssetActions();
    const offsets = getTakumaHitboxOffsets();

    expect(Object.keys(offsets).sort(), 'Takuma hitbox keys should be explicit').toEqual(
      [...TAKUMA_HITBOX_KEYS].sort(),
    );

    for (const [contentKey, ref] of Object.entries(offsets)) {
      const contentAction = TAKUMA_MUGEN_ACTION_MAP[contentKey];
      expect(contentAction, `Takuma content key ${contentKey}`).toBeDefined();
      expect(
        manifestActions.has(contentAction),
        `takuma manifest should include content action ${contentKey} -> ${contentAction}`,
      ).toBe(true);
      expect(
        hitboxActions.has(ref.actionId),
        `takuma hitboxes should include offset ${contentKey} -> ${ref.actionId}`,
      ).toBe(true);
    }

    expect(
      offsets.JUMP_B.actionId,
      'Takuma JUMP_B keeps the converted AIR hitbox action until action 630 gets direct hitbox data',
    ).toBe('635');
  });
});
