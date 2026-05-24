/**
 * 库拉·戴雅蒙度 (Kula Diamond) — SNK-style pixel portrait
 * 32x40 half-body bust shot. Blue outfit, blonde hair.
 * PLACEHOLDER — will be replaced with proper pixel art.
 */
import type { PixelPortraitData } from '../pixelPortraits.js';

export const kulaPortrait: PixelPortraitData = {
  width: 32,
  height: 40,
  palette: {
    0: 'transparent',
    1: '#2a1a00',  // dark hair
    2: '#c8a838',  // blonde hair
    3: '#e8c860',  // blonde highlight
    4: '#ffd4a0',  // skin base
    5: '#ffb880',  // skin shadow
    6: '#e8a060',  // skin dark
    7: '#4488cc',  // outfit base (blue)
    8: '#336699',  // outfit shadow
    9: '#66aaee',  // outfit highlight
    10: '#ffffff', // eyes/white
    11: '#44ccff', // ice accent
    12: '#222222', // eyes/dark
    13: '#cc3366', // mouth/detail
    14: '#88eeff', // ice glow
    15: '#1a1a2e', // outline
  },
  // 32x40 placeholder grid — all transparent (will be replaced)
  pixels: Array.from({ length: 40 }, () => Array.from({ length: 32 }, () => 0)),
};
