import { describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { AttackType, FighterState } from '../src/core/types.js';
import {
  getCharacterConfig,
  resolveGenericMugenAction,
} from '../src/rendering/sprites/shared/characterSpriteRegistry.js';
import {
  TERRY_MUGEN_ACTION_MAP,
} from '../src/content/characters/terry/index.js';
import {
  KIM_MUGEN_ACTION_MAP,
} from '../src/content/characters/kim/index.js';

import '../src/rendering/sprites/shared/characterSpriteConfigs.js';

const SPRITES_DIR = path.resolve(__dirname, '../public/sprites');

const NORMAL_ATTACK_TYPE_BY_KEY: Record<string, AttackType> = {
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

const TERRY_RUNTIME_TO_CONTENT_KEY: Record<string, string> = {
  TERRY_POWER_WAVE: 'TERRY_POWER_WAVE',
  TERRY_BURN_KNUCKLE: 'TERRY_BURN_KNUCKLE',
  TERRY_CRACK_SHOT: 'TERRY_CRACK_SHOT',
  TERRY_POWER_DUNK: 'TERRY_POWER_DUNK',
  TERRY_RISING_TACKLE: 'TERRY_RISING_TACKLE',
  TERRY_BACK_KNCKLE: 'TERRY_BACK_KNCKLE',
  TERRY_COMBO_BLOW: 'TERRY_COMBO_BLOW',
  DM_POWER_GEYSER: 'DM_POWER_GEYSER',
  SDM_POWER_GEYSER: 'SDM_POWER_GEYSER',
  DM_HIGH_ANGLE_GEYSER: 'DM_HIGH_ANGLE_GEYSER',
  SDM_HIGH_ANGLE_GEYSER: 'SDM_HIGH_ANGLE_GEYSER',
};

const KIM_RUNTIME_TO_CONTENT_KEY: Record<string, string> = {
  KIM_HISHOU_KICK: 'KIM_HISHOU_KICK',
  KIM_HANSEN: 'KIM_HANSEN',
  KIM_HIENZAN: 'KIM_HIENZAN',
  KIM_HANGETSU: 'KIM_HANGETSU',
  KIM_HAKI: 'KIM_HAKI',
  KIM_HISHOU: 'KIM_HISHOU',
  KIM_SANREN: 'KIM_SANREN',
  DM_PHOENIX_KICK: 'DM_PHOENIX_KICK',
  SDM_PHOENIX_KICK: 'SDM_PHOENIX_KICK',
  DM_PHOENIX_HITEN: 'DM_PHOENIX_HITEN',
  SDM_PHOENIX_HITEN: 'SDM_PHOENIX_HITEN',
};

interface AssetActions {
  manifestActions: Set<string>;
  hitboxActions: Set<string>;
}

function loadAssetActions(mugenDir: string): AssetActions {
  const manifestPath = path.join(SPRITES_DIR, mugenDir, 'manifest.json');
  const hitboxPath = path.join(SPRITES_DIR, mugenDir, 'hitboxes.json');

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as {
    animations: Record<string, unknown>;
  };
  const hitboxes = JSON.parse(fs.readFileSync(hitboxPath, 'utf8')) as {
    actions: Record<string, unknown>;
  };

  return {
    manifestActions: new Set(Object.keys(manifest.animations)),
    hitboxActions: new Set(Object.keys(hitboxes.actions)),
  };
}

function runtimeActionFor(
  charId: string,
  runtimeAttackType: AttackType | string,
): string {
  const config = getCharacterConfig(charId);
  expect(config, `${charId} sprite config`).toBeDefined();
  const resolved = resolveGenericMugenAction(
    config!,
    FighterState.STAND_ATTACK,
    runtimeAttackType as AttackType,
    0,
    1,
  );
  expect(resolved, `${charId} runtime ${runtimeAttackType} action`).toBeDefined();
  return resolved;
}

function expectRuntimeKeysToMatchContent(
  charId: string,
  runtimeToContentKey: Record<string, string>,
  contentMap: Record<string, string>,
): void {
  for (const [runtimeAttackType, contentKey] of Object.entries(runtimeToContentKey)) {
    const contentAction = contentMap[contentKey];
    expect(contentAction, `${charId} content key ${contentKey}`).toBeDefined();
    expect(
      runtimeActionFor(charId, runtimeAttackType),
      `${charId} runtime ${runtimeAttackType} should match content ${contentKey}`,
    ).toBe(contentAction);
  }
}

function expectRuntimeNormalsToMatchContent(
  charId: string,
  contentMap: Record<string, string>,
): void {
  for (const [contentKey, attackType] of Object.entries(NORMAL_ATTACK_TYPE_BY_KEY)) {
    const contentAction = contentMap[contentKey];
    expect(contentAction, `${charId} content normal ${contentKey}`).toBeDefined();
    expect(
      runtimeActionFor(charId, attackType),
      `${charId} runtime normal ${contentKey} should match content`,
    ).toBe(contentAction);
  }
}

function expectRuntimeBackedActionsInManifest(
  charId: string,
  mugenDir: string,
  runtimeToContentKey: Record<string, string>,
): void {
  const assets = loadAssetActions(mugenDir);
  const runtimeActions = new Set<string>();

  for (const attackType of Object.values(NORMAL_ATTACK_TYPE_BY_KEY)) {
    runtimeActions.add(runtimeActionFor(charId, attackType));
  }
  for (const runtimeAttackType of Object.keys(runtimeToContentKey)) {
    runtimeActions.add(runtimeActionFor(charId, runtimeAttackType));
  }

  for (const actionId of [...runtimeActions].sort((a, b) => Number(a) - Number(b))) {
    expect(
      assets.manifestActions.has(actionId),
      `${mugenDir} manifest should include runtime-backed action ${actionId}`,
    ).toBe(true);
  }
}

function expectContentMappedActionsInHitboxes(
  mugenDir: string,
  contentMap: Record<string, string>,
  requiredContentKeys: string[],
): void {
  const assets = loadAssetActions(mugenDir);

  for (const contentKey of requiredContentKeys) {
    const actionId = contentMap[contentKey];
    expect(actionId, `${mugenDir} content key ${contentKey}`).toBeDefined();
    expect(
      assets.hitboxActions.has(actionId),
      `${mugenDir} hitboxes should include content action ${contentKey} -> ${actionId}`,
    ).toBe(true);
  }
}

describe('Terry/Kim runtime/content MUGEN action alignment', () => {
  it('keeps Terry runtime-backed actions aligned with content and manifest assets', () => {
    expectRuntimeNormalsToMatchContent('terry', TERRY_MUGEN_ACTION_MAP);
    expectRuntimeKeysToMatchContent('terry', TERRY_RUNTIME_TO_CONTENT_KEY, TERRY_MUGEN_ACTION_MAP);
    expectRuntimeBackedActionsInManifest('terry', 'cvsterry', TERRY_RUNTIME_TO_CONTENT_KEY);
  });

  it('keeps Kim runtime-backed actions aligned with content and manifest assets', () => {
    expectRuntimeNormalsToMatchContent('kim', KIM_MUGEN_ACTION_MAP);
    expectRuntimeKeysToMatchContent('kim', KIM_RUNTIME_TO_CONTENT_KEY, KIM_MUGEN_ACTION_MAP);
    expectRuntimeBackedActionsInManifest('kim', 'cvskim', KIM_RUNTIME_TO_CONTENT_KEY);
  });

  it('keeps Kim runtime-backed content actions backed by hitbox data', () => {
    expectContentMappedActionsInHitboxes(
      'cvskim',
      KIM_MUGEN_ACTION_MAP,
      [
        ...Object.keys(NORMAL_ATTACK_TYPE_BY_KEY),
        'KIM_HIENZAN',
        'KIM_HANGETSU',
        'KIM_HAKI',
        'KIM_HISHOU',
        'KIM_SANREN',
        'DM_PHOENIX_KICK',
        'SDM_PHOENIX_KICK',
        'DM_PHOENIX_HITEN',
        'SDM_PHOENIX_HITEN',
      ],
    );
  });
});
