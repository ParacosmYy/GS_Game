/**
 * AdvancedAI -- Strategic, human-like AI with spacing, meter management,
 * combo recognition, anti-air specificity, wake-up pressure, and difficulty levels.
 *
 * This file extends the concepts from simpleAI.ts but is a standalone class.
 * It consumes the same combo route data from aiRoutes.ts.
 */
import type { Fighter } from '../entities/fighter.js';
import type { CharacterDefinition } from '../characters/types.js';
import type { ResolvedInput, PrevAttack } from '../input/inputResolver.js';
import { createPrevAttack } from '../input/inputResolver.js';
import { FighterState, AttackType } from '../core/types.js';
import type { PowerGauge, MaxModeState } from '../core/types.js';
import { SeededRNG } from '../core/prng.js';
import { COMBO_ROUTES, applyComboStep, routeComboSpecial } from './aiRoutes.js';
import type { ComboStep } from './aiRoutes.js';

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

const DIFFICULTY_PRESETS: Record<AIDifficultyLevel, AIDifficultyConfig> = {
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
function difficultyScalarToConfig(d: number): AIDifficultyConfig {
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

// ─── Character spacing profiles ───

export interface CharacterSpacingProfile {
  /** Preferred combat distance in pixels */
  preferredDistance: number;
  /** Distance tolerance band (+/-) */
  distanceTolerance: number;
  /** Whether this character prefers using projectiles at range */
  hasProjectile: boolean;
  /** Anti-air move type for this character */
  antiAirType: 'dp' | 'crouchC' | 'standD';
}

const SPACING_PROFILES: Record<string, CharacterSpacingProfile> = {
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

const DEFAULT_SPACING: CharacterSpacingProfile = {
  preferredDistance: 90,
  distanceTolerance: 30,
  hasProjectile: false,
  antiAirType: 'dp',
};

// ─── Combo tracking (which combos hit successfully) ───

interface ComboRecord {
  routeKey: string;
  hits: number;
  attempts: number;
}

// ─── AI action types ───

type AIAction = 'idle' | 'approach' | 'retreat' | 'attack' | 'block'
  | 'antiair' | 'throw' | 'special' | 'jumpIn' | 'okizeme' | 'guardCancel'
  | 'counterStance' | 'combo' | 'spaceControl' | 'poke' | 'projectile';

// ─── Hash helpers (deterministic RNG) ───

const AI_RNG_OFFSET = 0x811C9DC5;

function mixHash(hash: number, value: number): number {
  hash ^= value >>> 0;
  return Math.imul(hash, 0x01000193) >>> 0;
}

function mixString(hash: number, value: string): number {
  let next = hash;
  for (let i = 0; i < value.length; i++) {
    next = mixHash(next, value.charCodeAt(i));
  }
  return next;
}

function mixBool(hash: number, value: boolean): number {
  return mixHash(hash, value ? 1 : 0);
}

function mixFloat(hash: number, value: number, scale: number = 1000): number {
  return mixHash(hash, Math.round(value * scale));
}

// ─── Main class ───

export class AdvancedAI {
  private fighter: Fighter;
  private opponent: Fighter;
  private character: CharacterDefinition;
  private config: AIDifficultyConfig;
  /** Legacy scalar for throw escape probability etc. */
  private legacyDifficulty: number;
  gauge: PowerGauge | null = null;
  maxMode: MaxModeState | null = null;

  private prev: PrevAttack = createPrevAttack();
  private thinkCooldown = 0;
  private action: AIAction = 'idle';
  private actionFrames = 0;
  private comboStep = 0;
  private comboDelay = 0;
  private inCombo = false;
  private jumpInPhase = 0;
  private okiTimer = 0;

  // Spacing state
  private spacingProfile: CharacterSpacingProfile;
  private spacingAction = 'idle' as 'idle' | 'approach' | 'retreat' | 'hold';

  // Combo tracking
  private comboRecords: ComboRecord[] = [];
  private currentComboHits = 0;
  private currentComboKey = '';

  // Button edge tracking
  private prevA = false;
  private prevB = false;
  private prevC = false;
  private prevD = false;

  // Meter management state
  private lastMeterStocks = 0;

  constructor(
    fighter: Fighter,
    opponent: Fighter,
    character: CharacterDefinition,
    difficulty: AIDifficultyLevel | number = 'medium',
  ) {
    this.fighter = fighter;
    this.opponent = opponent;
    this.character = character;

    if (typeof difficulty === 'string') {
      this.config = DIFFICULTY_PRESETS[difficulty];
      // Map to legacy scalar for compatibility
      const legacyMap: Record<AIDifficultyLevel, number> = { easy: 0.3, medium: 0.6, hard: 0.95 };
      this.legacyDifficulty = legacyMap[difficulty];
    } else {
      this.config = difficultyScalarToConfig(difficulty);
      this.legacyDifficulty = difficulty;
    }

    this.spacingProfile = SPACING_PROFILES[fighter.charId] ?? DEFAULT_SPACING;
  }

  /** Generate ResolvedInput for this frame */
  getInput(): ResolvedInput {
    const f = this.fighter;
    const opp = this.opponent;
    const rng = this.createDecisionRng(1);
    this.thinkCooldown--;
    this.actionFrames--;
    if (this.comboDelay > 0) this.comboDelay--;

    // ── Observe ──
    const dist = Math.abs(f.x - opp.x);
    const facingOpp = (opp.x > f.x ? 1 : -1) === f.facing;
    const oppAttacking = opp.state === FighterState.STAND_ATTACK
      || opp.state === FighterState.CROUCH_ATTACK
      || opp.state === FighterState.AIR_ATTACK;
    const oppAirborne = opp.state === FighterState.JUMP
      || opp.state === FighterState.RUN_JUMP
      || opp.state === FighterState.HOP
      || opp.state === FighterState.HYPER_JUMP;
    const canAct = f.canAct();
    const isClose = dist < 80;
    const oppAttackPhase = (opp as Fighter & { attackPhase?: string }).attackPhase;
    const oppWhiffing = oppAttacking && !opp.hasHit && oppAttackPhase === 'recovery';
    const lowHp = f.health < f.maxHealth * 0.25;
    const oppLowHp = opp.health < opp.maxHealth * 0.25;
    const hasMeter = !!(this.gauge && this.gauge.stocks >= 1);

    // ── Track combo success ──
    if (this.inCombo) {
      if (f.hasHit) {
        this.currentComboHits++;
      }
      // If combo ended (opponent left hitstun or AI returned to idle)
      if (!this.inCombo || (this.comboStep === 0 && this.comboDelay <= 0 && !f.hasHit)) {
        this.recordComboResult();
      }
    }

    // ── Throw escape: highest priority ──
    if (f.isBeingThrown && f.throwEscapeTimer > 0
        && this.chance(rng, this.legacyDifficulty * 0.7)) {
      const base = this.emptyInput();
      base.throwAttack = true;
      base.throwAttackPressed = true;
      return base;
    }

    // ── Wakeup reversal ──
    if (f.state === FighterState.KNOCKDOWN && f.knockdownTimer <= 5 && dist < 100
        && this.chance(rng, this.legacyDifficulty * 0.6)) {
      const base = this.emptyInput();
      if (this.gauge && this.gauge.stocks >= 1) {
        base.forward = true; base.down = true;
        base.buttonC = true; base.buttonCPressed = true;
        this.action = 'special'; this.thinkCooldown = 8;
        return base;
      }
    }

    // ── Meter management: MAX activation strategy ──
    // Activate MAX when at low health (comeback mechanic) or when combo opportunity exists
    if (canAct && this.gauge && this.gauge.stocks >= 2 && !this.maxMode?.active
        && this.chance(rng, this.config.meterManagementRate)) {
      const shouldMAX = this.shouldActivateMAX(lowHp, dist, oppAttacking);
      if (shouldMAX) {
        const base = this.emptyInput();
        base.buttonB = true; base.buttonC = true;
        base.buttonBPressed = true; base.buttonCPressed = true;
        return base;
      }
    }

    // ── MAX activation during combo (BC cancel) ──
    if (this.inCombo && f.hasHit && canAct && this.gauge && this.gauge.stocks >= 2
      && !f.currentAttack?.toString().startsWith('DM_')
      && this.chance(rng, this.legacyDifficulty * 0.5)) {
      const base = this.emptyInput();
      base.buttonB = true; base.buttonC = true;
      base.buttonBPressed = true; base.buttonCPressed = true;
      this.inCombo = true; this.comboStep = 0;
      return base;
    }

    // ── Guard cancel while blocking ──
    if (f.state === FighterState.BLOCK && this.gauge && this.gauge.stocks >= 1) {
      const lowGauge = f.guardGauge < 30;
      const sustainedBlock = f.blockstunTimer > 8;
      const gcProb = lowGauge
        ? this.config.meterManagementRate * 0.6
        : sustainedBlock
          ? this.config.meterManagementRate * 0.3
          : 0;
      if (this.chance(rng, gcProb)) {
        this.action = 'guardCancel';
        this.actionFrames = 6;
      }
    }

    // ── Anti-air: react to opponent jumping ──
    if (oppAirborne && dist < 180 && canAct
        && this.chance(rng, this.config.antiAirRate)) {
      this.action = 'antiair';
      this.actionFrames = this.config.reactionDelay;
      this.thinkCooldown = this.config.reactionDelay;
      // Don't fall through to normal decide
      return this.generateInput('antiair', dist, facingOpp, canAct, oppAttacking, rng);
    }

    // ── Oki detection: opponent knocked down and close ──
    if (canAct && opp.state === FighterState.KNOCKDOWN && dist < 120
      && this.action !== 'okizeme' && this.chance(rng, this.config.okiQuality)) {
      this.action = 'okizeme';
      this.actionFrames = 30;
      this.okiTimer = 0;
    }

    // ── Dizzy punish ──
    if (canAct && opp.state === FighterState.DIZZY && dist < 150
      && this.action !== 'combo' && this.chance(rng, 0.85)) {
      this.action = 'combo';
      this.actionFrames = 40;
    }

    // ── Decide (at rate governed by reaction delay) ──
    if (this.thinkCooldown <= 0 && canAct) {
      this.thinkCooldown = this.config.reactionDelay;
      if (!this.inCombo && this.jumpInPhase === 0) {
        this.action = this.decide(dist, oppAttacking, oppAirborne, isClose, oppWhiffing, lowHp, oppLowHp, hasMeter, rng);
        this.actionFrames = this.config.reactionDelay;
        this.comboStep = 0;
        this.inCombo = false;
      }
    }

    const input = this.generateInput(this.action, dist, facingOpp, canAct, oppAttacking, rng);

    this.prevA = input.buttonA;
    this.prevB = input.buttonB;
    this.prevC = input.buttonC;
    this.prevD = input.buttonD;

    return input;
  }

  reset(): void {
    this.action = 'idle';
    this.thinkCooldown = 0;
    this.actionFrames = 0;
    this.comboStep = 0;
    this.comboDelay = 0;
    this.inCombo = false;
    this.jumpInPhase = 0;
    this.okiTimer = 0;
    this.spacingAction = 'idle';
    this.prev = createPrevAttack();
    // Keep combo records across rounds (experience persists)
  }

  /** Full reset including combo records */
  fullReset(): void {
    this.reset();
    this.comboRecords = [];
    this.currentComboHits = 0;
    this.currentComboKey = '';
  }

  // ═══════════════════════════════════════════
  // Decision engine
  // ═══════════════════════════════════════════

  private decide(
    dist: number,
    oppAttacking: boolean,
    oppAirborne: boolean,
    isClose: boolean,
    oppWhiffing: boolean,
    lowHp: boolean,
    oppLowHp: boolean,
    hasMeter: boolean,
    rng: SeededRNG,
  ): AIAction {
    const profile = this.spacingProfile;

    // ── Whiff punish: opponent missed → rush in ──
    if (oppWhiffing && dist < 200 && this.chance(rng, this.legacyDifficulty * 0.75)) {
      return dist < 90 ? 'attack' : 'approach';
    }

    // ── Counter stance: opponent attacking at mid range ──
    if (oppAttacking && dist < 120 && dist > 50 && this.character.getCounterConfig
      && this.chance(rng, this.legacyDifficulty * 0.25)) {
      return 'counterStance';
    }

    // ── Block incoming attacks ──
    if (oppAttacking && dist < 120
      && this.chance(rng, this.config.blockRate * (lowHp ? 1.0 : 0.95))) {
      return 'block';
    }

    // ── Spacing-aware positioning ──
    if (this.chance(rng, this.config.spacingAwareness)) {
      const spacingDecision = this.evaluateSpacing(dist, oppAttacking, oppLowHp, hasMeter, rng);
      if (spacingDecision !== null) return spacingDecision;
    }

    // ── Close range: combo, throw, pressure ──
    if (isClose) {
      return this.decideCloseRange(lowHp, oppLowHp, hasMeter, rng);
    }

    // ── Mid range ──
    if (dist < 180) {
      return this.decideMidRange(oppLowHp, hasMeter, dist, rng);
    }

    // ── Far range ──
    return this.decideFarRange(hasMeter, rng);
  }

  private evaluateSpacing(
    dist: number,
    oppAttacking: boolean,
    oppLowHp: boolean,
    hasMeter: boolean,
    rng: SeededRNG,
  ): AIAction | null {
    const profile = this.spacingProfile;
    const { preferredDistance, distanceTolerance, hasProjectile } = profile;
    const inRange = Math.abs(dist - preferredDistance) <= distanceTolerance;

    if (dist < preferredDistance - distanceTolerance) {
      // Too close for comfort -- retreat or poke
      this.spacingAction = 'retreat';
      if (oppAttacking) return 'block';
      // Close-range rush characters should NOT retreat; instead press with throw/poke
      if (preferredDistance < 75 && this.chance(rng, 0.4)) {
        return 'throw';
      }
      return this.chance(rng, 0.3) ? 'retreat' : 'poke';
    }

    if (dist > preferredDistance + distanceTolerance) {
      // Too far -- approach or projectile
      this.spacingAction = 'approach';
      if (hasProjectile && this.chance(rng, 0.45)) {
        return 'projectile';
      }
      if (this.chance(rng, 0.35)) return 'jumpIn';
      return 'approach';
    }

    // At preferred distance -- hold ground and poke or projectile
    this.spacingAction = 'hold';
    if (hasProjectile && this.chance(rng, 0.3)) return 'projectile';
    if (oppLowHp && hasMeter && this.chance(rng, 0.3)) return 'special';
    if (this.chance(rng, 0.25)) return 'poke';
    return null; // let standard logic decide
  }

  private decideCloseRange(
    lowHp: boolean,
    oppLowHp: boolean,
    hasMeter: boolean,
    rng: SeededRNG,
  ): AIAction {
    const r = rng.next();

    // Low HP: cautious mix
    if (lowHp) {
      if (r < 0.20) return 'retreat';
      if (r < 0.40) return 'block';
      if (r < 0.60) return 'attack';
      if (r < 0.75) return 'throw';
      return 'retreat';
    }

    // Opponent low HP with meter: go for the kill with DM combo
    if (oppLowHp && hasMeter) {
      if (r < 0.50) return 'attack';
      if (r < 0.70) return 'special';
      if (r < 0.85) return 'throw';
      return 'attack';
    }

    // Corner pressure
    const oppInCorner = this.opponent.x < 80 || this.opponent.x > 720;
    if (oppInCorner) {
      if (r < 0.45) return 'attack';
      if (r < 0.60) return 'throw';
      if (r < 0.80) return 'attack';
      return 'special';
    }

    // Standard close mix
    if (r < 0.40) return 'attack';
    if (r < 0.55) return 'throw';
    if (r < 0.70) return 'retreat';
    if (r < 0.80) return 'poke';
    return 'attack';
  }

  private decideMidRange(
    oppLowHp: boolean,
    hasMeter: boolean,
    dist: number,
    rng: SeededRNG,
  ): AIAction {
    const maxBonus = this.maxMode?.active ? 0.15 : 0;
    const r = rng.next();

    if (oppLowHp && hasMeter) {
      if (r < 0.25 + maxBonus) return 'approach';
      if (r < 0.40 + maxBonus) return 'jumpIn';
      if (r < 0.55 + maxBonus) return 'special';
      return 'attack';
    }
    if (r < 0.20 + maxBonus) return 'approach';
    if (r < 0.35 + maxBonus) return 'jumpIn';
    if (r < 0.50) return 'poke';
    if (r < 0.65) return 'special';
    if (r < 0.75 && this.spacingProfile.hasProjectile) return 'projectile';
    return 'idle';
  }

  private decideFarRange(hasMeter: boolean, rng: SeededRNG): AIAction {
    const r = rng.next();
    if (this.spacingProfile.hasProjectile && r < 0.35) return 'projectile';
    if (r < 0.55) return 'approach';
    if (r < 0.70) return 'jumpIn';
    if (r < 0.85) return 'special';
    return 'approach';
  }

  // ═══════════════════════════════════════════
  // Meter management
  // ═══════════════════════════════════════════

  private shouldActivateMAX(lowHp: boolean, dist: number, oppAttacking: boolean): boolean {
    // Strategy 1: Comeback mechanic -- activate MAX when health is critical
    if (lowHp && dist < 120) return true;

    // Strategy 2: Save meter for MAX activation when combo opportunity presents
    if (this.inCombo && this.fighter.hasHit) return true;

    // Strategy 3: Don't waste MAX activation when opponent is fullscreen away
    if (dist > 200) return false;

    // Strategy 4: Don't activate while being pressured (use GC instead)
    if (oppAttacking && this.fighter.state === FighterState.BLOCK) return false;

    return false;
  }

  // ═══════════════════════════════════════════
  // Combo tracking
  // ═══════════════════════════════════════════

  private recordComboResult(): void {
    if (this.currentComboKey && this.currentComboHits > 0) {
      const existing = this.comboRecords.find(r => r.routeKey === this.currentComboKey);
      if (existing) {
        existing.attempts++;
        existing.hits += this.currentComboHits;
      } else {
        this.comboRecords.push({
          routeKey: this.currentComboKey,
          hits: this.currentComboHits,
          attempts: 1,
        });
      }
      // Keep only last 20 combos to avoid unbounded growth
      if (this.comboRecords.length > 20) {
        this.comboRecords.shift();
      }
    }
    this.currentComboHits = 0;
    this.currentComboKey = '';
  }

  /** Get the success rate for a given route (0..1) */
  private getComboSuccessRate(routeKey: string): number {
    const record = this.comboRecords.find(r => r.routeKey === routeKey);
    if (!record || record.attempts === 0) return 0.5; // unknown = neutral
    return record.hits / (record.attempts * 5); // normalize: 5 hits per attempt = perfect
  }

  // ═══════════════════════════════════════════
  // Input generation
  // ═══════════════════════════════════════════

  private emptyInput(): ResolvedInput {
    return {
      up: false, down: false, forward: false, back: false,
      buttonA: false, buttonB: false, buttonC: false, buttonD: false,
      throwAttack: false,
      buttonAPressed: false, buttonBPressed: false,
      buttonCPressed: false, buttonDPressed: false,
      throwAttackPressed: false,
      punchPressed: false, kickPressed: false,
      rollPressed: false, blowbackPressed: false,
      punchJustReleased: false, kickJustReleased: false,
      startPressed: false,
    };
  }

  private generateInput(
    action: AIAction,
    dist: number,
    facingOpp: boolean,
    canAct: boolean,
    oppAttacking: boolean,
    rng: SeededRNG,
  ): ResolvedInput {
    const f = this.fighter;
    const base = this.emptyInput();

    if (!canAct && action !== 'block' && action !== 'guardCancel') return base;

    switch (action) {
      case 'approach':
        base.forward = true;
        if (dist > 150) base.forward = true;
        // Jump in occasionally from approach
        if (dist > 120 && this.chance(rng, 0.04 * this.config.aggressionScale)) {
          base.up = true;
          base.forward = true;
        }
        break;

      case 'retreat':
        base.back = true;
        if (this.chance(rng, 0.08)) base.up = true;
        break;

      case 'jumpIn': {
        const fIsAirborne = f.state === FighterState.JUMP || f.state === FighterState.RUN_JUMP
          || f.state === FighterState.HOP || f.state === FighterState.HYPER_JUMP;

        if (this.jumpInPhase === 0 && canAct) {
          base.up = true; base.forward = true;
          this.jumpInPhase = 1; this.inCombo = true;
          this.currentComboKey = 'jumpIn';
        } else if (this.jumpInPhase === 1 && fIsAirborne) {
          base.buttonC = true; base.buttonCPressed = true;
          base.punchPressed = true; this.jumpInPhase = 2;
        } else if (this.jumpInPhase === 2 && canAct) {
          this.jumpInPhase = 0;
          this.action = 'attack';
          this.comboStep = 0;
          this.inCombo = true;
          const route = this.getCurrentRoute();
          if (route.length > 0) {
            this.doApplyComboStep(route[0], base);
            this.comboStep = 1;
            this.comboDelay = route.length > 1 ? route[1].delay : 0;
          }
        } else if (this.jumpInPhase === 1) {
          base.up = true;
          base.forward = true;
        }
        break;
      }

      case 'attack': {
        const route = this.getCurrentRoute();

        if (this.inCombo && this.comboStep < route.length && this.comboDelay <= 0) {
          const dropCombo = this.chance(rng, this.config.comboDropRate);
          if (dropCombo) {
            this.inCombo = false;
            this.comboStep = 0;
            this.recordComboResult();
          } else {
            this.doApplyComboStep(route[this.comboStep], base);
            this.comboStep++;
            if (this.comboStep < route.length) {
              this.comboDelay = route[this.comboStep].delay;
            } else {
              this.inCombo = false;
              this.comboStep = 0;
            }
          }
        } else if (!this.inCombo) {
          if (dist < 80) {
            this.inCombo = true;
            this.comboStep = 0;
            this.currentComboKey = this.fighter.charId + '_ground';
            this.currentComboHits = 0;
            if (route.length > 0) {
              this.doApplyComboStep(route[0], base);
              this.comboStep = 1;
              this.comboDelay = route.length > 1 ? route[1].delay : 0;
            }
          } else {
            // Poke at range
            base.buttonB = true;
            base.buttonBPressed = true;
            base.kickPressed = true;
          }
        }
        break;
      }

      case 'poke':
        // Mid-range poke: use quick, safe normals
        if (dist < 120) {
          if (this.chance(rng, 0.5)) {
            base.buttonA = true; base.buttonAPressed = true; base.punchPressed = true;
          } else {
            base.buttonB = true; base.buttonBPressed = true; base.kickPressed = true;
          }
        } else {
          base.buttonB = true; base.buttonBPressed = true; base.kickPressed = true;
        }
        break;

      case 'projectile':
        if (canAct && this.spacingProfile.hasProjectile) {
          // QCF motion for projectile
          base.down = true;
          // The actual special move routing handles the motion detection
          if (this.chance(rng, 0.5)) {
            base.buttonA = true; base.buttonAPressed = true; base.punchPressed = true;
          } else {
            base.buttonC = true; base.buttonCPressed = true; base.punchPressed = true;
          }
        }
        break;

      case 'block':
        base.back = true;
        // Smart block: mix stand/crouch based on opponent state
        if (this.opponent.state === FighterState.CROUCH_ATTACK
          || this.opponent.state === FighterState.CROUCH) {
          base.down = true;
        } else if (this.opponent.state === FighterState.AIR_ATTACK) {
          // Air attack -> stand block
        } else {
          if (this.chance(rng, 0.4)) base.down = true;
        }
        // GC Roll when guard gauge is getting low
        if (f.guardGauge < 40 && this.gauge && this.gauge.stocks >= 1
          && this.chance(rng, 0.06 * this.config.meterManagementRate)) {
          base.buttonA = true;
          base.buttonB = true;
          base.rollPressed = true;
        }
        // GC CD when guard gauge critical
        if (f.guardGauge < 25 && this.gauge && this.gauge.stocks >= 1
          && this.chance(rng, 0.04 * this.config.meterManagementRate)) {
          base.buttonC = true;
          base.buttonD = true;
          base.blowbackPressed = true;
        }
        break;

      case 'guardCancel':
        if (this.gauge && this.gauge.stocks >= 1) {
          if (this.chance(rng, 0.65)) {
            base.buttonA = true;
            base.buttonB = true;
            base.rollPressed = true;
          } else {
            base.buttonC = true;
            base.buttonD = true;
            base.blowbackPressed = true;
          }
        }
        break;

      case 'counterStance': {
        if (canAct && this.character.getCounterConfig) {
          if (this.actionFrames > 4) {
            base.down = true;
          } else if (this.actionFrames > 2) {
            base.down = true;
            base.back = true;
          } else {
            base.back = true;
            base.buttonC = true;
            base.punchPressed = true;
          }
        }
        break;
      }

      case 'antiair': {
        const antiAirType = this.spacingProfile.antiAirType;
        if (canAct) {
          if (antiAirType === 'dp') {
            // DP motion: forward + button for uppercut-type move
            base.buttonC = true;
            base.buttonCPressed = true;
            base.punchPressed = true;
            if (this.chance(rng, 0.5)) base.forward = true;
          } else if (antiAirType === 'crouchC') {
            // Crouch C anti-air
            base.down = true;
            base.buttonC = true;
            base.buttonCPressed = true;
            base.punchPressed = true;
          } else {
            // Stand D anti-air
            base.buttonD = true;
            base.buttonDPressed = true;
            base.kickPressed = true;
          }
        } else if (f.state === FighterState.BLOCK || f.state === FighterState.HITSTUN || f.state === FighterState.DIZZY) {
          base.back = true;
          base.down = true;
        }
        break;
      }

      case 'throw':
        if (dist < 70 && canAct) {
          const nearWall = f.x > (f.facing === 1 ? 600 : 200);
          if (nearWall) base.back = true; else base.forward = true;
          base.throwAttack = true;
          base.throwAttackPressed = true;
        }
        break;

      case 'special':
        if (canAct) {
          // DM finisher in combo
          if (this.inCombo && f.hasHit && this.gauge && this.gauge.stocks >= 1
            && this.chance(rng, this.config.meterManagementRate * 0.7)) {
            const route = this.getCurrentRoute();
            const dmStep = route.find(s => s.attack.toLowerCase().includes('dm'));
            if (dmStep) {
              this.doApplyComboStep(dmStep, base);
              this.inCombo = false;
              break;
            }
          }
          if (this.chance(rng, 0.3)) {
            base.buttonC = true;
            base.buttonCPressed = true;
            base.punchPressed = true;
          } else {
            base.buttonD = true;
            base.buttonDPressed = true;
            base.kickPressed = true;
          }
        }
        break;

      case 'okizeme':
        this.okiTimer++;
        if (dist > 50) base.forward = true;
        // Taunt on oki (rare)
        if (this.okiTimer === 10 && canAct && dist > 120 && this.chance(rng, 0.12 * this.legacyDifficulty)) {
          base.startPressed = true;
          this.okiTimer = 99;
          this.action = 'idle';
          break;
        }
        // Wake-up pressure: mix between high/low/throw
        if (this.okiTimer > 18 && this.okiTimer < 45 && canAct) {
          const oppStillDown = this.opponent.state === FighterState.KNOCKDOWN;
          if (oppStillDown) {
            // Wait longer for opponent to stand
            break;
          }
          const r = rng.next();
          if (r < 0.35) {
            // High (stand C)
            base.buttonC = true; base.buttonCPressed = true; base.punchPressed = true;
          } else if (r < 0.65) {
            // Low (crouch D)
            base.down = true; base.buttonD = true; base.buttonDPressed = true; base.kickPressed = true;
          } else {
            // Throw (mix)
            base.forward = true;
            base.throwAttack = true; base.throwAttackPressed = true;
          }
          this.okiTimer = 99;
          this.action = 'idle';
        }
        if (this.opponent.state !== FighterState.KNOCKDOWN) {
          this.action = canAct && dist < 80 ? 'attack' : 'idle';
          this.okiTimer = 0;
        }
        break;

      case 'combo': {
        // Dizzy punish: full combo route
        const route = this.getCurrentRoute();
        if (this.inCombo && this.comboStep < route.length && this.comboDelay <= 0) {
          this.doApplyComboStep(route[this.comboStep], base);
          this.comboStep++;
          if (this.comboStep < route.length) {
            this.comboDelay = route[this.comboStep].delay;
          } else {
            this.inCombo = false;
            this.comboStep = 0;
          }
        } else if (!this.inCombo && dist < 120) {
          this.inCombo = true;
          this.comboStep = 0;
          this.currentComboKey = this.fighter.charId + '_dizzy';
          this.currentComboHits = 0;
          if (route.length > 0) {
            this.doApplyComboStep(route[0], base);
            this.comboStep = 1;
            this.comboDelay = route.length > 1 ? route[1].delay : 0;
          }
        }
        break;
      }

      case 'idle':
      default:
        break;
    }

    return base;
  }

  // ═══════════════════════════════════════════
  // Combo helpers
  // ═══════════════════════════════════════════

  private getCurrentRoute(): ComboStep[] {
    const charId = this.fighter.charId;
    return COMBO_ROUTES[charId] ?? COMBO_ROUTES['_default'];
  }

  private doApplyComboStep(step: ComboStep, base: ResolvedInput): void {
    applyComboStep(step, base);
  }

  /** Direct special move trigger (bypasses command buffer) for AI */
  triggerSpecial(): AttackType | null {
    if (!this.fighter.canAct()) return null;

    const rng = this.createDecisionRng(2);
    const input = this.getInput();
    const tick = 0;

    // DM usage strategy: save for combo finisher or low-HP opponent
    const oppLowHp = this.opponent.health < this.opponent.maxHealth * 0.25;
    const shouldUseDM = oppLowHp || this.inCombo;
    const dmProb = shouldUseDM && this.gauge && this.gauge.stocks >= 1
      ? 0.15 * this.config.meterManagementRate
      : 0.03;

    if (this.chance(rng, dmProb)) {
      const dmMap: Record<string, AttackType> = {
        kyo: AttackType.DM_OROCHINAGI,
        iori: AttackType.DM_YATAGARASU,
        terry: AttackType.DM_POWER_GEYSER,
        kim: AttackType.DM_PHOENIX_KICK,
        ryo: AttackType.DM_TEN_HA_OU,
        leona: AttackType.DM_V_SLASHER,
        kdash: AttackType.DM_CHAIN_SHOT,
        kula: AttackType.DM_FREEZE,
        robert: AttackType.DM_RYU_KO_RYU,
        athena: AttackType.DM_SHINING_CRYSTAL_BIT,
        mai: AttackType.DM_HAKA_OTOSHI,
        ralf: AttackType.DM_GALACTICA_PHANTOM,
        clark: AttackType.DM_ARGENTINE_DM,
        joe: AttackType.DM_SCREW_UPPER,
        andy: AttackType.DM_CHO_REPPA_DAN,
        billy: AttackType.DM_KAEN_SENPU_JIN,
        chang: AttackType.DM_TEKKYUU_DAI_BOUSOU,
        choi: AttackType.DM_SHIN_CHOU_HOUYOKU,
        mature: AttackType.DM_NOCTURNAL_LIGHT,
        yashiro: AttackType.DM_ARMAGEDDON_BUSTERS,
        chris: AttackType.DM_CHAIN_SLIDE_TOUCH,
        shermie: AttackType.DM_SHERMIE_CARNIVAL,
        vice: AttackType.DM_NEGATIVE_GAIN,
        yamazaki: AttackType.DM_GUILLOTINE,
        xiangfei: AttackType.DM_CHO_KA_RINGA,
        kasumi: AttackType.DM_CHO_MUKIGENZAN,
        mary: AttackType.DM_MARY_TYPHOON,
      };
      const sdmMap: Record<string, AttackType> = {
        kyo: AttackType.SDM_OROCHINAGI,
        iori: AttackType.SDM_YATAGARASU,
        terry: AttackType.SDM_POWER_GEYSER,
        kim: AttackType.SDM_PHOENIX_KICK,
        ryo: AttackType.SDM_TEN_HA_OU,
        leona: AttackType.SDM_V_SLASHER,
        kdash: AttackType.SDM_CHAIN_SHOT,
        kula: AttackType.SDM_FREEZE,
        robert: AttackType.SDM_RYU_KO_RYU,
        athena: AttackType.SDM_SHINING_CRYSTAL_BIT,
        mai: AttackType.SDM_HAKA_OTOSHI,
        ralf: AttackType.SDM_GALACTICA_PHANTOM,
        clark: AttackType.SDM_ARGENTINE_DM,
        joe: AttackType.SDM_SCREW_UPPER,
        andy: AttackType.SDM_CHO_REPPA_DAN,
        billy: AttackType.SDM_KAEN_SENPU_JIN,
        chang: AttackType.SDM_TEKKYUU_DAI_BOUSOU,
        choi: AttackType.SDM_SHIN_CHOU_HOUYOKU,
        mature: AttackType.SDM_NOCTURNAL_LIGHT,
        yashiro: AttackType.SDM_ARMAGEDDON_BUSTERS,
        chris: AttackType.SDM_CHAIN_SLIDE_TOUCH,
        shermie: AttackType.SDM_SHERMIE_CARNIVAL,
        vice: AttackType.SDM_NEGATIVE_GAIN,
        yamazaki: AttackType.SDM_GUILLOTINE,
        xiangfei: AttackType.SDM_CHO_KA_RINGA,
        kasumi: AttackType.SDM_CHO_MUKIGENZAN,
        mary: AttackType.SDM_MARY_TYPHOON,
      };
      const useSDM = this.maxMode?.active && this.gauge && this.gauge.stocks >= 2;
      const dm = useSDM
        ? sdmMap[this.fighter.charId]
        : dmMap[this.fighter.charId];
      if (dm) return dm;
    }

    // Character-specific combo special routing
    const charId = this.fighter.charId;
    if (this.inCombo) {
      const route = this.getCurrentRoute();
      if (this.comboStep > 0 && this.comboStep <= route.length) {
        const currentStep = route[Math.min(this.comboStep - 1, route.length - 1)];
        if (currentStep.type === 'special') {
          return routeComboSpecial(charId, currentStep.attack, this.character, input, tick);
        }
      }
    }

    // Standard character special routing
    const result = this.character.routeSpecial(input, {
      checkSpecial: () => {
        // Prefer projectile at range, DP up close
        const dist = Math.abs(this.fighter.x - this.opponent.x);
        if (dist > 150 && this.spacingProfile.hasProjectile) return AttackType.SPECIAL_PROJECTILE;
        return this.chance(rng, 0.5) ? AttackType.SPECIAL_PROJECTILE : AttackType.SPECIAL_UPPER;
      },
      checkDMMotion: () => null,
      checkKickSpecial: () => {
        const kickSpecials = [
          AttackType.KYO_75KAI,
          AttackType.KYO_RED_KICK,
          AttackType.TERRY_CRACK_SHOT,
          AttackType.KIM_HIENZAN,
        ];
        return kickSpecials[this.pickIndex(rng, kickSpecials.length)];
      },
      hasQCF: () => this.chance(rng, 0.7),
      hasQCB: () => this.chance(rng, 0.7),
      checkRekkaFollowQCF: () => null,
      checkRekkaFollowHCB: () => null,
      checkDokugamiFollow: () => null,
      checkBatsuyomiInput: () => false,
    } as unknown as Parameters<CharacterDefinition['routeSpecial']>[1], tick);

    return result;
  }

  // ═══════════════════════════════════════════
  // Deterministic RNG helpers
  // ═══════════════════════════════════════════

  private createDecisionRng(tag: number): SeededRNG {
    return new SeededRNG(this.buildDecisionSeed(tag));
  }

  private buildDecisionSeed(tag: number): number {
    let hash = AI_RNG_OFFSET;
    hash = mixString(hash, this.fighter.charId);
    hash = mixString(hash, this.opponent.charId);
    hash = mixString(hash, this.action);
    hash = mixHash(hash, tag);
    hash = mixHash(hash, this.thinkCooldown);
    hash = mixHash(hash, this.actionFrames);
    hash = mixHash(hash, this.comboStep);
    hash = mixHash(hash, this.comboDelay);
    hash = mixHash(hash, this.jumpInPhase);
    hash = mixHash(hash, this.okiTimer);
    hash = mixBool(hash, this.inCombo);
    hash = mixFloat(hash, this.legacyDifficulty, 1000);
    hash = mixFloat(hash, this.fighter.x);
    hash = mixFloat(hash, this.fighter.y);
    hash = mixFloat(hash, this.fighter.health);
    hash = mixFloat(hash, this.fighter.guardGauge);
    hash = mixString(hash, String(this.fighter.state));
    hash = mixHash(hash, this.fighter.facing);
    hash = mixBool(hash, this.fighter.hasHit);
    hash = mixBool(hash, this.fighter.isBeingThrown);
    hash = mixFloat(hash, this.opponent.x);
    hash = mixFloat(hash, this.opponent.y);
    hash = mixFloat(hash, this.opponent.health);
    hash = mixFloat(hash, this.opponent.guardGauge);
    hash = mixString(hash, String(this.opponent.state));
    hash = mixHash(hash, this.opponent.facing);
    hash = mixBool(hash, this.opponent.hasHit);
    hash = mixBool(hash, this.opponent.isBeingThrown);
    hash = mixBool(hash, this.gauge !== null);
    hash = mixHash(hash, this.gauge?.stocks ?? 0);
    hash = mixHash(hash, this.gauge?.meter ?? 0);
    hash = mixBool(hash, this.maxMode?.active ?? false);
    hash = mixHash(hash, this.maxMode?.timer ?? 0);
    hash = mixHash(hash, this.maxMode?.maxDuration ?? 0);
    return hash === 0 ? 1 : hash;
  }

  private chance(rng: SeededRNG, probability: number): boolean {
    if (probability <= 0) return false;
    if (probability >= 1) return true;
    return rng.next() < probability;
  }

  private pickIndex(rng: SeededRNG, length: number): number {
    if (length <= 1) return 0;
    return Math.min(length - 1, Math.floor(rng.next() * length));
  }
}
