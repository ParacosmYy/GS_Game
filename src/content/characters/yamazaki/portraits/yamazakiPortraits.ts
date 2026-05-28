/**
 * Yamazaki Content Package — Portrait Metadata
 *
 * 肖像元数据: 尺寸规范、颜色方案、姿态描述。
 * 像素数据来自 rendering/portraits/ 层, 此文件只放元数据描述。
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
