/**
 * Ryo Hitbox Chain Integrity Test
 *
 * Verifies that every Ryo attack key in RYO_ATTACK_KEYS has a complete
 * data chain: FRAME_DATA → ATTACK_FRAMES → HITBOX_OFFSETS → feedbackManifest.
 */
import { describe, it, expect } from 'vitest';
import { FRAME_DATA } from '../src/core/constants.js';
import { ATTACK_FRAMES } from '../src/core/attackFrames.js';
import { HITBOX_OFFSETS } from '../src/core/hitboxConstants.js';
import { FEEDBACK_MANIFEST } from '../src/core/feedbackManifest.js';
import { RYO_ATTACK_KEYS } from '../src/content/characters/ryo/attacks/ryoAttacks.js';
import { RYO_ACTION_CONTRACTS } from '../src/core/ryoFrameContract.js';
import { AttackType } from '../src/core/types.js';

describe('Ryo Hitbox Chain Integrity', () => {
  const normals = ['STAND_A', 'STAND_B', 'STAND_C', 'STAND_D',
    'CLOSE_A', 'CLOSE_B', 'CLOSE_C', 'CLOSE_D',
    'CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D',
    'JUMP_A', 'JUMP_B', 'JUMP_C', 'JUMP_D'];

  const specials = ['RYO_KOOU', 'RYO_KOOU_C', 'RYO_KO_HOU', 'RYO_KO_HOU_C',
    'RYO_HIEN', 'RYO_HAOU', 'RYO_TSURIZAO', 'RYO_ORISHI',
    'RYO_KOOUKEN_D', 'RYO_HIO_HACKER', 'RYO_ZANRETSU_KEN'];

  const supers = ['DM_TEN_HA_OU', 'DM_RYUKO_RANBU',
    'SDM_TEN_HA_OU', 'SDM_RYUKO_RANBU', 'HSDM_RYUKO_RANBU'];

  const throwKeys = ['THROW', 'THROW_FORWARD', 'THROW_BACK'];
  const blowbackKeys = ['STAND_CD', 'JUMP_CD'];

  for (const key of RYO_ATTACK_KEYS) {
    describe(`${key}`, () => {
      it('has FRAME_DATA entry', () => {
        const fd = (FRAME_DATA as Record<string, unknown>)[key];
        expect(fd, `Missing FRAME_DATA for ${key}`).toBeDefined();
      });

      // ATTACK_FRAMES required for attacks with hitboxes (not throws)
      if (!throwKeys.includes(key)) {
        it('has ATTACK_FRAMES entry', () => {
          const af = (ATTACK_FRAMES as Record<string, unknown>)[key];
          expect(af, `Missing ATTACK_FRAMES for ${key}`).toBeDefined();
        });
      }

      // Hitbox offset for Ryo-specific attacks
      if (specials.includes(key) || supers.includes(key)) {
        it('has HITBOX_OFFSETS entry', () => {
          const hb = (HITBOX_OFFSETS as Record<string, unknown>)[key];
          expect(hb, `Missing HITBOX_OFFSETS for ${key}`).toBeDefined();
        });
      }

      // Feedback tier for specials/supers (throws/blowbacks use inferred tier)
      if (specials.includes(key) || supers.includes(key)) {
        it('has explicit feedback tier', () => {
          const tier = FEEDBACK_MANIFEST.attackTierMap[key as AttackType];
          expect(tier, `Missing feedback tier for ${key}`).toBeDefined();
        });
      }

      // Frame Contract for specials and supers
      if (specials.includes(key) || supers.includes(key)) {
        it('has Frame Contract entry', () => {
          const found = Array.from(RYO_ACTION_CONTRACTS.values())
            .some(c => c.attackType === key);
          expect(found, `Missing Frame Contract for ${key}`).toBe(true);
        });
      }
    });
  }

  it('all Ryo specials have complete chains', () => {
    const incomplete: string[] = [];
    for (const key of specials) {
      const hasFD = key in FRAME_DATA;
      const hasAF = key in ATTACK_FRAMES;
      const hasHB = key in HITBOX_OFFSETS;
      const hasFB = key in FEEDBACK_MANIFEST.attackTierMap;
      if (!hasFD || !hasAF || !hasHB || !hasFB) {
        incomplete.push(key);
      }
    }
    expect(incomplete, `Incomplete chains: ${incomplete.join(', ')}`).toEqual([]);
  });

  it('all Ryo supers have complete chains', () => {
    const incomplete: string[] = [];
    for (const key of supers) {
      const hasFD = key in FRAME_DATA;
      const hasAF = key in ATTACK_FRAMES;
      const hasHB = key in HITBOX_OFFSETS;
      const hasFB = key in FEEDBACK_MANIFEST.attackTierMap;
      if (!hasFD || !hasAF || !hasHB || !hasFB) {
        incomplete.push(key);
      }
    }
    expect(incomplete, `Incomplete chains: ${incomplete.join(', ')}`).toEqual([]);
  });
});
