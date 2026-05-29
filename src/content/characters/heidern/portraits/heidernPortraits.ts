/**
 * Heidern Content Package — Portrait Metadata
 *
 * 肖像元数据: 尺寸规范、颜色方案、姿态描述。
 * 像素数据来自 rendering/portraits/ 层, 此文件只放元数据描述。
 *
 * Heidern: Military commander, eyepatch, blonde hair, green/dark uniform.
 *
 * 归属: content/characters/heidern/portraits/ — 只放"肖像是什么"
 */
import type { PortraitSize } from '../../../../core/portraitManifest.js';

// ===== Heidern 肖像元数据 =====

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
}

export const HEIDERN_PORTRAIT_META: Record<PortraitSize, PortraitMeta> = {
  select: {
    size: 'select',
    width: 120,
    height: 120,
    pose: '正面站姿,军人体态,眼带,金色短发,表情严峻',
    primaryColor: '#2D5A27',
    accentColor: '#1A1A2E',
    style: 'SNK 20色调色板像素风格,接近KOF2002选人肖像,深绿+黑色军服主题',
    hasPixelData: true,
  },
  vs: {
    size: 'vs',
    width: 160,
    height: 160,
    pose: '半身像,军刀持于身后,眼带目光锐利,指挥官气质',
    primaryColor: '#2D5A27',
    accentColor: '#1A1A2E',
    style: '放大版选人肖像,VS画面专用',
    hasPixelData: true,
  },
  hud: {
    size: 'hud',
    width: 48,
    height: 48,
    pose: '面部特写,眼带,严峻表情,金色短发标志',
    primaryColor: '#2D5A27',
    accentColor: '#1A1A2E',
    style: 'HUD小头像,血条旁显示',
    hasPixelData: true,
  },
  win: {
    size: 'win',
    width: 64,
    height: 80,
    pose: '胜利姿势,军人敬礼,军刀归鞘,冷酷表情',
    primaryColor: '#2D5A27',
    accentColor: '#1A1A2E',
    style: '64x80 SNK像素风格胜利肖像,军事主题',
    hasPixelData: true,
  },
};

/** 获取Heidern指定尺寸肖像元数据 */
export function getHeidernPortraitMeta(size: PortraitSize): PortraitMeta {
  return HEIDERN_PORTRAIT_META[size];
}

/** 获取所有有像素数据的尺寸列表 */
export function getHeidernAvailablePortraitSizes(): PortraitSize[] {
  return (Object.entries(HEIDERN_PORTRAIT_META) as [PortraitSize, PortraitMeta][])
    .filter(([, m]) => m.hasPixelData)
    .map(([size]) => size);
}
