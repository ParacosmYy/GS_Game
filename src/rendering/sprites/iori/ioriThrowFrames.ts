/**
 * Iori throw animation — 6-frame throw sequence
 * Iori grabs opponent and slams them with claw-like grip
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

// Frame 0: Reach — extending arms for grab
const TH0: number[][] = [
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
  // Arms reaching forward
  r('1c8a1'),
  r('1d9b12'),
  r('1c8a1klm21'),
  r('.1d9a1klm2.1'),
  r('.1c8b1km21.2'),
  r('..1d9a1m2.12'),
  r('..1c8b1k21.2'),
  r('..1d9a1l.12'),
  r('..1c8b11.2'),
  r('..1d9b1.2'),
  r('..1c8a1.2'),
  r('..1d9b1.2'),
  r('..1c8a1.2'),
  r('..1d9b1.2'),
  r('..1c8a1.2'),
  r('..1d9b1.2'),
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

// Frame 1: Grab — hands gripping opponent
const TH1: number[][] = [
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
  // Both arms gripping
  r('1c8a18b9c1'),
  r('1d9a9c8b1'),
  r('1c8b9b8c1'),
  r('.1d9a1c9b1'),
  r('.1c8b1d9a1'),
  r('.1d9a1c8b1'),
  r('..1c8b1d9a'),
  r('..1d9a1c8b'),
  r('..1c8b1d9a'),
  r('..1d9a1c8b'),
  r('..1c8b1d9a'),
  r('..1d9a1c8b'),
  r('..1c8b1d9a'),
  r('..1d9a1c8b'),
  r('..1c8b1d9a'),
  r('..1d9a1c8b'),
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

// Frame 2: Heave — lifting opponent up
const TH2: number[][] = TH1.map(row => row.slice());

// Frame 3: Slam — throwing down
const TH3: number[][] = [
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
  // Arms sweeping down — slam motion
  r('.1c8a1'),
  r('.1d9b1'),
  r('..1c8a1'),
  r('..1d9b1'),
  r('..1c8a1'),
  r('..1d9b1'),
  r('..1c8a1'),
  r('..1d9b1'),
  r('..1c8a1'),
  r('..1d9b1'),
  r('..1c8a1'),
  r('..1d9b1'),
  r('..1c8a1'),
  r('..1d9b1'),
  r('..1c8a1'),
  r('..1d9b1'),
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

// Frame 4: Recovery start — standing back up
const TH4: number[][] = TH0.map(row => row.slice());

// Frame 5: Recovery end — back to idle
const TH5: number[][] = TH0.map(row => row.slice());

export const IORI_THROW_FRAMES: PixelFrame[] = [TH0, TH1, TH2, TH3, TH4, TH5].map(pixels => ({
  width: W,
  height: 72,
  palette: PALETTE,
  pixels,
  anchor: { x: Math.floor(W / 2), y: 72 },
}));
