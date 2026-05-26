/**
 * Frame Contract — frameContract.ts 单元测试
 *
 * 自包含测试：所有 mock 数据内联定义，不依赖实际角色 manifest 文件。
 */

import { describe, it, expect } from 'vitest';
import {
  // Types (re-exported from module)
  type FrameContract,
  type ActionContract,
  type CancelWindow,
  type FrameCollision,
  type FrameEventTag,
  type FrameContractManifest,
  // Functions
  getActionContract,
  getActionIds,
  isCancelPoint,
  getFrameEvents,
  getFrameCollision,
  validateActionAlignment,
} from '../src/core/frameContract.js';
import { FighterState } from '../src/core/types.js';

// ===== Helper: build a minimal FrameContract =====
function makeFrame(
  characterId: string,
  actionId: string,
  frameIndex: number,
  opts?: {
    collision?: FrameCollision | null;
    eventTags?: FrameEventTag[];
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
      duration: 2,
    },
    collision: opts?.collision ?? null,
    eventTags: opts?.eventTags ?? [],
  };
}

// ===== Helper: build an ActionContract =====
function makeActionContract(
  characterId: string,
  actionId: string,
  opts?: {
    startup?: number;
    active?: number;
    recovery?: number;
    cancelWindows?: CancelWindow[];
    frames?: FrameContract[];
  },
): ActionContract {
  const startup = opts?.startup ?? 3;
  const active = opts?.active ?? 2;
  const recovery = opts?.recovery ?? 5;
  const totalFrames = startup + active + recovery;

  const frames =
    opts?.frames ??
    Array.from({ length: totalFrames }, (_, i) =>
      makeFrame(characterId, actionId, i),
    );

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
    cancelWindows: opts?.cancelWindows ?? [],
    feedbackTierOverride: null,
  };
}

// ===== Helper: build a manifest =====
function makeManifest(
  actions: ActionContract[],
  characterId: string,
): FrameContractManifest {
  const actionMap = new Map<string, ActionContract>();
  for (const a of actions) {
    actionMap.set(a.actionId, a);
  }
  const charMap = new Map<string, { characterId: string; actions: Map<string, ActionContract> }>();
  charMap.set(characterId, { characterId, actions: actionMap });
  return { version: 1, characters: charMap };
}

// ===== Fixtures =====
const CHARACTER_ID = 'ryo';
const standA = makeActionContract(CHARACTER_ID, 'STAND_A', {
  startup: 4,
  active: 3,
  recovery: 6,
  cancelWindows: [
    {
      frames: [5, 7],
      targetTypes: ['special', 'super'],
      requiresHit: false,
      maxOnly: false,
    },
    {
      frames: [8, 10],
      targetTypes: ['special'],
      requiresHit: true,
      maxOnly: false,
    },
    {
      frames: [3, 12],
      targetTypes: ['any'],
      requiresHit: false,
      maxOnly: true,
    },
  ],
});

const standC = makeActionContract(CHARACTER_ID, 'STAND_C', {
  startup: 6,
  active: 4,
  recovery: 8,
});

// Stand_A with custom event tags and collision on specific frames
const standAWithDetails = makeActionContract(CHARACTER_ID, 'STAND_A_DETAIL', {
  startup: 4,
  active: 3,
  recovery: 6,
  frames: Array.from({ length: 13 }, (_, i) => {
    const tags: FrameEventTag[] = [];
    const collision: FrameCollision | null =
      i >= 4 && i < 7
        ? {
            hitboxes: [{ ox: 30, oy: -40, w: 50, h: 20 }],
            hurtboxOverride: null,
            throwBoxes: [],
          }
        : null;

    if (i === 0) tags.push('swing');
    if (i === 4) tags.push('hit');
    if (i === 12) tags.push('land');
    if (i === 6) tags.push('cancel_point');

    return makeFrame(CHARACTER_ID, 'STAND_A_DETAIL', i, {
      collision,
      eventTags: tags,
    });
  }),
});

const manifest = makeManifest([standA, standC, standAWithDetails], CHARACTER_ID);

// ================================================================
// Tests
// ================================================================

describe('FrameContract type structure', () => {
  it('exports FrameContract with required fields', () => {
    const frame: FrameContract = makeFrame('ryo', 'idle', 0);
    expect(frame.characterId).toBe('ryo');
    expect(frame.actionId).toBe('idle');
    expect(frame.frameIndex).toBe(0);
    expect(frame.sprite).toBeDefined();
    expect(frame.sprite.spriteRef).toBe('idle_0');
    expect(frame.sprite.anchor).toEqual({ x: 0, y: 0 });
    expect(frame.sprite.offset).toEqual({ x: 0, y: 0 });
    expect(frame.sprite.duration).toBe(2);
    expect(frame.collision).toBeNull();
    expect(frame.eventTags).toEqual([]);
  });

  it('exports ActionContract with phase fields', () => {
    const action: ActionContract = makeActionContract('ryo', 'STAND_A');
    expect(action.startup).toBe(3);
    expect(action.active).toBe(2);
    expect(action.recovery).toBe(5);
    expect(action.totalFrames).toBe(10);
    expect(action.frames).toHaveLength(10);
    expect(action.cancelWindows).toEqual([]);
    expect(action.hitLevel).toBe('MID');
    expect(action.knockdown).toBe(false);
  });

  it('exports CancelWindow with required fields', () => {
    const cw: CancelWindow = {
      frames: [2, 5],
      targetTypes: ['special', 'super'],
      requiresHit: false,
      maxOnly: false,
    };
    expect(cw.frames).toHaveLength(2);
    expect(cw.targetTypes).toContain('special');
    expect(cw.requiresHit).toBe(false);
    expect(cw.maxOnly).toBe(false);
  });
});

describe('getActionContract', () => {
  it('returns the action contract for a valid characterId + actionId', () => {
    const result = getActionContract(manifest, CHARACTER_ID, 'STAND_A');
    expect(result).not.toBeNull();
    expect(result!.actionId).toBe('STAND_A');
    expect(result!.characterId).toBe(CHARACTER_ID);
    expect(result!.startup).toBe(4);
    expect(result!.active).toBe(3);
    expect(result!.recovery).toBe(6);
  });

  it('returns null for unknown actionId', () => {
    const result = getActionContract(manifest, CHARACTER_ID, 'NONEXISTENT');
    expect(result).toBeNull();
  });

  it('returns null for unknown characterId', () => {
    const result = getActionContract(manifest, 'unknown_char', 'STAND_A');
    expect(result).toBeNull();
  });

  it('returns different contracts for different actions of the same character', () => {
    const a = getActionContract(manifest, CHARACTER_ID, 'STAND_A');
    const c = getActionContract(manifest, CHARACTER_ID, 'STAND_C');
    expect(a!.startup).toBe(4);
    expect(c!.startup).toBe(6);
    expect(a!.totalFrames).toBe(13);
    expect(c!.totalFrames).toBe(18);
  });
});

describe('getActionIds', () => {
  it('returns all action IDs for a known character', () => {
    const ids = getActionIds(manifest, CHARACTER_ID);
    expect(ids).toContain('STAND_A');
    expect(ids).toContain('STAND_C');
    expect(ids).toContain('STAND_A_DETAIL');
    expect(ids).toHaveLength(3);
  });

  it('returns empty array for unknown character', () => {
    const ids = getActionIds(manifest, 'nonexistent');
    expect(ids).toEqual([]);
  });

  it('returns action IDs as strings', () => {
    const ids = getActionIds(manifest, CHARACTER_ID);
    for (const id of ids) {
      expect(typeof id).toBe('string');
    }
  });
});

describe('isCancelPoint', () => {
  it('returns CancelWindow when frame is within cancel range', () => {
    // standA first cancel window: frames [5, 7], no hit required, not max-only
    const result = isCancelPoint(standA, 6, false, false);
    expect(result).not.toBeNull();
    expect(result!.frames).toEqual([5, 7]);
    expect(result!.targetTypes).toContain('special');
  });

  it('returns CancelWindow for the first frame of cancel range', () => {
    const result = isCancelPoint(standA, 5, false, false);
    expect(result).not.toBeNull();
    expect(result!.frames[0]).toBe(5);
  });

  it('returns CancelWindow for the last frame of cancel range', () => {
    const result = isCancelPoint(standA, 7, false, false);
    expect(result).not.toBeNull();
    expect(result!.frames[1]).toBe(7);
  });

  it('returns null when frame is outside all cancel ranges', () => {
    // Frame 0 is before all cancel windows
    const result = isCancelPoint(standA, 0, false, false);
    expect(result).toBeNull();
  });

  it('returns null when frame is past all cancel ranges', () => {
    // Frame 12 is outside first two windows; third window [3,12] is maxOnly=true
    const result = isCancelPoint(standA, 12, false, false);
    expect(result).toBeNull();
  });

  it('returns null when requiresHit=true and hitConfirmed=false', () => {
    // Second cancel window: [8,10], requiresHit=true
    const result = isCancelPoint(standA, 9, false, false);
    expect(result).toBeNull();
  });

  it('returns CancelWindow when requiresHit=true and hitConfirmed=true', () => {
    const result = isCancelPoint(standA, 9, true, false);
    expect(result).not.toBeNull();
    expect(result!.frames).toEqual([8, 10]);
    expect(result!.requiresHit).toBe(true);
  });

  it('returns null when maxOnly=true and inMaxMode=false', () => {
    // Third cancel window: [3, 12], maxOnly=true
    const result = isCancelPoint(standA, 4, false, false);
    // Frame 4 is within [3,12] but maxOnly=true; first window [5,7] doesn't cover 4
    // So only the maxOnly window covers it, and we're not in max mode
    expect(result).toBeNull();
  });

  it('returns CancelWindow when maxOnly=true and inMaxMode=true', () => {
    const result = isCancelPoint(standA, 4, false, true);
    expect(result).not.toBeNull();
    expect(result!.maxOnly).toBe(true);
    expect(result!.frames).toEqual([3, 12]);
  });

  it('prefers first matching cancel window (earliest in list)', () => {
    // Frame 6 is in window [5,7] (index 0) and also in [3,12] (index 2, maxOnly)
    // With hitConfirmed=false, inMaxMode=false: only [5,7] matches
    const result = isCancelPoint(standA, 6, false, false);
    expect(result).not.toBeNull();
    expect(result!.frames).toEqual([5, 7]);
  });

  it('returns null for action with no cancel windows', () => {
    const result = isCancelPoint(standC, 5, false, false);
    expect(result).toBeNull();
  });
});

describe('getFrameEvents', () => {
  it('returns event tags for a frame that has them', () => {
    // Frame 0 has 'swing'
    const events = getFrameEvents(standAWithDetails, 0);
    expect(events).toContain('swing');
    expect(events).toHaveLength(1);
  });

  it('returns multiple event tags for a frame with multiple', () => {
    // Frame 4 has 'hit'
    const events = getFrameEvents(standAWithDetails, 4);
    expect(events).toContain('hit');
  });

  it('returns empty array for a frame with no events', () => {
    const events = getFrameEvents(standAWithDetails, 1);
    expect(events).toEqual([]);
  });

  it('returns cancel_point tag at the correct frame', () => {
    // Frame 6 has 'cancel_point'
    const events = getFrameEvents(standAWithDetails, 6);
    expect(events).toContain('cancel_point');
  });

  it('returns empty array for negative frame index', () => {
    const events = getFrameEvents(standAWithDetails, -1);
    expect(events).toEqual([]);
  });

  it('returns empty array for frame index beyond frames length', () => {
    const events = getFrameEvents(standAWithDetails, 999);
    expect(events).toEqual([]);
  });
});

describe('getFrameCollision', () => {
  it('returns collision for an active frame with hitboxes', () => {
    // Frames 4-6 have collision (active frames)
    const collision = getFrameCollision(standAWithDetails, 4);
    expect(collision).not.toBeNull();
    expect(collision!.hitboxes).toHaveLength(1);
    expect(collision!.hitboxes[0]).toEqual({ ox: 30, oy: -40, w: 50, h: 20 });
    expect(collision!.hurtboxOverride).toBeNull();
    expect(collision!.throwBoxes).toEqual([]);
  });

  it('returns null for a frame with no collision', () => {
    // Frames 0-3 are startup, no collision
    const collision = getFrameCollision(standAWithDetails, 0);
    expect(collision).toBeNull();
  });

  it('returns null for recovery frames', () => {
    // Frames 7+ are recovery
    const collision = getFrameCollision(standAWithDetails, 10);
    expect(collision).toBeNull();
  });

  it('returns null for negative frame index', () => {
    const collision = getFrameCollision(standAWithDetails, -1);
    expect(collision).toBeNull();
  });

  it('returns null for frame index beyond frames length', () => {
    const collision = getFrameCollision(standAWithDetails, 999);
    expect(collision).toBeNull();
  });

  it('returns collision with hurtboxOverride when present', () => {
    const customFrame = makeFrame('ryo', 'test', 0, {
      collision: {
        hitboxes: [{ ox: 10, oy: -20, w: 30, h: 40 }],
        hurtboxOverride: { ox: -5, oy: -50, w: 40, h: 50 },
        throwBoxes: [],
      },
    });
    const customAction = makeActionContract('ryo', 'test', {
      startup: 1,
      active: 1,
      recovery: 1,
      frames: [customFrame],
    });
    const collision = getFrameCollision(customAction, 0);
    expect(collision).not.toBeNull();
    expect(collision!.hurtboxOverride).toEqual({ ox: -5, oy: -50, w: 40, h: 50 });
  });
});

describe('validateActionAlignment', () => {
  it('returns valid=true when all phases match', () => {
    // standA: startup=4, active=3, recovery=6, totalFrames=13
    const result = validateActionAlignment(standA, 4, 3, 6);
    expect(result.valid).toBe(true);
    expect(result.issues).toEqual([]);
  });

  it('returns valid=false with issue for mismatched startup', () => {
    const result = validateActionAlignment(standA, 5, 3, 6);
    expect(result.valid).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.stringContaining('startup mismatch'),
      ]),
    );
    expect(result.issues[0]).toContain('contract=4');
    expect(result.issues[0]).toContain('frameData=5');
  });

  it('returns valid=false with issue for mismatched active', () => {
    const result = validateActionAlignment(standA, 4, 5, 6);
    expect(result.valid).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.stringContaining('active mismatch'),
      ]),
    );
  });

  it('returns valid=false with issue for mismatched recovery', () => {
    const result = validateActionAlignment(standA, 4, 3, 10);
    expect(result.valid).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.stringContaining('recovery mismatch'),
      ]),
    );
  });

  it('returns valid=false with issue for mismatched totalFrames', () => {
    // totalFrames should be startup+active+recovery = 13
    // But if we pass startup=4, active=3, recovery=6 => expected=13
    // and contract.totalFrames=13, so this would pass for totals.
    // To test totalFrames mismatch, create an action where totalFrames != sum
    const misalignedAction: ActionContract = {
      ...standA,
      totalFrames: 99, // wrong total
    };
    const result = validateActionAlignment(misalignedAction, 4, 3, 6);
    expect(result.valid).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.stringContaining('totalFrames mismatch'),
      ]),
    );
  });

  it('returns valid=false with issue for mismatched frame count', () => {
    // Create an action where frames.length != totalFrames
    const misalignedAction: ActionContract = {
      ...standA,
      frames: Array.from({ length: 5 }, (_, i) =>
        makeFrame(CHARACTER_ID, 'STAND_A', i),
      ),
    };
    const result = validateActionAlignment(misalignedAction, 4, 3, 6);
    expect(result.valid).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.stringContaining('frame count mismatch'),
      ]),
    );
  });

  it('accumulates multiple issues when several fields mismatch', () => {
    const result = validateActionAlignment(standA, 99, 99, 99);
    expect(result.valid).toBe(false);
    // startup, active, recovery all mismatch, plus totalFrames and frame count
    expect(result.issues.length).toBeGreaterThanOrEqual(3);
  });

  it('validates stand_C alignment correctly', () => {
    // standC: startup=6, active=4, recovery=8, totalFrames=18
    const result = validateActionAlignment(standC, 6, 4, 8);
    expect(result.valid).toBe(true);
    expect(result.issues).toEqual([]);
  });
});
