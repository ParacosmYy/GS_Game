/**
 * 克里斯 (Chris) — SNK-style pixel portrait
 * 32x40 half-body bust shot. Light brown hair, orange/brown outfit, youthful face.
 * PLACEHOLDER — will be replaced with proper pixel art.
 */
import type { PixelPortraitData } from '../pixelPortraits.js';

export const chrisPortrait: PixelPortraitData = {
  width: 32,
  height: 40,
  palette: {
    0: 'transparent',
    1: '#5a3a1a',  // dark hair
    2: '#c8884a',  // light brown hair
    3: '#e8a860',  // hair highlight
    4: '#ffd4a0',  // skin base
    5: '#ffb880',  // skin shadow
    6: '#e8a060',  // skin dark
    7: '#ff8844',  // outfit base (orange)
    8: '#cc6622',  // outfit shadow
    9: '#ffaa66',  // outfit highlight
    10: '#ffffff', // eyes/white
    11: '#ff6622', // flame accent
    12: '#222222', // eyes/dark
    13: '#cc4422', // mouth/detail
    14: '#ffcc44', // fire glow
    15: '#1a1a2e', // outline
  },
  // 32x40 placeholder grid — all transparent (will be replaced)
  pixels: Array.from({ length: 40 }, () => Array.from({ length: 32 }, () => 0)),
};
