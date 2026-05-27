/**
 * Frame Data — startup/active/recovery/damage/hitstun/blockstun
 * Generic normals only. Character specials in frameDataChars.ts.
 */
import { FRAME_DATA_CHARS } from './frameDataChars.js';

// ===== Frame Data Constants =====
// 数据源: SuperCombo Wiki KOF2002 原版 (非UM)
// hitLevel: MID=站蹲都能挡, LOW=只能蹲防, HIGH=只能站防
// knockdown: true = 击倒 (进入KNOCKDOWN状态)
// 通常技基于KOF2002UM Kyo数据 (Dream Cancel Wiki), startup含首帧active
// KOF通用: light hitstun=11F blockstun=9F, heavy ground=19F/17F, heavy air=11F/17F
const FRAME_DATA_GENERIC = {
  // ── 远距离站立 (Far Stand) ── SuperCombo Wiki KOF2002 average
  STAND_A: {
    startup: 6, active: 3, recovery: 5,
    damage: 33, hitstun: 11, blockstun: 9, pushback: 4,
    hitLevel: 'MID' as const, knockdown: false,
  },
  STAND_B: {
    startup: 7, active: 3, recovery: 14,
    damage: 42, hitstun: 11, blockstun: 9, pushback: 4,
    hitLevel: 'MID' as const, knockdown: false,
  },
  STAND_C: {
    startup: 7, active: 3, recovery: 20,
    damage: 100, hitstun: 19, blockstun: 15, pushback: 8,
    hitLevel: 'MID' as const, knockdown: false,
  },
  STAND_D: {
    startup: 10, active: 8, recovery: 20,
    damage: 75, hitstun: 19, blockstun: 15, pushback: 9,
    hitLevel: 'MID' as const, knockdown: false,
  },
  // ── 近距离站立 (Close Stand) ── SuperCombo Wiki KOF2002
  CLOSE_A: {
    startup: 4, active: 5, recovery: 5,
    damage: 25, hitstun: 11, blockstun: 9, pushback: 3,
    hitLevel: 'MID' as const, knockdown: false,
  },
  CLOSE_B: {
    startup: 5, active: 3, recovery: 5,
    damage: 25, hitstun: 11, blockstun: 9, pushback: 4,
    hitLevel: 'LOW' as const, knockdown: false,
  },
  CLOSE_C: {
    startup: 2, active: 5, recovery: 11,
    damage: 100, hitstun: 19, blockstun: 15, pushback: 8,
    hitLevel: 'MID' as const, knockdown: false,
  },
  CLOSE_D: {
    startup: 5, active: 6, recovery: 13,
    damage: 25, hitstun: 11, blockstun: 9, pushback: 5,
    hitLevel: 'MID' as const, knockdown: false,
  },
  // ── 命令通常技 (Command Normals) ──
  CMD_GOFU_YOU: {
    startup: 22, active: 3, recovery: 20,
    damage: 45, hitstun: 19, blockstun: 17, pushback: 3,
    hitLevel: 'HIGH' as const, knockdown: false,
  },
  CMD_88SHIKI: {
    startup: 7, active: 4, recovery: 24,
    damage: 55, hitstun: 19, blockstun: 17, pushback: 3,
    hitLevel: 'LOW' as const, knockdown: false,
  },
  CMD_NARAKU: {
    startup: 6, active: 5, recovery: 4,
    damage: 50, hitstun: 19, blockstun: 17, pushback: 4,
    hitLevel: 'HIGH' as const, knockdown: true,
  },
  // ── 角色命令通常技 ──
  IORI_YUMEYUMI: {
    startup: 14, active: 4, recovery: 18,
    damage: 48, hitstun: 19, blockstun: 16, pushback: 3,
    hitLevel: 'HIGH' as const, knockdown: false,
  },
  IORI_KATANUGI: {
    startup: 8, active: 4, recovery: 20,
    damage: 42, hitstun: 18, blockstun: 15, pushback: 2,
    hitLevel: 'LOW' as const, knockdown: false,
  },
  IORI_YUKIWARUI: {
    startup: 7, active: 7, recovery: 3,
    damage: 45, hitstun: 19, blockstun: 17, pushback: 4,
    hitLevel: 'HIGH' as const, knockdown: false,
  },
  TERRY_BACK_KNCKLE: {
    startup: 15, active: 4, recovery: 19,
    damage: 46, hitstun: 19, blockstun: 16, pushback: 3,
    hitLevel: 'HIGH' as const, knockdown: false,
  },
  TERRY_COMBO_BLOW: {
    startup: 9, active: 4, recovery: 21,
    damage: 40, hitstun: 18, blockstun: 15, pushback: 2,
    hitLevel: 'LOW' as const, knockdown: false,
  },
  KIM_HISHOU_KICK: {
    startup: 16, active: 4, recovery: 20,
    damage: 48, hitstun: 20, blockstun: 17, pushback: 3,
    hitLevel: 'HIGH' as const, knockdown: false,
  },
  KIM_HANSEN: {
    startup: 10, active: 5, recovery: 22,
    damage: 52, hitstun: 19, blockstun: 16, pushback: 3,
    hitLevel: 'MID' as const, knockdown: false,
  },
  RYO_TSURIZAO: {
    startup: 14, active: 4, recovery: 18,
    damage: 44, hitstun: 19, blockstun: 16, pushback: 3,
    hitLevel: 'HIGH' as const, knockdown: false,
  },
  RYO_ORISHI: {
    startup: 8, active: 4, recovery: 20,
    damage: 38, hitstun: 18, blockstun: 15, pushback: 2,
    hitLevel: 'LOW' as const, knockdown: false,
  },
  KDASH_ONE_INCH: {
    startup: 13, active: 3, recovery: 18,
    damage: 50, hitstun: 20, blockstun: 17, pushback: 4,
    hitLevel: 'HIGH' as const, knockdown: false,
  },
  KDASH_TRIGGER: {
    startup: 9, active: 4, recovery: 21,
    damage: 42, hitstun: 18, blockstun: 15, pushback: 3,
    hitLevel: 'LOW' as const, knockdown: false,
  },
  KULA_ONE_MORE: {
    startup: 14, active: 4, recovery: 19,
    damage: 46, hitstun: 19, blockstun: 16, pushback: 3,
    hitLevel: 'HIGH' as const, knockdown: false,
  },
  KULA_SLIDER: {
    startup: 8, active: 5, recovery: 22,
    damage: 40, hitstun: 18, blockstun: 15, pushback: 3,
    hitLevel: 'LOW' as const, knockdown: true,
  },
  LEONA_STRIKE_ARC: {
    startup: 15, active: 4, recovery: 20,
    damage: 44, hitstun: 19, blockstun: 16, pushback: 3,
    hitLevel: 'HIGH' as const, knockdown: false,
  },
  LEONA_STRIKE_DASH: {
    startup: 8, active: 5, recovery: 5,
    damage: 48, hitstun: 20, blockstun: 17, pushback: 5,
    hitLevel: 'HIGH' as const, knockdown: true,
  },
  // Mai 命令通常技
  MAI_HISSATSU_SHINOBIBACHI: {
    startup: 16, active: 4, recovery: 20,
    damage: 46, hitstun: 19, blockstun: 16, pushback: 3,
    hitLevel: 'HIGH' as const, knockdown: false,
  },
  MAI_YUSURA_UMA: {
    startup: 9, active: 4, recovery: 21,
    damage: 40, hitstun: 18, blockstun: 15, pushback: 2,
    hitLevel: 'LOW' as const, knockdown: false,
  },
  ROBERT_GENEI_KYAKU_CMD: {
    startup: 14, active: 4, recovery: 18,
    damage: 44, hitstun: 19, blockstun: 16, pushback: 3,
    hitLevel: 'HIGH' as const, knockdown: false,
  },
  ROBERT_KOU_SHUTAI: {
    startup: 9, active: 4, recovery: 20,
    damage: 40, hitstun: 18, blockstun: 15, pushback: 2,
    hitLevel: 'LOW' as const, knockdown: false,
  },
  // Clark 命令通常技 — KOF2002UM 校准数据
  CLARK_DEATH_LAKE: {
    startup: 15, active: 4, recovery: 19,
    damage: 46, hitstun: 19, blockstun: 16, pushback: 3,
    hitLevel: 'HIGH' as const, knockdown: false,
  },
  CLARK_STOMP: {
    startup: 8, active: 4, recovery: 22,
    damage: 38, hitstun: 18, blockstun: 15, pushback: 2,
    hitLevel: 'LOW' as const, knockdown: false,
  },
  // Ralf 命令通常技 — KOF2002UM 校准数据
  RALF_SABRE_PUNCH: {
    startup: 13, active: 4, recovery: 20,
    damage: 50, hitstun: 19, blockstun: 17, pushback: 4,
    hitLevel: 'MID' as const, knockdown: false,
  },
  RALF_SABRE_KICK: {
    startup: 10, active: 4, recovery: 22,
    damage: 42, hitstun: 18, blockstun: 15, pushback: 3,
    hitLevel: 'LOW' as const, knockdown: false,
  },
  // Joe 命令通常技 — KOF2002UM 校准数据
  JOE_KNEE_KICK: {
    startup: 13, active: 4, recovery: 19,
    damage: 48, hitstun: 19, blockstun: 16, pushback: 3,
    hitLevel: 'MID' as const, knockdown: false,
  },
  JOE_SLIDE: {
    startup: 9, active: 5, recovery: 22,
    damage: 42, hitstun: 18, blockstun: 15, pushback: 2,
    hitLevel: 'LOW' as const, knockdown: false,
  },
  // Andy 命令通常技 — KOF2002UM 校准数据
  ANDY_UWA_AGITO: {
    startup: 14, active: 4, recovery: 18,
    damage: 44, hitstun: 19, blockstun: 16, pushback: 3,
    hitLevel: 'HIGH' as const, knockdown: false,
  },
  ANDY_GEDAN_AGITO: {
    startup: 8, active: 4, recovery: 20,
    damage: 38, hitstun: 18, blockstun: 15, pushback: 2,
    hitLevel: 'LOW' as const, knockdown: false,
  },
  // Billy 命令通常技 — KOF2002UM 校准数据
  BILLY_SANDAN_GEAR: {
    startup: 14, active: 4, recovery: 18,
    damage: 46, hitstun: 19, blockstun: 16, pushback: 3,
    hitLevel: 'HIGH' as const, knockdown: false,
  },
  BILLY_SENSHU_IKKYAKU: {
    startup: 9, active: 4, recovery: 21,
    damage: 40, hitstun: 18, blockstun: 15, pushback: 2,
    hitLevel: 'LOW' as const, knockdown: false,
  },
  // 陈可汗命令通常技 — KOF2002UM 校准数据
  CHANG_HIKI_NAGE: {
    startup: 10, active: 4, recovery: 22,
    damage: 55, hitstun: 20, blockstun: 17, pushback: 4,
    hitLevel: 'MID' as const, knockdown: false,
  },
  CHANG_KYUUSHUU: {
    startup: 9, active: 5, recovery: 24,
    damage: 45, hitstun: 18, blockstun: 15, pushback: 3,
    hitLevel: 'LOW' as const, knockdown: false,
  },
  // Yashiro 命令通常技 — KOF2002UM 校准数据 (detailed data in frameDataChars.ts)
  YASHIRO_SHUU_WANI: {
    startup: 12, active: 4, recovery: 20,
    damage: 40, hitstun: 16, blockstun: 14, pushback: 4,
    hitLevel: 'MID' as const, knockdown: false,
  },
  YASHIRO_JUU_ZUTSU: {
    startup: 18, active: 4, recovery: 22,
    damage: 45, hitstun: 18, blockstun: 15, pushback: 4,
    hitLevel: 'HIGH' as const, knockdown: false,
  },
  // ── 蹲下攻击 (Crouch) ──
  CROUCH_A: {
    startup: 5, active: 4, recovery: 7,
    damage: 17, hitstun: 11, blockstun: 9, pushback: 3,
    hitLevel: 'MID' as const, knockdown: false,
  },
  CROUCH_B: {
    startup: 5, active: 5, recovery: 5,
    damage: 25, hitstun: 11, blockstun: 9, pushback: 3,
    hitLevel: 'LOW' as const, knockdown: false,
  },
  CROUCH_C: {
    startup: 7, active: 5, recovery: 16,
    damage: 90, hitstun: 19, blockstun: 15, pushback: 6,
    hitLevel: 'MID' as const, knockdown: false,
  },
  CROUCH_D: {
    startup: 5, active: 6, recovery: 31,
    damage: 75, hitstun: 0, blockstun: 15, pushback: 5,
    hitLevel: 'LOW' as const, knockdown: true,
  },
  // ── 跳跃攻击 (Jump) ──
  JUMP_A: {
    startup: 3, active: 9, recovery: 0,
    damage: 33, hitstun: 11, blockstun: 9, pushback: 5,
    hitLevel: 'HIGH' as const, knockdown: false,
  },
  JUMP_B: {
    startup: 4, active: 7, recovery: 0,
    damage: 33, hitstun: 11, blockstun: 9, pushback: 5,
    hitLevel: 'HIGH' as const, knockdown: false,
  },
  JUMP_C: {
    startup: 8, active: 3, recovery: 0,
    damage: 58, hitstun: 11, blockstun: 17, pushback: 7,
    hitLevel: 'HIGH' as const, knockdown: false,
  },
  JUMP_D: {
    startup: 5, active: 5, recovery: 0,
    damage: 25, hitstun: 11, blockstun: 17, pushback: 7,
    hitLevel: 'HIGH' as const, knockdown: false,
  },
  // ── 投技 ──
  THROW: {
    startup: 3, active: 2, recovery: 20,
    damage: 100, hitstun: 0, blockstun: 0, pushback: 0,
    hitLevel: 'MID' as const, knockdown: true,
  },
  THROW_FORWARD: {
    startup: 3, active: 2, recovery: 22,
    damage: 110, hitstun: 0, blockstun: 0, pushback: 0,
    hitLevel: 'MID' as const, knockdown: true,
  },
  THROW_BACK: {
    startup: 3, active: 2, recovery: 22,
    damage: 120, hitstun: 0, blockstun: 0, pushback: 0,
    hitLevel: 'MID' as const, knockdown: true,
  },
  // ── 必杀技通用 ──
  SPECIAL_PROJECTILE: {
    startup: 10, active: 20, recovery: 32,
    damage: 90, hitstun: 31, blockstun: 29, pushback: 5,
    hitLevel: 'MID' as const, knockdown: false, chipDamage: 9,
  },
  SPECIAL_UPPER: {
    startup: 5, active: 6, recovery: 22,
    damage: 120, hitstun: 25, blockstun: 20, pushback: 8,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 12,
  },
  // ── CD击飞攻击 ──
  STAND_CD: {
    startup: 11, active: 5, recovery: 24,
    damage: 83, hitstun: 0, blockstun: 21, pushback: 12,
    hitLevel: 'MID' as const, knockdown: true, counterWire: true as const,
  },
  JUMP_CD: {
    startup: 12, active: 4, recovery: 0,
    damage: 33, hitstun: 0, blockstun: 21, pushback: 10,
    hitLevel: 'HIGH' as const, knockdown: true, counterWire: true as const,
  },
  // ── DM_OROCHINAGI (shared) ──
  DM_OROCHINAGI: {
    startup: 20, active: 30, recovery: 27,
    damage: 200, hitstun: 0, blockstun: 21, pushback: 10,
    hitLevel: 'MID' as const, knockdown: true, chipDamage: 20,
  },
};

export const FRAME_DATA = { ...FRAME_DATA_GENERIC, ...FRAME_DATA_CHARS } as const;
