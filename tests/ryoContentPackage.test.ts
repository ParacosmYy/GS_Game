/**
 * Ryo Content Package Tests — Phase 60
 *
 * Tests barrel exports, character data, content loader, validation, and cross-checks.
 */
import { describe, it, expect } from 'vitest';

// Barrel imports
import {
  RyoDef,
  RYO_CHARACTER_DATA,
  RYO_STATS,
  RYO_ATTACK_KEYS,
  getRyoFrameData,
  getRyoAttackFrameData,
  RYO_MOVE_LIST,
  RYO_WIN_QUOTES,
  RYO_AVAILABLE_ACTIONS,
  getRyoAnimations,
  getRyoAnimSequence,
  getRyoAnimSequenceNames,
  RYO_REQUIRED_ANIMATIONS,
  RYO_HITBOX_KEYS,
  getRyoHitboxOffsets,
  RYO_ATTACK_FRAME_KEYS,
  getRyoAttackFrames,
  getRyoFeedbackTiers,
  getRyoFeedback,
  RYO_FEEDBACK_SUMMARY,
  generateRyoReport,
} from '../src/content/index.js';

import {
  loadCharacterContent,
  hasCharacterContent,
  getAvailableCharacterIds,
} from '../src/content/index.js';
import type { CharacterContent } from '../src/content/index.js';

import {
  validateRyoPackage,
  printValidationReport,
} from '../src/tools/validateRyoPackage.js';

// ===== Barrel Export Tests =====

describe('Ryo Content Package — Barrel Exports', () => {
  it('exports RyoDef', () => {
    expect(RyoDef).toBeDefined();
    expect(RyoDef.id).toBe('ryo');
  });

  it('exports RYO_CHARACTER_DATA', () => {
    expect(RYO_CHARACTER_DATA).toBeDefined();
    expect(RYO_CHARACTER_DATA.id).toBe('ryo');
  });

  it('exports RYO_STATS', () => {
    expect(RYO_STATS).toBeDefined();
    expect(RYO_STATS.walkSpeed).toBeGreaterThan(0);
  });

  it('exports RYO_ATTACK_KEYS', () => {
    expect(Array.isArray(RYO_ATTACK_KEYS)).toBe(true);
    expect(RYO_ATTACK_KEYS.length).toBeGreaterThan(0);
  });

  it('exports RYO_MOVE_LIST', () => {
    expect(Array.isArray(RYO_MOVE_LIST)).toBe(true);
    expect(RYO_MOVE_LIST.length).toBeGreaterThan(0);
  });

  it('exports RYO_AVAILABLE_ACTIONS', () => {
    expect(Array.isArray(RYO_AVAILABLE_ACTIONS)).toBe(true);
    expect(RYO_AVAILABLE_ACTIONS).toContain('idle');
    expect(RYO_AVAILABLE_ACTIONS).toContain('stand_a');
  });

  it('exports RYO_REQUIRED_ANIMATIONS', () => {
    expect(Array.isArray(RYO_REQUIRED_ANIMATIONS)).toBe(true);
    expect(RYO_REQUIRED_ANIMATIONS).toContain('idle');
    expect(RYO_REQUIRED_ANIMATIONS).toContain('walk_forward');
  });

  it('exports RYO_HITBOX_KEYS', () => {
    expect(Array.isArray(RYO_HITBOX_KEYS)).toBe(true);
    expect(RYO_HITBOX_KEYS).toContain('RYO_KOOU');
  });

  it('exports RYO_ATTACK_FRAME_KEYS', () => {
    expect(Array.isArray(RYO_ATTACK_FRAME_KEYS)).toBe(true);
    expect(RYO_ATTACK_FRAME_KEYS).toContain('RYO_KOOU');
  });

  it('exports RYO_FEEDBACK_SUMMARY', () => {
    expect(RYO_FEEDBACK_SUMMARY).toBeDefined();
    expect(RYO_FEEDBACK_SUMMARY.light).toBeDefined();
    expect(RYO_FEEDBACK_SUMMARY.special).toBeDefined();
    expect(RYO_FEEDBACK_SUMMARY.dm).toBeDefined();
  });
});

// ===== Character Data Tests =====

describe('Ryo Character Data', () => {
  it('has required identity fields', () => {
    expect(RYO_CHARACTER_DATA.id).toBe('ryo');
    expect(RYO_CHARACTER_DATA.displayName).toBe('RYO SAKAZAKI');
    expect(RYO_CHARACTER_DATA.nameCn).toBe('坂崎亮');
    expect(RYO_CHARACTER_DATA.subtitle).toBe('The Invincible Dragon');
  });

  it('has valid physics parameters', () => {
    expect(RYO_CHARACTER_DATA.walkSpeedForward).toBeGreaterThan(0);
    expect(RYO_CHARACTER_DATA.walkSpeedBackward).toBeGreaterThan(0);
    expect(RYO_CHARACTER_DATA.walkSpeedBackward).toBeLessThan(RYO_CHARACTER_DATA.walkSpeedForward);
    expect(RYO_CHARACTER_DATA.runSpeed).toBeGreaterThan(RYO_CHARACTER_DATA.walkSpeedForward);
    expect(RYO_CHARACTER_DATA.jumpVelocity).toBeLessThan(0);
    expect(RYO_CHARACTER_DATA.gravity).toBeGreaterThan(0);
  });

  it('has valid health and combat stats', () => {
    expect(RYO_CHARACTER_DATA.maxHP).toBe(1000);
    expect(RYO_CHARACTER_DATA.weight).toBe(100);
    expect(RYO_CHARACTER_DATA.closeRange).toBeGreaterThan(0);
    expect(RYO_CHARACTER_DATA.throwRange).toBeGreaterThan(RYO_CHARACTER_DATA.closeRange);
  });

  it('stats match original RyoDef', () => {
    expect(RYO_CHARACTER_DATA.walkSpeedForward).toBe(RyoDef.stats.walkSpeed);
    expect(RYO_CHARACTER_DATA.runSpeed).toBe(RyoDef.stats.runSpeed);
    expect(RYO_CHARACTER_DATA.jumpVelocity).toBe(RyoDef.stats.jumpVelocity);
    expect(RYO_CHARACTER_DATA.maxHP).toBe(RyoDef.stats.maxHealth);
  });
});

// ===== Attack Data Tests =====

describe('Ryo Attack Data', () => {
  it('getRyoFrameData returns all Ryo attacks', () => {
    const attacks = getRyoFrameData();
    expect(Object.keys(attacks).length).toBeGreaterThan(0);
    // Check key specials
    expect(attacks['RYO_KOOU']).toBeDefined();
    expect(attacks['RYO_KO_HOU']).toBeDefined();
    expect(attacks['DM_TEN_HA_OU']).toBeDefined();
  });

  it('normals have correct structure', () => {
    const standA = getRyoAttackFrameData('STAND_A');
    expect(standA).toBeDefined();
    expect(standA!.startup).toBeGreaterThan(0);
    expect(standA!.active).toBeGreaterThan(0);
    expect(standA!.recovery).toBeGreaterThan(0);
    expect(standA!.damage).toBeGreaterThan(0);
  });

  it('specials have chipDamage', () => {
    const koou = getRyoAttackFrameData('RYO_KOOU');
    expect(koou).toBeDefined();
    expect(koou!.chipDamage).toBeGreaterThan(0);
  });

  it('DMs have high damage', () => {
    const dm = getRyoAttackFrameData('DM_TEN_HA_OU');
    expect(dm).toBeDefined();
    expect(dm!.damage).toBeGreaterThanOrEqual(200);
  });

  it('attack keys include required categories', () => {
    // Normals
    expect(RYO_ATTACK_KEYS).toContain('STAND_A');
    expect(RYO_ATTACK_KEYS).toContain('CROUCH_C');
    // Command normals
    expect(RYO_ATTACK_KEYS).toContain('RYO_TSURIZAO');
    expect(RYO_ATTACK_KEYS).toContain('RYO_ORISHI');
    // Specials
    expect(RYO_ATTACK_KEYS).toContain('RYO_KOOU');
    expect(RYO_ATTACK_KEYS).toContain('RYO_KO_HOU');
    // DMs
    expect(RYO_ATTACK_KEYS).toContain('DM_TEN_HA_OU');
    expect(RYO_ATTACK_KEYS).toContain('DM_RYUKO_RANBU');
  });
});

// ===== Animation Tests =====

describe('Ryo Animations', () => {
  it('has animation manifest', () => {
    const anims = getRyoAnimations();
    expect(anims).toBeDefined();
    expect(anims!.charId).toBe('ryo');
  });

  it('has all required animations', () => {
    const names = getRyoAnimSequenceNames();
    for (const req of RYO_REQUIRED_ANIMATIONS) {
      expect(names).toContain(req);
    }
  });

  it('getRyoAnimSequence returns valid sequences', () => {
    const idle = getRyoAnimSequence('idle');
    expect(idle).toBeDefined();
    expect(idle!.frames.length).toBeGreaterThan(0);
    expect(idle!.loop).toBe(true);
  });

  it('attack animations are non-looping', () => {
    const standA = getRyoAnimSequence('stand_a');
    expect(standA).toBeDefined();
    expect(standA!.loop).toBe(false);
  });
});

// ===== Hitbox Tests =====

describe('Ryo Hitbox Data', () => {
  it('has hitbox offsets for specials', () => {
    const hitboxes = getRyoHitboxOffsets();
    expect(hitboxes['RYO_KOOU']).toBeDefined();
    expect(hitboxes['RYO_KO_HOU']).toBeDefined();
    expect(hitboxes['RYO_HIEN']).toBeDefined();
  });

  it('hitbox offsets have valid structure', () => {
    const hitboxes = getRyoHitboxOffsets();
    for (const key of RYO_HITBOX_KEYS) {
      const hb = hitboxes[key];
      if (hb) {
        expect(hb).toHaveProperty('offsetX');
        expect(hb).toHaveProperty('offsetY');
        expect(hb).toHaveProperty('width');
        expect(hb).toHaveProperty('height');
      }
    }
  });

  it('has per-frame attack hitbox data', () => {
    const frames = getRyoAttackFrames();
    expect(frames['RYO_KOOU']).toBeDefined();
    expect(frames['DM_TEN_HA_OU']).toBeDefined();
    expect(Array.isArray(frames['RYO_KOOU'])).toBe(true);
  });
});

// ===== Feedback Tests =====

describe('Ryo Feedback', () => {
  it('normals map to light/heavy tiers', () => {
    const tiers = getRyoFeedbackTiers();
    expect(tiers['STAND_A']).toBe('light');
    expect(tiers['STAND_C']).toBe('heavy');
    expect(tiers['CROUCH_A']).toBe('light');
    expect(tiers['CROUCH_C']).toBe('heavy');
  });

  it('specials map to special tier', () => {
    const tiers = getRyoFeedbackTiers();
    expect(tiers['RYO_KOOU']).toBe('special');
    expect(tiers['RYO_KO_HOU']).toBe('special');
    expect(tiers['RYO_HIEN']).toBe('special');
  });

  it('DMs map to dm/sdm tiers', () => {
    const tiers = getRyoFeedbackTiers();
    expect(tiers['DM_TEN_HA_OU']).toBe('dm');
    expect(tiers['SDM_RYUKO_RANBU']).toBe('sdm');
    expect(tiers['HSDM_RYUKO_RANBU']).toBe('sdm');
  });

  it('getRyoFeedback returns valid params', () => {
    const fb = getRyoFeedback('RYO_KOOU');
    expect(fb).toBeDefined();
    expect(fb.hitstop).toBeGreaterThan(0);
    expect(fb.shakeIntensity).toBeGreaterThan(0);
    expect(fb.sparkCount).toBeGreaterThan(0);
  });
});

// ===== Content Loader Tests =====

describe('Content Loader', () => {
  it('loadCharacterContent works for ryo', () => {
    const content = loadCharacterContent('ryo');
    expect(content).toBeDefined();
    expect(content.data.id).toBe('ryo');
  });

  it('loadCharacterContent throws for unknown characters', () => {
    expect(() => loadCharacterContent('unknown')).toThrow('Unknown character: unknown');
  });

  it('hasCharacterContent returns true for ryo', () => {
    expect(hasCharacterContent('ryo')).toBe(true);
  });

  it('hasCharacterContent returns false for unknown', () => {
    expect(hasCharacterContent('kyo')).toBe(false);
    expect(hasCharacterContent('unknown')).toBe(false);
  });

  it('getAvailableCharacterIds includes ryo', () => {
    const ids = getAvailableCharacterIds();
    expect(ids).toContain('ryo');
  });

  it('loaded content has all sections', () => {
    const content = loadCharacterContent('ryo');
    expect(content.data).toBeDefined();
    expect(content.attacks).toBeDefined();
    expect(content.attackKeys).toBeDefined();
    expect(content.commands).toBeDefined();
    expect(content.availableActions).toBeDefined();
    expect(content.animations).toBeDefined();
    expect(content.animSequenceNames).toBeDefined();
    expect(content.hitboxes).toBeDefined();
    expect(content.attackFrames).toBeDefined();
    expect(content.feedback).toBeDefined();
    expect(content.report).toBeDefined();
  });
});

// ===== Validation Tests =====

describe('Ryo Package Validation', () => {
  it('returns a valid report', () => {
    const report = validateRyoPackage();
    expect(report.character).toBe('ryo');
    expect(report.totalChecks).toBeGreaterThan(0);
    expect(report.completenessScore).toBeGreaterThanOrEqual(0);
    expect(report.completenessScore).toBeLessThanOrEqual(100);
  });

  it('passes content package exists check', () => {
    const report = validateRyoPackage();
    const existsCheck = report.checks.find(c => c.name === 'Content Package Exists');
    expect(existsCheck).toBeDefined();
    expect(existsCheck!.passed).toBe(true);
  });

  it('passes character data fields check', () => {
    const report = validateRyoPackage();
    const dataCheck = report.checks.find(c => c.name === 'Character Data Fields');
    expect(dataCheck).toBeDefined();
    expect(dataCheck!.passed).toBe(true);
  });

  it('printValidationReport does not throw', () => {
    const report = validateRyoPackage();
    expect(() => printValidationReport(report)).not.toThrow();
  });
});
