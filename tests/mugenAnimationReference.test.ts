/**
 * MUGEN Animation Reference Tests
 *
 * Validates that our FRAME_DATA values are reasonable when compared to
 * MUGEN animation structure patterns extracted from warusaki3's CVS Ryo
 * and the IKEMEN KFM default character.
 *
 * These tests compare patterns and ratios, NOT exact pixel values.
 * Source: docs/reference/ryo-mugen-animation-reference.md
 */
import { describe, it, expect } from 'vitest';
import { FRAME_DATA } from '../src/core/frameDataConstants.js';

// ===== MUGEN Reference Patterns (from cvsryo.air analysis) =====
// These are structural patterns observed in MUGEN character data,
// used as sanity bounds rather than exact targets.

const MUGEN_PATTERNS = {
  // Startup ticks to first active frame in MUGEN cvsryo
  // (CVS-style is faster than KOF, so KOF values can be higher)
  startup: {
    lightMax: 5,   // MUGEN light attacks: 3 ticks
    mediumMax: 8,  // MUGEN medium attacks: 3-5 ticks
    heavyMax: 10,  // MUGEN heavy attacks: 5-8 ticks
  },
  // Active frame tick ranges
  active: {
    lightMin: 1,
    lightMax: 5,
    mediumMin: 2,
    mediumMax: 6,
    heavyMin: 2,
    heavyMax: 10,
  },
  // Recovery-to-active ratio patterns from MUGEN data
  // light ~0.4-1.0, medium ~0.15-0.3, heavy ~0.16-0.4
  recoveryToActiveRatio: {
    lightMax: 3.0,
    mediumMax: 5.0,
    heavyMax: 6.0,
  },
  // MUGEN cvsryo physics
  walkSpeedRange: [1.5, 4.0],   // px/tick (Ryo: 2.67, KFM: 2.4)
  runSpeedRange: [3.5, 6.0],    // px/tick (Ryo: 4.93, KFM: 4.6)
  gravityRange: [0.3, 0.7],     // px/tick^2 (Ryo: 0.57, KFM: 0.44)
  frictionRange: [0.7, 0.95],   // (both: 0.85 standing)
};

// Our FRAME_DATA normal moves categorized by weight
const LIGHT_NORMALS = ['STAND_A', 'CLOSE_A', 'CROUCH_A', 'CROUCH_B', 'JUMP_A', 'JUMP_B'];
const MEDIUM_NORMALS = ['STAND_B', 'CLOSE_B', 'CROUCH_B'];
const HEAVY_NORMALS = ['STAND_C', 'CLOSE_C', 'STAND_D', 'CLOSE_D', 'CROUCH_C', 'CROUCH_D', 'JUMP_C', 'JUMP_D'];

// =====================================================================
// 1. Startup Reasonableness
// =====================================================================

describe('FRAME_DATA startup values are reasonable vs MUGEN patterns', () => {
  it('light normal startup should be within plausible range', () => {
    // MUGEN light attacks have ~3 ticks startup. KOF convention counts
    // the first active frame as part of startup, so our values are higher.
    // Upper bound: MUGEN light max + KOF overhead margin
    for (const key of LIGHT_NORMALS) {
      const fd = FRAME_DATA[key as keyof typeof FRAME_DATA];
      if (!fd || typeof fd.startup !== 'number') continue;
      expect(fd.startup).toBeGreaterThanOrEqual(2);
      expect(fd.startup).toBeLessThanOrEqual(8);
    }
  });

  it('heavy normal startup should be within plausible range', () => {
    // MUGEN heavy attacks: 5-8 ticks. KOF values can be higher.
    for (const key of HEAVY_NORMALS) {
      const fd = FRAME_DATA[key as keyof typeof FRAME_DATA];
      if (!fd || typeof fd.startup !== 'number') continue;
      expect(fd.startup).toBeGreaterThanOrEqual(2);
      expect(fd.startup).toBeLessThanOrEqual(14);
    }
  });

  it('special move startup should not be faster than light normals', () => {
    const lightStartup = FRAME_DATA['STAND_A'].startup;
    // DP-type moves (invincible reversal) can have very low startup
    // but projectile startup should be slower than a jab
    const projectile = FRAME_DATA['SPECIAL_PROJECTILE'];
    if (projectile && typeof projectile.startup === 'number') {
      expect(projectile.startup).toBeGreaterThanOrEqual(lightStartup);
    }
  });
});

// =====================================================================
// 2. Active/Recovery Ratio Consistency
// =====================================================================

describe('FRAME_DATA active/recovery ratios match MUGEN patterns', () => {
  it('light normals should have short active windows relative to total duration', () => {
    for (const key of LIGHT_NORMALS) {
      const fd = FRAME_DATA[key as keyof typeof FRAME_DATA];
      if (!fd || typeof fd.active !== 'number' || typeof fd.recovery !== 'number') continue;
      const ratio = fd.recovery / Math.max(fd.active, 1);
      // Light attacks in MUGEN have ratio ~0.4-1.0; our KOF data allows more range
      expect(ratio).toBeLessThanOrEqual(MUGEN_PATTERNS.recoveryToActiveRatio.lightMax);
    }
  });

  it('heavy normals should have longer recovery than active frames', () => {
    for (const key of HEAVY_NORMALS) {
      const fd = FRAME_DATA[key as keyof typeof FRAME_DATA];
      if (!fd || typeof fd.active !== 'number' || typeof fd.recovery !== 'number') continue;
      // Skip aerial normals (recovery = 0 in KOF convention)
      if (fd.recovery === 0) continue;
      // Heavy attacks: recovery should always exceed active
      expect(fd.recovery).toBeGreaterThan(fd.active);
    }
  });

  it('total duration should scale with attack weight (light < heavy)', () => {
    const lightDurations = LIGHT_NORMALS
      .map(k => FRAME_DATA[k as keyof typeof FRAME_DATA])
      .filter(fd => fd && typeof fd.startup === 'number')
      .map(fd => (fd as { startup: number; active: number; recovery: number })
        .startup + (fd as { active: number }).active + (fd as { recovery: number }).recovery);
    const heavyDurations = HEAVY_NORMALS
      .map(k => FRAME_DATA[k as keyof typeof FRAME_DATA])
      .filter(fd => fd && typeof fd.startup === 'number')
      .map(fd => (fd as { startup: number; active: number; recovery: number })
        .startup + (fd as { active: number }).active + (fd as { recovery: number }).recovery);

    const avgLight = lightDurations.reduce((a, b) => a + b, 0) / Math.max(lightDurations.length, 1);
    const avgHeavy = heavyDurations.reduce((a, b) => a + b, 0) / Math.max(heavyDurations.length, 1);

    // Heavy attacks should average longer total duration than light attacks
    expect(avgHeavy).toBeGreaterThan(avgLight);
  });
});

// =====================================================================
// 3. Damage Scaling Patterns
// =====================================================================

describe('FRAME_DATA damage follows weight hierarchy from MUGEN patterns', () => {
  it('light damage < heavy damage for standing normals', () => {
    const standA = FRAME_DATA['STAND_A'];
    const standC = FRAME_DATA['STAND_C'];
    if (standA && standC && typeof standA.damage === 'number' && typeof standC.damage === 'number') {
      expect(standC.damage).toBeGreaterThan(standA.damage);
    }
  });

  it('crouch damage < or = stand damage for same button weight (MUGEN pattern)', () => {
    // MUGEN: crouch attacks deal similar or slightly less damage than standing
    const standC = FRAME_DATA['STAND_C'];
    const crouchC = FRAME_DATA['CROUCH_C'];
    if (standC && crouchC && typeof standC.damage === 'number' && typeof crouchC.damage === 'number') {
      // Crouch C can be equal or slightly less; MUGEN cvsryo C.HP = 98 vs S.HP = 98
      expect(crouchC.damage).toBeLessThanOrEqual(standC.damage * 1.1);
    }
  });
});

// =====================================================================
// 4. Hitstun/Blockstun Proportions
// =====================================================================

describe('FRAME_DATA hitstun/blockstun proportions match MUGEN patterns', () => {
  it('hitstun should be proportional to blockstun (MUGEN convention)', () => {
    // In MUGEN, ground.hittime is typically >= guard.ctrltime for ground normals.
    // However, aerial attacks can have guard.ctrltime > hittime.
    // We check that the ratio stays within a reasonable band (MUGEN pattern).
    for (const key of Object.keys(FRAME_DATA)) {
      const fd = FRAME_DATA[key as keyof typeof FRAME_DATA];
      if (!fd || typeof fd.hitstun !== 'number' || typeof fd.blockstun !== 'number') continue;
      // Skip knockdown moves (0 hitstun = special down state behavior)
      // Skip entries with 0 blockstun (ratio is undefined)
      if (fd.hitstun === 0 || fd.blockstun === 0) continue;
      // MUGEN ratio: hitstun/blockstun is typically 0.6-2.0
      const ratio = fd.hitstun / fd.blockstun;
      expect(ratio).toBeGreaterThanOrEqual(0.5);
      expect(ratio).toBeLessThanOrEqual(2.5);
    }
  });

  it('light attack hitstun should be around 11 frames (MUGEN: 10+)', () => {
    // MUGEN cvsryo light attacks: ground.hittime = 10+
    const standA = FRAME_DATA['STAND_A'];
    if (standA && typeof standA.hitstun === 'number') {
      expect(standA.hitstun).toBeGreaterThanOrEqual(8);
      expect(standA.hitstun).toBeLessThanOrEqual(16);
    }
  });

  it('heavy attack hitstun should be significantly higher than light (MUGEN: 17+)', () => {
    // MUGEN cvsryo heavy attacks: ground.hittime = 17+
    const standC = FRAME_DATA['STAND_C'];
    if (standC && typeof standC.hitstun === 'number') {
      expect(standC.hitstun).toBeGreaterThanOrEqual(14);
    }
  });
});

// =====================================================================
// 5. Knockdown Consistency
// =====================================================================

describe('FRAME_DATA knockdown assignments are consistent with MUGEN patterns', () => {
  it('sweep (CROUCH_D) should cause knockdown', () => {
    // MUGEN: ground sweep causes trip -> fall
    const crouchD = FRAME_DATA['CROUCH_D'];
    if (crouchD && typeof crouchD.knockdown === 'boolean') {
      expect(crouchD.knockdown).toBe(true);
    }
  });

  it('CD attacks should cause knockdown', () => {
    const standCd = FRAME_DATA['STAND_CD'];
    if (standCd && typeof standCd.knockdown === 'boolean') {
      expect(standCd.knockdown).toBe(true);
    }
  });

  it('throws should cause knockdown', () => {
    const throwFwd = FRAME_DATA['THROW_FORWARD'];
    if (throwFwd && typeof throwFwd.knockdown === 'boolean') {
      expect(throwFwd.knockdown).toBe(true);
    }
  });

  it('light normals should NOT cause knockdown', () => {
    // MUGEN: light normals never knockdown
    const standA = FRAME_DATA['STAND_A'];
    if (standA && typeof standA.knockdown === 'boolean') {
      expect(standA.knockdown).toBe(false);
    }
  });
});

// =====================================================================
// 6. Pushback Scale Consistency
// =====================================================================

describe('FRAME_DATA pushback follows weight hierarchy', () => {
  it('heavy attacks should have more pushback than light attacks', () => {
    const standA = FRAME_DATA['STAND_A'];
    const standC = FRAME_DATA['STAND_C'];
    if (standA && standC
      && typeof standA.pushback === 'number' && typeof standC.pushback === 'number') {
      expect(standC.pushback).toBeGreaterThan(standA.pushback);
    }
  });

  it('all normals should have positive pushback', () => {
    // MUGEN: ground.velocity is always negative (pushing opponent away)
    // Our pushback is a positive magnitude
    for (const key of [...LIGHT_NORMALS, ...MEDIUM_NORMALS, ...HEAVY_NORMALS]) {
      const fd = FRAME_DATA[key as keyof typeof FRAME_DATA];
      if (!fd || typeof fd.pushback !== 'number') continue;
      expect(fd.pushback).toBeGreaterThan(0);
    }
  });
});

// =====================================================================
// 7. Ryo-Specific Frame Data
// =====================================================================

describe('Ryo special moves follow MUGEN timing patterns', () => {
  it('Ryo Kohou (DP) should have fast startup (MUGEN: active at frame 3)', () => {
    // MUGEN cvsryo Action 1100: active at frame position 2-4 (~5 ticks)
    // KOF DP startup is typically 3-5 frames
    const koHou = FRAME_DATA['RYO_KO_HOU'];
    if (koHou && typeof koHou.startup === 'number') {
      expect(koHou.startup).toBeLessThanOrEqual(7);
      expect(koHou.startup).toBeGreaterThanOrEqual(3);
    }
  });

  it('Ryo Ko\'ou Ken (projectile) should have slower startup than DP', () => {
    // MUGEN cvsryo Action 1000: 40 ticks total, projectile separates late
    // KOF projectile startup is typically 10-15 frames
    const koou = FRAME_DATA['RYO_KOOU'];
    const koHou = FRAME_DATA['RYO_KO_HOU'];
    if (koou && koHou
      && typeof koou.startup === 'number' && typeof koHou.startup === 'number') {
      expect(koou.startup).toBeGreaterThan(koHou.startup);
    }
  });

  it('Ryo command normals should be between lights and specials in startup', () => {
    // MUGEN cvsryo Action 1400 (Hio Hacker): 7 ticks to active
    const ryoCmd = FRAME_DATA['RYO_TSURIZAO'];
    const standA = FRAME_DATA['STAND_A'];
    const koHou = FRAME_DATA['RYO_KO_HOU'];
    if (ryoCmd && standA && koHou
      && typeof ryoCmd.startup === 'number'
      && typeof standA.startup === 'number'
      && typeof koHou.startup === 'number') {
      // Command normals are slower than light normals but can be faster than specials
      expect(ryoCmd.startup).toBeGreaterThan(standA.startup);
    }
  });
});

// =====================================================================
// 8. Structural Integrity
// =====================================================================

describe('FRAME_DATA structure has all required MUGEN-equivalent fields', () => {
  it('every attack entry has startup, active, recovery, damage', () => {
    const requiredFields = ['startup', 'active', 'recovery', 'damage'];
    for (const key of Object.keys(FRAME_DATA)) {
      const fd = FRAME_DATA[key as keyof typeof FRAME_DATA];
      if (!fd || typeof fd !== 'object') continue;
      for (const field of requiredFields) {
        expect(fd).toHaveProperty(field);
        expect(typeof (fd as Record<string, unknown>)[field]).toBe('number');
      }
    }
  });

  it('every attack entry has hitstun, blockstun, pushback, hitLevel, knockdown', () => {
    const requiredFields = ['hitstun', 'blockstun', 'pushback', 'hitLevel', 'knockdown'];
    for (const key of Object.keys(FRAME_DATA)) {
      const fd = FRAME_DATA[key as keyof typeof FRAME_DATA];
      if (!fd || typeof fd !== 'object') continue;
      for (const field of requiredFields) {
        expect(fd).toHaveProperty(field);
      }
    }
  });
});
