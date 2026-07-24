import { describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { AttackType } from '../src/core/types.js';
import {
  getCharacterConfig,
  resolveGenericMugenAction,
} from '../src/rendering/sprites/shared/characterSpriteRegistry.js';
import {
  RUGAL_ATTACK_KEYS,
  RUGAL_MOVES,
  RUGAL_MUGEN_ACTION_MAP,
} from '../src/content/characters/rugal/index.js';
import {
  G_RUGAL_ATTACK_KEYS,
  G_RUGAL_MOVES,
  G_RUGAL_MUGEN_ACTION_MAP,
} from '../src/content/characters/g_rugal/index.js';
import { FighterState } from '../src/core/types.js';

import '../src/rendering/sprites/shared/characterSpriteConfigs.js';

const SPRITES_DIR = path.resolve(__dirname, '../public/sprites');

interface BossAssetActions {
  manifestActions: Set<string>;
  hitboxActions: Set<string>;
}

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

const EXPECTED_BOSS_NORMAL_ACTION_MAP: Record<string, string> = {
  STAND_A: '200',
  CLOSE_A: '200',
  STAND_B: '230',
  CLOSE_B: '231',
  STAND_C: '220',
  CLOSE_C: '221',
  STAND_D: '240',
  CLOSE_D: '241',
  CROUCH_A: '400',
  CROUCH_B: '430',
  CROUCH_C: '410',
  CROUCH_D: '440',
  JUMP_A: '600',
  JUMP_B: '630',
  JUMP_C: '610',
  JUMP_D: '640',
};

const RUGAL_RUNTIME_TO_CONTENT_KEY: Record<string, string> = {
  RUGAL_DARK_SMASH: 'RUGAL_DARK_SMASH',
  RUGAL_KAISER_WAVE: 'RUGAL_KAISER_WAVE',
  RUGAL_KAISER_WAVE_C: 'RUGAL_KAISER_WAVE_C',
  RUGAL_REPPU_KEN: 'RUGAL_REPPU_KEN',
  RUGAL_REPPU_KEN_C: 'RUGAL_REPPU_KEN_C',
  RUGAL_GENOCIDE_CUTTER: 'RUGAL_GENOCIDE_CUTTER',
  RUGAL_GENOCIDE_CUTTER_D: 'RUGAL_GENOCIDE_CUTTER_D',
  RUGAL_DARK_BARRIER: 'RUGAL_DARK_BARRIER',
  DM_GIGANTIC_PRESSURE: 'DM_RUGAL_GIGANTIC_PRESSURE',
  DM_DEAD_END_SCREAMER: 'DM_RUGAL_DEAD_END_SCREAMER',
};

const G_RUGAL_RUNTIME_TO_CONTENT_KEY: Record<string, string> = {
  OMEGA_DARK_SMASH: 'G_RUGAL_DARK_SMASH',
  OMEGA_KAISER_WAVE: 'G_RUGAL_KAISER_WAVE',
  OMEGA_KAISER_WAVE_C: 'G_RUGAL_KAISER_WAVE_C',
  OMEGA_REPPU_KEN: 'G_RUGAL_REPPU_KEN',
  OMEGA_REPPU_KEN_C: 'G_RUGAL_REPPU_KEN_C',
  OMEGA_GENOCIDE_CUTTER: 'G_RUGAL_GENOCIDE_CUTTER',
  OMEGA_GENOCIDE_CUTTER_D: 'G_RUGAL_GENOCIDE_CUTTER_D',
  OMEGA_DARK_BARRIER: 'G_RUGAL_DARK_BARRIER',
  DM_OMEGA_GIGANTIC_PRESSURE: 'DM_G_RUGAL_GIGANTIC_PRESSURE',
  DM_OMEGA_DEAD_END_SCREAMER: 'DM_G_RUGAL_DEAD_END_SCREAMER',
};

function loadBossAssetActions(mugenDir: string): BossAssetActions {
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

function collectContentActions(
  contentMap: Record<string, string>,
  runtimeToContentKey: Record<string, string>,
): string[] {
  const normalActions = Object.keys(NORMAL_ATTACK_TYPE_BY_KEY).map(key => contentMap[key]);
  const specialActions = Object.values(runtimeToContentKey).map(key => contentMap[key]);

  return [...new Set([...normalActions, ...specialActions])].sort((a, b) => Number(a) - Number(b));
}

function collectMoveVersionKeys(
  moves: Array<{ versions: Array<{ attackTypeKey: string }> }>,
): string[] {
  return [...new Set(moves.flatMap(move => move.versions.map(version => version.attackTypeKey)))].sort();
}

function expectContentPackageKeysToShareMugenActions(
  label: string,
  attackKeys: string[],
  moves: Array<{ key: string; versions: Array<{ attackTypeKey: string }> }>,
  contentMap: Record<string, string>,
): void {
  const actionKeys = Object.keys(contentMap).sort();
  const packageAttackKeys = [...attackKeys].sort();
  const moveKeys = moves.map(move => move.key).sort();
  const moveVersionKeys = collectMoveVersionKeys(moves);

  expect(packageAttackKeys, `${label} attack keys should match MUGEN action map keys`).toEqual(actionKeys);

  const missingMoveKeys = moveKeys.filter(key => !contentMap[key]);
  const missingMoveVersionKeys = moveVersionKeys.filter(key => !contentMap[key]);
  const undeclaredMoveKeys = moveKeys.filter(key => !packageAttackKeys.includes(key));
  const undeclaredMoveVersionKeys = moveVersionKeys.filter(key => !packageAttackKeys.includes(key));

  expect(missingMoveKeys, `${label} move keys missing MUGEN actions`).toEqual([]);
  expect(missingMoveVersionKeys, `${label} move version keys missing MUGEN actions`).toEqual([]);
  expect(undeclaredMoveKeys, `${label} move keys missing attack declarations`).toEqual([]);
  expect(undeclaredMoveVersionKeys, `${label} move version keys missing attack declarations`).toEqual([]);
}

function expectRuntimeNormalsToMatchContent(
  charId: string,
  contentMap: Record<string, string>,
): void {
  const config = getCharacterConfig(charId);
  expect(config, `${charId} sprite config`).toBeDefined();

  for (const [attackKey, attackType] of Object.entries(NORMAL_ATTACK_TYPE_BY_KEY)) {
    expect(
      config!.specialMap[attackType],
      `${charId} runtime ${attackKey} action should match content MUGEN action`,
    ).toBe(contentMap[attackKey]);
  }
}

function expectContentNormalsToMatchMugenCmd(contentMap: Record<string, string>): void {
  for (const [attackKey, actionId] of Object.entries(EXPECTED_BOSS_NORMAL_ACTION_MAP)) {
    expect(
      contentMap[attackKey],
      `content ${attackKey} should match Rugal/Omega Rugal MUGEN CMD normal action`,
    ).toBe(actionId);
  }
}

function expectRuntimeSpecialsToFollowContent(
  charId: string,
  runtimeToContentKey: Record<string, string>,
  contentMap: Record<string, string>,
): void {
  const config = getCharacterConfig(charId);
  expect(config, `${charId} sprite config`).toBeDefined();

  for (const [runtimeAttackType, contentKey] of Object.entries(runtimeToContentKey)) {
    const expectedAction = contentMap[contentKey];
    expect(expectedAction, `${charId} content key ${contentKey}`).toBeDefined();

    const resolved = resolveGenericMugenAction(
      config!,
      FighterState.STAND_ATTACK,
      runtimeAttackType as AttackType,
      0,
      1,
    );

    expect(
      resolved,
      `${charId} runtime ${runtimeAttackType} should resolve to content ${contentKey}`,
    ).toBe(expectedAction);
    expect(resolved, `${charId} ${runtimeAttackType} must not use stand fallback`).not.toBe('201');
  }
}

function expectContentActionsToExistInAssets(
  mugenDir: string,
  contentMap: Record<string, string>,
  runtimeToContentKey: Record<string, string>,
): void {
  const assets = loadBossAssetActions(mugenDir);
  const actions = collectContentActions(contentMap, runtimeToContentKey);

  for (const actionId of actions) {
    expect(
      assets.manifestActions.has(actionId),
      `${mugenDir} manifest should include action ${actionId}`,
    ).toBe(true);
    expect(
      assets.hitboxActions.has(actionId),
      `${mugenDir} hitboxes should include action ${actionId}`,
    ).toBe(true);
  }
}

describe('boss runtime/content MUGEN action alignment', () => {
  it('keeps Rugal content attack, move, and MUGEN action keys in one package contract', () => {
    expectContentPackageKeysToShareMugenActions(
      'Rugal',
      RUGAL_ATTACK_KEYS,
      RUGAL_MOVES,
      RUGAL_MUGEN_ACTION_MAP,
    );
  });

  it('keeps Rugal runtime normal actions aligned with content hitbox map', () => {
    expectContentNormalsToMatchMugenCmd(RUGAL_MUGEN_ACTION_MAP);
    expectRuntimeNormalsToMatchContent('rugal', RUGAL_MUGEN_ACTION_MAP);
  });

  it('keeps Rugal runtime specials and DMs aligned with content hitbox map', () => {
    expectRuntimeSpecialsToFollowContent('rugal', RUGAL_RUNTIME_TO_CONTENT_KEY, RUGAL_MUGEN_ACTION_MAP);
  });

  it('keeps every Rugal runtime action backed by manifest animation and hitboxes', () => {
    expectContentActionsToExistInAssets('cvsrugal', RUGAL_MUGEN_ACTION_MAP, RUGAL_RUNTIME_TO_CONTENT_KEY);
  });

  it('keeps Omega Rugal content attack, move, and MUGEN action keys in one package contract', () => {
    expectContentPackageKeysToShareMugenActions(
      'Omega Rugal',
      G_RUGAL_ATTACK_KEYS,
      G_RUGAL_MOVES,
      G_RUGAL_MUGEN_ACTION_MAP,
    );
  });

  it('keeps Omega Rugal runtime normal actions aligned with content hitbox map', () => {
    expectContentNormalsToMatchMugenCmd(G_RUGAL_MUGEN_ACTION_MAP);
    expectRuntimeNormalsToMatchContent('g_rugal', G_RUGAL_MUGEN_ACTION_MAP);
  });

  it('keeps Omega Rugal runtime specials and DMs aligned with content hitbox map', () => {
    expectRuntimeSpecialsToFollowContent('g_rugal', G_RUGAL_RUNTIME_TO_CONTENT_KEY, G_RUGAL_MUGEN_ACTION_MAP);
  });

  it('keeps every Omega Rugal runtime action backed by manifest animation and hitboxes', () => {
    expectContentActionsToExistInAssets('cvsg_rugal', G_RUGAL_MUGEN_ACTION_MAP, G_RUGAL_RUNTIME_TO_CONTENT_KEY);
  });
});
