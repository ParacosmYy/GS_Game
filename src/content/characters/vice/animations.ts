/**
 * Vice Content Package — Animation Metadata (兼容入口)
 *
 * 此文件已迁移到 animations/viceAnimations.ts，这里保留 re-export 兼容层。
 * 新代码应直接从 animations/viceAnimations.js 导入。
 */
export {
  VICE_ANIMATION_META,
  getViceAnimationNames,
  getViceAnimMeta,
  getViceAttackAnimations,
  getViceLoopAnimations,
  type AnimationMeta,
} from './animations/viceAnimations.js';
