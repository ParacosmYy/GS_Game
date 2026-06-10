/**
 * Yuri Content Package — Portrait Metadata
 *
 * 真实肖像优先来自 public/sprites/cvsyuri 的 MUGEN group 9000 PNG；
 * rendering/portraits 中的手写像素肖像只作为加载失败 fallback。
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

export const YURI_PORTRAIT_META: Record<PortraitSize, PortraitMeta> = {
  select: { size: 'select', width: 120, height: 120, pose: '戦闘構え', primaryColor: '#ff6699', accentColor: '#ffccdd', style: 'SNK style', hasPixelData: true, source: 'mugen-sprite', mugenDir: 'cvsyuri', spriteRef: '9000_1', imagePath: '/sprites/cvsyuri/09000_0001.png', assetSize: { width: 120, height: 140 } },
  vs: { size: 'vs', width: 160, height: 160, pose: '決意の表情', primaryColor: '#ff6699', accentColor: '#ffccdd', style: 'SNK style', hasPixelData: true, source: 'mugen-sprite', mugenDir: 'cvsyuri', spriteRef: '9000_1', imagePath: '/sprites/cvsyuri/09000_0001.png', assetSize: { width: 120, height: 140 } },
  hud: { size: 'hud', width: 48, height: 48, pose: '顔アップ', primaryColor: '#ff6699', accentColor: '#ffccdd', style: 'SNK style', hasPixelData: true, source: 'mugen-sprite', mugenDir: 'cvsyuri', spriteRef: '9000_0', imagePath: '/sprites/cvsyuri/09000_0000.png', assetSize: { width: 25, height: 25 } },
  win: { size: 'win', width: 64, height: 80, pose: '勝利ポーズ', primaryColor: '#ff6699', accentColor: '#ffccdd', style: 'SNK style', hasPixelData: true, source: 'mugen-sprite', mugenDir: 'cvsyuri', spriteRef: '9000_2', imagePath: '/sprites/cvsyuri/09000_0002.png', assetSize: { width: 81, height: 59 } },
};

export function getYuriPortraitMeta(size: PortraitSize): PortraitMeta {
  return YURI_PORTRAIT_META[size];
}

export function getYuriAvailablePortraitSizes(): PortraitSize[] {
  return Object.keys(YURI_PORTRAIT_META) as PortraitSize[];
}
