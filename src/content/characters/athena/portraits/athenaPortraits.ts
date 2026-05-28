/**
 * Athena Content Package — Portrait Metadata
 *
 * 肖像元数据: 尺寸规范、颜色方案、姿态描述。
 * 像素数据来自 rendering/portraits/ 层, 此文件只放元数据描述。
 *
 * 归属: content/characters/athena/portraits/ — 只放"肖像是什么"
 */
import type { PortraitSize } from '../../../../core/portraitManifest.js';

// ===== Athena 肖像元数据 =====

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

export const ATHENA_PORTRAIT_META: Record<PortraitSize, PortraitMeta> = {
  select: {
    size: 'select',
    width: 120,
    height: 120,
    pose: '正面站姿,微侧头,长发飘动,双手交叉胸前,自信微笑',
    primaryColor: '#FF66AA',
    accentColor: '#8B008B',
    style: 'SNK 20色调色板像素风格,接近KOF2002选人肖像,粉色+白色主题',
    hasPixelData: true,
  },
  vs: {
    size: 'vs',
    width: 160,
    height: 160,
    pose: '半身像,サイコパワー闪烁于指尖,偶像演唱会气质',
    primaryColor: '#FF66AA',
    accentColor: '#8B008B',
    style: '放大版选人肖像,VS画面专用',
    hasPixelData: true,
  },
  hud: {
    size: 'hud',
    width: 48,
    height: 48,
    pose: '面部特写,活泼表情,长发标志',
    primaryColor: '#FF66AA',
    accentColor: '#8B008B',
    style: 'HUD小头像,血条旁显示',
    hasPixelData: true,
  },
  win: {
    size: 'win',
    width: 64,
    height: 80,
    pose: '胜利姿势,双手高举,偶像谢幕姿态,星星特效',
    primaryColor: '#FF66AA',
    accentColor: '#8B008B',
    style: '64x80 SNK像素风格胜利肖像,偶像主题',
    hasPixelData: true,
  },
};

/** 获取Athena指定尺寸肖像元数据 */
export function getAthenaPortraitMeta(size: PortraitSize): PortraitMeta {
  return ATHENA_PORTRAIT_META[size];
}

/** 获取所有有像素数据的尺寸列表 */
export function getAthenaAvailablePortraitSizes(): PortraitSize[] {
  return (Object.entries(ATHENA_PORTRAIT_META) as [PortraitSize, PortraitMeta][])
    .filter(([, m]) => m.hasPixelData)
    .map(([size]) => size);
}
