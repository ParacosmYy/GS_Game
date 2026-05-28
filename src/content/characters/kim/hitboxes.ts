/**
 * Kim Content Package — Hitbox / Hurtbox Data (兼容入口)
 *
 * 此文件已迁移到 hitboxes/kimHitboxes.ts，这里保留 re-export 兼容层。
 * 新代码应直接从 hitboxes/kimHitboxes.js 导入。
 */
export {
  KIM_HITBOX_KEYS,
  getKimHitboxOffsets,
  KIM_ATTACK_FRAME_KEYS,
  getKimAttackFrames,
} from './hitboxes/kimHitboxes.js';
