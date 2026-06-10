/**
 * Clark Content Package — Portrait Metadata
 *
 * 肖像元数据: 尺寸规范、颜色方案、姿态描述。
 * 真实肖像优先来自 public/sprites/clark 的 MUGEN group 9000 PNG；
 * win 肖像因源 manifest 缺少标准 9000_2，暂时保留手写像素 fallback。
 *
 * 归属: content/characters/clark/portraits/ — 只放"肖像是什么"
 */
import type { PortraitSize } from '../../../../core/portraitManifest.js';

// ===== Clark 肖像元数据 =====

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

export const CLARK_PORTRAIT_META: Record<PortraitSize, PortraitMeta> = {
  select: {
    size: 'select',
    width: 120,
    height: 120,
    pose: '正面站姿,格斗家架势,军帽墨镜,绿色背心',
    primaryColor: '#448844',
    accentColor: '#66aa66',
    style: 'SNK 20色调色板像素风格,接近KOF2002选人肖像',
    hasPixelData: true,
    source: 'mugen-sprite',
    mugenDir: 'clark',
    spriteRef: '9000_1',
    imagePath: '/sprites/clark/09000_0001.png',
    assetSize: { width: 101, height: 111 },
  },
  vs: {
    size: 'vs',
    width: 160,
    height: 160,
    pose: '半身像,战斗姿态,军帽墨镜标志,绿色能量缠绕双拳',
    primaryColor: '#448844',
    accentColor: '#66aa66',
    style: '放大版选人肖像,VS画面专用',
    hasPixelData: true,
    source: 'mugen-sprite',
    mugenDir: 'clark',
    spriteRef: '9000_1',
    imagePath: '/sprites/clark/09000_0001.png',
    assetSize: { width: 101, height: 111 },
  },
  hud: {
    size: 'hud',
    width: 48,
    height: 48,
    pose: '面部特写,军帽墨镜,硬汉表情',
    primaryColor: '#448844',
    accentColor: '#66aa66',
    style: 'HUD小头像,血条旁显示',
    hasPixelData: true,
    source: 'mugen-sprite',
    mugenDir: 'clark',
    spriteRef: '9000_0',
    imagePath: '/sprites/clark/09000_0000.png',
    assetSize: { width: 25, height: 25 },
  },
  win: {
    size: 'win',
    width: 64,
    height: 80,
    pose: '胜利姿势,军帽墨镜自信姿态,绿色能量消散',
    primaryColor: '#448844',
    accentColor: '#66aa66',
    style: '64x80 SNK像素风格胜利肖像,绿色主题',
    hasPixelData: true,
    source: 'pixel-fallback',
  },
};

/** 获取Clark指定尺寸肖像元数据 */
export function getClarkPortraitMeta(size: PortraitSize): PortraitMeta {
  return CLARK_PORTRAIT_META[size];
}

/** 获取所有有像素数据的尺寸列表 */
export function getClarkAvailablePortraitSizes(): PortraitSize[] {
  return (Object.entries(CLARK_PORTRAIT_META) as [PortraitSize, PortraitMeta][])
    .filter(([, m]) => m.hasPixelData)
    .map(([size]) => size);
}
