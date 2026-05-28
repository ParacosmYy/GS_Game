/**
 * Kim Content Package — Attack Definitions (兼容入口)
 *
 * 此文件已迁移到 attacks/kimAttacks.ts，这里保留 re-export 兼容层。
 * 新代码应直接从 attacks/kimAttacks.js 导入。
 */
export {
  KIM_ATTACK_KEYS,
  getKimFrameData,
  getKimAttackFrameData,
} from './attacks/kimAttacks.js';
