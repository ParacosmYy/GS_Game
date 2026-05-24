import { Fighter } from '../entities/fighter.js';
import { Projectile } from '../entities/projectile.js';
import { CommandBuffer } from '../input/commandBuffer.js';
import { Camera } from '../core/camera.js';
import { FighterState, AttackType } from '../core/types.js';
import type { PowerGauge, MaxModeState, CharacterDef } from '../core/types.js';
import { CHARACTER_ROSTER } from '../core/types.js';
import { MAX_STOCKS, MAX_MODE_DURATION } from '../core/constants.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT, STAGE_GROUND_Y, FIGHTER_WIDTH, MAX_HEALTH, FRAME_DATA } from '../core/constants.js';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private frameCount = 0;
  private fpsTime = 0;
  private currentFps = 0;
  private globalTick = 0;
  private stars: { x: number; y: number; brightness: number; speed: number }[] = [];

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    // Generate static star field
    for (let i = 0; i < 60; i++) {
      this.stars.push({
        x: Math.random() * 800,
        y: Math.random() * 300,
        brightness: 0.2 + Math.random() * 0.6,
        speed: 0.3 + Math.random() * 0.7,
      });
    }
  }

  render(fighters: Fighter[], cameraX: number, tick: number, ko: boolean, winner: number | null, shakeX: number, shakeY: number): void {
    this.frameCount++;
    this.globalTick = tick;
    const now = performance.now();
    if (now - this.fpsTime >= 1000) {
      this.currentFps = this.frameCount;
      this.frameCount = 0;
      this.fpsTime = now;
    }

    const ctx = this.ctx;
    ctx.save();
    ctx.translate(shakeX, shakeY);
    ctx.clearRect(-10, -10, CANVAS_WIDTH + 20, CANVAS_HEIGHT + 20);

    this.drawStage(ctx, cameraX);
    this.drawFighters(ctx, fighters, cameraX);
    this.drawHUD(ctx, fighters, tick);

    if (ko) {
      this.drawKO(ctx, winner);
    }

    ctx.restore();
  }

  getFps(): number {
    return this.currentFps;
  }

  // ===== Stage =====
  private drawStage(ctx: CanvasRenderingContext2D, cameraX: number): void {
    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    skyGrad.addColorStop(0, '#0a0a1a');
    skyGrad.addColorStop(0.35, '#0e0e2a');
    skyGrad.addColorStop(0.7, '#151535');
    skyGrad.addColorStop(1, '#1a1a40');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Stars (twinkling)
    for (const star of this.stars) {
      const twinkle = star.brightness * (0.6 + 0.4 * Math.sin(this.globalTick * 0.02 * star.speed + star.x));
      ctx.fillStyle = `rgba(255,255,255,${twinkle})`;
      ctx.fillRect(star.x, star.y, 1.5, 1.5);
    }

    // Distant city silhouette parallax
    ctx.fillStyle = '#0d0d20';
    const px = cameraX * 0.15;
    for (let i = 0; i < 12; i++) {
      const bx = i * 120 - (px % 120);
      const bh = 40 + Math.sin(i * 2.7) * 30;
      ctx.fillRect(bx, STAGE_GROUND_Y - bh, 50, bh);
      ctx.fillRect(bx + 60, STAGE_GROUND_Y - bh * 0.7, 40, bh * 0.7);
    }

    // Floor grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let wx = 0; wx < 1600; wx += 80) {
      const sx = wx - cameraX;
      if (sx < -10 || sx > CANVAS_WIDTH + 10) continue;
      ctx.beginPath();
      ctx.moveTo(sx, STAGE_GROUND_Y);
      ctx.lineTo(sx, CANVAS_HEIGHT);
      ctx.stroke();
    }
    // Horizontal floor lines
    for (let fy = STAGE_GROUND_Y + 30; fy < CANVAS_HEIGHT; fy += 30) {
      ctx.beginPath();
      ctx.moveTo(0, fy);
      ctx.lineTo(CANVAS_WIDTH, fy);
      ctx.stroke();
    }

    // Ground platform
    const groundGrad = ctx.createLinearGradient(0, STAGE_GROUND_Y, 0, CANVAS_HEIGHT);
    groundGrad.addColorStop(0, '#2a2a38');
    groundGrad.addColorStop(0.05, '#222230');
    groundGrad.addColorStop(1, '#16161f');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, STAGE_GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - STAGE_GROUND_Y);

    // Ground top edge glow
    const edgeGrad = ctx.createLinearGradient(0, STAGE_GROUND_Y - 3, 0, STAGE_GROUND_Y + 6);
    edgeGrad.addColorStop(0, 'rgba(80, 120, 255, 0.4)');
    edgeGrad.addColorStop(0.5, 'rgba(80, 120, 255, 0.15)');
    edgeGrad.addColorStop(1, 'rgba(80, 120, 255, 0)');
    ctx.fillStyle = edgeGrad;
    ctx.fillRect(0, STAGE_GROUND_Y - 3, CANVAS_WIDTH, 9);

    // Stage boundary indicators
    ctx.strokeStyle = 'rgba(255, 50, 50, 0.2)';
    ctx.lineWidth = 2;
    const leftEdge = -cameraX;
    const rightEdge = 1400 - cameraX;
    if (leftEdge >= 0 && leftEdge <= CANVAS_WIDTH) {
      ctx.beginPath(); ctx.moveTo(leftEdge, 80); ctx.lineTo(leftEdge, CANVAS_HEIGHT); ctx.stroke();
    }
    if (rightEdge >= 0 && rightEdge <= CANVAS_WIDTH) {
      ctx.beginPath(); ctx.moveTo(rightEdge, 80); ctx.lineTo(rightEdge, CANVAS_HEIGHT); ctx.stroke();
    }
  }

  // ===== Fighters =====
  private drawFighters(ctx: CanvasRenderingContext2D, fighters: Fighter[], cameraX: number): void {
    // Draw back fighter first
    const sorted = [...fighters].sort((a, b) => a.y - b.y);

    for (const f of sorted) {
      const sx = f.x - cameraX;
      const sy = f.y;
      const hw = FIGHTER_WIDTH / 2;
      const isP1 = f === fighters[0];

      // Shadow on ground
      const shadowScale = Math.max(0.3, 1 - (STAGE_GROUND_Y - f.y) / 200);
      ctx.fillStyle = `rgba(0, 0, 0, ${0.25 * shadowScale})`;
      ctx.beginPath();
      ctx.ellipse(sx, STAGE_GROUND_Y + 2, hw * 0.7 * shadowScale, 3 * shadowScale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Main body color based on state
      let bodyColor = f.color;
      let outlineColor = '#ffffff30';
      let glowColor: string | null = null;

      switch (f.state) {
        case FighterState.WALK:
          bodyColor = this.shiftColor(f.color, 12);
          break;
        case FighterState.RUN:
          bodyColor = this.shiftColor(f.color, 20);
          outlineColor = '#ff880050';
          glowColor = '#ff660025';
          break;
        case FighterState.BACKDASH:
          bodyColor = this.shiftColor(f.color, 35);
          outlineColor = '#88ccff60';
          glowColor = '#4488ff20';
          break;
        case FighterState.ROLL:
        case FighterState.BACK_ROLL:
          bodyColor = this.shiftColor(f.color, 40);
          outlineColor = '#44ff8860';
          glowColor = '#22ff4420';
          break;
        case FighterState.HOP:
          bodyColor = this.shiftColor(f.color, 15);
          break;
        case FighterState.HYPER_JUMP:
          bodyColor = this.shiftColor(f.color, 30);
          outlineColor = '#ff44ff50';
          glowColor = '#ff22ff25';
          break;
        case FighterState.JUMP:
        case FighterState.RUN_JUMP:
          bodyColor = this.shiftColor(f.color, 25);
          break;
        case FighterState.STAND_ATTACK:
        case FighterState.CROUCH_ATTACK:
        case FighterState.AIR_ATTACK:
          bodyColor = '#eebb00';
          outlineColor = '#ffcc0060';
          glowColor = '#ffaa0030';
          break;
        case FighterState.BLOCK:
          bodyColor = '#6688aa';
          outlineColor = '#88aaff60';
          glowColor = '#4466ff20';
          break;
        case FighterState.HITSTUN:
          bodyColor = this.globalTick % 6 < 3 ? '#ffffff' : f.color;
          outlineColor = '#ff505070';
          break;
        case FighterState.KNOCKDOWN:
          bodyColor = this.shiftColor(f.color, -50);
          outlineColor = '#88000040';
          break;
      }

      // Glow behind body
      if (glowColor) {
        ctx.fillStyle = glowColor;
        ctx.beginPath();
        ctx.ellipse(sx, sy - f.displayHeight / 2, hw + 10, f.displayHeight / 2 + 10, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Lean offset for RUN/BACKDASH
      let leanOffsetX = 0;
      let leanAngle = 0;
      if (f.state === FighterState.RUN) {
        leanOffsetX = 8 * f.facing;
        leanAngle = 0.12 * f.facing; // slight forward tilt
      } else if (f.state === FighterState.BACKDASH) {
        leanOffsetX = -6 * f.facing;
        leanAngle = -0.08 * f.facing; // slight backward tilt
      }

      // Afterimage trail for RUN/BACKDASH/ROLL
      if (f.state === FighterState.RUN || f.state === FighterState.BACKDASH
        || f.state === FighterState.ROLL || f.state === FighterState.BACK_ROLL) {
        const trailColor = f.state === FighterState.RUN
          ? `rgba(255, 140, 0, ${0.15})`
          : f.state === FighterState.BACKDASH
          ? `rgba(100, 180, 255, ${0.18})`
          : `rgba(80, 255, 140, ${0.18})`;
        for (let i = 1; i <= 3; i++) {
          ctx.globalAlpha = 0.3 / i;
          ctx.fillStyle = trailColor;
          const trailX = sx - leanOffsetX * i * 1.5 - f.facing * 12 * i;
          this.roundRect(ctx,
            trailX - hw, sy - f.displayHeight + i * 4,
            FIGHTER_WIDTH, f.displayHeight - i * 4, 5);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      ctx.save();
      ctx.translate(sx + leanOffsetX, sy);
      ctx.rotate(leanAngle);
      ctx.translate(-(sx + leanOffsetX), -sy);

      // Body with gradient
      const bodyGrad = ctx.createLinearGradient(sx + leanOffsetX - hw, sy - f.displayHeight, sx + leanOffsetX + hw, sy);
      bodyGrad.addColorStop(0, this.shiftColor(bodyColor, 25));
      bodyGrad.addColorStop(0.5, bodyColor);
      bodyGrad.addColorStop(1, this.shiftColor(bodyColor, -10));
      ctx.fillStyle = bodyGrad;
      this.roundRect(ctx, sx + leanOffsetX - hw, sy - f.displayHeight, FIGHTER_WIDTH, f.displayHeight, 5);
      ctx.fill();

      // Outline
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = 2;
      this.roundRect(ctx, sx + leanOffsetX - hw, sy - f.displayHeight, FIGHTER_WIDTH, f.displayHeight, 5);
      ctx.stroke();

      // Head section (top 30% of body)
      const headY = sy - f.displayHeight;
      const headH = f.displayHeight * 0.3;
      const headGrad = ctx.createLinearGradient(sx + leanOffsetX - hw, headY, sx + leanOffsetX + hw, headY + headH);
      headGrad.addColorStop(0, this.shiftColor(bodyColor, 35));
      headGrad.addColorStop(1, this.shiftColor(bodyColor, 10));
      ctx.fillStyle = headGrad;
      this.roundRect(ctx, sx + leanOffsetX - hw, headY, FIGHTER_WIDTH, headH, 5);
      ctx.fill();

      // Eyes (facing indicator)
      const eyeBaseX = sx + leanOffsetX + 8 * f.facing;
      const eyeY = headY + headH * 0.55;
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(eyeBaseX, eyeY, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(eyeBaseX - 10 * f.facing, eyeY, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#111';
      ctx.beginPath(); ctx.arc(eyeBaseX + 1.5 * f.facing, eyeY, 2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(eyeBaseX - 10 * f.facing + 1.5 * f.facing, eyeY, 2, 0, Math.PI * 2); ctx.fill();

      ctx.restore();

      // Attack limb extension
      this.drawAttackLimb(ctx, f, sx, sy, cameraX);

      // Player label
      ctx.fillStyle = isP1 ? '#ff5555' : '#5599ff';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(isP1 ? 'P1' : 'P2', sx, sy - f.displayHeight - 8);
      ctx.textAlign = 'left';
    }
  }

  /** Draw extended arm/leg during attack active phase */
  private drawAttackLimb(ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number, cameraX: number): void {
    if (f.attackPhase !== 'active' || !f.currentAttack) return;

    const data = FRAME_DATA[f.currentAttack as keyof typeof FRAME_DATA];
    const progress = f.attackFrame / (data?.active || 5);
    const name = f.currentAttack as string;

    // Determine punch (A/C) vs kick (B/D) for limb color and style
    const isPunch = name.endsWith('_A') || name.endsWith('_C')
      || f.currentAttack === AttackType.SPECIAL_PROJECTILE
      || f.currentAttack === AttackType.SPECIAL_UPPER
      || f.currentAttack === AttackType.KYO_ARAGAMI
      || f.currentAttack === AttackType.KYO_ARAGAMI_KONOKIZU
      || f.currentAttack === AttackType.KYO_ARAGAMI_YANOSABI
      || f.currentAttack === AttackType.KYO_DOKUGAMI
      || f.currentAttack === AttackType.KYO_TSUMIYOMI
      || f.currentAttack === AttackType.KYO_BATSUYOMI;
    const isHeavy = name.endsWith('_C') || name.endsWith('_D')
      || f.currentAttack === AttackType.STAND_CD
      || f.currentAttack === AttackType.KYO_RED_KICK;

    const isFireMove = name.startsWith('KYO_') || f.currentAttack === AttackType.DM_OROCHINAGI;

    const limbLen = isHeavy ? 42 : 35;
    const limbWidth = isHeavy ? 10 : 8;

    ctx.save();
    if (isFireMove) {
      // Fire-themed limbs for Kyo specials
      ctx.strokeStyle = isPunch ? '#ff6622' : '#ff4400';
      ctx.lineWidth = limbWidth + 4;
      ctx.lineCap = 'round';
      ctx.shadowColor = '#ff4400';
      ctx.shadowBlur = 18;
    } else {
      ctx.strokeStyle = isPunch ? '#ffdd44' : '#44ddff';
      ctx.lineWidth = limbWidth;
      ctx.lineCap = 'round';
      ctx.shadowColor = isPunch ? '#ffaa00' : '#00aaff';
      ctx.shadowBlur = 8;
    }

    if (name.startsWith('CLOSE')) {
      // Close-range attacks: short, fast limbs
      const reach = limbLen * 0.5 * (0.6 + progress * 0.4);
      if (isPunch) {
        ctx.beginPath();
        ctx.moveTo(sx + 8 * f.facing, sy - f.displayHeight * 0.6);
        ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.6);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.35);
        ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.25);
        ctx.stroke();
      }
    } else if (name.startsWith('STAND')) {
      // Standing attack
      if (isPunch) {
        const reach = limbLen * (0.5 + progress * 0.5);
        ctx.beginPath();
        ctx.moveTo(sx + 10 * f.facing, sy - f.displayHeight * 0.6);
        ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.6);
        ctx.stroke();
      } else {
        // Kick: extends from hip, angles slightly down
        const reach = limbLen * (0.5 + progress * 0.5);
        ctx.beginPath();
        ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.35);
        ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.25);
        ctx.stroke();
      }
    } else if (name.startsWith('CROUCH')) {
      if (isPunch) {
        const reach = limbLen * 0.8;
        ctx.beginPath();
        ctx.moveTo(sx + 5 * f.facing, sy - 10);
        ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - 5);
        ctx.stroke();
      } else {
        // Low kick: sweeps low
        const reach = limbLen * 0.9;
        ctx.beginPath();
        ctx.moveTo(sx + 5 * f.facing, sy - 8);
        ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - 3);
        ctx.stroke();
      }
    } else if (name.startsWith('JUMP')) {
      const reach = limbLen * 0.7;
      if (isPunch) {
        ctx.beginPath();
        ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.3);
        ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.4);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.25);
        ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.1);
        ctx.stroke();
      }
    } else if (f.currentAttack === AttackType.CMD_NARAKU) {
      // 奈落落とし: downward air punch
      ctx.strokeStyle = '#ffaa22';
      ctx.shadowColor = '#ff6600';
      ctx.lineWidth = 12;
      const reach = limbLen * 1.0;
      ctx.beginPath();
      ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.3);
      ctx.lineTo(sx + 5 * f.facing, sy - f.displayHeight * 0.3 + reach);
      ctx.stroke();
    } else if (f.currentAttack === AttackType.CMD_GOFU_YOU) {
      // 轟斧陽: high overhead kick
      ctx.strokeStyle = '#44ddff';
      ctx.shadowColor = '#00aaff';
      const reach = limbLen * 1.0;
      ctx.beginPath();
      ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.5);
      ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.7);
      ctx.stroke();
    } else if (f.currentAttack === AttackType.CMD_88SHIKI) {
      // 八拾八式: low two-hit sweep
      ctx.strokeStyle = '#44ddff';
      ctx.shadowColor = '#00aaff';
      ctx.lineWidth = 10;
      const reach = limbLen * 1.1;
      ctx.beginPath();
      ctx.moveTo(sx + 5 * f.facing, sy - 8);
      ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - 2);
      ctx.stroke();
    } else if (f.currentAttack === AttackType.KYO_75KAI || f.currentAttack === AttackType.KYO_75KAI_2) {
      // 75式改: forward kick combo
      const reach = limbLen * (f.currentAttack === AttackType.KYO_75KAI_2 ? 1.2 : 1.0);
      ctx.strokeStyle = '#ff4400';
      ctx.shadowColor = '#ff6600';
      ctx.shadowBlur = 14;
      ctx.lineWidth = f.currentAttack === AttackType.KYO_75KAI_2 ? 12 : 10;
      ctx.beginPath();
      ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.35);
      ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.25);
      ctx.stroke();
    } else if (f.currentAttack === AttackType.KYO_RED_KICK) {
      // R.E.D. Kick: high overhead flame kick
      ctx.strokeStyle = '#ff4400';
      ctx.shadowColor = '#ff2200';
      ctx.shadowBlur = 16;
      ctx.lineWidth = 12;
      const reach = limbLen * 1.3;
      ctx.beginPath();
      ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.4);
      ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.65);
      ctx.stroke();
    } else if (f.currentAttack === AttackType.KYO_ARAGAMI
      || f.currentAttack === AttackType.KYO_DOKUGAMI) {
      // 荒咬み/毒咬み: flame fist forward
      const reach = limbLen * 1.1;
      ctx.strokeStyle = '#ff6622';
      ctx.shadowColor = '#ff4400';
      ctx.shadowBlur = 16;
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.moveTo(sx + 10 * f.facing, sy - f.displayHeight * 0.6);
      ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.55);
      ctx.stroke();
      // Fire burst at fist
      ctx.fillStyle = '#ffaa0088';
      ctx.beginPath();
      ctx.arc(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.55,
        8 + progress * 6, 0, Math.PI * 2);
      ctx.fill();
    } else if (f.currentAttack === AttackType.KYO_ARAGAMI_KONOKIZU) {
      // 九傷: flame uppercut followup
      const reach = limbLen * 1.2;
      ctx.strokeStyle = '#ff8822';
      ctx.shadowColor = '#ff4400';
      ctx.lineWidth = 11;
      ctx.beginPath();
      ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.5);
      ctx.lineTo(sx + 10 * f.facing, sy - f.displayHeight * 0.5 - reach);
      ctx.stroke();
    } else if (f.currentAttack === AttackType.KYO_ARAGAMI_YANOSABI) {
      // 八錆: overhead flame slam
      ctx.strokeStyle = '#ff4400';
      ctx.shadowColor = '#ff2200';
      ctx.shadowBlur = 20;
      ctx.lineWidth = 14;
      const reach = limbLen * 1.3;
      ctx.beginPath();
      ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.7);
      ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.35);
      ctx.stroke();
    } else if (f.currentAttack === AttackType.KYO_TSUMIYOMI) {
      // 罪詠み: flame backhand
      const reach = limbLen * 1.0;
      ctx.strokeStyle = '#ff6622';
      ctx.shadowColor = '#ff4400';
      ctx.lineWidth = 11;
      ctx.beginPath();
      ctx.moveTo(sx + 10 * f.facing, sy - f.displayHeight * 0.55);
      ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.5);
      ctx.stroke();
    } else if (f.currentAttack === AttackType.KYO_BATSUYOMI) {
      // 罰詠み: flame uppercut finisher
      ctx.strokeStyle = '#ff4400';
      ctx.shadowColor = '#ff2200';
      ctx.shadowBlur = 20;
      ctx.lineWidth = 14;
      const reach = limbLen * 1.4;
      ctx.beginPath();
      ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.5);
      ctx.lineTo(sx + 10 * f.facing, sy - f.displayHeight * 0.5 - reach);
      ctx.stroke();
      // Fire explosion at top
      ctx.fillStyle = '#ffaa0066';
      ctx.beginPath();
      ctx.arc(sx + 10 * f.facing, sy - f.displayHeight * 0.5 - reach,
        12 + progress * 8, 0, Math.PI * 2);
      ctx.fill();
    } else if (f.currentAttack === AttackType.SPECIAL_UPPER) {
      const reach = limbLen * 1.2;
      ctx.beginPath();
      ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.5);
      ctx.lineTo(sx + 10 * f.facing, sy - f.displayHeight * 0.5 - reach);
      ctx.stroke();
    } else if (f.currentAttack === AttackType.SPECIAL_PROJECTILE) {
      const reach = limbLen * 0.6;
      ctx.beginPath();
      ctx.moveTo(sx + 10 * f.facing, sy - f.displayHeight * 0.55);
      ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.55);
      ctx.stroke();
    } else if (f.currentAttack === AttackType.STAND_CD || f.currentAttack === AttackType.JUMP_CD) {
      // CD blowback: big sweeping hit
      ctx.strokeStyle = '#ff4444';
      ctx.shadowColor = '#ff2222';
      ctx.lineWidth = 12;
      const reach = limbLen * 1.1;
      ctx.beginPath();
      ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.45);
      ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.35);
      ctx.stroke();
    } else if (f.currentAttack === AttackType.DM_OROCHINAGI) {
      // DM大蛇薙: 巨大火焰
      ctx.strokeStyle = '#ff4400';
      ctx.shadowColor = '#ff6600';
      ctx.shadowBlur = 20;
      ctx.lineWidth = 14;
      const reach = limbLen * 1.5;
      ctx.beginPath();
      ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.55);
      ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.45);
      ctx.stroke();
      // Extra flame arc
      ctx.strokeStyle = '#ffaa00';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(sx + (FIGHTER_WIDTH / 2 + reach * 0.7) * f.facing, sy - f.displayHeight * 0.5,
        15 * (0.5 + progress * 0.5), 0, Math.PI * 2);
      ctx.stroke();
    } else if (f.currentAttack === AttackType.THROW) {
      ctx.strokeStyle = '#ff8844';
      ctx.beginPath();
      ctx.moveTo(sx + 10 * f.facing, sy - f.displayHeight * 0.5);
      ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + 20) * f.facing, sy - f.displayHeight * 0.5);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ===== HUD =====
  private drawHUD(ctx: CanvasRenderingContext2D, fighters: Fighter[], tick: number): void {
    if (fighters.length < 2) return;

    const barWidth = 300;
    const barHeight = 20;
    const barY = 30;
    const margin = 50;

    // HUD background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, 56);

    // Decorative top border line
    const borderGrad = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, 0);
    borderGrad.addColorStop(0, '#cc222200');
    borderGrad.addColorStop(0.3, '#cc222288');
    borderGrad.addColorStop(0.5, '#ffffff44');
    borderGrad.addColorStop(0.7, '#2244cc88');
    borderGrad.addColorStop(1, '#2244cc00');
    ctx.strokeStyle = borderGrad;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, 56); ctx.lineTo(CANVAS_WIDTH, 56); ctx.stroke();

    // P1 label
    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('P1', 10, barY - 8);

    // P1 health bar
    const p1Ratio = Math.max(0, fighters[0].health / MAX_HEALTH);
    this.drawHealthBar(ctx, margin, barY, barWidth, barHeight, p1Ratio, true);

    // P2 label
    ctx.fillStyle = '#4488ff';
    ctx.textAlign = 'right';
    ctx.fillText('P2', CANVAS_WIDTH - 10, barY - 8);

    // P2 health bar
    const p2Ratio = Math.max(0, fighters[1].health / MAX_HEALTH);
    this.drawHealthBar(ctx, CANVAS_WIDTH - margin - barWidth, barY, barWidth, barHeight, p2Ratio, false);

    // Timer in center
    const timeSeconds = Math.max(0, 99 - Math.floor(tick / 60));
    const timeStr = timeSeconds.toString().padStart(2, '0');
    ctx.fillStyle = timeSeconds <= 10 ? '#ff4444' : '#dddddd';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(timeStr, CANVAS_WIDTH / 2, barY + 8);
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
  }

  private drawHealthBar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, ratio: number, leftAligned: boolean): void {
    // Outer frame
    ctx.fillStyle = '#0a0a0f';
    this.roundRect(ctx, x - 2, y - 2, w + 4, h + 4, 4);
    ctx.fill();

    // Inner background
    ctx.fillStyle = '#1a1a22';
    this.roundRect(ctx, x, y, w, h, 3);
    ctx.fill();

    // Tick marks
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let t = 0.25; t < 1; t += 0.25) {
      const tx = leftAligned ? x + w * t : x + w * (1 - t);
      ctx.beginPath(); ctx.moveTo(tx, y); ctx.lineTo(tx, y + h); ctx.stroke();
    }

    // Health fill
    const fillW = w * ratio;
    if (fillW <= 0) return;

    const healthColor = ratio > 0.5 ? '#22cc55' : ratio > 0.25 ? '#ccaa22' : '#cc2233';
    const healthGrad = ctx.createLinearGradient(x, y, x, y + h);
    healthGrad.addColorStop(0, this.shiftColor(healthColor, 40));
    healthGrad.addColorStop(0.5, healthColor);
    healthGrad.addColorStop(1, this.shiftColor(healthColor, -20));

    ctx.fillStyle = healthGrad;
    if (leftAligned) {
      this.roundRect(ctx, x, y, fillW, h, 3);
      ctx.fill();
    } else {
      this.roundRect(ctx, x + w - fillW, y, fillW, h, 3);
      ctx.fill();
    }

    // Shine highlight
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    const shineW = Math.max(0, fillW - 6);
    if (shineW > 0) {
      if (leftAligned) {
        ctx.fillRect(x + 3, y + 2, shineW, 3);
      } else {
        ctx.fillRect(x + w - fillW + 3, y + 2, shineW, 3);
      }
    }

    // Border
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    this.roundRect(ctx, x, y, w, h, 3);
    ctx.stroke();
  }

  // ===== KO Text =====
  private drawKO(ctx: CanvasRenderingContext2D, winner: number | null): void {
    ctx.save();

    // Dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // KO text
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 40;
    ctx.fillStyle = '#ff2200';
    ctx.font = 'bold 100px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('K.O.!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
    ctx.shadowBlur = 0;

    // Winner announcement
    if (winner !== null) {
      ctx.fillStyle = winner === 0 ? '#ff6644' : '#4488ff';
      ctx.font = 'bold 28px monospace';
      ctx.fillText(`P${winner + 1} WINS`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
    } else {
      ctx.fillStyle = '#ffcc00';
      ctx.font = 'bold 28px monospace';
      ctx.fillText('DOUBLE KO', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
    }

    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '14px monospace';
    ctx.fillText('Press R to restart', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 90);

    ctx.restore();
  }

  // ===== Helpers =====
  private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  private shiftColor(color: string, amount: number): string {
    const { r, g, b } = this.parseColor(color);
    const nr = Math.min(255, Math.max(0, r + amount));
    const ng = Math.min(255, Math.max(0, g + amount));
    const nb = Math.min(255, Math.max(0, b + amount));
    return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
  }

  private parseColor(color: string): { r: number; g: number; b: number } {
    if (color.startsWith('#')) {
      return {
        r: parseInt(color.slice(1, 3), 16),
        g: parseInt(color.slice(3, 5), 16),
        b: parseInt(color.slice(5, 7), 16),
      };
    }
    if (color.startsWith('rgba(') || color.startsWith('rgb(')) {
      const m = color.match(/(\d+)/g);
      return m ? { r: +m[0], g: +m[1], b: +m[2] } : { r: 128, g: 128, b: 128 };
    }
    return { r: 128, g: 128, b: 128 };
  }

  // ===== Projectile Rendering =====
  drawProjectiles(projectiles: Projectile[], camera: Camera): void {
    const ctx = this.ctx;
    for (const proj of projectiles) {
      if (!proj.active) continue;
      const sx = camera.worldToScreen(proj.x);
      ctx.save();
      ctx.shadowColor = '#ff8800';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#ffaa22';
      ctx.beginPath();
      ctx.arc(sx, proj.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#fff8e0';
      ctx.beginPath();
      ctx.arc(sx, proj.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,170,0,0.3)';
      ctx.beginPath();
      ctx.arc(sx - proj.facing * 12, proj.y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // ===== Intro Overlay =====
  drawIntro(phaseTimer: number): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (phaseTimer < 60) {
      const progress = phaseTimer / 60;
      const scale = 1 + Math.max(0, 1 - progress * 3) * 0.5;
      ctx.globalAlpha = Math.min(1, progress * 4);
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.round(40 * scale)}px monospace`;
      ctx.fillText('ROUND 1', 400, 260);
    } else if (phaseTimer < 100) {
      const fp = (phaseTimer - 60) / 40;
      const scale = 1 + Math.max(0, 1 - fp * 4) * 1.5;
      const alpha = fp < 0.1 ? fp * 10 : Math.max(0, 1 - (fp - 0.5) * 2);
      ctx.globalAlpha = Math.min(1, Math.max(0, alpha));
      ctx.shadowColor = '#ff4400';
      ctx.shadowBlur = 20;
      ctx.fillStyle = '#ff4400';
      ctx.font = `bold ${Math.round(60 * scale)}px monospace`;
      ctx.fillText('FIGHT!', 400, 300);
    }

    ctx.restore();
  }

  // ===== Combo Counters =====
  drawComboCounters(
    fighters: Fighter[],
    comboCount: number[],
    comboTimer: number[],
    camera: Camera,
  ): void {
    const ctx = this.ctx;
    ctx.save();
    for (let i = 0; i < 2; i++) {
      if (comboCount[i] < 2) continue;
      const f = fighters[i];
      const sx = camera.worldToScreen(f.x);
      const sy = f.y - f.displayHeight - 30;
      const alpha = Math.min(1, comboTimer[i] < 30 ? 1 : 1 - (comboTimer[i] - 30) / 30);
      if (alpha <= 0) continue;

      ctx.globalAlpha = alpha;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffcc00';
      ctx.shadowColor = '#ff8800';
      ctx.shadowBlur = 8;
      ctx.font = `bold ${16 + Math.min(comboCount[i], 10)}px monospace`;
      ctx.fillText(`${comboCount[i]} COMBO`, sx, sy);
      ctx.shadowBlur = 0;
    }
    ctx.restore();
  }

  // ===== Debug Overlay =====
  drawDebug(
    fighters: Fighter[],
    projectiles: Projectile[],
    camera: Camera,
    tick: number,
    fps: number,
    vfxCount: number,
    cmdBufs: CommandBuffer[],
  ): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = 0.88;
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, 310, 220);
    ctx.globalAlpha = 1;
    ctx.font = '10px monospace';

    let y = 13;
    for (let i = 0; i < 2; i++) {
      const f = fighters[i];
      ctx.fillStyle = i === 0 ? '#ff5555' : '#5599ff';
      ctx.fillText(`P${i + 1} ────────────────────────`, 4, y); y += 13;
      ctx.fillStyle = '#ccc';
      ctx.fillText(` ${f.state}  hp:${f.health}  (${Math.round(f.x)},${Math.round(f.y)}) ${f.facing === 1 ? '→' : '←'}`, 4, y); y += 13;
      ctx.fillText(` vx:${f.vx.toFixed(1)} vy:${f.vy.toFixed(1)} gnd:${f.isGrounded()}`, 4, y); y += 13;
      if (f.currentAttack) {
        ctx.fillStyle = '#ffcc00';
        const d = FRAME_DATA[f.currentAttack];
        ctx.fillText(` ${f.currentAttack} [${f.attackPhase}] ${f.attackFrame}f dmg:${d.damage}`, 4, y); y += 13;
        const total = d.startup + d.active + d.recovery;
        const prog = f.attackPhase === 'startup' ? f.attackFrame / total
          : f.attackPhase === 'active' ? (d.startup + f.attackFrame) / total
          : (d.startup + d.active + f.attackFrame) / total;
        ctx.fillStyle = '#333'; ctx.fillRect(8, y, 200, 5);
        ctx.fillStyle = '#ccaa00'; ctx.fillRect(8, y, 200 * d.startup / total, 5);
        ctx.fillStyle = '#cc2200'; ctx.fillRect(8 + 200 * d.startup / total, y, 200 * d.active / total, 5);
        ctx.fillStyle = '#2244aa'; ctx.fillRect(8 + 200 * (d.startup + d.active) / total, y, 200 * d.recovery / total, 5);
        ctx.fillStyle = '#fff'; ctx.fillRect(8 + 200 * prog - 1, y - 1, 3, 7);
        y += 10;
      }
      if (f.hitstunTimer > 0) { ctx.fillStyle = '#ff8888'; ctx.fillText(` hitstun:${f.hitstunTimer}`, 4, y); y += 13; }
      if (f.blockstunTimer > 0) { ctx.fillStyle = '#8888ff'; ctx.fillText(` blockstun:${f.blockstunTimer}`, 4, y); y += 13; }
    }
    ctx.fillStyle = '#0f0';
    ctx.fillText(`tick:${tick} fps:${fps} proj:${projectiles.length} vfx:${vfxCount}`, 4, y);

    // Collision boxes
    for (const f of fighters) {
      const hitbox = f.getActiveHitbox();
      if (hitbox) {
        ctx.fillStyle = 'rgba(255,0,0,0.2)'; ctx.fillRect(hitbox.x - camera.x, hitbox.y, hitbox.width, hitbox.height);
        ctx.strokeStyle = 'rgba(255,0,0,0.7)'; ctx.lineWidth = 2; ctx.strokeRect(hitbox.x - camera.x, hitbox.y, hitbox.width, hitbox.height);
      }
      const hb = f.getHurtbox();
      ctx.strokeStyle = 'rgba(0,100,255,0.5)'; ctx.lineWidth = 1; ctx.strokeRect(hb.x - camera.x, hb.y, hb.width, hb.height);
      const pb = f.getPushbox();
      ctx.strokeStyle = 'rgba(0,255,0,0.3)'; ctx.setLineDash([3, 3]); ctx.strokeRect(pb.x - camera.x, pb.y, pb.width, pb.height); ctx.setLineDash([]);
      const sx = camera.worldToScreen(f.x);
      ctx.fillStyle = '#fff'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
      ctx.fillText(f.state, sx, f.y - f.displayHeight - 18);
      ctx.textAlign = 'left';
    }

    // Input buffer
    ctx.globalAlpha = 0.88;
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(560, 0, 240, 110);
    ctx.globalAlpha = 1;
    ctx.font = '9px monospace';
    const symbols: Record<string, string> = { 'neutral': '·', 'up': '↑', 'down': '↓', 'forward': '→', 'back': '←', 'upforward': '↗', 'upback': '↖', 'downforward': '↘', 'downback': '↙' };
    for (let i = 0; i < 2; i++) {
      const buf = cmdBufs[i];
      const py = 13 + i * 48;
      ctx.fillStyle = i === 0 ? '#ff5555' : '#5599ff';
      ctx.fillText(`P${i + 1} Buffer:`, 564, py);
      const hist = buf.getRecentHistory(10);
      ctx.fillStyle = '#aaa';
      ctx.fillText(' ' + hist.map(h => symbols[h.direction] || '?').join(' '), 564, py + 12);
      ctx.fillStyle = '#555';
      ctx.fillText(' ages:' + hist.map(h => tick - h.frame).join(','), 564, py + 24);
    }
    ctx.restore();
  }

  // ===== Controls Hint =====
  drawControlsHint(): void {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('P1: WASD+J/K/U/I/L  P2: Arrows+Np1/2/3/0/.  A+B:Roll  C+D:CD  B+C:MAX  R:Restart  F1:Debug', 400, 596);
    ctx.textAlign = 'left';
  }

  // ===== Power Gauge UI =====
  drawPowerGauges(gauges: [PowerGauge, PowerGauge], maxModes: [MaxModeState, MaxModeState]): void {
    const ctx = this.ctx;
    const gaugeY = 50;
    const stockW = 30;
    const stockH = 6;
    const stockGap = 3;

    for (let p = 0; p < 2; p++) {
      const gauge = gauges[p];
      const maxMode = maxModes[p];
      const isP1 = p === 0;
      const baseX = isP1 ? 50 : CANVAS_WIDTH - 50 - MAX_STOCKS * (stockW + stockGap);

      // Draw stocks
      for (let s = 0; s < MAX_STOCKS; s++) {
        const x = baseX + s * (stockW + stockGap);
        const filled = s < gauge.stocks;

        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(x, gaugeY, stockW, stockH);

        if (filled) {
          const stockGrad = ctx.createLinearGradient(x, gaugeY, x + stockW, gaugeY);
          stockGrad.addColorStop(0, '#ffaa00');
          stockGrad.addColorStop(1, '#ff6600');
          ctx.fillStyle = stockGrad;
          ctx.fillRect(x, gaugeY, stockW, stockH);
        } else if (s === gauge.stocks && gauge.meter > 0) {
          // Partial fill for current charging stock
          const fillW = (gauge.meter / gauge.maxMeter) * stockW;
          const partialGrad = ctx.createLinearGradient(x, gaugeY, x + fillW, gaugeY);
          partialGrad.addColorStop(0, '#4488ff');
          partialGrad.addColorStop(1, '#2266dd');
          ctx.fillStyle = partialGrad;
          ctx.fillRect(x, gaugeY, fillW, stockH);
        }

        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, gaugeY, stockW, stockH);
      }

      // MAX mode indicator
      if (maxMode.active) {
        const maxBaseX = isP1 ? 50 : CANVAS_WIDTH - 50 - 60;
        const pct = maxMode.timer / maxMode.maxDuration;
        ctx.fillStyle = 'rgba(255, 100, 255, 0.8)';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = isP1 ? 'left' : 'right';
        ctx.fillText('MAX', isP1 ? maxBaseX : maxBaseX + 60, gaugeY + 16);

        // Timer bar
        const timerX = isP1 ? maxBaseX + 32 : maxBaseX;
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(timerX, gaugeY + 10, 60, 4);
        ctx.fillStyle = `rgba(255, ${Math.round(100 + 155 * pct)}, 255, 0.8)`;
        ctx.fillRect(timerX, gaugeY + 10, 60 * pct, 4);
        ctx.textAlign = 'left';
      }
    }
  }

  // ===== Character Select Screen =====
  drawCharacterSelect(
    p1Cursor: number,
    p2Cursor: number,
    p1Ready: boolean,
    p2Ready: boolean,
    tick: number,
  ): void {
    const ctx = this.ctx;
    ctx.save();

    // Dark background
    ctx.fillStyle = '#0a0a12';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Animated background grid
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 20; i++) {
      const yOff = (tick * 0.5 + i * 35) % (CANVAS_HEIGHT + 50) - 25;
      ctx.beginPath();
      ctx.moveTo(0, yOff);
      ctx.lineTo(CANVAS_WIDTH, yOff);
      ctx.stroke();
    }

    // Title
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffcc00';
    ctx.shadowColor = '#ff8800';
    ctx.shadowBlur = 12;
    ctx.font = 'bold 32px monospace';
    ctx.fillText('SELECT CHARACTER', 400, 50);
    ctx.shadowBlur = 0;

    // Subtitle
    ctx.fillStyle = '#888';
    ctx.font = '12px monospace';
    ctx.fillText('P1: A/D选择  J确认  |  P2: ←/→选择  Numpad1确认', 400, 80);

    // Character cards
    const cols = CHARACTER_ROSTER.length;
    const cardW = 140;
    const cardH = 200;
    const gap = 20;
    const totalW = cols * cardW + (cols - 1) * gap;
    const startX = (CANVAS_WIDTH - totalW) / 2;
    const startY = 140;

    for (let i = 0; i < cols; i++) {
      const char = CHARACTER_ROSTER[i];
      const cx = startX + i * (cardW + gap);
      const cy = startY;

      const isP1Here = p1Cursor === i;
      const isP2Here = p2Cursor === i;

      // Card background
      ctx.fillStyle = '#141420';
      this.roundRect(ctx, cx, cy, cardW, cardH, 8);
      ctx.fill();

      // Selection highlight
      if (isP1Here || isP2Here) {
        ctx.strokeStyle = p1Ready && isP1Here ? '#ffcc00' : isP1Here ? '#ff4444' : 'transparent';
        ctx.lineWidth = 3;
        if (isP1Here) {
          this.roundRect(ctx, cx - 2, cy - 2, cardW + 4, cardH / 2 + 4, 8);
          ctx.stroke();
        }
        ctx.strokeStyle = p2Ready && isP2Here ? '#ffcc00' : isP2Here ? '#4488ff' : 'transparent';
        ctx.lineWidth = 3;
        if (isP2Here) {
          this.roundRect(ctx, cx - 2, cy + cardH / 2 - 4, cardW + 4, cardH / 2 + 8, 8);
          ctx.stroke();
        }
      }

      // Character portrait area
      const portraitY = cy + 15;
      ctx.fillStyle = '#1a1a2a';
      this.roundRect(ctx, cx + 15, portraitY, cardW - 30, 80, 6);
      ctx.fill();

      // Character color preview block
      const charGrad = ctx.createLinearGradient(cx + 20, portraitY + 5, cx + cardW - 20, portraitY + 75);
      charGrad.addColorStop(0, char.color);
      charGrad.addColorStop(1, char.accentColor);
      ctx.fillStyle = charGrad;
      this.roundRect(ctx, cx + 20, portraitY + 5, cardW - 40, 70, 4);
      ctx.fill();

      // Portrait emoji
      ctx.font = '40px serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.fillText(char.portrait, cx + cardW / 2, portraitY + 48);

      // Character name
      ctx.font = 'bold 16px monospace';
      ctx.fillStyle = '#fff';
      ctx.fillText(char.nameCn, cx + cardW / 2, cy + 120);
      ctx.font = '10px monospace';
      ctx.fillStyle = '#888';
      ctx.fillText(char.name, cx + cardW / 2, cy + 138);

      // Ready indicator
      if ((p1Ready && isP1Here) || (p2Ready && isP2Here)) {
        ctx.font = 'bold 14px monospace';
        ctx.fillStyle = '#ffcc00';
        const label = p1Ready && isP1Here ? 'P1 OK!' : 'P2 OK!';
        ctx.fillText(label, cx + cardW / 2, cy + cardH - 25);
      }

      // Animated pulse for selected
      if (isP1Here || isP2Here) {
        const pulse = 0.3 + Math.sin(tick * 0.1) * 0.15;
        ctx.strokeStyle = isP1Here
          ? `rgba(255, 68, 68, ${pulse})`
          : `rgba(68, 136, 255, ${pulse})`;
        ctx.lineWidth = 2;
        this.roundRect(ctx, cx - 4, cy - 4, cardW + 8, cardH + 8, 10);
        ctx.stroke();
      }
    }

    // Player status at bottom
    const bottomY = 400;
    // P1 side
    const p1Char = CHARACTER_ROSTER[p1Cursor];
    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('P1', 50, bottomY);
    ctx.fillStyle = p1Char.color;
    ctx.font = 'bold 22px monospace';
    ctx.fillText(p1Char.nameCn, 50, bottomY + 28);
    ctx.fillStyle = p1Ready ? '#ffcc00' : '#888';
    ctx.font = '13px monospace';
    ctx.fillText(p1Ready ? 'READY!' : 'Press J to confirm', 50, bottomY + 52);

    // P2 side
    const p2Char = CHARACTER_ROSTER[p2Cursor];
    ctx.fillStyle = '#4488ff';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('P2', 750, bottomY);
    ctx.fillStyle = p2Char.color;
    ctx.font = 'bold 22px monospace';
    ctx.fillText(p2Char.nameCn, 750, bottomY + 28);
    ctx.fillStyle = p2Ready ? '#ffcc00' : '#888';
    ctx.font = '13px monospace';
    ctx.fillText(p2Ready ? 'READY!' : 'Numpad1 to confirm', 750, bottomY + 52);

    // VS in center
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff20';
    ctx.font = 'bold 48px monospace';
    ctx.fillText('VS', 400, bottomY + 30);

    // Start hint
    if (p1Ready && p2Ready) {
      const blink = Math.sin(tick * 0.15) > 0;
      if (blink) {
        ctx.fillStyle = '#ffcc00';
        ctx.font = 'bold 18px monospace';
        ctx.fillText('GAME START!', 400, 530);
      }
    }

    ctx.textAlign = 'left';
    ctx.restore();
  }
}
