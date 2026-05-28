/**
 * Iori Pixel Frame Data Structural Tests
 *
 * Validates all Iori sprite frame arrays exported from rendering/sprites/iori/.
 */
import { describe, it, expect } from 'vitest';
import type { PixelFrame } from '../src/rendering/sprites/kyo/kyoIdleFrames.js';
import { IORI_IDLE_FRAMES } from '../src/rendering/sprites/iori/ioriIdleFrames.js';
import { IORI_WALK_FORWARD_FRAMES, IORI_WALK_BACKWARD_FRAMES } from '../src/rendering/sprites/iori/ioriWalkFrames.js';
import { IORI_JUMP_FRAMES } from '../src/rendering/sprites/iori/ioriJumpFrames.js';
import { IORI_CROUCH_FRAMES } from '../src/rendering/sprites/iori/ioriCrouchFrames.js';
import { IORI_HURT_FRAMES, IORI_KNOCKDOWN_FRAMES, IORI_BLOCK_FRAMES } from '../src/rendering/sprites/iori/ioriDamageFrames.js';
import { IORI_DIZZY_FRAMES } from '../src/rendering/sprites/iori/ioriDizzyFrames.js';
import { IORI_THROW_FRAMES } from '../src/rendering/sprites/iori/ioriThrowFrames.js';
import { IORI_WIN_POSE, IORI_WIN_LAUGH } from '../src/rendering/sprites/iori/ioriWinFrames.js';
import { IORI_STAND_A_FRAMES, IORI_STAND_C_FRAMES } from '../src/rendering/sprites/iori/ioriAttackFrames.js';
import { IORI_STAND_B_FRAMES, IORI_STAND_D_FRAMES } from '../src/rendering/sprites/iori/ioriKickFrames.js';
import { IORI_ONIYAKI_FRAMES, IORI_ONIYAKI_C_FRAMES, IORI_YAMIBARAI_FRAMES, IORI_AOIHANA_FRAMES } from '../src/rendering/sprites/iori/ioriSpecialFrames.js';
import { IORI_RUN_FRAMES, IORI_BACKDASH_FRAMES, IORI_ROLL_FRAMES, IORI_GUARD_CRUSH_FRAMES } from '../src/rendering/sprites/iori/ioriMovementFrames.js';

// ===== Shared Validators =====

function validatePixelFrame(frame: PixelFrame, label: string) {
  expect(frame.width, `${label}.width > 0`).toBeGreaterThan(0);
  expect(frame.height, `${label}.height > 0`).toBeGreaterThan(0);
  expect(frame.palette, `${label}.palette`).toBeDefined();
  expect(Object.keys(frame.palette).length, `${label}.palette entries`).toBeGreaterThan(0);
  expect(frame.pixels, `${label}.pixels`).toBeDefined();
  expect(frame.pixels.length, `${label}.pixels rows > 0`).toBeGreaterThan(0);
  for (let y = 0; y < frame.pixels.length; y++) {
    expect(frame.pixels[y].length, `${label}.pixels[${y}] cols`).toBeGreaterThan(0);
  }
}

function validateFrames(frames: PixelFrame[], label: string) {
  it(`${label} has valid structure`, () => {
    expect(frames.length, `${label} length > 0`).toBeGreaterThan(0);
    for (let i = 0; i < frames.length; i++) {
      validatePixelFrame(frames[i], `${label}[${i}]`);
    }
  });
}

// ===== Core Animations =====

describe('IORI_IDLE_FRAMES', () => {
  it('has 6 frames', () => {
    expect(IORI_IDLE_FRAMES.length).toBe(6);
  });
  validateFrames(IORI_IDLE_FRAMES, 'IORI_IDLE');
});

describe('IORI_WALK_FORWARD_FRAMES', () => {
  it('has 6 frames', () => {
    expect(IORI_WALK_FORWARD_FRAMES.length).toBe(6);
  });
  validateFrames(IORI_WALK_FORWARD_FRAMES, 'IORI_WF');
});

describe('IORI_WALK_BACKWARD_FRAMES', () => {
  it('has 6 frames', () => {
    expect(IORI_WALK_BACKWARD_FRAMES.length).toBe(6);
  });
  validateFrames(IORI_WALK_BACKWARD_FRAMES, 'IORI_WB');
});

describe('IORI_JUMP_FRAMES', () => { validateFrames(IORI_JUMP_FRAMES, 'IORI_JUMP'); });
describe('IORI_CROUCH_FRAMES', () => { validateFrames(IORI_CROUCH_FRAMES, 'IORI_CROUCH'); });

// ===== Damage / State =====

describe('IORI_HURT_FRAMES', () => { validateFrames(IORI_HURT_FRAMES, 'IORI_HURT'); });
describe('IORI_KNOCKDOWN_FRAMES', () => { validateFrames(IORI_KNOCKDOWN_FRAMES, 'IORI_KD'); });
describe('IORI_BLOCK_FRAMES', () => { validateFrames(IORI_BLOCK_FRAMES, 'IORI_BLOCK'); });
describe('IORI_DIZZY_FRAMES', () => {
  it('has 8 frames', () => { expect(IORI_DIZZY_FRAMES.length).toBe(8); });
  validateFrames(IORI_DIZZY_FRAMES, 'IORI_DIZZY');
});
describe('IORI_THROW_FRAMES', () => { validateFrames(IORI_THROW_FRAMES, 'IORI_THROW'); });

// ===== Win Poses (single PixelFrame, not array) =====

describe('IORI_WIN_POSE', () => {
  it('has valid structure', () => {
    validatePixelFrame(IORI_WIN_POSE, 'IORI_WIN_POSE');
  });
});

describe('IORI_WIN_LAUGH', () => {
  it('has valid structure', () => {
    validatePixelFrame(IORI_WIN_LAUGH, 'IORI_WIN_LAUGH');
  });
});

// ===== Normals =====

describe('IORI_STAND_A_FRAMES', () => { validateFrames(IORI_STAND_A_FRAMES, 'IORI_SA'); });
describe('IORI_STAND_C_FRAMES', () => { validateFrames(IORI_STAND_C_FRAMES, 'IORI_SC'); });
describe('IORI_STAND_B_FRAMES', () => { validateFrames(IORI_STAND_B_FRAMES, 'IORI_SB'); });
describe('IORI_STAND_D_FRAMES', () => { validateFrames(IORI_STAND_D_FRAMES, 'IORI_SD'); });

// ===== Specials =====

describe('IORI_ONIYAKI_FRAMES', () => { validateFrames(IORI_ONIYAKI_FRAMES, 'IORI_ONI'); });
describe('IORI_ONIYAKI_C_FRAMES', () => {
  it('has >= A version frames', () => {
    expect(IORI_ONIYAKI_C_FRAMES.length).toBeGreaterThanOrEqual(IORI_ONIYAKI_FRAMES.length);
  });
  validateFrames(IORI_ONIYAKI_C_FRAMES, 'IORI_ONIC');
});
describe('IORI_YAMIBARAI_FRAMES', () => { validateFrames(IORI_YAMIBARAI_FRAMES, 'IORI_YAM'); });
describe('IORI_AOIHANA_FRAMES', () => { validateFrames(IORI_AOIHANA_FRAMES, 'IORI_AOI'); });

// ===== Movement =====

describe('IORI_RUN_FRAMES', () => { validateFrames(IORI_RUN_FRAMES, 'IORI_RUN'); });
describe('IORI_BACKDASH_FRAMES', () => { validateFrames(IORI_BACKDASH_FRAMES, 'IORI_BD'); });
describe('IORI_ROLL_FRAMES', () => { validateFrames(IORI_ROLL_FRAMES, 'IORI_ROL'); });
describe('IORI_GUARD_CRUSH_FRAMES', () => { validateFrames(IORI_GUARD_CRUSH_FRAMES, 'IORI_GC'); });

// ===== Cross-check =====

describe('Iori frame count consistency', () => {
  it('all core animations have >0 frames', () => {
    const all = [
      IORI_IDLE_FRAMES, IORI_WALK_FORWARD_FRAMES, IORI_WALK_BACKWARD_FRAMES,
      IORI_JUMP_FRAMES, IORI_CROUCH_FRAMES,
      IORI_HURT_FRAMES, IORI_KNOCKDOWN_FRAMES, IORI_BLOCK_FRAMES,
      IORI_DIZZY_FRAMES, IORI_THROW_FRAMES,
    ];
    for (const frames of all) {
      expect(frames.length).toBeGreaterThan(0);
    }
  });
});
