/**
 * K' Content Package — Portrait Metadata
 *
 * 肖像元数据: 尺寸规范、颜色方案、姿态描述。
 * 真实肖像优先来自 public/sprites/kdash 的 MUGEN group 9000 PNG；
 * win 肖像因源 manifest 缺少标准 9000_2，暂时保留手写像素 fallback。
 *
 * 归属: content/characters/kdash/portraits/ — 只放"肖像是什么"
 */
import type { PortraitSize } from '../../../../core/portraitManifest.js';

// ===== K' 肖像元数据 =====

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

export const KDASH_PORTRAIT_META: Record<PortraitSize, PortraitMeta> = {
  select: {
    size: 'select',
    width: 120,
    height: 120,
    pose: '正面站姿,单手插兜,冷漠表情,黑色皮夹克标志',
    primaryColor: '#444466',
    accentColor: '#6666aa',
    style: 'SNK 20色调色板像素风格,接近KOF2002选人肖像',
    hasPixelData: true,
    source: 'mugen-sprite',
    mugenDir: 'kdash',
    spriteRef: '9000_1',
    imagePath: '/sprites/kdash/09000_0001.png',
    assetSize: { width: 120, height: 140 },
  },
  vs: {
    size: 'vs',
    width: 160,
    height: 160,
    pose: '半身像,战斗姿态,手套发光,火焰能量缠绕右臂',
    primaryColor: '#444466',
    accentColor: '#ff4400',
    style: '放大版选人肖像,VS画面专用',
    hasPixelData: true,
    source: 'mugen-sprite',
    mugenDir: 'kdash',
    spriteRef: '9000_1',
    imagePath: '/sprites/kdash/09000_0001.png',
    assetSize: { width: 120, height: 140 },
  },
  hud: {
    size: 'hud',
    width: 48,
    height: 48,
    pose: '面部特写,冷漠表情,银色头发标志',
    primaryColor: '#444466',
    accentColor: '#6666aa',
    style: 'HUD小头像,血条旁显示',
    hasPixelData: true,
    source: 'mugen-sprite',
    mugenDir: 'kdash',
    spriteRef: '9000_0',
    imagePath: '/sprites/kdash/09000_0000.png',
    assetSize: { width: 25, height: 25 },
  },
  win: {
    size: 'win',
    width: 64,
    height: 80,
    pose: '胜利姿势,插兜转身,火焰消散,冷酷回头',
    primaryColor: '#444466',
    accentColor: '#ff4400',
    style: '64x80 SNK像素风格胜利肖像,火焰主题',
    hasPixelData: true,
    source: 'pixel-fallback',
  },
};

/** 获取K'指定尺寸肖像元数据 */
export function getKdashPortraitMeta(size: PortraitSize): PortraitMeta {
  return KDASH_PORTRAIT_META[size];
}

/** 获取所有有像素数据的尺寸列表 */
export function getKdashAvailablePortraitSizes(): PortraitSize[] {
  return (Object.entries(KDASH_PORTRAIT_META) as [PortraitSize, PortraitMeta][])
    .filter(([, m]) => m.hasPixelData)
    .map(([size]) => size);
}
