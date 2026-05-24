/**
 * Screen overlays — character select, intro (ROUND 1 FIGHT!), KO, super flash
 */
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../core/constants.js';
import { ROSTER } from '../characters/index.js';
import { roundRect } from './utils.js';

// ===== Character Select =====

/** Draw the full character select screen */
export function drawCharacterSelect(
  ctx: CanvasRenderingContext2D,
  p1Cursor: number,
  p2Cursor: number,
  p1Ready: boolean,
  p2Ready: boolean,
  tick: number,
  p2IsAI: boolean,
): void {
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
  const cols = ROSTER.length;
  const cardW = 140;
  const cardH = 200;
  const gap = 20;
  const totalW = cols * cardW + (cols - 1) * gap;
  const startX = (CANVAS_WIDTH - totalW) / 2;
  const startY = 140;

  for (let i = 0; i < cols; i++) {
    const char = ROSTER[i];
    const cx = startX + i * (cardW + gap);
    const cy = startY;

    const isP1Here = p1Cursor === i;
    const isP2Here = p2Cursor === i;

    // Card background
    ctx.fillStyle = '#141420';
    roundRect(ctx, cx, cy, cardW, cardH, 8);
    ctx.fill();

    // Selection highlight
    if (isP1Here || isP2Here) {
      ctx.strokeStyle = p1Ready && isP1Here ? '#ffcc00' : isP1Here ? '#ff4444' : 'transparent';
      ctx.lineWidth = 3;
      if (isP1Here) {
        roundRect(ctx, cx - 2, cy - 2, cardW + 4, cardH / 2 + 4, 8);
        ctx.stroke();
      }
      ctx.strokeStyle = p2Ready && isP2Here ? '#ffcc00' : isP2Here ? '#4488ff' : 'transparent';
      ctx.lineWidth = 3;
      if (isP2Here) {
        roundRect(ctx, cx - 2, cy + cardH / 2 - 4, cardW + 4, cardH / 2 + 8, 8);
        ctx.stroke();
      }
    }

    // Character portrait area
    const portraitY = cy + 15;
    ctx.fillStyle = '#1a1a2a';
    roundRect(ctx, cx + 15, portraitY, cardW - 30, 80, 6);
    ctx.fill();

    // Character color preview block
    const charGrad = ctx.createLinearGradient(cx + 20, portraitY + 5, cx + cardW - 20, portraitY + 75);
    charGrad.addColorStop(0, char.color);
    charGrad.addColorStop(1, char.accentColor);
    ctx.fillStyle = charGrad;
    roundRect(ctx, cx + 20, portraitY + 5, cardW - 40, 70, 4);
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
      roundRect(ctx, cx - 4, cy - 4, cardW + 8, cardH + 8, 10);
      ctx.stroke();
    }
  }

  // Player status at bottom
  const bottomY = 400;
  // P1 side
  const p1Char = ROSTER[p1Cursor];
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
  const p2Char = ROSTER[p2Cursor];
  ctx.fillStyle = '#4488ff';
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'right';
  ctx.fillText('P2', 750, bottomY);
  ctx.fillStyle = p2Char.color;
  ctx.font = 'bold 22px monospace';
  ctx.fillText(p2Char.nameCn, 750, bottomY + 28);
  ctx.fillStyle = p2Ready ? '#ffcc00' : '#888';
  ctx.font = '13px monospace';
  ctx.fillText(p2Ready ? 'READY!' : p2IsAI ? '[AI] Auto-pick' : 'Numpad1 to confirm', 750, bottomY + 52);

  // AI toggle indicator
  ctx.textAlign = 'center';
  ctx.fillStyle = p2IsAI ? '#44ff88' : '#ff6644';
  ctx.font = 'bold 14px monospace';
  ctx.fillText(p2IsAI ? '🤖 AI ON' : '👤 P2 Human', 400, bottomY + 85);
  ctx.fillStyle = '#666';
  ctx.font = '11px monospace';
  ctx.fillText('Press T to toggle AI', 400, bottomY + 102);

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

// ===== Intro Overlay =====

/** Draw ROUND 1 / FIGHT! intro overlay */
export function drawIntro(ctx: CanvasRenderingContext2D, phaseTimer: number): void {
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

// ===== KO Screen =====

/** Draw KO overlay with winner announcement */
export function drawKO(ctx: CanvasRenderingContext2D, winner: number | null, perfectPlayer: number | null = null): void {
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

  // PERFECT text — golden glow, shown when winner took zero damage
  if (perfectPlayer !== null) {
    ctx.fillStyle = '#ffcc00';
    ctx.shadowColor = '#ff8800';
    ctx.shadowBlur = 15;
    ctx.font = 'bold 36px monospace';
    ctx.fillText('PERFECT!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 100);
    ctx.shadowBlur = 0;
  }

  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '14px monospace';
  ctx.fillText('Press R to restart', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 130);

  ctx.restore();
}

// ===== Super Flash (DM dark screen overlay) =====

/** Draw DM super flash overlay — dark screen + burst at character position */
export function drawSuperFlash(
  ctx: CanvasRenderingContext2D, timer: number,
  flashScreenX: number, flashScreenY: number,
  flashType: 'DM' | 'SDM' = 'DM',
): void {
  ctx.save();
  const progress = timer / 20; // 1.0 → 0.0
  const isSDM = flashType === 'SDM';

  // Dark overlay — strongest at start, fading out
  const alpha = 0.6 * progress;
  ctx.fillStyle = isSDM ? `rgba(80, 0, 0, ${alpha})` : `rgba(0, 0, 80, ${alpha})`;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Flash burst on character position
  if (timer > 14) {
    const flashAlpha = (timer - 14) / 6 * 0.8;
    const flashGrad = ctx.createRadialGradient(flashScreenX, flashScreenY, 0, flashScreenX, flashScreenY, 150);
    if (isSDM) {
      flashGrad.addColorStop(0, `rgba(255, 220, 160, ${flashAlpha})`);
      flashGrad.addColorStop(0.3, `rgba(255, 160, 50, ${flashAlpha * 0.6})`);
      flashGrad.addColorStop(1, `rgba(255, 120, 30, 0)`);
    } else {
      flashGrad.addColorStop(0, `rgba(255, 255, 200, ${flashAlpha})`);
      flashGrad.addColorStop(0.3, `rgba(255, 220, 100, ${flashAlpha * 0.6})`);
      flashGrad.addColorStop(1, `rgba(255, 200, 50, 0)`);
    }
    ctx.fillStyle = flashGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  // Lingering glow around character
  const glowAlpha = progress * 0.5;
  const glowGrad = ctx.createRadialGradient(flashScreenX, flashScreenY, 0, flashScreenX, flashScreenY, 80 + (1 - progress) * 40);
  if (isSDM) {
    glowGrad.addColorStop(0, `rgba(255, 160, 60, ${glowAlpha})`);
    glowGrad.addColorStop(0.5, `rgba(255, 100, 30, ${glowAlpha * 0.4})`);
    glowGrad.addColorStop(1, 'rgba(255, 80, 20, 0)');
  } else {
    glowGrad.addColorStop(0, `rgba(255, 255, 100, ${glowAlpha})`);
    glowGrad.addColorStop(0.5, `rgba(255, 200, 50, ${glowAlpha * 0.4})`);
    glowGrad.addColorStop(1, 'rgba(255, 200, 50, 0)');
  }
  ctx.fillStyle = glowGrad;
  ctx.fillRect(flashScreenX - 200, flashScreenY - 200, 400, 400);

  ctx.restore();
}
