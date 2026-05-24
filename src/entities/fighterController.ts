import { Fighter } from './fighter.js';
import { Projectile } from './projectile.js';
import { CommandBuffer } from '../input/commandBuffer.js';
import type { ResolvedInput } from '../input/inputResolver.js';
import {
  STAGE_GROUND_Y, STAGE_WIDTH, FIGHTER_WIDTH,
  WALK_SPEED, RUN_SPEED, GRAVITY, JUMP_VELOCITY,
  BACKDASH_VX, BACKDASH_VY, BACKDASH_DURATION,
  DOUBLE_TAP_WINDOW, RUN_JUMP_VX, RUN_JUMP_VY,
  HOP_THRESHOLD, HOP_VELOCITY, HYPER_JUMP_VY, HYPER_JUMP_VX, HYPER_CHARGE_WINDOW,
  ROLL_SPEED, ROLL_DURATION, ROLL_INVINCIBLE_END, ROLL_RECOVERY,
  FRAME_DATA, LANDING_RECOVERY,
} from '../core/constants.js';
import { FighterState, AttackType, CLOSE_RANGE } from '../core/types.js';
import type { VFXSystem } from '../rendering/vfx.js';

// Rekka followup input window (frames after hit/block during recovery)
const REKKA_WINDOW = 20;

/**
 * Per-frame fighter state controller.
 * KOF 2002 Kyo-specific routing: close/far, command normals,
 * rekka chains (荒咬み/毒咬み), kick specials.
 */
export class FighterController {
  private fighter: Fighter;
  private playerIndex: number;
  private cmdBuf: CommandBuffer;
  private vfx: VFXSystem;
  private projectiles: Projectile[];
  private tickRef: { value: number };
  private opponent: Fighter | null = null;

  // Double-tap detection
  private lastForwardTick = -999;
  private lastBackTick = -999;
  private prevForward = false;
  private prevBack = false;
  private prevDown = false;

  // Hop detection
  private upHoldFrames = 0;
  private upWasPressed = false;
  private lastDownTick = -999;

  constructor(
    fighter: Fighter,
    playerIndex: number,
    cmdBuf: CommandBuffer,
    vfx: VFXSystem,
    projectiles: Projectile[],
    tickRef: { value: number },
  ) {
    this.fighter = fighter;
    this.playerIndex = playerIndex;
    this.cmdBuf = cmdBuf;
    this.vfx = vfx;
    this.projectiles = projectiles;
    this.tickRef = tickRef;
  }

  get fighterRef(): Fighter { return this.fighter; }

  setOpponent(opp: Fighter): void { this.opponent = opp; }

  update(input: ResolvedInput): void {
    this.tickStateMachine(input);
    this.prevForward = input.forward;
    this.prevBack = input.back;
    this.prevDown = input.down;
    if (input.up) {
      if (!this.upWasPressed) this.upHoldFrames = 0;
      this.upHoldFrames++;
    }
    this.upWasPressed = input.up;
  }

  applyPhysics(): void {
    const f = this.fighter;
    f.x += f.vx;
    f.y += f.vy;

    if (f.y >= STAGE_GROUND_Y) {
      const wasAirborne = f.state === FighterState.JUMP
        || f.state === FighterState.RUN_JUMP
        || f.state === FighterState.HOP
        || f.state === FighterState.HYPER_JUMP
        || f.state === FighterState.BACKDASH
        || f.state === FighterState.AIR_ATTACK;
      if (wasAirborne) {
        if (f.currentAttack) f.endAttack();
        f.y = STAGE_GROUND_Y;
        f.vy = 0;
        f.vx = 0;
        f.state = FighterState.IDLE;
        f.landingRecovery = LANDING_RECOVERY;
        this.vfx.spawnDust(f.x, STAGE_GROUND_Y);
      } else if (f.vy > 0) {
        f.y = STAGE_GROUND_Y;
        f.vy = 0;
      }
    }

    f.x = Math.max(FIGHTER_WIDTH / 2, Math.min(f.x, STAGE_WIDTH - FIGHTER_WIDTH / 2));
  }

  // ─── Input helpers ───

  private forwardJustPressed(input: ResolvedInput): boolean {
    return input.forward && !this.prevForward;
  }
  private backJustPressed(input: ResolvedInput): boolean {
    return input.back && !this.prevBack;
  }
  private checkDoubleForward(input: ResolvedInput): boolean {
    if (this.forwardJustPressed(input)) {
      const gap = this.tickRef.value - this.lastForwardTick;
      this.lastForwardTick = this.tickRef.value;
      return gap > 0 && gap <= DOUBLE_TAP_WINDOW;
    }
    return false;
  }
  private checkDoubleBack(input: ResolvedInput): boolean {
    if (this.backJustPressed(input)) {
      const gap = this.tickRef.value - this.lastBackTick;
      this.lastBackTick = this.tickRef.value;
      return gap > 0 && gap <= DOUBLE_TAP_WINDOW;
    }
    return false;
  }
  private upJustReleased(input: ResolvedInput): boolean {
    return !input.up && this.upWasPressed;
  }
  private checkHyperJump(): boolean {
    const gap = this.tickRef.value - this.lastDownTick;
    return gap > 0 && gap <= HYPER_CHARGE_WINDOW;
  }

  /** Is the opponent within close-attack range? */
  private isCloseRange(): boolean {
    if (!this.opponent) return false;
    return Math.abs(this.fighter.x - this.opponent.x) < CLOSE_RANGE;
  }

  // ─── Attack routing ───

  /**
   * Route A/B/C/D to the correct AttackType based on:
   *  - Air: check ↓+C for 奈落落とし, else standard air attacks
   *  - Crouch: standard crouch attacks
   *  - Stand: close/far distinction + command normals (→+B, ↘+D)
   */
  private routeAttack(input: ResolvedInput): AttackType | null {
    const f = this.fighter;
    const isAir = f.state === FighterState.JUMP
      || f.state === FighterState.RUN_JUMP
      || f.state === FighterState.HOP
      || f.state === FighterState.HYPER_JUMP;

    // ── Air attacks ──
    if (isAir) {
      // 奈落落とし: 空中↓+C
      if (input.buttonCPressed && input.down) return AttackType.CMD_NARAKU;
      if (input.buttonAPressed) return AttackType.JUMP_A;
      if (input.buttonBPressed) return AttackType.JUMP_B;
      if (input.buttonCPressed) return AttackType.JUMP_C;
      if (input.buttonDPressed) return AttackType.JUMP_D;
      return null;
    }

    // ── Crouch attacks ──
    if (f.state === FighterState.CROUCH) {
      // ↘+D = 八拾八式 command normal (from crouch)
      if (input.buttonDPressed && input.forward && input.down) return AttackType.CMD_88SHIKI;
      if (input.buttonAPressed) return AttackType.CROUCH_A;
      if (input.buttonBPressed) return AttackType.CROUCH_B;
      if (input.buttonCPressed) return AttackType.CROUCH_C;
      if (input.buttonDPressed) return AttackType.CROUCH_D;
      return null;
    }

    // ── Stand / Walk / Run attacks ──
    const close = this.isCloseRange();

    // Command normals checked first (direction + button)
    if (input.buttonBPressed && input.forward && !input.down) return AttackType.CMD_GOFU_YOU;  // →+B
    if (input.buttonDPressed && input.forward && input.down) return AttackType.CMD_88SHIKI;     // ↘+D

    // Close vs Far
    if (input.buttonAPressed) return close ? AttackType.CLOSE_A : AttackType.STAND_A;
    if (input.buttonBPressed) return close ? AttackType.CLOSE_B : AttackType.STAND_B;
    if (input.buttonCPressed) return close ? AttackType.CLOSE_C : AttackType.STAND_C;
    if (input.buttonDPressed) return close ? AttackType.CLOSE_D : AttackType.STAND_D;
    return null;
  }

  /** Try punch specials: 荒咬み(qcf+A), 毒咬み(qcf+C), fireball, dragon upper */
  private tryPunchSpecial(input: ResolvedInput): AttackType | null {
    if (!input.punchPressed) return null;

    const tick = this.tickRef.value;

    // Check QCF: determines punch special by which button
    const qcf = this.cmdBuf.checkSpecial(tick, true);
    if (qcf) {
      if (qcf === AttackType.SPECIAL_PROJECTILE) return AttackType.SPECIAL_PROJECTILE;
      if (qcf === AttackType.SPECIAL_UPPER) return AttackType.SPECIAL_UPPER;
    }

    // Kyo rekka starters via QCF + specific button
    if (this.cmdBuf.hasQCF(tick)) {
      if (input.buttonAPressed) return AttackType.KYO_ARAGAMI;   // 荒咬み: QCF+A
      if (input.buttonCPressed) return AttackType.KYO_DOKUGAMI;  // 毒咬み: QCF+C
    }

    return null;
  }

  /** Try kick specials: 75式改(QCF+K), R.E.D. Kick(QCB+K) */
  private tryKickSpecial(input: ResolvedInput): AttackType | null {
    if (!input.kickPressed) return null;
    return this.cmdBuf.checkKickSpecial(this.tickRef.value, true);
  }

  /** Try DM super move */
  private tryDM(input: ResolvedInput): AttackType | null {
    if (!input.punchPressed) return null;
    return this.cmdBuf.checkDM(this.tickRef.value, true);
  }

  /** Check rekka chain followup inputs during attack recovery */
  private tryRekkaFollowup(input: ResolvedInput): AttackType | null {
    const f = this.fighter;
    if (!f.rekkaChain || f.rekkaWindow <= 0) return null;
    if (f.attackPhase !== 'recovery' && f.attackPhase !== 'active') return null;
    if (!input.punchPressed) return null;

    const tick = this.tickRef.value;

    if (f.rekkaChain === 'aragami') {
      // 荒咬み → 九傷 (QCF+P) or 八錆 (HCB+P)
      const qcf = this.cmdBuf.checkRekkaFollowQCF(tick, true);
      if (qcf) return qcf;
      const hcb = this.cmdBuf.checkRekkaFollowHCB(tick, true);
      if (hcb) return hcb;
    }

    if (f.rekkaChain === 'dokugami') {
      // 毒咬み → 罪詠み (HCB+P)
      const follow = this.cmdBuf.checkDokugamiFollow(tick, true);
      if (follow) return follow;
    }

    return null;
  }

  /** Check 75式改 second hit: K pressed during first hit recovery */
  private try75KaiFollowup(input: ResolvedInput): boolean {
    const f = this.fighter;
    if (f.currentAttack !== AttackType.KYO_75KAI) return false;
    if (f.attackPhase !== 'recovery' && f.attackPhase !== 'active') return false;
    return input.kickPressed;
  }

  /** Check 罰詠み: f+P after 罪詠み */
  private tryBatsuyomi(input: ResolvedInput): boolean {
    const f = this.fighter;
    if (f.currentAttack !== AttackType.KYO_TSUMIYOMI) return false;
    if (f.attackPhase !== 'recovery' && f.attackPhase !== 'active') return false;
    return this.cmdBuf.checkBatsuyomiInput(input.forward, input.punchPressed);
  }

  // ─── State machine ───

  private tickStateMachine(input: ResolvedInput): void {
    const f = this.fighter;
    f.tickTimers();

    // Decrement rekka window
    if (f.rekkaWindow > 0) f.rekkaWindow--;

    switch (f.state) {
      case FighterState.IDLE:
      case FighterState.WALK: {
        f.displayHeight = 100;
        f.vx = 0;

        // Roll (A+B)
        if (input.rollPressed && f.canAct() && f.isGrounded()) {
          f.state = input.back ? FighterState.BACK_ROLL : FighterState.ROLL;
          f.rollTimer = ROLL_DURATION;
          f.vx = (f.state === FighterState.ROLL ? ROLL_SPEED : -ROLL_SPEED) * f.facing;
          f.displayHeight = 60;
          this.vfx.spawnDust(f.x, STAGE_GROUND_Y);
          return;
        }

        // CD Blowback (C+D)
        if (input.blowbackPressed && f.canAct()) {
          f.startAttack(AttackType.STAND_CD);
          return;
        }

        // Double-tap back → backdash
        if (this.checkDoubleBack(input) && f.canAct() && f.isGrounded()) {
          f.state = FighterState.BACKDASH;
          f.vx = -BACKDASH_VX * f.facing;
          f.vy = BACKDASH_VY;
          f.displayHeight = 80;
          this.vfx.spawnDust(f.x, STAGE_GROUND_Y);
          return;
        }

        // Double-tap forward → run
        if (this.checkDoubleForward(input) && f.canAct() && f.isGrounded()) {
          f.state = FighterState.RUN;
          f.vx = RUN_SPEED * f.facing;
          return;
        }

        // Jump / Hop / Hyper Jump
        if (this.upJustReleased(input) && f.isGrounded() && this.upHoldFrames > 0) {
          if (this.upHoldFrames <= HOP_THRESHOLD) {
            f.vy = HOP_VELOCITY;
            f.state = FighterState.HOP;
          } else if (this.checkHyperJump()) {
            f.vy = HYPER_JUMP_VY;
            f.vx = HYPER_JUMP_VX * (input.forward ? 1 : input.back ? -1 : 0) * f.facing;
            f.state = FighterState.HYPER_JUMP;
            this.vfx.spawnDust(f.x, STAGE_GROUND_Y);
          } else {
            f.vy = JUMP_VELOCITY;
            f.state = FighterState.JUMP;
          }
          return;
        }

        if (input.down && !this.prevDown) this.lastDownTick = this.tickRef.value;

        // Crouch
        if (input.down && f.isGrounded()) {
          f.state = FighterState.CROUCH;
          f.displayHeight = 50;
          return;
        }

        // Throw
        if (input.throwAttackPressed && f.canAct()) {
          f.startAttack(AttackType.THROW);
          return;
        }

        // DM super move (highest special priority)
        if (f.canAct()) {
          const dm = this.tryDM(input);
          if (dm) { f.startAttack(dm); return; }
        }

        // Punch specials (荒咬み/毒咬み/fireball/upper)
        if (input.punchPressed && f.canAct()) {
          const special = this.tryPunchSpecial(input);
          if (special) { f.startAttack(special); return; }
        }

        // Kick specials (75改/R.E.D. Kick)
        if (f.canAct()) {
          const kickSpec = this.tryKickSpecial(input);
          if (kickSpec) { f.startAttack(kickSpec); return; }
        }

        // Normal attacks
        if ((input.punchPressed || input.kickPressed) && f.canAct()) {
          const atk = this.routeAttack(input);
          if (atk) { f.startAttack(atk); return; }
        }

        // Walk
        if (input.forward) {
          f.vx = WALK_SPEED * f.facing;
          f.state = FighterState.WALK;
        } else if (input.back) {
          f.vx = -WALK_SPEED * f.facing;
          f.state = FighterState.WALK;
        } else {
          f.state = FighterState.IDLE;
        }
        break;
      }

      case FighterState.RUN: {
        f.displayHeight = 100;
        f.vx = RUN_SPEED * f.facing;

        if (input.up && f.isGrounded()) {
          f.state = FighterState.RUN_JUMP;
          f.vy = RUN_JUMP_VY;
          f.vx = RUN_JUMP_VX * f.facing;
          this.vfx.spawnDust(f.x, STAGE_GROUND_Y);
          return;
        }

        if (input.down && f.isGrounded()) {
          f.state = FighterState.CROUCH;
          f.displayHeight = 50;
          f.vx = 0;
          return;
        }

        if (input.throwAttackPressed && f.canAct()) {
          f.startAttack(AttackType.THROW);
          return;
        }

        // Kick specials from run
        if (f.canAct()) {
          const kickSpec = this.tryKickSpecial(input);
          if (kickSpec) { f.startAttack(kickSpec); return; }
        }

        if (input.punchPressed && f.canAct()) {
          const special = this.tryPunchSpecial(input);
          if (special) { f.startAttack(special); return; }
        }

        if ((input.punchPressed || input.kickPressed) && f.canAct()) {
          const atk = this.routeAttack(input);
          if (atk) { f.startAttack(atk); return; }
        }

        if (!input.forward) {
          f.vx = 0;
          f.state = FighterState.IDLE;
        }
        break;
      }

      case FighterState.BACKDASH: {
        f.vy += GRAVITY;
        if (f.isGrounded() && f.vy >= 0) {
          f.state = FighterState.IDLE;
          f.vx = 0;
          f.vy = 0;
          f.displayHeight = 100;
          f.landingRecovery = LANDING_RECOVERY;
          this.vfx.spawnDust(f.x, STAGE_GROUND_Y);
        }
        break;
      }

      case FighterState.ROLL:
      case FighterState.BACK_ROLL: {
        f.rollTimer--;
        f.displayHeight = 60;
        if (f.rollTimer <= 0) {
          f.state = FighterState.IDLE;
          f.vx = 0;
          f.displayHeight = 100;
          f.landingRecovery = ROLL_RECOVERY;
        }
        break;
      }

      case FighterState.HOP:
      case FighterState.HYPER_JUMP: {
        if ((input.punchPressed || input.kickPressed) && !f.currentAttack) {
          const atk = this.routeAttack(input);
          if (atk) f.startAttack(atk);
        }
        f.vy += GRAVITY;
        break;
      }

      case FighterState.JUMP:
      case FighterState.RUN_JUMP: {
        if (input.blowbackPressed && !f.currentAttack) {
          f.startAttack(AttackType.JUMP_CD);
        } else if ((input.punchPressed || input.kickPressed) && !f.currentAttack) {
          const atk = this.routeAttack(input);
          if (atk) f.startAttack(atk);
        }
        f.vy += GRAVITY;
        break;
      }

      case FighterState.CROUCH: {
        f.displayHeight = 50;
        f.vx = 0;
        if (!input.down) { f.state = FighterState.IDLE; f.displayHeight = 100; return; }

        if (input.throwAttackPressed && f.canAct()) {
          f.startAttack(AttackType.THROW);
          return;
        }

        if ((input.punchPressed || input.kickPressed) && f.canAct()) {
          const atk = this.routeAttack(input);
          if (atk) { f.startAttack(atk); return; }
        }
        break;
      }

      case FighterState.STAND_ATTACK:
      case FighterState.CROUCH_ATTACK:
      case FighterState.AIR_ATTACK:
      case FighterState.THROW: {
        // Spawn projectile for fireball
        if (f.currentAttack === AttackType.SPECIAL_PROJECTILE && f.attackPhase === 'active' && f.attackFrame === 0) {
          this.projectiles.push(new Projectile(
            f.x + 50 * f.facing, f.y - 50, f.facing,
            FRAME_DATA.SPECIAL_PROJECTILE.active, this.playerIndex,
          ));
        }
        // Dragon upper rises
        if (f.currentAttack === AttackType.SPECIAL_UPPER && f.attackPhase === 'active') {
          f.vy = -6;
        }
        // R.E.D. Kick: rises during active
        if (f.currentAttack === AttackType.KYO_RED_KICK && f.attackPhase === 'active') {
          f.vy = -4;
          f.vx = 3 * f.facing;
        }

        // ── Rekka chain followup checks ──
        if (f.rekkaChain && f.rekkaWindow > 0 && f.attackPhase === 'recovery') {
          // 荒咬み chain followups
          const rekkaFollow = this.tryRekkaFollowup(input);
          if (rekkaFollow) {
            f.endAttack();
            f.startAttack(rekkaFollow);
            f.rekkaWindow = REKKA_WINDOW;
            return;
          }
          // 毒咬み chain: 罪詠み → 罰詠み
          if (f.currentAttack === AttackType.KYO_TSUMIYOMI) {
            if (this.tryBatsuyomi(input)) {
              f.endAttack();
              f.startAttack(AttackType.KYO_BATSUYOMI);
              f.rekkaChain = null;
              return;
            }
          }
        }

        // ── 75式改 second hit ──
        if (this.try75KaiFollowup(input)) {
          f.endAttack();
          f.startAttack(AttackType.KYO_75KAI_2);
          return;
        }

        // Set rekka window on rekka starter hit
        if (f.rekkaChain && f.attackPhase === 'active' && f.attackFrame === 0) {
          f.rekkaWindow = REKKA_WINDOW;
        }

        f.tickAttack();
        if (!f.currentAttack && !f.isGrounded()) {
          f.state = FighterState.JUMP;
        }
        break;
      }

      case FighterState.BLOCK:
        f.blockstunTimer--;
        f.vx *= 0.8;
        if (f.blockstunTimer <= 0) { f.state = FighterState.IDLE; f.vx = 0; }
        break;

      case FighterState.HITSTUN:
        f.hitstunTimer--;
        f.vx *= 0.85;
        if (f.hitstunTimer <= 0) { f.state = FighterState.IDLE; f.vx = 0; }
        break;

      case FighterState.KNOCKDOWN:
        f.knockdownTimer--;
        f.vx *= 0.9;
        if (f.knockdownTimer <= 0) {
          f.state = FighterState.IDLE;
          f.isKnockedDown = false;
          f.displayHeight = 100;
          f.vx = 0;
        }
        break;
    }
  }
}

/** Resolve pushbox overlap between two fighters */
export function resolvePushbox(a: Fighter, b: Fighter): void {
  const aBox = a.getPushbox();
  const bBox = b.getPushbox();
  const overlap = Math.min(aBox.x + aBox.width, bBox.x + bBox.width) - Math.max(aBox.x, bBox.x);
  if (overlap > 0) {
    const push = overlap / 2 + 0.5;
    if (a.x < b.x) { a.x -= push; b.x += push; }
    else { a.x += push; b.x -= push; }
  }
}
