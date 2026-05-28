/**
 * Vice Content Package — Hitbox / Hurtbox Data (兼容入口)
 *
 * 此文件已迁移到 hitboxes/viceHitboxes.ts，这里保留 re-export 兼容层。
 * 新代码应直接从 hitboxes/viceHitboxes.js 导入。
 */
export {
  VICE_HITBOX_KEYS,
  getViceHitboxOffsets,
  VICE_ATTACK_FRAME_KEYS,
  getViceAttackFrames,
} from './hitboxes/viceHitboxes.js';
