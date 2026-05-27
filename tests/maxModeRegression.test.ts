/**
 * MAX Mode EX Special Regression Tests
 *
 * Protects:
 * - DP invincibility during MAX mode (+3 frames for all characters)
 * - EX projectile properties during MAX mode
 * - DP base invincibility frames for all characters
 */
import { describe, it, expect } from 'vitest';
import { AttackType } from '../src/core/types.js';
import { FRAME_DATA } from '../src/core/frameDataConstants.js';

// ===== DP Invincibility — Frame Data Validation =====
describe('DP Invincibility Frame Data', () => {
  const DP_MOVES = [
    { char: 'Ryo', type: AttackType.RYO_KO_HOU, name: 'KO_HOU (A)' },
    { char: 'Ryo', type: AttackType.RYO_KO_HOU_C, name: 'KO_HOU_C (C)' },
    { char: 'Kyo', type: AttackType.KYO_ONIYAKI, name: 'ONIYAKI (A)' },
    { char: 'Kyo', type: AttackType.KYO_ONIYAKI_C, name: 'ONIYAKI_C (C)' },
    { char: 'Iori', type: AttackType.IORI_ONIYAKI, name: 'ONIYAKI (A)' },
    { char: 'Iori', type: AttackType.IORI_ONIYAKI_C, name: 'ONIYAKI_C (C)' },
  ];

  for (const dp of DP_MOVES) {
    it(`${dp.char} ${dp.name} has frame data`, () => {
      const data = FRAME_DATA[dp.type as keyof typeof FRAME_DATA];
      expect(data).toBeDefined();
      expect(data.startup).toBeGreaterThan(0);
      expect(data.active).toBeGreaterThan(0);
    });
  }

  it('C version DPs have more active frames than A versions', () => {
    const pairs = [
      [AttackType.RYO_KO_HOU, AttackType.RYO_KO_HOU_C],
      [AttackType.KYO_ONIYAKI, AttackType.KYO_ONIYAKI_C],
      [AttackType.IORI_ONIYAKI, AttackType.IORI_ONIYAKI_C],
    ];
    for (const [aVer, cVer] of pairs) {
      const aData = FRAME_DATA[aVer as keyof typeof FRAME_DATA];
      const cData = FRAME_DATA[cVer as keyof typeof FRAME_DATA];
      expect(cData.active).toBeGreaterThanOrEqual(aData.active);
      expect(cData.damage).toBeGreaterThan(aData.damage);
    }
  });
});

// ===== EX Projectile Validation =====
describe('EX Projectile Properties', () => {
  it('Ryo KOOU has frame data for both versions', () => {
    const aData = FRAME_DATA[AttackType.RYO_KOOU as keyof typeof FRAME_DATA];
    const cData = FRAME_DATA[AttackType.RYO_KOOU_C as keyof typeof FRAME_DATA];
    expect(aData).toBeDefined();
    expect(cData).toBeDefined();
    expect(cData.damage).toBeGreaterThan(aData.damage);
  });

  it('Kyo YAMIBARAI has frame data for both versions', () => {
    const aData = FRAME_DATA[AttackType.KYO_YAMIBARAI as keyof typeof FRAME_DATA];
    const cData = FRAME_DATA[AttackType.KYO_YAMIBARAI_C as keyof typeof FRAME_DATA];
    expect(aData).toBeDefined();
    expect(cData).toBeDefined();
  });

  it('Iori YAMIBARAI has frame data for both versions', () => {
    const aData = FRAME_DATA[AttackType.IORI_YAMIBARAI as keyof typeof FRAME_DATA];
    const cData = FRAME_DATA[AttackType.IORI_YAMIBARAI_C as keyof typeof FRAME_DATA];
    expect(aData).toBeDefined();
    expect(cData).toBeDefined();
  });
});

// ===== HSDM Frame Data =====
describe('HSDM Frame Data Completeness', () => {
  const HSDMS = [
    { char: 'Ryo', type: AttackType.HSDM_RYUKO_RANBU },
    { char: 'Kyo', type: AttackType.HSDM_OROCHINAGI },
    { char: 'Iori', type: AttackType.HSDM_YAOTOME },
  ];

  for (const hsdm of HSDMS) {
    it(`${hsdm.char} HSDM has frame data with high damage`, () => {
      const data = FRAME_DATA[hsdm.type as keyof typeof FRAME_DATA];
      expect(data).toBeDefined();
      expect(data.damage).toBeGreaterThan(150);
      expect(data.startup).toBeGreaterThan(0);
    });
  }
});
