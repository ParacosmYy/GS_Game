/**
 * Attack Classification Sets Regression Test
 * Verifies LIGHT_NORMALS, NORMAL_ATTACKS, COMMAND_NORMALS are consistent
 * with AttackType enum and have correct subset relationships.
 */
import { describe, it, expect } from 'vitest';
import { AttackType } from '../src/core/types.js';
import {
  LIGHT_NORMALS,
  NORMAL_ATTACKS,
  COMMAND_NORMALS,
} from '../src/core/constants.js';

/** All string values in the AttackType enum */
const ATTACK_TYPE_VALUES = new Set<string>(
  Object.values(AttackType).filter(v => typeof v === 'string') as string[],
);

describe('LIGHT_NORMALS classification', () => {
  it('all LIGHT_NORMALS exist in AttackType enum', () => {
    for (const name of LIGHT_NORMALS) {
      expect(ATTACK_TYPE_VALUES, `LIGHT_NORMALS.${name}`).toContain(name);
    }
  });

  it('grounded LIGHT_NORMALS are in NORMAL_ATTACKS', () => {
    const grounded = ['STAND_A', 'STAND_B', 'CLOSE_A', 'CLOSE_B', 'CROUCH_A', 'CROUCH_B'];
    for (const name of grounded) {
      expect(NORMAL_ATTACKS.has(name), `${name} in NORMAL_ATTACKS`).toBe(true);
    }
  });

  it('jump LIGHT_NORMALS are NOT in NORMAL_ATTACKS (NORMAL_ATTACKS is ground-only)', () => {
    expect(NORMAL_ATTACKS.has('JUMP_A')).toBe(false);
    expect(NORMAL_ATTACKS.has('JUMP_B')).toBe(false);
  });

  it('LIGHT_NORMALS contains all A/B attacks', () => {
    const abAttacks = ['STAND_A', 'STAND_B', 'CLOSE_A', 'CLOSE_B', 'CROUCH_A', 'CROUCH_B', 'JUMP_A', 'JUMP_B'];
    for (const atk of abAttacks) {
      expect(LIGHT_NORMALS.has(atk), `${atk} in LIGHT_NORMALS`).toBe(true);
    }
  });

  it('LIGHT_NORMALS does not contain C/D attacks', () => {
    expect(LIGHT_NORMALS.has('STAND_C')).toBe(false);
    expect(LIGHT_NORMALS.has('STAND_D')).toBe(false);
    expect(LIGHT_NORMALS.has('CLOSE_C')).toBe(false);
    expect(LIGHT_NORMALS.has('CLOSE_D')).toBe(false);
  });

  it('has exactly 8 members', () => {
    expect(LIGHT_NORMALS.size).toBe(8);
  });
});

describe('NORMAL_ATTACKS classification', () => {
  it('all NORMAL_ATTACKS exist in AttackType enum', () => {
    for (const name of NORMAL_ATTACKS) {
      expect(ATTACK_TYPE_VALUES, `NORMAL_ATTACKS.${name}`).toContain(name);
    }
  });

  it('includes all stand/close/crouch A–D normals', () => {
    const expected = [
      'STAND_A', 'STAND_B', 'STAND_C', 'STAND_D',
      'CLOSE_A', 'CLOSE_B', 'CLOSE_C', 'CLOSE_D',
      'CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D',
    ];
    for (const atk of expected) {
      expect(NORMAL_ATTACKS.has(atk), `${atk} in NORMAL_ATTACKS`).toBe(true);
    }
  });

  it('does not include jump attacks', () => {
    expect(NORMAL_ATTACKS.has('JUMP_A')).toBe(false);
    expect(NORMAL_ATTACKS.has('JUMP_C')).toBe(false);
  });

  it('does not include command normals', () => {
    for (const cmd of COMMAND_NORMALS) {
      expect(NORMAL_ATTACKS.has(cmd), `CMD ${cmd} not in NORMAL_ATTACKS`).toBe(false);
    }
  });

  it('does not include specials or DMs', () => {
    expect(NORMAL_ATTACKS.has('RYO_KOOU')).toBe(false);
    expect(NORMAL_ATTACKS.has('KYO_ONIYAKI')).toBe(false);
    expect(NORMAL_ATTACKS.has('DM_TEN_HA_OU')).toBe(false);
  });

  it('has exactly 12 members', () => {
    expect(NORMAL_ATTACKS.size).toBe(12);
  });
});

describe('COMMAND_NORMALS classification', () => {
  it('all COMMAND_NORMALS exist in AttackType enum', () => {
    for (const name of COMMAND_NORMALS) {
      expect(ATTACK_TYPE_VALUES, `COMMAND_NORMALS.${name}`).toContain(name);
    }
  });

  it('no overlap with NORMAL_ATTACKS', () => {
    for (const cmd of COMMAND_NORMALS) {
      expect(NORMAL_ATTACKS.has(cmd), `CMD ${cmd} not in NORMAL_ATTACKS`).toBe(false);
    }
  });

  it('no overlap with LIGHT_NORMALS', () => {
    for (const cmd of COMMAND_NORMALS) {
      expect(LIGHT_NORMALS.has(cmd), `CMD ${cmd} not in LIGHT_NORMALS`).toBe(false);
    }
  });

  it('does not include specials', () => {
    expect(COMMAND_NORMALS.has('RYO_KOOU')).toBe(false);
    expect(COMMAND_NORMALS.has('KYO_ONIYAKI')).toBe(false);
    expect(COMMAND_NORMALS.has('IORI_AOIHANA')).toBe(false);
  });

  it('does not include DMs', () => {
    expect(COMMAND_NORMALS.has('DM_TEN_HA_OU')).toBe(false);
    expect(COMMAND_NORMALS.has('SDM_TEN_HA_OU')).toBe(false);
  });

  it('contains Kyo command normals', () => {
    expect(COMMAND_NORMALS.has('CMD_GOFU_YOU')).toBe(true);
    expect(COMMAND_NORMALS.has('CMD_88SHIKI')).toBe(true);
    expect(COMMAND_NORMALS.has('CMD_NARAKU')).toBe(true);
  });

  it('contains Iori command normals', () => {
    expect(COMMAND_NORMALS.has('IORI_YUMEYUMI')).toBe(true);
    expect(COMMAND_NORMALS.has('IORI_KATANUGI')).toBe(true);
    expect(COMMAND_NORMALS.has('IORI_YUKIWARUI')).toBe(true);
  });

  it('contains Ryo command normals', () => {
    expect(COMMAND_NORMALS.has('RYO_TSURIZAO')).toBe(true);
    expect(COMMAND_NORMALS.has('RYO_ORISHI')).toBe(true);
  });

  it('each character has exactly 2 command normals (except Kyo with 3)', () => {
    const byPrefix: Record<string, string[]> = {};
    for (const cmd of COMMAND_NORMALS) {
      // Extract character prefix: first part before underscore pattern
      const prefix = cmd.replace(/_[A-Z0-9_]+$/, '').replace(/^(CMD|CLARK)_.*$/, '$1');
      // Group by known prefixes
      let charId: string;
      if (cmd.startsWith('CMD_')) charId = 'KYO';
      else if (cmd.startsWith('IORI_')) charId = 'IORI';
      else if (cmd.startsWith('TERRY_')) charId = 'TERRY';
      else if (cmd.startsWith('KIM_')) charId = 'KIM';
      else if (cmd.startsWith('RYO_')) charId = 'RYO';
      else if (cmd.startsWith('KDASH_')) charId = 'KDASH';
      else if (cmd.startsWith('KULA_')) charId = 'KULA';
      else if (cmd.startsWith('LEONA_')) charId = 'LEONA';
      else if (cmd.startsWith('ROBERT_')) charId = 'ROBERT';
      else if (cmd.startsWith('MATURE_')) charId = 'MATURE';
      else if (cmd.startsWith('YASHIRO_')) charId = 'YASHIRO';
      else if (cmd.startsWith('CHRIS_')) charId = 'CHRIS';
      else if (cmd.startsWith('SHERMIE_')) charId = 'SHERMIE';
      else if (cmd.startsWith('MAI_')) charId = 'MAI';
      else if (cmd.startsWith('ATHENA_')) charId = 'ATHENA';
      else if (cmd.startsWith('JOE_')) charId = 'JOE';
      else if (cmd.startsWith('RALF_')) charId = 'RALF';
      else if (cmd.startsWith('ANDY_')) charId = 'ANDY';
      else if (cmd.startsWith('BILLY_')) charId = 'BILLY';
      else if (cmd.startsWith('CHANG_')) charId = 'CHANG';
      else if (cmd.startsWith('CHOI_')) charId = 'CHOI';
      else if (cmd.startsWith('VICE_')) charId = 'VICE';
      else if (cmd.startsWith('XIANGFEI_')) charId = 'XIANGFEI';
      else if (cmd.startsWith('YAMAZAKI_')) charId = 'YAMAZAKI';
      else if (cmd.startsWith('KASUMI_')) charId = 'KASUMI';
      else if (cmd.startsWith('MARY_')) charId = 'MARY';
      else if (cmd.startsWith('CLARK_')) charId = 'CLARK';
      else charId = 'OTHER';

      if (!byPrefix[charId]) byPrefix[charId] = [];
      byPrefix[charId].push(cmd);
    }

    // Athena has 3 (including air), Kyo has 3, all others have 2
    for (const [char, cmds] of Object.entries(byPrefix)) {
      const expected = (char === 'ATHENA' || char === 'KYO' || char === 'IORI') ? 3 : 2;
      expect(cmds.length, `${char} has ${expected} command normals`).toBe(expected);
    }
  });
});

describe('Attack type coverage', () => {
  it('enum has stand/close/crouch/jump for all 4 buttons', () => {
    const buttons = ['A', 'B', 'C', 'D'];
    const positions = ['STAND', 'CLOSE', 'CROUCH', 'JUMP'];
    for (const pos of positions) {
      for (const btn of buttons) {
        expect(ATTACK_TYPE_VALUES, `${pos}_${btn}`).toContain(`${pos}_${btn}`);
      }
    }
  });

  it('enum has CD blowback attacks', () => {
    expect(ATTACK_TYPE_VALUES).toContain('STAND_CD');
    expect(ATTACK_TYPE_VALUES).toContain('JUMP_CD');
  });

  it('enum has throw types', () => {
    expect(ATTACK_TYPE_VALUES).toContain('THROW');
    expect(ATTACK_TYPE_VALUES).toContain('THROW_FORWARD');
    expect(ATTACK_TYPE_VALUES).toContain('THROW_BACK');
  });

  it('enum has generic special types', () => {
    expect(ATTACK_TYPE_VALUES).toContain('SPECIAL_PROJECTILE');
    expect(ATTACK_TYPE_VALUES).toContain('SPECIAL_UPPER');
  });
});
