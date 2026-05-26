/**
 * Ryo Sakazaki special move frames — SNK-style pixel art
 *
 * KO_HOU:  5-frame uppercut (虎咆 →↓↘+P) — anti-air rising fist
 * KOOU:    4-frame projectile (虎煌拳 ↓↘→+P) — energy ball thrust
 *
 * 96x144 px each, 24-color SNK palette.
 * Built from idle/crouch base bodies with pose-specific modifications.
 */

import { RYO_IDLE_FRAMES } from './ryoIdleFrames.js';
import { RYO_CROUCH_FRAMES } from './ryoCrouchFrames.js';

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

// Base bodies
const IDLE_BASE: number[][] = RYO_IDLE_FRAMES[0].pixels.map(row => row.slice());
const CROUCH_BASE: number[][] = RYO_CROUCH_FRAMES[0].pixels.map(row => row.slice());

function clone(src: number[][]): number[][] {
  return src.map(row => row.slice());
}

// ═══════════════════════════════════════════════════════════════════
// KO_HOU — Tiger Roar Uppercut (5 frames)
//
// Ryo's DP-motion anti-air. Body rises with fist going straight up.
// F0: deep crouch wind-up (fist at hip, ready to launch)
// F1: rising — body lifts, fist going up
// F2: peak — maximum height, fist at top (impact frame)
// F3: descending — coming back down
// F4: recovery — back to guard stance
// ═══════════════════════════════════════════════════════════════════

// F0: deep crouch startup — use crouch base, right fist at hip
const KH_F0 = clone(CROUCH_BASE);
// The crouch base already has the body low. Modify the arm to show
// right fist pulled to hip (ready position for uppercut).
// In crouch base, arms are at certain positions. We modify the arm
// area (typically around y=60-80 in crouch) to show fist at hip.
KH_F0[65] = r('........................................kkkkkkkkk..............................');
KH_F0[66] = r('.......................................k111111111k.............................');
KH_F0[67] = r('......................................k11111111111k............................');
KH_F0[68] = r('.....................................k111111111111k...........................');
KH_F0[69] = r('....................................k1eeeeeeeeeee1k..........................');
KH_F0[70] = r('...................................k1eeeeeeeeeeee1k.........................');
// Right fist at hip (y=70-78 area, skin colored at right side)
KH_F0[71] = r('..................................k1eeeeeeeeeeee1k..1d81....................');
KH_F0[72] = r('.................................k1eeeeeeeeeeee1k..1d8d1...................');
KH_F0[73] = r('................................k1eeeeeeeeeeee1k..1d8d1....................');
KH_F0[74] = r('...............................k1eeeeeeeeeeee1k..1d81.....................');
KH_F0[75] = r('..............................k1eeeeeeeeeeee1k..1d1.......................');

// F1: rising — use idle base, arm going up alongside head
const KH_F1 = clone(IDLE_BASE);
// Remove guard fist (y=8-17) — arm is now going up
for (let y = 8; y <= 17; y++) {
  // Clear the guard hand area (keep head/hair)
  const row = KH_F1[y];
  // The guard hand pixels are at higher x positions (x=54-64)
  // Replace them with the rising arm at x=55-62
}
// Rising arm: fist at y=0-5 above head, arm going down to shoulder
// The arm is at x=54-62, to the right of the head
KH_F1[0] = r('..................................................188d1.........................');
KH_F1[1] = r('..................................................1d8d1........................');
KH_F1[2] = r('.................................................188d81.......................');
KH_F1[3] = r('..................................................1d81........................');
KH_F1[4] = r('..................................................1d1.........................');
// y=5-8: arm (gi sleeve) alongside head
KH_F1[5] = r('...............................................1eeee1........................');
KH_F1[6] = r('..............................................1eeee1.........................');
KH_F1[7] = r('.............................................1eeee1..........................');
// y=8-17: keep head, arm continues down
KH_F1[8] = r('.............................11244555442111....1eeee1.........................');
KH_F1[9] = r('............................1123455554321111...1eeee1........................');
KH_F1[10] = r('...........................11245555554211111..1eeee1.........................');
KH_F1[11] = r('..........................1.124555554211.1111.1eeee1........................');
KH_F1[12] = r('.........................12..1234554321..2.1111eeee1.........................');
KH_F1[13] = r('........................1mm2..1345431..2mm.111eeee1..........................');
KH_F1[14] = r('.......................1mmn2..12321..2mm.1111eeee1.........................');
KH_F1[15] = r('......................1mmn21..11.1..12nm.1.11eeee1..........................');
KH_F1[16] = r('.....................1mmn221........12nm21.11eeee1........................');
KH_F1[17] = r('....................1mmn2.1........1.2nm21.11eeee1.........................');

// F2: peak uppercut — fist at maximum height, body slightly off ground
const KH_F2 = clone(IDLE_BASE);
// Fist at y=0-3, arm going down to shoulder at x=54-62
KH_F2[0] = r('..................................................1888d1........................');
KH_F2[1] = r('..................................................188d81.......................');
KH_F2[2] = r('.................................................18888d81......................');
KH_F2[3] = r('..................................................188d81.......................');
KH_F2[4] = r('..................................................1d8d1........................');
KH_F2[5] = r('..................................................1d81.........................');
KH_F2[6] = r('...............................................1eeee1........................');
KH_F2[7] = r('..............................................1eeee1.........................');
// Arm alongside head (y=8-17) — similar to F1
KH_F2[8] = r('.............................11244555442111...1eeee1..........................');
KH_F2[9] = r('............................1123455554321111..1eeee1.........................');
KH_F2[10] = r('...........................11245555554211111.1eeee1..........................');
KH_F2[11] = r('..........................1.124555554211.11111eeee1.........................');
KH_F2[12] = r('.........................12..1234554321..2.1111eeee1........................');
KH_F2[13] = r('........................1mm2..1345431..2mm.1111eeee1.........................');
KH_F2[14] = r('.......................1mmn2..12321..2mm.1111eeee1........................');
KH_F2[15] = r('......................1mmn21..11.1..12nm.1.111eeee1.........................');
KH_F2[16] = r('.....................1mmn221........12nm21.111eeee1........................');
KH_F2[17] = r('....................1mmn2.1........1.2nm21.111eeee1.......................');
// Body shifts up 4px for peak height (feet leave ground)
// Shift lower body rows up by 4 (y=85-143 becomes y=81-139)
// This is done by copying rows
for (let y = 39; y <= 80; y++) {
  KH_F2[y] = IDLE_BASE[y + 4] ? IDLE_BASE[y + 4].slice() : IDLE_BASE[80].slice();
}
// Clear bottom 4 rows (feet off ground)
for (let y = 140; y <= 143; y++) {
  KH_F2[y] = new Array(W).fill(0);
}

// F3: descending — same as F1
const KH_F3 = clone(KH_F1);

// F4: recovery — same as idle
const KH_F4 = clone(IDLE_BASE);

// ═══════════════════════════════════════════════════════════════════
// KOOU — Ko'ou Ken Projectile (4 frames)
//
// Ryo's fireball motion. Both hands thrust forward.
// F0: chamber — hands pulled back at hip
// F1: thrust — both arms extended forward, palms out (launch frame)
// F2: follow-through — arms still extended
// F3: recovery — back to guard
// ═══════════════════════════════════════════════════════════════════

// F0: chamber (hands at hip) — idle base with arms pulled back
const KF_F0 = clone(IDLE_BASE);
// Remove guard fist (arm is chambered at hip, not up near face)
KF_F0[8] = r('.............................11244555442111..................................');
KF_F0[9] = r('............................1123455554321111...................................');
KF_F0[10] = r('...........................11245555554211111....................................');
KF_F0[11] = r('..........................1.124555554211.1111.................................');
KF_F0[12] = r('.........................12..1234554321..2.111..................................');
KF_F0[13] = r('........................1mm2..1345431..2mm.111..................................');
KF_F0[14] = r('.......................1mmn2..12321..2mm.1111..................................');
KF_F0[15] = r('......................1mmn21..11.1..12nm.1.111..................................');
KF_F0[16] = r('.....................1mmn221........12nm21.111...............................');
KF_F0[17] = r('....................1mmn2.1........1.2nm21.111..............................11...');
// y=18-28: arms pulled back at sides (chambered)
KF_F0[18] = r('...................12mn21..........12mn2.1111....................................');
KF_F0[19] = r('..................128921...........12891.111......................................');
KF_F0[20] = r('.................12899a1...........189a1.111d1....................................');
KF_F0[21] = r('................12899a1............189a111d1.....................................');
KF_F0[22] = r('...............12899a1.............1891.1d1......................................');
KF_F0[23] = r('..............12899a1..............18d1d1.......................................');
KF_F0[24] = r('.............12899b21..............1d8d1.......................................');
KF_F0[25] = r('............1289b1................1d8d1........................................');
KF_F0[26] = r('...........1289b1.................1d81.........................................');
KF_F0[27] = r('..........128b1...................1d1..........................................');
KF_F0[28] = r('.........128b1....................11...........................................');

// F1: thrust — both arms extended forward (hadouken pose)
const KF_F1 = clone(IDLE_BASE);
// Remove guard fist near face
KF_F1[8] = r('.............................11244555442111..................................');
KF_F1[9] = r('............................1123455554321111...................................');
KF_F1[10] = r('...........................11245555554211111....................................');
KF_F1[11] = r('..........................1.124555554211.1111.................................');
KF_F1[12] = r('.........................12..1234554321..2.111..................................');
KF_F1[13] = r('........................1mm2..1345431..2mm.111..................................');
KF_F1[14] = r('.......................1mmn2..12321..2mm.1111..................................');
KF_F1[15] = r('......................1mmn21..11.1..12nm.1.111..................................');
KF_F1[16] = r('.....................1mmn221........12nm21.111...............................');
KF_F1[17] = r('....................1mmn2.1........1.2nm21.111..............................11...');
// y=18-28: both arms thrust forward with palms out
// Upper arm: gi sleeve + skin palm at x~80-88
// Lower arm: gi sleeve + skin palm at x~75-83
KF_F1[18] = r('...................12mn21..........12mn2.111..1eeeeeeeeeeeeeeeeeeeeeeeeee188d81.');
KF_F1[19] = r('..................128921...........12891.111.1eeeeeeeeeeeeeeeeeeeeeeeeeee188d81.');
KF_F1[20] = r('.................12899a1...........189a1.111eeeeeeeeeeeeeeeeeeeeeeeeeeee1888d81.');
KF_F1[21] = r('................12899a1............189a111eeeeeeeeeeeeeeeeeeeeeeeeeeeee1888d81.');
KF_F1[22] = r('...............12899a1.............1891.1eeeeeeeeeeeeeeeeeeeeeeeeeeeeee1888d81.');
KF_F1[23] = r('..............12899a1..............18d1eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee1888d81.');
KF_F1[24] = r('.............12899b21..............1d8eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee1d81.....');
KF_F1[25] = r('............1289b1................1d8eeeeeeeeeeeeeeeeeeeeeeeeeeeeee1d81.........');
KF_F1[26] = r('...........1289b1.................1d8eeeeeeeeeeeeeeeeeeeeeeeeeeee1d81...........');
KF_F1[27] = r('..........128b1...................1deeeeeeeeeeeeeeeeeeeeeeeeeee1d81.............');
KF_F1[28] = r('.........128b1....................11eeeeeeeeeeeeeeeeeeeeeeee1d81................');

// F2: follow-through — arms still extended but relaxing
const KF_F2 = clone(KF_F1);

// F3: recovery — idle
const KF_F3 = clone(IDLE_BASE);

// ═══════════════════════════════════════════════════════════════════
// Exports
// ═══════════════════════════════════════════════════════════════════

export const RYO_KO_HOU_FRAMES: PixelFrame[] = [
  { width: 96, height: 144, palette: PALETTE, pixels: KH_F0 },
  { width: 96, height: 144, palette: PALETTE, pixels: KH_F1 },
  { width: 96, height: 144, palette: PALETTE, pixels: KH_F2 },
  { width: 96, height: 144, palette: PALETTE, pixels: KH_F3 },
  { width: 96, height: 144, palette: PALETTE, pixels: KH_F4 },
];

export const RYO_KOOU_FRAMES: PixelFrame[] = [
  { width: 96, height: 144, palette: PALETTE, pixels: KF_F0 },
  { width: 96, height: 144, palette: PALETTE, pixels: KF_F1 },
  { width: 96, height: 144, palette: PALETTE, pixels: KF_F2 },
  { width: 96, height: 144, palette: PALETTE, pixels: KF_F3 },
];
