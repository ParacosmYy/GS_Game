/**
 * Ryo Content Package — Portrait Metadata
 *
 * 肖像元数据: 尺寸规范、颜色方案、姿态描述。
 * 像素数据来自 rendering/portraits/ryoPortraits.ts, 此文件只放元数据描述。
 *
 * 归属: content/characters/ryo/portraits/ — 只放"肖像是什么"
 */
import type { PortraitSize } from '../../../../core/portraitManifest.js';

// ===== Ryo 肖像元数据 =====

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

export const RYO_PORTRAIT_META: Record<PortraitSize, PortraitMeta> = {
  select: {
    size: 'select',
    width: 120,
    height: 120,
    pose: '正面站姿,右手握拳,极限流空手道架势',
    primaryColor: '#DD6600',
    accentColor: '#8B4513',
    style: 'SNK 20色调色板像素风格,接近KOF2002选人肖像',
    hasPixelData: true,
  },
  vs: {
    size: 'vs',
    width: 160,
    height: 160,
    pose: '半身像,准备战斗的严肃表情',
    primaryColor: '#DD6600',
    accentColor: '#8B4513',
    style: '放大版选人肖像,VS画面专用',
    hasPixelData: true,
  },
  hud: {
    size: 'hud',
    width: 48,
    height: 48,
    pose: '面部特写,咬紧牙关',
    primaryColor: '#DD6600',
    accentColor: '#8B4513',
    style: 'HUD小头像,血条旁显示',
    hasPixelData: true,
  },
  win: {
    size: 'win',
    width: 200,
    height: 200,
    pose: '胜利姿势,双臂交叉,自信微笑',
    primaryColor: '#DD6600',
    accentColor: '#FFD700',
    style: '胜利画面大肖像,金色边框',
    hasPixelData: false,
  },
};

/** 获取Ryo指定尺寸肖像元数据 */
export function getRyoPortraitMeta(size: PortraitSize): PortraitMeta {
  return RYO_PORTRAIT_META[size];
}

/** 获取所有有像素数据的尺寸列表 */
export function getRyoAvailablePortraitSizes(): PortraitSize[] {
  return (Object.entries(RYO_PORTRAIT_META) as [PortraitSize, PortraitMeta][])
    .filter(([, m]) => m.hasPixelData)
    .map(([size]) => size);
}