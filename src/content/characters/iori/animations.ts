/**
 * Iori Content Package — Animation Metadata (兼容入口)
 *
 * 此文件已迁移到 animations/ioriAnimations.ts，这里保留 re-export 兼容层。
 * 新代码应直接从 animations/ioriAnimations.js 导入。
 */
export {
  IORI_ANIMATION_META,
  getIoriAnimationNames,
  getIoriAnimMeta,
  getIoriAttackAnimations,
  getIoriLoopAnimations,
  type AnimationMeta,
} from './animations/ioriAnimations.js';
