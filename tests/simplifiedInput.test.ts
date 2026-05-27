import { describe, it, expect } from 'vitest';
import { resolveSimplified } from '../src/input/simplifiedInput.js';
import { AttackType } from '../src/core/types.js';
import type { CharacterDefinition } from '../src/characters/types.js';
import type { PowerGauge, MaxmodeState } from '../src/core/types.js';

function makeChar(id: string): CharacterDefinition {
  return { id } as CharacterDefinition;
}
function makeGauge(stocks: number): PowerGauge {
  return { stocks, level: stocks } as PowerGauge;
}
function makeMaxMode(active: boolean): MaxmodeState {
  return { active, timer: active ? 100 : 0 } as MaxmodeState;
}

describe('simplifiedInput', () => {
  describe('resolveSimplified - Ryo', () => {
    const ryo = makeChar('ryo');
    it('U triggers KOOU_C (虎煌)', () => {
      const r = resolveSimplified(true, false, false, ryo, makeGauge(0), makeMaxMode(false));
      expect(r.attack).toBe(AttackType.RYO_KOOU_C);
      expect(r.activateMax).toBe(false);
    });
    it('U in MAX triggers DM_TEN_HA_OU (天地霸煌拳)', () => {
      const r = resolveSimplified(true, false, false, ryo, makeGauge(0), makeMaxMode(true));
      expect(r.attack).toBe(AttackType.DM_TEN_HA_OU);
    });
    it('I triggers KO_HOU_C (虎咆)', () => {
      const r = resolveSimplified(false, true, false, ryo, makeGauge(0), makeMaxMode(false));
      expect(r.attack).toBe(AttackType.RYO_KO_HOU_C);
    });
    it('I in MAX triggers same KO_HOU_C', () => {
      const r = resolveSimplified(false, true, false, ryo, makeGauge(0), makeMaxMode(true));
      expect(r.attack).toBe(AttackType.RYO_KO_HOU_C);
    });
    it('O activates MAX when stocks >= 3', () => {
      const r = resolveSimplified(false, false, true, ryo, makeGauge(3), makeMaxMode(false));
      expect(r.activateMax).toBe(true);
      expect(r.attack).toBeNull();
    });
    it('O does not activate MAX with < 3 stocks', () => {
      const r = resolveSimplified(false, false, true, ryo, makeGauge(1), makeMaxMode(false));
      expect(r.activateMax).toBe(false);
    });
    it('O does not activate MAX when already active', () => {
      const r = resolveSimplified(false, false, true, ryo, makeGauge(3), makeMaxMode(true));
      expect(r.activateMax).toBe(false);
    });
    it('O does not activate MAX when no stocks', () => {
      const r = resolveSimplified(false, false, true, ryo, makeGauge(0), makeMaxMode(false));
      expect(r.activateMax).toBe(false);
    });
    it('no input returns null', () => {
      const r = resolveSimplified(false, false, false, ryo, makeGauge(0), makeMaxMode(false));
      expect(r.attack).toBeNull();
      expect(r.activateMax).toBe(false);
    });
  });

  describe('resolveSimplified - Kyo', () => {
    const kyo = makeChar('kyo');
    it('U triggers ARAGAMI', () => {
      expect(resolveSimplified(true, false, false, kyo, makeGauge(0), makeMaxMode(false)).attack)
        .toBe(AttackType.KYO_ARAGAMI);
    });
    it('U in MAX triggers DM_OROCHINAGI', () => {
      expect(resolveSimplified(true, false, false, kyo, makeGauge(0), makeMaxMode(true)).attack)
        .toBe(AttackType.DM_OROCHINAGI);
    });
    it('I triggers KYO_ONIYAKI_C', () => {
      expect(resolveSimplified(false, true, false, kyo, makeGauge(0), makeMaxMode(false)).attack)
        .toBe(AttackType.KYO_ONIYAKI_C);
    });
  });

  describe('resolveSimplified - Iori', () => {
    const iori = makeChar('iori');
    it('U triggers YAMIBARAI_C', () => {
      expect(resolveSimplified(true, false, false, iori, makeGauge(0), makeMaxMode(false)).attack)
        .toBe(AttackType.IORI_YAMIBARAI_C);
    });
    it('U in MAX triggers DM_YATAGARASU', () => {
      expect(resolveSimplified(true, false, false, iori, makeGauge(0), makeMaxMode(true)).attack)
        .toBe(AttackType.DM_YATAGARASU);
    });
  });

  describe('resolveSimplified - unknown character', () => {
    const unknown = makeChar('unknown_char');
    it('U falls back to SPECIAL_PROJECTILE', () => {
      expect(resolveSimplified(true, false, false, unknown, makeGauge(0), makeMaxMode(false)).attack)
        .toBe(AttackType.SPECIAL_PROJECTILE);
    });
    it('I falls back to SPECIAL_UPPER', () => {
      expect(resolveSimplified(false, true, false, unknown, makeGauge(0), makeMaxMode(false)).attack)
        .toBe(AttackType.SPECIAL_UPPER);
    });
  });
});
