import { describe, it, expect } from 'vitest';
import {
  FighterState,
  AttackType,
  HitHeight,
  JuggleState,
  ThrowTarget,
  GamePhase,
} from '../src/core/types';

// Helper: get enum keys (string-valued)
function enumKeys<E extends Record<string, string>>(e: E): string[] {
  return Object.keys(e).filter((k) => typeof e[k] === 'string');
}

// Helper: check all values are unique
function uniqueValues<E extends Record<string, string>>(e: E): boolean {
  const vals = Object.values(e);
  return new Set(vals).size === vals.length;
}

// ===================== FighterState =====================

describe('FighterState enum', () => {
  it('has all required core states', () => {
    const required = [
      'IDLE', 'WALK', 'RUN', 'CROUCH', 'JUMP',
      'HITSTUN', 'BLOCK', 'KNOCKDOWN',
    ] as const;
    for (const key of required) {
      expect(FighterState[key]).toBe(key);
    }
  });

  it('includes movement variants', () => {
    expect(FighterState.BACKDASH).toBe('BACKDASH');
    expect(FighterState.RUN_JUMP).toBe('RUN_JUMP');
    expect(FighterState.HOP).toBe('HOP');
    expect(FighterState.HYPER_JUMP).toBe('HYPER_JUMP');
  });

  it('includes attack states', () => {
    expect(FighterState.STAND_ATTACK).toBe('STAND_ATTACK');
    expect(FighterState.CROUCH_ATTACK).toBe('CROUCH_ATTACK');
    expect(FighterState.AIR_ATTACK).toBe('AIR_ATTACK');
  });

  it('includes system states', () => {
    expect(FighterState.ROLL).toBe('ROLL');
    expect(FighterState.BACK_ROLL).toBe('BACK_ROLL');
    expect(FighterState.THROW).toBe('THROW');
    expect(FighterState.AIR_BLOCK).toBe('AIR_BLOCK');
    expect(FighterState.GUARD_CRUSH).toBe('GUARD_CRUSH');
    expect(FighterState.GETUP).toBe('GETUP');
    expect(FighterState.DIZZY).toBe('DIZZY');
    expect(FighterState.MAX_MODE).toBe('MAX_MODE');
    expect(FighterState.TAUNT).toBe('TAUNT');
    expect(FighterState.COUNTER_STANCE).toBe('COUNTER_STANCE');
  });

  it('has all unique string values', () => {
    expect(uniqueValues(FighterState)).toBe(true);
  });

  it('has reasonable size (>= 15)', () => {
    expect(enumKeys(FighterState).length).toBeGreaterThanOrEqual(15);
  });
});

// ===================== AttackType =====================

describe('AttackType enum', () => {
  it('has all basic standing attacks', () => {
    expect(AttackType.STAND_A).toBe('STAND_A');
    expect(AttackType.STAND_B).toBe('STAND_B');
    expect(AttackType.STAND_C).toBe('STAND_C');
    expect(AttackType.STAND_D).toBe('STAND_D');
  });

  it('has all close attacks', () => {
    expect(AttackType.CLOSE_A).toBe('CLOSE_A');
    expect(AttackType.CLOSE_B).toBe('CLOSE_B');
    expect(AttackType.CLOSE_C).toBe('CLOSE_C');
    expect(AttackType.CLOSE_D).toBe('CLOSE_D');
  });

  it('has all crouching attacks', () => {
    expect(AttackType.CROUCH_A).toBe('CROUCH_A');
    expect(AttackType.CROUCH_B).toBe('CROUCH_B');
    expect(AttackType.CROUCH_C).toBe('CROUCH_C');
    expect(AttackType.CROUCH_D).toBe('CROUCH_D');
  });

  it('has all jumping attacks', () => {
    expect(AttackType.JUMP_A).toBe('JUMP_A');
    expect(AttackType.JUMP_B).toBe('JUMP_B');
    expect(AttackType.JUMP_C).toBe('JUMP_C');
    expect(AttackType.JUMP_D).toBe('JUMP_D');
  });

  it('has blowback attacks', () => {
    expect(AttackType.STAND_CD).toBe('STAND_CD');
    expect(AttackType.JUMP_CD).toBe('JUMP_CD');
  });

  it('has throw types', () => {
    expect(AttackType.THROW).toBe('THROW');
    expect(AttackType.THROW_FORWARD).toBe('THROW_FORWARD');
    expect(AttackType.THROW_BACK).toBe('THROW_BACK');
  });

  // --- Ryo specials ---
  it('has all Ryo special moves', () => {
    expect(AttackType.RYO_KOOU).toBe('RYO_KOOU');
    expect(AttackType.RYO_KOOU_C).toBe('RYO_KOOU_C');
    expect(AttackType.RYO_KO_HOU).toBe('RYO_KO_HOU');
    expect(AttackType.RYO_KO_HOU_C).toBe('RYO_KO_HOU_C');
    expect(AttackType.RYO_HIEN).toBe('RYO_HIEN');
    expect(AttackType.RYO_HAOU).toBe('RYO_HAOU');
  });

  it('has Ryo command normals', () => {
    expect(AttackType.RYO_TSURIZAO).toBe('RYO_TSURIZAO');
    expect(AttackType.RYO_ORISHI).toBe('RYO_ORISHI');
  });

  it('has Ryo DM/SDM/HSDM', () => {
    expect(AttackType.DM_TEN_HA_OU).toBe('DM_TEN_HA_OU');
    expect(AttackType.SDM_TEN_HA_OU).toBe('SDM_TEN_HA_OU');
    expect(AttackType.DM_RYUKO_RANBU).toBe('DM_RYUKO_RANBU');
    expect(AttackType.SDM_RYUKO_RANBU).toBe('SDM_RYUKO_RANBU');
    expect(AttackType.HSDM_RYUKO_RANBU).toBe('HSDM_RYUKO_RANBU');
  });

  it('has all unique string values', () => {
    expect(uniqueValues(AttackType)).toBe(true);
  });

  it('has reasonable size (>= 100)', () => {
    expect(enumKeys(AttackType).length).toBeGreaterThanOrEqual(100);
  });
});

// ===================== HitHeight =====================

describe('HitHeight enum', () => {
  it('has MID, HIGH, LOW', () => {
    expect(HitHeight.MID).toBe('MID');
    expect(HitHeight.HIGH).toBe('HIGH');
    expect(HitHeight.LOW).toBe('LOW');
  });

  it('has exactly 3 values', () => {
    expect(enumKeys(HitHeight)).toHaveLength(3);
  });

  it('values are unique', () => {
    expect(uniqueValues(HitHeight)).toBe(true);
  });
});

// ===================== JuggleState =====================

describe('JuggleState enum', () => {
  it('has NONE, HALF, FULL', () => {
    expect(JuggleState.NONE).toBe('NONE');
    expect(JuggleState.HALF).toBe('HALF');
    expect(JuggleState.FULL).toBe('FULL');
  });

  it('values are unique', () => {
    expect(uniqueValues(JuggleState)).toBe(true);
  });
});

// ===================== ThrowTarget =====================

describe('ThrowTarget enum', () => {
  it('has GROUND and AIR', () => {
    expect(ThrowTarget.GROUND).toBe('GROUND');
    expect(ThrowTarget.AIR).toBe('AIR');
  });

  it('values are unique', () => {
    expect(uniqueValues(ThrowTarget)).toBe(true);
  });
});

// ===================== GamePhase =====================

describe('GamePhase enum', () => {
  it('has core gameplay phases', () => {
    expect(GamePhase.TITLE).toBe('TITLE');
    expect(GamePhase.SELECT).toBe('SELECT');
    expect(GamePhase.INTRO).toBe('INTRO');
    expect(GamePhase.FIGHTING).toBe('FIGHTING');
    expect(GamePhase.KO).toBe('KO');
    expect(GamePhase.MATCH_END).toBe('MATCH_END');
    expect(GamePhase.GAME_OVER).toBe('GAME_OVER');
  });

  it('has mode/team/training phases', () => {
    expect(GamePhase.MODE_SELECT).toBe('MODE_SELECT');
    expect(GamePhase.TEAM_ORDER).toBe('TEAM_ORDER');
    expect(GamePhase.STAGE_SELECT).toBe('STAGE_SELECT');
    expect(GamePhase.WIN_QUOTE).toBe('WIN_QUOTE');
    expect(GamePhase.CONTINUE).toBe('CONTINUE');
    expect(GamePhase.TRAINING).toBe('TRAINING');
  });

  it('values are unique', () => {
    expect(uniqueValues(GamePhase)).toBe(true);
  });
});
