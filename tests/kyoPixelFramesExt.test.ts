/**
 * Kyo Extended Pixel Frame Tests — Movement, Close Attacks, Crouch Attacks, Air Attacks
 *
 * Complements kyoPixelFrames.test.ts with additional frame sets.
 */
import { describe, it, expect } from 'vitest';
import type { PixelFrame } from '../src/rendering/sprites/kyo/kyoIdleFrames.js';
import { KYO_RUN_FRAMES, KYO_BACKDASH_FRAMES, KYO_ROLL_FRAMES, KYO_BACK_ROLL_FRAMES, KYO_GUARD_CRUSH_FRAMES } from '../src/rendering/sprites/kyo/kyoMovementFrames.js';
import { KYO_CLOSE_A_FRAMES, KYO_CLOSE_C_FRAMES, KYO_CLOSE_B_FRAMES, KYO_CLOSE_D_FRAMES } from '../src/rendering/sprites/kyo/kyoCloseAttackFrames.js';
import { KYO_CROUCH_A_FRAMES as CRA, KYO_CROUCH_C_FRAMES as CRC, KYO_CROUCH_B_FRAMES as CRB, KYO_CROUCH_D_FRAMES as CRD } from '../src/rendering/sprites/kyo/kyoCrouchAttackFrames.js';
import { KYO_AIR_A_FRAMES, KYO_AIR_C_FRAMES, KYO_AIR_B_FRAMES, KYO_AIR_D_FRAMES } from '../src/rendering/sprites/kyo/kyoAirAttackFrames.js';

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

// ===== Movement =====

describe('KYO_RUN_FRAMES', () => { validateFrames(KYO_RUN_FRAMES, 'KYO_RUN'); });
describe('KYO_BACKDASH_FRAMES', () => { validateFrames(KYO_BACKDASH_FRAMES, 'KYO_BD'); });
describe('KYO_ROLL_FRAMES', () => { validateFrames(KYO_ROLL_FRAMES, 'KYO_RL'); });
describe('KYO_BACK_ROLL_FRAMES', () => { validateFrames(KYO_BACK_ROLL_FRAMES, 'KYO_BRL'); });
describe('KYO_GUARD_CRUSH_FRAMES', () => { validateFrames(KYO_GUARD_CRUSH_FRAMES, 'KYO_GC'); });

// ===== Close Attacks =====

describe('KYO_CLOSE_A_FRAMES', () => { validateFrames(KYO_CLOSE_A_FRAMES, 'KYO_CLA'); });
describe('KYO_CLOSE_C_FRAMES', () => { validateFrames(KYO_CLOSE_C_FRAMES, 'KYO_CLC'); });
describe('KYO_CLOSE_B_FRAMES', () => { validateFrames(KYO_CLOSE_B_FRAMES, 'KYO_CLB'); });
describe('KYO_CLOSE_D_FRAMES', () => { validateFrames(KYO_CLOSE_D_FRAMES, 'KYO_CLD'); });

// ===== Crouch Attacks =====

describe('KYO_CROUCH_A (attack)', () => { validateFrames(CRA, 'KYO_CRA'); });
describe('KYO_CROUCH_C (attack)', () => { validateFrames(CRC, 'KYO_CRC'); });
describe('KYO_CROUCH_B (attack)', () => { validateFrames(CRB, 'KYO_CRB'); });
describe('KYO_CROUCH_D (attack)', () => { validateFrames(CRD, 'KYO_CRD'); });

// ===== Air Attacks =====

describe('KYO_AIR_A_FRAMES', () => { validateFrames(KYO_AIR_A_FRAMES, 'KYO_AIA'); });
describe('KYO_AIR_C_FRAMES', () => { validateFrames(KYO_AIR_C_FRAMES, 'KYO_AIC'); });
describe('KYO_AIR_B_FRAMES', () => { validateFrames(KYO_AIR_B_FRAMES, 'KYO_AIB'); });
describe('KYO_AIR_D_FRAMES', () => { validateFrames(KYO_AIR_D_FRAMES, 'KYO_AID'); });

// ===== Completeness =====

describe('Kyo extended frame completeness', () => {
  it('run has 6 frames', () => { expect(KYO_RUN_FRAMES.length).toBe(6); });
  it('backdash has 4 frames', () => { expect(KYO_BACKDASH_FRAMES.length).toBe(4); });
  it('roll has 4 frames', () => { expect(KYO_ROLL_FRAMES.length).toBe(4); });
  it('guard_crush has 2 frames', () => { expect(KYO_GUARD_CRUSH_FRAMES.length).toBe(2); });
  it('close A has 4 frames', () => { expect(KYO_CLOSE_A_FRAMES.length).toBe(4); });
  it('close C has 4 frames', () => { expect(KYO_CLOSE_C_FRAMES.length).toBe(4); });
  it('close B has 3 frames', () => { expect(KYO_CLOSE_B_FRAMES.length).toBe(3); });
  it('close D has 4 frames', () => { expect(KYO_CLOSE_D_FRAMES.length).toBe(4); });
  it('crouch D attack has 5 frames', () => { expect(CRD.length).toBe(5); });
});
