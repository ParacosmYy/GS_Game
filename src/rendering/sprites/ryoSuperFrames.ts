/**
 * Ryo Sakazaki super move frames — SNK-style pixel art
 *
 * DM_TEN_HA_OU:    4-frame 天地霸煌拳 DM — massive energy blast super
 * DM_RYUKO_RANBU:   5-frame 龍虎乱舞 DM — rushing auto-combo super
 * SDM_TEN_HA_OU:    3-frame 天地霸煌拳 SDM — enhanced with golden aura
 * HSDM_RYUKO_RANBU: 4-frame 龍虎乱舞 HSDM — hidden super with red energy
 *
 * 96x144 px each, 24-color SNK palette + extended colors for supers.
 * Built from idle/crouch/jump base bodies with pose-specific modifications.
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

function clone(src: number[][]): number[][] {
  return src.map(row => row.slice());
}

// ═══════════════════════════════════════════════════════════════════
// DM_TEN_HA_OU — Tenchi Haoh Ken DM (4 frames)
//
// Ryo's massive energy blast super (天地霸煌拳).
// F0: powerup stance — body crouching, energy gathering at fists
// F1: energy gathering — body rising, ball of energy between hands
// F2: massive blast release — arms thrust forward, huge energy wave
// F3: recovery — arms drop, body exhausted
// ═══════════════════════════════════════════════════════════════════

// F0: powerup stance — crouch base with energy gathering
const THO_F0 = clone(CROUCH_BASE);
// Both fists at chest level, energy gathering between them
THO_F0[58] = r('..........................1eeeeeeeeeegigeeeeegg1k');
THO_F0[59] = r('.........................1eeeeeeeeeegigeeeeeegg1k');
THO_F0[60] = r('........................1eeeeeeeeeegigeeeeeegg1db1k');
THO_F0[61] = r('.......................1eeeeeeeeegigeeeeegg1dbd1k');
THO_F0[62] = r('......................1eegigegmn22meegigegg1d8d1');
THO_F0[63] = r('.....................1eeegegm2222222neeegeg1d91');
THO_F0[64] = r('....................1eeegegm22222222negigeg1d1');
THO_F0[65] = r('...................1eegigegmm2222negigeg11.2.2');
THO_F0[66] = r('..................1eeeeegigegg1k1.......22');
THO_F0[67] = r('.................1eeegigeeegg1k1.2');
THO_F0[68] = r('................kkkkkkkkkkkkkkkkk1222..2.222');

// F1: energy gathering — idle base rising, energy ball between hands
const THO_F1 = clone(IDLE_BASE);
// Body rising with both hands cupping energy in front
// Remove guard arm near face
THO_F1[18] = r('...................12mn21........2212mn2.1112');
THO_F1[19] = r('..................128921..........2128b1.11122....2');
THO_F1[20] = r('.................1289la12.........2189a1.111.1egee12');
THO_F1[21] = r('................1289ka1...........218ka111.1egee1.2');
THO_F1[22] = r('...............12899a1............21891.11.1egee12...22');
// Energy ball between cupped hands (x~55-70, y~24-34)
THO_F1[23] = r('..............12899a1.............218d111..1egee1..mn22mm');
THO_F1[24] = r('.............12899b212.............1dbd1..1egee1.m222222n');
THO_F1[25] = r('............1289b1.22............21d8d1..1egee1m22222222n');
THO_F1[26] = r('...........1289b1................21d91..1egee1m222222222n');
THO_F1[27] = r('..........128b1.2................21d1..1egee1m22222222n');
THO_F1[28] = r('........2128b1...................211..1egee1.mn2222mm');
// Energy glow around the ball
THO_F1[29] = r('..........1b1.....................2.1egee1..mn22nm');
THO_F1[30] = r('.........211.......22..22...........1egee1..m22n.................2');

// F2: massive blast release — both arms thrust forward, huge energy wave
const THO_F2 = clone(IDLE_BASE);
// Both arms extended forward with massive energy wave
THO_F2[18] = r('..........22.......12mn212........212mn2.1111eeeeeeeeegigeeeeeegg1');
THO_F2[19] = r('..................128921..........2128b1.111eeeeeeeegigeeeeeeegg1d1');
THO_F2[20] = r('.................1289la12.........2189a1.111eeeeeeegigeeeeeeeggmn22m');
THO_F2[21] = r('................1289ka1...........218ka1111eeeeeeegigeeeeeggm222222n');
THO_F2[22] = r('...............12899a1............21891.1eeeeeeeegigeeeeggm2222222n');
THO_F2[23] = r('..............12899a1.............218d1eeeeeeeeegigeeeeeggm2222222n');
THO_F2[24] = r('.............12899b212.............1d8eeeeeeeeegigeeeeeggm222222n');
THO_F2[25] = r('............1289b1.22............21d8eeeeeeeeeegigeeeeeggm2222n');
THO_F2[26] = r('...........1289b1................21d8eeeeeeeeeegigeeeeeggmn22m');
THO_F2[27] = r('..........128b1.2................21deeeeeeeeegigeeeeeeeeggmn1');
THO_F2[28] = r('........2128b1...22....2.........211eeeeeeeeeegigeeeeeegg1d1..2222.2');
// Energy wave tip
THO_F2[20] = r('.........22..2...1289la12..........189a1.111eeeeeeegigeeeeeggm2222n1');
THO_F2[21] = r('................1289ka1...........218ka1111eeeeeeegigeeeeeggm222222n12');
THO_F2[22] = r('...............12899a1............21891.1eeeeeeegigeeeeeggm22222222n');
THO_F2[23] = r('..............12899a1.............218d1eeeeeegigeeeeeeggm2222222222n');
THO_F2[24] = r('.............12899b212.............1d8eeeeeeeegigeeeggm2222222222n');
THO_F2[25] = r('............1289b1.22............21d8eeeeeeegigeeeeggm222222222n');
THO_F2[26] = r('...........1289b1................21d8eeeeeeegigeeeggm22222222n');
THO_F2[27] = r('..........128b1.2................21deeeeeeeegigeeeggm222222n');
THO_F2[28] = r('........2128b1.....22..22........211eeeeeegigeeeeggmn2222m');

// F3: recovery — arms drop, body exhausted
const THO_F3 = clone(IDLE_BASE);
// Arms hanging down loosely, body slightly slumped
THO_F3[18] = r('.........22..2.....12mn212.........12mn2.111.........2222');
THO_F3[19] = r('..................128921..........2128b1.111.2');
THO_F3[20] = r('.................1289la12.........2189a1.111d12');
THO_F3[21] = r('................1289ka1...........218ka111d1.2');
THO_F3[22] = r('...............12899a1............21891.1d1');
THO_F3[23] = r('..............12899a1.............218d1d1.2');
THO_F3[24] = r('.............12899b212.............1dbd1');
THO_F3[25] = r('............1289b1.22............21d8d1');
THO_F3[26] = r('...........1289b1................21d91');
THO_F3[27] = r('..........128b1.2................21d1');
THO_F3[28] = r('........2128b1.....2...222.......211..22.222');

// ═══════════════════════════════════════════════════════════════════
// DM_RYUKO_RANBU — Ryuko Ranbu DM (5 frames)
//
// Ryo's rushing auto-combo super (龍虎乱舞).
// F0: dash start — body leaning forward, ready to rush
// F1: punch rush hit 1 — straight punch
// F2: punch rush hit 2 — hook punch
// F3: punch rush hit 3 — body blow
// F4: final uppercut — rising KO blow
// ═══════════════════════════════════════════════════════════════════

// F0: dash start — idle base leaning forward
const RR_F0 = clone(IDLE_BASE);
// Lean body forward by shifting upper body left
RR_F0[16] = r('.........22..2.....1mmn2212.......12nm21.1112');
RR_F0[17] = r('................2.1mmn2.1........1.2nm21.1112');
RR_F0[18] = r('................12mn21..2......212mn2.111.22');
RR_F0[19] = r('...............128921..........2128b1.11122....2');
RR_F0[20] = r('..............1289la12.........2189a1.111.1egee12');
RR_F0[21] = r('.............1289ka1...........218ka111.1egee1.2');
// Rush stance — one arm forward ready to punch
RR_F0[22] = r('............12899a1............21891.11.1egee12');
RR_F0[23] = r('...........12899a1.............218d111.1egee1');
RR_F0[24] = r('..........12899b212.............1dbd1.1egee1');
RR_F0[25] = r('.........1289b1.22............21d8d1.1d91..2');
RR_F0[26] = r('........1289b1................21d91.21d1');
RR_F0[27] = r('.......128b1.2................21d1..211');
RR_F0[28] = r('.....2128b1........22..22.....211..22..2.222..2.....................2..2');

// F1: straight punch (hit 1) — arm fully extended
const RR_F1 = clone(IDLE_BASE);
// Right arm fully extended forward in a straight punch
RR_F1[18] = r('......22..2........12mn212.....22.212mn2.1112.1eeeeeeeegigeeeeeeeegg1d912');
RR_F1[19] = r('..................128921..........2128b1.111.1eeeeeeeegigeeeeeeeegg1d91');
RR_F1[20] = r('.................1289la12.........2189a1.111eeeeeeeegigeeeeeeeegg1d91.2');
RR_F1[21] = r('................1289ka1...........218ka1111eeeeeeeeegigeeeeeeegg1d91');
RR_F1[22] = r('...............12899a1............21891.1eeeeeeeegigeeeeeeegg1d91..2');
RR_F1[23] = r('..............12899a1.............218d1eeeeeegigeeeeeegg1d1..2..2');
RR_F1[24] = r('.............12899b212.............1d8eeeeeeeegigeeeegg1d1');
RR_F1[25] = r('............1289b1.22............21d8eeeeeeegigeeegg1d1..2');
RR_F1[26] = r('...........1289b1................21d8eeeeegigeeegg1d1.2');
RR_F1[27] = r('..........128b1.2................21deeeeegigeeegg1d1');
RR_F1[28] = r('........2128b1.....22..22........211eeegigeeegg1d1.2');

// F2: hook punch (hit 2) — arm at different angle
const RR_F2 = clone(IDLE_BASE);
// Left arm hooking across at mid-height
RR_F2[18] = r('.........22..2.....12mn212.........12mn2.111...2.2');
RR_F2[19] = r('..................128921..........2128b1.11122....2');
RR_F2[20] = r('.................1289la12.........2189a1.111.1egee12');
RR_F2[21] = r('................1289ka1...........218ka111.1egee1.2');
RR_F2[22] = r('...............12899a1............21891.11.1egee12');
RR_F2[23] = r('..............12899a1.............218d111..1egee1.2');
RR_F2[24] = r('.............12899b212.............1dbd1.21eeegieg12');
RR_F2[25] = r('............1289b1.22............21d8d1..21eegigeg12');
RR_F2[26] = r('...........1289b1................21d91...21eegigeg12');
RR_F2[27] = r('..........128b1.2................21d1....21eegigeg12');
RR_F2[28] = r('........2128b1.....22..22........211...2.2.1d88d1.2');

// F3: body blow (hit 3) — low punch to midsection
const RR_F3 = clone(IDLE_BASE);
// Low punch aimed at opponent's midsection
RR_F3[18] = r('.........22..2.....12mn212.........12mn2.111....2');
RR_F3[19] = r('..................128921..........2128b1.1112');
RR_F3[20] = r('.................1289la12.........2189a1.1112');
RR_F3[21] = r('................1289ka1...........218ka111......2');
RR_F3[22] = r('...............12899a1............21891.11.1egee12');
RR_F3[23] = r('..............12899a1.............218d111.1egee1');
RR_F3[24] = r('.............12899b212.............1dbd1.1egee1');
RR_F3[25] = r('............1289b1.22............21d8d1.1egee1.....2');
RR_F3[26] = r('...........1289b1................21d91.21eeeeegiggg12');
RR_F3[27] = r('..........128b1.2................21d1..21eeeeegiggg12');
RR_F3[28] = r('........2128b1...................211.....1d8888d1......2');

// F4: final uppercut — rising KO blow (like a powered-up KO_HOU)
const RR_F4 = clone(IDLE_BASE);
// Dramatic uppercut — fist high above head, body rising
RR_F4[0] = r('.........22..2....................22.....2......22188bd12');
RR_F4[1] = r('..................................................188bd12');
RR_F4[2] = r('................................................21888bd12');
RR_F4[3] = r('..................................................188d1');
RR_F4[4] = r('.................................................21dbd12');
RR_F4[5] = r('...............................................2..1d91');
RR_F4[6] = r('...............................................1egee1');
RR_F4[7] = r('.............................222.......2222..21egee1');
// Arm alongside head
RR_F4[8] = r('.............................11244556442111..21egee12');
RR_F4[9] = r('............................11234556543211112.1egee12');
RR_F4[10] = r('...........................11245556554211111.1egee1');
RR_F4[11] = r('..........................1.124555654211.1111egee1.2');
RR_F4[12] = r('.........................12..1234564321..2.1111egee1');
RR_F4[13] = r('........................1mm22.13477431..2nm.1111egee12');
RR_F4[14] = r('.......................1mmn2..12321..2mm.1111egee1..2');
RR_F4[15] = r('......................1mmn21mn.11.12.12nm.1.11egee12');
RR_F4[16] = r('.....................1mmn221...22.2.12nm21.11egee1');
RR_F4[17] = r('...................21mmn2.1.......21.2nm21.11egee1....2');
// Body shifts up 6px for dramatic rising effect
for (let y = 37; y <= 78; y++) {
  RR_F4[y] = IDLE_BASE[y + 6] ? IDLE_BASE[y + 6].slice() : IDLE_BASE[80].slice();
}
// Clear bottom rows
for (let y = 138; y <= 143; y++) {
  RR_F4[y] = new Array(W).fill(0);
}
// Add energy flash around fist (impact effect)
RR_F4[0] = r('....................2...2.2........2.2..mmmmmm...188bd12');
RR_F4[1] = r('.......................................m2n2n2n.2188bd1');
RR_F4[2] = r('......................................m2222222n.1888bd12');
RR_F4[3] = r('.......................................m2n2n2n.2188d1.2');
RR_F4[4] = r('............2.2.2...................2.2.mmmmmm...1d8d12');

// ═══════════════════════════════════════════════════════════════════
// SDM_TEN_HA_OU — Tenchi Haoh Ken SDM (3 frames)
//
// Enhanced version of DM with golden aura. Uses the same PALETTE
// but adds golden energy effects (palette indices 14-16 for golden glow).
// F0: golden powerup — body surging with golden energy
// F1: massive golden blast — even bigger than DM version
// F2: dramatic finish — golden energy dispersing
// ═══════════════════════════════════════════════════════════════════

// F0: golden powerup — idle base with golden aura around body
const STO_F0 = clone(IDLE_BASE);
// Golden aura around the whole upper body
// Aura uses bright gi colors (14=white, 15=bright, 16=light)
// Left side aura
STO_F0[5] = r('..........2.141514................2.141514.......2...2');
STO_F0[6] = r('........2.14161516..............2.14161516');
STO_F0[7] = r('.......21414161516...........22.1414161516');
// Body with golden glow overlay
STO_F0[8] = r('........2.2.2.2.2............11244556442111');
STO_F0[9] = r('............................11234556543211112');
STO_F0[10] = r('...........................11245556554211111');
STO_F0[11] = r('..........................1.124555654211.1111');
STO_F0[12] = r('.........................12..1234564321..2.111');
STO_F0[13] = r('........................1mm22.13477431..2nm.1112');
STO_F0[14] = r('.......................1mmn2..12321..2mm.1111');
STO_F0[15] = r('......................1mmn21mn.11.12.12nm.1.1112');
STO_F0[16] = r('.....................1mmn221...22.2.12nm21.111');
STO_F0[17] = r('...2.2.2...........21mmn2.1.......21.2nm21.1112...........2.2.2');
// Arms cupping golden energy
STO_F0[18] = r('...141516............12mn212.......2212mn2.1112...........161514');
STO_F0[19] = r('..15141614..........128921..........2128b1.11122....2..2.14151416');
STO_F0[20] = r('.1416151614.......21289la12.........2189a1.111.1egee12.1416141614');
STO_F0[21] = r('..15141614.........1289ka1............18ka111.1egee1..14151416');
STO_F0[22] = r('.1416151614........12899a1.............1891.11.1egee1.16151614..........');
// Golden energy ball between hands (larger than DM)
STO_F0[23] = r('..15141614........12899a1..............18d111..1egee1.1414161415161414...');
STO_F0[24] = r('.1415161514.......12899b21..............1dbd1..1egee11415161514161514....');
STO_F0[25] = r('..15161416........1289b1................1d8d1..1egee11415161415161514....');
STO_F0[26] = r('.1415161514.......1289b1.................1d91..1egee11415141615141614....');
STO_F0[27] = r('..15161416........128b1...................1d1..1egee1.14151614151614.....');
STO_F0[28] = r('.14151614.........128b1....................11..1egee1..141615141614......');
// Golden aura at sides
STO_F0[30] = r('.141614..........................................................................');
STO_F0[31] = r('..1514..........................................................................');

// F1: massive golden blast — even bigger energy wave than DM
const STO_F1 = clone(IDLE_BASE);
// Both arms extended, massive golden energy wave
STO_F1[18] = r('...................12mn21..........12mn2.1111eeeeeeeeeeegigeeeeeegg1d91...');
STO_F1[19] = r('..................128921...........128b1.111eeeeeeeeegigeeeeeeeeegg1d91...');
STO_F1[20] = r('.................1289la1...........189a1.111eeeeeeeeeegigeeeeeegg1d91.....');
STO_F1[21] = r('................1289ka1............18ka1111eeeeeeegigeeeeeeegg1d91.......');
STO_F1[22] = r('...............12899a1.............1891.1eeeeeeegigeeeeeegg1d91.........');
STO_F1[23] = r('..............12899a1..............18d1eeeeeeegigeeeeeegg1d91...........');
STO_F1[24] = r('.............12899b21..............1d8eeeeeeeegigeeeegg1d91.............');
STO_F1[25] = r('............1289b1................1d8eeeeegigeegg1d91................');
STO_F1[26] = r('...........1289b1.................1d8eeegigegg1d91...................');
STO_F1[27] = r('..........128b1...................1deeegeg1d91......................');
STO_F1[28] = r('.........128b1....................11egieg1d91.........................');
// Golden energy wave tip — much bigger than DM
STO_F1[18] = r('...161514..............12mn21..........12mn2.1111eeeeeeeegigeeegg1d91.......');
STO_F1[19] = r('..1415161414..........128921...........128b1.111eeeeeegigeeeeegg1d91.......');
STO_F1[20] = r('.141615161414........1289la1...........189a1.111eeeegigeegg1d91.........');
STO_F1[21] = r('.141516151614.......1289ka1............18ka1111eeeeegigegg1d91..........');
STO_F1[22] = r('.141615161414.......12899a1.............1891.1eeegigeegg1d91............');
STO_F1[23] = r('.141516151614.......12899a1..............18d1egigeeg1d91..............');
STO_F1[24] = r('..14151614..........12899b21..............1d8eegeg1d91................');
STO_F1[25] = r('..14161514..........1289b1................1d8ee1d91..................');
STO_F1[26] = r('...141614..........1289b1.................1d81d91...................');
STO_F1[27] = r('....1514...........128b1...................1d1......................');
STO_F1[28] = r('....14............128b1....................11.......................');

// F2: dramatic finish — golden energy dispersing, body recovering
const STO_F2 = clone(IDLE_BASE);
// Arms dropping, golden energy particles dissipating
STO_F2[18] = r('...................12mn21..........12mn2.111..............................');
STO_F2[19] = r('..................128921...........128b1.111...............................');
STO_F2[20] = r('.1414............1289la1...........189a1.111d1..............................');
STO_F2[21] = r('..1514...........1289ka1............18ka111d1...............................');
STO_F2[22] = r('.1414...........12899a1.............1891.1d1................................');
STO_F2[23] = r('..1514..........12899a1..............18d1d1.................................');
STO_F2[24] = r('.1414..........12899b21..............1dbd1........................ ..........');
STO_F2[25] = r('..1514.........1289b1................1d8d1...................................');
STO_F2[26] = r('.1414........1289b1.................1d91....................................');
STO_F2[27] = r('..14.........128b1...................1d1.....................................');
STO_F2[28] = r('............128b1....................11......................................');
// Scattered golden particles
STO_F2[12] = r('.........................12..1234564321..2.111..14..........................');
STO_F2[14] = r('.......................1mmn2..12321..2mm.1111.14..........................');
STO_F2[16] = r('.....................1mmn221........12nm21.111.14........................');

// ═══════════════════════════════════════════════════════════════════
// HSDM_RYUKO_RANBU — Ryuko Ranbu HSDM (4 frames)
//
// Hidden super with red energy. More dramatic than SDM.
// F0: dark powerup — body surging with dark red energy
// F1: rush with red trail — dashing forward, red afterimages
// F2: multi-hit — rapid punch combo with red energy
// F3: final devastating blow — massive uppercut with red explosion
// ═══════════════════════════════════════════════════════════════════

// F0: dark powerup — idle base with red energy aura
const HRR_F0 = clone(IDLE_BASE);
// Red energy aura (palette 22=red, 23=dark red) around body
HRR_F0[4] = r('..........232223............................................................');
HRR_F0[5] = r('........223222322..........................................................');
HRR_F0[6] = r('.......2322322322.........................................................');
HRR_F0[7] = r('......22322232223........................................................');
HRR_F0[8] = r('.....2322.11244556442111.2322..............................................');
HRR_F0[9] = r('....2232211234555543211122322.............................................');
HRR_F0[10] = r('...2322.1124555555421111.2322............................................');
HRR_F0[11] = r('..223221.124555654211.1112322..........................................');
HRR_F0[12] = r('.2322..12..1234564321..2.113223.........................................');
HRR_F0[13] = r('223221mm2..13477431..2nm.1123222........................................');
HRR_F0[14] = r('.23221mmn2..12321..2mm.1123223.........................................');
HRR_F0[15] = r('..222mmn21mn.11.1..12nm.1113222..........................................');
HRR_F0[16] = r('.2321mmn221........12nm21.1322..........................................');
HRR_F0[17] = r('22321mmn2.1........1.2nm21.1322.........................................');
// Arms cupping dark red energy
HRR_F0[18] = r('.23212mn21..........12mn2.113223........................................');
HRR_F0[19] = r('2232128921...........128b1.113222.......................................');
HRR_F0[20] = r('.2322899a1...........189a1.1113223.1egee1................................');
HRR_F0[21] = r('2232899a1............189a11132221egee1................................');
HRR_F0[22] = r('.232899a1.............1891.1132231egee1.................................');
// Red energy between hands
HRR_F0[23] = r('2232899a1..............18d113222m2232n1egee1.............................');
HRR_F0[24] = r('.232899b21..............1d83222m2322322n1egee1..........................');
HRR_F0[25] = r('223289b1................13222m223222322n1egee1.........................');
HRR_F0[26] = r('.23289b1.................322m2322322232n1egee1........................');
HRR_F0[27] = r('22328b1...................32m223222322n1egee1.........................');
HRR_F0[28] = r('.2328b1....................1322232232m1egee1.........................');

// F1: rush with red trail — body dashing forward with red afterimage
const HRR_F1 = clone(IDLE_BASE);
// Body leaning far forward with red afterimage trail behind
HRR_F1[16] = r('................1mmn221........12nm21.111...............................');
HRR_F1[17] = r('...............1mmn2.1........1.2nm21.111..............................');
HRR_F1[18] = r('..............2mn21..........12mn2.111..1egee1..........................');
HRR_F1[19] = r('.............28921...........128b1.111.1egee1...........................');
HRR_F1[20] = r('............2899a1...........189a1.1111egee1............................');
HRR_F1[21] = r('...........2899a1............189a1111egee1.............................');
HRR_F1[22] = r('..........2899a1.............1891.1eeegeg1.............................');
HRR_F1[23] = r('........2899a1..............18d1eeegieg1.............................');
HRR_F1[24] = r('.......2899b21..............1d8egigeeg1..............................');
HRR_F1[25] = r('......289b1................1d8eeegieg1..............................');
HRR_F1[26] = r('.....289b1.................1d8eegieg1.................................');
HRR_F1[27] = r('....28b1...................1degigeg1..................................');
HRR_F1[28] = r('...28b1....................11eegieg1..................................');
// Red afterimage trail behind (left side)
HRR_F1[20] = r('.232...2232...2899a1...........189a1.1111egee1.............................');
HRR_F1[21] = r('..232.2232...2899a1............189a1111egee1.............................');
HRR_F1[22] = r('.2322232....2899a1.............1891.1egigeg1.............................');
HRR_F1[23] = r('..23232....2899a1..............18d1egigeeg1.............................');
HRR_F1[24] = r('.23232....2899b21..............1d8eeegieg1..............................');
HRR_F1[25] = r('..232....289b1................1d8egigeeg1..............................');
HRR_F1[26] = r('.232....289b1.................1d8eegieg1.................................');
HRR_F1[27] = r('.......28b1...................1degigeg1..................................');
HRR_F1[28] = r('......28b1....................11eegieg1..................................');

// F2: multi-hit — rapid punch combo with red energy bursts
const HRR_F2 = clone(IDLE_BASE);
// Body in mid-combo — multiple red energy impacts around hands
// Right arm forward punching, left arm chambered
HRR_F2[18] = r('...................12mn21..........12mn2.111..1eeeeeeeegigeeeeegg1d91......');
HRR_F2[19] = r('..................128921...........128b1.111.1eeeeeeegigeeeeegg1d91........');
HRR_F2[20] = r('.................1289la1...........189a1.111eeeeeeegigeeeegg1d91..........');
HRR_F2[21] = r('................1289ka1............18ka1111eeegigeeegg1d91.............');
HRR_F2[22] = r('...............12899a1.............1891.1eeegigeegg1d91...............');
HRR_F2[23] = r('..............12899a1..............18d1eeeeegiggg1d91................');
HRR_F2[24] = r('.............12899b21..............1d8eeegiggg1d91..................');
HRR_F2[25] = r('............1289b1................1d8egigeg1d91.....................');
HRR_F2[26] = r('...........1289b1.................1d8eigeg1d91........................');
HRR_F2[27] = r('..........128b1...................1degei1d91.........................');
HRR_F2[28] = r('.........128b1....................11eee1d91..........................');
// Red impact sparks around the punch endpoint
HRR_F2[18] = r('...................12mn21..........12mn2.111..1eeeegigeggm2322m1d91......');
HRR_F2[19] = r('..................128921...........128b1.111.1eeeegigggm223222n1d91......');
HRR_F2[20] = r('................1289la1...........189a1.1111eegigeggm2322322n1d91.......');
HRR_F2[21] = r('...............1289ka1............18ka1111egigeegm22322232n1d91.........');
HRR_F2[22] = r('..............12899a1.............1891.1eegigegm23222322n1d91..........');
HRR_F2[23] = r('.............12899a1..............18d1egigegm22322232n1d91............');
HRR_F2[24] = r('............12899b21..............1d8eeegegm2322232n1d91...............');
HRR_F2[25] = r('...........1289b1................1d8eigegm223222n1d91.................');
HRR_F2[26] = r('..........1289b1.................1d8eeeem23222n1d91...................');
HRR_F2[27] = r('.........128b1...................1degeem2232n1d91......................');
HRR_F2[28] = r('........128b1....................11eeem232n1d91.........................');

// F3: final devastating blow — massive uppercut with red explosion
const HRR_F3 = clone(IDLE_BASE);
// Similar to RR_F4 final uppercut but with red energy explosion
HRR_F3[0] = r('......................................m232223232n...188bd1..................');
HRR_F3[1] = r('.....................................m22322322322n..188bd1.................');
HRR_F3[2] = r('....................................m2322232322232n.1888bd1................');
HRR_F3[3] = r('.....................................m22322322322n..188d1.................');
HRR_F3[4] = r('......................................m232223232n...1dbd1..................');
HRR_F3[5] = r('..................................................1d91...................');
HRR_F3[6] = r('...............................................1egee1........................');
HRR_F3[7] = r('..............................................1egee1.........................');
HRR_F3[8] = r('.............................11244556442111...1egee1........................');
HRR_F3[9] = r('............................1123455654321111..1egee1.......................');
HRR_F3[10] = r('...........................11245556554211111.1egee1........................');
HRR_F3[11] = r('..........................1.124555654211.1111egee1.......................');
HRR_F3[12] = r('.........................12..1234564321..2.1111egee1........................');
HRR_F3[13] = r('........................1mm2..13477431..2nm.1111egee1.......................');
HRR_F3[14] = r('.......................1mmn2..12321..2mm.1111egee1........................');
HRR_F3[15] = r('......................1mmn21mn.11.1..12nm.1.11egee1.......................');
HRR_F3[16] = r('.....................1mmn221........12nm21.11egee1........................');
HRR_F3[17] = r('....................1mmn2.1........1.2nm21.11egee1.......................');
// Body rises even higher than RR_F4 (8px shift)
for (let y = 35; y <= 76; y++) {
  HRR_F3[y] = IDLE_BASE[y + 8] ? IDLE_BASE[y + 8].slice() : IDLE_BASE[80].slice();
}
// Red energy trailing behind the rising body
for (let y = 85; y <= 95; y++) {
  const src = IDLE_BASE[y - 60];
  if (src) {
    HRR_F3[y] = src.map(v => {
      // Red afterimage: convert body to red energy
      if (v >= 14 && v <= 19) return 22;  // gi -> red
      if (v >= 8 && v <= 13) return 23;   // skin -> dark red
      if (v >= 1 && v <= 7) return 23;    // outline -> dark red
      return 0;
    });
  }
}
// Clear bottom rows
for (let y = 138; y <= 143; y++) {
  HRR_F3[y] = new Array(W).fill(0);
}

// ═══════════════════════════════════════════════════════════════════
// Exports
// ═══════════════════════════════════════════════════════════════════

export const RYO_DM_TEN_HA_OU_FRAMES: PixelFrame[] = [
  { width: 96, height: 144, palette: PALETTE, pixels: THO_F0 },
  { width: 96, height: 144, palette: PALETTE, pixels: THO_F1 },
  { width: 96, height: 144, palette: PALETTE, pixels: THO_F2 },
  { width: 96, height: 144, palette: PALETTE, pixels: THO_F3 },
];

export const RYO_DM_RYUKO_RANBU_FRAMES: PixelFrame[] = [
  { width: 96, height: 144, palette: PALETTE, pixels: RR_F0 },
  { width: 96, height: 144, palette: PALETTE, pixels: RR_F1 },
  { width: 96, height: 144, palette: PALETTE, pixels: RR_F2 },
  { width: 96, height: 144, palette: PALETTE, pixels: RR_F3 },
  { width: 96, height: 144, palette: PALETTE, pixels: RR_F4 },
];

export const RYO_SDM_TEN_HA_OU_FRAMES: PixelFrame[] = [
  { width: 96, height: 144, palette: PALETTE, pixels: STO_F0 },
  { width: 96, height: 144, palette: PALETTE, pixels: STO_F1 },
  { width: 96, height: 144, palette: PALETTE, pixels: STO_F2 },
];

export const RYO_HSDM_RYUKO_RANBU_FRAMES: PixelFrame[] = [
  { width: 96, height: 144, palette: PALETTE, pixels: HRR_F0 },
  { width: 96, height: 144, palette: PALETTE, pixels: HRR_F1 },
  { width: 96, height: 144, palette: PALETTE, pixels: HRR_F2 },
  { width: 96, height: 144, palette: PALETTE, pixels: HRR_F3 },
];
