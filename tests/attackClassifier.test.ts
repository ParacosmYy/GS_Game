import { describe, it, expect } from 'vitest';
import {
  isDM,
  isSpecialOrDM,
  isCharacterSpecial,
  classify,
  AttackCategory,
} from '../src/core/attackClassifier.js';
import {
  NORMAL_ATTACKS,
  COMMAND_NORMALS,
  LIGHT_NORMALS,
} from '../src/core/constants.js';

// ══════════════════════════════════════════════════════════
// 1. NORMAL_ATTACKS — 通常技全部正确分类
// ══════════════════════════════════════════════════════════
describe('NORMAL_ATTACKS (通常技)', () => {
  it('all NORMAL_ATTACKS members are classified as NORMAL', () => {
    for (const name of NORMAL_ATTACKS) {
      expect(classify(name)).toBe(AttackCategory.NORMAL);
    }
  });

  it('all NORMAL_ATTACKS members are NOT DM', () => {
    for (const name of NORMAL_ATTACKS) {
      expect(isDM(name)).toBe(false);
    }
  });

  it('all NORMAL_ATTACKS members are NOT special', () => {
    for (const name of NORMAL_ATTACKS) {
      expect(isSpecialOrDM(name)).toBe(false);
    }
  });

  it('all grounded LIGHT_NORMALS are subset of NORMAL_ATTACKS', () => {
    for (const name of LIGHT_NORMALS) {
      // JUMP_A/JUMP_B are aerial, not in NORMAL_ATTACKS (grounded only)
      if (name.startsWith('JUMP_')) continue;
      expect(NORMAL_ATTACKS.has(name)).toBe(true);
    }
  });

  it('all LIGHT_NORMALS are classified as NORMAL', () => {
    for (const name of LIGHT_NORMALS) {
      expect(classify(name), `${name} should be NORMAL`).toBe(AttackCategory.NORMAL);
    }
  });
});

// ══════════════════════════════════════════════════════════
// 2. COMMAND_NORMALS — 指令通常技全部正确分类
// ══════════════════════════════════════════════════════════
describe('COMMAND_NORMALS (指令通常技)', () => {
  it('all COMMAND_NORMALS members are classified as COMMAND', () => {
    for (const name of COMMAND_NORMALS) {
      expect(classify(name)).toBe(AttackCategory.COMMAND);
    }
  });

  it('all COMMAND_NORMALS members are NOT DM', () => {
    for (const name of COMMAND_NORMALS) {
      expect(isDM(name)).toBe(false);
    }
  });

  it('all COMMAND_NORMALS members are NOT special', () => {
    for (const name of COMMAND_NORMALS) {
      expect(isSpecialOrDM(name)).toBe(false);
    }
  });

  // Key test: character-prefixed command normals like IORI_YUMEYUMI
  // must NOT be misclassified as SPECIAL
  it('character-prefixed command normals are COMMAND, not SPECIAL', () => {
    const characterCmdNormals = [
      'IORI_YUMEYUMI', 'IORI_KATANUGI', 'IORI_YUKIWARUI',
      'TERRY_BACK_KNCKLE', 'TERRY_COMBO_BLOW',
      'KIM_HISHOU_KICK', 'KIM_HANSEN',
      'RYO_TSURIZAO', 'RYO_ORISHI',
      'MATURE_DESPAIR', 'MATURE_JAB',
      'MARY_HAMMER_PUNCH', 'MARY_DOUBLE_ROLLING',
      'VICE_MONSTROSITY', 'VICE_OVERKILL',
      'YAMAZAKI_SASHI', 'YAMAZAKI_BOKKAI',
      'KASUMI_KOU_U', 'KASUMI_GESHIKI',
      'CLARK_DEATH_LAKE', 'CLARK_STOMP',
    ];
    for (const name of characterCmdNormals) {
      expect(classify(name), `${name} should be COMMAND`).toBe(AttackCategory.COMMAND);
      expect(isCharacterSpecial(name), `${name} should not be character special`).toBe(false);
    }
  });
});

// ══════════════════════════════════════════════════════════
// 3. DM / SDM / HSDM — 超必杀技
// ══════════════════════════════════════════════════════════
describe('DM / SDM / HSDM (超必杀技)', () => {
  const dmNames = [
    'DM_OROCHINAGI', 'DM_YATAGARASU', 'DM_POWER_GEYSER',
    'DM_HIGH_ANGLE_GEYSER', 'DM_PHOENIX_KICK', 'DM_PHOENIX_HITEN',
    'DM_TEN_HA_OU', 'DM_V_SLASHER', 'DM_CHAIN_SHOT',
    'DM_FREEZE', 'DM_RYU_KO_RYU', 'DM_HAOU_SHOKOU',
    'DM_HAKA_OTOSHI', 'DM_SHINING_CRYSTAL_BIT', 'DM_ARGENTINE_DM',
    'DM_GALACTICA_PHANTOM', 'DM_SCREW_UPPER', 'DM_CHO_REPPA_DAN',
    'DM_KAEN_SENPU_JIN', 'DM_TEKKYUU_DAI_BOUSOU',
    'DM_NOCTURNAL_LIGHT', 'DM_NEGATIVE_GAIN',
    'DM_ARMAGEDDON_BUSTERS', 'DM_CHAIN_SLIDE_TOUCH',
    'DM_SHERMIE_CARNIVAL', 'DM_MARY_TYPHOON',
    'DM_CHO_KA_RINGA', 'DM_GUILLOTINE', 'DM_CHO_MUKIGENZAN',
    // Extra DM variants from frame data
    'DM_182SHIKI_A', 'DM_182SHIKI_C',
    'DM_ANOTHER_BLOOD', 'DM_CHAIN_DRIVE', 'DM_CHOU_HISSATSU',
    'DM_GORE_FEST', 'DM_HEAT_DRIVE', 'DM_MAIDEN_MASHER_A',
    'DM_MISS_HEAD', 'DM_OVERKILL_DM', 'DM_PHOENIX_FANG_ARROW',
    'DM_REBEL_SPARK', 'DM_RYUKO_RANBU',
    'DM_SHERMIE_FLASH', 'DM_TERRITORY_BUST',
  ];

  it('all DM_ names are classified as DM', () => {
    for (const name of dmNames) {
      expect(classify(name), `${name} should be DM`).toBe(AttackCategory.DM);
      expect(isDM(name), `${name} should pass isDM()`).toBe(true);
    }
  });

  const sdmNames = [
    'SDM_OROCHINAGI', 'SDM_YATAGARASU', 'SDM_POWER_GEYSER',
    'SDM_PHOENIX_KICK', 'SDM_TEN_HA_OU', 'SDM_V_SLASHER',
    'SDM_CHAIN_SHOT', 'SDM_FREEZE', 'SDM_RYU_KO_RYU',
    'SDM_HAOU_SHOKOU', 'SDM_HAKA_OTOSHI', 'SDM_SHINING_CRYSTAL_BIT',
    'SDM_ARGENTINE_DM', 'SDM_GALACTICA_PHANTOM', 'SDM_SCREW_UPPER',
    'SDM_CHO_REPPA_DAN', 'SDM_KAEN_SENPU_JIN', 'SDM_TEKKYUU_DAI_BOUSOU',
    'SDM_NOCTURNAL_LIGHT', 'SDM_NEGATIVE_GAIN',
    'SDM_ARMAGEDDON_BUSTERS', 'SDM_CHAIN_SLIDE_TOUCH',
    'SDM_SHERMIE_CARNIVAL', 'SDM_MARY_TYPHOON',
    'SDM_CHO_KA_RINGA', 'SDM_GUILLOTINE', 'SDM_CHO_MUKIGENZAN',
    // Extra SDM variants
    'SDM_ANOTHER_BLOOD', 'SDM_CHAIN_DRIVE', 'SDM_CHOU_HISSATSU',
    'SDM_GORE_FEST', 'SDM_HEAT_DRIVE', 'SDM_MAIDEN_MASHER',
    'SDM_PHOENIX_FANG_ARROW', 'SDM_REBEL_SPARK',
    'SDM_RYUKO_RANBU', 'SDM_SHERMIE_FLASH',
    'SDM_TRIPLE_GEYSER',
  ];

  it('all SDM_ names are classified as DM', () => {
    for (const name of sdmNames) {
      expect(classify(name), `${name} should be DM`).toBe(AttackCategory.DM);
      expect(isDM(name), `${name} should pass isDM()`).toBe(true);
    }
  });

  it('HSDM_ names are classified as DM', () => {
    expect(classify('HSDM_YAOTOME')).toBe(AttackCategory.DM);
    expect(isDM('HSDM_YAOTOME')).toBe(true);
  });

  it('isDM returns false for non-DM attacks', () => {
    expect(isDM('STAND_A')).toBe(false);
    expect(isDM('KYO_ONIYAKI')).toBe(false);
    expect(isDM('SPECIAL_UPPER')).toBe(false);
    expect(isDM('THROW')).toBe(false);
    expect(isDM('IORI_YUMEYUMI')).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════
// 4. Character specials — 角色专属必杀技
// ══════════════════════════════════════════════════════════
describe('Character specials (角色必杀技)', () => {
  it('Kyo specials are classified as SPECIAL', () => {
    const kyoSpecials = [
      'KYO_75KAI', 'KYO_75KAI_2', 'KYO_ONIYAKI', 'KYO_ONIYAKI_C',
      'KYO_YAMIBARAI', 'KYO_YAMIBARAI_C', 'KYO_RED_KICK', 'KYO_RED_KICK_D',
      'KYO_ARAGAMI', 'KYO_ARAGAMI_KONOKIZU', 'KYO_ARAGAMI_YANOSABI',
      'KYO_NANASE', 'KYO_KOTO_TSUKI', 'KYO_DOKUGAMI', 'KYO_TSUMIYOMI',
    ];
    for (const name of kyoSpecials) {
      expect(classify(name), `${name} should be SPECIAL`).toBe(AttackCategory.SPECIAL);
      expect(isCharacterSpecial(name), `${name} should be character special`).toBe(true);
    }
  });

  it('Iori specials are classified as SPECIAL', () => {
    const ioriSpecials = [
      'IORI_AOIHANA', 'IORI_AOIHANA_2', 'IORI_AOIHANA_3',
      'IORI_YAMIBARAI', 'IORI_YAMIBARAI_C',
      'IORI_ONIYAKI', 'IORI_ONIYAKI_C',
      'IORI_KOTOTSUKI', 'IORI_KUZUKAZE',
    ];
    for (const name of ioriSpecials) {
      expect(classify(name), `${name} should be SPECIAL`).toBe(AttackCategory.SPECIAL);
      expect(isCharacterSpecial(name), `${name} should be character special`).toBe(true);
    }
  });

  it('Terry specials are classified as SPECIAL', () => {
    const terrySpecials = [
      'TERRY_POWER_WAVE', 'TERRY_BURN_KNUCKLE', 'TERRY_CRACK_SHOT',
      'TERRY_POWER_DUNK', 'TERRY_RISING_TACKLE',
    ];
    for (const name of terrySpecials) {
      expect(classify(name), `${name} should be SPECIAL`).toBe(AttackCategory.SPECIAL);
    }
  });

  it('multi-character specials are all classified as SPECIAL', () => {
    const specials = [
      'KIM_HIENZAN', 'KIM_HANGETSU', 'KIM_HAKI', 'KIM_HISHOU', 'KIM_SANREN',
      'RYO_KOOU', 'RYO_KOOU_C', 'RYO_KO_HOU', 'RYO_KO_HOU_C', 'RYO_HIEN', 'RYO_HAOU',
      'LEONA_MOON_SLASH', 'LEONA_EAR_RING', 'LEONA_GRAND_SABER', 'LEONA_BALTIC',
      'MAI_KA_CHO_SEN', 'MAI_KA_CHO_SEN_C', 'MAI_HISHO_RYU_EN_JIN', 'MAI_RYU_EN_BU',
      'ROBERT_RYU_GEKI', 'ROBERT_RYU_ZAN', 'ROBERT_HIEN_RYU_JIN',
      'KDASH_EINS', 'KDASH_CROW', 'KDASH_MINUTE', 'KDASH_NARROW',
      'KULA_BREATH', 'KULA_SHELL', 'KULA_LAY', 'KULA_EDGE',
      'ATHENA_PSYCHO_BALL', 'ATHENA_PSYCHO_SWORD', 'ATHENA_PHOENIX_ARROW',
      'CLARK_ARGENTINE', 'CLARK_VULCAN', 'CLARK_FLASH_ELBOW',
      'RALF_VULCAN', 'RALF_BACKBREAKER', 'RALF_KICK',
      'JOE_HURRICANE', 'JOE_TIGER_KICK', 'JOE_BAKURETSUKEN', 'JOE_OUGON_KAKATO',
      'ANDY_HISHOU_KEN', 'ANDY_SHOURYUU_DAN', 'ANDY_ZANEI_RYUSEI_KEN',
      'BILLY_SANSETSU_KON', 'BILLY_SENPU_KON', 'BILLY_HIEN_ZAN',
      'CHANG_TEKKYUU_KAITEN', 'CHANG_TEKKYUU_FASSHU', 'CHANG_TEKKYUU_HIEN_ZAN',
      'CHOI_HISHOU_KYAKU', 'CHOI_KAITEN_HIEN_ZAN', 'CHOI_HOUYOKU_TENSHIN',
      'MATURE_MASSACRE', 'MATURE_HEAVENS_GATE', 'MATURE_ECSTASY',
      'VICE_OUTRAGE', 'VICE_BLACK_END', 'VICE_MAYHEM',
      'YASHIRO_UPPER_DU', 'YASHIRO_NIRAAI', 'YASHIRO_MUSATSU',
      'CHRIS_SHOT_WEAVE', 'CHRIS_TWISTER_DRIVE', 'CHRIS_SCRAMBLE_DASH',
      'SHERMIE_SHOOT', 'SHERMIE_CARNIVAL', 'SHERMIE_AXLE_SPIN',
      'MARY_STRAIGHT_SLICER', 'MARY_BACKDROP_REAL', 'MARY_SPIDER',
      'XIANGFEI_NANPA', 'XIANGFEI_TENPATSU', 'XIANGFEI_MAHO_HISHA',
      'YAMAZAKI_SNAKE_ARM', 'YAMAZAKI_SANDSTORM', 'YAMAZAKI_BAI_GA_SE',
      'KASUMI_KOOU_KEN', 'KASUMI_KASANE_ATE', 'KASUMI_MUKIGENZAN',
    ];
    for (const name of specials) {
      expect(classify(name), `${name} should be SPECIAL`).toBe(AttackCategory.SPECIAL);
      expect(isCharacterSpecial(name), `${name} should be character special`).toBe(true);
    }
  });

  it('SPECIAL_ prefix attacks are classified as SPECIAL', () => {
    expect(classify('SPECIAL_PROJECTILE')).toBe(AttackCategory.SPECIAL);
    expect(classify('SPECIAL_UPPER')).toBe(AttackCategory.SPECIAL);
    expect(isSpecialOrDM('SPECIAL_PROJECTILE')).toBe(true);
  });
});

// ══════════════════════════════════════════════════════════
// 5. Throws — 投技
// ══════════════════════════════════════════════════════════
describe('Throws (投技)', () => {
  it('THROW variants are classified as THROW', () => {
    expect(classify('THROW')).toBe(AttackCategory.THROW);
    expect(classify('THROW_FORWARD')).toBe(AttackCategory.THROW);
    expect(classify('THROW_BACK')).toBe(AttackCategory.THROW);
  });

  it('throws are not special, not DM, not normal', () => {
    expect(isDM('THROW')).toBe(false);
    expect(isSpecialOrDM('THROW')).toBe(false);
    expect(classify('THROW')).not.toBe(AttackCategory.NORMAL);
    expect(classify('THROW')).not.toBe(AttackCategory.SPECIAL);
  });
});

// ══════════════════════════════════════════════════════════
// 6. Blowback — CD攻击
// ══════════════════════════════════════════════════════════
describe('Blowback (CD攻击)', () => {
  it('CD attacks are classified as BLOWBACK', () => {
    expect(classify('STAND_CD')).toBe(AttackCategory.BLOWBACK);
    expect(classify('JUMP_CD')).toBe(AttackCategory.BLOWBACK);
  });

  it('CD attacks are not special, not DM, not normal', () => {
    expect(isDM('STAND_CD')).toBe(false);
    expect(isSpecialOrDM('STAND_CD')).toBe(false);
    expect(classify('STAND_CD')).not.toBe(AttackCategory.NORMAL);
  });
});

// ══════════════════════════════════════════════════════════
// 7. Edge cases and unknowns — 边界情况
// ══════════════════════════════════════════════════════════
describe('Edge cases (边界)', () => {
  it('unknown attack type defaults to OTHER or falls through naming conventions', () => {
    // Empty string or lowercase names have no matching prefix
    expect(classify('')).toBe(AttackCategory.OTHER);
    expect(classify('lowercase_name')).toBe(AttackCategory.OTHER);
    // Names with known normal prefixes that aren't in any set still classify by prefix
    expect(classify('STAND_Z')).toBe(AttackCategory.NORMAL); // prefix-based
    // Unknown uppercase prefix (e.g. UNKNOWN_) is treated as character special by convention
    expect(classify('UNKNOWN_ATTACK')).toBe(AttackCategory.SPECIAL); // naming convention
  });

  it('CMD_ prefix without explicit COMMAND_NORMALS entry is still COMMAND', () => {
    // classify should treat any CMD_ prefix as COMMAND
    expect(classify('CMD_FUTURE_ATTACK')).toBe(AttackCategory.COMMAND);
  });

  it('isCharacterSpecial returns false for empty string', () => {
    expect(isCharacterSpecial('')).toBe(false);
  });

  it('isCharacterSpecial returns false for non-prefixed names', () => {
    expect(isCharacterSpecial('STAND_A')).toBe(false);
    expect(isCharacterSpecial('THROW')).toBe(false);
    expect(isCharacterSpecial('SPECIAL_PROJECTILE')).toBe(false);
  });

  it('isSpecialOrDM covers SPECIAL_, character specials, and DM', () => {
    expect(isSpecialOrDM('SPECIAL_UPPER')).toBe(true);
    expect(isSpecialOrDM('KYO_ONIYAKI')).toBe(true);
    expect(isSpecialOrDM('DM_OROCHINAGI')).toBe(true);
    expect(isSpecialOrDM('SDM_OROCHINAGI')).toBe(true);
    expect(isSpecialOrDM('HSDM_YAOTOME')).toBe(true);
  });

  it('isSpecialOrDM returns false for normals, commands, throws', () => {
    expect(isSpecialOrDM('STAND_A')).toBe(false);
    expect(isSpecialOrDM('CROUCH_D')).toBe(false);
    expect(isSpecialOrDM('IORI_YUMEYUMI')).toBe(false);
    expect(isSpecialOrDM('THROW')).toBe(false);
    expect(isSpecialOrDM('STAND_CD')).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════
// 8. Cross-validation: COMMAND_NORMALS vs character specials
// ══════════════════════════════════════════════════════════
describe('COMMAND_NORMALS vs character specials isolation', () => {
  it('no COMMAND_NORMALS entry is also a character special', () => {
    for (const name of COMMAND_NORMALS) {
      expect(isCharacterSpecial(name), `${name} should not be character special`).toBe(false);
    }
  });

  it('no COMMAND_NORMALS entry passes isSpecialOrDM', () => {
    for (const name of COMMAND_NORMALS) {
      expect(isSpecialOrDM(name), `${name} should not be special or DM`).toBe(false);
    }
  });

  it('character specials with same prefix as command normals are correctly separated', () => {
    // Iori: command normal vs special
    expect(classify('IORI_YUMEYUMI')).toBe(AttackCategory.COMMAND);
    expect(classify('IORI_AOIHANA')).toBe(AttackCategory.SPECIAL);
    // Mature: command normal vs special
    expect(classify('MATURE_DESPAIR')).toBe(AttackCategory.COMMAND);
    expect(classify('MATURE_MASSACRE')).toBe(AttackCategory.SPECIAL);
    // Vice: command normal vs special
    expect(classify('VICE_MONSTROSITY')).toBe(AttackCategory.COMMAND);
    expect(classify('VICE_OUTRAGE')).toBe(AttackCategory.SPECIAL);
    // Mary: command normal vs special
    expect(classify('MARY_HAMMER_PUNCH')).toBe(AttackCategory.COMMAND);
    expect(classify('MARY_STRAIGHT_SLICER')).toBe(AttackCategory.SPECIAL);
  });
});

// ══════════════════════════════════════════════════════════
// 9. Completeness: every key in FRAME_DATA is classifiable
// ══════════════════════════════════════════════════════════
describe('Completeness (所有帧数据条目都可分类)', () => {
  it('all known attack types produce a valid category', () => {
    const allAttacks = [
      // Normals
      'STAND_A', 'STAND_B', 'STAND_C', 'STAND_D',
      'CLOSE_A', 'CLOSE_B', 'CLOSE_C', 'CLOSE_D',
      'CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D',
      'JUMP_A', 'JUMP_B', 'JUMP_C', 'JUMP_D',
      // Throws
      'THROW', 'THROW_FORWARD', 'THROW_BACK',
      // Blowback
      'STAND_CD', 'JUMP_CD',
      // Generic specials
      'SPECIAL_PROJECTILE', 'SPECIAL_UPPER',
      // Kyo specials
      'KYO_75KAI', 'KYO_ONIYAKI', 'KYO_YAMIBARAI', 'KYO_ARAGAMI',
      // Iori specials
      'IORI_AOIHANA', 'IORI_YAMIBARAI', 'IORI_ONIYAKI', 'IORI_KOTOTSUKI', 'IORI_KUZUKAZE',
      // DMs
      'DM_OROCHINAGI', 'DM_YATAGARASU', 'DM_POWER_GEYSER',
      // SDMs
      'SDM_OROCHINAGI', 'SDM_YATAGARASU', 'SDM_POWER_GEYSER',
      // HSDM
      'HSDM_YAOTOME',
    ];
    for (const name of allAttacks) {
      const cat = classify(name);
      expect(Object.values(AttackCategory)).toContain(cat);
      expect(cat).not.toBe(AttackCategory.OTHER);
    }
  });
});
