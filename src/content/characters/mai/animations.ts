/**
 * Mai Content Package — Animation Metadata (兼容入口)
 *
 * 此文件已迁移到 animations/maiAnimations.ts，这里保留 re-export 兼容层。
 * 新代码应直接从 animations/maiAnimations.js 导入。
 */
export {
  MAI_ANIMATION_META,
  getMaiAnimationNames,
  getMaiAnimMeta,
  getMaiAttackAnimations,
  getMaiLoopAnimations,
  type AnimationMeta,
} from './animations/maiAnimations.js';
