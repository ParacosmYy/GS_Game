/**
 * Ryo Collision Data Tests
 *
 * Verifies that real hitbox data from attackFrames.ts is properly connected
 * to the FrameContract entries in ryoFrameContract.ts.
 */

import { describe, it, expect } from 'vitest';
import { RYO_ACTION_CONTRACTS } from '../src/core/ryoFrameContract.js';
import { ATTACK_FRAMES } from '../src/core/attackFrames.js';
import { AttackType } from '../src/core/types.js';

// The 4 attack actions in ryoFrameContract
const ATTACK_ACTIONS: Array<{
  actionId: string;
  attackType: AttackType;
  startup: number;
  active: number;
  recovery: number;
}> = [
  { actionId: 'stand_a', attackType: AttackType.STAND_A, startup: 6, active: 3, recovery: 5 },
  { actionId: 'stand_c', attackType: AttackType.STAND_C, startup: 7, active: 3, recovery: 20 },
  { actionId: 'close_a', attackType: AttackType.CLOSE_A, startup: 4, active: 5, recovery: 5 },
  { actionId: 'close_c', attackType: AttackType.CLOSE_C, startup: 2, active: 5, recovery: 11 },
];

// Non-attack actions should have no collision data at all
const NON_ATTACK_ACTIONS = ['idle', 'walk_forward', 'walk_backward', 'jump', 'hurt', 'knockdown'];

describe('Ryo collision data connection', () => {
  describe('non-attack actions have no collision', () => {
    for (const actionId of NON_ATTACK_ACTIONS) {
      it(`${actionId}: all frames have collision=null`, () => {
        const contract = RYO_ACTION_CONTRACTS.get(actionId);
        expect(contract).toBeDefined();
        for (const frame of contract!.frames) {
          expect(frame.collision).toBeNull();
        }
      });
    }
  });

  describe('attack actions: startup frames have no collision', () => {
    for (const { actionId, startup } of ATTACK_ACTIONS) {
      it(`${actionId}: frames 0..${startup - 1} have collision=null`, () => {
        const contract = RYO_ACTION_CONTRACTS.get(actionId);
        expect(contract).toBeDefined();
        for (let i = 0; i < startup; i++) {
          expect(contract!.frames[i].collision).toBeNull();
        }
      });
    }
  });

  describe('attack actions: recovery frames have no collision', () => {
    for (const { actionId, startup, active, recovery } of ATTACK_ACTIONS) {
      it(`${actionId}: recovery frames have collision=null`, () => {
        const contract = RYO_ACTION_CONTRACTS.get(actionId);
        expect(contract).toBeDefined();
        const recoveryStart = startup + active;
        for (let i = recoveryStart; i < contract!.frames.length; i++) {
          expect(contract!.frames[i].collision).toBeNull();
        }
      });
    }
  });

  describe('attack actions: at least some active frames have non-empty hitboxes', () => {
    for (const { actionId, startup, active } of ATTACK_ACTIONS) {
      it(`${actionId}: some active frames ${startup}..${startup + active - 1} have hitboxes`, () => {
        const contract = RYO_ACTION_CONTRACTS.get(actionId);
        expect(contract).toBeDefined();
        let hitboxFrameCount = 0;
        for (let i = startup; i < startup + active; i++) {
          const collision = contract!.frames[i].collision;
          expect(collision).not.toBeNull();
          if (collision!.hitboxes.length > 0) hitboxFrameCount++;
        }
        // At least one active frame must have hitbox data
        expect(hitboxFrameCount).toBeGreaterThan(0);
      });
    }
  });

  describe('attack actions: active frames have swing event tag', () => {
    for (const { actionId, startup, active } of ATTACK_ACTIONS) {
      it(`${actionId}: active frames have 'swing' in eventTags`, () => {
        const contract = RYO_ACTION_CONTRACTS.get(actionId);
        expect(contract).toBeDefined();
        for (let i = startup; i < startup + active; i++) {
          expect(contract!.frames[i].eventTags).toContain('swing');
        }
      });
    }
  });

  describe('hitbox coordinates match attackFrames.ts data', () => {
    for (const { actionId, attackType, startup, active } of ATTACK_ACTIONS) {
      it(`${actionId}: hitbox data matches ATTACK_FRAMES[${attackType}]`, () => {
        const contract = RYO_ACTION_CONTRACTS.get(actionId);
        const perFrameData = ATTACK_FRAMES[attackType];
        expect(contract).toBeDefined();
        expect(perFrameData).toBeDefined();
        expect(perFrameData!.length).toBe(active);

        for (let i = 0; i < active; i++) {
          const frameIndex = startup + i;
          const collision = contract!.frames[frameIndex].collision;
          expect(collision).not.toBeNull();

          const expected = perFrameData![i];
          // Check hitboxes match
          expect(collision!.hitboxes).toEqual(expected.attack);
        }
      });
    }
  });

  describe('hurtboxOverride matches attackFrames.ts bodyOverride', () => {
    for (const { actionId, attackType, startup, active } of ATTACK_ACTIONS) {
      it(`${actionId}: hurtboxOverride matches ATTACK_FRAMES bodyOverride`, () => {
        const contract = RYO_ACTION_CONTRACTS.get(actionId);
        const perFrameData = ATTACK_FRAMES[attackType];
        expect(contract).toBeDefined();
        expect(perFrameData).toBeDefined();

        for (let i = 0; i < active; i++) {
          const frameIndex = startup + i;
          const collision = contract!.frames[frameIndex].collision;
          expect(collision).not.toBeNull();

          const expected = perFrameData![i];
          expect(collision!.hurtboxOverride).toEqual(expected.bodyOverride);
        }
      });
    }
  });

  describe('throwBoxes match attackFrames.ts', () => {
    for (const { actionId, attackType, startup, active } of ATTACK_ACTIONS) {
      it(`${actionId}: throwBoxes match ATTACK_FRAMES throwBoxes`, () => {
        const contract = RYO_ACTION_CONTRACTS.get(actionId);
        const perFrameData = ATTACK_FRAMES[attackType];
        expect(contract).toBeDefined();
        expect(perFrameData).toBeDefined();

        for (let i = 0; i < active; i++) {
          const frameIndex = startup + i;
          const collision = contract!.frames[frameIndex].collision;
          expect(collision).not.toBeNull();

          const expectedThrowBoxes = perFrameData![i].throwBoxes ?? [];
          expect(collision!.throwBoxes).toEqual(expectedThrowBoxes);
        }
      });
    }
  });

  describe('specific hitbox values for stand_a', () => {
    it('frame 6 (first active) has correct hitbox', () => {
      const contract = RYO_ACTION_CONTRACTS.get('stand_a');
      const collision = contract!.frames[6].collision;
      expect(collision).not.toBeNull();
      // FAR_STAND_A_FRAMES[0]: F([{ ox: 40, oy: -75, w: 35, h: 22 }])
      expect(collision!.hitboxes[0]).toEqual({ ox: 40, oy: -75, w: 35, h: 22 });
    });

    it('frame 7 (second active) has correct hitbox', () => {
      const contract = RYO_ACTION_CONTRACTS.get('stand_a');
      const collision = contract!.frames[7].collision;
      expect(collision).not.toBeNull();
      // FAR_STAND_A_FRAMES[1]: F([{ ox: 48, oy: -73, w: 40, h: 22 }])
      expect(collision!.hitboxes[0]).toEqual({ ox: 48, oy: -73, w: 40, h: 22 });
    });

    it('frame 8 (third active) has correct hitbox', () => {
      const contract = RYO_ACTION_CONTRACTS.get('stand_a');
      const collision = contract!.frames[8].collision;
      expect(collision).not.toBeNull();
      // FAR_STAND_A_FRAMES[2]: F([{ ox: 48, oy: -73, w: 40, h: 22 }])
      expect(collision!.hitboxes[0]).toEqual({ ox: 48, oy: -73, w: 40, h: 22 });
    });
  });

  describe('specific hitbox values for stand_c', () => {
    it('frame 7 has hurtboxOverride (body shifted during heavy punch)', () => {
      const contract = RYO_ACTION_CONTRACTS.get('stand_c');
      const collision = contract!.frames[7].collision;
      expect(collision).not.toBeNull();
      // FAR_STAND_C_FRAMES[0]: bodyOverride: { ox: 5, oy: 0, w: -10, h: 0 }
      expect(collision!.hurtboxOverride).toEqual({ ox: 5, oy: 0, w: -10, h: 0 });
    });

    it('frame 8 has no hurtboxOverride', () => {
      const contract = RYO_ACTION_CONTRACTS.get('stand_c');
      const collision = contract!.frames[8].collision;
      expect(collision).not.toBeNull();
      // FAR_STAND_C_FRAMES[1]: bodyOverride: null
      expect(collision!.hurtboxOverride).toBeNull();
    });
  });

  describe('specific hitbox values for close_c', () => {
    it('frame 2 (first active) has hurtboxOverride', () => {
      const contract = RYO_ACTION_CONTRACTS.get('close_c');
      const collision = contract!.frames[2].collision;
      expect(collision).not.toBeNull();
      // CLOSE_C_FRAMES[0]: bodyOverride: { ox: 3, oy: 0, w: -8, h: 0 }
      expect(collision!.hurtboxOverride).toEqual({ ox: 3, oy: 0, w: -8, h: 0 });
    });
  });

  describe('frame count consistency', () => {
    for (const { actionId, startup, active, recovery } of ATTACK_ACTIONS) {
      it(`${actionId}: total frames = startup + active + recovery`, () => {
        const contract = RYO_ACTION_CONTRACTS.get(actionId);
        expect(contract).toBeDefined();
        expect(contract!.frames.length).toBe(startup + active + recovery);
        expect(contract!.totalFrames).toBe(startup + active + recovery);
      });
    }
  });
});
