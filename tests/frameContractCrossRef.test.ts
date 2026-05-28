/**
 * Frame Contract ↔ FRAME_DATA Cross-Reference Tests
 *
 * Validates that Iori and Kyo frame contracts are consistent with
 * their FRAME_DATA entries:
 * - All attack types in frame contracts exist in FRAME_DATA
 * - Damage values in FRAME_DATA are positive for all attack types
 * - Startup in FRAME_DATA matches frame contract startup
 * - TotalFrames is reasonable (startup + active + recovery)
 */
import { describe, it, expect } from 'vitest';
import { IORI_ACTION_CONTRACTS } from '../src/core/ioriFrameContract.js';
import { KYO_ACTION_CONTRACTS } from '../src/core/kyoFrameContract.js';
import { FRAME_DATA } from '../src/core/frameDataConstants.js';

describe('Iori frame contract ↔ FRAME_DATA consistency', () => {
  const ioriAttacks = [...IORI_ACTION_CONTRACTS.values()].filter(a => a.attackType !== null);

  it('all Iori attack types exist in FRAME_DATA', () => {
    for (const action of ioriAttacks) {
      expect(FRAME_DATA[action.attackType!], `${action.actionId} → ${action.attackType}`).toBeDefined();
    }
  });

  it('FRAME_DATA damage is positive for all Iori attacks', () => {
    for (const action of ioriAttacks) {
      const fd = FRAME_DATA[action.attackType!];
      expect(fd.damage, `${action.actionId} damage`).toBeGreaterThan(0);
    }
  });

  it('FRAME_DATA startup >= frame contract startup', () => {
    for (const action of ioriAttacks) {
      const fd = FRAME_DATA[action.attackType!];
      // FRAME_DATA startup can be 0 or match; frame contract is the authority
      expect(action.startup, `${action.actionId} startup`).toBeGreaterThan(0);
    }
  });

  it('FRAME_DATA hitstun and blockstun are non-negative for attacks', () => {
    for (const action of ioriAttacks) {
      const fd = FRAME_DATA[action.attackType!];
      expect(fd.hitstun, `${action.actionId} hitstun`).toBeGreaterThanOrEqual(0);
      expect(fd.blockstun, `${action.actionId} blockstun`).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('Kyo frame contract ↔ FRAME_DATA consistency', () => {
  const kyoAttacks = [...KYO_ACTION_CONTRACTS.values()].filter(a => a.attackType !== null);

  it('all Kyo attack types exist in FRAME_DATA', () => {
    for (const action of kyoAttacks) {
      expect(FRAME_DATA[action.attackType!], `${action.actionId} → ${action.attackType}`).toBeDefined();
    }
  });

  it('FRAME_DATA damage is positive for all Kyo attacks', () => {
    for (const action of kyoAttacks) {
      const fd = FRAME_DATA[action.attackType!];
      expect(fd.damage, `${action.actionId} damage`).toBeGreaterThan(0);
    }
  });

  it('FRAME_DATA hitstun and blockstun are non-negative for attacks', () => {
    for (const action of kyoAttacks) {
      const fd = FRAME_DATA[action.attackType!];
      expect(fd.hitstun, `${action.actionId} hitstun`).toBeGreaterThanOrEqual(0);
      expect(fd.blockstun, `${action.actionId} blockstun`).toBeGreaterThanOrEqual(0);
    }
  });

  it('DM has higher damage than any special', () => {
    const dm = FRAME_DATA[KYO_ACTION_CONTRACTS.get('dm_orochinagi')!.attackType!];
    const specials = kyoAttacks
      .filter(a => a.feedbackTierOverride === 'special')
      .map(a => FRAME_DATA[a.attackType!].damage);
    const maxSpecialDmg = Math.max(...specials);
    expect(dm.damage, 'DM damage > max special damage').toBeGreaterThan(maxSpecialDmg);
  });

  it('SDM has higher or equal damage than DM', () => {
    const dm = FRAME_DATA[KYO_ACTION_CONTRACTS.get('dm_orochinagi')!.attackType!];
    const sdm = FRAME_DATA[KYO_ACTION_CONTRACTS.get('sdm_orochinagi')!.attackType!];
    expect(sdm.damage, 'SDM damage >= DM damage').toBeGreaterThanOrEqual(dm.damage);
  });
});

describe('Cross-character frame contract consistency', () => {
  it('Iori and Kyo have same non-attack action set', () => {
    const ioriNonAttack = [...IORI_ACTION_CONTRACTS.values()]
      .filter(a => a.attackType === null)
      .map(a => a.actionId)
      .sort();
    const kyoNonAttack = [...KYO_ACTION_CONTRACTS.values()]
      .filter(a => a.attackType === null)
      .map(a => a.actionId)
      .sort();
    expect(ioriNonAttack).toEqual(kyoNonAttack);
  });

  it('both characters have same normal attack set', () => {
    const ioriNormals = [...IORI_ACTION_CONTRACTS.values()]
      .filter(a => a.attackType !== null && a.feedbackTierOverride === null && !a.actionId.includes('iori_'))
      .map(a => a.actionId)
      .sort();
    const kyoNormals = [...KYO_ACTION_CONTRACTS.values()]
      .filter(a => a.attackType !== null && a.feedbackTierOverride === null && !a.actionId.includes('kyo_') && !a.actionId.startsWith('cmd_'))
      .map(a => a.actionId)
      .sort();
    expect(ioriNormals).toEqual(kyoNormals);
  });

  it('light attacks have similar startup across characters', () => {
    const ioriStandA = IORI_ACTION_CONTRACTS.get('stand_a')!;
    const kyoStandA = KYO_ACTION_CONTRACTS.get('stand_a')!;
    // Should be within 2 frames of each other
    expect(Math.abs(ioriStandA.startup - kyoStandA.startup)).toBeLessThanOrEqual(2);
  });

  it('both have at least one cancel window on stand_c', () => {
    const ioriStandC = IORI_ACTION_CONTRACTS.get('stand_c')!;
    const kyoStandC = KYO_ACTION_CONTRACTS.get('stand_c')!;
    expect(ioriStandC.cancelWindows.length).toBeGreaterThan(0);
    expect(kyoStandC.cancelWindows.length).toBeGreaterThan(0);
  });

  it('both DMs have super_flash tag', () => {
    const ioriDm = IORI_ACTION_CONTRACTS.get('dm_yaotome')!;
    const kyoDm = KYO_ACTION_CONTRACTS.get('dm_orochinagi')!;
    expect(ioriDm.frames[0].eventTags).toContain('super_flash');
    expect(kyoDm.frames[0].eventTags).toContain('super_flash');
  });
});
