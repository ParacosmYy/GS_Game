/**
 * K' Content Package — Animation Metadata (兼容入口)
 *
 * 此文件已迁移到 animations/kdashAnimations.ts，这里保留 re-export 兼容层。
 * 新代码应直接从 animations/kdashAnimations.js 导入。
 */
export {
  KDASH_ANIMATION_META,
  getKdashAnimationNames,
  getKdashAnimMeta,
  getKdashAttackAnimations,
  getKdashLoopAnimations,
  type AnimationMeta,
} from './animations/kdashAnimations.js';
