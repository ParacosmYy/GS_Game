import type { ActionContract, FrameContract, FrameCollision, FrameEventTag, CharacterFrameContract } from './frameContract.js';
import { FighterState, AttackType } from './types.js';
import { ATTACK_FRAMES } from './attackFrames.js';

// Pixel frame registry key mapping: actionId → registry key in ryoHighResRender.ts
const PIXEL_KEYS: Record<string, string> = {
  idle: 'IDLE', walk_forward: 'WALK_FORWARD', walk_backward: 'WALK_BACKWARD',
  jump: 'JUMP', run: 'RUN', backdash: 'BACKDASH', roll: 'ROLL', back_roll: 'BACK_ROLL',
  crouch: 'CROUCH', block: 'BLOCK', dizzy: 'DIZZY', guard_crush: 'GUARD_CRUSH',
  max_mode: 'MAX_MODE', taunt: 'TAUNT', win: 'WIN', throw_action: 'THROW',
  hurt: 'HURT', knockdown: 'KNOCKDOWN',
  stand_a: 'STAND_A', stand_b: 'STAND_B', stand_c: 'STAND_C', stand_d: 'STAND_D',
  close_a: 'STAND_A', close_b: 'CLOSE_B', close_c: 'STAND_C', close_d: 'CLOSE_D',
  crouch_a: 'CROUCH_A', crouch_b: 'CROUCH_B', crouch_c: 'CROUCH_C', crouch_d: 'CROUCH_D',
  ryo_tsurizao: 'STAND_A', ryo_orishi: 'CROUCH_B',
  ryo_koou: 'KOOU', ryo_koou_c: 'KOOU_C', ryo_ko_hou: 'KO_HOU', ryo_ko_hou_c: 'KO_HOU_C',
  ryo_hien: 'HIEN', ryo_haou: 'HAOU',
  dm_ten_ha_ou: 'DM_TEN_HA_OU', sdm_ten_ha_ou: 'SDM_TEN_HA_OU',
  dm_ryuko_ranbu: 'DM_RYUKO_RANBU', sdm_ryuko_ranbu: 'DM_RYUKO_RANBU',
  hsdm_ryuko_ranbu: 'HSDM_RYUKO_RANBU',
};

// Ticks per frame from pixel frame registry in ryoHighResRender.ts
const TPF: Record<string, number> = {
  IDLE: 9, WALK_FORWARD: 6, WALK_BACKWARD: 6, RUN: 3, BACKDASH: 3,
  ROLL: 4, BACK_ROLL: 4, CROUCH: 9, BLOCK: 8, JUMP: 5, DIZZY: 10,
  GUARD_CRUSH: 8, MAX_MODE: 6, TAUNT: 12, WIN: 10, THROW: 6,
  HURT: 4, KNOCKDOWN: 5,
  STAND_A: 4, STAND_B: 6, STAND_C: 6, STAND_D: 8,
  CLOSE_B: 5, CLOSE_D: 6,
  CROUCH_A: 4, CROUCH_B: 5, CROUCH_C: 5, CROUCH_D: 8,
  AIR_A: 4, AIR_C: 4, AIR_D: 4,
  KO_HOU: 7, KOOU: 16, HIEN: 8, HAOU: 12, KOOU_C: 20, KO_HOU_C: 18,
  DM_TEN_HA_OU: 12, DM_RYUKO_RANBU: 8, SDM_TEN_HA_OU: 16, HSDM_RYUKO_RANBU: 10,
};

function makeFrames(actionId: string, count: number): FrameContract[] {
  const pixelKey = PIXEL_KEYS[actionId] ?? 'IDLE';
  const tpf = TPF[pixelKey] ?? 8;
  return Array.from({ length: count }, (_, i) => ({
    characterId: 'ryo',
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

const idle: ActionContract = {
  characterId: 'ryo',
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
  characterId: 'ryo',
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
  characterId: 'ryo',
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
  characterId: 'ryo',
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

const stand_a: ActionContract = {
  characterId: 'ryo',
  actionId: 'stand_a',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.STAND_A,
  frames: makeAttackFrames('stand_a', 6, 3, 5, AttackType.STAND_A),
  hitLevel: 'MID',
  knockdown: false,
  startup: 6,
  active: 3,
  recovery: 5,
  totalFrames: 14,
  cancelWindows: [
    { frames: [4, 8], targetTypes: ['special', 'super'], requiresHit: true, maxOnly: false },
  ],
  feedbackTierOverride: null,
};

const stand_c: ActionContract = {
  characterId: 'ryo',
  actionId: 'stand_c',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.STAND_C,
  frames: makeAttackFrames('stand_c', 7, 3, 20, AttackType.STAND_C),
  hitLevel: 'MID',
  knockdown: false,
  startup: 7,
  active: 3,
  recovery: 20,
  totalFrames: 30,
  cancelWindows: [
    { frames: [2, 9], targetTypes: ['special', 'super'], requiresHit: true, maxOnly: false },
  ],
  feedbackTierOverride: null,
};

const stand_b: ActionContract = {
  characterId: 'ryo',
  actionId: 'stand_b',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.STAND_B,
  frames: makeAttackFrames('stand_b', 7, 3, 14, AttackType.STAND_B),
  hitLevel: 'MID',
  knockdown: false,
  startup: 7,
  active: 3,
  recovery: 14,
  totalFrames: 24,
  cancelWindows: [
    { frames: [5, 10], targetTypes: ['special'], requiresHit: true, maxOnly: false },
  ],
  feedbackTierOverride: null,
};

const stand_d: ActionContract = {
  characterId: 'ryo',
  actionId: 'stand_d',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.STAND_D,
  frames: makeAttackFrames('stand_d', 10, 8, 20, AttackType.STAND_D),
  hitLevel: 'HIGH',
  knockdown: false,
  startup: 10,
  active: 8,
  recovery: 20,
  totalFrames: 38,
  cancelWindows: [
    { frames: [8, 18], targetTypes: ['special', 'super'], requiresHit: true, maxOnly: false },
  ],
  feedbackTierOverride: null,
};

const close_a: ActionContract = {
  characterId: 'ryo',
  actionId: 'close_a',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.CLOSE_A,
  frames: makeAttackFrames('close_a', 4, 5, 5, AttackType.CLOSE_A),
  hitLevel: 'MID',
  knockdown: false,
  startup: 4,
  active: 5,
  recovery: 5,
  totalFrames: 14,
  cancelWindows: [
    { frames: [3, 9], targetTypes: ['special', 'super', 'normal'], requiresHit: false, maxOnly: false },
  ],
  feedbackTierOverride: null,
};

const close_c: ActionContract = {
  characterId: 'ryo',
  actionId: 'close_c',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.CLOSE_C,
  frames: makeAttackFrames('close_c', 2, 5, 11, AttackType.CLOSE_C),
  hitLevel: 'MID',
  knockdown: false,
  startup: 2,
  active: 5,
  recovery: 11,
  totalFrames: 18,
  cancelWindows: [
    { frames: [1, 7], targetTypes: ['special', 'super', 'normal'], requiresHit: false, maxOnly: false },
  ],
  feedbackTierOverride: null,
};

const close_b: ActionContract = {
  characterId: 'ryo',
  actionId: 'close_b',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.CLOSE_B,
  frames: makeAttackFrames('close_b', 5, 2, 8, AttackType.CLOSE_B),
  hitLevel: 'MID',
  knockdown: false,
  startup: 5,
  active: 2,
  recovery: 8,
  totalFrames: 15,
  cancelWindows: [
    { frames: [4, 7], targetTypes: ['special', 'super', 'normal'], requiresHit: false, maxOnly: false },
  ],
  feedbackTierOverride: null,
};

const close_d: ActionContract = {
  characterId: 'ryo',
  actionId: 'close_d',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.CLOSE_D,
  frames: makeAttackFrames('close_d', 6, 4, 12, AttackType.CLOSE_D),
  hitLevel: 'HIGH',
  knockdown: false,
  startup: 6,
  active: 4,
  recovery: 12,
  totalFrames: 22,
  cancelWindows: [
    { frames: [5, 10], targetTypes: ['special', 'super', 'normal'], requiresHit: false, maxOnly: false },
  ],
  feedbackTierOverride: null,
};

const hurt: ActionContract = {
  characterId: 'ryo',
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
  characterId: 'ryo',
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
// Crouch Normals (Ryo)
// ═══════════════════════════════════════════════════════════════════

const crouch_a: ActionContract = {
  characterId: 'ryo',
  actionId: 'crouch_a',
  state: FighterState.CROUCH_ATTACK,
  attackType: AttackType.CROUCH_A,
  frames: makeAttackFrames('crouch_a', 5, 4, 7, AttackType.CROUCH_A),
  hitLevel: 'LOW',
  knockdown: false,
  startup: 5,
  active: 4,
  recovery: 7,
  totalFrames: 16,
  cancelWindows: [
    { frames: [4, 9], targetTypes: ['special'], requiresHit: true, maxOnly: false },
  ],
  feedbackTierOverride: null,
};

const crouch_b: ActionContract = {
  characterId: 'ryo',
  actionId: 'crouch_b',
  state: FighterState.CROUCH_ATTACK,
  attackType: AttackType.CROUCH_B,
  frames: makeAttackFrames('crouch_b', 5, 5, 5, AttackType.CROUCH_B),
  hitLevel: 'LOW',
  knockdown: false,
  startup: 5,
  active: 5,
  recovery: 5,
  totalFrames: 15,
  cancelWindows: [
    { frames: [4, 10], targetTypes: ['special'], requiresHit: true, maxOnly: false },
  ],
  feedbackTierOverride: null,
};

const crouch_c: ActionContract = {
  characterId: 'ryo',
  actionId: 'crouch_c',
  state: FighterState.CROUCH_ATTACK,
  attackType: AttackType.CROUCH_C,
  frames: makeAttackFrames('crouch_c', 7, 5, 16, AttackType.CROUCH_C),
  hitLevel: 'LOW',
  knockdown: false,
  startup: 7,
  active: 5,
  recovery: 16,
  totalFrames: 28,
  cancelWindows: [
    { frames: [5, 12], targetTypes: ['special', 'super'], requiresHit: true, maxOnly: false },
  ],
  feedbackTierOverride: null,
};

const crouch_d: ActionContract = {
  characterId: 'ryo',
  actionId: 'crouch_d',
  state: FighterState.CROUCH_ATTACK,
  attackType: AttackType.CROUCH_D,
  frames: makeAttackFrames('crouch_d', 5, 6, 31, AttackType.CROUCH_D),
  hitLevel: 'LOW',
  knockdown: true,
  startup: 5,
  active: 6,
  recovery: 31,
  totalFrames: 42,
  cancelWindows: [
    { frames: [4, 11], targetTypes: ['special', 'super'], requiresHit: true, maxOnly: false },
  ],
  feedbackTierOverride: null,
};

// ═══════════════════════════════════════════════════════════════════
// Command Normals (Ryo)
// ═══════════════════════════════════════════════════════════════════

/** →+A 冰柱割り (overhead axe strike) */
const ryo_tsurizao: ActionContract = {
  characterId: 'ryo',
  actionId: 'ryo_tsurizao',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.RYO_TSURIZAO,
  frames: makeAttackFrames('ryo_tsurizao', 14, 4, 18, AttackType.RYO_TSURIZAO),
  hitLevel: 'HIGH',
  knockdown: false,
  startup: 14,
  active: 4,
  recovery: 18,
  totalFrames: 36,
  cancelWindows: [],
  feedbackTierOverride: null,
};

/** ↘+B 落蹴 (low slide kick) */
const ryo_orishi: ActionContract = {
  characterId: 'ryo',
  actionId: 'ryo_orishi',
  state: FighterState.CROUCH_ATTACK,
  attackType: AttackType.RYO_ORISHI,
  frames: makeAttackFrames('ryo_orishi', 8, 4, 20, AttackType.RYO_ORISHI),
  hitLevel: 'LOW',
  knockdown: false,
  startup: 8,
  active: 4,
  recovery: 20,
  totalFrames: 32,
  cancelWindows: [],
  feedbackTierOverride: null,
};

// ═══════════════════════════════════════════════════════════════════
// Specials (必殺技)
// ═══════════════════════════════════════════════════════════════════

/** ↓↘→+A 虎煌拳 (weak projectile) */
const ryo_koou: ActionContract = {
  characterId: 'ryo',
  actionId: 'ryo_koou',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.RYO_KOOU,
  frames: makeAttackFrames('ryo_koou', 12, 18, 34, AttackType.RYO_KOOU),
  hitLevel: 'MID',
  knockdown: false,
  startup: 12,
  active: 18,
  recovery: 34,
  totalFrames: 64,
  cancelWindows: [
    // Specials can cancel into DMs on hit during later active frames
    { frames: [20, 29], targetTypes: ['super'], requiresHit: true, maxOnly: true },
  ],
  feedbackTierOverride: 'special',
};

/** ↓↘→+C 虎煌拳 (strong projectile) */
const ryo_koou_c: ActionContract = {
  characterId: 'ryo',
  actionId: 'ryo_koou_c',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.RYO_KOOU_C,
  frames: makeAttackFrames('ryo_koou_c', 13, 20, 32, AttackType.RYO_KOOU_C),
  hitLevel: 'MID',
  knockdown: false,
  startup: 13,
  active: 20,
  recovery: 32,
  totalFrames: 65,
  cancelWindows: [
    { frames: [22, 32], targetTypes: ['super'], requiresHit: true, maxOnly: true },
  ],
  feedbackTierOverride: 'special',
};

/** →↓↘+A 虎咆 (weak uppercut) */
const ryo_ko_hou: ActionContract = {
  characterId: 'ryo',
  actionId: 'ryo_ko_hou',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.RYO_KO_HOU,
  frames: makeAttackFrames('ryo_ko_hou', 5, 5, 25, AttackType.RYO_KO_HOU),
  hitLevel: 'MID',
  knockdown: true,
  startup: 5,
  active: 5,
  recovery: 25,
  totalFrames: 35,
  cancelWindows: [
    // Upper body invincible during startup
    { frames: [0, 4], targetTypes: ['super'], requiresHit: false, maxOnly: true },
  ],
  feedbackTierOverride: 'special',
};

/** →↓↘+C 虎咆 (strong uppercut, full invincibility) */
const ryo_ko_hou_c: ActionContract = {
  characterId: 'ryo',
  actionId: 'ryo_ko_hou_c',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.RYO_KO_HOU_C,
  frames: makeAttackFrames('ryo_ko_hou_c', 7, 10, 30, AttackType.RYO_KO_HOU_C),
  hitLevel: 'MID',
  knockdown: true,
  startup: 7,
  active: 10,
  recovery: 30,
  totalFrames: 47,
  cancelWindows: [
    { frames: [0, 6], targetTypes: ['super'], requiresHit: false, maxOnly: true },
  ],
  feedbackTierOverride: 'special',
};

/** ←↙↓+K 飛燕疾風脚 (overhead flying kick) */
const ryo_hien: ActionContract = {
  characterId: 'ryo',
  actionId: 'ryo_hien',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.RYO_HIEN,
  frames: makeAttackFrames('ryo_hien', 10, 8, 22, AttackType.RYO_HIEN),
  hitLevel: 'HIGH',
  knockdown: true,
  startup: 10,
  active: 8,
  recovery: 22,
  totalFrames: 40,
  cancelWindows: [
    { frames: [14, 17], targetTypes: ['super'], requiresHit: true, maxOnly: true },
  ],
  feedbackTierOverride: 'special',
};

/** ↓↘→+K 霸王翔吼拳 (counter strike, multi-hit punches) */
const ryo_haou: ActionContract = {
  characterId: 'ryo',
  actionId: 'ryo_haou',
  state: FighterState.COUNTER_STANCE,
  attackType: AttackType.RYO_HAOU,
  frames: makeAttackFrames('ryo_haou', 10, 12, 22, AttackType.RYO_HAOU),
  hitLevel: 'MID',
  knockdown: false,
  startup: 10,
  active: 12,
  recovery: 22,
  totalFrames: 44,
  cancelWindows: [
    { frames: [12, 21], targetTypes: ['super'], requiresHit: true, maxOnly: true },
  ],
  feedbackTierOverride: 'special',
};

// ═══════════════════════════════════════════════════════════════════
// DM — Desperation Moves (超必殺技)
// ═══════════════════════════════════════════════════════════════════

/** 天地霸煌拳 DM — super energy blast */
const dm_ten_ha_ou_frames = makeAttackFrames('dm_ten_ha_ou', 18, 10, 40, AttackType.DM_TEN_HA_OU);
dm_ten_ha_ou_frames[0].eventTags.push('super_flash');
const dm_ten_ha_ou: ActionContract = {
  characterId: 'ryo',
  actionId: 'dm_ten_ha_ou',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.DM_TEN_HA_OU,
  frames: dm_ten_ha_ou_frames,
  hitLevel: 'MID',
  knockdown: true,
  startup: 18,
  active: 10,
  recovery: 40,
  totalFrames: 68,
  cancelWindows: [],
  feedbackTierOverride: 'super',
};

/** 龍虎乱舞 DM — rushing multi-hit super */
const dm_ryuko_ranbu_frames = makeAttackFrames('dm_ryuko_ranbu', 8, 10, 38, AttackType.DM_RYUKO_RANBU);
dm_ryuko_ranbu_frames[0].eventTags.push('super_flash');
const dm_ryuko_ranbu: ActionContract = {
  characterId: 'ryo',
  actionId: 'dm_ryuko_ranbu',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.DM_RYUKO_RANBU,
  frames: dm_ryuko_ranbu_frames,
  hitLevel: 'MID',
  knockdown: true,
  startup: 8,
  active: 10,
  recovery: 38,
  totalFrames: 56,
  cancelWindows: [],
  feedbackTierOverride: 'super',
};

// ═══════════════════════════════════════════════════════════════════
// SDM — Super Desperation Moves (MAX超必殺技)
// ═══════════════════════════════════════════════════════════════════

/** 龍虎乱舞 SDM — enhanced rushing DM (more hits) */
const sdm_ryuko_ranbu_frames = makeAttackFrames('sdm_ryuko_ranbu', 6, 13, 36, AttackType.SDM_RYUKO_RANBU);
sdm_ryuko_ranbu_frames[0].eventTags.push('super_flash');
const sdm_ryuko_ranbu: ActionContract = {
  characterId: 'ryo',
  actionId: 'sdm_ryuko_ranbu',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.SDM_RYUKO_RANBU,
  frames: sdm_ryuko_ranbu_frames,
  hitLevel: 'MID',
  knockdown: true,
  startup: 6,
  active: 13,
  recovery: 36,
  totalFrames: 55,
  cancelWindows: [],
  feedbackTierOverride: 'super',
};

/** 天地霸煌拳 SDM — extended energy blast */
const sdm_ten_ha_ou_frames = makeAttackFrames('sdm_ten_ha_ou', 10, 22, 35, AttackType.SDM_TEN_HA_OU);
sdm_ten_ha_ou_frames[0].eventTags.push('super_flash');
const sdm_ten_ha_ou: ActionContract = {
  characterId: 'ryo',
  actionId: 'sdm_ten_ha_ou',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.SDM_TEN_HA_OU,
  frames: sdm_ten_ha_ou_frames,
  hitLevel: 'MID',
  knockdown: true,
  startup: 10,
  active: 22,
  recovery: 35,
  totalFrames: 67,
  cancelWindows: [],
  feedbackTierOverride: 'super',
};

// ═══════════════════════════════════════════════════════════════════
// HSDM — Hidden Super Desperation Move (裏超必殺技)
// ═══════════════════════════════════════════════════════════════════

/** 龍虎乱舞 HSDM — hidden super (longest rush) */
const hsdm_ryuko_ranbu_frames = makeAttackFrames('hsdm_ryuko_ranbu', 2, 22, 32, AttackType.HSDM_RYUKO_RANBU);
hsdm_ryuko_ranbu_frames[0].eventTags.push('super_flash');
const hsdm_ryuko_ranbu: ActionContract = {
  characterId: 'ryo',
  actionId: 'hsdm_ryuko_ranbu',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.HSDM_RYUKO_RANBU,
  frames: hsdm_ryuko_ranbu_frames,
  hitLevel: 'MID',
  knockdown: true,
  startup: 2,
  active: 22,
  recovery: 32,
  totalFrames: 56,
  cancelWindows: [],
  feedbackTierOverride: 'super',
};

export const RYO_ACTION_CONTRACTS: Map<string, ActionContract> = new Map([
  ['idle', idle],
  ['walk_forward', walk_forward],
  ['walk_backward', walk_backward],
  ['jump', jump],
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
  // Damage states
  ['hurt', hurt],
  ['knockdown', knockdown],
  // Command normals
  ['ryo_tsurizao', ryo_tsurizao],
  ['ryo_orishi', ryo_orishi],
  // Specials
  ['ryo_koou', ryo_koou],
  ['ryo_koou_c', ryo_koou_c],
  ['ryo_ko_hou', ryo_ko_hou],
  ['ryo_ko_hou_c', ryo_ko_hou_c],
  ['ryo_hien', ryo_hien],
  ['ryo_haou', ryo_haou],
  // DM
  ['dm_ten_ha_ou', dm_ten_ha_ou],
  ['dm_ryuko_ranbu', dm_ryuko_ranbu],
  // SDM
  ['sdm_ryuko_ranbu', sdm_ryuko_ranbu],
  ['sdm_ten_ha_ou', sdm_ten_ha_ou],
  // HSDM
  ['hsdm_ryuko_ranbu', hsdm_ryuko_ranbu],
]);

export function getRyoFrameContractManifest(): CharacterFrameContract {
  return { characterId: 'ryo', actions: RYO_ACTION_CONTRACTS };
}
