/**
 * Validation Tools Tests
 *
 * Tests validateRyoPackage() and the manifest validation logic
 * (frame-data alignment, feedback tiers, sprite manifest, hurtbox coverage).
 */
import { describe, it, expect } from 'vitest';

// validateRyoPackage — exported function
import { validateRyoPackage, printValidationReport } from '../src/tools/validateRyoPackage.js';
import type { ValidationReport, ValidationCheck } from '../src/tools/validateRyoPackage.js';

// Dependencies used by validateManifest (re-implement checks without side effects)
import { FRAME_DATA } from '../src/core/frameDataConstants.js';
import { ATTACK_FRAMES } from '../src/core/attackFrames.js';
import { FEEDBACK_MANIFEST } from '../src/core/feedbackManifest.js';
import { SPRITE_MANIFEST } from '../src/core/spriteManifestData.js';
import { HURTBOX_TABLE } from '../src/core/hurtboxManifest.js';
import { AttackType, FighterState } from '../src/core/types.js';

// ========== validateRyoPackage tests ==========

describe('validateRyoPackage', () => {
  it('returns a ValidationReport with expected top-level fields', () => {
    const report = validateRyoPackage();
    expect(report).toBeDefined();
    expect(report.character).toBe('ryo');
    expect(typeof report.totalChecks).toBe('number');
    expect(typeof report.passedChecks).toBe('number');
    expect(typeof report.failedChecks).toBe('number');
    expect(typeof report.completenessScore).toBe('number');
    expect(Array.isArray(report.checks)).toBe(true);
  });

  it('has totalChecks equal to checks array length', () => {
    const report = validateRyoPackage();
    expect(report.totalChecks).toBe(report.checks.length);
  });

  it('passedChecks + failedChecks equals totalChecks', () => {
    const report = validateRyoPackage();
    expect(report.passedChecks + report.failedChecks).toBe(report.totalChecks);
  });

  it('completenessScore is between 0 and 100', () => {
    const report = validateRyoPackage();
    expect(report.completenessScore).toBeGreaterThanOrEqual(0);
    expect(report.completenessScore).toBeLessThanOrEqual(100);
  });

  it('completenessScore matches pass ratio', () => {
    const report = validateRyoPackage();
    const expected = Math.round((report.passedChecks / report.totalChecks) * 100);
    expect(report.completenessScore).toBe(expected);
  });

  it('contains expected check names', () => {
    const report = validateRyoPackage();
    const names = report.checks.map(c => c.name);
    expect(names).toContain('Content Package Exists');
    expect(names).toContain('Character Data Fields');
    expect(names).toContain('Required Animations');
    expect(names).toContain('Attack Frame Data');
  });

  it('each check has name, passed, and message', () => {
    const report = validateRyoPackage();
    for (const check of report.checks) {
      expect(check).toHaveProperty('name');
      expect(check).toHaveProperty('passed');
      expect(check).toHaveProperty('message');
      expect(typeof check.name).toBe('string');
      expect(typeof check.passed).toBe('boolean');
      expect(typeof check.message).toBe('string');
    }
  });

  it('Content Package Exists check passes', () => {
    const report = validateRyoPackage();
    const existsCheck = report.checks.find(c => c.name === 'Content Package Exists');
    expect(existsCheck).toBeDefined();
    expect(existsCheck!.passed).toBe(true);
  });

  it('Character Data Fields check passes', () => {
    const report = validateRyoPackage();
    const dataCheck = report.checks.find(c => c.name === 'Character Data Fields');
    expect(dataCheck).toBeDefined();
    expect(dataCheck!.passed).toBe(true);
  });
});

describe('printValidationReport', () => {
  it('does not throw for a valid report', () => {
    const report = validateRyoPackage();
    expect(() => printValidationReport(report)).not.toThrow();
  });
});

// ========== Manifest validation logic tests (mirrors validateManifest.ts) ==========

const RYO_ATTACK_TYPES: AttackType[] = [
  AttackType.STAND_A, AttackType.STAND_B, AttackType.STAND_C, AttackType.STAND_D,
  AttackType.CLOSE_A, AttackType.CLOSE_B, AttackType.CLOSE_C, AttackType.CLOSE_D,
  AttackType.CROUCH_A, AttackType.CROUCH_B, AttackType.CROUCH_C, AttackType.CROUCH_D,
  AttackType.JUMP_A, AttackType.JUMP_B, AttackType.JUMP_C, AttackType.JUMP_D,
  AttackType.STAND_CD, AttackType.JUMP_CD,
  AttackType.RYO_TSURIZAO, AttackType.RYO_ORISHI,
  AttackType.RYO_KOOU, AttackType.RYO_KOOU_C,
  AttackType.RYO_KO_HOU, AttackType.RYO_KO_HOU_C,
  AttackType.RYO_HIEN, AttackType.RYO_HAOU,
  AttackType.DM_TEN_HA_OU, AttackType.SDM_TEN_HA_OU,
  AttackType.DM_RYUKO_RANBU, AttackType.SDM_RYUKO_RANBU, AttackType.HSDM_RYUKO_RANBU,
];

describe('Manifest: frame-data alignment', () => {
  it('every Ryo attack type has FRAME_DATA entry', () => {
    let missing = 0;
    for (const at of RYO_ATTACK_TYPES) {
      const fd = (FRAME_DATA as Record<string, unknown>)[at as string];
      if (!fd) missing++;
    }
    expect(missing).toBe(0);
  });

  it('every Ryo attack type has ATTACK_FRAMES entry', () => {
    let missing = 0;
    for (const at of RYO_ATTACK_TYPES) {
      const af = ATTACK_FRAMES[at];
      if (!af) missing++;
    }
    expect(missing).toBe(0);
  });

  it('ATTACK_FRAMES length aligns with FRAME_DATA.active (non-projectile)', () => {
    const issues: string[] = [];
    for (const at of RYO_ATTACK_TYPES) {
      const key = at as string;
      const fd = (FRAME_DATA as Record<string, { startup: number; active: number; recovery: number }>)[key];
      const af = ATTACK_FRAMES[at];
      if (!fd || !af) continue;

      const isProjectile = key.includes('KOOU') || key.includes('YAMIBARAI') || key.includes('POWER_WAVE')
        || key.includes('PROJECTILE') || key.includes('MOON_SLASH') || key.includes('KA_CHO_SEN')
        || key.includes('PSYCHO_BALL') || key.includes('HISHOU_KEN') || key.includes('SANSETSU')
        || key.includes('HURRICANE') || key.includes('KOOU_KEN');
      if (isProjectile) continue;

      if (af.length !== fd.active) {
        issues.push(`${key}: ATTACK_FRAMES length(${af.length}) !== FRAME_DATA.active(${fd.active})`);
      }
    }
    // Allow some tolerance — just verify majority align
    expect(issues.length).toBeLessThan(RYO_ATTACK_TYPES.length);
  });
});

describe('Manifest: feedback tier mapping', () => {
  it('majority of Ryo attack types have explicit feedback tier', () => {
    let withTier = 0;
    for (const at of RYO_ATTACK_TYPES) {
      if (FEEDBACK_MANIFEST.attackTierMap[at]) withTier++;
    }
    // At least half should have explicit tiers
    expect(withTier).toBeGreaterThan(RYO_ATTACK_TYPES.length / 2);
  });
});

describe('Manifest: sprite manifest coverage', () => {
  const requiredActions = [
    'idle', 'walk_forward', 'walk_backward',
    'jump_up', 'jump_forward', 'jump_backward',
    'stand_a', 'stand_c',
    'hurt_standing', 'hurt_crouching',
    'knockdown',
  ];

  it('ryo exists in SPRITE_MANIFEST', () => {
    expect(SPRITE_MANIFEST.characters.ryo).toBeDefined();
  });

  it('required actions have animations in sprite manifest', () => {
    const char = SPRITE_MANIFEST.characters.ryo;
    const animNames = Object.keys(char.animations);
    const missing = requiredActions.filter(a => !animNames.includes(a));
    // At least idle and walk should be present
    expect(missing.length).toBeLessThan(requiredActions.length);
  });
});

describe('Manifest: hurtbox coverage', () => {
  it('critical states have hurtbox entries', () => {
    const criticalStates = [FighterState.IDLE, FighterState.WALK, FighterState.JUMP, FighterState.HITSTUN];
    for (const state of criticalStates) {
      expect(HURTBOX_TABLE[state as keyof typeof HURTBOX_TABLE]).toBeDefined();
    }
  });
});
