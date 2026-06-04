/**
 * Mai Content Package — Command / Input Routing (兼容入口)
 *
 * 此文件已迁移到 commands/maiCommands.ts，这里保留 re-export 兼容层。
 * 新代码应直接从 commands/maiCommands.js 导入。
 */
export {
  MAI_MOVE_LIST,
  MAI_WIN_QUOTES,
  MAI_AVAILABLE_ACTIONS,
  type MaiMoveEntry,
} from './commands/maiCommands.js';
