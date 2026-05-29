/**
 * characterSpriteConfigs.ts
 *
 * Registers all characters that have real MUGEN sprites.
 * Each entry maps our game's AttackType to MUGEN action numbers.
 * Adding a new character = adding one registerCharacterSprites() call.
 */

import { AttackType } from '../../../core/types.js';
import { registerCharacterSprites, type CharacterSpriteConfig } from './characterSpriteRegistry.js';

// ===== Kyo (cvskyo) =====
registerCharacterSprites({
  charId: 'kyo',
  mugenDir: 'cvskyo',
  targetDisplayHeight: 106,
  defaultTint: '#ff6600',
  specialMap: {
    [AttackType.KYO_ONIYAKI]: '1000',
    [AttackType.KYO_ONIYAKI_C]: '1010',
    [AttackType.KYO_YAMIBARAI]: '1100',
    [AttackType.KYO_YAMIBARAI_C]: '1100',
    [AttackType.KYO_RED_KICK]: '1300',
    [AttackType.KYO_75KAI]: '1200',
    [AttackType.KYO_75KAI_2]: '1200',
    [AttackType.KYO_ARAGAMI]: '1400',
    [AttackType.KYO_ARAGAMI_KONOKIZU]: '1400',
    [AttackType.KYO_ARAGAMI_YANOSABI]: '1400',
    [AttackType.KYO_NANASE]: '1400',
    [AttackType.KYO_KOTO_TSUKI]: '1400',
    [AttackType.KYO_YAKISOGI]: '1400',
    [AttackType.KYO_DOKUGAMI]: '1500',
    [AttackType.KYO_TSUMIYOMI]: '1500',
    [AttackType.KYO_BATSUYOMI]: '1500',
    [AttackType.DM_OROCHINAGI]: '2000',
    [AttackType.SDM_OROCHINAGI]: '2010',
    [AttackType.HSDM_OROCHINAGI]: '2020',
    [AttackType.CMD_GOFU_YOU]: '2400',
    [AttackType.CMD_88SHIKI]: '1700',
    [AttackType.CMD_NARAKU]: '620',
    [AttackType.STAND_B]: '231',
    [AttackType.STAND_D]: '241',
  },
});

// ===== Ryo (cvsryo) =====
registerCharacterSprites({
  charId: 'ryo',
  mugenDir: 'cvsryo',
  targetDisplayHeight: 107,
  defaultTint: '#ff8844',
  specialMap: {
    [AttackType.RYO_KOOU]: '1000',
    [AttackType.RYO_KOOU_C]: '1010',
    [AttackType.RYO_KOOUKEN_D]: '1020',
    [AttackType.RYO_KO_HOU]: '1100',
    [AttackType.RYO_KO_HOU_C]: '1110',
    [AttackType.RYO_HIEN]: '1200',
    [AttackType.RYO_HAOU]: '1300',
    [AttackType.RYO_HIO_HACKER]: '1400',
    [AttackType.RYO_ZANRETSU_KEN]: '1500',
    [AttackType.RYO_TSURIZAO]: '170',
    [AttackType.RYO_ORISHI]: '1300',
    [AttackType.DM_RYUKO_RANBU]: '3000',
    [AttackType.SDM_RYUKO_RANBU]: '3010',
    [AttackType.HSDM_RYUKO_RANBU]: '3020',
    [AttackType.DM_TEN_HA_OU]: '3100',
    [AttackType.SDM_TEN_HA_OU]: '3100',
  },
});

// ===== Athena (cvsathena) =====
registerCharacterSprites({
  charId: 'athena',
  mugenDir: 'cvsathena',
  targetDisplayHeight: 89,
  defaultTint: '#ff66cc',
  specialMap: {
    [AttackType.ATHENA_PSYCHO_BALL]: '1000',
    [AttackType.ATHENA_PSYCHO_BALL_C]: '1010',
    [AttackType.ATHENA_PSYCHO_SWORD]: '1100',
    [AttackType.ATHENA_PSYCHO_SWORD_C]: '1110',
    [AttackType.ATHENA_PHOENIX_ARROW]: '1200',
    [AttackType.DM_SHINING_CRYSTAL_BIT]: '3000',
    [AttackType.SDM_SHINING_CRYSTAL_BIT]: '3010',
  },
});

// ===== Terry (cvsterry) =====
registerCharacterSprites({
  charId: 'terry',
  mugenDir: 'cvsterry',
  targetDisplayHeight: 101,
  defaultTint: '#ffcc00',
  specialMap: {
    [AttackType.TERRY_POWER_WAVE]: '1000',
    [AttackType.TERRY_BURN_KNUCKLE]: '1010',
    [AttackType.TERRY_CRACK_SHOT]: '1020',
    [AttackType.TERRY_POWER_DUNK]: '1100',
    [AttackType.TERRY_RISING_TACKLE]: '1200',
    [AttackType.DM_POWER_GEYSER]: '3000',
    [AttackType.SDM_POWER_GEYSER]: '3010',
    [AttackType.DM_HIGH_ANGLE_GEYSER]: '3100',
    [AttackType.SDM_HIGH_ANGLE_GEYSER]: '3100',
  },
});

// ===== Kim (cvskim) =====
registerCharacterSprites({
  charId: 'kim',
  mugenDir: 'cvskim',
  targetDisplayHeight: 113,
  defaultTint: '#44aaff',
  specialMap: {
    [AttackType.KIM_HIENZAN]: '1000',
    [AttackType.KIM_HANGETSU]: '1011',
    [AttackType.KIM_HAKI]: '1021',
    [AttackType.KIM_HISHOU]: '1100',
    [AttackType.KIM_SANREN]: '1200',
    [AttackType.DM_PHOENIX_KICK]: '3000',
    [AttackType.SDM_PHOENIX_KICK]: '3010',
    [AttackType.DM_PHOENIX_HITEN]: '3100',
    [AttackType.SDM_PHOENIX_HITEN]: '3100',
  },
});

// ===== Vice (cvsvice) =====
registerCharacterSprites({
  charId: 'vice',
  mugenDir: 'cvsvice',
  targetDisplayHeight: 104,
  defaultTint: '#cc44ff',
  specialMap: {
    [AttackType.VICE_OUTRAGE]: '1000',
    [AttackType.VICE_OUTRAGE_C]: '1010',
    [AttackType.VICE_BLACK_END]: '1100',
    [AttackType.VICE_MAYHEM]: '1200',
    [AttackType.DM_NEGATIVE_GAIN]: '3000',
    [AttackType.SDM_NEGATIVE_GAIN]: '3010',
  },
});

// ===== Yamazaki (cvsyamazaki) =====
registerCharacterSprites({
  charId: 'yamazaki',
  mugenDir: 'cvsyamazaki',
  targetDisplayHeight: 126,
  defaultTint: '#aa4400',
  specialMap: {
    [AttackType.YAMAZAKI_SNAKE_ARM]: '1000',
    [AttackType.YAMAZAKI_SNAKE_ARM_C]: '1001',
    [AttackType.YAMAZAKI_SANDSTORM]: '1100',
    [AttackType.YAMAZAKI_BAI_GA_SE]: '1200',
    [AttackType.DM_GUILLOTINE]: '3000',
    [AttackType.SDM_GUILLOTINE]: '3010',
  },
});

// ===== Shermie (shermie) =====
registerCharacterSprites({
  charId: 'shermie',
  mugenDir: 'shermie',
  targetDisplayHeight: 109,
  defaultTint: '#ff4488',
  specialMap: {
    [AttackType.SHERMIE_SHOOT]: '1000',
    [AttackType.SHERMIE_SHOOT_C]: '1010',
    [AttackType.SHERMIE_CARNIVAL]: '1100',
    [AttackType.SHERMIE_AXLE_SPIN]: '1200',
    [AttackType.DM_SHERMIE_CARNIVAL]: '3000',
    [AttackType.SDM_SHERMIE_CARNIVAL]: '3010',
  },
});

// ===== Benimaru (cvsbenimaru) =====
registerCharacterSprites({
  charId: 'benimaru',
  mugenDir: 'cvsbenimaru',
  targetDisplayHeight: 118,
  defaultTint: '#ffff44',
  specialMap: {
    [AttackType.BENIMARU_JACKKNIFE_KICK]: '300',
    [AttackType.BENIMARU_RAIJINKEN]: '1000',
    [AttackType.BENIMARU_RAIJINKEN_C]: '1010',
    [AttackType.BENIMARU_IAI_GERI]: '1200',
    [AttackType.BENIMARU_IAI_GERI_D]: '1210',
    [AttackType.BENIMARU_HANDOU_SANDAN_GERI]: '1220',
    [AttackType.BENIMARU_SHINKUU_KATATEGOMA]: '1100',
    [AttackType.BENIMARU_SHINKUU_KATATEGOMA_C]: '1110',
    [AttackType.BENIMARU_SUPER_INAZUMA_KICK]: '1150',
    [AttackType.BENIMARU_SUPER_INAZUMA_KICK_D]: '1160',
    [AttackType.BENIMARU_COLLIDER]: '1400',
    [AttackType.DM_BENIMARU_RAIKOUKEN]: '3000',
    [AttackType.DM_GENEI_HURRICANE]: '3100',
    [AttackType.SDM_BENIMARU_RAIKOUKEN]: '3200',
  },
});

// ===== Chun-Li (cvschunli) =====
registerCharacterSprites({
  charId: 'chunli',
  mugenDir: 'cvschunli',
  targetDisplayHeight: 97,
  defaultTint: '#4488ff',
  specialMap: {},
});

// ===== Geese (cvsgeese) =====
registerCharacterSprites({
  charId: 'geese',
  mugenDir: 'cvsgeese',
  targetDisplayHeight: 117,
  defaultTint: '#2244aa',
  specialMap: {},
});

// ===== Gouki (cvsgouki) =====
registerCharacterSprites({
  charId: 'gouki',
  mugenDir: 'cvsgouki',
  targetDisplayHeight: 115,
  defaultTint: '#880044',
  specialMap: {},
});

// ===== Rock (cvsrock) =====
registerCharacterSprites({
  charId: 'rock',
  mugenDir: 'cvsrock',
  targetDisplayHeight: 107,
  defaultTint: '#6688cc',
  specialMap: {},
});

// ===== King (cvsking) =====
registerCharacterSprites({
  charId: 'king',
  mugenDir: 'cvsking',
  targetDisplayHeight: 108,
  defaultTint: '#88ccff',
  specialMap: {},
});

// ===== Rugal (cvsrugal) =====
registerCharacterSprites({
  charId: 'rugal',
  mugenDir: 'cvsrugal',
  targetDisplayHeight: 130,
  defaultTint: '#880022',
  specialMap: {},
});

// ===== Omega Rugal (cvsg_rugal) =====
registerCharacterSprites({
  charId: 'g_rugal',
  mugenDir: 'cvsg_rugal',
  targetDisplayHeight: 131,
  defaultTint: '#cc0022',
  specialMap: {},
});

// ===== Heidern (heidern) =====
registerCharacterSprites({
  charId: 'heidern',
  mugenDir: 'heidern',
  targetDisplayHeight: 110,
  defaultTint: '#336633',
  specialMap: {
    [AttackType.HEIDERN_CROSS_CUTTER]: '1000',
    [AttackType.HEIDERN_MOON_SLASHER]: '1100',
    [AttackType.HEIDERN_NECK_ROLLER]: '1200',
    [AttackType.HEIDERN_STORMBRINGER]: '1300',
    [AttackType.HEIDERN_KILLING_BRINGER]: '1400',
    [AttackType.HEIDERN_LEIDER_REITTER]: '1500',
    [AttackType.DM_CRITICAL_DRIVER]: '3000',
    [AttackType.DM_HEIDERN_END]: '3100',
    [AttackType.SDM_HEIDERN_END]: '3200',
    [AttackType.HSDM_HEIDERN_END]: '3300',
  },
});

// ===== Yuri (cvsyuri) =====
registerCharacterSprites({
  charId: 'yuri',
  mugenDir: 'cvsyuri',
  targetDisplayHeight: 100,
  defaultTint: '#ff6699',
  specialMap: {
    [AttackType.STAND_A]: '200',
    [AttackType.STAND_B]: '210',
    [AttackType.STAND_C]: '220',
    [AttackType.STAND_D]: '230',
    [AttackType.CROUCH_A]: '400',
    [AttackType.CROUCH_B]: '410',
    [AttackType.CROUCH_C]: '420',
    [AttackType.CROUCH_D]: '430',
    [AttackType.JUMP_A]: '600',
    [AttackType.JUMP_B]: '610',
    [AttackType.JUMP_C]: '620',
    [AttackType.JUMP_D]: '630',
    [AttackType.CLOSE_A]: '201',
    [AttackType.CLOSE_B]: '211',
    [AttackType.CLOSE_C]: '221',
    [AttackType.CLOSE_D]: '231',
    [AttackType.YURI_UPPER_BLOCK]: '300',
    [AttackType.YURI_KO_OU_KEN]: '1000',
    [AttackType.YURI_HAOH_SHO_KO_KEN]: '1100',
    [AttackType.YURI_CHOU_UPPER]: '1200',
    [AttackType.YURI_HIEN_HOU_OU_KYAKU]: '1300',
    [AttackType.YURI_HISHOU_KUURETSU_ZAN]: '1400',
    [AttackType.YURI_HYAKU_RETSU_BINTA]: '850',
    [AttackType.DM_YURI_HAOH_SHO_KO_KEN]: '3000',
    [AttackType.DM_YURI_HIEN_HOU_OU_KYAKU]: '3200',
    [AttackType.SDM_YURI_HAOH_SHO_KO_KEN]: '3100',
    [AttackType.HSDM_YURI_HISHOU_KUURETSU_ZAN]: '3300',
  },
});
