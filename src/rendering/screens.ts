/**
 * Screens — Character Select, Intro, KO
 */
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../core/constants.js';
import { ROSTER } from '../characters/index.js';
import { roundRect, drawSNKText } from './utils.js';
import { drawPixelPortrait } from './pixelPortraits.js';

// ===== Character Select =====

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

  // Background — dark with subtle animated pattern
  const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  bgGrad.addColorStop(0, '#080818');
  bgGrad.addColorStop(0.5, '#0c0c24');
  bgGrad.addColorStop(1, '#060614');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Animated diagonal stripes
  ctx.strokeStyle = 'rgba(255,255,255,0.02)';
  ctx.lineWidth = 1;
  for (let i = -20; i < 40; i++) {
    const xOff = (tick * 0.3) % 60;
    ctx.beginPath();
    ctx.moveTo(i * 60 + xOff, 0);
    ctx.lineTo(i * 60 + xOff - CANVAS_HEIGHT, CANVAS_HEIGHT);
    ctx.stroke();
  }

  // Title bar
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, 90);
  const titleGrad = ctx.createLinearGradient(0, 88, CANVAS_WIDTH, 88);
  titleGrad.addColorStop(0, '#cc880000');
  titleGrad.addColorStop(0.3, '#cc880088');
  titleGrad.addColorStop(0.5, '#ffcc4466');
  titleGrad.addColorStop(0.7, '#cc880088');
  titleGrad.addColorStop(1, '#cc880000');
  ctx.strokeStyle = titleGrad;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, 90); ctx.lineTo(CANVAS_WIDTH, 90); ctx.stroke();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  drawSNKText(ctx, 'SELECT YOUR FIGHTER', CANVAS_WIDTH / 2, 35, 34, '#ffcc00');
  drawSNKText(ctx, 'P1: A/D select  J confirm  |  T: toggle AI  |  Tab: toggle mode', CANVAS_WIDTH / 2, 72, 11, '#999999');

  // Character cards
  const cols = ROSTER.length;
  const cardW = 130;
  const cardH = 190;
  const gap = 16;
  const totalW = cols * cardW + (cols - 1) * gap;
  const startX = (CANVAS_WIDTH - totalW) / 2;
  const startY = 110;

  for (let i = 0; i < cols; i++) {
    const char = ROSTER[i];
    const cx = startX + i * (cardW + gap);
    const cy = startY;
    const isP1Here = p1Cursor === i;
    const isP2Here = p2Cursor === i;

    // Card background with gradient
    const cardGrad = ctx.createLinearGradient(cx, cy, cx, cy + cardH);
    cardGrad.addColorStop(0, '#14142a');
    cardGrad.addColorStop(1, '#0e0e1e');
    ctx.fillStyle = cardGrad;
    roundRect(ctx, cx, cy, cardW, cardH, 10);
    ctx.fill();

    // Card border
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    roundRect(ctx, cx, cy, cardW, cardH, 10);
    ctx.stroke();

    // Character accent color bar at top
    ctx.fillStyle = char.color + '44';
    ctx.fillRect(cx + 8, cy + 8, cardW - 16, 3);

    // Portrait area
    const portraitY = cy + 18;
    ctx.fillStyle = '#0a0a18';
    roundRect(ctx, cx + 12, portraitY, cardW - 24, 80, 6);
    ctx.fill();

    if (char.pixelPortrait) {
      const portraitScale = 2;
      const pw = char.pixelPortrait.width * portraitScale;
      const ph = char.pixelPortrait.height * portraitScale;
      const px = cx + 12 + ((cardW - 24) - pw) / 2;
      const py = portraitY + (80 - ph) / 2;
      drawPixelPortrait(ctx, char.pixelPortrait, px, py, portraitScale);
    } else {
      const charGrad = ctx.createLinearGradient(cx + 18, portraitY + 5, cx + cardW - 18, portraitY + 75);
      charGrad.addColorStop(0, char.color);
      charGrad.addColorStop(1, char.accentColor);
      ctx.fillStyle = charGrad;
      roundRect(ctx, cx + 18, portraitY + 5, cardW - 36, 70, 4);
      ctx.fill();
      ctx.font = '36px serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.fillText(char.portrait, cx + cardW / 2, portraitY + 48);
    }

    // Character name — SNK style
    drawSNKText(ctx, char.nameCn, cx + cardW / 2, cy + 120, 15, '#eeeeee');
    drawSNKText(ctx, char.name, cx + cardW / 2, cy + 136, 9, '#777777');

    // Ready indicator — SNK style
    if ((p1Ready && isP1Here) || (p2Ready && isP2Here)) {
      const label = p1Ready && isP1Here ? 'P1 OK!' : 'P2 OK!';
      drawSNKText(ctx, label, cx + cardW / 2, cy + cardH - 25, 13, '#ffcc00');
    }

    // Selection highlight — glowing border
    if (isP1Here) {
      const pulse = 0.5 + Math.sin(tick * 0.1) * 0.3;
      ctx.strokeStyle = p1Ready ? `rgba(255, 204, 0, ${pulse})` : `rgba(255, 68, 68, ${pulse})`;
      ctx.lineWidth = 3;
      roundRect(ctx, cx - 3, cy - 3, cardW + 6, cardH + 6, 12);
      ctx.stroke();
      drawSNKText(ctx, 'P1', cx + cardW / 2, cy - 10, 11, '#ff4444');
    }
    if (isP2Here) {
      const pulse = 0.5 + Math.sin(tick * 0.1 + 1) * 0.3;
      ctx.strokeStyle = p2Ready ? `rgba(255, 204, 0, ${pulse})` : `rgba(68, 136, 255, ${pulse})`;
      ctx.lineWidth = 3;
      roundRect(ctx, cx - 3, cy - 3, cardW + 6, cardH + 6, 12);
      ctx.stroke();
      drawSNKText(ctx, 'P2', cx + cardW / 2, cy + cardH + 14, 11, '#4488ff');
    }
  }

  // Bottom panel — player info + VS
  const panelY = 340;
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, panelY - 10, CANVAS_WIDTH, 130);
  // Divider
  const divGrad = ctx.createLinearGradient(0, panelY - 10, CANVAS_WIDTH, panelY - 10);
  divGrad.addColorStop(0, '#cc880000');
  divGrad.addColorStop(0.5, '#cc880088');
  divGrad.addColorStop(1, '#cc880000');
  ctx.strokeStyle = divGrad;
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, panelY - 10); ctx.lineTo(CANVAS_WIDTH, panelY - 10); ctx.stroke();

  // P1 info — SNK style
  const p1Char = ROSTER[p1Cursor];
  drawSNKText(ctx, 'P1', 50, panelY + 10, 14, '#ff4444', '#000000', 'left');
  drawSNKText(ctx, p1Char.nameCn, 40, panelY + 40, 24, p1Char.color, '#000000', 'left');
  drawSNKText(ctx, p1Char.name, 40, panelY + 58, 10, '#888888', '#000000', 'left');
  drawSNKText(ctx, p1Ready ? 'READY!' : 'J to confirm', 40, panelY + 78, 12, p1Ready ? '#ffcc00' : '#666666', '#000000', 'left');

  // P2 info — SNK style
  const p2Char = ROSTER[p2Cursor];
  drawSNKText(ctx, 'P2', CANVAS_WIDTH - 50, panelY + 10, 14, '#4488ff', '#000000', 'right');
  drawSNKText(ctx, p2Char.nameCn, CANVAS_WIDTH - 40, panelY + 40, 24, p2Char.color, '#000000', 'right');
  drawSNKText(ctx, p2Char.name, CANVAS_WIDTH - 40, panelY + 58, 10, '#888888', '#000000', 'right');
  drawSNKText(ctx, p2Ready ? 'READY!' : p2IsAI ? '[AI]' : 'Numpad to confirm', CANVAS_WIDTH - 40, panelY + 78, 12, p2Ready ? '#ffcc00' : '#666666', '#000000', 'right');

  // VS in center — SNK style
  drawSNKText(ctx, 'VS', CANVAS_WIDTH / 2, panelY + 40, 56, 'rgba(255,255,255,0.08)');

  // AI toggle
  ctx.fillStyle = p2IsAI ? '#44ff88' : '#ff6644';
  ctx.font = 'bold 12px "Courier New", monospace';
  ctx.fillText(p2IsAI ? 'AI ON' : 'P2 Human', CANVAS_WIDTH / 2, panelY + 78);

  // Mode tabs
  if (!p1Ready || !p2Ready) {
    const modeY = 495;
    const tabs = [
      { label: 'Standard', desc: 'QCF motions', active: !simplifiedMode, x: 330 },
      { label: 'Simplified', desc: 'U/I/O buttons', active: simplifiedMode, x: 470 },
    ];
    for (const t of tabs) {
      const tw = 120, th = 28;
      ctx.fillStyle = t.active ? 'rgba(0,180,80,0.85)' : 'rgba(40,40,60,0.8)';
      roundRect(ctx, t.x - tw / 2, modeY, tw, th, 6); ctx.fill();
      ctx.strokeStyle = t.active ? '#44ff88' : '#555';
      ctx.lineWidth = t.active ? 2 : 1;
      roundRect(ctx, t.x - tw / 2, modeY, tw, th, 6); ctx.stroke();
      ctx.font = 'bold 12px "Courier New", monospace'; ctx.textAlign = 'center';
      ctx.fillStyle = t.active ? '#fff' : '#999';
      ctx.fillText(t.label, t.x, modeY + th / 2);
      ctx.font = '9px "Courier New", monospace';
      ctx.fillStyle = t.active ? '#ccffcc' : '#666';
      ctx.fillText(t.desc, t.x, modeY + th + 12);
    }
  }

  // Start hint
  if (p1Ready && p2Ready) {
    const blink = Math.sin(tick * 0.15) > 0;
    if (blink) {
      ctx.shadowColor = '#ffcc00';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#ffcc00';
      ctx.font = 'bold 20px "Courier New", monospace';
      ctx.fillText('GAME START!', CANVAS_WIDTH / 2, 530);
      ctx.shadowBlur = 0;
    }
  }

  ctx.textAlign = 'left';
  ctx.restore();
}

// ===== Intro Overlay =====

export function drawIntro(ctx: CanvasRenderingContext2D, phaseTimer: number, currentRound: number = 1, p1Name: string = '', p2Name: string = ''): void {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (phaseTimer < 60) {
    const progress = phaseTimer / 60;
    const scale = 1 + Math.max(0, 1 - progress * 3) * 0.5;
    ctx.globalAlpha = Math.min(1, progress * 4);
    const fontSize = Math.round(48 * scale);

    // Black bars top/bottom for cinematic feel
    const barAlpha = Math.min(1, progress * 2) * 0.7;
    ctx.fillStyle = `rgba(0,0,0,${barAlpha})`;
    ctx.fillRect(0, 0, CANVAS_WIDTH, 100);
    ctx.fillRect(0, CANVAS_HEIGHT - 100, CANVAS_WIDTH, 100);

    // "ROUND X" — SNK style with roman numeral subtitle
    ctx.shadowColor = '#ff8800';
    ctx.shadowBlur = 15;
    drawSNKText(ctx, `ROUND ${currentRound}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20, fontSize, '#ffcc00');
    ctx.shadowBlur = 0;
    // KOF2002: 回合罗马数字装饰
    const romanNumerals = ['', 'I', 'II', 'III', 'IV', 'V'];
    const roman = romanNumerals[currentRound] || `${currentRound}`;
    drawSNKText(ctx, roman, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10, 14, 'rgba(200,168,50,0.6)');

    // 角色名显示 — SNK style
    if (p1Name && p2Name) {
      ctx.globalAlpha = Math.min(1, progress * 3);
      drawSNKText(ctx, p1Name, CANVAS_WIDTH / 2 - 30, CANVAS_HEIGHT / 2 + 15, 16, '#ff6644', '#000000', 'right');
      drawSNKText(ctx, p2Name, CANVAS_WIDTH / 2 + 30, CANVAS_HEIGHT / 2 + 15, 16, '#4488ff', '#000000', 'left');
      drawSNKText(ctx, 'VS', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 15, 14, '#ffcc00');
    }
  } else if (phaseTimer < 100) {
    const fp = (phaseTimer - 60) / 40;
    const scale = 1 + Math.max(0, 1 - fp * 4) * 1.5;
    const alpha = fp < 0.1 ? fp * 10 : Math.max(0, 1 - (fp - 0.5) * 2);
    ctx.globalAlpha = Math.min(1, Math.max(0, alpha));

    // Expanding shockwave rings
    for (let r = 0; r < 3; r++) {
      const ringDelay = r * 0.1;
      const ringProgress = Math.min(1, Math.max(0, fp * 2 - ringDelay));
      if (ringProgress <= 0) continue;
      const ringRadius = 20 + ringProgress * (130 - r * 20);
      const ringAlpha = Math.max(0, 1 - ringProgress) * (1 - r * 0.3);
      if (ringAlpha > 0) {
        ctx.beginPath();
        ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, ${100 + r * 60}, 0, ${ringAlpha * 0.5})`;
        ctx.lineWidth = (3 - r) * (1 - ringProgress) + 1;
        ctx.stroke();
      }
    }

    const fontSize = Math.round(64 * scale);
    ctx.shadowColor = '#ff4400';
    ctx.shadowBlur = 25;
    drawSNKText(ctx, 'FIGHT!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20, fontSize, '#ff4400');
    ctx.shadowBlur = 0;
  }

  ctx.restore();
}

// ===== KO Screen =====

export function drawKO(ctx: CanvasRenderingContext2D, winner: number | null, perfectPlayer: number | null = null, isTimeOver: boolean = false, p1Hp: number = 0, p2Hp: number = 0, maxHp: number = 1000): void {
  ctx.save();

  // Dark overlay with red vignette
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  const vigGrad = ctx.createRadialGradient(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 100, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 400);
  vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
  vigGrad.addColorStop(0.7, 'rgba(80,0,0,0.15)');
  vigGrad.addColorStop(1, 'rgba(100,0,0,0.3)');
  ctx.fillStyle = vigGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const titleText = isTimeOver ? 'TIME OVER' : 'K.O.!';
  const titleColor = isTimeOver ? '#ffaa00' : '#ff2200';
  const glowColor = isTimeOver ? '#ff8800' : '#ff0000';

  // KO/Time Over shockwave rings
  for (let r = 0; r < 3; r++) {
    const ringR = 60 + r * 50;
    ctx.globalAlpha = 0.15 - r * 0.04;
    ctx.strokeStyle = isTimeOver ? '#ffaa00' : '#ff4400';
    ctx.lineWidth = 3 - r;
    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20, ringR, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Title text — SNK style with dramatic glow
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 60;
  drawSNKText(ctx, titleText, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20, isTimeOver ? 72 : 100, titleColor);
  ctx.shadowBlur = 0;

  if (winner !== null) {
    const wColor = winner === 0 ? '#ff6644' : '#4488ff';
    ctx.shadowColor = wColor;
    ctx.shadowBlur = 12;
    drawSNKText(ctx, `P${winner + 1} WINS`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50, 28, wColor);
    ctx.shadowBlur = 0;
  } else {
    ctx.shadowColor = '#ffcc00';
    ctx.shadowBlur = 12;
    drawSNKText(ctx, 'DOUBLE KO', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50, 28, '#ffcc00');
    ctx.shadowBlur = 0;
  }

  if (perfectPlayer !== null) {
    ctx.shadowColor = '#ffcc00';
    ctx.shadowBlur = 35;
    drawSNKText(ctx, 'PERFECT!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 100, 42, '#ffcc00');
    ctx.shadowBlur = 0;
    // P标签 — SNK style
    const perfColor = perfectPlayer === 0 ? '#ff6644' : '#4488ff';
    drawSNKText(ctx, `P${perfectPlayer + 1}`, CANVAS_WIDTH / 2 - 80, CANVAS_HEIGHT / 2 + 100, 16, perfColor);
  }

  // KOF2002: Time Over时显示血量对比条
  if (isTimeOver && winner !== null) {
    const barY = CANVAS_HEIGHT / 2 + 85;
    const barW = 200;
    const barH = 12;
    const barX = CANVAS_WIDTH / 2 - barW / 2;
    const p1Ratio = Math.max(0, p1Hp / maxHp);
    const p2Ratio = Math.max(0, p2Hp / maxHp);
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    roundRect(ctx, barX - 2, barY - 2, barW + 4, barH + 4, 4);
    ctx.fill();
    ctx.fillStyle = '#ff6644';
    roundRect(ctx, barX, barY, barW * p1Ratio, barH, 3);
    ctx.fill();
    ctx.fillStyle = '#4488ff';
    roundRect(ctx, barX + barW * p1Ratio, barY, barW * p2Ratio, barH, 3);
    ctx.fill();
    ctx.strokeStyle = 'rgba(200,168,50,0.4)';
    ctx.lineWidth = 1;
    roundRect(ctx, barX, barY, barW, barH, 3);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = '13px "Courier New", monospace';
  ctx.fillText('Press R to restart', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 140);

  ctx.restore();
}
