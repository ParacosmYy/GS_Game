/**
 * AnimationBlender — unit tests
 *
 * Tests the blend lifecycle: start, progress, completion, cancellation,
 * position interpolation, and transition profile lookups.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  AnimationBlender,
  getBlendDuration,
  getFighterBlender,
  resetAllBlenders,
} from '../src/rendering/animationBlender.js';

describe('AnimationBlender', () => {
  let blender: AnimationBlender;

  beforeEach(() => {
    blender = new AnimationBlender();
  });

  // ── Start ──

  describe('startBlend', () => {
    it('starts a blend with correct initial state', () => {
      blender.startBlend('IDLE', 0, 'WALK', 4);
      const state = blender.getBlendState();
      expect(state).not.toBeNull();
      expect(state!.fromAction).toBe('IDLE');
      expect(state!.toAction).toBe('WALK');
      expect(state!.blendProgress).toBe(0);
      expect(state!.blendDuration).toBe(4);
    });

    it('does not start a blend when duration is 0', () => {
      blender.startBlend('IDLE', 0, 'HITSTUN', 0);
      expect(blender.isBlending()).toBe(false);
      expect(blender.getBlendState()).toBeNull();
    });

    it('replaces any existing blend when starting a new one', () => {
      blender.startBlend('IDLE', 0, 'WALK', 4);
      blender.startBlend('WALK', 2, 'RUN', 3);
      const state = blender.getBlendState();
      expect(state!.fromAction).toBe('WALK');
      expect(state!.toAction).toBe('RUN');
      expect(state!.blendDuration).toBe(3);
    });
  });

  // ── Progress ──

  describe('update', () => {
    it('advances blend progress by 1/duration per tick', () => {
      blender.startBlend('IDLE', 0, 'WALK', 4);
      expect(blender.getBlendState()!.blendProgress).toBe(0);

      blender.update();
      expect(blender.getBlendState()!.blendProgress).toBeCloseTo(0.25);

      blender.update();
      expect(blender.getBlendState()!.blendProgress).toBeCloseTo(0.5);
    });

    it('completes and clears the blend after duration ticks', () => {
      blender.startBlend('IDLE', 0, 'WALK', 3);
      blender.update(); // progress = 1/3
      blender.update(); // progress = 2/3
      expect(blender.isBlending()).toBe(true);
      blender.update(); // progress = 1.0 -> blend complete
      expect(blender.isBlending()).toBe(false);
      expect(blender.getBlendState()).toBeNull();
    });

    it('does nothing when no blend is active', () => {
      expect(() => blender.update()).not.toThrow();
      expect(blender.isBlending()).toBe(false);
    });
  });

  // ── Cancel ──

  describe('cancel', () => {
    it('clears an active blend', () => {
      blender.startBlend('IDLE', 0, 'WALK', 4);
      expect(blender.isBlending()).toBe(true);
      blender.cancel();
      expect(blender.isBlending()).toBe(false);
      expect(blender.getBlendState()).toBeNull();
    });

    it('is a no-op when no blend is active', () => {
      expect(() => blender.cancel()).not.toThrow();
    });
  });

  // ── Interpolation ──

  describe('interpolate', () => {
    it('returns target position when not blending', () => {
      const result = blender.interpolate(
        { offsetX: 10, offsetY: 5 },
        { offsetX: 20, offsetY: 15 },
      );
      expect(result.offsetX).toBe(20);
      expect(result.offsetY).toBe(15);
    });

    it('returns source position at blend start (t=0)', () => {
      blender.startBlend('IDLE', 0, 'WALK', 4);
      const result = blender.interpolate(
        { offsetX: 10, offsetY: 5 },
        { offsetX: 20, offsetY: 15 },
      );
      expect(result.offsetX).toBeCloseTo(10);
      expect(result.offsetY).toBeCloseTo(5);
    });

    it('returns midpoint at 50% progress', () => {
      blender.startBlend('IDLE', 0, 'WALK', 4);
      blender.update(); // progress = 0.25
      blender.update(); // progress = 0.50
      const result = blender.interpolate(
        { offsetX: 0, offsetY: 0 },
        { offsetX: 10, offsetY: 20 },
      );
      expect(result.offsetX).toBeCloseTo(5);
      expect(result.offsetY).toBeCloseTo(10);
    });

    it('returns near-target position at high progress', () => {
      blender.startBlend('IDLE', 0, 'WALK', 4);
      blender.update(); // 0.25
      blender.update(); // 0.50
      blender.update(); // 0.75
      const result = blender.interpolate(
        { offsetX: 0, offsetY: 0 },
        { offsetX: 100, offsetY: 100 },
      );
      expect(result.offsetX).toBeCloseTo(75);
      expect(result.offsetY).toBeCloseTo(75);
    });

    it('handles negative offsets correctly', () => {
      blender.startBlend('WALK', 0, 'IDLE', 4);
      blender.update(); // progress = 0.25
      const result = blender.interpolate(
        { offsetX: -10, offsetY: -5 },
        { offsetX: 10, offsetY: 5 },
      );
      expect(result.offsetX).toBeCloseTo(-5);
      expect(result.offsetY).toBeCloseTo(-2.5);
    });

    it('handles zero-span interpolation (source == target)', () => {
      blender.startBlend('IDLE', 0, 'WALK', 4);
      blender.update();
      const result = blender.interpolate(
        { offsetX: 5, offsetY: 5 },
        { offsetX: 5, offsetY: 5 },
      );
      expect(result.offsetX).toBe(5);
      expect(result.offsetY).toBe(5);
    });
  });

  // ── startBlendFromProfile ──

  describe('startBlendFromProfile', () => {
    it('returns true and starts blend for blendable transitions', () => {
      const started = blender.startBlendFromProfile('IDLE', 0, 'WALK');
      expect(started).toBe(true);
      expect(blender.isBlending()).toBe(true);
      expect(blender.getBlendState()!.blendDuration).toBe(4);
    });

    it('returns false and does not start for instant transitions', () => {
      const started = blender.startBlendFromProfile('IDLE', 0, 'HITSTUN');
      expect(started).toBe(false);
      expect(blender.isBlending()).toBe(false);
    });

    it('returns false for attack transitions', () => {
      expect(blender.startBlendFromProfile('IDLE', 0, 'STAND_ATTACK')).toBe(false);
      expect(blender.isBlending()).toBe(false);
    });
  });
});

// ── Transition profile tests ──

describe('getBlendDuration', () => {
  // Blend transitions
  it('IDLE -> WALK: 4 ticks', () => {
    expect(getBlendDuration('IDLE', 'WALK')).toBe(4);
  });

  it('WALK -> IDLE: 4 ticks', () => {
    expect(getBlendDuration('WALK', 'IDLE')).toBe(4);
  });

  it('IDLE -> JUMP: 3 ticks', () => {
    expect(getBlendDuration('IDLE', 'JUMP')).toBe(3);
  });

  it('JUMP -> IDLE (landing): 4 ticks', () => {
    expect(getBlendDuration('JUMP', 'IDLE')).toBe(4);
  });

  it('WALK -> CROUCH: 3 ticks', () => {
    expect(getBlendDuration('WALK', 'CROUCH')).toBe(3);
  });

  it('IDLE -> CROUCH: 3 ticks', () => {
    expect(getBlendDuration('IDLE', 'CROUCH')).toBe(3);
  });

  it('IDLE -> RUN: 3 ticks', () => {
    expect(getBlendDuration('IDLE', 'RUN')).toBe(3);
  });

  it('RUN -> IDLE: 3 ticks', () => {
    expect(getBlendDuration('RUN', 'IDLE')).toBe(3);
  });

  it('HOP -> IDLE (landing): 4 ticks', () => {
    expect(getBlendDuration('HOP', 'IDLE')).toBe(4);
  });

  it('HYPER_JUMP -> IDLE (landing): 4 ticks', () => {
    expect(getBlendDuration('HYPER_JUMP', 'IDLE')).toBe(4);
  });

  it('JUMP -> CROUCH (landing): 3 ticks', () => {
    expect(getBlendDuration('JUMP', 'CROUCH')).toBe(3);
  });

  // Instant transitions (duration = 0)
  it('any -> HITSTUN: instant (0)', () => {
    expect(getBlendDuration('IDLE', 'HITSTUN')).toBe(0);
    expect(getBlendDuration('WALK', 'HITSTUN')).toBe(0);
    expect(getBlendDuration('JUMP', 'HITSTUN')).toBe(0);
  });

  it('any -> KNOCKDOWN: instant (0)', () => {
    expect(getBlendDuration('IDLE', 'KNOCKDOWN')).toBe(0);
    expect(getBlendDuration('HITSTUN', 'KNOCKDOWN')).toBe(0);
  });

  it('any -> STAND_ATTACK: instant (0)', () => {
    expect(getBlendDuration('IDLE', 'STAND_ATTACK')).toBe(0);
    expect(getBlendDuration('WALK', 'STAND_ATTACK')).toBe(0);
  });

  it('any -> CROUCH_ATTACK: instant (0)', () => {
    expect(getBlendDuration('IDLE', 'CROUCH_ATTACK')).toBe(0);
  });

  it('any -> AIR_ATTACK: instant (0)', () => {
    expect(getBlendDuration('JUMP', 'AIR_ATTACK')).toBe(0);
  });

  it('KNOCKDOWN -> IDLE (getup): instant (0)', () => {
    expect(getBlendDuration('KNOCKDOWN', 'IDLE')).toBe(0);
  });

  it('any -> ROLL: instant (0)', () => {
    expect(getBlendDuration('IDLE', 'ROLL')).toBe(0);
  });

  it('any -> BACKDASH: instant (0)', () => {
    expect(getBlendDuration('IDLE', 'BACKDASH')).toBe(0);
  });

  it('any -> BLOCK: 2 ticks', () => {
    expect(getBlendDuration('IDLE', 'BLOCK')).toBe(2);
  });

  it('BLOCK -> IDLE: 2 ticks', () => {
    expect(getBlendDuration('BLOCK', 'IDLE')).toBe(2);
  });

  it('CROUCH -> IDLE: 3 ticks', () => {
    expect(getBlendDuration('CROUCH', 'IDLE')).toBe(3);
  });

  it('CROUCH -> WALK: 3 ticks', () => {
    expect(getBlendDuration('CROUCH', 'WALK')).toBe(3);
  });
});

// ── Per-fighter blender manager ──

describe('getFighterBlender', () => {
  beforeEach(() => {
    resetAllBlenders();
  });

  it('returns a blender for a fighter index', () => {
    const b = getFighterBlender(0);
    expect(b).toBeInstanceOf(AnimationBlender);
  });

  it('returns the same blender for the same index', () => {
    const b1 = getFighterBlender(0);
    const b2 = getFighterBlender(0);
    expect(b1).toBe(b2);
  });

  it('returns different blenders for different indices', () => {
    const b0 = getFighterBlender(0);
    const b1 = getFighterBlender(1);
    expect(b0).not.toBe(b1);
  });

  it('resetAllBlenders clears all blenders', () => {
    const b0 = getFighterBlender(0);
    b0.startBlend('IDLE', 0, 'WALK', 4);
    resetAllBlenders();
    const b0New = getFighterBlender(0);
    // After reset, a new blender is created (not blending)
    expect(b0New.isBlending()).toBe(false);
  });
});

// ── Full blend lifecycle ──

describe('blend lifecycle', () => {
  it('complete IDLE->WALK->IDLE blend cycle', () => {
    const b = new AnimationBlender();

    // Start IDLE -> WALK blend (4 ticks)
    b.startBlendFromProfile('IDLE', 0, 'WALK');
    expect(b.isBlending()).toBe(true);

    // Advance through blend
    b.update();
    b.update();
    b.update();
    b.update();
    expect(b.isBlending()).toBe(false);

    // Now transition WALK -> IDLE (4 ticks)
    b.startBlendFromProfile('WALK', 0, 'IDLE');
    expect(b.isBlending()).toBe(true);
    expect(b.getBlendState()!.fromAction).toBe('WALK');
    expect(b.getBlendState()!.toAction).toBe('IDLE');

    b.update();
    b.update();
    b.update();
    b.update();
    expect(b.isBlending()).toBe(false);
  });

  it('attack cancels any active blend instantly', () => {
    const b = new AnimationBlender();
    b.startBlend('IDLE', 0, 'WALK', 4);
    expect(b.isBlending()).toBe(true);

    // Attack transition should not start a blend (instant)
    const started = b.startBlendFromProfile('WALK', 0, 'STAND_ATTACK');
    expect(started).toBe(false);
    expect(b.isBlending()).toBe(false);
  });

  it('position interpolation values through a full blend', () => {
    const b = new AnimationBlender();
    b.startBlend('IDLE', 0, 'WALK', 2);

    // At t=0: fully source
    let pos = b.interpolate({ offsetX: 0, offsetY: 0 }, { offsetX: 10, offsetY: 20 });
    expect(pos.offsetX).toBeCloseTo(0);
    expect(pos.offsetY).toBeCloseTo(0);

    // After 1 tick (t=0.5): midpoint
    b.update();
    pos = b.interpolate({ offsetX: 0, offsetY: 0 }, { offsetX: 10, offsetY: 20 });
    expect(pos.offsetX).toBeCloseTo(5);
    expect(pos.offsetY).toBeCloseTo(10);

    // After 2 ticks (t=1.0): blend complete, returns target
    b.update();
    pos = b.interpolate({ offsetX: 0, offsetY: 0 }, { offsetX: 10, offsetY: 20 });
    expect(pos.offsetX).toBeCloseTo(10);
    expect(pos.offsetY).toBeCloseTo(20);
  });
});
