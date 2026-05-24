/**
 * 草薙京 (Kyo Kusanagi) — 角色定义
 *
 * 必杀技:
 *   QCF+A  → 114式·荒咬み (rekka starter)
 *   QCF+C  → 115式·毒咬み (rekka starter)
 *   QCF+K  → 75式·改 (两段踢)
 *   QCB+K  → R.E.D. Kick (高段踢)
 *   DP+P   → 鬼焼き (升龙, 通用)
 *
 * 连段:
 *   荒咬み → QCF+P(九傷) / HCB+P(八錆)
 *   毒咬み → HCB+P(罪詠み) → f+P(罰詠み)
 *
 * 命令通常技:
 *   →+B  → 轟斧陽 (overhead)
 *   ↘+D  → 八拾八式 (low)
 *   air↓+C → 奈落落とし (KD)
 */
import type { CharacterDefinition } from './types.js';
import type { ResolvedInput } from '../input/inputResolver.js';
import type { CommandBuffer } from '../input/commandBuffer.js';
import type { Fighter } from '../entities/fighter.js';
import { Projectile } from '../entities/projectile.js';
import {
  FighterState,
  AttackType,
} from '../core/types.js';
import { FRAME_DATA } from '../core/constants.js';

const REKKA_WINDOW = 20;

export const KyoDef: CharacterDefinition = {
  id: 'kyo',
  name: 'Kyo Kusanagi',
  nameCn: '草薙京',
  color: '#ff6600',
  accentColor: '#ffaa00',
  specialColor: '#ff4400',
  specialGlow: '#ff6600',
  portrait: '🔥',

  routeSpecial(input, cmdBuf, tick) {
    // Dragon Punch →↓↘+P (shared)
    const special = cmdBuf.checkSpecial(tick, true);
    if (special === AttackType.SPECIAL_UPPER) return AttackType.SPECIAL_UPPER;

    // 荒咬み: QCF+A
    if (cmdBuf.hasQCF(tick) && input.buttonAPressed) return AttackType.KYO_ARAGAMI;
    // 毒咬み: QCF+C
    if (cmdBuf.hasQCF(tick) && input.buttonCPressed) return AttackType.KYO_DOKUGAMI;

    // 75式改 / R.E.D. Kick: QCF+K / QCB+K
    if (input.kickPressed) {
      return cmdBuf.checkKickSpecial(tick, true);
    }

    // Fireball fallback: QCF+P (Kyo doesn't have one, but shared route)
    if (special === AttackType.SPECIAL_PROJECTILE) return AttackType.SPECIAL_PROJECTILE;

    return null;
  },

  routeNormal(input, state, isCloseRange) {
    const isAir = state === FighterState.JUMP
      || state === FighterState.RUN_JUMP
      || state === FighterState.HOP
      || state === FighterState.HYPER_JUMP;

    if (isAir) {
      // 奈落落とし: 空中↓+C
      if (input.buttonCPressed && input.down) return AttackType.CMD_NARAKU;
      return null; // default air routing
    }

    if (state === FighterState.CROUCH) {
      // 八拾八式: ↘+D (from crouch)
      if (input.buttonDPressed && input.forward && input.down) return AttackType.CMD_88SHIKI;
      return null;
    }

    // 轟斧陽: →+B
    if (input.buttonBPressed && input.forward && !input.down) return AttackType.CMD_GOFU_YOU;
    // 八拾八式: ↘+D
    if (input.buttonDPressed && input.forward && input.down) return AttackType.CMD_88SHIKI;

    return null; // default stand routing (close/far handled by controller)
  },

  routeRekkaFollowup(input, cmdBuf, tick, currentAttack) {
    // 75式改 第二段: K during recovery
    if (currentAttack === AttackType.KYO_75KAI && input.kickPressed) {
      return AttackType.KYO_75KAI_2;
    }

    // 荒咬み连段
    if (currentAttack === AttackType.KYO_ARAGAMI) {
      const qcf = cmdBuf.checkRekkaFollowQCF(tick, true);
      if (qcf) return qcf;
      const hcb = cmdBuf.checkRekkaFollowHCB(tick, true);
      if (hcb) return hcb;
    }

    // 毒咬み连段
    if (currentAttack === AttackType.KYO_DOKUGAMI) {
      return cmdBuf.checkDokugamiFollow(tick, true);
    }

    // 罪詠み → 罰詠み
    if (currentAttack === AttackType.KYO_TSUMIYOMI) {
      if (cmdBuf.checkBatsuyomiInput(input.forward, input.punchPressed)) {
        return AttackType.KYO_BATSUYOMI;
      }
    }

    return null;
  },

  onAttackActive(fighter, attackType, projectiles, playerIndex) {
    // Fireball: spawn projectile
    if (attackType === AttackType.SPECIAL_PROJECTILE && fighter.attackFrame === 0) {
      projectiles.push(new Projectile(
        fighter.x + 50 * fighter.facing, fighter.y - 50, fighter.facing,
        FRAME_DATA.SPECIAL_PROJECTILE.active, playerIndex,
      ));
      return true;
    }
    // Dragon upper: rise
    if (attackType === AttackType.SPECIAL_UPPER) {
      fighter.vy = -6;
      return true;
    }
    // R.E.D. Kick: rise + forward
    if (attackType === AttackType.KYO_RED_KICK) {
      fighter.vy = -4;
      fighter.vx = 3 * fighter.facing;
      return true;
    }
    return false;
  },

  getRekkaChain(attackType) {
    if (attackType === AttackType.KYO_ARAGAMI) return 'aragami';
    if (attackType === AttackType.KYO_DOKUGAMI) return 'dokugami';
    return null;
  },
};
