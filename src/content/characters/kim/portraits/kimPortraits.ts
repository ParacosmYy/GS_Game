/**
 * Kim Content Package — Portrait Metadata
 *
 * 肖像元数据: 尺寸规范、颜色方案、姿态描述。
 * 像素数据来自 rendering/portraits/, 此文件只放元数据描述。
 *
 * 归属: content/characters/kim/portraits/ — 只放"肖像是什么"
 */
import type { PortraitSize } from '../../../../core/portraitManifest.js';

// ===== Kim 肖像元数据 =====

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

export const KIM_PORTRAIT_META: Record<PortraitSize, PortraitMeta> = {
  select: {
    size: 'select',
    width: 120,
    height: 120,
    pose: '正面站姿,跆拳道架势,右手握拳左手护胸',
    primaryColor: '#FFFFFF',
    accentColor: '#CC0000',
    style: 'SNK 20色调色板像素风格,接近KOF2002选人肖像',
    hasPixelData: true,
  },
  vs: {
    size: 'vs',
    width: 160,
    height: 160,
    pose: '半身像,跆拳道战斗姿态,踢腿准备',
    primaryColor: '#FFFFFF',
    accentColor: '#CC0000',
    style: '放大版选人肖像,VS画面专用',
    hasPixelData: true,
  },
  hud: {
    size: 'hud',
    width: 48,
    height: 48,
    pose: '面部特写,严肃表情',
    primaryColor: '#FFFFFF',
    accentColor: '#CC0000',
    style: 'HUD小头像,血条旁显示',
    hasPixelData: true,
  },
  win: {
    size: 'win',
    width: 64,
    height: 80,
    pose: '胜利姿势,自信表情,跆拳道架势',
    primaryColor: '#FFFFFF',
    accentColor: '#FFD700',
    style: '64x80 SNK像素风格胜利肖像,正义主题',
    hasPixelData: true,
  },
};

/** 获取Kim指定尺寸肖像元数据 */
export function getKimPortraitMeta(size: PortraitSize): PortraitMeta {
  return KIM_PORTRAIT_META[size];
}

/** 获取所有有像素数据的尺寸列表 */
export function getKimAvailablePortraitSizes(): PortraitSize[] {
  return (Object.entries(KIM_PORTRAIT_META) as [PortraitSize, PortraitMeta][])
    .filter(([, m]) => m.hasPixelData)
    .map(([size]) => size);
}
