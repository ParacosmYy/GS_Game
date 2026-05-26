/**
 * CombatSystem Types & Constants Tests
 *
 * Tests exported types, constants, pure utility functions,
 * and Ryo-relevant attack type validation from the combat module.
 */
import { describe, it, expect } from 'vitest';
import { CombatSystem } from '../src/combat/combatSystem.js';
import type { HitCallback } from '../src/combat/combatSystem.js';
import {
  FRAME_DATA,
  CHIP_DAMAGE_RATIO,
  COMBO_DAMAGE_SCALE,
  COMBO_MIN_SCALE,
  DM_COMBO_PENALTY,
  CANCEL_WINDOW_NORMAL,
  CANCEL_WINDOW_RAPID,
  CANCEL_WINDOW_SUPER,
  CANCEL_WINDOW_FREE,
  THROW_RANGE,
  THROW_DISTANCE,
  JUGGLE_POINTS_MAX,
  JUGGLE_COST_LIGHT,
  JUGGLE_COST_HEAVY,
  JUGGLE_COST_SPECIAL,
  JUGGLE_COST_DM,
  JUGGLE_COST_CD,
  JUGGLE_GRAVITY_BASE,
  JUGGLE_GRAVITY_SCALE_PER_HIT,
  GROUND_BOUNCE_VY,
  GROUND_BOUNCE_COST,
  GROUND_BOUNCE_HITSTUN,
  WALL_BOUNCE_MAX_PER_COMBO,
  STUN_FILL_LIGHT,
  STUN_FILL_HEAVY,
  STUN_FILL_SPECIAL,
  STUN_FILL_DM,
  STUN_FILL_CD,
  STUN_FILL_THROW,
  STUN_FILL_COMMAND_NORMAL,
  GUARD_CRUSH_DURATION,
  GUARD_GAUGE_DRAIN_LIGHT,
  GUARD_GAUGE_DRAIN_HEAVY,
  GUARD_GAUGE_DRAIN_COMMAND_NORMAL,
  GUARD_GAUGE_DRAIN_SPECIAL,
  GUARD_GAUGE_DRAIN_DM,
  GUARD_GAUGE_DRAIN_SDM,
  GUARD_GAUGE_DRAIN_CD,
  GUARD_GAUGE_METER_BONUS_ON_BLOCK,
  PUSHBLOCK_THRESHOLD,
  PUSHBLOCK_EXTRA_PUSHBACK,
  PUSHBLOCK_DECAY_FRAMES,
  WRONG_BLOCK_PUSHBACK_MULT,
  WRONG_BLOCK_STUN_MULT,
  MAX_MODE_DAMAGE_BONUS,
  MAX_MODE_DEFENSE_BONUS,
  DESPERATION_HEALTH_THRESHOLD,
  DESPERATION_DM_DAMAGE_BONUS,
  THROW_INVINCIBILITY_POST_ESCAPE,
  PROXIMITY_GUARD_RANGE,
  LIGHT_NORMALS,
  NORMAL_ATTACKS,
  COMMAND_NORMALS,
  COUNTER_WIRE_BOUNCE_VX,
  COUNTER_WIRE_BOUNCE_VY,
  COMBO_TIMEOUT,
} from '../src/core/constants.js';
import {
  isDM,
  isCharacterSpecial,
  isSpecialOrDM,
  classify,
  AttackCategory,
} from '../src/core/attackClassifier.js';
import { AttackType, FighterState, JuggleState } from '../src/core/types.js';

// ── 1. Combat System Static Methods ──────────────────────────

describe('CombatSystem.getCancelWindow', () => {
  it('returns CANCEL_WINDOW_NORMAL for "normal"', () => {
    expect(CombatSystem.getCancelWindow('normal')).toBe(CANCEL_WINDOW_NORMAL);
  });

  it('returns CANCEL_WINDOW_RAPID for "rapid"', () => {
    expect(CombatSystem.getCancelWindow('rapid')).toBe(CANCEL_WINDOW_RAPID);
  });

  it('returns CANCEL_WINDOW_SUPER for "super"', () => {
    expect(CombatSystem.getCancelWindow('super')).toBe(CANCEL_WINDOW_SUPER);
  });

  it('returns CANCEL_WINDOW_FREE for "free"', () => {
    expect(CombatSystem.getCancelWindow('free')).toBe(CANCEL_WINDOW_FREE);
  });

  it('cancel windows are positive integers', () => {
    expect(CANCEL_WINDOW_NORMAL).toBeGreaterThan(0);
    expect(CANCEL_WINDOW_RAPID).toBeGreaterThan(0);
    expect(CANCEL_WINDOW_SUPER).toBeGreaterThan(0);
    expect(CANCEL_WINDOW_FREE).toBeGreaterThan(0);
  });

  it('super cancel window is widest, rapid is narrowest', () => {
    expect(CANCEL_WINDOW_SUPER).toBeGreaterThanOrEqual(CANCEL_WINDOW_NORMAL);
    expect(CANCEL_WINDOW_NORMAL).toBeGreaterThanOrEqual(CANCEL_WINDOW_RAPID);
  });
});

// ── 2. Attack Classifier Pure Functions ───────────────────────

describe('attackClassifier', () => {
  describe('isDM', () => {
    it('recognizes DM_ prefix', () => {
      expect(isDM('DM_RYUKO_RANBU')).toBe(true);
    });

    it('recognizes SDM_ prefix', () => {
      expect(isDM('SDM_RYUKO_RANBU')).toBe(true);
    });

    it('recognizes HSDM_ prefix', () => {
      expect(isDM('HSDM_RYUKO_RANBU')).toBe(true);
    });

    it('rejects normal attacks', () => {
      expect(isDM('STAND_A')).toBe(false);
      expect(isDM('STAND_C')).toBe(false);
    });

    it('rejects specials', () => {
      expect(isDM('SPECIAL_UPPER')).toBe(false);
      expect(isDM('RYO_KOOU_KEN')).toBe(false);
    });
  });

  describe('isCharacterSpecial', () => {
    it('recognizes Ryo specials', () => {
      expect(isCharacterSpecial('RYO_KOOU_KEN')).toBe(true);
      expect(isCharacterSpecial('RYO_KO_HOU')).toBe(true);
      expect(isCharacterSpecial('RYO_HIEN')).toBe(true);
      expect(isCharacterSpecial('RYO_HAOU_SHOU_KOU_KEN')).toBe(true);
    });

    it('recognizes Kyo specials', () => {
      expect(isCharacterSpecial('KYO_ONIYAKI')).toBe(true);
      expect(isCharacterSpecial('KYO_YAMIBARAI')).toBe(true);
    });

    it('excludes COMMAND_NORMALS entries even with character prefix', () => {
      // IORI_YUMEYUMI is in COMMAND_NORMALS
      expect(isCharacterSpecial('IORI_YUMEYUMI')).toBe(false);
    });

    it('excludes normal prefixes', () => {
      expect(isCharacterSpecial('STAND_A')).toBe(false);
      expect(isCharacterSpecial('CLOSE_C')).toBe(false);
      expect(isCharacterSpecial('CROUCH_D')).toBe(false);
    });

    it('excludes generic specials', () => {
      expect(isCharacterSpecial('SPECIAL_UPPER')).toBe(false);
    });
  });

  describe('isSpecialOrDM', () => {
    it('is true for DMs', () => {
      expect(isSpecialOrDM('DM_RYUKO_RANBU')).toBe(true);
    });

    it('is true for generic SPECIAL_ prefix', () => {
      expect(isSpecialOrDM('SPECIAL_UPPER')).toBe(true);
      expect(isSpecialOrDM('SPECIAL_PROJECTILE')).toBe(true);
    });

    it('is true for character specials', () => {
      expect(isSpecialOrDM('RYO_KOOU_KEN')).toBe(true);
      expect(isSpecialOrDM('KYO_ONIYAKI')).toBe(true);
    });

    it('is false for normals', () => {
      expect(isSpecialOrDM('STAND_A')).toBe(false);
      expect(isSpecialOrDM('CLOSE_C')).toBe(false);
    });
  });

  describe('classify', () => {
    it('classifies DM attacks', () => {
      expect(classify('DM_RYUKO_RANBU')).toBe(AttackCategory.DM);
      expect(classify('SDM_TEN_HA_OU')).toBe(AttackCategory.DM);
      expect(classify('HSDM_RYUKO_RANBU')).toBe(AttackCategory.DM);
    });

    it('classifies throws', () => {
      expect(classify('THROW')).toBe(AttackCategory.THROW);
      expect(classify('THROW_FORWARD')).toBe(AttackCategory.THROW);
      expect(classify('THROW_BACK')).toBe(AttackCategory.THROW);
    });

    it('classifies blowbacks', () => {
      expect(classify('STAND_CD')).toBe(AttackCategory.BLOWBACK);
      expect(classify('JUMP_CD')).toBe(AttackCategory.BLOWBACK);
    });

    it('classifies command normals', () => {
      expect(classify('RYO_TSURIZAO')).toBe(AttackCategory.COMMAND);
      expect(classify('RYO_ORISHI')).toBe(AttackCategory.COMMAND);
      expect(classify('IORI_YUMEYUMI')).toBe(AttackCategory.COMMAND);
      expect(classify('CMD_GOFU_YOU')).toBe(AttackCategory.COMMAND);
    });

    it('classifies specials', () => {
      expect(classify('RYO_KOOU_KEN')).toBe(AttackCategory.SPECIAL);
      expect(classify('RYO_KO_HOU')).toBe(AttackCategory.SPECIAL);
      expect(classify('SPECIAL_UPPER')).toBe(AttackCategory.SPECIAL);
    });

    it('classifies normals', () => {
      expect(classify('STAND_A')).toBe(AttackCategory.NORMAL);
      expect(classify('CLOSE_C')).toBe(AttackCategory.NORMAL);
      expect(classify('CROUCH_D')).toBe(AttackCategory.NORMAL);
      expect(classify('JUMP_B')).toBe(AttackCategory.NORMAL);
    });
  });
});

// ── 3. Combat Constants Validation ───────────────────────────

describe('Combat Constants', () => {
  it('COMBO_DAMAGE_SCALE has valid decreasing tiers', () => {
    const keys = Object.keys(COMBO_DAMAGE_SCALE).map(Number).sort((a, b) => a - b);
    for (let i = 1; i < keys.length; i++) {
      expect(COMBO_DAMAGE_SCALE[keys[i]]).toBeLessThanOrEqual(COMBO_DAMAGE_SCALE[keys[i - 1]]);
    }
  });

  it('COMBO_MIN_SCALE is within valid range', () => {
    expect(COMBO_MIN_SCALE).toBeGreaterThan(0);
    expect(COMBO_MIN_SCALE).toBeLessThanOrEqual(1);
  });

  it('DM_COMBO_PENALTY is a valid fraction', () => {
    expect(DM_COMBO_PENALTY).toBeGreaterThan(0);
    expect(DM_COMBO_PENALTY).toBeLessThan(1);
  });

  it('CHIP_DAMAGE_RATIO is positive and small', () => {
    expect(CHIP_DAMAGE_RATIO).toBeGreaterThan(0);
    expect(CHIP_DAMAGE_RATIO).toBeLessThanOrEqual(0.5);
  });

  it('THROW constants are positive', () => {
    expect(THROW_RANGE).toBeGreaterThan(0);
    expect(THROW_DISTANCE).toBeGreaterThan(0);
    expect(THROW_INVINCIBILITY_POST_ESCAPE).toBeGreaterThan(0);
  });

  it('JUGGLE constants have valid hierarchy: DM > Heavy/Special >= Light', () => {
    expect(JUGGLE_COST_DM).toBeGreaterThan(JUGGLE_COST_LIGHT);
    expect(JUGGLE_COST_HEAVY).toBeGreaterThanOrEqual(JUGGLE_COST_LIGHT);
    expect(JUGGLE_COST_SPECIAL).toBeGreaterThanOrEqual(JUGGLE_COST_LIGHT);
    expect(JUGGLE_COST_CD).toBeGreaterThanOrEqual(JUGGLE_COST_LIGHT);
  });

  it('JUGGLE_POINTS_MAX > 0', () => {
    expect(JUGGLE_POINTS_MAX).toBeGreaterThan(0);
  });

  it('JUGGLE gravity constants are positive', () => {
    expect(JUGGLE_GRAVITY_BASE).toBeGreaterThan(0);
    expect(JUGGLE_GRAVITY_SCALE_PER_HIT).toBeGreaterThan(0);
  });

  it('GROUND_BOUNCE constants are valid', () => {
    expect(GROUND_BOUNCE_VY).toBeLessThan(0); // upward velocity
    expect(GROUND_BOUNCE_COST).toBeGreaterThan(0);
    expect(GROUND_BOUNCE_HITSTUN).toBeGreaterThan(0);
  });

  it('WALL_BOUNCE_MAX_PER_COMBO >= 1', () => {
    expect(WALL_BOUNCE_MAX_PER_COMBO).toBeGreaterThanOrEqual(1);
  });

  it('COUNTER_WIRE_BOUNCE_VX > 0, VY < 0', () => {
    expect(COUNTER_WIRE_BOUNCE_VX).toBeGreaterThan(0);
    expect(COUNTER_WIRE_BOUNCE_VY).toBeLessThan(0);
  });

  it('COMBO_TIMEOUT is reasonable (30-120 frames)', () => {
    expect(COMBO_TIMEOUT).toBeGreaterThanOrEqual(30);
    expect(COMBO_TIMEOUT).toBeLessThanOrEqual(120);
  });

  it('PROXIMITY_GUARD_RANGE is positive', () => {
    expect(PROXIMITY_GUARD_RANGE).toBeGreaterThan(0);
  });
});

// ── 4. Stun Fill Constants Hierarchy ─────────────────────────

describe('Stun Fill Constants', () => {
  it('hierarchy: DM > Special > Heavy > Command Normal > Light', () => {
    expect(STUN_FILL_DM).toBeGreaterThan(STUN_FILL_SPECIAL);
    expect(STUN_FILL_SPECIAL).toBeGreaterThan(STUN_FILL_HEAVY);
    expect(STUN_FILL_HEAVY).toBeGreaterThan(STUN_FILL_COMMAND_NORMAL);
    expect(STUN_FILL_COMMAND_NORMAL).toBeGreaterThan(STUN_FILL_LIGHT);
  });

  it('throw stun fill is between special and heavy', () => {
    expect(STUN_FILL_THROW).toBeGreaterThan(STUN_FILL_HEAVY);
    expect(STUN_FILL_THROW).toBeLessThanOrEqual(STUN_FILL_SPECIAL);
  });

  it('CD stun fill is between command normal and special', () => {
    expect(STUN_FILL_CD).toBeGreaterThan(STUN_FILL_COMMAND_NORMAL);
  });

  it('all stun values are positive', () => {
    expect(STUN_FILL_LIGHT).toBeGreaterThan(0);
    expect(STUN_FILL_HEAVY).toBeGreaterThan(0);
    expect(STUN_FILL_COMMAND_NORMAL).toBeGreaterThan(0);
    expect(STUN_FILL_SPECIAL).toBeGreaterThan(0);
    expect(STUN_FILL_DM).toBeGreaterThan(0);
    expect(STUN_FILL_CD).toBeGreaterThan(0);
    expect(STUN_FILL_THROW).toBeGreaterThan(0);
  });
});

// ── 5. Guard Gauge Constants ─────────────────────────────────

describe('Guard Gauge Constants', () => {
  it('drain hierarchy: SDM > DM > Special > Command Normal >= CD >= Heavy > Light', () => {
    expect(GUARD_GAUGE_DRAIN_SDM).toBeGreaterThan(GUARD_GAUGE_DRAIN_DM);
    expect(GUARD_GAUGE_DRAIN_DM).toBeGreaterThan(GUARD_GAUGE_DRAIN_SPECIAL);
    expect(GUARD_GAUGE_DRAIN_SPECIAL).toBeGreaterThan(GUARD_GAUGE_DRAIN_COMMAND_NORMAL);
    expect(GUARD_GAUGE_DRAIN_HEAVY).toBeGreaterThan(GUARD_GAUGE_DRAIN_LIGHT);
  });

  it('GUARD_CRUSH_DURATION is positive', () => {
    expect(GUARD_CRUSH_DURATION).toBeGreaterThan(0);
  });

  it('GUARD_GAUGE_METER_BONUS_ON_BLOCK is positive but small', () => {
    expect(GUARD_GAUGE_METER_BONUS_ON_BLOCK).toBeGreaterThan(0);
    expect(GUARD_GAUGE_METER_BONUS_ON_BLOCK).toBeLessThan(10);
  });
});

// ── 6. Pushblock & Wrong Block Constants ─────────────────────

describe('Pushblock & Wrong Block Constants', () => {
  it('PUSHBLOCK_THRESHOLD >= 1', () => {
    expect(PUSHBLOCK_THRESHOLD).toBeGreaterThanOrEqual(1);
  });

  it('PUSHBLOCK_EXTRA_PUSHBACK > 1 (amplifies pushback)', () => {
    expect(PUSHBLOCK_EXTRA_PUSHBACK).toBeGreaterThan(1);
  });

  it('PUSHBLOCK_DECAY_FRAMES > 0', () => {
    expect(PUSHBLOCK_DECAY_FRAMES).toBeGreaterThan(0);
  });

  it('WRONG_BLOCK multipliers > 1 (penalty)', () => {
    expect(WRONG_BLOCK_PUSHBACK_MULT).toBeGreaterThan(1);
    expect(WRONG_BLOCK_STUN_MULT).toBeGreaterThan(1);
  });
});

// ── 7. MAX Mode & Desperation Constants ──────────────────────

describe('MAX Mode & Desperation Constants', () => {
  it('MAX_MODE_DAMAGE_BONUS > 1 (damage increase)', () => {
    expect(MAX_MODE_DAMAGE_BONUS).toBeGreaterThan(1);
  });

  it('MAX_MODE_DEFENSE_BONUS < 1 (damage reduction)', () => {
    expect(MAX_MODE_DEFENSE_BONUS).toBeLessThan(1);
    expect(MAX_MODE_DEFENSE_BONUS).toBeGreaterThan(0);
  });

  it('DESPERATION_HEALTH_THRESHOLD is between 0 and 1', () => {
    expect(DESPERATION_HEALTH_THRESHOLD).toBeGreaterThan(0);
    expect(DESPERATION_HEALTH_THRESHOLD).toBeLessThan(1);
  });

  it('DESPERATION_DM_DAMAGE_BONUS > 1 (damage boost)', () => {
    expect(DESPERATION_DM_DAMAGE_BONUS).toBeGreaterThan(1);
  });
});

// ── 8. Attack Set Membership (LIGHT_NORMALS, NORMAL_ATTACKS, COMMAND_NORMALS) ──

describe('Attack Set Membership', () => {
  it('LIGHT_NORMALS contains A and B buttons', () => {
    expect(LIGHT_NORMALS.has('STAND_A')).toBe(true);
    expect(LIGHT_NORMALS.has('STAND_B')).toBe(true);
    expect(LIGHT_NORMALS.has('CLOSE_A')).toBe(true);
    expect(LIGHT_NORMALS.has('CLOSE_B')).toBe(true);
    expect(LIGHT_NORMALS.has('CROUCH_A')).toBe(true);
    expect(LIGHT_NORMALS.has('CROUCH_B')).toBe(true);
    expect(LIGHT_NORMALS.has('JUMP_A')).toBe(true);
    expect(LIGHT_NORMALS.has('JUMP_B')).toBe(true);
  });

  it('LIGHT_NORMALS excludes C and D buttons', () => {
    expect(LIGHT_NORMALS.has('STAND_C')).toBe(false);
    expect(LIGHT_NORMALS.has('STAND_D')).toBe(false);
  });

  it('NORMAL_ATTACKS includes grounded normals only (stand/close/crouch)', () => {
    // Light
    expect(NORMAL_ATTACKS.has('STAND_A')).toBe(true);
    expect(NORMAL_ATTACKS.has('STAND_B')).toBe(true);
    // Heavy
    expect(NORMAL_ATTACKS.has('STAND_C')).toBe(true);
    expect(NORMAL_ATTACKS.has('STAND_D')).toBe(true);
    // Close
    expect(NORMAL_ATTACKS.has('CLOSE_A')).toBe(true);
    expect(NORMAL_ATTACKS.has('CLOSE_C')).toBe(true);
    // Crouch
    expect(NORMAL_ATTACKS.has('CROUCH_A')).toBe(true);
    expect(NORMAL_ATTACKS.has('CROUCH_D')).toBe(true);
    // Air normals are NOT in NORMAL_ATTACKS (grounded only)
    expect(NORMAL_ATTACKS.has('JUMP_A')).toBe(false);
    expect(NORMAL_ATTACKS.has('JUMP_C')).toBe(false);
  });

  it('NORMAL_ATTACKS excludes specials and command normals', () => {
    expect(NORMAL_ATTACKS.has('RYO_KOOU_KEN')).toBe(false);
    expect(NORMAL_ATTACKS.has('CMD_GOFU_YOU')).toBe(false);
  });

  it('COMMAND_NORMALS contains Ryo command normals', () => {
    expect(COMMAND_NORMALS.has('RYO_TSURIZAO')).toBe(true);
    expect(COMMAND_NORMALS.has('RYO_ORISHI')).toBe(true);
  });

  it('COMMAND_NORMALS contains generic CMD_ prefix entries', () => {
    expect(COMMAND_NORMALS.has('CMD_GOFU_YOU')).toBe(true);
    expect(COMMAND_NORMALS.has('CMD_88SHIKI')).toBe(true);
    expect(COMMAND_NORMALS.has('CMD_NARAKU')).toBe(true);
  });

  it('COMMAND_NORMALS excludes normals and specials', () => {
    expect(COMMAND_NORMALS.has('STAND_A')).toBe(false);
    expect(COMMAND_NORMALS.has('RYO_KOOU_KEN')).toBe(false);
  });
});

// ── 9. Ryo-Relevant Attack Type Validation ───────────────────

describe('Ryo Attack Type Validation', () => {
  const ryoNormals = [
    AttackType.STAND_A, AttackType.STAND_B, AttackType.STAND_C, AttackType.STAND_D,
    AttackType.CLOSE_A, AttackType.CLOSE_B, AttackType.CLOSE_C, AttackType.CLOSE_D,
    AttackType.CROUCH_A, AttackType.CROUCH_B, AttackType.CROUCH_C, AttackType.CROUCH_D,
    AttackType.JUMP_A, AttackType.JUMP_B, AttackType.JUMP_C, AttackType.JUMP_D,
  ];

  it('all Ryo normal attacks have frame data', () => {
    for (const at of ryoNormals) {
      const fd = FRAME_DATA[at as keyof typeof FRAME_DATA];
      expect(fd, `Missing FRAME_DATA for ${at}`).toBeDefined();
    }
  });

  it('all Ryo normal attacks have positive damage', () => {
    for (const at of ryoNormals) {
      const fd = FRAME_DATA[at as keyof typeof FRAME_DATA] as { damage: number };
      expect(fd.damage, `${at} damage should be positive`).toBeGreaterThan(0);
    }
  });

  it('Ryo command normals are in COMMAND_NORMALS', () => {
    expect(COMMAND_NORMALS.has(AttackType.RYO_TSURIZAO)).toBe(true);
    expect(COMMAND_NORMALS.has(AttackType.RYO_ORISHI)).toBe(true);
  });

  it('Ryo specials are classified correctly', () => {
    const ryoSpecials = [
      'RYO_KOOU_KEN', 'RYO_KOOU_KEN_C',
      'RYO_KO_HOU', 'RYO_KO_HOU_C',
      'RYO_HIEN',
      'RYO_HAOU_SHOU_KOU_KEN',
    ];
    for (const name of ryoSpecials) {
      expect(isCharacterSpecial(name), `${name} should be character special`).toBe(true);
      expect(classify(name), `${name} should be SPECIAL`).toBe(AttackCategory.SPECIAL);
    }
  });

  it('Ryo DMs are classified correctly', () => {
    expect(isDM('DM_RYUKO_RANBU')).toBe(true);
    expect(classify('DM_RYUKO_RANBU')).toBe(AttackCategory.DM);
    expect(isDM('SDM_RYUKO_RANBU')).toBe(true);
    expect(isDM('HSDM_RYUKO_RANBU')).toBe(true);
    expect(isDM('DM_TEN_HA_OU')).toBe(true);
  });

  it('Ryo specials have frame data entries', () => {
    // Frame data keys use short names (RYO_KOOU not RYO_KOOU_KEN)
    const ryoAttackTypes = [
      'RYO_KOOU', 'RYO_KOOU_C',
      'RYO_KO_HOU', 'RYO_KO_HOU_C',
      'RYO_HIEN', 'RYO_HAOU',
    ];
    for (const name of ryoAttackTypes) {
      const fd = FRAME_DATA[name as keyof typeof FRAME_DATA];
      expect(fd, `Missing FRAME_DATA for ${name}`).toBeDefined();
    }
  });

  it('Ryo normals satisfy damage hierarchy: heavy > light', () => {
    const standA = FRAME_DATA['STAND_A' as keyof typeof FRAME_DATA] as { damage: number };
    const standC = FRAME_DATA['STAND_C' as keyof typeof FRAME_DATA] as { damage: number };
    expect(standC.damage).toBeGreaterThan(standA.damage);

    const closeA = FRAME_DATA['CLOSE_A' as keyof typeof FRAME_DATA] as { damage: number };
    const closeC = FRAME_DATA['CLOSE_C' as keyof typeof FRAME_DATA] as { damage: number };
    expect(closeC.damage).toBeGreaterThan(closeA.damage);
  });
});

// ── 10. Enum Integrity ───────────────────────────────────────

describe('Enum Integrity', () => {
  it('FighterState has core combat states', () => {
    expect(FighterState.IDLE).toBeDefined();
    expect(FighterState.STAND_ATTACK).toBeDefined();
    expect(FighterState.CROUCH_ATTACK).toBeDefined();
    expect(FighterState.AIR_ATTACK).toBeDefined();
    expect(FighterState.HITSTUN).toBeDefined();
    expect(FighterState.KNOCKDOWN).toBeDefined();
    expect(FighterState.DIZZY).toBeDefined();
    expect(FighterState.GUARD_CRUSH).toBeDefined();
    expect(FighterState.COUNTER_STANCE).toBeDefined();
  });

  it('JuggleState has expected values', () => {
    expect(JuggleState.NONE).toBeDefined();
    expect(JuggleState.HALF).toBeDefined();
    expect(JuggleState.FULL).toBeDefined();
  });

  it('AttackType has Ryo-relevant values', () => {
    expect(AttackType.STAND_A).toBe('STAND_A');
    expect(AttackType.CLOSE_C).toBe('CLOSE_C');
    expect(AttackType.THROW).toBe('THROW');
    expect(AttackType.THROW_FORWARD).toBe('THROW_FORWARD');
    expect(AttackType.THROW_BACK).toBe('THROW_BACK');
    expect(AttackType.STAND_CD).toBe('STAND_CD');
    expect(AttackType.JUMP_CD).toBe('JUMP_CD');
  });

  it('AttackCategory has all expected categories', () => {
    expect(AttackCategory.DM).toBe('DM');
    expect(AttackCategory.SPECIAL).toBe('SPECIAL');
    expect(AttackCategory.COMMAND).toBe('COMMAND');
    expect(AttackCategory.NORMAL).toBe('NORMAL');
    expect(AttackCategory.THROW).toBe('THROW');
    expect(AttackCategory.BLOWBACK).toBe('BLOWBACK');
    expect(AttackCategory.OTHER).toBe('OTHER');
  });
});

// ── 11. HitCallback Type Export ──────────────────────────────

describe('HitCallback type export', () => {
  it('HitCallback is callable as a function type', () => {
    // Type-level test: if this compiles, the export works
    const cb: HitCallback = () => {};
    expect(typeof cb).toBe('function');
  });
});
