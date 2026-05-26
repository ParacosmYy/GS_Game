/**
 * Frame Contract Builder — 运行时查询层单元测试
 *
 * 测试 resolveFrameIndex、getCurrentPhase、getEffectiveHitboxes、getActiveEvents 等
 */

import { describe, it, expect } from 'vitest';
import type {
  FrameContract,
  ActionContract,
  FrameCollision,
  FrameEventTag,
} from '../src/core/frameContract.js';
import {
  resolveFrameIndex,
  getCurrentPhase,
  getEffectiveHitboxes,
  getCollisionAtFrame,
  getActiveEvents,
  hasEventTag,
  getSpriteRef,
  getFrameAt,
  findActionContract,
  phaseFrameToAbsolute,
} from '../src/core/frameContractBuilder.js';
import { FighterState } from '../src/core/types.js';

// ===== Helpers =====

function makeFrame(
  characterId: string,
  actionId: string,
  frameIndex: number,
  opts?: {
    collision?: FrameCollision | null;
    eventTags?: FrameEventTag[];
    duration?: number;
  },
): FrameContract {
  return {
    characterId,
    actionId,
    frameIndex,
    sprite: {
      spriteRef: `${actionId}_${frameIndex}`,
      anchor: { x: 0, y: 0 },
      offset: { x: 0, y: 0 },
      duration: opts?.duration ?? 1,
    },
    collision: opts?.collision ?? null,
    eventTags: opts?.eventTags ?? [],
  };
}

function makeAttackAction(
  characterId: string,
  actionId: string,
  startup: number,
  active: number,
  recovery: number,
  opts?: {
    activeHitboxes?: FrameCollision;
    eventTags?: Map<number, FrameEventTag[]>;
  },
): ActionContract {
  const totalFrames = startup + active + recovery;
  const frames: FrameContract[] = [];

  for (let i = 0; i < totalFrames; i++) {
    const tags = opts?.eventTags?.get(i) ?? [];
    let collision: FrameCollision | null = null;

    // Active frames get hitboxes
    if (i >= startup && i < startup + active && opts?.activeHitboxes) {
      collision = opts.activeHitboxes;
    }

    frames.push(makeFrame(characterId, actionId, i, { collision, eventTags: tags }));
  }

  return {
    characterId,
    actionId,
    state: FighterState.STAND_ATTACK,
    attackType: null,
    frames,
    hitLevel: 'MID',
    knockdown: false,
    startup,
    active,
    recovery,
    totalFrames,
    cancelWindows: [],
    feedbackTierOverride: null,
  };
}

// ===== Fixtures =====

// stand_a: 6 startup, 3 active, 5 recovery = 14 frames
const HITBOX_A: FrameCollision = {
  hitboxes: [{ ox: 40, oy: -75, w: 35, h: 22 }],
  hurtboxOverride: null,
  throwBoxes: [],
};

const stand_a = makeAttackAction('ryo', 'stand_a', 6, 3, 5, {
  activeHitboxes: HITBOX_A,
  eventTags: new Map([
    [0, ['swing']],
    [6, ['swing']],
    [8, ['cancel_point']],
  ]),
});

// stand_c: 7 startup, 3 active, 20 recovery = 30 frames
const HITBOX_C: FrameCollision = {
  hitboxes: [{ ox: 55, oy: -68, w: 50, h: 35 }],
  hurtboxOverride: null,
  throwBoxes: [],
};

const stand_c = makeAttackAction('ryo', 'stand_c', 7, 3, 20, {
  activeHitboxes: HITBOX_C,
});

// idle: non-attack action (startup=0, active=0, recovery=0)
const idle: ActionContract = {
  characterId: 'ryo',
  actionId: 'idle',
  state: FighterState.IDLE,
  attackType: null,
  frames: Array.from({ length: 8 }, (_, i) =>
    makeFrame('ryo', 'idle', i, { duration: 4 }),
  ),
  hitLevel: 'MID',
  knockdown: false,
  startup: 0,
  active: 0,
  recovery: 0,
  totalFrames: 8,
  cancelWindows: [],
  feedbackTierOverride: null,
};

// multi-duration: frames with varying durations
const multiDuration: ActionContract = {
  characterId: 'ryo',
  actionId: 'multi_dur',
  state: FighterState.STAND_ATTACK,
  attackType: null,
  frames: [
    makeFrame('ryo', 'multi_dur', 0, { duration: 3 }),
    makeFrame('ryo', 'multi_dur', 1, { duration: 2 }),
    makeFrame('ryo', 'multi_dur', 2, { duration: 5 }),
    makeFrame('ryo', 'multi_dur', 3, { duration: 1 }),
  ],
  hitLevel: 'MID',
  knockdown: false,
  startup: 2,
  active: 1,
  recovery: 1,
  totalFrames: 4,
  cancelWindows: [],
  feedbackTierOverride: null,
};

// ================================================================
// Tests
// ================================================================

describe('resolveFrameIndex', () => {
  it('returns 0 for tick 0', () => {
    expect(resolveFrameIndex(stand_a, 0)).toBe(0);
  });

  it('returns correct frame for tick within first frame (duration=1)', () => {
    // stand_a frames all have duration=1
    expect(resolveFrameIndex(stand_a, 0)).toBe(0);
    expect(resolveFrameIndex(stand_a, 1)).toBe(1);
    expect(resolveFrameIndex(stand_a, 5)).toBe(5);
    expect(resolveFrameIndex(stand_a, 13)).toBe(13);
  });

  it('returns last frame for tick beyond total', () => {
    expect(resolveFrameIndex(stand_a, 100)).toBe(13);
    expect(resolveFrameIndex(stand_a, 999)).toBe(13);
  });

  it('returns 0 for negative tick', () => {
    expect(resolveFrameIndex(stand_a, -1)).toBe(0);
    expect(resolveFrameIndex(stand_a, -100)).toBe(0);
  });

  it('handles multi-duration frames correctly', () => {
    // Frame 0: duration 3 (ticks 0,1,2)
    // Frame 1: duration 2 (ticks 3,4)
    // Frame 2: duration 5 (ticks 5,6,7,8,9)
    // Frame 3: duration 1 (tick 10)
    expect(resolveFrameIndex(multiDuration, 0)).toBe(0);
    expect(resolveFrameIndex(multiDuration, 1)).toBe(0);
    expect(resolveFrameIndex(multiDuration, 2)).toBe(0);
    expect(resolveFrameIndex(multiDuration, 3)).toBe(1);
    expect(resolveFrameIndex(multiDuration, 4)).toBe(1);
    expect(resolveFrameIndex(multiDuration, 5)).toBe(2);
    expect(resolveFrameIndex(multiDuration, 6)).toBe(2);
    expect(resolveFrameIndex(multiDuration, 9)).toBe(2);
    expect(resolveFrameIndex(multiDuration, 10)).toBe(3);
    expect(resolveFrameIndex(multiDuration, 11)).toBe(3); // beyond total
  });

  it('handles idle frames with duration=4', () => {
    // 8 frames, each duration=4
    // Frame 0: ticks 0-3, Frame 1: ticks 4-7, etc.
    expect(resolveFrameIndex(idle, 0)).toBe(0);
    expect(resolveFrameIndex(idle, 3)).toBe(0);
    expect(resolveFrameIndex(idle, 4)).toBe(1);
    expect(resolveFrameIndex(idle, 7)).toBe(1);
    expect(resolveFrameIndex(idle, 8)).toBe(2);
    expect(resolveFrameIndex(idle, 31)).toBe(7);
    expect(resolveFrameIndex(idle, 32)).toBe(7); // beyond
  });
});

describe('getCurrentPhase', () => {
  it('returns startup for frames before startup count', () => {
    // stand_a: startup=6, active=3, recovery=5
    expect(getCurrentPhase(stand_a, 0)).toBe('startup');
    expect(getCurrentPhase(stand_a, 3)).toBe('startup');
    expect(getCurrentPhase(stand_a, 5)).toBe('startup');
  });

  it('returns active for frames in active range', () => {
    // active: frames 6-8
    expect(getCurrentPhase(stand_a, 6)).toBe('active');
    expect(getCurrentPhase(stand_a, 7)).toBe('active');
    expect(getCurrentPhase(stand_a, 8)).toBe('active');
  });

  it('returns recovery for frames after active', () => {
    // recovery: frames 9-13
    expect(getCurrentPhase(stand_a, 9)).toBe('recovery');
    expect(getCurrentPhase(stand_a, 13)).toBe('recovery');
  });

  it('returns null for non-attack actions', () => {
    // idle: startup=0, active=0, recovery=0
    expect(getCurrentPhase(idle, 0)).toBeNull();
    expect(getCurrentPhase(idle, 4)).toBeNull();
  });

  it('returns startup for negative frame index', () => {
    expect(getCurrentPhase(stand_a, -1)).toBe('startup');
  });

  it('handles stand_c correctly', () => {
    // stand_c: startup=7, active=3, recovery=20
    expect(getCurrentPhase(stand_c, 0)).toBe('startup');
    expect(getCurrentPhase(stand_c, 6)).toBe('startup');
    expect(getCurrentPhase(stand_c, 7)).toBe('active');
    expect(getCurrentPhase(stand_c, 9)).toBe('active');
    expect(getCurrentPhase(stand_c, 10)).toBe('recovery');
    expect(getCurrentPhase(stand_c, 29)).toBe('recovery');
  });

  it('handles boundary between startup and active correctly', () => {
    // stand_a: frame 5 = startup, frame 6 = active
    expect(getCurrentPhase(stand_a, 5)).toBe('startup');
    expect(getCurrentPhase(stand_a, 6)).toBe('active');
  });

  it('handles boundary between active and recovery correctly', () => {
    // stand_a: frame 8 = active, frame 9 = recovery
    expect(getCurrentPhase(stand_a, 8)).toBe('active');
    expect(getCurrentPhase(stand_a, 9)).toBe('recovery');
  });
});

describe('getEffectiveHitboxes', () => {
  it('returns hitboxes for active frames', () => {
    const result = getEffectiveHitboxes(stand_a, 6);
    expect(result).toHaveLength(1);
    expect(result[0].hitboxes).toHaveLength(1);
    expect(result[0].hitboxes[0]).toEqual({ ox: 40, oy: -75, w: 35, h: 22 });
  });

  it('returns hitboxes for all active frames', () => {
    // stand_a active: frames 6, 7, 8
    expect(getEffectiveHitboxes(stand_a, 6)).toHaveLength(1);
    expect(getEffectiveHitboxes(stand_a, 7)).toHaveLength(1);
    expect(getEffectiveHitboxes(stand_a, 8)).toHaveLength(1);
  });

  it('returns empty for startup frames', () => {
    expect(getEffectiveHitboxes(stand_a, 0)).toEqual([]);
    expect(getEffectiveHitboxes(stand_a, 5)).toEqual([]);
  });

  it('returns empty for recovery frames', () => {
    expect(getEffectiveHitboxes(stand_a, 9)).toEqual([]);
    expect(getEffectiveHitboxes(stand_a, 13)).toEqual([]);
  });

  it('returns empty for non-attack action', () => {
    expect(getEffectiveHitboxes(idle, 0)).toEqual([]);
  });

  it('returns correct hitboxes for stand_c active frames', () => {
    // stand_c active: frames 7, 8, 9
    const result = getEffectiveHitboxes(stand_c, 7);
    expect(result).toHaveLength(1);
    expect(result[0].hitboxes[0]).toEqual({ ox: 55, oy: -68, w: 50, h: 35 });
  });

  it('returns empty for frames without collision data', () => {
    // Create action with active frames but no hitbox data
    const noHitAction = makeAttackAction('ryo', 'no_hit', 2, 2, 2);
    // Even in active phase, no hitboxes
    expect(getEffectiveHitboxes(noHitAction, 2)).toEqual([]);
  });
});

describe('getCollisionAtFrame', () => {
  it('returns collision for active frames with data', () => {
    const collision = getCollisionAtFrame(stand_a, 6);
    expect(collision).not.toBeNull();
    expect(collision!.hitboxes).toHaveLength(1);
  });

  it('returns null for startup frames', () => {
    expect(getCollisionAtFrame(stand_a, 0)).toBeNull();
    expect(getCollisionAtFrame(stand_a, 5)).toBeNull();
  });

  it('returns null for out-of-range frames', () => {
    expect(getCollisionAtFrame(stand_a, -1)).toBeNull();
    expect(getCollisionAtFrame(stand_a, 999)).toBeNull();
  });
});

describe('getActiveEvents', () => {
  it('returns events for frames with tags', () => {
    // stand_a: frame 0 has 'swing'
    const events = getActiveEvents(stand_a, 0);
    expect(events).toContain('swing');
    expect(events).toHaveLength(1);
  });

  it('returns events for active frames', () => {
    // stand_a: frame 6 has 'swing'
    const events = getActiveEvents(stand_a, 6);
    expect(events).toContain('swing');
  });

  it('returns cancel_point at the correct frame', () => {
    // stand_a: frame 8 has 'cancel_point'
    const events = getActiveEvents(stand_a, 8);
    expect(events).toContain('cancel_point');
  });

  it('returns empty array for frames with no events', () => {
    expect(getActiveEvents(stand_a, 1)).toEqual([]);
    expect(getActiveEvents(stand_a, 5)).toEqual([]);
    expect(getActiveEvents(stand_a, 13)).toEqual([]);
  });

  it('returns empty array for out-of-range frames', () => {
    expect(getActiveEvents(stand_a, -1)).toEqual([]);
    expect(getActiveEvents(stand_a, 999)).toEqual([]);
  });

  it('returns multiple events if frame has them', () => {
    // Create an action with multiple events on one frame
    const multiEventAction = makeAttackAction('ryo', 'multi_evt', 2, 2, 2, {
      eventTags: new Map([
        [2, ['swing', 'hit', 'vfx_spawn']],
      ]),
    });
    const events = getActiveEvents(multiEventAction, 2);
    expect(events).toHaveLength(3);
    expect(events).toContain('swing');
    expect(events).toContain('hit');
    expect(events).toContain('vfx_spawn');
  });
});

describe('hasEventTag', () => {
  it('returns true when frame has the tag', () => {
    expect(hasEventTag(stand_a, 0, 'swing')).toBe(true);
    expect(hasEventTag(stand_a, 6, 'swing')).toBe(true);
  });

  it('returns false when frame does not have the tag', () => {
    expect(hasEventTag(stand_a, 0, 'hit')).toBe(false);
    expect(hasEventTag(stand_a, 5, 'swing')).toBe(false);
  });

  it('returns false for out-of-range frames', () => {
    expect(hasEventTag(stand_a, -1, 'swing')).toBe(false);
    expect(hasEventTag(stand_a, 999, 'swing')).toBe(false);
  });
});

describe('getSpriteRef', () => {
  it('returns correct spriteRef for each frame', () => {
    expect(getSpriteRef(stand_a, 0)).toBe('stand_a_0');
    expect(getSpriteRef(stand_a, 6)).toBe('stand_a_6');
    expect(getSpriteRef(stand_a, 13)).toBe('stand_a_13');
  });

  it('returns null for out-of-range frames', () => {
    expect(getSpriteRef(stand_a, -1)).toBeNull();
    expect(getSpriteRef(stand_a, 999)).toBeNull();
  });
});

describe('getFrameAt', () => {
  it('returns the FrameContract at the given index', () => {
    const frame = getFrameAt(stand_a, 0);
    expect(frame).not.toBeNull();
    expect(frame!.frameIndex).toBe(0);
    expect(frame!.actionId).toBe('stand_a');
  });

  it('returns null for out-of-range indices', () => {
    expect(getFrameAt(stand_a, -1)).toBeNull();
    expect(getFrameAt(stand_a, 999)).toBeNull();
  });
});

describe('findActionContract', () => {
  const contracts = new Map<string, Map<string, ActionContract>>();
  const ryoMap = new Map<string, ActionContract>();
  ryoMap.set('stand_a', stand_a);
  ryoMap.set('stand_c', stand_c);
  contracts.set('ryo', ryoMap);

  it('finds existing action contract', () => {
    const result = findActionContract(contracts, 'ryo', 'stand_a');
    expect(result).not.toBeNull();
    expect(result!.actionId).toBe('stand_a');
  });

  it('returns null for unknown action', () => {
    expect(findActionContract(contracts, 'ryo', 'NONEXISTENT')).toBeNull();
  });

  it('returns null for unknown character', () => {
    expect(findActionContract(contracts, 'kyo', 'stand_a')).toBeNull();
  });

  it('returns null for empty contracts map', () => {
    expect(findActionContract(new Map(), 'ryo', 'stand_a')).toBeNull();
  });
});

describe('phaseFrameToAbsolute', () => {
  it('maps startup phase frames correctly', () => {
    // stand_a: startup=6
    expect(phaseFrameToAbsolute(stand_a, 'startup', 0)).toBe(0);
    expect(phaseFrameToAbsolute(stand_a, 'startup', 3)).toBe(3);
    expect(phaseFrameToAbsolute(stand_a, 'startup', 5)).toBe(5);
  });

  it('maps active phase frames correctly', () => {
    // stand_a: startup=6, active=3
    expect(phaseFrameToAbsolute(stand_a, 'active', 0)).toBe(6);
    expect(phaseFrameToAbsolute(stand_a, 'active', 1)).toBe(7);
    expect(phaseFrameToAbsolute(stand_a, 'active', 2)).toBe(8);
  });

  it('maps recovery phase frames correctly', () => {
    // stand_a: startup=6, active=3, recovery=5
    expect(phaseFrameToAbsolute(stand_a, 'recovery', 0)).toBe(9);
    expect(phaseFrameToAbsolute(stand_a, 'recovery', 1)).toBe(10);
    expect(phaseFrameToAbsolute(stand_a, 'recovery', 4)).toBe(13);
  });

  it('handles stand_c phase mapping', () => {
    // stand_c: startup=7, active=3, recovery=20
    expect(phaseFrameToAbsolute(stand_c, 'startup', 0)).toBe(0);
    expect(phaseFrameToAbsolute(stand_c, 'active', 0)).toBe(7);
    expect(phaseFrameToAbsolute(stand_c, 'recovery', 0)).toBe(10);
    expect(phaseFrameToAbsolute(stand_c, 'recovery', 19)).toBe(29);
  });
});
