import { Fighter } from '../entities/fighter.js';
import { Projectile } from '../entities/projectile.js';
import type { FighterController } from '../entities/fighterController.js';
import type { IInputProvider } from '../input/inputProvider.js';
import { resolveInput } from '../input/inputResolver.js';
import type { PrevAttack, RawInput } from '../input/inputResolver.js';
import { createPrevAttack, updatePrevAttack } from '../input/inputResolver.js';
import {
  FRAME_DATA, THROW_RANGE, THROW_DISTANCE,
  CHIP_DAMAGE_RATIO,
  CH_DAMAGE_BONUS,
  DAMAGE_SCALE_STEP, DAMAGE_SCALE_MIN_NORMAL, DAMAGE_SCALE_MIN_SPECIAL, DAMAGE_SCALE_MIN_DM, COMBO_TIMEOUT,
  COUNTER_WIRE_BOUNCE_VX, COUNTER_WIRE_BOUNCE_VY,
  LIGHT_NORMALS, NORMAL_ATTACKS, COMMAND_NORMALS,
  STAGE_LEFT, STAGE_RIGHT,
  JUGGLE_POINTS_MAX, JUGGLE_COST_LIGHT, JUGGLE_COST_HEAVY, JUGGLE_COST_SPECIAL, JUGGLE_COST_DM,
  THROW_INVINCIBILITY_POST_ESCAPE,
  PROXIMITY_GUARD_RANGE,
} from '../core/constants.js';
import { CLOSE_RANGE } from '../core/types.js';
import { FighterState, AttackType, JuggleState } from '../core/types.js';
import type { HitLevel } from '../core/types.js';
import { isDM, isSpecialOrDM, isCharacterSpecial } from '../core/attackClassifier.js';
import { resolveProjectileHits } from './projectileResolver.js';
import type { ProjectileResolverContext, HitCallback, GuardCrushCallback } from './projectileResolver.js';
export type { HitCallback, GuardCrushCallback } from './projectileResolver.js';

/** Throw escape window in frames (KOF2002: 6 frames, strict) */
const THROW_ESCAPE_WINDOW = 10; // KOF2002正版: 拆投窗口≈10F (比之前6F更宽松)
/** Push-apart distance on successful throw escape */
const THROW_ESCAPE_PUSH = 60;

export type ThrowEscapeCallback = (
  attacker: Fighter, defender: Fighter,
  hitX: number, hitY: number,
) => void;

export class CombatSystem {
  private inputProvider: IInputProvider;
  private prev: [PrevAttack, PrevAttack] = [createPrevAttack(), createPrevAttack()];
  private fighters: [Fighter, Fighter] | null = null;
  defenderControllers: [FighterController, FighterController] | null = null;
  onThrowEscape: ThrowEscapeCallback | null = null;
  onGuardCrush: GuardCrushCallback | null = null;
  // Damage scaling combo tracking (per defender)
  private comboHits = [0, 0];
  private comboDamage = [0, 0]; // cumulative combo damage per defender
  // 连击超时: 最后一次命中帧数, 超过COMBO_TIMEOUT帧未命中则重置
  private lastHitFrame = [0, 0];
  private currentFrame = 0;
  // 风云再起特色: 第一次命中奖励 (每回合每个对手一次)
  private firstHitAwarded = [false, false];
  // MAX mode state per player (true = active, -33% damage penalty)
  private maxModes: [boolean, boolean] = [false, false];

  constructor(inputProvider: IInputProvider) {
    this.inputProvider = inputProvider;
  }

  resolveAttacks(p1: Fighter, p2: Fighter, projectiles: Projectile[], onHit?: HitCallback, currentFrame: number = 0, maxModes?: [boolean, boolean]): void {
    this.fighters = [p1, p2];
    this.maxModes = maxModes ?? [false, false];
    this.currentFrame = currentFrame;
    this.resolveHit(p1, p2, onHit);
    this.resolveHit(p2, p1, onHit);
    const ctx: ProjectileResolverContext = {
      inputProvider: this.inputProvider,
      prev: this.prev,
      comboHits: this.comboHits,
      lastHitFrame: this.lastHitFrame,
      currentFrame: this.currentFrame,
      maxModes: this.maxModes,
      onGuardCrush: this.onGuardCrush,
      scaledDamage: this.scaledDamage.bind(this),
    };
    resolveProjectileHits(p1, p2, projectiles, onHit, ctx);
  }

  updateEdgeTracking(rawP1: RawInput, rawP2: RawInput): void {
    updatePrevAttack(this.prev[0], rawP1);
    updatePrevAttack(this.prev[1], rawP2);
  }

  getPrevAttack(playerIndex: number): PrevAttack {
    return this.prev[playerIndex];
  }

  /** Reset combo for a player (called on block or timeout) */
  resetCombo(playerIndex: number): void {
    this.comboHits[playerIndex] = 0;
    this.comboDamage[playerIndex] = 0;
  }

  /** Get current combo count for a player */
  getComboCount(playerIndex: number): number {
    return this.comboHits[playerIndex];
  }

  /** Get cumulative combo damage for a player */
  getComboDamage(playerIndex: number): number {
    return this.comboDamage[playerIndex];
  }

  /** 风云再起: 检查是否首次命中并标记 (每回合每对手一次) */
  wasFirstHitAwarded(defIdx: number): boolean {
    if (this.firstHitAwarded[defIdx]) return true;
    this.firstHitAwarded[defIdx] = true;
    return false;
  }

  /** 每帧调用: 检查连击超时, 超过COMBO_TIMEOUT帧未命中则重置连击 */
  tickComboTimeout(currentFrame: number): void {
    for (let i = 0; i < 2; i++) {
      if (this.comboHits[i] > 0 && currentFrame - this.lastHitFrame[i] > COMBO_TIMEOUT) {
        this.comboHits[i] = 0;
        this.comboDamage[i] = 0;
      }
    }
  }

  reset(): void {
    this.prev = [createPrevAttack(), createPrevAttack()];
    this.comboHits = [0, 0];
    this.comboDamage = [0, 0];
    this.lastHitFrame = [0, 0];
    this.firstHitAwarded = [false, false];
  }

  /**
   * Tick throw escape window for both fighters.
   * Called every frame from the main loop AFTER resolveAttacks.
   * Returns true if a throw escape occurred this frame.
   */
  tickThrowState(p1: Fighter, p2: Fighter, onHit?: HitCallback): boolean {
    let escaped = false;
    const fighters: [Fighter, Fighter] = [p1, p2];

    for (let i = 0; i < 2; i++) {
      const defender = fighters[i];
      if (!defender.isBeingThrown || defender.throwEscapeTimer <= 0) continue;

      // Get defender input to check for throw escape
      const raw = i === 0 ? this.inputProvider.getP1Input() : this.inputProvider.getP2Input();
      const defInput = resolveInput(raw, defender.facing, this.prev[i]);

      defender.throwEscapeTimer--;

      // Check for throw escape: defender presses throw or CD (KOF2002 loophole: CD techs both C and D throws)
      if ((defInput.throwAttackPressed || defInput.blowbackPressed) && defender.throwEscapeTimer >= 0) {
        const attacker = fighters[1 - i];
        const hitX = (attacker.x + defender.x) / 2;
        const hitY = (attacker.y + defender.y) / 2 - attacker.displayHeight / 2;

        // Push both apart
        const pushDir = attacker.facing;
        attacker.x -= THROW_ESCAPE_PUSH * pushDir * 0.5;
        defender.x += THROW_ESCAPE_PUSH * pushDir * 0.5;
        attacker.x = Math.max(STAGE_LEFT, Math.min(attacker.x, STAGE_RIGHT));
        defender.x = Math.max(STAGE_LEFT, Math.min(defender.x, STAGE_RIGHT));

        // Reset both fighters to IDLE
        attacker.isThrowing = false;
        attacker.invincible = false;
        attacker.throwVictim = null;
        attacker.endAttack();
        defender.isBeingThrown = false;
        defender.throwEscapeTimer = 0;
        defender.state = FighterState.IDLE;
        defender.isKnockedDown = false;

        // Post-escape throw invincibility
        attacker.throwInvulnFrames = THROW_INVINCIBILITY_POST_ESCAPE;
        defender.throwInvulnFrames = THROW_INVINCIBILITY_POST_ESCAPE;

        // VFX + audio callback
        this.onThrowEscape?.(attacker, defender, hitX, hitY);

        escaped = true;
        break;
      }

      // Timer expired — resolve throw as damage + hard knockdown
      if (defender.throwEscapeTimer <= 0) {
        const attacker = fighters[1 - i];
        const throwType = attacker.currentAttack;
        const data = (throwType === AttackType.THROW_FORWARD || throwType === AttackType.THROW_BACK)
          ? FRAME_DATA[throwType as keyof typeof FRAME_DATA] ?? FRAME_DATA[AttackType.THROW]
          : FRAME_DATA[AttackType.THROW];
        const defIdx = i;
        let damage = this.scaledDamage(data.damage, defIdx, throwType ?? undefined);
        // MAX mode damage penalty on throws
        const atkIdxForThrow = 1 - i;
        if (this.maxModes[atkIdxForThrow]) {
          damage = Math.round(damage * 0.67);
        }

        defender.health = Math.max(0, defender.health - damage);
        defender.applyKnockdown(30, true);
        const throwDir = defender.throwDirection;
        defender.x = Math.max(STAGE_LEFT, Math.min(attacker.x + THROW_DISTANCE * throwDir, STAGE_RIGHT));
        defender.isBeingThrown = false;

        attacker.isThrowing = false;
        attacker.invincible = false;
        attacker.throwVictim = null;

        this.comboHits[defIdx]++;
        this.lastHitFrame[defIdx] = this.currentFrame;
        onHit?.(attacker, defender, AttackType.THROW, false, false);
      }
    }

    return escaped;
  }

  private canBlock(hitLevel: HitLevel, crouching: boolean, dist: number): boolean {
    if (hitLevel === 'MID') return true;
    if (hitLevel === 'LOW') return crouching;
    // KOF2002: Proximity guard — 近距离内HIGH攻击也可以站防(即使蹲着)
    if (hitLevel === 'HIGH') return !crouching || dist < PROXIMITY_GUARD_RANGE;
    return false;
  }

  /** KOF2002 damage scaling: single-layer scaling by combo count, DM always full */
  private scaledDamage(baseDamage: number, defIdx: number, attackType?: AttackType): number {
    const minDamage = 1;
    const comboHits = this.comboHits[defIdx];
    if (comboHits <= 0) return baseDamage;
    const name = (attackType ?? '') as string;
    // KOF2002: DM/SDM always deal full damage in combos
    const _isDM = isDM(name);
    const _isSpecial = isSpecialOrDM(name) || name === 'STAND_CD' || name === 'JUMP_CD';
    if (_isDM) return Math.max(minDamage, baseDamage);
    if (_isSpecial) {
      // 必杀技：每击 -3%，最低 60%
      const scale = Math.max(0.60, 1 - comboHits * 0.03);
      return Math.max(minDamage, Math.round(baseDamage * scale));
    }
    // 通常技：每击 -5%，最低 30%
    const scale = Math.max(0.30, 1 - comboHits * 0.05);
    return Math.max(minDamage, Math.round(baseDamage * scale));
  }

  private resolveHit(attacker: Fighter, defender: Fighter, onHit?: HitCallback): void {
    const attackType = attacker.currentAttack;
    if (!attackType || attacker.hasHit) return;

    const data = FRAME_DATA[attackType as keyof typeof FRAME_DATA];

    // === 投技判定通道: Throwbox vs Hurtbox ===
    const throwbox = attacker.getThrowbox();
    if (throwbox) {
      if (!defender.isThrowVulnerable()) return;
      const defenderHurt = defender.getEffectiveHurtbox() ?? defender.getHurtbox();
      if (!aabbCheck(throwbox, defenderHurt)) return;

      attacker.hasHit = true;

      // 指令投(不可拆投): 直接结算伤害
      const attackerCtrl = this.defenderControllers?.[this.fighters?.[0] === attacker ? 0 : 1];
      if (attackerCtrl?.charDef?.isCommandThrow?.(attackType)) {
        const defIdx = this.fighters ? (this.fighters[0] === defender ? 0 : 1) : 0;
        const damage = this.scaledDamage(data.damage, defIdx, attackType);
        defender.health = Math.max(0, defender.health - damage);
        this.comboHits[defIdx]++;
        this.lastHitFrame[defIdx] = this.currentFrame;
        if (attackType === AttackType.IORI_KUZUKAZE) {
          const tempX = attacker.x;
          attacker.x = defender.x;
          defender.x = tempX;
        }
        defender.state = FighterState.KNOCKDOWN;
        defender.isKnockedDown = true;
        defender.vx = 0; defender.vy = 0;
        onHit?.(attacker, defender, attackType, false, false);
        return;
      }

      // 普通投(可拆投): 进入拆投窗口
      const throwDir: 1 | -1 = attackType === AttackType.THROW_BACK ? (-attacker.facing as 1 | -1) : attacker.facing;
      attacker.isThrowing = true;
      attacker.invincible = true; // KOF2002: 投技执行中攻击者无敌
      attacker.throwVictim = defender;
      defender.isBeingThrown = true;
      defender.throwEscapeTimer = THROW_ESCAPE_WINDOW;
      defender.throwDirection = throwDir;
      defender.x = Math.max(STAGE_LEFT, Math.min(attacker.x + THROW_DISTANCE * throwDir, STAGE_RIGHT));
      return;
    }

    // === 攻击判定通道: Hitbox vs Hurtbox ===
    const hitboxes = attacker.getActiveHitboxes();
    if (hitboxes.length === 0) return;

    const hurtbox = defender.getEffectiveHurtbox();
    if (!hurtbox) return; // 完全无敌,跳过

    let hit = false;
    for (const hitbox of hitboxes) {
      if (aabbCheck(hitbox, hurtbox)) { hit = true; break; }
    }
    if (!hit) return;

    attacker.hasHit = true;

    // Roll invincibility check — only invincible during first portion of roll
    if (defender.isRollInvincible()) return;

    // Backdash invincibility — first 5 frames of backdash are strike-invincible
    if (defender.isBackdashInvincible()) return;

    // B7: Juggle check — if defender is airborne, check juggle budget
    if (!defender.isGrounded()) {
      if (defender.juggleState === JuggleState.NONE) return; // Can't hit airborne
      if (defender.juggleState === JuggleState.HALF && defender.vy > 0) return;
      // Juggle point check: each air hit consumes points from budget
      // KOF2002: progressive juggle cost — 每次空中命中消耗递增20%
      const baseCost = getJuggleCost(attackType);
      const juggleCost = Math.ceil(baseCost * (1 + defender.airHitCount * 0.2));
      if (defender.jugglePoints < juggleCost) return; // not enough juggle budget
      defender.jugglePoints -= juggleCost;
      defender.airHitCount++;
      // KOF2002 juggle gravity: each successive air hit increases gravity (opponent falls faster)
      // Makes long juggle combos progressively harder
      const gravityScale = 1 + defender.airHitCount * 0.15;
      defender.vy += 0.3 * gravityScale;
    }

    const defIdx = this.fighters ? (this.fighters[0] === defender ? 0 : 1) : 0;
    const raw = defIdx === 0 ? this.inputProvider.getP1Input() : this.inputProvider.getP2Input();
    const defInput = resolveInput(raw, defender.facing, this.prev[defIdx]);

    const crouching = defender.state === FighterState.CROUCH;
    const isAirborne = !defender.isGrounded();
    // Cancelled-into command normals lose special properties: MID instead of HIGH/LOW, no knockdown
    const isCancelledCmdNormal = attacker.cancelledIntoNormal && COMMAND_NORMALS.has(attackType as string);
    const hitLevel = (isCancelledCmdNormal ? 'MID' : data.hitLevel) as HitLevel;

    // 空中防御：空中按后可防 HIGH/MID 攻击，不能防 LOW
    if (isAirborne && defender.canAirBlock() && defInput.back && hitLevel !== 'LOW') {
      defender.applyAirBlockstun(data.blockstun, data.pushback);
      // KOF2002: 空中防御chip damage比地面少30%
      const chipData = data as { chipDamage?: number };
      const chip = chipData.chipDamage ?? Math.round(data.damage * CHIP_DAMAGE_RATIO * 0.7);
      defender.health = Math.max(1, defender.health - chip);
      this.comboHits[defIdx] = 0;
      // KOF2002: 通常技被防也允许取消到必杀技
      if (NORMAL_ATTACKS.has(attackType as string)) attacker.normalCancelReady = true;
      onHit?.(attacker, defender, attackType, true, false);
      return;
    }

    // 地面防御
    const dist = Math.abs(attacker.x - defender.x);
    if (defender.canBlock() && !isAirborne && defInput.back && this.canBlock(hitLevel, crouching, dist)) {
      // KOF2002: 防御时防御槽减少(被攻击消耗)但成功防御获得少量气槽恢复奖励
      defender.guardGauge = Math.max(0, defender.guardGauge - guardGaugeDamage(attackType));
      defender.guardGauge = Math.min(100, defender.guardGauge + 2);

      if (defender.guardGauge <= 0) {
        // Guard Crush — stunned instead of normal blockstun
        defender.state = FighterState.GUARD_CRUSH;
        defender.guardCrushTimer = GUARD_CRUSH_DURATION;
        defender.vx = data.pushback * (defender.facing === 1 ? -1 : 1) * 1.5;
        defender.resetAttackState();
        const hitX = (attacker.x + defender.x) / 2;
        const hitY = defender.y - defender.displayHeight / 2;
        this.onGuardCrush?.(defender, hitX, hitY);
      } else {
        defender.applyBlockstun(data.blockstun, data.pushback);
      }
      const chipData = data as { chipDamage?: number };
      const chip = chipData.chipDamage ?? Math.round(data.damage * CHIP_DAMAGE_RATIO);
      // A6: Chip damage cannot kill (leave at least 1 HP)
      defender.health = Math.max(1, defender.health - chip);
      this.comboHits[defIdx] = 0; // Block resets combo
      // KOF2002: 角落防御时攻击者被额外推回(防御方无法后退, 攻击者被推走)
      const defNearCorner = defender.x < STAGE_LEFT + 60 || defender.x > STAGE_RIGHT - 60;
      if (defNearCorner) {
        attacker.vx = -data.pushback * 0.5 * attacker.facing;
      }
      // KOF2002: 通常技被防也允许取消到必杀技
      if (NORMAL_ATTACKS.has(attackType as string)) attacker.normalCancelReady = true;
      onHit?.(attacker, defender, attackType, true, false);
      return;
    }

    // Counter Hit: defender is in an attack state
    const isDefenderAttacking = defender.state === FighterState.STAND_ATTACK
      || defender.state === FighterState.CROUCH_ATTACK
      || defender.state === FighterState.AIR_ATTACK;
    const counterHit = isDefenderAttacking;

    // 当身技检测：如果防御方处于 COUNTER_STANCE 状态，触发反击
    if (defender.state === FighterState.COUNTER_STANCE) {
      const defCtrl = this.defenderControllers?.[defIdx];
      if (defCtrl) {
        const charDef = defCtrl.charDef;
        const counterConfig = charDef.getCounterConfig?.();
        if (counterConfig) {
          // 当身成功！攻击者受到反击伤害
          attacker.health = Math.max(0, attacker.health - counterConfig.counterDamage);
          attacker.applyHitstun(25, 8);
          // 防御方恢复
          defender.state = FighterState.IDLE;
          defender.vx = 0;
          onHit?.(defender, attacker, counterConfig.counterAttack, false, true);
          this.comboHits[defIdx]++;
          this.lastHitFrame[defIdx] = this.currentFrame;
          return;
        }
      }
    }

    // Damage
    let damage = this.scaledDamage(data.damage, defIdx, attackType);
    let hitstunFrames: number = data.hitstun;

    // KOF2002: aerial defender hitstun reduced (harder to combo airborne opponents)
    if (!defender.isGrounded()) {
      hitstunFrames = Math.round(hitstunFrames * 0.65);
    }

    // Close range damage bonus: CLOSE_ attacks get +10% at point-blank range
    const attackName = attackType as string;
    if (attackName.startsWith('CLOSE_')) {
      const dist = Math.abs(attacker.x - defender.x);
      if (dist < CLOSE_RANGE * 0.5) {
        damage = Math.round(damage * 1.1);
      }
    }

    if (counterHit) {
      // KOF2002正版: CH无伤害加成, 奖励是额外hitstun (+3F通常 / +5F必杀) 以延长连击窗口
      // ground heavy/special CH = extra hitstun (+3-5F) for combo punishment
      if (defender.isGrounded() && !LIGHT_NORMALS.has(attackType as string)) {
        const isSpecial = !NORMAL_ATTACKS.has(attackType as string) && !COMMAND_NORMALS.has(attackType as string);
        hitstunFrames += isSpecial ? 5 : 3;
      }
      // KOF2002: CH空中命中给予额外浮空值, 使CH对空更 rewarding
      if (!defender.isGrounded()) {
        defender.jugglePoints = Math.min(JUGGLE_POINTS_MAX, defender.jugglePoints + 15);
      }
    }

    // MAX mode damage penalty: attacker in MAX mode deals -33% damage (KOF2002)
    const atkIdx = this.fighters![0] === attacker ? 0 : 1;
    if (this.maxModes[atkIdx]) {
      damage = Math.round(damage * 0.67);
    }
    // MAX mode defense bonus: defender in MAX mode takes -25% damage (KOF2002)
    if (this.maxModes[defIdx]) {
      damage = Math.round(damage * 0.75);
    }

    this.comboHits[defIdx]++;
    // 单层缩放已由 scaledDamage() 处理, 不再叠加第二层连击递减
    this.comboDamage[defIdx] += damage;
    this.lastHitFrame[defIdx] = this.currentFrame;

    defender.health = Math.max(0, defender.health - damage);
    // KOF2002: 被命中时防御槽也减少(比防御时少30%), 连段越久防御崩坏风险越高
    defender.guardGauge = Math.max(0, defender.guardGauge - guardGaugeDamage(attackType) * 0.3);

    // KOF2002: air counter hit → jugglable state (full juggle budget)
    if (counterHit && !defender.isGrounded()) {
      defender.juggleState = JuggleState.FULL;
      defender.jugglePoints = JUGGLE_POINTS_MAX;
    }

    // Counter Wire: counter hit + counterWire move → wall bounce instead of knockdown
    // CD attacks always cause wall bounce on hit (not just counter)
    const frameData = data as { counterWire?: boolean };
    const isCDAttack = attackType === AttackType.STAND_CD || attackType === AttackType.JUMP_CD;
    const shouldWallBounce = (counterHit && frameData.counterWire) || isCDAttack;
    if (shouldWallBounce) {
      defender.isCounterWire = true;
      const flyDir = defender.x < attacker.x ? -1 : 1;
      defender.vx = COUNTER_WIRE_BOUNCE_VX * flyDir * -1;
      defender.vy = COUNTER_WIRE_BOUNCE_VY;
      defender.juggleState = JuggleState.FULL;
      // KOF2002: CD wire gives full juggle, counter wire gives reduced (3 pts)
      defender.jugglePoints = isCDAttack ? JUGGLE_POINTS_MAX : 3;
      defender.state = FighterState.HITSTUN;
      defender.hitstunTimer = 30;
      defender.isKnockedDown = false;
    } else if (data.knockdown && !isCancelledCmdNormal) {
      defender.applyKnockdown(25);
      // 浮空追打: 击飞时给予完整的juggle预算和FULL状态
      if (!defender.isGrounded()) {
        defender.jugglePoints = JUGGLE_POINTS_MAX;
        defender.juggleState = JuggleState.FULL;
      }
    } else {
      // KOF2002: pushback递减 — 连段越长推力越小(第2击85%, 第3击70%, 第4+击55%)
      const comboScale = this.comboHits[defIdx] <= 1 ? 1.0
        : this.comboHits[defIdx] === 2 ? 0.85
        : this.comboHits[defIdx] === 3 ? 0.70 : 0.55;
      const effectivePushback = data.pushback * comboScale;
      defender.applyHitstun(hitstunFrames, effectivePushback);
    }

    // Attacker pushback: slight recoil on hit (KOF2002 behavior)
    // KOF2002: 角落时攻击者额外被推回(防止无限角落压制)
    const defenderNearCorner = defender.x < STAGE_LEFT + 60 || defender.x > STAGE_RIGHT - 60;
    const cornerBonus = defenderNearCorner ? 1.5 : 1.0;
    const atkPushback = data.pushback * 0.2 * cornerBonus;
    if (atkPushback > 0.3) {
      attacker.vx = -atkPushback * attacker.facing;
    }

    // KOF2002: 命中闪烁颜色 — 攻击类型+连击数递增(白→黄→橙→红)
    const atkName2 = (attackType as string);
    const comboHits = this.comboHits[defIdx];
    if (atkName2.startsWith('DM_') || atkName2.startsWith('SDM_')) defender.hitFlashColor = '#6688ff';
    else if (counterHit) defender.hitFlashColor = '#ffaa44';
    else if (isSpecialMoveCheck(attackType))
      defender.hitFlashColor = '#ffee66';
    else if (comboHits >= 8) defender.hitFlashColor = '#ff4400';
    else if (comboHits >= 5) defender.hitFlashColor = '#ff8800';
    else if (comboHits >= 3) defender.hitFlashColor = '#ffcc00';
    else defender.hitFlashColor = '#ffffff';

    // Rapid Cancel: light normal on hit enables chaining into next light normal
    if (LIGHT_NORMALS.has(attackType as string)) {
      attacker.rapidCancelReady = true;
    }

    // Normal → Command Normal cancel: grounded normal on hit enables cancel into command normal
    if (NORMAL_ATTACKS.has(attackType as string)) {
      attacker.normalCancelReady = true;
    }

    // Super Cancel: special moves on hit enable cancel into DM (costs extra stock)
    const atkName = attackType as string;
    if (isCharacterSpecial(atkName) || atkName === AttackType.SPECIAL_UPPER
      || atkName === AttackType.SPECIAL_PROJECTILE) {
      attacker.superCancelReady = true;
    }

    onHit?.(attacker, defender, attackType, false, counterHit);
  }
}

/** Check if attack is a special move (not normal, not throw, not DM) */
function isSpecialMoveCheck(at: AttackType): boolean {
  const name = at as string;
  if (isDM(name)) return false;
  if (NORMAL_ATTACKS.has(name) || COMMAND_NORMALS.has(name)) return false;
  if (at === AttackType.THROW || at === AttackType.THROW_FORWARD || at === AttackType.THROW_BACK) return false;
  return isCharacterSpecial(name) || name.startsWith('SPECIAL_');
}

/** Guard gauge depletion based on attack type */
function guardGaugeDamage(attackType: AttackType): number {
  const name = attackType as string;
  if (isDM(name)) return name.startsWith('SDM_') ? 35 : 25;
  if (isSpecialMoveCheck(attackType)) return 15;
  if (COMMAND_NORMALS.has(name)) return 12;
  if (attackType === AttackType.STAND_CD || attackType === AttackType.JUMP_CD) return 12;
  if (name.endsWith('_C') || name.endsWith('_D')) return 10;
  return 5;
}

/** Guard Crush constant — stun duration in frames (KOF2002: 90 frames / 1.5 seconds) */
const GUARD_CRUSH_DURATION = 90;

/** Get juggle point cost for an attack type */
function getJuggleCost(attackType: AttackType): number {
  const name = attackType as string;
  if (isDM(name)) return JUGGLE_COST_DM;
  if (isSpecialMoveCheck(attackType)) return JUGGLE_COST_SPECIAL;
  if (name.endsWith('_C') || name.endsWith('_D')
    || COMMAND_NORMALS.has(name)
    || name.startsWith('CLOSE_C') || name.startsWith('CLOSE_D')) return JUGGLE_COST_HEAVY;
  return JUGGLE_COST_LIGHT;
}

function aabbCheck(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}
