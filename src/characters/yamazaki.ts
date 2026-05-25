/**
 * 山崎龙二 (Ryuji Yamazaki) — 角色定义
 *
 * 必杀技:
 *   QCF+A/C → Snake Arm (蛇使, weak/strong)
 *   QCB+P   → Sandstorm (砂尘, overhead knockdown)
 *   HCF+K   → Bai Ga Se (卑屈蹴, low sweep)
 * DM: QCFx2+P → Guillotine (狂笑拳, multi-hit rush)
 */
import type { CharacterDefinition } from './types.js';
import { pose, bone } from './types.js';
import type { ResolvedInput } from '../input/inputResolver.js';
import type { CommandBuffer } from '../input/commandBuffer.js';
import { FighterState, AttackType } from '../core/types.js';
import { yamazakiPortrait } from '../rendering/portraits/yamazakiPortrait.js';

export const YamazakiDef: CharacterDefinition = {
  id: 'yamazaki',
  name: 'RYUJI YAMAZAKI',
  nameCn: '山崎龙二',
  color: '#556622',
  accentColor: '#667733',
  specialColor: '#aabb44',
  specialGlow: '#ccdd66',
  portrait: 'Y',
  pixelPortrait: yamazakiPortrait,
  winQuotes: ['哼……就这点本事吗？', '你不配做我的对手。', '这条街……是我的地盘。'],

  stats: {
    walkSpeed: 4.0,
    runSpeed: 6.8,
    jumpVelocity: -13.5,
    hopVelocity: -9.8,
    hyperJumpVelocity: -16.2,
    maxHealth: 960,
    pushWidth: 58,
    jumpForwardSpeed: 5.0,
    closeRange: 78,
    throwRange: 105,
  },

  poses: {
    [FighterState.IDLE]: [
      // Frame 0: 中立 — 一只手插口袋的流氓站姿，威压感十足
      pose({ armFront: bone(6, 8, 0.1), armBack: bone(-2, 16, -0.35), legFront: bone(5, 0, 0.05), legBack: bone(-4, 0, -0.04) }),
      // Frame 1: 微呼吸 — 前手微动
      pose({ armFront: bone(6, 7, 0.09), armBack: bone(-2, 15, -0.34), legFront: bone(5, 0, 0.05), legBack: bone(-4, 0, -0.04), body: bone(0, -1) }),
      // Frame 2: 吸气巅峰 — 身体微升
      pose({ armFront: bone(6, 6, 0.08), armBack: bone(-2, 14, -0.33), legFront: bone(5, -1, 0.04), legBack: bone(-4, -1, -0.03), body: bone(0, -2), head: bone(0, -1) }),
      // Frame 3: 过渡
      pose({ armFront: bone(6, 7, 0.09), armBack: bone(-2, 15, -0.34), legFront: bone(5, 0, 0.05), legBack: bone(-4, 0, -0.04), body: bone(0, -1) }),
      // Frame 4: 呼气 — 微沉
      pose({ armFront: bone(7, 9, 0.12), armBack: bone(-2, 17, -0.36), legFront: bone(5, 0, 0.05), legBack: bone(-4, 0, -0.04), body: bone(0, 1) }),
      // Frame 5: 呼气完成 — 恢复
      pose({ armFront: bone(7, 9, 0.13), armBack: bone(-2, 17, -0.37), legFront: bone(5, 1, 0.06), legBack: bone(-4, 1, -0.05), body: bone(0, 1), head: bone(0, 1) }),
    ],
    [FighterState.WALK]: [
      pose({ legFront: bone(8, -2, 0.14), legBack: bone(-3, 2, -0.1), armFront: bone(6, 10, 0.15), armBack: bone(-2, 14, -0.3) }),
      pose({ legFront: bone(5, 0, 0.05), legBack: bone(-4, 0, -0.04), armFront: bone(6, 8, 0.1), armBack: bone(-2, 16, -0.35) }),
      pose({ legFront: bone(3, 2, -0.1), legBack: bone(-7, -2, 0.14), armFront: bone(6, 10, 0.18), armBack: bone(-1, 14, -0.28) }),
      pose({ legFront: bone(4, 0, -0.03), legBack: bone(-4, 0, 0.02), armFront: bone(7, 9, 0.12), armBack: bone(-2, 15, -0.33) }),
    ],
    [FighterState.RUN]: [
      pose({ body: bone(4, 0, 0.14), armFront: bone(-2, 14, -0.6), armBack: bone(6, 16, 0.35), legFront: bone(8, -3, 0.32), legBack: bone(-4, 3, -0.22) }),
      pose({ body: bone(2, 0, 0.05), armFront: bone(0, 10, -0.3), armBack: bone(4, 18, 0.15), legFront: bone(5, 3, 0.1), legBack: bone(-8, -3, 0.32) }),
    ],
    [FighterState.CROUCH]: pose({
      body: bone(0, 14, 0.04),
      head: bone(0, 10),
      armFront: bone(6, 14, -0.05),
      armBack: bone(-3, 12, -0.1),
      legFront: bone(8, 0, 0.34),
      legBack: bone(-4, 0, -0.24),
    }),
    [FighterState.BLOCK]: [
      pose({ armFront: bone(2, 6, -0.3), armBack: bone(-1, 4, -0.5), legFront: bone(2, 0, 0.04) }),
      pose({ armFront: bone(1, 8, -0.36), armBack: bone(-2, 6, -0.54), body: bone(-2, 0, -0.04) }),
    ],
    [FighterState.HITSTUN]: [
      pose({ body: bone(-4, 0, -0.1), head: bone(-2, 2, -0.16), armFront: bone(0, 16, 0.4), armBack: bone(-5, 12, 0.48) }),
      pose({ body: bone(-6, 2, -0.18), head: bone(-4, 3, -0.22), armFront: bone(2, 19, 0.48), armBack: bone(-7, 14, 0.62) }),
      pose({ body: bone(-3, -1, -0.06), head: bone(-1, 1, -0.08), armFront: bone(-2, 13, 0.3), armBack: bone(-4, 11, 0.38) }),
    ],
    [FighterState.KNOCKDOWN]: [
      pose({ body: bone(0, 14, 0.72), head: bone(6, 18, 0.82), armFront: bone(-4, 18, 0.48), armBack: bone(10, 16, -0.3), legFront: bone(-7, 14, -0.16), legBack: bone(5, 16, 0.25) }),
      pose({ body: bone(0, 28, 1.28), head: bone(8, 32, 1.08), legFront: bone(-9, 28, -0.25), legBack: bone(7, 30, 0.32) }),
    ],
    [FighterState.JUMP]: pose({
      armFront: bone(6, 3, 0.32),
      armBack: bone(-4, 1, -0.1),
      legFront: bone(3, -2, 0.08),
      legBack: bone(-3, 0, -0.18),
    }),
    // — Attack poses (Gangster/brawler style: heavy punches, sweeping kicks) —
    [FighterState.STAND_ATTACK]: [
      pose({ head: bone(1, 0, 0.02), body: bone(2, 0, 0.04), armFront: bone(14, 3, 0.1, 0.86), armBack: bone(-3, 6, -0.4, 0.76), legFront: bone(4, 0, 0.04), legBack: bone(-4, 0, -0.05) }),
      pose({ head: bone(1, 0, 0.03), body: bone(3, 0, 0.06), armFront: bone(20, 5, -0.02, 1.0), armBack: bone(-3, 6, -0.4, 0.76), legFront: bone(5, 0, 0.06), legBack: bone(-5, 0, -0.07) }),
    ],
    [FighterState.CROUCH_ATTACK]: [
      pose({ head: bone(1, 5, 0.02), body: bone(1, 7, 0.04), armFront: bone(12, 6, 0.03, 0.86), armBack: bone(-4, 9, -0.28, 0.76), legFront: bone(10, 2, 0.17, 0.96), legBack: bone(-4, 5, -0.08) }),
      pose({ head: bone(1, 6, 0.04), body: bone(2, 9, 0.06), armFront: bone(18, 8, -0.04, 0.96), armBack: bone(-4, 9, -0.28, 0.76), legFront: bone(14, 3, 0.22, 1.0), legBack: bone(-4, 5, -0.12) }),
    ],
    [FighterState.AIR_ATTACK]: [
      pose({ head: bone(0, -1, -0.02), body: bone(1, 0, 0.04), armFront: bone(10, -1, -0.06, 0.86), armBack: bone(-4, 1, -0.18, 0.76), legFront: bone(8, 3, 0.18, 0.96), legBack: bone(-3, 0, -0.08) }),
      pose({ head: bone(0, -1, -0.04), body: bone(2, 0, 0.08), armFront: bone(16, -2, -0.1, 1.0), armBack: bone(-4, 1, -0.18, 0.76), legFront: bone(12, 4, 0.26, 1.06), legBack: bone(-3, 0, -0.12) }),
    ],
    [FighterState.THROW]: [
      pose({ head: bone(2, 0, 0.03), body: bone(4, 0, 0.1), armFront: bone(18, 2, 0.0, 1.06), armBack: bone(10, 4, -0.06, 0.9), legFront: bone(4, 0, 0.06), legBack: bone(-4, 0, -0.05) }),
      pose({ head: bone(3, 1, 0.05), body: bone(5, 0, 0.14), armFront: bone(24, 3, -0.06, 1.2), armBack: bone(12, 5, -0.1, 1.0), legFront: bone(5, 0, 0.08), legBack: bone(-5, 0, -0.07) }),
    ],
    [FighterState.GUARD_CRUSH]: pose({
      head: bone(-3, 3, -0.14),
      body: bone(-2, 2, -0.06),
      armFront: bone(-3, 8, 0.26),
      armBack: bone(-5, 6, 0.18),
      legFront: bone(2, 0, 0.04),
      legBack: bone(-4, 0, -0.04),
    }),
    [FighterState.HOP]: pose({
      head: bone(0, -2, -0.02),
      body: bone(0, -1, 0),
      armFront: bone(5, 3, 0.3),
      armBack: bone(-4, 2, -0.1),
      legFront: bone(3, 2, 0.05),
      legBack: bone(-3, 1, -0.08),
    }),
    [FighterState.BACKDASH]: pose({
      body: bone(-3, -8, -0.06),
      armFront: bone(3, 2, 0.4),
      armBack: bone(-7, 1, -0.1),
      legFront: bone(-1, -8, 0.34),
      legBack: bone(7, -2, -0.44),
    }),
    [FighterState.ROLL]: pose({
      body: bone(0, 20, 0.68),
      head: bone(4, 23, 0.48),
      armFront: bone(-3, 25, 0.3),
      armBack: bone(7, 20, -0.38),
      legFront: bone(-6, 23, -0.2),
      legBack: bone(4, 21, 0.32),
    }),
    [FighterState.HYPER_JUMP]: pose({
      body: bone(0, -6, -0.04),
      armFront: bone(7, 8, 0.48),
      armBack: bone(-4, 6, -0.2),
      legFront: bone(5, -5, 0.24),
      legBack: bone(-5, -3, -0.34),
    }),
    [FighterState.RUN_JUMP]: pose({
      body: bone(2, -3, -0.02),
      armFront: bone(7, 5, 0.3),
      armBack: bone(-4, 3, -0.14),
      legFront: bone(3, -2, 0.1),
      legBack: bone(-3, 0, -0.18),
    }),
    [FighterState.BACK_ROLL]: pose({
      body: bone(0, 18, -0.48),
      head: bone(-3, 20, -0.42),
      armFront: bone(4, 21, 0.22),
      armBack: bone(-5, 18, -0.3),
      legFront: bone(4, 16, -0.14),
      legBack: bone(-4, 19, 0.22),
    }),
    [FighterState.AIR_BLOCK]: pose({
      armFront: bone(2, 7, -0.4),
      armBack: bone(-2, 5, -0.54),
      legFront: bone(2, -1, 0.06),
      legBack: bone(-3, 0, -0.1),
    }),
  },

  proportions: {
    headW: 36, headH: 38,
    torsoW: 42, torsoH: 60,
    armW: 15, armH: 48,
    legW: 18, legH: 60,
    shoulderY: 16, hipY: 60,
    torsoCenterY: 32, headCenterY: 8,
  },

  routeSpecial(input, cmdBuf, tick, _hasChargeRelease = false) {
    // DM: QCFx2+P → Guillotine
    const dmMotion = cmdBuf.checkDMMotion(tick, input.punchPressed, input.kickPressed);
    if (dmMotion === 'QCFx2_P') return AttackType.DM_GUILLOTINE;

    // HCF+K → Bai Ga Se (low sweep)
    if (input.kickPressed && cmdBuf.hasQCB(tick)) {
      return AttackType.YAMAZAKI_BAI_GA_SE;
    }

    // QCB+P → Sandstorm (overhead)
    if (input.punchPressed && cmdBuf.hasQCB(tick)) {
      return AttackType.YAMAZAKI_SANDSTORM;
    }

    // QCF+P → Snake Arm (weak/strong)
    const special = cmdBuf.checkSpecial(tick, input.punchPressed || input.kickPressed);
    if (special === AttackType.SPECIAL_PROJECTILE) {
      return input.buttonCPressed ? AttackType.YAMAZAKI_SNAKE_ARM_C : AttackType.YAMAZAKI_SNAKE_ARM;
    }

    return null;
  },

  routeNormal(input, state, _isCloseRange) {
    const isAir = state === FighterState.JUMP
      || state === FighterState.RUN_JUMP
      || state === FighterState.HOP
      || state === FighterState.HYPER_JUMP;
    // →+A Sashi (upper)
    if (!isAir && input.buttonAPressed && input.forward && !input.down) return AttackType.YAMAZAKI_SASHI;
    // →+B Bokkai (low)
    if (!isAir && input.buttonBPressed && input.forward && !input.down) return AttackType.YAMAZAKI_BOKKAI;
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
