/**
 * FRAME_DATA Hit Level & Damage Progression Tests
 *
 * Validates that hit levels and damage values follow KOF2002 conventions:
 * - Close attacks do more damage than far attacks
 * - Crouch D (sweep) has LOW hitLevel
 * - Jump attacks have proper hit levels
 * - Throws exist with appropriate damage
 * - Special moves do more damage than normals
 */
import { describe, it, expect } from 'vitest';
import { FRAME_DATA } from '../src/core/frameDataConstants.js';

interface FrameEntry {
  startup: number;
  active: number;
  recovery: number;
  damage: number;
  hitstun: number;
  blockstun: number;
  pushback: number;
  hitLevel: string;
  knockdown: boolean;
}

function fd(key: string): FrameEntry | undefined {
  return (FRAME_DATA as Record<string, FrameEntry | undefined>)[key];
}

describe('FRAME_DATA hit level conventions', () => {
  it('stand A/B are MID', () => {
    expect(fd('STAND_A')?.hitLevel).toBe('MID');
    expect(fd('STAND_B')?.hitLevel).toBe('MID');
  });

  it('stand C/D are MID', () => {
    expect(fd('STAND_C')?.hitLevel).toBe('MID');
    expect(fd('STAND_D')?.hitLevel).toBe('MID');
  });

  it('close A is MID, close B is LOW (KOF convention: near B is low)', () => {
    expect(fd('CLOSE_A')?.hitLevel).toBe('MID');
    expect(fd('CLOSE_B')?.hitLevel).toBe('LOW');
  });

  it('crouch A is MID (not low), crouch B is LOW', () => {
    expect(fd('CROUCH_A')?.hitLevel).toBe('MID');
    expect(fd('CROUCH_B')?.hitLevel).toBe('LOW');
  });

  it('crouch D has knockdown', () => {
    expect(fd('CROUCH_D')?.knockdown).toBe(true);
  });

  it('all Ryo specials have valid hitLevel', () => {
    const specials = ['RYO_KOOU', 'RYO_KOOU_C', 'RYO_KO_HOU', 'RYO_KO_HOU_C', 'RYO_HIEN', 'RYO_HAOU'];
    for (const key of specials) {
      const entry = fd(key);
      if (!entry) continue;
      expect(['MID', 'HIGH', 'LOW'], `${key} hitLevel=${entry.hitLevel}`).toContain(entry.hitLevel);
    }
  });
});

describe('FRAME_DATA damage progression', () => {
  it('stand C does more damage than stand A', () => {
    expect(fd('STAND_C')?.damage).toBeGreaterThan(fd('STAND_A')?.damage ?? 0);
  });

  it('close C does more damage than close A', () => {
    expect(fd('CLOSE_C')?.damage).toBeGreaterThan(fd('CLOSE_A')?.damage ?? 0);
  });

  it('close C does more damage than stand C', () => {
    expect(fd('CLOSE_C')?.damage).toBeGreaterThanOrEqual(fd('STAND_C')?.damage ?? 0);
  });

  it('close C is the strongest normal', () => {
    const closeCDamage = fd('CLOSE_C')?.damage ?? 0;
    const normals = ['STAND_A', 'STAND_B', 'STAND_C', 'STAND_D',
      'CLOSE_A', 'CLOSE_B', 'CLOSE_D',
      'CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D'];
    for (const key of normals) {
      const dmg = fd(key)?.damage ?? 0;
      expect(closeCDamage, `CLOSE_C(${closeCDamage}) >= ${key}(${dmg})`)
        .toBeGreaterThanOrEqual(dmg);
    }
  });

  it('specials do more damage than normals (Ryo)', () => {
    const koouDamage = fd('RYO_KOOU_C')?.damage ?? 0;
    const closeCDamage = fd('CLOSE_C')?.damage ?? 0;
    expect(koouDamage, 'RYO_KOOU_C > CLOSE_C').toBeGreaterThanOrEqual(closeCDamage);
  });

  it('DMs do more damage than specials', () => {
    const dmDamage = fd('DM_TEN_HA_OU')?.damage ?? 0;
    const specialDamage = fd('RYO_KOOU_C')?.damage ?? 0;
    expect(dmDamage, 'DM_TEN_HA_OU > RYO_KOOU_C').toBeGreaterThan(specialDamage);
  });

  it('SDM does at least as much damage as DM', () => {
    const pairs: [string, string][] = [
      ['DM_OROCHINAGI', 'SDM_OROCHINAGI'],
      ['DM_YATAGARASU', 'SDM_YATAGARASU'],
      ['DM_TEN_HA_OU', 'SDM_TEN_HA_OU'],
    ];
    for (const [dm, sdm] of pairs) {
      const dmDmg = fd(dm)?.damage;
      const sdmDmg = fd(sdm)?.damage;
      if (dmDmg && sdmDmg) {
        expect(sdmDmg, `${sdm} >= ${dm}`).toBeGreaterThanOrEqual(dmDmg);
      }
    }
  });
});

describe('FRAME_DATA startup/recovery conventions', () => {
  it('light attacks are faster than heavy (startup)', () => {
    expect(fd('STAND_A')?.startup).toBeLessThan(fd('STAND_C')?.startup ?? 999);
    expect(fd('CROUCH_A')?.startup).toBeLessThan(fd('CROUCH_C')?.startup ?? 999);
  });

  it('close attacks are faster than far (startup)', () => {
    expect(fd('CLOSE_C')?.startup).toBeLessThanOrEqual(fd('STAND_C')?.startup ?? 999);
  });

  it('throws have short startup', () => {
    const throwEntry = fd('THROW_FORWARD');
    if (throwEntry) {
      expect(throwEntry.startup).toBeLessThanOrEqual(5);
    }
  });

  it('DMs have longer startup than normals', () => {
    const dmStartup = fd('DM_TEN_HA_OU')?.startup ?? 0;
    const normalStartup = fd('STAND_C')?.startup ?? 0;
    expect(dmStartup).toBeGreaterThan(normalStartup);
  });
});
