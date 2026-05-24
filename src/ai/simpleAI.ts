/**
 * SimpleAI — 升级版格斗AI
 * 策略: 远距离跳入/发波, 中距离poke, 近距离连段/投技, 智能防御+GC, 角色专属对空/起身
 * AI直接生成 ResolvedInput, 必杀技通过 CharacterDefinition 路由直接触发
 */
import type { Fighter } from '../entities/fighter.js';
import type { CharacterDefinition } from '../characters/types.js';
import type { ResolvedInput, PrevAttack } from '../input/inputResolver.js';
import { createPrevAttack } from '../input/inputResolver.js';
import { FighterState, AttackType } from '../core/types.js';
import type { PowerGauge, MaxModeState } from '../core/types.js';
import { COMBO_ROUTES, JUMP_IN_ROUTE, applyComboStep, routeComboSpecial } from './aiRoutes.js';
import type { ComboStep } from './aiRoutes.js';

// ─── AI action types (expanded) ───
type AIAction = 'idle' | 'approach' | 'retreat' | 'attack' | 'block'
  | 'antiair' | 'throw' | 'special' | 'jumpIn' | 'okizeme' | 'guardCancel' | 'counterStance';

// COMBO_ROUTES and JUMP_IN_ROUTE are imported from aiRoutes.ts

export class SimpleAI {
  private fighter: Fighter;
  private opponent: Fighter;
  private character: CharacterDefinition;
  private difficulty: number; // 0.0 ~ 1.0 reaction speed/aggression
  gauge: PowerGauge | null = null; // set externally for GC awareness
  maxMode: MaxModeState | null = null; // set externally for SDM awareness

  private prev: PrevAttack = createPrevAttack();
  private thinkCooldown = 0;
  private action: AIAction = 'idle';
  private actionFrames = 0;
  private comboStep = 0;
  private comboDelay = 0;          // frames to wait before next combo step
  private inCombo = false;         // true while executing a combo route
  private jumpInPhase = 0;         // 0=not jumping in, 1=in air, 2=landed+combo
  private okiTimer = 0;            // frames into okizeme pressure

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

    // ── Throw escape: highest priority, before anything else ──
    if (f.isBeingThrown && f.throwEscapeTimer > 0 && Math.random() < this.difficulty * 0.7) {
      const base = this.emptyInput();
      base.throwAttack = true;
      base.throwAttackPressed = true;
      return base;
    }

    // ── MAX activation during combo (BC cancel) ──
    if (this.inCombo && f.hasHit && canAct && this.gauge && this.gauge.stocks >= 2
      && !f.currentAttack?.toString().startsWith('DM_')
      && Math.random() < this.difficulty * 0.5) {
      const base = this.emptyInput();
      base.buttonB = true; base.buttonC = true;
      base.buttonBPressed = true; base.buttonCPressed = true;
      this.inCombo = true; this.comboStep = 0;
      return base;
    }
    // ── MAX activation: close range with meter ──
    if (canAct && this.gauge && this.gauge.stocks >= 1 && dist < 100
      && Math.random() < this.difficulty * 0.05) {
      const base = this.emptyInput();
      base.buttonB = true; base.buttonC = true;
      base.buttonBPressed = true; base.buttonCPressed = true;
      return base;
    }
    // ── Guard cancel while blocking ──
    if (f.state === FighterState.BLOCK && this.gauge && this.gauge.stocks >= 1) {
      const lowGauge = f.guardGauge < 30;
      const sustainedBlock = f.blockstunTimer > 8;
      const gcProb = lowGauge ? this.difficulty * 0.5 : sustainedBlock ? this.difficulty * 0.25 : 0;
      if (Math.random() < gcProb) {
        this.action = 'guardCancel';
        this.actionFrames = 6;
      }
    }

    // ── Oki detection: opponent knocked down and close ──
    if (canAct && opp.state === FighterState.KNOCKDOWN && dist < 120
      && this.action !== 'okizeme' && Math.random() < this.difficulty * 0.6) {
      this.action = 'okizeme';
      this.actionFrames = 30;
      this.okiTimer = 0;
    }

    // ── Decide (every 6-12 frames depending on difficulty) ──
    if (this.thinkCooldown <= 0 && canAct) {
      const reactionDelay = Math.round(8 + (1 - this.difficulty) * 12);
      this.thinkCooldown = reactionDelay;
      // Don't override if in active combo
      if (!this.inCombo && this.jumpInPhase === 0) {
        this.action = this.decide(dist, oppAttacking, oppAirborne, isClose);
        this.actionFrames = reactionDelay;
        this.comboStep = 0;
        this.inCombo = false;
      }
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
    this.comboDelay = 0;
    this.inCombo = false;
    this.jumpInPhase = 0;
    this.okiTimer = 0;
    this.prev = createPrevAttack();
  }

  // ─── Decision making ───

  private decide(dist: number, oppAttacking: boolean, oppAirborne: boolean, isClose: boolean): AIAction {
    const lowHp = this.fighter.health < this.fighter.maxHealth * 0.25;
    // KOF2002: 对手低血量时AI更倾向使用DM终结连段
    const oppLowHp = this.opponent.health < this.opponent.maxHealth * 0.25;
    const hasMeter = this.gauge && this.gauge.stocks >= 1;

    // Anti-air: highest priority
    if (oppAirborne && dist < 150 && Math.random() < this.difficulty * 0.8) {
      return 'antiair';
    }

    // Counter stance: opponent attacking at mid range
    if (oppAttacking && dist < 120 && dist > 50 && this.character.getCounterConfig
      && Math.random() < this.difficulty * 0.25) {
      return 'counterStance';
    }
    if (oppAttacking && dist < 120 && Math.random() < this.difficulty * (lowHp ? 0.95 : 0.9)) {
      return 'block';
    }

    // Close range: attack combo or throw
    if (isClose) {
      const r = Math.random();
      if (lowHp) {
        if (r < 0.25) return 'retreat';
        if (r < 0.50) return 'block';
        if (r < 0.70) return 'attack';
        if (r < 0.85) return 'throw';
        return 'retreat';
      }
      // KOF2002: 对手低血量且有气槽时, 优先用DM终结的连段
      if (oppLowHp && hasMeter) {
        if (r < 0.55) return 'attack';
        if (r < 0.75) return 'special';
        if (r < 0.85) return 'throw';
        return 'attack';
      }
      // KOF2002: 角落压力 — 对手靠近墙时保持进攻不停
      const oppInCorner = this.opponent.x < 80 || this.opponent.x > 720;
      if (oppInCorner) {
        if (r < 0.55) return 'attack';
        if (r < 0.70) return 'throw';
        if (r < 0.85) return 'attack';
        return 'special';
      }
      if (r < 0.45) return 'attack';
      if (r < 0.60) return 'throw';
      if (r < 0.75) return 'retreat';
      return 'attack';
    }

    // Mid range: poke, jump-in, or approach
    if (dist < 180) {
      const maxBonus = this.maxMode?.active ? 0.15 : 0;
      const r = Math.random();
      // KOF2002: 对手低血量时更多special(DM)尝试
      if (oppLowHp && hasMeter) {
        if (r < 0.30 + maxBonus) return 'approach';
        if (r < 0.45 + maxBonus) return 'jumpIn';
        if (r < 0.60 + maxBonus) return 'special';
        return 'attack';
      }
      if (r < 0.25 + maxBonus) return 'approach';
      if (r < 0.40 + maxBonus) return 'jumpIn';
      if (r < 0.55 + maxBonus) return 'attack';
      if (r < 0.70) return 'special';
      return 'idle';
    }

    // Far range: approach, jump-in, or projectile
    const r = Math.random();
    if (r < 0.40) return 'approach';
    if (r < 0.60) return 'jumpIn';
    if (r < 0.80) return 'special';
    return 'approach';
  }

  // ─── Input generation ───
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
    };
  }

  private generateInput(
    action: AIAction,
    dist: number,
    facingOpp: boolean,
    canAct: boolean,
    oppAttacking: boolean,
  ): ResolvedInput {
    const f = this.fighter;
    const base = this.emptyInput();

    if (!canAct && action !== 'block' && action !== 'guardCancel') return base;

    switch (action) {
      case 'approach':
        base.forward = true;
        if (dist > 150) base.forward = true;
        // Occasionally jump in from approach
        if (dist > 120 && Math.random() < 0.04 * this.difficulty) {
          base.up = true;
          base.forward = true;
        }
        break;

      case 'retreat':
        base.back = true;
        if (Math.random() < 0.08) base.up = true;
        break;

      case 'jumpIn': {
        const fIsAirborne = f.state === FighterState.JUMP || f.state === FighterState.RUN_JUMP
          || f.state === FighterState.HOP || f.state === FighterState.HYPER_JUMP;

        if (this.jumpInPhase === 0 && canAct) {
          base.up = true; base.forward = true;
          this.jumpInPhase = 1; this.inCombo = true;
        } else if (this.jumpInPhase === 1 && fIsAirborne) {
          base.buttonC = true; base.buttonCPressed = true;
          base.punchPressed = true; this.jumpInPhase = 2;
        } else if (this.jumpInPhase === 2 && canAct) {
          this.jumpInPhase = 0;
          this.action = 'attack';
          this.comboStep = 0;
          this.inCombo = true;
          // Apply first combo step (closeC)
          const route = this.getCurrentRoute();
          if (route.length > 0) {
            this.doApplyComboStep(route[0], base);
            this.comboStep = 1;
            this.comboDelay = route.length > 1 ? route[1].delay : 0;
          }
        } else if (this.jumpInPhase === 1) {
          // Still on ground, trying to jump
          base.up = true;
          base.forward = true;
        }
        break;
      }

      case 'attack': {
        const route = this.getCurrentRoute();

        // If in an active combo, continue the route
        if (this.inCombo && this.comboStep < route.length && this.comboDelay <= 0) {
          // KOF2002: low difficulty AI drops combos sometimes (difficulty < 0.7: 30% drop rate per step)
          const dropCombo = this.difficulty < 0.7 && Math.random() > this.difficulty;
          if (dropCombo) {
            this.inCombo = false;
            this.comboStep = 0;
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
          // Start new combo
          if (dist < 80) {
            this.inCombo = true;
            this.comboStep = 0;
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
        // If comboDelay > 0, just wait (return empty base)
        break;
      }

      case 'block':
        base.back = true;
        // Smart block: mix stand/crouch based on opponent state
        if (this.opponent.state === FighterState.CROUCH_ATTACK
          || this.opponent.state === FighterState.CROUCH) {
          // Opponent crouching/low attack → crouch block
          base.down = true;
        } else if (this.opponent.state === FighterState.AIR_ATTACK) {
          // Air attack → stand block
        } else {
          // Random mix: 60/40 stand/crouch
          if (Math.random() < 0.4) base.down = true;
        }
        // GC Roll when guard gauge is getting low
        if (f.guardGauge < 40 && this.gauge && this.gauge.stocks >= 1
          && Math.random() < 0.06 * this.difficulty) {
          base.buttonA = true;
          base.buttonB = true;
          base.rollPressed = true;
        }
        // GC CD (blowback) when guard gauge critical and has meter
        if (f.guardGauge < 25 && this.gauge && this.gauge.stocks >= 1
          && Math.random() < 0.04 * this.difficulty) {
          base.buttonC = true;
          base.buttonD = true;
          base.blowbackPressed = true;
        }
        break;

      case 'guardCancel':
        // GC Roll (A+B) or GC CD (C+D)
        if (this.gauge && this.gauge.stocks >= 1) {
          if (Math.random() < 0.65) {
            // GC Roll
            base.buttonA = true;
            base.buttonB = true;
            base.rollPressed = true;
          } else {
            // GC CD blowback
            base.buttonC = true;
            base.buttonD = true;
            base.blowbackPressed = true;
          }
        }
        break;

      case 'counterStance': {
        // 当身技: QCB+Punch input simulation
        if (canAct && this.character.getCounterConfig) {
          // Simulate QCB motion: down → downback → back + punch
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
        const charId = f.charId;
        // Character-specific anti-air: use uppercut motion
        if (canAct) {
          // Press C (punch) for DP-type anti-air
          // The routeSpecial in triggerSpecial handles the actual move selection
          base.buttonC = true;
          base.buttonCPressed = true;
          base.punchPressed = true;
          // Also hold forward for DP motion sometimes
          if (Math.random() < 0.5) base.forward = true;
        } else if (f.state === FighterState.BLOCK || f.state === FighterState.HITSTUN) {
          // Can't anti-air → block
          base.back = true;
          base.down = true;
        }
        break;
      }

      case 'throw':
        if (dist < 70 && canAct) {
          // KOF2002: 靠近墙时后投远离墙, 靠近中心时前投
          const nearRightWall = f.x > (f.facing === 1 ? 600 : 200);
          if (nearRightWall) base.back = true;
          else base.forward = true;
          base.throwAttack = true;
          base.throwAttackPressed = true;
        }
        break;

      case 'special':
        if (canAct) {
          // Super Cancel: if combo active and has meter, use DM
          if (this.inCombo && f.hasHit && this.gauge && this.gauge.stocks >= 1
            && Math.random() < this.difficulty * 0.6) {
            const route = this.getCurrentRoute();
            // Try to route into DM (last step of combo)
            const dmStep = route.find(s => s.attack.toLowerCase().includes('dm'));
            if (dmStep) {
              this.doApplyComboStep(dmStep, base);
              this.inCombo = false;
              break;
            }
          }
          if (Math.random() < 0.3) {
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
        // Move slightly forward to stay close
        if (dist > 50) base.forward = true;
        // Time attack: press button when opponent might be getting up
        // (knockdown lasts ~40-60 frames, attack at ~30-40 for meaty timing)
        if (this.okiTimer > 20 && this.okiTimer < 45 && canAct) {
          // Meaty attack: close C or low D for low/throw mixup
          if (Math.random() < 0.6) {
            base.buttonC = true;
            base.buttonCPressed = true;
            base.punchPressed = true;
          } else {
            // Low option
            base.down = true;
            base.buttonD = true;
            base.buttonDPressed = true;
            base.kickPressed = true;
          }
          this.okiTimer = 99; // done
          this.action = 'idle';
        }
        // If opponent is up, switch to normal attack
        if (this.opponent.state !== FighterState.KNOCKDOWN) {
          this.action = canAct && dist < 80 ? 'attack' : 'idle';
          this.okiTimer = 0;
        }
        break;

      case 'idle':
      default:
        break;
    }

    return base;
  }

  // ─── Combo helpers ───
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

    const input = this.getInput();
    const tick = 0; // tick doesn't matter for AI direct trigger

    // Check DM first — higher probability when opponent is low HP (KOF2002: DM finisher)
    const oppLowHp = this.opponent.health < this.opponent.maxHealth * 0.25;
    const dmProb = oppLowHp && this.gauge && this.gauge.stocks >= 1 ? 0.15 : 0.05;
    if (Math.random() < dmProb) {
      const dmMap: Record<string, AttackType> = {
        kyo: AttackType.DM_OROCHINAGI,
        iori: AttackType.DM_YATAGARASU,
        terry: AttackType.DM_POWER_GEYSER,
        kim: AttackType.DM_PHOENIX_KICK,
        ryo: AttackType.DM_TEN_HA_OU,
        leona: AttackType.DM_V_SLASHER,
        kdash: AttackType.DM_CHAIN_SHOT,
        kula: AttackType.DM_FREEZE,
      };
      // In MAX mode with ≥2 stocks, upgrade to SDM
      const sdmMap: Record<string, AttackType> = {
        kyo: AttackType.SDM_OROCHINAGI,
        iori: AttackType.SDM_YATAGARASU,
        terry: AttackType.SDM_POWER_GEYSER,
        kim: AttackType.SDM_PHOENIX_KICK,
        ryo: AttackType.SDM_TEN_HA_OU,
        leona: AttackType.SDM_V_SLASHER,
        kdash: AttackType.SDM_CHAIN_SHOT,
        kula: AttackType.SDM_FREEZE,
      };
      const useSDM = this.maxMode?.active && this.gauge && this.gauge.stocks >= 2;
      const dm = useSDM
        ? sdmMap[this.fighter.charId]
        : dmMap[this.fighter.charId];
      if (dm) return dm;
    }

    // Character-specific special routing based on combo context
    const charId = this.fighter.charId;

    // If in combo, try to route to the correct special for the combo
    if (this.inCombo) {
      const route = this.getCurrentRoute();
      if (this.comboStep > 0 && this.comboStep <= route.length) {
        const currentStep = route[Math.min(this.comboStep - 1, route.length - 1)];
        if (currentStep.type === 'special') {
          return routeComboSpecial(charId, currentStep.attack, this.character, input, tick);
        }
      }
    }

    // Try character specials
    const result = this.character.routeSpecial(input, {
      checkSpecial: () => {
        // 50% chance of fireball, 50% upper
        return Math.random() < 0.5 ? AttackType.SPECIAL_PROJECTILE : AttackType.SPECIAL_UPPER;
      },
      checkDMMotion: () => null,
      checkKickSpecial: () => {
        const kickSpecials = [
          AttackType.KYO_75KAI,
          AttackType.KYO_RED_KICK,
          AttackType.TERRY_CRACK_SHOT,
          AttackType.KIM_HIENZAN,
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
