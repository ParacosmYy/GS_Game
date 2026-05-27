/**
 * Ryo Content Package — Hitbox / Hurtbox Data (兼容入口)
 *
 * 此文件已迁移到 hitboxes/ryoHitboxes.ts，这里保留 re-export 兼容层。
 * 新代码应直接从 hitboxes/ryoHitboxes.js 导入。
 */
export {
  RYO_HITBOX_KEYS,
  getRyoHitboxOffsets,
  RYO_ATTACK_FRAME_KEYS,
  getRyoAttackFrames,
} from './hitboxes/ryoHitboxes.js';
