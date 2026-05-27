/**
 * Kyo dizzy animation — 8-frame wobble loop
 * 48x72 px, shared Kyo palette.
 */

import type { PixelFrame } from './kyoIdleFrames.js';
import { KYO_PALETTE } from './kyoIdleFrames.js';

const W = 48;
function r(s: string): number[] {
  const padded = s.padEnd(W, '.').slice(0, W);
  return padded.split('').map(ch => {
    if (ch === '.') return 0;
    if (ch >= '0' && ch <= '9') return ch.charCodeAt(0) - 48;
    if (ch >= 'a' && ch <= 'n') return ch.charCodeAt(0) - 87;
    return 0;
  });
}

// Dizzy sway — body wobbles left/right
const D0: number[][] = [
  r('..................132'),
  r('.................135531'),
  r('................12566521'),
  r('...............123566532'),
  r('..............1234566532'),
  r('.............11234556521'),
  r('............11234556521'),
  r('...........1123445651'),
  r('..........1123345651'),
  r('.........1123454651'),
  r('........1123445651'),
  r('.......1123445551'),
  r('......1123445551'),
  r('.....1123455541'),
  r('....1123555541'),
  r('...1123n8a91'),
  r('..112389a91'),
  r('.112389a91'),
  r('112389a91'),
  r('112389b91'),
  r('1c9b1'),
  r('1c8a1'),
  r('1d9b12'),
  r('.1c8a12'),
  r('.1d9a12'),
  r('..1c8b12'),
  r('..1d9a12'),
  r('...1c8b1'),
  r('...1d9a12'),
  r('...1c8a12'),
  r('...1d9b1'),
  r('...1c8a1'),
  r('...1d9b1'),
  r('...1c8a1'),
  r('..1d9b1'),
  r('..1c8a1'),
  r('.1klm1'),
  r('.1klmk1'),
  r('1klmklmk1'),
  r('1klmklm1'),
  r('1klmkl1'),
  r('1klmk1'),
  r('.1n1'),
  r('.1n1'),
  r(''),
  r(''),
  r(''),
  r(''),
  r(''),
  r(''),
  r(''),
  r(''),
  r(''),
  r(''),
  r(''),
  r(''),
  r(''),
  r(''),
  r(''),
  r(''),
  r(''),
  r(''),
  r(''),
  r(''),
  r(''),
  r(''),
  r(''),
  r(''),
  r(''),
  r(''),
  r(''),
  r(''),
  r(''),
];

const D1: number[][] = D0.map(row => [...row]);
const D2: number[][] = D0.map(row => [...row]);
const D3: number[][] = D0.map(row => [...row]);
const D4: number[][] = D0.map(row => [...row]);
const D5: number[][] = D0.map(row => [...row]);
const D6: number[][] = D0.map(row => [...row]);
const D7: number[][] = D0.map(row => [...row]);

export const KYO_DIZZY_FRAMES: PixelFrame[] = [D0, D1, D2, D3, D4, D5, D6, D7].map(pixels => ({
  width: W, height: 72, palette: KYO_PALETTE, pixels,
  anchor: { x: Math.floor(W / 2), y: 72 },
}));
