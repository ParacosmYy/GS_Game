/**
 * SimpleAI — 轻量级格斗AI
 *
 * 策略:
 *   远距离: 接近 + 偶尔发波
 *   中距离: 试探poke (stand A/B)
 *   近距离: 连段 (close C → special) / 投技
 *   防御: 对手攻击时自动防御 + 偶尔GC Roll
 *   对空: 对手跳跃时用升龙/对空
 *
 * AI直接生成 ResolvedInput 馈入 FighterController，
 * 必杀技通过 CharacterDefinition 路由直接触发 (跳过指令缓冲)。
 */
import type { Fighter } from '../entities/fighter.js';
import type { CharacterDefinition } from '../characters/types.js';
import type { ResolvedInput, PrevAttack } from '../input/inputResolver.js';
import { createPrevAttack } from '../input/inputResolver.js';
import { FighterState, AttackType } from '../core/types.js';

type AIAction = 'idle' | 'approach' | 'retreat' | 'attack' | 'block' | 'antiair' | 'throw' | 'special';

export class SimpleAI {
  private fighter: Fighter;
  private opponent: Fighter;
  private character: CharacterDefinition;
  private difficulty: number; // 0.0 ~ 1.0 reaction speed/aggression

  private prev: PrevAttack = createPrevAttack();
  private thinkCooldown = 0;
  private action: AIAction = 'idle';
  private actionFrames = 0;
  private comboStep = 0;

  // Button edge tracking
  private prevA = false;
  private prevB = false;
  private prevC = false;
  private prevD = false;

  constructor(
    fighter: Fighter,
    opponent: Fighter,
    character: CharacterDefinition,
    difficulty: number = 0.6,
  ) {
    this.fighter = fighter;
    this.opponent = opponent;
    this.character = character;
    this.difficulty = difficulty;
  }

  /** Generate ResolvedInput for this frame */
  getInput(): ResolvedInput {
    const f = this.fighter;
    const opp = this.opponent;
    this.thinkCooldown--;
    this.actionFrames--;

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

    // ── Decide (every 6-12 frames depending on difficulty) ──
    if (this.thinkCooldown <= 0 && canAct) {
      const reactionDelay = Math.round(8 + (1 - this.difficulty) * 12);
      this.thinkCooldown = reactionDelay;
      this.action = this.decide(dist, oppAttacking, oppAirborne, isClose);
      this.actionFrames = reactionDelay;
      this.comboStep = 0;
    }

    // ── Generate input based on action ──
    const input = this.generateInput(this.action, dist, facingOpp, canAct, oppAttacking);

    // Track button edges
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
    this.prev = createPrevAttack();
  }

  // ─── Decision making ───

  private decide(dist: number, oppAttacking: boolean, oppAirborne: boolean, isClose: boolean): AIAction {
    // Anti-air: highest priority
    if (oppAirborne && dist < 150 && Math.random() < this.difficulty * 0.8) {
      return 'antiair';
    }

    // Block when opponent is attacking
    if (oppAttacking && dist < 120 && Math.random() < this.difficulty * 0.9) {
      return 'block';
    }

    // Close range: attack or throw
    if (isClose) {
      const r = Math.random();
      if (r < 0.4) return 'attack';
      if (r < 0.55) return 'throw';
      if (r < 0.7) return 'retreat';
      return 'attack';
    }

    // Mid range
    if (dist < 180) {
      const r = Math.random();
      if (r < 0.35) return 'approach';
      if (r < 0.55) return 'attack';
      if (r < 0.7) return 'special';
      return 'idle';
    }

    // Far range
    const r = Math.random();
    if (r < 0.5) return 'approach';
    if (r < 0.7) return 'special';
    return 'approach';
  }

  // ─── Input generation ───

  private generateInput(
    action: AIAction,
    dist: number,
    facingOpp: boolean,
    canAct: boolean,
    oppAttacking: boolean,
  ): ResolvedInput {
    const forward = this.fighter.facing === 1;
    const base: ResolvedInput = {
      up: false, down: false, forward: false, back: false,
      buttonA: false, buttonB: false, buttonC: false, buttonD: false,
      throwAttack: false,
      buttonAPressed: false, buttonBPressed: false,
      buttonCPressed: false, buttonDPressed: false,
      throwAttackPressed: false,
      punchPressed: false, kickPressed: false,
      rollPressed: false, blowbackPressed: false,
    };

    if (!canAct && action !== 'block') return base;

    switch (action) {
      case 'approach':
        base.forward = true;
        // Run if far away
        if (dist > 150) base.forward = true;
        // Occasionally jump in
        if (dist > 120 && Math.random() < 0.05) base.up = true;
        break;

      case 'retreat':
        base.back = true;
        break;

      case 'attack': {
        // Combo route based on step
        if (this.comboStep === 0) {
          // Close C for combo starter, or Stand B for poke
          if (dist < 80) {
            base.buttonC = true;
            base.buttonCPressed = true;
            base.punchPressed = true;
          } else {
            base.buttonB = true;
            base.buttonBPressed = true;
            base.kickPressed = true;
          }
          this.comboStep = 1;
        } else if (this.comboStep === 1 && dist < 100) {
          // Follow up with A or special
          if (Math.random() < 0.5) {
            base.buttonA = true;
            base.buttonAPressed = true;
            base.punchPressed = true;
          }
          this.comboStep = 2;
        }
        break;
      }

      case 'block':
        base.back = true;
        // Randomly crouch block too
        if (Math.random() < 0.4) base.down = true;
        // Occasionally roll
        if (oppAttacking && Math.random() < 0.08 * this.difficulty) {
          base.buttonA = true;
          base.buttonB = true;
          base.rollPressed = true;
        }
        break;

      case 'antiair':
        // Use uppercut (DP+P) - just press C
        base.buttonC = true;
        base.buttonCPressed = true;
        base.punchPressed = true;
        // The character's routeSpecial should handle DP detection
        // For AI, we directly trigger upper via character
        break;

      case 'throw':
        if (dist < 70) {
          base.throwAttack = true;
          base.throwAttackPressed = true;
        }
        break;

      case 'special':
        // Randomly trigger a special
        if (Math.random() < 0.3) {
          base.buttonC = true;
          base.buttonCPressed = true;
          base.punchPressed = true;
        } else {
          base.buttonD = true;
          base.buttonDPressed = true;
          base.kickPressed = true;
        }
        break;

      case 'idle':
      default:
        break;
    }

    return base;
  }

  /** Direct special move trigger (bypasses command buffer) for AI */
  triggerSpecial(): AttackType | null {
    if (!this.fighter.canAct()) return null;

    const input = this.getInput();
    const tick = 0; // tick doesn't matter for AI direct trigger

    // Check DM first (low probability)
    if (Math.random() < 0.05) {
      const specials = [
        AttackType.DM_OROCHINAGI,
        AttackType.DM_YATAGARASU,
        AttackType.DM_POWER_GEYSER,
        AttackType.DM_PHOENIX_KICK,
      ];
      // Try each DM
      for (const dm of specials) {
        // Check if this DM belongs to current character
        const testInput = { ...input, punchPressed: true };
        const result = this.character.routeSpecial(testInput, {
          checkSpecial: () => null,
          checkDM: () => dm,
          checkKickSpecial: () => null,
          hasQCF: () => false,
          hasQCB: () => false,
          checkRekkaFollowQCF: () => null,
          checkRekkaFollowHCB: () => null,
          checkDokugamiFollow: () => null,
          checkBatsuyomiInput: () => false,
        } as any, tick);
        if (result) return result;
      }
    }

    // Try character specials
    const result = this.character.routeSpecial(input, {
      checkSpecial: () => {
        // 50% chance of fireball, 50% upper
        return Math.random() < 0.5 ? AttackType.SPECIAL_PROJECTILE : AttackType.SPECIAL_UPPER;
      },
      checkDM: () => null,
      checkKickSpecial: () => {
        const kickSpecials = [
          AttackType.KYO_75KAI,
          AttackType.KYO_RED_KICK,
          AttackType.TERRY_CRACK_SHOT,
          AttackType.KIM_HIENSEN,
        ];
        return kickSpecials[Math.floor(Math.random() * kickSpecials.length)];
      },
      hasQCF: () => Math.random() < 0.7,
      hasQCB: () => Math.random() < 0.7,
      checkRekkaFollowQCF: () => null,
      checkRekkaFollowHCB: () => null,
      checkDokugamiFollow: () => null,
      checkBatsuyomiInput: () => false,
    } as any, tick);

    return result;
  }
}
