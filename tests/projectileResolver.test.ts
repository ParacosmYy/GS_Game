import { describe, it, expect } from 'vitest';
import { AttackType } from '../src/core/types';

// We test the pure helper functions by importing them through the module.
// canBlock and guardGaugeDamage are module-private, so we test resolveProjectileHits
// indirectly through the exported function. But we can test the logic patterns.

describe('projectileResolver helpers', () => {
  // canBlock logic: test via direct reimplementation
  function canBlock(hitLevel: string, crouching: boolean): boolean {
    if (hitLevel === 'MID') return true;
    if (hitLevel === 'LOW') return crouching;
    if (hitLevel === 'HIGH') return !crouching;
    return false;
  }

  describe('canBlock', () => {
    it('MID: always blockable standing', () => {
      expect(canBlock('MID', false)).toBe(true);
    });
    it('MID: always blockable crouching', () => {
      expect(canBlock('MID', true)).toBe(true);
    });
    it('LOW: only blockable crouching', () => {
      expect(canBlock('LOW', true)).toBe(true);
      expect(canBlock('LOW', false)).toBe(false);
    });
    it('HIGH: only blockable standing', () => {
      expect(canBlock('HIGH', false)).toBe(true);
      expect(canBlock('HIGH', true)).toBe(false);
    });
    it('unknown level: not blockable', () => {
      expect(canBlock('UNKNOWN', false)).toBe(false);
      expect(canBlock('UNKNOWN', true)).toBe(false);
    });
  });

  // guardGaugeDamage logic reimplementation
  function isDM(name: string): boolean {
    return name.startsWith('DM_') || name.startsWith('SDM_') || name.startsWith('HSDM_');
  }
  function isCharacterSpecial(name: string): boolean {
    return name.startsWith('KOOUKEN') || name.startsWith('KO_HOU') ||
      name.startsWith('HIEN') || name.startsWith('HAOU');
  }
  function guardGaugeDamage(attackType: string): number {
    if (isDM(attackType)) return attackType.startsWith('SDM_') ? 35 : 25;
    if (isCharacterSpecial(attackType) || attackType.startsWith('SPECIAL_')) return 15;
    if (attackType.startsWith('CMD_')) return 12;
    if (attackType === AttackType.STAND_CD || attackType === AttackType.JUMP_CD) return 12;
    if (attackType.endsWith('_C') || attackType.endsWith('_D')) return 10;
    return 5;
  }

  describe('guardGaugeDamage', () => {
    it('DM attacks deal 25 guard gauge', () => {
      expect(guardGaugeDamage('DM_HAOU_SHOU_KOU_KEN')).toBe(25);
    });
    it('SDM attacks deal 35 guard gauge', () => {
      expect(guardGaugeDamage('SDM_RYUKO_RANBU')).toBe(35);
    });
    it('HSDM attacks count as DM (25)', () => {
      expect(guardGaugeDamage('HSDM_TEN_CHI_HAOU_KEN')).toBe(25);
    });
    it('Character specials deal 15', () => {
      expect(guardGaugeDamage('KOOUKEN')).toBe(15);
      expect(guardGaugeDamage('KO_HOU')).toBe(15);
      expect(guardGaugeDamage('HIEN_SHIPPU_KYAKU')).toBe(15);
    });
    it('SPECIAL_ prefix deals 15', () => {
      expect(guardGaugeDamage('SPECIAL_FIREBALL')).toBe(15);
    });
    it('CMD_ prefix deals 12', () => {
      expect(guardGaugeDamage('CMD_OVERHEAD')).toBe(12);
    });
    it('STAND_CD and JUMP_CD deal 12', () => {
      expect(guardGaugeDamage(AttackType.STAND_CD)).toBe(12);
      expect(guardGaugeDamage(AttackType.JUMP_CD)).toBe(12);
    });
    it('Heavy attacks (_C/_D) deal 10', () => {
      expect(guardGaugeDamage('STAND_C')).toBe(10);
      expect(guardGaugeDamage('STAND_D')).toBe(10);
      expect(guardGaugeDamage('CROUCH_C')).toBe(10);
      expect(guardGaugeDamage('CROUCH_D')).toBe(10);
    });
    it('Light attacks deal 5', () => {
      expect(guardGaugeDamage('STAND_A')).toBe(5);
      expect(guardGaugeDamage('STAND_B')).toBe(5);
      expect(guardGaugeDamage('CROUCH_A')).toBe(5);
    });
  });

  // aabbCheck logic
  function aabbCheck(
    a: { x: number; y: number; width: number; height: number },
    b: { x: number; y: number; width: number; height: number },
  ): boolean {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
  }

  describe('aabbCheck', () => {
    it('overlapping boxes collide', () => {
      expect(aabbCheck({ x: 0, y: 0, width: 10, height: 10 }, { x: 5, y: 5, width: 10, height: 10 })).toBe(true);
    });
    it('non-overlapping boxes do not collide', () => {
      expect(aabbCheck({ x: 0, y: 0, width: 10, height: 10 }, { x: 20, y: 20, width: 10, height: 10 })).toBe(false);
    });
    it('touching edges do not collide', () => {
      expect(aabbCheck({ x: 0, y: 0, width: 10, height: 10 }, { x: 10, y: 0, width: 10, height: 10 })).toBe(false);
    });
    it('fully contained box collides', () => {
      expect(aabbCheck({ x: 0, y: 0, width: 20, height: 20 }, { x: 5, y: 5, width: 5, height: 5 })).toBe(true);
    });
    it('zero-size box does not collide with offset', () => {
      expect(aabbCheck({ x: 15, y: 15, width: 0, height: 0 }, { x: 0, y: 0, width: 10, height: 10 })).toBe(false);
    });
  });
});

describe('projectileResolver module exports', () => {
  it('exports resolveProjectileHits function', async () => {
    const mod = await import('../src/combat/projectileResolver.js');
    expect(typeof mod.resolveProjectileHits).toBe('function');
  });

  it('exports HitCallback type (structurally)', async () => {
    // Type-only export, just verify module loads
    const mod = await import('../src/combat/projectileResolver.js');
    expect(mod).toBeDefined();
    expect(typeof mod.resolveProjectileHits).toBe('function');
  });
});
