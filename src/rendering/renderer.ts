/**
 * Renderer — thin orchestration layer
 *
 * Owns the canvas context, FPS tracking, star field state.
 * Delegates all actual drawing to focused modules.
 */
import { Fighter } from '../entities/fighter.js';
import { Projectile } from '../entities/projectile.js';
import { Camera } from '../core/camera.js';
import { FighterState } from '../core/types.js';
import type { PowerGauge, MaxModeState } from '../core/types.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT, FRAME_DATA, STAGE_GROUND_Y } from '../core/constants.js';

/** Debug overlay input — 每个玩家的输入历史 */
export interface DebugInputHistory {
  directionSymbols: string[];
  directionAges: number[];
}

import { drawStage, generateStars, getStage } from './stage.js';
import type { Star } from './stage.js';
import { drawFighters as drawFightersImpl } from './rendererFighter.js';
import { drawHUD, drawPowerGauges, drawComboCounters, drawTeamOrder, type TeamDisplayInfo } from './hud.js';
import { drawCharacterSelect, drawIntro, drawKO, drawWinQuote, drawVSSplash, drawStageSelect, drawTeamOrderSelect, drawTransition, WIN_QUOTE_DURATION } from './screens.js';
import type { KODustParticle } from '../state/cinematicState.js';
import { drawSuperFlash, drawMatchEnd, drawModeIndicator, drawStageIndicator, drawTitle, drawContinue, drawModeSelect, drawTrainingHUD, drawGameOver } from './overlayScreens.js';
import { drawProjectiles as drawProjectilesImpl } from './projectileRenderer.js';
import type { SpriteRenderer } from './spriteRenderer.js';
import type { SelectState } from '../state/selectState.js';
import type { CharacterDefinition } from '../characters/types.js';
import type { StageId } from './stage.js';
import type { TrainingModeState } from '../state/trainingMode.js';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private frameCount = 0;
  private fpsTime = 0;
  private currentFps = 0;
  private globalTick = 0;
  private stars: Star[];
  private spriteRenderer: SpriteRenderer | null = null;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.stars = generateStars(60);
  }

  setSpriteRenderer(sr: SpriteRenderer): void {
    this.spriteRenderer = sr;
  }

  render(fighters: Fighter[], cameraX: number, tick: number, ko: boolean, winner: number | null, shakeX: number, shakeY: number, delayedHealth: [number, number], maxModes?: [MaxModeState, MaxModeState], perfectPlayer: number | null = null, p1Wins: number = 0, p2Wins: number = 0, p1Name: string = '', p2Name: string = '', isTimeOver: boolean = false, currentRound: number = 1, firstAttacker: number | null = null, hitStopDefender: number = -1, hitStopBias: number = 0, charSpecialColors?: [string, string], koTimer: number = 0, koDustParticles: KODustParticle[] = []): void {
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

    // KOF2002: 角色光源 — 每个角色发出微弱的环境光
    for (let fi = 0; fi < fighters.length; fi++) {
      const f = fighters[fi];
      const glowCol = charSpecialColors?.[fi] || '#ff4400';
      const fsx = f.x - cameraX;
      // 攻击时光源增强
      const isAttacking = f.attackPhase === 'active';
      const intensity = f.hitFlashFrames > 0 ? 0.15 : isAttacking ? 0.08 : 0.03;
      const lightR = f.hitFlashFrames > 0 ? 140 : isAttacking ? 100 : 70;
      const lightGrad = ctx.createRadialGradient(fsx, f.y - f.displayHeight / 2, 5, fsx, f.y - f.displayHeight / 2, lightR);
      lightGrad.addColorStop(0, glowCol + (f.hitFlashFrames > 0 ? '25' : isAttacking ? '15' : '08'));
      lightGrad.addColorStop(0.5, glowCol + '05');
      lightGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalAlpha = intensity;
      ctx.fillStyle = lightGrad;
      ctx.fillRect(fsx - lightR, f.y - f.displayHeight / 2 - lightR, lightR * 2, lightR * 2);
      ctx.globalAlpha = 1;
    }

    drawFightersImpl(ctx, fighters, cameraX, this.globalTick, maxModes, hitStopDefender, hitStopBias, this.spriteRenderer);
    drawHUD(ctx, fighters, tick, delayedHealth, p1Wins, p2Wins, p1Name, p2Name, currentRound, firstAttacker);

    if (ko) {
      drawKO(ctx, winner, perfectPlayer, isTimeOver, fighters[0].health, fighters[1].health, fighters[0].maxHealth, koTimer, koDustParticles, cameraX);
    }

    // KOF2002: 暗角效果 — 聚焦中心, 边缘渐暗 (场景色温)
    const stageId = getStage();
    const vigTint = stageId === 'temple' ? '30, 15, 5'
      : stageId === 'china' ? '40, 10, 10'
      : '5, 15, 30';
    const vigGrad = ctx.createRadialGradient(
      CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH * 0.28,
      CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH * 0.65,
    );
    vigGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vigGrad.addColorStop(0.6, `rgba(${vigTint}, 0.08)`);
    vigGrad.addColorStop(1, `rgba(${vigTint}, 0.38)`);
    ctx.fillStyle = vigGrad;
    ctx.fillRect(-10, -10, CANVAS_WIDTH + 20, CANVAS_HEIGHT + 20);

    // KOF2002: 底部地面雾气 — 地面附近半透明白色薄雾
    const fogGrad = ctx.createLinearGradient(0, STAGE_GROUND_Y + 10, 0, STAGE_GROUND_Y + 60);
    fogGrad.addColorStop(0, 'rgba(180, 170, 160, 0)');
    fogGrad.addColorStop(0.3, 'rgba(160, 155, 150, 0.06)');
    fogGrad.addColorStop(0.7, 'rgba(140, 135, 130, 0.08)');
    fogGrad.addColorStop(1, 'rgba(120, 115, 110, 0.12)');
    ctx.fillStyle = fogGrad;
    ctx.fillRect(-10, STAGE_GROUND_Y + 10, CANVAS_WIDTH + 20, 60);

    ctx.restore();
  }

  getFps(): number {
    return this.currentFps;
  }

  // ===== Projectile rendering (delegated) =====

  drawProjectiles(projectiles: Projectile[], camera: Camera): void {
    drawProjectilesImpl(this.ctx, projectiles, camera);
  }

  // ===== Screen overlays (thin wrappers) =====

  drawIntro(phaseTimer: number, currentRound: number = 1, p1Name: string = '', p2Name: string = ''): void {
    drawIntro(this.ctx, phaseTimer, currentRound, p1Name, p2Name);
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
    comboDamage?: number[],
  ): void {
    drawComboCounters(this.ctx, fighters, comboCount, comboTimer, camera, comboDamage);
  }

  drawTeamOrder(p1Team: TeamDisplayInfo | null, p2Team: TeamDisplayInfo | null): void {
    drawTeamOrder(this.ctx, p1Team, p2Team);
  }

  drawCharacterSelect(
    selectState: SelectState,
    tick: number,
    simplifiedMode: boolean,
    currentStage: StageId,
  ): void {
    drawCharacterSelect(this.ctx, selectState, tick, simplifiedMode, currentStage);
  }

  drawVSSplash(selectState: SelectState, tick: number): void {
    drawVSSplash(this.ctx, selectState, tick);
  }

  drawMatchEnd(winner: number | null, p1Wins: number, p2Wins: number, winQuote?: string, winnerColor?: string, tick?: number, winnerCharId?: string): void {
    drawMatchEnd(this.ctx, winner, p1Wins, p2Wins, winQuote, winnerColor, tick, winnerCharId);
  }

  drawModeIndicator(simplifiedMode: boolean, alpha: number): void {
    drawModeIndicator(this.ctx, simplifiedMode, alpha);
  }

  drawStageIndicator(stageId: string, alpha: number): void {
    drawStageIndicator(this.ctx, stageId, alpha);
  }

  drawTitle(tick: number): void {
    drawTitle(this.ctx, tick);
  }

  drawModeSelect(tick: number, cursor: number): void {
    drawModeSelect(this.ctx, tick, cursor);
  }

  drawContinue(secondsLeft: number, cursorYes: boolean): void {
    drawContinue(this.ctx, secondsLeft, cursorYes);
  }

  drawGameOver(timer: number): void {
    drawGameOver(this.ctx, timer);
  }

  drawWinQuote(timer: number, charName: string, winQuote: string, charColor: string, pixelPortrait: import('./pixelPortraits.js').PixelPortraitData | undefined): void {
    drawWinQuote(this.ctx, timer, charName, winQuote, charColor, pixelPortrait);
  }

  drawStageSelect(tick: number, cursor: number, ready: boolean): void {
    drawStageSelect(this.ctx, tick, cursor, ready);
  }

  drawTeamOrderSelect(
    tick: number,
    p1Team: readonly { charDef: CharacterDefinition }[],
    p2Team: readonly { charDef: CharacterDefinition }[],
    p1Slots: number[],
    p2Slots: number[],
    cursor: number,
    swapMode: boolean,
    swapCursor: number,
    p1Ready: boolean,
    p2Ready: boolean,
  ): void {
    drawTeamOrderSelect(this.ctx, tick, p1Team, p2Team, p1Slots, p2Slots, cursor, swapMode, swapCursor, p1Ready, p2Ready);
  }

  drawTransition(tick: number, type: 'wipe' | 'zoom' | 'fade'): boolean {
    return drawTransition(this.ctx, tick, type, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  // ===== Debug overlay =====

  drawDebug(
    fighters: Fighter[],
    projectiles: Projectile[],
    camera: Camera,
    tick: number,
    fps: number,
    vfxCount: number,
    inputHistories: DebugInputHistory[],
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
      // Throw box (yellow)
      const throwbox = f.getThrowbox?.();
      if (throwbox) {
        ctx.fillStyle = 'rgba(255,200,0,0.15)'; ctx.fillRect(throwbox.x - camera.x, throwbox.y, throwbox.width, throwbox.height);
        ctx.strokeStyle = 'rgba(255,200,0,0.6)'; ctx.lineWidth = 1; ctx.strokeRect(throwbox.x - camera.x, throwbox.y, throwbox.width, throwbox.height);
      }
      const hb = f.getHurtbox();
      ctx.strokeStyle = 'rgba(0,100,255,0.5)'; ctx.lineWidth = 1; ctx.strokeRect(hb.x - camera.x, hb.y, hb.width, hb.height);
      const pb = f.getPushbox();
      ctx.strokeStyle = 'rgba(0,255,0,0.3)'; ctx.setLineDash([3, 3]); ctx.strokeRect(pb.x - camera.x, pb.y, pb.width, pb.height); ctx.setLineDash([]);
      const sx = camera.worldToScreen(f.x);
      ctx.fillStyle = '#fff'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
      ctx.fillText(f.state, sx, f.y - f.displayHeight - 18);
      // Roll invincibility bar
      if (f.isRolling()) {
        const elapsed = 20 - f.rollTimer;
        const invPct = Math.min(elapsed / 15, 1);
        ctx.fillStyle = invPct < 1 ? '#44ff88' : '#ff4444';
        ctx.fillRect(sx - 15, f.y - f.displayHeight - 38, 30 * invPct, 3);
        ctx.strokeStyle = '#888'; ctx.lineWidth = 0.5; ctx.strokeRect(sx - 15, f.y - f.displayHeight - 38, 30, 3);
      }
      // Frame advantage indicator: show on-hit and on-block advantage
      if (f.currentAttack) {
        const d = FRAME_DATA[f.currentAttack as keyof typeof FRAME_DATA];
        if (d) {
          // On-hit advantage = hitstun - remaining_recovery
          // On-block advantage = blockstun - remaining_recovery
          const recoveryLeft = f.attackPhase === 'recovery' ? d.recovery - f.attackFrame
            : f.attackPhase === 'active' ? d.recovery + (d.active - f.attackFrame)
            : d.recovery + d.active;
          const onHitAdv = d.hitstun - recoveryLeft;
          const onBlockAdv = d.blockstun - recoveryLeft;
          const advText = `H:${onHitAdv > 0 ? '+' : ''}${onHitAdv} B:${onBlockAdv > 0 ? '+' : ''}${onBlockAdv}`;
          ctx.font = '8px monospace';
          ctx.fillStyle = '#aaaacc';
          ctx.fillText(advText, sx, f.y - f.displayHeight - 30);
        }
      }
      ctx.textAlign = 'left';
    }

    // Input buffer
    ctx.globalAlpha = 0.88;
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(560, 0, 240, 110);
    ctx.globalAlpha = 1;
    ctx.font = '9px monospace';
    for (let i = 0; i < 2; i++) {
      const hist = inputHistories[i];
      const py = 13 + i * 48;
      ctx.fillStyle = i === 0 ? '#ff5555' : '#5599ff';
      ctx.fillText(`P${i + 1} Buffer:`, 564, py);
      ctx.fillStyle = '#aaa';
      ctx.fillText(' ' + hist.directionSymbols.join(' '), 564, py + 12);
      ctx.fillStyle = '#555';
      ctx.fillText(' ages:' + hist.directionAges.join(','), 564, py + 24);
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
      label = `[J]轻拳  [K]轻脚  [U]${names[0]}  [I]${names[1]}  [O]爆气  [L]CD  [P]嘲讽`;
    } else {
      label = '[J]轻拳  [K]轻脚  [U]重拳  [I]重脚  [L]CD  [;]投  [P]嘲讽';
    }
    ctx.fillText(label, CANVAS_WIDTH / 2, 592);
    ctx.textAlign = 'left';
  }

  drawTrainingHUD(training: TrainingModeState, comboCount: number, comboDamage: number, tick: number): void {
    drawTrainingHUD(this.ctx, training, comboCount, comboDamage, tick);
  }
}
