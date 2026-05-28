import type { ActionContract, FrameContract, FrameCollision, FrameEventTag, CharacterFrameContract, FrameBuilderConfig } from './frameContract.js';
import { makeFrames, makeAttackFrames } from './frameContract.js';
import { FighterState, AttackType } from './types.js';
import { ATTACK_FRAMES } from './attackFrames.js';

// Pixel frame registry key mapping: actionId → registry key in ioriHighResRender.ts
const PIXEL_KEYS: Record<string, string> = {
  idle: 'IDLE', walk_forward: 'WALK_FORWARD', walk_backward: 'WALK_BACKWARD',
  jump: 'JUMP', run: 'RUN', backdash: 'BACKDASH', roll: 'ROLL', back_roll: 'BACK_ROLL',
  crouch: 'CROUCH', block: 'BLOCK', dizzy: 'DIZZY', guard_crush: 'GUARD_CRUSH',
  max_mode: 'MAX_MODE', taunt: 'TAUNT', win: 'WIN', throw_action: 'THROW',
  hurt: 'HURT', knockdown: 'KNOCKDOWN',
  stand_a: 'STAND_A', stand_b: 'STAND_B', stand_c: 'STAND_C', stand_d: 'STAND_D',
  close_a: 'CLOSE_A', close_b: 'CLOSE_B', close_c: 'CLOSE_C', close_d: 'CLOSE_D',
  crouch_a: 'CROUCH_A', crouch_b: 'CROUCH_B', crouch_c: 'CROUCH_C', crouch_d: 'CROUCH_D',
  air_a: 'AIR_A', air_c: 'AIR_C', air_d: 'AIR_D',
  // Command normals
  iori_yumeyumi: 'IORI_YUMEYUMI', iori_katanugi: 'IORI_KATANUGI', iori_yukiwarui: 'IORI_YUKIWARUI',
  // Specials
  iori_aoihana: 'IORI_AOIHANA', iori_aoihana_2: 'IORI_AOIHANA_2', iori_aoihana_3: 'IORI_AOIHANA_3',
  iori_yamibarai: 'IORI_YAMIBARAI', iori_yamibarai_c: 'IORI_YAMIBARAI_C',
  iori_oniyaki: 'IORI_ONIYAKI', iori_oniyaki_c: 'IORI_ONIYAKI_C',
  iori_kototsuki: 'IORI_KOTOTSUKI', iori_kuzukaze: 'IORI_KUZUKAZE',
  // DM/SDM
  dm_yaotome: 'DM_YATAGARASU', sdm_yaotome: 'SDM_YATAGARASU',
};

// Ticks per frame from pixel frame registry in ioriHighResRender.ts
const TPF: Record<string, number> = {
  IDLE: 9, WALK_FORWARD: 6, WALK_BACKWARD: 7, RUN: 3, BACKDASH: 3,
  ROLL: 4, BACK_ROLL: 4, CROUCH: 9, BLOCK: 8, JUMP: 5, DIZZY: 10,
  GUARD_CRUSH: 8, MAX_MODE: 6, TAUNT: 12, WIN: 10, THROW: 6,
  HURT: 4, KNOCKDOWN: 5,
  STAND_A: 4, STAND_B: 5, STAND_C: 6, STAND_D: 7,
  CLOSE_A: 3, CLOSE_B: 4, CLOSE_C: 5, CLOSE_D: 6,
  CROUCH_A: 4, CROUCH_B: 5, CROUCH_C: 5, CROUCH_D: 7,
  AIR_A: 4, AIR_C: 5, AIR_D: 5,
  IORI_YUMEYUMI: 6, IORI_KATANUGI: 5, IORI_YUKIWARUI: 5,
  IORI_AOIHANA: 6, IORI_AOIHANA_2: 5, IORI_AOIHANA_3: 7,
  IORI_YAMIBARAI: 14, IORI_YAMIBARAI_C: 14,
  IORI_ONIYAKI: 6, IORI_ONIYAKI_C: 7,
  IORI_KOTOTSUKI: 6, IORI_KUZUKAZE: 5,
  DM_YATAGARASU: 10, SDM_YATAGARASU: 12,
};

const IORI_CFG: FrameBuilderConfig = { characterId: 'iori', pixelKeys: PIXEL_KEYS, tpf: TPF };

// ═══════════════════════════════════════════════════════════════════
// Non-attack States (Iori)
// ═══════════════════════════════════════════════════════════════════

const idle: ActionContract = {
  characterId: 'iori',
  actionId: 'idle',
  state: FighterState.IDLE,
  attackType: null,
  frames: makeFrames(IORI_CFG, 'idle', 8),
  hitLevel: 'MID',
  knockdown: false,
  startup: 0,
  active: 0,
  recovery: 0,
  totalFrames: 8,
  cancelWindows: [],
  feedbackTierOverride: null,
};

const walk_forward: ActionContract = {
  characterId: 'iori',
  actionId: 'walk_forward',
  state: FighterState.WALK,
  attackType: null,
  frames: makeFrames(IORI_CFG, 'walk_forward', 6),
  hitLevel: 'MID',
  knockdown: false,
  startup: 0,
  active: 0,
  recovery: 0,
  totalFrames: 6,
  cancelWindows: [],
  feedbackTierOverride: null,
};

const walk_backward: ActionContract = {
  characterId: 'iori',
  actionId: 'walk_backward',
  state: FighterState.WALK,
  attackType: null,
  frames: makeFrames(IORI_CFG, 'walk_backward', 6),
  hitLevel: 'MID',
  knockdown: false,
  startup: 0,
  active: 0,
  recovery: 0,
  totalFrames: 6,
  cancelWindows: [],
  feedbackTierOverride: null,
};

const jump: ActionContract = {
  characterId: 'iori',
  actionId: 'jump',
  state: FighterState.JUMP,
  attackType: null,
  frames: makeFrames(IORI_CFG, 'jump', 12),
  hitLevel: 'MID',
  knockdown: false,
  startup: 0,
  active: 0,
  recovery: 0,
  totalFrames: 12,
  cancelWindows: [],
  feedbackTierOverride: null,
};

const run: ActionContract = {
  characterId: 'iori',
  actionId: 'run',
  state: FighterState.RUN,
  attackType: null,
  frames: makeFrames(IORI_CFG, 'run', 6),
  hitLevel: 'MID',
  knockdown: false,
  startup: 0,
  active: 0,
  recovery: 0,
  totalFrames: 6,
  cancelWindows: [],
  feedbackTierOverride: null,
};

const backdash: ActionContract = {
  characterId: 'iori',
  actionId: 'backdash',
  state: FighterState.BACKDASH,
  attackType: null,
  frames: makeFrames(IORI_CFG, 'backdash', 8),
  hitLevel: 'MID',
  knockdown: false,
  startup: 0,
  active: 0,
  recovery: 0,
  totalFrames: 8,
  cancelWindows: [],
  feedbackTierOverride: null,
};

const roll: ActionContract = {
  characterId: 'iori',
  actionId: 'roll',
  state: FighterState.ROLL,
  attackType: null,
  frames: makeFrames(IORI_CFG, 'roll', 10),
  hitLevel: 'MID',
  knockdown: false,
  startup: 0,
  active: 0,
  recovery: 0,
  totalFrames: 10,
  cancelWindows: [],
  feedbackTierOverride: null,
};

const back_roll: ActionContract = {
  characterId: 'iori',
  actionId: 'back_roll',
  state: FighterState.BACK_ROLL,
  attackType: null,
  frames: makeFrames(IORI_CFG, 'back_roll', 10),
  hitLevel: 'MID',
  knockdown: false,
  startup: 0,
  active: 0,
  recovery: 0,
  totalFrames: 10,
  cancelWindows: [],
  feedbackTierOverride: null,
};

const crouch: ActionContract = {
  characterId: 'iori',
  actionId: 'crouch',
  state: FighterState.CROUCH,
  attackType: null,
  frames: makeFrames(IORI_CFG, 'crouch', 4),
  hitLevel: 'MID',
  knockdown: false,
  startup: 0,
  active: 0,
  recovery: 0,
  totalFrames: 4,
  cancelWindows: [],
  feedbackTierOverride: null,
};

const block: ActionContract = {
  characterId: 'iori',
  actionId: 'block',
  state: FighterState.BLOCK,
  attackType: null,
  frames: makeFrames(IORI_CFG, 'block', 6),
  hitLevel: 'MID',
  knockdown: false,
  startup: 0,
  active: 0,
  recovery: 0,
  totalFrames: 6,
  cancelWindows: [],
  feedbackTierOverride: null,
};

const dizzy: ActionContract = {
  characterId: 'iori',
  actionId: 'dizzy',
  state: FighterState.DIZZY,
  attackType: null,
  frames: makeFrames(IORI_CFG, 'dizzy', 12),
  hitLevel: 'MID',
  knockdown: false,
  startup: 0,
  active: 0,
  recovery: 0,
  totalFrames: 12,
  cancelWindows: [],
  feedbackTierOverride: null,
};

const guard_crush: ActionContract = {
  characterId: 'iori',
  actionId: 'guard_crush',
  state: FighterState.GUARD_CRUSH,
  attackType: null,
  frames: makeFrames(IORI_CFG, 'guard_crush', 10),
  hitLevel: 'MID',
  knockdown: false,
  startup: 0,
  active: 0,
  recovery: 0,
  totalFrames: 10,
  cancelWindows: [],
  feedbackTierOverride: null,
};

const max_mode: ActionContract = {
  characterId: 'iori',
  actionId: 'max_mode',
  state: FighterState.MAX_MODE,
  attackType: null,
  frames: makeFrames(IORI_CFG, 'max_mode', 8),
  hitLevel: 'MID',
  knockdown: false,
  startup: 0,
  active: 0,
  recovery: 0,
  totalFrames: 8,
  cancelWindows: [],
  feedbackTierOverride: null,
};

const taunt: ActionContract = {
  characterId: 'iori',
  actionId: 'taunt',
  state: FighterState.TAUNT,
  attackType: null,
  frames: makeFrames(IORI_CFG, 'taunt', 10),
  hitLevel: 'MID',
  knockdown: false,
  startup: 0,
  active: 0,
  recovery: 0,
  totalFrames: 10,
  cancelWindows: [],
  feedbackTierOverride: null,
};

const win: ActionContract = {
  characterId: 'iori',
  actionId: 'win',
  state: FighterState.IDLE,
  attackType: null,
  frames: makeFrames(IORI_CFG, 'win', 12),
  hitLevel: 'MID',
  knockdown: false,
  startup: 0,
  active: 0,
  recovery: 0,
  totalFrames: 12,
  cancelWindows: [],
  feedbackTierOverride: null,
};

const throw_action: ActionContract = {
  characterId: 'iori',
  actionId: 'throw_action',
  state: FighterState.THROW,
  attackType: null,
  frames: makeFrames(IORI_CFG, 'throw_action', 10),
  hitLevel: 'MID',
  knockdown: false,
  startup: 0,
  active: 0,
  recovery: 0,
  totalFrames: 10,
  cancelWindows: [],
  feedbackTierOverride: null,
};

const hurt: ActionContract = {
  characterId: 'iori',
  actionId: 'hurt',
  state: FighterState.HITSTUN,
  attackType: null,
  frames: makeFrames(IORI_CFG, 'hurt', 10),
  hitLevel: 'MID',
  knockdown: false,
  startup: 0,
  active: 0,
  recovery: 0,
  totalFrames: 10,
  cancelWindows: [],
  feedbackTierOverride: null,
};

const knockdown: ActionContract = {
  characterId: 'iori',
  actionId: 'knockdown',
  state: FighterState.KNOCKDOWN,
  attackType: null,
  frames: makeFrames(IORI_CFG, 'knockdown', 16),
  hitLevel: 'MID',
  knockdown: true,
  startup: 0,
  active: 0,
  recovery: 0,
  totalFrames: 16,
  cancelWindows: [],
  feedbackTierOverride: null,
};

// ═══════════════════════════════════════════════════════════════════
// Standing Normals (Iori)
// ═══════════════════════════════════════════════════════════════════

const stand_a: ActionContract = {
  characterId: 'iori',
  actionId: 'stand_a',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.STAND_A,
  frames: makeAttackFrames(IORI_CFG, 'stand_a', 4, 3, 5, AttackType.STAND_A, ATTACK_FRAMES),
  hitLevel: 'MID',
  knockdown: false,
  startup: 4,
  active: 3,
  recovery: 5,
  totalFrames: 12,
  cancelWindows: [
    { frames: [3, 5], targetTypes: ['special', 'super'], requiresHit: true, maxOnly: false },
  ],
  feedbackTierOverride: null,
};

const stand_b: ActionContract = {
  characterId: 'iori',
  actionId: 'stand_b',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.STAND_B,
  frames: makeAttackFrames(IORI_CFG, 'stand_b', 5, 4, 6, AttackType.STAND_B, ATTACK_FRAMES),
  hitLevel: 'MID',
  knockdown: false,
  startup: 5,
  active: 4,
  recovery: 6,
  totalFrames: 15,
  cancelWindows: [
    { frames: [4, 7], targetTypes: ['special', 'super'], requiresHit: true, maxOnly: false },
  ],
  feedbackTierOverride: null,
};

const stand_c: ActionContract = {
  characterId: 'iori',
  actionId: 'stand_c',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.STAND_C,
  frames: makeAttackFrames(IORI_CFG, 'stand_c', 6, 4, 10, AttackType.STAND_C, ATTACK_FRAMES),
  hitLevel: 'MID',
  knockdown: false,
  startup: 6,
  active: 4,
  recovery: 10,
  totalFrames: 20,
  cancelWindows: [
    { frames: [5, 9], targetTypes: ['special', 'super'], requiresHit: false, maxOnly: false },
  ],
  feedbackTierOverride: null,
};

const stand_d: ActionContract = {
  characterId: 'iori',
  actionId: 'stand_d',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.STAND_D,
  frames: makeAttackFrames(IORI_CFG, 'stand_d', 7, 5, 12, AttackType.STAND_D, ATTACK_FRAMES),
  hitLevel: 'HIGH',
  knockdown: false,
  startup: 7,
  active: 5,
  recovery: 12,
  totalFrames: 24,
  cancelWindows: [],
  feedbackTierOverride: null,
};

// ═══════════════════════════════════════════════════════════════════
// Close Normals (Iori)
// ═══════════════════════════════════════════════════════════════════

const close_a: ActionContract = {
  characterId: 'iori',
  actionId: 'close_a',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.CLOSE_A,
  frames: makeAttackFrames(IORI_CFG, 'close_a', 3, 3, 5, AttackType.CLOSE_A, ATTACK_FRAMES),
  hitLevel: 'MID',
  knockdown: false,
  startup: 3,
  active: 3,
  recovery: 5,
  totalFrames: 11,
  cancelWindows: [
    { frames: [3, 5], targetTypes: ['special', 'super'], requiresHit: true, maxOnly: false },
  ],
  feedbackTierOverride: null,
};

const close_b: ActionContract = {
  characterId: 'iori',
  actionId: 'close_b',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.CLOSE_B,
  frames: makeAttackFrames(IORI_CFG, 'close_b', 4, 3, 5, AttackType.CLOSE_B, ATTACK_FRAMES),
  hitLevel: 'MID',
  knockdown: false,
  startup: 4,
  active: 3,
  recovery: 5,
  totalFrames: 12,
  cancelWindows: [
    { frames: [3, 6], targetTypes: ['special', 'super', 'normal'], requiresHit: false, maxOnly: false },
  ],
  feedbackTierOverride: null,
};

const close_c: ActionContract = {
  characterId: 'iori',
  actionId: 'close_c',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.CLOSE_C,
  frames: makeAttackFrames(IORI_CFG, 'close_c', 5, 4, 7, AttackType.CLOSE_C, ATTACK_FRAMES),
  hitLevel: 'MID',
  knockdown: false,
  startup: 5,
  active: 4,
  recovery: 7,
  totalFrames: 16,
  cancelWindows: [
    { frames: [5, 7], targetTypes: ['special', 'super'], requiresHit: false, maxOnly: false },
  ],
  feedbackTierOverride: null,
};

const close_d: ActionContract = {
  characterId: 'iori',
  actionId: 'close_d',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.CLOSE_D,
  frames: makeAttackFrames(IORI_CFG, 'close_d', 6, 5, 9, AttackType.CLOSE_D, ATTACK_FRAMES),
  hitLevel: 'HIGH',
  knockdown: false,
  startup: 6,
  active: 5,
  recovery: 9,
  totalFrames: 20,
  cancelWindows: [
    { frames: [5, 10], targetTypes: ['special', 'super', 'normal'], requiresHit: false, maxOnly: false },
  ],
  feedbackTierOverride: null,
};

// ═══════════════════════════════════════════════════════════════════
// Crouch Normals (Iori)
// ═══════════════════════════════════════════════════════════════════

const crouch_a: ActionContract = {
  characterId: 'iori',
  actionId: 'crouch_a',
  state: FighterState.CROUCH_ATTACK,
  attackType: AttackType.CROUCH_A,
  frames: makeAttackFrames(IORI_CFG, 'crouch_a', 4, 3, 4, AttackType.CROUCH_A, ATTACK_FRAMES),
  hitLevel: 'LOW',
  knockdown: false,
  startup: 4,
  active: 3,
  recovery: 4,
  totalFrames: 11,
  cancelWindows: [
    { frames: [3, 5], targetTypes: ['special', 'super'], requiresHit: true, maxOnly: false },
  ],
  feedbackTierOverride: null,
};

const crouch_b: ActionContract = {
  characterId: 'iori',
  actionId: 'crouch_b',
  state: FighterState.CROUCH_ATTACK,
  attackType: AttackType.CROUCH_B,
  frames: makeAttackFrames(IORI_CFG, 'crouch_b', 5, 4, 5, AttackType.CROUCH_B, ATTACK_FRAMES),
  hitLevel: 'LOW',
  knockdown: false,
  startup: 5,
  active: 4,
  recovery: 5,
  totalFrames: 14,
  cancelWindows: [
    { frames: [4, 7], targetTypes: ['special', 'super'], requiresHit: true, maxOnly: false },
  ],
  feedbackTierOverride: null,
};

const crouch_c: ActionContract = {
  characterId: 'iori',
  actionId: 'crouch_c',
  state: FighterState.CROUCH_ATTACK,
  attackType: AttackType.CROUCH_C,
  frames: makeAttackFrames(IORI_CFG, 'crouch_c', 6, 4, 8, AttackType.CROUCH_C, ATTACK_FRAMES),
  hitLevel: 'LOW',
  knockdown: false,
  startup: 6,
  active: 4,
  recovery: 8,
  totalFrames: 18,
  cancelWindows: [],
  feedbackTierOverride: null,
};

const crouch_d: ActionContract = {
  characterId: 'iori',
  actionId: 'crouch_d',
  state: FighterState.CROUCH_ATTACK,
  attackType: AttackType.CROUCH_D,
  frames: makeAttackFrames(IORI_CFG, 'crouch_d', 7, 5, 10, AttackType.CROUCH_D, ATTACK_FRAMES),
  hitLevel: 'LOW',
  knockdown: true,
  startup: 7,
  active: 5,
  recovery: 10,
  totalFrames: 22,
  cancelWindows: [],
  feedbackTierOverride: null,
};

// ═══════════════════════════════════════════════════════════════════
// Air Normals (Iori)
// ═══════════════════════════════════════════════════════════════════

const air_a: ActionContract = {
  characterId: 'iori',
  actionId: 'air_a',
  state: FighterState.AIR_ATTACK,
  attackType: AttackType.STAND_A,
  frames: makeAttackFrames(IORI_CFG, 'air_a', 4, 4, 4, AttackType.STAND_A, ATTACK_FRAMES),
  hitLevel: 'HIGH',
  knockdown: false,
  startup: 4,
  active: 4,
  recovery: 4,
  totalFrames: 12,
  cancelWindows: [],
  feedbackTierOverride: null,
};

const air_c: ActionContract = {
  characterId: 'iori',
  actionId: 'air_c',
  state: FighterState.AIR_ATTACK,
  attackType: AttackType.STAND_C,
  frames: makeAttackFrames(IORI_CFG, 'air_c', 6, 5, 5, AttackType.STAND_C, ATTACK_FRAMES),
  hitLevel: 'HIGH',
  knockdown: false,
  startup: 6,
  active: 5,
  recovery: 5,
  totalFrames: 16,
  cancelWindows: [],
  feedbackTierOverride: null,
};

const air_d: ActionContract = {
  characterId: 'iori',
  actionId: 'air_d',
  state: FighterState.AIR_ATTACK,
  attackType: AttackType.STAND_D,
  frames: makeAttackFrames(IORI_CFG, 'air_d', 6, 5, 5, AttackType.STAND_D, ATTACK_FRAMES),
  hitLevel: 'HIGH',
  knockdown: false,
  startup: 6,
  active: 5,
  recovery: 5,
  totalFrames: 16,
  cancelWindows: [],
  feedbackTierOverride: null,
};

// ═══════════════════════════════════════════════════════════════════
// Command Normals (Iori)
// ═══════════════════════════════════════════════════════════════════

/** →+A 夢弾 (overhead 2-hit) */
const iori_yumeyumi: ActionContract = {
  characterId: 'iori',
  actionId: 'iori_yumeyumi',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.IORI_YUMEYUMI,
  frames: makeAttackFrames(IORI_CFG, 'iori_yumeyumi', 10, 4, 20, AttackType.IORI_YUMEYUMI, ATTACK_FRAMES),
  hitLevel: 'HIGH',
  knockdown: false,
  startup: 10,
  active: 4,
  recovery: 20,
  totalFrames: 34,
  cancelWindows: [],
  feedbackTierOverride: null,
};

/** ↘+B 邯鄲 (low) */
const iori_katanugi: ActionContract = {
  characterId: 'iori',
  actionId: 'iori_katanugi',
  state: FighterState.CROUCH_ATTACK,
  attackType: AttackType.IORI_KATANUGI,
  frames: makeAttackFrames(IORI_CFG, 'iori_katanugi', 12, 4, 22, AttackType.IORI_KATANUGI, ATTACK_FRAMES),
  hitLevel: 'LOW',
  knockdown: false,
  startup: 12,
  active: 4,
  recovery: 22,
  totalFrames: 38,
  cancelWindows: [],
  feedbackTierOverride: null,
};

/** 空中↓+C 百合折り (air crossup) */
const iori_yukiwarui: ActionContract = {
  characterId: 'iori',
  actionId: 'iori_yukiwarui',
  state: FighterState.AIR_ATTACK,
  attackType: AttackType.IORI_YUKIWARUI,
  frames: makeAttackFrames(IORI_CFG, 'iori_yukiwarui', 8, 7, 18, AttackType.IORI_YUKIWARUI, ATTACK_FRAMES),
  hitLevel: 'HIGH',
  knockdown: false,
  startup: 8,
  active: 7,
  recovery: 18,
  totalFrames: 33,
  cancelWindows: [],
  feedbackTierOverride: null,
};

// ═══════════════════════════════════════════════════════════════════
// Specials (必殺技) — Iori
// ═══════════════════════════════════════════════════════════════════

/** ↓↘→+A 闇払い (weak projectile) */
const iori_yamibarai: ActionContract = {
  characterId: 'iori',
  actionId: 'iori_yamibarai',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.IORI_YAMIBARAI,
  frames: makeAttackFrames(IORI_CFG, 'iori_yamibarai', 14, 3, 18, AttackType.IORI_YAMIBARAI, ATTACK_FRAMES),
  hitLevel: 'MID',
  knockdown: false,
  startup: 14,
  active: 3,
  recovery: 18,
  totalFrames: 35,
  cancelWindows: [],
  feedbackTierOverride: 'special',
};

/** ↓↘→+C 闇払い (strong projectile) */
const iori_yamibarai_c: ActionContract = {
  characterId: 'iori',
  actionId: 'iori_yamibarai_c',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.IORI_YAMIBARAI_C,
  frames: makeAttackFrames(IORI_CFG, 'iori_yamibarai_c', 17, 5, 22, AttackType.IORI_YAMIBARAI_C, ATTACK_FRAMES),
  hitLevel: 'MID',
  knockdown: false,
  startup: 17,
  active: 5,
  recovery: 22,
  totalFrames: 44,
  cancelWindows: [],
  feedbackTierOverride: 'special',
};

/** →↓↘+A 鬼焼き (weak uppercut) */
const iori_oniyaki: ActionContract = {
  characterId: 'iori',
  actionId: 'iori_oniyaki',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.IORI_ONIYAKI,
  frames: makeAttackFrames(IORI_CFG, 'iori_oniyaki', 5, 5, 18, AttackType.IORI_ONIYAKI, ATTACK_FRAMES),
  hitLevel: 'MID',
  knockdown: true,
  startup: 5,
  active: 5,
  recovery: 18,
  totalFrames: 28,
  cancelWindows: [],
  feedbackTierOverride: 'special',
};

/** →↓↘+C 鬼焼き (strong uppercut, invincible) */
const iori_oniyaki_c: ActionContract = {
  characterId: 'iori',
  actionId: 'iori_oniyaki_c',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.IORI_ONIYAKI_C,
  frames: makeAttackFrames(IORI_CFG, 'iori_oniyaki_c', 4, 10, 22, AttackType.IORI_ONIYAKI_C, ATTACK_FRAMES),
  hitLevel: 'MID',
  knockdown: true,
  startup: 4,
  active: 10,
  recovery: 22,
  totalFrames: 36,
  cancelWindows: [],
  feedbackTierOverride: 'special',
};

/** ←↙↓↘→+K 琴月陰 (dash grab) */
const iori_kototsuki: ActionContract = {
  characterId: 'iori',
  actionId: 'iori_kototsuki',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.IORI_KOTOTSUKI,
  frames: makeAttackFrames(IORI_CFG, 'iori_kototsuki', 10, 4, 15, AttackType.IORI_KOTOTSUKI, ATTACK_FRAMES),
  hitLevel: 'MID',
  knockdown: true,
  startup: 10,
  active: 4,
  recovery: 15,
  totalFrames: 29,
  cancelWindows: [],
  feedbackTierOverride: 'special',
};

/** 屑風 ←↙↓↘→↗↓↙←+P (command throw) */
const iori_kuzukaze: ActionContract = {
  characterId: 'iori',
  actionId: 'iori_kuzukaze',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.IORI_KUZUKAZE,
  frames: makeAttackFrames(IORI_CFG, 'iori_kuzukaze', 8, 4, 20, AttackType.IORI_KUZUKAZE, ATTACK_FRAMES),
  hitLevel: 'MID',
  knockdown: false,
  startup: 8,
  active: 4,
  recovery: 20,
  totalFrames: 32,
  cancelWindows: [],
  feedbackTierOverride: 'special',
};

/** ↓↘→+P 葵花 (rekka stage 1) */
const iori_aoihana: ActionContract = {
  characterId: 'iori',
  actionId: 'iori_aoihana',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.IORI_AOIHANA,
  frames: makeAttackFrames(IORI_CFG, 'iori_aoihana', 5, 4, 18, AttackType.IORI_AOIHANA, ATTACK_FRAMES),
  hitLevel: 'MID',
  knockdown: false,
  startup: 5,
  active: 4,
  recovery: 18,
  totalFrames: 27,
  cancelWindows: [
    // Rekka chain to stage 2
    { frames: [5, 9], targetTypes: ['special'], requiresHit: false, maxOnly: false },
  ],
  feedbackTierOverride: 'special',
};

/** 葵花 (rekka stage 2) */
const iori_aoihana_2: ActionContract = {
  characterId: 'iori',
  actionId: 'iori_aoihana_2',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.IORI_AOIHANA_2,
  frames: makeAttackFrames(IORI_CFG, 'iori_aoihana_2', 7, 4, 18, AttackType.IORI_AOIHANA_2, ATTACK_FRAMES),
  hitLevel: 'MID',
  knockdown: false,
  startup: 7,
  active: 4,
  recovery: 18,
  totalFrames: 29,
  cancelWindows: [
    // Rekka chain to stage 3
    { frames: [4, 7], targetTypes: ['special'], requiresHit: false, maxOnly: false },
  ],
  feedbackTierOverride: 'special',
};

/** 葵花 (rekka stage 3 — launcher) */
const iori_aoihana_3: ActionContract = {
  characterId: 'iori',
  actionId: 'iori_aoihana_3',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.IORI_AOIHANA_3,
  frames: makeAttackFrames(IORI_CFG, 'iori_aoihana_3', 5, 5, 18, AttackType.IORI_AOIHANA_3, ATTACK_FRAMES),
  hitLevel: 'MID',
  knockdown: true,
  startup: 5,
  active: 5,
  recovery: 18,
  totalFrames: 28,
  cancelWindows: [],
  feedbackTierOverride: 'special',
};

// ═══════════════════════════════════════════════════════════════════
// DM — Desperation Moves (超必殺技) — Iori
// ═══════════════════════════════════════════════════════════════════

/** 八稚女 DM — rushing claw super */
const dm_yaotome_frames = makeAttackFrames(IORI_CFG, 'dm_yaotome', 5, 20, 30, AttackType.DM_YATAGARASU, ATTACK_FRAMES);
dm_yaotome_frames[0].eventTags.push('super_flash');
const dm_yaotome: ActionContract = {
  characterId: 'iori',
  actionId: 'dm_yaotome',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.DM_YATAGARASU,
  frames: dm_yaotome_frames,
  hitLevel: 'MID',
  knockdown: true,
  startup: 5,
  active: 20,
  recovery: 30,
  totalFrames: 55,
  cancelWindows: [],
  feedbackTierOverride: 'super',
};

// ═══════════════════════════════════════════════════════════════════
// SDM — Super Desperation Moves (MAX超必殺技) — Iori
// ═══════════════════════════════════════════════════════════════════

/** 八稚女 SDM — enhanced rushing claw super (more hits) */
const sdm_yaotome_frames = makeAttackFrames(IORI_CFG, 'sdm_yaotome', 4, 28, 32, AttackType.SDM_YATAGARASU, ATTACK_FRAMES);
sdm_yaotome_frames[0].eventTags.push('super_flash');
const sdm_yaotome: ActionContract = {
  characterId: 'iori',
  actionId: 'sdm_yaotome',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.SDM_YATAGARASU,
  frames: sdm_yaotome_frames,
  hitLevel: 'MID',
  knockdown: true,
  startup: 4,
  active: 28,
  recovery: 32,
  totalFrames: 64,
  cancelWindows: [],
  feedbackTierOverride: 'super',
};

// ═══════════════════════════════════════════════════════════════════
// Contract Map
// ═══════════════════════════════════════════════════════════════════

export const IORI_ACTION_CONTRACTS: Map<string, ActionContract> = new Map([
  // Non-attack states
  ['idle', idle],
  ['walk_forward', walk_forward],
  ['walk_backward', walk_backward],
  ['jump', jump],
  ['run', run],
  ['backdash', backdash],
  ['roll', roll],
  ['back_roll', back_roll],
  ['crouch', crouch],
  ['block', block],
  ['dizzy', dizzy],
  ['guard_crush', guard_crush],
  ['max_mode', max_mode],
  ['taunt', taunt],
  ['win', win],
  ['throw_action', throw_action],
  ['hurt', hurt],
  ['knockdown', knockdown],
  // Standing normals
  ['stand_a', stand_a],
  ['stand_b', stand_b],
  ['stand_c', stand_c],
  ['stand_d', stand_d],
  // Close normals
  ['close_a', close_a],
  ['close_b', close_b],
  ['close_c', close_c],
  ['close_d', close_d],
  // Crouch normals
  ['crouch_a', crouch_a],
  ['crouch_b', crouch_b],
  ['crouch_c', crouch_c],
  ['crouch_d', crouch_d],
  // Air normals
  ['air_a', air_a],
  ['air_c', air_c],
  ['air_d', air_d],
  // Command normals
  ['iori_yumeyumi', iori_yumeyumi],
  ['iori_katanugi', iori_katanugi],
  ['iori_yukiwarui', iori_yukiwarui],
  // Specials
  ['iori_aoihana', iori_aoihana],
  ['iori_aoihana_2', iori_aoihana_2],
  ['iori_aoihana_3', iori_aoihana_3],
  ['iori_yamibarai', iori_yamibarai],
  ['iori_yamibarai_c', iori_yamibarai_c],
  ['iori_oniyaki', iori_oniyaki],
  ['iori_oniyaki_c', iori_oniyaki_c],
  ['iori_kototsuki', iori_kototsuki],
  ['iori_kuzukaze', iori_kuzukaze],
  // DM
  ['dm_yaotome', dm_yaotome],
  // SDM
  ['sdm_yaotome', sdm_yaotome],
]);

export function getIoriFrameContractManifest(): CharacterFrameContract {
  return { characterId: 'iori', actions: IORI_ACTION_CONTRACTS };
}
