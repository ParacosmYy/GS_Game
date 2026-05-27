/**
 * Kyo Content Package — Command / Input Routing (兼容入口)
 *
 * 此文件已迁移到 commands/kyoCommands.ts，这里保留 re-export 兼容层。
 * 新代码应直接从 commands/kyoCommands.js 导入。
 */
export {
  KYO_MOVE_LIST,
  KYO_WIN_QUOTES,
  KYO_AVAILABLE_ACTIONS,
  type KyoMoveEntry,
} from './commands/kyoCommands.js';
