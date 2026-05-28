/**
 * Sprite Pose Data Pure Functions Regression Tests
 *
 * Validates color manipulation functions, pose arrays, and style-based pose generation.
 * Only tests pure functions — not Canvas-dependent px/pxOutline.
 */
import { describe, it, expect } from 'vitest';
import {
  PW, PH, PIXEL,
  CHAR_VISUALS,
  getDefaultVisual,
  darken,
  lighten,
  IDLE_POSES,
  WALK_POSES,
  RUN_BASE,
  ATTACK_POSES,
  CROUCH_ATTACK_POSES,
  AIR_ATTACK_POSES,
  THROW_POSES,
  CROUCH_POSES,
  JUMP_POSES,
  HIT_POSES,
  BLOCK_POSES,
  getIdlePoses,
  getRunPoses,
  getJumpPoses,
  getHitPoses,
  getBlockPoses,
  type CharVisual,
  type Pose,
} from '../src/rendering/spritePoseData.js';

// ===== Constants =====

describe('Pixel constants', () => {
  it('PW = 120', () => expect(PW).toBe(120));
  it('PH = 200', () => expect(PH).toBe(200));
  it('PIXEL = 3', () => expect(PIXEL).toBe(3));
});

// ===== CHAR_VISUALS =====

describe('CHAR_VISUALS', () => {
  it('has entries for main characters', () => {
    for (const id of ['kyo', 'iori', 'ryo', 'terry', 'kim', 'leona', 'kdash', 'kula']) {
      expect(CHAR_VISUALS[id], `${id}`).toBeDefined();
    }
  });

  it('every entry has all required fields', () => {
    const required: (keyof CharVisual)[] = [
      'hairColor', 'skinColor', 'shirtColor', 'pantsColor', 'shoeColor', 'beltColor',
      'headW', 'bodyW', 'legLen', 'hairStyle', 'idleStyle',
    ];
    for (const [id, v] of Object.entries(CHAR_VISUALS)) {
      for (const field of required) {
        expect(v[field], `${id}.${field}`).toBeDefined();
      }
    }
  });

  it('all colors are valid hex', () => {
    const hexPattern = /^#[0-9a-fA-F]{6}$/;
    const colorFields: (keyof CharVisual)[] = ['hairColor', 'skinColor', 'shirtColor', 'pantsColor', 'shoeColor', 'beltColor'];
    for (const [id, v] of Object.entries(CHAR_VISUALS)) {
      for (const field of colorFields) {
        expect((v as any)[field], `${id}.${field}`).toMatch(hexPattern);
      }
    }
  });

  it('body dimensions are positive', () => {
    for (const [id, v] of Object.entries(CHAR_VISUALS)) {
      expect(v.headW, `${id} headW`).toBeGreaterThan(0);
      expect(v.bodyW, `${id} bodyW`).toBeGreaterThan(0);
      expect(v.legLen, `${id} legLen`).toBeGreaterThan(0);
    }
  });

  it('characters have different primary colors', () => {
    const colors = new Set(Object.values(CHAR_VISUALS).map(v => v.shirtColor));
    expect(colors.size).toBeGreaterThan(1);
  });
});

describe('getDefaultVisual', () => {
  it('returns kyo visual', () => {
    const v = getDefaultVisual();
    expect(v.hairColor).toBe(CHAR_VISUALS.kyo.hairColor);
    expect(v.idleStyle).toBe('confident');
  });
});

// ===== Color Functions =====

describe('darken', () => {
  it('darkens white to gray', () => {
    const result = darken('#ffffff', 0.5);
    expect(result).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(result).not.toBe('#ffffff');
  });

  it('darkens by default amount', () => {
    const result = darken('#ff0000');
    expect(result).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it('does not go below 0', () => {
    const result = darken('#000000', 1.0);
    expect(result).toBe('#000000');
  });

  it('produces darker color than input', () => {
    const input = '#888888';
    const result = darken(input, 0.5);
    const inputVal = parseInt(input.slice(1, 3), 16);
    const resultVal = parseInt(result.slice(1, 3), 16);
    expect(resultVal).toBeLessThanOrEqual(inputVal);
  });
});

describe('lighten', () => {
  it('lightens black to gray', () => {
    const result = lighten('#000000', 0.5);
    expect(result).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(result).not.toBe('#000000');
  });

  it('does not exceed 255', () => {
    const result = lighten('#ffffff', 1.0);
    expect(result).toBe('#ffffff');
  });

  it('produces lighter color than input', () => {
    const input = '#444444';
    const result = lighten(input, 0.5);
    const inputVal = parseInt(input.slice(1, 3), 16);
    const resultVal = parseInt(result.slice(1, 3), 16);
    expect(resultVal).toBeGreaterThanOrEqual(inputVal);
  });
});

// ===== Pose Arrays =====

function validatePoses(poses: Pose[], name: string) {
  expect(poses.length, `${name} count`).toBeGreaterThan(0);
  for (let i = 0; i < poses.length; i++) {
    const p = poses[i];
    expect(typeof p.headOff, `${name}[${i}].headOff`).toBe('number');
    expect(typeof p.bodyLean, `${name}[${i}].bodyLean`).toBe('number');
    expect(typeof p.armL, `${name}[${i}].armL`).toBe('number');
    expect(typeof p.armR, `${name}[${i}].armR`).toBe('number');
    expect(typeof p.legL, `${name}[${i}].legL`).toBe('number');
    expect(typeof p.legR, `${name}[${i}].legR`).toBe('number');
    expect(typeof p.crouch, `${name}[${i}].crouch`).toBe('boolean');
  }
}

describe('Pose arrays', () => {
  it('IDLE_POSES has 15 frames (breathing cycle)', () => {
    validatePoses(IDLE_POSES, 'IDLE');
    expect(IDLE_POSES.length).toBe(15);
  });

  it('WALK_POSES has valid poses', () => validatePoses(WALK_POSES, 'WALK'));
  it('RUN_BASE has valid poses', () => validatePoses(RUN_BASE, 'RUN'));
  it('ATTACK_POSES has valid poses', () => validatePoses(ATTACK_POSES, 'ATTACK'));
  it('CROUCH_ATTACK_POSES has valid poses', () => validatePoses(CROUCH_ATTACK_POSES, 'CROUCH_ATTACK'));
  it('AIR_ATTACK_POSES has valid poses', () => validatePoses(AIR_ATTACK_POSES, 'AIR_ATTACK'));
  it('THROW_POSES has valid poses', () => validatePoses(THROW_POSES, 'THROW'));
  it('CROUCH_POSES has valid poses', () => validatePoses(CROUCH_POSES, 'CROUCH'));
  it('JUMP_POSES has valid poses', () => validatePoses(JUMP_POSES, 'JUMP'));
  it('HIT_POSES has valid poses', () => validatePoses(HIT_POSES, 'HIT'));
  it('BLOCK_POSES has valid poses', () => validatePoses(BLOCK_POSES, 'BLOCK'));

  it('IDLE_POSES are not crouching', () => {
    for (const p of IDLE_POSES) {
      expect(p.crouch).toBe(false);
    }
  });

  it('CROUCH_POSES are crouching', () => {
    for (const p of CROUCH_POSES) {
      expect(p.crouch).toBe(true);
    }
  });

  it('JUMP_POSES have positive headOff (airborne)', () => {
    const hasAirborne = JUMP_POSES.some(p => p.headOff < 0);
    expect(hasAirborne).toBe(true);
  });
});

// ===== Style-based Pose Generators =====

describe('getIdlePoses', () => {
  const styles = ['confident', 'lazy', 'fighter', 'martial', 'tense', 'alert', 'rebel', 'cute', 'karate'];

  it('returns same length as base IDLE_POSES for all styles', () => {
    for (const style of styles) {
      const poses = getIdlePoses(style);
      expect(poses.length, `${style} idle poses`).toBe(IDLE_POSES.length);
    }
  });

  it('returns valid poses for all styles', () => {
    for (const style of styles) {
      validatePoses(getIdlePoses(style), `idle/${style}`);
    }
  });

  it('default returns base IDLE_POSES', () => {
    const poses = getIdlePoses('unknown');
    expect(poses).toEqual(IDLE_POSES);
  });

  it('confident style modifies bodyLean', () => {
    const poses = getIdlePoses('confident');
    const hasLean = poses.some(p => p.bodyLean !== 0);
    expect(hasLean).toBe(true);
  });
});

describe('getRunPoses', () => {
  it('returns valid poses for karate style', () => {
    validatePoses(getRunPoses('karate'), 'run/karate');
  });

  it('returns valid poses for confident style', () => {
    validatePoses(getRunPoses('confident'), 'run/confident');
  });
});

describe('getJumpPoses', () => {
  it('returns valid poses for karate style', () => {
    validatePoses(getJumpPoses('karate'), 'jump/karate');
  });
});

describe('getHitPoses', () => {
  it('returns valid poses for karate style', () => {
    validatePoses(getHitPoses('karate'), 'hit/karate');
  });
});

describe('getBlockPoses', () => {
  it('returns valid poses for karate style', () => {
    validatePoses(getBlockPoses('karate'), 'block/karate');
  });
});
