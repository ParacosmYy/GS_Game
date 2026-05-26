/**
 * Ryo Frame Contract Integration Tests
 *
 * Validates the complete frame contract alignment for Ryo's key attacks across
 * all four data sources: FRAME_DATA, HITBOX_OFFSETS, FEEDBACK_MANIFEST, and
 * the cancel window logic.
 *
 * The Frame Contract guarantees:
 *   1. FRAME_DATA startup + active + recovery = total frames (no gaps/overlaps)
 *   2. HITBOX_OFFSETS exist for every attack that has active frames
 *   3. FEEDBACK_MANIFEST assigns the correct tier for each attack type
 *   4. Cancel windows never start before the active phase ends (recovery-only)
 *
 * Covers: STAND_A, STAND_C, RYO_KOOU, DM_TEN_HA_OU
 *   - light normal, heavy normal, special, DM — spanning all 4 feedback tiers
 */
import { describe, it, expect } from 'vitest';
import { FRAME_DATA } from '../src/core/constants.js';
import { HITBOX_OFFSETS } from '../src/core/hitboxConstants.js';
import {
  FEEDBACK_MANIFEST,
  inferTier,
  getFeedback,
} from '../src/core/feedbackManifest.js';
import {
  validateActionAlignment,
  isCancelPoint,
} from '../src/core/frameContract.js';
import type { ActionContract, CancelWindow, FrameEventTag } from '../src/core/frameContract.js';
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
  counterWire?: boolean;
};

// ── Test targets: one per feedback tier ──

const RYO_KEY_ATTACKS = [
  {
    key: 'STAND_A' as const,
    expectedTier: 'light' as const,
    label: '远A (light normal)',
    expectedStartup: 6,
    expectedActive: 3,
    expectedRecovery: 5,
  },
  {
    key: 'STAND_C' as const,
    expectedTier: 'heavy' as const,
    label: '遠C (heavy normal)',
    expectedStartup: 7,
    expectedActive: 3,
    expectedRecovery: 20,
  },
  {
    key: 'RYO_KOOU' as const,
    expectedTier: 'special' as const,
    label: '虎煌拳 (special projectile)',
    expectedStartup: 12,
    expectedActive: 18,
    expectedRecovery: 34,
  },
  {
    key: 'DM_TEN_HA_OU' as const,
    expectedTier: 'dm' as const,
    label: '霸王翔吼拳 (DM projectile)',
    expectedStartup: 18,
    expectedActive: 10,
    expectedRecovery: 40,
  },
] as const;

// ── Helpers ──

function getFrameData(key: string): FrameDataEntry {
  const data = FRAME_DATA[key as keyof typeof FRAME_DATA];
  if (!data) throw new Error(`Missing FRAME_DATA entry: ${key}`);
  return data as unknown as FrameDataEntry;
}

function buildContractFromFrameData(
  key: string,
  fd: FrameDataEntry,
): ActionContract {
  const total = fd.startup + fd.active + fd.recovery;
  const frames = Array.from({ length: total }, (_, i) => ({
    characterId: 'ryo',
    actionId: key,
    frameIndex: i,
    sprite: { spriteRef: `${key}_f${i}`, anchor: { x: 0, y: 0 }, offset: { x: 0, y: 0 }, duration: 1 },
    collision: i >= fd.startup && i < fd.startup + fd.active
      ? { hitboxes: [{ ox: 60, oy: -100, w: 50, h: 50 }], hurtboxOverride: null, throwBoxes: [] }
      : null,
    eventTags: [] as FrameEventTag[],
  }));

  return {
    characterId: 'ryo',
    actionId: key,
    state: 'ATTACKING' as any,
    attackType: key as any,
    frames,
    hitLevel: fd.hitLevel as any,
    knockdown: fd.knockdown,
    startup: fd.startup,
    active: fd.active,
    recovery: fd.recovery,
    totalFrames: total,
    cancelWindows: [
      {
        frames: [fd.startup + fd.active, total - 1] as [number, number],
        targetTypes: ['special', 'super'] as any,
        requiresHit: true,
        maxOnly: false,
      },
    ],
    feedbackTierOverride: null,
  };
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: FRAME_DATA phase totals
// ═══════════════════════════════════════════════════════════════════

describe('Ryo Frame Contract Integration: phase totals', () => {
  for (const attack of RYO_KEY_ATTACKS) {
    const fd = getFrameData(attack.key);
    const total = fd.startup + fd.active + fd.recovery;

    it(`${attack.key} (${attack.label}): startup(${fd.startup}) + active(${fd.active}) + recovery(${fd.recovery}) = ${total}`, () => {
      expect(total).toBeGreaterThan(0);
      // Verify each phase is positive
      expect(fd.startup).toBeGreaterThan(0);
      expect(fd.active).toBeGreaterThan(0);
      expect(fd.recovery).toBeGreaterThan(0);
      // Verify the specific expected values
      expect(fd.startup).toBe(attack.expectedStartup);
      expect(fd.active).toBe(attack.expectedActive);
      expect(fd.recovery).toBe(attack.expectedRecovery);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: HITBOX_OFFSETS coverage for active frames
// ═══════════════════════════════════════════════════════════════════

describe('Ryo Frame Contract Integration: hitbox offsets exist', () => {
  for (const attack of RYO_KEY_ATTACKS) {
    it(`${attack.key} (${attack.label}): hitbox offset exists in HITBOX_OFFSETS`, () => {
      expect(HITBOX_OFFSETS).toHaveProperty(attack.key);
      const hb = HITBOX_OFFSETS[attack.key as keyof typeof HITBOX_OFFSETS];
      expect(hb).toBeDefined();
      expect(typeof hb.offsetX).toBe('number');
      expect(typeof hb.offsetY).toBe('number');
      expect(typeof hb.width).toBe('number');
      expect(typeof hb.height).toBe('number');
      // Sanity: hitbox should be in front of character and above ground
      expect(hb.offsetX).toBeGreaterThan(0);
      expect(hb.offsetY).toBeLessThan(0);
      expect(hb.width).toBeGreaterThan(0);
      expect(hb.height).toBeGreaterThan(0);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: Feedback tier assignment
// ═══════════════════════════════════════════════════════════════════

describe('Ryo Frame Contract Integration: feedback tier', () => {
  for (const attack of RYO_KEY_ATTACKS) {
    it(`${attack.key} (${attack.label}): tier is '${attack.expectedTier}'`, () => {
      // Check explicit mapping in FEEDBACK_MANIFEST
      const explicitTier = FEEDBACK_MANIFEST.attackTierMap[attack.key as AttackType];
      expect(explicitTier).toBe(attack.expectedTier);

      // Check inferTier consistency
      const inferred = inferTier(attack.key as AttackType);
      expect(inferred).toBe(attack.expectedTier);

      // Check getFeedback returns valid params for this tier
      const params = getFeedback(attack.key as AttackType);
      expect(params.tier).toBe(attack.expectedTier);
      expect(params.hitstop).toBeGreaterThan(0);
      expect(params.blockstop).toBeGreaterThan(0);
      expect(params.shakeIntensity).toBeGreaterThan(0);
      expect(params.shakeDuration).toBeGreaterThan(0);
    });
  }

  it('feedback tier escalation: light < heavy < special < dm', () => {
    const tiers = RYO_KEY_ATTACKS.map(a => ({
      label: a.key,
      tier: a.expectedTier,
      hitstop: FEEDBACK_MANIFEST.tiers[a.expectedTier].hitstop,
    }));
    // Hitstop should escalate across tiers
    expect(tiers[0].hitstop).toBeLessThan(tiers[1].hitstop); // light < heavy
    expect(tiers[1].hitstop).toBeLessThan(tiers[2].hitstop); // heavy < special
    expect(tiers[2].hitstop).toBeLessThan(tiers[3].hitstop); // special < dm
  });
});

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: Cancel window does not start before active phase ends
// ═══════════════════════════════════════════════════════════════════

describe('Ryo Frame Contract Integration: cancel window timing', () => {
  for (const attack of RYO_KEY_ATTACKS) {
    const fd = getFrameData(attack.key);
    const contract = buildContractFromFrameData(attack.key, fd);

    it(`${attack.key} (${attack.label}): cancel frames start at or after active ends`, () => {
      const activeEnd = fd.startup + fd.active;
      for (const cw of contract.cancelWindows) {
        expect(cw.frames[0]).toBeGreaterThanOrEqual(activeEnd);
      }
    });

    it(`${attack.key} (${attack.label}): isCancelPoint returns null during active phase`, () => {
      // Active phase = frames [startup, startup+active)
      for (let i = fd.startup; i < fd.startup + fd.active; i++) {
        const result = isCancelPoint(contract, i, true, false);
        expect(result).toBeNull();
      }
    });

    it(`${attack.key} (${attack.label}): isCancelPoint returns window during recovery`, () => {
      const recoveryStart = fd.startup + fd.active;
      // First frame of recovery should be cancelable (with hit confirm)
      const result = isCancelPoint(contract, recoveryStart, true, false);
      expect(result).not.toBeNull();
      expect(result!.requiresHit).toBe(true);
    });

    it(`${attack.key} (${attack.label}): isCancelPoint with requiresHit rejects without hit confirm`, () => {
      const recoveryStart = fd.startup + fd.active;
      const result = isCancelPoint(contract, recoveryStart, false, false);
      // If requiresHit is true and no hit confirm, should return null
      expect(result).toBeNull();
    });
  }
});

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: validateActionAlignment — contract ↔ FRAME_DATA
// ═══════════════════════════════════════════════════════════════════

describe('Ryo Frame Contract Integration: validateActionAlignment', () => {
  for (const attack of RYO_KEY_ATTACKS) {
    const fd = getFrameData(attack.key);
    const contract = buildContractFromFrameData(attack.key, fd);

    it(`${attack.key} (${attack.label}): alignment is valid`, () => {
      const result = validateActionAlignment(
        contract,
        fd.startup,
        fd.active,
        fd.recovery,
      );
      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: Cross-source consistency — all 4 sources agree
// ═══════════════════════════════════════════════════════════════════

describe('Ryo Frame Contract Integration: cross-source consistency', () => {
  it('all Ryo key attacks have complete data in all 4 sources', () => {
    for (const attack of RYO_KEY_ATTACKS) {
      // 1. FRAME_DATA
      const fd = getFrameData(attack.key);
      expect(fd).toBeDefined();
      expect(fd.startup + fd.active + fd.recovery).toBeGreaterThan(0);

      // 2. HITBOX_OFFSETS
      const hb = HITBOX_OFFSETS[attack.key as keyof typeof HITBOX_OFFSETS];
      expect(hb).toBeDefined();

      // 3. FEEDBACK_MANIFEST (explicit mapping)
      const tier = FEEDBACK_MANIFEST.attackTierMap[attack.key as AttackType];
      expect(tier).toBe(attack.expectedTier);

      // 4. Frame contract alignment
      const contract = buildContractFromFrameData(attack.key, fd);
      const alignment = validateActionAlignment(
        contract, fd.startup, fd.active, fd.recovery,
      );
      expect(alignment.valid).toBe(true);
    }
  });

  it('totalFrames equals sum of phases for all Ryo key attacks', () => {
    for (const attack of RYO_KEY_ATTACKS) {
      const fd = getFrameData(attack.key);
      const total = fd.startup + fd.active + fd.recovery;
      expect(total).toBeGreaterThan(0);
      // Build contract and verify totalFrames
      const contract = buildContractFromFrameData(attack.key, fd);
      expect(contract.totalFrames).toBe(total);
      expect(contract.frames).toHaveLength(total);
    }
  });
});
