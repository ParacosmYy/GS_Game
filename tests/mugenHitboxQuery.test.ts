/**
 * mugenHitboxQuery.test.ts
 *
 * Tests for the content-package-facing MUGEN hitbox query layer.
 * Validates that content packages can correctly query MUGEN data.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { registerHitboxData, hasMugenHitboxes } from '../src/rendering/sprites/shared/mugenHitboxLoader.js';
import {
  getMugenAttackTiming,
  getMugenAttackFrameData,
  getMugenActionSummary,
  hasCharacterMugenData,
  getCharacterMugenActions,
  getCharacterHurtboxStats,
} from '../src/rendering/sprites/shared/mugenHitboxQuery.js';

// Import content package hitbox modules to verify they load
import {
  hasKyoMugenData,
  getKyoMugenTiming,
  getKyoAttackTiming,
  KYO_MUGEN_ACTION_MAP,
} from '../src/content/characters/kyo/hitboxes/kyoHitboxes.js';
import {
  hasRyoMugenData,
  getRyoMugenTiming,
  getRyoAttackTiming,
  RYO_MUGEN_ACTION_MAP,
} from '../src/content/characters/ryo/hitboxes/ryoHitboxes.js';
import {
  hasTerryMugenData,
  getTerryMugenTiming,
  getTerryAttackTiming,
  TERRY_MUGEN_ACTION_MAP,
} from '../src/content/characters/terry/hitboxes/terryHitboxes.js';
import {
  hasKimMugenData,
  getKimMugenTiming,
  getKimAttackTiming,
  KIM_MUGEN_ACTION_MAP,
} from '../src/content/characters/kim/hitboxes/kimHitboxes.js';
import {
  hasAthenaMugenData,
  getAthenaMugenTiming,
  getAthenaAttackTiming,
  ATHENA_MUGEN_ACTION_MAP,
} from '../src/content/characters/athena/hitboxes/athenaHitboxes.js';
import {
  hasViceMugenData,
  getViceMugenTiming,
  getViceAttackTiming,
  VICE_MUGEN_ACTION_MAP,
} from '../src/content/characters/vice/hitboxes/viceHitboxes.js';

const SPRITES_DIR = path.resolve(__dirname, '../public/sprites');

function loadAndRegisterHitboxes(mugenDir: string): void {
  const p = path.join(SPRITES_DIR, mugenDir, 'hitboxes.json');
  if (!fs.existsSync(p)) return;
  const data = JSON.parse(fs.readFileSync(p, 'utf-8'));
  registerHitboxData(mugenDir, data);
}

describe('mugenHitboxQuery', () => {
  beforeAll(() => {
    loadAndRegisterHitboxes('cvskyo');
    loadAndRegisterHitboxes('cvsryo');
    loadAndRegisterHitboxes('cvsterry');
    loadAndRegisterHitboxes('cvskim');
    loadAndRegisterHitboxes('cvsathena');
    loadAndRegisterHitboxes('cvsvice');
  });

  describe('query functions', () => {
    it('hasCharacterMugenData returns true for registered data', () => {
      expect(hasCharacterMugenData('cvskyo')).toBe(true);
      expect(hasCharacterMugenData('cvsryo')).toBe(true);
    });

    it('hasCharacterMugenData returns false for unknown', () => {
      expect(hasCharacterMugenData('unknown')).toBe(false);
    });

    it('getMugenAttackTiming returns timing for known action', () => {
      const timing = getMugenAttackTiming('cvskyo', '200');
      expect(timing).not.toBeNull();
      expect(timing!.startup).toBeGreaterThanOrEqual(0);
      expect(timing!.active).toBeGreaterThan(0);
      expect(timing!.recovery).toBeGreaterThanOrEqual(0);
      expect(timing!.total).toBe(timing!.startup + timing!.active + timing!.recovery);
    });

    it('getMugenAttackTiming returns null for unknown action', () => {
      expect(getMugenAttackTiming('cvskyo', '99999')).toBeNull();
    });

    it('getMugenAttackFrameData returns frame array', () => {
      const frames = getMugenAttackFrameData('cvskyo', '200');
      expect(frames).not.toBeNull();
      expect(frames!.length).toBeGreaterThan(0);
      // At least one frame should have attack boxes
      const framesWithAttacks = frames!.filter(f => f.attackBoxes.length > 0);
      expect(framesWithAttacks.length).toBeGreaterThan(0);
    });

    it('getMugenActionSummary combines timing and frames', () => {
      const summary = getMugenActionSummary('cvskyo', '200');
      expect(summary).not.toBeNull();
      expect(summary!.timing.total).toBeGreaterThan(0);
      expect(summary!.activeFrames.length).toBeGreaterThan(0);
    });

    it('getCharacterMugenActions returns action list', () => {
      const actions = getCharacterMugenActions('cvskyo');
      expect(actions.length).toBeGreaterThan(50);
      expect(actions).toContain('200');
      // Attack actions only (no idle/walk since they have no attack boxes)
    });

    it('getCharacterHurtboxStats returns stats for registered data', () => {
      const stats = getCharacterHurtboxStats('cvskyo');
      expect(stats.hasData).toBeDefined();
    });
  });

  describe('Kyo content package integration', () => {
    it('has valid MUGEN action map', () => {
      expect(Object.keys(KYO_MUGEN_ACTION_MAP).length).toBeGreaterThan(20);
    });

    it('maps CLOSE_A to action 200', () => {
      expect(KYO_MUGEN_ACTION_MAP.CLOSE_A).toBe('200');
    });

    it('maps ONIYAKI to action 1000', () => {
      expect(KYO_MUGEN_ACTION_MAP.KYO_ONIYAKI).toBe('1000');
    });

    it('maps DM_OROCHINAGI to action 2000', () => {
      expect(KYO_MUGEN_ACTION_MAP.DM_OROCHINAGI).toBe('2000');
    });

    it('hasKyoMugenData returns correct state', () => {
      expect(hasKyoMugenData()).toBe(true);
    });

    it('getKyoMugenTiming returns timing for specials', () => {
      const timing = getKyoMugenTiming('KYO_ONIYAKI');
      expect(timing).not.toBeNull();
      expect(timing!.active).toBeGreaterThan(0);
    });

    it('getKyoAttackTiming falls back to MUGEN for known attacks', () => {
      const timing = getKyoAttackTiming('KYO_ONIYAKI');
      expect(timing).not.toBeNull();
      expect(timing!.total).toBeGreaterThan(0);
    });

    it('getKyoAttackTiming returns null for unknown attack', () => {
      expect(getKyoAttackTiming('UNKNOWN_ATTACK')).toBeNull();
    });
  });

  describe('Ryo content package integration', () => {
    it('has valid MUGEN action map', () => {
      expect(Object.keys(RYO_MUGEN_ACTION_MAP).length).toBeGreaterThan(15);
    });

    it('maps CLOSE_A to action 200', () => {
      expect(RYO_MUGEN_ACTION_MAP.CLOSE_A).toBe('200');
    });

    it('maps KOOU to action 1000', () => {
      expect(RYO_MUGEN_ACTION_MAP.RYO_KOOU).toBe('1000');
    });

    it('maps DM_RYUKO_RANBU to action 3000', () => {
      expect(RYO_MUGEN_ACTION_MAP.DM_RYUKO_RANBU).toBe('3000');
    });

    it('hasRyoMugenData returns correct state', () => {
      expect(hasRyoMugenData()).toBe(true);
    });

    it('getRyoMugenTiming returns timing for specials with hitbox data', () => {
      // RYO_KO_HOU maps to action 1100 which exists in cvsryo hitboxes
      const timing = getRyoMugenTiming('RYO_KO_HOU');
      expect(timing).not.toBeNull();
      expect(timing!.active).toBeGreaterThan(0);
    });

    it('getRyoAttackTiming uses MUGEN data when available', () => {
      const timing = getRyoAttackTiming('RYO_KO_HOU');
      expect(timing).not.toBeNull();
      expect(timing!.total).toBeGreaterThan(0);
    });

    it('getRyoAttackTiming returns null for unknown attack', () => {
      expect(getRyoAttackTiming('UNKNOWN_ATTACK')).toBeNull();
    });
  });

  describe('cross-character timing comparison', () => {
    it('stand A has consistent timing across characters', () => {
      const kyoTiming = getMugenAttackTiming('cvskyo', '200');
      const ryoTiming = getMugenAttackTiming('cvsryo', '200');
      if (kyoTiming && ryoTiming) {
        // Both should have reasonable active frames for stand A
        expect(kyoTiming.active).toBeGreaterThan(0);
        expect(ryoTiming.active).toBeGreaterThan(0);
        // Stand A should be fast (< 20 total ticks)
        expect(kyoTiming.total).toBeLessThan(20);
        expect(ryoTiming.total).toBeLessThan(20);
      }
    });

    it('specials have longer total duration than normals', () => {
      const normalTiming = getMugenAttackTiming('cvskyo', '200');
      const specialTiming = getMugenAttackTiming('cvskyo', '1000');
      if (normalTiming && specialTiming) {
        expect(specialTiming.total).toBeGreaterThan(normalTiming.total);
      }
    });
  });

  describe('Terry content package integration', () => {
    it('has valid MUGEN action map', () => {
      expect(Object.keys(TERRY_MUGEN_ACTION_MAP).length).toBeGreaterThan(15);
    });

    it('maps POWER_WAVE to action 1000', () => {
      expect(TERRY_MUGEN_ACTION_MAP.TERRY_POWER_WAVE).toBe('1000');
    });

    it('hasTerryMugenData returns correct state', () => {
      expect(hasTerryMugenData()).toBe(true);
    });

    it('getTerryAttackTiming returns timing for specials', () => {
      const timing = getTerryAttackTiming('TERRY_POWER_WAVE');
      expect(timing).not.toBeNull();
      expect(timing!.total).toBeGreaterThan(0);
    });

    it('getTerryAttackTiming returns null for unknown attack', () => {
      expect(getTerryAttackTiming('UNKNOWN_ATTACK')).toBeNull();
    });

    it('getTerryMugenActions returns action list', () => {
      const actions = getCharacterMugenActions('cvsterry');
      expect(actions.length).toBeGreaterThan(30);
    });
  });

  describe('Kim content package integration', () => {
    it('has valid MUGEN action map', () => {
      expect(Object.keys(KIM_MUGEN_ACTION_MAP).length).toBeGreaterThan(15);
    });

    it('maps HIENZAN to action 1000', () => {
      expect(KIM_MUGEN_ACTION_MAP.KIM_HIENZAN).toBe('1000');
    });

    it('hasKimMugenData returns correct state', () => {
      expect(hasKimMugenData()).toBe(true);
    });

    it('getKimAttackTiming returns timing for specials', () => {
      const timing = getKimAttackTiming('KIM_HIENZAN');
      expect(timing).not.toBeNull();
      expect(timing!.total).toBeGreaterThan(0);
    });

    it('getKimAttackTiming returns null for unknown attack', () => {
      expect(getKimAttackTiming('UNKNOWN_ATTACK')).toBeNull();
    });

    it('getKimMugenActions returns action list', () => {
      const actions = getCharacterMugenActions('cvskim');
      expect(actions.length).toBeGreaterThan(30);
    });
  });

  describe('Athena content package integration', () => {
    it('has valid MUGEN action map', () => {
      expect(Object.keys(ATHENA_MUGEN_ACTION_MAP).length).toBeGreaterThan(15);
    });

    it('maps PSYCHO_BALL to action 1000', () => {
      expect(ATHENA_MUGEN_ACTION_MAP.ATHENA_PSYCHO_BALL).toBe('1000');
    });

    it('hasAthenaMugenData returns correct state', () => {
      expect(hasAthenaMugenData()).toBe(true);
    });

    it('getAthenaAttackTiming returns timing for specials', () => {
      const timing = getAthenaAttackTiming('ATHENA_PSYCHO_BALL');
      expect(timing).not.toBeNull();
      expect(timing!.total).toBeGreaterThan(0);
    });

    it('getAthenaAttackTiming returns null for unknown attack', () => {
      expect(getAthenaAttackTiming('UNKNOWN_ATTACK')).toBeNull();
    });
  });

  describe('Vice content package integration', () => {
    it('has valid MUGEN action map', () => {
      expect(Object.keys(VICE_MUGEN_ACTION_MAP).length).toBeGreaterThan(15);
    });

    it('maps OUTRAGE to action 1000', () => {
      expect(VICE_MUGEN_ACTION_MAP.VICE_OUTRAGE).toBe('1000');
    });

    it('hasViceMugenData returns correct state', () => {
      expect(hasViceMugenData()).toBe(true);
    });

    it('getViceAttackTiming returns timing for specials', () => {
      const timing = getViceAttackTiming('VICE_OUTRAGE');
      expect(timing).not.toBeNull();
      expect(timing!.total).toBeGreaterThan(0);
    });

    it('getViceAttackTiming returns null for unknown attack', () => {
      expect(getViceAttackTiming('UNKNOWN_ATTACK')).toBeNull();
    });
  });
});
