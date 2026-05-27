/**
 * Portrait Manifest — 肖像 manifest 类型定义、查询接口与数据
 *
 * 角色肖像用于选人界面、VS 画面、HUD 和胜利画面。
 * 当前阶段：所有角色已有 PixelPortraitData 像素肖像（64×80），通过
 * CharacterDefinition.pixelPortrait 提供给渲染管线。
 * hasPixelPortrait=true 标记表示该角色有真实像素数据可用。
 * Ryo 已升级为多尺寸肖像（48×48 HUD, 120×120 select, 160×160 VS），
 * 通过 sizedPortraits 注册表提供尺寸专用像素数据。
 * 未来资产管线就绪后，通过工具层离线生成完整 atlas manifest 注入此处。
 *
 * fallbackColor 取自各角色 spriteManifestData 中的 outfit（服装主色），
 * fallbackAccent 取自 hair（特征发色），与 sprite manifest 保持一致。
 *
 * 归属: core/ — 纯类型、纯函数，不持有运行时状态
 */

// ===== 类型定义 =====

/** 肖像尺寸变体 */
export type PortraitSize = 'select' | 'vs' | 'hud' | 'win';

/** 单个肖像条目 */
export interface PortraitEntry {
  /** 角色 ID */
  charId: string;
  /** 尺寸变体 */
  size: PortraitSize;
  /** Atlas 中的 X 坐标 */
  atlasX: number;
  /** Atlas 中的 Y 坐标 */
  atlasY: number;
  /** 像素宽度 */
  width: number;
  /** 像素高度 */
  height: number;
  /** 占位渲染的主色（来自角色服装色） */
  fallbackColor: string;
  /** 占位渲染的强调色（来自角色发色） */
  fallbackAccent: string;
  /** 是否有真实像素肖像数据（CharacterDefinition.pixelPortrait） */
  hasPixelPortrait?: boolean;
}

/** 全角色肖像 manifest */
export interface PortraitManifest {
  version: number;
  portraits: Record<string, Record<PortraitSize, PortraitEntry>>;
}

/** 各尺寸变体的标准像素尺寸 */
export const PORTRAIT_SIZES: Record<PortraitSize, { width: number; height: number }> = {
  select: { width: 120, height: 120 },
  vs: { width: 160, height: 160 },
  hud: { width: 48, height: 48 },
  win: { width: 200, height: 200 },
};

// ===== 查询函数 =====

/**
 * 查询指定角色的指定尺寸肖像
 * @returns PortraitEntry 或 undefined（角色或尺寸不存在时）
 */
export function getPortrait(
  manifest: PortraitManifest,
  charId: string,
  size: PortraitSize,
): PortraitEntry | undefined {
  return manifest.portraits[charId]?.[size];
}

/**
 * 查询选人画面肖像（convenience）
 * @returns PortraitEntry 或 undefined
 */
export function getSelectPortrait(
  manifest: PortraitManifest,
  charId: string,
): PortraitEntry | undefined {
  return getPortrait(manifest, charId, 'select');
}

/**
 * 查询 HUD 肖像（convenience）
 * @returns PortraitEntry 或 undefined
 */
export function getHUDPortrait(
  manifest: PortraitManifest,
  charId: string,
): PortraitEntry | undefined {
  return getPortrait(manifest, charId, 'hud');
}

/**
 * 查询 VS 画面肖像（convenience）
 * @returns PortraitEntry 或 undefined
 */
export function getVSPortrait(
  manifest: PortraitManifest,
  charId: string,
): PortraitEntry | undefined {
  return getPortrait(manifest, charId, 'vs');
}

/**
 * 查询胜利画面肖像（convenience）
 * @returns PortraitEntry 或 undefined
 */
export function getWinPortrait(
  manifest: PortraitManifest,
  charId: string,
): PortraitEntry | undefined {
  return getPortrait(manifest, charId, 'win');
}

/**
 * 判断角色是否有真实像素肖像数据可用
 *
 * 检查 manifest 中 hasPixelPortrait 标志，
 * UI 层可据此决定使用 pixelPortrait 渲染还是 fallback 色块。
 *
 * @returns true 表示 CharacterDefinition.pixelPortrait 可用
 */
export function hasPixelPortraitData(
  manifest: PortraitManifest,
  charId: string,
  size: PortraitSize = 'hud',
): boolean {
  return getPortrait(manifest, charId, size)?.hasPixelPortrait === true;
}

/**
 * 获取角色指定尺寸的 fallback 颜色（outfit 主色）
 * @returns fallbackColor 或 undefined
 */
export function getPortraitFallbackColor(
  manifest: PortraitManifest,
  charId: string,
  size: PortraitSize = 'hud',
): string | undefined {
  return getPortrait(manifest, charId, size)?.fallbackColor;
}

/**
 * 获取角色指定尺寸的 fallback 强调色（hair 发色）
 * @returns fallbackAccent 或 undefined
 */
export function getPortraitFallbackAccent(
  manifest: PortraitManifest,
  charId: string,
  size: PortraitSize = 'hud',
): string | undefined {
  return getPortrait(manifest, charId, size)?.fallbackAccent;
}

// ===== 数据 =====

/**
 * 全角色 fallback 颜色映射（outfit → fallbackColor, hair → fallbackAccent）
 *
 * 27 个角色按 ROSTER 注册顺序排列。
 * 颜色来源与 spriteManifestData.ts 中的 CHARACTER_COLORS 保持一致。
 */
const CHARACTER_PORTRAIT_COLORS: Record<string, { fallbackColor: string; fallbackAccent: string; hasPixelPortrait?: boolean }> = {
  // ── 日本队 ──
  kyo:      { fallbackColor: '#FF6600', fallbackAccent: '#1A1A2E', hasPixelPortrait: true },
  iori:     { fallbackColor: '#AA1133', fallbackAccent: '#C41E3A', hasPixelPortrait: true },
  // ── 饿狼队 ──
  terry:    { fallbackColor: '#CC8800', fallbackAccent: '#FFD700', hasPixelPortrait: true },
  andy:     { fallbackColor: '#FFAA22', fallbackAccent: '#DAA520', hasPixelPortrait: true },
  joe:      { fallbackColor: '#FF8800', fallbackAccent: '#2F2F2F', hasPixelPortrait: true },
  // ── 韩国队 ──
  kim:      { fallbackColor: '#2288CC', fallbackAccent: '#1A1A2E', hasPixelPortrait: true },
  chang:    { fallbackColor: '#885522', fallbackAccent: '#2F2F2F', hasPixelPortrait: true },
  choi:     { fallbackColor: '#66CC66', fallbackAccent: '#4A4A4A', hasPixelPortrait: true },
  // ── 极限流队 ──
  ryo:      { fallbackColor: '#DD6600', fallbackAccent: '#8B4513', hasPixelPortrait: true },
  robert:   { fallbackColor: '#22AA44', fallbackAccent: '#DAA520', hasPixelPortrait: true },
  // ── 怒队 ──
  leona:    { fallbackColor: '#2266BB', fallbackAccent: '#C0C0C0', hasPixelPortrait: true },
  ralf:     { fallbackColor: '#CC6633', fallbackAccent: '#8B4513', hasPixelPortrait: true },
  clark:    { fallbackColor: '#556B2F', fallbackAccent: '#DAA520', hasPixelPortrait: true },
  // ── 超能力队 ──
  athena:   { fallbackColor: '#FF66AA', fallbackAccent: '#8B008B', hasPixelPortrait: true },
  // ── 女性格斗家队 ──
  mai:      { fallbackColor: '#FF4488', fallbackAccent: '#1A1A2E', hasPixelPortrait: true },
  // ── K'队 ──
  kdash:    { fallbackColor: '#444466', fallbackAccent: '#C0C0C0', hasPixelPortrait: true },
  kula:     { fallbackColor: '#4488CC', fallbackAccent: '#B0C4DE', hasPixelPortrait: true },
  // ── 大蛇队 ──
  yashiro:  { fallbackColor: '#664488', fallbackAccent: '#E8E8E8', hasPixelPortrait: true },
  shermie:  { fallbackColor: '#CC44AA', fallbackAccent: '#8B4513', hasPixelPortrait: true },
  chris:    { fallbackColor: '#FF8844', fallbackAccent: '#DAA520', hasPixelPortrait: true },
  // ── 大蛇四天王 ──
  mature:   { fallbackColor: '#882255', fallbackAccent: '#DAA520', hasPixelPortrait: true },
  vice:     { fallbackColor: '#3366AA', fallbackAccent: '#C0C0C0', hasPixelPortrait: true },
  // ── 其他 ──
  billy:    { fallbackColor: '#4488CC', fallbackAccent: '#FFD700', hasPixelPortrait: true },
  yamazaki: { fallbackColor: '#556622', fallbackAccent: '#1A1A2E', hasPixelPortrait: true },
  mary:     { fallbackColor: '#5588CC', fallbackAccent: '#DAA520', hasPixelPortrait: true },
  xiangfei: { fallbackColor: '#EE6688', fallbackAccent: '#1A1A2E', hasPixelPortrait: true },
  kasumi:   { fallbackColor: '#DD4466', fallbackAccent: '#1A1A2E', hasPixelPortrait: true },
};

/** 尺寸变体列表 */
const SIZE_VARIANTS: PortraitSize[] = ['select', 'vs', 'hud', 'win'];

/**
 * 全局肖像 manifest 实例
 *
 * atlas 坐标当前为占位值（按角色和尺寸顺序排列），未来由离线工具生成实际值。
 * 排列方式：每个角色的四种尺寸在 atlas 中按列排列，不同角色按行排列。
 * select: atlasX = 0,  vs: atlasX = 160,  hud: atlasX = 360,  win: atlasX = 420
 */
export const PORTRAIT_MANIFEST: PortraitManifest = {
  version: 1,
  portraits: {},
};

// 填充 manifest
let rowIndex = 0;
for (const [charId, colors] of Object.entries(CHARACTER_PORTRAIT_COLORS)) {
  const charPortraits: Record<PortraitSize, PortraitEntry> = {} as Record<PortraitSize, PortraitEntry>;

  for (const size of SIZE_VARIANTS) {
    const dims = PORTRAIT_SIZES[size];
    const colOffsets: Record<PortraitSize, number> = {
      select: 0,
      vs: 160,
      hud: 360,
      win: 420,
    };
    charPortraits[size] = {
      charId,
      size,
      atlasX: colOffsets[size],
      atlasY: rowIndex * 200,
      width: dims.width,
      height: dims.height,
      fallbackColor: colors.fallbackColor,
      fallbackAccent: colors.fallbackAccent,
      hasPixelPortrait: colors.hasPixelPortrait,
    };
  }

  PORTRAIT_MANIFEST.portraits[charId] = charPortraits;
  rowIndex++;
}

// ===== 尺寸专用像素肖像注册表 =====

/**
 * 尺寸专用像素肖像注册表
 *
 * key: `${charId}:${size}` → PixelPortraitData
 * 只有具有独立尺寸肖像的角色才会出现在这里。
 * 渲染代码应先查此表，查不到再用 CharacterDefinition.pixelPortrait。
 */
export const sizedPortraits: Map<string, import('../rendering/pixelPortraits.js').PixelPortraitData> = new Map();

/**
 * 注册角色的尺寸专用肖像
 */
export function registerSizedPortrait(
  charId: string,
  size: PortraitSize,
  data: import('../rendering/pixelPortraits.js').PixelPortraitData,
): void {
  sizedPortraits.set(`${charId}:${size}`, data);
}

/**
 * 查询角色的尺寸专用像素肖像
 * @returns PixelPortraitData 或 undefined
 */
export function getSizedPortrait(
  charId: string,
  size: PortraitSize,
): import('../rendering/pixelPortraits.js').PixelPortraitData | undefined {
  return sizedPortraits.get(`${charId}:${size}`);
}

/**
 * 判断角色是否有指定尺寸的专用像素肖像
 */
export function hasSizedPortrait(charId: string, size: PortraitSize): boolean {
  return sizedPortraits.has(`${charId}:${size}`);
}

// ===== 注册 Ryo 的多尺寸肖像 =====
import { RYO_SIZED_PORTRAITS } from '../rendering/portraits/ryoPortraits.js';

for (const [size, data] of Object.entries(RYO_SIZED_PORTRAITS)) {
  registerSizedPortrait('ryo', size as PortraitSize, data);
}

// ===== 注册 Iori 的 win 肖像 =====
import { ioriWinPortrait } from '../rendering/portraits/ioriWinPortrait.js';
registerSizedPortrait('iori', 'win', ioriWinPortrait);

// ===== 注册 Kyo 的 win 肖像 =====
import { kyoWinPortrait } from '../rendering/portraits/kyoWinPortrait.js';
registerSizedPortrait('kyo', 'win', kyoWinPortrait);

// ===== 注册 Kyo 的 HUD 肖像 =====
import { kyoHudPortrait } from '../rendering/portraits/kyoHudPortrait.js';
registerSizedPortrait('kyo', 'hud', kyoHudPortrait);

// ===== 注册 Iori 的 HUD 肖像 =====
import { ioriHudPortrait } from '../rendering/portraits/ioriHudPortrait.js';
registerSizedPortrait('iori', 'hud', ioriHudPortrait);

// ===== 注册 Iori 的 select 肖像 =====
import { ioriSelectPortrait } from '../rendering/portraits/ioriSelectPortrait.js';
registerSizedPortrait('iori', 'select', ioriSelectPortrait);

// ===== 注册 Kyo 的 select 肖像 =====
import { kyoSelectPortrait } from '../rendering/portraits/kyoSelectPortrait.js';
registerSizedPortrait('kyo', 'select', kyoSelectPortrait);

// ===== 注册 Kyo/Iori VS 肖像 (复用 select 肖像，比 32x40 base 好很多) =====
registerSizedPortrait('kyo', 'vs', kyoSelectPortrait);
registerSizedPortrait('iori', 'vs', ioriSelectPortrait);
