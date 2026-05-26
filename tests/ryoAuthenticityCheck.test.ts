/**
 * Ryo Authenticity Check Tests
 *
 * Validates the authenticity report tool produces well-structured output,
 * that stand_a / stand_c map to distinct feedback tiers, that portrait
 * coverage includes select and HUD, and that hitbox data is data-driven.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import {
  generateAuthenticityReport,
  printAuthenticityReport,
  type RyoAuthenticityReport,
  type AuthenticityCheck,
  type CheckSeverity,
  type AuthenticityCategory,
} from '../src/tools/ryoAuthenticityCheck.js';
import { getFeedback, inferTier } from '../src/core/feedbackManifest.js';
import { AttackType } from '../src/core/types.js';
import { HURTBOX_TABLE } from '../src/core/hurtboxManifest.js';
import { ATTACK_FRAMES } from '../src/core/attackFrames.js';
import { FRAME_DATA } from '../src/core/constants.js';
import { FighterState } from '../src/core/types.js';
import { PORTRAIT_MANIFEST } from '../src/core/portraitManifest.js';

describe('generateAuthenticityReport — structure', () => {
  let report: RyoAuthenticityReport;

  it('returns a valid report object without throwing', () => {
    report = generateAuthenticityReport();
    expect(report).toBeDefined();
    expect(typeof report).toBe('object');
  });

  it('has character set to ryo', () => {
    report = generateAuthenticityReport();
    expect(report.character).toBe('ryo');
  });

  it('has a valid ISO timestamp', () => {
    report = generateAuthenticityReport();
    expect(report.timestamp).toBeDefined();
    expect(typeof report.timestamp).toBe('string');
    const parsed = new Date(report.timestamp);
    expect(parsed.getTime()).not.toBeNaN();
  });

  it('has summary with pass, warn, fail, and total counts', () => {
    report = generateAuthenticityReport();
    expect(typeof report.summary.pass).toBe('number');
    expect(typeof report.summary.warn).toBe('number');
    expect(typeof report.summary.fail).toBe('number');
    expect(typeof report.summary.total).toBe('number');
    expect(report.summary.total).toBe(
      report.summary.pass + report.summary.warn + report.summary.fail,
    );
  });

  it('has byCategory map with all six categories', () => {
    report = generateAuthenticityReport();
    const expectedCategories: AuthenticityCategory[] = [
      'actions',
      'feedback',
      'portraits',
      'hitbox_data',
      'frame_contract',
      'tools',
    ];
    for (const cat of expectedCategories) {
      expect(report.byCategory[cat]).toBeDefined();
      expect(typeof report.byCategory[cat].pass).toBe('number');
      expect(typeof report.byCategory[cat].warn).toBe('number');
      expect(typeof report.byCategory[cat].fail).toBe('number');
    }
  });

  it('produces a verdict that is one of the three allowed values', () => {
    report = generateAuthenticityReport();
    expect(['authentic', 'partial', 'non_authentic']).toContain(report.verdict);
  });
});

describe('generateAuthenticityReport — each check has pass/warn/fail', () => {
  let report: RyoAuthenticityReport;

  beforeAll(() => {
    report = generateAuthenticityReport();
  });

  it('produces exactly 9 checks', () => {
    expect(report.checks.length).toBe(9);
  });

  it('every check has a valid severity', () => {
    const validSeverities: CheckSeverity[] = ['pass', 'warn', 'fail'];
    for (const check of report.checks) {
      expect(validSeverities).toContain(check.severity);
    }
  });

  it('every check has required fields populated', () => {
    for (const check of report.checks) {
      expect(check.id).toBeTruthy();
      expect(check.name).toBeTruthy();
      expect(check.category).toBeTruthy();
      expect(check.message).toBeTruthy();
      expect(Array.isArray(check.details)).toBe(true);
    }
  });

  it('check IDs are unique', () => {
    const ids = report.checks.map(c => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

describe('stand_a maps to light tier, stand_c maps to heavy tier', () => {
  it('inferTier(STAND_A) returns light', () => {
    expect(inferTier(AttackType.STAND_A)).toBe('light');
  });

  it('inferTier(STAND_C) returns heavy', () => {
    expect(inferTier(AttackType.STAND_C)).toBe('heavy');
  });

  it('getFeedback(STAND_A) returns light tier params', () => {
    const fb = getFeedback(AttackType.STAND_A);
    expect(fb.tier).toBe('light');
  });

  it('getFeedback(STAND_C) returns heavy tier params', () => {
    const fb = getFeedback(AttackType.STAND_C);
    expect(fb.tier).toBe('heavy');
  });
});

describe('heavy tier has stronger feedback than light tier', () => {
  const light = getFeedback(AttackType.STAND_A);
  const heavy = getFeedback(AttackType.STAND_C);

  it('heavy hitstop is greater than light hitstop', () => {
    expect(heavy.hitstop).toBeGreaterThan(light.hitstop);
  });

  it('heavy shake intensity is greater than light shake intensity', () => {
    expect(heavy.shakeIntensity).toBeGreaterThan(light.shakeIntensity);
  });

  it('heavy spark count is greater than or equal to light spark count', () => {
    expect(heavy.sparkCount).toBeGreaterThanOrEqual(light.sparkCount);
  });

  it('heavy spark size is greater than light spark size', () => {
    expect(heavy.sparkSize).toBeGreaterThan(light.sparkSize);
  });

  it('heavy hit flash frames are greater than or equal to light', () => {
    expect(heavy.hitFlashFrames).toBeGreaterThanOrEqual(light.hitFlashFrames);
  });
});

describe('portrait coverage includes select and HUD', () => {
  let report: RyoAuthenticityReport;

  beforeAll(() => {
    report = generateAuthenticityReport();
  });

  it('PORTRAIT_MANIFEST has a ryo entry', () => {
    expect(PORTRAIT_MANIFEST.portraits['ryo']).toBeDefined();
  });

  it('ryo has a select portrait entry', () => {
    const selectEntry = PORTRAIT_MANIFEST.portraits['ryo']?.['select'];
    expect(selectEntry).toBeDefined();
    expect(selectEntry!.width).toBeGreaterThan(0);
    expect(selectEntry!.height).toBeGreaterThan(0);
  });

  it('ryo has a HUD portrait entry', () => {
    const hudEntry = PORTRAIT_MANIFEST.portraits['ryo']?.['hud'];
    expect(hudEntry).toBeDefined();
    expect(hudEntry!.width).toBeGreaterThan(0);
    expect(hudEntry!.height).toBeGreaterThan(0);
  });

  it('portrait_coverage check does not report fail', () => {
    const portraitCheck = report.checks.find(c => c.id === 'portrait_coverage');
    expect(portraitCheck).toBeDefined();
    expect(portraitCheck!.severity).not.toBe('fail');
  });
});

describe('hurtbox data is data-driven, not computed at render time', () => {
  it('HURTBOX_TABLE is a plain object, not a function', () => {
    expect(typeof HURTBOX_TABLE).toBe('object');
    expect(HURTBOX_TABLE).not.toBeNull();
  });

  it('IDLE state has a hurtbox entry with valid dimensions', () => {
    const idleBox = HURTBOX_TABLE[FighterState.IDLE];
    expect(idleBox).toBeDefined();
    expect(idleBox!.width).toBeGreaterThan(0);
    expect(idleBox!.height).toBeGreaterThan(0);
  });

  it('HITSTUN state has a hurtbox entry', () => {
    const hurtBox = HURTBOX_TABLE[FighterState.HITSTUN];
    expect(hurtBox).toBeDefined();
    expect(hurtBox!.width).toBeGreaterThan(0);
  });

  it('KNOCKDOWN state has a hurtbox entry', () => {
    const kdBox = HURTBOX_TABLE[FighterState.KNOCKDOWN];
    expect(kdBox).toBeDefined();
    expect(kdBox!.width).toBeGreaterThan(0);
  });

  it('STAND_ATTACK has a hurtbox entry (attack pose body collision)', () => {
    const atkBox = HURTBOX_TABLE[FighterState.STAND_ATTACK];
    expect(atkBox).toBeDefined();
    expect(atkBox!.width).toBeGreaterThan(0);
  });

  it('ATTACK_FRAMES has STAND_A and STAND_C entries (hitbox data)', () => {
    expect(ATTACK_FRAMES[AttackType.STAND_A]).toBeDefined();
    expect(ATTACK_FRAMES[AttackType.STAND_C]).toBeDefined();
  });

  it('STAND_A attack frames contain at least one active hitbox frame', () => {
    const frames = ATTACK_FRAMES[AttackType.STAND_A];
    expect(frames.length).toBeGreaterThan(0);
  });

  it('STAND_C attack frames contain at least one active hitbox frame', () => {
    const frames = ATTACK_FRAMES[AttackType.STAND_C];
    expect(frames.length).toBeGreaterThan(0);
  });

  it('hitbox_data_sourcing check does not report fail', () => {
    const report = generateAuthenticityReport();
    const hitboxCheck = report.checks.find(c => c.id === 'hitbox_data_sourcing');
    expect(hitboxCheck).toBeDefined();
    expect(hitboxCheck!.severity).not.toBe('fail');
  });
});

describe('overall verdict is authentic or partial', () => {
  it('verdict is not non_authentic (all critical data is present)', () => {
    const report = generateAuthenticityReport();
    // The project has real data for the core checks;
    // verdict should be authentic or partial, never non_authentic
    expect(report.verdict).not.toBe('non_authentic');
  });
});

describe('printAuthenticityReport does not throw', () => {
  it('prints without error (console output only)', () => {
    // Capture console.log to suppress output during test
    const originalLog = console.log;
    const logs: string[] = [];
    console.log = (...args: unknown[]) => logs.push(args.join(' '));

    try {
      expect(() => printAuthenticityReport()).not.toThrow();
    } finally {
      console.log = originalLog;
    }

    // Verify the report produced actual output
    expect(logs.length).toBeGreaterThan(0);
    expect(logs.some(l => l.includes('RYO AUTHENTICITY STANDARD CHECK'))).toBe(true);
    expect(logs.some(l => l.includes('Verdict'))).toBe(true);
  });
});

describe('attack phase alignment — FRAME_DATA has startup/active/recovery', () => {
  it('STAND_A has startup, active, and recovery in FRAME_DATA', () => {
    const fd = FRAME_DATA[AttackType.STAND_A as keyof typeof FRAME_DATA] as Record<string, unknown>;
    expect(fd).toBeDefined();
    expect(fd.startup).toBeDefined();
    expect(fd.active).toBeDefined();
    expect(fd.recovery).toBeDefined();
  });

  it('STAND_C has startup, active, and recovery in FRAME_DATA', () => {
    const fd = FRAME_DATA[AttackType.STAND_C as keyof typeof FRAME_DATA] as Record<string, unknown>;
    expect(fd).toBeDefined();
    expect(fd.startup).toBeDefined();
    expect(fd.active).toBeDefined();
    expect(fd.recovery).toBeDefined();
  });

  it('attack_phase_data check does not report fail', () => {
    const report = generateAuthenticityReport();
    const phaseCheck = report.checks.find(c => c.id === 'attack_phase_data');
    expect(phaseCheck).toBeDefined();
    expect(phaseCheck!.severity).not.toBe('fail');
  });
});

describe('frame contract alignment — damage field present', () => {
  it('STAND_A FRAME_DATA has a damage field', () => {
    const fd = FRAME_DATA[AttackType.STAND_A as keyof typeof FRAME_DATA] as Record<string, unknown>;
    expect(fd.damage).toBeDefined();
    expect(typeof fd.damage).toBe('number');
  });

  it('STAND_C FRAME_DATA has a damage field', () => {
    const fd = FRAME_DATA[AttackType.STAND_C as keyof typeof FRAME_DATA] as Record<string, unknown>;
    expect(fd.damage).toBeDefined();
    expect(typeof fd.damage).toBe('number');
  });

  it('frame_contract check does not report fail', () => {
    const report = generateAuthenticityReport();
    const fcCheck = report.checks.find(c => c.id === 'frame_contract');
    expect(fcCheck).toBeDefined();
    expect(fcCheck!.severity).not.toBe('fail');
  });
});

describe('cancel window data is structured (not magic numbers)', () => {
  it('cancel_window check does not report fail', () => {
    const report = generateAuthenticityReport();
    const cancelCheck = report.checks.find(c => c.id === 'cancel_window');
    expect(cancelCheck).toBeDefined();
    expect(cancelCheck!.severity).not.toBe('fail');
  });

  it('STAND_A has blockstun and hitstun values', () => {
    const fd = FRAME_DATA[AttackType.STAND_A as keyof typeof FRAME_DATA] as Record<string, unknown>;
    expect(fd.blockstun).toBeDefined();
    expect(fd.hitstun).toBeDefined();
  });

  it('STAND_C has blockstun and hitstun values', () => {
    const fd = FRAME_DATA[AttackType.STAND_C as keyof typeof FRAME_DATA] as Record<string, unknown>;
    expect(fd.blockstun).toBeDefined();
    expect(fd.hitstun).toBeDefined();
  });
});
