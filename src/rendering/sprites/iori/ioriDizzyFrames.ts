/**
 * Iori dizzy animation — 8-frame wobble loop
 * Iori staggers with characteristic head wobble, coat swaying
 * 48x72 px, same 24-color Iori palette.
 */

import type { PixelFrame } from './ioriIdleFrames.js';

const PALETTE: Record<number, string> = {
  0: 'transparent',
  1: '#080604', 2: '#1a1008', 3: '#280808', 4: '#4a1010',
  5: '#7a1a1a', 6: '#a02020', 7: '#c03030', 8: '#f0d0b0',
  9: '#d8b898', 10: '#c09878', 11: '#a87858', 12: '#886040',
  13: '#704830', 14: '#e0e0e8', 15: '#c0c0c8', 16: '#a0a0a8',
  17: '#181828', 18: '#282840', 19: '#383860', 20: '#18181c',
  21: '#282830', 22: '#383848', 23: '#0a0a0a',
};

const W = 48;
function r(s: string): number[] {
  const padded = s.padEnd(W, '.').slice(0, W);
  return padded.split('').map(ch => {
    if (ch === '.') return 0;
    if (ch >= '0' && ch <= '9') return ch.charCodeAt(0) - 48;
    if (ch >= 'a' && ch <= 'z') return ch.charCodeAt(0) - 87;
    return 0;
  });
}

// Frame 0: Neutral wobble
const D0: number[][] = [
  r(''), r(''),
  r('.............135531'),
  r('............12566521'),
  r('...........123566532'),
  r('..........1234566532'),
  r('.........11234556521'),
  r('........11234556521'),
  r('.......1123445651'),
  r('......1123345651'),
  r('.....1123454651'),
  r('....1123445651'),
  r('...1123d8a91'),
  r('..112389a91'),
  r('.112389b91'),
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
  r('...1d9b1'),
  r('...1c8a1'),
  r('..1klm1'),
  r('.1klmklm1'),
  r('1klmklm1'),
  r('.1klmk1'),
  r('..1n1.klm1'),
  r('......1n1'),
  r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''),
  r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''),
  r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''),
  r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''),
  r(''), r(''),
];

// Frame 1: Sway left
const D1: number[][] = D0.map(row => {
  if (row.every(v => v === 0)) return row;
  return [0, ...row.slice(0, -1)];
});

// Frame 2: Center
const D2: number[][] = D0.map(row => row.slice());

// Frame 3: Sway right
const D3: number[][] = D0.map(row => {
  if (row.every(v => v === 0)) return row;
  return [...row.slice(1), 0];
});

// Frame 4: Center
const D4: number[][] = D0.map(row => row.slice());

// Frame 5: Sway left bigger
const D5: number[][] = D1.map(row => {
  if (row.every(v => v === 0)) return row;
  return [0, ...row.slice(0, -1)];
});

// Frame 6: Center
const D6: number[][] = D0.map(row => row.slice());

// Frame 7: Sway right bigger
const D7: number[][] = D3.map(row => {
  if (row.every(v => v === 0)) return row;
  return [...row.slice(1), 0];
});

export const IORI_DIZZY_FRAMES: PixelFrame[] = [D0, D1, D2, D3, D4, D5, D6, D7].map(pixels => ({
  width: W,
  height: 72,
  palette: PALETTE,
  pixels,
  anchor: { x: Math.floor(W / 2), y: 72 },
}));
