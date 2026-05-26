/**
 * Ryo Sakazaki attack animation — SNK-style pixel frames
 *
 * stand_a: 4-frame light punch (quick jab, short reach)
 * stand_c: 5-frame heavy punch (strong straight, long reach)
 * 96x144 px each, 24-color SNK palette.
 *
 * Built from idle base body with arm-position modifications per frame.
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
  14: '#faf8f4', 15: '#f0ece4', 16: '#c4b8a4', 17: '#d0c4b0',
  18: '#9a8a78', 19: '#a09484', 20: '#181410', 21: '#ffffff',
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

// ═══════════════════════════════════════════════════════════════════
// Base body from idle frame 0 (guard stance)
// ═══════════════════════════════════════════════════════════════════

const BASE: number[][] = RYO_IDLE_FRAMES[0].pixels.map(row => row.slice());

function clone(src: number[][]): number[][] {
  return src.map(row => row.slice());
}

// ═══════════════════════════════════════════════════════════════════
// STAND_A — Light Punch (4 frames)
//
// Quick jab with right fist.
// SA_F0: startup — guard stance (same as idle)
// SA_F1: active  — right arm extended, fist at ~x=76
// SA_F2: recovery early — arm retracting (same as guard)
// SA_F3: recovery end — back to guard
// ═══════════════════════════════════════════════════════════════════

const SA_F0 = clone(BASE);

// SA_F1: right arm extends forward as a jab
// Arm: gi sleeve (e) from shoulder to fist (skin 8,9) at x~76
// Remove right guard fist (y=8-17), add extended arm (y=18-28)
const SA_F1 = clone(BASE);
// Remove guard fist near face (y=8-16)
SA_F1[8]  = r('.............................11244556442111');
SA_F1[9]  = r('............................11234556543211112');
SA_F1[10] = r('...........................11245556554211111');
SA_F1[11] = r('..........................1.124555654211.1111');
SA_F1[12] = r('.........................12..1234564321..2.111');
SA_F1[13] = r('......................mn1mm22.13477431..2mm.1112');
SA_F1[14] = r('.....................mn1mmn2..12321..2mm.1111');
SA_F1[15] = r('....................mn1mmn21mn.11.12.12nm.1.1112');
SA_F1[16] = r('...................mn1mmn221...2222.12nm21.111...........22');
// y=17: remove right hand, keep headband + left arm start
SA_F1[17] = r('..................mn1mmn2.1mn...21.2nm21.111.22..........11........2..2');
// y=18-28: extended arm at chest height, fist at ~x=76-80
// Arm = gi sleeve + skin fist (188d81 = light skin fist with outline)
SA_F1[18] = r('...................12mn2122......2212mn2.1112.1eeeeeeeeegigeeeeeegg1d912');
SA_F1[19] = r('..................128921..........2128b1.111.1eeeeeeeeegigeeeeeeegg1d912');
SA_F1[20] = r('.................1289la12.........2189a1.111eeeeeeeeegigeeeeeegg1d91..2');
SA_F1[21] = r('................1289ka1...........218ka111eeeeeeeeegigeeeeeeegg1d91');
SA_F1[22] = r('...............12899a1............21891.1eeeeeeeegigeeeeeegg1d91..2');
SA_F1[23] = r('..............12899a1.............218d1eeeeeeeeegigeeeeeegg1d91');
SA_F1[24] = r('.............12899b212.............1d8eeeeeeeeeegigeeeeeeegg1d912');
SA_F1[25] = r('............1289b1.22............21d8eeeeeeeegigeeeeeegg1d91...2');
SA_F1[26] = r('...........1289b1................21d8eeeeeeeegigeeeeeegg1d912');
SA_F1[27] = r('..........128b1.2................21deeeeeeeegigeeeeegg1d91.2');
SA_F1[28] = r('........2128b1...............222..11eeeeeeeegigeeeeeegg1d912');

// SA_F2 & SA_F3: recovery — same as guard stance
const SA_F2 = clone(SA_F0);
const SA_F3 = clone(SA_F0);

// ═══════════════════════════════════════════════════════════════════
// STAND_C — Heavy Punch (5 frames)
//
// Strong straight punch with full body commitment.
// SC_F0: startup — deep wind-up, arm pulled behind body
// SC_F1: active early — arm extending, body unwinding
// SC_F2: active peak — FULL extension, fist at ~x=85
// SC_F3: recovery early — arm retracting
// SC_F4: recovery end — back to guard
// ═══════════════════════════════════════════════════════════════════

// SC_F0: wind-up — right arm pulled BEHIND the body
const SC_F0 = clone(BASE);
// Remove guard fist (y=8-16)
SC_F0[8]  = r('.........22..2...............11244556442111............2..2');
SC_F0[9]  = r('............................11234556543211112');
SC_F0[10] = r('...........................11245556554211111');
SC_F0[11] = r('..........................1.124555654211.1111');
SC_F0[12] = r('.........................12..1234564321..2.111');
SC_F0[13] = r('......................mn1mm22.13477431..2mm.1112');
SC_F0[14] = r('.....................mn1mmn2..12321..2mm.1111');
SC_F0[15] = r('....................mn1mmn21mn.11.12.12nm.1.1112');
SC_F0[16] = r('...................mn1mmn221...2222.12nm21.111............................22');
SC_F0[17] = r('..2...2...........mn1mmn2.1mn...21.2nm21.111..2..............2..2........2112');
// y=18-26: arm pulled behind body (visible at x~5-15, skin colored)
SC_F0[18] = r('.21dbd1..............12mn21......2.2.12mn2.11112.............1ee12........22');
SC_F0[19] = r('...1d8d12...........2128921...........128b1.111..2.........21ege1..2');
SC_F0[20] = r('..21d91.............21289la12..........189a1.111d12.........1eegieg12');
SC_F0[21] = r('....1d912...........21289ka12...........18ka111d1.........21egieg1..2');
SC_F0[22] = r('...21d1..............12899a12............1891.d1.........2.1eeegiggg12');
SC_F0[23] = r('.....1d1.2.........212899a1.............218d1d1.........21eeeegigegg1');
SC_F0[24] = r('....21dbd1..........12899b212.............1d8d12.........1eeeegigeegg12');
SC_F0[25] = r('......1dbd12.......1289b1.22............21d8d1..........1eeeeegigeegg1..2');
SC_F0[26] = r('.......1d912.....21289b1.....222.......2.1d91.........21eeeeeeegigeeeegg12');

// SC_F1: arm extending, fist at ~x=70
const SC_F1 = clone(BASE);
// Remove guard fist
SC_F1[8]  = r('.......2..2.......22...2.....11244556442111.2..........2................2');
SC_F1[9]  = r('............................11234556543211112');
SC_F1[10] = r('...........................11245556554211111');
SC_F1[11] = r('..........................1.124555654211.1111');
SC_F1[12] = r('.........................12..1234564321..2.111');
SC_F1[13] = r('......................mn1mm22.13477431..2mm.1112');
SC_F1[14] = r('.....................mn1mmn2..12321..2mm.1111');
SC_F1[15] = r('....................mn1mmn21mn.11.12.12nm.1.1112');
SC_F1[16] = r('...................mn1mmn221...2222.12nm21.111............................22');
SC_F1[17] = r('..................mn1mmn2.1mn...21.2nm21.111.22....................2..2..2112');
// y=18-28: arm mid-extension, fist at ~x=70
SC_F1[18] = r('...................12mn2122......2212mn2.1111.1eeeeeeeeegigeeeeeegg1d912..22');
SC_F1[19] = r('..................128921..........2128b1.111.1eeeeeeeegigeeeeegg1d91..2');
SC_F1[20] = r('.................1289la12.........2189a1.111eeeeeeeeegigeeeeeeegg1d912');
SC_F1[21] = r('................1289ka1...........218ka111eeeeeeeeegigeeeeeeegg1d91.2');
SC_F1[22] = r('...............12899a1............21891.1eeeeeeeeegigeeeeeegg1d91.2');
SC_F1[23] = r('..............12899a1.............218d1eeeeeeeegigeeeeeegg1d91..2');
SC_F1[24] = r('.............12899b212.............1d8eeeeeeeeegigeeeeeeegg1d912');
SC_F1[25] = r('............1289b1.22............21d8eeeeeeeeegigeeeeeegg1d91.2');
SC_F1[26] = r('...........1289b1................21d8eeeeeeeegigeeeeeegg1d91');
SC_F1[27] = r('..........128b1.2................21deeeeeeeegigeeeeegg1d91.2');
SC_F1[28] = r('........2128b1...............222..11eeeeeeegigeeeeegg1d91');

// SC_F2: FULL extension, fist at ~x=85 — impact frame
const SC_F2 = clone(BASE);
// Remove guard fist
SC_F2[8]  = r('.........22..2...............11244556442111..........2..2');
SC_F2[9]  = r('............................11234556543211112');
SC_F2[10] = r('...........................11245556554211111');
SC_F2[11] = r('..........................1.124555654211.1111');
SC_F2[12] = r('.........................12..1234564321..2.111');
SC_F2[13] = r('......................mn1mm22.13477431..2mm.1112');
SC_F2[14] = r('.....................mn1mmn2..12321..2mm.1111');
SC_F2[15] = r('....................mn1mmn21mn.11.12.12nm.1.1112');
SC_F2[16] = r('...................mn1mmn221...2222.12nm21.111..................................22');
SC_F2[17] = r('..................mn1mmn2.1mn...21.2nm21.111.22.............................2...112');
// y=18-28: fully extended arm, fist at ~x=82-85 (188d81 = larger fist)
SC_F2[18] = r('...................12mn2122......2212mn2.1111.1eeeeeeeeeeeeegigeeeeeeeeeeegg188d812');
SC_F2[19] = r('..................128921..........2128b1.111.1eeeeeeeeeeeeegigeeeeeeeeeeegg188d81');
SC_F2[20] = r('.................1289la12.........2189a1.111eeeeeeeeeeeeegigeeeeeeeeeeegg188d81.2');
SC_F2[21] = r('................1289ka1...........218ka111eeeeeeeeeeeeegigeeeeeeeeeegg188d81..2');
SC_F2[22] = r('...............12899a1............21891.1eeeeeeeeeeeeegigeeeeeeeeeeegg188d812');
SC_F2[23] = r('..............12899a1.............218d1eeeeeeeeeeeeegigeeeeeeeeeeegg188d81.2');
SC_F2[24] = r('.............12899b212.............1d8eeeeeeeeeeeeegigeeeeeeeeeeegg188d81');
SC_F2[25] = r('............1289b1.22............21d8eeeeeeeeeeeeegigeeeeeeeeeeegg188d81');
SC_F2[26] = r('...........1289b1................21d8eeeeeeeeeeeegigeeeeeeeeegg188d81..2');
SC_F2[27] = r('..........128b1.2................21deeeeeeeeeeeeegigeeeeeeeeeeegg188d812');
SC_F2[28] = r('.........128b1....................11eeeeeeeeeeeegigeeeeeeeeeegg188d81');

// SC_F3 & SC_F4: recovery — same as guard stance
const SC_F3 = clone(SA_F0);
const SC_F4 = clone(SA_F0);

// ═══════════════════════════════════════════════════════════════════
// Exports
// ═══════════════════════════════════════════════════════════════════

export const RYO_STAND_A_FRAMES: PixelFrame[] = [
  { width: 96, height: 144, palette: PALETTE, pixels: SA_F0 },
  { width: 96, height: 144, palette: PALETTE, pixels: SA_F1 },
  { width: 96, height: 144, palette: PALETTE, pixels: SA_F2 },
  { width: 96, height: 144, palette: PALETTE, pixels: SA_F3 },
];

export const RYO_STAND_C_FRAMES: PixelFrame[] = [
  { width: 96, height: 144, palette: PALETTE, pixels: SC_F0 },
  { width: 96, height: 144, palette: PALETTE, pixels: SC_F1 },
  { width: 96, height: 144, palette: PALETTE, pixels: SC_F2 },
  { width: 96, height: 144, palette: PALETTE, pixels: SC_F3 },
  { width: 96, height: 144, palette: PALETTE, pixels: SC_F4 },
];
