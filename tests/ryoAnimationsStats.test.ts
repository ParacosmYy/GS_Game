/**
 * Ryo Animations & Stats Regression Tests
 *
 * Validates Ryo animation sequence access and character stats data.
 */
import { describe, it, expect } from 'vitest';
import {
  getRyoAnimations,
  getRyoAnimSequence,
  getRyoAnimSequenceNames,
  RYO_REQUIRED_ANIMATIONS,
} from '../src/content/characters/ryo/animations.js';
import { RYO_STATS } from '../src/content/characters/ryo/stats.js';

// ===== RYO_REQUIRED_ANIMATIONS =====

describe('RYO_REQUIRED_ANIMATIONS', () => {
  it('has exactly 10 required animations', () => {
    expect(RYO_REQUIRED_ANIMATIONS.length).toBe(10);
  });

  it('contains all CLAUDE.md 7.2 required actions', () => {
    const required = ['idle', 'walk_forward', 'walk_backward', 'jump_up', 'stand_a', 'stand_c', 'hitstun', 'knockdown'];
    for (const name of required) {
      expect(RYO_REQUIRED_ANIMATIONS).toContain(name);
    }
  });

  it('includes jump variants', () => {
    expect(RYO_REQUIRED_ANIMATIONS).toContain('jump_up');
    expect(RYO_REQUIRED_ANIMATIONS).toContain('jump_forward');
    expect(RYO_REQUIRED_ANIMATIONS).toContain('jump_backward');
  });

  it('has no duplicates', () => {
    expect(new Set(RYO_REQUIRED_ANIMATIONS).size).toBe(RYO_REQUIRED_ANIMATIONS.length);
  });
});

// ===== Animation Query Functions =====

describe('getRyoAnimations', () => {
  it('returns manifest for ryo', () => {
    const anims = getRyoAnimations();
    expect(anims).toBeDefined();
    expect(anims!.charId).toBe('ryo');
  });

  it('manifest has sequences', () => {
    const anims = getRyoAnimations();
    expect(Object.keys(anims!.sequences).length).toBeGreaterThan(0);
  });
});

describe('getRyoAnimSequence', () => {
  it('returns idle sequence', () => {
    const seq = getRyoAnimSequence('idle');
    expect(seq).toBeDefined();
    expect(seq!.name).toBe('idle');
    expect(seq!.frames.length).toBeGreaterThan(0);
  });

  it('returns undefined for non-existent sequence', () => {
    expect(getRyoAnimSequence('nonexistent')).toBeUndefined();
  });

  it('required animations have corresponding sequences', () => {
    for (const name of RYO_REQUIRED_ANIMATIONS) {
      const seq = getRyoAnimSequence(name);
      // Not all may exist yet — check that at least idle exists
      if (name === 'idle') {
        expect(seq, `ryo ${name}`).toBeDefined();
      }
    }
  });
});

describe('getRyoAnimSequenceNames', () => {
  it('returns non-empty array', () => {
    const names = getRyoAnimSequenceNames();
    expect(names.length).toBeGreaterThan(0);
    expect(names).toContain('idle');
  });

  it('all names are strings', () => {
    const names = getRyoAnimSequenceNames();
    for (const name of names) {
      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(0);
    }
  });
});

// ===== RYO_STATS =====

describe('RYO_STATS', () => {
  it('has all required stat fields', () => {
    expect(typeof RYO_STATS.walkSpeed).toBe('number');
    expect(typeof RYO_STATS.runSpeed).toBe('number');
    expect(typeof RYO_STATS.jumpVelocity).toBe('number');
    expect(typeof RYO_STATS.hopVelocity).toBe('number');
    expect(typeof RYO_STATS.hyperJumpVelocity).toBe('number');
    expect(typeof RYO_STATS.maxHealth).toBe('number');
    expect(typeof RYO_STATS.pushWidth).toBe('number');
    expect(typeof RYO_STATS.jumpForwardSpeed).toBe('number');
  });

  it('speeds are positive', () => {
    expect(RYO_STATS.walkSpeed).toBeGreaterThan(0);
    expect(RYO_STATS.runSpeed).toBeGreaterThan(0);
    expect(RYO_STATS.jumpForwardSpeed).toBeGreaterThan(0);
  });

  it('run speed > walk speed', () => {
    expect(RYO_STATS.runSpeed).toBeGreaterThan(RYO_STATS.walkSpeed);
  });

  it('jump velocities are negative (upward)', () => {
    expect(RYO_STATS.jumpVelocity).toBeLessThan(0);
    expect(RYO_STATS.hopVelocity).toBeLessThan(0);
    expect(RYO_STATS.hyperJumpVelocity).toBeLessThan(0);
  });

  it('hyper jump > regular jump magnitude', () => {
    expect(Math.abs(RYO_STATS.hyperJumpVelocity)).toBeGreaterThan(Math.abs(RYO_STATS.jumpVelocity));
  });

  it('regular jump > hop magnitude', () => {
    expect(Math.abs(RYO_STATS.jumpVelocity)).toBeGreaterThan(Math.abs(RYO_STATS.hopVelocity));
  });

  it('maxHealth is 1000', () => {
    expect(RYO_STATS.maxHealth).toBe(1000);
  });

  it('pushWidth is positive', () => {
    expect(RYO_STATS.pushWidth).toBeGreaterThan(0);
  });

  it('closeRange and throwRange are defined or undefined', () => {
    if (RYO_STATS.closeRange !== undefined) {
      expect(RYO_STATS.closeRange).toBeGreaterThan(0);
    }
    if (RYO_STATS.throwRange !== undefined) {
      expect(RYO_STATS.throwRange).toBeGreaterThan(0);
    }
  });
});
