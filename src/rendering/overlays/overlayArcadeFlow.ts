/**
 * Arcade flow screens — Arcade Complete, Next Match transition
 * Split from overlayScreens.ts
 */
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../core/constants.js';
import { roundRect, drawSNKText } from '../utils.js';
import { drawPixelPortrait } from '../pixelPortraits.js';
import { getPortraitForSize } from '../manifestRenderData.js';
import type { PortraitSize } from '../../core/portraitManifest.js';

// ===== Round Score Breakdown Popup =====

export interface RoundScoreBreakdown {
  baseScore: number;
  hpBonus: number;
  perfectBonus: number;
  totalScore: number;
  isPerfect: boolean;
}

export function drawRoundScoreBreakdown(
  ctx: CanvasRenderingContext2D,
  timer: number,
  breakdown: RoundScoreBreakdown,
): void {
  ctx.save();

  const fadeIn = Math.min(1, timer / 20);
  ctx.globalAlpha = fadeIn;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  const panelW = 200;
  const panelH = breakdown.isPerfect ? 120 : 100;
  const panelX = CANVAS_WIDTH - panelW - 12;
  const panelY = 100;

  // Background
  ctx.fillStyle = 'rgba(5, 5, 15, 0.85)';
  roundRect(ctx, panelX, panelY, panelW, panelH, 6);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 200, 60, 0.4)';
  ctx.lineWidth = 1;
  roundRect(ctx, panelX, panelY, panelW, panelH, 6);
  ctx.stroke();

  // Header
  ctx.fillStyle = 'rgba(255, 200, 60, 0.12)';
  ctx.fillRect(panelX + 1, panelY + 1, panelW - 2, 16);
  ctx.font = 'bold 9px "Courier New", monospace';
  ctx.fillStyle = '#ddb840';
  ctx.fillText('ROUND BONUS', panelX + 8, panelY + 4);

  // Staggered row reveal
  const rows: Array<{ label: string; value: string; color: string; delay: number }> = [
    { label: 'WIN', value: `+${breakdown.baseScore}`, color: '#aaccff', delay: 20 },
    { label: 'HP BONUS', value: `+${breakdown.hpBonus}`, color: '#88ff88', delay: 30 },
  ];
  if (breakdown.isPerfect) {
    rows.push({ label: 'PERFECT!', value: `+${breakdown.perfectBonus}`, color: '#ff44ff', delay: 40 });
  }

  let rowY = panelY + 22;
  for (const row of rows) {
    const rowAlpha = Math.min(1, Math.max(0, (timer - row.delay) / 12));
    if (rowAlpha <= 0) { rowY += 18; continue; }
    ctx.globalAlpha = fadeIn * rowAlpha;
    ctx.font = '9px "Courier New", monospace';
    ctx.fillStyle = '#888';
    ctx.fillText(row.label, panelX + 10, rowY);
    ctx.textAlign = 'right';
    ctx.fillStyle = row.color;
    ctx.fillText(row.value, panelX + panelW - 10, rowY);
    ctx.textAlign = 'left';
    rowY += 18;
  }

  // Separator
  const sepAlpha = Math.min(1, Math.max(0, (timer - 50) / 10));
  if (sepAlpha > 0) {
    ctx.globalAlpha = fadeIn * sepAlpha;
    ctx.strokeStyle = 'rgba(255, 200, 60, 0.3)';
    ctx.beginPath();
    ctx.moveTo(panelX + 8, rowY);
    ctx.lineTo(panelX + panelW - 8, rowY);
    ctx.stroke();
    rowY += 6;

    // Total — animated counter
    const totalAlpha = Math.min(1, Math.max(0, (timer - 55) / 10));
    ctx.globalAlpha = fadeIn * totalAlpha;
    ctx.font = 'bold 14px "Courier New", monospace';
    ctx.fillStyle = '#ffcc00';
    ctx.fillText('TOTAL', panelX + 10, rowY);
    ctx.textAlign = 'right';
    // Animate the counter from 0 to total
    const countProgress = Math.min(1, Math.max(0, (timer - 55) / 25));
    const displayTotal = Math.round(breakdown.totalScore * countProgress);
    ctx.shadowColor = '#ffcc00';
    ctx.shadowBlur = 8;
    ctx.fillText(displayTotal.toString(), panelX + panelW - 10, rowY);
    ctx.shadowBlur = 0;
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}

// ===== Arcade Complete Screen =====

export interface ArcadeStats {
  score: number;
  perfects: number;
  matches: number;
  longestCombo: number;
  totalDamage: number;
}

export function drawArcadeComplete(ctx: CanvasRenderingContext2D, timer: number, stats?: ArcadeStats): void {
  ctx.save();

  ctx.fillStyle = 'rgba(0, 0, 0, 0.92)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Golden sparkle particles
  const sparkleCount = 25;
  for (let i = 0; i < sparkleCount; i++) {
    const sx = (Math.sin(timer * 0.02 + i * 1.3) * 0.5 + 0.5) * CANVAS_WIDTH;
    const sy = (Math.cos(timer * 0.015 + i * 2.1) * 0.5 + 0.5) * CANVAS_HEIGHT;
    const sa = (0.3 + Math.sin(timer * 0.08 + i * 0.7) * 0.3) * Math.min(1, timer / 30);
    const ss = 2 + Math.sin(timer * 0.1 + i) * 1;
    if (sa > 0) {
      ctx.fillStyle = `rgba(255, 220, 100, ${sa})`;
      ctx.beginPath();
      ctx.moveTo(sx, sy - ss);
      ctx.lineTo(sx + ss * 0.35, sy);
      ctx.lineTo(sx, sy + ss);
      ctx.lineTo(sx - ss * 0.35, sy);
      ctx.closePath();
      ctx.fill();
    }
  }

  const fadeIn = Math.min(1, timer / 30);
  ctx.globalAlpha = fadeIn;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // CONGRATULATIONS — gold glow
  const textProgress = Math.min(1, timer / 20);
  const textScale = 1 + (1 - textProgress) * 0.3;
  ctx.shadowColor = '#ffcc00';
  ctx.shadowBlur = 40;
  drawSNKText(ctx, 'CONGRATULATIONS', CANVAS_WIDTH / 2, 70, Math.round(48 * textScale), '#ffcc00');
  ctx.shadowBlur = 0;

  // Subtitle
  const subAlpha = Math.min(1, Math.max(0, (timer - 15) / 20));
  ctx.globalAlpha = subAlpha;
  drawSNKText(ctx, 'YOU HAVE DEFEATED ALL OPPONENTS', CANVAS_WIDTH / 2, 110, 14, '#ff8844');

  // Results panel — staggered reveal
  if (stats && timer > 30) {
    const panelAlpha = Math.min(1, (timer - 30) / 20);
    ctx.globalAlpha = panelAlpha;

    // Panel background
    const panelX = CANVAS_WIDTH / 2 - 180;
    const panelY = 140;
    const panelW = 360;
    const panelH = 200;
    ctx.fillStyle = 'rgba(20, 15, 5, 0.85)';
    ctx.strokeStyle = 'rgba(255, 200, 80, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelW, panelH, 4);
    ctx.fill();
    ctx.stroke();

    // Stats rows
    const rows: Array<{ label: string; value: string; color: string }> = [
      { label: 'TOTAL SCORE', value: stats.score.toLocaleString(), color: '#ffcc00' },
      { label: 'MATCHES WON', value: `${stats.matches}`, color: '#66ccff' },
      { label: 'PERFECT ROUNDS', value: `${stats.perfects}`, color: stats.perfects > 0 ? '#ff44ff' : '#888' },
      { label: 'MAX COMBO', value: `${stats.longestCombo} HITS`, color: stats.longestCombo >= 10 ? '#ff6644' : '#aaa' },
      { label: 'TOTAL DAMAGE', value: `${stats.totalDamage.toLocaleString()}`, color: '#88ff88' },
    ];

    ctx.textAlign = 'left';
    const rowH = 30;
    const startY = panelY + 25;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowAlpha = Math.min(1, Math.max(0, (timer - 40 - i * 8) / 12));
      if (rowAlpha <= 0) continue;
      ctx.globalAlpha = panelAlpha * rowAlpha;

      const y = startY + i * rowH;
      // Label
      drawSNKText(ctx, row.label, panelX + 20, y, 11, '#999');
      // Value (right-aligned)
      ctx.textAlign = 'right';
      ctx.shadowColor = row.color;
      ctx.shadowBlur = 8;
      drawSNKText(ctx, row.value, panelX + panelW - 20, y, 16, row.color);
      ctx.shadowBlur = 0;
      ctx.textAlign = 'left';

      // Separator line
      if (i < rows.length - 1) {
        ctx.strokeStyle = 'rgba(255, 200, 80, 0.15)';
        ctx.beginPath();
        ctx.moveTo(panelX + 15, y + rowH / 2 + 2);
        ctx.lineTo(panelX + panelW - 15, y + rowH / 2 + 2);
        ctx.stroke();
      }
    }

    // Grade badge
    if (timer > 80) {
      const gradeAlpha = Math.min(1, (timer - 80) / 15);
      ctx.globalAlpha = gradeAlpha;
      let grade: string;
      let gradeColor: string;
      if (stats.perfects >= 3 && stats.longestCombo >= 15) { grade = 'S'; gradeColor = '#ffcc00'; }
      else if (stats.perfects >= 2 || stats.longestCombo >= 10) { grade = 'A'; gradeColor = '#ff6644'; }
      else if (stats.perfects >= 1 || stats.longestCombo >= 5) { grade = 'B'; gradeColor = '#66ccff'; }
      else { grade = 'C'; gradeColor = '#aaa'; }

      const gradeX = CANVAS_WIDTH / 2;
      const gradeY = panelY + panelH + 50;
      ctx.shadowColor = gradeColor;
      ctx.shadowBlur = 30;
      drawSNKText(ctx, grade, gradeX, gradeY, 72, gradeColor);
      ctx.shadowBlur = 0;
      drawSNKText(ctx, 'RANK', gradeX, gradeY - 42, 12, '#888');
    }
  }

  ctx.textAlign = 'center';

  // Press any key
  const pressAlpha = 0.3 + Math.sin(timer * 0.06) * 0.2;
  ctx.globalAlpha = pressAlpha;
  drawSNKText(ctx, 'PRESS ANY KEY', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 40, 13, 'rgba(255,255,255,0.7)');
  ctx.globalAlpha = 1;

  ctx.restore();
}

// ===== Next Match Transition =====

export function drawNextMatch(
  ctx: CanvasRenderingContext2D,
  timer: number,
  nextChar: import('../../characters/types.js').CharacterDefinition | undefined,
  stageNumber: number,
  totalStages: number,
  isRivalStage: boolean = false,
  upcomingChars: import('../../characters/types.js').CharacterDefinition[] = [],
): void {
  ctx.save();

  ctx.fillStyle = 'rgba(0, 0, 0, 0.92)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Red accent pulse
  const pulseAlpha = 0.05 + Math.sin(timer * 0.04) * 0.03;
  ctx.fillStyle = `rgba(80, 20, 0, ${pulseAlpha})`;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Diagonal scan lines for arcade feel
  ctx.strokeStyle = `rgba(255, 120, 40, ${0.02 + Math.sin(timer * 0.03) * 0.01})`;
  ctx.lineWidth = 0.5;
  for (let i = -10; i < 30; i++) {
    const xOff = (timer * 0.2) % 60;
    ctx.beginPath();
    ctx.moveTo(i * 60 + xOff, 0);
    ctx.lineTo(i * 60 + xOff - CANVAS_HEIGHT, CANVAS_HEIGHT);
    ctx.stroke();
  }

  const fadeIn = Math.min(1, timer / 20);
  ctx.globalAlpha = fadeIn;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // "NEXT STAGE" header — KOF-style scaling entrance
  const headerProgress = Math.min(1, timer / 15);
  const headerScale = 1 + (1 - headerProgress) * 0.8;

  // Energy ring burst
  if (timer < 30) {
    const ringP = timer / 30;
    const ringR = 30 + ringP * 200;
    const ringA = (1 - ringP) * 0.4;
    ctx.strokeStyle = `rgba(255, 140, 40, ${ringA})`;
    ctx.lineWidth = (3 - ringP * 2);
    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 80, ringR, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.shadowColor = '#ff8800';
  ctx.shadowBlur = 25;
  drawSNKText(ctx, `STAGE ${stageNumber}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 80, Math.round(36 * headerScale), '#ff8800');
  ctx.shadowBlur = 0;

  // "NEXT CHALLENGER" subtitle
  const ncAlpha = Math.min(1, Math.max(0, (timer - 8) / 15));
  ctx.globalAlpha = ncAlpha * fadeIn;
  drawSNKText(ctx, 'NEXT CHALLENGER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60, 13, 'rgba(255,180,100,0.8)');
  ctx.globalAlpha = fadeIn;

  // Rival stage badge — KOF2002: final rival gets dramatic treatment
  if (isRivalStage) {
    const rivalAlpha = Math.min(1, Math.max(0, (timer - 5) / 12));
    ctx.globalAlpha = rivalAlpha * fadeIn;
    // Red pulse overlay for rival intensity
    const redPulse = 0.03 + Math.sin(timer * 0.06) * 0.02;
    ctx.fillStyle = `rgba(180, 0, 0, ${redPulse})`;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.shadowColor = '#ff2200';
    ctx.shadowBlur = 20;
    drawSNKText(ctx, '宿敵決戦 · RIVAL MATCH', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 70, 14, '#ff4444');
    ctx.shadowBlur = 0;
    ctx.globalAlpha = fadeIn;
  }

  // Stage name subtitle
  const allStages: string[] = ['temple', 'china', 'factory', 'orochi', 'street', 'rooftop'];
  const stageNames: Record<string, string> = {
    temple: '日本寺庙 · Japan',
    china: '唐人街 · China',
    factory: '工場 · Factory',
    orochi: '大蛇神社 · Orochi',
    street: '街市夜市 · Street',
    rooftop: '日本屋上 · Rooftop',
  };
  const currentStageName = stageNames[allStages[(stageNumber - 1) % allStages.length]] ?? '';
  const stageAlpha = Math.min(1, Math.max(0, (timer - 5) / 15));
  ctx.globalAlpha = stageAlpha * fadeIn;
  drawSNKText(ctx, currentStageName, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50, 12, 'rgba(200,180,160,0.7)');
  ctx.globalAlpha = fadeIn;

  // Stage progress bar
  const barW = 200;
  const barH = 6;
  const barX = CANVAS_WIDTH / 2 - barW / 2;
  const barY = CANVAS_HEIGHT / 2 - 45;
  ctx.fillStyle = 'rgba(40, 40, 60, 0.8)';
  roundRect(ctx, barX, barY, barW, barH, 3);
  ctx.fill();
  const ratio = stageNumber / totalStages;
  ctx.fillStyle = '#ff8800';
  if (barW * ratio > 0) {
    roundRect(ctx, barX, barY, barW * ratio, barH, 3);
    ctx.fill();
  }

  // Next opponent info with portrait preview
  if (nextChar) {
    const infoAlpha = Math.min(1, Math.max(0, (timer - 10) / 20));
    ctx.globalAlpha = infoAlpha;

    // Opponent portrait — KOF2002: next challenger portrait reveal
    const nextPortrait = getPortraitForSize(nextChar.id, 'select' as PortraitSize) ?? nextChar.pixelPortrait;
    const portraitAlpha = Math.min(1, Math.max(0, (timer - 15) / 15));
    ctx.globalAlpha = portraitAlpha * infoAlpha;
    if (nextPortrait) {
      const pScale = nextPortrait.width >= 120 ? 2.2 : 3.5;
      const pw = nextPortrait.width * pScale;
      const ph = nextPortrait.height * pScale;
      const ppx = CANVAS_WIDTH / 2 - pw / 2;
      const ppy = CANVAS_HEIGHT / 2 - 115;
      // Portrait backdrop
      ctx.fillStyle = 'rgba(8, 8, 18, 0.85)';
      roundRect(ctx, ppx - 6, ppy - 6, pw + 12, ph + 12, 6);
      ctx.fill();
      // Animated border glow
      const borderPulse = 0.5 + Math.sin(timer * 0.08) * 0.3;
      ctx.strokeStyle = nextChar.color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = portraitAlpha * infoAlpha * borderPulse;
      roundRect(ctx, ppx - 6, ppy - 6, pw + 12, ph + 12, 6);
      ctx.stroke();
      ctx.globalAlpha = portraitAlpha * infoAlpha;
      drawPixelPortrait(ctx, nextPortrait, ppx, ppy, pScale, {
        frameColor: nextChar.color,
        backdropColor: 'rgba(8, 8, 18, 0.9)',
        scanlines: true,
      });
    }
    ctx.globalAlpha = infoAlpha;

    // "VS" label
    ctx.shadowColor = nextChar.color;
    ctx.shadowBlur = 20;
    drawSNKText(ctx, 'VS', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + (nextPortrait ? -15 : 0), 28, '#ffcc00');
    ctx.shadowBlur = 0;

    // Opponent name
    const nameProgress = Math.min(1, Math.max(0, (timer - 20) / 15));
    ctx.globalAlpha = nameProgress * infoAlpha;
    ctx.shadowColor = nextChar.color;
    ctx.shadowBlur = 15;
    const nameY = CANVAS_HEIGHT / 2 + (nextPortrait ? 25 : 45);
    drawSNKText(ctx, nextChar.nameCn, CANVAS_WIDTH / 2, nameY, 36, nextChar.color);
    ctx.shadowBlur = 0;
    // English subtitle
    if (nextChar.name) {
      ctx.globalAlpha = nameProgress * infoAlpha * 0.6;
      ctx.fillStyle = '#aaa';
      ctx.font = '10px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(nextChar.name, CANVAS_WIDTH / 2, nameY + 18);
    }

    // Character color accent bar
    const accentW = 120;
    const accentH = 3;
    const accentX = CANVAS_WIDTH / 2 - accentW / 2;
    const accentY = CANVAS_HEIGHT / 2 + (nextPortrait ? 50 : 70);
    const accentGrad = ctx.createLinearGradient(accentX, 0, accentX + accentW, 0);
    accentGrad.addColorStop(0, nextChar.color + '00');
    accentGrad.addColorStop(0.5, nextChar.color + 'cc');
    accentGrad.addColorStop(1, nextChar.color + '00');
    ctx.fillStyle = accentGrad;
    ctx.fillRect(accentX, accentY, accentW, accentH);
  }

  // Upcoming opponents preview — show next 2 fighters
  if (upcomingChars.length > 0) {
    const upAlpha = Math.min(1, Math.max(0, (timer - 30) / 15));
    ctx.globalAlpha = upAlpha;
    ctx.font = '9px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#777';
    ctx.fillText('COMING UP', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 90);
    for (let i = 0; i < upcomingChars.length; i++) {
      const uc = upcomingChars[i];
      if (!uc) continue;
      const upY = CANVAS_HEIGHT / 2 + 102 + i * 14;
      ctx.fillStyle = uc.color;
      ctx.font = '10px "Courier New", monospace';
      ctx.fillText(`${stageNumber + i + 1}. ${uc.nameCn}`, CANVAS_WIDTH / 2, upY);
    }
    ctx.globalAlpha = fadeIn;
  }

  // "PRESS START" prompt
  const promptAlpha = timer > 40 ? 0.3 + Math.sin(timer * 0.06) * 0.2 : 0;
  ctx.globalAlpha = promptAlpha;
  drawSNKText(ctx, 'PRESS START', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 110, 13, 'rgba(255,255,255,0.7)');

  ctx.globalAlpha = 1;
  ctx.restore();
}

