/**
 * Command Normal High-Res Frame Integration Test
 *
 * Verifies that all 3 characters (Ryo, Kyo, Iori) have high-res sprite frames
 * registered and resolvable for their command normal attacks.
 */
import { describe, it, expect } from 'vitest';
import { FighterState, AttackType } from '../src/core/types.js';
import { hasKyoHighResFrame } from '../src/rendering/sprites/kyo/kyoHighResRender.js';
import { hasIoriHighResFrame } from '../src/rendering/sprites/iori/ioriHighResRender.js';
import { hasHighResFrame } from '../src/rendering/sprites/ryo/ryoHighResRender.js';
import { FRAME_DATA } from '../src/core/frameDataConstants.js';

describe('Command Normal High-Res Frames', () => {
  describe('Kyo command normals', () => {
    it('resolves CMD_GOFU_YOU (overhead kick)', () => {
      expect(hasKyoHighResFrame(
        FighterState.STAND_ATTACK, AttackType.CMD_GOFU_YOU, 0, 1,
      )).toBe(true);
    });

    it('resolves CMD_88SHIKI (low sweep)', () => {
      expect(hasKyoHighResFrame(
        FighterState.STAND_ATTACK, AttackType.CMD_88SHIKI, 0, 1,
      )).toBe(true);
    });

    it('resolves CMD_NARAKU (air slam) in AIR_ATTACK state', () => {
      expect(hasKyoHighResFrame(
        FighterState.AIR_ATTACK, AttackType.CMD_NARAKU, 0, 1,
      )).toBe(true);
    });
  });

  describe('Iori command normals', () => {
    it('resolves IORI_YUMEYUMI (overhead claw)', () => {
      expect(hasIoriHighResFrame(
        FighterState.STAND_ATTACK, AttackType.IORI_YUMEYUMI, 0, 1,
      )).toBe(true);
    });

    it('resolves IORI_KATANUGI (low sweep)', () => {
      expect(hasIoriHighResFrame(
        FighterState.STAND_ATTACK, AttackType.IORI_KATANUGI, 0, 1,
      )).toBe(true);
    });

    it('resolves IORI_YUKIWARUI (palm strike)', () => {
      expect(hasIoriHighResFrame(
        FighterState.STAND_ATTACK, AttackType.IORI_YUKIWARUI, 0, 1,
      )).toBe(true);
    });
  });

  describe('Ryo command normals', () => {
    it('resolves RYO_TSURIZAO (overhead elbow)', () => {
      expect(hasHighResFrame(
        'ryo', FighterState.STAND_ATTACK, AttackType.RYO_TSURIZAO, 0, 1,
      )).toBe(true);
    });

    it('resolves RYO_ORISHI (low kick)', () => {
      expect(hasHighResFrame(
        'ryo', FighterState.STAND_ATTACK, AttackType.RYO_ORISHI, 0, 1,
      )).toBe(true);
    });
  });

  describe('Frame data alignment', () => {
    it('Kyo command normals have frame data entries', () => {
      expect(FRAME_DATA[AttackType.CMD_GOFU_YOU]).toBeDefined();
      expect(FRAME_DATA[AttackType.CMD_88SHIKI]).toBeDefined();
      expect(FRAME_DATA[AttackType.CMD_NARAKU]).toBeDefined();
    });

    it('Iori command normals have frame data entries', () => {
      expect(FRAME_DATA[AttackType.IORI_YUMEYUMI]).toBeDefined();
      expect(FRAME_DATA[AttackType.IORI_KATANUGI]).toBeDefined();
      expect(FRAME_DATA[AttackType.IORI_YUKIWARUI]).toBeDefined();
    });

    it('Ryo command normals have frame data entries', () => {
      expect(FRAME_DATA[AttackType.RYO_TSURIZAO]).toBeDefined();
      expect(FRAME_DATA[AttackType.RYO_ORISHI]).toBeDefined();
    });
  });
});
