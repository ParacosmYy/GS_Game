/**
 * Athena Content Package — MUGEN Action Report
 *
 * 归属: content/characters/athena/reports/ — 记录 Athena 内容包动作映射、
 * manifest 动画覆盖和仍需 legacy 判定 fallback 的真实素材闭环状态。
 */
import { ATHENA_ATTACK_KEYS } from '../attacks/athenaAttacks.js';
import { ATHENA_MOVES } from '../moves/athenaMoves.js';
import { ATHENA_MUGEN_ACTION_MAP } from '../hitboxes/athenaHitboxes.js';

export interface AthenaMugenActionReport {
  characterId: 'athena';
  mugenDir: 'cvsathena';
  attackKeyCount: number;
  moveVersionKeyCount: number;
  mappedActionCount: number;
  runtimeBackedActionCount: number;
  manifestBackedActionCount: number;
  hitboxBackedActionCount: number;
  manifestClean: boolean;
  manifestMissingSpriteRefCount: number;
  manifestOrphanedSpriteCount: number;
  missingMoveActionKeys: string[];
  fallbackHitboxKeys: string[];
  notes: string[];
}

const RUNTIME_BACKED_ACTION_KEYS = [
  'STAND_A', 'STAND_B', 'STAND_C', 'STAND_D',
  'CLOSE_A', 'CLOSE_B', 'CLOSE_C', 'CLOSE_D',
  'CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D',
  'JUMP_A', 'JUMP_B', 'JUMP_C', 'JUMP_D',
  'ATHENA_PHOENIX_REFLECT',
  'ATHENA_LOW_B',
  'ATHENA_AIR_B',
  'ATHENA_PSYCHO_BALL',
  'ATHENA_PSYCHO_BALL_C',
  'ATHENA_PSYCHO_SWORD',
  'ATHENA_PSYCHO_SWORD_C',
  'ATHENA_PHOENIX_ARROW',
  'DM_SHINING_CRYSTAL_BIT',
  'SDM_SHINING_CRYSTAL_BIT',
];

const HITBOX_BACKED_ACTION_IDS = new Set([
  '200', '210', '211', '230', '231', '240', '241',
  '250', '400', '410', '430', '440', '450',
  '600', '610', '630', '640', '700', '1100',
]);

function collectMoveVersionKeys(): string[] {
  return [...new Set(ATHENA_MOVES.flatMap(move => move.versions.map(version => version.attackTypeKey)))].sort();
}

export function generateAthenaMugenActionReport(): AthenaMugenActionReport {
  const mappedKeys = Object.keys(ATHENA_MUGEN_ACTION_MAP).sort();
  const moveVersionKeys = collectMoveVersionKeys();
  const missingMoveActionKeys = moveVersionKeys.filter(key => !ATHENA_MUGEN_ACTION_MAP[key]);
  const fallbackHitboxKeys = mappedKeys
    .filter(key => !HITBOX_BACKED_ACTION_IDS.has(ATHENA_MUGEN_ACTION_MAP[key]))
    .sort();

  return {
    characterId: 'athena',
    mugenDir: 'cvsathena',
    attackKeyCount: ATHENA_ATTACK_KEYS.length,
    moveVersionKeyCount: moveVersionKeys.length,
    mappedActionCount: mappedKeys.length,
    runtimeBackedActionCount: RUNTIME_BACKED_ACTION_KEYS.length,
    manifestBackedActionCount: mappedKeys.length,
    hitboxBackedActionCount: mappedKeys.length - fallbackHitboxKeys.length,
    manifestClean: false,
    manifestMissingSpriteRefCount: 140,
    manifestOrphanedSpriteCount: 50,
    missingMoveActionKeys,
    fallbackHitboxKeys,
    notes: [
      'public/sprites/cvsathena/manifest.json contains the mapped visual actions.',
      'npx tsx src/tools/validateManifests.ts --dir cvsathena currently reports 140 missing sprite refs and 50 orphaned sprites.',
      'Projectile, teleport, and DM helper-driven actions may still need legacy hitbox fallback until AIR helper hitboxes are converted.',
      'Runtime sprite config remains the consumer-side map; this report keeps the Athena content package gaps visible.',
    ],
  };
}
