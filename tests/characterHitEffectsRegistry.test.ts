/**
 * Character Hit Effects Registry Tests
 *
 * Validates the hit effects plugin registry:
 * - registerHitEffects adds/replaces plugins
 * - dispatchHitVFX/dispatchHitSFX route to correct plugins
 * - getRegisteredEffectIds returns correct list
 * - Unregistered attacks return false
 * - Prefix matching works correctly
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  registerHitEffects,
  dispatchHitVFX,
  dispatchHitSFX,
  getRegisteredEffectIds,
} from '../src/content/characterHitEffects.js';
import type { CharacterHitEffects, HitEffectContext } from '../src/content/characterHitEffects.js';

// Import production plugins to populate registry
import { RYO_HIT_EFFECTS } from '../src/content/characters/ryo/hitEffects/ryoHitEffects.js';
import { KYO_HIT_EFFECTS } from '../src/content/characters/kyo/hitEffects/kyoHitEffects.js';
import { IORI_HIT_EFFECTS } from '../src/content/characters/iori/hitEffects/ioriHitEffects.js';

// Ensure plugins are registered
registerHitEffects(RYO_HIT_EFFECTS);
registerHitEffects(KYO_HIT_EFFECTS);
registerHitEffects(IORI_HIT_EFFECTS);

function makeCtx(attackType: string): HitEffectContext {
  return {
    vfx: {} as any,
    screenShake: {} as any,
    screenFlash: {} as any,
    cinematic: {} as any,
    attacker: {} as any,
    defender: {} as any,
    attackType: attackType as any,
    hitX: 100,
    hitY: 200,
    counterHit: false,
    combo: 1,
    attackDirectionBias: 1,
    defIdx: 0,
  };
}

describe('Character Hit Effects Registry', () => {
  describe('getRegisteredEffectIds', () => {
    it('returns an array', () => {
      expect(Array.isArray(getRegisteredEffectIds())).toBe(true);
    });

    it('includes Ryo, Kyo, Iori from production plugins', () => {
      const ids = getRegisteredEffectIds();
      expect(ids).toContain('ryo');
      expect(ids).toContain('kyo');
      expect(ids).toContain('iori');
    });

    it('all IDs are unique', () => {
      const ids = getRegisteredEffectIds();
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe('registerHitEffects — add and replace', () => {
    let vfxCalls: string[];
    let sfxCalls: string[];

    beforeEach(() => {
      vfxCalls = [];
      sfxCalls = [];
    });

    it('new plugin gets dispatched', () => {
      const testPlugin: CharacterHitEffects = {
        charId: '__test_char',
        prefixes: ['TEST_'],
        onHitVFX: (ctx) => { vfxCalls.push(ctx.attackType as string); return true; },
        onHitSFX: (ctx) => { sfxCalls.push(ctx.attackType as string); return true; },
      };
      registerHitEffects(testPlugin);

      const ctx = makeCtx('TEST_ATTACK_A');
      expect(dispatchHitVFX(ctx)).toBe(true);
      expect(vfxCalls).toEqual(['TEST_ATTACK_A']);

      expect(dispatchHitSFX(ctx)).toBe(true);
      expect(sfxCalls).toEqual(['TEST_ATTACK_A']);
    });

    it('replacing a plugin updates dispatch', () => {
      let calls2: string[] = [];
      const plugin2: CharacterHitEffects = {
        charId: '__test_char',
        prefixes: ['TEST_'],
        onHitVFX: (ctx) => { calls2.push('v2:' + ctx.attackType); return true; },
        onHitSFX: (ctx) => { calls2.push('s2:' + ctx.attackType); return true; },
      };
      registerHitEffects(plugin2);

      const ctx = makeCtx('TEST_ATTACK_B');
      dispatchHitVFX(ctx);
      expect(calls2).toEqual(['v2:TEST_ATTACK_B']);
    });

    it('unregistered prefix returns false', () => {
      const ctx = makeCtx('UNKNOWN_ATTACK');
      expect(dispatchHitVFX(ctx)).toBe(false);
      expect(dispatchHitSFX(ctx)).toBe(false);
    });
  });

  describe('prefix matching', () => {
    it('matches prefix at start of attack name', () => {
      let matched = false;
      registerHitEffects({
        charId: '__prefix_test',
        prefixes: ['PRE_'],
        onHitVFX: () => { matched = true; return true; },
        onHitSFX: () => true,
      });

      dispatchHitVFX(makeCtx('PRE_SOMETHING'));
      expect(matched).toBe(true);
    });

    it('does not match prefix in the middle', () => {
      let matched = false;
      registerHitEffects({
        charId: '__prefix_mid',
        prefixes: ['MID_'],
        onHitVFX: () => { matched = true; return true; },
        onHitSFX: () => true,
      });

      dispatchHitVFX(makeCtx('X_MID_SOMETHING'));
      expect(matched).toBe(false);
    });

    it('plugin with multiple prefixes matches any', () => {
      let vfxCalled = false;
      registerHitEffects({
        charId: '__multi_prefix',
        prefixes: ['AAA_', 'BBB_'],
        onHitVFX: () => { vfxCalled = true; return true; },
        onHitSFX: () => true,
      });

      dispatchHitVFX(makeCtx('AAA_X'));
      expect(vfxCalled).toBe(true);

      vfxCalled = false;
      dispatchHitVFX(makeCtx('BBB_Y'));
      expect(vfxCalled).toBe(true);
    });
  });

  describe('production Ryo plugin dispatch', () => {
    it('dispatches VFX for RYO_ prefixed attacks', () => {
      const ctx = makeCtx('RYO_STAND_A');
      // Should not throw — may return true or false depending on attack type
      expect(() => dispatchHitVFX(ctx)).not.toThrow();
    });

    it('dispatches SFX for RYO_ prefixed attacks', () => {
      const ctx = makeCtx('RYO_STAND_A');
      expect(() => dispatchHitSFX(ctx)).not.toThrow();
    });

    it('dispatches VFX for DM_TEN prefixed attacks (Ryo DM)', () => {
      const ctx = makeCtx('DM_TENHA_HAIKYOKU');
      expect(() => dispatchHitVFX(ctx)).not.toThrow();
    });
  });

  describe('production Kyo plugin dispatch', () => {
    it('dispatches for KYO_ prefixed attacks', () => {
      const ctx = makeCtx('KYO_STAND_A');
      expect(() => dispatchHitVFX(ctx)).not.toThrow();
      expect(() => dispatchHitSFX(ctx)).not.toThrow();
    });
  });

  describe('production Iori plugin dispatch', () => {
    it('dispatches for IORI_ prefixed attacks', () => {
      const ctx = makeCtx('IORI_STAND_A');
      expect(() => dispatchHitVFX(ctx)).not.toThrow();
      expect(() => dispatchHitSFX(ctx)).not.toThrow();
    });
  });
});
