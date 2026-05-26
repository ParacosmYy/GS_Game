import type { ActionContract, FrameContract, CancelWindow, FrameCollision, FrameSpriteRef, FrameEventTag, CharacterFrameContract } from './frameContract.js';
import { FighterState, AttackType } from './types.js';

function makeFrames(actionId: string, count: number): FrameContract[] {
  return Array.from({ length: count }, (_, i) => ({
    characterId: 'ryo',
    actionId,
    frameIndex: i,
    sprite: { spriteRef: `ryo_${actionId}_${i}`, anchor: { x: 24, y: 72 }, offset: { x: 0, y: 0 }, duration: 1 },
    collision: null,
    eventTags: [] as FrameEventTag[],
  }));
}

function makeAttackFrames(
  actionId: string,
  startup: number,
  active: number,
  recovery: number,
): FrameContract[] {
  const total = startup + active + recovery;
  const frames = makeFrames(actionId, total);
  for (let i = startup; i < startup + active; i++) {
    frames[i].collision = {
      hitboxes: [],
      hurtboxOverride: null,
      throwBoxes: [],
    };
    frames[i].eventTags.push('swing');
  }
  return frames;
}

const COLLISION_MARKER: FrameCollision = { hitboxes: [], hurtboxOverride: null, throwBoxes: [] };

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
  frames: makeAttackFrames('stand_a', 6, 3, 5),
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
  frames: makeAttackFrames('stand_c', 7, 3, 20),
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

const close_a: ActionContract = {
  characterId: 'ryo',
  actionId: 'close_a',
  state: FighterState.STAND_ATTACK,
  attackType: AttackType.CLOSE_A,
  frames: makeAttackFrames('close_a', 4, 5, 5),
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
  frames: makeAttackFrames('close_c', 2, 5, 11),
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

export const RYO_ACTION_CONTRACTS: Map<string, ActionContract> = new Map([
  ['idle', idle],
  ['walk_forward', walk_forward],
  ['walk_backward', walk_backward],
  ['jump', jump],
  ['stand_a', stand_a],
  ['stand_c', stand_c],
  ['close_a', close_a],
  ['close_c', close_c],
  ['hurt', hurt],
  ['knockdown', knockdown],
]);

export function getRyoFrameContractManifest(): CharacterFrameContract {
  return { characterId: 'ryo', actions: RYO_ACTION_CONTRACTS };
}
