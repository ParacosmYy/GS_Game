/**
 * Ryo Pixel Frame Data Structural Tests
 *
 * Validates all Ryo sprite frame arrays exported from rendering/sprites/ryo/.
 * Ryo has the most complete sprite set — used as the baseline character.
 */
import { describe, it, expect } from 'vitest';
import type { PixelFrame } from '../src/rendering/sprites/kyo/kyoIdleFrames.js';
import { RYO_IDLE_FRAMES } from '../src/rendering/sprites/ryo/ryoIdleFrames.js';
import { RYO_WALK_FORWARD_FRAMES, RYO_WALK_BACKWARD_FRAMES } from '../src/rendering/sprites/ryo/ryoWalkFrames.js';
import { RYO_JUMP_FRAMES } from '../src/rendering/sprites/ryo/ryoJumpFrames.js';
import { RYO_CROUCH_FRAMES, RYO_CROUCH_A_FRAMES, RYO_CROUCH_C_FRAMES } from '../src/rendering/sprites/ryo/ryoCrouchFrames.js';
import { RYO_HURT_FRAMES, RYO_KNOCKDOWN_FRAMES } from '../src/rendering/sprites/ryo/ryoDamageFrames.js';
import { RYO_DIZZY_FRAMES } from '../src/rendering/sprites/ryo/ryoDizzyFrames.js';
import { RYO_THROW_FRAMES } from '../src/rendering/sprites/ryo/ryoThrowFrames.js';
import { RYO_WIN_FRAMES } from '../src/rendering/sprites/ryo/ryoWinFrames.js';
import { RYO_STAND_A_FRAMES, RYO_STAND_C_FRAMES, RYO_CLOSE_A_FRAMES, RYO_CLOSE_C_FRAMES } from '../src/rendering/sprites/ryo/ryoAttackFrames.js';
import { RYO_STAND_B_FRAMES, RYO_STAND_D_FRAMES } from '../src/rendering/sprites/ryo/ryoKickFrames.js';
import { RYO_KO_HOU_FRAMES, RYO_KOOU_FRAMES, RYO_HIEN_FRAMES, RYO_HAOU_FRAMES, RYO_KOOU_C_FRAMES } from '../src/rendering/sprites/ryo/ryoSpecialFrames.js';
import { RYO_RUN_FRAMES, RYO_BACKDASH_FRAMES, RYO_ROLL_FRAMES, RYO_GUARD_CRUSH_FRAMES } from '../src/rendering/sprites/ryo/ryoMovementFrames.js';
import { RYO_BLOCK_FRAMES } from '../src/rendering/sprites/ryo/ryoBlockFrames.js';
import { RYO_DM_TEN_HA_OU_FRAMES, RYO_DM_RYUKO_RANBU_FRAMES, RYO_SDM_TEN_HA_OU_FRAMES, RYO_HSDM_RYUKO_RANBU_FRAMES } from '../src/rendering/sprites/ryo/ryoSuperFrames.js';
import { RYO_TSURIZAO_FRAMES, RYO_ORISHI_FRAMES } from '../src/rendering/sprites/ryo/ryoCommandNormalFrames.js';
import { RYO_AIR_A_FRAMES, RYO_AIR_B_FRAMES, RYO_AIR_C_FRAMES, RYO_AIR_D_FRAMES } from '../src/rendering/sprites/ryo/ryoAirAttackFrames.js';
import { RYO_CLOSE_B_FRAMES, RYO_CLOSE_D_FRAMES } from '../src/rendering/sprites/ryo/ryoCloseKickFrames.js';
import { RYO_CROUCH_B_FRAMES, RYO_CROUCH_D_FRAMES } from '../src/rendering/sprites/ryo/ryoCrouchKickFrames.js';

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

describe('RYO_IDLE_FRAMES', () => { validateFrames(RYO_IDLE_FRAMES, 'RYO_IDLE'); });
describe('RYO_WALK_FORWARD_FRAMES', () => { validateFrames(RYO_WALK_FORWARD_FRAMES, 'RYO_WF'); });
describe('RYO_WALK_BACKWARD_FRAMES', () => { validateFrames(RYO_WALK_BACKWARD_FRAMES, 'RYO_WB'); });
describe('RYO_JUMP_FRAMES', () => { validateFrames(RYO_JUMP_FRAMES, 'RYO_JUMP'); });
describe('RYO_CROUCH_FRAMES', () => { validateFrames(RYO_CROUCH_FRAMES, 'RYO_CROUCH'); });
describe('RYO_CROUCH_A_FRAMES', () => { validateFrames(RYO_CROUCH_A_FRAMES, 'RYO_CA'); });
describe('RYO_CROUCH_C_FRAMES', () => { validateFrames(RYO_CROUCH_C_FRAMES, 'RYO_CC'); });

// ===== Damage / State =====

describe('RYO_HURT_FRAMES', () => { validateFrames(RYO_HURT_FRAMES, 'RYO_HURT'); });
describe('RYO_KNOCKDOWN_FRAMES', () => { validateFrames(RYO_KNOCKDOWN_FRAMES, 'RYO_KD'); });
describe('RYO_BLOCK_FRAMES', () => { validateFrames(RYO_BLOCK_FRAMES, 'RYO_BLOCK'); });
describe('RYO_DIZZY_FRAMES', () => { validateFrames(RYO_DIZZY_FRAMES, 'RYO_DIZZY'); });
describe('RYO_THROW_FRAMES', () => { validateFrames(RYO_THROW_FRAMES, 'RYO_THROW'); });
describe('RYO_WIN_FRAMES', () => { validateFrames(RYO_WIN_FRAMES, 'RYO_WIN'); });

// ===== Normals =====

describe('RYO_STAND_A_FRAMES', () => { validateFrames(RYO_STAND_A_FRAMES, 'RYO_SA'); });
describe('RYO_STAND_C_FRAMES', () => { validateFrames(RYO_STAND_C_FRAMES, 'RYO_SC'); });
describe('RYO_STAND_B_FRAMES', () => { validateFrames(RYO_STAND_B_FRAMES, 'RYO_SB'); });
describe('RYO_STAND_D_FRAMES', () => { validateFrames(RYO_STAND_D_FRAMES, 'RYO_SD'); });
describe('RYO_CLOSE_A_FRAMES', () => { validateFrames(RYO_CLOSE_A_FRAMES, 'RYO_CLA'); });
describe('RYO_CLOSE_C_FRAMES', () => { validateFrames(RYO_CLOSE_C_FRAMES, 'RYO_CLC'); });
describe('RYO_CLOSE_B_FRAMES', () => { validateFrames(RYO_CLOSE_B_FRAMES, 'RYO_CLB'); });
describe('RYO_CLOSE_D_FRAMES', () => { validateFrames(RYO_CLOSE_D_FRAMES, 'RYO_CLD'); });

// ===== Crouch Attacks =====

describe('RYO_CROUCH_B_FRAMES', () => { validateFrames(RYO_CROUCH_B_FRAMES, 'RYO_CRB'); });
describe('RYO_CROUCH_D_FRAMES', () => { validateFrames(RYO_CROUCH_D_FRAMES, 'RYO_CRD'); });

// ===== Air Attacks =====

describe('RYO_AIR_A_FRAMES', () => { validateFrames(RYO_AIR_A_FRAMES, 'RYO_AA'); });
describe('RYO_AIR_B_FRAMES', () => { validateFrames(RYO_AIR_B_FRAMES, 'RYO_AB'); });
describe('RYO_AIR_C_FRAMES', () => { validateFrames(RYO_AIR_C_FRAMES, 'RYO_AC'); });
describe('RYO_AIR_D_FRAMES', () => { validateFrames(RYO_AIR_D_FRAMES, 'RYO_AD'); });

// ===== Command Normals =====

describe('RYO_TSURIZAO_FRAMES', () => { validateFrames(RYO_TSURIZAO_FRAMES, 'RYO_TSZ'); });
describe('RYO_ORISHI_FRAMES', () => { validateFrames(RYO_ORISHI_FRAMES, 'RYO_ORS'); });

// ===== Specials =====

describe('RYO_KO_HOU_FRAMES', () => { validateFrames(RYO_KO_HOU_FRAMES, 'RYO_KH'); });
describe('RYO_KOOU_FRAMES', () => { validateFrames(RYO_KOOU_FRAMES, 'RYO_KK'); });
describe('RYO_KOOU_C_FRAMES', () => { validateFrames(RYO_KOOU_C_FRAMES, 'RYO_KKC'); });
describe('RYO_HIEN_FRAMES', () => { validateFrames(RYO_HIEN_FRAMES, 'RYO_HN'); });
describe('RYO_HAOU_FRAMES', () => { validateFrames(RYO_HAOU_FRAMES, 'RYO_HO'); });

// ===== DM/SDM/HSDM =====

describe('RYO_DM_TEN_HA_OU_FRAMES', () => { validateFrames(RYO_DM_TEN_HA_OU_FRAMES, 'RYO_DM_THO'); });
describe('RYO_DM_RYUKO_RANBU_FRAMES', () => { validateFrames(RYO_DM_RYUKO_RANBU_FRAMES, 'RYO_DM_RR'); });
describe('RYO_SDM_TEN_HA_OU_FRAMES', () => { validateFrames(RYO_SDM_TEN_HA_OU_FRAMES, 'RYO_SDM_THO'); });
describe('RYO_HSDM_RYUKO_RANBU_FRAMES', () => { validateFrames(RYO_HSDM_RYUKO_RANBU_FRAMES, 'RYO_HSDM_RR'); });

// ===== Movement =====

describe('RYO_RUN_FRAMES', () => { validateFrames(RYO_RUN_FRAMES, 'RYO_RUN'); });
describe('RYO_BACKDASH_FRAMES', () => { validateFrames(RYO_BACKDASH_FRAMES, 'RYO_BD'); });
describe('RYO_ROLL_FRAMES', () => { validateFrames(RYO_ROLL_FRAMES, 'RYO_ROL'); });
describe('RYO_GUARD_CRUSH_FRAMES', () => { validateFrames(RYO_GUARD_CRUSH_FRAMES, 'RYO_GC'); });

// ===== Cross-check completeness =====

describe('Ryo frame completeness', () => {
  it('has all required animation categories', () => {
    const required = [
      RYO_IDLE_FRAMES, RYO_WALK_FORWARD_FRAMES, RYO_WALK_BACKWARD_FRAMES,
      RYO_JUMP_FRAMES, RYO_CROUCH_FRAMES,
      RYO_HURT_FRAMES, RYO_KNOCKDOWN_FRAMES, RYO_BLOCK_FRAMES,
      RYO_DIZZY_FRAMES, RYO_THROW_FRAMES, RYO_WIN_FRAMES,
      RYO_STAND_A_FRAMES, RYO_STAND_C_FRAMES,
      RYO_STAND_B_FRAMES, RYO_STAND_D_FRAMES,
      RYO_KO_HOU_FRAMES, RYO_KOOU_FRAMES,
      RYO_DM_TEN_HA_OU_FRAMES, RYO_DM_RYUKO_RANBU_FRAMES,
    ];
    for (const frames of required) {
      expect(frames.length).toBeGreaterThan(0);
    }
  });

  it('has complete close attack set (A/B/C/D)', () => {
    expect(RYO_CLOSE_A_FRAMES.length).toBeGreaterThan(0);
    expect(RYO_CLOSE_B_FRAMES.length).toBeGreaterThan(0);
    expect(RYO_CLOSE_C_FRAMES.length).toBeGreaterThan(0);
    expect(RYO_CLOSE_D_FRAMES.length).toBeGreaterThan(0);
  });

  it('has complete air attack set (A/B/C/D)', () => {
    expect(RYO_AIR_A_FRAMES.length).toBeGreaterThan(0);
    expect(RYO_AIR_B_FRAMES.length).toBeGreaterThan(0);
    expect(RYO_AIR_C_FRAMES.length).toBeGreaterThan(0);
    expect(RYO_AIR_D_FRAMES.length).toBeGreaterThan(0);
  });
});
