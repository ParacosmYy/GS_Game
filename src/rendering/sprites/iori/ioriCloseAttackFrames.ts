/**
 * Iori Yagami close-range attack animation — high-resolution pixel frames
 *
 * CLOSE_A: 4 frames — close light punch (quick claw jab)
 * CLOSE_C: 4 frames — close heavy punch (upper body hook)
 * CLOSE_B: 3 frames — close light kick (knee strike)
 * CLOSE_D: 4 frames — close heavy kick (low sweep)
 * 48x72 px each, 24-color shared palette.
 *
 * Close range: opponent within 80px, tighter/shorter attacks than stand versions.
 * Iori's close attacks are predatory — compact, violent motions from his hunched stance.
 */

import type { PixelFrame } from './ioriIdleFrames.js';

const PALETTE: Record<number, string> = {
  0: 'transparent',
  1: '#080604',
  2: '#1a1008',
  3: '#280808',
  4: '#4a1010',
  5: '#7a1a1a',
  6: '#a02020',
  7: '#c03030',
  8: '#f0d0b0',
  9: '#d8b898',
  10: '#c09878',
  11: '#a87858',
  12: '#886040',
  13: '#704830',
  14: '#e0e0e8',
  15: '#c0c0c8',
  16: '#a0a0a8',
  17: '#181828',
  18: '#282840',
  19: '#383860',
  20: '#18181c',
  21: '#282830',
  22: '#383848',
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

// Palette key:
//   1=#080604  2=#1a1008  3=#280808  4=#4a1010  5=#7a1a1a
//   6=#a02020  7=#c03030  8=#f0d0b0  9=#d8b898  a=#c09878
//   b=#a87858  c=#886040  d=#704830  e=#e0e0e8  f=#c0c0c8
//   g=#a0a0a8  h=#181828  i=#282840  j=#383860  k=#18181c
//   l=#282830  m=#383848  n=#0a0a0a

// ===== CLOSE_A (close light punch — quick claw jab) — 4 frames =====
// Compact claw jab from close range — body stays centered, arm snaps forward.
const CA0: number[][] = [
  // Windup — pull arm back slightly, body tightens
  r('.....................12'),
  r('...................13431'),
  r('..................1345631'),
  r('.................12456641'),
  r('................124566531'),
  r('...............1124566541'),
  r('..............1124566541'),
  r('.............11234556531'),
  r('............11234456541'),
  r('...........11234455531'),
  r('..........112344555321'),
  r('.........112344554311'),
  r('........12344554311'),
  r('.......1234555431'),
  r('......1234d8a91'),
  r('.....123.d8a91'),
  r('....123.189a1'),
  r('...123.1b9a1'),
  r('...12.1c8a1'),
  // Torso — arm coiled tight near chest (close stance)
  r('...1.1d9a12'),
  r('....1c8a1.1'),
  r('....1d9a12'),
  r('....c8b12'),
  r('...1d9a1kl1'),
  r('...c8b12kl1'),
  r('...d9a1klm2'),
  r('...c8bklm21'),
  r('...1d9lm221'),
  r('...c8k221'),
  r('...d9l21'),
  r('...c8m1'),
  r('...d921'),
  r('...c81'),
  r('...d91'),
  r('...c81'),
  r('...d91'),
  r('...c81'),
  r('...d91'),
  r('...c81'),
  r('...d91'),
  r('...c81'),
  // Belt + Legs (narrower close stance)
  r('...1n1.1n1'),
  r('...1n1.1n1'),
  r('..1hi1.1hi1'),
  r('..1hi1.1hij2'),
  r('.1hij11hij22'),
  r('.1hij1hij222'),
  r('1hij1hij2222'),
  r('1hiihij22222'),
  r('1hiiij222222'),
  r('1hiij2222222'),
  r('1hij22222222'),
  r('1hi222222222'),
  r('1h2222222222'),
  r('1h2222222222'),
  r('.1h222222222'),
  r('.1h222222222'),
  r('.1n1..1n1'),
  r('..n1..1n1'),
  r('..n1.1n1'),
  r('..1n1n1'),
  r('..1nn1'),
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
];

const CA1: number[][] = [
  // Claw jab — arm snaps forward quickly, compact motion
  r('.....................12'),
  r('...................13431'),
  r('..................1345631'),
  r('.................12456641'),
  r('................124566531'),
  r('...............1124566541'),
  r('..............1124566541'),
  r('.............11234556531'),
  r('............11234456541'),
  r('...........11234455531'),
  r('..........112344555321'),
  r('.........112344554311'),
  r('........12344554311'),
  r('.......1234555431'),
  r('......1234d8a91'),
  r('.....123.d8a91'),
  r('....123.189a1'),
  r('...123.1b9a1'),
  r('...12.1c8a1'),
  // Torso — claw jabs forward (shorter reach than stand_A)
  r('...1.1d9a189b8'),
  r('....1c8a1898b'),
  r('....1d9a1b8'),
  r('....c8b1'),
  r('...1d9a1kl1'),
  r('...c8b12kl1'),
  r('...d9a1klm2'),
  r('...c8bklm21'),
  r('...1d9lm221'),
  r('...c8k221'),
  r('...d9l21'),
  r('...c8m1'),
  r('...d921'),
  r('...c81'),
  r('...d91'),
  r('...c81'),
  r('...d91'),
  r('...c81'),
  r('...d91'),
  r('...c81'),
  r('...d91'),
  r('...c81'),
  // Belt + Legs (narrower close stance)
  r('...1n1.1n1'),
  r('...1n1.1n1'),
  r('..1hi1.1hi1'),
  r('..1hi1.1hij2'),
  r('.1hij11hij22'),
  r('.1hij1hij222'),
  r('1hij1hij2222'),
  r('1hiihij22222'),
  r('1hiiij222222'),
  r('1hiij2222222'),
  r('1hij22222222'),
  r('1hi222222222'),
  r('1h2222222222'),
  r('1h2222222222'),
  r('.1h222222222'),
  r('.1h222222222'),
  r('.1n1..1n1'),
  r('..n1..1n1'),
  r('..n1.1n1'),
  r('..1n1n1'),
  r('..1nn1'),
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
];

const CA2: number[][] = CA1.map(row => [...row]); // hold
const CA3: number[][] = CA0.map(row => [...row]); // retract

export const IORI_CLOSE_A_FRAMES: PixelFrame[] = [CA0, CA1, CA2, CA3].map(pixels => ({
  width: W,
  height: 72,
  palette: PALETTE,
  pixels,
  anchor: { x: Math.floor(W / 2), y: 72 },
}));

// ===== CLOSE_C (close heavy punch — upper body hook) — 4 frames =====
// Dramatic close-range hook — body pivots, claw sweeps horizontally.
// Windup reuses close_A windup.
const CC0: number[][] = CA0.map(row => [...row]);

const CC1: number[][] = [
  // Upper body hook — torso twists, claw sweeps across
  r('.....................12'),
  r('...................13431'),
  r('..................1345631'),
  r('.................12456641'),
  r('................124566531'),
  r('...............1124566541'),
  r('..............1124566541'),
  r('.............11234556531'),
  r('............11234456541'),
  r('...........11234455531'),
  r('..........112344555321'),
  r('.........112344554311'),
  r('........12344554311'),
  r('.......1234555431'),
  r('......1234d8a91'),
  r('.....123.d8a91'),
  r('....123.189a1'),
  r('...123.1b9a1'),
  r('...12.1c8a1'),
  // Torso — claw sweeps across with power (spread digits)
  r('...1.1d9a189b8b9b8'),
  r('....1c8a189b8b9b8'),
  r('....1d9a18b9b8'),
  r('....c8b1b8b9'),
  r('...1d9a1kl1'),
  r('...c8b12klm1'),
  r('...d9a1klm2'),
  r('...c8bklm2'),
  r('...1d9lm2'),
  r('...c8k22'),
  r('...d9l2'),
  r('...c8m'),
  r('...d92'),
  r('...c8'),
  r('...d9'),
  r('...c8'),
  r('...d9'),
  r('...c8'),
  r('...d9'),
  r('...c8'),
  r('...d9'),
  r('...c8'),
  // Belt + Legs (planted, weight shifts)
  r('..1n1..1n1'),
  r('..1n1..1n1'),
  r('.1hi1.1hi12'),
  r('.1hi11hij222'),
  r('1hij1hij2222'),
  r('1hij1hij22222'),
  r('1hiihij222222'),
  r('1hiiij2222222'),
  r('1hiij22222222'),
  r('1hij222222222'),
  r('1hi2222222222'),
  r('1h22222222222'),
  r('1h22222222222'),
  r('.1h2222222222'),
  r('.1h222222222.'),
  r('.1n1..1n1'),
  r('..n1..1n1'),
  r('..n1.1n1'),
  r('..1n1n1'),
  r('..1nn1'),
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
];

const CC2: number[][] = CC1.map(row => [...row]); // hold
const CC3: number[][] = CA0.map(row => [...row]); // retract

export const IORI_CLOSE_C_FRAMES: PixelFrame[] = [CC0, CC1, CC2, CC3].map(pixels => ({
  width: W,
  height: 72,
  palette: PALETTE,
  pixels,
  anchor: { x: Math.floor(W / 2), y: 72 },
}));

// ===== CLOSE_B (close light kick — knee strike) — 3 frames =====
// Quick knee strike from close range — compact and brutal.
const CB0: number[][] = CA0.map(row => [...row]); // windup

const CB1: number[][] = [
  // Knee strike — knee drives up into opponent
  r('.....................12'),
  r('...................13431'),
  r('..................1345631'),
  r('.................12456641'),
  r('................124566531'),
  r('...............1124566541'),
  r('..............1124566541'),
  r('.............11234556531'),
  r('............11234456541'),
  r('...........11234455531'),
  r('..........112344555321'),
  r('.........112344554311'),
  r('........12344554311'),
  r('.......1234555431'),
  r('......1234d8a91'),
  r('.....123.d8a91'),
  r('....123.189a1'),
  r('...123.1b9a1'),
  r('...12.1c8a1'),
  // Torso — arms close to body (close stance, no arm extension)
  r('...1.1d9a12'),
  r('....1c8a1'),
  r('....1d9a1'),
  r('....c8b1'),
  r('...1d9a1'),
  r('...c8b1'),
  r('...d9a1'),
  r('...c8b1'),
  r('...1d91'),
  r('...c81'),
  r('...d9'),
  r('...c8'),
  r('...d9'),
  r('...c8'),
  r('...d9'),
  r('...c8'),
  r('...d9'),
  r('...c8'),
  r('...d9'),
  r('...c8'),
  r('...d9'),
  r('...c8'),
  // Belt + Legs — right knee drives up (short leg visible in front)
  r('...1n1.1n1'),
  r('...1n1.1n1'),
  r('..1hi1.kl1'),
  r('..1hi1.1klm1'),
  r('.1hij1klmklm1'),
  r('.1hij1klmklmk1'),
  r('1hij1klmklm1'),
  r('1hiihklmkl1'),
  r('1hiiij22222'),
  r('1hiij222222'),
  r('1hij2222222'),
  r('1hi22222222'),
  r('1h222222222'),
  r('1h222222222'),
  r('.1h22222222'),
  r('.1h22222222'),
  r('.1n1..1n1'),
  r('..n1..1n1'),
  r('..n1.1n1'),
  r('..1n1n1'),
  r('..1nn1'),
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
];

const CB2: number[][] = CA0.map(row => [...row]); // retract

export const IORI_CLOSE_B_FRAMES: PixelFrame[] = [CB0, CB1, CB2].map(pixels => ({
  width: W,
  height: 72,
  palette: PALETTE,
  pixels,
  anchor: { x: Math.floor(W / 2), y: 72 },
}));

// ===== CLOSE_D (close heavy kick — low sweep) — 4 frames =====
// Sweeping low kick from close range — Iori crouches slightly for power.
const CD0: number[][] = CA0.map(row => [...row]); // windup

const CD1: number[][] = [
  // Low sweep — leg sweeps out low, body stays upright but crouched
  r('.....................12'),
  r('...................13431'),
  r('..................1345631'),
  r('.................12456641'),
  r('................124566531'),
  r('...............1124566541'),
  r('..............1124566541'),
  r('.............11234556531'),
  r('............11234456541'),
  r('...........11234455531'),
  r('..........112344555321'),
  r('.........112344554311'),
  r('........12344554311'),
  r('.......1234555431'),
  r('......1234d8a91'),
  r('.....123.d8a91'),
  r('....123.189a1'),
  r('...123.1b9a1'),
  r('...12.1c8a1'),
  // Torso — leaning slightly forward for sweep
  r('...1.1d9a12'),
  r('....1c8a1'),
  r('....1d9a1'),
  r('....c8b1'),
  r('...1d9a1'),
  r('...c8b1'),
  r('...d9a1'),
  r('...c8b1'),
  r('...1d91'),
  r('...c81'),
  r('...d9'),
  r('...c8'),
  r('...d9'),
  r('...c8'),
  r('...d9'),
  r('...c8'),
  r('...d9'),
  r('...c8'),
  r('...d9'),
  r('...c8'),
  r('...d9'),
  r('...c8'),
  // Belt + Legs — right leg sweeps low across ground
  r('...1n1.1n1'),
  r('...1n1.1n1'),
  r('..1hi11hi1'),
  r('..1hi11hij2'),
  r('.1hij1hij22'),
  r('.1hij1hij222'),
  r('1hij1hij2222'),
  r('1hiihij22222'),
  r('1hiiij222222'),
  r('1hiij2222222'),
  r('1hij22222222'),
  r('1hi222222222'),
  r('1h2222222222'),
  r('1h2222222222'),
  r('.1h222222222'),
  r('.1h222222222'),
  r('.1n1..1n1'),
  r('..n1..1n1'),
  r('..n1.1n1'),
  r('..1n1n1'),
  r('..1nn1'),
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
];

const CD2: number[][] = CD1.map(row => [...row]); // hold
const CD3: number[][] = CA0.map(row => [...row]); // retract

export const IORI_CLOSE_D_FRAMES: PixelFrame[] = [CD0, CD1, CD2, CD3].map(pixels => ({
  width: W,
  height: 72,
  palette: PALETTE,
  pixels,
  anchor: { x: Math.floor(W / 2), y: 72 },
}));
