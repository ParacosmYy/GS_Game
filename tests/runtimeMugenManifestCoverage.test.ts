import { describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { AttackType, FighterState } from '../src/core/types.js';
import {
  getCharacterConfig,
  resolveGenericMugenAction,
  type CharacterSpriteConfig,
} from '../src/rendering/sprites/shared/characterSpriteRegistry.js';
import { YASHIRO_MUGEN_ACTION_MAP } from '../src/content/characters/yashiro/index.js';

import '../src/rendering/sprites/shared/characterSpriteConfigs.js';

const SPRITES_DIR = path.resolve(__dirname, '../public/sprites');

const KOF2002_RUNTIME_CHARACTERS = [
  { charId: 'kyo', mugenDir: 'cvskyo' },
  { charId: 'ryo', mugenDir: 'cvsryo' },
  { charId: 'iori', mugenDir: 'yiori' },
  { charId: 'terry', mugenDir: 'cvsterry' },
  { charId: 'andy', mugenDir: 'andy' },
  { charId: 'kim', mugenDir: 'cvskim' },
  { charId: 'athena', mugenDir: 'cvsathena' },
  { charId: 'kensou', mugenDir: 'kensou' },
  { charId: 'mai', mugenDir: 'mai' },
  { charId: 'yuri', mugenDir: 'cvsyuri' },
  { charId: 'vice', mugenDir: 'cvsvice' },
  { charId: 'yamazaki', mugenDir: 'cvsyamazaki' },
  { charId: 'shermie', mugenDir: 'shermie' },
  { charId: 'benimaru', mugenDir: 'cvsbenimaru' },
  { charId: 'clark', mugenDir: 'clark' },
  { charId: 'kdash', mugenDir: 'kdash' },
  { charId: 'yashiro', mugenDir: 'yashiro' },
  { charId: 'takuma', mugenDir: 'takuma' },
  { charId: 'rugal', mugenDir: 'cvsrugal' },
  { charId: 'g_rugal', mugenDir: 'cvsg_rugal' },
] as const;

interface NormalProbe {
  label: string;
  attackType: AttackType;
  state: FighterState;
}

const NORMAL_PROBES: NormalProbe[] = [
  { label: 'close_a', attackType: AttackType.CLOSE_A, state: FighterState.STAND_ATTACK },
  { label: 'close_b', attackType: AttackType.CLOSE_B, state: FighterState.STAND_ATTACK },
  { label: 'close_c', attackType: AttackType.CLOSE_C, state: FighterState.STAND_ATTACK },
  { label: 'close_d', attackType: AttackType.CLOSE_D, state: FighterState.STAND_ATTACK },
  { label: 'stand_a', attackType: AttackType.STAND_A, state: FighterState.STAND_ATTACK },
  { label: 'stand_b', attackType: AttackType.STAND_B, state: FighterState.STAND_ATTACK },
  { label: 'stand_c', attackType: AttackType.STAND_C, state: FighterState.STAND_ATTACK },
  { label: 'stand_d', attackType: AttackType.STAND_D, state: FighterState.STAND_ATTACK },
  { label: 'crouch_a', attackType: AttackType.CROUCH_A, state: FighterState.CROUCH_ATTACK },
  { label: 'crouch_b', attackType: AttackType.CROUCH_B, state: FighterState.CROUCH_ATTACK },
  { label: 'crouch_c', attackType: AttackType.CROUCH_C, state: FighterState.CROUCH_ATTACK },
  { label: 'crouch_d', attackType: AttackType.CROUCH_D, state: FighterState.CROUCH_ATTACK },
  { label: 'jump_a', attackType: AttackType.JUMP_A, state: FighterState.AIR_ATTACK },
  { label: 'jump_b', attackType: AttackType.JUMP_B, state: FighterState.AIR_ATTACK },
  { label: 'jump_c', attackType: AttackType.JUMP_C, state: FighterState.AIR_ATTACK },
  { label: 'jump_d', attackType: AttackType.JUMP_D, state: FighterState.AIR_ATTACK },
];

interface MissingRuntimeAction {
  charId: string;
  attackType: string;
  actionId: string;
  mugenDir: string;
}

const KNOWN_SOURCE_GAPS: MissingRuntimeAction[] = [
  {
    charId: 'yashiro',
    attackType: AttackType.DM_ARMAGEDDON_BUSTERS,
    actionId: '3000',
    mugenDir: 'yashiro',
  },
  {
    charId: 'yashiro',
    attackType: AttackType.SDM_ARMAGEDDON_BUSTERS,
    actionId: '3100',
    mugenDir: 'yashiro',
  },
  {
    charId: 'yuri',
    attackType: AttackType.HSDM_YURI_HISHOU_KUURETSU_ZAN,
    actionId: '3300',
    mugenDir: 'cvsyuri',
  },
];

function normalizeActionId(actionId: string): string {
  const numeric = Number(actionId);
  return Number.isNaN(numeric) ? actionId : String(numeric);
}

function loadManifestActions(mugenDir: string): Set<string> {
  const manifestPath = path.join(SPRITES_DIR, mugenDir, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as {
    animations: Record<string, unknown>;
  };

  return new Set(Object.keys(manifest.animations).map(normalizeActionId));
}

function loadHitboxActions(mugenDir: string): Set<string> {
  const hitboxPath = path.join(SPRITES_DIR, mugenDir, 'hitboxes.json');
  const hitboxes = JSON.parse(fs.readFileSync(hitboxPath, 'utf8')) as {
    actions: Record<string, unknown>;
  };

  return new Set(Object.keys(hitboxes.actions).map(normalizeActionId));
}

function loadRuntimeConfig(
  expected: typeof KOF2002_RUNTIME_CHARACTERS[number],
): CharacterSpriteConfig {
  const config = getCharacterConfig(expected.charId);
  expect(config, `${expected.charId} sprite config`).toBeDefined();
  expect(config!.mugenDir, `${expected.charId} MUGEN directory`).toBe(expected.mugenDir);
  return config!;
}

function resolveNormalAction(config: CharacterSpriteConfig, probe: NormalProbe): string {
  const actionId = resolveGenericMugenAction(
    config,
    probe.state,
    probe.attackType,
    0,
    1,
  );
  expect(
    actionId,
    `${config.charId} ${probe.label} should resolve through the runtime MUGEN mapper`,
  ).not.toBeNull();
  return normalizeActionId(actionId!);
}

function collectMissingSpecialMapActions(): MissingRuntimeAction[] {
  const missing: MissingRuntimeAction[] = [];

  for (const expected of KOF2002_RUNTIME_CHARACTERS) {
    const config = loadRuntimeConfig(expected);
    const manifestActions = loadManifestActions(config.mugenDir);

    for (const [attackType, configuredActionId] of Object.entries(config.specialMap)) {
      if (!configuredActionId) continue;
      const actionId = normalizeActionId(configuredActionId);
      const resolved = resolveGenericMugenAction(
        config,
        FighterState.STAND_ATTACK,
        attackType as AttackType,
        0,
        1,
      );

      expect(
        normalizeActionId(resolved!),
        `${config.charId} ${attackType} should resolve its configured action`,
      ).toBe(actionId);

      if (!manifestActions.has(actionId)) {
        missing.push({
          charId: config.charId,
          attackType,
          actionId,
          mugenDir: config.mugenDir,
        });
      }
    }
  }

  return missing.sort((left, right) => (
    left.charId.localeCompare(right.charId)
    || left.attackType.localeCompare(right.attackType)
  ));
}

describe('KOF2002 runtime MUGEN manifest coverage', () => {
  it.each(KOF2002_RUNTIME_CHARACTERS)(
    '$charId backs all 16 runtime normals with real manifest animations',
    (expected) => {
      const config = loadRuntimeConfig(expected);
      const manifestActions = loadManifestActions(config.mugenDir);

      for (const probe of NORMAL_PROBES) {
        const actionId = resolveNormalAction(config, probe);
        expect(
          manifestActions.has(actionId),
          `${config.charId} ${probe.label} -> ${actionId} missing from ${config.mugenDir}`,
        ).toBe(true);
      }
    },
  );

  it('keeps every source-backed specialMap action in its real manifest', () => {
    expect(collectMissingSpecialMapActions()).toEqual(KNOWN_SOURCE_GAPS);
  });

  it('tracks the remaining source animation gaps without substituting lookalike actions', () => {
    const yuri = loadRuntimeConfig({ charId: 'yuri', mugenDir: 'cvsyuri' });
    const yashiro = loadRuntimeConfig({ charId: 'yashiro', mugenDir: 'yashiro' });
    const yuriManifestActions = loadManifestActions(yuri.mugenDir);
    const yashiroManifestActions = loadManifestActions(yashiro.mugenDir);
    const yuriHsdmAction = yuri.specialMap[AttackType.HSDM_YURI_HISHOU_KUURETSU_ZAN];
    const yashiroDmAction = yashiro.specialMap[AttackType.DM_ARMAGEDDON_BUSTERS];
    const yashiroSdmAction = yashiro.specialMap[AttackType.SDM_ARMAGEDDON_BUSTERS];

    expect(yuriManifestActions.has(yuriHsdmAction!)).toBe(false);
    expect(yashiroManifestActions.has(yashiroDmAction!)).toBe(false);
    expect(yashiroManifestActions.has(yashiroSdmAction!)).toBe(false);
    expect(collectMissingSpecialMapActions()).toEqual(KNOWN_SOURCE_GAPS);
  });

  it('pins Yashiro runtime specials to source-backed manifest actions', () => {
    const yashiro = loadRuntimeConfig({ charId: 'yashiro', mugenDir: 'yashiro' });
    const manifestActions = loadManifestActions(yashiro.mugenDir);
    const hitboxActions = loadHitboxActions(yashiro.mugenDir);
    const expectedActions: Partial<Record<AttackType, string>> = {
      [AttackType.YASHIRO_SHUU_WANI]: '250',
      [AttackType.YASHIRO_JUU_ZUTSU]: '260',
      [AttackType.YASHIRO_UPPER_DU]: '1000',
      [AttackType.YASHIRO_UPPER_DU_C]: '1001',
    };

    expect(yashiro.specialMap).toMatchObject(expectedActions);

    for (const [attackType, actionId] of Object.entries(expectedActions)) {
      expect(
        YASHIRO_MUGEN_ACTION_MAP[attackType],
        `Yashiro content ${attackType} action`,
      ).toBe(actionId);
      expect(
        manifestActions.has(actionId),
        `Yashiro manifest ${attackType} -> ${actionId}`,
      ).toBe(true);
      expect(
        hitboxActions.has(actionId),
        `Yashiro hitboxes ${attackType} -> ${actionId}`,
      ).toBe(true);
    }
  });
});
