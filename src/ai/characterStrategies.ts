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
