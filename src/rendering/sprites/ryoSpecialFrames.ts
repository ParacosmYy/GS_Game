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
KH_F0[65] = r('........................................kkkkkkkkk..............................');
KH_F0[66] = r('.......................................k111111111k.............................');
KH_F0[67] = r('......................................k11111111111k............................');
KH_F0[68] = r('.....................................k111111111111k...........................');
KH_F0[69] = r('....................................k1eeeeeeeeeee1k..........................');
KH_F0[70] = r('...................................k1eeeeefeeeee1k.........................');
// Right fist at hip (y=70-78 area, skin colored at right side)
KH_F0[71] = r('..................................k1eeeeefeeeee1k..1d81....................');
KH_F0[72] = r('.................................k1eeeeefeeeee1k..1d8d1...................');
KH_F0[73] = r('................................k1eeeeefeeeee1k..1d8d1....................');
KH_F0[74] = r('...............................k1eeeeefeeeee1k..1d81.....................');
KH_F0[75] = r('..............................k1eeeeefeeeee1k..1d1.......................');

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
KH_F1[8] = r('.............................11244556442111....1eeee1.........................');
KH_F1[9] = r('............................1123455654321111...1eeee1........................');
KH_F1[10] = r('...........................11245556554211111..1eeee1.........................');
KH_F1[11] = r('..........................1.124555654211.1111.1eeee1........................');
KH_F1[12] = r('.........................12..1234564321..2.1111eeee1.........................');
KH_F1[13] = r('......................mn1mm2..1347431..2mm.111eeee1.............................................');
KH_F1[14] = r('.....................mn1mmn2..12321..2mm.1111eeee1..............................................');
KH_F1[15] = r('....................mn1mmn21mn.11.1..12nm.1.11eeee1..............................................');
KH_F1[16] = r('...................mn1mmn221........12nm21.11eeee1..............................................');
KH_F1[17] = r('..................mn1mmn2.1mn....1.2nm21.11eeee1..............................................');

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
KH_F2[8] = r('.............................11244556442111...1eeee1..........................');
KH_F2[9] = r('............................1123455654321111..1eeee1.........................');
KH_F2[10] = r('...........................11245556554211111.1eeee1..........................');
KH_F2[11] = r('..........................1.124555654211.11111eeee1.........................');
KH_F2[12] = r('.........................12..1234564321..2.1111eeee1........................');
KH_F2[13] = r('......................mn1mm2..1347431..2mm.1111eeee1............................................');
KH_F2[14] = r('.....................mn1mmn2..12321..2mm.1111eeee1..............................................');
KH_F2[15] = r('....................mn1mmn21mn.11.1..12nm.1.111eeee1.............................................');
KH_F2[16] = r('...................mn1mmn221........12nm21.111eeee1.............................................');
KH_F2[17] = r('..................mn1mmn2.1mn....1.2nm21.111eeee1.............................................');
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
KF_F0[8] = r('.............................11244556442111..................................');
KF_F0[9] = r('............................1123455654321111...................................');
KF_F0[10] = r('...........................11245556554211111....................................');
KF_F0[11] = r('..........................1.124555654211.1111.................................');
KF_F0[12] = r('.........................12..1234564321..2.111..................................');
KF_F0[13] = r('......................mn1mm2..1347431..2mm.111..................................................');
KF_F0[14] = r('.....................mn1mmn2..12321..2mm.1111...................................................');
KF_F0[15] = r('....................mn1mmn21mn.11.1..12nm.1.111..................................................');
KF_F0[16] = r('...................mn1mmn221........12nm21.111..................................................');
KF_F0[17] = r('..................mn1mmn2.1mn....1.2nm21.111..............................11..................');
// y=18-28: arms pulled back at sides (chambered)
KF_F0[18] = r('...................12mn21..........12mn2.1111....................................');
KF_F0[19] = r('..................128921...........12891.111......................................');
KF_F0[20] = r('.................1289la1...........189a1.111d1....................................');
KF_F0[21] = r('................1289ka1............18ka111d1.....................................');
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
KF_F1[8] = r('.............................11244556442111..................................');
KF_F1[9] = r('............................1123455654321111...................................');
KF_F1[10] = r('...........................11245556554211111....................................');
KF_F1[11] = r('..........................1.124555654211.1111.................................');
KF_F1[12] = r('.........................12..1234564321..2.111..................................');
KF_F1[13] = r('......................mn1mm2..1347431..2mm.111..................................................');
KF_F1[14] = r('.....................mn1mmn2..12321..2mm.1111...................................................');
KF_F1[15] = r('....................mn1mmn21mn.11.1..12nm.1.111..................................................');
KF_F1[16] = r('...................mn1mmn221........12nm21.111..................................................');
KF_F1[17] = r('..................mn1mmn2.1mn....1.2nm21.111..............................11..................');
// y=18-28: both arms thrust forward with palms out
// Upper arm: gi sleeve + skin palm at x~80-88
// Lower arm: gi sleeve + skin palm at x~75-83
KF_F1[18] = r('...................12mn21..........12mn2.111..1eefeeeeeeeegeeeeeeeeeeefee188d81.');
KF_F1[19] = r('..................128921...........12891.111.1eefeeeeeeeeegeeeeeeeeeeefee188d81.');
KF_F1[20] = r('.................1289la1...........189a1.111eefeeeeeeeeegeeeeeeeeeeeefee1888d81.');
KF_F1[21] = r('................1289ka1............18ka111eefeeeeeeeeeegeeeeeeeeeeeefee1888d81.');
KF_F1[22] = r('...............12899a1.............1891.1eefeeeeeeeeeegeeeeeeeeeeeeefee1888d81.');
KF_F1[23] = r('..............12899a1..............18d1eefeeeeeeeeeeegeeeeeeeeeeeeeefee1888d81.');
KF_F1[24] = r('.............12899b21..............1d8eefeeeeeeeeeeegeeeeeeeeeeeeeefee1d81.....');
KF_F1[25] = r('............1289b1................1d8eefeeeeeeeeeegeeeeeeeeeeeeefee1d81.........');
KF_F1[26] = r('...........1289b1.................1d8eefeeeeeeeeegeeeeeeeeeeeefee1d81...........');
KF_F1[27] = r('..........128b1...................1deefeeeeeeeeegeeeeeeeeeeefee1d81.............');
KF_F1[28] = r('.........128b1....................11eefeeeeeeegeeeeeeeeeefee1d81................');

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
HI_F1[50] = r('................................................................................');
HI_F1[51] = r('................................................................................');
HI_F1[52] = r('.............................1eeeeeeeeeeeeee1d81..............................');
HI_F1[53] = r('............................1eeeeeeeeeeeeee1d8d1.............................');
HI_F1[54] = r('...........................1eefeeeegeeeeefee1d81.............................');
HI_F1[55] = r('..........................1eefeeeegeeeeefee1d81..............................');
HI_F1[56] = r('.........................1eeeeeeeeeeeeeeeee1d1...............................');
HI_F1[57] = r('........................1eeeeeeeeeeeeeeeee1d1................................');
HI_F1[58] = r('.......................1eeeeeeeeeeeeeeeeee11.................................');
HI_F1[59] = r('......................1eeeeeeeeeeeeeeeee1k1..................................');
HI_F1[60] = r('.....................1eeeeeeeeeeeeeeee1k1...................................');
HI_F1[61] = r('....................1eeeeeeeeeeeeee1k1......................................');
HI_F1[62] = r('...................1eeeeefeeeee1k1.......................................');

// F2: full flying kick — maximum extension (impact frame)
const HI_F2 = clone(JUMP_BASE);
// Body more horizontal, leg fully extended to x~85-92
HI_F2[48] = r('................................................................................');
HI_F2[49] = r('................................................................................');
HI_F2[50] = r('..........................1eefeeeeeeegeeeeeeeeeefee1d81........................');
HI_F2[51] = r('.........................1eeeeeeeeeeeeeeeeeeeeeeee1d8d1.......................');
HI_F2[52] = r('........................1eefeeeeeeeegeeeeeeeeeefee188d81......................');
HI_F2[53] = r('.......................1eefeeeeeeeegeeeeeeeeeefee1888d81.....................');
HI_F2[54] = r('......................1eefeeeeeeeegeeeeeeeeeeefee188d81......................');
HI_F2[55] = r('.....................1eefeeeeeeeegeeeeeeeeeefee1d81........................');
HI_F2[56] = r('....................1eeeeeeeeeeeeeeeeeeeeeeee1d1.........................');
HI_F2[57] = r('...................1eeeeeeeeeeeeeeeeeeeeeee11...........................');
HI_F2[58] = r('..................1eeeeeeeeeeeeeeeeeeeee1k1............................');
HI_F2[59] = r('.................1eeeeeeeeeeeeeeeeee1k1...................................');
HI_F2[60] = r('................1eeeeeeeeeeeeeeee1k1......................................');
HI_F2[61] = r('...............1eeeeeeeeeeeeee1k1.........................................');
HI_F2[62] = r('..............1eeeeefeeeee1k1............................................');

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
HA_F0[18] = r('...................12mn2eeeeeeeeeeeeee2nm2.111..............................');
HA_F0[19] = r('..................128921eeeeeeeeeeeeeee19281.111.............................');
HA_F0[20] = r('.................12899a1eeeeeeeeeeeeeee1a99821.111............................');
HA_F0[21] = r('................12899a1..1eeeeefeeeee1a99821.111...........................');
HA_F0[22] = r('...............12899a1..1eeeeefeeeee1..a9982111d1..........................');
HA_F0[23] = r('..............12899a1..1eeeeefeeeee1..1a99821d1...........................');
HA_F0[24] = r('.............12899b21..1eeeeefeeeee1..12b9981d1..........................');
HA_F0[25] = r('............1289b1....1eeeeefeeeee1....1b98d1...........................');
HA_F0[26] = r('...........1289b1.....1eeeeefeeeee1.....1b9d1..........................');
HA_F0[27] = r('..........128b1.......1eeeeefeeeee1.......1d1..........................');
HA_F0[28] = r('.........128b1........1eeeeefeeeee1........11...........................');

// F1: counter-pose — one arm extended forward, energy gathering
const HA_F1 = clone(IDLE_BASE);
// Left arm crossed at chest, right arm extended forward
HA_F1[16] = r('...................mn1mmn221........12nm21.111..................................................');
HA_F1[17] = r('..................mn1mmn2.1mn....1.2nm21.111..................................................');
HA_F1[18] = r('...................12mn21..........12mn2.111..1eeee1........................');
HA_F1[19] = r('..................128921...........12891.111.1eeee1.........................');
HA_F1[20] = r('.................1289la1...........189a1.1111eeee1..........................');
HA_F1[21] = r('................1289ka1............18ka1111eeee1...........................');
HA_F1[22] = r('...............12899a1.............1891.1eeeeee1...........................');
HA_F1[23] = r('..............12899a1..............18d1eeeeeeee1...........................');
HA_F1[24] = r('.............12899b21..............1d8eeeeeeee1...........................');
HA_F1[25] = r('............1289b1................1d8eeeeeeee1..........................');
HA_F1[26] = r('...........1289b1.................1d8eeeeee1...........................');
HA_F1[27] = r('..........128b1...................1deeeeee1.............................');
HA_F1[28] = r('.........128b1....................11eeeeee1.............................');
// Energy gathering around extended hand (x~70-78, y~22-28)
HA_F1[22] = r('...............12899a1.............1891.1eeee1..mmmmmm....................');
HA_F1[23] = r('..............12899a1..............18d1eeee1..m2222mm...................');
HA_F1[24] = r('.............12899b21..............1d8eeee1..m222222m...................');
HA_F1[25] = r('............1289b1................1d8eeee1..m22mm22m..................');
HA_F1[26] = r('...........1289b1.................1d8eee1..m22m..2m.................');
HA_F1[27] = r('..........128b1...................1deee1..m22m...2m.................');
HA_F1[28] = r('.........128b1....................11eee1..m2m....2m.................');

// F2: impact flash — arm fully extended, energy burst outward
const HA_F2 = clone(HA_F1);
// Bigger energy burst around the hand + impact lines
HA_F2[20] = r('.................1289la1...........189a1.1111eeee1mn.mmmmmm.....................................');
HA_F2[21] = r('................1289ka1............18ka1111eeee1..m222222m.............');
HA_F2[22] = r('...............12899a1.............1891.1eeee1..m22222222m............');
HA_F2[23] = r('..............12899a1..............18d1eeee1..m2222mm2222m...........');
HA_F2[24] = r('.............12899b21..............1d8eeee1.m2222m..m2222m..........');
HA_F2[25] = r('............1289b1................1d8eeee1.m2222m..m222m...........');
HA_F2[26] = r('...........1289b1.................1d8eee1..m222m...m22m.............');
HA_F2[27] = r('..........128b1...................1deee1..m222m...m2m...............');
HA_F2[28] = r('.........128b1....................11eee1..m22m....m2m...............');
// Impact flash at top of burst
HA_F2[19] = r('..................128921...........12891.111.1eeee1mn.mmmm......................................');
HA_F2[18] = r('...................12mn21..........12mn2.111..1eeee1........................');

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
KFC_F0[22] = r('...............12899a1.............1891.1d1..mm22mm........................');
KFC_F0[23] = r('..............12899a1..............18d1d1..m222222m.......................');
KFC_F0[24] = r('.............12899b21..............1d8d1..m22mm22m........................');
KFC_F0[25] = r('............1289b1................1d8d1..m222222m.........................');
KFC_F0[26] = r('...........1289b1.................1d81mn.mm222mm................................................');
KFC_F0[27] = r('..........128b1...................1d1.mn.m2222m.................................................');
KFC_F0[28] = r('.........128b1....................11..mn.mm22mm.................................................');

// F1: release — bigger energy ball with orange glow (extending from KOOU thrust)
const KFC_F1 = clone(KF_F1); // Start from KOOU thrust frame
// Replace the thrust arm area with wider orange-glowing energy ball
// The existing arms extend to x~90 area; we add a larger energy ball
KFC_F1[18] = r('...................12mn21..........12mn2.111..1eefeeeeeegeeeeeeefee188d81.');
KFC_F1[19] = r('..................128921...........12891.111.1eefeeeeeegeeeeeeeefee1888d81.');
KFC_F1[20] = r('.................1289la1...........189a1.111eefeeeeeegeeeeeeeeefee1888d81.');
KFC_F1[21] = r('................1289ka1............18ka111eefeeeeeeeegeeeeeeeeeefee18d81..');
KFC_F1[22] = r('...............12899a1.............1891.1eeeeeeeeeeeeeeemm22meeee1d81....');
KFC_F1[23] = r('..............12899a1..............18d1eeeeeeeeeeeeeem2222222mee1d81.....');
KFC_F1[24] = r('.............12899b21..............1d8eeeeeeeeeeeem222222222221d81.......');
KFC_F1[25] = r('............1289b1................1d8eeeeeeeeeeem2222222222m1d81.........');
KFC_F1[26] = r('...........1289b1.................1d8eeeeeeeem2222222222m1d81...........');
KFC_F1[27] = r('..........128b1...................1deeeeeeem222222222m1d81..............');
KFC_F1[28] = r('.........128b1....................11eeeeeeem2222222m1d81................');

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
KHC_F0[60] = r('..................................k1eeeeefeeeee1k...........................');
KHC_F0[61] = r('.................................k1eeeeefeeeee1k............................');
KHC_F0[62] = r('................................k1eeeeefeeeee1k..1d81......................');
KHC_F0[63] = r('...............................k1eeeeefeeeee1k..1d8d1.....................');
KHC_F0[64] = r('..............................k1eeeeefeeeee1k..1d8d1......................');
KHC_F0[65] = r('.............................k1eeeeefeeeee1k..1d8d1.......................');
KHC_F0[66] = r('............................k111111111111111k..1d8d1........................');
KHC_F0[67] = r('...........................k1111111111111111k..1d81.........................');
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
