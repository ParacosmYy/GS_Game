/**
 * 金家藩 (Kim Kaphwan) — 角色定义
 *
 * 必杀技:
 *   QCB+K(速) → 飛燕斬 (upper)
 *   QCF+K     → 覇気脚
 *   DP+P      → 半月斬 (upper, shared)
 * DM: QCB×2+K → 鳳凰脚
 */
import type { CharacterDefinition } from './types.js';
import { pose, bone } from './types.js';
import type { ResolvedInput } from '../input/inputResolver.js';
import type { CommandBuffer } from '../input/commandBuffer.js';
import { FighterState, AttackType } from '../core/types.js';
import { kimPortrait } from '../rendering/portraits/kimPortrait.js';

export const KimDef: CharacterDefinition = {
  id: 'kim',
  name: 'Kim Kaphwan',
  nameCn: '金',
  color: '#2288cc',
  accentColor: '#44aadd',
  specialColor: '#44ddff',
  specialGlow: '#88ccff',
  portrait: '🦵',
  pixelPortrait: kimPortrait,
  winQuotes: ['正義は必ず勝つ!', 'その程度ではダメだ', 'テコンドーの素晴らしさを教えよう'],

  stats: {
    walkSpeed: 5,
    runSpeed: 8,
    jumpVelocity: -13,
    hopVelocity: -11,
    hyperJumpVelocity: -16,
    maxHealth: 920,
    pushWidth: 56,
    jumpForwardSpeed: 6,
  },

  poses: {
    // 6-frame idle: disciplined taekwondo stance with breathing cycle
    [FighterState.IDLE]: [
      // Frame 0: Neutral — upright guard, balanced weight
      pose({ armFront: bone(8, 15, 0.1), armBack: bone(-5, 18, -0.4), legFront: bone(8, 0, 0.15), legBack: bone(-6, 0, -0.2) }),
      // Frame 1: Breathe in — body rises 2px, weight shifts to back leg
      pose({ armFront: bone(8, 13, 0.08), armBack: bone(-5, 16, -0.38), legFront: bone(7, 0, 0.12), legBack: bone(-7, 0, -0.22), body: bone(0, -2), head: bone(0, -2) }),
      // Frame 2: Peak — maximum rise, hands slightly higher
      pose({ armFront: bone(8, 11, 0.06), armBack: bone(-5, 14, -0.36), legFront: bone(6, 0, 0.1), legBack: bone(-8, 0, -0.24), body: bone(0, -2), head: bone(0, -2) }),
      // Frame 3: Transition — begins descent, weight shifts forward
      pose({ armFront: bone(8, 13, 0.09), armBack: bone(-5, 16, -0.39), legFront: bone(8, 0, 0.16), legBack: bone(-6, 0, -0.2), body: bone(0, -1) }),
      // Frame 4: Exhale — sinks 2px, hands lower slightly
      pose({ armFront: bone(8, 17, 0.12), armBack: bone(-5, 20, -0.42), legFront: bone(9, 0, 0.18), legBack: bone(-5, 0, -0.18), body: bone(0, 2), head: bone(0, 2) }),
      // Frame 5: Trough — lowest point, weight on front leg
      pose({ armFront: bone(8, 18, 0.13), armBack: bone(-5, 21, -0.43), legFront: bone(10, 0, 0.2), legBack: bone(-5, 0, -0.16), body: bone(0, 2), head: bone(0, 2) }),
    ],
    [FighterState.WALK]: [
      pose({ legFront: bone(12, -3, 0.3), legBack: bone(-3, 3, -0.22), armFront: bone(6, 19, 0.02), armBack: bone(-4, 22, -0.32) }),
      pose({ legFront: bone(10, 0, 0.18), legBack: bone(-5, 0, -0.12), armFront: bone(7, 17, 0.06), armBack: bone(-5, 20, -0.36) }),
      pose({ legFront: bone(6, 3, -0.22), legBack: bone(-12, -3, 0.3), armFront: bone(6, 18, 0.08), armBack: bone(-4, 21, -0.3) }),
      pose({ legFront: bone(8, 0, -0.1), legBack: bone(-6, 0, 0.08), armFront: bone(6, 16, 0.04), armBack: bone(-4, 19, -0.34) }),
    ],
    [FighterState.RUN]: [
      pose({ body: bone(10, 0, 0.25), armFront: bone(-5, 22, -0.9), armBack: bone(14, 26, 0.55), legFront: bone(16, -5, 0.55), legBack: bone(-8, 5, -0.42) }),
      pose({ body: bone(6, 0, 0.12), armFront: bone(-3, 18, -0.55), armBack: bone(10, 28, 0.28), legFront: bone(10, 5, 0.22), legBack: bone(-16, -5, 0.55) }),
    ],
    [FighterState.CROUCH]: pose({
      body: bone(0, 22, 0.12),
      head: bone(0, 16),
      armFront: bone(7, 24, 0.0),
      armBack: bone(-5, 22, -0.3),
      legFront: bone(11, 0, 0.55),
      legBack: bone(-9, 0, -0.45),
    }),
    [FighterState.BLOCK]: [
      pose({ armFront: bone(3, 8, -0.45), armBack: bone(0, 6, -0.65), legFront: bone(2, 0, 0.0) }),
      pose({ armFront: bone(2, 10, -0.5), armBack: bone(-1, 8, -0.7), body: bone(-2, 0, -0.05) }),
    ],
    [FighterState.HITSTUN]: [
      pose({ body: bone(-5, 0, -0.18), head: bone(-3, 3, -0.22), armFront: bone(-2, 20, 0.5), armBack: bone(-8, 18, 0.65) }),
      pose({ body: bone(-8, 2, -0.28), head: bone(-5, 4, -0.32), armFront: bone(0, 23, 0.6), armBack: bone(-10, 20, 0.8) }),
      pose({ body: bone(-3, -1, -0.1), head: bone(-2, 2, -0.14), armFront: bone(-4, 18, 0.4), armBack: bone(-6, 16, 0.55) }),
    ],
    [FighterState.KNOCKDOWN]: [
      pose({ body: bone(0, 15, 0.8), head: bone(8, 20, 0.9), armFront: bone(-5, 20, 0.6), armBack: bone(12, 18, -0.4), legFront: bone(-8, 15, -0.2), legBack: bone(6, 18, 0.3) }),
      pose({ body: bone(0, 30, 1.4), head: bone(10, 35, 1.2), legFront: bone(-10, 30, -0.3), legBack: bone(8, 32, 0.4) }),
    ],
    [FighterState.JUMP]: pose({
      armFront: bone(6, 5, 0.35),
      armBack: bone(-6, 3, -0.2),
      legFront: bone(2, -8, 0.4),
      legBack: bone(-4, -2, -0.55),
    }),
    // — Attack poses (upright martial arts stance, higher kicks, more leg extension) —
    [FighterState.STAND_ATTACK]: [
      pose({ head: bone(1, 0, 0.03), body: bone(2, 0, 0.05), armFront: bone(18, 4, 0.0, 1.0), armBack: bone(-8, 8, -0.6, 0.85), legFront: bone(5, 0, 0.05), legBack: bone(-6, 0, -0.1) }),
      pose({ head: bone(2, 0, 0.05), body: bone(3, 0, 0.08), armFront: bone(24, 5, -0.1, 1.2), armBack: bone(-8, 8, -0.6, 0.85), legFront: bone(6, 0, 0.08), legBack: bone(-7, 0, -0.12) }),
    ],
    [FighterState.CROUCH_ATTACK]: [
      pose({ head: bone(1, 6, 0.03), body: bone(1, 10, 0.06), armFront: bone(12, 10, 0.0, 0.9), armBack: bone(-8, 15, -0.4, 0.8), legFront: bone(18, 2, 0.4, 1.2), legBack: bone(-8, 8, -0.25) }),
      pose({ head: bone(2, 8, 0.05), body: bone(2, 12, 0.1), armFront: bone(15, 12, -0.1, 1.0), armBack: bone(-8, 15, -0.4, 0.8), legFront: bone(22, 3, 0.5, 1.35), legBack: bone(-8, 8, -0.3) }),
    ],
    [FighterState.AIR_ATTACK]: [
      pose({ head: bone(0, -1, -0.04), body: bone(0, 0, 0.05), armFront: bone(14, -2, -0.1, 1.0), armBack: bone(-8, 0, -0.35, 0.85), legFront: bone(16, 3, 0.4, 1.2), legBack: bone(-6, -2, -0.25) }),
      pose({ head: bone(0, -2, -0.08), body: bone(1, 0, 0.1), armFront: bone(18, -3, -0.2, 1.1), armBack: bone(-8, 0, -0.35, 0.85), legFront: bone(20, 4, 0.5, 1.3), legBack: bone(-6, -2, -0.3) }),
    ],
    [FighterState.THROW]: [
      pose({ head: bone(1, 0, 0.03), body: bone(3, 0, 0.08), armFront: bone(20, 2, 0.0, 1.15), armBack: bone(12, 4, -0.1, 1.0), legFront: bone(4, 0, 0.06), legBack: bone(-5, 0, -0.08) }),
      pose({ head: bone(2, 0, 0.05), body: bone(4, 0, 0.12), armFront: bone(26, 3, -0.08, 1.3), armBack: bone(16, 5, -0.15, 1.1), legFront: bone(5, 0, 0.08), legBack: bone(-6, 0, -0.1) }),
    ],
    [FighterState.GUARD_CRUSH]: pose({
      head: bone(-3, 3, -0.18),
      body: bone(-2, 2, -0.08),
      armFront: bone(-5, 12, 0.4),
      armBack: bone(-7, 10, 0.3),
      legFront: bone(2, 0, 0.05),
      legBack: bone(-4, 0, -0.05),
    }),
    [FighterState.HOP]: pose({
      head: bone(0, -2, -0.05),
      body: bone(0, -1, 0),
      armFront: bone(6, 4, 0.2),
      armBack: bone(-5, 3, -0.2),
      legFront: bone(4, 3, 0.18),
      legBack: bone(-5, 2, -0.25),
    }),
    [FighterState.BACKDASH]: pose({
      body: bone(-5, -9, -0.1),
      armFront: bone(7, 4, 0.6),
      armBack: bone(-11, 3, -0.2),
      legFront: bone(-3, -9, 0.5),
      legBack: bone(9, -4, -0.6),
    }),
    [FighterState.ROLL]: pose({
      body: bone(0, 24, 0.85),
      head: bone(4, 27, 0.65),
      armFront: bone(-4, 29, 0.4),
      armBack: bone(9, 24, -0.5),
      legFront: bone(-8, 27, -0.3),
      legBack: bone(5, 25, 0.45),
    }),
    [FighterState.HYPER_JUMP]: pose({
      body: bone(0, -9, -0.08),
      armFront: bone(8, 12, 0.5),
      armBack: bone(-8, 10, -0.35),
      legFront: bone(8, -7, 0.4),
      legBack: bone(-8, -5, -0.5),
    }),
    [FighterState.RUN_JUMP]: pose({
      body: bone(3, -6, -0.04),
      armFront: bone(8, 8, 0.32),
      armBack: bone(-6, 6, -0.28),
      legFront: bone(6, -4, 0.22),
      legBack: bone(-6, -2, -0.32),
    }),
    [FighterState.BACK_ROLL]: pose({
      body: bone(0, 21, -0.65),
      head: bone(-5, 24, -0.55),
      armFront: bone(6, 25, 0.32),
      armBack: bone(-8, 21, -0.42),
      legFront: bone(6, 19, -0.22),
      legBack: bone(-6, 22, 0.32),
    }),
    [FighterState.AIR_BLOCK]: pose({
      armFront: bone(2, 8, -0.5),
      armBack: bone(-2, 6, -0.65),
      legFront: bone(3, -2, 0.1),
      legBack: bone(-4, 0, -0.15),
    }),
  },

  proportions: {
    headW: 42, headH: 42,
    torsoW: 52, torsoH: 64,
    armW: 20, armH: 46,
    legW: 24, legH: 64,
    shoulderY: 15, hipY: 58,
    torsoCenterY: 33, headCenterY: 7,
  },

  routeSpecial(input, cmdBuf, tick, hasChargeRelease = false) {
    // DM: QCB×2+K → 鳳凰脚
    const dmMotion = cmdBuf.checkDMMotion(tick, input.punchPressed, input.kickPressed);
    if (dmMotion === 'QCBx2_K') return AttackType.DM_PHOENIX_KICK;
    // DM: QCF×2+K → 鳳凰天舞脚
    if (dmMotion === 'QCFx2_K') return AttackType.DM_PHOENIX_HITEN;

    // ↓蓄↑+K → 飛燕斬 (charge move)
    if (hasChargeRelease && input.up && input.kickPressed) return AttackType.KIM_HIENZAN;

    // DP+K → 飛燕斬 (shortcut)
    const special = cmdBuf.checkSpecial(tick, input.punchPressed || input.kickPressed);
    if (special === AttackType.SPECIAL_UPPER && input.kickPressed) return AttackType.KIM_HIENZAN;

    // QCB+K → 半月斬
    if (input.kickPressed && cmdBuf.hasQCB(tick)) {
      return AttackType.KIM_HANGETSU;
    }

    // QCB+P → 三連撃 (rekka chain)
    if (input.punchPressed && cmdBuf.hasQCB(tick)) {
      return AttackType.KIM_SANREN;
    }

    // ↓↓+K → 覇気脚
    if (input.kickPressed && cmdBuf.hasDD(tick)) {
      return AttackType.KIM_HAKI;
    }

    return null;
  },

  routeNormal(input, state, _isCloseRange) {
    const isAir = state === FighterState.JUMP
      || state === FighterState.RUN_JUMP
      || state === FighterState.HOP
      || state === FighterState.HYPER_JUMP;

    // 飛翔脚: 空中↓↘→+K
    if (isAir && input.kickPressed && input.forward && input.down) {
      return AttackType.KIM_HISHOU;
    }

    // →+B 飛翔脚 (overhead)
    if (!isAir && input.buttonBPressed && input.forward && !input.down) {
      return AttackType.KIM_HISHOU_KICK;
    }
    // ↘+D 半旋蹴 (2-hit mid)
    if (!isAir && input.buttonDPressed && input.forward && input.down) {
      return AttackType.KIM_HANSEN;
    }
    return null;
  },

  routeRekkaFollowup(_input, _cmdBuf, _tick, currentAttack) {
    // 三連撃 chain: 2nd and 3rd hits
    if (currentAttack === AttackType.KIM_SANREN && _input.punchPressed) {
      return AttackType.KIM_SANREN; // reuse same type for multi-hit
    }
    return null;
  },

  onAttackActive(fighter, attackType, _projectiles, _playerIndex) {
    // 飛燕斬: rise
    if (attackType === AttackType.KIM_HIENZAN) {
      fighter.vy = -8;
      fighter.vx = 2 * fighter.facing;
      return true;
    }
    // 飛翔脚: air dive
    if (attackType === AttackType.KIM_HISHOU) {
      fighter.vy = 5;
      fighter.vx = 4 * fighter.facing;
      return true;
    }
    return false;
  },

  getRekkaChain() {
    return null;
  },

  isCommandThrow(_attackType) { return false; },
  getCounterConfig() { return null; },
};
