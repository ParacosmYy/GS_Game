/**
 * Stage Select and Team Order Select screens
 * Split from screens.ts
 */
import {
  CANVAS_WIDTH, CANVAS_HEIGHT,
} from '../../core/constants.js';
import { ROSTER } from '../../characters/index.js';
import { roundRect, drawSNKText } from '../utils.js';
import { drawPixelPortrait } from '../pixelPortraits.js';
import type { PixelPortraitData } from '../pixelPortraits.js';
import { getPortraitForSize } from '../manifestRenderData.js';
import type { CharacterDefinition } from '../../characters/types.js';
import type { StageId } from '../stage.js';
import { getBestPortrait, drawPortraitFitVisibleBoundsInBox } from './characterSelect.js';

// Stage constants (shared from winQuoteAnnounce for consistency)
const ALL_STAGES: StageId[] = ['temple', 'china', 'factory', 'orochi', 'street', 'rooftop'];
const STAGE_PREVIEW_W = 120;
const STAGE_PREVIEW_H = 68;
const STAGE_PREVIEW_GAP = 16;
const STAGE_THEMES: Record<string, { bg1: string; bg2: string; accent: string; pattern: string }> = {
  temple: { bg1: '#2a1a0a', bg2: '#1a0e04', accent: '#cc8844', pattern: 'dots' },
  china: { bg1: '#1a0808', bg2: '#0e0404', accent: '#ff4444', pattern: 'stripes' },
  factory: { bg1: '#1a1a22', bg2: '#0e0e14', accent: '#4488cc', pattern: 'grid' },
  orochi: { bg1: '#0a0a1a', bg2: '#04040e', accent: '#8844ff', pattern: 'waves' },
  street: { bg1: '#1a1a0a', bg2: '#0e0e04', accent: '#cccc44', pattern: 'cross' },
  rooftop: { bg1: '#0a1a1a', bg2: '#040e0e', accent: '#44cccc', pattern: 'diamonds' },
};

// Stage name mapping
const STAGE_NAMES: Record<StageId, string> = {
  temple: '日本寺庙 · Japan',
  china: '唐人街 · China',
  factory: '工場 · Factory',
  orochi: '大蛇神社 · Orochi',
  street: '街市夜市 · Street',
  rooftop: '日本屋上 · Rooftop',
};

export function drawStageSelect(
  ctx: CanvasRenderingContext2D,
  tick: number,
  cursor: number,
  ready: boolean,
): void {
  ctx.save();

  const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  bgGrad.addColorStop(0, '#080818');
  bgGrad.addColorStop(0.5, '#0c0c24');
  bgGrad.addColorStop(1, '#060614');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.strokeStyle = 'rgba(255,255,255,0.02)';
  ctx.lineWidth = 1;
  for (let i = -20; i < 40; i++) {
    const xOff = (tick * 0.3) % 60;
    ctx.beginPath();
    ctx.moveTo(i * 60 + xOff, 0);
    ctx.lineTo(i * 60 + xOff - CANVAS_HEIGHT, CANVAS_HEIGHT);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, 80);
  const titleGrad = ctx.createLinearGradient(0, 78, CANVAS_WIDTH, 78);
  titleGrad.addColorStop(0, '#cc880000');
  titleGrad.addColorStop(0.3, '#cc880088');
  titleGrad.addColorStop(0.5, '#ffcc4466');
  titleGrad.addColorStop(0.7, '#cc880088');
  titleGrad.addColorStop(1, '#cc880000');
  ctx.strokeStyle = titleGrad;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, 80); ctx.lineTo(CANVAS_WIDTH, 80); ctx.stroke();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  drawSNKText(ctx, 'SELECT STAGE', CANVAS_WIDTH / 2, 25, 32, '#ffcc00');
  drawSNKText(ctx, 'A/D: move   Enter: confirm', CANVAS_WIDTH / 2, 58, 10, '#888888');

  const totalSlots = ALL_STAGES.length + 1;
  const totalW = totalSlots * STAGE_PREVIEW_W + (totalSlots - 1) * STAGE_PREVIEW_GAP;
  const startX = (CANVAS_WIDTH - totalW) / 2;
  const previewY = 180;

  for (let i = 0; i < totalSlots; i++) {
    const isRandom = i === ALL_STAGES.length;
    const stageId = isRandom ? null : ALL_STAGES[i];
    const theme = isRandom ? null : STAGE_THEMES[stageId!];
    const px = startX + i * (STAGE_PREVIEW_W + STAGE_PREVIEW_GAP);
    const isHovered = i === cursor;

    if (theme) {
      const thumbGrad = ctx.createLinearGradient(px, previewY, px, previewY + STAGE_PREVIEW_H);
      thumbGrad.addColorStop(0, theme.bg1);
      thumbGrad.addColorStop(1, theme.bg2);
      ctx.fillStyle = thumbGrad;
    } else {
      ctx.fillStyle = '#1a1a2e';
    }
    roundRect(ctx, px, previewY, STAGE_PREVIEW_W, STAGE_PREVIEW_H, 8);
    ctx.fill();

    if (theme) {
      ctx.fillStyle = theme.accent + '44';
      ctx.fillRect(px + 4, previewY + STAGE_PREVIEW_H - 20, STAGE_PREVIEW_W - 8, 2);
      ctx.fillStyle = theme.pattern + '22';
      if (stageId === 'temple') {
        ctx.beginPath();
        ctx.moveTo(px + 30, previewY + 20);
        ctx.lineTo(px + 60, previewY + 10);
        ctx.lineTo(px + 90, previewY + 20);
        ctx.lineTo(px + 85, previewY + 30);
        ctx.lineTo(px + 35, previewY + 30);
        ctx.closePath();
        ctx.fill();
      } else if (stageId === 'china') {
        for (const lx of [px + 25, px + 60, px + 95]) {
          ctx.beginPath(); ctx.arc(lx, previewY + 22, 8, 0, Math.PI * 2); ctx.fill();
        }
      } else if (stageId === 'factory') {
        ctx.beginPath(); ctx.arc(px + 40, previewY + 30, 15, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(px + 85, previewY + 25, 10, 0, Math.PI * 2); ctx.fill();
      } else if (stageId === 'orochi') {
        ctx.beginPath(); ctx.arc(px + 60, previewY + 25, 18, 0, Math.PI * 2); ctx.fill();
      } else if (stageId === 'street') {
        ctx.fillRect(px + 10, previewY + 15, 20, 45);
        ctx.fillRect(px + 40, previewY + 25, 15, 35);
        ctx.fillRect(px + 70, previewY + 20, 25, 40);
        ctx.fillRect(px + 100, previewY + 30, 15, 30);
      }
    } else {
      const pulse = 0.7 + Math.sin(tick * 0.08) * 0.3;
      ctx.fillStyle = `rgba(255, 204, 0, ${0.15 * pulse})`;
      roundRect(ctx, px + 4, previewY + 4, STAGE_PREVIEW_W - 8, STAGE_PREVIEW_H - 8, 6);
      ctx.fill();
      ctx.font = 'bold 30px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = `rgba(255, 204, 0, ${0.6 + pulse * 0.4})`;
      ctx.fillText('?', px + STAGE_PREVIEW_W / 2, previewY + STAGE_PREVIEW_H / 2 - 4);
    }

    ctx.strokeStyle = isHovered ? '#ffcc00' : 'rgba(255,255,255,0.08)';
    ctx.lineWidth = isHovered ? 3 : 1;
    roundRect(ctx, px, previewY, STAGE_PREVIEW_W, STAGE_PREVIEW_H, 8);
    ctx.stroke();

    const nameText = isRandom ? 'RANDOM' : STAGE_NAMES[stageId!];
    const displayName = isRandom ? 'RANDOM' : nameText!.split(' · ')[0];
    ctx.font = '10px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = isHovered ? '#ffcc00' : '#888';
    ctx.fillText(displayName, px + STAGE_PREVIEW_W / 2, previewY + STAGE_PREVIEW_H + 16);

    if (isHovered) {
      const glowPulse = 0.5 + Math.sin(tick * 0.12) * 0.3;
      ctx.save();
      ctx.shadowColor = '#ffcc00';
      ctx.shadowBlur = 18 * glowPulse;
      ctx.strokeStyle = `rgba(255, 204, 0, ${0.6 + glowPulse * 0.4})`;
      ctx.lineWidth = 2;
      roundRect(ctx, px - 4, previewY - 4, STAGE_PREVIEW_W + 8, STAGE_PREVIEW_H + 8, 12);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    if (ready && isHovered) {
      const flash = Math.sin(tick * 0.2) * 0.15 + 0.3;
      ctx.fillStyle = `rgba(255, 204, 0, ${flash})`;
      roundRect(ctx, px, previewY, STAGE_PREVIEW_W, STAGE_PREVIEW_H, 8);
      ctx.fill();
      ctx.font = 'bold 16px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.fillText('OK!', px + STAGE_PREVIEW_W / 2, previewY + STAGE_PREVIEW_H / 2);
    }
  }

  const selectedIdx = cursor;
  const isSelectedRandom = selectedIdx === ALL_STAGES.length;
  const selectedStageId = isSelectedRandom ? null : ALL_STAGES[selectedIdx];
  const selectedTheme = selectedStageId ? STAGE_THEMES[selectedStageId] : null;

  const largePreviewY = 340;
  const largeW = 280;
  const largeH = 180;
  const largeX = CANVAS_WIDTH / 2 - largeW / 2;

  if (selectedTheme) {
    const lGrad = ctx.createLinearGradient(largeX, largePreviewY, largeX + largeW, largePreviewY + largeH);
    lGrad.addColorStop(0, selectedTheme.bg1);
    lGrad.addColorStop(1, selectedTheme.bg2);
    ctx.fillStyle = lGrad;
  } else {
    ctx.fillStyle = '#1a1a2e';
  }
  roundRect(ctx, largeX, largePreviewY, largeW, largeH, 10);
  ctx.fill();

  if (selectedTheme) {
    ctx.fillStyle = selectedTheme.accent + '33';
    ctx.fillRect(largeX + 10, largePreviewY + largeH - 40, largeW - 20, 3);
    ctx.fillStyle = selectedTheme.pattern + '15';
    ctx.beginPath();
    ctx.arc(largeX + largeW / 2, largePreviewY + largeH / 2, 60, 0, Math.PI * 2);
    ctx.fill();
  } else {
    const pulse = 0.7 + Math.sin(tick * 0.08) * 0.3;
    ctx.font = 'bold 72px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = `rgba(255, 204, 0, ${0.3 + pulse * 0.3})`;
    ctx.fillText('?', largeX + largeW / 2, largePreviewY + largeH / 2);
  }

  ctx.strokeStyle = '#ffcc0088';
  ctx.lineWidth = 2;
  roundRect(ctx, largeX, largePreviewY, largeW, largeH, 10);
  ctx.stroke();

  const stageLabel = isSelectedRandom ? '???' : STAGE_NAMES[selectedStageId!];
  drawSNKText(ctx, stageLabel || 'RANDOM', CANVAS_WIDTH / 2, largePreviewY + largeH + 25, 20, '#ffcc00');
  if (!isSelectedRandom && stageLabel) {
    const subLabel = stageLabel.split(' · ')[1] || '';
    ctx.font = '12px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#888';
    ctx.fillText(subLabel, CANVAS_WIDTH / 2, largePreviewY + largeH + 45);
  }

  ctx.textAlign = 'left';
  ctx.restore();
}

// ===== Team Order Select Screen =====

export function drawTeamOrderSelect(
  ctx: CanvasRenderingContext2D,
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
  ctx.save();

  const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  bgGrad.addColorStop(0, '#080818');
  bgGrad.addColorStop(0.5, '#0c0c24');
  bgGrad.addColorStop(1, '#060614');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, 70);
  drawSNKText(ctx, 'ORDER SELECT', CANVAS_WIDTH / 2, 22, 28, '#ffcc00');
  drawSNKText(ctx, 'Left/Right: pick slot   A: select   S: swap', CANVAS_WIDTH / 2, 52, 10, '#888888');

  const slotW = 100;
  const slotH = 140;
  const slotGap = 20;

  for (let pi = 0; pi < 2; pi++) {
    const team = pi === 0 ? p1Team : p2Team;
    const slots = pi === 0 ? p1Slots : p2Slots;
    const ready = pi === 0 ? p1Ready : p2Ready;
    const label = pi === 0 ? 'P1' : 'P2';
    const labelColor = pi === 0 ? '#22ccaa' : '#ff6644';
    const baseX = pi === 0 ? 80 : CANVAS_WIDTH - 80 - 3 * slotW - 2 * slotGap;

    drawSNKText(ctx, label, baseX + (3 * slotW + 2 * slotGap) / 2, 95, 18, labelColor);

    for (let si = 0; si < 3; si++) {
      const charIdx = slots[si];
      const char = team[charIdx]?.charDef;
      const sx = baseX + si * (slotW + slotGap);
      const sy = 120;

      const isActive = !ready && pi === 0 && cursor === si && !swapMode;
      const isSwapTarget = !ready && pi === 0 && swapMode && swapCursor === si;

      ctx.fillStyle = isActive ? 'rgba(34, 204, 170, 0.15)' : isSwapTarget ? 'rgba(255, 100, 0, 0.15)' : 'rgba(20, 20, 40, 0.8)';
      roundRect(ctx, sx, sy, slotW, slotH, 8);
      ctx.fill();

      const borderColor = isActive ? '#22ccaa' : isSwapTarget ? '#ff8800' : ready ? '#44ff4466' : 'rgba(255,255,255,0.1)';
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = isActive || isSwapTarget ? 3 : 1;
      roundRect(ctx, sx, sy, slotW, slotH, 8);
      ctx.stroke();

      if (isActive || isSwapTarget) {
        const glowPulse = 0.5 + Math.sin(tick * 0.12) * 0.3;
        ctx.save();
        ctx.shadowColor = isActive ? '#22ccaa' : '#ff8800';
        ctx.shadowBlur = 12 * glowPulse;
        ctx.strokeStyle = isActive ? `rgba(34, 204, 170, ${0.5 + glowPulse * 0.5})` : `rgba(255, 136, 0, ${0.5 + glowPulse * 0.5})`;
        ctx.lineWidth = 2;
        roundRect(ctx, sx - 3, sy - 3, slotW + 6, slotH + 6, 10);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.restore();
      }

      if (char) {
        const orderPortrait = getBestPortrait(char, 'select');
        if (orderPortrait) {
          const portraitBoxX = sx + 8;
          const portraitBoxY = sy + 10;
          const portraitBoxW = slotW - 16;
          const portraitBoxH = 92;
          if (!drawPortraitFitVisibleBoundsInBox(ctx, orderPortrait, portraitBoxX, portraitBoxY, portraitBoxW, portraitBoxH, {
            frameColor: char.color,
            backdropColor: 'rgba(8, 8, 18, 0.85)',
            scanlines: true,
          })) {
            const charGrad = ctx.createLinearGradient(sx + 10, sy + 10, sx + slotW - 10, sy + 90);
            charGrad.addColorStop(0, char.color);
            charGrad.addColorStop(1, char.accentColor);
            ctx.fillStyle = charGrad;
            roundRect(ctx, sx + 10, sy + 10, slotW - 20, 80, 4);
            ctx.fill();
            ctx.font = '28px serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#fff';
            ctx.fillText(char.portrait, sx + slotW / 2, sy + 55);
          }
        } else {
          const charGrad = ctx.createLinearGradient(sx + 10, sy + 10, sx + slotW - 10, sy + 90);
          charGrad.addColorStop(0, char.color);
          charGrad.addColorStop(1, char.accentColor);
          ctx.fillStyle = charGrad;
          roundRect(ctx, sx + 10, sy + 10, slotW - 20, 80, 4);
          ctx.fill();
          ctx.font = '28px serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = '#fff';
          ctx.fillText(char.portrait, sx + slotW / 2, sy + 55);
        }
        drawSNKText(ctx, char.nameCn, sx + slotW / 2, sy + slotH - 15, 12, '#eee');
      }

      ctx.font = 'bold 16px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = labelColor;
      ctx.fillText(`${si + 1}`, sx + slotW / 2, sy + slotH + 15);

      if (ready) {
        const flash = Math.sin(tick * 0.15) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(255, 204, 0, ${flash * 0.3})`;
        roundRect(ctx, sx, sy, slotW, slotH, 8);
        ctx.fill();
        ctx.font = 'bold 14px "Courier New", monospace';
        ctx.fillStyle = '#ffcc00';
        ctx.fillText('OK!', sx + slotW / 2, sy + slotH / 2);
      }
    }
  }

  const centerX = CANVAS_WIDTH / 2;
  ctx.strokeStyle = 'rgba(255, 204, 0, 0.2)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(centerX, 80);
  ctx.lineTo(centerX, CANVAS_HEIGHT - 60);
  ctx.stroke();
  ctx.setLineDash([]);

  drawSNKText(ctx, 'VS', centerX, CANVAS_HEIGHT / 2, 36, 'rgba(255,255,255,0.15)');

  if (swapMode) {
    drawSNKText(ctx, 'SWAP MODE: Select target slot', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 40, 12, '#ff8800');
  } else if (!p1Ready) {
    drawSNKText(ctx, 'Select a slot, then press S to swap', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 40, 11, '#666');
  }

  ctx.textAlign = 'left';
  ctx.restore();
}

// ===== Transition Animations =====
