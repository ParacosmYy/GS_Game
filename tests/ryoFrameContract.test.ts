import { describe, it, expect } from 'vitest';
import {
  RYO_ACTION_CONTRACTS,
  getRyoFrameContractManifest,
} from '../src/core/ryoFrameContract.js';
import { FRAME_DATA } from '../src/core/frameDataConstants.js';

describe('ryoFrameContract', () => {
  describe('RYO_ACTION_CONTRACTS', () => {
    it('is a Map', () => {
      expect(RYO_ACTION_CONTRACTS).toBeInstanceOf(Map);
    });

    it('has at least 30 actions', () => {
      expect(RYO_ACTION_CONTRACTS.size).toBeGreaterThanOrEqual(30);
    });

    // Minimum 8 actions
    const required = ['idle', 'walk_forward', 'walk_backward', 'jump', 'stand_a', 'stand_c', 'hurt', 'knockdown'];
    for (const action of required) {
      it(`has ${action} action`, () => {
        expect(RYO_ACTION_CONTRACTS.has(action)).toBe(true);
      });
    }

    it('stand_a has frames with real spriteRef format', () => {
      const action = RYO_ACTION_CONTRACTS.get('stand_a');
      expect(action).toBeDefined();
      expect(action!.frames.length).toBeGreaterThan(0);
      // spriteRef should be "PIXEL_KEY:frameIndex" format
      expect(action!.frames[0].sprite.spriteRef).toMatch(/^[A-Z_]+:\d+$/);
    });

    it('idle frames have anchor at 48x144 (96x144 pixel frame center)', () => {
      const action = RYO_ACTION_CONTRACTS.get('idle');
      expect(action!.frames[0].sprite.anchor).toEqual({ x: 48, y: 144 });
    });

    it('idle frames have duration=9 ticks (from pixel frame registry)', () => {
      const action = RYO_ACTION_CONTRACTS.get('idle');
      expect(action!.frames[0].sprite.duration).toBe(9);
    });

    it('stand_a startup/active/recovery match FRAME_DATA', () => {
      const action = RYO_ACTION_CONTRACTS.get('stand_a')!;
      const fd = FRAME_DATA['STAND_A'] as any;
      expect(action.startup).toBe(fd.startup);
      expect(action.active).toBe(fd.active);
      expect(action.recovery).toBe(fd.recovery);
      expect(action.totalFrames).toBe(fd.startup + fd.active + fd.recovery);
    });

    it('stand_c startup/active/recovery match FRAME_DATA', () => {
      const action = RYO_ACTION_CONTRACTS.get('stand_c')!;
      const fd = FRAME_DATA['STAND_C'] as any;
      expect(action.startup).toBe(fd.startup);
      expect(action.active).toBe(fd.active);
      expect(action.recovery).toBe(fd.recovery);
    });

    it('attack actions have collision data on active frames', () => {
      for (const [actionId, contract] of RYO_ACTION_CONTRACTS) {
        if (contract.active === 0) continue;
        const activeFrame = contract.frames[contract.startup];
        expect(activeFrame.collision, `${actionId} first active frame should have collision`).not.toBeNull();
      }
    });

    it('DM actions have super_flash event on first frame', () => {
      const dmActions = ['dm_ten_ha_ou', 'dm_ryuko_ranbu', 'sdm_ryuko_ranbu', 'sdm_ten_ha_ou', 'hsdm_ryuko_ranbu'];
      for (const actionId of dmActions) {
        const action = RYO_ACTION_CONTRACTS.get(actionId);
        expect(action!.frames[0].eventTags).toContain('super_flash');
      }
    });

    it('attack actions have swing event on first active frame', () => {
      const attacks = ['stand_a', 'stand_c', 'ryo_koou', 'ryo_ko_hou'];
      for (const actionId of attacks) {
        const action = RYO_ACTION_CONTRACTS.get(actionId)!;
        const firstActive = action.startup;
        expect(action.frames[firstActive].eventTags).toContain('swing');
      }
    });

    it('cancel windows have valid frame ranges', () => {
      for (const [actionId, contract] of RYO_ACTION_CONTRACTS) {
        for (const cw of contract.cancelWindows) {
          expect(cw.frames[0], `${actionId} cancel start`).toBeGreaterThanOrEqual(0);
          expect(cw.frames[1], `${actionId} cancel end >= start`).toBeGreaterThanOrEqual(cw.frames[0]);
          expect(cw.targetTypes.length, `${actionId} cancel target types`).toBeGreaterThan(0);
        }
      }
    });

    it('specials have feedbackTierOverride set', () => {
      const specials = ['ryo_koou', 'ryo_ko_hou', 'ryo_hien', 'ryo_haou'];
      for (const actionId of specials) {
        const action = RYO_ACTION_CONTRACTS.get(actionId)!;
        expect(action.feedbackTierOverride, `${actionId} should have feedback tier`).toBeTruthy();
      }
    });

    it('all frames have positive duration', () => {
      for (const [actionId, contract] of RYO_ACTION_CONTRACTS) {
        for (const frame of contract.frames) {
          expect(frame.sprite.duration, `${actionId} frame ${frame.frameIndex} duration`).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('getRyoFrameContractManifest', () => {
    it('returns the manifest with characterId ryo', () => {
      const manifest = getRyoFrameContractManifest();
      expect(manifest.characterId).toBe('ryo');
      expect(manifest.actions).toBeInstanceOf(Map);
    });

    it('manifest actions match RYO_ACTION_CONTRACTS', () => {
      const manifest = getRyoFrameContractManifest();
      expect(manifest.actions.size).toBe(RYO_ACTION_CONTRACTS.size);
    });
  });
});
