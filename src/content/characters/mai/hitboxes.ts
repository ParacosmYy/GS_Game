/**
 * Mai Content Package — Hitbox / Hurtbox Data (兼容入口)
 *
 * 此文件已迁移到 hitboxes/maiHitboxes.ts，这里保留 re-export 兼容层。
 * 新代码应直接从 hitboxes/maiHitboxes.js 导入。
 */
export {
  MAI_HITBOX_KEYS,
  getMaiHitboxOffsets,
  MAI_ATTACK_FRAME_KEYS,
  getMaiAttackFrames,
  MAI_MUGEN_ACTION_MAP,
  hasMaiMugenData,
  getMaiMugenTiming,
  getMaiMugenActionSummary,
  getMaiAttackTiming,
} from './hitboxes/maiHitboxes.js';
