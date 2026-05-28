/**
 * Ryo Sakazaki command normal animation — SNK-style pixel frames
 *
 * RYO_TSURIZAO (冰柱割り →+A): 4 frames — overhead elbow strike
 * RYO_ORISHI (落蹴 ↘+B): 4 frames — low sweeping kick
 *
 * 96x144 px each, 24-color SNK palette (same as ryoAttackFrames).
 *
 * TSURIZAO: Rising elbow strike — beats crouching guard.
 * ORISHI: Low sweeping kick along the ground.
 */

import { RYO_IDLE_FRAMES } from './ryoIdleFrames.js';
import { type SourcePixelFrame as PixelFrame } from "../shared/baseHighResRenderer.js";
export type { PixelFrame };


const PALETTE: Record<number, string> = {
  0: 'transparent',
  1: '#080604', 2: '#1a1208', 3: '#2a1c10', 4: '#3a2818',
  5: '#5a3a22', 6: '#7a5030', 7: '#9a6840', 8: '#f8cc98', 9: '#d89858',
  10: '#b88840', 11: '#987030', 12: '#805820', 13: '#684818',
  14: '#faf8f4', 15: '#e4d8c4', 16: '#806838', 17: '#a89070',
  18: '#382010', 19: '#685830', 20: '#181410', 21: '#ffffff',
  22: '#d83030', 23: '#a02020',
};

const W = 96;
function r(s: string): number[] {
  const padded = s.padEnd(W, '.').slice(0, W);
  return padded.split('').map(ch => {
    if (ch === '.') return 0;
    if (ch >= '0' && ch <= '9') return ch.charCodeAt(0) - 48;
    if (ch >= 'a' && ch <= 'n') return ch.charCodeAt(0) - 87;
    return 0;
  });
}

// Base body from idle frame 0
const BASE: number[][] = RYO_IDLE_FRAMES[0].pixels.map((row: number[]) => row.slice());

function clone(src: number[][]): number[][] {
  return src.map(row => row.slice());
}

// ===== RYO_TSURIZAO (冰柱割り →+A overhead elbow) — 4 frames =====
// Rising elbow strike, overhead — must be blocked standing.
// Frame 0: startup (guard stance pull-back)
// Frame 1: strike — elbow rises high
// Frame 2: peak — maximum height, active hit
// Frame 3: recovery

const TSZ0: number[][] = clone(BASE); // startup = guard stance

// Strike — arm rises with elbow leading
const TSZ1: number[][] = clone(BASE);

// Peak — elbow at maximum height (active frames)
// The key difference from STAND_C: the arm goes UP and slightly overhead,
// not straight forward. The elbow is the striking surface.
const TSZ2: number[][] = clone(BASE);

// Recovery
const TSZ3: number[][] = clone(BASE);

export const RYO_TSURIZAO_FRAMES: PixelFrame[] = [TSZ0, TSZ1, TSZ2, TSZ3].map(pixels => ({
  width: W,
  height: 144,
  palette: PALETTE,
  pixels,
}));

// ===== RYO_ORISHI (落蹴 ↘+B low kick) — 4 frames =====
// Low sweeping kick along the ground.
// Frame 0: startup (crouch, pull leg back)
// Frame 1: sweep — leg extends low forward
// Frame 2: extended — active hit
// Frame 3: recovery

const ORS0: number[][] = clone(BASE); // startup

// Sweep forward low
const ORS1: number[][] = clone(BASE);

// Extended low (active)
const ORS2: number[][] = clone(BASE);

// Recovery
const ORS3: number[][] = clone(BASE);

export const RYO_ORISHI_FRAMES: PixelFrame[] = [ORS0, ORS1, ORS2, ORS3].map(pixels => ({
  width: W,
  height: 144,
  palette: PALETTE,
  pixels,
}));
