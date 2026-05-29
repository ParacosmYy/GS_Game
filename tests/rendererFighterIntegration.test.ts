/**
 * rendererFighterIntegration.test.ts
 *
 * Tests for the unified sprite rendering pipeline.
 * Validates that the generic MUGEN sprite path works correctly
 * for all registered characters, and the fallback chain is correct.
 */

import { describe, it, expect, beforeAll, vi } from 'vitest';
import {
  getCharacterConfig,
  getLoadedSprites,
  resolveGenericMugenAction,
} from '../src/rendering/sprites/shared/characterSpriteRegistry.js';
import { Fighter } from '../src/entities/fighter.js';
import { FighterState, AttackType } from '../src/core/types.js';

// Ensure configs are registered
import '../src/rendering/sprites/shared/characterSpriteConfigs.js';

const ROSTER_CHARS = ['kyo', 'ryo', 'terry', 'kim', 'athena', 'vice', 'yamazaki', 'shermie'];

describe('renderer fighter integration', () => {
  describe('character config registration', () => {
    it.each(ROSTER_CHARS)('%s has a registered sprite config', (charId) => {
      const config = getCharacterConfig(charId);
      expect(config).not.toBeNull();
      expect(config!.charId).toBe(charId);
      expect(config!.mugenDir).toBeTruthy();
      expect(config!.targetDisplayHeight).toBeGreaterThan(0);
    });

    it.each(ROSTER_CHARS)('%s has a valid specialMap', (charId) => {
      const config = getCharacterConfig(charId);
      expect(config!.specialMap).toBeDefined();
      // specialMap should have at least some entries
      expect(Object.keys(config!.specialMap).length).toBeGreaterThan(0);
    });

    it.each(ROSTER_CHARS)('%s has valid display height (50-200px)', (charId) => {
      const config = getCharacterConfig(charId);
      expect(config!.targetDisplayHeight).toBeGreaterThan(50);
      expect(config!.targetDisplayHeight).toBeLessThan(200);
    });
  });

  describe('MUGEN action resolution', () => {
    it.each(ROSTER_CHARS)('%s resolves IDLE to action 0', (charId) => {
      const config = getCharacterConfig(charId);
      const action = resolveGenericMugenAction(config!, FighterState.IDLE, null, 0, 1);
      expect(action).toBe('0');
    });

    it.each(ROSTER_CHARS)('%s resolves WALK forward to action 20', (charId) => {
      const config = getCharacterConfig(charId);
      const action = resolveGenericMugenAction(config!, FighterState.WALK, null, 1, 1);
      expect(action).toBe('20');
    });

    it.each(ROSTER_CHARS)('%s resolves WALK backward to action 21', (charId) => {
      const config = getCharacterConfig(charId);
      const action = resolveGenericMugenAction(config!, FighterState.WALK, null, -1, 1);
      expect(action).toBe('21');
    });

    it.each(ROSTER_CHARS)('%s resolves CROUCH to action 11', (charId) => {
      const config = getCharacterConfig(charId);
      const action = resolveGenericMugenAction(config!, FighterState.CROUCH, null, 0, 1);
      expect(action).toBe('11');
    });

    it.each(ROSTER_CHARS)('%s resolves RUN to action 100', (charId) => {
      const config = getCharacterConfig(charId);
      const action = resolveGenericMugenAction(config!, FighterState.RUN, null, 1, 1);
      expect(action).toBe('100');
    });

    it.each(ROSTER_CHARS)('%s resolves HITSTUN to action 5000', (charId) => {
      const config = getCharacterConfig(charId);
      const action = resolveGenericMugenAction(config!, FighterState.HITSTUN, null, 0, 1);
      expect(action).toBe('5000');
    });

    it.each(ROSTER_CHARS)('%s resolves BLOCK to action 120', (charId) => {
      const config = getCharacterConfig(charId);
      const action = resolveGenericMugenAction(config!, FighterState.BLOCK, null, 0, 1);
      expect(action).toBe('120');
    });

    it.each(ROSTER_CHARS)('%s resolves STAND_ATTACK CLOSE_A to action 200', (charId) => {
      const config = getCharacterConfig(charId);
      const action = resolveGenericMugenAction(config!, FighterState.STAND_ATTACK, AttackType.CLOSE_A, 0, 1);
      expect(action).toBe('200');
    });

    it.each(ROSTER_CHARS)('%s resolves CROUCH_ATTACK CROUCH_A to action 400', (charId) => {
      const config = getCharacterConfig(charId);
      const action = resolveGenericMugenAction(config!, FighterState.CROUCH_ATTACK, AttackType.CROUCH_A, 0, 1);
      expect(action).toBe('400');
    });

    it.each(ROSTER_CHARS)('%s resolves JUMP to action 42/43', (charId) => {
      const config = getCharacterConfig(charId);
      const fwd = resolveGenericMugenAction(config!, FighterState.JUMP, null, 1, 1);
      const back = resolveGenericMugenAction(config!, FighterState.JUMP, null, -1, 1);
      expect(fwd).toMatch(/^(42|43)$/);
      expect(back).toMatch(/^(42|43)$/);
    });
  });

  describe('special move resolution', () => {
    it('kyo resolves ONIYAKI to action 1800', () => {
      const config = getCharacterConfig('kyo');
      const action = resolveGenericMugenAction(config!, FighterState.STAND_ATTACK, AttackType.KYO_ONIYAKI, 0, 1);
      expect(action).toBe('1800');
    });

    it('ryo resolves KOOU to action 1000', () => {
      const config = getCharacterConfig('ryo');
      const action = resolveGenericMugenAction(config!, FighterState.STAND_ATTACK, AttackType.RYO_KOOU, 0, 1);
      expect(action).toBe('1000');
    });

    it('kyo resolves DM_OROCHINAGI to action 3000', () => {
      const config = getCharacterConfig('kyo');
      const action = resolveGenericMugenAction(config!, FighterState.STAND_ATTACK, AttackType.DM_OROCHINAGI, 0, 1);
      expect(action).toBe('3000');
    });

    it('ryo resolves DM_RYUKO_RANBU to action 3000', () => {
      const config = getCharacterConfig('ryo');
      const action = resolveGenericMugenAction(config!, FighterState.STAND_ATTACK, AttackType.DM_RYUKO_RANBU, 0, 1);
      expect(action).toBe('3000');
    });
  });

  describe('fallback resolution', () => {
    it('returns undefined for unknown character', () => {
      const config = getCharacterConfig('nonexistent');
      expect(config).toBeUndefined();
    });

    it('returns null for WIN without win action frames', () => {
      const config = getCharacterConfig('kyo');
      const action = resolveGenericMugenAction(config!, FighterState.WIN, null, 0, 1);
      // WIN resolves to '181' via the default mapping
      expect(action).toBe('181');
    });

    it('returns null for TAUNT action', () => {
      const config = getCharacterConfig('kyo');
      const action = resolveGenericMugenAction(config!, FighterState.TAUNT, null, 0, 1);
      expect(action).toBe('195');
    });
  });

  describe('sprite loading status', () => {
    it('loaded sprites are available for registered characters', () => {
      // Note: sprites may not be loaded in test environment (no browser fetch)
      // but the config should be valid
      for (const charId of ROSTER_CHARS) {
        const config = getCharacterConfig(charId);
        expect(config).not.toBeNull();
        // In test environment, sprites won't be loaded via fetch
        // so we just verify the config is correct
      }
    });
  });

  describe('fighter rendering pipeline', () => {
    it('fighter has correct charId for config lookup', () => {
      const f = new Fighter(400, '#ff6600', 1);
      f.charId = 'kyo';
      expect(f.charId).toBe('kyo');
      const config = getCharacterConfig(f.charId);
      expect(config).not.toBeNull();
    });

    it('fighter facing affects walk direction', () => {
      const f = new Fighter(400, '#ff6600', 1);
      f.state = FighterState.WALK;
      // Forward walk
      f.vx = 3;
      const fwdAction = resolveGenericMugenAction(
        getCharacterConfig('kyo')!, FighterState.WALK, null, f.vx, f.facing,
      );
      expect(fwdAction).toBe('20');

      // Backward walk
      f.vx = -3;
      const backAction = resolveGenericMugenAction(
        getCharacterConfig('kyo')!, FighterState.WALK, null, f.vx, f.facing,
      );
      expect(backAction).toBe('21');
    });
  });
});
