/**
 * Tests for Benimaru/Heidern/Yuri AI combo routes and strategies
 */
import { describe, it, expect } from 'vitest';
import { COMBO_ROUTES, routeComboSpecial } from '../ai/aiRoutes.js';
import { ALL_STRATEGIES } from '../ai/characterStrategies.js';
import { AttackType } from '../core/types.js';

describe('Benimaru AI integration', () => {
  it('has combo route', () => {
    expect(COMBO_ROUTES.benimaru).toBeDefined();
    expect(COMBO_ROUTES.benimaru.length).toBeGreaterThanOrEqual(3);
  });

  it('combo route starts with closeC', () => {
    expect(COMBO_ROUTES.benimaru[0].attack).toBe('closeC');
  });

  it('combo route ends with DM', () => {
    const last = COMBO_ROUTES.benimaru[COMBO_ROUTES.benimaru.length - 1];
    expect(last.type).toBe('special');
    expect(last.attack).toContain('dm');
  });

  it('has AI strategy', () => {
    const strategy = ALL_STRATEGIES.find(s => s.charId === 'benimaru');
    expect(strategy).toBeDefined();
  });

  it('strategy preferredDM matches FRAME_DATA', () => {
    const strategy = ALL_STRATEGIES.find(s => s.charId === 'benimaru');
    expect(strategy?.preferredDM).toBe(AttackType.DM_BENIMARU_RAIKOUKEN);
  });

  it('strategy anti-air is Inazuma Kick', () => {
    const strategy = ALL_STRATEGIES.find(s => s.charId === 'benimaru');
    expect(strategy?.preferredAntiAir).toBe(AttackType.BENIMARU_SUPER_INAZUMA_KICK);
  });

  it('preferredRange is mid', () => {
    const strategy = ALL_STRATEGIES.find(s => s.charId === 'benimaru');
    expect(strategy?.preferredRange).toBe('mid');
  });

  it('routeComboSpecial returns correct attack types', () => {
    const result = routeComboSpecial('benimaru', 'benimaruRaijinken', {} as any, {} as any, 0);
    expect(result).toBe(AttackType.BENIMARU_RAIJINKEN);
  });

  it('routeComboSpecial returns correct DM', () => {
    const result = routeComboSpecial('benimaru', 'dmRaikouken', {} as any, {} as any, 0);
    expect(result).toBe(AttackType.DM_BENIMARU_RAIKOUKEN);
  });

  it('routeComboSpecial returns fallback for unknown attack', () => {
    const result = routeComboSpecial('benimaru', 'unknownAttack', {} as any, {} as any, 0);
    expect(result).toBe(AttackType.BENIMARU_RAIJINKEN);
  });
});

describe('Heidern AI integration', () => {
  it('has combo route', () => {
    expect(COMBO_ROUTES.heidern).toBeDefined();
    expect(COMBO_ROUTES.heidern.length).toBeGreaterThanOrEqual(3);
  });

  it('combo route starts with closeC', () => {
    expect(COMBO_ROUTES.heidern[0].attack).toBe('closeC');
  });

  it('has AI strategy', () => {
    const strategy = ALL_STRATEGIES.find(s => s.charId === 'heidern');
    expect(strategy).toBeDefined();
  });

  it('strategy preferredDM is DM_HEIDERN_END', () => {
    const strategy = ALL_STRATEGIES.find(s => s.charId === 'heidern');
    expect(strategy?.preferredDM).toBe(AttackType.DM_HEIDERN_END);
  });

  it('strategy anti-air is Moon Slasher', () => {
    const strategy = ALL_STRATEGIES.find(s => s.charId === 'heidern');
    expect(strategy?.preferredAntiAir).toBe(AttackType.HEIDERN_MOON_SLASHER);
  });

  it('wakeUpOptions include grab moves', () => {
    const strategy = ALL_STRATEGIES.find(s => s.charId === 'heidern');
    expect(strategy?.wakeUpOptions).toContain(AttackType.HEIDERN_STORMBRINGER);
    expect(strategy?.wakeUpOptions).toContain(AttackType.HEIDERN_NECK_ROLLER);
  });

  it('routeComboSpecial routes Stormbringer', () => {
    const result = routeComboSpecial('heidern', 'heidernStormbringer', {} as any, {} as any, 0);
    expect(result).toBe(AttackType.HEIDERN_STORMBRINGER);
  });

  it('routeComboSpecial routes DM', () => {
    const result = routeComboSpecial('heidern', 'dmHeidernEnd', {} as any, {} as any, 0);
    expect(result).toBe(AttackType.DM_HEIDERN_END);
  });

  it('routeComboSpecial routes Critical Driver', () => {
    const result = routeComboSpecial('heidern', 'dmCriticalDriver', {} as any, {} as any, 0);
    expect(result).toBe(AttackType.DM_CRITICAL_DRIVER);
  });

  it('routeComboSpecial returns fallback for unknown', () => {
    const result = routeComboSpecial('heidern', 'unknownAttack', {} as any, {} as any, 0);
    expect(result).toBe(AttackType.HEIDERN_CROSS_CUTTER);
  });
});

describe('Yuri AI integration', () => {
  it('has combo route', () => {
    expect(COMBO_ROUTES.yuri).toBeDefined();
    expect(COMBO_ROUTES.yuri.length).toBeGreaterThanOrEqual(3);
  });

  it('combo route starts with closeC', () => {
    expect(COMBO_ROUTES.yuri[0].attack).toBe('closeC');
  });

  it('has AI strategy', () => {
    const strategy = ALL_STRATEGIES.find(s => s.charId === 'yuri');
    expect(strategy).toBeDefined();
  });

  it('strategy preferredDM is DM_YURI_HAOH_SHO_KO_KEN', () => {
    const strategy = ALL_STRATEGIES.find(s => s.charId === 'yuri');
    expect(strategy?.preferredDM).toBe(AttackType.DM_YURI_HAOH_SHO_KO_KEN);
  });

  it('strategy anti-air is Chou Upper', () => {
    const strategy = ALL_STRATEGIES.find(s => s.charId === 'yuri');
    expect(strategy?.preferredAntiAir).toBe(AttackType.YURI_CHOU_UPPER);
  });

  it('preferredRange is mid', () => {
    const strategy = ALL_STRATEGIES.find(s => s.charId === 'yuri');
    expect(strategy?.preferredRange).toBe('mid');
  });

  it('routeComboSpecial routes KoOuKen', () => {
    const result = routeComboSpecial('yuri', 'yuriKoOuKen', {} as any, {} as any, 0);
    expect(result).toBe(AttackType.YURI_KO_OU_KEN);
  });

  it('routeComboSpecial routes DM', () => {
    const result = routeComboSpecial('yuri', 'dmYuriHaohShoKoKen', {} as any, {} as any, 0);
    expect(result).toBe(AttackType.DM_YURI_HAOH_SHO_KO_KEN);
  });

  it('routeComboSpecial routes SDM', () => {
    const result = routeComboSpecial('yuri', 'sdmYuriHaohShoKoKen', {} as any, {} as any, 0);
    expect(result).toBe(AttackType.SDM_YURI_HAOH_SHO_KO_KEN);
  });

  it('routeComboSpecial returns fallback for unknown', () => {
    const result = routeComboSpecial('yuri', 'unknownAttack', {} as any, {} as any, 0);
    expect(result).toBe(AttackType.YURI_KO_OU_KEN);
  });
});

describe('Cross-character AI alignment', () => {
  const newChars = ['benimaru', 'heidern', 'yuri'];

  it('all new chars have strategies with aggressiveLevel in [0,1]', () => {
    for (const charId of newChars) {
      const strategy = ALL_STRATEGIES.find(s => s.charId === charId);
      expect(strategy).toBeDefined();
      expect(strategy!.aggressiveLevel).toBeGreaterThanOrEqual(0);
      expect(strategy!.aggressiveLevel).toBeLessThanOrEqual(1);
    }
  });

  it('all new chars have at least 2 wake-up options', () => {
    for (const charId of newChars) {
      const strategy = ALL_STRATEGIES.find(s => s.charId === charId);
      expect(strategy!.wakeUpOptions.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('all new chars preferredDM starts with DM_', () => {
    for (const charId of newChars) {
      const strategy = ALL_STRATEGIES.find(s => s.charId === charId);
      expect(strategy!.preferredDM).toMatch(/^DM_/);
    }
  });
});
