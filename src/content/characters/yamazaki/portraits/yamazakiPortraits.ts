/**
 * Yamazaki Content Package — Portrait Metadata
 *
 * 肖像元数据: 尺寸规范、颜色方案、姿态描述。
 * 真实肖像优先来自 public/sprites/cvsyamazaki 的 MUGEN group 9000 PNG；
 * rendering/portraits 中的手写像素肖像只作为加载失败 fallback。
 *
 * 归属: content/characters/yamazaki/portraits/ — 只放"肖像是什么"
 *
 * Colors: dark green/gray outfit, black hair — menacing, one hand in pocket
 */
import type { PortraitSize } from '../../../../core/portraitManifest.js';

// ===== Yamazaki 肖像元数据 =====

export interface PortraitMeta {
  size: PortraitSize;
  width: number;
  height: number;
  /** 肖像姿态描述 */
  pose: string;
  /** 主色调 */
  primaryColor: string;
  /** 强调色 */
  accentColor: string;
  /** 风格说明 */
  style: string;
  /** 是否有真实像素数据 */
  hasPixelData: boolean;
  /** 肖像数据来源 */
  source: 'mugen-sprite' | 'pixel-fallback';
  /** MUGEN sprite 目录 */
  mugenDir?: string;
  /** MUGEN sprite ref */
  spriteRef?: string;
  /** 浏览器可加载的真实 PNG 路径 */
  imagePath?: string;
  /** 原始 PNG 宽高 */
  assetSize?: { width: number; height: number };
}

export const YAMAZAKI_PORTRAIT_META: Record<PortraitSize, PortraitMeta> = {
  select: {
    size: 'select',
    width: 120,
    height: 120,
    pose: '正面站姿,右手插口袋,左手下垂,阴险冷笑',
    primaryColor: '#556622',
    accentColor: '#1A1A2E',
    style: 'SNK 20色调色板像素风格,接近KOF2002选人肖像',
    hasPixelData: true,
    source: 'mugen-sprite',
    mugenDir: 'cvsyamazaki',
    spriteRef: '9000_1',
    imagePath: '/sprites/cvsyamazaki/09000_0001.png',
    assetSize: { width: 120, height: 140 },
  },
  vs: {
    size: 'vs',
    width: 160,
    height: 160,
    pose: '半身像,战斗姿态,蛇臂展开,大蛇血统暗紫气息',
    primaryColor: '#556622',
    accentColor: '#1A1A2E',
    style: '放大版选人肖像,VS画面专用',
    hasPixelData: true,
    source: 'mugen-sprite',
    mugenDir: 'cvsyamazaki',
    spriteRef: '9000_1',
    imagePath: '/sprites/cvsyamazaki/09000_0001.png',
    assetSize: { width: 120, height: 140 },
  },
  hud: {
    size: 'hud',
    width: 48,
    height: 48,
    pose: '面部特写,阴险笑容,黑发凌乱',
    primaryColor: '#556622',
    accentColor: '#1A1A2E',
    style: 'HUD小头像,血条旁显示',
    hasPixelData: true,
    source: 'mugen-sprite',
    mugenDir: 'cvsyamazaki',
    spriteRef: '9000_0',
    imagePath: '/sprites/cvsyamazaki/09000_0000.png',
    assetSize: { width: 25, height: 25 },
  },
  win: {
    size: 'win',
    width: 64,
    height: 80,
    pose: '胜利姿势,单手插口袋,狂笑,蛇臂残影',
    primaryColor: '#556622',
    accentColor: '#1A1A2E',
    style: '64x80 SNK像素风格胜利肖像,暗绿主题',
    hasPixelData: true,
    source: 'mugen-sprite',
    mugenDir: 'cvsyamazaki',
    spriteRef: '9000_2',
    imagePath: '/sprites/cvsyamazaki/09000_0002.png',
    assetSize: { width: 81, height: 59 },
  },
};

/** 获取Yamazaki指定尺寸肖像元数据 */
export function getYamazakiPortraitMeta(size: PortraitSize): PortraitMeta {
  return YAMAZAKI_PORTRAIT_META[size];
}

/** 获取所有有像素数据的尺寸列表 */
export function getYamazakiAvailablePortraitSizes(): PortraitSize[] {
  return (Object.entries(YAMAZAKI_PORTRAIT_META) as [PortraitSize, PortraitMeta][])
    .filter(([, m]) => m.hasPixelData)
    .map(([size]) => size);
}
