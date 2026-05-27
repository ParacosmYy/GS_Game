/**
 * Training Overlay — renders training mode specific HUD elements
 *
 * Displays:
 * - "TRAINING MODE" banner at top center
 * - Input history panel (last 20 inputs)
 * - Frame data readout for current/last attack
 * - Toggle key reminders (F2=hitbox, F3=input history, F4=frame data)
 * - Dummy behavior indicator
 * - Auto-recover status indicators
 */
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../core/constants.js';
import type { TrainingModeState, FrameDataDisplay, InputHistoryEntry } from '../state/trainingMode.js';
import { roundRect } from './utils.js';

/** Draw the full training mode overlay */
export function drawTrainingOverlay(
  ctx: CanvasRenderingContext2D,
  training: TrainingModeState,
  comboCount: number,
  comboDamage: number,
  tick: number,
): void {
  ctx.save();

  drawTopBanner(ctx, training, comboCount, comboDamage);
  drawControlHints(ctx, training);

  if (training.showInputHistory) {
    drawInputHistory(ctx, training.inputHistory, tick);
  }

  if (training.showFrameData) {
    drawFrameData(ctx, training.lastFrameData);
  }

  ctx.restore();
}

// ===== Top Banner =====

function drawTopBanner(
  ctx: CanvasRenderingContext2D,
  training: TrainingModeState,
  comboCount: number,
  comboDamage: number,
): void {
  const barH = 28;
  const grad = ctx.createLinearGradient(0, 0, 0, barH);
  grad.addColorStop(0, 'rgba(0, 40, 0, 0.8)');
  grad.addColorStop(1, 'rgba(0, 20, 0, 0.5)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, barH);

  // Bottom border line
  ctx.strokeStyle = 'rgba(68, 255, 68, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, barH);
  ctx.lineTo(CANVAS_WIDTH, barH);
  ctx.stroke();

  // Title
  ctx.font = 'bold 14px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#44ff44';
  ctx.fillText('TRAINING MODE', CANVAS_WIDTH / 2, 14);

  // Left: dummy behavior
  ctx.textAlign = 'left';
  ctx.font = '10px "Courier New", monospace';
  ctx.fillStyle = '#888';
  ctx.fillText('Dummy:', 10, 14);
  ctx.fillStyle = '#ffcc00';
  ctx.font = 'bold 10px "Courier New", monospace';
  ctx.fillText(training.getDummyBehaviorLabel(), 58, 14);

  // Right: combo counter
  ctx.textAlign = 'right';
  ctx.font = '10px "Courier New", monospace';
  ctx.fillStyle = '#aaa';
  ctx.fillText(`Combo: ${comboCount}  Dmg: ${comboDamage}`, CANVAS_WIDTH - 10, 14);

  // Status indicators (auto-recover / infinite meter)
  ctx.textAlign = 'right';
  ctx.font = '9px "Courier New", monospace';
  const indicators: string[] = [];
  if (training.autoRecoverHP) indicators.push('HP-REC');
  if (training.infiniteMeter) indicators.push('INF-METER');
  if (training.showHitboxes) indicators.push('HITBOX');
  ctx.fillStyle = indicators.length > 0 ? '#44ff88' : '#555';
  ctx.fillText(indicators.join(' | '), CANVAS_WIDTH - 10, 25);
}

// ===== Input History =====

function drawInputHistory(
  ctx: CanvasRenderingContext2D,
  history: InputHistoryEntry[],
  tick: number,
): void {
  const panelX = 4;
  const panelY = 34;
  const panelW = 220;
  const lineH = 13;
  const maxLines = 15;
  const headerH = 18;
  const panelH = headerH + maxLines * lineH + 4;

  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  roundRect(ctx, panelX, panelY, panelW, panelH, 4);
  ctx.fill();
  ctx.strokeStyle = 'rgba(68, 255, 68, 0.2)';
  ctx.lineWidth = 1;
  roundRect(ctx, panelX, panelY, panelW, panelH, 4);
  ctx.stroke();

  // Header
  ctx.font = 'bold 10px "Courier New", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#44ff44';
  ctx.fillText('INPUT HISTORY', panelX + 8, panelY + 4);

  // Entries
  ctx.font = '10px "Courier New", monospace';
  const startIdx = Math.max(0, history.length - maxLines);
  for (let i = startIdx; i < history.length; i++) {
    const entry = history[i];
    const lineIdx = i - startIdx;
    const y = panelY + headerH + lineIdx * lineH;

    // Fade older entries
    const age = tick - entry.frame;
    const alpha = Math.max(0.25, 1 - age / 400);
    ctx.globalAlpha = alpha;

    // Direction arrow
    ctx.fillStyle = '#88ccff';
    ctx.fillText(entry.direction, panelX + 8, y);

    // Buttons
    if (entry.buttons.length > 0) {
      ctx.fillStyle = '#ffcc44';
      ctx.fillText(entry.buttons.join(' '), panelX + 24, y);
    }

    ctx.globalAlpha = 1;
  }

  // Empty state
  if (history.length === 0) {
    ctx.fillStyle = '#555';
    ctx.fillText('(no input yet)', panelX + 8, panelY + headerH + 2);
  }
}

// ===== Frame Data =====

function drawFrameData(
  ctx: CanvasRenderingContext2D,
  frameData: FrameDataDisplay | null,
): void {
  const panelW = CANVAS_WIDTH - 8;
  const panelH = 50;
  const panelX = 4;
  const panelY = CANVAS_HEIGHT - panelH - 4;

  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  roundRect(ctx, panelX, panelY, panelW, panelH, 4);
  ctx.fill();
  ctx.strokeStyle = 'rgba(68, 255, 68, 0.2)';
  ctx.lineWidth = 1;
  roundRect(ctx, panelX, panelY, panelW, panelH, 4);
  ctx.stroke();

  if (!frameData) {
    ctx.font = '11px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#555';
    ctx.fillText('Attack to see frame data', panelX + panelW / 2, panelY + panelH / 2);
    return;
  }

  const phaseColors: Record<string, string> = {
    startup: '#8888ff',
    active: '#ff4444',
    recovery: '#44cc44',
    none: '#888',
  };
  const phaseColor = phaseColors[frameData.phase] || '#888';

  // Row 1: Attack name, phase, frame counter
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = 'bold 11px "Courier New", monospace';
  ctx.fillStyle = '#fff';
  ctx.fillText(frameData.attackName, panelX + 10, panelY + 5);

  // Phase dot
  let nameWidth: number;
  try {
    nameWidth = ctx.measureText(frameData.attackName).width;
  } catch {
    nameWidth = 100;
  }
  ctx.fillStyle = phaseColor;
  ctx.beginPath();
  ctx.arc(panelX + 10 + nameWidth + 14, panelY + 11, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = '10px "Courier New", monospace';
  ctx.fillText(frameData.phase.toUpperCase(), panelX + 10 + nameWidth + 22, panelY + 6);

  // Frame counter
  const totalFrames = frameData.startup + frameData.active + frameData.recovery;
  ctx.fillStyle = '#aaa';
  ctx.fillText(`f${frameData.currentFrame}/${totalFrames}`, panelX + 10 + nameWidth + 80, panelY + 6);

  // Row 2: Data columns
  const row2Y = panelY + 22;
  const colW = 80;
  const cols = [
    { label: 'STARTUP', value: `${frameData.startup}f`, color: '#8888ff' },
    { label: 'ACTIVE', value: `${frameData.active}f`, color: '#ff4444' },
    { label: 'RECOVERY', value: `${frameData.recovery}f`, color: '#44cc44' },
    { label: 'DAMAGE', value: `${frameData.damage}`, color: '#ff8844' },
    { label: 'HITSTUN', value: `${frameData.hitstun}f`, color: '#ffcc44' },
    { label: 'BLOCKSTUN', value: `${frameData.blockstun}f`, color: '#44aaff' },
  ];

  ctx.font = '9px "Courier New", monospace';
  for (let i = 0; i < cols.length; i++) {
    const cx = panelX + 10 + i * colW;
    ctx.fillStyle = '#666';
    ctx.fillText(cols[i].label, cx, row2Y);
    ctx.fillStyle = cols[i].color;
    ctx.font = 'bold 11px "Courier New", monospace';
    ctx.fillText(cols[i].value, cx, row2Y + 12);
    ctx.font = '9px "Courier New", monospace';
  }

  // Advantage (right side)
  const advX = panelX + panelW - 170;
  ctx.fillStyle = '#666';
  ctx.fillText('ADV HIT', advX, row2Y);
  ctx.fillStyle = frameData.advantageHit >= 0 ? '#44ff44' : '#ff4444';
  ctx.font = 'bold 11px "Courier New", monospace';
  ctx.fillText(frameData.advantageHit >= 0 ? `+${frameData.advantageHit}` : `${frameData.advantageHit}`, advX, row2Y + 12);

  ctx.font = '9px "Courier New", monospace';
  ctx.fillStyle = '#666';
  ctx.fillText('ADV BLOCK', advX + 75, row2Y);
  ctx.fillStyle = frameData.advantageBlock >= 0 ? '#44ff44' : '#ff4444';
  ctx.font = 'bold 11px "Courier New", monospace';
  ctx.fillText(frameData.advantageBlock >= 0 ? `+${frameData.advantageBlock}` : `${frameData.advantageBlock}`, advX + 75, row2Y + 12);
}

// ===== Control Hints =====

function drawControlHints(
  ctx: CanvasRenderingContext2D,
  training: TrainingModeState,
): void {
  const panelW = 160;
  const panelH = 110;
  const panelX = CANVAS_WIDTH - panelW - 4;
  const panelY = 34;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  roundRect(ctx, panelX, panelY, panelW, panelH, 4);
  ctx.fill();
  ctx.strokeStyle = 'rgba(68, 255, 68, 0.15)';
  ctx.lineWidth = 1;
  roundRect(ctx, panelX, panelY, panelW, panelH, 4);
  ctx.stroke();

  ctx.font = '9px "Courier New", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  const lines = [
    { key: 'F1', desc: 'Dummy behavior', active: false },
    { key: 'F2', desc: 'Hitbox display', active: training.showHitboxes },
    { key: 'F3', desc: 'Input history', active: training.showInputHistory },
    { key: 'F4', desc: 'Frame data', active: training.showFrameData },
    { key: 'ESC', desc: 'Back to select', active: false },
  ];

  for (let i = 0; i < lines.length; i++) {
    const y = panelY + 6 + i * 18;
    ctx.fillStyle = lines[i].active ? '#44ff44' : '#ffcc00';
    ctx.fillText(lines[i].key, panelX + 6, y);
    ctx.fillStyle = lines[i].active ? '#8f8' : '#888';
    ctx.fillText(lines[i].desc, panelX + 36, y);
  }
}
