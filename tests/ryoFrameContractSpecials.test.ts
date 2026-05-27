/**
 * Ryo Frame Contract — Specials & DM Verification
 *
 * Validates that all newly added Ryo special, DM, SDM, and HSDM ActionContracts
 * in ryoFrameContract.ts are correctly aligned with:
 *   - FRAME_DATA (startup / active / recovery totals)
 *   - ATTACK_FRAMES (per-frame hitbox data during active phase)
 *   - ActionContract structural invariants
 */
import { describe, it, expect } from 'vitest';
import { RYO_ACTION_CONTRACTS } from '../src/core/ryoFrameContract.js';
import { FRAME_DATA } from '../src/core/constants.js';
import { ATTACK_FRAMES } from '../src/core/attackFrames.js';
import { validateActionAlignment } from '../src/core/frameContract.js';
import { AttackType } from '../src/core/types.js';

// ── Types ──

type FrameDataEntry = {
  startup: number;
  active: number;
  recovery: number;
  damage: number;
  hitstun: number;
  blockstun: number;
  pushback: number;
  hitLevel: 'MID' | 'LOW' | 'HIGH';
  knockdown: boolean;
  chipDamage?: number;
};

// ── All new entries expected in RYO_ACTION_CONTRACTS ──

const SPECIAL_CONTRACTS = [
  {
    actionId: 'ryo_tsurizao',
    attackType: AttackType.RYO_TSURIZAO,
    expectedStartup: 14,
    expectedActive: 4,
    expectedRecovery: 18,
    expectedHitLevel: 'HIGH' as const,
    expectedKnockdown: false,
    expectedFeedbackTier: null,
    label: '→+A 冰柱割り (overhead)',
  },
  {
    actionId: 'ryo_orishi',
    attackType: AttackType.RYO_ORISHI,
    expectedStartup: 8,
    expectedActive: 4,
    expectedRecovery: 20,
    expectedHitLevel: 'LOW' as const,
    expectedKnockdown: false,
    expectedFeedbackTier: null,
    label: '↘+B 落蹴 (low)',
  },
  {
    actionId: 'ryo_koou',
    attackType: AttackType.RYO_KOOU,
    expectedStartup: 12,
    expectedActive: 18,
    expectedRecovery: 34,
    expectedHitLevel: 'MID' as const,
    expectedKnockdown: false,
    expectedFeedbackTier: 'special',
    label: '↓↘→+A 虎煌拳 (weak projectile)',
  },
  {
    actionId: 'ryo_koou_c',
    attackType: AttackType.RYO_KOOU_C,
    expectedStartup: 13,
    expectedActive: 20,
    expectedRecovery: 32,
    expectedHitLevel: 'MID' as const,
    expectedKnockdown: false,
    expectedFeedbackTier: 'special',
    label: '↓↘→+C 虎煌拳 (strong projectile)',
  },
  {
    actionId: 'ryo_ko_hou',
    attackType: AttackType.RYO_KO_HOU,
    expectedStartup: 5,
    expectedActive: 5,
    expectedRecovery: 25,
    expectedHitLevel: 'MID' as const,
    expectedKnockdown: true,
    expectedFeedbackTier: 'special',
    label: '→↓↘+A 虎咆 (weak uppercut)',
  },
  {
    actionId: 'ryo_ko_hou_c',
    attackType: AttackType.RYO_KO_HOU_C,
    expectedStartup: 7,
    expectedActive: 10,
    expectedRecovery: 30,
    expectedHitLevel: 'MID' as const,
    expectedKnockdown: true,
    expectedFeedbackTier: 'special',
    label: '→↓↘+C 虎咆 (strong uppercut)',
  },
  {
    actionId: 'ryo_hien',
    attackType: AttackType.RYO_HIEN,
    expectedStartup: 10,
    expectedActive: 8,
    expectedRecovery: 22,
    expectedHitLevel: 'HIGH' as const,
    expectedKnockdown: true,
    expectedFeedbackTier: 'special',
    label: '←↙↓+K 飛燕疾風脚 (overhead kick)',
  },
  {
    actionId: 'ryo_haou',
    attackType: AttackType.RYO_HAOU,
    expectedStartup: 10,
    expectedActive: 12,
    expectedRecovery: 22,
    expectedHitLevel: 'MID' as const,
    expectedKnockdown: false,
    expectedFeedbackTier: 'special',
    label: '↓↘→+K 霸王翔吼拳 (counter)',
  },
  {
    actionId: 'dm_ten_ha_ou',
    attackType: AttackType.DM_TEN_HA_OU,
    expectedStartup: 18,
    expectedActive: 10,
    expectedRecovery: 40,
    expectedHitLevel: 'MID' as const,
    expectedKnockdown: true,
    expectedFeedbackTier: 'super',
    label: '天地霸煌拳 DM',
  },
  {
    actionId: 'dm_ryuko_ranbu',
    attackType: AttackType.DM_RYUKO_RANBU,
    expectedStartup: 8,
    expectedActive: 10,
    expectedRecovery: 38,
    expectedHitLevel: 'MID' as const,
    expectedKnockdown: true,
    expectedFeedbackTier: 'super',
    label: '龍虎乱舞 DM',
  },
  {
    actionId: 'sdm_ryuko_ranbu',
    attackType: AttackType.SDM_RYUKO_RANBU,
    expectedStartup: 6,
    expectedActive: 13,
    expectedRecovery: 36,
    expectedHitLevel: 'MID' as const,
    expectedKnockdown: true,
    expectedFeedbackTier: 'super',
    label: '龍虎乱舞 SDM',
  },
  {
    actionId: 'sdm_ten_ha_ou',
    attackType: AttackType.SDM_TEN_HA_OU,
    expectedStartup: 10,
    expectedActive: 22,
    expectedRecovery: 35,
    expectedHitLevel: 'MID' as const,
    expectedKnockdown: true,
    expectedFeedbackTier: 'super',
    label: '天地霸煌拳 SDM',
  },
  {
    actionId: 'hsdm_ryuko_ranbu',
    attackType: AttackType.HSDM_RYUKO_RANBU,
    expectedStartup: 2,
    expectedActive: 22,
    expectedRecovery: 32,
    expectedHitLevel: 'MID' as const,
    expectedKnockdown: true,
    expectedFeedbackTier: 'super',
    label: '龍虎乱舞 HSDM',
  },
];

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: All entries exist in RYO_ACTION_CONTRACTS
// ═══════════════════════════════════════════════════════════════════

describe('Ryo Specials FrameContract: all entries exist', () => {
  for (const spec of SPECIAL_CONTRACTS) {
    it(`${spec.actionId} exists in RYO_ACTION_CONTRACTS`, () => {
      const contract = RYO_ACTION_CONTRACTS.get(spec.actionId);
      expect(contract, `Missing ActionContract for ${spec.actionId}`).toBeDefined();
    });
  }

  it('total action count includes all new entries', () => {
    // 10 original + 2 command normals + 6 specials + 2 DM + 2 SDM + 1 HSDM = 23
    expect(RYO_ACTION_CONTRACTS.size).toBeGreaterThanOrEqual(23);
  });
});

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: Frame counts match FRAME_DATA
// ═══════════════════════════════════════════════════════════════════

describe('Ryo Specials FrameContract: frame count alignment with FRAME_DATA', () => {
  for (const spec of SPECIAL_CONTRACTS) {
    it(`${spec.actionId} (${spec.label}): startup/active/recovery match FRAME_DATA`, () => {
      const contract = RYO_ACTION_CONTRACTS.get(spec.actionId)!;
      const fd = FRAME_DATA[spec.attackType as keyof typeof FRAME_DATA] as unknown as FrameDataEntry | undefined;

      // Some entries (e.g. command normals) have FD in FRAME_DATA_GENERIC
      // which is already merged into FRAME_DATA
      if (fd) {
        expect(contract.startup).toBe(fd.startup);
        expect(contract.active).toBe(fd.active);
        expect(contract.recovery).toBe(fd.recovery);
        expect(contract.totalFrames).toBe(fd.startup + fd.active + fd.recovery);
      } else {
        // Fallback: use expected values from frameDataChars
        expect(contract.startup).toBe(spec.expectedStartup);
        expect(contract.active).toBe(spec.expectedActive);
        expect(contract.recovery).toBe(spec.expectedRecovery);
        expect(contract.totalFrames).toBe(spec.expectedStartup + spec.expectedActive + spec.expectedRecovery);
      }
    });
  }
});

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: Structural invariants
// ═══════════════════════════════════════════════════════════════════

describe('Ryo Specials FrameContract: structural invariants', () => {
  for (const spec of SPECIAL_CONTRACTS) {
    describe(`${spec.actionId}`, () => {
      it('characterId is ryo', () => {
        const contract = RYO_ACTION_CONTRACTS.get(spec.actionId)!;
        expect(contract.characterId).toBe('ryo');
      });

      it('actionId matches', () => {
        const contract = RYO_ACTION_CONTRACTS.get(spec.actionId)!;
        expect(contract.actionId).toBe(spec.actionId);
      });

      it('attackType matches', () => {
        const contract = RYO_ACTION_CONTRACTS.get(spec.actionId)!;
        expect(contract.attackType).toBe(spec.attackType);
      });

      it('frames.length === totalFrames', () => {
        const contract = RYO_ACTION_CONTRACTS.get(spec.actionId)!;
        expect(contract.frames.length).toBe(contract.totalFrames);
      });

      it('hitLevel matches expected', () => {
        const contract = RYO_ACTION_CONTRACTS.get(spec.actionId)!;
        expect(contract.hitLevel).toBe(spec.expectedHitLevel);
      });

      it('knockdown matches expected', () => {
        const contract = RYO_ACTION_CONTRACTS.get(spec.actionId)!;
        expect(contract.knockdown).toBe(spec.expectedKnockdown);
      });

      it('feedbackTierOverride matches expected', () => {
        const contract = RYO_ACTION_CONTRACTS.get(spec.actionId)!;
        expect(contract.feedbackTierOverride).toBe(spec.expectedFeedbackTier);
      });

      it('startup frames have no collision', () => {
        const contract = RYO_ACTION_CONTRACTS.get(spec.actionId)!;
        for (let i = 0; i < contract.startup; i++) {
          expect(contract.frames[i].collision).toBeNull();
        }
      });

      it('active frames have collision data', () => {
        const contract = RYO_ACTION_CONTRACTS.get(spec.actionId)!;
        for (let i = contract.startup; i < contract.startup + contract.active; i++) {
          expect(contract.frames[i].collision).not.toBeNull();
        }
      });

      it('recovery frames have no collision', () => {
        const contract = RYO_ACTION_CONTRACTS.get(spec.actionId)!;
        const recoveryStart = contract.startup + contract.active;
        for (let i = recoveryStart; i < contract.totalFrames; i++) {
          expect(contract.frames[i].collision).toBeNull();
        }
      });

      it('active frames have swing eventTag', () => {
        const contract = RYO_ACTION_CONTRACTS.get(spec.actionId)!;
        for (let i = contract.startup; i < contract.startup + contract.active; i++) {
          expect(contract.frames[i].eventTags).toContain('swing');
        }
      });
    });
  }
});

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: ATTACK_FRAMES alignment
// ═══════════════════════════════════════════════════════════════════

describe('Ryo Specials FrameContract: ATTACK_FRAMES alignment', () => {
  for (const spec of SPECIAL_CONTRACTS) {
    it(`${spec.actionId}: ATTACK_FRAMES entry exists`, () => {
      const attackFrames = ATTACK_FRAMES[spec.attackType];
      expect(attackFrames, `ATTACK_FRAMES.${spec.attackType} must exist`).toBeDefined();
      expect(attackFrames!.length).toBeGreaterThan(0);
    });

    it(`${spec.actionId}: ATTACK_FRAMES active frames have non-empty hitbox data`, () => {
      const attackFrames = ATTACK_FRAMES[spec.attackType];
      if (!attackFrames) return;
      let hasNonEmptyHitbox = false;
      const range = Math.min(attackFrames.length, spec.expectedActive);
      for (let i = 0; i < range; i++) {
        if (attackFrames[i].attack.length > 0) {
          hasNonEmptyHitbox = true;
          break;
        }
      }
      expect(hasNonEmptyHitbox, `${spec.actionId} should have at least one non-empty hitbox`).toBe(true);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: validateActionAlignment
// ═══════════════════════════════════════════════════════════════════

describe('Ryo Specials FrameContract: validateActionAlignment', () => {
  for (const spec of SPECIAL_CONTRACTS) {
    it(`${spec.actionId}: passes validateActionAlignment`, () => {
      const contract = RYO_ACTION_CONTRACTS.get(spec.actionId)!;
      const result = validateActionAlignment(
        contract,
        spec.expectedStartup,
        spec.expectedActive,
        spec.expectedRecovery,
      );
      expect(result.valid, `Alignment issues: ${result.issues.join('; ')}`).toBe(true);
      expect(result.issues).toHaveLength(0);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: DM/SDM/HSDM specific checks
// ═══════════════════════════════════════════════════════════════════

describe('Ryo Specials FrameContract: DM/SDM/HSDM specific behavior', () => {
  it('DM/SDM/HSDM have super_flash on frame 0', () => {
    const dmEntries = ['dm_ten_ha_ou', 'dm_ryuko_ranbu', 'sdm_ryuko_ranbu', 'sdm_ten_ha_ou', 'hsdm_ryuko_ranbu'];
    for (const actionId of dmEntries) {
      const contract = RYO_ACTION_CONTRACTS.get(actionId)!;
      expect(
        contract.frames[0].eventTags,
        `${actionId} frame 0 should have super_flash`,
      ).toContain('super_flash');
    }
  });

  it('specials do NOT have super_flash', () => {
    const specialEntries = ['ryo_koou', 'ryo_koou_c', 'ryo_ko_hou', 'ryo_ko_hou_c', 'ryo_hien', 'ryo_haou'];
    for (const actionId of specialEntries) {
      const contract = RYO_ACTION_CONTRACTS.get(actionId)!;
      for (const frame of contract.frames) {
        expect(
          frame.eventTags,
          `${actionId} should not have super_flash`,
        ).not.toContain('super_flash');
      }
    }
  });

  it('command normals do NOT have super_flash or special feedback', () => {
    const cmdEntries = ['ryo_tsurizao', 'ryo_orishi'];
    for (const actionId of cmdEntries) {
      const contract = RYO_ACTION_CONTRACTS.get(actionId)!;
      expect(contract.feedbackTierOverride).toBeNull();
      for (const frame of contract.frames) {
        expect(frame.eventTags).not.toContain('super_flash');
      }
    }
  });

  it('DM/SDM/HSDM have no cancel windows (cannot be canceled)', () => {
    const dmEntries = ['dm_ten_ha_ou', 'dm_ryuko_ranbu', 'sdm_ryuko_ranbu', 'sdm_ten_ha_ou', 'hsdm_ryuko_ranbu'];
    for (const actionId of dmEntries) {
      const contract = RYO_ACTION_CONTRACTS.get(actionId)!;
      expect(contract.cancelWindows).toHaveLength(0);
    }
  });

  it('specials have cancel windows for MAX mode super cancel', () => {
    const specialEntries = ['ryo_koou', 'ryo_koou_c', 'ryo_ko_hou', 'ryo_ko_hou_c', 'ryo_hien', 'ryo_haou'];
    for (const actionId of specialEntries) {
      const contract = RYO_ACTION_CONTRACTS.get(actionId)!;
      expect(
        contract.cancelWindows.length,
        `${actionId} should have cancel windows`,
      ).toBeGreaterThan(0);
      // All special cancel windows should target 'super'
      for (const cw of contract.cancelWindows) {
        expect(cw.targetTypes).toContain('super');
      }
    }
  });

  it('SDM_RYUKO_RANBU has more active frames than DM_RYUKO_RANBU', () => {
    const dm = RYO_ACTION_CONTRACTS.get('dm_ryuko_ranbu')!;
    const sdm = RYO_ACTION_CONTRACTS.get('sdm_ryuko_ranbu')!;
    expect(sdm.active).toBeGreaterThan(dm.active);
    expect(sdm.startup).toBeLessThan(dm.startup);
  });

  it('HSDM_RYUKO_RANBU has more active frames than SDM_RYUKO_RANBU', () => {
    const sdm = RYO_ACTION_CONTRACTS.get('sdm_ryuko_ranbu')!;
    const hsdm = RYO_ACTION_CONTRACTS.get('hsdm_ryuko_ranbu')!;
    expect(hsdm.active).toBeGreaterThan(sdm.active);
    expect(hsdm.startup).toBeLessThan(sdm.startup);
  });

  it('SDM_TEN_HA_OU has more active frames than DM_TEN_HA_OU', () => {
    const dm = RYO_ACTION_CONTRACTS.get('dm_ten_ha_ou')!;
    const sdm = RYO_ACTION_CONTRACTS.get('sdm_ten_ha_ou')!;
    expect(sdm.active).toBeGreaterThan(dm.active);
    expect(sdm.startup).toBeLessThan(dm.startup);
  });

  it('RYO_KO_HOU_C is stronger than RYO_KO_HOU', () => {
    const weak = RYO_ACTION_CONTRACTS.get('ryo_ko_hou')!;
    const strong = RYO_ACTION_CONTRACTS.get('ryo_ko_hou_c')!;
    expect(strong.active).toBeGreaterThan(weak.active);
    expect(strong.totalFrames).toBeGreaterThan(weak.totalFrames);
  });

  it('RYO_KOOU_C has more active frames than RYO_KOOU', () => {
    const weak = RYO_ACTION_CONTRACTS.get('ryo_koou')!;
    const strong = RYO_ACTION_CONTRACTS.get('ryo_koou_c')!;
    expect(strong.active).toBeGreaterThan(weak.active);
  });
});

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: spriteRef naming convention
// ═══════════════════════════════════════════════════════════════════

describe('Ryo Specials FrameContract: spriteRef naming', () => {
  for (const spec of SPECIAL_CONTRACTS) {
    it(`${spec.actionId}: all frames follow PIXEL_KEY:frameIndex naming`, () => {
      const contract = RYO_ACTION_CONTRACTS.get(spec.actionId)!;
      for (let i = 0; i < contract.frames.length; i++) {
        expect(
          contract.frames[i].sprite.spriteRef,
          `frame ${i} spriteRef`,
        ).toMatch(/^[A-Z_]+:\d+$/);
      }
    });
  }
});

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: Normals FrameContract verification (stand_b/d, close_b/d, crouch_a/b/c/d)
// ═══════════════════════════════════════════════════════════════════

const NORMAL_CONTRACTS = [
  { actionId: 'stand_b', attackType: AttackType.STAND_B, startup: 7, active: 3, recovery: 14, hitLevel: 'MID' as const, knockdown: false },
  { actionId: 'stand_d', attackType: AttackType.STAND_D, startup: 10, active: 8, recovery: 20, hitLevel: 'HIGH' as const, knockdown: false },
  { actionId: 'close_b', attackType: AttackType.CLOSE_B, startup: 5, active: 3, recovery: 5, hitLevel: 'MID' as const, knockdown: false },
  { actionId: 'close_d', attackType: AttackType.CLOSE_D, startup: 5, active: 6, recovery: 13, hitLevel: 'HIGH' as const, knockdown: false },
  { actionId: 'crouch_a', attackType: AttackType.CROUCH_A, startup: 5, active: 4, recovery: 7, hitLevel: 'LOW' as const, knockdown: false },
  { actionId: 'crouch_b', attackType: AttackType.CROUCH_B, startup: 5, active: 5, recovery: 5, hitLevel: 'LOW' as const, knockdown: false },
  { actionId: 'crouch_c', attackType: AttackType.CROUCH_C, startup: 7, active: 5, recovery: 16, hitLevel: 'LOW' as const, knockdown: false },
  { actionId: 'crouch_d', attackType: AttackType.CROUCH_D, startup: 5, active: 6, recovery: 31, hitLevel: 'LOW' as const, knockdown: true },
];

describe('Ryo Normals FrameContract', () => {
  for (const norm of NORMAL_CONTRACTS) {
    describe(`${norm.actionId}`, () => {
      it('exists in RYO_ACTION_CONTRACTS', () => {
        expect(RYO_ACTION_CONTRACTS.has(norm.actionId)).toBe(true);
      });

      it('frame counts match', () => {
        const c = RYO_ACTION_CONTRACTS.get(norm.actionId)!;
        expect(c.startup).toBe(norm.startup);
        expect(c.active).toBe(norm.active);
        expect(c.recovery).toBe(norm.recovery);
        expect(c.totalFrames).toBe(norm.startup + norm.active + norm.recovery);
      });

      it('hitLevel is correct', () => {
        const c = RYO_ACTION_CONTRACTS.get(norm.actionId)!;
        expect(c.hitLevel).toBe(norm.hitLevel);
      });

      it('knockdown is correct', () => {
        const c = RYO_ACTION_CONTRACTS.get(norm.actionId)!;
        expect(c.knockdown).toBe(norm.knockdown);
      });

      it('active frames have collision data', () => {
        const c = RYO_ACTION_CONTRACTS.get(norm.actionId)!;
        for (let i = c.startup; i < c.startup + c.active; i++) {
          expect(c.frames[i].collision).not.toBeNull();
        }
      });

      it('recovery frames have no collision', () => {
        const c = RYO_ACTION_CONTRACTS.get(norm.actionId)!;
        const recoveryStart = c.startup + c.active;
        for (let i = recoveryStart; i < c.totalFrames; i++) {
          expect(c.frames[i].collision).toBeNull();
        }
      });

      it('ATTACK_FRAMES entry exists', () => {
        const attackFrames = ATTACK_FRAMES[norm.attackType];
        expect(attackFrames).toBeDefined();
        expect(attackFrames!.length).toBeGreaterThan(0);
      });

      it('has cancel windows', () => {
        const c = RYO_ACTION_CONTRACTS.get(norm.actionId)!;
        expect(c.cancelWindows.length).toBeGreaterThan(0);
      });
    });
  }
});
