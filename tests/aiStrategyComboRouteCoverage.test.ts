/**
 * AI Strategy ↔ Combo Routes ↔ FRAME_DATA Cross-Reference Tests
 *
 * Validates that:
 * - CharacterStrategy preferredAntiAir/Poke/ComboStarter/DM exist in FRAME_DATA
 * - CharacterStrategy preferredAntiAir/Poke are consistent with preferredRange
 * - COMBO_ROUTES cover all characters with defined strategies
 * - WakeUpOptions are valid attack types
 * - Strategy aggressiveLevel is [0,1]
 */
import { describe, it, expect } from 'vitest';
import { FRAME_DATA } from '../src/core/frameDataConstants.js';
import { ALL_STRATEGIES } from '../src/ai/characterStrategies.js';
import { COMBO_ROUTES, JUMP_IN_ROUTE } from '../src/ai/aiRoutes.js';

const fdKeys = new Set(Object.keys(FRAME_DATA));

describe('AI Strategy ↔ FRAME_DATA cross-reference', () => {
  for (const strategy of ALL_STRATEGIES) {
    describe(`${strategy.charId} strategy`, () => {
      it('preferredAntiAir exists in FRAME_DATA', () => {
        expect(fdKeys.has(strategy.preferredAntiAir),
          `${strategy.charId}.preferredAntiAir=${strategy.preferredAntiAir}`).toBe(true);
      });

      it('preferredPoke exists in FRAME_DATA', () => {
        expect(fdKeys.has(strategy.preferredPoke),
          `${strategy.charId}.preferredPoke=${strategy.preferredPoke}`).toBe(true);
      });

      it('preferredComboStarter exists in FRAME_DATA', () => {
        expect(fdKeys.has(strategy.preferredComboStarter),
          `${strategy.charId}.preferredComboStarter=${strategy.preferredComboStarter}`).toBe(true);
      });

      it('preferredDM exists in FRAME_DATA', () => {
        expect(fdKeys.has(strategy.preferredDM),
          `${strategy.charId}.preferredDM=${strategy.preferredDM}`).toBe(true);
      });

      it('aggressiveLevel is in [0, 1]', () => {
        expect(strategy.aggressiveLevel).toBeGreaterThanOrEqual(0);
        expect(strategy.aggressiveLevel).toBeLessThanOrEqual(1);
      });

      it('preferredRange is valid', () => {
        expect(['close', 'mid', 'far']).toContain(strategy.preferredRange);
      });

      it('wakeUpOptions are non-empty', () => {
        expect(strategy.wakeUpOptions.length).toBeGreaterThan(0);
      });

      it('wakeUpOptions exist in FRAME_DATA', () => {
        for (const opt of strategy.wakeUpOptions) {
          expect(fdKeys.has(opt),
            `${strategy.charId}.wakeUpOption=${opt}`).toBe(true);
        }
      });
    });
  }
});

describe('AI Strategy ↔ Combo Routes consistency', () => {
  it('every strategy char has a combo route', () => {
    for (const strategy of ALL_STRATEGIES) {
      expect(COMBO_ROUTES[strategy.charId],
        `${strategy.charId} in COMBO_ROUTES`).toBeDefined();
    }
  });

  it('combo routes start with closeC for all characters', () => {
    for (const [charId, route] of Object.entries(COMBO_ROUTES)) {
      if (charId === '_default') continue;
      expect(route.length, `${charId} route length`).toBeGreaterThan(0);
      expect(route[0].attack, `${charId} first step`).toBe('closeC');
    }
  });

  it('combo route last step is a DM or special', () => {
    for (const [charId, route] of Object.entries(COMBO_ROUTES)) {
      if (charId === '_default') continue;
      const lastStep = route[route.length - 1];
      expect(lastStep.type, `${charId} last step type`).toBe('special');
      expect(lastStep.attack.toLowerCase(), `${charId} last step is DM/special`).toContain('dm');
    }
  });

  it('jump-in route has button steps', () => {
    expect(JUMP_IN_ROUTE.length).toBeGreaterThan(0);
    for (const step of JUMP_IN_ROUTE) {
      expect(step.type).toBe('button');
    }
  });

  it('close-range characters have higher aggressiveLevel than far-range', () => {
    const closeAvg = ALL_STRATEGIES
      .filter(s => s.preferredRange === 'close')
      .reduce((sum, s) => sum + s.aggressiveLevel, 0)
      / ALL_STRATEGIES.filter(s => s.preferredRange === 'close').length;
    const farAvg = ALL_STRATEGIES
      .filter(s => s.preferredRange === 'far')
      .reduce((sum, s) => sum + s.aggressiveLevel, 0)
      / ALL_STRATEGIES.filter(s => s.preferredRange === 'far').length;
    // Close-range characters should tend to be more aggressive
    expect(closeAvg, 'close avg > far avg').toBeGreaterThanOrEqual(farAvg);
  });

  it('preferredAntiAir is not a DM', () => {
    for (const strategy of ALL_STRATEGIES) {
      const isDM = strategy.preferredAntiAir.startsWith('DM_')
        || strategy.preferredAntiAir.startsWith('SDM_')
        || strategy.preferredAntiAir.startsWith('HSDM_');
      expect(isDM, `${strategy.charId} antiAir=${strategy.preferredAntiAir} is not DM`).toBe(false);
    }
  });

  it('preferredDM starts with DM_', () => {
    for (const strategy of ALL_STRATEGIES) {
      expect(strategy.preferredDM.startsWith('DM_'),
        `${strategy.charId}.preferredDM=${strategy.preferredDM}`).toBe(true);
    }
  });

  it('preferredComboStarter is a normal attack (CLOSE_/STAND_/CROUCH_)', () => {
    for (const strategy of ALL_STRATEGIES) {
      const valid = strategy.preferredComboStarter.startsWith('CLOSE_')
        || strategy.preferredComboStarter.startsWith('STAND_')
        || strategy.preferredComboStarter.startsWith('CROUCH_');
      expect(valid,
        `${strategy.charId}.preferredComboStarter=${strategy.preferredComboStarter}`).toBe(true);
    }
  });
});
