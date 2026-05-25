/**
 * 李香绯 (Li Xiangfei) — SNK-style pixel portrait
 * 32x40 half-body bust shot. Twin buns black hair, pink/red Chinese outfit.
 * PLACEHOLDER — will be replaced with proper pixel art.
 */
import type { PixelPortraitData } from '../pixelPortraits.js';

export const xiangfeiPortrait: PixelPortraitData = {
  width: 32,
  height: 40,
  palette: {
    0: 'transparent',
    1: '#1a1a2e',  // dark hair
    2: '#2a2a3e',  // hair shadow
    3: '#3a3a4e',  // hair highlight
    4: '#ffd4a0',  // skin base
    5: '#ffb880',  // skin shadow
    6: '#e8a060',  // skin dark
    7: '#ee6688',  // outfit base (pink/red)
    8: '#cc4466',  // outfit shadow
    9: '#ff88aa',  // outfit highlight
    10: '#ffffff', // eyes/white
    11: '#ff4466', // accent
    12: '#222222', // eyes/dark
    13: '#cc3355', // detail
    14: '#ffcc44', // gold trim
    15: '#1a1a2e', // outline
  },
  // 32x40 placeholder grid — all transparent (will be replaced)
  pixels: Array.from({ length: 40 }, () => Array.from({ length: 32 }, () => 0)),
};
