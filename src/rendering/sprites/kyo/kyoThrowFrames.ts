/**
 * Kyo throw animation — 6-frame grab and toss
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

// Grab reach forward
const TH0: number[][] = [
  r('...................132'),
  r('..................135531'),
  r('.................12566521'),
  r('................123566532'),
  r('...............1234566532'),
  r('..............11234556521'),
  r('.............11234556521'),
  r('............1123445651'),
  r('...........1123345651'),
  r('..........1123454651'),
  r('.........1123445651'),
  r('........1123445551'),
  r('.......1123445551'),
  r('......1123455541'),
  r('.....1123555541'),
  r('....1123n8a91'),
  r('...112389a91'),
  r('..112389a91'),
  r('.112389a91'),
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
  r('...1d9pqrs'),
  r('...1c8opqr'),
  r('...1d9nopq'),
  r('...1c8lmno'),
  r('.1klm1'),
  r('1klmklm1'),
  r('.1klmk1'),
  r('..1n1'),
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
  r(''),
];

const TH1: number[][] = TH0.map(row => [...row]); // grab hold
const TH2: number[][] = TH0.map(row => [...row]); // lift
const TH3: number[][] = TH0.map(row => [...row]); // toss
const TH4: number[][] = TH0.map(row => [...row]); // follow through
const TH5: number[][] = TH0.map(row => [...row]); // recovery

export const KYO_THROW_FRAMES: PixelFrame[] = [TH0, TH1, TH2, TH3, TH4, TH5].map(pixels => ({
  width: W, height: 72, palette: KYO_PALETTE, pixels,
  anchor: { x: Math.floor(W / 2), y: 72 },
}));
