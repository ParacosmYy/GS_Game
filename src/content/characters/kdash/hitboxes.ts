/**
 * K' Content Package — Hitbox / Hurtbox Data (兼容入口)
 *
 * 此文件已迁移到 hitboxes/kdashHitboxes.ts，这里保留 re-export 兼容层。
 * 新代码应直接从 hitboxes/kdashHitboxes.js 导入。
 */
export {
  KDASH_HITBOX_KEYS,
  getKdashHitboxOffsets,
  KDASH_ATTACK_FRAME_KEYS,
  getKdashAttackFrames,
  KDASH_MUGEN_ACTION_MAP,
  hasKdashMugenData,
  getKdashMugenTiming,
  getKdashMugenActionSummary,
  getKdashAttackTiming,
} from './hitboxes/kdashHitboxes.js';
