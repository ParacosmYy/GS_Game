import { Fighter } from '../entities/fighter.js';
import { FighterState, AttackType } from '../core/types.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT, STAGE_GROUND_Y, FIGHTER_WIDTH, MAX_HEALTH, FRAME_DATA } from '../core/constants.js';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private frameCount = 0;
  private fpsTime = 0;
  private currentFps = 0;
  private globalTick = 0;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
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
        case FighterState.JUMP:
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

      // Body with gradient
      const bodyGrad = ctx.createLinearGradient(sx - hw, sy - f.displayHeight, sx + hw, sy);
      bodyGrad.addColorStop(0, this.shiftColor(bodyColor, 25));
      bodyGrad.addColorStop(0.5, bodyColor);
      bodyGrad.addColorStop(1, this.shiftColor(bodyColor, -10));
      ctx.fillStyle = bodyGrad;
      this.roundRect(ctx, sx - hw, sy - f.displayHeight, FIGHTER_WIDTH, f.displayHeight, 5);
      ctx.fill();

      // Outline
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = 2;
      this.roundRect(ctx, sx - hw, sy - f.displayHeight, FIGHTER_WIDTH, f.displayHeight, 5);
      ctx.stroke();

      // Head section (top 30% of body)
      const headY = sy - f.displayHeight;
      const headH = f.displayHeight * 0.3;
      const headGrad = ctx.createLinearGradient(sx - hw, headY, sx + hw, headY + headH);
      headGrad.addColorStop(0, this.shiftColor(bodyColor, 35));
      headGrad.addColorStop(1, this.shiftColor(bodyColor, 10));
      ctx.fillStyle = headGrad;
      this.roundRect(ctx, sx - hw, headY, FIGHTER_WIDTH, headH, 5);
      ctx.fill();

      // Eyes (facing indicator)
      const eyeBaseX = sx + 8 * f.facing;
      const eyeY = headY + headH * 0.55;
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(eyeBaseX, eyeY, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(eyeBaseX - 10 * f.facing, eyeY, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#111';
      ctx.beginPath(); ctx.arc(eyeBaseX + 1.5 * f.facing, eyeY, 2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(eyeBaseX - 10 * f.facing + 1.5 * f.facing, eyeY, 2, 0, Math.PI * 2); ctx.fill();

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

    const limbLen = 35;
    const limbWidth = 8;
    const progress = f.attackFrame / (FRAME_DATA[f.currentAttack]?.active || 5);

    ctx.save();
    ctx.strokeStyle = '#ffdd44';
    ctx.lineWidth = limbWidth;
    ctx.lineCap = 'round';
    ctx.shadowColor = '#ffaa00';
    ctx.shadowBlur = 8;

    switch (f.currentAttack) {
      case AttackType.STAND_LIGHT:
      case AttackType.STAND_HEAVY: {
        // Punch extension
        const reach = limbLen * (0.5 + progress * 0.5);
        ctx.beginPath();
        ctx.moveTo(sx + 10 * f.facing, sy - f.displayHeight * 0.6);
        ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.6);
        ctx.stroke();
        break;
      }
      case AttackType.CROUCH_ATTACK: {
        const reach = limbLen * 0.8;
        ctx.beginPath();
        ctx.moveTo(sx + 5 * f.facing, sy - 10);
        ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - 5);
        ctx.stroke();
        break;
      }
      case AttackType.AIR_ATTACK: {
        const reach = limbLen * 0.7;
        ctx.beginPath();
        ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.3);
        ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.4);
        ctx.stroke();
        break;
      }
      case AttackType.SPECIAL_UPPER: {
        // Rising uppercut
        const reach = limbLen * 1.2;
        ctx.beginPath();
        ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.5);
        ctx.lineTo(sx + 10 * f.facing, sy - f.displayHeight * 0.5 - reach);
        ctx.stroke();
        break;
      }
      case AttackType.THROW: {
        // Grab
        ctx.strokeStyle = '#ff8844';
        ctx.beginPath();
        ctx.moveTo(sx + 10 * f.facing, sy - f.displayHeight * 0.5);
        ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + 20) * f.facing, sy - f.displayHeight * 0.5);
        ctx.stroke();
        break;
      }
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
    const m = color.match(/(\d+)/g);
    return m ? { r: +m[0], g: +m[1], b: +m[2] } : { r: 128, g: 128, b: 128 };
  }
}
