/**
 * 八神庵 (Iori Yagami) — 角色定义
 *
 * 必杀技:
 *   QCF+P  → 百八式·暗拂 (fireball)
 *   QCB+P  → 葵花 (rekka 3-hit)
 *   DP+P   → 百式·鬼焼き (升龙)
 * DM: HCB×2+P → 八稚女
 */
import type { CharacterDefinition } from './types.js';
import { pose, bone } from './types.js';
import type { ResolvedInput } from '../input/inputResolver.js';
import type { CommandBuffer } from '../input/commandBuffer.js';
import {
  FighterState,
  AttackType,
} from '../core/types.js';
import { Projectile } from '../entities/projectile.js';
import { FRAME_DATA } from '../core/constants.js';
import { ioriPortrait } from '../rendering/portraits/ioriPortrait.js';
import { IORI_MOVE_LIST } from '../content/characters/iori/commands/ioriCommands.js';

export const IoriDef: CharacterDefinition = {
  id: 'iori',
  name: 'Iori Yagami',
  nameCn: '八神庵',
  color: '#aa1133',
  accentColor: '#cc3355',
  specialColor: '#8800cc',
  specialGlow: '#aa22ff',
  portrait: '庵',
  pixelPortrait: ioriPortrait,
  winQuotes: ['くだらん...', '血の叫びが聞こえるか?', '俺の痛みを味わえ'],
  rivalWinQuotes: {
    kyo: ['京…お前を殺せるのは俺だけだ', '三神器の意味、教えてやろうか', '草薙の炎も所詮は燃えカスだ'],
    ryo: ['極限流など…所詮は拳法ごっこ', '俺の血騒ぎにはならないな'],
  },
  moveList: IORI_MOVE_LIST.map(e => ({ name: e.name, input: e.input, type: e.type })),

  stats: {
    walkSpeed: 4.5,
    runSpeed: 7.5,
    jumpVelocity: -13.5,
    hopVelocity: -10.5,
    hyperJumpVelocity: -16.5,
    maxHealth: 950,
    pushWidth: 58,
    jumpForwardSpeed: 5.5,
    closeRange: 90,
    throwRange: 105,
  },

  poses: {
    // 八神待机：慵懒、傲慢、漫不经心 — 动作幅度极小
    [FighterState.IDLE]: [
      // Frame 0: 基础站姿 — 微驼，头微低，双手垂在身侧
      pose({ head: bone(0, 2, -0.04), body: bone(0, 0, 0.05), armFront: bone(6, 18, 0.5), armBack: bone(-10, 14, -0.7), legFront: bone(5, 0, 0.05), legBack: bone(-5, 0, -0.15) }),
      // Frame 1: 缓慢吸气 — 身体微微上抬1px，头几乎不动
      pose({ head: bone(0, 1, -0.02), body: bone(0, -1, 0.04), armFront: bone(6, 17, 0.48), armBack: bone(-10, 13, -0.68), legFront: bone(5, 0, 0.05), legBack: bone(-5, 0, -0.15) }),
      // Frame 2: 吸气顶点 — 最高点，手臂极微抬
      pose({ head: bone(0, 0, 0.0), body: bone(0, -2, 0.03), armFront: bone(5, 15, 0.45), armBack: bone(-10, 12, -0.65), legFront: bone(5, 0, 0.05), legBack: bone(-5, 0, -0.15) }),
      // Frame 3: 开始呼气 — 身体开始下沉
      pose({ head: bone(0, 1, -0.02), body: bone(0, -1, 0.04), armFront: bone(6, 17, 0.48), armBack: bone(-10, 13, -0.68), legFront: bone(5, 0, 0.05), legBack: bone(-5, 0, -0.15) }),
      // Frame 4: 呼气 — 下沉2px，手臂更放松外展，更驼
      pose({ head: bone(0, 3, -0.06), body: bone(0, 1, 0.06), armFront: bone(7, 20, 0.55), armBack: bone(-11, 16, -0.75), legFront: bone(5, 0, 0.05), legBack: bone(-5, 0, -0.15) }),
      // Frame 5: 呼气最低点 — 最驼，头前倾，手臂最放松
      pose({ head: bone(1, 4, -0.08), body: bone(0, 2, 0.07), armFront: bone(8, 22, 0.58), armBack: bone(-12, 18, -0.78), legFront: bone(5, 0, 0.05), legBack: bone(-5, 0, -0.15) }),
    ],
    [FighterState.WALK]: [
      pose({ legFront: bone(9, -3, 0.25), legBack: bone(-4, 3, -0.2), armFront: bone(5, 22, 0.3), armBack: bone(-6, 18, -0.5) }),
      pose({ legFront: bone(7, 0, 0.15), legBack: bone(-5, 0, -0.1), armFront: bone(6, 20, 0.35), armBack: bone(-8, 17, -0.55) }),
      pose({ legFront: bone(4, 3, -0.2), legBack: bone(-9, -3, 0.25), armFront: bone(5, 18, 0.4), armBack: bone(-7, 19, -0.5) }),
      pose({ legFront: bone(6, 0, -0.1), legBack: bone(-6, 0, 0.1), armFront: bone(5, 21, 0.32), armBack: bone(-8, 16, -0.58) }),
    ],
    [FighterState.RUN]: [
      pose({ body: bone(7, 0, 0.2), armFront: bone(-4, 20, -0.8), armBack: bone(12, 22, 0.5), legFront: bone(12, -5, 0.5), legBack: bone(-8, 5, -0.35) }),
      pose({ body: bone(4, 0, 0.1), armFront: bone(-2, 16, -0.5), armBack: bone(8, 26, 0.25), legFront: bone(8, 5, 0.2), legBack: bone(-12, -5, 0.45) }),
    ],
    [FighterState.CROUCH]: pose({
      body: bone(0, 20, 0.08),
      head: bone(0, 15),
      armFront: bone(6, 24, 0.3),
      armBack: bone(-5, 20, -0.5),
      legFront: bone(9, 0, 0.45),
      legBack: bone(-7, 0, -0.35),
    }),
    [FighterState.BLOCK]: [
      pose({ armFront: bone(2, 8, -0.5), armBack: bone(-1, 6, -0.7) }),
      pose({ armFront: bone(1, 10, -0.55), armBack: bone(-2, 8, -0.75), body: bone(-2, 0, -0.05) }),
    ],
    [FighterState.HITSTUN]: [
      pose({ body: bone(-6, 0, -0.2), head: bone(-4, 3, -0.25), armFront: bone(-2, 22, 0.5), armBack: bone(-12, 18, 0.7) }),
      pose({ body: bone(-9, 2, -0.3), head: bone(-6, 4, -0.35), armFront: bone(0, 25, 0.65), armBack: bone(-14, 20, 0.85) }),
      pose({ body: bone(-4, -1, -0.1), head: bone(-3, 2, -0.15), armFront: bone(-4, 20, 0.4), armBack: bone(-10, 16, 0.6) }),
    ],
    [FighterState.KNOCKDOWN]: [
      pose({ body: bone(0, 15, 0.8), head: bone(8, 20, 0.9), armFront: bone(-5, 20, 0.6), armBack: bone(12, 18, -0.4), legFront: bone(-8, 15, -0.2), legBack: bone(6, 18, 0.3) }),
      pose({ body: bone(0, 30, 1.4), head: bone(10, 35, 1.2), legFront: bone(-10, 30, -0.3), legBack: bone(8, 32, 0.4) }),
    ],
    [FighterState.JUMP]: pose({
      armFront: bone(8, 8, 0.5),
      armBack: bone(-10, 6, -0.4),
      legFront: bone(3, -5, 0.25),
      legBack: bone(-6, 0, -0.5),
    }),
    // — Attack poses (Yagami claw strikes: downward slashes, armBack reaches forward) —
    [FighterState.STAND_ATTACK]: [
      pose({ head: bone(4, -1, 0.08), body: bone(4, 0, 0.12), armFront: bone(18, 5, 0.05, 1.2), armBack: bone(5, 8, -0.6, 1.0), legFront: bone(4, 0, 0.06), legBack: bone(-5, 0, -0.12) }),
      pose({ head: bone(5, -2, 0.12), body: bone(6, 0, 0.18), armFront: bone(26, 2, -0.45, 1.4), armBack: bone(8, 6, -0.5, 1.0), legFront: bone(5, 0, 0.08), legBack: bone(-6, 0, -0.15) }),
    ],
    [FighterState.CROUCH_ATTACK]: [
      pose({ head: bone(5, 7, 0.12), body: bone(5, 10, 0.18), armFront: bone(16, 8, -0.1, 1.2), armBack: bone(4, 12, -0.55, 0.95), legFront: bone(12, 3, 0.28, 1.0), legBack: bone(-8, 8, -0.22) }),
      pose({ head: bone(6, 8, 0.18), body: bone(6, 12, 0.24), armFront: bone(22, 10, -0.5, 1.35), armBack: bone(6, 10, -0.45, 1.0), legFront: bone(14, 4, 0.32, 1.1), legBack: bone(-8, 8, -0.25) }),
    ],
    [FighterState.AIR_ATTACK]: [
      pose({ head: bone(2, -2, -0.1), body: bone(3, -1, 0.14), armFront: bone(16, -2, -0.3, 1.2), armBack: bone(4, 0, -0.45, 1.0), legFront: bone(10, 3, 0.25, 1.05), legBack: bone(-8, -3, -0.3) }),
      pose({ head: bone(3, -3, -0.15), body: bone(4, -2, 0.2), armFront: bone(22, -4, -0.52, 1.4), armBack: bone(6, -2, -0.4, 1.0), legFront: bone(14, 4, 0.35, 1.15), legBack: bone(-8, -3, -0.35) }),
    ],
    [FighterState.THROW]: [
      pose({ head: bone(4, 0, 0.05), body: bone(5, 0, 0.14), armFront: bone(24, 3, 0.0, 1.3), armBack: bone(18, 5, -0.25, 1.1), legFront: bone(4, 0, 0.08), legBack: bone(-4, 0, -0.1) }),
      pose({ head: bone(5, -1, 0.08), body: bone(7, 0, 0.2), armFront: bone(30, 4, -0.2, 1.4), armBack: bone(22, 6, -0.35, 1.2), legFront: bone(5, 0, 0.1), legBack: bone(-5, 0, -0.12) }),
    ],
    [FighterState.GUARD_CRUSH]: pose({
      head: bone(-4, 4, -0.25),
      body: bone(-3, 3, -0.12),
      armFront: bone(-8, 14, 0.5),           // arms drooping, claw-like
      armBack: bone(-12, 12, 0.4),
      legFront: bone(2, 0, 0.05),
      legBack: bone(-4, 0, -0.05),
    }),
    [FighterState.HOP]: pose({
      head: bone(0, -2, -0.05),
      body: bone(0, -1, 0),
      armFront: bone(8, 5, 0.2),
      armBack: bone(-8, 4, -0.35),
      legFront: bone(4, 3, 0.15),
      legBack: bone(-6, 2, -0.25),
    }),
    [FighterState.BACKDASH]: pose({
      body: bone(-6, -10, -0.12),
      armFront: bone(6, 3, 0.65),
      armBack: bone(-14, 5, -0.15),
      legFront: bone(-3, -10, 0.55),
      legBack: bone(10, -4, -0.65),
    }),
    [FighterState.ROLL]: pose({
      body: bone(0, 28, 0.9),
      head: bone(5, 30, 0.7),
      armFront: bone(-5, 32, 0.5),
      armBack: bone(10, 28, -0.6),
      legFront: bone(-10, 30, -0.4),
      legBack: bone(6, 28, 0.55),
    }),
    [FighterState.HYPER_JUMP]: pose({
      body: bone(0, -8, -0.06),
      armFront: bone(10, 10, 0.45),
      armBack: bone(-10, 8, -0.35),
      legFront: bone(6, -6, 0.35),
      legBack: bone(-8, -4, -0.45),
    }),
    [FighterState.RUN_JUMP]: pose({
      body: bone(3, -5, -0.03),
      armFront: bone(10, 7, 0.3),
      armBack: bone(-8, 5, -0.25),
      legFront: bone(5, -3, 0.2),
      legBack: bone(-5, -1, -0.3),
    }),
    [FighterState.BACK_ROLL]: pose({
      body: bone(0, 22, -0.7),
      head: bone(-5, 25, -0.55),
      armFront: bone(6, 26, 0.35),
      armBack: bone(-8, 22, -0.45),
      legFront: bone(5, 20, -0.25),
      legBack: bone(-5, 23, 0.35),
    }),
    [FighterState.AIR_BLOCK]: pose({
      armFront: bone(2, 8, -0.5),
      armBack: bone(-2, 6, -0.65),
      legFront: bone(3, -2, 0.1),
      legBack: bone(-4, 0, -0.15),
    }),
  },

  proportions: {
    headW: 42, headH: 43,
    torsoW: 50, torsoH: 72,
    armW: 18, armH: 52,
    legW: 22, legH: 66,
    shoulderY: 18, hipY: 64,
    torsoCenterY: 36, headCenterY: 8,
  },

  routeSpecial(input, cmdBuf, tick, _hasChargeRelease = false) {
    // DM: QCB HCF+P (↓↙←↙↓↘→+P) or QCFx2+P → 八稚女
    const dmMotion = cmdBuf.checkDMMotion(tick, input.punchPressed, input.kickPressed);
    if (dmMotion === 'QCFx2_P' || dmMotion === 'QCB_HCF_P') return AttackType.DM_YATAGARASU;

    // DP+P → 鬼焼き (弱P/强P区分)
    const special = cmdBuf.checkSpecial(tick, input.punchPressed || input.kickPressed);
    if (special === AttackType.SPECIAL_UPPER) {
      return input.buttonCPressed ? AttackType.IORI_ONIYAKI_C : AttackType.IORI_ONIYAKI;
    }

    // HCF+K → 琴月陰 (dash attack, B=short, D=long)
    if (input.kickPressed && cmdBuf.hasHCF(tick)) {
      return input.buttonDPressed ? AttackType.IORI_KOTOTSUKI_D : AttackType.IORI_KOTOTSUKI;
    }

    // HCF+P → 屑風 (command grab, close range)
    if (input.punchPressed && cmdBuf.hasHCF(tick)) {
      return AttackType.IORI_KUZUKAZE;
    }

    // QCB+P → 葵花 (A version or C version)
    if (input.punchPressed && cmdBuf.hasQCB(tick)) {
      return input.buttonCPressed ? AttackType.IORI_AOIHANA_C : AttackType.IORI_AOIHANA;
    }

    // QCF+P → 闇払い (弱P/强P区分)
    if (special === AttackType.SPECIAL_PROJECTILE) {
      return input.buttonCPressed ? AttackType.IORI_YAMIBARAI_C : AttackType.IORI_YAMIBARAI;
    }

    return null;
  },

  routeNormal(input, state, _isCloseRange) {
    const isAir = state === FighterState.JUMP
      || state === FighterState.RUN_JUMP
      || state === FighterState.HOP
      || state === FighterState.HYPER_JUMP;

    // 空中↓+C 百合折り (air crossup)
    if (isAir && input.buttonCPressed && input.down) return AttackType.IORI_YUKIWARUI;
    // ↘+B 邯鄲 (low)
    if (state === FighterState.CROUCH && input.buttonBPressed && input.forward && input.down) {
      return AttackType.IORI_KATANUGI;
    }
    // →+A 夢弾 (overhead, 2-hit)
    if (!isAir && input.buttonAPressed && input.forward && !input.down) {
      return AttackType.IORI_YUMEYUMI;
    }
    return null;
  },

  routeRekkaFollowup(input, _cmdBuf, _tick, currentAttack) {
    // A version rekka chain
    if (currentAttack === AttackType.IORI_AOIHANA && input.punchPressed) {
      return AttackType.IORI_AOIHANA_2;
    }
    if (currentAttack === AttackType.IORI_AOIHANA_2 && input.punchPressed) {
      return AttackType.IORI_AOIHANA_3;
    }
    // C version rekka chain
    if (currentAttack === AttackType.IORI_AOIHANA_C && input.punchPressed) {
      return AttackType.IORI_AOIHANA_C_2;
    }
    if (currentAttack === AttackType.IORI_AOIHANA_C_2 && input.punchPressed) {
      return AttackType.IORI_AOIHANA_C_3;
    }
    return null;
  },

  onAttackActive(fighter, attackType, projectiles, playerIndex) {
    // 闇払い: spawn projectile — EX version during MAX mode
    if ((attackType === AttackType.IORI_YAMIBARAI || attackType === AttackType.IORI_YAMIBARAI_C) && fighter.attackFrame === 0) {
      const isStrong = attackType === AttackType.IORI_YAMIBARAI_C;
      const isEX = fighter.maxModeActive;
      const data = FRAME_DATA[attackType as keyof typeof FRAME_DATA];
      const hitW = isEX ? 25 : isStrong ? 18 : 15;
      const hitH = isEX ? 18 : isStrong ? 13 : 10;
      const speed = isEX ? 9 : isStrong ? 7 : 5;
      const frames = isEX ? 65 : data.active;
      const level = isEX ? 'strong' : 'weak';
      const damage = isEX ? 120 : isStrong ? 90 : 60;
      projectiles.push(new Projectile(
        fighter.x + 50 * fighter.facing, fighter.y - 50, fighter.facing,
        frames, playerIndex, fighter.charId,
        hitW, hitH, speed, isStrong ? 'C' : 'A',
        level, damage, isEX,
      ));
      return true;
    }
    // 鬼焼き: rise
    if (attackType === AttackType.IORI_ONIYAKI) {
      fighter.vy = -7;
      return true;
    }
    if (attackType === AttackType.IORI_ONIYAKI_C) {
      fighter.vy = -9;
      return true;
    }
    // 琴月陰: dash forward
    if (attackType === AttackType.IORI_KOTOTSUKI) {
      fighter.vx = 8 * fighter.facing;
      return true;
    }
    return false;
  },

  getRekkaChain(attackType) {
    if (attackType === AttackType.IORI_AOIHANA) return 'aoihana';
    return null;
  },

  isCommandThrow(attackType) { return attackType === AttackType.IORI_KUZUKAZE; },
  getCounterConfig() { return null; },
};
