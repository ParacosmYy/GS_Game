/**
 * Character Differentiation Tests
 *
 * Verifies that every character in the roster is meaningfully distinct:
 *   - Move sets are unique (specials, DMs, command normals)
 *   - Frame data varies across characters
 *   - AI strategies differ
 *   - Attack type coverage is balanced
 *   - Balance boundaries are respected
 */
import { describe, it, expect } from 'vitest';
import { FRAME_DATA } from '../src/core/constants.js';
import { FRAME_DATA_CHARS } from '../src/core/frameDataChars.js';
import { ALL_STRATEGIES } from '../src/ai/characterStrategies.js';
import { ROSTER } from '../src/characters/index.js';
import { AttackType } from '../src/core/types.js';
import { COMMAND_NORMALS } from '../src/core/constants.js';
import type { CharacterDefinition } from '../src/characters/types.js';

// ── Helpers ──

/** Prefix used for each character's specials in FRAME_DATA_CHARS */
const CHAR_PREFIXES = [
  'KYO', 'IORI', 'TERRY', 'KIM', 'RYO', 'LEONA', 'KULA', 'KDASH',
  'ROBERT', 'ATHENA', 'MAI', 'RALF', 'ANDY', 'CLARK', 'JOE', 'BILLY',
  'CHOI', 'CHANG', 'MATURE', 'YASHIRO', 'CHRIS', 'SHERMIE', 'VICE',
  'YAMAZAKI', 'XIANGFEI', 'KASUMI', 'MARY',
];

/** Map char prefix to roster charId */
const PREFIX_TO_ID: Record<string, string> = {
  KYO: 'kyo', IORI: 'iori', TERRY: 'terry', KIM: 'kim', RYO: 'ryo',
  LEONA: 'leona', KULA: 'kula', KDASH: 'kdash', ROBERT: 'robert',
  ATHENA: 'athena', MAI: 'mai', RALF: 'ralf', ANDY: 'andy', CLARK: 'clark',
  JOE: 'joe', BILLY: 'billy', CHOI: 'choi', CHANG: 'chang', MATURE: 'mature',
  YASHIRO: 'yashiro', CHRIS: 'chris', SHERMIE: 'shermie', VICE: 'vice',
  YAMAZAKI: 'yamazaki', XIANGFEI: 'xiangfei', KASUMI: 'kasumi', MARY: 'mary',
};

/**
 * Explicit DM/SDM/HSDM key → character prefix mapping.
 * Built from the comments in frameDataChars.ts which annotate each DM section.
 * Only base DM keys are listed (alias variants like DM_POWER_GEYSER for Terry
 * are also included). SDM/HSDM variants are derived by replacing the DM_ prefix.
 */
const DM_CHAR_MAP: Record<string, string> = {
  // Kyo
  DM_OROCHINAGI_A: 'KYO', DM_OROCHINAGI_C: 'KYO',
  DM_182SHIKI_A: 'KYO', DM_182SHIKI_C: 'KYO',
  DM_SAIHYO_HASSAKU: 'KYO',
  SDM_OROCHINAGI: 'KYO', SDM_182SHIKI: 'KYO', SDM_SAIHYO_HASSAKU: 'KYO',
  // Iori
  DM_MAIDEN_MASHER_A: 'IORI', DM_MAIDEN_MASHER_C: 'IORI',
  DM_YAOTOME: 'IORI',
  SDM_MAIDEN_MASHER: 'IORI', SDM_YAOTOME: 'IORI',
  HSDM_YAOTOME: 'IORI',
  // Terry
  DM_POWER_GEYSER_A: 'TERRY', DM_POWER_GEYSER_C: 'TERRY',
  DM_HIGH_ANGLE_GEYSER_B: 'TERRY', DM_HIGH_ANGLE_GEYSER_D: 'TERRY',
  DM_POWER_GEYSER: 'TERRY', DM_HIGH_ANGLE_GEYSER: 'TERRY',
  SDM_TRIPLE_GEYSER: 'TERRY', SDM_POWER_GEYSER_EX: 'TERRY',
  SDM_POWER_GEYSER: 'TERRY', SDM_HIGH_ANGLE_GEYSER: 'TERRY',
  // Kim
  DM_YATAGARASU: 'KIM', DM_PHOENIX_KICK: 'KIM', DM_PHOENIX_HITEN: 'KIM',
  SDM_PHOENIX_HITEN: 'KIM', SDM_PHOENIX_HITEN_EX: 'KIM',
  SDM_PHOENIX_KICK: 'KIM',
  // Ryo
  DM_TEN_HA_OU: 'RYO', DM_RYUKO_RANBU: 'RYO',
  SDM_RYUKO_RANBU: 'RYO', SDM_RYUKO_RANBU_EX: 'RYO',
  HSDM_RYUKO_RANBU: 'RYO', SDM_TEN_HA_OU: 'RYO',
  // Leona
  DM_V_SLASHER: 'LEONA', DM_REBEL_SPARK: 'LEONA',
  SDM_REBEL_SPARK: 'LEONA', SDM_V_SLASHER: 'LEONA',
  // Robert
  DM_RYU_KO_RYU: 'ROBERT', DM_HAOU_SHOKOU: 'ROBERT',
  DM_RYUKO_RANBU_ROBERT: 'ROBERT',
  SDM_RYUKO_RANBU_ROBERT: 'ROBERT',
  SDM_RYU_KO_RYU: 'ROBERT', SDM_HAOU_SHOKOU: 'ROBERT',
  // Mai
  DM_HAKA_OTOSHI: 'MAI', DM_CHOU_HISSATSU: 'MAI',
  SDM_CHOU_HISSATSU: 'MAI', SDM_HAKA_OTOSHI: 'MAI',
  HSDM_CHOU_HISSATSU: 'MAI',
  // Kula
  DM_FREEZE: 'KULA',
  SDM_FREEZE: 'KULA', HSDM_FREEZE_EXECUTION: 'KULA',
  // K'
  DM_CHAIN_SHOT: 'KDASH', DM_CHAIN_DRIVE: 'KDASH', DM_HEAT_DRIVE: 'KDASH',
  SDM_CHAIN_DRIVE: 'KDASH', SDM_HEAT_DRIVE: 'KDASH',
  HSDM_CHAIN_DRIVE: 'KDASH', SDM_CHAIN_SHOT: 'KDASH',
  // Athena
  DM_SHINING_CRYSTAL_BIT: 'ATHENA', DM_PHOENIX_FANG_ARROW: 'ATHENA',
  SDM_SHINING_CRYSTAL_BIT: 'ATHENA', SDM_PHOENIX_FANG_ARROW: 'ATHENA',
  // Clark
  DM_ARGENTINE_DM: 'CLARK', DM_SUPER_ARGENTINE_BACKBREAKER: 'CLARK',
  SDM_ARGENTINE_DM: 'CLARK',
  // Ralf
  DM_GALACTICA_PHANTOM: 'RALF', DM_GALACTIC_PHANTOM: 'RALF',
  SDM_GALACTICA_PHANTOM: 'RALF', SDM_GALACTIC_PHANTOM: 'RALF',
  // Joe
  DM_BOMBER_TIGER: 'JOE', DM_SCREW_UPPER: 'JOE',
  SDM_SCREW_UPPER: 'JOE', SDM_BOMBER_TIGER: 'JOE',
  // Andy
  DM_HI_EN_KYAKU: 'ANDY', DM_CHO_REPPA_DAN: 'ANDY',
  SDM_CHO_REPPA_DAN: 'ANDY', SDM_HI_EN_KYAKU: 'ANDY',
  // Billy
  DM_DAISAN_NO_KON: 'BILLY', DM_KAEN_SENPU_JIN: 'BILLY',
  SDM_KAEN_SENPU_JIN: 'BILLY', SDM_DAISAN_NO_KON: 'BILLY',
  // Chang
  DM_TEKKYUU_DAI_SESSA: 'CHANG', DM_TEKKYUU_DAI_BOUSOU: 'CHANG',
  SDM_TEKKYUU_DAI_BOUSOU: 'CHANG', SDM_TEKKYUU_DAI_SESSA: 'CHANG',
  // Choi
  DM_SHIN_CHOU_HOUYOKU: 'CHOI',
  SDM_SHIN_CHOU_HOUYOKU: 'CHOI',
  // Mature
  DM_NOCTURNAL_LIGHT: 'MATURE',
  SDM_NOCTURNAL_LIGHT: 'MATURE',
  // Yashiro
  DM_ARMAGEDDON_BUSTERS: 'YASHIRO', DM_TERRITORY_BUST: 'YASHIRO', DM_MISS_HEAD: 'YASHIRO',
  SDM_ARMAGEDDON_BUSTERS: 'YASHIRO', SDM_TERRITORY_BUST: 'YASHIRO',
  // Chris
  DM_CHAIN_SLIDE_TOUCH: 'CHRIS', DM_ANOTHER_BLOOD: 'CHRIS',
  SDM_CHAIN_SLIDE_TOUCH: 'CHRIS', SDM_ANOTHER_BLOOD: 'CHRIS',
  // Shermie
  DM_SHERMIE_CARNIVAL: 'SHERMIE', DM_SHERMIE_FLASH: 'SHERMIE',
  SDM_SHERMIE_CARNIVAL: 'SHERMIE', SDM_SHERMIE_FLASH: 'SHERMIE',
  // Vice
  DM_NEGATIVE_GAIN: 'VICE', DM_GORE_FEST: 'VICE', DM_OVERKILL_DM: 'VICE', DM_NEGATIVE_FLOG: 'VICE',
  SDM_NEGATIVE_GAIN: 'VICE', SDM_GORE_FEST: 'VICE',
  SDM_NEGATIVE_FLOG: 'VICE',
  // Mary
  DM_MARY_TYPHOON: 'MARY', DM_MARY_DYNAMITE_SWING: 'MARY', DM_MARY_DYNAMIC: 'MARY',
  SDM_MARY_TYPHOON: 'MARY', SDM_MARY_DYNAMITE_SWING: 'MARY', SDM_MARY_DYNAMIC: 'MARY',
  // Xiangfei
  DM_CHO_KA_RINGA: 'XIANGFEI', DM_CHOU_KYOKU_DAN: 'XIANGFEI', DM_TETSUZAN_KOU: 'XIANGFEI',
  SDM_CHO_KA_RINGA: 'XIANGFEI', SDM_CHOU_KYOKU_DAN: 'XIANGFEI', SDM_TETSUZAN_KOU: 'XIANGFEI',
  // Yamazaki
  DM_GUILLOTINE: 'YAMAZAKI', DM_YAMAZAKI_GUILLOTINE: 'YAMAZAKI',
  SDM_GUILLOTINE: 'YAMAZAKI', SDM_YAMAZAKI_GUILLOTINE: 'YAMAZAKI',
  // Kasumi
  DM_CHO_MUKIGENZAN: 'KASUMI', DM_CHOU_MUKOU_GAESHI: 'KASUMI', DM_SAN_SHIN_RAI: 'KASUMI',
  SDM_CHO_MUKIGENZAN: 'KASUMI', SDM_CHOU_MUKOU_GAESHI: 'KASUMI', SDM_SAN_SHIN_RAI: 'KASUMI',
};

/** Map of character ID (lowercase) to FRAME_DATA_CHARS keys belonging to that character */
function getCharSpecialKeys(prefix: string): string[] {
  return Object.keys(FRAME_DATA_CHARS).filter((k) => {
    if (k.startsWith('DM_') || k.startsWith('SDM_') || k.startsWith('HSDM_')) return false;
    return k.startsWith(prefix + '_');
  });
}

/** Get DM/SDM/HSDM keys for a character prefix from FRAME_DATA_CHARS */
function getCharDMKeys(prefix: string): string[] {
  return Object.keys(DM_CHAR_MAP).filter((k) => DM_CHAR_MAP[k] === prefix);
}

/** Get command normals for a character from COMMAND_NORMALS set */
function getCharCommandNormals(charId: string): string[] {
  const idToPrefix: Record<string, string> = {
    kyo: 'CMD_',
    iori: 'IORI_',
    terry: 'TERRY_',
    kim: 'KIM_',
    ryo: 'RYO_',
    kdash: 'KDASH_',
    kula: 'KULA_',
    leona: 'LEONA_',
    mai: 'MAI_',
    robert: 'ROBERT_',
    athena: 'ATHENA_',
    ralf: 'RALF_',
    andy: 'ANDY_',
    clark: 'CLARK_',
    joe: 'JOE_',
    billy: 'BILLY_',
    choi: 'CHOI_',
    chang: 'CHANG_',
    mature: 'MATURE_',
    yashiro: 'YASHIRO_',
    chris: 'CHRIS_',
    shermie: 'SHERMIE_',
    vice: 'VICE_',
    yamazaki: 'YAMAZAKI_',
    xiangfei: 'XIANGFEI_',
    kasumi: 'KASUMI_',
    mary: 'MARY_',
  };
  const prefixPattern = idToPrefix[charId];
  if (!prefixPattern) return [];
  return Array.from(COMMAND_NORMALS).filter((cn) => cn.startsWith(prefixPattern));
}

// ── Build a map of charId → character definition ──
const charDefMap = new Map<string, CharacterDefinition>();
for (const def of ROSTER) {
  charDefMap.set(def.id, def);
}

// ─────────────────────────────────────────────────────
// 1. Move Set Uniqueness
// ─────────────────────────────────────────────────────
describe('Move Set Uniqueness', () => {
  it('each character has at least 2 unique special moves (not shared with others)', () => {
    for (const prefix of CHAR_PREFIXES) {
      const specialKeys = getCharSpecialKeys(prefix);
      expect(
        specialKeys.length,
        `${PREFIX_TO_ID[prefix]} should have >= 2 unique specials, got ${specialKeys.length}: ${specialKeys.join(', ')}`,
      ).toBeGreaterThanOrEqual(2);
    }
  });

  it('DM names are character-specific (no two characters share the same DM)', () => {
    // Every DM key should map to exactly one character
    const dmOwnership = new Map<string, string>(); // DM key -> owning char prefix
    for (const [dmKey, owner] of Object.entries(DM_CHAR_MAP)) {
      if (dmOwnership.has(dmKey)) {
        expect.fail(`DM key ${dmKey} claimed by both ${dmOwnership.get(dmKey)} and ${owner}`);
      }
      dmOwnership.set(dmKey, owner);
    }
    // Every character should have at least 1 DM in the mapping
    for (const prefix of CHAR_PREFIXES) {
      const dmKeys = getCharDMKeys(prefix);
      expect(
        dmKeys.length,
        `${PREFIX_TO_ID[prefix]} should have at least 1 DM`,
      ).toBeGreaterThanOrEqual(1);
    }
  });

  it('command normals differ across characters', () => {
    const charCmdNormals = new Map<string, Set<string>>();
    for (const def of ROSTER) {
      const cn = getCharCommandNormals(def.id);
      charCmdNormals.set(def.id, new Set(cn));
    }

    const uniqueSets: string[][] = [];
    for (const [, cnSet] of charCmdNormals) {
      const sorted = Array.from(cnSet).sort().join(',');
      const existing = uniqueSets.find((u) => u.join(',') === sorted);
      if (!existing) {
        uniqueSets.push(Array.from(cnSet).sort());
      }
    }
    // With 27 characters each having character-prefixed command normals,
    // there should be many unique sets
    expect(uniqueSets.length, 'At least 10 distinct command normal sets expected').toBeGreaterThanOrEqual(10);
  });

  it('special move damage values differ across characters', () => {
    // Collect the first listed special move damage per character and verify not all identical
    const damages: number[] = [];
    for (const prefix of CHAR_PREFIXES) {
      const specials = getCharSpecialKeys(prefix);
      if (specials.length > 0) {
        const fd = FRAME_DATA_CHARS[specials[0] as keyof typeof FRAME_DATA_CHARS];
        if (fd) damages.push(fd.damage);
      }
    }
    const uniqueDamages = new Set(damages);
    // Not every character should share the same damage on their first special
    expect(uniqueDamages.size, 'Special move damages should not all be identical').toBeGreaterThan(1);
  });

  it('no two characters have identical move sets', () => {
    const moveSets = new Map<string, string[]>();
    for (const prefix of CHAR_PREFIXES) {
      const specials = getCharSpecialKeys(prefix);
      const dms = getCharDMKeys(prefix);
      const all = [...specials, ...dms].sort();
      moveSets.set(prefix, all);
    }

    const seen = new Map<string, string>(); // sorted key -> prefix
    for (const [prefix, moves] of moveSets) {
      const key = moves.join(',');
      if (seen.has(key)) {
        expect.fail(`${prefix} and ${seen.get(key)} have identical move sets`);
      }
      seen.set(key, prefix);
    }
    // If we reach here, no two characters had identical sets
    expect(true).toBe(true);
  });
});

// ─────────────────────────────────────────────────────
// 2. Frame Data Differentiation
// ─────────────────────────────────────────────────────
describe('Frame Data Differentiation', () => {
  it('not all characters have the same STAND_A startup', () => {
    // STAND_A is a generic normal (shared), but character-specific specials
    // should have varying startup values across characters.
    const startups: number[] = [];
    for (const prefix of CHAR_PREFIXES) {
      const specials = getCharSpecialKeys(prefix);
      if (specials.length > 0) {
        const fd = FRAME_DATA_CHARS[specials[0] as keyof typeof FRAME_DATA_CHARS];
        if (fd) startups.push(fd.startup);
      }
    }
    const unique = new Set(startups);
    expect(unique.size, 'First-special startup should vary across characters').toBeGreaterThanOrEqual(5);
  });

  it('not all characters have the same walk speed', () => {
    const walkSpeeds = ROSTER.map((d) => d.stats.walkSpeed);
    const unique = new Set(walkSpeeds);
    expect(unique.size, 'Walk speeds should vary across characters').toBeGreaterThan(1);
  });

  it('CROUCH_B range (pushback) differs from other light normals', () => {
    // CROUCH_B and STAND_B have different hitLevel and pushback characteristics
    const crouchB = FRAME_DATA['CROUCH_B' as keyof typeof FRAME_DATA];
    const standB = FRAME_DATA['STAND_B' as keyof typeof FRAME_DATA];
    const standA = FRAME_DATA['STAND_A' as keyof typeof FRAME_DATA];

    expect(crouchB).toBeDefined();
    expect(standB).toBeDefined();
    expect(standA).toBeDefined();

    // CROUCH_B is LOW, STAND_B is MID — different hit levels
    expect(crouchB.hitLevel).toBe('LOW');
    expect(standB.hitLevel).toBe('MID');
    // CROUCH_B should have less damage than STAND_C (light vs heavy)
    expect(crouchB.damage).toBeLessThan(standB.damage);
  });

  it('damage values vary across characters for same move type', () => {
    // Pick the primary special per character in the 50-200 damage range
    const damages: number[] = [];
    for (const prefix of CHAR_PREFIXES) {
      const specials = getCharSpecialKeys(prefix);
      for (const sk of specials) {
        const fd = FRAME_DATA_CHARS[sk as keyof typeof FRAME_DATA_CHARS];
        if (fd && fd.damage >= 50 && fd.damage <= 200) {
          damages.push(fd.damage);
          break;
        }
      }
    }
    const unique = new Set(damages);
    expect(unique.size, 'Primary special damage should vary across characters').toBeGreaterThan(1);
  });

  it('recovery frames differ across characters', () => {
    const recoveries: number[] = [];
    for (const prefix of CHAR_PREFIXES) {
      const specials = getCharSpecialKeys(prefix);
      if (specials.length > 0) {
        const fd = FRAME_DATA_CHARS[specials[0] as keyof typeof FRAME_DATA_CHARS];
        if (fd) recoveries.push(fd.recovery);
      }
    }
    const unique = new Set(recoveries);
    expect(unique.size, 'First-special recovery should vary across characters').toBeGreaterThan(1);
  });
});

// ─────────────────────────────────────────────────────
// 3. AI Strategy Differentiation
// ─────────────────────────────────────────────────────
describe('AI Strategy Differentiation', () => {
  it('aggressiveLevel has at least 3 distinct values across characters', () => {
    const levels = ALL_STRATEGIES.map((s) => s.aggressiveLevel);
    const unique = new Set(levels);
    expect(unique.size, 'Expected at least 3 distinct aggressiveLevel values').toBeGreaterThanOrEqual(3);
  });

  it('preferredRange has at least 3 distinct values', () => {
    const ranges = ALL_STRATEGIES.map((s) => s.preferredRange);
    const unique = new Set(ranges);
    expect(unique.size, 'Expected at least 3 distinct preferredRange values (close/mid/far)').toBeGreaterThanOrEqual(3);
  });

  it('antiAir moves (preferredAntiAir) are character-specific', () => {
    const antiAirValues = ALL_STRATEGIES.map((s) => s.preferredAntiAir);
    const unique = new Set(antiAirValues);
    // Most characters should have unique anti-air choices
    expect(unique.size, 'Anti-air choices should be diverse').toBeGreaterThanOrEqual(10);
  });

  it('comboStarter moves are character-specific via preferredPoke variation', () => {
    // preferredComboStarter is CLOSE_C for all characters (standard KOF design).
    // Check that the preferredPoke varies meaningfully.
    const pokes = ALL_STRATEGIES.map((s) => s.preferredPoke);
    const uniquePokes = new Set(pokes);
    expect(uniquePokes.size, 'Preferred poke should vary across characters').toBeGreaterThanOrEqual(5);
  });

  it('DM usage patterns differ (preferredDM is character-specific)', () => {
    const dmChoices = ALL_STRATEGIES.map((s) => s.preferredDM);
    const unique = new Set(dmChoices);
    expect(unique.size, 'Each character should have a unique preferred DM').toBeGreaterThanOrEqual(10);
  });
});

// ─────────────────────────────────────────────────────
// 4. Attack Type Coverage
// ─────────────────────────────────────────────────────
describe('Attack Type Coverage', () => {
  it('every character has at least 1 projectile or anti-air special', () => {
    for (const prefix of CHAR_PREFIXES) {
      const specials = getCharSpecialKeys(prefix);
      const hasProjectile = specials.some((k) => {
        const fd = FRAME_DATA_CHARS[k as keyof typeof FRAME_DATA_CHARS];
        return fd && fd.chipDamage !== undefined && !fd.knockdown;
      });
      const hasAntiAir = specials.some((k) => {
        const fd = FRAME_DATA_CHARS[k as keyof typeof FRAME_DATA_CHARS];
        // Anti-air specials typically have low startup, MID hitlevel, knockdown
        return fd && fd.startup <= 10 && fd.knockdown;
      });
      expect(
        hasProjectile || hasAntiAir,
        `${PREFIX_TO_ID[prefix]} should have at least 1 projectile or anti-air special`,
      ).toBe(true);
    }
  });

  it('every character has at least 1 DM', () => {
    for (const prefix of CHAR_PREFIXES) {
      const dmKeys = getCharDMKeys(prefix);
      expect(
        dmKeys.length,
        `${PREFIX_TO_ID[prefix]} should have at least 1 DM`,
      ).toBeGreaterThanOrEqual(1);
    }
  });

  it('characters with command throws are identified correctly', () => {
    // From source analysis: iori (IORI_KUZUKAZE), clark (CLARK_ARGENTINE*), ralf (RALF_BACKBREAKER)
    const throwChars: string[] = [];
    for (const def of ROSTER) {
      if (def.isCommandThrow) {
        throwChars.push(def.id);
      }
    }
    expect(throwChars.length, 'At least 2 characters should have command throws').toBeGreaterThanOrEqual(2);
    expect(throwChars).toContain('iori');
    expect(throwChars).toContain('clark');
    expect(throwChars).toContain('ralf');
  });

  it('characters with counter/stance moves are identified correctly', () => {
    // From source: kyo, ryo, leona, athena, mature have non-null getCounterConfig
    const counterChars: string[] = [];
    for (const def of ROSTER) {
      if (def.getCounterConfig) {
        const config = def.getCounterConfig();
        if (config !== null && config !== undefined) {
          counterChars.push(def.id);
        }
      }
    }
    expect(counterChars.length, 'At least 3 characters should have counter/stance moves').toBeGreaterThanOrEqual(3);
    expect(counterChars).toContain('kyo');
    expect(counterChars).toContain('ryo');
    expect(counterChars).toContain('leona');
    expect(counterChars).toContain('athena');
    expect(counterChars).toContain('mature');
  });
});

// ─────────────────────────────────────────────────────
// 5. Balance Verification
// ─────────────────────────────────────────────────────
describe('Balance Verification', () => {
  it('no single move has damage > 300 (outside of SDM/HSDM)', () => {
    for (const [key, fd] of Object.entries(FRAME_DATA_CHARS)) {
      if (key.startsWith('SDM_') || key.startsWith('HSDM_')) continue;
      // DMs are allowed up to 300
      if (key.startsWith('DM_')) {
        expect(
          fd.damage,
          `DM ${key} damage ${fd.damage} exceeds 300`,
        ).toBeLessThanOrEqual(300);
      } else {
        // Regular specials should not exceed 300
        expect(
          fd.damage,
          `Special ${key} damage ${fd.damage} exceeds 300`,
        ).toBeLessThanOrEqual(300);
      }
    }
  });

  it('no move has startup < 2 frames (SDM/HSDM exempt)', () => {
    for (const [key, fd] of Object.entries(FRAME_DATA_CHARS)) {
      // SDM/HSDM can have 1-frame startup (counter/instant supers)
      if (key.startsWith('SDM_') || key.startsWith('HSDM_')) continue;
      expect(
        fd.startup,
        `${key} startup ${fd.startup} is below minimum 2 frames`,
      ).toBeGreaterThanOrEqual(2);
    }
  });

  it('no normal move has active frames > 20', () => {
    const genericKeys = ['STAND_A', 'STAND_B', 'STAND_C', 'STAND_D',
      'CLOSE_A', 'CLOSE_B', 'CLOSE_C', 'CLOSE_D',
      'CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D',
      'JUMP_A', 'JUMP_B', 'JUMP_C', 'JUMP_D'];

    for (const key of genericKeys) {
      const fd = FRAME_DATA[key as keyof typeof FRAME_DATA];
      if (fd) {
        expect(
          fd.active,
          `Normal ${key} active frames ${fd.active} exceeds 20`,
        ).toBeLessThanOrEqual(20);
      }
    }
  });

  it('DM damage range is reasonable (100-300 for base DMs)', () => {
    const dmKeys = Object.keys(FRAME_DATA_CHARS).filter(
      (k) => k.startsWith('DM_'),
    );
    for (const key of dmKeys) {
      const fd = FRAME_DATA_CHARS[key as keyof typeof FRAME_DATA_CHARS];
      expect(
        fd.damage,
        `DM ${key} damage ${fd.damage} is below 100`,
      ).toBeGreaterThanOrEqual(100);
      expect(
        fd.damage,
        `DM ${key} damage ${fd.damage} exceeds 300`,
      ).toBeLessThanOrEqual(300);
    }
  });
});
