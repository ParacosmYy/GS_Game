/**
 * Iori Content Package — Portrait Metadata
 *
 * 肖像元数据: 尺寸规范、颜色方案、姿态描述。
 * 像素数据来自 rendering/portraits/ioriPortrait.ts, 此文件只放元数据描述。
 *
 * 归属: content/characters/iori/portraits/ — 只放"肖像是什么"
 */
import type { PortraitSize } from '../../../../core/portraitManifest.js';

// ===== Iori 肖像元数据 =====

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

export const IORI_PORTRAIT_META: Record<PortraitSize, PortraitMeta> = {
  select: {
    size: 'select',
    width: 120,
    height: 120,
    pose: '半身像,慵懒站姿,紫色火焰缠绕手臂',
    primaryColor: '#8800CC',
    accentColor: '#AA22FF',
    style: 'SNK 20色调色板像素风格,接近KOF2002选人肖像',
    hasPixelData: true,
  },
  vs: {
    size: 'vs',
    width: 160,
    height: 160,
    pose: '半身像,狂气笑容,八神流格斗架势',
    primaryColor: '#8800CC',
    accentColor: '#AA22FF',
    style: '放大版选人肖像,VS画面专用',
    hasPixelData: true,
  },
  hud: {
    size: 'hud',
    width: 48,
    height: 48,
    pose: '面部特写,冷淡表情,遮眼发型',
    primaryColor: '#8800CC',
    accentColor: '#CC3355',
    style: 'HUD小头像,血条旁显示',
    hasPixelData: true,
  },
  win: {
    size: 'win',
    width: 200,
    height: 200,
    pose: '胜利姿势,狂笑,背后紫色火焰',
    primaryColor: '#8800CC',
    accentColor: '#FFD700',
    style: '胜利画面大肖像,金色边框',
    hasPixelData: false,
  },
};

/** 获取Iori指定尺寸肖像元数据 */
export function getIoriPortraitMeta(size: PortraitSize): PortraitMeta {
  return IORI_PORTRAIT_META[size];
}

/** 获取所有有像素数据的尺寸列表 */
export function getIoriAvailablePortraitSizes(): PortraitSize[] {
  return (Object.entries(IORI_PORTRAIT_META) as [PortraitSize, PortraitMeta][])
    .filter(([, m]) => m.hasPixelData)
    .map(([size]) => size);
}
