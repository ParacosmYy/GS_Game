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
SA_F1[8]  = r('.............................11244556442111.2');
SA_F1[9]  = r('...........................2112345565432111122');
SA_F1[10] = r('..........................211245556554211111');
SA_F1[11] = r('.........................21.124555654211.11112');
SA_F1[12] = r('........................2122.1234564321222.11122');
SA_F1[13] = r('......................mn1mm22.13477431.22mm.11122');
SA_F1[14] = r('.....................mn1mmn2.212321.22mm.1111.22');
SA_F1[15] = r('....................mn1mmn21mn.11.12.12nm.1.11122........22');
SA_F1[16] = r('...................mn1mmn221..22222.12nm21.111.2........2222.......2..2');
// y=17: remove right hand, keep headband + left arm start
SA_F1[17] = r('..................mn1mmn2.1mn..221.2nm21.111.222........2112......222222');
// y=18-28: extended arm at chest height, fist at ~x=76-80
// Arm = gi sleeve + skin fist (188d81 = light skin fist with outline)
SA_F1[18] = r('...................12mn21222....22212mn221112.1eeeeeeeeggieeeeeegg1d9122');
SA_F1[19] = r('.................2128921.22......22128b12111.1eeeeeeeeggieeeeeeegg1d9122');
SA_F1[20] = r('................21289la122.......22189a1.111eeeeeeeeggieeeeeegg1d912222');
SA_F1[21] = r('...............21289ka122........2218ka111eeeeeeeeggieeeeeeegg1d912..2');
SA_F1[22] = r('..............212899a12..........221891.1eeeeeeeggieeeeeegg1d912222');
SA_F1[23] = r('.............212899a1............2218d1eeeeeeeeggieeeeeegg1d91.2.2');
SA_F1[24] = r('............212899b2122..........2.1d8eeeeeeeeeggieeeeeeegg1d9122');
SA_F1[25] = r('...........21289b1.222..........221d8eeeeeeeggieeeeeegg1d91..222');
SA_F1[26] = r('..........21289b12.22...........221d8eeeeeeeggieeeeeegg1d9122.2');
SA_F1[27] = r('........22128b1.22...........222221deeeeeeeggieeeeegg1d91.22');
SA_F1[28] = r('.......22128b12.2...........22222.11eeeeeeeggieeeeeegg1d9122');

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
SC_F0[8]  = r('........2222222.............211244556442111.2.........222222');
SC_F0[9]  = r('.........22..2.............2112345565432111122.........2..2');
SC_F0[10] = r('..........................211245556554211111');
SC_F0[11] = r('.........................21.124555654211.11112');
SC_F0[12] = r('........................2122.1234564321222.11122');
SC_F0[13] = r('......................mn1mm22.13477431.22mm.11122');
SC_F0[14] = r('.....................mn1mmn2.212321.22mm.1111.22');
SC_F0[15] = r('....................mn1mmn21mn.11.12.12nm.1.11122.........................22');
SC_F0[16] = r('..2...2............mn1mmn221..22222.12nm21.111.2.............2..2........2222');
SC_F0[17] = r('.222.222..........mn1mmn2.1mn..221.2nm21.111..22............222222......221122');
// y=18-26: arm pulled behind body (visible at x~5-15, skin colored)
SC_F0[18] = r('221dbd122............12mn212....2222.12mn2.1111222.........221ee1222.....2222');
SC_F0[19] = r('.2.1d8d122.........2212892122....2.2.2128b1.111.222.......221ege1.222.....22');
SC_F0[20] = r('.221d91.2..........221289la122........2189a1.111d122......2.1eeegeg122');
SC_F0[21] = r('..2.1d9122.........221289ka122.........218ka111d122......221eegeg1..22');
SC_F0[22] = r('..221d1.22.........2.12899a122...........1891.d12.......22.1eeeegegg122');
SC_F0[23] = r('...2.1d1.22.......2212899a1.2..........2218d1d1........221eeeegiegg1.2');
SC_F0[24] = r('...221dbd122........12899b2122..........2.1d8d122........1eeeegieegg1222');
SC_F0[25] = r('....221dbd122....221289b1.222222.......221d8d122......221eeeeegieegg1.222');
SC_F0[26] = r('......21d9122...221289b12.2222222.....22.1d912.......221eeeeeeggieeeegg122');

// SC_F1: arm extending, fist at ~x=70
const SC_F1 = clone(BASE);
// Remove guard fist
SC_F1[8]  = r('......222222.....2222.222...211244556442111.22........222..............222');
SC_F1[9]  = r('.......2..2.......22...2...2112345565432111122.........2................2');
SC_F1[10] = r('..........................211245556554211111');
SC_F1[11] = r('.........................21.124555654211.11112');
SC_F1[12] = r('........................2122.1234564321222.11122');
SC_F1[13] = r('......................mn1mm22.13477431.22mm.11122');
SC_F1[14] = r('.....................mn1mmn2.212321.22mm.1111.22');
SC_F1[15] = r('....................mn1mmn21mn.11.12.12nm.1.11122.........................22');
SC_F1[16] = r('...................mn1mmn221..22222.12nm21.111.2...................2..2..2222');
SC_F1[17] = r('..................mn1mmn2.1mn..221.2nm21.111.222..................222222221122');
// y=18-28: arm mid-extension, fist at ~x=70
SC_F1[18] = r('...................12mn21222....22212mn221111.1eeeeeeeeggieeeeeegg1d91222222');
SC_F1[19] = r('.................2128921.22......22128b12111.1eeeeeeeggieeeeegg1d91..22..22');
SC_F1[20] = r('................21289la122.......22189a1.111eeeeeeeeggieeeeeeegg1d9122');
SC_F1[21] = r('...............21289ka122........2218ka111eeeeeeeeggieeeeeeegg1d91.22');
SC_F1[22] = r('..............212899a12..........221891.1eeeeeeeeggieeeeeegg1d91.222');
SC_F1[23] = r('.............212899a1............2218d1eeeeeeeggieeeeeegg1d91..222');
SC_F1[24] = r('............212899b2122..........2.1d8eeeeeeeeggieeeeeeegg1d9122');
SC_F1[25] = r('...........21289b1.222..........221d8eeeeeeeeggieeeeeegg1d91.22');
SC_F1[26] = r('..........21289b12.22...........221d8eeeeeeeggieeeeeegg1d912.2');
SC_F1[27] = r('........22128b1.22...........222221deeeeeeeggieeeeegg1d91.22');
SC_F1[28] = r('.......22128b12.2...........22222.11eeeeeeggieeeeegg1d912.2');

// SC_F2: FULL extension, fist at ~x=85 — impact frame
const SC_F2 = clone(BASE);
// Remove guard fist
SC_F2[8]  = r('........2222222.............211244556442111.2.......222222');
SC_F2[9]  = r('.........22..2.............2112345565432111122.......2..2');
SC_F2[10] = r('..........................211245556554211111');
SC_F2[11] = r('.........................21.124555654211.11112');
SC_F2[12] = r('........................2122.1234564321222.11122');
SC_F2[13] = r('......................mn1mm22.13477431.22mm.11122');
SC_F2[14] = r('.....................mn1mmn2.212321.22mm.1111.22');
SC_F2[15] = r('....................mn1mmn21mn.11.12.12nm.1.11122...............................22');
SC_F2[16] = r('...................mn1mmn221..22222.12nm21.111.2............................2..2222');
SC_F2[17] = r('..................mn1mmn2.1mn..221.2nm21.111.222...........................222.21122');
// y=18-28: fully extended arm, fist at ~x=82-85 (188d81 = larger fist)
SC_F2[18] = r('...................12mn21222....22212mn221111.1eeeeeeeeeeeeggieeeeeeeeeeegg188d8122');
SC_F2[19] = r('.................2128921.22......22128b12111.1eeeeeeeeeeeeggieeeeeeeeeeegg188d8122');
SC_F2[20] = r('................21289la122.......22189a1.111eeeeeeeeeeeeggieeeeeeeeeeegg188d81.22');
SC_F2[21] = r('...............21289ka122........2218ka111eeeeeeeeeeeeggieeeeeeeeeegg188d81.2222');
SC_F2[22] = r('..............212899a12..........221891.1eeeeeeeeeeeeggieeeeeeeeeeegg188d81222');
SC_F2[23] = r('.............212899a1............2218d1eeeeeeeeeeeeggieeeeeeeeeeegg188d81.22');
SC_F2[24] = r('............212899b2122..........2.1d8eeeeeeeeeeeeggieeeeeeeeeeegg188d812.2');
SC_F2[25] = r('...........21289b1.222..........221d8eeeeeeeeeeeeggieeeeeeeeeeegg188d812');
SC_F2[26] = r('..........21289b12.22...........221d8eeeeeeeeeeeggieeeeeeeeegg188d81..22');
SC_F2[27] = r('.........2128b1.22..............221deeeeeeeeeeeeggieeeeeeeeeeegg188d8122');
SC_F2[28] = r('........2128b1..2.................11eeeeeeeeeeeggieeeeeeeeeegg188d81.22');

// SC_F3 & SC_F4: recovery — same as guard stance
const SC_F3 = clone(SA_F0);
const SC_F4 = clone(SA_F0);

// ═══════════════════════════════════════════════════════════════════
// CLOSE_A — Close Light Punch (3 frames)
//
// Quick elbow strike at close range. Short reach, fast recovery.
// Body leans slightly forward, arm bent at 90 degrees.
// ═══════════════════════════════════════════════════════════════════

const CA_F0 = clone(BASE);
// CA_F1: elbow strike — arm bent, elbow at ~x=60, body leaning forward
const CA_F1 = clone(BASE);
// Remove guard fist, add elbow strike at mid-chest height
CA_F1[8]  = r('.............................11244556442111.2');
CA_F1[9]  = r('...........................2112345565432111122');
CA_F1[10] = r('..........................211245556554211111');
CA_F1[11] = r('.........................21.124555654211.11112');
CA_F1[12] = r('........................2122.1234564321222.11122');
CA_F1[13] = r('......................mn1mm22.13477431.22mm.11122');
CA_F1[14] = r('.....................mn1mmn2.212321.22mm.1111.22');
CA_F1[15] = r('....................mn1mmn21mn.11.12.12nm.1.11122');
CA_F1[16] = r('...................mn1mmn221..22222.12nm21.111.2....eeee');
CA_F1[17] = r('..................mn1mmn2.1mn..221.2nm21.111.222..ee8899e');
// y=18-22: short bent arm, elbow sticking out at x~60
CA_F1[18] = r('...................12mn21222....22212mn221111..188988e');
CA_F1[19] = r('.................2128921.22......22128b12111.1898.89e');
CA_F1[20] = r('................21289la122.......22189a1.111898.89e');
CA_F1[21] = r('...............21289ka122........2218ka1189.1.89e');
CA_F1[22] = r('..............212899a12..........221891eeee.1e89e');
// CA_F2: recovery — back to guard
const CA_F2 = clone(SA_F0);

// ═══════════════════════════════════════════════════════════════════
// CLOSE_C — Close Heavy Punch (4 frames)
//
// Uppercut-style body blow at close range. Full commitment, strong hit.
// Arm comes from below, fist rises to chin height.
// ═══════════════════════════════════════════════════════════════════

const CC_F0 = clone(BASE);
// Slight crouch before uppercut — body dips 2px
CC_F0[8]  = r('.............................11244556442111.2');
CC_F0[9]  = r('...........................2112345565432111122');
CC_F0[10] = r('..........................211245556554211111');
CC_F0[11] = r('.........................21.124555654211.11112');
// CC_F1: uppercut rising — fist at chest height, body rising
const CC_F1 = clone(BASE);
CC_F1[8]  = r('.............................11244556442111.2');
CC_F1[9]  = r('...........................2112345565432111122');
CC_F1[10] = r('..........................211245556554211111');
CC_F1[11] = r('.........................21.124555654211.11112');
CC_F1[12] = r('........................2122.1234564321222.11122');
CC_F1[13] = r('......................mn1mm22.13477431.22mm.11122');
CC_F1[14] = r('.....................mn1mmn2.212321.22mm.1111.22');
CC_F1[15] = r('....................mn1mmn21mn.11.12.12nm.1.11122');
CC_F1[16] = r('...................mn1mmn221..22222.12nm21.111.2....989');
CC_F1[17] = r('..................mn1mmn2.1mn..221.2nm21.111.222..e9889e');
// y=18-24: rising uppercut arm at x~50-55
CC_F1[18] = r('...................12mn21222....22212mn221111.1eee9889e');
CC_F1[19] = r('.................2128921.22......22128b12111.1eee9.89e');
CC_F1[20] = r('................21289la122.......22189a1.111eee9.889e');
CC_F1[21] = r('...............21289ka122........2218ka111eee981.89e');
CC_F1[22] = r('..............212899a12..........221891.1ee9811.89e');
CC_F1[23] = r('.............212899a1............2218d1ee981.1e9e');
CC_F1[24] = r('............212899b2122..........2.1d8e981.1e9e');
// CC_F2: peak — fist at face height, full extension upward
const CC_F2 = clone(BASE);
CC_F2[8]  = r('.............................112445564421112');
CC_F2[9]  = r('...........................2112345565432111122');
CC_F2[10] = r('..........................211245556554211111');
CC_F2[11] = r('.........................21.124555654211.11112');
CC_F2[12] = r('........................2122.1234564321222.11122');
CC_F2[13] = r('......................mn1mm22.13477431.22mm.11122');
CC_F2[14] = r('.....................mn1mmn2.212321.22mm.1111.22');
CC_F2[15] = r('....................mn1mmn21mn.11.12.12nm.1.11122');
CC_F2[16] = r('...................mn1mmn221..22222.12nm21.111..989');
CC_F2[17] = r('..................mn1mmn2.1mn..221.2nm21.111.2e9889e');
// y=18-24: uppercut peak — fist at face height x~45-50
CC_F2[18] = r('...................12mn21222....22212mn221111eeee9889e');
CC_F2[19] = r('.................2128921.22......22128b12111eee981.9e');
CC_F2[20] = r('................21289la122.......22189a1.11eee98.189e');
CC_F2[21] = r('...............21289ka122........2218ka11eee98.1.89e');
CC_F2[22] = r('..............212899a12..........221891.ee9811.e9e');
CC_F2[23] = r('.............212899a1............2218d1ee981.1e9e');
CC_F2[24] = r('............212899b2122..........2.1d8e9811e9e');
// CC_F3: recovery
const CC_F3 = clone(SA_F0);

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

export const RYO_CLOSE_A_FRAMES: PixelFrame[] = [
  { width: 96, height: 144, palette: PALETTE, pixels: CA_F0 },
  { width: 96, height: 144, palette: PALETTE, pixels: CA_F1 },
  { width: 96, height: 144, palette: PALETTE, pixels: CA_F2 },
];

export const RYO_CLOSE_C_FRAMES: PixelFrame[] = [
  { width: 96, height: 144, palette: PALETTE, pixels: CC_F0 },
  { width: 96, height: 144, palette: PALETTE, pixels: CC_F1 },
  { width: 96, height: 144, palette: PALETTE, pixels: CC_F2 },
  { width: 96, height: 144, palette: PALETTE, pixels: CC_F3 },
];
