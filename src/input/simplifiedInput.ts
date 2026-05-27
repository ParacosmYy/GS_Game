/**
 * Simplified input mode — one-button special moves for casual players
 * U = Special 1 (projectile / horizontal)
 * I = Special 2 (anti-air / DP-like)
 * O = MAX activation (暴气)
 * When MAX mode active: U and I trigger enhanced versions
 */
import { AttackType } from '../core/types.js';
import type { CharacterDefinition } from '../characters/types.js';
import type { PowerGauge, MaxModeState } from '../core/types.js';
import { MAX_MODE_STOCK_COST } from '../core/constants.js';

export interface SimplifiedResult {
  attack: AttackType | null;
  activateMax: boolean;
}

/**
 * ===== Kyo 草薙京 =====
 * U: 荒咬み (QCF projectile) → MAX: 大蛇薙 (DM)
 * I: 鬼焼き (DP upper) → MAX: same (already max version)
 */
const KYO_SPECIAL1 = AttackType.KYO_ARAGAMI;           // 荒咬み
const KYO_SPECIAL1_MAX = AttackType.DM_OROCHINAGI;    // 大蛇薙
const KYO_SPECIAL2 = AttackType.KYO_ONIYAKI_C;        // 鬼焼き (already strong)
const KYO_SPECIAL2_MAX = AttackType.KYO_ONIYAKI_C;    // Same in MAX

/**
 * ===== Iori 八神庵 =====
 * U: 闇払い (QCF projectile) → MAX: 八稚女 (DM)
 * I: 鬼焼き (DP upper) → MAX: 葵花 (rekka chain)
 */
const IORI_SPECIAL1 = AttackType.IORI_YAMIBARAI_C;         // 闇払い (強版)
const IORI_SPECIAL1_MAX = AttackType.DM_YATAGARASU;       // 八稚女
const IORI_SPECIAL2 = AttackType.IORI_ONIYAKI_C;          // 鬼焼き (強版)
const IORI_SPECIAL2_MAX = AttackType.IORI_AOIHANA;        // 葵花 (rekka)

/**
 * ===== Ryo 坂崎亮 =====
 * U: 虎煌 (QCF projectile) → MAX: 天地霸煌拳 (DM)
 * I: 虎咆 (DP upper) → MAX: same (already strong)
 */
const RYO_SPECIAL1 = AttackType.RYO_KOOU_C;               // 虎煌 (強版)
const RYO_SPECIAL1_MAX = AttackType.DM_TEN_HA_OU;        // 天地霸煌拳
const RYO_SPECIAL2 = AttackType.RYO_KO_HOU_C;            // 虎咆 (強版)
const RYO_SPECIAL2_MAX = AttackType.RYO_KO_HOU_C;        // Same in MAX

/**
 * ===== Terry 特瑞 =====
 * U: Power Wave (QCF) → MAX: Power Geyser (DM)
 * I: Burn Knuckle (DP) → MAX: Rising Tackle (charge upper)
 */
const TERRY_SPECIAL1 = AttackType.TERRY_POWER_WAVE;       
const TERRY_SPECIAL1_MAX = AttackType.DM_POWER_GEYSER;
const TERRY_SPECIAL2 = AttackType.TERRY_BURN_KNUCKLE;
const TERRY_SPECIAL2_MAX = AttackType.TERRY_RISING_TACKLE;

/**
 * ===== Kim 金 =====
 * U: Hienzan (charge up) → MAX: Phoenix Kick (DM)
 * I: Hangetsu (QCB kick) → MAX: Hienzan (stronger kick)
 */
const KIM_SPECIAL1 = AttackType.KIM_HIENZAN;
const KIM_SPECIAL1_MAX = AttackType.DM_PHOENIX_KICK;
const KIM_SPECIAL2 = AttackType.KIM_HANGETSU;
const KIM_SPECIAL2_MAX = AttackType.KIM_HIENZAN;

/**
 * ===== Leona 莉安娜 =====
 * U: Moon Slash (QCF) → MAX: V Slasher (DM)
 * I: Ear Ring (DP) → MAX: Grand Saber (rush)
 */
const LEONA_SPECIAL1 = AttackType.LEONA_MOON_SLASH_C;
const LEONA_SPECIAL1_MAX = AttackType.DM_V_SLASHER;
const LEONA_SPECIAL2 = AttackType.LEONA_EAR_RING_C;
const LEONA_SPECIAL2_MAX = AttackType.LEONA_GRAND_SABER;

/**
 * ===== Mai 不知火舞 =====
 * U: Ka Cho Sen (QCF fan) → MAX: Haka Otoshi (DM)
 * I: Hisho Ryu En Jin (DP fan lift) → MAX: Ryu En Bu (flame kick)
 */
const MAI_SPECIAL1 = AttackType.MAI_KA_CHO_SEN_C;
const MAI_SPECIAL1_MAX = AttackType.DM_HAKA_OTOSHI;
const MAI_SPECIAL2 = AttackType.MAI_HISHO_RYU_EN_JIN;
const MAI_SPECIAL2_MAX = AttackType.MAI_RYU_EN_BU;

/**
 * ===== Robert 罗伯特 =====
 * U: Kou Shutai (spin kick) → MAX: Ryu Ko Ryu (DM)
 * I: Genei Kyaku (DP) → MAX: Haou Shokou (DM)
 */
const ROBERT_SPECIAL1 = AttackType.ROBERT_KOU_SHUTAI;
const ROBERT_SPECIAL1_MAX = AttackType.DM_RYU_KO_RYU;
const ROBERT_SPECIAL2 = AttackType.TERRY_POWER_DUNK;  // Fallback DP-like
const ROBERT_SPECIAL2_MAX = AttackType.DM_HAOU_SHOKOU;

/**
 * ===== Clark 克拉克 =====
 * U: Suplex → MAX: Argentine DM
 * I: Galactica → MAX: same
 */
const CLARK_SPECIAL1 = AttackType.THROW;  // Fallback to throw
const CLARK_SPECIAL1_MAX = AttackType.DM_ARGENTINE_DM;
const CLARK_SPECIAL2 = AttackType.THROW_FORWARD;
const CLARK_SPECIAL2_MAX = AttackType.DM_GALACTICA_PHANTOM;

/**
 * ===== Ralf 拉尔夫 =====
 * U: Galactica → MAX: Galactica Phantom (DM)
 * I: Screw Upper → MAX: same
 */
const RALF_SPECIAL1 = AttackType.TERRY_POWER_DUNK;  // Fallback DP
const RALF_SPECIAL1_MAX = AttackType.DM_GALACTICA_PHANTOM;
const RALF_SPECIAL2 = AttackType.TERRY_BURN_KNUCKLE;  // Fallback DP
const RALF_SPECIAL2_MAX = AttackType.DM_SCREW_UPPER;

/**
 * Character special mappings for U and I buttons
 * Format: [SPECIAL1, SPECIAL1_MAX, SPECIAL2, SPECIAL2_MAX]
 */
const SPECIAL_MAPPINGS: Record<string, [AttackType, AttackType, AttackType, AttackType]> = {
  kyo: [KYO_SPECIAL1, KYO_SPECIAL1_MAX, KYO_SPECIAL2, KYO_SPECIAL2_MAX],
  iori: [IORI_SPECIAL1, IORI_SPECIAL1_MAX, IORI_SPECIAL2, IORI_SPECIAL2_MAX],
  ryo: [RYO_SPECIAL1, RYO_SPECIAL1_MAX, RYO_SPECIAL2, RYO_SPECIAL2_MAX],
  terry: [TERRY_SPECIAL1, TERRY_SPECIAL1_MAX, TERRY_SPECIAL2, TERRY_SPECIAL2_MAX],
  kim: [KIM_SPECIAL1, KIM_SPECIAL1_MAX, KIM_SPECIAL2, KIM_SPECIAL2_MAX],
  leona: [LEONA_SPECIAL1, LEONA_SPECIAL1_MAX, LEONA_SPECIAL2, LEONA_SPECIAL2_MAX],
  mai: [MAI_SPECIAL1, MAI_SPECIAL1_MAX, MAI_SPECIAL2, MAI_SPECIAL2_MAX],
  robert: [ROBERT_SPECIAL1, ROBERT_SPECIAL1_MAX, ROBERT_SPECIAL2, ROBERT_SPECIAL2_MAX],
  clark: [CLARK_SPECIAL1, CLARK_SPECIAL1_MAX, CLARK_SPECIAL2, CLARK_SPECIAL2_MAX],
  ralf: [RALF_SPECIAL1, RALF_SPECIAL1_MAX, RALF_SPECIAL2, RALF_SPECIAL2_MAX],
};

/**
 * Resolve simplified U/I/O input to a character-specific action
 * - O activates MAX mode (if available)
 * - U triggers SPECIAL1 (or SPECIAL1_MAX if MAX mode active)
 * - I triggers SPECIAL2 (or SPECIAL2_MAX if MAX mode active)
 */
export function resolveSimplified(
  uPressed: boolean,
  iPressed: boolean,
  oPressed: boolean,
  char: CharacterDefinition,
  gauges: PowerGauge,
  maxModes: MaxModeState,
): SimplifiedResult {
  // O: Activate MAX mode
  if (oPressed && !maxModes.active && gauges.stocks >= MAX_MODE_STOCK_COST) {
    return { attack: null, activateMax: true };
  }

  const mapping = SPECIAL_MAPPINGS[char.id];
  const isMaxMode = maxModes.active;

  // U: SPECIAL1 (or SPECIAL1_MAX if MAX active)
  if (uPressed) {
    if (!mapping) {
      return { attack: AttackType.SPECIAL_PROJECTILE, activateMax: false };
    }
    const attack = isMaxMode ? mapping[1] : mapping[0];
    return { attack, activateMax: false };
  }

  // I: SPECIAL2 (or SPECIAL2_MAX if MAX active)
  if (iPressed) {
    if (!mapping) {
      return { attack: AttackType.SPECIAL_UPPER, activateMax: false };
    }
    const attack = isMaxMode ? mapping[3] : mapping[2];
    return { attack, activateMax: false };
  }

  return { attack: null, activateMax: false };
}
