/**
 * Yashiro Content Package — Hitbox / Hurtbox Data (兼容入口)
 *
 * 此文件已迁移到 hitboxes/yashiroHitboxes.ts，这里保留 re-export 兼容层。
 * 新代码应直接从 hitboxes/yashiroHitboxes.js 导入。
 */
export {
  YASHIRO_HITBOX_KEYS,
  getYashiroHitboxOffsets,
  YASHIRO_ATTACK_FRAME_KEYS,
  getYashiroAttackFrames,
} from './hitboxes/yashiroHitboxes.js';
