/**
 * Yashiro Content Package — Portrait Metadata
 *
 * 肖像元数据: 尺寸规范、颜色方案、姿态描述。
 * 真实肖像优先来自 public/sprites/yashiro 的 MUGEN group 9000 PNG；
 * win 肖像因源 manifest 缺少标准 9000_2，暂时保留手写像素 fallback。
 *
 * 归属: content/characters/yashiro/portraits/ — 只放"肖像是什么"
 */
import type { PortraitSize } from '../../../../core/portraitManifest.js';

// ===== Yashiro 肖像元数据 =====

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
  source: 'mugen-sprite' | 'pixel-fallback';
  mugenDir?: string;
  spriteRef?: string;
  imagePath?: string;
  assetSize?: { width: number; height: number };
}

export const YASHIRO_PORTRAIT_META: Record<PortraitSize, PortraitMeta> = {
  select: {
    size: 'select',
    width: 120,
    height: 120,
    pose: '正面站姿,双拳蓄力,力量格斗家架势',
    primaryColor: '#9966cc',
    accentColor: '#bb88ee',
    style: 'SNK 20色调色板像素风格,接近KOF2002选人肖像',
    hasPixelData: true,
    source: 'mugen-sprite',
    mugenDir: 'yashiro',
    spriteRef: '9000_1',
    imagePath: '/sprites/yashiro/09000_0001.png',
    assetSize: { width: 120, height: 140 },
  },
  vs: {
    size: 'vs',
    width: 160,
    height: 160,
    pose: '半身像,战斗姿态,紫色能量缠绕双拳',
    primaryColor: '#9966cc',
    accentColor: '#bb88ee',
    style: '放大版选人肖像,VS画面专用',
    hasPixelData: true,
    source: 'mugen-sprite',
    mugenDir: 'yashiro',
    spriteRef: '9000_1',
    imagePath: '/sprites/yashiro/09000_0001.png',
    assetSize: { width: 120, height: 140 },
  },
  hud: {
    size: 'hud',
    width: 48,
    height: 48,
    pose: '面部特写,刚毅表情,力量型标志',
    primaryColor: '#9966cc',
    accentColor: '#bb88ee',
    style: 'HUD小头像,血条旁显示',
    hasPixelData: true,
    source: 'mugen-sprite',
    mugenDir: 'yashiro',
    spriteRef: '9000_0',
    imagePath: '/sprites/yashiro/09000_0000.png',
    assetSize: { width: 23, height: 25 },
  },
  win: {
    size: 'win',
    width: 64,
    height: 80,
    pose: '胜利姿势,双拳紧握,紫色能量消散',
    primaryColor: '#9966cc',
    accentColor: '#bb88ee',
    style: '64x80 SNK像素风格胜利肖像,紫色主题',
    hasPixelData: true,
    source: 'pixel-fallback',
  },
};

/** 获取Yashiro指定尺寸肖像元数据 */
export function getYashiroPortraitMeta(size: PortraitSize): PortraitMeta {
  return YASHIRO_PORTRAIT_META[size];
}

/** 获取所有有像素数据的尺寸列表 */
export function getYashiroAvailablePortraitSizes(): PortraitSize[] {
  return (Object.entries(YASHIRO_PORTRAIT_META) as [PortraitSize, PortraitMeta][])
    .filter(([, m]) => m.hasPixelData)
    .map(([size]) => size);
}
