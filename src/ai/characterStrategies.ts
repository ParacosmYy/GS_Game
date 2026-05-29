/**
 * Character-specific AI strategy configurations.
 *
 * Each strategy defines how the AI should play a given character: preferred
 * combat range, aggression tendency, and which attack types to favour for
 * anti-air, poking, combo starting, DM finishing, and wake-up pressure.
 *
 * The AdvancedAI class consumes these via `getCharacterStrategy(charId)`.
 * When no matching strategy exists it falls back to DEFAULT_STRATEGY.
 */
import { AttackType } from '../core/types.js';

// ─── Strategy interface ───

export type PreferredRange = 'close' | 'mid' | 'far';

export interface CharacterStrategy {
  /** Character ID this strategy belongs to */
  charId: string;
  /** Preferred combat distance band */
  preferredRange: PreferredRange;
  /** Base aggression tendency (0 = passive, 1 = hyper-aggressive) */
  aggressiveLevel: number;
  /** Attack type favoured for anti-air responses */
  preferredAntiAir: AttackType;
  /** Attack type favoured for mid-range pokes */
  preferredPoke: AttackType;
  /** Attack type used to start ground combos */
  preferredComboStarter: AttackType;
  /** DM (super) used as combo finisher or punish */
  preferredDM: AttackType;
  /** Options the AI picks from when the opponent is waking up */
  wakeUpOptions: AttackType[];
}

// ─── Strategy definitions ───

const kyo: CharacterStrategy = {
  charId: 'kyo',
  preferredRange: 'close',
  aggressiveLevel: 0.8,
  preferredAntiAir: AttackType.KYO_ONIYAKI_C,
  preferredPoke: AttackType.STAND_B,
  preferredComboStarter: AttackType.CLOSE_C,
  preferredDM: AttackType.DM_OROCHINAGI,
  wakeUpOptions: [
    AttackType.CLOSE_C,
    AttackType.CMD_GOFU_YOU,
    AttackType.THROW_FORWARD,
  ],
};

const iori: CharacterStrategy = {
  charId: 'iori',
  preferredRange: 'close',
  aggressiveLevel: 0.9,
  preferredAntiAir: AttackType.IORI_ONIYAKI_C,
  preferredPoke: AttackType.STAND_B,
  preferredComboStarter: AttackType.CLOSE_C,
  preferredDM: AttackType.DM_YATAGARASU,
  wakeUpOptions: [
    AttackType.CLOSE_C,
    AttackType.IORI_YUMEYUMI,
    AttackType.IORI_KUZUKAZE,
    AttackType.THROW_FORWARD,
  ],
};

const terry: CharacterStrategy = {
  charId: 'terry',
  preferredRange: 'mid',
  aggressiveLevel: 0.65,
  preferredAntiAir: AttackType.TERRY_POWER_DUNK,
  preferredPoke: AttackType.TERRY_BURN_KNUCKLE,
  preferredComboStarter: AttackType.CLOSE_C,
  preferredDM: AttackType.DM_POWER_GEYSER,
  wakeUpOptions: [
    AttackType.CLOSE_C,
    AttackType.TERRY_CRACK_SHOT,
    AttackType.THROW_FORWARD,
  ],
};

const kim: CharacterStrategy = {
  charId: 'kim',
  preferredRange: 'mid',
  aggressiveLevel: 0.75,
  preferredAntiAir: AttackType.KIM_HIENZAN,
  preferredPoke: AttackType.KIM_HISHOU_KICK,
  preferredComboStarter: AttackType.CLOSE_C,
  preferredDM: AttackType.DM_PHOENIX_KICK,
  wakeUpOptions: [
    AttackType.CLOSE_C,
    AttackType.KIM_HAKI,
    AttackType.THROW_FORWARD,
  ],
};

const ryo: CharacterStrategy = {
  charId: 'ryo',
  preferredRange: 'mid',
  aggressiveLevel: 0.6,
  preferredAntiAir: AttackType.RYO_KO_HOU_C,
  preferredPoke: AttackType.RYO_KOOU,
  preferredComboStarter: AttackType.CLOSE_C,
  preferredDM: AttackType.DM_TEN_HA_OU,
  wakeUpOptions: [
    AttackType.CLOSE_C,
    AttackType.RYO_HIEN,
    AttackType.THROW_FORWARD,
  ],
};

const kdash: CharacterStrategy = {
  charId: 'kdash',
  preferredRange: 'close',
  aggressiveLevel: 0.8,
  preferredAntiAir: AttackType.KDASH_CROW_C,
  preferredPoke: AttackType.STAND_B,
  preferredComboStarter: AttackType.CLOSE_C,
  preferredDM: AttackType.DM_CHAIN_SHOT,
  wakeUpOptions: [
    AttackType.CLOSE_C,
    AttackType.KDASH_MINUTE,
    AttackType.THROW_FORWARD,
  ],
};

const mai: CharacterStrategy = {
  charId: 'mai',
  preferredRange: 'far',
  aggressiveLevel: 0.55,
  preferredAntiAir: AttackType.MAI_HISHO_RYU_EN_JIN,
  preferredPoke: AttackType.MAI_KA_CHO_SEN,
  preferredComboStarter: AttackType.CLOSE_C,
  preferredDM: AttackType.DM_HAKA_OTOSHI,
  wakeUpOptions: [
    AttackType.CLOSE_C,
    AttackType.MAI_RYU_EN_BU,
    AttackType.JUMP_C,
    AttackType.THROW_FORWARD,
  ],
};

const robert: CharacterStrategy = {
  charId: 'robert',
  preferredRange: 'mid',
  aggressiveLevel: 0.7,
  preferredAntiAir: AttackType.ROBERT_RYU_ZAN_C,
  preferredPoke: AttackType.ROBERT_RYU_GEKI,
  preferredComboStarter: AttackType.CLOSE_C,
  preferredDM: AttackType.DM_RYU_KO_RYU,
  wakeUpOptions: [
    AttackType.CLOSE_C,
    AttackType.ROBERT_GENEI_KYAKU,
    AttackType.THROW_FORWARD,
  ],
};

const clark: CharacterStrategy = {
  charId: 'clark',
  preferredRange: 'close',
  aggressiveLevel: 0.5,
  preferredAntiAir: AttackType.STAND_D,
  preferredPoke: AttackType.STAND_A,
  preferredComboStarter: AttackType.CLOSE_C,
  preferredDM: AttackType.DM_ARGENTINE_DM,
  wakeUpOptions: [
    AttackType.CLARK_ARGENTINE,
    AttackType.CLARK_VULCAN,
    AttackType.THROW_FORWARD,
    AttackType.THROW_BACK,
  ],
};

const ralf: CharacterStrategy = {
  charId: 'ralf',
  preferredRange: 'close',
  aggressiveLevel: 0.7,
  preferredAntiAir: AttackType.CROUCH_C,
  preferredPoke: AttackType.RALF_SABRE_PUNCH,
  preferredComboStarter: AttackType.CLOSE_C,
  preferredDM: AttackType.DM_GALACTICA_PHANTOM,
  wakeUpOptions: [
    AttackType.CLOSE_C,
    AttackType.RALF_VULCAN,
    AttackType.RALF_BACKBREAKER,
  ],
};

const kula: CharacterStrategy = {
  charId: 'kula',
  preferredRange: 'mid',
  aggressiveLevel: 0.4,
  preferredAntiAir: AttackType.KULA_SHELL_C,
  preferredPoke: AttackType.KULA_BREATH,
  preferredComboStarter: AttackType.CLOSE_C,
  preferredDM: AttackType.DM_FREEZE,
  wakeUpOptions: [
    AttackType.CLOSE_C,
    AttackType.KULA_EDGE,
    AttackType.KULA_ONE_MORE,
    AttackType.THROW_FORWARD,
  ],
};

const leona: CharacterStrategy = {
  charId: 'leona',
  preferredRange: 'mid',
  aggressiveLevel: 0.5,
  preferredAntiAir: AttackType.LEONA_EAR_RING_C,
  preferredPoke: AttackType.LEONA_MOON_SLASH,
  preferredComboStarter: AttackType.CLOSE_C,
  preferredDM: AttackType.DM_V_SLASHER,
  wakeUpOptions: [
    AttackType.CLOSE_C,
    AttackType.LEONA_GRAND_SABER,
    AttackType.LEONA_BALTIC,
    AttackType.THROW_FORWARD,
  ],
};

const athena: CharacterStrategy = {
  charId: 'athena',
  preferredRange: 'far',
  aggressiveLevel: 0.3,
  preferredAntiAir: AttackType.ATHENA_PSYCHO_SWORD_C,
  preferredPoke: AttackType.ATHENA_PSYCHO_BALL,
  preferredComboStarter: AttackType.CLOSE_C,
  preferredDM: AttackType.DM_SHINING_CRYSTAL_BIT,
  wakeUpOptions: [
    AttackType.CLOSE_C,
    AttackType.ATHENA_PSYCHO_SWORD_C,
    AttackType.ATHENA_PHOENIX_ARROW,
    AttackType.THROW_FORWARD,
  ],
};

const billy: CharacterStrategy = {
  charId: 'billy',
  preferredRange: 'far',
  aggressiveLevel: 0.4,
  preferredAntiAir: AttackType.BILLY_SENPU_KON_C,
  preferredPoke: AttackType.BILLY_SANSETSU_KON,
  preferredComboStarter: AttackType.CLOSE_C,
  preferredDM: AttackType.DM_KAEN_SENPU_JIN,
  wakeUpOptions: [
    AttackType.CLOSE_C,
    AttackType.BILLY_HIEN_ZAN_D,
    AttackType.BILLY_SENSHU_IKKYAKU,
    AttackType.THROW_FORWARD,
  ],
};

const chang: CharacterStrategy = {
  charId: 'chang',
  preferredRange: 'close',
  aggressiveLevel: 0.6,
  preferredAntiAir: AttackType.CHANG_TEKKYUU_HIEN_ZAN,
  preferredPoke: AttackType.CHANG_TEKKYUU_KAITEN,
  preferredComboStarter: AttackType.CLOSE_C,
  preferredDM: AttackType.DM_TEKKYUU_DAI_BOUSOU,
  wakeUpOptions: [
    AttackType.CLOSE_C,
    AttackType.CHANG_TEKKYUU_FASSHU,
    AttackType.CHANG_KYUUSHUU,
    AttackType.THROW_FORWARD,
  ],
};

const choi: CharacterStrategy = {
  charId: 'choi',
  preferredRange: 'close',
  aggressiveLevel: 0.7,
  preferredAntiAir: AttackType.CHOI_KAITEN_HIEN_ZAN_C,
  preferredPoke: AttackType.CHOI_HISHOU_KYAKU,
  preferredComboStarter: AttackType.CLOSE_C,
  preferredDM: AttackType.DM_SHIN_CHOU_HOUYOKU,
  wakeUpOptions: [
    AttackType.CLOSE_C,
    AttackType.CHOI_HOUYOKU_TENSHIN,
    AttackType.CHOI_SAN_REN_GEKI,
    AttackType.THROW_FORWARD,
  ],
};

const joe: CharacterStrategy = {
  charId: 'joe',
  preferredRange: 'mid',
  aggressiveLevel: 0.6,
  preferredAntiAir: AttackType.JOE_TIGER_KICK_D,
  preferredPoke: AttackType.JOE_HURRICANE,
  preferredComboStarter: AttackType.CLOSE_C,
  preferredDM: AttackType.DM_SCREW_UPPER,
  wakeUpOptions: [
    AttackType.CLOSE_C,
    AttackType.JOE_BAKURETSUKEN,
    AttackType.JOE_SLIDE,
    AttackType.THROW_FORWARD,
  ],
};

const andy: CharacterStrategy = {
  charId: 'andy',
  preferredRange: 'close',
  aggressiveLevel: 0.7,
  preferredAntiAir: AttackType.ANDY_SHOURYUU_DAN_C,
  preferredPoke: AttackType.ANDY_HISHOU_KEN,
  preferredComboStarter: AttackType.CLOSE_C,
  preferredDM: AttackType.DM_CHO_REPPA_DAN,
  wakeUpOptions: [
    AttackType.CLOSE_C,
    AttackType.ANDY_ZANEI_RYUSEI_KEN,
    AttackType.ANDY_GEDAN_AGITO,
    AttackType.THROW_FORWARD,
  ],
};

const mature: CharacterStrategy = {
  charId: 'mature',
  preferredRange: 'mid',
  aggressiveLevel: 0.7,
  preferredAntiAir: AttackType.MATURE_ECSTASY,
  preferredPoke: AttackType.MATURE_MASSACRE,
  preferredComboStarter: AttackType.CLOSE_C,
  preferredDM: AttackType.DM_NOCTURNAL_LIGHT,
  wakeUpOptions: [
    AttackType.CLOSE_C,
    AttackType.MATURE_HEAVENS_GATE,
    AttackType.MATURE_JAB,
    AttackType.THROW_FORWARD,
  ],
};

const yashiro: CharacterStrategy = {
  charId: 'yashiro',
  preferredRange: 'close',
  aggressiveLevel: 0.7,
  preferredAntiAir: AttackType.YASHIRO_NIRAAI,
  preferredPoke: AttackType.YASHIRO_UPPER_DU,
  preferredComboStarter: AttackType.CLOSE_C,
  preferredDM: AttackType.DM_ARMAGEDDON_BUSTERS,
  wakeUpOptions: [
    AttackType.CLOSE_C,
    AttackType.YASHIRO_MUSATSU,
    AttackType.YASHIRO_JUU_ZUTSU,
    AttackType.THROW_FORWARD,
  ],
};

const chris: CharacterStrategy = {
  charId: 'chris',
  preferredRange: 'close',
  aggressiveLevel: 0.8,
  preferredAntiAir: AttackType.CHRIS_TWISTER_DRIVE,
  preferredPoke: AttackType.CHRIS_SHOT_WEAVE,
  preferredComboStarter: AttackType.CLOSE_C,
  preferredDM: AttackType.DM_CHAIN_SLIDE_TOUCH,
  wakeUpOptions: [
    AttackType.CLOSE_C,
    AttackType.CHRIS_SCRAMBLE_DASH,
    AttackType.CHRIS_KAZAGURUMA,
    AttackType.THROW_FORWARD,
  ],
};

const vice: CharacterStrategy = {
  charId: 'vice',
  preferredRange: 'close',
  aggressiveLevel: 0.6,
  preferredAntiAir: AttackType.VICE_MAYHEM,
  preferredPoke: AttackType.VICE_OUTRAGE,
  preferredComboStarter: AttackType.CLOSE_C,
  preferredDM: AttackType.DM_NEGATIVE_GAIN,
  wakeUpOptions: [
    AttackType.CLOSE_C,
    AttackType.VICE_BLACK_END,
    AttackType.VICE_OVERKILL,
    AttackType.THROW_FORWARD,
  ],
};

const shermie: CharacterStrategy = {
  charId: 'shermie',
  preferredRange: 'close',
  aggressiveLevel: 0.6,
  preferredAntiAir: AttackType.SHERMIE_CARNIVAL,
  preferredPoke: AttackType.SHERMIE_SHOOT,
  preferredComboStarter: AttackType.CLOSE_C,
  preferredDM: AttackType.DM_SHERMIE_CARNIVAL,
  wakeUpOptions: [
    AttackType.CLOSE_C,
    AttackType.SHERMIE_AXLE_SPIN,
    AttackType.SHERMIE_CLASH,
    AttackType.THROW_FORWARD,
  ],
};

const yamazaki: CharacterStrategy = {
  charId: 'yamazaki',
  preferredRange: 'mid',
  aggressiveLevel: 0.7,
  preferredAntiAir: AttackType.YAMAZAKI_SANDSTORM,
  preferredPoke: AttackType.YAMAZAKI_SNAKE_ARM,
  preferredComboStarter: AttackType.CLOSE_C,
  preferredDM: AttackType.DM_GUILLOTINE,
  wakeUpOptions: [
    AttackType.CLOSE_C,
    AttackType.YAMAZAKI_BAI_GA_SE,
    AttackType.YAMAZAKI_BOKKAI,
    AttackType.THROW_FORWARD,
  ],
};

const mary: CharacterStrategy = {
  charId: 'mary',
  preferredRange: 'close',
  aggressiveLevel: 0.5,
  preferredAntiAir: AttackType.MARY_STRAIGHT_SLICER_C,
  preferredPoke: AttackType.MARY_STRAIGHT_SLICER,
  preferredComboStarter: AttackType.CLOSE_C,
  preferredDM: AttackType.DM_MARY_TYPHOON,
  wakeUpOptions: [
    AttackType.CLOSE_C,
    AttackType.MARY_BACKDROP_REAL,
    AttackType.MARY_SPIDER,
    AttackType.THROW_FORWARD,
  ],
};

const xiangfei: CharacterStrategy = {
  charId: 'xiangfei',
  preferredRange: 'close',
  aggressiveLevel: 0.7,
  preferredAntiAir: AttackType.XIANGFEI_TENPATSU,
  preferredPoke: AttackType.XIANGFEI_NANPA,
  preferredComboStarter: AttackType.CLOSE_C,
  preferredDM: AttackType.DM_CHO_KA_RINGA,
  wakeUpOptions: [
    AttackType.CLOSE_C,
    AttackType.XIANGFEI_MAHO_HISHA,
    AttackType.XIANGFEI_KAKU_DA,
    AttackType.THROW_FORWARD,
  ],
};

const kasumi: CharacterStrategy = {
  charId: 'kasumi',
  preferredRange: 'close',
  aggressiveLevel: 0.5,
  preferredAntiAir: AttackType.KASUMI_KASANE_ATE,
  preferredPoke: AttackType.KASUMI_KOOU_KEN,
  preferredComboStarter: AttackType.CLOSE_C,
  preferredDM: AttackType.DM_CHO_MUKIGENZAN,
  wakeUpOptions: [
    AttackType.CLOSE_C,
    AttackType.KASUMI_MUKIGENZAN,
    AttackType.KASUMI_GESHIKI,
    AttackType.THROW_FORWARD,
  ],
};

const kfm: CharacterStrategy = {
  charId: 'kfm',
  preferredRange: 'close',
  aggressiveLevel: 0.7,
  preferredAntiAir: AttackType.KFM_KUNGFU_UPPER,
  preferredPoke: AttackType.STAND_B,
  preferredComboStarter: AttackType.CLOSE_C,
  preferredDM: AttackType.DM_KFM_SMASH_FIST,
  wakeUpOptions: [
    AttackType.CLOSE_C,
    AttackType.KFM_SMASH_KICK,
    AttackType.THROW_FORWARD,
  ],
};

const benimaru: CharacterStrategy = {
  charId: 'benimaru',
  preferredRange: 'mid',
  aggressiveLevel: 0.65,
  preferredAntiAir: AttackType.BENIMARU_SUPER_INAZUMA_KICK,
  preferredPoke: AttackType.BENIMARU_RAIJINKEN,
  preferredComboStarter: AttackType.CLOSE_C,
  preferredDM: AttackType.DM_BENIMARU_RAIKOUKEN,
  wakeUpOptions: [
    AttackType.CLOSE_C,
    AttackType.BENIMARU_SHINKUU_KATATEGOMA,
    AttackType.THROW_FORWARD,
  ],
};

const heidern: CharacterStrategy = {
  charId: 'heidern',
  preferredRange: 'mid',
  aggressiveLevel: 0.5,
  preferredAntiAir: AttackType.HEIDERN_MOON_SLASHER,
  preferredPoke: AttackType.HEIDERN_CROSS_CUTTER,
  preferredComboStarter: AttackType.CLOSE_C,
  preferredDM: AttackType.DM_HEIDERN_END,
  wakeUpOptions: [
    AttackType.CLOSE_C,
    AttackType.HEIDERN_STORMBRINGER,
    AttackType.HEIDERN_NECK_ROLLER,
    AttackType.THROW_FORWARD,
  ],
};

const yuri: CharacterStrategy = {
  charId: 'yuri',
  preferredRange: 'mid',
  aggressiveLevel: 0.6,
  preferredAntiAir: AttackType.YURI_CHOU_UPPER,
  preferredPoke: AttackType.YURI_KO_OU_KEN,
  preferredComboStarter: AttackType.CLOSE_C,
  preferredDM: AttackType.DM_YURI_HAOH_SHO_KO_KEN,
  wakeUpOptions: [
    AttackType.CLOSE_C,
    AttackType.YURI_HIEN_HOU_OU_KYAKU,
    AttackType.YURI_HYAKU_RETSU_BINTA,
    AttackType.THROW_FORWARD,
  ],
};

// ─── Registry ───

const DEFAULT_STRATEGY: CharacterStrategy = {
  charId: '_default',
  preferredRange: 'mid',
  aggressiveLevel: 0.6,
  preferredAntiAir: AttackType.SPECIAL_UPPER,
  preferredPoke: AttackType.STAND_B,
  preferredComboStarter: AttackType.CLOSE_C,
  preferredDM: AttackType.SPECIAL_UPPER,
  wakeUpOptions: [
    AttackType.CLOSE_C,
    AttackType.THROW_FORWARD,
  ],
};

const STRATEGY_MAP: Record<string, CharacterStrategy> = {
  kyo,
  iori,
  terry,
  kim,
  ryo,
  kdash,
  mai,
  robert,
  clark,
  ralf,
  kula,
  leona,
  athena,
  billy,
  chang,
  choi,
  joe,
  andy,
  mature,
  yashiro,
  chris,
  vice,
  shermie,
  yamazaki,
  mary,
  xiangfei,
  kasumi,
  benimaru,
  heidern,
  yuri,
  kfm,
};

/**
 * Look up the character-specific strategy for `charId`.
 * Returns DEFAULT_STRATEGY when no dedicated strategy is defined.
 */
export function getCharacterStrategy(charId: string): CharacterStrategy {
  return STRATEGY_MAP[charId] ?? DEFAULT_STRATEGY;
}

/** All defined strategies (useful for tests and iteration). */
export const ALL_STRATEGIES: readonly CharacterStrategy[] = Object.values(STRATEGY_MAP);
