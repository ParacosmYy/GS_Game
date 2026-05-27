import type { ActionContract, FrameContract, FrameCollision, FrameEventTag, CharacterFrameContract } from './frameContract.js';
import { FighterState, AttackType } from './types.js';
import { ATTACK_FRAMES } from './attackFrames.js';

// Pixel frame registry key mapping: actionId → registry key in kyoHighResRender.ts
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
  kyo_75kai: 'KYO_75KAI', kyo_75kai_2: 'KYO_75KAI_2', kyo_red_kick: 'KYO_RED_KICK',
  cmd_gofu_you: 'CMD_GOFU_YOU', cmd_88shiki: 'CMD_88SHIKI', cmd_naraku: 'CMD_NARAKU',
  // Specials
  kyo_oniyaki: 'KYO_ONIYAKI', kyo_oniyaki_c: 'KYO_ONIYAKI_C',
  kyo_yamibarai: 'KYO_YAMIBARAI', kyo_yamibarai_c: 'KYO_YAMIBARAI_C',
  kyo_aragami: 'KYO_ARAGAMI', kyo_dokugami: 'KYO_DOKUGAMI',
  // DM/SDM
  dm_orochinagi: 'DM_OROCHINAGI', sdm_orochinagi: 'SDM_OROCHINAGI',
};

// Ticks per frame from pixel frame registry in kyoHighResRender.ts
const TPF: Record<string, number> = {
  IDLE: 9, WALK_FORWARD: 6, WALK_BACKWARD: 6, RUN: 3, BACKDASH: 3,
  ROLL: 4, BACK_ROLL: 4, CROUCH: 9, BLOCK: 8, JUMP: 5, DIZZY: 10,
  GUARD_CRUSH: 8, MAX_MODE: 6, TAUNT: 12, WIN: 10, THROW: 6,
  HURT: 4, KNOCKDOWN: 5,
  STAND_A: 4, STAND_B: 5, STAND_C: 6, STAND_D: 7,
  CLOSE_A: 4, CLOSE_B: 5, CLOSE_C: 5, CLOSE_D: 6,
  CROUCH_A: 4, CROUCH_B: 5, CROUCH_C: 5, CROUCH_D: 7,
  AIR_A: 4, AIR_C: 5, AIR_D: 5,
  KYO_75KAI: 6, KYO_75KAI_2: 6, KYO_RED_KICK: 8,
  CMD_GOFU_YOU: 6, CMD_88SHIKI: 5, CMD_NARAKU: 5,
  KYO_ONIYAKI: 6, KYO_ONIYAKI_C: 7,
  KYO_YAMIBARAI: 14, KYO_YAMIBARAI_C: 14,
  KYO_ARAGAMI: 7, KYO_DOKUGAMI: 7,
  DM_OROCHINAGI: 10, SDM_OROCHINAGI: 12,
};

function makeFrames(actionId: string, count: number): FrameContract[] {
  const pixelKey = PIXEL_KEYS[actionId] ?? 'IDLE';
  const tpf = TPF[pixelKey] ?? 8;
  return Array.from({ length: count }, (_, i) => ({
    characterId: 'kyo',
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
// Non-attack States (Kyo)
// ═══════════════════════════════════════════════════════════════════

const idle: ActionContract = {
  characterId: 'kyo',
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
  characterId: 'kyo',
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
  characterId: 'kyo',
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
  characterId: 'kyo',
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
  characterId: 'kyo',
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
  characterId: 'kyo',
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
  characterId: 'kyo',
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
  characterId: 'kyo',
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
  characterId: 'kyo',
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
  characterId: 'kyo',
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
  characterId: 'kyo',
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
  characterId: 'kyo',
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
  characterId: 'kyo',
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
  characterId: 'kyo',
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
  characterId: 'kyo',
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
  characterId: 'kyo',
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
  characterId: 'kyo',
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
  characterId: 'kyo',
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
// Standing Normals (Kyo)
// ═══════════════════════════════════════════════════════════════════

const stand_a: ActionContract = {
  characterId: 'kyo',
  actionId: 'stand_a',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.STAND_A,
  frames: makeAttackFrames('stand_a', 5, 3, 5, AttackType.STAND_A),
  hitLevel: 'MID',
  knockdown: false,
  startup: 5,
  active: 3,
  recovery: 5,
  totalFrames: 13,
  cancelWindows: [
    { frames: [3, 6], targetTypes: ['special', 'super'], requiresHit: true, maxOnly: false },
  ],
  feedbackTierOverride: null,
};

const stand_b: ActionContract = {
  characterId: 'kyo',
  actionId: 'stand_b',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.STAND_B,
  frames: makeAttackFrames('stand_b', 5, 4, 7, AttackType.STAND_B),
  hitLevel: 'MID',
  knockdown: false,
  startup: 5,
  active: 4,
  recovery: 7,
  totalFrames: 16,
  cancelWindows: [
    { frames: [4, 8], targetTypes: ['special', 'super'], requiresHit: true, maxOnly: false },
  ],
  feedbackTierOverride: null,
};

const stand_c: ActionContract = {
  characterId: 'kyo',
  actionId: 'stand_c',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.STAND_C,
  frames: makeAttackFrames('stand_c', 7, 4, 10, AttackType.STAND_C),
  hitLevel: 'MID',
  knockdown: false,
  startup: 7,
  active: 4,
  recovery: 10,
  totalFrames: 21,
  cancelWindows: [
    { frames: [6, 10], targetTypes: ['special', 'super'], requiresHit: false, maxOnly: false },
  ],
  feedbackTierOverride: null,
};

const stand_d: ActionContract = {
  characterId: 'kyo',
  actionId: 'stand_d',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.STAND_D,
  frames: makeAttackFrames('stand_d', 8, 5, 12, AttackType.STAND_D),
  hitLevel: 'HIGH',
  knockdown: false,
  startup: 8,
  active: 5,
  recovery: 12,
  totalFrames: 25,
  cancelWindows: [
    { frames: [7, 12], targetTypes: ['special', 'super'], requiresHit: true, maxOnly: false },
  ],
  feedbackTierOverride: null,
};

// ═══════════════════════════════════════════════════════════════════
// Close Normals (Kyo)
// ═══════════════════════════════════════════════════════════════════

const close_a: ActionContract = {
  characterId: 'kyo',
  actionId: 'close_a',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.CLOSE_A,
  frames: makeAttackFrames('close_a', 4, 3, 5, AttackType.CLOSE_A),
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

const close_b: ActionContract = {
  characterId: 'kyo',
  actionId: 'close_b',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.CLOSE_B,
  frames: makeAttackFrames('close_b', 4, 3, 6, AttackType.CLOSE_B),
  hitLevel: 'MID',
  knockdown: false,
  startup: 4,
  active: 3,
  recovery: 6,
  totalFrames: 13,
  cancelWindows: [
    { frames: [3, 6], targetTypes: ['special', 'super', 'normal'], requiresHit: false, maxOnly: false },
  ],
  feedbackTierOverride: null,
};

const close_c: ActionContract = {
  characterId: 'kyo',
  actionId: 'close_c',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.CLOSE_C,
  frames: makeAttackFrames('close_c', 5, 4, 8, AttackType.CLOSE_C),
  hitLevel: 'MID',
  knockdown: false,
  startup: 5,
  active: 4,
  recovery: 8,
  totalFrames: 17,
  cancelWindows: [
    { frames: [5, 8], targetTypes: ['special', 'super'], requiresHit: false, maxOnly: false },
  ],
  feedbackTierOverride: null,
};

const close_d: ActionContract = {
  characterId: 'kyo',
  actionId: 'close_d',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.CLOSE_D,
  frames: makeAttackFrames('close_d', 6, 5, 10, AttackType.CLOSE_D),
  hitLevel: 'HIGH',
  knockdown: false,
  startup: 6,
  active: 5,
  recovery: 10,
  totalFrames: 21,
  cancelWindows: [
    { frames: [5, 10], targetTypes: ['special', 'super', 'normal'], requiresHit: false, maxOnly: false },
  ],
  feedbackTierOverride: null,
};

// ═══════════════════════════════════════════════════════════════════
// Crouch Normals (Kyo)
// ═══════════════════════════════════════════════════════════════════

const crouch_a: ActionContract = {
  characterId: 'kyo',
  actionId: 'crouch_a',
  state: FighterState.CROUCH_ATTACK,
  attackType: AttackType.CROUCH_A,
  frames: makeAttackFrames('crouch_a', 4, 3, 5, AttackType.CROUCH_A),
  hitLevel: 'LOW',
  knockdown: false,
  startup: 4,
  active: 3,
  recovery: 5,
  totalFrames: 12,
  cancelWindows: [
    { frames: [3, 6], targetTypes: ['special', 'super'], requiresHit: true, maxOnly: false },
  ],
  feedbackTierOverride: null,
};

const crouch_b: ActionContract = {
  characterId: 'kyo',
  actionId: 'crouch_b',
  state: FighterState.CROUCH_ATTACK,
  attackType: AttackType.CROUCH_B,
  frames: makeAttackFrames('crouch_b', 5, 4, 6, AttackType.CROUCH_B),
  hitLevel: 'LOW',
  knockdown: false,
  startup: 5,
  active: 4,
  recovery: 6,
  totalFrames: 15,
  cancelWindows: [
    { frames: [4, 8], targetTypes: ['special', 'super'], requiresHit: true, maxOnly: false },
  ],
  feedbackTierOverride: null,
};

const crouch_c: ActionContract = {
  characterId: 'kyo',
  actionId: 'crouch_c',
  state: FighterState.CROUCH_ATTACK,
  attackType: AttackType.CROUCH_C,
  frames: makeAttackFrames('crouch_c', 6, 4, 9, AttackType.CROUCH_C),
  hitLevel: 'LOW',
  knockdown: false,
  startup: 6,
  active: 4,
  recovery: 9,
  totalFrames: 19,
  cancelWindows: [
    { frames: [5, 10], targetTypes: ['special', 'super'], requiresHit: true, maxOnly: false },
  ],
  feedbackTierOverride: null,
};

const crouch_d: ActionContract = {
  characterId: 'kyo',
  actionId: 'crouch_d',
  state: FighterState.CROUCH_ATTACK,
  attackType: AttackType.CROUCH_D,
  frames: makeAttackFrames('crouch_d', 7, 5, 11, AttackType.CROUCH_D),
  hitLevel: 'LOW',
  knockdown: true,
  startup: 7,
  active: 5,
  recovery: 11,
  totalFrames: 23,
  cancelWindows: [
    { frames: [6, 11], targetTypes: ['special', 'super'], requiresHit: true, maxOnly: false },
  ],
  feedbackTierOverride: null,
};

// ═══════════════════════════════════════════════════════════════════
// Air Normals (Kyo)
// ═══════════════════════════════════════════════════════════════════

const air_a: ActionContract = {
  characterId: 'kyo',
  actionId: 'air_a',
  state: FighterState.AIR_ATTACK,
  attackType: AttackType.STAND_A, // Air normals reuse generic AttackType
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
  characterId: 'kyo',
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
  characterId: 'kyo',
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
// Command Normals (Kyo)
// ═══════════════════════════════════════════════════════════════════

/** 75式·改 ↓↘→+B (第1段キック) */
const kyo_75kai: ActionContract = {
  characterId: 'kyo',
  actionId: 'kyo_75kai',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.KYO_75KAI,
  frames: makeAttackFrames('kyo_75kai', 14, 3, 14, AttackType.KYO_75KAI),
  hitLevel: 'MID',
  knockdown: false,
  startup: 14,
  active: 3,
  recovery: 14,
  totalFrames: 31,
  cancelWindows: [
    { frames: [17, 22], targetTypes: ['special', 'command'], requiresHit: true, maxOnly: false },
  ],
  feedbackTierOverride: null,
};

/** 75式·改 第2段 (↓↘→+K追加) */
const kyo_75kai_2: ActionContract = {
  characterId: 'kyo',
  actionId: 'kyo_75kai_2',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.KYO_75KAI_2,
  frames: makeAttackFrames('kyo_75kai_2', 7, 7, 14, AttackType.KYO_75KAI_2),
  hitLevel: 'MID',
  knockdown: true,
  startup: 7,
  active: 7,
  recovery: 14,
  totalFrames: 28,
  cancelWindows: [],
  feedbackTierOverride: null,
};

/** R.E.D. Kick ←↓↙+B/D (反向蹴り) */
const kyo_red_kick: ActionContract = {
  characterId: 'kyo',
  actionId: 'kyo_red_kick',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.KYO_RED_KICK,
  frames: makeAttackFrames('kyo_red_kick', 19, 6, 33, AttackType.KYO_RED_KICK),
  hitLevel: 'MID',
  knockdown: true,
  startup: 19,
  active: 6,
  recovery: 33,
  totalFrames: 58,
  cancelWindows: [],
  feedbackTierOverride: 'special',
};

/** →+B 外式·轟斧陽 (overhead) */
const cmd_gofu_you: ActionContract = {
  characterId: 'kyo',
  actionId: 'cmd_gofu_you',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.CMD_GOFU_YOU,
  frames: makeAttackFrames('cmd_gofu_you', 12, 4, 16, AttackType.CMD_GOFU_YOU),
  hitLevel: 'HIGH',
  knockdown: false,
  startup: 12,
  active: 4,
  recovery: 16,
  totalFrames: 32,
  cancelWindows: [
    { frames: [10, 15], targetTypes: ['special', 'super'], requiresHit: true, maxOnly: false },
  ],
  feedbackTierOverride: null,
};

/** ↘+D 八拾八式 (下段2Hit) */
const cmd_88shiki: ActionContract = {
  characterId: 'kyo',
  actionId: 'cmd_88shiki',
  state: FighterState.CROUCH_ATTACK,
  attackType: AttackType.CMD_88SHIKI,
  frames: makeAttackFrames('cmd_88shiki', 8, 5, 14, AttackType.CMD_88SHIKI),
  hitLevel: 'LOW',
  knockdown: false,
  startup: 8,
  active: 5,
  recovery: 14,
  totalFrames: 27,
  cancelWindows: [
    { frames: [7, 12], targetTypes: ['special', 'super'], requiresHit: true, maxOnly: false },
  ],
  feedbackTierOverride: null,
};

/** 空中↓+C 外式·奈落落とし */
const cmd_naraku: ActionContract = {
  characterId: 'kyo',
  actionId: 'cmd_naraku',
  state: FighterState.AIR_ATTACK,
  attackType: AttackType.CMD_NARAKU,
  frames: makeAttackFrames('cmd_naraku', 7, 5, 10, AttackType.CMD_NARAKU),
  hitLevel: 'HIGH',
  knockdown: true,
  startup: 7,
  active: 5,
  recovery: 10,
  totalFrames: 22,
  cancelWindows: [],
  feedbackTierOverride: null,
};

// ═══════════════════════════════════════════════════════════════════
// Specials (必殺技) — Kyo
// ═══════════════════════════════════════════════════════════════════

/** →↓↘+A 鬼焼き (weak uppercut, 2-hit) */
const kyo_oniyaki: ActionContract = {
  characterId: 'kyo',
  actionId: 'kyo_oniyaki',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.KYO_ONIYAKI,
  frames: makeAttackFrames('kyo_oniyaki', 6, 8, 38, AttackType.KYO_ONIYAKI),
  hitLevel: 'MID',
  knockdown: true,
  startup: 6,
  active: 8,
  recovery: 38,
  totalFrames: 52,
  cancelWindows: [],
  feedbackTierOverride: 'special',
};

/** →↓↘+C 鬼焼き (strong uppercut, multi-hit, full invincibility) */
const kyo_oniyaki_c: ActionContract = {
  characterId: 'kyo',
  actionId: 'kyo_oniyaki_c',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.KYO_ONIYAKI_C,
  frames: makeAttackFrames('kyo_oniyaki_c', 6, 14, 48, AttackType.KYO_ONIYAKI_C),
  hitLevel: 'MID',
  knockdown: true,
  startup: 6,
  active: 14,
  recovery: 48,
  totalFrames: 68,
  cancelWindows: [],
  feedbackTierOverride: 'special',
};

/** ↓↘→+A 闇払い (weak projectile) */
const kyo_yamibarai: ActionContract = {
  characterId: 'kyo',
  actionId: 'kyo_yamibarai',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.KYO_YAMIBARAI,
  frames: makeAttackFrames('kyo_yamibarai', 10, 20, 30, AttackType.KYO_YAMIBARAI),
  hitLevel: 'MID',
  knockdown: false,
  startup: 10,
  active: 20,
  recovery: 30,
  totalFrames: 60,
  cancelWindows: [],
  feedbackTierOverride: 'special',
};

/** ↓↘→+C 闇払い (strong projectile) */
const kyo_yamibarai_c: ActionContract = {
  characterId: 'kyo',
  actionId: 'kyo_yamibarai_c',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.KYO_YAMIBARAI_C,
  frames: makeAttackFrames('kyo_yamibarai_c', 11, 22, 28, AttackType.KYO_YAMIBARAI_C),
  hitLevel: 'MID',
  knockdown: false,
  startup: 11,
  active: 22,
  recovery: 28,
  totalFrames: 61,
  cancelWindows: [],
  feedbackTierOverride: 'special',
};

/** ↓↘→+A 114式·荒咬み (rekka 1st hit — A route) */
const kyo_aragami: ActionContract = {
  characterId: 'kyo',
  actionId: 'kyo_aragami',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.KYO_ARAGAMI,
  frames: makeAttackFrames('kyo_aragami', 12, 6, 18, AttackType.KYO_ARAGAMI),
  hitLevel: 'MID',
  knockdown: false,
  startup: 12,
  active: 6,
  recovery: 18,
  totalFrames: 36,
  cancelWindows: [
    // Rekka followup window — can chain into konokizu, yanosabi, nanase, etc.
    { frames: [5, 9], targetTypes: ['special'], requiresHit: false, maxOnly: false },
  ],
  feedbackTierOverride: 'special',
};

/** ↓↘→+C 115式·毒咬み (rekka 1st hit — C route) */
const kyo_dokugami: ActionContract = {
  characterId: 'kyo',
  actionId: 'kyo_dokugami',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.KYO_DOKUGAMI,
  frames: makeAttackFrames('kyo_dokugami', 18, 6, 21, AttackType.KYO_DOKUGAMI),
  hitLevel: 'MID',
  knockdown: false,
  startup: 18,
  active: 6,
  recovery: 21,
  totalFrames: 45,
  cancelWindows: [
    // Rekka followup window — can chain into tsumiyomi → batsuyomi
    { frames: [10, 15], targetTypes: ['special'], requiresHit: false, maxOnly: false },
  ],
  feedbackTierOverride: 'special',
};

// ═══════════════════════════════════════════════════════════════════
// DM — Desperation Moves (超必殺技) — Kyo
// ═══════════════════════════════════════════════════════════════════

/** 大蛇薙 DM — fire pillar super */
const dm_orochinagi_frames = makeAttackFrames('dm_orochinagi', 21, 17, 27, AttackType.DM_OROCHINAGI);
dm_orochinagi_frames[0].eventTags.push('super_flash');
const dm_orochinagi: ActionContract = {
  characterId: 'kyo',
  actionId: 'dm_orochinagi',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.DM_OROCHINAGI,
  frames: dm_orochinagi_frames,
  hitLevel: 'MID',
  knockdown: true,
  startup: 21,
  active: 17,
  recovery: 27,
  totalFrames: 65,
  cancelWindows: [],
  feedbackTierOverride: 'super',
};

// ═══════════════════════════════════════════════════════════════════
// SDM — Super Desperation Moves (MAX超必殺技) — Kyo
// ═══════════════════════════════════════════════════════════════════

/** 大蛇薙 SDM — enhanced fire pillar super (more hits) */
const sdm_orochinagi_frames = makeAttackFrames('sdm_orochinagi', 20, 25, 29, AttackType.SDM_OROCHINAGI);
sdm_orochinagi_frames[0].eventTags.push('super_flash');
const sdm_orochinagi: ActionContract = {
  characterId: 'kyo',
  actionId: 'sdm_orochinagi',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.SDM_OROCHINAGI,
  frames: sdm_orochinagi_frames,
  hitLevel: 'MID',
  knockdown: true,
  startup: 20,
  active: 25,
  recovery: 29,
  totalFrames: 74,
  cancelWindows: [],
  feedbackTierOverride: 'super',
};

// ═══════════════════════════════════════════════════════════════════
// Contract Map
// ═══════════════════════════════════════════════════════════════════

export const KYO_ACTION_CONTRACTS: Map<string, ActionContract> = new Map([
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
  ['kyo_75kai', kyo_75kai],
  ['kyo_75kai_2', kyo_75kai_2],
  ['kyo_red_kick', kyo_red_kick],
  ['cmd_gofu_you', cmd_gofu_you],
  ['cmd_88shiki', cmd_88shiki],
  ['cmd_naraku', cmd_naraku],
  // Specials
  ['kyo_oniyaki', kyo_oniyaki],
  ['kyo_oniyaki_c', kyo_oniyaki_c],
  ['kyo_yamibarai', kyo_yamibarai],
  ['kyo_yamibarai_c', kyo_yamibarai_c],
  ['kyo_aragami', kyo_aragami],
  ['kyo_dokugami', kyo_dokugami],
  // DM
  ['dm_orochinagi', dm_orochinagi],
  // SDM
  ['sdm_orochinagi', sdm_orochinagi],
]);

export function getKyoFrameContractManifest(): CharacterFrameContract {
  return { characterId: 'kyo', actions: KYO_ACTION_CONTRACTS };
}
