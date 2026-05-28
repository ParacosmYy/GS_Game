/**
 * Terry Content Package — Animation Metadata (兼容入口)
 *
 * 此文件已迁移到 animations/terryAnimations.ts，这里保留 re-export 兼容层。
 * 新代码应直接从 animations/terryAnimations.js 导入。
 */
export {
  TERRY_ANIMATION_META,
  getTerryAnimationNames,
  getTerryAnimMeta,
  getTerryAttackAnimations,
  getTerryLoopAnimations,
  type AnimationMeta,
} from './animations/terryAnimations.js';
