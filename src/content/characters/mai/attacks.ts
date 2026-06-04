/**
 * Mai Content Package — Attack Definitions (兼容入口)
 *
 * 此文件已迁移到 attacks/maiAttacks.ts，这里保留 re-export 兼容层。
 * 新代码应直接从 attacks/maiAttacks.js 导入。
 */
export {
  MAI_ATTACK_KEYS,
  getMaiFrameData,
  getMaiAttackFrameData,
} from './attacks/maiAttacks.js';
