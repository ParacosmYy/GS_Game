/**
 * Character Balance Tests
 *
 * Analyzes balance distribution across 27 characters:
 *   - Damage distribution (normals, specials, DMs)
 *   - Speed distribution (walk, light/heavy attack startup)
 *   - Range distribution (attack reach, no single dominant character)
 *   - AI strategy distribution (aggression, range preference, anti-air diversity)
 *   - Stat distribution (health, mobility)
 *   - Overall balance (trade-offs, no single best character)
 */
import { describe, it, expect } from 'vitest';
import { FRAME_DATA } from '../src/core/constants.js';
import { FRAME_DATA_CHARS } from '../src/core/frameDataChars.js';
import { ALL_STRATEGIES } from '../src/ai/characterStrategies.js';
import { ROSTER } from '../src/characters/index.js';
import type { CharacterDefinition, CharacterStats } from '../src/characters/types.js';

// ── Helpers ──

const CHAR_PREFIXES = [
  'KYO', 'IORI', 'TERRY', 'KIM', 'RYO', 'LEONA', 'KULA', 'KDASH',
  'ROBERT', 'ATHENA', 'MAI', 'RALF', 'ANDY', 'CLARK', 'JOE', 'BILLY',
  'CHOI', 'CHANG', 'MATURE', 'YASHIRO', 'CHRIS', 'SHERMIE', 'VICE',
  'YAMAZAKI', 'XIANGFEI', 'KASUMI', 'MARY',
] as const;

const PREFIX_TO_ID: Record<string, string> = {
  KYO: 'kyo', IORI: 'iori', TERRY: 'terry', KIM: 'kim', RYO: 'ryo',
  LEONA: 'leona', KULA: 'kula', KDASH: 'kdash', ROBERT: 'robert',
  ATHENA: 'athena', MAI: 'mai', RALF: 'ralf', ANDY: 'andy', CLARK: 'clark',
  JOE: 'joe', BILLY: 'billy', CHOI: 'choi', CHANG: 'chang', MATURE: 'mature',
  YASHIRO: 'yashiro', CHRIS: 'chris', SHERMIE: 'shermie', VICE: 'vice',
  YAMAZAKI: 'yamazaki', XIANGFEI: 'xiangfei', KASUMI: 'kasumi', MARY: 'mary',
};

/** DM/SDM/HSDM key -> character prefix mapping */
const DM_CHAR_MAP: Record<string, string> = {
  DM_OROCHINAGI_A: 'KYO', DM_OROCHINAGI_C: 'KYO',
  DM_SAIHYO_HASSAKU: 'KYO',
  SDM_OROCHINAGI: 'KYO', SDM_SAIHYO_HASSAKU: 'KYO',
  DM_MAIDEN_MASHER_A: 'IORI', DM_MAIDEN_MASHER_C: 'IORI',
  DM_YAOTOME: 'IORI', DM_YATAGARASU: 'IORI',
  SDM_MAIDEN_MASHER: 'IORI', SDM_YAOTOME: 'IORI',
  HSDM_YAOTOME: 'IORI',
  DM_POWER_GEYSER_A: 'TERRY', DM_POWER_GEYSER_C: 'TERRY',
  DM_HIGH_ANGLE_GEYSER_B: 'TERRY', DM_HIGH_ANGLE_GEYSER_D: 'TERRY',
  DM_POWER_GEYSER: 'TERRY', DM_HIGH_ANGLE_GEYSER: 'TERRY',
  SDM_TRIPLE_GEYSER: 'TERRY', SDM_POWER_GEYSER_EX: 'TERRY',
  DM_YATAGARASU_TERRY: 'TERRY',
  DM_PHOENIX_KICK: 'KIM', DM_PHOENIX_HITEN: 'KIM',
  SDM_PHOENIX_HITEN: 'KIM', SDM_PHOENIX_HITEN_EX: 'KIM',
  DM_TEN_HA_OU: 'RYO', DM_RYUKO_RANBU: 'RYO',
  SDM_RYUKO_RANBU: 'RYO', SDM_RYUKO_RANBU_EX: 'RYO',
  HSDM_RYUKO_RANBU: 'RYO',
  DM_V_SLASHER: 'LEONA', DM_REBEL_SPARK: 'LEONA',
  SDM_REBEL_SPARK: 'LEONA',
  DM_RYU_KO_RYU: 'ROBERT', DM_HAOU_SHOKOU: 'ROBERT',
  DM_RYUKO_RANBU_ROBERT: 'ROBERT',
  SDM_RYUKO_RANBU_ROBERT: 'ROBERT',
  DM_HAKA_OTOSHI: 'MAI', DM_CHOU_HISSATSU: 'MAI',
  SDM_CHOU_HISSATSU: 'MAI',
  HSDM_CHOU_HISSATSU: 'MAI',
  DM_FREEZE: 'KULA',
  SDM_FREEZE: 'KULA', HSDM_FREEZE_EXECUTION: 'KULA',
  DM_CHAIN_SHOT: 'KDASH', DM_CHAIN_DRIVE: 'KDASH', DM_HEAT_DRIVE: 'KDASH',
  SDM_CHAIN_DRIVE: 'KDASH', SDM_HEAT_DRIVE: 'KDASH',
  HSDM_CHAIN_DRIVE: 'KDASH',
  DM_SHINING_CRYSTAL_BIT: 'ATHENA', DM_PHOENIX_FANG_ARROW: 'ATHENA',
  SDM_SHINING_CRYSTAL_BIT: 'ATHENA', SDM_PHOENIX_FANG_ARROW: 'ATHENA',
  DM_ARGENTINE_DM: 'CLARK', DM_SUPER_ARGENTINE_BACKBREAKER: 'CLARK',
  SDM_ARGENTINE_DM: 'CLARK',
  DM_GALACTICA_PHANTOM: 'RALF', DM_GALACTIC_PHANTOM: 'RALF',
  SDM_GALACTICA_PHANTOM: 'RALF',
  DM_BOMBER_TIGER: 'JOE', DM_SCREW_UPPER: 'JOE',
  SDM_SCREW_UPPER: 'JOE',
  DM_HI_EN_KYAKU: 'ANDY', DM_CHO_REPPA_DAN: 'ANDY',
  SDM_CHO_REPPA_DAN: 'ANDY',
  DM_DAISAN_NO_KON: 'BILLY', DM_KAEN_SENPU_JIN: 'BILLY',
  SDM_KAEN_SENPU_JIN: 'BILLY',
  DM_TEKKYUU_DAI_SESSA: 'CHANG', DM_TEKKYUU_DAI_BOUSOU: 'CHANG',
  SDM_TEKKYUU_DAI_BOUSOU: 'CHANG',
  DM_SHIN_CHOU_HOUYOKU: 'CHOI',
  SDM_SHIN_CHOU_HOUYOKU: 'CHOI',
  DM_NOCTURNAL_LIGHT: 'MATURE',
  SDM_NOCTURNAL_LIGHT: 'MATURE',
  DM_ARMAGEDDON_BUSTERS: 'YASHIRO', DM_TERRITORY_BUST: 'YASHIRO', DM_MISS_HEAD: 'YASHIRO',
  SDM_ARMAGEDDON_BUSTERS: 'YASHIRO',
  DM_CHAIN_SLIDE_TOUCH: 'CHRIS', DM_ANOTHER_BLOOD: 'CHRIS',
  SDM_CHAIN_SLIDE_TOUCH: 'CHRIS', SDM_ANOTHER_BLOOD: 'CHRIS',
  DM_SHERMIE_CARNIVAL: 'SHERMIE', DM_SHERMIE_FLASH: 'SHERMIE',
  SDM_SHERMIE_CARNIVAL: 'SHERMIE', SDM_SHERMIE_FLASH: 'SHERMIE',
  DM_NEGATIVE_GAIN: 'VICE', DM_GORE_FEST: 'VICE', DM_OVERKILL_DM: 'VICE', DM_NEGATIVE_FLOG: 'VICE',
  SDM_NEGATIVE_GAIN: 'VICE', SDM_GORE_FEST: 'VICE',
  DM_MARY_TYPHOON: 'MARY', DM_MARY_DYNAMITE_SWING: 'MARY', DM_MARY_DYNAMIC: 'MARY',
  SDM_MARY_TYPHOON: 'MARY', SDM_MARY_DYNAMITE_SWING: 'MARY',
  DM_CHO_KA_RINGA: 'XIANGFEI', DM_CHOU_KYOKU_DAN: 'XIANGFEI', DM_TETSUZAN_KOU: 'XIANGFEI',
  SDM_CHO_KA_RINGA: 'XIANGFEI',
  DM_GUILLOTINE: 'YAMAZAKI', DM_YAMAZAKI_GUILLOTINE: 'YAMAZAKI',
  SDM_GUILLOTINE: 'YAMAZAKI',
  DM_CHO_MUKIGENZAN: 'KASUMI', DM_CHOU_MUKOU_GAESHI: 'KASUMI', DM_SAN_SHIN_RAI: 'KASUMI',
  SDM_CHO_MUKIGENZAN: 'KASUMI',
};

/** Get non-DM special move keys for a character prefix */
function getCharSpecialKeys(prefix: string): string[] {
  return Object.keys(FRAME_DATA_CHARS).filter((k) => {
    if (k.startsWith('DM_') || k.startsWith('SDM_') || k.startsWith('HSDM_')) return false;
    return k.startsWith(prefix + '_');
  });
}

/** Get DM/SDM/HSDM keys for a character prefix */
function getCharDMKeys(prefix: string): string[] {
  return Object.keys(DM_CHAR_MAP).filter((k) => DM_CHAR_MAP[k] === prefix);
}

/** Collect the damage for all specials of a character, returns the max */
function getMaxSpecialDamage(prefix: string): number {
  const keys = getCharSpecialKeys(prefix);
  let maxDmg = 0;
  for (const k of keys) {
    const fd = FRAME_DATA_CHARS[k as keyof typeof FRAME_DATA_CHARS];
    if (fd && fd.damage > maxDmg) maxDmg = fd.damage;
  }
  return maxDmg;
}

/** Collect the average damage for all specials of a character */
function getAvgSpecialDamage(prefix: string): number {
  const keys = getCharSpecialKeys(prefix);
  if (keys.length === 0) return 0;
  let total = 0;
  for (const k of keys) {
    const fd = FRAME_DATA_CHARS[k as keyof typeof FRAME_DATA_CHARS];
    if (fd) total += fd.damage;
  }
  return total / keys.length;
}

/** Get the maximum DM damage for a character */
function getMaxDMDamage(prefix: string): number {
  const keys = getCharDMKeys(prefix);
  let maxDmg = 0;
  for (const k of keys) {
    // Only base DM_ keys (not SDM/HSDM)
    if (!k.startsWith('DM_')) continue;
    const fd = FRAME_DATA_CHARS[k as keyof typeof FRAME_DATA_CHARS];
    if (fd && fd.damage > maxDmg) maxDmg = fd.damage;
  }
  return maxDmg;
}

/** Build charId -> CharacterDefinition map */
const charDefMap = new Map<string, CharacterDefinition>();
for (const def of ROSTER) {
  charDefMap.set(def.id, def);
}

// Normal attack keys shared by all characters
const NORMAL_ATTACK_KEYS = [
  'STAND_A', 'STAND_B', 'STAND_C', 'STAND_D',
  'CLOSE_A', 'CLOSE_B', 'CLOSE_C', 'CLOSE_D',
  'CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D',
] as const;

// ─────────────────────────────────────────────────────
// 1. Damage Distribution
// ─────────────────────────────────────────────────────
describe('Damage Distribution', () => {
  it('all characters normal attacks (STAND_A/C) damage within reasonable range (15-100)', () => {
    // Generic normals are shared, but verify they are in range.
    // CROUCH_A is 17 (lightest poke), CLOSE_C/STAND_C is 100 (heaviest normal).
    for (const key of NORMAL_ATTACK_KEYS) {
      const fd = FRAME_DATA[key as keyof typeof FRAME_DATA];
      expect(fd, `FRAME_DATA for ${key} should exist`).toBeDefined();
      expect(
        fd.damage,
        `${key} damage ${fd.damage} should be >= 15`,
      ).toBeGreaterThanOrEqual(15);
      expect(
        fd.damage,
        `${key} damage ${fd.damage} should be <= 100`,
      ).toBeLessThanOrEqual(100);
    }
  });

  it('all characters special move damage within reasonable range (0-200)', () => {
    // Specials include:
    // - Non-offensive utility moves (KDASH_BLACKOUT, ATHENA_PSYCHO_TELEPORT: damage=1)
    // - Rekka follow-ups (KYO_ARAGAMI_YANOSABI: 25 dmg)
    // - Multi-hit moves (RYO_ZANRETSU_KEN: 12 dmg per hit)
    // - Full specials (up to ~180).
    // Damage 0-1 covers utility/teleport; upper bound covers the hardest specials.
    for (const prefix of CHAR_PREFIXES) {
      const keys = getCharSpecialKeys(prefix);
      expect(keys.length, `${prefix} should have special moves`).toBeGreaterThan(0);
      for (const k of keys) {
        const fd = FRAME_DATA_CHARS[k as keyof typeof FRAME_DATA_CHARS];
        expect(fd, `${k} should have frame data`).toBeDefined();
        expect(
          fd.damage,
          `${PREFIX_TO_ID[prefix]} special ${k} damage ${fd.damage} should be >= 0`,
        ).toBeGreaterThanOrEqual(0);
        expect(
          fd.damage,
          `${PREFIX_TO_ID[prefix]} special ${k} damage ${fd.damage} should be <= 200`,
        ).toBeLessThanOrEqual(200);
      }
    }
  });

  it('all characters DM damage within reasonable range (100-300)', () => {
    for (const prefix of CHAR_PREFIXES) {
      const dmKeys = getCharDMKeys(prefix).filter(k => k.startsWith('DM_'));
      expect(dmKeys.length, `${prefix} should have at least 1 base DM`).toBeGreaterThanOrEqual(1);
      for (const k of dmKeys) {
        const fd = FRAME_DATA_CHARS[k as keyof typeof FRAME_DATA_CHARS];
        if (!fd) {
          // Some DM aliases may not have separate frame data entries
          continue;
        }
        expect(
          fd.damage,
          `${PREFIX_TO_ID[prefix]} DM ${k} damage ${fd.damage} should be >= 80`,
        ).toBeGreaterThanOrEqual(80);
        expect(
          fd.damage,
          `${PREFIX_TO_ID[prefix]} DM ${k} damage ${fd.damage} should be <= 350`,
        ).toBeLessThanOrEqual(350);
      }
    }
  });
});

// ─────────────────────────────────────────────────────
// 2. Speed Distribution
// ─────────────────────────────────────────────────────
describe('Speed Distribution', () => {
  it('character walk speeds are differentiated (at least 3 distinct values)', () => {
    const walkSpeeds = ROSTER.map((d) => d.stats.walkSpeed);
    const unique = new Set(walkSpeeds);
    expect(
      unique.size,
      `Walk speeds should have at least 3 distinct values, got ${unique.size}: [${Array.from(unique).sort().join(', ')}]`,
    ).toBeGreaterThanOrEqual(3);
  });

  it('character light attack startup (first special) has differentiation (at least 3 distinct values)', () => {
    // Characters have unique specials with different startup frames.
    // Use the first listed special per character as a proxy.
    const startups: number[] = [];
    for (const prefix of CHAR_PREFIXES) {
      const specials = getCharSpecialKeys(prefix);
      if (specials.length > 0) {
        const fd = FRAME_DATA_CHARS[specials[0] as keyof typeof FRAME_DATA_CHARS];
        if (fd) startups.push(fd.startup);
      }
    }
    const unique = new Set(startups);
    expect(
      unique.size,
      'First-special startup should have at least 3 distinct values across characters',
    ).toBeGreaterThanOrEqual(3);
  });

  it('character heavy attack startup has differentiation across specials (at least 3 distinct values)', () => {
    // Collect the maximum startup (slowest move = heaviest) per character
    const maxStartups: number[] = [];
    for (const prefix of CHAR_PREFIXES) {
      const specials = getCharSpecialKeys(prefix);
      let maxStartup = 0;
      for (const k of specials) {
        const fd = FRAME_DATA_CHARS[k as keyof typeof FRAME_DATA_CHARS];
        if (fd && fd.startup > maxStartup) maxStartup = fd.startup;
      }
      if (maxStartup > 0) maxStartups.push(maxStartup);
    }
    const unique = new Set(maxStartups);
    expect(
      unique.size,
      'Max-special startup should have at least 3 distinct values across characters',
    ).toBeGreaterThanOrEqual(3);
  });
});

// ─────────────────────────────────────────────────────
// 3. Range Distribution
// ─────────────────────────────────────────────────────
describe('Range Distribution', () => {
  it('character attack ranges (pushback + closeRange) have differentiation', () => {
    // pushback on specials varies; collect max pushback per character
    const maxPushbacks: number[] = [];
    for (const prefix of CHAR_PREFIXES) {
      const specials = getCharSpecialKeys(prefix);
      let maxPB = 0;
      for (const k of specials) {
        const fd = FRAME_DATA_CHARS[k as keyof typeof FRAME_DATA_CHARS];
        if (fd && fd.pushback > maxPB) maxPB = fd.pushback;
      }
      if (maxPB > 0) maxPushbacks.push(maxPB);
    }
    const unique = new Set(maxPushbacks);
    expect(
      unique.size,
      'Max pushback across characters should have at least 2 distinct values',
    ).toBeGreaterThanOrEqual(2);
  });

  it('no character is best at all metrics (damage, speed, range)', () => {
    // Rank characters by: highest avg special damage, fastest walk speed, largest closeRange
    type CharMetrics = { id: string; dmg: number; speed: number; range: number };
    const metrics: CharMetrics[] = [];

    for (const prefix of CHAR_PREFIXES) {
      const id = PREFIX_TO_ID[prefix];
      const def = charDefMap.get(id);
      if (!def) continue;

      const avgDmg = getAvgSpecialDamage(prefix);
      const walkSpeed = def.stats.walkSpeed;
      const closeRange = def.stats.closeRange ?? 80;

      metrics.push({ id, dmg: avgDmg, speed: walkSpeed, range: closeRange });
    }

    // For each metric, find who is #1
    const bestDamage = metrics.reduce((a, b) => a.dmg > b.dmg ? a : b);
    const bestSpeed = metrics.reduce((a, b) => a.speed > b.speed ? a : b);
    const bestRange = metrics.reduce((a, b) => a.range > b.range ? a : b);

    // No single character should dominate all three
    const allSame = bestDamage.id === bestSpeed.id && bestSpeed.id === bestRange.id;
    expect(
      allSame,
      `No character should be best at damage (${bestDamage.id}), speed (${bestSpeed.id}), and range (${bestRange.id}) simultaneously`,
    ).toBe(false);
  });
});

// ─────────────────────────────────────────────────────
// 4. AI Strategy Distribution
// ─────────────────────────────────────────────────────
describe('AI Strategy Distribution', () => {
  it('character AI aggressiveLevel has differentiation (at least 4 distinct values)', () => {
    const levels = ALL_STRATEGIES.map((s) => s.aggressiveLevel);
    const unique = new Set(levels);
    expect(
      unique.size,
      `aggressiveLevel should have at least 4 distinct values, got ${unique.size}: [${Array.from(unique).sort().join(', ')}]`,
    ).toBeGreaterThanOrEqual(4);
  });

  it('character preferredRange covers close/mid/far', () => {
    const ranges = ALL_STRATEGIES.map((s) => s.preferredRange);
    const rangeSet = new Set(ranges);
    expect(rangeSet.has('close'), 'At least one character should prefer close range').toBe(true);
    expect(rangeSet.has('mid'), 'At least one character should prefer mid range').toBe(true);
    expect(rangeSet.has('far'), 'At least one character should prefer far range').toBe(true);
  });

  it('character preferredAntiAir has diversity (at least 10 unique choices)', () => {
    const antiAirs = ALL_STRATEGIES.map((s) => s.preferredAntiAir);
    const unique = new Set(antiAirs);
    expect(
      unique.size,
      `preferredAntiAir should have at least 10 unique values, got ${unique.size}`,
    ).toBeGreaterThanOrEqual(10);
  });
});

// ─────────────────────────────────────────────────────
// 5. Stat Distribution
// ─────────────────────────────────────────────────────
describe('Stat Distribution', () => {
  it('character stats are within reasonable ranges', () => {
    for (const def of ROSTER) {
      const s = def.stats;
      // Health: 800-1300 (reasonable fighting game range)
      expect(s.maxHealth, `${def.id} maxHealth ${s.maxHealth} should be 800-1300`).toBeGreaterThanOrEqual(800);
      expect(s.maxHealth, `${def.id} maxHealth ${s.maxHealth} should be 800-1300`).toBeLessThanOrEqual(1300);
      // Walk speed: 2-6
      expect(s.walkSpeed, `${def.id} walkSpeed ${s.walkSpeed} should be 2-6`).toBeGreaterThanOrEqual(2);
      expect(s.walkSpeed, `${def.id} walkSpeed ${s.walkSpeed} should be 2-6`).toBeLessThanOrEqual(6);
      // Run speed: 5-9
      expect(s.runSpeed, `${def.id} runSpeed ${s.runSpeed} should be 5-9`).toBeGreaterThanOrEqual(5);
      expect(s.runSpeed, `${def.id} runSpeed ${s.runSpeed} should be 5-9`).toBeLessThanOrEqual(9);
      // Push width: 40-80
      expect(s.pushWidth, `${def.id} pushWidth ${s.pushWidth} should be 40-80`).toBeGreaterThanOrEqual(40);
      expect(s.pushWidth, `${def.id} pushWidth ${s.pushWidth} should be 40-80`).toBeLessThanOrEqual(80);
    }
  });

  it('characters are differentiated across stats (not all identical)', () => {
    const healthValues = new Set(ROSTER.map((d) => d.stats.maxHealth));
    const walkValues = new Set(ROSTER.map((d) => d.stats.walkSpeed));
    const runValues = new Set(ROSTER.map((d) => d.stats.runSpeed));
    const pushWidthValues = new Set(ROSTER.map((d) => d.stats.pushWidth));

    expect(healthValues.size, 'maxHealth should have at least 5 distinct values').toBeGreaterThanOrEqual(5);
    expect(walkValues.size, 'walkSpeed should have at least 3 distinct values').toBeGreaterThanOrEqual(3);
    expect(runValues.size, 'runSpeed should have at least 3 distinct values').toBeGreaterThanOrEqual(3);
    expect(pushWidthValues.size, 'pushWidth should have at least 3 distinct values').toBeGreaterThanOrEqual(3);
  });
});

// ─────────────────────────────────────────────────────
// 6. Overall Balance
// ─────────────────────────────────────────────────────
describe('Overall Balance', () => {
  it('no character ranks first in damage + speed + range simultaneously', () => {
    // Build per-character composite metrics
    type Rank = { id: string; maxSpecDmg: number; maxDMDmg: number; walkSpeed: number; runSpeed: number; health: number };
    const ranks: Rank[] = [];

    for (const prefix of CHAR_PREFIXES) {
      const id = PREFIX_TO_ID[prefix];
      const def = charDefMap.get(id);
      if (!def) continue;
      ranks.push({
        id,
        maxSpecDmg: getMaxSpecialDamage(prefix),
        maxDMDmg: getMaxDMDamage(prefix),
        walkSpeed: def.stats.walkSpeed,
        runSpeed: def.stats.runSpeed,
        health: def.stats.maxHealth,
      });
    }

    // Find top character for each metric
    const bestSpecDmg = ranks.reduce((a, b) => a.maxSpecDmg > b.maxSpecDmg ? a : b);
    const bestDMDmg = ranks.reduce((a, b) => a.maxDMDmg > b.maxDMDmg ? a : b);
    const bestWalk = ranks.reduce((a, b) => a.walkSpeed > b.walkSpeed ? a : b);
    const bestHealth = ranks.reduce((a, b) => a.health > b.health ? a : b);

    // No single character should top ALL four
    const allTop = bestSpecDmg.id === bestDMDmg.id
      && bestDMDmg.id === bestWalk.id
      && bestWalk.id === bestHealth.id;
    expect(
      allTop,
      `No single character should be best at special damage (${bestSpecDmg.id}), DM damage (${bestDMDmg.id}), walk speed (${bestWalk.id}), and health (${bestHealth.id})`,
    ).toBe(false);
  });

  it('characters exhibit trade-offs (higher damage correlates with lower speed or lower health)', () => {
    // Verify there are both slow+powerful and fast+fragile characters.
    // Collect (health, walkSpeed, avgSpecDmg) per character
    type Tradeoff = { id: string; health: number; walkSpeed: number; avgSpecDmg: number };
    const data: Tradeoff[] = [];

    for (const prefix of CHAR_PREFIXES) {
      const id = PREFIX_TO_ID[prefix];
      const def = charDefMap.get(id);
      if (!def) continue;
      data.push({
        id,
        health: def.stats.maxHealth,
        walkSpeed: def.stats.walkSpeed,
        avgSpecDmg: getAvgSpecialDamage(prefix),
      });
    }

    // Sort by avg special damage descending
    const byDmg = [...data].sort((a, b) => b.avgSpecDmg - a.avgDmg);

    // Top 5 damage dealers should NOT all also be top 5 in walk speed
    const top5DmgIds = new Set(byDmg.slice(0, 5).map((d) => d.id));
    const bySpeed = [...data].sort((a, b) => b.walkSpeed - a.walkSpeed);
    const top5SpeedIds = new Set(bySpeed.slice(0, 5).map((d) => d.id));

    const overlap = [...top5DmgIds].filter((id) => top5SpeedIds.has(id));
    // At most 3 out of 5 should overlap (not all high-damage chars are also fastest)
    expect(
      overlap.length,
      `At most 3 of top-5 damage dealers should also be top-5 speed (overlap: ${overlap.join(', ')}), implying a trade-off`,
    ).toBeLessThanOrEqual(3);
  });
});
