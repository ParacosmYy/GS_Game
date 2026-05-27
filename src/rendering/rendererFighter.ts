/**
 * Fighter rendering — extracted from renderer.ts
 * Shadow, glow, afterimage, color resolution, sprite frame calculation
 */
import { Fighter } from '../entities/fighter.js';
import { FighterState } from '../core/types.js';
import type { MaxModeState } from '../core/types.js';
import { FIGHTER_WIDTH, STAGE_GROUND_Y } from '../core/constants.js';
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

    // Ground reflection
    if (f.isGrounded()) {
      ctx.save();
      ctx.globalAlpha = 0.06;
      ctx.translate(sx, STAGE_GROUND_Y);
      ctx.scale(1, -0.15);
      ctx.translate(-sx, -STAGE_GROUND_Y);
      drawSkeletalFighter(ctx, f, sx, f.y, getCharacterColors(f.charId ?? '').outfit, '#000000', globalTick, maxModeActive, playerIdx);
      ctx.restore();
    }

    // Lean offset (includes blend transition offset)
    let leanOffsetX = blendOffsetX;
    let leanAngle = 0;
    if (f.state === FighterState.RUN) {
      leanOffsetX = 8 * f.facing + blendOffsetX;
      leanAngle = 0.12 * f.facing;
    } else if (f.state === FighterState.BACKDASH) {
      leanOffsetX = -6 * f.facing + blendOffsetX;
      leanAngle = -0.08 * f.facing;
    } else if (f.state === FighterState.IDLE) {
      // KOF2002: 待机微弱重心偏移 — 每3秒缓慢左右移重
      leanOffsetX = Math.sin(globalTick * 0.015) * 2 * f.facing + blendOffsetX;
      leanAngle = Math.sin(globalTick * 0.015) * 0.015 * f.facing;
    } else if (f.state === FighterState.WALK) {
      // KOF2002: 前進=前傾, 後退=後傾 (defensive lean)
      const isWalkingForward = (f.vx > 0 && f.facing > 0) || (f.vx < 0 && f.facing < 0);
      if (isWalkingForward) {
        leanOffsetX = 3 * f.facing + blendOffsetX;
        leanAngle = 0.04 * f.facing;
      } else {
        leanOffsetX = -2 * f.facing + blendOffsetX;
        leanAngle = -0.03 * f.facing;
      }
    }

    // Afterimage trail
    if (f.state === FighterState.RUN || f.state === FighterState.BACKDASH
      || f.state === FighterState.ROLL || f.state === FighterState.BACK_ROLL) {
      drawAfterimageTrail(ctx, f, sx, leanOffsetX, globalTick, maxModeActive);
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



    // Hitstop defender tint - brief red overlay during freeze to show impact
    if (f.hitFlashFrames > 0 && f.state === FighterState.HITSTUN) {
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = '#ff4444';
      ctx.fillRect(-25, -f.displayHeight - 10, 50, f.displayHeight + 20);
      ctx.globalAlpha = 1.0;
    }    // Hitstun body shake — KOF2002 tiered body wobble
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


    // Knockdown ground squash — KOF2002: body compresses on landing
    if (f.state === FighterState.KNOCKDOWN && f.stateAge < 5) {
      const squashProgress = f.stateAge / 5;
      const squashY = 1 + (1 - squashProgress) * 0.2;
      const squashX = 1 - (1 - squashProgress) * 0.1;
      ctx.scale(squashX, squashY);
    }
    // Dizzy state wobble — KOF2002 unsteady sway when stunned
    if (f.state === FighterState.DIZZY) {
      const swayX = Math.sin(f.stateAge * 0.15) * 3;
      const swayY = Math.sin(f.stateAge * 0.22) * 1.5;
      ctx.translate(swayX, swayY);
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
