/**
 * Renderer — thin orchestration layer
 *
 * Owns the canvas context, FPS tracking, star field state.
 * Delegates all actual drawing to focused modules.
 */
import { Fighter } from '../entities/fighter.js';
import { Projectile } from '../entities/projectile.js';
import { CommandBuffer } from '../input/commandBuffer.js';
import { Camera } from '../core/camera.js';
import { FighterState } from '../core/types.js';
import type { PowerGauge, MaxModeState } from '../core/types.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT, STAGE_GROUND_Y, FIGHTER_WIDTH, FRAME_DATA } from '../core/constants.js';

import { drawStage, generateStars } from './stage.js';
import type { Star } from './stage.js';
import { drawSkeletalFighter } from './skeletalFighter.js';
import { drawAttackLimb } from './attackLimb.js';
import { drawHUD, drawPowerGauges, drawComboCounters, drawTeamOrder, type TeamDisplayInfo } from './hud.js';
import { drawCharacterSelect, drawIntro, drawKO, drawSuperFlash, drawMatchEnd, drawModeIndicator, drawTitle, drawContinue } from './screens.js';
import { shiftColor, roundRect } from './utils.js';
import { ROSTER } from '../characters/index.js';
import { drawProjectiles as drawProjectilesImpl } from './projectileRenderer.js';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private frameCount = 0;
  private fpsTime = 0;
  private currentFps = 0;
  private globalTick = 0;
  private stars: Star[];

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.stars = generateStars(60);
  }

  // ===== Main fight frame =====

  render(fighters: Fighter[], cameraX: number, tick: number, ko: boolean, winner: number | null, shakeX: number, shakeY: number, delayedHealth: [number, number], maxModes?: [MaxModeState, MaxModeState], perfectPlayer: number | null = null, p1Wins: number = 0, p2Wins: number = 0, p1Name: string = '', p2Name: string = ''): void {
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

    drawStage(ctx, cameraX, this.stars, this.globalTick);
    this.drawFighters(ctx, fighters, cameraX, maxModes);
    drawHUD(ctx, fighters, tick, delayedHealth, p1Wins, p2Wins, p1Name, p2Name);

    if (ko) {
      drawKO(ctx, winner, perfectPlayer);
    }

    ctx.restore();
  }

  getFps(): number {
    return this.currentFps;
  }

  // ===== Fighter orchestration =====

  private drawFighters(ctx: CanvasRenderingContext2D, fighters: Fighter[], cameraX: number, maxModes?: [MaxModeState, MaxModeState]): void {
    const sorted = [...fighters].sort((a, b) => a.y - b.y);

    for (const f of sorted) {
      const sx = f.x - cameraX;
      const sy = f.y;
      const hw = FIGHTER_WIDTH / 2;
      const isP1 = f === fighters[0];
      const playerIdx = isP1 ? 0 : 1;
      const maxModeActive = maxModes ? maxModes[playerIdx].active : false;

      // Shadow on ground
      const shadowScale = Math.max(0.3, 1 - (STAGE_GROUND_Y - f.y) / 200);
      ctx.fillStyle = `rgba(0, 0, 0, ${0.25 * shadowScale})`;
      ctx.beginPath();
      ctx.ellipse(sx, STAGE_GROUND_Y + 2, hw * 0.7 * shadowScale, 3 * shadowScale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Resolve body colors from fighter state
      const { bodyColor, outlineColor, glowColor } = this.resolveFighterColors(f);

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
        leanAngle = 0.12 * f.facing;
      } else if (f.state === FighterState.BACKDASH) {
        leanOffsetX = -6 * f.facing;
        leanAngle = -0.08 * f.facing;
      }

      // Afterimage trail for RUN/BACKDASH/ROLL
      if (f.state === FighterState.RUN || f.state === FighterState.BACKDASH
        || f.state === FighterState.ROLL || f.state === FighterState.BACK_ROLL) {
        this.drawAfterimageTrail(ctx, f, sx, leanOffsetX);
      }

      ctx.save();
      ctx.translate(sx + leanOffsetX, sy);
      ctx.rotate(leanAngle);
      ctx.translate(-(sx + leanOffsetX), -sy);

      drawSkeletalFighter(ctx, f, sx + leanOffsetX, sy, bodyColor, outlineColor, this.globalTick, maxModeActive);

      ctx.restore();

      drawAttackLimb(ctx, f, sx, sy);

      // Player label
      ctx.fillStyle = isP1 ? '#ff5555' : '#5599ff';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(isP1 ? 'P1' : 'P2', sx, sy - f.displayHeight - 8);
      ctx.textAlign = 'left';
    }
  }

  // ===== Color resolution =====

  private resolveFighterColors(f: Fighter): { bodyColor: string; outlineColor: string; glowColor: string | null } {
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
        bodyColor = '#6688aa';
        outlineColor = '#88aaff60';
        glowColor = '#4466ff20';
        break;
      case FighterState.GUARD_CRUSH:
        bodyColor = this.globalTick % 6 < 3 ? '#ff4444' : '#ffffff';
        outlineColor = '#ff000080';
        glowColor = '#ff220040';
        break;
      case FighterState.HITSTUN:
        bodyColor = this.globalTick % 6 < 3 ? '#ffffff' : f.color;
        outlineColor = '#ff505070';
        break;
      case FighterState.KNOCKDOWN:
        bodyColor = shiftColor(f.color, -50);
        outlineColor = '#88000040';
        break;
    }

    return { bodyColor, outlineColor, glowColor };
  }

  // ===== Afterimage trail =====

  private drawAfterimageTrail(ctx: CanvasRenderingContext2D, f: Fighter, sx: number, leanOffsetX: number): void {
    const trailColor = f.state === FighterState.RUN
      ? `rgba(255, 140, 0, ${0.15})`
      : f.state === FighterState.BACKDASH
      ? `rgba(100, 180, 255, ${0.18})`
      : `rgba(80, 255, 140, ${0.18})`;
    for (let i = 1; i <= 3; i++) {
      ctx.globalAlpha = 0.3 / i;
      ctx.fillStyle = trailColor;
      const trailX = sx - leanOffsetX * i * 1.5 - f.facing * 12 * i;
      roundRect(ctx,
        trailX - FIGHTER_WIDTH / 2, f.y - f.displayHeight + i * 4,
        FIGHTER_WIDTH, f.displayHeight - i * 4, 5);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // ===== Projectile rendering (delegated) =====

  drawProjectiles(projectiles: Projectile[], camera: Camera): void {
    drawProjectilesImpl(this.ctx, projectiles, camera);
  }

  // ===== Screen overlays (thin wrappers) =====

  drawIntro(phaseTimer: number, currentRound: number = 1): void {
    drawIntro(this.ctx, phaseTimer, currentRound);
  }

  drawKO(winner: number | null, perfectPlayer: number | null = null): void {
    drawKO(this.ctx, winner, perfectPlayer);
  }

  drawSuperFlash(ctx: CanvasRenderingContext2D, timer: number, flashScreenX: number, flashScreenY: number, flashType: 'DM' | 'SDM' = 'DM'): void {
    drawSuperFlash(ctx, timer, flashScreenX, flashScreenY, flashType);
  }

  drawPowerGauges(gauges: [PowerGauge, PowerGauge], maxModes: [MaxModeState, MaxModeState]): void {
    drawPowerGauges(this.ctx, gauges, maxModes);
  }

  drawComboCounters(
    fighters: Fighter[],
    comboCount: number[],
    comboTimer: number[],
    camera: Camera,
  ): void {
    drawComboCounters(this.ctx, fighters, comboCount, comboTimer, camera);
  }

  drawTeamOrder(p1Team: TeamDisplayInfo | null, p2Team: TeamDisplayInfo | null): void {
    drawTeamOrder(this.ctx, p1Team, p2Team);
  }

  drawCharacterSelect(
    p1Cursor: number,
    p2Cursor: number,
    p1Ready: boolean,
    p2Ready: boolean,
    tick: number,
    p2IsAI: boolean,
    simplifiedMode: boolean,
  ): void {
    drawCharacterSelect(this.ctx, p1Cursor, p2Cursor, p1Ready, p2Ready, tick, p2IsAI, simplifiedMode);
  }

  drawMatchEnd(winner: number | null, p1Wins: number, p2Wins: number): void {
    drawMatchEnd(this.ctx, winner, p1Wins, p2Wins);
  }

  drawModeIndicator(simplifiedMode: boolean, alpha: number): void {
    drawModeIndicator(this.ctx, simplifiedMode, alpha);
  }

  drawTitle(tick: number): void {
    drawTitle(this.ctx, tick);
  }

  drawContinue(secondsLeft: number): void {
    drawContinue(this.ctx, secondsLeft);
  }

  // ===== Debug overlay =====

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

  // ===== Controls hint =====

  private static readonly SPECIAL_NAMES: Record<string, [string, string]> = {
    kyo: ['荒咬み', '鬼焼き'],
    iori: ['暗拂', '鬼焼き'],
    terry: ['Power Wave', 'Burn Knuckle'],
    kim: ['飛燕斬', '空斬'],
  };

  drawControlsHint(simplifiedMode: boolean, charId: string): void {
    const ctx = this.ctx;
    // Semi-transparent dark bar at bottom
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillRect(0, 575, CANVAS_WIDTH, 25);
    // Subtle top border
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fillRect(0, 575, CANVAS_WIDTH, 1);

    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';

    let label: string;
    if (simplifiedMode) {
      const names = Renderer.SPECIAL_NAMES[charId] ?? ['技能①', '技能②'];
      label = `[J]轻拳  [K]轻脚  [U]${names[0]}  [I]${names[1]}  [O]爆气  [L]CD`;
    } else {
      label = '[J]轻拳  [K]轻脚  [U]重拳  [I]重脚  [L]CD  [;]投';
    }
    ctx.fillText(label, CANVAS_WIDTH / 2, 592);
    ctx.textAlign = 'left';
  }
}
