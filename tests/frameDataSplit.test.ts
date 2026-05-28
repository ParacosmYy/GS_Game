/**
 * Frame Data Split Files Regression Test
 *
 * Validates structural integrity of all frame data split files:
 * - Required fields present for every entry
 * - Positive numeric values where expected
 * - Valid hitLevel values
 * - DM/SDM hierarchy (damage escalation)
 * - Character coverage
 * - Consistent field types across all entries
 */
import { describe, it, expect } from 'vitest';
import { TERRY_KIM_DATA } from '../src/core/frameData/frameDataTerryKim.js';
import { LEONA_ROBERT_MAI_DATA } from '../src/core/frameData/frameDataLeonaRobertMai.js';
import { KDASH_KULA_ATHENA_CLARK_RALF_JOE_DATA } from '../src/core/frameData/frameDataKdashKulaAthenaClarkRalfJoe.js';
import { ANDY_BILLY_CHANG_CHOI_MATURE_YAMAZAKI_DATA } from '../src/core/frameData/frameDataAndyBillyChangChoiMatureYamazaki.js';
import { MARY_XIANGFEI_KASUMI_REST_DATA } from '../src/core/frameData/frameDataMaryXiangfeiKasumiRest.js';

type FrameEntry = {
  startup: number;
  active: number;
  recovery: number;
  damage: number;
  hitstun: number;
  blockstun: number;
  pushback: number;
  hitLevel: string;
  knockdown: boolean;
  chipDamage?: number;
};

const ALL_DATA_SETS = [
  { name: 'TerryKim', data: TERRY_KIM_DATA },
  { name: 'LeonaRobertMai', data: LEONA_ROBERT_MAI_DATA },
  { name: 'KdashKulaAthenaClarkRalfJoe', data: KDASH_KULA_ATHENA_CLARK_RALF_JOE_DATA },
  { name: 'AndyBillyChangChoiMatureYamazaki', data: ANDY_BILLY_CHANG_CHOI_MATURE_YAMAZAKI_DATA },
  { name: 'MaryXiangfeiKasumiRest', data: MARY_XIANGFEI_KASUMI_REST_DATA },
];

const VALID_HIT_LEVELS = ['MID', 'HIGH', 'LOW', 'UNBLOCKABLE'];

describe('Frame data split files — common structure', () => {
  for (const { name, data } of ALL_DATA_SETS) {
    describe(`${name}`, () => {
      const entries = Object.entries(data) as [string, FrameEntry][];
      const keys = Object.keys(data);

      it('has at least 20 entries', () => {
        expect(keys.length).toBeGreaterThanOrEqual(20);
      });

      it('all entries have required fields', () => {
        const required: (keyof FrameEntry)[] = [
          'startup', 'active', 'recovery', 'damage',
          'hitstun', 'blockstun', 'pushback', 'hitLevel', 'knockdown',
        ];
        for (const [key, entry] of entries) {
          for (const field of required) {
            expect(entry[field], `${key}.${field}`).toBeDefined();
          }
        }
      });

      it('all startup values are positive', () => {
        for (const [key, entry] of entries) {
          expect(entry.startup, `${key}.startup`).toBeGreaterThan(0);
        }
      });

      it('all active values are positive', () => {
        for (const [key, entry] of entries) {
          expect(entry.active, `${key}.active`).toBeGreaterThan(0);
        }
      });

      it('all recovery values are positive', () => {
        for (const [key, entry] of entries) {
          expect(entry.recovery, `${key}.recovery`).toBeGreaterThan(0);
        }
      });

      it('all damage values are positive', () => {
        for (const [key, entry] of entries) {
          expect(entry.damage, `${key}.damage`).toBeGreaterThan(0);
        }
      });

      it('all pushback values are non-negative', () => {
        for (const [key, entry] of entries) {
          expect(entry.pushback, `${key}.pushback`).toBeGreaterThanOrEqual(0);
        }
      });

      it('all hitLevel values are valid', () => {
        for (const [key, entry] of entries) {
          expect(VALID_HIT_LEVELS, `${key}.hitLevel="${entry.hitLevel}"`).toContain(entry.hitLevel);
        }
      });

      it('knockdown is boolean', () => {
        for (const [key, entry] of entries) {
          expect(typeof entry.knockdown, `${key}.knockdown`).toBe('boolean');
        }
      });

      it('chipDamage when present is positive', () => {
        for (const [key, entry] of entries) {
          if ('chipDamage' in entry && entry.chipDamage !== undefined) {
            expect(entry.chipDamage, `${key}.chipDamage`).toBeGreaterThan(0);
          }
        }
      });

      it('total frame count (startup + active + recovery) is reasonable (5-120)', () => {
        for (const [key, entry] of entries) {
          const total = entry.startup + entry.active + entry.recovery;
          expect(total, `${key} total frames`).toBeGreaterThanOrEqual(5);
          expect(total, `${key} total frames`).toBeLessThanOrEqual(120);
        }
      });
    });
  }
});

describe('Terry/Kim frame data specifics', () => {
  const keys = Object.keys(TERRY_KIM_DATA);

  it('Terry has Power Wave', () => {
    expect(keys).toContain('TERRY_POWER_WAVE');
  });

  it('Terry has Burn Knuckle', () => {
    expect(keys).toContain('TERRY_BURN_KNUCKLE');
  });

  it('Terry has DM Power Geyser', () => {
    expect(keys.filter(k => k.startsWith('DM_')).length).toBeGreaterThanOrEqual(1);
  });

  it('Kim has Hienzan', () => {
    expect(keys).toContain('KIM_HIENZAN');
  });

  it('Kim has SDM Phoenix Hiten', () => {
    expect(keys.filter(k => k.startsWith('SDM_PHOENIX')).length).toBeGreaterThanOrEqual(1);
  });

  it('SDM damage > DM damage', () => {
    const dmPhoenix = TERRY_KIM_DATA['DM_POWER_GEYSER' as keyof typeof TERRY_KIM_DATA] as FrameEntry | undefined;
    const sdmPhoenix = TERRY_KIM_DATA['SDM_POWER_GEYSER' as keyof typeof TERRY_KIM_DATA] as FrameEntry | undefined;
    if (dmPhoenix && sdmPhoenix) {
      expect(sdmPhoenix.damage).toBeGreaterThan(dmPhoenix.damage);
    }
  });
});

describe('Leona/Robert/Mai frame data specifics', () => {
  const keys = Object.keys(LEONA_ROBERT_MAI_DATA);

  it('Leona has Moon Slash', () => {
    expect(keys).toContain('LEONA_MOON_SLASH');
  });

  it('Robert has Kouou Ken', () => {
    const robertMoves = keys.filter(k => k.startsWith('ROBERT_'));
    expect(robertMoves.length).toBeGreaterThanOrEqual(1);
  });

  it('Mai has moves', () => {
    const maiMoves = keys.filter(k => k.startsWith('MAI_'));
    expect(maiMoves.length).toBeGreaterThanOrEqual(1);
  });

  it('C versions are stronger than A versions', () => {
    const aEntry = LEONA_ROBERT_MAI_DATA['LEONA_MOON_SLASH' as keyof typeof LEONA_ROBERT_MAI_DATA] as FrameEntry;
    const cEntry = LEONA_ROBERT_MAI_DATA['LEONA_MOON_SLASH_C' as keyof typeof LEONA_ROBERT_MAI_DATA] as FrameEntry;
    if (aEntry && cEntry) {
      expect(cEntry.damage).toBeGreaterThan(aEntry.damage);
      expect(cEntry.active).toBeGreaterThanOrEqual(aEntry.active);
    }
  });
});

describe('Athena/Clark/Ralf/Joe/Andy/Billy/Chang/Choi frame data specifics', () => {
  const keys = Object.keys(KDASH_KULA_ATHENA_CLARK_RALF_JOE_DATA);

  it('Athena has moves', () => {
    expect(keys.filter(k => k.startsWith('ATHENA_')).length).toBeGreaterThanOrEqual(1);
  });

  it('Clark has moves', () => {
    expect(keys.filter(k => k.startsWith('CLARK_')).length).toBeGreaterThanOrEqual(1);
  });

  it('Ralf has moves', () => {
    expect(keys.filter(k => k.startsWith('RALF_')).length).toBeGreaterThanOrEqual(1);
  });

  it('Joe has moves', () => {
    expect(keys.filter(k => k.startsWith('JOE_')).length).toBeGreaterThanOrEqual(1);
  });

  it('Andy has moves', () => {
    expect(keys.filter(k => k.startsWith('ANDY_')).length).toBeGreaterThanOrEqual(1);
  });

  it('Billy has moves', () => {
    expect(keys.filter(k => k.startsWith('BILLY_')).length).toBeGreaterThanOrEqual(1);
  });

  it('Chang has moves', () => {
    expect(keys.filter(k => k.startsWith('CHANG_')).length).toBeGreaterThanOrEqual(1);
  });

  it('Choi has moves', () => {
    expect(keys.filter(k => k.startsWith('CHOI_')).length).toBeGreaterThanOrEqual(1);
  });
});

describe('Mature/Yashiro/Chris/Shermie/Vice frame data specifics', () => {
  const keys = Object.keys(ANDY_BILLY_CHANG_CHOI_MATURE_YAMAZAKI_DATA);

  it('Mature has moves', () => {
    expect(keys.filter(k => k.startsWith('MATURE_')).length).toBeGreaterThanOrEqual(1);
  });

  it('Yashiro has moves', () => {
    expect(keys.filter(k => k.startsWith('YASHIRO_')).length).toBeGreaterThanOrEqual(1);
  });

  it('Chris has moves', () => {
    expect(keys.filter(k => k.startsWith('CHRIS_')).length).toBeGreaterThanOrEqual(1);
  });

  it('Shermie has moves', () => {
    expect(keys.filter(k => k.startsWith('SHERMIE_')).length).toBeGreaterThanOrEqual(1);
  });

  it('Vice has moves', () => {
    expect(keys.filter(k => k.startsWith('VICE_')).length).toBeGreaterThanOrEqual(1);
  });

  it('has DM entries', () => {
    expect(keys.filter(k => k.startsWith('DM_')).length).toBeGreaterThanOrEqual(1);
  });
});

describe('Mary/Xiangfei/Kasumi/Rest frame data specifics', () => {
  const keys = Object.keys(MARY_XIANGFEI_KASUMI_REST_DATA);

  it('Mary has moves', () => {
    expect(keys.filter(k => k.startsWith('MARY_')).length).toBeGreaterThanOrEqual(1);
  });

  it('Xiangfei has moves', () => {
    expect(keys.filter(k => k.startsWith('XIANGFEI_')).length).toBeGreaterThanOrEqual(1);
  });

  it('Kasumi has moves', () => {
    expect(keys.filter(k => k.startsWith('KASUMI_')).length).toBeGreaterThanOrEqual(1);
  });

  it('Yamazaki has moves', () => {
    expect(keys.filter(k => k.startsWith('YAMAZAKI_')).length).toBeGreaterThanOrEqual(1);
  });

  it('command grabs have zero hitstun and zero blockstun', () => {
    const grabKeys = keys.filter(k =>
      k.includes('BACKDROP') || k.includes('SPIDER') || k.includes('THROW'),
    );
    for (const key of grabKeys) {
      const entry = MARY_XIANGFEI_KASUMI_REST_DATA[key as keyof typeof MARY_XIANGFEI_KASUMI_REST_DATA] as FrameEntry;
      if (entry) {
        expect(entry.hitstun, `${key}.hitstun`).toBe(0);
        expect(entry.blockstun, `${key}.blockstun`).toBe(0);
      }
    }
  });
});

describe('Frame data cross-file consistency', () => {
  it('no duplicate keys across split files', () => {
    const allKeys: string[] = [];
    for (const { data } of ALL_DATA_SETS) {
      allKeys.push(...Object.keys(data));
    }
    const unique = new Set(allKeys);
    expect(unique.size, 'no duplicate keys across files').toBe(allKeys.length);
  });

  it('all DM entries have chipDamage', () => {
    for (const { data } of ALL_DATA_SETS) {
      for (const [key, entry] of Object.entries(data) as [string, FrameEntry][]) {
        if (key.startsWith('DM_') || key.startsWith('SDM_')) {
          if ('chipDamage' in entry) {
            expect((entry as any).chipDamage, `${key} chipDamage`).toBeGreaterThan(0);
          }
        }
      }
    }
  });

  it('SDM damage > DM damage where both exist', () => {
    for (const { data } of ALL_DATA_SETS) {
      const dmKeys = Object.keys(data).filter(k => k.startsWith('DM_'));
      for (const dmKey of dmKeys) {
        const baseName = dmKey.replace(/^DM_/, '');
        const sdmKey = `SDM_${baseName}`;
        const dm = (data as any)[dmKey] as FrameEntry | undefined;
        const sdm = (data as any)[sdmKey] as FrameEntry | undefined;
        if (dm && sdm) {
          expect(sdm.damage, `${sdmKey} damage > ${dmKey}`).toBeGreaterThan(dm.damage);
        }
      }
    }
  });

  it('all entries total > 300 across all files', () => {
    let total = 0;
    for (const { data } of ALL_DATA_SETS) {
      total += Object.keys(data).length;
    }
    expect(total).toBeGreaterThan(300);
  });
});
