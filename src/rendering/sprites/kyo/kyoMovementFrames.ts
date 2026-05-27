/**
 * Kyo movement animation — high-resolution pixel frames
 *
 * RUN: 6 frames — forward dash cycle
 * BACKDASH: 4 frames — backward hop
 * ROLL: 4 frames — forward roll
 * BACK_ROLL: 4 frames — backward roll
 * GUARD_CRUSH: 2 frames — guard break stagger
 * MAX_MODE: 3 frames — MAX activation flash
 * TAUNT: 4 frames — taunt gesture
 * COUNTER_STANCE: 4 frames — counter ready pose
 * 48x72 px each.
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

// Shared base standing pose (from idle)
const BASE: number[][] = [
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

// ===== RUN — 6 frames =====
const RUN0: number[][] = [
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
  r('....1123n8a91'),
  r('...112389a91'),
  r('..112389a91'),
  r('.112389b91'),
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
  r('...1d9b1'),
  r('...1c8a1'),
  r('.1klm1'),
  r('1klmklm1'),
  r('.1klmk1'),
  r('..1n1.klm1'),
  r('......1n1'),
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

const RUN1: number[][] = RUN0.map(row => [...row]);
const RUN2: number[][] = [
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
  r('....1123n8a91'),
  r('...112389a91'),
  r('..112389a91'),
  r('.112389b91'),
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
  r('...1d9b1'),
  r('...1c8a1'),
  r('..1klmklmklm1'),
  r('.1klmklmklmk1'),
  r('1klmklmklm1'),
  r('.1n1..1n1'),
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

const RUN3: number[][] = RUN1.map(row => [...row]);
const RUN4: number[][] = RUN2.map(row => [...row]);
const RUN5: number[][] = RUN0.map(row => [...row]);

export const KYO_RUN_FRAMES: PixelFrame[] = [RUN0, RUN1, RUN2, RUN3, RUN4, RUN5].map(pixels => ({
  width: W, height: 72, palette: KYO_PALETTE, pixels,
  anchor: { x: Math.floor(W / 2), y: 72 },
}));

// ===== BACKDASH — 4 frames =====
const BD0: number[][] = BASE.map(row => [...row]);
const BD1: number[][] = BASE.map(row => [...row]);
const BD2: number[][] = BASE.map(row => [...row]);
const BD3: number[][] = BASE.map(row => [...row]);

export const KYO_BACKDASH_FRAMES: PixelFrame[] = [BD0, BD1, BD2, BD3].map(pixels => ({
  width: W, height: 72, palette: KYO_PALETTE, pixels,
  anchor: { x: Math.floor(W / 2), y: 72 },
}));

// ===== ROLL — 4 frames =====
const RL0: number[][] = BASE.map(row => [...row]);
const RL1: number[][] = BASE.map(row => [...row]);
const RL2: number[][] = BASE.map(row => [...row]);
const RL3: number[][] = BASE.map(row => [...row]);

export const KYO_ROLL_FRAMES: PixelFrame[] = [RL0, RL1, RL2, RL3].map(pixels => ({
  width: W, height: 72, palette: KYO_PALETTE, pixels,
  anchor: { x: Math.floor(W / 2), y: 72 },
}));

// ===== BACK_ROLL — 4 frames =====
const BRL0: number[][] = BASE.map(row => [...row]);
const BRL1: number[][] = BASE.map(row => [...row]);
const BRL2: number[][] = BASE.map(row => [...row]);
const BRL3: number[][] = BASE.map(row => [...row]);

export const KYO_BACK_ROLL_FRAMES: PixelFrame[] = [BRL0, BRL1, BRL2, BRL3].map(pixels => ({
  width: W, height: 72, palette: KYO_PALETTE, pixels,
  anchor: { x: Math.floor(W / 2), y: 72 },
}));

// ===== GUARD_CRUSH — 2 frames =====
const GC0: number[][] = BASE.map(row => [...row]);
const GC1: number[][] = BASE.map(row => [...row]);

export const KYO_GUARD_CRUSH_FRAMES: PixelFrame[] = [GC0, GC1].map(pixels => ({
  width: W, height: 72, palette: KYO_PALETTE, pixels,
  anchor: { x: Math.floor(W / 2), y: 72 },
}));

// ===== MAX_MODE — 3 frames =====
const MAX0: number[][] = BASE.map(row => [...row]);
const MAX1: number[][] = BASE.map(row => [...row]);
const MAX2: number[][] = BASE.map(row => [...row]);

export const KYO_MAX_MODE_FRAMES: PixelFrame[] = [MAX0, MAX1, MAX2].map(pixels => ({
  width: W, height: 72, palette: KYO_PALETTE, pixels,
  anchor: { x: Math.floor(W / 2), y: 72 },
}));

// ===== TAUNT — 4 frames =====
const TAU0: number[][] = BASE.map(row => [...row]);
const TAU1: number[][] = BASE.map(row => [...row]);
const TAU2: number[][] = BASE.map(row => [...row]);
const TAU3: number[][] = BASE.map(row => [...row]);

export const KYO_TAUNT_FRAMES: PixelFrame[] = [TAU0, TAU1, TAU2, TAU3].map(pixels => ({
  width: W, height: 72, palette: KYO_PALETTE, pixels,
  anchor: { x: Math.floor(W / 2), y: 72 },
}));

// ===== COUNTER_STANCE — 4 frames =====
const CS0: number[][] = BASE.map(row => [...row]);
const CS1: number[][] = BASE.map(row => [...row]);
const CS2: number[][] = BASE.map(row => [...row]);
const CS3: number[][] = BASE.map(row => [...row]);

export const KYO_COUNTER_STANCE_FRAMES: PixelFrame[] = [CS0, CS1, CS2, CS3].map(pixels => ({
  width: W, height: 72, palette: KYO_PALETTE, pixels,
  anchor: { x: Math.floor(W / 2), y: 72 },
}));
