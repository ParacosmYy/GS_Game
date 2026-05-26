/**
 * Ryo Sakazaki close-range kick frames — SNK-style pixel frames
 *
 * CLOSE_B: 3-frame close light kick (quick knee strike)
 * CLOSE_D: 4-frame close heavy kick (strong knee thrust / front kick)
 * 96x144 px each, 24-color SNK palette.
 *
 * Built from idle base body with leg modifications per frame.
 * Upper body stays in guard stance for close kicks.
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
// CLOSE_B — Close Standing B (Close Light Kick) — 3 frames
//
// Quick knee strike to midsection. Very close range.
// CB_F0: startup — guard stance (same as idle)
// CB_F1: active — right knee drives up and forward, shin folded back
// CB_F2: recovery — back to guard
//
// Anatomy notes:
//   Upper body stays in guard stance.
//   Right leg lifts: knee at ~x=45, y~50-60 (in front of gi top area).
//   The pants gi around the knee area; skin (8,9) at kneecap.
//   Lower right leg (shin) folds back behind the knee.
//   Left leg stays planted in stance.
// ═══════════════════════════════════════════════════════════════════

const CB_F0 = clone(BASE);

// CB_F1: right knee drives forward — active hit frame
// Right leg removed from normal position (y=85+), knee appears at x~42-52, y~52-68
// Left leg stays planted. Upper body unchanged.
const CB_F1 = clone(BASE);

// Remove right leg from normal position (y=85+ on the right side of stance)
// Right leg in idle: pants occupy roughly x=12-45 range at y=64-84 (gi pants),
// then splits into the right leg at y=88+ around x=12-35
// Clear the right leg area and add the knee in front of the gi top

// Right knee appears in front of gi top area (x~42-55, y~50-70)
// The knee is a compact shape: gi pants (e,f,g) around it, skin kneecap (8,9) at front
// Shin folds back so foot is behind/below the knee

// Remove right portion of gi pants (the right leg half) from y=64-84
// In idle, right pants occupy x~12-45 area. We keep left pants, remove right.
CB_F1[64] = r('...........................k1eeeeeeeegigeeegg1k1k');
CB_F1[65] = r('..........................k1eeeeeeegigeeeeeegg1k1k');
CB_F1[66] = r('.........................k1eeeeeeeegigeeeeegg1k1k');
CB_F1[67] = r('........................k1eeeeeeeeegigeeeegg1k1k');
CB_F1[68] = r('.......................k1eeeeeeegigeeeeegg1k1k');
CB_F1[69] = r('......................k1eeeeeeegigeeegg1k1k.2');
CB_F1[70] = r('.....................k1eeeeeeeegigeeeegg1k1k');
CB_F1[71] = r('....................k1eeeeeeeegigeeeegg1k1k');
CB_F1[72] = r('...................k1eeeeeegigeeeeeegg1k1k');
CB_F1[73] = r('..................k1eeeeeegigeeeeegg1k1k');
CB_F1[74] = r('.................k1eeeeegigeeeegg1k1k.2');
CB_F1[75] = r('................k1eeeeegigeeeeegg1k1k');
CB_F1[76] = r('...............k1eeeeeegigeeeeegg1k1k');
CB_F1[77] = r('..............k1eeeeeegigeeegg1k1k.2');
CB_F1[78] = r('.............k1eeeeegigeeegg1k1k');
CB_F1[79] = r('............k1eeeeeegigegg1k1k');
CB_F1[80] = r('...........k1eeeeeegigegg1k1k');
CB_F1[81] = r('..........k1eeeegigeegg1k1k');
CB_F1[82] = r('.........k1eeeeegigegg1k1k');
CB_F1[83] = r('........k1eeeegigegg1k1k');
CB_F1[84] = r('.......k1eeegigeegg1k1k');

// Belt area — keep left side, remove right leg opening
CB_F1[85] = r('......kkkkkkkkkkkkkkkk');
CB_F1[86] = r('.....k11111114111111k.2');
CB_F1[87] = r('....k111111114111111111k');

// Left leg stays (right side of stance) — remove right leg below belt
CB_F1[88] = r('...k1eeeeeegigeeeeegg1k');
CB_F1[89] = r('..k1eeeeeeeegigeeeeegg1k');
CB_F1[90] = r('..k1eeeeeeegigeeeeeegg1k');
CB_F1[91] = r('..k1eeeeeeegigeeeeeegg1k');
CB_F1[92] = r('..k1eeeeeeeegigeeeeegg1k');
CB_F1[93] = r('..k1eeeeeeeeegigeeeegg1k');
CB_F1[94] = r('...k1eeeeeeegigeeeegg1k');
CB_F1[95] = r('...k1eeeeeegigeeeeegg1k');
CB_F1[96] = r('...k1eeeeeegigeeeeegg1k');
CB_F1[97] = r('...k1eeeeeegigeeeeegg1k');
CB_F1[98] = r('....k1eeeegigeeeegg1k');
CB_F1[99] = r('....k1eeeegigeeeegg1k');
CB_F1[100]= r('....k1eeeeeegigeegg1k');
CB_F1[101]= r('.....k1eeeegigeegg1k');
CB_F1[102]= r('.....k1eeeeegigegg1k');
CB_F1[103]= r('.....k1eeeeegigegg1k');
CB_F1[104]= r('......k1eeeeegigeegg1k');
CB_F1[105]= r('......k1eeeeeegigegg1k');
CB_F1[106]= r('......k1eeeegigeeegg1k');
CB_F1[107]= r('.......k1eeeegigg1k.2');
CB_F1[108]= r('.......k1eegigegg1k');
CB_F1[109]= r('.......k1eegigegg1k');
CB_F1[110]= r('........k1egigeg1k');
CB_F1[111]= r('........k1eeegeg1k');
CB_F1[112]= r('........k1eeegeg1k');
CB_F1[113]= r('.........k1ege1k');
CB_F1[114]= r('.........k1ege1k');
CB_F1[115]= r('.........k1ege1k');
CB_F1[116]= r('..........k1ge1k');
CB_F1[117]= r('..........k1ge1k');
CB_F1[118]= r('..........k1ge1k');
CB_F1[119]= r('...........k11k');
CB_F1[120]= r('...........k11k');
CB_F1[121]= r('...........k11k');
CB_F1[122]= r('..........kk.kk');
CB_F1[123]= r('.........kk...kk');
CB_F1[124]= r('........kk.....kk');
CB_F1[125]= r('.......kk.......kk');
CB_F1[126]= r('......kk.........kk');
CB_F1[127]= r('.....kk...........kk');
CB_F1[128]= r('....kk.............kk');
CB_F1[129]= r('...kk...............kk');
CB_F1[130]= r('..kk.................kk');
CB_F1[131]= r('..k12...............21k');
CB_F1[132]= r('..k12...............21k');
CB_F1[133]= r('..k1.................1k');
CB_F1[134]= r('...k12.............21k');
CB_F1[135]= r('...k12.............21k');
CB_F1[136]= r('...k1...............1k');
CB_F1[137]= r('....k12...........21k');
CB_F1[138]= r('....k12...........21k');
CB_F1[139]= r('....kk.............kk');
CB_F1[140]= r('.....kk...........kk');
CB_F1[141]= r('.....kk...........kk');
CB_F1[142]= r('......kk..2.2.2..kk');
CB_F1[143]= r('.......k1k1k1k1k1k.........2......................2');

// Now overlay the right knee in front of the gi top area
// Knee at x~42-55, y~50-68. Gi pants material wraps the knee, skin at kneecap.
// The knee shape is compact — a small round bump with skin-colored front.
// y=50-51: top of thigh rising from gi pants below
CB_F1[50] = r('........2.2.2.2.2.........k1eeeeeeeeeeegigeeeeeegg1k');
CB_F1[51] = r('..........................k1eeeeeeeeegigeeeeeeeegg1k.........2.2');
// y=52-55: thigh rising into knee position
CB_F1[52] = r('..........................k1eeeeeeeeeegigeeeeeeegg1k.......2.1k1');
CB_F1[53] = r('..........................k1eeeeeeeeeeegigeeeeeegg1k.......1keek1');
CB_F1[54] = r('..........................k1eeeeeeeeeegigeeeeeeegg1k...2..1keegek12');
CB_F1[55] = r('...........................k1eeeeeeeegigeeeeeegg1k.....1keegegk1.2');
// y=56-60: knee peak — skin kneecap visible
CB_F1[56] = r('...........................k1eeeeeeeeegigeeeeegg1k....1keege89ek1.2');
CB_F1[57] = r('............................k1eeeeeeeegigeeeegg1k....1keigeg889gek12');
CB_F1[58] = r('.............................k1eeeeeeeegigeeegg1k...1keegieg889gek12');
CB_F1[59] = r('..............................k1eeeeeegigeeeegg1k.21keegigeg89gek1');
CB_F1[60] = r('...............................k1111111141111111k.21keegigeg89gek12');
// y=61-65: shin folds back behind knee (tapers down to the right, behind body)
CB_F1[61] = r('..............................kk1111111141111111kk.1keeegeg89gek1');
CB_F1[62] = r('.............................kk11111111411111111kk..keegieg89ek1');
CB_F1[63] = r('............................k1111111114111111111k...keege89e1k1');
CB_F1[64] = r('...........................k1eeeeeegigeeeeegg1k1k..kge89g1k.2.2');
CB_F1[65] = r('..........................k1eeeeeeeegigeeeegg1k1k..k89ek1');
// y=66-68: shin/foot tucked behind, fading
CB_F1[66] = r('.........................k1eeeeeeeegigeeeegg1k1k...ke89k12');
CB_F1[67] = r('........................k1eeeeeeeegigeeegg1k1k....k891k.2');
CB_F1[68] = r('.......................k1eeeeeeeegigeeegg1k1k.....1d91');

// CB_F2: recovery — back to guard
const CB_F2 = clone(BASE);

// ═══════════════════════════════════════════════════════════════════
// CLOSE_D — Close Standing D (Close Heavy Kick) — 4 frames
//
// Strong knee thrust / close front kick. More commitment than close_B.
// CD_F0: startup — slight crouch/wind-up, body dips
// CD_F1: active early — knee drives forward, body starts leaning
// CD_F2: active peak — full extension, foot at ~x=55
// CD_F3: recovery — back to guard
//
// Anatomy notes:
//   Stronger version of the knee — more body lean, bigger motion.
//   F0: body crouches slightly (legs bend more, torso dips).
//   F1: knee comes up with force, body leans into it.
//   F2: full knee thrust or short front kick, foot extends to x~55.
//   F3: return to guard.
// ═══════════════════════════════════════════════════════════════════

// CD_F0: wind-up — slight crouch, body compresses
const CD_F0 = clone(BASE);

// Crouch wind-up: shift lower body down 1-2px, widen stance slightly
// Torso stays mostly same but belt dips 1px. Legs compress.
// Modify the belt/torso junction area to show slight compression
CD_F0[59] = r('........................2....k1eeeeeeeegigeeeeegg1k..2');
CD_F0[60] = r('..............................k1eeeeeegigeeeeeegg1k');
CD_F0[61] = r('...............................k111111114111111111k');
CD_F0[62] = r('..............................kk1111111114111111111kk');
CD_F0[63] = r('...........................2.kk11111111114111111111kk');
// Wider stance at pants top
CD_F0[64] = r('..........................k1eeeeeeeegigeeegg1k1k.22');
CD_F0[65] = r('.........................k1eeeeeeeegigeeeegg1k1k');
CD_F0[66] = r('........................k1eeeeeeegigeeeeegg1k1k');
CD_F0[67] = r('.......................k1eeeeeegigeeeeegg1k1k');
CD_F0[68] = r('......................k1eeeeeeegigeegg1k1k.2');
CD_F0[69] = r('.....................k1eeeeeegigeeegg1k1k');
CD_F0[70] = r('....................k1eeeeegigeeeeegg1k1k');
CD_F0[71] = r('...................k1eeeeeegigeeeegg1k1k');
CD_F0[72] = r('..................k1eeeeegigeeeeegg1k1k');
CD_F0[73] = r('.................k1eeeeeeegigeeegg1k1k');
CD_F0[74] = r('................k1eeeeegigeeeegg1k1k');
CD_F0[75] = r('...............k1eeeeegigeeeegg1k1k');
CD_F0[76] = r('..............k1eeeeeegigeegg1k1k');
CD_F0[77] = r('.............k1eeeeeegigeegg1k1k');
CD_F0[78] = r('............k1eeeeegigeegg1k1k');
CD_F0[79] = r('...........k1eeeegigeeegg1k1k');
CD_F0[80] = r('..........k1eeeeegigegg1k1k');
CD_F0[81] = r('.........k1eeegigeeegg1k1k');
CD_F0[82] = r('........k1eeeeegiggg1k1k');
CD_F0[83] = r('.......k1eeegigeegg1k1k');
CD_F0[84] = r('......k1eeeegigegg1k1k......2................2.2');

// CD_F1: knee drives forward — body leans into it
// Right knee comes up to belt level, body leans forward slightly
const CD_F1 = clone(BASE);

// Remove right portion of gi pants and right leg
CD_F1[64] = r('.......2..........2.2......k1eeeeeeegigeeeegg1k1k');
CD_F1[65] = r('..........................k1eeeeeeeegigeeeegg1k1k');
CD_F1[66] = r('.........................k1eeeeeegigeeeeeegg1k1k');
CD_F1[67] = r('........................k1eeeeeeegigeeeegg1k1k');
CD_F1[68] = r('.......................k1eeeeeegigeeeeegg1k1k');
CD_F1[69] = r('......................k1eeeeeeegigeeegg1k1k');
CD_F1[70] = r('.....................k1eeeeeeeegigeeegg1k1k');
CD_F1[71] = r('....................k1eeeeeegigeeeeegg1k1k');
CD_F1[72] = r('...................k1eeeeegigeeeeegg1k1k');
CD_F1[73] = r('..................k1eeeeeeegigeeeeegg1k1k');
CD_F1[74] = r('.................k1eeeeegigeeeegg1k1k..2');
CD_F1[75] = r('................k1eeeeegigeeeeegg1k1k');
CD_F1[76] = r('...............k1eeeeeegigeeeeegg1k1k');
CD_F1[77] = r('..............k1eeeeeegigeeegg1k1k.2');
CD_F1[78] = r('.............k1eeeeegigeeegg1k1k');
CD_F1[79] = r('............k1eeeeegigeegg1k1k');
CD_F1[80] = r('...........k1eeeeegigeegg1k1k................................................');
CD_F1[81] = r('..........k1eeeeegigegg1k1k..................................................');
CD_F1[82] = r('.........k1eeeegigeegg1k1k...................................................');
CD_F1[83] = r('........k1eeeegigegg1k1k.....................................................');
CD_F1[84] = r('.......k1eeeeegiggg1k1k......................................................');

// Belt area
CD_F1[85] = r('......kkkkkkkkkkkkkkkk...........................................');
CD_F1[86] = r('.....k11111114111111k............................................');
CD_F1[87] = r('....k111111114111111111k.........................................');

// Left leg stays — right leg removed below belt
CD_F1[88] = r('...k1eeeeeegigeeeeegg1k........................................');
CD_F1[89] = r('..k1eeeeeeeeegigeeeegg1k.......................................');
CD_F1[90] = r('..k1eeeeeeeeegigeeeegg1k.......................................');
CD_F1[91] = r('..k1eeeeeeegigeeeeeegg1k.......................................');
CD_F1[92] = r('..k1eeeeeeegigeeeeeegg1k.......................................');
CD_F1[93] = r('..k1eeeeeeeeegigeeeegg1k.......................................');
CD_F1[94] = r('...k1eeeeeegigeeeeegg1k........................................');
CD_F1[95] = r('...k1eeeeeeegigeeeegg1k........................................');
CD_F1[96] = r('...k1eeeeeegigeeeeegg1k........................................');
CD_F1[97] = r('...k1eeeeeegigeeeeegg1k........................................');
CD_F1[98] = r('....k1eeeegigeeeegg1k.........................................');
CD_F1[99] = r('....k1eeeegigeeeegg1k.........................................');
CD_F1[100]= r('....k1eeeeegigeeegg1k.........................................');
CD_F1[101]= r('.....k1eeeeegigegg1k..........................................');
CD_F1[102]= r('.....k1eeeegigeegg1k..........................................');
CD_F1[103]= r('.....k1eeeeegigegg1k..........................................');
CD_F1[104]= r('......k1eeeegigeeegg1k...........................................');
CD_F1[105]= r('......k1eeeeegigeegg1k...........................................');
CD_F1[106]= r('......k1eeeeegigeegg1k...........................................');
CD_F1[107]= r('.......k1eeegiggg1k............................................');
CD_F1[108]= r('.......k1eegigegg1k............................................');
CD_F1[109]= r('.......k1eeeegigg1k............................................');
CD_F1[110]= r('........k1eeegeg1k.............................................');
CD_F1[111]= r('........k1egigeg1k.............................................');
CD_F1[112]= r('........k1eeegeg1k.............................................');
CD_F1[113]= r('.........k1ege1k..............................................');
CD_F1[114]= r('.........k1ege1k..............................................');
CD_F1[115]= r('.........k1ege1k..............................................');
CD_F1[116]= r('..........k1ge1k...............................................');
CD_F1[117]= r('..........k1ge1k...............................................');
CD_F1[118]= r('..........k1ge1k...............................................');
CD_F1[119]= r('...........k11k................................................');
CD_F1[120]= r('...........k11k................................................');
CD_F1[121]= r('...........k11k................................................');
CD_F1[122]= r('..........kk.kk................................................');
CD_F1[123]= r('.........kk...kk...............................................');
CD_F1[124]= r('........kk.....kk..............................................');
CD_F1[125]= r('.......kk.......kk.............................................');
CD_F1[126]= r('......kk.........kk............................................');
CD_F1[127]= r('.....kk...........kk...........................................');
CD_F1[128]= r('....kk.............kk..........................................');
CD_F1[129]= r('...kk...............kk.........................................');
CD_F1[130]= r('..kk.................kk........................................');
CD_F1[131]= r('..k1.................1k.........................................................................');
CD_F1[132]= r('..k1.................1k.........................................................................');
CD_F1[133]= r('..k1.................1k.........................................................................');
CD_F1[134]= r('...k1...............1k..........................................................................');
CD_F1[135]= r('...k1...............1k..........................................................................');
CD_F1[136]= r('...k1...............1k..........................................................................');
CD_F1[137]= r('....k1.............1k...........................................................................');
CD_F1[138]= r('....k1.............1k...........................................................................');
CD_F1[139]= r('....kk.............kk...........................................................................');
CD_F1[140]= r('.....kk...........kk............................................................................');
CD_F1[141]= r('.....kk...........kk............................................................................');
CD_F1[142]= r('......kk.........kk.............................................................................');
CD_F1[143]= r('.......k1k1k1k1k1k..............................................................................');

// Overlay the driving knee — bigger than close_B, more forceful
// Knee at x~40-58, y~48-68. Body lean shows in gi top shift.
CD_F1[48] = r('..........................k1eeeeeeeeeegigeeeeeeeegg1k.....................................');
CD_F1[49] = r('..........................k1eeeeeeeeegigeeeeeeeeegg1k.....................................');
CD_F1[50] = r('..........................k1eeeeeeeeeeegigeeeeeegg1k..........1k1..........................');
CD_F1[51] = r('..........................k1eeeeeeeeeeegigeeeeeegg1k........1keek1.........................');
CD_F1[52] = r('..........................k1eeeeeeeeegigeeeeeeeegg1k.......1keegek1........................');
CD_F1[53] = r('..........................k1eeeeeeeeeeegigeeeeeegg1k......1keigegk1.......................');
CD_F1[54] = r('..........................k1eeeeeeeeeegigeeeeeeegg1k.....1keeegegk1......................');
CD_F1[55] = r('...........................k1eeeeeeegigeeeeeeegg1k....1keege89e1k1.....................');
CD_F1[56] = r('...........................k1eeeeeeeegigeeeeeegg1k...1keigeg889gek1....................');
CD_F1[57] = r('............................k1eeeeeegigeeeeeegg1k...1kegigeg889gek1...................');
CD_F1[58] = r('.............................k1eeeeeegigeeeeegg1k..1keegigeg889gek1..................');
CD_F1[59] = r('..............................k1eeeeeegigeeeegg1k.1keeegieg889gek1.................');
CD_F1[60] = r('...............................k1111111141111111k.1keeegieg89gek1..................');
CD_F1[61] = r('..............................kk1111111141111111kkkeeegieg89gek1..................');
CD_F1[62] = r('.............................kk11111111411111111kkeegigeg89ek1...................');
CD_F1[63] = r('............................k1111111114111111111kkeege89gek1k1..................');
CD_F1[64] = r('...........................k1eeeeeeeegigeeegg1k1kge89ek1k........................');
CD_F1[65] = r('..........................k1eeeeeegigeeeeeegg1k1k89ek1.........................');
CD_F1[66] = r('.........................k1eeeeeeegigeeeeegg1k1ke891k..........................');
CD_F1[67] = r('........................k1eeeeeeegigeeeegg1k1k.1d1............................');

// CD_F2: full knee thrust / close front kick — foot at ~x=55
// Maximum extension. Body leans forward. Foot extends from knee.
const CD_F2 = clone(BASE);

// Remove right portion of gi pants and right leg
CD_F2[64] = r('...........................k1eeeeeeeegigeeeegg1k1k..........................');
CD_F2[65] = r('..........................k1eeeeeeeeegigeeeeegg1k1k..........................');
CD_F2[66] = r('.........................k1eeeeeeegigeeeeegg1k1k...........................');
CD_F2[67] = r('........................k1eeeeeeegigeeeeegg1k1k............................');
CD_F2[68] = r('.......................k1eeeeeegigeeeeeegg1k1k.............................');
CD_F2[69] = r('......................k1eeeeeeeegigeeegg1k1k...............................');
CD_F2[70] = r('.....................k1eeeeeegigeeeeeegg1k1k..................................');
CD_F2[71] = r('....................k1eeeeeeegigeeeegg1k1k...................................');
CD_F2[72] = r('...................k1eeeeeeegigeeegg1k1k....................................');
CD_F2[73] = r('..................k1eeeeeeeegigeeeegg1k1k......................................');
CD_F2[74] = r('.................k1eeeeeegigeeegg1k1k.......................................');
CD_F2[75] = r('................k1eeeeeegigeeeegg1k1k.........................................');
CD_F2[76] = r('...............k1eeeeeegigeeeeegg1k1k..........................................');
CD_F2[77] = r('..............k1eeeeegigeeeegg1k1k............................................');
CD_F2[78] = r('.............k1eeeeegigeeegg1k1k.............................................');
CD_F2[79] = r('............k1eeeeegigeegg1k1k...............................................');
CD_F2[80] = r('...........k1eeeeeegigegg1k1k................................................');
CD_F2[81] = r('..........k1eeegigeeegg1k1k..................................................');
CD_F2[82] = r('.........k1eeeegigeegg1k1k...................................................');
CD_F2[83] = r('........k1eeeegigegg1k1k.....................................................');
CD_F2[84] = r('.......k1eeeegigegg1k1k......................................................');

// Belt area
CD_F2[85] = r('......kkkkkkkkkkkkkkkk...........................................');
CD_F2[86] = r('.....k11111114111111k............................................');
CD_F2[87] = r('....k111111114111111111k.........................................');

// Left leg stays — right leg removed below belt
CD_F2[88] = r('...k1eeeeeegigeeeeegg1k........................................');
CD_F2[89] = r('..k1eeeeeeegigeeeeeegg1k.......................................');
CD_F2[90] = r('..k1eeeeeeegigeeeeeegg1k.......................................');
CD_F2[91] = r('..k1eeeeeeeeegigeeeegg1k.......................................');
CD_F2[92] = r('..k1eeeeeeeeegigeeeegg1k.......................................');
CD_F2[93] = r('..k1eeeeeeegigeeeeeegg1k.......................................');
CD_F2[94] = r('...k1eeeeeegigeeeeegg1k........................................');
CD_F2[95] = r('...k1eeeeeegigeeeeegg1k........................................');
CD_F2[96] = r('...k1eeeeeeegigeeeegg1k........................................');
CD_F2[97] = r('...k1eeeeeeegigeeeegg1k........................................');
CD_F2[98] = r('....k1eeeeegigeeegg1k.........................................');
CD_F2[99] = r('....k1eeeeeegigeegg1k.........................................');
CD_F2[100]= r('....k1eeeegigeeeegg1k.........................................');
CD_F2[101]= r('.....k1eeegigeeegg1k..........................................');
CD_F2[102]= r('.....k1eeeeegigegg1k..........................................');
CD_F2[103]= r('.....k1eeegigeeegg1k..........................................');
CD_F2[104]= r('......k1eeeeeegigegg1k...........................................');
CD_F2[105]= r('......k1eeeeeegigegg1k...........................................');
CD_F2[106]= r('......k1eeeegigeeegg1k...........................................');
CD_F2[107]= r('.......k1eegigegg1k............................................');
CD_F2[108]= r('.......k1eegigegg1k............................................');
CD_F2[109]= r('.......k1eegigegg1k............................................');
CD_F2[110]= r('........k1eegieg1k.............................................');
CD_F2[111]= r('........k1egigeg1k.............................................');
CD_F2[112]= r('........k1eeegeg1k.............................................');
CD_F2[113]= r('.........k1ege1k..............................................');
CD_F2[114]= r('.........k1ege1k..............................................');
CD_F2[115]= r('.........k1ege1k..............................................');
CD_F2[116]= r('..........k1ge1k...............................................');
CD_F2[117]= r('..........k1ge1k...............................................');
CD_F2[118]= r('..........k1ge1k...............................................');
CD_F2[119]= r('...........k11k................................................');
CD_F2[120]= r('...........k11k................................................');
CD_F2[121]= r('...........k11k................................................');
CD_F2[122]= r('..........kk.kk................................................');
CD_F2[123]= r('.........kk...kk...............................................');
CD_F2[124]= r('........kk.....kk..............................................');
CD_F2[125]= r('.......kk.......kk.............................................');
CD_F2[126]= r('......kk.........kk............................................');
CD_F2[127]= r('.....kk...........kk...........................................');
CD_F2[128]= r('....kk.............kk..........................................');
CD_F2[129]= r('...kk...............kk.........................................');
CD_F2[130]= r('..kk.................kk........................................');
CD_F2[131]= r('..k1.................1k.........................................................................');
CD_F2[132]= r('..k1.................1k.........................................................................');
CD_F2[133]= r('..k1.................1k.........................................................................');
CD_F2[134]= r('...k1...............1k..........................................................................');
CD_F2[135]= r('...k1...............1k..........................................................................');
CD_F2[136]= r('...k1...............1k..........................................................................');
CD_F2[137]= r('....k1.............1k...........................................................................');
CD_F2[138]= r('....k1.............1k...........................................................................');
CD_F2[139]= r('....kk.............kk...........................................................................');
CD_F2[140]= r('.....kk...........kk............................................................................');
CD_F2[141]= r('.....kk...........kk............................................................................');
CD_F2[142]= r('......kk.........kk.............................................................................');
CD_F2[143]= r('.......k1k1k1k1k1k..............................................................................');

// Overlay the full knee thrust + foot extension — foot reaches ~x=55
// The kick extends from the hip: thigh rises, knee drives forward, foot extends
CD_F2[46] = r('............................k1eeeeeeeeegigeeeeeeeeegg1k...............................................');
CD_F2[47] = r('............................k1eeeeeeeeegigeeeeeeeeegg1k...............................................');
CD_F2[48] = r('............................k1eeeeeeeeeegigeeeeeeegg1k..........1k1...................................');
CD_F2[49] = r('............................k1eeeeeeeeegigeeeeeeeegg1k........1keek1..................................');
CD_F2[50] = r('............................k1eeeeeeeeeeegigeeeeeegg1k.......1keegek1.................................');
CD_F2[51] = r('............................k1eeeeeeeeeegigeeeeeeegg1k......1keegegk1................................');
CD_F2[52] = r('............................k1eeeeeeeeeeegigeeeeeegg1k.....1keeegegk1...............................');
CD_F2[53] = r('............................k1eeeeeeeeegigeeeeeeeegg1k....1kegigeegk1..............................');
// y=54-58: knee peak, then shin extends forward to foot at x~55
CD_F2[54] = r('.............................k1eeeeeeegigeeeeeeegg1k...1keege89e1k1.............................');
CD_F2[55] = r('.............................k1eeeeeeegigeeeeeeegg1k..1keigeg889gek1............................');
CD_F2[56] = r('..............................k1eeeeeegigeeeeeegg1k..1keegieg889gek1...........................');
CD_F2[57] = r('...............................k1eeeeeeeegigeeegg1k.1keeegieg889gek1..........................');
CD_F2[58] = r('................................k1eeeeegigeeeeegg1k1keeegiggg889gek1.........................');
CD_F2[59] = r('.................................k111111114111111111keeeegigg89gek1........................');
CD_F2[60] = r('................................kk111111114111111111keeegiggg89gek1.......................');
CD_F2[61] = r('...............................kk111111114111111111keegigeg89ek1k1.......................');
CD_F2[62] = r('..............................kk11111111411111111kkeege89gek1k1........................');
CD_F2[63] = r('.............................k111111114111111111kke89ge1k1k...........................');
// y=64-68: foot extends further forward (x~55-60 area)
CD_F2[64] = r('............................k1eeeeeeegigeeeegg1k189ek1k..............................');
CD_F2[65] = r('...........................k1eeeeeeegigeeeeegg1k891k................................');
CD_F2[66] = r('..........................k1eeeeeegigeeeeeegg1ke91k.................................');
CD_F2[67] = r('.........................k1eeeeeeegigeeeegg1k1k1k..................................');
// Foot reaches x~55-62 with skin/shoe colors
CD_F2[55] = r('.............................k1eeeeeeeegigeeeeeegg1k..1keegeg889gek1....1kk1..............');
CD_F2[56] = r('..............................k1eeeeeeeegigeeeegg1k..1keegieg889gek1...1k9k1.............');
CD_F2[57] = r('...............................k1eeeeeeeegigeeegg1k.1keeegieg889gek1..1k891k.............');
CD_F2[58] = r('................................k1eeeeeeegigeeegg1k1keegigegg889gek1.1k8d1k.............');
CD_F2[59] = r('.................................k111111114111111111keegigegg89gek11k8d81k............');
CD_F2[60] = r('................................kk111111114111111111keeeegigg89gek1k8d81.............');
CD_F2[61] = r('...............................kk111111114111111111kegigeeg89ek1k189d1..............');
CD_F2[62] = r('..............................kk11111111411111111kkeege89gek1k1k1d8d1..............');
CD_F2[63] = r('.............................k111111114111111111kke89ge1k1k...1d8d1...............');

// CD_F3: recovery — back to guard
const CD_F3 = clone(BASE);

// ═══════════════════════════════════════════════════════════════════
// Exports
// ═══════════════════════════════════════════════════════════════════

export const RYO_CLOSE_B_FRAMES: PixelFrame[] = [
  { width: 96, height: 144, palette: PALETTE, pixels: CB_F0 },
  { width: 96, height: 144, palette: PALETTE, pixels: CB_F1 },
  { width: 96, height: 144, palette: PALETTE, pixels: CB_F2 },
];

export const RYO_CLOSE_D_FRAMES: PixelFrame[] = [
  { width: 96, height: 144, palette: PALETTE, pixels: CD_F0 },
  { width: 96, height: 144, palette: PALETTE, pixels: CD_F1 },
  { width: 96, height: 144, palette: PALETTE, pixels: CD_F2 },
  { width: 96, height: 144, palette: PALETTE, pixels: CD_F3 },
];
