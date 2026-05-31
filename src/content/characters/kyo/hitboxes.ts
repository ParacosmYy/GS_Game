/**
 * Kyo Content Package — Hitbox / Hurtbox Data (兼容入口)
 *
 * 此文件已迁移到 hitboxes/kyoHitboxes.ts，这里保留 re-export 兼容层。
 * 新代码应直接从 hitboxes/kyoHitboxes.js 导入。
 */
export {
  KYO_HITBOX_KEYS,
  getKyoHitboxOffsets,
  KYO_ATTACK_FRAME_KEYS,
  getKyoAttackFrames,
  KYO_MUGEN_ACTION_MAP,
  hasKyoMugenData,
  getKyoMugenTiming,
  getKyoMugenActionSummary,
  getKyoAttackTiming,
} from './hitboxes/kyoHitboxes.js';
