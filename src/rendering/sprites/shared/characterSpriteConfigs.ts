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
  targetDisplayHeight: 96,
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
  targetDisplayHeight: 96,
  defaultTint: '#ff66cc',
  specialMap: {
    [AttackType.DM_SHINING_CRYSTAL_BIT]: '3000',
    [AttackType.SDM_SHINING_CRYSTAL_BIT]: '3010',
  },
});

// ===== Terry (cvsterry) =====
registerCharacterSprites({
  charId: 'terry',
  mugenDir: 'cvsterry',
  targetDisplayHeight: 96,
  defaultTint: '#ffcc00',
  specialMap: {
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
  targetDisplayHeight: 96,
  defaultTint: '#44aaff',
  specialMap: {
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
  targetDisplayHeight: 96,
  defaultTint: '#cc44ff',
  specialMap: {
    [AttackType.DM_NEGATIVE_GAIN]: '3000',
    [AttackType.SDM_NEGATIVE_GAIN]: '3010',
  },
});

// ===== Yamazaki (cvsyamazaki) =====
registerCharacterSprites({
  charId: 'yamazaki',
  mugenDir: 'cvsyamazaki',
  targetDisplayHeight: 96,
  defaultTint: '#aa4400',
  specialMap: {
    [AttackType.DM_GUILLOTINE]: '3000',
    [AttackType.SDM_GUILLOTINE]: '3010',
  },
});

// ===== Shermie (shermie) =====
registerCharacterSprites({
  charId: 'shermie',
  mugenDir: 'shermie',
  targetDisplayHeight: 96,
  defaultTint: '#ff4488',
  specialMap: {
    [AttackType.DM_SHERMIE_CARNIVAL]: '3000',
    [AttackType.SDM_SHERMIE_CARNIVAL]: '3010',
  },
});

// ===== Benimaru (cvsbenimaru) =====
registerCharacterSprites({
  charId: 'benimaru',
  mugenDir: 'cvsbenimaru',
  targetDisplayHeight: 96,
  defaultTint: '#ffff44',
  specialMap: {},
});

// ===== Chun-Li (cvschunli) =====
registerCharacterSprites({
  charId: 'chunli',
  mugenDir: 'cvschunli',
  targetDisplayHeight: 96,
  defaultTint: '#4488ff',
  specialMap: {},
});

// ===== Geese (cvsgeese) =====
registerCharacterSprites({
  charId: 'geese',
  mugenDir: 'cvsgeese',
  targetDisplayHeight: 96,
  defaultTint: '#2244aa',
  specialMap: {},
});

// ===== Gouki (cvsgouki) =====
registerCharacterSprites({
  charId: 'gouki',
  mugenDir: 'cvsgouki',
  targetDisplayHeight: 96,
  defaultTint: '#880044',
  specialMap: {},
});

// ===== Rock (cvsrock) =====
registerCharacterSprites({
  charId: 'rock',
  mugenDir: 'cvsrock',
  targetDisplayHeight: 96,
  defaultTint: '#6688cc',
  specialMap: {},
});

// ===== King (cvsking) =====
registerCharacterSprites({
  charId: 'king',
  mugenDir: 'cvsking',
  targetDisplayHeight: 96,
  defaultTint: '#88ccff',
  specialMap: {},
});

// ===== Rugal (cvsrugal) =====
registerCharacterSprites({
  charId: 'rugal',
  mugenDir: 'cvsrugal',
  targetDisplayHeight: 96,
  defaultTint: '#880022',
  specialMap: {},
});

// ===== Omega Rugal (cvsg_rugal) =====
registerCharacterSprites({
  charId: 'g_rugal',
  mugenDir: 'cvsg_rugal',
  targetDisplayHeight: 96,
  defaultTint: '#cc0022',
  specialMap: {},
});

// ===== Heidern (heidern) =====
registerCharacterSprites({
  charId: 'heidern',
  mugenDir: 'heidern',
  targetDisplayHeight: 96,
  defaultTint: '#336633',
  specialMap: {},
});
