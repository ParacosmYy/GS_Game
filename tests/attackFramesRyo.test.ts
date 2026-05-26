import { describe, it, expect, afterAll } from 'vitest';
import { ATTACK_FRAMES } from '../src/core/attackFrames.js';

describe('ATTACK_FRAMES — Ryo completeness', () => {
  // All attack types that Ryo uses (enum string values as table keys)
  const RYO_ATTACKS = [
    // Generic normals (shared across characters)
    'STAND_A', 'STAND_B', 'STAND_C', 'STAND_D',
    'CLOSE_A', 'CLOSE_B', 'CLOSE_C', 'CLOSE_D',
    'CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D',
    'JUMP_A', 'JUMP_B', 'JUMP_C', 'JUMP_D',
    'STAND_CD', 'JUMP_CD',
    // Throws
    'THROW', 'THROW_FORWARD', 'THROW_BACK',
    // Ryo command normals
    'RYO_TSURIZAO', 'RYO_ORISHI',
    // Ryo specials
    'RYO_KOOU', 'RYO_KOOU_C',
    'RYO_KO_HOU', 'RYO_KO_HOU_C',
    'RYO_HIEN', 'RYO_HAOU',
    // Ryo DMs / SDMs / HSDMs
    'DM_TEN_HA_OU', 'SDM_TEN_HA_OU',
    'DM_RYUKO_RANBU', 'SDM_RYUKO_RANBU', 'HSDM_RYUKO_RANBU',
  ];

  describe('all Ryo attacks have entries', () => {
    const missingKeys: string[] = [];
    for (const key of RYO_ATTACKS) {
      it(`${key} exists in ATTACK_FRAMES`, () => {
        expect(ATTACK_FRAMES).toHaveProperty(key);
        if (!ATTACK_FRAMES.hasOwnProperty(key)) {
          missingKeys.push(key);
        }
      });
    }
    afterAll(() => {
      if (missingKeys.length > 0) {
        console.warn('Missing Ryo ATTACK_FRAMES keys:', missingKeys);
      }
    });
  });

  describe('entry structure', () => {
    it('entries are arrays of AttackFrame objects', () => {
      const entry = ATTACK_FRAMES['RYO_KOOU'];
      expect(Array.isArray(entry)).toBe(true);
      expect(entry!.length).toBeGreaterThan(0);
    });

    it('each frame has attack array', () => {
      const entry = ATTACK_FRAMES['RYO_KOOU']!;
      for (const frame of entry) {
        expect(frame).toHaveProperty('attack');
        expect(Array.isArray(frame.attack)).toBe(true);
      }
    });

    it('frames have bodyOverride property', () => {
      const entry = ATTACK_FRAMES['RYO_KOOU']!;
      for (const frame of entry) {
        expect(frame).toHaveProperty('bodyOverride');
      }
    });

    it('throw entries have throwBoxes on active frames', () => {
      const entry = ATTACK_FRAMES['THROW']!;
      const hasThrowBox = entry.some(f => f.throwBoxes && f.throwBoxes.length > 0);
      expect(hasThrowBox).toBe(true);
    });
  });

  describe('frame counts are reasonable', () => {
    it('RYO_KOOU has multiple frames', () => {
      const entry = ATTACK_FRAMES['RYO_KOOU']!;
      expect(entry.length).toBeGreaterThan(0);
    });

    it('specials have at least 1 frame', () => {
      const special = ATTACK_FRAMES['RYO_KOOU']!;
      expect(special.length).toBeGreaterThanOrEqual(1);
    });

    it('DM has more frames than special', () => {
      const special = ATTACK_FRAMES['RYO_KOOU']!;
      const dm = ATTACK_FRAMES['DM_TEN_HA_OU']!;
      expect(dm.length).toBeGreaterThan(special.length);
    });

    it('SDM has at least as many frames as DM', () => {
      const dm = ATTACK_FRAMES['DM_TEN_HA_OU']!;
      const sdm = ATTACK_FRAMES['SDM_TEN_HA_OU']!;
      expect(sdm.length).toBeGreaterThanOrEqual(dm.length);
    });

    it('HSDM_RYUKO_RANBU has frames', () => {
      const hsdm = ATTACK_FRAMES['HSDM_RYUKO_RANBU']!;
      expect(hsdm.length).toBeGreaterThan(0);
    });
  });

  describe('command normals', () => {
    it('RYO_TSURIZAO has attack boxes on at least one frame', () => {
      const entry = ATTACK_FRAMES['RYO_TSURIZAO']!;
      const hasAttack = entry.some(f => f.attack.length > 0);
      expect(hasAttack).toBe(true);
    });

    it('RYO_ORISHI has attack boxes on at least one frame', () => {
      const entry = ATTACK_FRAMES['RYO_ORISHI']!;
      const hasAttack = entry.some(f => f.attack.length > 0);
      expect(hasAttack).toBe(true);
    });
  });
});
