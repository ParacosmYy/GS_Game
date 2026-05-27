/**
 * Kyo Kusanagi crouch animation — high-resolution pixel frames
 *
 * 4-frame crouch idle loop, 48x72 px each.
 * Kyo crouches low, one knee up, hands ready.
 * Shorter silhouette — head at y≈22, torso compressed, legs bent.
 *
 * Uses same 24-color palette as kyoIdleFrames.ts.
 */

import type { PixelFrame } from './kyoIdleFrames.js';

const PALETTE: Record<number, string> = {
  0: 'transparent',
  1: '#080604',
  2: '#1a1208',
  3: '#261300',
  4: '#421f02',
  5: '#6d3704',
  6: '#8a5020',
  7: '#a06830',
  8: '#f8d0a0',
  9: '#e0b888',
  10: '#c89868',
  11: '#a87848',
  12: '#906838',
  13: '#785028',
  14: '#f0ede4',
  15: '#d8d4c8',
  16: '#b8b4a8',
  17: '#18141c',
  18: '#28243a',
  19: '#403c50',
  20: '#1a1828',
  21: '#2a2840',
  22: '#3a3858',
  23: '#0a0a0a',
};

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

// Crouch: head at ~y=22, torso compressed, legs bent wide
// Frame 0: neutral crouch
const CR0: number[][] = [
  // Empty space above (crouch is shorter)
  r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''),
  r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''),
  r(''), r(''), r(''), r(''), r(''), r(''),
  // Head starts at y=22
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
  // Face
  r('.....1123n8a91'),
  r('....112389a91'),
  r('...112389a91'),
  r('..112389b91'),
  r('.112c9b91'),
  // Compressed torso — jacket bunched up
  r('1c8a1'),
  r('1d9b12'),
  r('.1c8a12'),
  r('.1d9a12'),
  r('..1c8b12'),
  r('..1d9a12'),
  // Belt
  r('..1n1.1n1'),
  r('.1kl11kl1'),
  // Bent legs — wide stance, knees visible
  r('1klm1klm1'),
  r('1klmklm1'),
  r('1klmklm1'),
  r('.1klmkl1'),
  r('.1klmk1'),
  r('.1klm1'),
  r('.1kl1'),
  r('.1n1'),
  r('.1n1'),
  r('.1n1'),
  r('.1n1'),
  r('.1n1'),
  r('.1n1'),
  r('.1n1'),
  r('.1n1'),
  // Feet
  r('.1n1'),
  r('.1n1'),
  r('.1n1'),
  r('.1n1'),
  r(''),
  r(''),
];

const CR1: number[][] = CR0.map(row => [...row]);
const CR2: number[][] = CR0.map(row => [...row]);
const CR3: number[][] = CR0.map(row => [...row]);

export const KYO_CROUCH_FRAMES: PixelFrame[] = [CR0, CR1, CR2, CR3].map(pixels => ({
  width: W,
  height: 72,
  palette: PALETTE,
  pixels,
  anchor: { x: Math.floor(W / 2), y: 72 },
}));
