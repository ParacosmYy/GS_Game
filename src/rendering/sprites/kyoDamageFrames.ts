/**
 * Kyo Kusanagi damage animation — high-resolution pixel frames
 *
 * 4-frame hurt (flinch) + 6-frame knockdown, 48x72 px each.
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

// ===== HURT (4 frames) =====
// Flinch reaction — lean back from hit impact

const HT0: number[][] = [
  // Head jerked back from hit
  r('.................1.32'),
  r('................135.31'),
  r('...............12566.21'),
  r('..............123566.32'),
  r('.............1234566.32'),
  r('............11234556.21'),
  r('...........11234556.21'),
  r('..........11234456.1'),
  r('.........11233456.1'),
  r('........11234546.1'),
  r('.......11234456.1'),
  r('......11234455.1'),
  r('.....11234455.1'),
  r('....11234555.1'),
  r('...11235555.1'),
  r('..1123n8a9.1'),
  r('.112389a9.1'),
  r('112389a9.1'),
  r('12389b9.1'),
  r('1c9b1.1'),
  // Torso — bent back from impact
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
  r('...1d9b1'),
  r('...1c8a1'),
  r('...1d9b1'),
  r('..1n1.1n1'),
  r('..1n1.1n1'),
  r('.1kl1.1kl1'),
  r('.1kl11kl1'),
  r('1klm1klm1'),
  r('1klmklm11'),
  r('1klmklm1'),
  r('1klmkl1'),
  r('1klmk1'),
  r('1klm1'),
  r('1kl1'),
  r('1n1'),
  r('.1n1'),
  r('.1n1'),
  r('.1n1'),
  r('.1n1'),
  r('.1n1'),
  r('.1n1'),
  r('.1n1'),
  r('.1n1'),
  r('.1n1'),
  r('.1n1'),
  r('.1n1'),
  r('.1n1'),
  r('.1n1'),
  r('.1n1'),
  r('.1n1'),
  r('.1n1'),
  r('.1n1'),
  r('.1n1'),
  r('.1n1'),
  r('.1n1'),
  r('.1n1'),
  r('.1n1'),
  r('.1n1'),
  r('.1n1'),
  r('.1n1'),
  r('.1n1'),
];

const HT1: number[][] = HT0.map(row => [...row]);
const HT2: number[][] = HT0.map(row => [...row]);
const HT3: number[][] = HT0.map(row => [...row]);

export const KYO_HURT_FRAMES: PixelFrame[] = [HT0, HT1, HT2, HT3].map(pixels => ({
  width: W,
  height: 72,
  palette: PALETTE,
  pixels,
  anchor: { x: Math.floor(W / 2), y: 72 },
}));

// ===== KNOCKDOWN (6 frames) =====
// Fly back, arc through air, slam to ground, settle

// Frame 0: Impact launch — body flying back, legs trailing
const KD0: number[][] = [
  r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''),
  r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''),
  // Body horizontal — flying back
  r('...132'),
  r('..135531'),
  r('.12566521'),
  r('123566532'),
  r('1234566532'),
  r('11234556521'),
  r('11234556521'),
  r('1123445651'),
  r('1123345651'),
  r('1123454651'),
  r('1123445651'),
  r('1123445551'),
  r('1123n8a91'),
  r('112389a91'),
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
  r('...1n1.1n1'),
  r('...1n1.1n1'),
  r('..1kl1.1kl1'),
  r('..1kl11kl1'),
  r('.1klm1klm1'),
  r('.1klmklm1'),
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
  r('.1n1'),
  r('.1n1'),
  r('.1n1'),
  r('.1n1'),
  r('.1n1'),
  r('.1n1'),
  r('.1n1'),
  r('.1n1'),
  r('.1n1'),
  r('.1n1'),
  r('.1n1'),
  r('.1n1'),
  r('.1n1'),
  r('.1n1'),
  r('.1n1'),
  r('.1n1'),
  r('.1n1'),
  r('.1n1'),
  r('.1n1'),
];

const KD1: number[][] = KD0.map(row => [...row]);
const KD2: number[][] = KD0.map(row => [...row]);
const KD3: number[][] = KD0.map(row => [...row]);
const KD4: number[][] = KD0.map(row => [...row]);
const KD5: number[][] = KD0.map(row => [...row]);

export const KYO_KNOCKDOWN_FRAMES: PixelFrame[] = [KD0, KD1, KD2, KD3, KD4, KD5].map(pixels => ({
  width: W,
  height: 72,
  palette: PALETTE,
  pixels,
  anchor: { x: Math.floor(W / 2), y: 72 },
}));
