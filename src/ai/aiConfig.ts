/**
 * AI Difficulty & Spacing Config — extracted from advancedAI.ts
 * Pure data definitions for AI difficulty presets, range thresholds,
 * and character spacing profiles.
 */

// ─── Difficulty levels ───

export type AIDifficultyLevel = 'easy' | 'medium' | 'hard';

export interface AIDifficultyConfig {
  /** Frames of reaction delay before AI can act on new information */
  reactionDelay: number;
  /** Probability the AI drops a combo (0 = never drops, 1 = always drops) */
  comboDropRate: number;
  /** Probability the AI blocks an incoming attack (0..1) */
  blockRate: number;
  /** Probability the AI uses the correct anti-air move (0..1) */
  antiAirRate: number;
  /** Probability the AI manages meter wisely (0..1) */
  meterManagementRate: number;
  /** Probability the AI uses optimal spacing (0..1) */
  spacingAwareness: number;
  /** Probability the AI does wake-up pressure correctly (0..1) */
  okiQuality: number;
  /** Multiplied into the base 0-1 difficulty for general aggression */
  aggressionScale: number;
}

export const DIFFICULTY_PRESETS: Record<AIDifficultyLevel, AIDifficultyConfig> = {
  easy: {
    reactionDelay: 14,
    comboDropRate: 0.45,
    blockRate: 0.3,
    antiAirRate: 0.15,
    meterManagementRate: 0.1,
    spacingAwareness: 0.2,
    okiQuality: 0.15,
    aggressionScale: 0.4,
  },
  medium: {
    reactionDelay: 7,
    comboDropRate: 0.18,
    blockRate: 0.65,
    antiAirRate: 0.55,
    meterManagementRate: 0.45,
    spacingAwareness: 0.6,
    okiQuality: 0.5,
    aggressionScale: 0.7,
  },
  hard: {
    reactionDelay: 2,
    comboDropRate: 0.03,
    blockRate: 0.9,
    antiAirRate: 0.85,
    meterManagementRate: 0.85,
    spacingAwareness: 0.9,
    okiQuality: 0.85,
    aggressionScale: 1.0,
  },
};

/** Legacy scalar (0.0..1.0) to config, for backward compatibility */
export function difficultyScalarToConfig(d: number): AIDifficultyConfig {
  const clamp = Math.max(0, Math.min(1, d));
  return {
    reactionDelay: Math.round(2 + (1 - clamp) * 14),
    comboDropRate: Math.max(0, 0.5 - clamp * 0.5),
    blockRate: 0.2 + clamp * 0.7,
    antiAirRate: 0.1 + clamp * 0.75,
    meterManagementRate: 0.1 + clamp * 0.75,
    spacingAwareness: 0.15 + clamp * 0.75,
    okiQuality: 0.1 + clamp * 0.75,
    aggressionScale: 0.3 + clamp * 0.7,
  };
}

// ─── Range thresholds for AI strategy ───

export const RANGE_CLOSE = 80;
export const RANGE_MID = 180;
export const RANGE_FAR = 250;

/** Frame advantage thresholds for punish detection */
export const PUNISH_WINDOW_LARGE = 15;
export const PUNISH_WINDOW_MEDIUM = 8;
export const PUNISH_WINDOW_SMALL = 4;

/** Anti-air detection: max vertical distance to consider "jumping at" AI */
export const ANTIAIR_MAX_HEIGHT = 200;

// ─── Character spacing profiles ───

export interface CharacterSpacingProfile {
  preferredDistance: number;
  distanceTolerance: number;
  hasProjectile: boolean;
  antiAirType: 'dp' | 'crouchC' | 'standD';
}

export const SPACING_PROFILES: Record<string, CharacterSpacingProfile> = {
  iori:   { preferredDistance: 60,  distanceTolerance: 25, hasProjectile: true,  antiAirType: 'dp' },
  ryo:    { preferredDistance: 65,  distanceTolerance: 25, hasProjectile: true,  antiAirType: 'dp' },
  kyo:    { preferredDistance: 90,  distanceTolerance: 30, hasProjectile: true,  antiAirType: 'dp' },
  terry:  { preferredDistance: 95,  distanceTolerance: 30, hasProjectile: true,  antiAirType: 'dp' },
  kim:    { preferredDistance: 85,  distanceTolerance: 30, hasProjectile: false, antiAirType: 'dp' },
  kdash:  { preferredDistance: 90,  distanceTolerance: 25, hasProjectile: true,  antiAirType: 'dp' },
  kula:   { preferredDistance: 90,  distanceTolerance: 25, hasProjectile: true,  antiAirType: 'dp' },
  leona:  { preferredDistance: 85,  distanceTolerance: 25, hasProjectile: true,  antiAirType: 'dp' },
  robert: { preferredDistance: 95,  distanceTolerance: 30, hasProjectile: true,  antiAirType: 'dp' },
  athena: { preferredDistance: 160, distanceTolerance: 40, hasProjectile: true,  antiAirType: 'dp' },
  mai:    { preferredDistance: 130, distanceTolerance: 35, hasProjectile: true,  antiAirType: 'dp' },
  ralf:   { preferredDistance: 70,  distanceTolerance: 25, hasProjectile: false, antiAirType: 'crouchC' },
  clark:  { preferredDistance: 55,  distanceTolerance: 20, hasProjectile: false, antiAirType: 'crouchC' },
  joe:    { preferredDistance: 120, distanceTolerance: 35, hasProjectile: true,  antiAirType: 'dp' },
  andy:   { preferredDistance: 100, distanceTolerance: 30, hasProjectile: true,  antiAirType: 'dp' },
  billy:  { preferredDistance: 130, distanceTolerance: 35, hasProjectile: false, antiAirType: 'dp' },
  chang:  { preferredDistance: 80,  distanceTolerance: 30, hasProjectile: false, antiAirType: 'crouchC' },
  choi:   { preferredDistance: 70,  distanceTolerance: 25, hasProjectile: false, antiAirType: 'dp' },
  mature: { preferredDistance: 100, distanceTolerance: 30, hasProjectile: false, antiAirType: 'dp' },
  yashiro:{ preferredDistance: 65,  distanceTolerance: 25, hasProjectile: false, antiAirType: 'crouchC' },
  chris:  { preferredDistance: 90,  distanceTolerance: 30, hasProjectile: false, antiAirType: 'dp' },
  shermie:{ preferredDistance: 70,  distanceTolerance: 25, hasProjectile: false, antiAirType: 'crouchC' },
  vice:   { preferredDistance: 80,  distanceTolerance: 25, hasProjectile: false, antiAirType: 'dp' },
  yamazaki:{ preferredDistance: 85, distanceTolerance: 30, hasProjectile: false, antiAirType: 'dp' },
  xiangfei:{ preferredDistance: 75, distanceTolerance: 25, hasProjectile: false, antiAirType: 'dp' },
  kasumi: { preferredDistance: 80,  distanceTolerance: 25, hasProjectile: true,  antiAirType: 'dp' },
  mary:   { preferredDistance: 80,  distanceTolerance: 25, hasProjectile: false, antiAirType: 'crouchC' },
};

export const DEFAULT_SPACING: CharacterSpacingProfile = {
  preferredDistance: 90,
  distanceTolerance: 30,
  hasProjectile: false,
  antiAirType: 'dp',
};

// ─── Hash helpers (deterministic RNG) ───

export const AI_RNG_OFFSET = 0x811C9DC5;

export function mixHash(hash: number, value: number): number {
  hash ^= value >>> 0;
  return Math.imul(hash, 0x01000193) >>> 0;
}

export function mixString(hash: number, value: string): number {
  let next = hash;
  for (let i = 0; i < value.length; i++) {
    next = mixHash(next, value.charCodeAt(i));
  }
  return next;
}

export function mixBool(hash: number, value: boolean): number {
  return mixHash(hash, value ? 1 : 0);
}

export function mixFloat(hash: number, value: number, scale: number = 1000): number {
  return mixHash(hash, Math.round(value * scale));
}
