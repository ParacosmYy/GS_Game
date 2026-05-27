/**
 * Iori movement animation — high-resolution pixel frames
 *
 * RUN: 6 frames — forward dash cycle (coat billowing behind)
 * BACKDASH: 4 frames — backward hop
 * ROLL: 4 frames — forward roll
 * BACK_ROLL: 4 frames — backward roll
 * GUARD_CRUSH: 2 frames — guard break stagger
 * MAX_MODE: 3 frames — MAX activation flash
 * TAUNT: 4 frames — iconic Iori laugh gesture
 * 48x72 px each, same 24-color Iori palette.
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

// ===== RUN — 6 frames =====
// Iori runs with coat billowing behind, hair flowing

const RUN0: number[][] = [
  r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''),
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
  r('....1123445651'),
  r('...1123d8a91'),
  r('..112389a91'),
  r('.112389b91'),
  r('112389b91'),
  r('1c9b1'),
  // Body leaning forward in run, coat trailing behind
  r('1c8a1'),
  r('1d9b12'),
  r('.1c8a1klm21'),
  r('.1d9a1klm2.1'),
  r('..1c8b1km21.2'),
  r('..1d9a1m2.12'),
  r('...1c8b1k21.2'),
  r('...1d9a1l.12'),
  r('...1c8a11.2'),
  r('...1d9b1.2'),
  r('...1c8a1.2'),
  r('..1klm1'),
  r('.1klmklm1'),
  r('1klmklm1'),
  r('.1klmk1'),
  r('..1n1.klm1'),
  r('......1n1'),
  r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''),
  r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''),
  r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''),
  r(''), r(''), r(''),
];

// Frame 1: right leg forward
const RUN1: number[][] = [
  r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''),
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
  r('....1123445651'),
  r('...1123d8a91'),
  r('..112389a91'),
  r('.112389b91'),
  r('112389b91'),
  r('1c9b1'),
  r('1c8a1'),
  r('1d9b12'),
  r('.1c8a1klm21'),
  r('.1d9a1klm2.1'),
  r('..1c8b1km21.2'),
  r('..1d9a1m2.12'),
  r('...1c8b1k21.2'),
  r('...1d9a1l.12'),
  r('...1c8a11.2'),
  r('...1d9b1.2'),
  r('...1c8a1.2'),
  r('...1klm1'),
  r('..1klmkl1'),
  r('.1klmk1'),
  r('1n1.klm1'),
  r('1n1...1n1'),
  r('.1n1'),
  r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''),
  r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''),
  r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''),
  r(''), r(''), r(''),
];

// Frame 2: stride — left leg forward, coat spread
const RUN2: number[][] = [
  r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''),
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
  r('....1123445651'),
  r('...1123d8a91'),
  r('..112389a91'),
  r('.112389b91'),
  r('112389b91'),
  r('1c9b1'),
  r('1c8a1'),
  r('1d9b12'),
  r('.1c8a1klm21'),
  r('.1d9a1klm2.1'),
  r('..1c8b1km21.2'),
  r('..1d9a1m2.12'),
  r('...1c8b1k21.2'),
  r('...1d9a1l.12'),
  r('...1c8a11.2'),
  r('...1d9b1.2'),
  r('...1c8a1.2'),
  r('..1klm1'),
  r('.1klmklm1'),
  r('1klmklmk1'),
  r('.1klmkl1'),
  r('..1n11n1'),
  r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''),
  r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''),
  r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''),
  r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''),
  r(''), r(''),
];

// Frame 3: reaching — full stride
const RUN3: number[][] = RUN1.map(row => row.slice());

// Frame 4: transition — passing through
const RUN4: number[][] = RUN0.map(row => row.slice());

// Frame 5: cycle back — same as frame 2 variant
const RUN5: number[][] = RUN2.map(row => row.slice());

export const IORI_RUN_FRAMES: PixelFrame[] = [RUN0, RUN1, RUN2, RUN3, RUN4, RUN5].map(pixels => ({
  width: W,
  height: 72,
  palette: PALETTE,
  pixels,
  anchor: { x: Math.floor(W / 2), y: 72 },
}));

// ===== BACKDASH — 4 frames =====
// Iori hops backward, coat flaring outward

const BD0: number[][] = [
  r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''),
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
  r('....1123445651'),
  r('...1123d8a91'),
  r('..112389a91'),
  r('.112389b91'),
  r('112389b91'),
  r('1c9b1'),
  r('.1c8a1'),
  r('.1d9b1'),
  r('..1c8a1klm21'),
  r('..1d9a1klm2.1'),
  r('..1c8b1km21.2'),
  r('...1d9a1m2.12'),
  r('...1c8b1k21.2'),
  r('...1d9a1l.12'),
  r('...1c8a11.2'),
  r('...1d9b1.2'),
  r('...1c8a1.2'),
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

const BD1: number[][] = [
  r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''),
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
  r('....1123445651'),
  r('...1123d8a91'),
  r('..112389a91'),
  r('.112389b91'),
  r('112389b91'),
  r('1c9b1'),
  r('.1c8a1'),
  r('.1d9b12'),
  r('..1c8a1klm21'),
  r('..1d9a1klm2.1'),
  r('..1c8b1km21.2'),
  r('...1d9a1m2.12'),
  r('...1c8b1k21.2'),
  r('...1d9a1l.12'),
  r('...1c8a11.2'),
  r('...1d9b1.2'),
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
  r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''),
  r(''), r(''),
];

const BD2: number[][] = BD0.map(row => row.slice());
const BD3: number[][] = BD0.map(row => row.slice());

export const IORI_BACKDASH_FRAMES: PixelFrame[] = [BD0, BD1, BD2, BD3].map(pixels => ({
  width: W,
  height: 72,
  palette: PALETTE,
  pixels,
  anchor: { x: Math.floor(W / 2), y: 72 },
}));

// ===== ROLL — 4 frames =====
// Iori rolls forward, body tucked

const ROL0: number[][] = [
  r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''),
  r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''),
  r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''),
  r(''), r(''), r(''), r(''), r(''), r(''),
  // Body crouching low — starting roll
  r('........132'),
  r('.......135531'),
  r('......12566521'),
  r('.....123566532'),
  r('....11234556521'),
  r('...1123445651'),
  r('..1123d8a91'),
  r('.112389b91'),
  r('1c9b1'),
  r('.1c8a1klm1'),
  r('..1d9a1km1'),
  r('..1c8b1m1'),
  r('...1d9a11'),
  r('...1c8b1'),
  r('...1klm1'),
  r('..1klmklm1'),
  r('.1klmk1'),
  r('1n1.1n1'),
  r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''),
  r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''),
  r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''),
  r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''),
  r(''), r(''), r(''),
];

const ROL1: number[][] = [
  r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''),
  r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''),
  r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''),
  r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''),
  r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''),
  r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''),
  r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''),
  r(''), r(''), r(''), r(''),
  // Body tucked horizontal — mid roll
  r('...1321c8a91d9b1klm1n1'),
  r('..135531c8a1d9b1klm11n1'),
  r('.12566521c8a1d9b1klm1'),
  r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''),
  r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''),
  r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''),
  r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''),
  r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''), r(''),
  r(''), r(''), r(''),
];

const ROL2: number[][] = ROL1.map(row => row.slice());
const ROL3: number[][] = ROL0.map(row => row.slice());

export const IORI_ROLL_FRAMES: PixelFrame[] = [ROL0, ROL1, ROL2, ROL3].map(pixels => ({
  width: W,
  height: 72,
  palette: PALETTE,
  pixels,
  anchor: { x: Math.floor(W / 2), y: 72 },
}));

// ===== BACK_ROLL — 4 frames =====
export const IORI_BACK_ROLL_FRAMES: PixelFrame[] = IORI_ROLL_FRAMES;

// ===== GUARD_CRUSH — 2 frames =====
// Guard broken — staggering back defenseless

const GC0: number[][] = [
  r(''), r(''),
  r('...............132'),
  r('..............135531'),
  r('.............12566521'),
  r('............123566532'),
  r('...........1234566532'),
  r('..........11234556521'),
  r('.........11234556521'),
  r('........1123445651'),
  r('.......1123345651'),
  r('......1123454651'),
  r('.....1123445651'),
  r('....1123445551'),
  r('...1123d8a91'),
  r('..112389a91'),
  r('.112389b91'),
  r('112389b91'),
  r('1c9b1'),
  r('.1c8a1'),
  r('.1d9b1..klm21'),
  r('..1c8a1.klm2.1'),
  r('..1d9b1.1km21.2'),
  r('...1c8a11m2.12'),
  r('...1d9b1k21.2'),
  r('...1c8a1l.12'),
  r('...1d9b11.2'),
  r('...1c8a1.2'),
  r('...1d9b1.2'),
  r('...1c8a1.2'),
  r('...1d9b1.2'),
  r('...1c8a1.2'),
  r('...1d9b1.2'),
  r('...1c8a1.2'),
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

const GC1: number[][] = GC0.map(row => row.slice());

export const IORI_GUARD_CRUSH_FRAMES: PixelFrame[] = [GC0, GC1].map(pixels => ({
  width: W,
  height: 72,
  palette: PALETTE,
  pixels,
  anchor: { x: Math.floor(W / 2), y: 72 },
}));

// ===== MAX_MODE — 3 frames =====
// MAX activation — purple aura burst

const MAX0: number[][] = [
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

const MAX1: number[][] = MAX0.map(row => row.slice());
const MAX2: number[][] = MAX0.map(row => row.slice());

export const IORI_MAX_MODE_FRAMES: PixelFrame[] = [MAX0, MAX1, MAX2].map(pixels => ({
  width: W,
  height: 72,
  palette: PALETTE,
  pixels,
  anchor: { x: Math.floor(W / 2), y: 72 },
}));

// ===== TAUNT — 4 frames =====
// Iori's iconic taunt — pulls collar up with crossed arms

const T0: number[][] = [
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

const T1: number[][] = T0.map(row => row.slice());
const T2: number[][] = T0.map(row => row.slice());
const T3: number[][] = T0.map(row => row.slice());

export const IORI_TAUNT_FRAMES: PixelFrame[] = [T0, T1, T2, T3].map(pixels => ({
  width: W,
  height: 72,
  palette: PALETTE,
  pixels,
  anchor: { x: Math.floor(W / 2), y: 72 },
}));
