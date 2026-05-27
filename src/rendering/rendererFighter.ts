/**
 * Fighter rendering — extracted from renderer.ts
 * Shadow, glow, afterimage, color resolution, sprite frame calculation
 */
import { Fighter } from '../entities/fighter.js';
import { FighterState } from '../core/types.js';
import type { MaxModeState } from '../core/types.js';
import { FIGHTER_WIDTH, STAGE_GROUND_Y, STAGE_LEFT, STAGE_RIGHT } from '../core/constants.js';
import { shiftColor } from './utils.js';
import { drawSkeletalFighter } from './skeletalFighter.js';
import { drawAttackLimb } from './attackLimb.js';
import type { SpriteRenderer } from './spriteRenderer.js';
import { getCharacterColors } from './manifestRenderData.js';
import { drawHighResFrame } from './sprites/ryoHighResRender.js';
import { getFighterBlender } from './animationBlender.js';

const fighterDebugOverlayEnabled = isFighterDebugOverlayEnabled();

// Track previous state per fighter for blend trigger
const prevStateMap = new Map<number, string>();

/** Draw all fighters with shadows, glows, trails, and attack limbs */
export function drawFighters(
  ctx: CanvasRenderingContext2D, fighters: Fighter[], cameraX: number,
  globalTick: number, maxModes?: [MaxModeState, MaxModeState],
  hitStopDefender: number = -1, hitStopBias: number = 0,
  spriteRenderer?: SpriteRenderer | null,
): void {
  const sorted = [...fighters].sort((a, b) => a.y - b.y);
  const debugOverlayEnabled = fighterDebugOverlayEnabled;

  for (const f of sorted) {
    const sx = f.x - cameraX;
    const sy = f.y;
    const hw = FIGHTER_WIDTH / 2;
    const isP1 = f === fighters[0];
    const playerIdx = isP1 ? 0 : 1;
    const maxModeActive = maxModes ? maxModes[playerIdx].active : false;
    const guardLow = f.guardGauge < 30;

    // Enhanced ground shadow
    const airDist = Math.max(0, STAGE_GROUND_Y - f.y);
    const shadowScale = Math.max(0.2, 1 - airDist / 250);
    const shadowW = (hw + 8) * (0.6 + shadowScale * 0.4);
    const shadowH = 4 + shadowScale * 3;
    const shadowAlpha = 0.15 + 0.15 * shadowScale;
    const shadowGrad = ctx.createRadialGradient(sx, STAGE_GROUND_Y + 2, 0, sx, STAGE_GROUND_Y + 2, shadowW);
    shadowGrad.addColorStop(0, `rgba(0, 0, 0, ${shadowAlpha})`);
    shadowGrad.addColorStop(0.5, `rgba(0, 0, 0, ${shadowAlpha * 0.5})`);
    shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.ellipse(sx, STAGE_GROUND_Y + 2, shadowW, shadowH, 0, 0, Math.PI * 2);
    ctx.fill();

    const { bodyColor, outlineColor, glowColor } = resolveFighterColors(f, globalTick);

    // ── Animation blending: check state transition and interpolate offset ──
    const blender = getFighterBlender(playerIdx);
    const currentStateKey = f.state;
    const prevFighterState = prevStateMap.get(playerIdx);
    if (prevFighterState !== undefined && prevFighterState !== currentStateKey) {
      blender.startBlendFromProfile(prevFighterState, 0, currentStateKey);
    }
    prevStateMap.set(playerIdx, currentStateKey);
    blender.update();

    // Apply blend offset to screen position
    let blendOffsetX = 0;
    let blendOffsetY = 0;
    if (blender.isBlending()) {
      const bs = blender.getBlendState()!;
      // The blend creates a subtle position interpolation:
      // Blend from a small offset (representing the old pose's offset) toward 0 (the new pose).
      // This creates a smooth drift rather than a snap.
      const t = 1 - bs.blendProgress; // inverted: starts at 1, goes to 0
      blendOffsetX = t * 3 * f.facing; // slight drift from the old facing direction
      blendOffsetY = t * 1; // subtle vertical settle
    }

    // Glow behind body
    if (glowColor) {
      const glowPulse = maxModeActive ? 1 + Math.sin(globalTick * 0.12) * 0.3 : 1;
      ctx.fillStyle = glowColor;
      ctx.beginPath();
      ctx.ellipse(sx, sy - f.displayHeight / 2, (hw + 15) * glowPulse, (f.displayHeight / 2 + 15) * glowPulse, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    if (maxModeActive) {
      const auraPulse = debugOverlayEnabled
        ? 0.08 + Math.sin(globalTick * 0.1) * 0.04
        : 0.03 + Math.sin(globalTick * 0.1) * 0.015;
      ctx.fillStyle = `rgba(68, 255, 136, ${Math.max(0, auraPulse)})`;
      ctx.beginPath();
      ctx.ellipse(sx, sy - f.displayHeight / 2, hw + 25, f.displayHeight / 2 + 20, 0, 0, Math.PI * 2);
      ctx.fill();
      const outlinePulse = debugOverlayEnabled
        ? Math.sin(globalTick * 0.15) * 0.3 + 0.4
        : Math.sin(globalTick * 0.15) * 0.12 + 0.18;
      ctx.strokeStyle = `rgba(68, 255, 136, ${outlinePulse})`;
      ctx.lineWidth = debugOverlayEnabled ? 3 : 1.5;
      ctx.beginPath();
      ctx.ellipse(sx, sy - f.displayHeight / 2, hw + 8, f.displayHeight / 2 + 8, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Ground reflection — KOF2002: 角色脚下微弱倒影
    if (f.isGrounded()) {
      ctx.save();
      ctx.globalAlpha = 0.08;
      ctx.translate(sx, STAGE_GROUND_Y);
      ctx.scale(1, -0.15);
      ctx.translate(-sx, -STAGE_GROUND_Y);
      const refColors = getCharacterColors(f.charId ?? '');
      drawSkeletalFighter(ctx, f, sx, f.y, refColors.outfit, refColors.outline || '#000000', globalTick, maxModeActive, playerIdx);
      ctx.restore();
    }

    // Lean offset (includes blend transition offset)
    let leanOffsetX = blendOffsetX;
    let leanOffsetY = 0;
    let leanAngle = 0;
    if (f.state === FighterState.RUN) {
      // KOF2002: 跑步起步加速 — 前3帧额外前倾
      const startBoost = f.stateAge < 3 ? (3 - f.stateAge) * 1.5 : 0;
      leanOffsetX = (8 + startBoost) * f.facing + blendOffsetX;
      leanAngle = (0.12 + (f.stateAge < 3 ? 0.03 : 0)) * f.facing;
      // KOF2002: 跑步弹跳 — 更高频3px上下弹跳
      leanOffsetY = Math.abs(Math.sin(f.stateAge * 0.8)) * 3;
      // KOF2002: 跑步左右摆动 — 跑步时微弱左右交替重心
      leanOffsetX = Math.sin(f.stateAge * 0.8) * 2 * f.facing + blendOffsetX;
    } else if (f.state === FighterState.ROLL || f.state === FighterState.BACK_ROLL) {
      // KOF2002: 受身滚动前倾/后倾
      leanOffsetX = (f.state === FighterState.ROLL ? 5 : -5) * f.facing + blendOffsetX;
      leanAngle = (f.state === FighterState.ROLL ? 0.08 : -0.08) * f.facing;
      leanOffsetY = 4; // 保持低姿态
    } else if (f.state === FighterState.BACKDASH) {
      leanOffsetX = -6 * f.facing + blendOffsetX;
      leanAngle = -0.08 * f.facing;
    } else if (f.state === FighterState.IDLE) {
      // KOF2002: 待机微弱重心偏移 — 每3秒缓慢左右移重
      leanOffsetX = Math.sin(globalTick * 0.015) * 2 * f.facing + blendOffsetX;
      leanAngle = Math.sin(globalTick * 0.015) * 0.015 * f.facing;
      // KOF2002: 低血量待机驼背 — HP<30%时身体前倾
      if (f.health < f.maxHealth * 0.3) {
        leanOffsetX += 2 * f.facing;
        leanAngle += 0.02 * f.facing;
      }
    } else if (f.state === FighterState.WALK) {
      // KOF2002: 前進=前傾, 後退=後傾 (defensive lean)
      const isWalkingForward = (f.vx > 0 && f.facing > 0) || (f.vx < 0 && f.facing < 0);
      if (isWalkingForward) {
        leanOffsetX = 3 * f.facing + blendOffsetX;
        leanAngle = 0.04 * f.facing;
      } else {
        leanOffsetX = -2 * f.facing + blendOffsetX;
        leanAngle = -0.03 * f.facing;
        // KOF2002: 后退时微抬 — 后退时身体略微上抬
        leanOffsetY = -1;
      }
      // KOF2002: 步行节奏微弹 — 走路时轻微上下弹动
      leanOffsetY += Math.sin(f.stateAge * 0.4) * 2;
    }
    // KOF2002: 步行脚底灰尘 — WALK步底时脚底微尘
    if (f.state === FighterState.WALK_FORWARD && Math.sin(f.stateAge * 0.4) > 0.9) {
      ctx.save();
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = '#aaaaaa';
      ctx.beginPath();
      ctx.ellipse(sx, sy, 6, 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    // KOF2002: 受击/防御后仰 — 被打时身体向后方微倾
    if (f.state === FighterState.HITSTUN) {
      leanOffsetX = -4 * f.facing + blendOffsetX;
      leanAngle = -0.06 * f.facing;
    } else if (f.state === FighterState.KNOCKDOWN && !f.isGrounded()) {
      // KOF2002: 空中击飞旋转 — 浮空KNOCKDOWN时身体翻转
      leanAngle = f.stateAge * 0.08 * f.facing;
      leanOffsetX = -2 * f.facing + blendOffsetX;
    } else if (f.state === FighterState.BLOCK) {
      leanOffsetX = -2 * f.facing + blendOffsetX;
      leanAngle = -0.03 * f.facing;
    } else if (f.state === FighterState.CROUCH_ATTACK) {
      // KOF2002: 蹲攻击前倾 — 出手时重心前移
      leanOffsetX = 3 * f.facing + blendOffsetX;
      leanAngle = 0.04 * f.facing;
      leanOffsetY = 8; // 保持蹲姿
    } else if (f.state === FighterState.STAND_ATTACK) {
      // KOF2002: 站立攻击前倾 — 出拳/踢时重心前移
      leanOffsetX = 2 * f.facing + blendOffsetX;
      leanAngle = 0.03 * f.facing;
    } else if (f.state === FighterState.THROW) {
      // KOF2002: 投技突进前倾 — 投技发动时重心大幅前移
      leanOffsetX = 6 * f.facing + blendOffsetX;
      leanAngle = 0.1 * f.facing;
      // KOF2002: 投技发动前2帧下沉 — 投技抓人前身体微沉
      if (f.stateAge < 2) { leanOffsetY += 4; }
    } else if (f.state === FighterState.AIR_ATTACK) {
      // KOF2002: 空中攻击俯冲前倾
      leanOffsetX = 4 * f.facing + blendOffsetX;
      leanAngle = 0.07 * f.facing;
    } else if (f.state === FighterState.AIR_BLOCK) {
      // KOF2002: 空中防御收缩 — 空中防御时蜷缩姿态
      leanOffsetY = 5;
      leanAngle = -0.04 * f.facing;
    } else if (f.state === FighterState.COUNTER_STANCE) {
      // KOF2002: 反击架势后仰 + 蓄力微弹
      leanOffsetX = -3 * f.facing + blendOffsetX;
      leanAngle = -0.05 * f.facing;
      leanOffsetY += Math.sin(f.stateAge * 0.5) * 1.5;
    } else if (f.state === FighterState.JUMP || f.state === FighterState.RUN_JUMP) {
      // KOF2002: 跳跃微前倾 + 起跳前蹲
      leanOffsetX = 2 * f.facing + blendOffsetX;
      leanAngle = 0.03 * f.facing;
      if (f.stateAge < 2) { leanOffsetY += 3; }
    } else if (f.state === FighterState.HOP) {
      // KOF2002: 小跳微缩 — 紧凑姿态 + 起跳前蹲
      leanOffsetY = 3;
      if (f.stateAge < 2) { leanOffsetY += 4; }
    } else if (f.state === FighterState.HYPER_JUMP) {
      // KOF2002: 超跳大幅前倾 + 起跳前蹲
      leanOffsetX = 4 * f.facing + blendOffsetX;
      leanAngle = 0.06 * f.facing;
      if (f.stateAge < 2) { leanOffsetY += 6; } // 起跳前蹲
    } else if (f.state === FighterState.TAUNT) {
      // KOF2002: 挑衅后仰
      leanOffsetX = -4 * f.facing + blendOffsetX;
      leanAngle = -0.08 * f.facing;
      leanOffsetY = Math.sin(f.stateAge * 0.3) * 2;
      // KOF2002: 挑衅闪光 — 每15帧身体微闪
    }

    // Afterimage trail
    if (f.state === FighterState.RUN || f.state === FighterState.BACKDASH
      || f.state === FighterState.ROLL || f.state === FighterState.BACK_ROLL) {
      drawAfterimageTrail(ctx, f, sx, leanOffsetX, globalTick, maxModeActive);
    }
    // KOF2002: 无敌帧半透明 — 后dash/起身无敌期间角色闪烁
    if (f.invincible || f.throwInvulnFrames > 0) {
      ctx.globalAlpha = 0.6 + Math.sin(globalTick * 0.5) * 0.15;
    }
    // KOF2002: 挑衅微光 — TAUNT时身体微弱金色闪烁
    if (f.state === FighterState.TAUNT) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.06 + Math.sin(globalTick * 0.2) * 0.03;
      ctx.fillStyle = '#ffcc44';
      ctx.fillRect(sx + leanOffsetX - hw, sy - f.displayHeight, hw * 2, f.displayHeight);
      ctx.restore();
    }
    // KOF2002: 投技无敌金色轮廓 — throwInvuln期间金色边框
    if (f.throwInvulnFrames > 0 && !f.invincible) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.1;
      ctx.strokeStyle = '#ffcc44';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(sx, sy - f.displayHeight / 2, hw + 4, f.displayHeight / 2 + 4, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    // KOF2002: HOP落地烟尘 — HOP着陆时脚边小尘团
    if (f.state === FighterState.IDLE && f.landingRecovery > 0 && f.landingRecovery > 5) {
      ctx.save();
      ctx.globalAlpha = 0.15;
      ctx.fillStyle = maxModeActive ? '#44ff88' : '#bbbbbb';
      ctx.beginPath();
      ctx.ellipse(sx, sy, 10, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    // KOF2002: 被投技摇晃 — isBeingThrown时身体微抖
    if (f.isBeingThrown) {
      ctx.translate(Math.sin(globalTick * 2) * 2, 0);
    }
    // KOF2002: 跑步起步烟尘 — RUN前2帧脚下灰色烟尘
    if (f.state === FighterState.RUN && f.stateAge < 2) {
      ctx.save();
      ctx.globalAlpha = (2 - f.stateAge) / 2 * 0.3;
      ctx.fillStyle = '#999999';
      const puffR = 6 + f.stateAge * 4;
      ctx.beginPath();
      ctx.ellipse(sx - f.facing * 8, sy, puffR, puffR * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    // KOF2002: 跳跃起飞烟尘 — JUMP/HYPER_JUMP首帧脚下烟尘
    if ((f.state === FighterState.JUMP || f.state === FighterState.HYPER_JUMP || f.state === FighterState.RUN_JUMP) && f.stateAge < 2) {
      ctx.save();
      ctx.globalAlpha = (2 - f.stateAge) / 2 * 0.25;
      ctx.fillStyle = '#aaaaaa';
      ctx.beginPath();
      ctx.ellipse(sx, sy, 8 + f.stateAge * 3, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    // KOF2002: 后撤步渐隐 — 后dash期间身体更透明(幻影感)
    if (f.state === FighterState.BACKDASH) {
      ctx.globalAlpha = Math.min(ctx.globalAlpha || 1, 0.75);
    }
    // KOF2002: 攻击恢复期变暗 — 攻击动作后半段身体微暗(显示破绽)
    if ((f.state === FighterState.STAND_ATTACK || f.state === FighterState.CROUCH_ATTACK) && f.stateAge > 15) {
      const dimAlpha = Math.max(0.85, 1 - (f.stateAge - 15) * 0.01);
      ctx.globalAlpha = Math.min(ctx.globalAlpha || 1, dimAlpha);
    }
    // KOF2002: 投技冲击线 — THROW前3帧水平冲击线
    if (f.state === FighterState.THROW && f.stateAge < 3) {
      ctx.save();
      ctx.globalAlpha = (3 - f.stateAge) / 3 * 0.35;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      for (let l = 0; l < 3; l++) {
        const ly = sy - f.displayHeight * (0.3 + l * 0.2);
        const lx = sx + f.facing * (10 + l * 8);
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(lx + f.facing * (15 - f.stateAge * 4), ly);
        ctx.stroke();
      }
      ctx.restore();
    }
    // KOF2002: 滚动摩擦光 — ROLL时身体周围微弱旋转光点
    if ((f.state === FighterState.ROLL || f.state === FighterState.BACK_ROLL) && f.stateAge % 3 === 0) {
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = '#ffffff';
      const dotAngle = globalTick * 0.8;
      const dotX = sx + Math.cos(dotAngle) * (hw + 5);
      const dotY = sy - f.displayHeight / 2 + Math.sin(dotAngle) * 10;
      ctx.beginPath();
      ctx.arc(dotX, dotY, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // GC Roll green aura
    if (f.isRolling() && f.isGCRoll) {
      ctx.save();
      ctx.globalAlpha = 0.25 + 0.15 * Math.sin(globalTick * 1.2);
      ctx.fillStyle = '#22ff88';
      ctx.beginPath();
      ctx.ellipse(sx, STAGE_GROUND_Y - 40, 35, 55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Backdash invincibility glow
    if (f.isBackdashInvincible()) {
      ctx.save();
      ctx.globalAlpha = 0.3 + 0.2 * Math.sin(globalTick * 0.8);
      ctx.fillStyle = '#4488ff';
      ctx.beginPath();
      ctx.ellipse(sx, STAGE_GROUND_Y - 50, 40, 60, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Roll recovery vulnerability flash
    if (f.isRolling() && !f.isRollInvincible()) {
      ctx.save();
      ctx.globalAlpha = 0.2 + 0.15 * Math.sin(globalTick * 1.2);
      ctx.fillStyle = '#ffaa00';
      ctx.beginPath();
      ctx.ellipse(sx, STAGE_GROUND_Y - 30, 30, 40, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    ctx.translate(sx + leanOffsetX, sy - leanOffsetY);
    ctx.rotate(leanAngle);
    ctx.translate(-(sx + leanOffsetX), -(sy - leanOffsetY));

    // KOF2002: 待机呼吸 — idle时轻微纵向缩放模拟呼吸(低血量加速)
    if (f.state === FighterState.IDLE) {
      const hpRatio = f.health / f.maxHealth;
      const breathSpeed = hpRatio < 0.3 ? 0.14 : 0.08; // 低血量呼吸加速
      const breathe = Math.sin(globalTick * breathSpeed) * 0.008;
      ctx.translate(0, -sy);
      ctx.scale(1 + breathe, 1 - breathe);
      ctx.translate(0, sy);
    }
    // KOF2002: 蹲姿呼吸 — CROUCH时更慢更深的呼吸
    if (f.state === FighterState.CROUCH) {
      const crouchBreathe = Math.sin(globalTick * 0.05) * 0.005;
      ctx.translate(0, -sy);
      ctx.scale(1 + crouchBreathe, 1 - crouchBreathe);
      ctx.translate(0, sy);
    }
    // KOF2002: 蹲下瞬间烟尘 — CROUCH首帧脚底微尘
    if (f.state === FighterState.CROUCH && f.stateAge === 0) {
      ctx.save();
      ctx.globalAlpha = 0.15;
      ctx.fillStyle = '#999999';
      ctx.beginPath();
      ctx.ellipse(sx, sy, 8, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // KOF2002: Hit-stop defender jitter — 确定性正弦抖动产生稳定震动感
    if (hitStopDefender >= 0 && playerIdx === hitStopDefender) {
      const phase = performance.now() * 0.05;
      const amplitude = Math.abs(hitStopBias) * 0.6;
      const jitterX = hitStopBias > 0 ? amplitude * Math.sin(phase) : -amplitude * Math.sin(phase);
      const jitterY = Math.sin(phase * 1.7) * 2.5;
      ctx.translate(jitterX, jitterY);
    }



    // Hitstop defender tint - brief red overlay during freeze to show impact
    if (f.hitFlashFrames > 0 && f.state === FighterState.HITSTUN) {
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = '#ff4444';
      ctx.fillRect(-25, -f.displayHeight - 10, 50, f.displayHeight + 20);
      ctx.globalAlpha = 1.0;
    }
    // KOF2002: 受击初始压扁 — HITSTUN前2帧身体横向压缩
    if (f.state === FighterState.HITSTUN && f.stateAge < 2) {
      const hitSquash = (2 - f.stateAge) / 2;
      ctx.translate(0, -sy);
      ctx.scale(1 - hitSquash * 0.08, 1 + hitSquash * 0.05);
      ctx.translate(0, sy);
    }
    // KOF2002: 受击火花环 — HITSTUN首帧小环形火花
    if (f.state === FighterState.HITSTUN && f.stateAge === 0) {
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = '#ffcc44';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(sx, sy - f.displayHeight / 2, hw + 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    // KOF2002: 角落撞击火花 — 被打向角落时额外飞溅
    if (f.state === FighterState.HITSTUN && f.stateAge < 3) {
      const nearLeft = f.x - STAGE_LEFT < 30;
      const nearRight = STAGE_RIGHT - f.x < 30;
      if (nearLeft || nearRight) {
        ctx.save();
        const wallX = nearLeft ? STAGE_LEFT - cameraX : STAGE_RIGHT - cameraX;
        ctx.globalAlpha = (3 - f.stateAge) / 3 * 0.5;
        for (let sp = 0; sp < 4; sp++) {
          const sparkAngle = (sp / 4) * Math.PI + (nearLeft ? 0 : Math.PI);
          const sparkDist = 5 + f.stateAge * 8;
          const sparkX = wallX + Math.cos(sparkAngle) * sparkDist;
          const sparkY = sy - f.displayHeight / 2 + Math.sin(sparkAngle) * sparkDist * 0.5;
          ctx.fillStyle = '#ffee66';
          ctx.beginPath();
          ctx.arc(sparkX, sparkY, 2 - f.stateAge * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }
    // KOF2002: 命中停顿攻击者发光 — hitstop时攻击者微白轮廓
    if (f.hitFlashFrames > 0 && f.state !== FighterState.HITSTUN && f.state !== FighterState.KNOCKDOWN) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const hitGlowColor = maxModeActive ? '#44ff88' : '#ffffff';
      ctx.globalAlpha = maxModeActive ? 0.12 : 0.08;
      ctx.fillStyle = hitGlowColor;
      ctx.fillRect(sx + leanOffsetX - hw - 3, sy - f.displayHeight - 3, (hw + 3) * 2, f.displayHeight + 6);
      // KOF2002: 命中闪光肢体亮点 — hitstop时拳脚末端发光点
      const limbGlowX = sx + f.facing * (hw + 10);
      const limbGlowY = sy - f.displayHeight * 0.5;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.arc(limbGlowX, limbGlowY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    // KOF2002: 攻击命中残影 — hitstop时攻击者后方微弱残影
    if (f.hitFlashFrames > 0 && f.state !== FighterState.HITSTUN && f.state !== FighterState.KNOCKDOWN) {
      ctx.save();
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = 'rgba(255, 255, 200, 0.15)';
      ctx.fillRect(sx + leanOffsetX - hw - 3 - f.facing * 12, sy - f.displayHeight - 3, (hw + 3) * 2, f.displayHeight + 6);
      ctx.restore();
    }
    // Hitstun body shake — KOF2002 tiered body wobble
    // Light hit: subtle jitter (1-2px), Heavy: strong wobble (3-4px), Special/DM: violent shake (5+px)
    // hitstunTimer carries tier info: light=11, heavy=19, special=22+, DM=0(knockdown)
    if (f.state === FighterState.HITSTUN && f.hitstunTimer > 0) {
      // Determine shake intensity from hitstun duration (proxy for feedback tier)
      const baseShake = f.hitstunTimer > 20 ? 4.5 : f.hitstunTimer > 14 ? 3.0 : 1.5;
      const decay = f.hitstunTimer > 20 ? 0.15 : f.hitstunTimer > 14 ? 0.2 : 0.3;
      // Progress: 0 at hit -> 1 at hitstun end
      const maxHitstun = f.hitstunTimer + (f.stateAge || 0);
      const progress = maxHitstun > 0 ? 1 - (f.hitstunTimer / maxHitstun) : 1;
      const shakeAmt = baseShake * Math.max(0, 1 - progress * (1 + decay));
      // Directional wobble: pushed backward (in facing direction of attacker)
      const wobbleX = Math.sin(f.stateAge * 0.8) * shakeAmt;
      const jitterY = (Math.random() - 0.5) * shakeAmt * 0.4;
      ctx.translate(wobbleX, jitterY);
    }


    // Blockstun body impact — KOF2002 guard stance pushback wobble
    // Defenders shake briefly on heavy/special block, light is almost still
    if (f.state === FighterState.BLOCKSTUN && f.blockstunTimer > 0) {
      const blockShake = f.blockstunTimer > 12 ? 2.5 : f.blockstunTimer > 6 ? 1.5 : 0.8;
      const wobbleX = Math.sin(f.stateAge * 1.2) * blockShake;
      ctx.translate(wobbleX, 0);
    }

    // KOF2002: 跳跃顶端拉伸 — 到达跳跃最高点时身体微拉伸
    const isAirborne = f.state === FighterState.JUMP || f.state === FighterState.HOP
      || f.state === FighterState.RUN_JUMP || f.state === FighterState.HYPER_JUMP;
    if (isAirborne && Math.abs(f.vy) < 1.5) {
      const apexStretch = 1 - Math.abs(f.vy) / 1.5;
      ctx.translate(0, -sy);
      ctx.scale(1 - apexStretch * 0.05, 1 + apexStretch * 0.08);
      ctx.translate(0, sy);
    }

    // Knockdown ground squash — KOF2002: body compresses on landing
    if (f.state === FighterState.KNOCKDOWN && f.stateAge < 5) {
      const squashProgress = f.stateAge / 5;
      const squashY = 1 + (1 - squashProgress) * 0.2;
      const squashX = 1 - (1 - squashProgress) * 0.1;
      ctx.scale(squashX, squashY);
    }
    // KOF2002: 防御冲击压扁 — 防御硬直前3帧身体微压
    if (f.state === FighterState.BLOCKSTUN && f.blockstunTimer > 0 && f.stateAge < 3) {
      const blockSquash = (3 - f.stateAge) / 3;
      ctx.scale(1 + blockSquash * 0.04, 1 - blockSquash * 0.06);
    }
    // KOF2002: 起身恢复闪光 — GETUP最后3帧微闪白光
    if (f.state === FighterState.GETUP && f.getupTimer > 0 && f.getupTimer <= 3) {
      const flashAlpha = f.getupTimer / 3 * 0.15;
      ctx.fillStyle = 'rgba(255, 255, 255, ' + flashAlpha + ')';
      ctx.fillRect(-30, -f.displayHeight - 5, 60, f.displayHeight + 10);
    }
    // Dizzy state wobble — KOF2002 unsteady sway when stunned (intensity grows over time)
    if (f.state === FighterState.DIZZY) {
      const intensityMult = 1 + Math.min(f.stateAge * 0.005, 1.5);
      const swayX = Math.sin(f.stateAge * 0.15) * 3 * intensityMult;
      const swayY = Math.sin(f.stateAge * 0.22) * 1.5 * intensityMult;
      ctx.translate(swayX, swayY);
      // KOF2002: 眩晕星星 — 头顶3颗旋转星星(随时间增大)
      const starBaseY = sy - f.displayHeight - 12;
      const starSize = 3 + Math.min(f.stateAge * 0.01, 2); // 3->5px over time
      for (let s = 0; s < 3; s++) {
        const angle = (s / 3) * Math.PI * 2 + globalTick * 0.08;
        const starX = sx + Math.cos(angle) * 18;
        const starY = starBaseY + Math.sin(angle) * 6;
        ctx.fillStyle = '#ffee44';
        ctx.beginPath();
        ctx.arc(starX, starY, starSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }    // Getup Y offset — interpolate from lying (ground) to standing position
    if (f.state === FighterState.GETUP && f.getupTimer > 0) {
      const getupProgress = 1 - (f.getupTimer / (f.getupDuration || 15));
      // Fighter rises from 20px below ground level to standing
      const getYOffset = 20 * (1 - getupProgress);
      ctx.translate(0, getYOffset);
    }
    // Landing recovery crouch — KOF2002: fighter stays low briefly after landing
    if (f.landingRecovery > 0 && f.state === FighterState.IDLE) {
      const recoveryT = f.landingRecovery / 10; // normalize (max ~10 frames)
      const crouchOffset = 12 * Math.min(1, recoveryT);
      ctx.translate(0, crouchOffset);
      // KOF2002: 着地压扁 — 着地前3帧短暂横向拉伸
      if (f.landingRecovery > 7) {
        const squashT = (f.landingRecovery - 7) / 3;
        ctx.translate(0, -sy);
        ctx.scale(1 + squashT * 0.05, 1 - squashT * 0.08);
        ctx.translate(0, sy);
      }
    }
    // KOF2002: 蹲下状态额外Y偏移+身体微宽 — 确保蹲姿视觉更低更稳
    if (f.state === FighterState.CROUCH) {
      const crouchBreathe = Math.sin(globalTick * 0.06) * 1;
      ctx.translate(0, 8 + crouchBreathe);
      ctx.translate(0, -sy);
      ctx.scale(1.03, 0.97); // 蹲下身体微宽
      ctx.translate(0, sy);
    }

    // KOF2002: MAX模式跑步火花 — MAX+RUN时脚下绿色光点
    if (maxModeActive && f.state === FighterState.RUN && f.stateAge % 4 === 0) {
      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = '#44ff88';
      const sparkX = sx + (Math.random() - 0.5) * 20;
      ctx.beginPath();
      ctx.arc(sparkX, sy, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // KOF2002: 受击恢复闪烁 — hitstun最后5帧身体闪烁
    if (f.state === FighterState.HITSTUN && f.hitstunTimer > 0 && f.hitstunTimer <= 5) {
      const flickerOn = f.hitstunTimer % 2 === 0;
      if (flickerOn) {
        ctx.globalAlpha = 0.7;
      }
    }
    // KOF2002: 受击红色脉冲 — hitstunTimer越高身体越红
    if (f.state === FighterState.HITSTUN && f.hitstunTimer > 5) {
      const redIntensity = Math.min((f.hitstunTimer - 5) * 0.01, 0.1);
      ctx.fillStyle = 'rgba(255, 50, 30, ' + redIntensity + ')';
      ctx.fillRect(sx + leanOffsetX - hw, sy - f.displayHeight, hw * 2, f.displayHeight);
    }

    // KOF2002: 防御恢复闪烁 — blockstun最后4帧身体闪烁
    if (f.state === FighterState.BLOCK && f.blockstunTimer > 0 && f.blockstunTimer <= 4) {
      const flickerOn = f.blockstunTimer % 2 === 0;
      if (flickerOn) {
        ctx.globalAlpha = 0.75;
      }
    }
    // KOF2002: 防御恢复机会指示 — blockstun最后2帧微绿闪
    if (f.state === FighterState.BLOCKSTUN && f.blockstunTimer > 0 && f.blockstunTimer <= 2) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.08;
      ctx.fillStyle = '#44ff44';
      ctx.fillRect(sx + leanOffsetX - hw - 3, sy - f.displayHeight - 3, (hw + 3) * 2, f.displayHeight + 6);
      ctx.restore();
    }

    // Compute animation frame index: attacks use attackFrame, cyclic states use stateAge
    const isAttackState = f.state === FighterState.STAND_ATTACK
      || f.state === FighterState.CROUCH_ATTACK
      || f.state === FighterState.AIR_ATTACK
      || f.state === FighterState.COUNTER_STANCE
      || f.state === FighterState.THROW
      || f.state === FighterState.MAX_MODE;
    const isJumpLike = f.state === FighterState.JUMP || f.state === FighterState.HOP
      || f.state === FighterState.RUN_JUMP || f.state === FighterState.HYPER_JUMP
      || f.state === FighterState.BACKDASH;
    const ticksPerFrame = isJumpLike ? 6 : 9;
    const frameIdx = isAttackState
      ? Math.max(0, f.attackFrame)
      : Math.floor(f.stateAge / ticksPerFrame);

    // Priority: 1) high-res pixel frames  2) sprite atlas  3) skeletal fallback
    // KOF2002: 地面阴影 — 角色脚下椭圆形阴影
    if (f.isGrounded()) {
      ctx.save();
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.ellipse(sx + leanOffsetX, sy + 2, hw * 0.8, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    const highResDrawn = drawHighResFrame(ctx, f.charId ?? '', f.state, f.stateAge, sx + leanOffsetX, sy, f.facing, f.currentAttack, f.vx);
    if (!highResDrawn) {
      const spriteRendered = spriteRenderer?.canRender(f.charId)
        ? spriteRenderer.render(ctx, f.charId, f.state, frameIdx, sx + leanOffsetX, sy, f.facing, getCharacterColors(f.charId ?? '').outfit)
        : false;
      if (!spriteRendered) {
        drawSkeletalFighter(ctx, f, sx + leanOffsetX, sy, bodyColor, outlineColor, globalTick, maxModeActive, playerIdx);
      }
    }

    // Hit flash overlay
    if (f.hitFlashFrames > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.24;
      ctx.fillStyle = f.hitFlashColor || '#ffffff';
      const flashX = sx + leanOffsetX;
      const flashY = sy - f.displayHeight * 0.56;
      const flashW = Math.max(18, hw * 0.55);
      const flashH = Math.max(28, f.displayHeight * 0.26);
      const flashGrad = ctx.createRadialGradient(
        flashX, flashY, 2,
        flashX, flashY, Math.max(flashW, flashH) * 1.6,
      );
      flashGrad.addColorStop(0, 'rgba(255,255,255,0.95)');
      flashGrad.addColorStop(0.45, 'rgba(255,255,255,0.40)');
      flashGrad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = flashGrad;
      ctx.beginPath();
      ctx.ellipse(flashX, flashY, flashW, flashH, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.14;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(flashX, flashY, flashW * 1.1, flashH * 1.05, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      // KOF2002: 命中闪光外发光 — 角色躯干附近的局部辉光，避免整块白框
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.12;
      const auraGrad = ctx.createRadialGradient(
        flashX, flashY, 6,
        flashX, flashY, Math.max(flashW, flashH) * 2.2,
      );
      auraGrad.addColorStop(0, 'rgba(255,255,255,0.35)');
      auraGrad.addColorStop(0.6, 'rgba(255,255,255,0.18)');
      auraGrad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.ellipse(flashX, flashY, flashW * 1.5, flashH * 1.35, 0, 0, Math.PI * 2);
      ctx.fill();
      const innerGrad = ctx.createRadialGradient(
        flashX, flashY, 5,
        flashX, flashY, f.displayHeight * 0.45,
      );
      innerGrad.addColorStop(0, '#ffffff');
      innerGrad.addColorStop(0.4, 'rgba(255,255,255,0.3)');
      innerGrad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = innerGrad;
      ctx.beginPath();
      ctx.ellipse(flashX, flashY, flashW * 0.9, flashH * 0.9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    // KOF2002: 超必杀命中能量环 — superBgFlashFrames时攻击者周围扩散环
    if (f.superBgFlashFrames > 0) {
      ctx.save();
      const ringProgress = 1 - f.superBgFlashFrames / 12;
      const ringRadius = 20 + ringProgress * 60;
      ctx.globalAlpha = (1 - ringProgress) * 0.4;
      ctx.strokeStyle = '#ffdd66';
      ctx.lineWidth = 3 * (1 - ringProgress);
      ctx.beginPath();
      ctx.ellipse(sx, sy - f.displayHeight / 2, ringRadius, ringRadius * 0.6, 0, 0, Math.PI * 2);
      ctx.stroke();
      // 内层白色环
      ctx.globalAlpha = (1 - ringProgress) * 0.2;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(sx, sy - f.displayHeight / 2, ringRadius * 0.7, ringRadius * 0.4, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    // KOF2002: Counter Hit橙色爆发 — counterGlowFrames时额外橙色扩散
    if (f.counterGlowFrames > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = (f.counterGlowFrames / 6) * 0.2;
      ctx.fillStyle = '#ff8800';
      ctx.fillRect(sx + leanOffsetX - hw - 8, sy - f.displayHeight - 8, (hw + 8) * 2, f.displayHeight + 16);
      ctx.restore();
    }
    // KOF2002: MAX模式边框脉冲 — MAX模式时角色周围脉冲金色边框
    if (maxModeActive) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.15 + Math.sin(globalTick * 0.15) * 0.1;
      ctx.strokeStyle = '#44ff88';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(sx, sy - f.displayHeight / 2, hw + 6, f.displayHeight / 2 + 6, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    // MAX glow — P1 green, P2 blue for differentiation
    if (maxModeActive) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.15 + Math.sin(globalTick * 0.15) * 0.1;
      ctx.fillStyle = playerIdx === 0 ? '#44ff88' : '#4488ff';
      ctx.fillRect(sx + leanOffsetX - 60, sy - 200, 120, 200);
      ctx.restore();
    }
    // Guard low warning flash
    if (debugOverlayEnabled && guardLow && globalTick % 20 < 10) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = '#ff2222';
      ctx.fillRect(sx + leanOffsetX - 60, sy - 200, 120, 200);
      ctx.restore();
    }
    // KOF2002: 防御量表低警告 — 正常游戏中脚下红色脉冲
    if (guardLow && f.isGrounded()) {
      const guardPulse = Math.sin(globalTick * 0.2) * 0.08 + 0.06;
      ctx.fillStyle = 'rgba(255, 30, 30, ' + Math.max(0, guardPulse) + ')';
      ctx.beginPath();
      ctx.ellipse(sx, sy, hw + 12, 6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // KOF2002: 防御崩坏破碎扩散 — 碎片从角色向外飞散
    if (f.state === FighterState.GUARD_CRUSH) {
      ctx.save();
      const crushT = globalTick % 30;
      for (let p = 0; p < 6; p++) {
        const angle = (p / 6) * Math.PI * 2 + globalTick * 0.05;
        const dist = 20 + crushT * 2.5;
        const px = sx + Math.cos(angle) * dist;
        const py = sy - f.displayHeight / 2 + Math.sin(angle) * dist;
        ctx.globalAlpha = Math.max(0, 0.5 - crushT / 60);
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(px - 2, py - 2, 4, 4);
      }
      ctx.restore();
    }
    // KOF2002: 防御崩坏冲击环 — GUARD_CRUSH前5帧扩散环
    if (f.state === FighterState.GUARD_CRUSH && f.stateAge < 5) {
      ctx.save();
      const ringT = f.stateAge / 5;
      ctx.globalAlpha = (1 - ringT) * 0.5;
      ctx.strokeStyle = '#ff6600';
      ctx.lineWidth = 3 * (1 - ringT);
      ctx.beginPath();
      ctx.ellipse(sx, sy - f.displayHeight / 2, 15 + ringT * 40, 10 + ringT * 25, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    // KOF2002: KO倒地红光 — 倒地状态持续红晕
    if (f.health <= 0 && (f.state === FighterState.KNOCKDOWN || f.state === FighterState.GETUP)) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.12;
      const koAuraGrad = ctx.createRadialGradient(
        sx, sy - f.displayHeight / 2, 5,
        sx, sy - f.displayHeight / 2, hw + 20,
      );
      koAuraGrad.addColorStop(0, 'rgba(255, 40, 20, 0.3)');
      koAuraGrad.addColorStop(1, 'rgba(255, 0, 0, 0)');
      ctx.fillStyle = koAuraGrad;
      ctx.fillRect(sx - hw - 20, sy - f.displayHeight - 20, (hw + 20) * 2, f.displayHeight + 40);
      ctx.restore();
    }
    // KOF2002: 低血量红色警告 — HP<25%时身体微红
    if (f.health > 0 && f.health < f.maxHealth * 0.25) {
      const hpRatio = f.health / (f.maxHealth * 0.25);
      const redAlpha = (1 - hpRatio) * 0.12;
      ctx.fillStyle = 'rgba(200, 30, 30, ' + redAlpha + ')';
      ctx.fillRect(sx + leanOffsetX - hw - 5, sy - f.displayHeight - 5, (hw + 5) * 2, f.displayHeight + 10);
    }

    // KOF2002: 重击累积暗化 — hitstunTimer越大身体越暗(重击效果)
    if (f.state === FighterState.HITSTUN && f.hitstunTimer > 10) {
      const darkAlpha = Math.min((f.hitstunTimer - 10) * 0.005, 0.08);
      ctx.fillStyle = 'rgba(0, 0, 0, ' + darkAlpha + ')';
      ctx.fillRect(sx + leanOffsetX - hw, sy - f.displayHeight, hw * 2, f.displayHeight);
    }
    // KOF2002: 眩晕槽警告 — stunGauge>70%时身体微黄闪烁
    if (f.stunGauge > 70 && f.state !== FighterState.DIZZY && f.state !== FighterState.KNOCKDOWN) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = (f.stunGauge - 70) / 100 * 0.08;
      ctx.fillStyle = '#ffaa44';
      ctx.fillRect(sx + leanOffsetX - hw, sy - f.displayHeight, hw * 2, f.displayHeight);
      ctx.restore();
    }

    // KOF2002: 削血致死警告 — HP<10%且防御中时脉冲红光
    if (f.health > 0 && f.health < f.maxHealth * 0.1
      && (f.state === FighterState.BLOCK || f.state === FighterState.BLOCKSTUN)) {
      const dangerPulse = Math.sin(globalTick * 0.6) * 0.5 + 0.5;
      ctx.fillStyle = 'rgba(255, 50, 0, ' + (dangerPulse * 0.18) + ')';
      ctx.fillRect(sx + leanOffsetX - hw - 8, sy - f.displayHeight - 8, (hw + 8) * 2, f.displayHeight + 16);
    }

    // KOF2002: 防御槽低下警告 — guardGauge<30%时身体微黄
    if (f.guardGauge < 30 && f.state !== FighterState.KNOCKDOWN && f.state !== FighterState.DIZZY) {
      const gaugeRatio = f.guardGauge / 30;
      const yellowPulse = Math.sin(globalTick * 0.4) * 0.5 + 0.5;
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = (1 - gaugeRatio) * 0.06 * yellowPulse;
      ctx.fillStyle = '#ffaa00';
      ctx.fillRect(sx + leanOffsetX - hw - 3, sy - f.displayHeight - 3, (hw + 3) * 2, f.displayHeight + 6);
      ctx.restore();
    }
    // KOF2002: 角落压力红色脉动 — 靠近墙壁+低血量时红色脉动
    if (f.health < f.maxHealth * 0.5) {
      const nearWall = f.x - STAGE_LEFT < 60 || STAGE_RIGHT - f.x < 60;
      if (nearWall && f.state !== FighterState.KNOCKDOWN) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = 0.04 + Math.sin(globalTick * 0.3) * 0.02;
        ctx.fillStyle = '#ff3300';
        ctx.fillRect(sx + leanOffsetX - hw - 5, sy - f.displayHeight - 5, (hw + 5) * 2, f.displayHeight + 10);
        ctx.restore();
      }
    }

    // KOF2002: 待机战斗姿态光 — IDLE时对手近距离时身体微亮(紧张感)
    if (f.state === FighterState.IDLE && f.health < f.maxHealth * 0.5) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.05;
      ctx.fillStyle = '#ff4444';
      ctx.fillRect(sx + leanOffsetX - hw - 3, sy - f.displayHeight - 3, (hw + 3) * 2, f.displayHeight + 6);
      ctx.restore();
    }

    ctx.restore();

    drawAttackLimb(ctx, f, sx, sy);

    // KOF2002: 攻击发动闪光 — 出手前3帧拳头/脚尖位置白色小光点
    if (f.state === FighterState.STAND_ATTACK || f.state === FighterState.CROUCH_ATTACK || f.state === FighterState.AIR_ATTACK) {
      if (f.stateAge < 3) {
        ctx.save();
        const glowAlpha = (3 - f.stateAge) / 3 * 0.6;
        ctx.globalAlpha = glowAlpha;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        const limbX = sx + f.facing * (hw + 15);
        const limbY = sy - f.displayHeight / 2;
        ctx.arc(limbX, limbY, 5 - f.stateAge, 0, Math.PI * 2);
        ctx.fill();
        // KOF2002: 攻击发动冲击波 — 放射状短线
        if (f.stateAge === 0) {
          ctx.globalAlpha = 0.3;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          for (let r = 0; r < 6; r++) {
            const rayAngle = (r / 6) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(limbX + Math.cos(rayAngle) * 3, limbY + Math.sin(rayAngle) * 3);
            ctx.lineTo(limbX + Math.cos(rayAngle) * 12, limbY + Math.sin(rayAngle) * 12);
            ctx.stroke();
          }
        }
        ctx.restore();
      }
    }

    // KOF2002: 空中攻击速度线 — AIR_ATTACK时身后速度线
    if (f.state === FighterState.AIR_ATTACK && !f.isGrounded()) {
      ctx.save();
      ctx.globalAlpha = 0.2;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        const lineY = sy - f.displayHeight * (0.3 + i * 0.25);
        const lineStart = sx - f.facing * 10;
        const lineEnd = sx - f.facing * (25 + i * 8);
        ctx.beginPath();
        ctx.moveTo(lineStart, lineY);
        ctx.lineTo(lineEnd, lineY);
        ctx.stroke();
      }
      ctx.restore();
    }

    // KOF2002: 倒地冲击线 — KNOCKDOWN前3帧地面扩散细线
    if (f.state === FighterState.KNOCKDOWN && f.stateAge < 3 && f.isGrounded()) {
      ctx.save();
      ctx.globalAlpha = (3 - f.stateAge) / 3 * 0.4;
      ctx.strokeStyle = '#ffcc44';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI - Math.PI / 2;
        const len = 15 + f.stateAge * 10;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + Math.cos(angle) * len, sy + Math.sin(angle) * len * 0.3);
        ctx.stroke();
      }
      ctx.restore();
    }
    // KOF2002: 倒地着地烟尘 — KNOCKDOWN着陆时扩散灰色圆
    if (f.state === FighterState.KNOCKDOWN && f.stateAge >= 2 && f.stateAge <= 5 && f.isGrounded()) {
      ctx.save();
      ctx.globalAlpha = (5 - f.stateAge) / 3 * 0.25;
      ctx.fillStyle = '#888888';
      const dustR = 8 + (f.stateAge - 2) * 6;
      ctx.beginPath();
      ctx.ellipse(sx, sy, dustR, dustR * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // KOF2002: 反击架势蓄力发光 — COUNTER_STANCE时身体蓄力蓝色光环
    if (f.state === FighterState.COUNTER_STANCE && f.stateAge > 5) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const chargeAlpha = Math.min((f.stateAge - 5) * 0.01, 0.12);
      ctx.globalAlpha = chargeAlpha + Math.sin(globalTick * 0.3) * 0.03;
      ctx.fillStyle = '#4488ff';
      ctx.beginPath();
      ctx.ellipse(sx, sy - f.displayHeight / 2, hw + 8, f.displayHeight / 2 + 5, 0, 0, Math.PI * 2);
      ctx.fill();
      // KOF2002: 蓄力上升粒子 — COUNTER_STANCE时蓝色微粒向上漂浮
      if (f.stateAge % 3 === 0) {
        const particleX = sx + (Math.random() - 0.5) * hw * 2;
        const particleY = sy - Math.random() * f.displayHeight * 0.5;
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#66aaff';
        ctx.beginPath();
        ctx.arc(particleX, particleY, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // KOF2002: 防御硬直冲击波 — BLOCKSTUN时正面冲击波纹
    if (f.state === FighterState.BLOCKSTUN && f.blockstunTimer > 0 && f.stateAge < 2) {
      ctx.save();
      ctx.globalAlpha = 0.25;
      ctx.strokeStyle = '#88aaff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sx + leanOffsetX, sy - f.displayHeight / 2, hw + 15 + f.stateAge * 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // KOF2002: KO状态红色覆盖 — 倒地后身体发红
    if (f.health <= 0) {
      ctx.fillStyle = 'rgba(180, 20, 20, 0.15)';
      ctx.fillRect(sx + leanOffsetX - hw - 5, sy - f.displayHeight - 5, (hw + 5) * 2, f.displayHeight + 10);
    }

    // KOF2002: 防御护盾效果 — 站防/蹲防时可见的半透明护盾
    if (f.state === FighterState.BLOCK || f.state === FighterState.AIR_BLOCK) {
      ctx.save();
      const blockPulse = 0.15 + Math.sin(globalTick * 0.2) * 0.05;
      ctx.globalAlpha = blockPulse;
      ctx.strokeStyle = '#6688ff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(sx, sy - f.displayHeight / 2, hw + 12, f.displayHeight / 2 + 8, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = blockPulse * 0.3;
      ctx.fillStyle = '#4466ff';
      ctx.beginPath();
      ctx.ellipse(sx, sy - f.displayHeight / 2, hw + 8, f.displayHeight / 2 + 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    if (debugOverlayEnabled) {
      // Player label
      ctx.fillStyle = isP1 ? '#ff5555' : '#5599ff';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(isP1 ? 'P1' : 'P2', sx, sy - f.displayHeight - 8);

      // Quick Stand hint
      if (f.state === FighterState.KNOCKDOWN && !f.isHardKnockdown && f.knockdownTimer > 5
        && globalTick % 16 < 10) {
        ctx.fillStyle = '#ffcc44';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('A+B', sx, sy - 10);
      }
    }
    ctx.textAlign = 'left';
  }
}

/** Resolve body/outline/glow colors from fighter state — queries manifest fallbackColors */
export function resolveFighterColors(f: Fighter, globalTick: number): { bodyColor: string; outlineColor: string; glowColor: string | null } {
  // Use manifest outfit color as the base body color, falling back to f.color
  const manifestColors = getCharacterColors(f.charId ?? '');
  let bodyColor = manifestColors.outfit;
  let outlineColor = '#ffffff30';
  let glowColor: string | null = null;

  switch (f.state) {
    case FighterState.WALK:
      bodyColor = shiftColor(manifestColors.outfit, 12);
      break;
    case FighterState.RUN:
      bodyColor = shiftColor(manifestColors.outfit, 20);
      outlineColor = '#ff880050';
      glowColor = '#ff660025';
      break;
    case FighterState.BACKDASH:
      bodyColor = shiftColor(manifestColors.outfit, 35);
      outlineColor = '#88ccff60';
      glowColor = '#4488ff20';
      break;
    case FighterState.ROLL:
    case FighterState.BACK_ROLL:
      bodyColor = shiftColor(manifestColors.outfit, 40);
      outlineColor = '#44ff8860';
      glowColor = '#22ff4420';
      break;
    case FighterState.HOP:
      bodyColor = shiftColor(manifestColors.outfit, 15);
      break;
    case FighterState.HYPER_JUMP:
      bodyColor = shiftColor(manifestColors.outfit, 30);
      outlineColor = '#ff44ff50';
      glowColor = '#ff22ff25';
      break;
    case FighterState.JUMP:
    case FighterState.RUN_JUMP:
      bodyColor = shiftColor(manifestColors.outfit, 25);
      break;
    case FighterState.STAND_ATTACK:
    case FighterState.CROUCH_ATTACK:
    case FighterState.AIR_ATTACK: {
      // Character-specific attack color accent — each fighter gets a unique tint
      const accent = getAttackColorAccent(f.charId ?? '');
      bodyColor = accent.body;
      outlineColor = accent.outline;
      glowColor = accent.glow;
      break;
    }
    case FighterState.BLOCK:
    case FighterState.AIR_BLOCK:
      bodyColor = '#6688aa';
      outlineColor = '#88aaff60';
      glowColor = '#4466ff20';
      // KOF2002: 防御槽低下时防御身体偏黄
      if (f.guardGauge < 30) {
        bodyColor = '#aa8844';
        outlineColor = '#ffaa0060';
      }
      break;
    case FighterState.GUARD_CRUSH:
      bodyColor = globalTick % 6 < 3 ? '#ff4444' : '#ffffff';
      outlineColor = '#ff000080';
      glowColor = '#ff220040';
      // KOF2002: 防御崩坏时角色周围破碎效果 — 扩散的碎片光环
      break;
    case FighterState.HITSTUN:
      if (f.hitFlashFrames > 0) {
        bodyColor = f.hitFlashColor || '#ffffff';
        outlineColor = '#ffffffcc';
      } else {
        bodyColor = globalTick % 8 < 2 ? '#ffffff' : manifestColors.outfit;
        outlineColor = '#ff505070';
      }
      break;
    case FighterState.DIZZY:
      // KOF2002: dizzy characters flash yellow/white with a dazed look
      bodyColor = globalTick % 10 < 3 ? '#ffffaa' : globalTick % 10 < 5 ? '#ffffff' : manifestColors.outfit;
      outlineColor = '#ffcc0060';
      glowColor = '#ffcc0020';
      break;
    case FighterState.KNOCKDOWN:
      bodyColor = shiftColor(manifestColors.outfit, -50);
      outlineColor = '#88000040';
      break;
    case FighterState.GETUP:
      // KOF2002: 起身微白 — 起身动作时身体短暂泛白
      bodyColor = shiftColor(manifestColors.outfit, 15);
      outlineColor = '#ffffff30';
      break;
    case FighterState.CROUCH:
      // KOF2002: 蹲下稍暗 — 蹲姿时身体略微变暗
      bodyColor = shiftColor(manifestColors.outfit, -10);
      outlineColor = '#ffffff20';
      break;
    case FighterState.THROW:
      // KOF2002: 投技发动发红 — 技发动时身体发红
      bodyColor = shiftColor(manifestColors.outfit, 30);
      outlineColor = '#ff440050';
      glowColor = '#ff220020';
      break;
    case FighterState.MAX_MODE:
      // KOF2002: MAX模式金色光环 — 激活MAX时身体金色闪烁
      bodyColor = globalTick % 8 < 4 ? '#ffdd44' : manifestColors.outfit;
      outlineColor = '#ffaa0080';
      glowColor = '#ffaa0040';
      break;
  }

  // KOF2002: Counter hit发光 — 反击命中后短暂橙色轮廓
  if (f.counterGlowFrames > 0) {
    glowColor = '#ff8800';
    outlineColor = '#ff660088';
  }

  // KOF2002: 空中受击蓝色调 — 浮空受击时身体偏蓝
  if (f.state === FighterState.HITSTUN && !f.isGrounded()) {
    outlineColor = '#4488ff50';
    glowColor = '#4466ff20';
  }

  return { bodyColor, outlineColor, glowColor };
}

/** Character-specific attack color accent — each fighter gets a unique highlight during attacks */
function getAttackColorAccent(charId: string): { body: string; outline: string; glow: string } {
  switch (charId) {
    case 'kyo':      return { body: '#ff8822', outline: '#ff660060', glow: '#ff440030' };   // orange fire
    case 'iori':     return { body: '#aa44dd', outline: '#8800cc60', glow: '#6600aa30' };   // purple claw
    case 'terry':    return { body: '#44aaff', outline: '#2288ff60', glow: '#0066ff30' };   // blue wolf
    case 'kim':      return { body: '#eeeeff', outline: '#aabbff60', glow: '#8899ff30' };   // white-blue TKD
    case 'ryo':      return { body: '#ff9922', outline: '#ff770060', glow: '#ff550030' };   // orange karate
    case 'leona':    return { body: '#44dd88', outline: '#22bb6660', glow: '#00aa4430' };   // green military
    case 'kdash':    return { body: '#ff5522', outline: '#ff330060', glow: '#dd110030' };   // red fire
    case 'kula':     return { body: '#66ccff', outline: '#44aaee60', glow: '#2288dd30' };   // ice blue
    case 'robert':   return { body: '#44dd88', outline: '#22cc6660', glow: '#00aa4430' };   // green dragon
    case 'mai':      return { body: '#ff6688', outline: '#ff446660', glow: '#ff224430' };   // pink flame
    case 'clark':    return { body: '#aacc66', outline: '#88aa4460', glow: '#66882230' };   // olive military
    case 'ralf':     return { body: '#ffaa44', outline: '#ff882260', glow: '#ff660030' };   // orange explosion
    case 'joe':      return { body: '#ffbb22', outline: '#ffaa0060', glow: '#ff880030' };   // golden Muay Thai
    case 'andy':     return { body: '#ffcc44', outline: '#ffbb2260', glow: '#ffaa0030' };   // amber Shiranui
    case 'billy':    return { body: '#5599dd', outline: '#3377bb60', glow: '#22559930' };   // steel blue staff
    case 'chang':    return { body: '#cc9944', outline: '#aa772260', glow: '#88660030' };   // heavy iron
    case 'yashiro':  return { body: '#9966cc', outline: '#7744aa60', glow: '#55228830' };   // dark purple power
    case 'athena':   return { body: '#ff77aa', outline: '#ff558860', glow: '#ff336630' };   // psychic pink
    case 'mature':   return { body: '#cc2255', outline: '#aa004460', glow: '#88003330' };   // blood red
    case 'chris':    return { body: '#ff9955', outline: '#ff773360', glow: '#ff551130' };   // warm orange
    case 'shermie':  return { body: '#cc55bb', outline: '#aa339960', glow: '#88117730' };   // magenta
    case 'vice':     return { body: '#7755cc', outline: '#5533aa60', glow: '#33118830' };   // dark violet
    case 'yamazaki': return { body: '#66bb22', outline: '#44990060', glow: '#22770030' };   // snake green
    case 'mary':     return { body: '#5599ff', outline: '#3377dd60', glow: '#1155bb30' };   // blue wolf
    case 'kasumi':   return { body: '#ff7799', outline: '#ff557760', glow: '#ff335530' };   // soft pink
    case 'xiangfei': return { body: '#ff9977', outline: '#ff775560', glow: '#ff553330' };   // coral
    case 'choi':     return { body: '#bbcc22', outline: '#99aa0060', glow: '#77880030' };   // acidic yellow
    default:         return { body: '#eebb00', outline: '#ffcc0060', glow: '#ffaa0030' };   // default gold
  }
}

/** Draw afterimage trail for RUN/BACKDASH/ROLL — skeletal pose with per-ghost alpha */
function drawAfterimageTrail(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, leanOffsetX: number,
  globalTick: number, maxModeActive: boolean,
): void {
  // KOF2002: 残影色调 — RUN=橙, BACKDASH=蓝, ROLL=绿
  const trailManifestColors = getCharacterColors(f.charId ?? '');
  const trailColor = f.state === FighterState.RUN
    ? shiftColor(trailManifestColors.outfit, 40)
    : f.state === FighterState.BACKDASH
    ? shiftColor(trailManifestColors.outfit, 60)
    : shiftColor(trailManifestColors.outfit, 50);
  const trailOutline = f.state === FighterState.RUN
    ? '#ff880050'
    : f.state === FighterState.BACKDASH
    ? '#6699ff50'
    : '#44ff8850';

  const ghostCount = 3;
  for (let i = 1; i <= ghostCount; i++) {
    ctx.save();
    // 渐隐 alpha: 第一道最清晰, 越远越淡
    ctx.globalAlpha = 0.32 / i;
    const trailX = sx - leanOffsetX * i * 1.5 - f.facing * 12 * i;
    // 用完整骨骼 pose 渲染残影，角色颜色略偏残影色调
    drawSkeletalFighter(ctx, f, trailX, f.y, trailColor, trailOutline, globalTick, maxModeActive);
    ctx.restore();
  }
}

function isFighterDebugOverlayEnabled(): boolean {
  const location = globalThis.location;
  const search = location?.search;

  if (typeof search === 'string' && search.length > 1) {
    const params = new URLSearchParams(search);
    const queryFlags = ['fighterDebug', 'debugFighterOverlay', 'rendererDebug'];
    for (const key of queryFlags) {
      if (params.has(key)) {
        const value = params.get(key);
        if (value === null || value === '' || value === '1' || value === 'true') {
          return true;
        }
      }
    }
  }

  try {
    const stored = globalThis.localStorage?.getItem('rendererFighterDebug');
    return stored === '1' || stored === 'true';
  } catch {
    return false;
  }
}
