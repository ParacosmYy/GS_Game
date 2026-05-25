/**
 * Fighter rendering — extracted from renderer.ts
 * Shadow, glow, afterimage, color resolution, sprite frame calculation
 */
import { Fighter } from '../entities/fighter.js';
import { FighterState } from '../core/types.js';
import type { MaxModeState } from '../core/types.js';
import { FIGHTER_WIDTH, STAGE_GROUND_Y } from '../core/constants.js';
import { shiftColor, roundRect } from './utils.js';
import { drawSkeletalFighter } from './skeletalFighter.js';
import { drawAttackLimb } from './attackLimb.js';
import type { SpriteRenderer } from './spriteRenderer.js';

const fighterDebugOverlayEnabled = isFighterDebugOverlayEnabled();

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

    // Ground reflection
    if (f.isGrounded()) {
      ctx.save();
      ctx.globalAlpha = 0.06;
      ctx.translate(sx, STAGE_GROUND_Y);
      ctx.scale(1, -0.15);
      ctx.translate(-sx, -STAGE_GROUND_Y);
      drawSkeletalFighter(ctx, f, sx, f.y, f.color, '#000000', globalTick, maxModeActive);
      ctx.restore();
    }

    // Lean offset
    let leanOffsetX = 0;
    let leanAngle = 0;
    if (f.state === FighterState.RUN) {
      leanOffsetX = 8 * f.facing;
      leanAngle = 0.12 * f.facing;
    } else if (f.state === FighterState.BACKDASH) {
      leanOffsetX = -6 * f.facing;
      leanAngle = -0.08 * f.facing;
    } else if (f.state === FighterState.IDLE) {
      // KOF2002: 待机微弱重心偏移 — 每3秒缓慢左右移重
      leanOffsetX = Math.sin(globalTick * 0.015) * 2 * f.facing;
      leanAngle = Math.sin(globalTick * 0.015) * 0.015 * f.facing;
    } else if (f.state === FighterState.WALK) {
      // KOF2002: 步行时身体微倾
      leanOffsetX = 3 * f.facing;
      leanAngle = 0.04 * f.facing;
    }

    // Afterimage trail
    if (f.state === FighterState.RUN || f.state === FighterState.BACKDASH
      || f.state === FighterState.ROLL || f.state === FighterState.BACK_ROLL) {
      drawAfterimageTrail(ctx, f, sx, leanOffsetX);
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
    ctx.translate(sx + leanOffsetX, sy);
    ctx.rotate(leanAngle);
    ctx.translate(-(sx + leanOffsetX), -sy);

    // KOF2002: Hit-stop defender jitter — 确定性正弦抖动产生稳定震动感
    if (hitStopDefender >= 0 && playerIdx === hitStopDefender) {
      const phase = performance.now() * 0.05;
      const amplitude = Math.abs(hitStopBias) * 0.6;
      const jitterX = hitStopBias > 0 ? amplitude * Math.sin(phase) : -amplitude * Math.sin(phase);
      const jitterY = Math.sin(phase * 1.7) * 2.5;
      ctx.translate(jitterX, jitterY);
    }

    // Hitstun body shake
    if (f.state === FighterState.HITSTUN && f.hitstunTimer > 0) {
      const shakeAmt = Math.min(3, f.hitstunTimer * 0.2);
      ctx.translate((Math.random() - 0.5) * shakeAmt, (Math.random() - 0.5) * shakeAmt * 0.5);
    }

    const spriteRendered = spriteRenderer?.canRender(f.charId)
      ? spriteRenderer.render(ctx, f.charId, f.state, Math.max(0, f.attackFrame), sx + leanOffsetX, sy, f.facing, f.color)
      : false;
    if (!spriteRendered) {
      drawSkeletalFighter(ctx, f, sx + leanOffsetX, sy, bodyColor, outlineColor, globalTick, maxModeActive);
    }

    // Hit flash overlay
    if (f.hitFlashFrames > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'source-atop';
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = f.hitFlashColor || '#ffffff';
      ctx.fillRect(sx + leanOffsetX - 80, sy - 250, 160, 260);
      ctx.restore();
      // KOF2002: 命中闪光外发光 — 角色外围白色辉光
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.2;
      const flashGrad = ctx.createRadialGradient(
        sx + leanOffsetX, sy - f.displayHeight / 2, 5,
        sx + leanOffsetX, sy - f.displayHeight / 2, f.displayHeight * 0.8,
      );
      flashGrad.addColorStop(0, '#ffffff');
      flashGrad.addColorStop(0.4, 'rgba(255,255,255,0.3)');
      flashGrad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = flashGrad;
      ctx.fillRect(sx + leanOffsetX - 80, sy - f.displayHeight - 30, 160, f.displayHeight + 50);
      ctx.restore();
    }
    // MAX glow
    if (maxModeActive) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.15 + Math.sin(globalTick * 0.15) * 0.1;
      ctx.fillStyle = '#44ff88';
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

    ctx.restore();

    drawAttackLimb(ctx, f, sx, sy);

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

/** Resolve body/outline/glow colors from fighter state */
export function resolveFighterColors(f: Fighter, globalTick: number): { bodyColor: string; outlineColor: string; glowColor: string | null } {
  let bodyColor = f.color;
  let outlineColor = '#ffffff30';
  let glowColor: string | null = null;

  switch (f.state) {
    case FighterState.WALK:
      bodyColor = shiftColor(f.color, 12);
      break;
    case FighterState.RUN:
      bodyColor = shiftColor(f.color, 20);
      outlineColor = '#ff880050';
      glowColor = '#ff660025';
      break;
    case FighterState.BACKDASH:
      bodyColor = shiftColor(f.color, 35);
      outlineColor = '#88ccff60';
      glowColor = '#4488ff20';
      break;
    case FighterState.ROLL:
    case FighterState.BACK_ROLL:
      bodyColor = shiftColor(f.color, 40);
      outlineColor = '#44ff8860';
      glowColor = '#22ff4420';
      break;
    case FighterState.HOP:
      bodyColor = shiftColor(f.color, 15);
      break;
    case FighterState.HYPER_JUMP:
      bodyColor = shiftColor(f.color, 30);
      outlineColor = '#ff44ff50';
      glowColor = '#ff22ff25';
      break;
    case FighterState.JUMP:
    case FighterState.RUN_JUMP:
      bodyColor = shiftColor(f.color, 25);
      break;
    case FighterState.STAND_ATTACK:
    case FighterState.CROUCH_ATTACK:
    case FighterState.AIR_ATTACK:
      bodyColor = '#eebb00';
      outlineColor = '#ffcc0060';
      glowColor = '#ffaa0030';
      break;
    case FighterState.BLOCK:
    case FighterState.AIR_BLOCK:
      bodyColor = '#6688aa';
      outlineColor = '#88aaff60';
      glowColor = '#4466ff20';
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
        bodyColor = globalTick % 8 < 2 ? '#ffffff' : f.color;
        outlineColor = '#ff505070';
      }
      break;
    case FighterState.KNOCKDOWN:
      bodyColor = shiftColor(f.color, -50);
      outlineColor = '#88000040';
      break;
  }

  return { bodyColor, outlineColor, glowColor };
}

/** Draw afterimage trail for RUN/BACKDASH/ROLL */
function drawAfterimageTrail(ctx: CanvasRenderingContext2D, f: Fighter, sx: number, leanOffsetX: number): void {
  // KOF2002: 残影色渐变 — 内层亮外层暗, RUN=橙, BACKDASH=蓝, ROLL=绿
  const trailColors = f.state === FighterState.RUN
    ? ['#ff8800', '#ff6600', '#ff4400']
    : f.state === FighterState.BACKDASH
    ? ['#6699ff', '#4477ee', '#3355cc']
    : ['#44ff88', '#33dd66', '#22bb44'];
  for (let i = 1; i <= 3; i++) {
    ctx.globalAlpha = 0.3 / i;
    const trailX = sx - leanOffsetX * i * 1.5 - f.facing * 12 * i;
    const trailH = f.displayHeight - i * 4;
    // 渐变残影
    const tGrad = ctx.createLinearGradient(trailX - FIGHTER_WIDTH / 2, 0, trailX + FIGHTER_WIDTH / 2, 0);
    tGrad.addColorStop(0, 'rgba(0,0,0,0)');
    tGrad.addColorStop(0.2, trailColors[i - 1] + '60');
    tGrad.addColorStop(0.5, trailColors[i - 1] + '90');
    tGrad.addColorStop(0.8, trailColors[i - 1] + '60');
    tGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = tGrad;
    roundRect(ctx,
      trailX - FIGHTER_WIDTH / 2, f.y - f.displayHeight + i * 4,
      FIGHTER_WIDTH, trailH, 5);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
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
