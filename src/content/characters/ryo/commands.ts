/**
 * Ryo Content Package — Command / Input Routing (兼容入口)
 *
 * 此文件已迁移到 commands/ryoCommands.ts，这里保留 re-export 兼容层。
 * 新代码应直接从 commands/ryoCommands.js 导入。
 */
export {
  RYO_MOVE_LIST,
  RYO_WIN_QUOTES,
  RYO_AVAILABLE_ACTIONS,
  type RyoMoveEntry,
} from './commands/ryoCommands.js';
