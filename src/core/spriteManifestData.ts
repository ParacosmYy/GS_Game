/**
 * Sprite Manifest Data — 全角色最小 manifest 数据
 *
 * 当前阶段：每个角色只有 fallbackColors，无实际 atlas 或动画帧数据。
 * 未来资产管线就绪后，通过工具层离线生成完整 manifest 注入此处。
 *
 * 颜色来源：各角色 CharacterDefinition 中的 color / accentColor / specialColor
 * 映射规则：
 *   body  → 肤色（统一 #FFD699，待角色数据细化后区分）
 *   head  → 肤色（同 body）
 *   outfit → CharacterDefinition.color（角色主色/服装色）
 *   hair  → 角色特征发色（从角色设定推导）
 *
 * 归属: core/ — 只依赖 spriteManifest 类型，不持有运行时逻辑
 */

import type { SpriteManifest } from './spriteManifest.js';

export const SPRITE_MANIFEST: SpriteManifest = {
  version: 1,
  characters: {},
};

/**
 * 全角色 fallback 颜色表
 *
 * 29个角色按 ROSTER 注册顺序排列。
 * body/head 暂用统一肤色，未来替换为角色精确 palette 后可区分。
 */
const CHARACTER_COLORS: Record<string, { body: string; head: string; outfit: string; hair: string }> = {
  // ── 日本队 ──
  kyo:    { body: '#FFD699', head: '#FFD699', outfit: '#FF6600', hair: '#1A1A2E' },
  iori:   { body: '#FFD699', head: '#FFD699', outfit: '#AA1133', hair: '#C41E3A' },
  // ── 饿狼队 ──
  terry:  { body: '#FFD699', head: '#FFD699', outfit: '#CC8800', hair: '#FFD700' },
  andy:   { body: '#FFD699', head: '#FFD699', outfit: '#FFAA22', hair: '#DAA520' },
  joe:    { body: '#FFD699', head: '#FFD699', outfit: '#FF8800', hair: '#2F2F2F' },
  // ── 韩国队 ──
  kim:    { body: '#FFD699', head: '#FFD699', outfit: '#2288CC', hair: '#1A1A2E' },
  chang:  { body: '#FFD699', head: '#FFD699', outfit: '#885522', hair: '#2F2F2F' },
  choi:   { body: '#FFD699', head: '#FFD699', outfit: '#66CC66', hair: '#4A4A4A' },
  // ── 极限流队 ──
  ryo:    { body: '#FFD699', head: '#FFD699', outfit: '#DD6600', hair: '#8B4513' },
  robert: { body: '#FFD699', head: '#FFD699', outfit: '#22AA44', hair: '#DAA520' },
  // ── 怒队 ──
  leona:  { body: '#FFD699', head: '#FFD699', outfit: '#2266BB', hair: '#C0C0C0' },
  ralf:   { body: '#FFD699', head: '#FFD699', outfit: '#CC6633', hair: '#8B4513' },
  clark:  { body: '#FFD699', head: '#FFD699', outfit: '#556B2F', hair: '#DAA520' },
  // ── 超能力队 ──
  athena: { body: '#FFD699', head: '#FFD699', outfit: '#FF66AA', hair: '#8B008B' },
  // ── 女性格斗家队 ──
  mai:    { body: '#FFD699', head: '#FFD699', outfit: '#FF4488', hair: '#1A1A2E' },
  // ── K'队 ──
  kdash:  { body: '#FFD699', head: '#FFD699', outfit: '#444466', hair: '#C0C0C0' },
  kula:   { body: '#FFD699', head: '#FFD699', outfit: '#4488CC', hair: '#B0C4DE' },
  // ── 大蛇队 ──
  yashiro:{ body: '#FFD699', head: '#FFD699', outfit: '#664488', hair: '#E8E8E8' },
  shermie:{ body: '#FFD699', head: '#FFD699', outfit: '#CC44AA', hair: '#8B4513' },
  chris:  { body: '#FFD699', head: '#FFD699', outfit: '#FF8844', hair: '#DAA520' },
  // ── 大蛇四天王 ──
  mature: { body: '#FFD699', head: '#FFD699', outfit: '#882255', hair: '#DAA520' },
  vice:   { body: '#FFD699', head: '#FFD699', outfit: '#3366AA', hair: '#C0C0C0' },
  // ── 其他 ──
  billy:  { body: '#FFD699', head: '#FFD699', outfit: '#4488CC', hair: '#FFD700' },
  yamazaki:{ body: '#FFD699', head: '#FFD699', outfit: '#556622', hair: '#1A1A2E' },
  mary:   { body: '#FFD699', head: '#FFD699', outfit: '#5588CC', hair: '#DAA520' },
  xiangfei:{ body: '#FFD699', head: '#FFD699', outfit: '#EE6688', hair: '#1A1A2E' },
  kasumi: { body: '#FFD699', head: '#FFD699', outfit: '#DD4466', hair: '#1A1A2E' },
};

// 填充 manifest — 每个角色创建最小条目
for (const [charId, colors] of Object.entries(CHARACTER_COLORS)) {
  SPRITE_MANIFEST.characters[charId] = {
    charId,
    atlasPath: `assets/sprites/${charId}.png`,
    animations: {},
    fallbackColors: colors,
  };
}
