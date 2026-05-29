/**
 * Yuri Content Package — Portrait Metadata
 */

export type PortraitSize = 'select' | 'vs' | 'hud' | 'win';

export interface PortraitMeta {
  size: PortraitSize;
  width: number;
  height: number;
  pose: string;
  primaryColor: string;
  accentColor: string;
  style: string;
  hasPixelData: boolean;
}

export const YURI_PORTRAIT_META: Record<PortraitSize, PortraitMeta> = {
  select: { size: 'select', width: 120, height: 120, pose: '戦闘構え', primaryColor: '#ff6699', accentColor: '#ffccdd', style: 'SNK style', hasPixelData: true },
  vs: { size: 'vs', width: 160, height: 160, pose: '決意の表情', primaryColor: '#ff6699', accentColor: '#ffccdd', style: 'SNK style', hasPixelData: true },
  hud: { size: 'hud', width: 48, height: 48, pose: '顔アップ', primaryColor: '#ff6699', accentColor: '#ffccdd', style: 'SNK style', hasPixelData: true },
  win: { size: 'win', width: 64, height: 80, pose: '勝利ポーズ', primaryColor: '#ff6699', accentColor: '#ffccdd', style: 'SNK style', hasPixelData: true },
};

export function getYuriPortraitMeta(size: PortraitSize): PortraitMeta {
  return YURI_PORTRAIT_META[size];
}

export function getYuriAvailablePortraitSizes(): PortraitSize[] {
  return Object.keys(YURI_PORTRAIT_META) as PortraitSize[];
}
