import type { ActionContract, FrameContract, FrameCollision, FrameEventTag, CharacterFrameContract } from './frameContract.js';
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
  dm_yaotome: 'DM_YAOTOME', sdm_yaotome: 'SDM_YAOTOME',
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
  DM_YAOTOME: 10, SDM_YAOTOME: 12,
};

function makeFrames(actionId: string, count: number): FrameContract[] {
  const pixelKey = PIXEL_KEYS[actionId] ?? 'IDLE';
  const tpf = TPF[pixelKey] ?? 8;
  return Array.from({ length: count }, (_, i) => ({
    characterId: 'iori',
    actionId,
    frameIndex: i,
    sprite: { spriteRef: `${pixelKey}:${i}`, anchor: { x: 48, y: 144 }, offset: { x: 0, y: 0 }, duration: tpf },
    collision: null,
    eventTags: [] as FrameEventTag[],
  }));
}

/**
 * Build attack frames with real per-frame hitbox data from attackFrames.ts.
 *
 * The ATTACK_FRAMES table provides one AttackFrame per active-phase frame.
 * Each AttackFrame has:
 *   - attack: array of { ox, oy, w, h } hitboxes
 *   - bodyOverride: { ox, oy, w, h } | null — hurtbox delta for this frame
 *   - throwBoxes: optional array of { ox, oy, w, h }
 *
 * Startup and recovery frames have collision=null (no attack boxes).
 * Active-phase frames get their hitboxes from ATTACK_FRAMES.
 */
function makeAttackFrames(
  actionId: string,
  startup: number,
  active: number,
  recovery: number,
  attackType: AttackType,
): FrameContract[] {
  const total = startup + active + recovery;
  const frames = makeFrames(actionId, total);

  // Look up per-frame data from ATTACK_FRAMES
  const attackFrameData = ATTACK_FRAMES[attackType];

  for (let i = 0; i < active; i++) {
    const frameIndex = startup + i;
    const perFrame = attackFrameData?.[i];

    const hitboxes = perFrame?.attack ?? [];
    const hurtboxOverride = perFrame?.bodyOverride ?? null;
    const throwBoxes = perFrame?.throwBoxes ?? [];

    frames[frameIndex].collision = {
      hitboxes,
      hurtboxOverride,
      throwBoxes,
    };
    frames[frameIndex].eventTags.push('swing');
  }
  return frames;
}

// ═══════════════════════════════════════════════════════════════════
// Non-attack States (Iori)
// ═══════════════════════════════════════════════════════════════════

const idle: ActionContract = {
  characterId: 'iori',
  actionId: 'idle',
  state: FighterState.IDLE,
  attackType: null,
  frames: makeFrames('idle', 8),
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
  frames: makeFrames('walk_forward', 6),
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
  frames: makeFrames('walk_backward', 6),
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
  frames: makeFrames('jump', 12),
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
  frames: makeFrames('run', 6),
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
  frames: makeFrames('backdash', 8),
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
  frames: makeFrames('roll', 10),
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
  frames: makeFrames('back_roll', 10),
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
  frames: makeFrames('crouch', 4),
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
  frames: makeFrames('block', 6),
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
  frames: makeFrames('dizzy', 12),
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
  frames: makeFrames('guard_crush', 10),
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
  frames: makeFrames('max_mode', 8),
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
  frames: makeFrames('taunt', 10),
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
  frames: makeFrames('win', 12),
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
  frames: makeFrames('throw_action', 10),
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
  frames: makeFrames('hurt', 10),
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
  frames: makeFrames('knockdown', 16),
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
  frames: makeAttackFrames('stand_a', 4, 3, 5, AttackType.STAND_A),
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
  frames: makeAttackFrames('stand_b', 5, 4, 6, AttackType.STAND_B),
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
  frames: makeAttackFrames('stand_c', 6, 4, 10, AttackType.STAND_C),
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
  frames: makeAttackFrames('stand_d', 7, 5, 12, AttackType.STAND_D),
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
  frames: makeAttackFrames('close_a', 3, 3, 5, AttackType.CLOSE_A),
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
  frames: makeAttackFrames('close_b', 4, 3, 5, AttackType.CLOSE_B),
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
  frames: makeAttackFrames('close_c', 5, 4, 7, AttackType.CLOSE_C),
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
  frames: makeAttackFrames('close_d', 6, 5, 9, AttackType.CLOSE_D),
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
  frames: makeAttackFrames('crouch_a', 4, 3, 4, AttackType.CROUCH_A),
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
  frames: makeAttackFrames('crouch_b', 5, 4, 5, AttackType.CROUCH_B),
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
  frames: makeAttackFrames('crouch_c', 6, 4, 8, AttackType.CROUCH_C),
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
  frames: makeAttackFrames('crouch_d', 7, 5, 10, AttackType.CROUCH_D),
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
  frames: makeAttackFrames('air_a', 4, 4, 4, AttackType.STAND_A),
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
  frames: makeAttackFrames('air_c', 6, 5, 5, AttackType.STAND_C),
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
  frames: makeAttackFrames('air_d', 6, 5, 5, AttackType.STAND_D),
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
  frames: makeAttackFrames('iori_yumeyumi', 7, 4, 10, AttackType.IORI_YUMEYUMI),
  hitLevel: 'HIGH',
  knockdown: false,
  startup: 7,
  active: 4,
  recovery: 10,
  totalFrames: 21,
  cancelWindows: [],
  feedbackTierOverride: null,
};

/** ↘+B 邯鄲 (low) */
const iori_katanugi: ActionContract = {
  characterId: 'iori',
  actionId: 'iori_katanugi',
  state: FighterState.CROUCH_ATTACK,
  attackType: AttackType.IORI_KATANUGI,
  frames: makeAttackFrames('iori_katanugi', 6, 4, 8, AttackType.IORI_KATANUGI),
  hitLevel: 'LOW',
  knockdown: false,
  startup: 6,
  active: 4,
  recovery: 8,
  totalFrames: 18,
  cancelWindows: [],
  feedbackTierOverride: null,
};

/** 空中↓+C 百合折り (air crossup) */
const iori_yukiwarui: ActionContract = {
  characterId: 'iori',
  actionId: 'iori_yukiwarui',
  state: FighterState.AIR_ATTACK,
  attackType: AttackType.IORI_YUKIWARUI,
  frames: makeAttackFrames('iori_yukiwarui', 5, 5, 6, AttackType.IORI_YUKIWARUI),
  hitLevel: 'HIGH',
  knockdown: false,
  startup: 5,
  active: 5,
  recovery: 6,
  totalFrames: 16,
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
  frames: makeAttackFrames('iori_yamibarai', 11, 6, 21, AttackType.IORI_YAMIBARAI),
  hitLevel: 'MID',
  knockdown: false,
  startup: 11,
  active: 6,
  recovery: 21,
  totalFrames: 38,
  cancelWindows: [],
  feedbackTierOverride: 'special',
};

/** ↓↘→+C 闇払い (strong projectile) */
const iori_yamibarai_c: ActionContract = {
  characterId: 'iori',
  actionId: 'iori_yamibarai_c',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.IORI_YAMIBARAI_C,
  frames: makeAttackFrames('iori_yamibarai_c', 9, 8, 23, AttackType.IORI_YAMIBARAI_C),
  hitLevel: 'MID',
  knockdown: false,
  startup: 9,
  active: 8,
  recovery: 23,
  totalFrames: 40,
  cancelWindows: [],
  feedbackTierOverride: 'special',
};

/** →↓↘+A 鬼焼き (weak uppercut) */
const iori_oniyaki: ActionContract = {
  characterId: 'iori',
  actionId: 'iori_oniyaki',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.IORI_ONIYAKI,
  frames: makeAttackFrames('iori_oniyaki', 4, 6, 21, AttackType.IORI_ONIYAKI),
  hitLevel: 'MID',
  knockdown: true,
  startup: 4,
  active: 6,
  recovery: 21,
  totalFrames: 31,
  cancelWindows: [],
  feedbackTierOverride: 'special',
};

/** →↓↘+C 鬼焼き (strong uppercut, invincible) */
const iori_oniyaki_c: ActionContract = {
  characterId: 'iori',
  actionId: 'iori_oniyaki_c',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.IORI_ONIYAKI_C,
  frames: makeAttackFrames('iori_oniyaki_c', 3, 8, 25, AttackType.IORI_ONIYAKI_C),
  hitLevel: 'MID',
  knockdown: true,
  startup: 3,
  active: 8,
  recovery: 25,
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
  frames: makeAttackFrames('iori_kototsuki', 6, 8, 20, AttackType.IORI_KOTOTSUKI),
  hitLevel: 'MID',
  knockdown: true,
  startup: 6,
  active: 8,
  recovery: 20,
  totalFrames: 34,
  cancelWindows: [],
  feedbackTierOverride: 'special',
};

/** 屑風 ←↙↓↘→↗↓↙←+P (command throw) */
const iori_kuzukaze: ActionContract = {
  characterId: 'iori',
  actionId: 'iori_kuzukaze',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.IORI_KUZUKAZE,
  frames: makeAttackFrames('iori_kuzukaze', 5, 3, 26, AttackType.IORI_KUZUKAZE),
  hitLevel: 'MID',
  knockdown: false,
  startup: 5,
  active: 3,
  recovery: 26,
  totalFrames: 34,
  cancelWindows: [],
  feedbackTierOverride: 'special',
};

/** ↓↘→+P 葵花 (rekka stage 1) */
const iori_aoihana: ActionContract = {
  characterId: 'iori',
  actionId: 'iori_aoihana',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.IORI_AOIHANA,
  frames: makeAttackFrames('iori_aoihana', 5, 4, 13, AttackType.IORI_AOIHANA),
  hitLevel: 'MID',
  knockdown: false,
  startup: 5,
  active: 4,
  recovery: 13,
  totalFrames: 22,
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
  frames: makeAttackFrames('iori_aoihana_2', 3, 3, 10, AttackType.IORI_AOIHANA_2),
  hitLevel: 'MID',
  knockdown: false,
  startup: 3,
  active: 3,
  recovery: 10,
  totalFrames: 16,
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
  frames: makeAttackFrames('iori_aoihana_3', 4, 5, 16, AttackType.IORI_AOIHANA_3),
  hitLevel: 'MID',
  knockdown: true,
  startup: 4,
  active: 5,
  recovery: 16,
  totalFrames: 25,
  cancelWindows: [],
  feedbackTierOverride: 'special',
};

// ═══════════════════════════════════════════════════════════════════
// DM — Desperation Moves (超必殺技) — Iori
// ═══════════════════════════════════════════════════════════════════

/** 八稚女 DM — rushing claw super */
const dm_yaotome_frames = makeAttackFrames('dm_yaotome', 5, 20, 30, AttackType.DM_YATAGARASU);
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
const sdm_yaotome_frames = makeAttackFrames('sdm_yaotome', 3, 28, 34, AttackType.SDM_YATAGARASU);
sdm_yaotome_frames[0].eventTags.push('super_flash');
const sdm_yaotome: ActionContract = {
  characterId: 'iori',
  actionId: 'sdm_yaotome',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.SDM_YATAGARASU,
  frames: sdm_yaotome_frames,
  hitLevel: 'MID',
  knockdown: true,
  startup: 3,
  active: 28,
  recovery: 34,
  totalFrames: 65,
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
