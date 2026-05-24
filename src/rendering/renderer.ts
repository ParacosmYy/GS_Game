import { Fighter } from '../entities/fighter.js';
import { FighterState } from '../core/types.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT, STAGE_GROUND_Y, FIGHTER_WIDTH, MAX_HEALTH } from '../core/constants.js';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private frameCount = 0;
  private fpsTime = 0;
  private currentFps = 0;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  render(fighters: Fighter[], cameraX: number, tick: number, ko: boolean, winner: number | null): void {
    this.frameCount++;
    const now = performance.now();
    if (now - this.fpsTime >= 1000) {
      this.currentFps = this.frameCount;
      this.frameCount = 0;
      this.fpsTime = now;
    }

    const ctx = this.ctx;
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    this.drawStage(ctx, cameraX);
    this.drawFighters(ctx, fighters, cameraX);
    this.drawHUD(ctx, fighters);

    if (ko) {
      this.drawKO(ctx);
    }
  }

  getFps(): number {
    return this.currentFps;
  }

  // ===== Stage =====
  private drawStage(ctx: CanvasRenderingContext2D, cameraX: number): void {
    // Sky gradient (deep arcade feel)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    skyGrad.addColorStop(0, '#0a0a1a');
    skyGrad.addColorStop(0.4, '#111133');
    skyGrad.addColorStop(0.7, '#1a1a3e');
    skyGrad.addColorStop(1, '#222244');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Subtle grid lines on floor for depth
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let wx = 0; wx < 1600; wx += 100) {
      const sx = wx - cameraX;
      if (sx < -10 || sx > CANVAS_WIDTH + 10) continue;
      ctx.beginPath();
      ctx.moveTo(sx, STAGE_GROUND_Y);
      ctx.lineTo(sx, CANVAS_HEIGHT);
      ctx.stroke();
    }

    // Ground platform
    const groundGrad = ctx.createLinearGradient(0, STAGE_GROUND_Y, 0, CANVAS_HEIGHT);
    groundGrad.addColorStop(0, '#333340');
    groundGrad.addColorStop(0.1, '#282833');
    groundGrad.addColorStop(1, '#1a1a25');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, STAGE_GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - STAGE_GROUND_Y);

    // Ground top edge glow
    const edgeGrad = ctx.createLinearGradient(0, STAGE_GROUND_Y - 2, 0, STAGE_GROUND_Y + 4);
    edgeGrad.addColorStop(0, 'rgba(100, 150, 255, 0.5)');
    edgeGrad.addColorStop(1, 'rgba(100, 150, 255, 0)');
    ctx.fillStyle = edgeGrad;
    ctx.fillRect(0, STAGE_GROUND_Y - 2, CANVAS_WIDTH, 6);

    // Stage boundary indicators
    const leftEdge = -cameraX;
    const rightEdge = 1400 - cameraX;
    ctx.strokeStyle = 'rgba(255, 60, 60, 0.25)';
    ctx.lineWidth = 2;
    if (leftEdge >= 0 && leftEdge <= CANVAS_WIDTH) {
      ctx.beginPath();
      ctx.moveTo(leftEdge, 100);
      ctx.lineTo(leftEdge, CANVAS_HEIGHT);
      ctx.stroke();
    }
    if (rightEdge >= 0 && rightEdge <= CANVAS_WIDTH) {
      ctx.beginPath();
      ctx.moveTo(rightEdge, 100);
      ctx.lineTo(rightEdge, CANVAS_HEIGHT);
      ctx.stroke();
    }
  }

  // ===== Fighters =====
  private drawFighters(ctx: CanvasRenderingContext2D, fighters: Fighter[], cameraX: number): void {
    for (const f of fighters) {
      const sx = f.x - cameraX;
      const sy = f.y;
      const hw = FIGHTER_WIDTH / 2;

      // Shadow on ground
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(sx, STAGE_GROUND_Y + 2, hw * 0.8, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Main body color based on state
      let bodyColor = f.color;
      let outlineColor = 'rgba(255,255,255,0.3)';

      switch (f.state) {
        case FighterState.WALK:
          bodyColor = this.shiftColor(f.color, 15);
          break;
        case FighterState.JUMP:
          bodyColor = this.shiftColor(f.color, 30);
          break;
        case FighterState.STAND_ATTACK:
        case FighterState.CROUCH_ATTACK:
        case FighterState.AIR_ATTACK:
          bodyColor = '#ffcc00';
          outlineColor = 'rgba(255,200,0,0.6)';
          break;
        case FighterState.BLOCK:
          bodyColor = '#778899';
          outlineColor = 'rgba(100,150,255,0.5)';
          break;
        case FighterState.HITSTUN:
          bodyColor = f.attackFrame % 2 === 0 ? '#ffffff' : f.color;
          outlineColor = 'rgba(255,80,80,0.6)';
          break;
        case FighterState.KNOCKDOWN:
          bodyColor = this.shiftColor(f.color, -40);
          outlineColor = 'rgba(150,0,0,0.4)';
          break;
      }

      // Body with gradient
      const bodyGrad = ctx.createLinearGradient(sx - hw, sy - f.displayHeight, sx + hw, sy);
      bodyGrad.addColorStop(0, this.shiftColor(bodyColor, 20));
      bodyGrad.addColorStop(1, bodyColor);
      ctx.fillStyle = bodyGrad;

      // Rounded rectangle body
      this.roundRect(ctx, sx - hw, sy - f.displayHeight, FIGHTER_WIDTH, f.displayHeight, 4);
      ctx.fill();

      // Outline
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = 2;
      this.roundRect(ctx, sx - hw, sy - f.displayHeight, FIGHTER_WIDTH, f.displayHeight, 4);
      ctx.stroke();

      // Eye / facing indicator
      const eyeX = sx + 10 * f.facing;
      const eyeY = sy - f.displayHeight + 18;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(eyeX + 1.5 * f.facing, eyeY, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Player label above
      ctx.fillStyle = f === fighters[0] ? '#ff6666' : '#6688ff';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(f === fighters[0] ? 'P1' : 'P2', sx, sy - f.displayHeight - 6);
      ctx.textAlign = 'left';
    }
  }

  // ===== HUD =====
  private drawHUD(ctx: CanvasRenderingContext2D, fighters: Fighter[]): void {
    if (fighters.length < 2) return;

    const barWidth = 320;
    const barHeight = 22;
    const barY = 28;
    const margin = 40;

    // HUD background strip
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, 58);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 58);
    ctx.lineTo(CANVAS_WIDTH, 58);
    ctx.stroke();

    // P1 label
    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('P1', margin - 2, barY - 6);

    // P1 health bar (fills left to right)
    const p1Ratio = Math.max(0, fighters[0].health / MAX_HEALTH);
    this.drawHealthBar(ctx, margin, barY, barWidth, barHeight, p1Ratio, true);

    // P2 label
    ctx.fillStyle = '#4488ff';
    ctx.textAlign = 'right';
    ctx.fillText('P2', CANVAS_WIDTH - margin + 2, barY - 6);

    // P2 health bar (fills right to left)
    const p2Ratio = Math.max(0, fighters[1].health / MAX_HEALTH);
    this.drawHealthBar(ctx, CANVAS_WIDTH - margin - barWidth, barY, barWidth, barHeight, p2Ratio, false);

    // VS indicator center
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('VS', CANVAS_WIDTH / 2, barY + 16);
    ctx.textAlign = 'left';
  }

  private drawHealthBar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, ratio: number, leftAligned: boolean): void {
    // Background
    ctx.fillStyle = '#1a1a22';
    this.roundRect(ctx, x, y, w, h, 3);
    ctx.fill();

    // Border
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    this.roundRect(ctx, x, y, w, h, 3);
    ctx.stroke();

    // Health fill
    const fillW = w * ratio;
    if (fillW <= 0) return;

    const healthColor = ratio > 0.5 ? '#22cc55' : ratio > 0.25 ? '#ccaa22' : '#cc2233';
    const healthGrad = ctx.createLinearGradient(x, y, x, y + h);
    healthGrad.addColorStop(0, this.shiftColor(healthColor, 30));
    healthGrad.addColorStop(1, healthColor);

    ctx.fillStyle = healthGrad;
    if (leftAligned) {
      this.roundRect(ctx, x, y, fillW, h, 3);
      ctx.fill();
    } else {
      this.roundRect(ctx, x + w - fillW, y, fillW, h, 3);
      ctx.fill();
    }

    // Shine line on top of bar
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(x + 2, y + 2, (leftAligned ? fillW : fillW) - 4, 3);
  }

  // ===== KO Text =====
  private drawKO(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // Dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // KO text with glow
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 30;
    ctx.fillStyle = '#ff2200';
    ctx.font = 'bold 90px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('K.O.!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('Press R to restart', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);

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
