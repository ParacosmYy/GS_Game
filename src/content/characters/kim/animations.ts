/**
 * Kim Content Package — Animation Metadata (兼容入口)
 *
 * 此文件已迁移到 animations/kimAnimations.ts，这里保留 re-export 兼容层。
 * 新代码应直接从 animations/kimAnimations.js 导入。
 */
export {
  KIM_ANIMATION_META,
  getKimAnimationNames,
  getKimAnimMeta,
  getKimAttackAnimations,
  getKimLoopAnimations,
  type AnimationMeta,
} from './animations/kimAnimations.js';
