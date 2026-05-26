import { describe, it, expect } from 'vitest';
import { FRAME_DATA } from '../src/core/frameDataConstants.js';

describe('FRAME_DATA — Ryo completeness', () => {
  const RYO_NORMALS = [
    'STAND_A', 'STAND_B', 'STAND_C', 'STAND_D',
    'CLOSE_A', 'CLOSE_B', 'CLOSE_C', 'CLOSE_D',
    'CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D',
    'JUMP_A', 'JUMP_B', 'JUMP_C', 'JUMP_D',
    'STAND_CD', 'JUMP_CD',
    'THROW', 'THROW_FORWARD', 'THROW_BACK',
  ];

  const RYO_SPECIALS = [
    'RYO_KOOU', 'RYO_KOOU_C',
    'RYO_KO_HOU', 'RYO_KO_HOU_C',
    'RYO_HIEN', 'RYO_HAOU',
  ];

  const RYO_DMS = [
    'DM_TEN_HA_OU', 'DM_RYUKO_RANBU',
    'SDM_RYUKO_RANBU',
  ];

  describe('normals exist', () => {
    for (const key of RYO_NORMALS) {
      it(`${key} has frame data entry`, () => {
        expect(FRAME_DATA).toHaveProperty(key);
      });
    }
  });

  describe('specials exist', () => {
    for (const key of RYO_SPECIALS) {
      it(`${key} has frame data entry`, () => {
        expect(FRAME_DATA).toHaveProperty(key);
      });
    }
  });

  describe('DM/SDM exist', () => {
    for (const key of RYO_DMS) {
      it(`${key} has frame data entry`, () => {
        expect(FRAME_DATA).toHaveProperty(key);
      });
    }
  });

  describe('frame data structure', () => {
    it('entries have startup/active/recovery fields', () => {
      const entry = FRAME_DATA['RYO_KOOU'] as Record<string, unknown>;
      expect(entry).toHaveProperty('startup');
      expect(entry).toHaveProperty('active');
      expect(entry).toHaveProperty('recovery');
    });

    it('startup is a positive number', () => {
      const entry = FRAME_DATA['RYO_KOOU'] as { startup: number };
      expect(entry.startup).toBeGreaterThan(0);
    });

    it('active is a positive number', () => {
      const entry = FRAME_DATA['RYO_KOOU'] as { active: number };
      expect(entry.active).toBeGreaterThan(0);
    });

    it('recovery is a positive number', () => {
      const entry = FRAME_DATA['RYO_KOOU'] as { recovery: number };
      expect(entry.recovery).toBeGreaterThan(0);
    });
  });

  describe('frame data logic', () => {
    it('specials have more startup than light normals', () => {
      const standA = FRAME_DATA['STAND_A'] as { startup: number };
      const koou = FRAME_DATA['RYO_KOOU'] as { startup: number };
      expect(koou.startup).toBeGreaterThanOrEqual(standA.startup);
    });

    it('DMs have more total frames than specials', () => {
      const koou = FRAME_DATA['RYO_KOOU'] as { startup: number; active: number; recovery: number };
      const dm = FRAME_DATA['DM_TEN_HA_OU'] as { startup: number; active: number; recovery: number };
      const koouTotal = koou.startup + koou.active + koou.recovery;
      const dmTotal = dm.startup + dm.active + dm.recovery;
      expect(dmTotal).toBeGreaterThan(koouTotal);
    });

    it('C-version specials have longer or equal startup than A-version', () => {
      const koouA = FRAME_DATA['RYO_KOOU'] as { startup: number };
      const koouC = FRAME_DATA['RYO_KOOU_C'] as { startup: number };
      expect(koouC.startup).toBeGreaterThanOrEqual(koouA.startup);
    });
  });
});
