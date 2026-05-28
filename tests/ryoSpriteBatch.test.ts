/**
 * Ryo sprite frame existence regression tests
 * Consolidated from ryoSpriteBatch1-5 (5 files → 1 file)
 * Verifies all Ryo sprite frame arrays are non-empty.
 */
import { describe, it, expect } from 'vitest';
import { RYO_IDLE_FRAMES } from '../src/rendering/sprites/ryo/ryoIdleFrames.js';
import { RYO_WALK_FORWARD_FRAMES, RYO_WALK_BACKWARD_FRAMES } from '../src/rendering/sprites/ryo/ryoWalkFrames.js';
import { RYO_RUN_FRAMES, RYO_BACKDASH_FRAMES } from '../src/rendering/sprites/ryo/ryoMovementFrames.js';
import { RYO_JUMP_FRAMES } from '../src/rendering/sprites/ryo/ryoJumpFrames.js';
import { RYO_CROUCH_FRAMES } from '../src/rendering/sprites/ryo/ryoCrouchFrames.js';
import { RYO_STAND_A_FRAMES, RYO_STAND_C_FRAMES } from '../src/rendering/sprites/ryo/ryoAttackFrames.js';
import { RYO_STAND_B_FRAMES, RYO_STAND_D_FRAMES } from '../src/rendering/sprites/ryo/ryoKickFrames.js';
import { RYO_AIR_A_FRAMES, RYO_AIR_C_FRAMES } from '../src/rendering/sprites/ryo/ryoAirAttackFrames.js';
import { RYO_CLOSE_B_FRAMES, RYO_CLOSE_D_FRAMES } from '../src/rendering/sprites/ryo/ryoCloseKickFrames.js';
import { RYO_CROUCH_A_FRAMES, RYO_CROUCH_C_FRAMES } from '../src/rendering/sprites/ryo/ryoCrouchFrames.js';
import {
  RYO_CROUCH_B_FRAMES, RYO_CROUCH_D_FRAMES,
} from '../src/rendering/sprites/ryo/ryoCrouchKickFrames.js';
import { RYO_BLOCK_FRAMES } from '../src/rendering/sprites/ryo/ryoBlockFrames.js';
import { RYO_HURT_FRAMES, RYO_KNOCKDOWN_FRAMES } from '../src/rendering/sprites/ryo/ryoDamageFrames.js';
import {
  RYO_KOOU_FRAMES, RYO_KOOU_C_FRAMES, RYO_HAOU_FRAMES,
  RYO_KO_HOU_FRAMES, RYO_HIEN_FRAMES,
} from '../src/rendering/sprites/ryo/ryoSpecialFrames.js';
import {
  RYO_DM_RYUKO_RANBU_FRAMES, RYO_SDM_TEN_HA_OU_FRAMES, RYO_HSDM_RYUKO_RANBU_FRAMES,
} from '../src/rendering/sprites/ryo/ryoSuperFrames.js';
import { RYO_THROW_FRAMES } from '../src/rendering/sprites/ryo/ryoThrowFrames.js';
import { RYO_WIN_FRAMES } from '../src/rendering/sprites/ryo/ryoWinFrames.js';
import { RYO_DIZZY_FRAMES } from '../src/rendering/sprites/ryo/ryoDizzyFrames.js';

const FRAME_SETS: [string, unknown[]][] = [
  ['IDLE', RYO_IDLE_FRAMES],
  ['WALK_FORWARD', RYO_WALK_FORWARD_FRAMES],
  ['WALK_BACKWARD', RYO_WALK_BACKWARD_FRAMES],
  ['RUN', RYO_RUN_FRAMES],
  ['BACKDASH', RYO_BACKDASH_FRAMES],
  ['JUMP', RYO_JUMP_FRAMES],
  ['CROUCH', RYO_CROUCH_FRAMES],
  ['STAND_A', RYO_STAND_A_FRAMES],
  ['STAND_B', RYO_STAND_B_FRAMES],
  ['STAND_C', RYO_STAND_C_FRAMES],
  ['STAND_D', RYO_STAND_D_FRAMES],
  ['AIR_A', RYO_AIR_A_FRAMES],
  ['AIR_C', RYO_AIR_C_FRAMES],
  ['CLOSE_B', RYO_CLOSE_B_FRAMES],
  ['CLOSE_D', RYO_CLOSE_D_FRAMES],
  ['CROUCH_A', RYO_CROUCH_A_FRAMES],
  ['CROUCH_B', RYO_CROUCH_B_FRAMES],
  ['CROUCH_C', RYO_CROUCH_C_FRAMES],
  ['CROUCH_D', RYO_CROUCH_D_FRAMES],
  ['BLOCK', RYO_BLOCK_FRAMES],
  ['HURT', RYO_HURT_FRAMES],
  ['KNOCKDOWN', RYO_KNOCKDOWN_FRAMES],
  ['KOOU', RYO_KOOU_FRAMES],
  ['KOOU_C', RYO_KOOU_C_FRAMES],
  ['HAOU', RYO_HAOU_FRAMES],
  ['KO_HOU', RYO_KO_HOU_FRAMES],
  ['HIEN', RYO_HIEN_FRAMES],
  ['DM_RYUKO_RANBU', RYO_DM_RYUKO_RANBU_FRAMES],
  ['SDM_TEN_HA_OU', RYO_SDM_TEN_HA_OU_FRAMES],
  ['HSDM_RYUKO_RANBU', RYO_HSDM_RYUKO_RANBU_FRAMES],
  ['THROW', RYO_THROW_FRAMES],
  ['WIN', RYO_WIN_FRAMES],
  ['DIZZY', RYO_DIZZY_FRAMES],
];

describe('Ryo sprite frames', () => {
  for (const [name, frames] of FRAME_SETS) {
    it(`${name} is non-empty`, () => {
      expect(frames.length).toBeGreaterThan(0);
    });
  }
});
