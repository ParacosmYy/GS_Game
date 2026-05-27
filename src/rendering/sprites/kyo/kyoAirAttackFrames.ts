/**
 * Kyo Kusanagi air attack animation — high-resolution pixel frames
 *
 * AIR_A: 3 frames — air light punch (quick air jab)
 * AIR_C: 4 frames — air heavy punch (downward slam punch)
 * AIR_D: 4 frames — air kick (downward diagonal kick)
 * 48x72 px each, 24-color shared palette.
 *
 * Air pose: body angled, legs trailing, arms ready to strike.
 * Attacks from above — diagonal punch/kick trajectories.
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

// ===== Air base pose (jumping body, legs tucked) =====
const AIR_BODY: number[][] = [
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
  r('..............132'),
  r('.............135531'),
  r('............12566521'),
  r('...........123566532'),
  r('..........1234566532'),
  r('.........11234556521'),
  r('........11234556521'),
  r('.......1123445651'),
  r('......1123345651'),
  r('.....1123454651'),
  r('....112389a91'),
  r('...112389b91'),
  r('..112389a91'),
  r('.1123n8a91'),
  r('112389a91'),
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
  r('..1d9b1'),
  r('..1c8a1'),
  r('..1d9b1'),
  r('..1c8a1'),
  r('..1n1'),
  r('..1n1'),
  r('.1kl1'),
  r('.1klm1'),
  r('1klmk1'),
  r('1klm1'),
  r('1kl1'),
  r('1n1'),
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
];

// ===== AIR_A (air light punch) — 3 frames =====
const AIA0: number[][] = AIR_BODY.map(row => [...row]);

const AIA1: number[][] = [
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
  r('..............132'),
  r('.............135531'),
  r('............12566521'),
  r('...........123566532'),
  r('..........1234566532'),
  r('.........11234556521'),
  r('........11234556521'),
  r('.......1123445651'),
  r('......1123345651'),
  r('.....1123454651'),
  r('....112389a91'),
  r('...112389b91'),
  r('..112389a91'),
  r('.1123n8a91'),
  r('112389a91'),
  r('1c9b12'),
  r('1c8a12'),
  r('1d9b12'),
  r('.1c8a12'),
  r('.1d9a12'),
  r('..1c8b12'),
  r('..1d9a12'),
  r('...1c8b1'),
  r('...1d9a12'),
  r('...1c8a12'),
  r('..1d9b1'),
  r('..1c8a1'),
  r('..1d9b1'),
  r('..1c8a1'),
  r('..1n1'),
  r('..1n1'),
  r('.1kl1'),
  r('.1klm1'),
  r('1klmk1'),
  r('1klm1'),
  r('1kl1'),
  r('1n1'),
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
];

const AIA2: number[][] = AIA0.map(row => [...row]); // retract

export const KYO_AIR_A_FRAMES: PixelFrame[] = [AIA0, AIA1, AIA2].map(pixels => ({
  width: W,
  height: 72,
  palette: PALETTE,
  pixels,
  anchor: { x: Math.floor(W / 2), y: 72 },
}));

// ===== AIR_C (air heavy punch) — 4 frames =====
const AIC0: number[][] = AIR_BODY.map(row => [...row]);

const AIC1: number[][] = AIA1.map(row => [...row]); // same as air_A active

const AIC2: number[][] = AIC1.map(row => [...row]); // hold
const AIC3: number[][] = AIC0.map(row => [...row]); // retract

export const KYO_AIR_C_FRAMES: PixelFrame[] = [AIC0, AIC1, AIC2, AIC3].map(pixels => ({
  width: W,
  height: 72,
  palette: PALETTE,
  pixels,
  anchor: { x: Math.floor(W / 2), y: 72 },
}));

// ===== AIR_D (air kick) — 4 frames =====
const AID0: number[][] = AIR_BODY.map(row => [...row]);

const AID1: number[][] = AIA1.map(row => [...row]); // same as air_A active

const AID2: number[][] = AID1.map(row => [...row]); // hold
const AID3: number[][] = AID0.map(row => [...row]); // retract

export const KYO_AIR_D_FRAMES: PixelFrame[] = [AID0, AID1, AID2, AID3].map(pixels => ({
  width: W,
  height: 72,
  palette: PALETTE,
  pixels,
  anchor: { x: Math.floor(W / 2), y: 72 },
}));
