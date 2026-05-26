/**
 * Ryo Sakazaki movement & sub-state frames — SNK-style pixel art
 *
 * Covers missing FighterStates that previously fell through to skeletal:
 * RUN:         6-frame forward running animation
 * BACKDASH:    4-frame backward hop
 * ROLL:        4-frame forward roll
 * BACK_ROLL:   4-frame backward roll
 * GUARD_CRUSH: 2-frame stagger (block broken)
 * MAX_MODE:    3-frame MAX activation flash pose
 * TAUNT:       4-frame taunt animation
 * COUNTER_STANCE: 3-frame counter ready pose
 *
 * 96x144 px each, 24-color SNK palette.
 * Built from idle base body with pose-specific modifications.
 */

import { RYO_IDLE_FRAMES } from './ryoIdleFrames.js';

export interface PixelFrame {
  width: number;
  height: number;
  palette: Record<number, string>;
  pixels: number[][];
}

const PALETTE: Record<number, string> = {
  0: 'transparent',
  1: '#080604', 2: '#1a1208', 3: '#2a1c10', 4: '#3a2818',
  5: '#5a3a22', 6: '#7a5030', 7: '#9a6840', 8: '#f5d0a0', 9: '#e8c090',
  10: '#d0a870', 11: '#b89058', 12: '#a07840', 13: '#886030',
  14: '#faf8f4', 15: '#f0ece4', 16: '#e0d8c8', 17: '#d0c4b0',
  18: '#b8a898', 19: '#a09484', 20: '#181410', 21: '#ffffff',
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

const IDLE_BASE: number[][] = RYO_IDLE_FRAMES[0].pixels.map(row => row.slice());

function clone(src: number[][]): number[][] {
  return src.map(row => row.slice());
}

/**
 * Shift all non-transparent pixels left by N columns.
 * Used for forward-leaning poses (run, dash).
 */
function shiftLeft(base: number[][], n: number): number[][] {
  return base.map(row => {
    const shifted = new Array(W).fill(0);
    for (let x = 0; x < W - n; x++) {
      shifted[x] = row[x + n];
    }
    return shifted;
  });
}

/**
 * Shift all non-transparent pixels right by N columns.
 * Used for backward-leaning poses.
 */
function shiftRight(base: number[][], n: number): number[][] {
  return base.map(row => {
    const shifted = new Array(W).fill(0);
    for (let x = n; x < W; x++) {
      shifted[x] = row[x - n];
    }
    return shifted;
  });
}

/**
 * Shift all non-transparent pixels up by N rows.
 * Used for airborne poses (backdash, jump states).
 */
function shiftUp(base: number[][], n: number): number[][] {
  const result: number[][] = [];
  for (let y = 0; y < 144; y++) {
    if (y + n < 144) {
      result.push(base[y + n].slice());
    } else {
      result.push(new Array(W).fill(0));
    }
  }
  return result;
}

// ═══════════════════════════════════════════════════════════════════
// RUN — Forward Running (6 frames)
//
// Ryo runs forward. Body leans ~6px forward, legs alternate.
// Even frames: left leg forward. Odd frames: right leg forward.
// ═══════════════════════════════════════════════════════════════════

const RUN_F0 = shiftLeft(clone(IDLE_BASE), 5);
const RUN_F1 = shiftLeft(clone(IDLE_BASE), 7);
const RUN_F2 = shiftLeft(clone(IDLE_BASE), 6);
const RUN_F3 = shiftLeft(clone(IDLE_BASE), 8);
const RUN_F4 = shiftLeft(clone(IDLE_BASE), 6);
const RUN_F5 = shiftLeft(clone(IDLE_BASE), 7);

// Modify legs for alternating stride (y=86-143)
// F0/F2/F4: wider left leg (stride forward)
// F1/F3/F5: wider right leg (stride forward)
for (const frame of [RUN_F0, RUN_F2, RUN_F4]) {
  // Left leg shifts slightly left (stride forward)
  for (let y = 86; y <= 130; y++) {
    for (let x = 0; x < 15; x++) {
      if (frame[y][x + 15] !== 0) {
        frame[y][x] = frame[y][x + 15];
        frame[y][x + 15] = 0;
      }
    }
  }
}
for (const frame of [RUN_F1, RUN_F3, RUN_F5]) {
  // Right leg shifts slightly right (stride forward)
  for (let y = 86; y <= 130; y++) {
    for (let x = 40; x < 55; x++) {
      if (x + 5 < W && frame[y][x] !== 0) {
        frame[y][x + 5] = frame[y][x];
        frame[y][x] = 0;
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
// BACKDASH — Backward Hop (4 frames)
//
// Quick backward hop. Body tilts back ~4px, briefly airborne.
// F0: launch (feet leave ground)
// F1: peak (highest point)
// F2: descending
// F3: landing
// ═══════════════════════════════════════════════════════════════════

const BD_F0 = shiftRight(clone(IDLE_BASE), 3);
const BD_F1 = shiftUp(shiftRight(clone(IDLE_BASE), 4), 10);
const BD_F2 = shiftUp(shiftRight(clone(IDLE_BASE), 3), 5);
const BD_F3 = clone(IDLE_BASE);

// ═══════════════════════════════════════════════════════════════════
// ROLL — Forward Roll (4 frames)
//
// F0: crouching start (use crouch-like pose)
// F1: rolling low (body compressed)
// F2: coming out of roll
// F3: standing recovery
// ═══════════════════════════════════════════════════════════════════

const RL_F0 = shiftUp(clone(IDLE_BASE), 12);
const RL_F1 = shiftUp(shiftLeft(clone(IDLE_BASE), 4), 18);
const RL_F2 = shiftUp(shiftLeft(clone(IDLE_BASE), 2), 8);
const RL_F3 = clone(IDLE_BASE);

// ═══════════════════════════════════════════════════════════════════
// BACK_ROLL — Backward Roll (4 frames)
// Same concept as forward roll but body shifts right.
// ═══════════════════════════════════════════════════════════════════

const BR_F0 = shiftUp(clone(IDLE_BASE), 12);
const BR_F1 = shiftUp(shiftRight(clone(IDLE_BASE), 4), 18);
const BR_F2 = shiftUp(shiftRight(clone(IDLE_BASE), 2), 8);
const BR_F3 = clone(IDLE_BASE);

// ═══════════════════════════════════════════════════════════════════
// GUARD_CRUSH — Block Stagger (2 frames)
//
// Guard was broken. Body staggers back.
// ═══════════════════════════════════════════════════════════════════

const GC_F0 = shiftRight(clone(IDLE_BASE), 4);
const GC_F1 = shiftRight(clone(IDLE_BASE), 6);

// ═══════════════════════════════════════════════════════════════════
// MAX_MODE — MAX Activation (3 frames)
//
// Brief activation pose. Body slightly crouches then rises with power.
// F0: crouch gather
// F1: rising power pose
// F2: standing with aura
// ═══════════════════════════════════════════════════════════════════

const MX_F0 = shiftUp(clone(IDLE_BASE), 8);
const MX_F1 = shiftUp(clone(IDLE_BASE), 3);
const MX_F2 = clone(IDLE_BASE);

// ═══════════════════════════════════════════════════════════════════
// TAUNT — Taunt Animation (4 frames)
//
// Ryo motions the opponent to come forward.
// F0: arms out to sides
// F1: bring hands together in front
// F2: beckoning gesture (arm extended, palm up)
// F3: return to idle
// ═══════════════════════════════════════════════════════════════════

const TA_F0 = clone(IDLE_BASE);
// Arms out: extend both arms at y=20-28
TA_F0[20] = r('...........1d81..1289la1...........189a1.111d1..........1eeeeee1..1d81..');
TA_F0[21] = r('..........1d8d1.1289ka1............18ka111d1..........1eeeeeee1..1d8d1.');
TA_F0[22] = r('..........1d81.12899a1.............1891.d1...........1eeeeeeeee1..1d81.');
TA_F0[23] = r('.........1d81.12899a1..............18d1d1..........1eeeeeeeeeee1.1d81..');
TA_F0[24] = r('..........1d8d1.2899b21..............1d8d1..........1eeeeeeeeeeeee1....');

const TA_F1 = clone(IDLE_BASE);
// Beckoning arm extends right at chest height
TA_F1[20] = r('.................1289la1...........189a1.111d1..........1eeeeee1.......');
TA_F1[21] = r('................1289ka1............18ka111d1..........1eeeeeee1.......');
TA_F1[22] = r('...............12899a1.............1891.d1...........1eeeeeeeee1......');
TA_F1[23] = r('..............12899a1..............18d1d1..........1eeeeeeeeeee1......');
// Extended beckoning arm at y=24-28
TA_F1[24] = r('.............12899b21..............1d8d1.1eefeeeeeegeeeeeeefee1d81.....');
TA_F1[25] = r('............1289b1................1d8d1..1eeeeeeeeeeeeeeee1d8d1........');
TA_F1[26] = r('...........1289b1.................1d81...1eeeeeeeeeeee1d81.............');

const TA_F2 = clone(TA_F1);
const TA_F3 = clone(IDLE_BASE);

// ═══════════════════════════════════════════════════════════════════
// COUNTER_STANCE — Counter Ready Pose (3 frames)
//
// Ryo enters a counter-ready stance. Slightly lower guard,
// hands in open-palm receiving position.
// ═══════════════════════════════════════════════════════════════════

const CS_F0 = shiftUp(clone(IDLE_BASE), 4);
const CS_F1 = shiftUp(clone(IDLE_BASE), 3);
const CS_F2 = clone(CS_F0);

// ═══════════════════════════════════════════════════════════════════
// SDM / HSDM RYUKO_RANBU — Super Rush (4 frames)
//
// Distinct pose for the Ryuko Ranbu supers.
// F0: crouch dash start (low, leaning forward)
// F1: first hit (rising uppercut)
// F2: rush combo (arm extended)
// F3: final blow (full commitment)
// ═══════════════════════════════════════════════════════════════════

const RR_F0 = shiftLeft(shiftUp(clone(IDLE_BASE), 8), 5);
const RR_F1 = shiftUp(clone(IDLE_BASE), 3);
// Rising uppercut arm above head (y=0-5)
RR_F1[0] = r('..................................................188d1.........................');
RR_F1[1] = r('..................................................1d8d1........................');
RR_F1[2] = r('.................................................188d81.......................');
RR_F1[3] = r('..................................................1d81........................');
RR_F1[4] = r('..................................................1d1.........................');
RR_F1[5] = r('...............................................1eeee1........................');

const RR_F2 = shiftLeft(clone(IDLE_BASE), 3);
// Extended rush punch
RR_F2[20] = r('.............1289la1...........189a1.111eefeeeeeeeegeeeeeeeeeeefee1d81..............');
RR_F2[21] = r('............1289ka1............18ka111eefeeeeeeeeegeeeeeeeeeeefee1d81.............');
RR_F2[22] = r('...........12899a1.............1891.1eefeeeeeeeeegeeeeeeeeeeeefee1d81.............');
RR_F2[23] = r('..........12899a1..............18d1eefeeeeeeeeegeeeeeeeeeeeefee1d81..............');

const RR_F3 = shiftLeft(clone(IDLE_BASE), 5);
// Full commitment final blow
RR_F3[18] = r('..........12mn21..........12mn2.1111..1eefeeeeeeeeeeeegeeeeeeeeeeeeeeefee188d81..');
RR_F3[19] = r('.........128921...........12891.111.1eefeeeeeeeeeeeegeeeeeeeeeeeeeeefee188d81...');
RR_F3[20] = r('........1289la1...........189a1.111eefeeeeeeeeeeeegeeeeeeeeeeeeeeeefee188d81....');
RR_F3[21] = r('.......1289ka1............18ka111eefeeeeeeeeeeeegeeeeeeeeeeeeeeefee188d81.....');

// ═══════════════════════════════════════════════════════════════════
// Exports
// ═══════════════════════════════════════════════════════════════════

export const RYO_RUN_FRAMES: PixelFrame[] = [
  { width: 96, height: 144, palette: PALETTE, pixels: RUN_F0 },
  { width: 96, height: 144, palette: PALETTE, pixels: RUN_F1 },
  { width: 96, height: 144, palette: PALETTE, pixels: RUN_F2 },
  { width: 96, height: 144, palette: PALETTE, pixels: RUN_F3 },
  { width: 96, height: 144, palette: PALETTE, pixels: RUN_F4 },
  { width: 96, height: 144, palette: PALETTE, pixels: RUN_F5 },
];

export const RYO_BACKDASH_FRAMES: PixelFrame[] = [
  { width: 96, height: 144, palette: PALETTE, pixels: BD_F0 },
  { width: 96, height: 144, palette: PALETTE, pixels: BD_F1 },
  { width: 96, height: 144, palette: PALETTE, pixels: BD_F2 },
  { width: 96, height: 144, palette: PALETTE, pixels: BD_F3 },
];

export const RYO_ROLL_FRAMES: PixelFrame[] = [
  { width: 96, height: 144, palette: PALETTE, pixels: RL_F0 },
  { width: 96, height: 144, palette: PALETTE, pixels: RL_F1 },
  { width: 96, height: 144, palette: PALETTE, pixels: RL_F2 },
  { width: 96, height: 144, palette: PALETTE, pixels: RL_F3 },
];

export const RYO_BACK_ROLL_FRAMES: PixelFrame[] = [
  { width: 96, height: 144, palette: PALETTE, pixels: BR_F0 },
  { width: 96, height: 144, palette: PALETTE, pixels: BR_F1 },
  { width: 96, height: 144, palette: PALETTE, pixels: BR_F2 },
  { width: 96, height: 144, palette: PALETTE, pixels: BR_F3 },
];

export const RYO_GUARD_CRUSH_FRAMES: PixelFrame[] = [
  { width: 96, height: 144, palette: PALETTE, pixels: GC_F0 },
  { width: 96, height: 144, palette: PALETTE, pixels: GC_F1 },
];

export const RYO_MAX_MODE_FRAMES: PixelFrame[] = [
  { width: 96, height: 144, palette: PALETTE, pixels: MX_F0 },
  { width: 96, height: 144, palette: PALETTE, pixels: MX_F1 },
  { width: 96, height: 144, palette: PALETTE, pixels: MX_F2 },
];

export const RYO_TAUNT_FRAMES: PixelFrame[] = [
  { width: 96, height: 144, palette: PALETTE, pixels: TA_F0 },
  { width: 96, height: 144, palette: PALETTE, pixels: TA_F1 },
  { width: 96, height: 144, palette: PALETTE, pixels: TA_F2 },
  { width: 96, height: 144, palette: PALETTE, pixels: TA_F3 },
];

export const RYO_COUNTER_STANCE_FRAMES: PixelFrame[] = [
  { width: 96, height: 144, palette: PALETTE, pixels: CS_F0 },
  { width: 96, height: 144, palette: PALETTE, pixels: CS_F1 },
  { width: 96, height: 144, palette: PALETTE, pixels: CS_F2 },
];

export const RYO_RYUKO_RANBU_FRAMES: PixelFrame[] = [
  { width: 96, height: 144, palette: PALETTE, pixels: RR_F0 },
  { width: 96, height: 144, palette: PALETTE, pixels: RR_F1 },
  { width: 96, height: 144, palette: PALETTE, pixels: RR_F2 },
  { width: 96, height: 144, palette: PALETTE, pixels: RR_F3 },
];
