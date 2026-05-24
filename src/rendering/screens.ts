/**
 * Screen overlays — character select, intro (ROUND 1 FIGHT!), KO, super flash
 */
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../core/constants.js';
import { ROSTER } from '../characters/index.js';
import { roundRect } from './utils.js';
import { drawPixelPortrait } from './pixelPortraits.js';

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
  simplifiedMode: boolean,
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
  ctx.fillText('P1: A/D选择 J确认 | T: 切换AI', 400, 80);

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

    // Draw pixel portrait if available
    if (char.pixelPortrait) {
      const portraitScale = 2;
      const portraitWidth = char.pixelPortrait.width * portraitScale;
      const portraitHeight = char.pixelPortrait.height * portraitScale;
      const px = cx + 15 + ((cardW - 30) - portraitWidth) / 2;
      const py = portraitY + (80 - portraitHeight) / 2;
      drawPixelPortrait(ctx, char.pixelPortrait, px, py, portraitScale);
    } else {
      // Fallback to color block + emoji for characters without pixel art
      const charGrad = ctx.createLinearGradient(cx + 20, portraitY + 5, cx + cardW - 20, portraitY + 75);
      charGrad.addColorStop(0, char.color);
      charGrad.addColorStop(1, char.accentColor);
      ctx.fillStyle = charGrad;
      roundRect(ctx, cx + 20, portraitY + 5, cardW - 40, 70, 4);
      ctx.fill();
      ctx.font = '40px serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.fillText(char.portrait, cx + cardW / 2, portraitY + 48);
    }

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

  // Mode selector tabs (hidden when both ready)
  if (!p1Ready || !p2Ready) {
    const modeY = 510;
    const tabs = [
      { label: '标准模式', desc: 'QCF指令出招', active: !simplifiedMode, x: 330 },
      { label: '简化模式', desc: 'U/I/O一键出招', active: simplifiedMode, x: 470 },
    ];
    for (const t of tabs) {
      const tw = 120, th = 30;
      ctx.fillStyle = t.active ? 'rgba(0,180,80,0.9)' : 'rgba(40,40,60,0.8)';
      roundRect(ctx, t.x - tw / 2, modeY, tw, th, 6); ctx.fill();
      ctx.strokeStyle = t.active ? '#44ff88' : '#555';
      ctx.lineWidth = t.active ? 2 : 1;
      roundRect(ctx, t.x - tw / 2, modeY, tw, th, 6); ctx.stroke();
      ctx.font = 'bold 14px monospace'; ctx.textAlign = 'center';
      ctx.fillStyle = t.active ? '#fff' : '#999';
      ctx.fillText(t.label, t.x, modeY + th / 2);
      ctx.font = '10px monospace';
      ctx.fillStyle = t.active ? '#ccffcc' : '#666';
      ctx.fillText(t.desc, t.x, modeY + th + 14);
    }
    ctx.fillStyle = '#555'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
    ctx.fillText('Tab键切换', 400, modeY + 58);
  }

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

/** Draw ROUND 1 / FIGHT! intro overlay with brush-stroke style */
export function drawIntro(ctx: CanvasRenderingContext2D, phaseTimer: number, currentRound: number = 1): void {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (phaseTimer < 60) {
    const progress = phaseTimer / 60;
    const scale = 1 + Math.max(0, 1 - progress * 3) * 0.5;
    ctx.globalAlpha = Math.min(1, progress * 4);
    const fontSize = Math.round(48 * scale);

    // White stroke outline (brush-stroke effect)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    ctx.font = `bold ${fontSize}px monospace`;
    ctx.strokeText(`ROUND ${currentRound}`, 400, 260);

    // Color fill
    ctx.fillStyle = '#ffcc00';
    ctx.shadowColor = '#ff8800';
    ctx.shadowBlur = 12;
    ctx.fillText(`ROUND ${currentRound}`, 400, 260);
    ctx.shadowBlur = 0;
  } else if (phaseTimer < 100) {
    const fp = (phaseTimer - 60) / 40;
    const scale = 1 + Math.max(0, 1 - fp * 4) * 1.5;
    const alpha = fp < 0.1 ? fp * 10 : Math.max(0, 1 - (fp - 0.5) * 2);
    ctx.globalAlpha = Math.min(1, Math.max(0, alpha));

    // Expanding shockwave ring behind text
    const ringProgress = Math.min(1, fp * 2);
    const ringRadius = 20 + ringProgress * 120;
    const ringAlpha = Math.max(0, 1 - ringProgress);
    if (ringAlpha > 0) {
      ctx.beginPath();
      ctx.arc(400, 300, ringRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 100, 0, ${ringAlpha * 0.6})`;
      ctx.lineWidth = 3 * (1 - ringProgress) + 1;
      ctx.stroke();

      // Second ring, slightly delayed
      const ring2Progress = Math.min(1, Math.max(0, fp * 2 - 0.15));
      const ring2Radius = 20 + ring2Progress * 100;
      const ring2Alpha = Math.max(0, 1 - ring2Progress);
      if (ring2Alpha > 0) {
        ctx.beginPath();
        ctx.arc(400, 300, ring2Radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 200, 50, ${ring2Alpha * 0.4})`;
        ctx.lineWidth = 2 * (1 - ring2Progress) + 1;
        ctx.stroke();
      }
    }

    const fontSize = Math.round(64 * scale);

    // White stroke outline (brush-stroke effect)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.font = `bold ${fontSize}px monospace`;
    ctx.strokeText('FIGHT!', 400, 300);

    // Color fill with glow
    ctx.shadowColor = '#ff4400';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#ff4400';
    ctx.fillText('FIGHT!', 400, 300);
    ctx.shadowBlur = 0;
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

// ===== Match End Screen =====

/** Draw MATCH END overlay with winner and round win markers */
export function drawMatchEnd(
  ctx: CanvasRenderingContext2D,
  winner: number | null,
  p1Wins: number,
  p2Wins: number,
): void {
  ctx.save();

  // Dark overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // "GAME" text with golden glow
  ctx.shadowColor = '#ff8800';
  ctx.shadowBlur = 20;
  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 72px monospace';
  ctx.fillText('GAME', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);
  ctx.shadowBlur = 0;

  // Winner announcement
  if (winner !== null) {
    ctx.fillStyle = winner === 0 ? '#ff6644' : '#4488ff';
    ctx.font = 'bold 32px monospace';
    ctx.fillText(`P${winner + 1} WINS THE MATCH`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  } else {
    ctx.fillStyle = '#ffcc00';
    ctx.font = 'bold 32px monospace';
    ctx.fillText('DRAW GAME', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  }

  // Win count markers (golden dots)
  const dotY = CANVAS_HEIGHT / 2 + 50;
  const dotSpacing = 22;
  // P1 wins on left
  for (let i = 0; i < p1Wins; i++) {
    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH / 2 - 50 + i * dotSpacing, dotY, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#ff6644';
    ctx.fill();
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  // P2 wins on right (drawn from center outward)
  for (let i = 0; i < p2Wins; i++) {
    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH / 2 + 50 - i * dotSpacing, dotY, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#4488ff';
    ctx.fill();
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // VS divider
  ctx.fillStyle = '#ffffff40';
  ctx.font = 'bold 16px monospace';
  ctx.fillText('VS', CANVAS_WIDTH / 2, dotY);

  // Continue hint
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '14px monospace';
  ctx.fillText('Press any key to continue', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 110);

  ctx.restore();
}

// ===== In-game Mode Indicator =====

/** Draw control mode badge (pill shape, shown briefly at round start / Tab press) */
export function drawModeIndicator(ctx: CanvasRenderingContext2D, simplifiedMode: boolean, alpha: number): void {
  ctx.save();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.globalAlpha = Math.min(1, alpha);
  const label = simplifiedMode ? '简化模式' : '标准模式';
  const bg = simplifiedMode ? 'rgba(0,180,80,0.85)' : 'rgba(60,60,100,0.85)';
  const border = simplifiedMode ? '#44ff88' : '#8888bb';
  const pw = 160, ph = 26, px = (CANVAS_WIDTH - pw) / 2, py = 52;
  ctx.fillStyle = bg; roundRect(ctx, px, py, pw, ph, 13); ctx.fill();
  ctx.strokeStyle = border; ctx.lineWidth = 1.5;
  roundRect(ctx, px, py, pw, ph, 13); ctx.stroke();
  ctx.font = 'bold 14px monospace'; ctx.fillStyle = '#fff';
  ctx.fillText(label, CANVAS_WIDTH / 2, py + ph / 2);
  ctx.globalAlpha = 1;
  ctx.restore();
}

// ===== Title Screen =====

export function drawTitle(ctx: CanvasRenderingContext2D, tick: number): void {
  ctx.save();

  // Dark gradient background
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  grad.addColorStop(0, '#0a0a1a');
  grad.addColorStop(0.5, '#0f0f2a');
  grad.addColorStop(1, '#050510');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Animated star particles
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  for (let i = 0; i < 40; i++) {
    const x = ((i * 137 + tick * 0.3) % CANVAS_WIDTH);
    const y = ((i * 97 + tick * 0.15) % CANVAS_HEIGHT);
    const s = 1 + Math.sin(tick * 0.05 + i) * 0.5;
    ctx.fillRect(x, y, s, s);
  }

  // Logo glow
  const glowAlpha = 0.15 + Math.sin(tick * 0.03) * 0.08;
  ctx.shadowColor = '#ff4400';
  ctx.shadowBlur = 40;
  ctx.fillStyle = `rgba(255,68,0,${glowAlpha})`;
  ctx.fillRect(CANVAS_WIDTH / 2 - 200, 120, 400, 60);

  // Title text
  ctx.shadowColor = '#ff6600';
  ctx.shadowBlur = 20;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 42px monospace';
  ctx.fillStyle = '#ff6600';
  ctx.fillText('KOF 2002', CANVAS_WIDTH / 2, 155);

  // Subtitle
  ctx.shadowBlur = 0;
  ctx.font = 'bold 18px monospace';
  ctx.fillStyle = '#cc8844';
  ctx.fillText('风云再起', CANVAS_WIDTH / 2, 195);

  // Decorative line
  ctx.strokeStyle = '#ff440066';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(CANVAS_WIDTH / 2 - 120, 215);
  ctx.lineTo(CANVAS_WIDTH / 2 + 120, 215);
  ctx.stroke();

  // PRESS START blinking
  if (Math.floor(tick / 30) % 2 === 0) {
    ctx.shadowColor = '#ffcc00';
    ctx.shadowBlur = 12;
    ctx.font = 'bold 22px monospace';
    ctx.fillStyle = '#ffcc00';
    ctx.fillText('PRESS START', CANVAS_WIDTH / 2, 320);
  }

  // Credits
  ctx.shadowBlur = 0;
  ctx.font = '12px monospace';
  ctx.fillStyle = '#555566';
  ctx.fillText('HTML5 Canvas + TypeScript', CANVAS_WIDTH / 2, 540);
  ctx.fillText('Tab: 简化模式  F1: 调试  R: 重置', CANVAS_WIDTH / 2, 560);

  ctx.restore();
}

// ===== Continue Screen =====

export function drawContinue(ctx: CanvasRenderingContext2D, secondsLeft: number): void {
  ctx.save();

  // Dark overlay
  ctx.fillStyle = 'rgba(0,0,0,0.85)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // CONTINUE? text
  ctx.shadowColor = '#ff2222';
  ctx.shadowBlur = 20;
  ctx.font = 'bold 48px monospace';
  ctx.fillStyle = '#ff4444';
  ctx.fillText('CONTINUE?', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);

  // Countdown
  ctx.shadowBlur = 10;
  ctx.font = 'bold 72px monospace';
  ctx.fillStyle = secondsLeft <= 3 ? '#ff2222' : '#ffcc00';
  ctx.fillText(`${secondsLeft}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);

  // Instruction
  ctx.shadowBlur = 0;
  ctx.font = '16px monospace';
  ctx.fillStyle = '#888899';
  ctx.fillText('Press J / Enter to continue', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 100);

  ctx.restore();
}