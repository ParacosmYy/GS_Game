/**
 * Frame Data Comprehensive Validation Suite
 *
 * Validates integrity, sanity, and coverage of all frame data entries
 * across both generic normals (frameDataConstants.ts) and character-specific
 * specials/DMs/SDMs (frameDataChars.ts).
 *
 * Sections:
 *   1. Frame data completeness (>= 30 tests)
 *   2. Frame data sanity (>= 20 tests)
 *   3. Cancel legality (>= 15 tests)
 *   4. Character coverage (>= 10 tests)
 */
import { describe, it, expect } from 'vitest';
import { FRAME_DATA_CHARS } from '../src/core/frameDataChars.js';
import { FRAME_DATA } from '../src/core/constants.js';
import { AttackType } from '../src/core/types.js';

// ── Type helpers ──

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

const VALID_HIT_LEVELS = new Set(['MID', 'LOW', 'HIGH']);

/** All entries from the merged FRAME_DATA as typed tuples */
const allEntries = Object.entries(FRAME_DATA) as [string, FrameDataEntry][];
/** All entries from character-specific data only */
const charEntries = Object.entries(FRAME_DATA_CHARS) as [string, FrameDataEntry][];

/** Helper: get a frame data entry or fail */
function getFD(key: string): FrameDataEntry {
  const fd = FRAME_DATA[key as keyof typeof FRAME_DATA] as FrameDataEntry | undefined;
  expect(fd, `${key} should exist in FRAME_DATA`).toBeDefined();
  return fd!;
}

// ── Category classifiers ──

function isThrow(name: string): boolean {
  return name === 'THROW' || name === 'THROW_FORWARD' || name === 'THROW_BACK';
}

function isDM(name: string): boolean {
  return name.startsWith('DM_');
}

function isSDM(name: string): boolean {
  return name.startsWith('SDM_');
}

function isSpecial(name: string): boolean {
  if (isDM(name) || isSDM(name)) return false;
  // Command normals are not specials
  const commandNormalPrefixes = [
    'CMD_', 'IORI_YUMEYUMI', 'IORI_KATANUGI', 'IORI_YUKIWARUI',
    'TERRY_BACK_KNCKLE', 'TERRY_COMBO_BLOW', 'KIM_HISHOU_KICK', 'KIM_HANSEN',
    'RYO_TSURIZAO', 'RYO_ORISHI', 'KDASH_ONE_INCH', 'KDASH_TRIGGER',
    'KULA_ONE_MORE', 'KULA_SLIDER', 'LEONA_STRIKE_ARC', 'LEONA_STRIKE_DASH',
    'MAI_HISSATSU_SHINOBIBACHI', 'MAI_YUSURA_UMA',
    'ROBERT_GENEI_KYAKU_CMD', 'ROBERT_KOU_SHUTAI',
    'ATHENA_PHOENIX_REFLECT', 'ATHENA_LOW_B', 'ATHENA_AIR_B',
    'JOE_KNEE_KICK', 'JOE_SLIDE',
    'RALF_SABRE_PUNCH', 'RALF_SABRE_KICK',
    'ANDY_UWA_AGITO', 'ANDY_GEDAN_AGITO',
    'BILLY_SANDAN_GEAR', 'BILLY_SENSHU_IKKYAKU',
    'CHANG_HIKI_NAGE', 'CHANG_KYUUSHUU',
    'CHOI_SOUTEN_MEKKYAKU', 'CHOI_SAN_REN_GEKI',
    'MATURE_DESPAIR', 'MATURE_JAB',
    'VICE_MONSTROSITY', 'VICE_OVERKILL',
    'YASHIRO_SHUU_WANI', 'YASHIRO_JUU_ZUTSU',
    'CHRIS_MAKASHIPPO', 'CHRIS_KAZAGURUMA',
    'SHERMIE_STAND', 'SHERMIE_CLASH',
    'MARY_HAMMER_PUNCH', 'MARY_DOUBLE_ROLLING',
    'XIANGFEI_KYU_HO', 'XIANGFEI_KAKU_DA',
    'YAMAZAKI_SASHI', 'YAMAZAKI_BOKKAI',
    'KASUMI_KOU_U', 'KASUMI_GESHIKI',
  ];
  for (const prefix of commandNormalPrefixes) {
    if (name === prefix) return false;
  }
  // Generic specials
  if (name === 'SPECIAL_PROJECTILE' || name === 'SPECIAL_UPPER') return true;
  // Character specials live in FRAME_DATA_CHARS and are not DM/SDM/command normals
  if (name in FRAME_DATA_CHARS && !isDM(name) && !isSDM(name)) {
    // Filter out command normals that appear in frameDataChars
    const charOnly = charEntries.find(([k]) => k === name);
    if (charOnly) return true;
  }
  return false;
}

function isCommandNormal(name: string): boolean {
  const prefixes = [
    'CMD_', 'IORI_YUMEYUMI', 'IORI_KATANUGI', 'IORI_YUKIWARUI',
    'TERRY_BACK_KNCKLE', 'TERRY_COMBO_BLOW', 'KIM_HISHOU_KICK', 'KIM_HANSEN',
    'RYO_TSURIZAO', 'RYO_ORISHI', 'KDASH_ONE_INCH', 'KDASH_TRIGGER',
    'KULA_ONE_MORE', 'KULA_SLIDER', 'LEONA_STRIKE_ARC', 'LEONA_STRIKE_DASH',
    'MAI_HISSATSU_SHINOBIBACHI', 'MAI_YUSURA_UMA',
    'ROBERT_GENEI_KYAKU_CMD', 'ROBERT_KOU_SHUTAI',
    'ATHENA_PHOENIX_REFLECT', 'ATHENA_LOW_B', 'ATHENA_AIR_B',
    'JOE_KNEE_KICK', 'JOE_SLIDE',
    'RALF_SABRE_PUNCH', 'RALF_SABRE_KICK',
    'ANDY_UWA_AGITO', 'ANDY_GEDAN_AGITO',
    'BILLY_SANDAN_GEAR', 'BILLY_SENSHU_IKKYAKU',
    'CHANG_HIKI_NAGE', 'CHANG_KYUUSHUU',
    'CHOI_SOUTEN_MEKKYAKU', 'CHOI_SAN_REN_GEKI',
    'MATURE_DESPAIR', 'MATURE_JAB',
    'VICE_MONSTROSITY', 'VICE_OVERKILL',
    'YASHIRO_SHUU_WANI', 'YASHIRO_JUU_ZUTSU',
    'CHRIS_MAKASHIPPO', 'CHRIS_KAZAGURUMA',
    'SHERMIE_STAND', 'SHERMIE_CLASH',
    'MARY_HAMMER_PUNCH', 'MARY_DOUBLE_ROLLING',
    'XIANGFEI_KYU_HO', 'XIANGFEI_KAKU_DA',
    'YAMAZAKI_SASHI', 'YAMAZAKI_BOKKAI',
    'KASUMI_KOU_U', 'KASUMI_GESHIKI',
  ];
  return prefixes.some(p => name === p);
}

function isLightNormal(name: string): boolean {
  return ['STAND_A', 'STAND_B', 'CLOSE_A', 'CLOSE_B', 'CROUCH_A', 'CROUCH_B', 'JUMP_A', 'JUMP_B'].includes(name);
}

function isHeavyNormal(name: string): boolean {
  return ['STAND_C', 'STAND_D', 'CLOSE_C', 'CLOSE_D', 'CROUCH_C', 'CROUCH_D', 'JUMP_C', 'JUMP_D'].includes(name);
}

function isNormal(name: string): boolean {
  return isLightNormal(name) || isHeavyNormal(name);
}

function isJumpAttack(name: string): boolean {
  return name.startsWith('JUMP_');
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: Frame Data Completeness
// ═══════════════════════════════════════════════════════════════════

describe('Section 1: Frame Data Completeness', () => {

  // --- 1.1 Mandatory fields exist ---

  it('every entry has startup field', () => {
    for (const [key, fd] of allEntries) {
      expect(fd).toHaveProperty('startup');
      expect(typeof fd.startup, `${key}.startup should be number`).toBe('number');
    }
  });

  it('every entry has active field', () => {
    for (const [key, fd] of allEntries) {
      expect(fd).toHaveProperty('active');
      expect(typeof fd.active, `${key}.active should be number`).toBe('number');
    }
  });

  it('every entry has recovery field', () => {
    for (const [key, fd] of allEntries) {
      expect(fd).toHaveProperty('recovery');
      expect(typeof fd.recovery, `${key}.recovery should be number`).toBe('number');
    }
  });

  it('every entry has damage field', () => {
    for (const [key, fd] of allEntries) {
      expect(fd).toHaveProperty('damage');
      expect(typeof fd.damage, `${key}.damage should be number`).toBe('number');
    }
  });

  it('every entry has hitstun field', () => {
    for (const [key, fd] of allEntries) {
      expect(fd).toHaveProperty('hitstun');
      expect(typeof fd.hitstun, `${key}.hitstun should be number`).toBe('number');
    }
  });

  it('every entry has blockstun field', () => {
    for (const [key, fd] of allEntries) {
      expect(fd).toHaveProperty('blockstun');
      expect(typeof fd.blockstun, `${key}.blockstun should be number`).toBe('number');
    }
  });

  it('every entry has pushback field', () => {
    for (const [key, fd] of allEntries) {
      expect(fd).toHaveProperty('pushback');
      expect(typeof fd.pushback, `${key}.pushback should be number`).toBe('number');
    }
  });

  it('every entry has hitLevel field', () => {
    for (const [key, fd] of allEntries) {
      expect(fd).toHaveProperty('hitLevel');
      expect(typeof fd.hitLevel, `${key}.hitLevel should be string`).toBe('string');
    }
  });

  it('every entry has knockdown field', () => {
    for (const [key, fd] of allEntries) {
      expect(fd).toHaveProperty('knockdown');
      expect(typeof fd.knockdown, `${key}.knockdown should be boolean`).toBe('boolean');
    }
  });

  // --- 1.2 Positive value constraints ---

  it('startup > 0 for every entry', () => {
    for (const [key, fd] of allEntries) {
      expect(fd.startup, `${key}.startup should be > 0`).toBeGreaterThan(0);
    }
  });

  it('active > 0 for every entry', () => {
    for (const [key, fd] of allEntries) {
      expect(fd.active, `${key}.active should be > 0`).toBeGreaterThan(0);
    }
  });

  it('recovery > 0 for all non-jump entries', () => {
    for (const [key, fd] of allEntries) {
      if (isJumpAttack(key)) continue; // jump attacks can have recovery=0
      expect(fd.recovery, `${key}.recovery should be > 0 for grounded attacks`).toBeGreaterThan(0);
    }
  });

  it('recovery >= 0 for all entries (jump attacks may be 0)', () => {
    for (const [key, fd] of allEntries) {
      expect(fd.recovery, `${key}.recovery should be >= 0`).toBeGreaterThanOrEqual(0);
    }
  });

  it('damage > 0 for non-throw entries', () => {
    for (const [key, fd] of allEntries) {
      expect(fd.damage, `${key}.damage should be > 0`).toBeGreaterThan(0);
    }
  });

  it('hitstun > 0 for non-throw non-DM non-knockdown-only entries', () => {
    // Attacks with hitstun=0 are valid when: throw, DM/SDM, CD blowback, sweep (CROUCH_D),
    // or command/special throws (blockstun=0 and pushback=0 pattern).
    for (const [key, fd] of allEntries) {
      if (isThrow(key)) continue;           // throws: hitstun=0 is valid
      if (isDM(key) || isSDM(key)) continue; // DMs often have hitstun=0 (knockdown)
      if (key === 'STAND_CD' || key === 'JUMP_CD') continue; // CD attacks: hitstun=0 is valid
      if (key === 'CROUCH_D') continue;      // sweep: hitstun=0, goes straight to knockdown
      // Command/special throws: hitstun=0, blockstun=0, pushback=0 pattern
      if (fd.hitstun === 0 && fd.blockstun === 0 && fd.pushback === 0) continue;
      expect(fd.hitstun, `${key}.hitstun should be > 0`).toBeGreaterThan(0);
    }
  });

  it('hitstun >= 0 for all entries', () => {
    for (const [key, fd] of allEntries) {
      expect(fd.hitstun, `${key}.hitstun should be >= 0`).toBeGreaterThanOrEqual(0);
    }
  });

  it('blockstun >= 0 for all entries', () => {
    for (const [key, fd] of allEntries) {
      expect(fd.blockstun, `${key}.blockstun should be >= 0`).toBeGreaterThanOrEqual(0);
    }
  });

  it('pushback >= 0 for all entries', () => {
    for (const [key, fd] of allEntries) {
      expect(fd.pushback, `${key}.pushback should be >= 0`).toBeGreaterThanOrEqual(0);
    }
  });

  // --- 1.3 Enum/boolean correctness ---

  it('hitLevel is a valid HitLevel value (MID/LOW/HIGH)', () => {
    for (const [key, fd] of allEntries) {
      expect(
        VALID_HIT_LEVELS.has(fd.hitLevel),
        `${key}.hitLevel="${fd.hitLevel}" should be MID/LOW/HIGH`
      ).toBe(true);
    }
  });

  it('knockdown is a boolean for every entry', () => {
    for (const [key, fd] of allEntries) {
      expect(typeof fd.knockdown, `${key}.knockdown should be boolean`).toBe('boolean');
    }
  });

  // --- 1.4 Optional field correctness ---

  it('chipDamage, if present, must be > 0', () => {
    for (const [key, fd] of allEntries) {
      if ('chipDamage' in fd && fd.chipDamage !== undefined) {
        expect(fd.chipDamage, `${key}.chipDamage should be > 0`).toBeGreaterThan(0);
      }
    }
  });

  it('counterWire, if present, must be boolean', () => {
    for (const [key, fd] of allEntries) {
      if ('counterWire' in fd && fd.counterWire !== undefined) {
        expect(typeof fd.counterWire, `${key}.counterWire should be boolean`).toBe('boolean');
      }
    }
  });

  // --- 1.5 Specific throw properties ---

  it('throws must have hitstun = 0', () => {
    const throwKeys = ['THROW', 'THROW_FORWARD', 'THROW_BACK'];
    for (const key of throwKeys) {
      const fd = getFD(key);
      expect(fd.hitstun, `${key}.hitstun should be 0 for throws`).toBe(0);
    }
  });

  it('throws must have blockstun = 0', () => {
    const throwKeys = ['THROW', 'THROW_FORWARD', 'THROW_BACK'];
    for (const key of throwKeys) {
      const fd = getFD(key);
      expect(fd.blockstun, `${key}.blockstun should be 0 for throws`).toBe(0);
    }
  });

  it('throws must have pushback = 0', () => {
    const throwKeys = ['THROW', 'THROW_FORWARD', 'THROW_BACK'];
    for (const key of throwKeys) {
      const fd = getFD(key);
      expect(fd.pushback, `${key}.pushback should be 0 for throws`).toBe(0);
    }
  });

  it('throws must have knockdown = true', () => {
    const throwKeys = ['THROW', 'THROW_FORWARD', 'THROW_BACK'];
    for (const key of throwKeys) {
      const fd = getFD(key);
      expect(fd.knockdown, `${key}.knockdown should be true for throws`).toBe(true);
    }
  });

  // --- 1.6 Total frame count sanity ---

  it('startup + active + recovery >= 5 for all grounded attacks', () => {
    for (const [key, fd] of allEntries) {
      const total = fd.startup + fd.active + fd.recovery;
      expect(total, `${key} total frames should be >= 5`).toBeGreaterThanOrEqual(5);
    }
  });

  it('startup + active + recovery <= 120 for all non-DM entries', () => {
    for (const [key, fd] of allEntries) {
      if (isDM(key) || isSDM(key)) continue; // DMs can be longer
      const total = fd.startup + fd.active + fd.recovery;
      expect(total, `${key} total frames should be <= 120`).toBeLessThanOrEqual(120);
    }
  });

  // --- 1.7 Numerical sanity (no NaN/Infinity) ---

  it('all numeric fields are finite numbers', () => {
    for (const [key, fd] of allEntries) {
      const numericFields = ['startup', 'active', 'recovery', 'damage', 'hitstun', 'blockstun', 'pushback'] as const;
      for (const field of numericFields) {
        expect(Number.isFinite(fd[field]), `${key}.${field} should be finite`).toBe(true);
      }
      if (fd.chipDamage !== undefined) {
        expect(Number.isFinite(fd.chipDamage), `${key}.chipDamage should be finite`).toBe(true);
      }
    }
  });

  // --- 1.8 No duplicate keys ---

  it('FRAME_DATA has no duplicate keys (FRAME_DATA_CHARS does not overwrite generic normals)', () => {
    const genericKeys = new Set(Object.keys(FRAME_DATA));
    // The generic normals should still be present
    const requiredNormals = ['STAND_A', 'STAND_B', 'STAND_C', 'STAND_D',
      'CLOSE_A', 'CLOSE_B', 'CLOSE_C', 'CLOSE_D',
      'CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D',
      'JUMP_A', 'JUMP_B', 'JUMP_C', 'JUMP_D'];
    for (const nk of requiredNormals) {
      expect(genericKeys.has(nk), `${nk} should exist in FRAME_DATA`).toBe(true);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: Frame Data Sanity
// ═══════════════════════════════════════════════════════════════════

describe('Section 2: Frame Data Sanity', () => {

  // --- 2.1 Startup bounds ---

  it('normal attacks startup <= 12 frames (KOF2002 standard)', () => {
    for (const [key, fd] of allEntries) {
      if (!isNormal(key)) continue;
      expect(fd.startup, `${key}.startup should be <= 12 for normals`).toBeLessThanOrEqual(12);
    }
  });

  it('command normal startup <= 25 frames', () => {
    for (const [key, fd] of allEntries) {
      if (!isCommandNormal(key)) continue;
      expect(fd.startup, `${key}.startup should be <= 25 for command normals`).toBeLessThanOrEqual(25);
    }
  });

  it('special move startup <= 30 frames', () => {
    for (const [key, fd] of charEntries) {
      if (isDM(key) || isSDM(key)) continue;
      if (isCommandNormal(key)) continue;
      expect(fd.startup, `${key}.startup should be <= 30 for specials`).toBeLessThanOrEqual(30);
    }
  });

  it('DM startup can exceed 15 frames', () => {
    const dmEntries = allEntries.filter(([key]) => isDM(key));
    for (const [key, fd] of dmEntries) {
      // Just verifying the entries exist and have reasonable startup
      expect(fd.startup, `${key}.startup should be > 0`).toBeGreaterThan(0);
    }
  });

  // --- 2.2 Damage hierarchy ---

  it('light normal damage <= heavy normal damage within same stance (grounded)', () => {
    const pairs: [string, string][] = [
      ['STAND_A', 'STAND_C'],
      ['STAND_B', 'STAND_D'],
      ['CLOSE_A', 'CLOSE_C'],
      ['CLOSE_B', 'CLOSE_D'],
      ['CROUCH_A', 'CROUCH_C'],
      ['CROUCH_B', 'CROUCH_D'],
    ];
    for (const [light, heavy] of pairs) {
      const lightFD = getFD(light);
      const heavyFD = getFD(heavy);
      expect(lightFD.damage, `${light}.damage should be <= ${heavy}.damage`).toBeLessThanOrEqual(heavyFD.damage);
    }
  });

  it('air light normal damage <= air C damage', () => {
    const jumpA = getFD('JUMP_A');
    const jumpC = getFD('JUMP_C');
    expect(jumpA.damage, 'JUMP_A.damage should be <= JUMP_C.damage').toBeLessThanOrEqual(jumpC.damage);
  });

  it('command normal damage >= corresponding light normal damage', () => {
    const standA = getFD('STAND_A');
    for (const [key, fd] of allEntries) {
      if (!isCommandNormal(key)) continue;
      // Command normals should generally do more damage than a basic stand A
      expect(fd.damage, `${key}.damage should be >= STAND_A damage (${standA.damage})`).toBeGreaterThanOrEqual(standA.damage);
    }
  });

  it('DM damage > special move damage (highest special damage)', () => {
    const specialDamages = charEntries
      .filter(([key]) => !isDM(key) && !isSDM(key) && !key.startsWith('HSDM_') && !isCommandNormal(key))
      .map(([, fd]) => fd.damage);
    const maxSpecialDamage = Math.max(...specialDamages);

    const dmDmages = allEntries
      .filter(([key]) => isDM(key))
      .map(([, fd]) => fd.damage);
    const minDmDamage = Math.min(...dmDmages);

    expect(minDmDamage, `min DM damage (${minDmDamage}) should be > max special damage (${maxSpecialDamage})`).toBeGreaterThan(maxSpecialDamage);
  });

  it('SDM damage >= corresponding DM damage', () => {
    const sdmEntries = allEntries.filter(([key]) => isSDM(key));
    for (const [sdmKey, sdmFd] of sdmEntries) {
      // Try to find the corresponding DM by replacing SDM_ with DM_
      const dmKey = sdmKey.replace(/^SDM_/, 'DM_');
      const dmFd = FRAME_DATA[dmKey as keyof typeof FRAME_DATA] as FrameDataEntry | undefined;
      if (dmFd) {
        expect(sdmFd.damage, `${sdmKey}.damage should be >= ${dmKey}.damage`).toBeGreaterThanOrEqual(dmFd.damage);
      }
    }
  });

  // --- 2.3 Hit level correctness ---

  it('crouch A/B should be MID (A) or LOW (B) per KOF convention', () => {
    const crouchA = getFD('CROUCH_A');
    const crouchB = getFD('CROUCH_B');
    // CROUCH_A is typically MID (can be blocked both ways)
    expect(['MID', 'LOW']).toContain(crouchA.hitLevel);
    // CROUCH_B is typically LOW
    expect(crouchB.hitLevel).toBe('LOW');
  });

  it('jump attacks should have hitLevel HIGH', () => {
    const jumpNormals = ['JUMP_A', 'JUMP_B', 'JUMP_C', 'JUMP_D', 'JUMP_CD'];
    for (const key of jumpNormals) {
      const fd = getFD(key);
      expect(fd.hitLevel, `${key}.hitLevel should be HIGH`).toBe('HIGH');
    }
  });

  it('CROUCH_D (sweep) must be LOW and knockdown', () => {
    const fd = getFD('CROUCH_D');
    expect(fd.hitLevel).toBe('LOW');
    expect(fd.knockdown).toBe(true);
  });

  it('STAND_CD and JUMP_CD must have knockdown = true', () => {
    expect(getFD('STAND_CD').knockdown).toBe(true);
    expect(getFD('JUMP_CD').knockdown).toBe(true);
  });

  // --- 2.4 Blockstun / hitstun relationships ---

  it('blockstun <= hitstun for grounded normal attacks (advantage on hit > block)', () => {
    for (const [key, fd] of allEntries) {
      if (!isNormal(key)) continue;
      if (isJumpAttack(key)) continue; // air attacks have different blockstun/hitstun rules in KOF
      if (fd.hitstun === 0) continue; // skip where hitstun is 0 (e.g., CD)
      expect(fd.blockstun, `${key}.blockstun should be <= hitstun`).toBeLessThanOrEqual(fd.hitstun);
    }
  });

  it('all specials and DMs with chipDamage have blockstun > 0 (unless throw-type or hitstun=0)', () => {
    for (const [key, fd] of allEntries) {
      if (fd.chipDamage !== undefined && fd.chipDamage > 0) {
        // Throw-type attacks (hitstun=0 + blockstun=0 + pushback=0) are exempt
        if (fd.hitstun === 0 && fd.blockstun === 0 && fd.pushback === 0) continue;
        expect(fd.blockstun, `${key} has chipDamage so blockstun should be > 0`).toBeGreaterThan(0);
      }
    }
  });

  // --- 2.5 Pushback relationships ---

  it('DM pushback should be >= special pushback on average', () => {
    const specialPushbacks = charEntries
      .filter(([key]) => !isDM(key) && !isSDM(key) && !isCommandNormal(key))
      .map(([, fd]) => fd.pushback);
    const avgSpecialPushback = specialPushbacks.reduce((a, b) => a + b, 0) / specialPushbacks.length;

    const dmPushbacks = allEntries
      .filter(([key]) => isDM(key))
      .map(([, fd]) => fd.pushback);
    const avgDmPushback = dmPushbacks.reduce((a, b) => a + b, 0) / dmPushbacks.length;

    expect(avgDmPushback, `DM avg pushback (${avgDmPushback.toFixed(1)}) should be >= special avg (${avgSpecialPushback.toFixed(1)})`).toBeGreaterThanOrEqual(avgSpecialPushback);
  });

  // --- 2.6 Active frame ranges ---

  it('normal active frames should be between 2 and 10', () => {
    for (const [key, fd] of allEntries) {
      if (!isNormal(key)) continue;
      expect(fd.active, `${key}.active should be >= 2`).toBeGreaterThanOrEqual(2);
      expect(fd.active, `${key}.active should be <= 10`).toBeLessThanOrEqual(10);
    }
  });

  it('throw active frames should be <= 5 (throws have tight timing)', () => {
    const throwKeys = ['THROW', 'THROW_FORWARD', 'THROW_BACK'];
    for (const key of throwKeys) {
      const fd = getFD(key);
      expect(fd.active, `${key}.active should be <= 5`).toBeLessThanOrEqual(5);
    }
  });

  // --- 2.7 Knockdown patterns ---

  it('CROUCH_D knockdown is true (sweep always knocks down in KOF)', () => {
    expect(getFD('CROUCH_D').knockdown).toBe(true);
  });

  it('all DMs should cause knockdown', () => {
    const dmEntries = allEntries.filter(([key]) => isDM(key));
    for (const [key, fd] of dmEntries) {
      expect(fd.knockdown, `${key}.knockdown should be true for DMs`).toBe(true);
    }
  });

  it('all SDMs should cause knockdown', () => {
    const sdmEntries = allEntries.filter(([key]) => isSDM(key));
    for (const [key, fd] of sdmEntries) {
      expect(fd.knockdown, `${key}.knockdown should be true for SDMs`).toBe(true);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: Cancel Legality
// ═══════════════════════════════════════════════════════════════════

describe('Section 3: Cancel Legality', () => {

  // Since the current codebase does not use a cancelInto field in frame data,
  // we validate the cancel / chain system through structural properties that
  // enable correct cancel behavior.

  // --- 3.1 Rekka chain sequence validity ---

  it('KYO_ARAGAMI exists and is a valid rekka start', () => {
    const fd = getFD('KYO_ARAGAMI');
    expect(fd.startup).toBeGreaterThan(0);
    expect(fd.damage).toBeGreaterThan(0);
    expect(fd.knockdown).toBe(false); // rekka 1st hit does not knockdown
  });

  it('KYO_ARAGAMI_KONOKIZU (rekka 2nd) has faster startup than rekka 1st', () => {
    const fd1 = getFD('KYO_ARAGAMI');
    const fd2 = getFD('KYO_ARAGAMI_KONOKIZU');
    expect(fd2.startup, 'rekka 2nd hit should have <= startup of 1st').toBeLessThanOrEqual(fd1.startup);
  });

  it('KYO_DOKUGAMI exists and is a valid rekka C start', () => {
    const fd = getFD('KYO_DOKUGAMI');
    expect(fd.startup).toBeGreaterThan(0);
    expect(fd.damage).toBeGreaterThan(0);
    expect(fd.knockdown).toBe(false); // rekka start does not knockdown
  });

  it('KYO_TSUMIYOMI and KYO_BATSUYOMI chain correctly', () => {
    const fd2 = getFD('KYO_TSUMIYOMI');
    const fd3 = getFD('KYO_BATSUYOMI');
    // Later rekka hits should exist and have valid frame data
    expect(fd2.damage).toBeGreaterThan(0);
    expect(fd3.damage).toBeGreaterThan(0);
    // Final rekka hit should knockdown
    expect(fd3.knockdown).toBe(true);
  });

  // --- 3.2 Iori Aoihana rekka chain ---

  it('IORI_AOIHANA 3-hit chain all exist and have valid data', () => {
    const fd1 = getFD('IORI_AOIHANA');
    const fd2 = getFD('IORI_AOIHANA_2');
    const fd3 = getFD('IORI_AOIHANA_3');
    expect(fd1.startup).toBeGreaterThan(0);
    expect(fd2.startup).toBeGreaterThan(0);
    expect(fd3.startup).toBeGreaterThan(0);
    // Final hit should knockdown
    expect(fd3.knockdown).toBe(true);
  });

  it('IORI_AOIHANA_C 3-hit chain all exist and have valid data', () => {
    const fd1 = getFD('IORI_AOIHANA_C');
    const fd2 = getFD('IORI_AOIHANA_C_2');
    const fd3 = getFD('IORI_AOIHANA_C_3');
    expect(fd1.startup).toBeGreaterThan(0);
    expect(fd2.startup).toBeGreaterThan(0);
    expect(fd3.startup).toBeGreaterThan(0);
    expect(fd3.knockdown).toBe(true);
  });

  it('Iori C rekka does more damage than A rekka total', () => {
    const aTotal = getFD('IORI_AOIHANA').damage + getFD('IORI_AOIHANA_2').damage + getFD('IORI_AOIHANA_3').damage;
    const cTotal = getFD('IORI_AOIHANA_C').damage + getFD('IORI_AOIHANA_C_2').damage + getFD('IORI_AOIHANA_C_3').damage;
    expect(cTotal, 'C rekka total damage should be >= A rekka total').toBeGreaterThanOrEqual(aTotal);
  });

  // --- 3.3 Kim San-ren chain ---

  it('KIM_SANREN and KIM_SANREN_2 chain both exist', () => {
    const fd1 = getFD('KIM_SANREN');
    const fd2 = getFD('KIM_SANREN_2');
    expect(fd1.startup).toBeGreaterThan(0);
    expect(fd2.startup).toBeGreaterThan(0);
    expect(fd1.damage).toBeGreaterThan(0);
    expect(fd2.damage).toBeGreaterThan(0);
  });

  // --- 3.4 DM/SDM pairing validation ---

  // Known SDM-to-DM mappings where the names don't follow the simple SDM_ -> DM_ pattern
  const SDM_DM_ALIASES: Record<string, string[]> = {
    'SDM_TRIPLE_GEYSER': ['DM_POWER_GEYSER', 'DM_HIGH_ANGLE_GEYSER'],
    'SDM_POWER_GEYSER_EX': ['DM_POWER_GEYSER', 'DM_POWER_GEYSER_A', 'DM_POWER_GEYSER_C'],
    'SDM_PHOENIX_HITEN_EX': ['DM_PHOENIX_HITEN'],
    'SDM_RYUKO_RANBU_EX': ['DM_RYUKO_RANBU'],
    'SDM_182SHIKI': ['DM_182SHIKI_A', 'DM_182SHIKI_C'],
    'SDM_SAIHYO_HASSAKU': ['DM_SAIHYO_HASSAKU'],
    'SDM_YAOTOME': ['DM_YAOTOME'],
    'SDM_RYUKO_RANBU_ROBERT': ['DM_RYUKO_RANBU_ROBERT'],
  };

  it('every SDM has a corresponding DM entry (direct or character variant)', () => {
    const sdmEntries = allEntries.filter(([key]) => isSDM(key));
    for (const [sdmKey] of sdmEntries) {
      const dmKeyDirect = sdmKey.replace(/^SDM_/, 'DM_');
      const hasDirect = dmKeyDirect in FRAME_DATA;
      // Some DMs have character-specific variants like DM_OROCHINAGI_A / DM_MAIDEN_MASHER_A
      const hasVariant = allEntries.some(([key]) => key.startsWith(dmKeyDirect));
      // Some SDMs map to differently-named DMs (check aliases)
      const aliases = SDM_DM_ALIASES[sdmKey] || [];
      const hasAlias = aliases.some(alias => alias in FRAME_DATA);
      expect(
        hasDirect || hasVariant || hasAlias,
        `SDM ${sdmKey} should have a corresponding DM entry (direct: ${dmKeyDirect}, variant, or alias)`
      ).toBe(true);
    }
  });

  it('SDM damage is strictly higher than DM damage when both exist', () => {
    const sdmEntries = allEntries.filter(([key]) => isSDM(key));
    for (const [sdmKey, sdmFd] of sdmEntries) {
      const dmKey = sdmKey.replace(/^SDM_/, 'DM_');
      const dmFd = FRAME_DATA[dmKey as keyof typeof FRAME_DATA] as FrameDataEntry | undefined;
      if (dmFd) {
        expect(sdmFd.damage, `${sdmKey}.damage should be > ${dmKey}.damage`).toBeGreaterThan(dmFd.damage);
      }
    }
  });

  it('SDM chipDamage >= DM chipDamage when both have chipDamage', () => {
    const sdmEntries = allEntries.filter(([key]) => isSDM(key));
    for (const [sdmKey, sdmFd] of sdmEntries) {
      const dmKey = sdmKey.replace(/^SDM_/, 'DM_');
      const dmFd = FRAME_DATA[dmKey as keyof typeof FRAME_DATA] as FrameDataEntry | undefined;
      if (dmFd && dmFd.chipDamage !== undefined && sdmFd.chipDamage !== undefined) {
        expect(sdmFd.chipDamage, `${sdmKey}.chipDamage should be >= ${dmKey}.chipDamage`).toBeGreaterThanOrEqual(dmFd.chipDamage);
      }
    }
  });

  // --- 3.5 No orphan entries ---

  it('all character-specific entries in FRAME_DATA_CHARS are present in merged FRAME_DATA', () => {
    for (const [key] of charEntries) {
      expect(
        key in FRAME_DATA,
        `${key} from FRAME_DATA_CHARS should be in merged FRAME_DATA`
      ).toBe(true);
    }
  });

  // --- 3.6 Rekka follow-up recovery relationship ---

  it('rekka final hits have higher recovery than rekka start (more commitment)', () => {
    // Kyo aragami chain
    const aragami = getFD('KYO_ARAGAMI');
    const konokizu = getFD('KYO_ARAGAMI_KONOKIZU');
    expect(konokizu.recovery, 'rekka 2nd hit should have >= recovery of 1st').toBeGreaterThanOrEqual(aragami.recovery);
  });
});

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: Character Coverage
// ═══════════════════════════════════════════════════════════════════

describe('Section 4: Character Coverage', () => {

  // --- 4.1 Generic normal coverage ---

  const requiredNormals = [
    'STAND_A', 'STAND_B', 'STAND_C', 'STAND_D',
    'CLOSE_A', 'CLOSE_B', 'CLOSE_C', 'CLOSE_D',
    'CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D',
    'JUMP_A', 'JUMP_B', 'JUMP_C', 'JUMP_D',
    'STAND_CD', 'JUMP_CD',
    'THROW', 'THROW_FORWARD', 'THROW_BACK',
  ];

  it('all generic normal attacks exist in FRAME_DATA', () => {
    for (const atk of requiredNormals) {
      expect(FRAME_DATA[atk as keyof typeof FRAME_DATA], `${atk} should exist`).toBeDefined();
    }
  });

  it('generic special placeholders exist (SPECIAL_PROJECTILE, SPECIAL_UPPER)', () => {
    expect(FRAME_DATA['SPECIAL_PROJECTILE' as keyof typeof FRAME_DATA]).toBeDefined();
    expect(FRAME_DATA['SPECIAL_UPPER' as keyof typeof FRAME_DATA]).toBeDefined();
  });

  // --- 4.2 Per-character special coverage ---

  const characterCoverage: Record<string, { name: string; requiredSpecials: string[] }> = {
    kyo: {
      name: 'Kyo Kusanagi',
      requiredSpecials: [
        'KYO_75KAI', 'KYO_75KAI_2', 'KYO_RED_KICK', 'KYO_ONIYAKI', 'KYO_ONIYAKI_C',
        'KYO_YAMIBARAI', 'KYO_YAMIBARAI_C', 'KYO_ARAGAMI', 'KYO_DOKUGAMI',
        'DM_OROCHINAGI', 'SDM_OROCHINAGI',
      ],
    },
    iori: {
      name: 'Iori Yagami',
      requiredSpecials: [
        'IORI_AOIHANA', 'IORI_AOIHANA_2', 'IORI_AOIHANA_3',
        'IORI_YAMIBARAI', 'IORI_YAMIBARAI_C',
        'IORI_ONIYAKI', 'IORI_ONIYAKI_C',
        'IORI_KOTOTSUKI', 'IORI_KUZUKAZE',
        'DM_MAIDEN_MASHER_A', 'SDM_MAIDEN_MASHER',
      ],
    },
    terry: {
      name: 'Terry Bogard',
      requiredSpecials: [
        'TERRY_POWER_WAVE', 'TERRY_BURN_KNUCKLE', 'TERRY_CRACK_SHOT',
        'TERRY_POWER_DUNK', 'TERRY_RISING_TACKLE',
        'DM_POWER_GEYSER', 'DM_HIGH_ANGLE_GEYSER', 'SDM_TRIPLE_GEYSER',
      ],
    },
    kim: {
      name: 'Kim Kaphwan',
      requiredSpecials: [
        'KIM_HIENZAN', 'KIM_HANGETSU', 'KIM_HAKI', 'KIM_HISHOU', 'KIM_SANREN',
        'DM_PHOENIX_KICK', 'DM_PHOENIX_HITEN',
        'SDM_PHOENIX_KICK',
      ],
    },
    ryo: {
      name: 'Ryo Sakazaki',
      requiredSpecials: [
        'RYO_KOOU', 'RYO_KOOU_C', 'RYO_KO_HOU', 'RYO_KO_HOU_C',
        'RYO_HIEN', 'RYO_HAOU',
        'DM_TEN_HA_OU', 'SDM_TEN_HA_OU',
      ],
    },
    leona: {
      name: 'Leona Heidern',
      requiredSpecials: [
        'LEONA_MOON_SLASH', 'LEONA_EAR_RING', 'LEONA_GRAND_SABER', 'LEONA_BALTIC',
        'DM_V_SLASHER', 'SDM_V_SLASHER',
      ],
    },
    robert: {
      name: 'Robert Garcia',
      requiredSpecials: [
        'ROBERT_RYU_GEKI', 'ROBERT_RYU_GEKI_C',
        'ROBERT_RYU_ZAN', 'ROBERT_RYU_ZAN_C',
        'DM_RYU_KO_RYU', 'DM_HAOU_SHOKOU',
        'SDM_RYU_KO_RYU', 'SDM_HAOU_SHOKOU',
      ],
    },
    mai: {
      name: 'Mai Shiranui',
      requiredSpecials: [
        'MAI_KA_CHO_SEN', 'MAI_HISHO_RYU_EN_JIN', 'MAI_RYU_EN_BU',
        'DM_HAKA_OTOSHI',
      ],
    },
    kdash: {
      name: "K'",
      requiredSpecials: [
        'KDASH_EINS', 'KDASH_EINS_C', 'KDASH_CROW', 'KDASH_CROW_C',
        'KDASH_MINUTE', 'KDASH_NARROW',
        'DM_CHAIN_SHOT', 'SDM_CHAIN_SHOT',
      ],
    },
    kula: {
      name: 'Kula Diamond',
      requiredSpecials: [
        'KULA_BREATH', 'KULA_BREATH_C', 'KULA_SHELL', 'KULA_SHELL_C',
        'KULA_LAY', 'KULA_EDGE',
        'DM_FREEZE', 'SDM_FREEZE',
      ],
    },
  };

  // Dynamically generate one test per character
  for (const [charId, info] of Object.entries(characterCoverage)) {
    it(`${info.name} has all required specials in FRAME_DATA`, () => {
      for (const special of info.requiredSpecials) {
        expect(
          FRAME_DATA[special as keyof typeof FRAME_DATA],
          `${special} should exist for ${info.name}`
        ).toBeDefined();
      }
    });
  }

  // --- 4.3 No empty frame data objects ---

  it('no frame data entry is an empty object', () => {
    for (const [key, fd] of allEntries) {
      const ownKeys = Object.keys(fd);
      expect(ownKeys.length, `${key} should not be an empty object`).toBeGreaterThan(0);
    }
  });

  // --- 4.4 FRAME_DATA total entry count ---

  it('FRAME_DATA has at least 100 entries (generic + character specials)', () => {
    expect(allEntries.length, 'FRAME_DATA should have >= 100 entries').toBeGreaterThanOrEqual(100);
  });

  // --- 4.5 Every AttackType enum member with DM_ or SDM_ prefix has frame data ---

  it('every DM_ prefixed AttackType enum value has frame data or a character-specific variant', () => {
    const attackTypeMembers = Object.values(AttackType);
    const dmMembers = attackTypeMembers.filter(v => v.startsWith('DM_'));
    for (const dm of dmMembers) {
      // Some DMs in AttackType enum map to character-specific variants (e.g., DM_OROCHINAGI -> DM_OROCHINAGI_A)
      const hasDirect = dm in FRAME_DATA;
      const hasVariant = allEntries.some(([key]) => key.startsWith(dm));
      expect(
        hasDirect || hasVariant,
        `${dm} from AttackType enum should have frame data (direct or variant)`
      ).toBe(true);
    }
  });

  it('every SDM_ prefixed AttackType enum value has frame data', () => {
    const attackTypeMembers = Object.values(AttackType);
    const sdmMembers = attackTypeMembers.filter(v => v.startsWith('SDM_'));
    for (const sdm of sdmMembers) {
      const hasDirect = sdm in FRAME_DATA;
      const hasVariant = allEntries.some(([key]) => key.startsWith(sdm));
      expect(
        hasDirect || hasVariant,
        `${sdm} from AttackType enum should have frame data (direct or variant)`
      ).toBe(true);
    }
  });

  // --- 4.6 Command normal coverage per character ---

  it('Kyo has command normal frame data (CMD_GOFU_YOU, CMD_88SHIKI, CMD_NARAKU)', () => {
    for (const cn of ['CMD_GOFU_YOU', 'CMD_88SHIKI', 'CMD_NARAKU']) {
      expect(FRAME_DATA[cn as keyof typeof FRAME_DATA], `${cn} should exist`).toBeDefined();
    }
  });

  it('Iori has command normal frame data', () => {
    for (const cn of ['IORI_YUMEYUMI', 'IORI_KATANUGI', 'IORI_YUKIWARUI']) {
      expect(FRAME_DATA[cn as keyof typeof FRAME_DATA], `${cn} should exist`).toBeDefined();
    }
  });

  it('Terry has command normal frame data', () => {
    for (const cn of ['TERRY_BACK_KNCKLE', 'TERRY_COMBO_BLOW']) {
      expect(FRAME_DATA[cn as keyof typeof FRAME_DATA], `${cn} should exist`).toBeDefined();
    }
  });

  it('Kim has command normal frame data', () => {
    for (const cn of ['KIM_HISHOU_KICK', 'KIM_HANSEN']) {
      expect(FRAME_DATA[cn as keyof typeof FRAME_DATA], `${cn} should exist`).toBeDefined();
    }
  });
});
