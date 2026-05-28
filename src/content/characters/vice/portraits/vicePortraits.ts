/**
 * Vice Content Package — Portrait Metadata
 *
 * 肖像元数据: 尺寸规范、颜色方案、姿态描述。
 * 像素数据来自 rendering/portraits/ 层, 此文件只放元数据描述。
 *
 * 归属: content/characters/vice/portraits/ — 只放"肖像是什么"
 */
import type { PortraitSize } from '../../../../core/portraitManifest.js';

// ===== Vice 肖像元数据 =====

export interface PortraitMeta {
  size: PortraitSize;
  width: number;
  height: number;
  /** 肖像姿态描述 */
  pose: string;
  /** 主色调 — dark purple/black */
  primaryColor: string;
  /** 强调色 — silver/white */
  accentColor: string;
  /** 风格说明 */
  style: string;
  /** 是否有真实像素数据 */
  hasPixelData: boolean;
}

export const VICE_PORTRAIT_META: Record<PortraitSize, PortraitMeta> = {
  select: {
    size: 'select',
    width: 120,
    height: 120,
    pose: '正面站姿,冷酷表情,深紫短发,红色眼瞳',
    primaryColor: '#3366AA',
    accentColor: '#C0C0C0',
    style: 'SNK 20色调色板像素风格,接近KOF2002选人肖像',
    hasPixelData: true,
  },
  vs: {
    size: 'vs',
    width: 160,
    height: 160,
    pose: '半身像,战斗姿态,大蛇族气息缠绕',
    primaryColor: '#3366AA',
    accentColor: '#C0C0C0',
    style: '放大版选人肖像,VS画面专用',
    hasPixelData: true,
  },
  hud: {
    size: 'hud',
    width: 48,
    height: 48,
    pose: '面部特写,冷酷表情,深紫短发标志',
    primaryColor: '#3366AA',
    accentColor: '#C0C0C0',
    style: 'HUD小头像,血条旁显示',
    hasPixelData: true,
  },
  win: {
    size: 'win',
    width: 64,
    height: 80,
    pose: '胜利姿势,大蛇之力显现,冷酷微笑',
    primaryColor: '#3366AA',
    accentColor: '#C0C0C0',
    style: '64x80 SNK像素风格胜利肖像,大蛇主题',
    hasPixelData: true,
  },
};

/** 获取Vice指定尺寸肖像元数据 */
export function getVicePortraitMeta(size: PortraitSize): PortraitMeta {
  return VICE_PORTRAIT_META[size];
}

/** 获取所有有像素数据的尺寸列表 */
export function getViceAvailablePortraitSizes(): PortraitSize[] {
  return (Object.entries(VICE_PORTRAIT_META) as [PortraitSize, PortraitMeta][])
    .filter(([, m]) => m.hasPixelData)
    .map(([size]) => size);
}
