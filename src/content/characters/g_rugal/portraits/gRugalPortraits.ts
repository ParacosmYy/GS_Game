/**
 * Omega Rugal Content Package — Portrait Metadata
 *
 * 真实肖像来自 public/sprites/cvsg_rugal 的 MUGEN group 9000 PNG。
 *
 * 归属: content/characters/g_rugal/portraits/ — 只放"肖像是什么"
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

export const G_RUGAL_PORTRAIT_META: Record<PortraitSize, PortraitMeta> = {
  select: {
    size: 'select',
    width: 120,
    height: 120,
    pose: 'Omega Rugal select portrait',
    primaryColor: '#7A55CC',
    accentColor: '#E6E6E6',
    style: 'MUGEN select portrait from group 9000',
    hasPixelData: true,
    source: 'mugen-sprite',
    mugenDir: 'cvsg_rugal',
    spriteRef: '9000_1',
    imagePath: '/sprites/cvsg_rugal/09000_0001.png',
    assetSize: { width: 120, height: 140 },
  },
  vs: {
    size: 'vs',
    width: 160,
    height: 160,
    pose: 'Omega Rugal VS portrait',
    primaryColor: '#7A55CC',
    accentColor: '#E6E6E6',
    style: 'MUGEN VS portrait from group 9000',
    hasPixelData: true,
    source: 'mugen-sprite',
    mugenDir: 'cvsg_rugal',
    spriteRef: '9000_1',
    imagePath: '/sprites/cvsg_rugal/09000_0001.png',
    assetSize: { width: 120, height: 140 },
  },
  hud: {
    size: 'hud',
    width: 48,
    height: 48,
    pose: 'Omega Rugal HUD face',
    primaryColor: '#7A55CC',
    accentColor: '#E6E6E6',
    style: 'MUGEN HUD portrait from group 9000',
    hasPixelData: true,
    source: 'mugen-sprite',
    mugenDir: 'cvsg_rugal',
    spriteRef: '9000_0',
    imagePath: '/sprites/cvsg_rugal/09000_0000.png',
    assetSize: { width: 25, height: 25 },
  },
  win: {
    size: 'win',
    width: 200,
    height: 200,
    pose: 'Omega Rugal win portrait',
    primaryColor: '#7A55CC',
    accentColor: '#E6E6E6',
    style: 'MUGEN win portrait from group 9000',
    hasPixelData: true,
    source: 'mugen-sprite',
    mugenDir: 'cvsg_rugal',
    spriteRef: '9000_2',
    imagePath: '/sprites/cvsg_rugal/09000_0002.png',
    assetSize: { width: 81, height: 59 },
  },
};

export function getGRugalPortraitMeta(size: PortraitSize): PortraitMeta {
  return G_RUGAL_PORTRAIT_META[size];
}

export function getGRugalAvailablePortraitSizes(): PortraitSize[] {
  return (Object.entries(G_RUGAL_PORTRAIT_META) as [PortraitSize, PortraitMeta][])
    .filter(([, meta]) => meta.hasPixelData)
    .map(([size]) => size);
}
