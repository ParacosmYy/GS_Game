/**
 * 藤堂香澄 (Kasumi Todoh) — 角色定义
 *
 * 必杀技:
 *   QCF+A/C → Koou Ken (虎煌拳, weak/strong projectile)
 *   QCB+P   → Kasane Ate (重ね当て, palm strike)
 *   DP+P    → Mukigenzan (無限斬, low sweep)
 * DM: QCBx2+P → Chou Mukigenzan DM (超・無限斬)
 */
import type { CharacterDefinition } from './types.js';
import { pose, bone } from './types.js';
import type { ResolvedInput } from '../input/inputResolver.js';
import type { CommandBuffer } from '../input/commandBuffer.js';
import { FighterState, AttackType } from '../core/types.js';
import { kasumiPortrait } from '../rendering/portraits/kasumiPortrait.js';

export const KasumiDef: CharacterDefinition = {
  id: 'kasumi',
  name: 'KASUMI',
  nameCn: '藤堂香澄',
  color: '#dd4466',
  accentColor: '#ee6688',
  specialColor: '#ff4466',
  specialGlow: '#ff88aa',
  portrait: 'K',
  pixelPortrait: kasumiPortrait,
  winQuotes: ['藤堂流……不敗の武術！', 'まだまだ修行が足りないわね。', '父さんの技に、隙などない！'],

  stats: {
    walkSpeed: 4.5,
    runSpeed: 7.4,
    jumpVelocity: -13.5,
    hopVelocity: -10,
    hyperJumpVelocity: -16.5,
    maxHealth: 900,
    pushWidth: 54,
    jumpForwardSpeed: 5.2,
    closeRange: 72,
    throwRange: 105,
  },

  poses: {
    [FighterState.IDLE]: [
      // Frame 0: 中立 — 正统派武术站姿，双手护身
      pose({ armFront: bone(8, 10, 0.28), armBack: bone(-4, 14, -0.18), legFront: bone(3, 0, 0.04), legBack: bone(-4, 0, -0.04) }),
      // Frame 1: 微呼吸 — 轻微上移
      pose({ armFront: bone(8, 9, 0.26), armBack: bone(-4, 13, -0.17), legFront: bone(3, 0, 0.04), legBack: bone(-4, 0, -0.04), body: bone(0, -1) }),
      // Frame 2: 吸气巅峰 — 身体微升
      pose({ armFront: bone(8, 8, 0.24), armBack: bone(-4, 12, -0.16), legFront: bone(3, -1, 0.03), legBack: bone(-4, -1, -0.03), body: bone(0, -2), head: bone(0, -1) }),
      // Frame 3: 过渡
      pose({ armFront: bone(8, 9, 0.26), armBack: bone(-4, 13, -0.17), legFront: bone(3, 0, 0.04), legBack: bone(-4, 0, -0.04), body: bone(0, -1) }),
      // Frame 4: 呼气 — 微沉
      pose({ armFront: bone(9, 11, 0.30), armBack: bone(-4, 15, -0.20), legFront: bone(3, 0, 0.04), legBack: bone(-4, 0, -0.04), body: bone(0, 1) }),
      // Frame 5: 呼气完成 — 恢复
      pose({ armFront: bone(9, 11, 0.30), armBack: bone(-4, 15, -0.20), legFront: bone(3, 1, 0.05), legBack: bone(-4, 1, -0.05), body: bone(0, 1), head: bone(0, 1) }),
    ],
    [FighterState.WALK]: [
      pose({ legFront: bone(7, -2, 0.14), legBack: bone(-3, 2, -0.10), armFront: bone(7, 12, 0.32), armBack: bone(-4, 14, -0.22) }),
      pose({ legFront: bone(4, 0, 0.04), legBack: bone(-4, 0, -0.04), armFront: bone(8, 10, 0.28), armBack: bone(-4, 14, -0.18) }),
      pose({ legFront: bone(2, 2, -0.10), legBack: bone(-7, -2, 0.14), armFront: bone(8, 12, 0.30), armBack: bone(-3, 14, -0.15) }),
      pose({ legFront: bone(3, 0, -0.03), legBack: bone(-4, 0, 0.02), armFront: bone(8, 11, 0.29), armBack: bone(-4, 14, -0.19) }),
    ],
    [FighterState.RUN]: [
      pose({ body: bone(4, 0, 0.14), armFront: bone(-1, 14, -0.55), armBack: bone(7, 16, 0.36), legFront: bone(8, -4, 0.32), legBack: bone(-4, 4, -0.22) }),
      pose({ body: bone(2, 0, 0.04), armFront: bone(0, 10, -0.30), armBack: bone(5, 18, 0.16), legFront: bone(5, 4, 0.10), legBack: bone(-8, -4, 0.32) }),
    ],
    [FighterState.CROUCH]: pose({
      body: bone(0, 14, 0.04),
      head: bone(0, 10),
      armFront: bone(7, 14, 0.0),
      armBack: bone(-4, 12, -0.10),
      legFront: bone(7, 0, 0.32),
      legBack: bone(-4, 0, -0.22),
    }),
    [FighterState.BLOCK]: [
      pose({ armFront: bone(2, 5, -0.28), armBack: bone(-1, 3, -0.48), legFront: bone(2, 0, 0.04) }),
      pose({ armFront: bone(1, 7, -0.34), armBack: bone(-2, 5, -0.52), body: bone(-2, 0, -0.04) }),
    ],
    [FighterState.HITSTUN]: [
      pose({ body: bone(-4, 0, -0.08), head: bone(-2, 2, -0.14), armFront: bone(0, 14, 0.38), armBack: bone(-5, 10, 0.45) }),
      pose({ body: bone(-5, 2, -0.16), head: bone(-3, 3, -0.20), armFront: bone(2, 17, 0.45), armBack: bone(-7, 12, 0.58) }),
      pose({ body: bone(-2, -1, -0.04), head: bone(-1, 1, -0.06), armFront: bone(-2, 11, 0.28), armBack: bone(-4, 10, 0.35) }),
    ],
    [FighterState.KNOCKDOWN]: [
      pose({ body: bone(0, 14, 0.68), head: bone(5, 18, 0.78), armFront: bone(-3, 16, 0.45), armBack: bone(8, 14, -0.28), legFront: bone(-6, 14, -0.14), legBack: bone(4, 16, 0.22) }),
      pose({ body: bone(0, 26, 1.22), head: bone(7, 30, 1.02), legFront: bone(-8, 26, -0.22), legBack: bone(6, 28, 0.28) }),
    ],
    [FighterState.JUMP]: pose({
      armFront: bone(7, 3, 0.32),
      armBack: bone(-4, 1, -0.10),
      legFront: bone(2, -2, 0.06),
      legBack: bone(-2, 0, -0.18),
    }),
    // — Attack poses (Disciplined martial arts: open palm strikes, precise kicks) —
    [FighterState.STAND_ATTACK]: [
      pose({ head: bone(1, 0, 0.02), body: bone(2, 0, 0.04), armFront: bone(13, 3, 0.10, 0.86), armBack: bone(-4, 6, -0.40, 0.76), legFront: bone(3, 0, 0.04), legBack: bone(-3, 0, -0.04) }),
      pose({ head: bone(1, 0, 0.03), body: bone(3, 0, 0.06), armFront: bone(19, 5, -0.01, 1.0), armBack: bone(-4, 6, -0.40, 0.76), legFront: bone(4, 0, 0.06), legBack: bone(-4, 0, -0.06) }),
    ],
    [FighterState.CROUCH_ATTACK]: [
      pose({ head: bone(1, 4, 0.02), body: bone(1, 6, 0.04), armFront: bone(11, 6, 0.03, 0.86), armBack: bone(-4, 8, -0.28, 0.76), legFront: bone(9, 2, 0.16, 0.96), legBack: bone(-4, 4, -0.06) }),
      pose({ head: bone(1, 5, 0.04), body: bone(2, 8, 0.06), armFront: bone(17, 8, -0.03, 0.96), armBack: bone(-4, 8, -0.28, 0.76), legFront: bone(13, 3, 0.22, 1.0), legBack: bone(-4, 4, -0.10) }),
    ],
    [FighterState.AIR_ATTACK]: [
      pose({ head: bone(0, -1, -0.02), body: bone(1, 0, 0.04), armFront: bone(9, -1, -0.05, 0.86), armBack: bone(-4, 1, -0.18, 0.76), legFront: bone(7, 3, 0.18, 0.96), legBack: bone(-3, 0, -0.06) }),
      pose({ head: bone(0, -1, -0.04), body: bone(2, 0, 0.08), armFront: bone(15, -2, -0.08, 1.0), armBack: bone(-4, 1, -0.18, 0.76), legFront: bone(11, 4, 0.26, 1.06), legBack: bone(-3, 0, -0.10) }),
    ],
    [FighterState.THROW]: [
      pose({ head: bone(2, 0, 0.03), body: bone(4, 0, 0.10), armFront: bone(17, 1, 0.0, 1.06), armBack: bone(9, 3, -0.05, 0.90), legFront: bone(3, 0, 0.06), legBack: bone(-3, 0, -0.04) }),
      pose({ head: bone(3, 1, 0.05), body: bone(5, 0, 0.14), armFront: bone(23, 2, -0.05, 1.20), armBack: bone(11, 4, -0.08, 1.0), legFront: bone(4, 0, 0.08), legBack: bone(-4, 0, -0.06) }),
    ],
    [FighterState.GUARD_CRUSH]: pose({
      head: bone(-3, 3, -0.12),
      body: bone(-2, 2, -0.04),
      armFront: bone(-2, 7, 0.24),
      armBack: bone(-4, 5, 0.18),
      legFront: bone(2, 0, 0.04),
      legBack: bone(-3, 0, -0.04),
    }),
    [FighterState.HOP]: pose({
      head: bone(0, -2, -0.02),
      body: bone(0, -1, 0),
      armFront: bone(5, 2, 0.28),
      armBack: bone(-4, 1, -0.10),
      legFront: bone(2, 2, 0.04),
      legBack: bone(-3, 1, -0.06),
    }),
    [FighterState.BACKDASH]: pose({
      body: bone(-3, -8, -0.06),
      armFront: bone(3, 2, 0.38),
      armBack: bone(-7, 1, -0.10),
      legFront: bone(-1, -8, 0.32),
      legBack: bone(6, -2, -0.42),
    }),
    [FighterState.ROLL]: pose({
      body: bone(0, 18, 0.64),
      head: bone(4, 21, 0.44),
      armFront: bone(-2, 23, 0.28),
      armBack: bone(6, 18, -0.34),
      legFront: bone(-5, 21, -0.18),
      legBack: bone(3, 19, 0.28),
    }),
    [FighterState.HYPER_JUMP]: pose({
      body: bone(0, -6, -0.04),
      armFront: bone(7, 7, 0.46),
      armBack: bone(-4, 5, -0.20),
      legFront: bone(4, -5, 0.24),
      legBack: bone(-5, -3, -0.32),
    }),
    [FighterState.RUN_JUMP]: pose({
      body: bone(2, -3, -0.02),
      armFront: bone(7, 4, 0.28),
      armBack: bone(-4, 2, -0.14),
      legFront: bone(2, -2, 0.08),
      legBack: bone(-3, 0, -0.18),
    }),
    [FighterState.BACK_ROLL]: pose({
      body: bone(0, 16, -0.44),
      head: bone(-3, 18, -0.38),
      armFront: bone(3, 19, 0.20),
      armBack: bone(-5, 16, -0.28),
      legFront: bone(3, 14, -0.12),
      legBack: bone(-3, 17, 0.20),
    }),
    [FighterState.AIR_BLOCK]: pose({
      armFront: bone(2, 6, -0.38),
      armBack: bone(-2, 4, -0.52),
      legFront: bone(2, -1, 0.06),
      legBack: bone(-2, 0, -0.08),
    }),
  },

  proportions: {
    headW: 30, headH: 32,
    torsoW: 34, torsoH: 52,
    armW: 11, armH: 38,
    legW: 14, legH: 50,
    shoulderY: 12, hipY: 50,
    torsoCenterY: 24, headCenterY: 6,
  },

  routeSpecial(input, cmdBuf, tick, _hasChargeRelease = false) {
    // DM: QCBx2+P → Chou Mukigenzan DM
    const dmMotion = cmdBuf.checkDMMotion(tick, input.punchPressed, input.kickPressed);
    if (dmMotion === 'QCBx2_P') return AttackType.DM_CHO_MUKIGENZAN;

    // QCF+P → Koou Ken (projectile)
    if (input.punchPressed && cmdBuf.hasQCF(tick)) {
      return input.buttonCPressed ? AttackType.KASUMI_KOOU_KEN_C : AttackType.KASUMI_KOOU_KEN;
    }

    // QCB+P → Kasane Ate (palm strike)
    if (input.punchPressed && cmdBuf.hasQCB(tick)) {
      return AttackType.KASUMI_KASANE_ATE;
    }

    return null;
  },

  routeNormal(input, state, _isCloseRange) {
    const isAir = state === FighterState.JUMP
      || state === FighterState.RUN_JUMP
      || state === FighterState.HOP
      || state === FighterState.HYPER_JUMP;
    // →+A Kou'u upper
    if (!isAir && input.buttonAPressed && input.forward && !input.down) return AttackType.KASUMI_KOU_U;
    // →+B Geshiki low
    if (!isAir && input.buttonBPressed && input.forward && !input.down) return AttackType.KASUMI_GESHIKI;
    return null;
  },

  routeRekkaFollowup() {
    return null;
  },

  onAttackActive(_fighter, _attackType, _projectiles, _playerIndex) {
    return false;
  },

  getRekkaChain() {
    return null;
  },

  isCommandThrow(_attackType) { return false; },
  getCounterConfig() {
    return null;
  },
};
