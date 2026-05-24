/**
 * SimpleAI — 升级版格斗AI
 *
 * 策略:
 *   远距离: 跳入 / 发波 / 接近
 *   中距离: 试探poke (stand A/B) / 跳入
 *   近距离: 连段 (4-8 hit combo routes) / 投技
 *   防御: 智能蹲站交替防 + GC Roll / GC CD
 *   对空: 角色专属升龙 + 备用蹲防
 *   起身压制: 对手倒地时上前okizeme
 *   投技逃脱: 在escape window内高概率拆投
 *
 * AI直接生成 ResolvedInput 馈入 FighterController，
 * 必杀技通过 CharacterDefinition 路由直接触发 (跳过指令缓冲)。
 */
import type { Fighter } from '../entities/fighter.js';
import type { CharacterDefinition } from '../characters/types.js';
import type { ResolvedInput, PrevAttack } from '../input/inputResolver.js';
import { createPrevAttack } from '../input/inputResolver.js';
import { FighterState, AttackType } from '../core/types.js';
import type { PowerGauge } from '../core/types.js';

// ─── Combo route step definition ───
interface ComboStep {
  type: 'button' | 'special';
  attack: string;
  delay: number; // frames to wait before this step
}

// ─── AI action types (expanded) ───
type AIAction = 'idle' | 'approach' | 'retreat' | 'attack' | 'block'
  | 'antiair' | 'throw' | 'special' | 'jumpIn' | 'okizeme' | 'guardCancel' | 'counterStance';

// ─── Per-character combo routes ───
const COMBO_ROUTES: Record<string, ComboStep[]> = {
  kyo: [
    { type: 'button',  attack: 'closeC',     delay: 0 },
    { type: 'button',  attack: 'cmdGofuYou', delay: 3 },
    { type: 'special', attack: 'aragami',     delay: 3 },
    { type: 'special', attack: 'aragamiFollow', delay: 3 },
    { type: 'special', attack: 'aragamiEnder',  delay: 3 },
  ],
  iori: [
    { type: 'button',  attack: 'closeC',   delay: 0 },
    { type: 'special', attack: 'aoihana1',  delay: 3 },
    { type: 'special', attack: 'aoihana2',  delay: 3 },
    { type: 'special', attack: 'aoihana3',  delay: 3 },
  ],
  terry: [
    { type: 'button',  attack: 'closeC',      delay: 0 },
    { type: 'button',  attack: 'standA',       delay: 2 },
    { type: 'special', attack: 'burnKnuckle',  delay: 3 },
  ],
  kim: [
    { type: 'button',  attack: 'closeC',  delay: 0 },
    { type: 'button',  attack: 'standB',   delay: 2 },
    { type: 'special', attack: 'hiensen',  delay: 3 },
  ],
  _default: [
    { type: 'button',  attack: 'closeC', delay: 0 },
    { type: 'button',  attack: 'standA',  delay: 2 },
    { type: 'special', attack: 'specialUpper', delay: 3 },
  ],
};

// ─── Jump-in route: air C → land → close C → special ───
const JUMP_IN_ROUTE: ComboStep[] = [
  { type: 'button',  attack: 'jumpC',    delay: 0 },  // air attack
  { type: 'button',  attack: 'closeC',   delay: 4 },  // land → close C
  // After this, AI transitions to normal combo route from closeC onward
];

export class SimpleAI {
  private fighter: Fighter;
  private opponent: Fighter;
  private character: CharacterDefinition;
  private difficulty: number; // 0.0 ~ 1.0 reaction speed/aggression
  gauge: PowerGauge | null = null; // set externally for GC awareness

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

    // ── MAX mode activation: when in close range with meter available ──
    if (canAct && this.gauge && this.gauge.stocks >= 1 && dist < 100
      && Math.random() < this.difficulty * 0.08) {
      const base = this.emptyInput();
      base.buttonB = true;
      base.buttonC = true;
      base.buttonBPressed = true;
      base.buttonCPressed = true;
      return base;
    }

    // ── Guard cancel: while blocking with low guard gauge ──
    if (f.state === FighterState.BLOCK && f.guardGauge < 30
      && this.gauge && this.gauge.stocks >= 1
      && Math.random() < this.difficulty * 0.4) {
      this.action = 'guardCancel';
      this.actionFrames = 6;
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
    // Anti-air: highest priority
    if (oppAirborne && dist < 150 && Math.random() < this.difficulty * 0.8) {
      return 'antiair';
    }

    // Counter stance: use when opponent is attacking at mid range (only for characters with getCounterConfig)
    if (oppAttacking && dist < 120 && dist > 50 && this.character.getCounterConfig
      && Math.random() < this.difficulty * 0.25) {
      return 'counterStance';
    }

    // Block when opponent is attacking
    if (oppAttacking && dist < 120 && Math.random() < this.difficulty * 0.9) {
      return 'block';
    }

    // Close range: attack combo or throw
    if (isClose) {
      const r = Math.random();
      if (r < 0.45) return 'attack';
      if (r < 0.60) return 'throw';
      if (r < 0.75) return 'retreat';
      return 'attack';
    }

    // Mid range: poke, jump-in, or approach
    if (dist < 180) {
      const r = Math.random();
      if (r < 0.25) return 'approach';
      if (r < 0.40) return 'jumpIn';
      if (r < 0.55) return 'attack';
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
        // Sometimes jump back
        if (Math.random() < 0.08) base.up = true;
        break;

      case 'jumpIn': {
        const fIsAirborne = f.state === FighterState.JUMP
          || f.state === FighterState.RUN_JUMP
          || f.state === FighterState.HOP
          || f.state === FighterState.HYPER_JUMP;

        if (this.jumpInPhase === 0 && canAct) {
          // Phase 0: Jump toward opponent
          base.up = true;
          base.forward = true;
          this.jumpInPhase = 1;
          this.inCombo = true;
        } else if (this.jumpInPhase === 1 && fIsAirborne) {
          // Phase 1: In air → air attack (JUMP_C)
          base.buttonC = true;
          base.buttonCPressed = true;
          base.punchPressed = true;
          this.jumpInPhase = 2;
        } else if (this.jumpInPhase === 2 && canAct) {
          // Phase 2: Landed → start ground combo from closeC
          this.jumpInPhase = 0;
          this.action = 'attack';
          this.comboStep = 0;
          this.inCombo = true;
          // Apply first combo step (closeC)
          const route = this.getCurrentRoute();
          if (route.length > 0) {
            this.applyComboStep(route[0], base);
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
          this.applyComboStep(route[this.comboStep], base);
          this.comboStep++;
          if (this.comboStep < route.length) {
            this.comboDelay = route[this.comboStep].delay;
          } else {
            // Combo finished
            this.inCombo = false;
            this.comboStep = 0;
          }
        } else if (!this.inCombo) {
          // Start new combo
          if (dist < 80) {
            this.inCombo = true;
            this.comboStep = 0;
            if (route.length > 0) {
              this.applyComboStep(route[0], base);
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
          base.throwAttack = true;
          base.throwAttackPressed = true;
        }
        break;

      case 'special':
        if (canAct) {
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

  private applyComboStep(step: ComboStep, base: ResolvedInput): void {
    if (step.type === 'button') {
      switch (step.attack) {
        case 'closeC':
          base.buttonC = true;
          base.buttonCPressed = true;
          base.punchPressed = true;
          break;
        case 'standA':
          base.buttonA = true;
          base.buttonAPressed = true;
          base.punchPressed = true;
          break;
        case 'standB':
          base.buttonB = true;
          base.buttonBPressed = true;
          base.kickPressed = true;
          break;
        case 'cmdGofuYou':
          // →+B (command normal)
          base.forward = true;
          base.buttonB = true;
          base.buttonBPressed = true;
          base.kickPressed = true;
          break;
        case 'jumpC':
          base.buttonC = true;
          base.buttonCPressed = true;
          base.punchPressed = true;
          break;
      }
    }
    // Special type steps are handled via triggerSpecial() which is called
    // separately in main.ts. The combo step just marks timing; the actual
    // special move is picked by the character's routeSpecial logic.
    if (step.type === 'special') {
      // Signal that a special should be triggered — we press the button
      // that corresponds to the special's input (punch or kick)
      switch (step.attack) {
        case 'aragami':
        case 'aoihana1':
        case 'burnKnuckle':
        case 'specialUpper':
          base.buttonA = true; // A version for rekka/special
          base.buttonAPressed = true;
          base.punchPressed = true;
          break;
        case 'aragamiFollow':
        case 'aragamiEnder':
          base.buttonA = true;
          base.buttonAPressed = true;
          base.punchPressed = true;
          break;
        case 'aoihana2':
        case 'aoihana3':
          base.buttonC = true;
          base.buttonCPressed = true;
          base.punchPressed = true;
          break;
        case 'hiensen':
          base.buttonB = true;
          base.buttonBPressed = true;
          base.kickPressed = true;
          break;
        default:
          base.buttonC = true;
          base.buttonCPressed = true;
          base.punchPressed = true;
          break;
      }
    }
  }

  /** Direct special move trigger (bypasses command buffer) for AI */
  triggerSpecial(): AttackType | null {
    if (!this.fighter.canAct()) return null;

    const input = this.getInput();
    const tick = 0; // tick doesn't matter for AI direct trigger

    // Check DM first (low probability) — use character-specific DM map
    if (Math.random() < 0.05) {
      const dmMap: Record<string, AttackType> = {
        kyo: AttackType.DM_OROCHINAGI,
        iori: AttackType.DM_YATAGARASU,
        terry: AttackType.DM_POWER_GEYSER,
        kim: AttackType.DM_PHOENIX_KICK,
      };
      const dm = dmMap[this.fighter.charId];
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
          return this.routeComboSpecial(charId, currentStep.attack, input, tick);
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

  /** Route to the correct special attack during a combo */
  private routeComboSpecial(
    charId: string,
    attack: string,
    input: ResolvedInput,
    tick: number,
  ): AttackType | null {
    switch (charId) {
      case 'kyo':
        return this.routeKyoComboSpecial(attack, input, tick);
      case 'iori':
        return this.routeIoriComboSpecial(attack, input, tick);
      case 'terry':
        return this.routeTerryComboSpecial(attack, input, tick);
      case 'kim':
        return this.routeKimComboSpecial(attack, input, tick);
      default:
        return null;
    }
  }

  private routeKyoComboSpecial(attack: string, input: ResolvedInput, tick: number): AttackType | null {
    switch (attack) {
      case 'aragami':
        return AttackType.KYO_ARAGAMI;
      case 'aragamiFollow':
        // Nine wounds followup (qcf+P after aragami)
        return this.character.routeSpecial(input, {
          checkSpecial: () => null,
          checkDMMotion: () => null,
          checkKickSpecial: () => null,
          hasQCF: () => true,
          hasQCB: () => false,
          checkRekkaFollowQCF: () => AttackType.KYO_ARAGAMI_KONOKIZU,
          checkRekkaFollowHCB: () => null,
          checkDokugamiFollow: () => null,
          checkBatsuyomiInput: () => false,
        } as any, tick);
      case 'aragamiEnder':
        // Eight saké followup (hcb+P after aragami)
        return this.character.routeSpecial(input, {
          checkSpecial: () => null,
          checkDMMotion: () => null,
          checkKickSpecial: () => null,
          hasQCF: () => false,
          hasQCB: () => true,
          checkRekkaFollowQCF: () => null,
          checkRekkaFollowHCB: () => AttackType.KYO_ARAGAMI_YANOSABI,
          checkDokugamiFollow: () => null,
          checkBatsuyomiInput: () => false,
        } as any, tick);
      default:
        return AttackType.SPECIAL_UPPER;
    }
  }

  private routeIoriComboSpecial(attack: string, _input: ResolvedInput, _tick: number): AttackType | null {
    switch (attack) {
      case 'aoihana1':
        return AttackType.IORI_AOIHANA;
      case 'aoihana2':
        return AttackType.IORI_AOIHANA_2;
      case 'aoihana3':
        return AttackType.IORI_AOIHANA_3;
      default:
        return AttackType.IORI_AOIHANA;
    }
  }

  private routeTerryComboSpecial(attack: string, _input: ResolvedInput, _tick: number): AttackType | null {
    switch (attack) {
      case 'burnKnuckle':
        return AttackType.TERRY_BURN_KNUCKLE;
      default:
        return AttackType.TERRY_BURN_KNUCKLE;
    }
  }

  private routeKimComboSpecial(attack: string, _input: ResolvedInput, _tick: number): AttackType | null {
    switch (attack) {
      case 'hienzan':
        return AttackType.KIM_HIENZAN;
      case 'hangetsu':
        return AttackType.KIM_HANGETSU;
      default:
        return AttackType.KIM_HIENZAN;
    }
  }
}
