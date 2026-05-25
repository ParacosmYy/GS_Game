/**
 * 角色系统 — Roster 注册表
 *
 * 加新角色: 1) 创建 charDef 文件  2) 导入这里  3) 加入 ROSTER 数组
 * 不需要改 FighterController / main.ts / renderer
 */
import type { CharacterDefinition } from './types.js';
import { KyoDef } from './kyo.js';
import { IoriDef } from './iori.js';
import { TerryDef } from './terry.js';
import { KimDef } from './kim.js';
import { RyoDef } from './ryo.js';
import { LeonaDef } from './leona.js';
import { KulaDef } from './kula.js';
import { KdashDef } from './kdash.js';
import { RobertDef } from './robert.js';
import { AthenaDef } from './athena.js';
import { MaiDef } from './mai.js';
export type { CharacterDefinition } from './types.js';

/** 全角色列表 — 选人界面和游戏初始化都从这里读取 */
export const ROSTER: CharacterDefinition[] = [
  KyoDef,
  IoriDef,
  TerryDef,
  KimDef,
  RyoDef,
  LeonaDef,
  KulaDef,
  KdashDef,
  RobertDef,
  AthenaDef,
  MaiDef,
];
