/**
 * Iori Content Package — Hitbox / Hurtbox Data (兼容入口)
 *
 * 此文件已迁移到 hitboxes/ioriHitboxes.ts，这里保留 re-export 兼容层。
 * 新代码应直接从 hitboxes/ioriHitboxes.js 导入。
 */
export {
  IORI_HITBOX_KEYS,
  getIoriHitboxOffsets,
  IORI_ATTACK_FRAME_KEYS,
  getIoriAttackFrames,
  IORI_MUGEN_ACTION_MAP,
  hasIoriMugenData,
  getIoriMugenTiming,
  getIoriMugenActionSummary,
  getIoriAttackTiming,
} from './hitboxes/ioriHitboxes.js';
