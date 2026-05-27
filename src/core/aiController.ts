/**
 * AIController — situation-aware AI controller for CPU opponents and training dummies.
 *
 * Supports Ryo, Kyo, and Iori with character-specific movesets and combos.
 * Constructed with a characterId that selects the appropriate moveset:
 *   - ryo:  KO_HOU DP, KOOU projectile, HIEN pressure, HAOU counter
 *   - kyo:  ONIYAKI DP, YAMIBARAI projectile, ARAGAMI rekka pressure
 *   - iori: ONIYAKI DP, YAMIBARAI projectile, AOIHANA rekka, KUZUKAZE grab
 *
 * The decision engine uses the same input pipeline as a human player (no cheating).
 * Difficulty scaling uses reaction delay ticks and probability gates.
 */
import { FighterState, AttackType } from './types.js';
import type { Direction } from './types.js';
import { FRAME_DATA } from './constants.js';
import { SeededRNG } from './prng.js';

// ─── Public types ───

export interface AIDecision {
  action: 'idle' | 'approach' | 'retreat' | 'attack' | 'block' | 'jump' | 'special' | 'super';
  /** Specific attack type when action is attack/special/super */
  attackType?: AttackType;
  /** 0–1 how quickly to act (affects whether the AI waits or commits) */
  urgency: number;
}

/** Simplified view of a Fighter that the AI is allowed to read. */
export interface FighterSnapshot {
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  state: FighterState;
  facing: Direction;
  currentAttack: AttackType | null;
  attackPhase: 'startup' | 'active' | 'recovery' | 'none';
  attackFrame: number;
  hasHit: boolean;
  canAct: boolean;
  isGrounded: boolean;
  /** Remaining frames of hitstun / blockstun / knockdown */
  stunTimer: number;
  /** Whether fighter is in HITSTUN state */
  inHitstun: boolean;
  /** Whether fighter is in BLOCK state */
  inBlock: boolean;
  /** Remaining knockdown timer (for wake-up detection) */
  knockdownTimer: number;
}

// ─── Range bands (px) ───

const RANGE_CLOSE = 80;
const RANGE_MID   = 180;
const RANGE_FAR   = 250;

// ─── Difficulty presets ───

export interface AIDifficultyPreset {
  reactionDelay: number;   // ticks before AI re-evaluates
  blockRate: number;       // 0–1 probability of blocking incoming attacks
  antiAirRate: number;     // 0–1 probability of anti-air when opponent jumps
  comboDropRate: number;   // 0–1 probability of dropping a combo link
  throwEscapeRate: number; // 0–1 probability of mashing throw escape
  reversalRate: number;    // 0–1 probability of wake-up DP / super
  pokeRate: number;        // 0–1 probability of throwing out pokes at mid-range
  projectileRate: number;  // 0–1 probability of using projectile when available
  aggressionScale: number; // 0–1 general aggression multiplier
}

const DIFFICULTY: Record<string, AIDifficultyPreset> = {
  easy: {
    reactionDelay: 15,
    blockRate: 0.25,
    antiAirRate: 0.15,
    comboDropRate: 0.45,
    throwEscapeRate: 0.1,
    reversalRate: 0.05,
    pokeRate: 0.2,
    projectileRate: 0.15,
    aggressionScale: 0.35,
  },
  medium: {
    reactionDelay: 8,
    blockRate: 0.55,
    antiAirRate: 0.50,
    comboDropRate: 0.18,
    throwEscapeRate: 0.35,
    reversalRate: 0.30,
    pokeRate: 0.45,
    projectileRate: 0.35,
    aggressionScale: 0.60,
  },
  hard: {
    reactionDelay: 3,
    blockRate: 0.80,
    antiAirRate: 0.85,
    comboDropRate: 0.03,
    throwEscapeRate: 0.70,
    reversalRate: 0.65,
    pokeRate: 0.65,
    projectileRate: 0.50,
    aggressionScale: 0.85,
  },
  veryHard: {
    reactionDelay: 1,
    blockRate: 0.95,
    antiAirRate: 0.95,
    comboDropRate: 0.0,
    throwEscapeRate: 0.90,
    reversalRate: 0.85,
    pokeRate: 0.80,
    projectileRate: 0.60,
    aggressionScale: 1.0,
  },
};

/** Convert a 0–1 scalar into an interpolated difficulty preset. */
function scalarToDifficulty(d: number): AIDifficultyPreset {
  const clamped = Math.max(0, Math.min(1, d));
  const easy = DIFFICULTY.easy;
  const hard = DIFFICULTY.veryHard;
  return {
    reactionDelay: Math.round(easy.reactionDelay + (hard.reactionDelay - easy.reactionDelay) * clamped),
    blockRate: easy.blockRate + (hard.blockRate - easy.blockRate) * clamped,
    antiAirRate: easy.antiAirRate + (hard.antiAirRate - easy.antiAirRate) * clamped,
    comboDropRate: easy.comboDropRate + (hard.comboDropRate - easy.comboDropRate) * clamped,
    throwEscapeRate: easy.throwEscapeRate + (hard.throwEscapeRate - easy.throwEscapeRate) * clamped,
    reversalRate: easy.reversalRate + (hard.reversalRate - easy.reversalRate) * clamped,
    pokeRate: easy.pokeRate + (hard.pokeRate - easy.pokeRate) * clamped,
    projectileRate: easy.projectileRate + (hard.projectileRate - easy.projectileRate) * clamped,
    aggressionScale: easy.aggressionScale + (hard.aggressionScale - easy.aggressionScale) * clamped,
  };
}

// ─── Character-specific AI configuration ───

interface ComboRoute {
  steps: { attack: AttackType; delay: number }[];
}

interface CharacterAIMoveset {
  dpWeak: AttackType;
  dpStrong: AttackType;
  projectileWeak: AttackType;
  projectileStrong: AttackType;
  /** Mid-range pressure special (overhead / rush) */
  pressure: AttackType;
  /** Command throw or close mixup special */
  closeMixup?: AttackType;
  dmProjectile?: AttackType;
  dmRanbu?: AttackType;
  sdmProjectile?: AttackType;
  sdmRanbu?: AttackType;
  hsdm?: AttackType;
  simpleCombo: ComboRoute;
  mediumCombo: ComboRoute;
  hardCombo: ComboRoute;
}

const RYO_MOVESET: CharacterAIMoveset = {
  dpWeak: AttackType.RYO_KO_HOU,
  dpStrong: AttackType.RYO_KO_HOU_C,
  projectileWeak: AttackType.RYO_KOOU,
  projectileStrong: AttackType.RYO_KOOU_C,
  pressure: AttackType.RYO_HIEN,
  dmProjectile: AttackType.DM_TEN_HA_OU,
  sdmProjectile: AttackType.SDM_TEN_HA_OU,
  dmRanbu: AttackType.DM_RYUKO_RANBU,
  sdmRanbu: AttackType.SDM_RYUKO_RANBU,
  hsdm: AttackType.HSDM_RYUKO_RANBU,
  simpleCombo: {
    steps: [
      { attack: AttackType.STAND_A, delay: 0 },
      { attack: AttackType.RYO_KOOU, delay: 3 },
    ],
  },
  mediumCombo: {
    steps: [
      { attack: AttackType.CLOSE_C, delay: 0 },
      { attack: AttackType.RYO_KO_HOU, delay: 3 },
    ],
  },
  hardCombo: {
    steps: [
      { attack: AttackType.JUMP_C, delay: 0 },
      { attack: AttackType.STAND_C, delay: 4 },
      { attack: AttackType.RYO_KOOU, delay: 3 },
      { attack: AttackType.DM_TEN_HA_OU, delay: 4 },
    ],
  },
};

const KYO_MOVESET: CharacterAIMoveset = {
  dpWeak: AttackType.KYO_ONIYAKI,
  dpStrong: AttackType.KYO_ONIYAKI_C,
  projectileWeak: AttackType.KYO_YAMIBARAI,
  projectileStrong: AttackType.KYO_YAMIBARAI_C,
  pressure: AttackType.KYO_ARAGAMI,
  closeMixup: AttackType.KYO_DOKUGAMI,
  dmRanbu: AttackType.DM_OROCHINAGI,
  sdmRanbu: AttackType.SDM_OROCHINAGI,
  hsdm: AttackType.HSDM_OROCHINAGI,
  simpleCombo: {
    steps: [
      { attack: AttackType.STAND_A, delay: 0 },
      { attack: AttackType.KYO_ARAGAMI, delay: 3 },
    ],
  },
  mediumCombo: {
    steps: [
      { attack: AttackType.CLOSE_C, delay: 0 },
      { attack: AttackType.KYO_ONIYAKI, delay: 3 },
    ],
  },
  hardCombo: {
    steps: [
      { attack: AttackType.JUMP_C, delay: 0 },
      { attack: AttackType.STAND_C, delay: 4 },
      { attack: AttackType.KYO_ARAGAMI, delay: 3 },
      { attack: AttackType.SDM_OROCHINAGI, delay: 4 },
    ],
  },
};

const IORI_MOVESET: CharacterAIMoveset = {
  dpWeak: AttackType.IORI_ONIYAKI,
  dpStrong: AttackType.IORI_ONIYAKI_C,
  projectileWeak: AttackType.IORI_YAMIBARAI,
  projectileStrong: AttackType.IORI_YAMIBARAI_C,
  pressure: AttackType.IORI_AOIHANA,
  closeMixup: AttackType.IORI_KUZUKAZE,
  dmRanbu: AttackType.DM_YATAGARASU,
  sdmRanbu: AttackType.SDM_YATAGARASU,
  hsdm: AttackType.HSDM_YAOTOME,
  simpleCombo: {
    steps: [
      { attack: AttackType.STAND_A, delay: 0 },
      { attack: AttackType.IORI_AOIHANA, delay: 3 },
    ],
  },
  mediumCombo: {
    steps: [
      { attack: AttackType.CLOSE_C, delay: 0 },
      { attack: AttackType.IORI_ONIYAKI, delay: 3 },
    ],
  },
  hardCombo: {
    steps: [
      { attack: AttackType.JUMP_C, delay: 0 },
      { attack: AttackType.STAND_C, delay: 4 },
      { attack: AttackType.IORI_AOIHANA, delay: 3 },
      { attack: AttackType.DM_YATAGARASU, delay: 4 },
    ],
  },
};

const CHARACTER_MOVESETS: Record<string, CharacterAIMoveset> = {
  ryo: RYO_MOVESET,
  kyo: KYO_MOVESET,
  iori: IORI_MOVESET,
};

// ─── Main class ───

const AI_SEED_OFFSET = 0xA1C00000 >>> 0;

export class AIController {
  private difficulty: AIDifficultyPreset;
  private reactionDelay: number;
  private reactionTimer: number = 0;
  private currentDecision: AIDecision | null = null;
  private rng: SeededRNG;
  private moveset: CharacterAIMoveset;

  // Combo execution state
  private comboStep: number = 0;
  private comboDelay: number = 0;
  private activeCombo: ComboRoute | null = null;

  // State tracking
  private prevSelfState: FighterState = FighterState.IDLE;
  private prevOppState: FighterState = FighterState.IDLE;
  private frameCount: number = 0;

  constructor(difficulty: number = 0.5, characterId: string = 'ryo') {
    this.difficulty = scalarToDifficulty(difficulty);
    this.reactionDelay = this.difficulty.reactionDelay;
    this.reactionTimer = 0;
    this.rng = new SeededRNG(AI_SEED_OFFSET);
    this.moveset = CHARACTER_MOVESETS[characterId] ?? CHARACTER_MOVESETS.ryo;
  }

  /** Main entry: produces an AIDecision each tick. */
  update(self: FighterSnapshot, opponent: FighterSnapshot, distance: number): AIDecision {
    this.frameCount++;
    this.reactionTimer--;
    if (this.comboDelay > 0) this.comboDelay--;

    // ── Throw escape (highest priority) ──
    if (self.state === FighterState.IDLE || self.state === FighterState.HITSTUN) {
      // Not a throw situation
    }
    if (self.state === FighterState.THROW) {
      if (this.chance(this.difficulty.throwEscapeRate)) {
        return { action: 'attack', attackType: AttackType.THROW, urgency: 1.0 };
      }
    }

    // ── Wake-up reversal ──
    if (self.state === FighterState.KNOCKDOWN && self.knockdownTimer <= 5 && distance < 100) {
      if (this.chance(this.difficulty.reversalRate)) {
        return {
          action: 'special',
          attackType: this.moveset.dpStrong,
          urgency: 1.0,
        };
      }
    }

    // ── Anti-air ──
    if (self.canAct && this.isOpponentAirborne(opponent) && distance < 180) {
      if (this.chance(this.difficulty.antiAirRate)) {
        return {
          action: 'special',
          attackType: this.moveset.dpStrong,
          urgency: 0.9,
        };
      }
    }

    // ── Continue combo execution ──
    if (this.activeCombo && this.comboStep < this.activeCombo.steps.length) {
      if (this.comboDelay <= 0 && self.canAct) {
        const step = this.activeCombo.steps[this.comboStep];
        this.comboStep++;
        if (this.comboStep < this.activeCombo.steps.length) {
          this.comboDelay = this.activeCombo.steps[this.comboStep].delay;
        } else {
          this.activeCombo = null;
          this.comboStep = 0;
        }
        // Drop combo based on difficulty
        if (this.chance(this.difficulty.comboDropRate)) {
          this.activeCombo = null;
          this.comboStep = 0;
          return { action: 'idle', urgency: 0 };
        }
        const isSuper = step.attack.startsWith('DM_') || step.attack.startsWith('SDM_') || step.attack.startsWith('HSDM_');
        const isCharSpecial = step.attack.startsWith('RYO_') || step.attack.startsWith('KYO_') || step.attack.startsWith('IORI_');
        return {
          action: isSuper ? 'super' : isCharSpecial ? 'special' : 'attack',
          attackType: step.attack,
          urgency: 0.8,
        };
      }
      return { action: 'idle', urgency: 0 };
    }

    // ── Reaction-gated decision ──
    if (this.reactionTimer <= 0 && self.canAct) {
      this.reactionTimer = this.reactionDelay;
      this.currentDecision = this.decide(self, opponent, distance);
    }

    this.prevSelfState = self.state;
    this.prevOppState = opponent.state;

    return this.currentDecision ?? { action: 'idle', urgency: 0 };
  }

  reset(): void {
    this.reactionTimer = 0;
    this.currentDecision = null;
    this.comboStep = 0;
    this.comboDelay = 0;
    this.activeCombo = null;
    this.prevSelfState = FighterState.IDLE;
    this.prevOppState = FighterState.IDLE;
    this.frameCount = 0;
  }

  // ═══════════════════════════════════════════
  // Decision engine
  // ═══════════════════════════════════════════

  private decide(self: FighterSnapshot, opp: FighterSnapshot, dist: number): AIDecision {
    const oppAttacking = opp.state === FighterState.STAND_ATTACK
      || opp.state === FighterState.CROUCH_ATTACK
      || opp.state === FighterState.AIR_ATTACK;
    const oppAirborne = this.isOpponentAirborne(opp);
    const oppInRecovery = oppAttacking && opp.attackPhase === 'recovery' && !opp.hasHit;
    const selfInCorner = self.x < 80 || self.x > (1400 - 80);
    const oppInCorner = opp.x < 80 || opp.x > (1400 - 80);
    const selfLowHp = self.health < self.maxHealth * 0.25;
    const oppLowHp = opp.health < opp.maxHealth * 0.25;

    // ── Whiff punish ──
    if (oppInRecovery && dist < 200) {
      const punishWindow = this.remainingRecoveryFrames(opp);
      if (punishWindow >= 8 && dist < 120) {
        if (dist < RANGE_CLOSE) {
          this.startCombo(this.moveset.mediumCombo);
          return { action: 'attack', attackType: AttackType.CLOSE_C, urgency: 0.9 };
        }
        return { action: 'attack', attackType: AttackType.STAND_C, urgency: 0.85 };
      }
      if (punishWindow >= 4 && dist < 150) {
        return { action: 'attack', attackType: AttackType.STAND_A, urgency: 0.8 };
      }
    }

    // ── Block incoming attacks ──
    if (oppAttacking && dist < 120) {
      const blockChance = selfLowHp ? this.difficulty.blockRate * 1.1 : this.difficulty.blockRate;
      if (this.chance(Math.min(1, blockChance))) {
        return { action: 'block', urgency: 0.9 };
      }
    }

    // ── Self in corner: escape attempts ──
    if (selfInCorner && dist < RANGE_MID) {
      if (this.chance(this.difficulty.aggressionScale * 0.4)) {
        return { action: 'special', attackType: this.moveset.dpWeak, urgency: 0.7 };
      }
      if (this.chance(0.3)) {
        return { action: 'jump', urgency: 0.6 };
      }
      return { action: 'block', urgency: 0.7 };
    }

    // ── Close range (< 80px) ──
    if (dist < RANGE_CLOSE) {
      return this.decideCloseRange(self, opp, oppAttacking, oppInCorner, oppLowHp, dist);
    }

    // ── Mid range (80–180px) ──
    if (dist < RANGE_MID) {
      return this.decideMidRange(self, opp, oppAttacking, oppAirborne, oppInCorner, dist);
    }

    // ── Far range (> 180px) ──
    return this.decideFarRange(self, opp, dist);
  }

  private decideCloseRange(
    self: FighterSnapshot,
    opp: FighterSnapshot,
    oppAttacking: boolean,
    oppInCorner: boolean,
    oppLowHp: boolean,
    dist: number,
  ): AIDecision {
    const r = this.rng.next();
    const aggro = this.difficulty.aggressionScale;

    // If opponent is attacking and we're close, block
    if (oppAttacking && this.chance(this.difficulty.blockRate)) {
      return { action: 'block', urgency: 0.9 };
    }

    // Opponent in corner: pressure with stand_C -> special cancel
    if (oppInCorner) {
      if (r < 0.4 + aggro * 0.2) {
        this.startCombo(this.moveset.mediumCombo);
        return { action: 'attack', attackType: AttackType.CLOSE_C, urgency: 0.85 };
      }
      if (r < 0.6 + aggro * 0.1) {
        return { action: 'attack', attackType: AttackType.THROW_FORWARD, urgency: 0.7 };
      }
      return { action: 'special', attackType: this.moveset.pressure, urgency: 0.65 };
    }

    // Opponent low HP: go for kill
    if (oppLowHp) {
      if (r < 0.5) {
        this.startCombo(this.moveset.mediumCombo);
        return { action: 'attack', attackType: AttackType.CLOSE_C, urgency: 0.9 };
      }
      if (r < 0.7) {
        return { action: 'special', attackType: this.moveset.dpStrong, urgency: 0.85 };
      }
      if (r < 0.85 && this.moveset.closeMixup) {
        return { action: 'special', attackType: this.moveset.closeMixup, urgency: 0.8 };
      }
      return { action: 'attack', attackType: AttackType.THROW_FORWARD, urgency: 0.75 };
    }

    // Standard close mix
    const attackP = 0.3 + aggro * 0.2;
    const throwP = attackP + 0.15 + aggro * 0.05;
    const specialP = throwP + 0.1;
    const retreatP = specialP + Math.max(0.05, 0.2 - aggro * 0.15);

    if (r < attackP) {
      this.startCombo(this.moveset.simpleCombo);
      return { action: 'attack', attackType: AttackType.CLOSE_A, urgency: 0.7 };
    }
    if (r < throwP) {
      return { action: 'attack', attackType: AttackType.THROW_FORWARD, urgency: 0.65 };
    }
    if (r < specialP) {
      return { action: 'special', attackType: this.moveset.pressure, urgency: 0.6 };
    }
    if (r < retreatP) {
      return { action: 'retreat', urgency: 0.5 };
    }
    return { action: 'attack', attackType: AttackType.CLOSE_C, urgency: 0.7 };
  }

  private decideMidRange(
    self: FighterSnapshot,
    opp: FighterSnapshot,
    oppAttacking: boolean,
    oppAirborne: boolean,
    oppInCorner: boolean,
    dist: number,
  ): AIDecision {
    const r = this.rng.next();
    const aggro = this.difficulty.aggressionScale;

    // Poke at mid range
    if (this.chance(this.difficulty.pokeRate)) {
      if (r < 0.4) {
        return { action: 'attack', attackType: AttackType.STAND_A, urgency: 0.6 };
      }
      if (r < 0.7) {
        return { action: 'attack', attackType: AttackType.STAND_C, urgency: 0.55 };
      }
    }

    // Projectile at mid range occasionally
    if (this.chance(this.difficulty.projectileRate * 0.5)) {
      return { action: 'special', attackType: this.moveset.projectileWeak, urgency: 0.5 };
    }

    // Approach
    if (r < 0.3 + aggro * 0.2) {
      return { action: 'approach', urgency: 0.5 };
    }

    // Jump in
    if (r < 0.5 + aggro * 0.1) {
      return { action: 'jump', urgency: 0.45 };
    }

    // Wait
    return { action: 'idle', urgency: 0.2 };
  }

  private decideFarRange(
    self: FighterSnapshot,
    opp: FighterSnapshot,
    dist: number,
  ): AIDecision {
    const r = this.rng.next();

    // Projectile at far range
    if (this.chance(this.difficulty.projectileRate)) {
      return { action: 'special', attackType: this.moveset.projectileStrong, urgency: 0.5 };
    }

    // Jump-in attempt
    if (r < 0.3) {
      return { action: 'jump', urgency: 0.4 };
    }

    // Approach
    return { action: 'approach', urgency: 0.45 };
  }

  // ═══════════════════════════════════════════
  // Helpers
  // ═══════════════════════════════════════════

  private startCombo(route: ComboRoute): void {
    this.activeCombo = route;
    this.comboStep = 0;
    this.comboDelay = 0;
  }

  private isOpponentAirborne(opp: FighterSnapshot): boolean {
    return opp.state === FighterState.JUMP
      || opp.state === FighterState.RUN_JUMP
      || opp.state === FighterState.HOP
      || opp.state === FighterState.HYPER_JUMP
      || opp.state === FighterState.AIR_ATTACK;
  }

  /** Estimate remaining recovery frames from opponent's current attack. */
  private remainingRecoveryFrames(opp: FighterSnapshot): number {
    if (!opp.currentAttack) return 0;
    const fd = FRAME_DATA[opp.currentAttack as keyof typeof FRAME_DATA];
    if (!fd) return 0;
    const totalRecovery = fd.recovery as number;
    // If in recovery phase, attackFrame indexes into recovery
    if (opp.attackPhase === 'recovery') {
      return Math.max(0, totalRecovery - opp.attackFrame);
    }
    // If still in startup/active, full recovery remains
    return totalRecovery;
  }

  private chance(probability: number): boolean {
    if (probability <= 0) return false;
    if (probability >= 1) return true;
    return this.rng.next() < probability;
  }

  /** Get difficulty preset (useful for tests). */
  getDifficultyPreset(): AIDifficultyPreset {
    return { ...this.difficulty };
  }
}

// ─── Snapshot construction ───

/** Create a FighterSnapshot from a Fighter instance. */
export function createFighterSnapshot(fighter: {
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  state: FighterState;
  facing: Direction;
  currentAttack: AttackType | null;
  attackPhase: string;
  attackFrame: number;
  hasHit: boolean;
  canAct(): boolean;
  isGrounded(): boolean;
  hitstunTimer: number;
  blockstunTimer: number;
  knockdownTimer: number;
  isBeingThrown: boolean;
}): FighterSnapshot {
  return {
    x: fighter.x,
    y: fighter.y,
    health: fighter.health,
    maxHealth: fighter.maxHealth,
    state: fighter.state,
    facing: fighter.facing,
    currentAttack: fighter.currentAttack,
    attackPhase: fighter.attackPhase as FighterSnapshot['attackPhase'],
    attackFrame: fighter.attackFrame,
    hasHit: fighter.hasHit,
    canAct: fighter.canAct(),
    isGrounded: fighter.isGrounded(),
    stunTimer: fighter.hitstunTimer + fighter.blockstunTimer,
    inHitstun: fighter.state === FighterState.HITSTUN,
    inBlock: fighter.state === FighterState.BLOCK,
    knockdownTimer: fighter.knockdownTimer,
  };
}

// ─── Decision → Input conversion ───

/**
 * Convert an AIDecision into a ResolvedInput that can be fed to
 * FighterController.update(). This keeps the AI honest — it goes
 * through the same input pipeline as a human player.
 */
export function aiDecisionToInput(
  decision: AIDecision,
  facing: Direction,
  distance: number,
): {
  up: boolean;
  down: boolean;
  forward: boolean;
  back: boolean;
  buttonA: boolean;
  buttonB: boolean;
  buttonC: boolean;
  buttonD: boolean;
  throwAttack: boolean;
  burst: boolean;
  buttonAPressed: boolean;
  buttonBPressed: boolean;
  buttonCPressed: boolean;
  buttonDPressed: boolean;
  throwAttackPressed: boolean;
  burstPressed: boolean;
  punchPressed: boolean;
  kickPressed: boolean;
  rollPressed: boolean;
  blowbackPressed: boolean;
  punchJustReleased: boolean;
  kickJustReleased: boolean;
  startPressed: boolean;
} {
  const base = {
    up: false, down: false, forward: false, back: false,
    buttonA: false, buttonB: false, buttonC: false, buttonD: false,
    throwAttack: false, burst: false,
    buttonAPressed: false, buttonBPressed: false,
    buttonCPressed: false, buttonDPressed: false,
    throwAttackPressed: false, burstPressed: false,
    punchPressed: false, kickPressed: false,
    rollPressed: false, blowbackPressed: false,
    punchJustReleased: false, kickJustReleased: false,
    startPressed: false,
  };

  switch (decision.action) {
    case 'approach':
      base.forward = true;
      break;

    case 'retreat':
      base.back = true;
      break;

    case 'jump':
      base.up = true;
      base.forward = true;
      break;

    case 'block':
      base.back = true;
      // Crouch block sometimes for low protection
      if (distance < RANGE_CLOSE) {
        base.down = true;
      }
      break;

    case 'attack':
      applyAttackInput(decision.attackType, base, distance);
      break;

    case 'special':
      applySpecialInput(decision.attackType, base);
      break;

    case 'super':
      applySuperInput(decision.attackType, base);
      break;

    case 'idle':
    default:
      break;
  }

  return base;
}

function applyAttackInput(
  attackType: AttackType | undefined,
  base: ReturnType<typeof aiDecisionToInput>,
  distance: number,
): void {
  if (!attackType) {
    // Default: poke based on distance
    if (distance < RANGE_CLOSE) {
      base.buttonA = true; base.buttonAPressed = true; base.punchPressed = true;
    } else {
      base.buttonB = true; base.buttonBPressed = true; base.kickPressed = true;
    }
    return;
  }

  switch (attackType) {
    case AttackType.CLOSE_A:
    case AttackType.STAND_A:
      base.buttonA = true; base.buttonAPressed = true; base.punchPressed = true;
      break;
    case AttackType.CLOSE_B:
    case AttackType.STAND_B:
      base.buttonB = true; base.buttonBPressed = true; base.kickPressed = true;
      break;
    case AttackType.CLOSE_C:
    case AttackType.STAND_C:
      base.buttonC = true; base.buttonCPressed = true; base.punchPressed = true;
      break;
    case AttackType.CLOSE_D:
    case AttackType.STAND_D:
      base.buttonD = true; base.buttonDPressed = true; base.kickPressed = true;
      break;
    case AttackType.JUMP_C:
      base.up = true; base.forward = true;
      base.buttonC = true; base.buttonCPressed = true; base.punchPressed = true;
      break;
    case AttackType.CROUCH_A:
      base.down = true; base.buttonA = true; base.buttonAPressed = true; base.punchPressed = true;
      break;
    case AttackType.THROW:
    case AttackType.THROW_FORWARD:
      base.forward = true; base.throwAttack = true; base.throwAttackPressed = true;
      break;
    case AttackType.THROW_BACK:
      base.back = true; base.throwAttack = true; base.throwAttackPressed = true;
      break;
    default:
      base.buttonC = true; base.buttonCPressed = true; base.punchPressed = true;
      break;
  }
}

function applySpecialInput(
  attackType: AttackType | undefined,
  base: ReturnType<typeof aiDecisionToInput>,
): void {
  if (!attackType) {
    // Default special: QCF + C
    base.down = true; base.buttonC = true; base.buttonCPressed = true; base.punchPressed = true;
    return;
  }

  switch (attackType) {
    case AttackType.RYO_KOOU:
      // QCF + A (虎煌 weak)
      base.down = true;
      base.buttonA = true; base.buttonAPressed = true; base.punchPressed = true;
      break;
    case AttackType.RYO_KOOU_C:
      // QCF + C (虎煌 strong)
      base.down = true;
      base.buttonC = true; base.buttonCPressed = true; base.punchPressed = true;
      break;
    case AttackType.RYO_KO_HOU:
      // DP + A (虎咆 weak)
      base.forward = true; base.down = true;
      base.buttonA = true; base.buttonAPressed = true; base.punchPressed = true;
      break;
    case AttackType.RYO_KO_HOU_C:
      // DP + C (虎咆 strong)
      base.forward = true; base.down = true;
      base.buttonC = true; base.buttonCPressed = true; base.punchPressed = true;
      break;
    case AttackType.RYO_HIEN:
      // QCB + D (飛燕疾風脚)
      base.back = true; base.down = true;
      base.buttonD = true; base.buttonDPressed = true; base.kickPressed = true;
      break;
    case AttackType.RYO_HAOU:
      // QCF + B (霸王翔吼拳 — D版路由到KOOUKEN_D)
      base.down = true;
      base.buttonB = true; base.buttonBPressed = true; base.kickPressed = true;
      break;
    case AttackType.RYO_KOOUKEN_D:
      // QCF + D (虎煌拳D版 — 重飞行道具)
      base.down = true;
      base.buttonD = true; base.buttonDPressed = true; base.kickPressed = true;
      break;
    case AttackType.RYO_ZANRETSU_KEN:
      // QCB + P (斩裂拳 — 多段连打)
      base.back = true; base.down = true;
      base.buttonA = true; base.buttonAPressed = true; base.punchPressed = true;
      break;

    // ── Kyo specials ──
    case AttackType.KYO_ONIYAKI:
      // DP + A (鬼焼き weak)
      base.forward = true; base.down = true;
      base.buttonA = true; base.buttonAPressed = true; base.punchPressed = true;
      break;
    case AttackType.KYO_ONIYAKI_C:
      // DP + C (鬼焼き strong)
      base.forward = true; base.down = true;
      base.buttonC = true; base.buttonCPressed = true; base.punchPressed = true;
      break;
    case AttackType.KYO_YAMIBARAI:
      // QCF + A (暗払い weak)
      base.down = true;
      base.buttonA = true; base.buttonAPressed = true; base.punchPressed = true;
      break;
    case AttackType.KYO_YAMIBARAI_C:
      // QCF + C (暗払い strong)
      base.down = true;
      base.buttonC = true; base.buttonCPressed = true; base.punchPressed = true;
      break;
    case AttackType.KYO_ARAGAMI:
      // QCF + A (荒咬み rekka)
      base.down = true;
      base.buttonA = true; base.buttonAPressed = true; base.punchPressed = true;
      break;
    case AttackType.KYO_DOKUGAMI:
      // QCF + C (毒咬み C rekka)
      base.down = true;
      base.buttonC = true; base.buttonCPressed = true; base.punchPressed = true;
      break;

    // ── Iori specials ──
    case AttackType.IORI_ONIYAKI:
      // DP + A (鬼焼き weak)
      base.forward = true; base.down = true;
      base.buttonA = true; base.buttonAPressed = true; base.punchPressed = true;
      break;
    case AttackType.IORI_ONIYAKI_C:
      // DP + C (鬼焼き strong)
      base.forward = true; base.down = true;
      base.buttonC = true; base.buttonCPressed = true; base.punchPressed = true;
      break;
    case AttackType.IORI_YAMIBARAI:
      // QCF + A (闇払い weak)
      base.down = true;
      base.buttonA = true; base.buttonAPressed = true; base.punchPressed = true;
      break;
    case AttackType.IORI_YAMIBARAI_C:
      // QCF + C (闇払い strong)
      base.down = true;
      base.buttonC = true; base.buttonCPressed = true; base.punchPressed = true;
      break;
    case AttackType.IORI_AOIHANA:
      // QCB + A (葵花 A rekka)
      base.back = true; base.down = true;
      base.buttonA = true; base.buttonAPressed = true; base.punchPressed = true;
      break;
    case AttackType.IORI_AOIHANA_C:
      // QCB + C (葵花 C rekka)
      base.back = true; base.down = true;
      base.buttonC = true; base.buttonCPressed = true; base.punchPressed = true;
      break;
    case AttackType.IORI_KOTOTSUKI:
      // HCF + B (琴月陰 weak)
      base.down = true;
      base.buttonB = true; base.buttonBPressed = true; base.kickPressed = true;
      break;
    case AttackType.IORI_KOTOTSUKI_D:
      // HCF + D (琴月陰 strong)
      base.down = true;
      base.buttonD = true; base.buttonDPressed = true; base.kickPressed = true;
      break;
    case AttackType.IORI_KUZUKAZE:
      // HCF + P (屑風 command grab)
      base.down = true;
      base.buttonC = true; base.buttonCPressed = true; base.punchPressed = true;
      break;
    default:
      base.down = true;
      base.buttonC = true; base.buttonCPressed = true; base.punchPressed = true;
      break;
  }
}

function applySuperInput(
  attackType: AttackType | undefined,
  base: ReturnType<typeof aiDecisionToInput>,
): void {
  if (!attackType) {
    // Default super: double QCF + C
    base.down = true;
    base.buttonC = true; base.buttonCPressed = true; base.punchPressed = true;
    return;
  }

  switch (attackType) {
    // ── Ryo DM/SDM/HSDM ──
    case AttackType.DM_TEN_HA_OU:
    case AttackType.SDM_TEN_HA_OU:
      // Double QCF + C (天地霸煌拳)
      base.down = true;
      base.buttonC = true; base.buttonCPressed = true; base.punchPressed = true;
      break;
    case AttackType.DM_RYUKO_RANBU:
    case AttackType.SDM_RYUKO_RANBU:
    case AttackType.HSDM_RYUKO_RANBU:
      // QCF, HCB + C (龍虎乱舞)
      base.down = true;
      base.buttonC = true; base.buttonCPressed = true; base.punchPressed = true;
      break;

    // ── Kyo DM/SDM/HSDM ──
    case AttackType.SDM_OROCHINAGI:
    case AttackType.HSDM_OROCHINAGI:
      // QCF x2 + C (大蛇薙)
      base.down = true;
      base.buttonC = true; base.buttonCPressed = true; base.punchPressed = true;
      break;

    // ── Iori DM/SDM/HSDM ──
    case AttackType.DM_YATAGARASU:
    case AttackType.SDM_YATAGARASU:
      // QCF x2 + C (八咫烏)
      base.down = true;
      base.buttonC = true; base.buttonCPressed = true; base.punchPressed = true;
      break;
    case AttackType.HSDM_YAOTOME:
      // QCF x2 + C (八稚女 HSDM)
      base.down = true;
      base.buttonC = true; base.buttonCPressed = true; base.punchPressed = true;
      break;

    default:
      base.down = true;
      base.buttonC = true; base.buttonCPressed = true; base.punchPressed = true;
      break;
  }
}
