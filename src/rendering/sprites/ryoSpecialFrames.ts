/**
 * Ryo Sakazaki special move frames — SNK-style pixel art
 *
 * KO_HOU:  5-frame uppercut (虎咆 →↓↘+P) — anti-air rising fist
 * KOOU:    4-frame projectile (虎煌拳 ↓↘→+P) — energy ball thrust
 * HIEN:    5-frame flying kick (飛燕疾風脚 ←↙↓+K) — advancing overhead
 *
 * 96x144 px each, 24-color SNK palette.
 * Built from idle/crouch/jump base bodies with pose-specific modifications.
 */

import { RYO_IDLE_FRAMES } from './ryoIdleFrames.js';
import { RYO_CROUCH_FRAMES } from './ryoCrouchFrames.js';
import { RYO_JUMP_FRAMES } from './ryoJumpFrames.js';

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

// Base bodies
const IDLE_BASE: number[][] = RYO_IDLE_FRAMES[0].pixels.map(row => row.slice());
const CROUCH_BASE: number[][] = RYO_CROUCH_FRAMES[0].pixels.map(row => row.slice());
const JUMP_BASE: number[][] = RYO_JUMP_FRAMES[2].pixels.map(row => row.slice());

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
KH_F0[65] = r('........................................kkkkkkkkk');
KH_F0[66] = r('.......................................k111111111k');
KH_F0[67] = r('......................................k11111111111k');
KH_F0[68] = r('.....................................k111111111111k');
KH_F0[69] = r('....................................k1eeeegigegg1k');
KH_F0[70] = r('...................................k1eeeegigegg1k.2..2');
// Right fist at hip (y=70-78 area, skin colored at right side)
KH_F0[71] = r('..................................k1eeeegigegg1k..1d912');
KH_F0[72] = r('.................................k1eeeegigegg1k..1dbd12');
KH_F0[73] = r('................................k1eeegiiiggg1k..1d8d1');
KH_F0[74] = r('...............................k1eeegiiiggg1k..1d91.2');
KH_F0[75] = r('..............................k1eeegiiiggg1k.21d1.....2');

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
KH_F1[0] = r('...............................2..........2...2.22188d12');
KH_F1[1] = r('..................................................1dbd12');
KH_F1[2] = r('................................................218bd812');
KH_F1[3] = r('..................................................1d91');
KH_F1[4] = r('..............................................2...1d1');
// y=5-8: arm (gi sleeve) alongside head
KH_F1[5] = r('..............................................1egeg1');
KH_F1[6] = r('.............................................1egieg12');
KH_F1[7] = r('.............................222.......222221egieg1.2');
// y=8-17: keep head, arm continues down
KH_F1[8] = r('.............................11244556442111.2..1eggi12');
KH_F1[9] = r('............................11234556543211112..1eggi12');
KH_F1[10] = r('...........................11245556554211111.21egieg12');
KH_F1[11] = r('..........................1.124555654211.1111.1eggi1');
KH_F1[12] = r('.........................12..1234564321..2.1111egieg12');
KH_F1[13] = r('......................mn1mm22.13477431..2mm.111egieg12');
KH_F1[14] = r('.....................mn1mmn2..12321..2mm.1111eggi1..2');
KH_F1[15] = r('....................mn1mmn21mn.11.12.12nm.1.11egieg12');
KH_F1[16] = r('...................mn1mmn221...2222.12nm21.11eggi1.2');
KH_F1[17] = r('..................mn1mmn2.1mn...21.2nm21.11egieg1.2....2');

// F2: peak uppercut — fist at maximum height, body slightly off ground
const KH_F2 = clone(IDLE_BASE);
// Fist at y=0-3, arm going down to shoulder at x=54-62
KH_F2[0] = r('....................2...2.2......2.2..22.22.....22188bd12');
KH_F2[1] = r('..................................................18bd81');
KH_F2[2] = r('................................................21888bd812');
KH_F2[3] = r('..................................................18bd81');
KH_F2[4] = r('.................................................21d8d1');
KH_F2[5] = r('..............................................2...1d91');
KH_F2[6] = r('..............................................1egieg1');
KH_F2[7] = r('.............................222.......2222.21egieg1');
// Arm alongside head (y=8-17) — similar to F1
KH_F2[8] = r('.............................11244556442111...1eigi12');
KH_F2[9] = r('............................11234556543211112.1eigi12');
KH_F2[10] = r('...........................11245556554211111.1egieg12');
KH_F2[11] = r('..........................1.124555654211.11111eigi1');
KH_F2[12] = r('.........................12..1234564321..2.1111ege1..2');
KH_F2[13] = r('......................mn1mm22.13477431..2mm.1111egieg12');
KH_F2[14] = r('.....................mn1mmn2..12321..2mm.1111eigi1...2');
KH_F2[15] = r('....................mn1mmn21mn.11.12.12nm.1.111ege12');
KH_F2[16] = r('...................mn1mmn221...2222.12nm21.111ege1');
KH_F2[17] = r('..................mn1mmn2.1mn.22.1.2nm21.111ege1.2');
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
KF_F0[8] = r('....................2...2.2..11244556442111....2');
KF_F0[9] = r('............................11234556543211112');
KF_F0[10] = r('...........................11245556554211111');
KF_F0[11] = r('..........................1.124555654211.1111');
KF_F0[12] = r('.........................12..1234564321..2.111');
KF_F0[13] = r('......................mn1mm22.13477431..2mm.1112');
KF_F0[14] = r('.....................mn1mmn2..12321..2mm.1111');
KF_F0[15] = r('....................mn1mmn21mn.11.12.12nm.1.1112');
KF_F0[16] = r('...................mn1mmn221...2222.12nm21.111............................22');
KF_F0[17] = r('..................mn1mmn2.1mn...21.2nm21.111.2...........................2112');
// y=18-28: arms pulled back at sides (chambered)
KF_F0[18] = r('...................12mn2122......2212mn2.11112............................22');
KF_F0[19] = r('..................128921..........2128b1.111.2');
KF_F0[20] = r('.................1289la12.........2189a1.111d12');
KF_F0[21] = r('................1289ka1...........218ka111d1.2');
KF_F0[22] = r('...............12899a1............21891.1d1');
KF_F0[23] = r('..............12899a1.............218d1d1.2');
KF_F0[24] = r('.............12899b212.............1dbd1');
KF_F0[25] = r('............1289b1.22............21d8d1');
KF_F0[26] = r('...........1289b1................21d91');
KF_F0[27] = r('..........128b1.2................21d1');
KF_F0[28] = r('........2128b1...............222..11...2222');

// F1: thrust — both arms extended forward (hadouken pose)
const KF_F1 = clone(IDLE_BASE);
// Remove guard fist near face
KF_F1[8] = r('.........22..2...............11244556442111');
KF_F1[9] = r('............................11234556543211112');
KF_F1[10] = r('...........................11245556554211111');
KF_F1[11] = r('..........................1.124555654211.1111');
KF_F1[12] = r('.........................12..1234564321..2.111');
KF_F1[13] = r('......................mn1mm22.13477431..2mm.1112');
KF_F1[14] = r('.....................mn1mmn2..12321..2mm.1111');
KF_F1[15] = r('....................mn1mmn21mn.11.12.12nm.1.1112');
KF_F1[16] = r('...................mn1mmn221...2222.12nm21.111............................22');
KF_F1[17] = r('..................mn1mmn2.1mn...21.2nm21.111.22........................2..11');
// y=18-28: both arms thrust forward with palms out
// Upper arm: gi sleeve + skin palm at x~80-88
// Lower arm: gi sleeve + skin palm at x~75-83
KF_F1[18] = r('...................12mn2122......2212mn2.1112.1eeeeeeeeeeegigeeeeeeeegg18bd812');
KF_F1[19] = r('..................128921..........2128b1.111.1eeeeeeeeeeegigeeeeeeeeegg18bd812');
KF_F1[20] = r('.................1289la12.........2189a1.111eeeeeeeeeeegigeeeeeeeeegg188bd81');
KF_F1[21] = r('................1289ka1...........218ka111eeeeeeeeeeeegigeeeeeeeeegg188bd81');
KF_F1[22] = r('...............12899a1............21891.1eeeeeeeeeeeeegigeeeeeeeeeegg188bd812');
KF_F1[23] = r('..............12899a1.............218d1eeeeeeeeeeeeegigeeeeeeeeeeegg188bd81');
KF_F1[24] = r('.............12899b212.............1d8eeeeeeeeeeeeegigeeeeeeeeeeegg1d91...2');
KF_F1[25] = r('............1289b1.22............21d8eeeeeeeeeeeeegigeeeeeeeeeegg1d91.2');
KF_F1[26] = r('...........1289b1................21d8eeeeeeeeeeegigeeeeeeeeegg1d91..2');
KF_F1[27] = r('..........128b1.2................21deeeeeeeeeeegigeeeeeeeeegg1d91');
KF_F1[28] = r('........2128b1...................211eeeeeeeeeegigeeeeeeegg1d91..2');

// F2: follow-through — arms still extended but relaxing
const KF_F2 = clone(KF_F1);

// F3: recovery — idle
const KF_F3 = clone(IDLE_BASE);

// ═══════════════════════════════════════════════════════════════════
// HIEN — Flying Kick (5 frames)
//
// Ryo's advancing overhead kick (飛燕疾風脚).
// F0: jump launch (body rising from ground)
// F1: kick extending — body tilting, leg going out
// F2: full flying kick — body horizontal, leg fully extended (impact)
// F3: descending — kick retracting
// F4: recovery — landing stance
// ═══════════════════════════════════════════════════════════════════

// F0: jump launch — use jump mid-air frame
const HI_F0 = clone(JUMP_BASE);

// F1: kick extending — body tilted forward, right leg extending
const HI_F1 = clone(JUMP_BASE);
// Modify the body to show the kick extending at mid-height
// The kick leg extends to x~80-88 at about y=50-65 (waist height)
HI_F1[50] = r('.........22..2....................22......................2..2');
HI_F1[51] = r('.............................2...........2..2');
HI_F1[52] = r('.............................1eeeggigeegg1d912');
HI_F1[53] = r('............................1eeeggigeegg1dbd1..2');
HI_F1[54] = r('...........................1eeeeeeggigeeeegg1d912');
HI_F1[55] = r('..........................1eeeeeeggigeeeegg1d91');
HI_F1[56] = r('.........................1eeeeggigeeegg1d1.2..2');
HI_F1[57] = r('........................1eeeeggigeeegg1d1');
HI_F1[58] = r('.......................1eeeeeggigeeeegg112');
HI_F1[59] = r('......................1eeeeggigeeegg1k1.2');
HI_F1[60] = r('.....................1eeeeegigeegg1k1.2');
HI_F1[61] = r('....................1eeeegigeegg1k1.2');
HI_F1[62] = r('..................21eeeegigegg1k1.2');

// F2: full flying kick — maximum extension (impact frame)
const HI_F2 = clone(JUMP_BASE);
// Body more horizontal, leg fully extended to x~85-92
HI_F2[48] = r('...................2..........2.2');
HI_F2[49] = r('..........................2......................2..2');
HI_F2[50] = r('..........................1eeeeeeeeeggigeeeeeeegg1d912');
HI_F2[51] = r('.........................1eeeeeeeggigeeeeeegg1d8d1...2');
HI_F2[52] = r('........................1eeeeeeeeeggigeeeeeeeegg18bd812');
HI_F2[53] = r('.......................1eeeeeeeeeggigeeeeeeeegg188bd812');
HI_F2[54] = r('......................1eeeeeeeeeeggigeeeeeeeegg18bd81');
HI_F2[55] = r('.....................1eeeeeeeeeggigeeeeeeeegg1d91...2');
HI_F2[56] = r('....................1eeeeeeeggigeeeeeegg1d1..2..2');
HI_F2[57] = r('...................1eeeeeeeggigeeeeeegg11.2');
HI_F2[58] = r('..................1eeeeeeggigeeeegg1k1.22');
HI_F2[59] = r('.................1eeeeeggigeeeegg1k1.2');
HI_F2[60] = r('................1eeeeegigeegg1k1.2.2');
HI_F2[61] = r('...............1eeeegigeegg1k1.2');
HI_F2[62] = r('.............21eeeegigegg1k1........2..2.222');

// F3: descending — kick retracting
const HI_F3 = clone(HI_F1);

// F4: recovery — landing stance (idle)
const HI_F4 = clone(IDLE_BASE);

// ═══════════════════════════════════════════════════════════════════
// RYO_HAOU — Haoh Shokouken Counter Stance (3 frames)
//
// Ryo's counter move (霸王翔吼拳). Arms crossed for windup, then
// one arm extends forward with counter-impact flash.
// F0: windup — arms crossed in front of chest
// F1: counter-pose — one arm extended forward, energy gathering
// F2: impact flash — arm fully extended, energy burst
// ═══════════════════════════════════════════════════════════════════

// F0: windup — arms crossed in front of chest, defensive stance
const HA_F0 = clone(IDLE_BASE);
// Head and hair stay the same. Modify arm area to show crossed arms.
HA_F0[18] = r('..............2....12mn2eeeeegigeegg2nm2.111');
HA_F0[19] = r('..................128921eeeeegigeegg19281.111.2');
HA_F0[20] = r('.................12899a1eeeeegigeegg1a99821.1112');
HA_F0[21] = r('................12899a1..1eeeegigegg1a99821.111');
HA_F0[22] = r('...............12899a1..1eeeegigegg1..a9982111d12');
HA_F0[23] = r('..............12899a1.21eeeegigegg1.21a99821d1.2');
HA_F0[24] = r('.............12899b212.1eeeegigegg12212b9981d12');
HA_F0[25] = r('............1289b1.2221eeeegigegg1....1b98d1.2');
HA_F0[26] = r('...........1289b1....21eeeegigegg12....1b9d12');
HA_F0[27] = r('..........128b1.2....21eeeegigegg12....2.1d12');
HA_F0[28] = r('........2128b1........1eeeegigegg12.22..2.11.2');

// F1: counter-pose — one arm extended forward, energy gathering
const HA_F1 = clone(IDLE_BASE);
// Left arm crossed at chest, right arm extended forward
HA_F1[16] = r('.........22..2.....mn1mmn221........12nm21.1112');
HA_F1[17] = r('..................mn1mmn2.1mn...21.2nm21.111.22...2');
HA_F1[18] = r('...................12mn2122......2212mn2.1112.1ege12');
HA_F1[19] = r('..................128921..........2128b1.111.1ege1');
HA_F1[20] = r('.................1289la12.........2189a1.1111ege1');
HA_F1[21] = r('................1289ka1...........218ka1111ege1.2');
HA_F1[22] = r('...............12899a1............21891.1eegieg12');
HA_F1[23] = r('..............12899a1.............218d1eegieg1.2');
HA_F1[24] = r('.............12899b212.............1d8eegieg1');
HA_F1[25] = r('............1289b1.22............21d8eegieg1');
HA_F1[26] = r('...........1289b1................21d8eegieg12');
HA_F1[27] = r('..........128b1.2................21deegieg1');
HA_F1[28] = r('.........128b1....................11eegieg1');
// Energy gathering around extended hand (x~70-78, y~22-28)
HA_F1[22] = r('...............12899a1.............1891.1ege1..mnmnmn....................');
HA_F1[23] = r('..............12899a1..............18d1ege1..m2222mn...................');
HA_F1[24] = r('.............12899b21..............1d8eeee1..m222222n...................');
HA_F1[25] = r('............1289b1................1d8eeee1..m22mn22m..................');
HA_F1[26] = r('...........1289b1.................1d8eee1..m22n..2n.................');
HA_F1[27] = r('..........128b1...................1deee1..m22n...2n.................');
HA_F1[28] = r('.........128b1....................11eee1..m2n....2n.................');

// F2: impact flash — arm fully extended, energy burst outward
const HA_F2 = clone(HA_F1);
// Bigger energy burst around the hand + impact lines
HA_F2[20] = r('.................1289la1...........189a1.1111ege1mn.mnmnmn.....................................');
HA_F2[21] = r('................1289ka1............18ka1111ege1..m222222n.............');
HA_F2[22] = r('...............12899a1.............1891.1ege1..m22222222n............');
HA_F2[23] = r('..............12899a1..............18d1ege1..m2222mn2222m...........');
HA_F2[24] = r('.............12899b21..............1d8eeee1.m2222n..n2222n..........');
HA_F2[25] = r('............1289b1................1d8eeee1.m2222n..n222n...........');
HA_F2[26] = r('...........1289b1.................1d8eee1..m222n...n22n.............');
HA_F2[27] = r('..........128b1...................1deee1..m222n...n2n...............');
HA_F2[28] = r('.........128b1....................11eee1..m22n....n2n...............');
// Impact flash at top of burst
HA_F2[19] = r('..................128921...........128b1.111.1ege1mn.mnmn......................................');
HA_F2[18] = r('...................12mn21..........12mn2.111..1ege1........................');

// ═══════════════════════════════════════════════════════════════════
// RYO_KOOU_C — Strong Ko'ou Ken (2 frames)
//
// Stronger projectile. Deeper stance with both hands, bigger energy
// ball on release. Reuses KOOU base with wider stance and orange glow.
// F0: deep chamber — wider stance, both hands pulled back
// F1: release — both arms extended, bigger energy ball with orange glow
// ═══════════════════════════════════════════════════════════════════

// F0: deep chamber — wider stance, hands at hip with energy glow
const KFC_F0 = clone(KF_F0); // Start from KOOU chamber frame
// Add energy glow around the chambered hands (orange palette index 22/23)
// Hands are at x~50-60, y~22-28
KFC_F0[22] = r('...............12899a1.............1891.1d1..mn22mm........................');
KFC_F0[23] = r('..............12899a1..............18d1d1..m222222n.......................');
KFC_F0[24] = r('.............12899b21..............1dbd1..m22mn22m........................');
KFC_F0[25] = r('............1289b1................1d8d1..m222222n.........................');
KFC_F0[26] = r('...........1289b1.................1db1mn.mm222mm................................................');
KFC_F0[27] = r('..........128b1...................1d1.mn.m2222m.................................................');
KFC_F0[28] = r('.........128b1....................11..mn.mm22mm.................................................');

// F1: release — bigger energy ball with orange glow (extending from KOOU thrust)
const KFC_F1 = clone(KF_F1); // Start from KOOU thrust frame
// Replace the thrust arm area with wider orange-glowing energy ball
// The existing arms extend to x~90 area; we add a larger energy ball
KFC_F1[18] = r('...................12mn21..........12mn2.111..1eeeeeeeegigeeeeeegg18bd81.');
KFC_F1[19] = r('..................128921...........128b1.111.1eeeeeeeeegigeeeeeegg188bd81.');
KFC_F1[20] = r('.................1289la1...........189a1.111eeeeeeeeegigeeeeeeegg188bd81.');
KFC_F1[21] = r('................1289ka1............18ka111eeeeeeeeeegigeeeeeeeegg18d81..');
KFC_F1[22] = r('...............12899a1.............1891.1eeeeegigeeeggmn22meeee1d91....');
KFC_F1[23] = r('..............12899a1..............18d1eeeegigeeggm2222222nei1d91.....');
KFC_F1[24] = r('.............12899b21..............1d8eeeegigeggm222222222221d91.......');
KFC_F1[25] = r('............1289b1................1d8eeeegigeggm2222222222n1d91.........');
KFC_F1[26] = r('...........1289b1.................1d8eegigegm2222222222n1d91...........');
KFC_F1[27] = r('..........128b1...................1deegiegm222222222n1d91..............');
KFC_F1[28] = r('.........128b1....................11eegiegm2222222n1d91................');

// ═══════════════════════════════════════════════════════════════════
// RYO_KO_HOU_C — Strong Kohou Uppercut (2 frames)
//
// Stronger version of uppercut with deeper crouch before rising,
// higher jump with afterimage. Reuses KO_HOU base with more extension.
// F0: deeper crouch — body lower, fist pulled way back
// F1: higher peak — maximum height, afterimage trail
// ═══════════════════════════════════════════════════════════════════

// F0: deeper crouch — use crouch base, body even lower, fist at waist
const KHC_F0 = clone(CROUCH_BASE);
// Right fist pulled way back at waist level, ready to launch
KHC_F0[60] = r('..................................k1eeeegigegg1k...........................');
KHC_F0[61] = r('.................................k1eeeegigegg1k............................');
KHC_F0[62] = r('................................k1eeeegigegg1k..1d91......................');
KHC_F0[63] = r('...............................k1eeeegigegg1k..1dbd1.....................');
KHC_F0[64] = r('..............................k1eeeegigegg1k..1d8d1......................');
KHC_F0[65] = r('.............................k1eeeegigegg1k..1dbd1.......................');
KHC_F0[66] = r('............................k11111114111111k..1d8d1........................');
KHC_F0[67] = r('...........................k1111111141111111k..1d91.........................');
KHC_F0[68] = r('..........................kkkkkkkkkkkkkkkkkk..1d1..........................');
KHC_F0[69] = r('...............................................11...........................');

// F1: higher peak — use KH_F2 as base but shift even higher
const KHC_F1 = clone(KH_F2);
// Shift body even higher (4 more rows up from F2)
// Afterimage trail left behind (faded version at original position)
for (let y = 35; y <= 76; y++) {
  KHC_F1[y] = IDLE_BASE[y + 8] ? IDLE_BASE[y + 8].slice() : IDLE_BASE[80].slice();
}
// Afterimage — faded copy using lighter palette values
// Place afterimage at y=80-90 area (where body was before rising)
for (let y = 80; y <= 90; y++) {
  const src = IDLE_BASE[y - 60];
  if (src) {
    KHC_F1[y] = src.map(v => {
      // Fade afterimage: darken skin to outline, lighten gi
      if (v >= 1 && v <= 7) return v;       // outline stays
      if (v >= 8 && v <= 13) return 13;     // skin -> darkest skin
      if (v >= 14 && v <= 19) return 19;    // gi -> darkest gi
      return 0;
    });
  }
}

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

export const RYO_HIEN_FRAMES: PixelFrame[] = [
  { width: 96, height: 144, palette: PALETTE, pixels: HI_F0 },
  { width: 96, height: 144, palette: PALETTE, pixels: HI_F1 },
  { width: 96, height: 144, palette: PALETTE, pixels: HI_F2 },
  { width: 96, height: 144, palette: PALETTE, pixels: HI_F3 },
  { width: 96, height: 144, palette: PALETTE, pixels: HI_F4 },
];

export const RYO_HAOU_FRAMES: PixelFrame[] = [
  { width: 96, height: 144, palette: PALETTE, pixels: HA_F0 },
  { width: 96, height: 144, palette: PALETTE, pixels: HA_F1 },
  { width: 96, height: 144, palette: PALETTE, pixels: HA_F2 },
];

export const RYO_KOOU_C_FRAMES: PixelFrame[] = [
  { width: 96, height: 144, palette: PALETTE, pixels: KFC_F0 },
  { width: 96, height: 144, palette: PALETTE, pixels: KFC_F1 },
];

export const RYO_KO_HOU_C_FRAMES: PixelFrame[] = [
  { width: 96, height: 144, palette: PALETTE, pixels: KHC_F0 },
  { width: 96, height: 144, palette: PALETTE, pixels: KHC_F1 },
];
