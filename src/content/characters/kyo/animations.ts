/**
 * Kyo Content Package — Animation Metadata (兼容入口)
 *
 * 此文件已迁移到 animations/kyoAnimations.ts，这里保留 re-export 兼容层。
 * 新代码应直接从 animations/kyoAnimations.js 导入。
 */
export {
  KYO_ANIMATION_META,
  getKyoAnimationNames,
  getKyoAnimMeta,
  getKyoAttackAnimations,
  getKyoLoopAnimations,
  type AnimationMeta,
} from './animations/kyoAnimations.js';
