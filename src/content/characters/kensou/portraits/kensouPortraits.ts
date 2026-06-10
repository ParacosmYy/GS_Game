/**
 * Kensou Content Package — Portrait Metadata
 *
 * 真实 HUD 肖像来自 public/sprites/kensou 的 MUGEN group 9000 PNG。
 * 9000_1 / 9000_2 当前尺寸异常，select / vs / win 暂保留 pixel fallback。
 *
 * 归属: content/characters/kensou/portraits/ — 只放"肖像是什么"
 */
import type { PortraitSize } from '../../../../core/portraitManifest.js';

export interface PortraitMeta {
  size: PortraitSize;
  width: number;
  height: number;
  pose: string;
  primaryColor: string;
  accentColor: string;
  style: string;
  hasPixelData: boolean;
  source: 'mugen-sprite' | 'pixel-fallback';
  mugenDir?: string;
  spriteRef?: string;
  imagePath?: string;
  assetSize?: { width: number; height: number };
}

export const KENSOU_PORTRAIT_META: Record<PortraitSize, PortraitMeta> = {
  select: {
    size: 'select',
    width: 120,
    height: 120,
    pose: '超能力队选人肖像 fallback',
    primaryColor: '#66AAFF',
    accentColor: '#FFDD66',
    style: 'Pixel fallback until Kensou 9000_1 is visually reviewed',
    hasPixelData: true,
    source: 'pixel-fallback',
  },
  vs: {
    size: 'vs',
    width: 160,
    height: 160,
    pose: '超能力队 VS 肖像 fallback',
    primaryColor: '#66AAFF',
    accentColor: '#FFDD66',
    style: 'Pixel fallback until Kensou 9000_1 is visually reviewed',
    hasPixelData: true,
    source: 'pixel-fallback',
  },
  hud: {
    size: 'hud',
    width: 48,
    height: 48,
    pose: '面部小头像',
    primaryColor: '#66AAFF',
    accentColor: '#FFDD66',
    style: 'MUGEN HUD portrait from group 9000',
    hasPixelData: true,
    source: 'mugen-sprite',
    mugenDir: 'kensou',
    spriteRef: '9000_0',
    imagePath: '/sprites/kensou/09000_0000.png',
    assetSize: { width: 25, height: 25 },
  },
  win: {
    size: 'win',
    width: 200,
    height: 200,
    pose: '胜利肖像 fallback',
    primaryColor: '#66AAFF',
    accentColor: '#FFDD66',
    style: 'Pixel fallback until a standard win portrait is confirmed',
    hasPixelData: true,
    source: 'pixel-fallback',
  },
};

export function getKensouPortraitMeta(size: PortraitSize): PortraitMeta {
  return KENSOU_PORTRAIT_META[size];
}

export function getKensouAvailablePortraitSizes(): PortraitSize[] {
  return (Object.entries(KENSOU_PORTRAIT_META) as [PortraitSize, PortraitMeta][])
    .filter(([, meta]) => meta.hasPixelData)
    .map(([size]) => size);
}
