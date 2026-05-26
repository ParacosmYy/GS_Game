/**
 * Damage Scaling System — Table-based scaling with starter proration
 *
 * KOF2002 authentic damage scaling:
 * 1. Combo count determines the scaling tier
 * 2. Each attack type has a minimum damage floor
 * 3. Starter type applies proration to the entire combo
 * 4. DM attacks in combo take extra penalty
 *
 * This module is a pure data-driven system with no side effects.
 * The combat system calls these functions to compute scaled damage.
 */
import {
  COMBO_DAMAGE_SCALE,
  COMBO_MIN_SCALE,
  DM_COMBO_PENALTY,
} from './constants.js';
import { isDM, classify, AttackCategory } from './attackClassifier.js';

// ===== Attack Tier for Minimum Damage Floor =====

export type AttackTier = 'normal' | 'command' | 'special' | 'dm' | 'sdm';

/** Minimum damage floors as a percentage of base damage per tier */
export const DAMAGE_FLOORS: Record<AttackTier, number> = {
  normal: 0.10,   // 10% minimum for normals
  command: 0.12,  // 12% minimum for command normals
  special: 0.15,  // 15% minimum for specials
  dm: 0.25,       // 25% minimum for DM
  sdm: 0.30,      // 30% minimum for SDM/HSDM
};

/** Proration values by combo starter type */
export const STARTER_PRORATION: Record<string, number> = {
  light: 0.85,        // A/B normals start combo at 85%
  heavy: 1.0,         // C/D normals start combo at 100%
  jump_in: 0.9,       // Jump attacks start combo at 90%
  command_normal: 0.92, // Command normals start at 92%
  special: 0.80,      // Special moves as combo starters at 80%
  throw: 1.0,         // Throws don't scale
};

// ===== Scaling Table =====
// Maps combo count ranges to scaling multipliers
// This is the KOF2002 tier-based system:
// hits 1-3: 100%, 4-6: 85%, 7-9: 70%, 10+: 60% minimum

export const SCALING_TABLE: ReadonlyArray<{ maxHits: number; scale: number }> = [
  { maxHits: 3, scale: 1.0 },
  { maxHits: 6, scale: 0.85 },
  { maxHits: 9, scale: 0.70 },
  { maxHits: Infinity, scale: 0.60 },
];

// ===== Starter Classification =====

export type StarterType = 'light' | 'heavy' | 'jump_in' | 'command_normal' | 'special' | 'throw';

/**
 * Classify what type of attack started the combo.
 */
export function classifyStarter(attackType: string): StarterType {
  const cat = classify(attackType);

  if (cat === AttackCategory.THROW) return 'throw';
  if (cat === AttackCategory.DM) return 'special';
  if (cat === AttackCategory.SPECIAL) return 'special';

  // Jump attacks
  if (attackType.startsWith('JUMP_')) return 'jump_in';

  // Command normals
  if (cat === AttackCategory.COMMAND) return 'command_normal';

  // Light normals (A/B buttons)
  if (attackType.endsWith('_A') || attackType.endsWith('_B')) return 'light';

  // Heavy normals (C/D buttons)
  return 'heavy';
}

/**
 * Get the proration multiplier for a combo starter.
 */
export function getStarterProration(starterType: StarterType): number {
  return STARTER_PRORATION[starterType] ?? 1.0;
}

// ===== Attack Tier Classification =====

/**
 * Get the attack tier for minimum damage floor calculation.
 */
export function getAttackTier(attackType: string): AttackTier {
  if (attackType.startsWith('HSDM_')) return 'sdm';
  if (attackType.startsWith('SDM_')) return 'sdm';
  if (attackType.startsWith('DM_')) return 'dm';

  const cat = classify(attackType);
  if (cat === AttackCategory.SPECIAL) return 'special';
  if (cat === AttackCategory.COMMAND) return 'command';

  return 'normal';
}

/**
 * Get the minimum damage floor for a given attack tier.
 */
export function getDamageFloor(tier: AttackTier): number {
  return DAMAGE_FLOORS[tier];
}

// ===== Core Scaling Function =====

/**
 * Compute the combo scaling multiplier based on hit count.
 * Uses the tier-based table.
 */
export function getComboScale(comboCount: number): number {
  if (comboCount <= 1) return 1.0;

  for (const entry of SCALING_TABLE) {
    if (comboCount <= entry.maxHits) {
      return entry.scale;
    }
  }
  return COMBO_MIN_SCALE;
}

/**
 * Compute scaled damage for a hit in a combo.
 *
 * @param baseDamage - Raw damage of the attack
 * @param comboCount - Current combo hit count (1-based)
 * @param attackType - The attack type being used
 * @param starterType - What started the combo (for proration)
 * @returns Scaled damage amount
 */
export function computeScaledDamage(
  baseDamage: number,
  comboCount: number,
  attackType: string,
  starterType: StarterType = 'heavy',
): number {
  // First hit is always full damage
  if (comboCount <= 1) return baseDamage;

  // Get base scaling from table
  let scale = getComboScale(comboCount);

  // Apply starter proration (only after 3rd hit, KOF2002 style)
  if (comboCount > 3) {
    const proration = getStarterProration(starterType);
    scale *= proration;
  }

  // DM in combo penalty: extra -10%
  if (isDM(attackType)) {
    scale = Math.max(COMBO_MIN_SCALE, scale - DM_COMBO_PENALTY);
  }

  // Apply minimum damage floor
  const tier = getAttackTier(attackType);
  const floor = getDamageFloor(tier);
  scale = Math.max(scale, floor);

  return Math.max(1, Math.round(baseDamage * scale));
}

/**
 * Compute the damage for a specific hit in a combo with full context.
 * This is the main entry point for the combat system.
 *
 * @param baseDamage - Raw damage of the attack
 * @param comboHits - Number of hits so far in the combo (0-based)
 * @param attackType - The attack type being used
 * @param starterAttackType - What attack started the combo
 * @returns Final scaled damage
 */
export function scaleComboDamage(
  baseDamage: number,
  comboHits: number,
  attackType: string,
  starterAttackType: string = 'STAND_C',
): number {
  const comboCount = comboHits + 1; // Convert 0-based to 1-based
  const starter = classifyStarter(starterAttackType);
  return computeScaledDamage(baseDamage, comboCount, attackType, starter);
}

/**
 * Get a breakdown of how damage scaling will apply for debugging/display.
 */
export function getScalingBreakdown(
  baseDamage: number,
  comboCount: number,
  attackType: string,
  starterType: StarterType = 'heavy',
): {
  baseScale: number;
  proration: number;
  dmPenalty: number;
  floor: number;
  finalScale: number;
  scaledDamage: number;
} {
  const baseScale = getComboScale(comboCount);
  const proration = comboCount > 3 ? getStarterProration(starterType) : 1.0;
  const dmPenalty = isDM(attackType) ? DM_COMBO_PENALTY : 0;
  const tier = getAttackTier(attackType);
  const floor = getDamageFloor(tier);

  let scale = baseScale;
  if (comboCount > 3) scale *= proration;
  if (dmPenalty > 0) scale = Math.max(COMBO_MIN_SCALE, scale - dmPenalty);
  scale = Math.max(scale, floor);

  return {
    baseScale,
    proration,
    dmPenalty,
    floor,
    finalScale: scale,
    scaledDamage: Math.max(1, Math.round(baseDamage * scale)),
  };
}
