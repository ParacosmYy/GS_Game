/**
 * Takuma Content Package — Portrait Metadata
 *
 * 真实肖像优先来自 public/sprites/takuma 的 MUGEN group 9000 PNG。
 * 当前缺少标准 9000_2，win 暂保留 pixel fallback。
 *
 * 归属: content/characters/takuma/portraits/ — 只放"肖像是什么"
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

export const TAKUMA_PORTRAIT_META: Record<PortraitSize, PortraitMeta> = {
  select: {
    size: 'select',
    width: 120,
    height: 120,
    pose: '极限流师范选人肖像',
    primaryColor: '#F0F0F0',
    accentColor: '#8B4513',
    style: 'MUGEN select portrait from group 9000',
    hasPixelData: true,
    source: 'mugen-sprite',
    mugenDir: 'takuma',
    spriteRef: '9000_1',
    imagePath: '/sprites/takuma/09000_0001.png',
    assetSize: { width: 120, height: 140 },
  },
  vs: {
    size: 'vs',
    width: 160,
    height: 160,
    pose: '极限流师范 VS 肖像',
    primaryColor: '#F0F0F0',
    accentColor: '#8B4513',
    style: 'MUGEN VS portrait from group 9000',
    hasPixelData: true,
    source: 'mugen-sprite',
    mugenDir: 'takuma',
    spriteRef: '9000_1',
    imagePath: '/sprites/takuma/09000_0001.png',
    assetSize: { width: 120, height: 140 },
  },
  hud: {
    size: 'hud',
    width: 48,
    height: 48,
    pose: '面部小头像',
    primaryColor: '#F0F0F0',
    accentColor: '#8B4513',
    style: 'MUGEN HUD portrait from group 9000',
    hasPixelData: true,
    source: 'mugen-sprite',
    mugenDir: 'takuma',
    spriteRef: '9000_0',
    imagePath: '/sprites/takuma/09000_0000.png',
    assetSize: { width: 25, height: 25 },
  },
  win: {
    size: 'win',
    width: 200,
    height: 200,
    pose: '胜利肖像 fallback',
    primaryColor: '#F0F0F0',
    accentColor: '#8B4513',
    style: 'Pixel fallback until Takuma 9000_2 exists',
    hasPixelData: true,
    source: 'pixel-fallback',
  },
};

export function getTakumaPortraitMeta(size: PortraitSize): PortraitMeta {
  return TAKUMA_PORTRAIT_META[size];
}

export function getTakumaAvailablePortraitSizes(): PortraitSize[] {
  return (Object.entries(TAKUMA_PORTRAIT_META) as [PortraitSize, PortraitMeta][])
    .filter(([, meta]) => meta.hasPixelData)
    .map(([size]) => size);
}
