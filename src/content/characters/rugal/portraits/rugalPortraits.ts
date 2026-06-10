/**
 * Rugal Content Package — Portrait Metadata
 *
 * 真实肖像来自 public/sprites/cvsrugal 的 MUGEN group 9000 PNG。
 *
 * 归属: content/characters/rugal/portraits/ — 只放"肖像是什么"
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

export const RUGAL_PORTRAIT_META: Record<PortraitSize, PortraitMeta> = {
  select: {
    size: 'select',
    width: 120,
    height: 120,
    pose: 'Boss select portrait',
    primaryColor: '#CC2244',
    accentColor: '#FFD700',
    style: 'MUGEN select portrait from group 9000',
    hasPixelData: true,
    source: 'mugen-sprite',
    mugenDir: 'cvsrugal',
    spriteRef: '9000_1',
    imagePath: '/sprites/cvsrugal/09000_0001.png',
    assetSize: { width: 120, height: 140 },
  },
  vs: {
    size: 'vs',
    width: 160,
    height: 160,
    pose: 'Boss VS portrait',
    primaryColor: '#CC2244',
    accentColor: '#FFD700',
    style: 'MUGEN VS portrait from group 9000',
    hasPixelData: true,
    source: 'mugen-sprite',
    mugenDir: 'cvsrugal',
    spriteRef: '9000_1',
    imagePath: '/sprites/cvsrugal/09000_0001.png',
    assetSize: { width: 120, height: 140 },
  },
  hud: {
    size: 'hud',
    width: 48,
    height: 48,
    pose: 'Boss HUD face',
    primaryColor: '#CC2244',
    accentColor: '#FFD700',
    style: 'MUGEN HUD portrait from group 9000',
    hasPixelData: true,
    source: 'mugen-sprite',
    mugenDir: 'cvsrugal',
    spriteRef: '9000_0',
    imagePath: '/sprites/cvsrugal/09000_0000.png',
    assetSize: { width: 25, height: 25 },
  },
  win: {
    size: 'win',
    width: 200,
    height: 200,
    pose: 'Boss win portrait',
    primaryColor: '#CC2244',
    accentColor: '#FFD700',
    style: 'MUGEN win portrait from group 9000',
    hasPixelData: true,
    source: 'mugen-sprite',
    mugenDir: 'cvsrugal',
    spriteRef: '9000_2',
    imagePath: '/sprites/cvsrugal/09000_0002.png',
    assetSize: { width: 81, height: 59 },
  },
};

export function getRugalPortraitMeta(size: PortraitSize): PortraitMeta {
  return RUGAL_PORTRAIT_META[size];
}

export function getRugalAvailablePortraitSizes(): PortraitSize[] {
  return (Object.entries(RUGAL_PORTRAIT_META) as [PortraitSize, PortraitMeta][])
    .filter(([, meta]) => meta.hasPixelData)
    .map(([size]) => size);
}
