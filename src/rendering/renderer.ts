import { Fighter } from '../entities/fighter.js';
import { FighterState } from '../core/types.js';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  STAGE_WIDTH,
  STAGE_GROUND_Y,
  FIGHTER_WIDTH,
  MAX_HEALTH,
} from '../core/constants.js';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private cameraX = 0;

  // FPS tracking
  private frameCount = 0;
  private fpsTime = 0;
  private currentFps = 0;

  // KO state
  private koTimer = 0;
  private koWinner: number | null = null;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  render(fighters: Fighter[], tick: number, ko: boolean, winner: number | null): void {
    // Update FPS
    this.frameCount++;
    const now = performance.now();
    if (now - this.fpsTime >= 1000) {
      this.currentFps = this.frameCount;
      this.frameCount = 0;
      this.fpsTime = now;
    }

    // Update camera
    this.updateCamera(fighters);

    // Clear
    this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw stage background
    this.drawStage();

    // Draw fighters
    for (const fighter of fighters) {
      this.drawFighter(fighter);
    }

    // Draw HUD
    this.drawHUD(fighters);

    // Draw KO text
    if (ko) {
      this.drawKO();
    }
  }

  getFps(): number {
    return this.currentFps;
  }

  private updateCamera(fighters: Fighter[]): void {
    if (fighters.length < 2) return;
    const midX = (fighters[0].x + fighters[1].x) / 2;
    this.cameraX = midX - CANVAS_WIDTH / 2;
    // Clamp camera to stage bounds
    this.cameraX = Math.max(0, Math.min(this.cameraX, STAGE_WIDTH - CANVAS_WIDTH));
  }

  private drawStage(): void {
    // Sky gradient
    const gradient = this.ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.6, '#16213e');
    gradient.addColorStop(1, '#0f3460');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Ground
    const groundScreenY = STAGE_GROUND_Y;
    this.ctx.fillStyle = '#2a2a2a';
    this.ctx.fillRect(0, groundScreenY, CANVAS_WIDTH, CANVAS_HEIGHT - groundScreenY);

    // Ground line
    this.ctx.strokeStyle = '#555';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(0, groundScreenY);
    this.ctx.lineTo(CANVAS_WIDTH, groundScreenY);
    this.ctx.stroke();

    // Stage boundary markers
    const leftBound = -this.cameraX;
    const rightBound = STAGE_WIDTH - this.cameraX;

    this.ctx.strokeStyle = 'rgba(255, 100, 100, 0.3)';
    this.ctx.lineWidth = 2;

    if (leftBound >= 0 && leftBound <= CANVAS_WIDTH) {
      this.ctx.beginPath();
      this.ctx.moveTo(leftBound, 0);
      this.ctx.lineTo(leftBound, CANVAS_HEIGHT);
      this.ctx.stroke();
    }
    if (rightBound >= 0 && rightBound <= CANVAS_WIDTH) {
      this.ctx.beginPath();
      this.ctx.moveTo(rightBound, 0);
      this.ctx.lineTo(rightBound, CANVAS_HEIGHT);
      this.ctx.stroke();
    }
  }

  private drawFighter(fighter: Fighter): void {
    const screenX = fighter.x - this.cameraX;
    const screenY = fighter.y;

    // Color based on state
    let color = fighter.color;
    switch (fighter.state) {
      case FighterState.WALK:
        color = this.lightenColor(fighter.color, 20);
        break;
      case FighterState.JUMP:
      case FighterState.AIR_ATTACK:
        color = this.lightenColor(fighter.color, 40);
        break;
      case FighterState.STAND_ATTACK:
      case FighterState.CROUCH_ATTACK:
      case FighterState.AIR_ATTACK:
        color = '#ffcc00';
        break;
      case FighterState.BLOCK:
        color = '#888888';
        break;
      case FighterState.HITSTUN:
        color = fighter.attackFrame % 2 === 0 ? '#ffffff' : fighter.color;
        break;
      case FighterState.KNOCKDOWN:
        color = this.darkenColor(fighter.color, 40);
        break;
    }

    this.ctx.fillStyle = color;
    this.ctx.fillRect(
      screenX - FIGHTER_WIDTH / 2,
      screenY - fighter.displayHeight,
      FIGHTER_WIDTH,
      fighter.displayHeight,
    );

    // Facing indicator (small triangle)
    this.ctx.fillStyle = '#fff';
    const eyeX = screenX + 8 * fighter.facing;
    const eyeY = screenY - fighter.displayHeight + 15;
    this.ctx.beginPath();
    this.ctx.arc(eyeX, eyeY, 4, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private drawHUD(fighters: Fighter[]): void {
    if (fighters.length < 2) return;

    const barWidth = 350;
    const barHeight = 25;
    const barY = 20;
    const padding = 10;

    // P1 health bar (left side, fills right to left)
    const p1Ratio = Math.max(0, fighters[0].health / MAX_HEALTH);
    const p1BarX = padding;
    this.drawHealthBar(p1BarX, barY, barWidth, barHeight, p1Ratio, true);

    // P2 health bar (right side, fills left to right)
    const p2Ratio = Math.max(0, fighters[1].health / MAX_HEALTH);
    const p2BarX = CANVAS_WIDTH - padding - barWidth;
    this.drawHealthBar(p2BarX, barY, barWidth, barHeight, p2Ratio, false);

    // Labels
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 14px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('P1', p1BarX, barY - 4);
    this.ctx.textAlign = 'right';
    this.ctx.fillText('P2', p2BarX + barWidth, barY - 4);
  }

  private drawHealthBar(x: number, y: number, w: number, h: number, ratio: number, leftAligned: boolean): void {
    // Background
    this.ctx.fillStyle = '#333';
    this.ctx.fillRect(x, y, w, h);

    // Health fill
    const fillWidth = w * ratio;
    const healthColor = ratio > 0.5 ? '#22cc44' : ratio > 0.25 ? '#ccaa22' : '#cc2222';
    this.ctx.fillStyle = healthColor;

    if (leftAligned) {
      this.ctx.fillRect(x, y, fillWidth, h);
    } else {
      this.ctx.fillRect(x + w - fillWidth, y, fillWidth, h);
    }

    // Border
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, w, h);
  }

  private drawKO(): void {
    this.ctx.save();
    this.ctx.fillStyle = '#ff0000';
    this.ctx.font = 'bold 80px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('K.O.!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    this.ctx.restore();
  }

  private lightenColor(hex: string, amount: number): string {
    const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + amount);
    const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + amount);
    const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + amount);
    return `rgb(${r},${g},${b})`;
  }

  private darkenColor(hex: string, amount: number): string {
    const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - amount);
    const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - amount);
    const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - amount);
    return `rgb(${r},${g},${b})`;
  }
}
