/**
 * characterSpriteConfigs.ts
 *
 * Registers all characters that have real MUGEN sprites.
 * Each entry maps our game's AttackType to MUGEN action numbers.
 * Adding a new character = adding one registerCharacterSprites() call.
 */

import { AttackType } from '../../../core/types.js';
import { registerCharacterSprites, type CharacterSpriteConfig } from './characterSpriteRegistry.js';

// ===== Kyo (cvskyo) — Warusaki3 CVS Kyo action numbers =====
registerCharacterSprites({
  charId: 'kyo',
  mugenDir: 'cvskyo',
  targetDisplayHeight: 106,
  defaultTint: '#ff6600',
  specialMap: {
    // 必殺技
    [AttackType.KYO_ONIYAKI]: '1800',        // 百式・鬼焼き (弱)
    [AttackType.KYO_ONIYAKI_C]: '1810',      // 百式・鬼焼き (強)
    [AttackType.KYO_YAMIBARAI]: '2300',      // 百八式・闇払い (弱)
    [AttackType.KYO_YAMIBARAI_C]: '2300',    // 百八式・闇払い (強, same anim)
    [AttackType.KYO_RED_KICK]: '2200',       // R.E.D.Kick
    [AttackType.KYO_75KAI]: '2100',          // 七拾五式・改
    [AttackType.KYO_75KAI_2]: '2100',
    // 荒咬みチェーン
    [AttackType.KYO_ARAGAMI]: '1000',        // 百拾四式・荒咬み
    [AttackType.KYO_ARAGAMI_KONOKIZU]: '1400', // 外式・砌穿ち
    [AttackType.KYO_ARAGAMI_YANOSABI]: '1300', // 百弐拾七式・八錆
    [AttackType.KYO_NANASE]: '1200',         // 百弐拾五式・七瀬
    [AttackType.KYO_KOTO_TSUKI]: '1100',     // 百弐拾八式・九傷
    [AttackType.KYO_YAKISOGI]: '1400',
    // 毒咬みチェーン
    [AttackType.KYO_DOKUGAMI]: '1500',       // 百拾五式・毒咬み
    [AttackType.KYO_TSUMIYOMI]: '1600',      // 四百壱式・罪詠み
    [AttackType.KYO_BATSUYOMI]: '1700',      // 四百弐式・罰詠み
    // 超必殺技
    [AttackType.DM_OROCHINAGI]: '3000',      // 裏百八式・大蛇薙 DM
    [AttackType.SDM_OROCHINAGI]: '3000',     // 裏百八式・大蛇薙 SDM
    [AttackType.HSDM_OROCHINAGI]: '3020',    // 裏百八式・大蛇薙 MAX2
    // コマンド通常技
    [AttackType.CMD_GOFU_YOU]: '2400',       // 蒼鬼
    [AttackType.CMD_88SHIKI]: '500',         // 八拾八式
    [AttackType.CMD_NARAKU]: '620',          // 外式・奈落落し
    // 通常技
    [AttackType.CLOSE_A]: '200', [AttackType.CLOSE_B]: '230',
    [AttackType.CLOSE_C]: '210', [AttackType.CLOSE_D]: '240',
    [AttackType.STAND_A]: '200', [AttackType.STAND_B]: '231',
    [AttackType.STAND_C]: '211', [AttackType.STAND_D]: '241',
    [AttackType.CROUCH_A]: '400', [AttackType.CROUCH_B]: '430',
    [AttackType.CROUCH_C]: '410', [AttackType.CROUCH_D]: '440',
    [AttackType.JUMP_A]: '600', [AttackType.JUMP_B]: '630',
    [AttackType.JUMP_C]: '610', [AttackType.JUMP_D]: '640',
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
    [AttackType.CLOSE_A]: '200', [AttackType.CLOSE_B]: '230',
    [AttackType.CLOSE_C]: '210', [AttackType.CLOSE_D]: '240',
    [AttackType.STAND_A]: '200', [AttackType.STAND_B]: '231',
    [AttackType.STAND_C]: '211', [AttackType.STAND_D]: '241',
    [AttackType.CROUCH_A]: '400', [AttackType.CROUCH_B]: '430',
    [AttackType.CROUCH_C]: '410', [AttackType.CROUCH_D]: '440',
    [AttackType.JUMP_A]: '600', [AttackType.JUMP_B]: '630',
    [AttackType.JUMP_C]: '610', [AttackType.JUMP_D]: '640',
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
    [AttackType.STAND_A]: '200',
    [AttackType.STAND_B]: '231',
    [AttackType.STAND_C]: '211',
    [AttackType.STAND_D]: '241',
    [AttackType.CROUCH_A]: '400',
    [AttackType.CROUCH_B]: '430',
    [AttackType.CROUCH_C]: '410',
    [AttackType.CROUCH_D]: '440',
    [AttackType.JUMP_A]: '600',
    [AttackType.JUMP_B]: '630',
    [AttackType.JUMP_C]: '610',
    [AttackType.JUMP_D]: '640',
    [AttackType.CLOSE_A]: '200',
    [AttackType.CLOSE_B]: '230',
    [AttackType.CLOSE_C]: '210',
    [AttackType.CLOSE_D]: '240',
    [AttackType.ATHENA_PHOENIX_REFLECT]: '250',
    [AttackType.ATHENA_LOW_B]: '450',
    [AttackType.ATHENA_AIR_B]: '700',
    [AttackType.ATHENA_PSYCHO_BALL]: '1000',
    [AttackType.ATHENA_PSYCHO_BALL_C]: '1010',
    [AttackType.ATHENA_PSYCHO_SWORD]: '1100',
    [AttackType.ATHENA_PSYCHO_SWORD_C]: '1115',
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
    [AttackType.STAND_A]: '200',
    [AttackType.STAND_B]: '231',
    [AttackType.STAND_C]: '211',
    [AttackType.STAND_D]: '241',
    [AttackType.CROUCH_A]: '400',
    [AttackType.CROUCH_B]: '430',
    [AttackType.CROUCH_C]: '410',
    [AttackType.CROUCH_D]: '440',
    [AttackType.JUMP_A]: '600',
    [AttackType.JUMP_B]: '630',
    [AttackType.JUMP_C]: '610',
    [AttackType.JUMP_D]: '640',
    [AttackType.CLOSE_A]: '200',
    [AttackType.CLOSE_B]: '231',
    [AttackType.CLOSE_C]: '211',
    [AttackType.CLOSE_D]: '241',
    [AttackType.TERRY_POWER_WAVE]: '1000',
    [AttackType.TERRY_BURN_KNUCKLE]: '1010',
    [AttackType.TERRY_CRACK_SHOT]: '1020',
    [AttackType.TERRY_POWER_DUNK]: '1100',
    [AttackType.TERRY_RISING_TACKLE]: '1200',
    [AttackType.TERRY_BACK_KNCKLE]: '1300',
    [AttackType.TERRY_COMBO_BLOW]: '1400',
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
    [AttackType.STAND_A]: '200',
    [AttackType.STAND_B]: '231',
    [AttackType.STAND_C]: '210',
    [AttackType.STAND_D]: '240',
    [AttackType.CROUCH_A]: '400',
    [AttackType.CROUCH_B]: '430',
    [AttackType.CROUCH_C]: '410',
    [AttackType.CROUCH_D]: '440',
    [AttackType.JUMP_A]: '600',
    [AttackType.JUMP_B]: '630',
    [AttackType.JUMP_C]: '610',
    [AttackType.JUMP_D]: '640',
    [AttackType.CLOSE_A]: '200',
    [AttackType.CLOSE_B]: '231',
    [AttackType.CLOSE_C]: '210',
    [AttackType.CLOSE_D]: '240',
    [AttackType.KIM_HISHOU_KICK]: '300',
    [AttackType.KIM_HANSEN]: '340',
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
    [AttackType.STAND_A]: '200',
    [AttackType.STAND_B]: '230',
    [AttackType.STAND_C]: '211',
    [AttackType.STAND_D]: '240',
    [AttackType.CROUCH_A]: '400',
    [AttackType.CROUCH_B]: '430',
    [AttackType.CROUCH_C]: '410',
    [AttackType.CROUCH_D]: '440',
    [AttackType.JUMP_A]: '600',
    [AttackType.JUMP_B]: '630',
    [AttackType.JUMP_C]: '610',
    [AttackType.JUMP_D]: '640',
    [AttackType.CLOSE_A]: '200',
    [AttackType.CLOSE_B]: '230',
    [AttackType.CLOSE_C]: '210',
    [AttackType.CLOSE_D]: '240',
    [AttackType.VICE_MONSTROSITY]: '1300',
    [AttackType.VICE_OVERKILL]: '1400',
    [AttackType.VICE_OUTRAGE]: '1000',
    [AttackType.VICE_OUTRAGE_C]: '1005',
    [AttackType.VICE_BLACK_END]: '1100',
    [AttackType.VICE_MAYHEM]: '1200',
    [AttackType.DM_NEGATIVE_GAIN]: '3000',
    [AttackType.SDM_NEGATIVE_GAIN]: '3005',
  },
});

// ===== Yamazaki (cvsyamazaki) =====
registerCharacterSprites({
  charId: 'yamazaki',
  mugenDir: 'cvsyamazaki',
  targetDisplayHeight: 126,
  defaultTint: '#aa4400',
  specialMap: {
    [AttackType.STAND_A]: '200',
    [AttackType.STAND_B]: '230',
    [AttackType.STAND_C]: '211',
    [AttackType.STAND_D]: '240',
    [AttackType.CROUCH_A]: '400',
    [AttackType.CROUCH_B]: '430',
    [AttackType.CROUCH_C]: '410',
    [AttackType.CROUCH_D]: '440',
    [AttackType.JUMP_A]: '600',
    [AttackType.JUMP_B]: '630',
    [AttackType.JUMP_C]: '610',
    [AttackType.JUMP_D]: '640',
    [AttackType.CLOSE_A]: '200',
    [AttackType.CLOSE_B]: '230',
    [AttackType.CLOSE_C]: '210',
    [AttackType.CLOSE_D]: '240',
    [AttackType.YAMAZAKI_SASHI]: '1300',
    [AttackType.YAMAZAKI_BOKKAI]: '1400',
    [AttackType.YAMAZAKI_SNAKE_ARM]: '1000',
    [AttackType.YAMAZAKI_SNAKE_ARM_C]: '1000',
    [AttackType.YAMAZAKI_SANDSTORM]: '1100',
    [AttackType.YAMAZAKI_BAI_GA_SE]: '1200',
    [AttackType.DM_GUILLOTINE]: '3000',
    [AttackType.SDM_GUILLOTINE]: '3011',
  },
});

// ===== Shermie (shermie) =====
registerCharacterSprites({
  charId: 'shermie',
  mugenDir: 'shermie',
  targetDisplayHeight: 109,
  defaultTint: '#ff4488',
  specialMap: {
    [AttackType.STAND_A]: '200',
    [AttackType.STAND_B]: '230',
    [AttackType.STAND_C]: '210',
    [AttackType.STAND_D]: '240',
    [AttackType.CROUCH_A]: '400',
    [AttackType.CROUCH_B]: '430',
    [AttackType.CROUCH_C]: '410',
    [AttackType.CROUCH_D]: '430',
    [AttackType.JUMP_A]: '600',
    [AttackType.JUMP_B]: '630',
    [AttackType.JUMP_C]: '610',
    [AttackType.JUMP_D]: '640',
    [AttackType.CLOSE_A]: '200',
    [AttackType.CLOSE_B]: '230',
    [AttackType.CLOSE_C]: '210',
    [AttackType.CLOSE_D]: '240',
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
    [AttackType.STAND_A]: '200',
    [AttackType.STAND_B]: '230',
    [AttackType.STAND_C]: '211',
    [AttackType.STAND_D]: '240',
    [AttackType.CROUCH_A]: '400',
    [AttackType.CROUCH_B]: '430',
    [AttackType.CROUCH_C]: '410',
    [AttackType.CROUCH_D]: '440',
    [AttackType.JUMP_A]: '600',
    [AttackType.JUMP_B]: '630',
    [AttackType.JUMP_C]: '610',
    [AttackType.JUMP_D]: '640',
    [AttackType.CLOSE_A]: '200',
    [AttackType.CLOSE_B]: '230',
    [AttackType.CLOSE_C]: '210',
    [AttackType.CLOSE_D]: '240',
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
    [AttackType.STAND_A]: '215',
    [AttackType.STAND_B]: '235',
    [AttackType.STAND_C]: '245',
    [AttackType.STAND_D]: '241',
    [AttackType.CROUCH_A]: '400',
    [AttackType.CROUCH_B]: '430',
    [AttackType.CROUCH_C]: '410',
    [AttackType.CROUCH_D]: '440',
    [AttackType.JUMP_A]: '600',
    [AttackType.JUMP_B]: '630',
    [AttackType.JUMP_C]: '610',
    [AttackType.JUMP_D]: '640',
    [AttackType.CLOSE_A]: '200',
    [AttackType.CLOSE_B]: '230',
    [AttackType.CLOSE_C]: '210',
    [AttackType.CLOSE_D]: '240',
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

// ===== Iori (yiori — ihoo1836 KOF 2002 version) =====
registerCharacterSprites({
  charId: 'iori',
  mugenDir: 'yiori',
  targetDisplayHeight: 101,
  defaultTint: '#aa00ff',
  specialMap: {
    [AttackType.STAND_A]: '200',
    [AttackType.STAND_B]: '230',
    [AttackType.STAND_C]: '212',
    [AttackType.STAND_D]: '240',
    [AttackType.CROUCH_A]: '400',
    [AttackType.CROUCH_B]: '430',
    [AttackType.CROUCH_C]: '420',
    [AttackType.CROUCH_D]: '450',
    [AttackType.JUMP_A]: '600',
    [AttackType.JUMP_B]: '630',
    [AttackType.JUMP_C]: '611',
    [AttackType.JUMP_D]: '640',
    [AttackType.CLOSE_A]: '202',
    [AttackType.CLOSE_B]: '225',
    [AttackType.CLOSE_C]: '215',
    [AttackType.CLOSE_D]: '250',
    // Command normals
    [AttackType.IORI_YUMEYUMI]: '300',
    [AttackType.IORI_KATANUGI]: '301',
    [AttackType.IORI_YUKIWARUI]: '620',
    // Specials — 暗払い (Yamibarai)
    [AttackType.IORI_YAMIBARAI]: '1000',
    [AttackType.IORI_YAMIBARAI_C]: '1001',
    // 鬼焼き (Oniyaki)
    [AttackType.IORI_ONIYAKI]: '1030',
    [AttackType.IORI_ONIYAKI_C]: '1032',
    // 葵花 (Aoi Hana) — rekka 3-hit
    [AttackType.IORI_AOIHANA]: '1200',
    [AttackType.IORI_AOIHANA_2]: '1201',
    [AttackType.IORI_AOIHANA_3]: '1202',
    [AttackType.IORI_AOIHANA_C]: '1210',
    [AttackType.IORI_AOIHANA_C_2]: '1211',
    [AttackType.IORI_AOIHANA_C_3]: '1212',
    // 琴月陰 (Kototsuki)
    [AttackType.IORI_KOTOTSUKI]: '1300',
    [AttackType.IORI_KOTOTSUKI_D]: '1301',
    // 屑風 (Kuzukaze)
    [AttackType.IORI_KUZUKAZE]: '1400',
    // DM — 八稚女 (Yaotome)
    [AttackType.DM_YATAGARASU]: '2000',
    [AttackType.SDM_YATAGARASU]: '3000',
    [AttackType.HSDM_YAOTOME]: '3500',
  },
});

// ===== Andy (andy — zzzasd KOF2002 version) =====
registerCharacterSprites({
  charId: 'andy',
  mugenDir: 'andy',
  targetDisplayHeight: 103,
  defaultTint: '#ff9944',
  specialMap: {
    // Normals
    [AttackType.CLOSE_A]: '200', [AttackType.CLOSE_B]: '230',
    [AttackType.CLOSE_C]: '210', [AttackType.CLOSE_D]: '240',
    [AttackType.STAND_A]: '200', [AttackType.STAND_B]: '235',
    [AttackType.STAND_C]: '215', [AttackType.STAND_D]: '245',
    [AttackType.CROUCH_A]: '400', [AttackType.CROUCH_B]: '430',
    [AttackType.CROUCH_C]: '410', [AttackType.CROUCH_D]: '440',
    [AttackType.JUMP_A]: '600', [AttackType.JUMP_B]: '630',
    [AttackType.JUMP_C]: '610', [AttackType.JUMP_D]: '640',
    // Command normals
    [AttackType.ANDY_UWA_AGITO]: '710', [AttackType.ANDY_GEDAN_AGITO]: '715',
    // Specials — 飛翔拳 (Hishou Ken)
    [AttackType.ANDY_HISHOU_KEN]: '1000', [AttackType.ANDY_HISHOU_KEN_C]: '1050',
    // 斬影流星拳 (Zanei Ryusei Ken)
    [AttackType.ANDY_ZANEI_RYUSEI_KEN]: '1300', [AttackType.ANDY_ZANEI_RYUSEI_KEN_D]: '1350',
    // 激飛翔拳 (Geki Hishou Ken)
    [AttackType.ANDY_GEKI_HISHOU_KEN]: '1400',
    // 昇龍弾 (Shouryuu Dan)
    [AttackType.ANDY_SHOURYUU_DAN]: '1100', [AttackType.ANDY_SHOURYUU_DAN_C]: '1150',
    // DM — 超裂破弾 (Chou Reppa Dan)
    [AttackType.DM_CHO_REPPA_DAN]: '3000', [AttackType.SDM_CHO_REPPA_DAN]: '3100',
  },
});

// ===== Clark (clark — zzzasd KOF2002 version) =====
registerCharacterSprites({
  charId: 'clark',
  mugenDir: 'clark',
  targetDisplayHeight: 116,
  defaultTint: '#886622',
  specialMap: {
    // Normals
    [AttackType.CLOSE_A]: '200', [AttackType.CLOSE_B]: '230',
    [AttackType.CLOSE_C]: '210', [AttackType.CLOSE_D]: '240',
    [AttackType.STAND_A]: '200', [AttackType.STAND_B]: '235',
    [AttackType.STAND_C]: '215', [AttackType.STAND_D]: '245',
    [AttackType.CROUCH_A]: '400', [AttackType.CROUCH_B]: '430',
    [AttackType.CROUCH_C]: '410', [AttackType.CROUCH_D]: '440',
    [AttackType.JUMP_A]: '600', [AttackType.JUMP_B]: '630',
    [AttackType.JUMP_C]: '610', [AttackType.JUMP_D]: '640',
    // Command normals
    [AttackType.CLARK_DEATH_LAKE]: '750', [AttackType.CLARK_STOMP]: '750',
    // Specials — Super Argentine Backbreaker
    [AttackType.CLARK_ARGENTINE]: '1000', [AttackType.CLARK_ARGENTINE_C]: '1010',
    // Flash Elbow
    [AttackType.CLARK_FLASH_ELBOW]: '1100',
    // Vulcan Punch
    [AttackType.CLARK_VULCAN]: '1200',
    // DM — Ultra Argentine Backbreaker
    [AttackType.DM_ARGENTINE_DM]: '3000', [AttackType.SDM_ARGENTINE_DM]: '3100',
  },
});

// ===== K' (kdash — Trinity MUGEN KOF2002 version) =====
registerCharacterSprites({
  charId: 'kdash',
  mugenDir: 'kdash',
  targetDisplayHeight: 108,
  defaultTint: '#cc3300',
  specialMap: {
    // Normals — standing
    [AttackType.CLOSE_A]: '205', [AttackType.CLOSE_B]: '300',
    [AttackType.CLOSE_C]: '215', [AttackType.CLOSE_D]: '310',
    [AttackType.STAND_A]: '200', [AttackType.STAND_B]: '300',
    [AttackType.STAND_C]: '210', [AttackType.STAND_D]: '310',
    // Normals — crouching
    [AttackType.CROUCH_A]: '400', [AttackType.CROUCH_B]: '500',
    [AttackType.CROUCH_C]: '405', [AttackType.CROUCH_D]: '505',
    // Normals — jumping
    [AttackType.JUMP_A]: '600', [AttackType.JUMP_B]: '700',
    [AttackType.JUMP_C]: '610', [AttackType.JUMP_D]: '710',
    // Command normals
    [AttackType.KDASH_ONE_INCH]: '300',     // →+B One Inch (overhead)
    [AttackType.KDASH_TRIGGER]: '500',      // ↘+D Trigger Shot (low)
    // Specials — Eins Trigger (アイントリガー)
    [AttackType.KDASH_EINS]: '1001',        // ↓↘→+A (weak)
    [AttackType.KDASH_EINS_C]: '1010',      // ↓↘→+C (strong)
    // Crow Bites (クロウバイツ)
    [AttackType.KDASH_CROW]: '1030',        // →↓↘+A (weak upper)
    [AttackType.KDASH_CROW_C]: '1035',      // →↓↘+C (strong upper)
    // Minute Spike (ミニットスパイク)
    [AttackType.KDASH_MINUTE]: '1200',      // ←↙↓+K (overhead)
    [AttackType.KDASH_NARROW]: '1300',      // ↓↘→+K (low followup)
    // DM — Chain Shot (チェーンシェイド)
    [AttackType.DM_CHAIN_SHOT]: '3002',     // DM
    [AttackType.SDM_CHAIN_SHOT]: '3200',    // SDM
  },
});

// ===== Mai (mai — M_Mai02UM KOF2002 version) =====
registerCharacterSprites({
  charId: 'mai',
  mugenDir: 'mai',
  targetDisplayHeight: 96,
  defaultTint: '#ff4466',
  specialMap: {
    // Normals
    [AttackType.CLOSE_A]: '200', [AttackType.CLOSE_B]: '230',
    [AttackType.CLOSE_C]: '210', [AttackType.CLOSE_D]: '240',
    [AttackType.STAND_A]: '200', [AttackType.STAND_B]: '230',
    [AttackType.STAND_C]: '210', [AttackType.STAND_D]: '240',
    [AttackType.CROUCH_A]: '400', [AttackType.CROUCH_B]: '430',
    [AttackType.CROUCH_C]: '410', [AttackType.CROUCH_D]: '440',
    [AttackType.JUMP_A]: '600', [AttackType.JUMP_B]: '630',
    [AttackType.JUMP_C]: '610', [AttackType.JUMP_D]: '640',
    // Command normals
    [AttackType.MAI_HISSATSU_SHINOBIBACHI]: '710', [AttackType.MAI_YUSURA_UMA]: '740',
    // Specials — 花蝶扇 (Kachousen)
    [AttackType.MAI_KA_CHO_SEN]: '1000', [AttackType.MAI_KA_CHO_SEN_C]: '1050',
    // 飛翔龍炎陣 (Hishou Ryu En Jin)
    [AttackType.MAI_HISHO_RYU_EN_JIN]: '1300',
    // 龍炎舞 (Ryu En Bu)
    [AttackType.MAI_RYU_EN_BU]: '1100',
    // DM — 蜂巢落とし (Haka Otoshi)
    [AttackType.DM_HAKA_OTOSHI]: '3000', [AttackType.SDM_HAKA_OTOSHI]: '3050',
  },
});
