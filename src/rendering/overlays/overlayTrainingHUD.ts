/**
 * Training Mode HUD — move list, input history, frame data panels
 * Split from overlayScreens.ts
 */
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../core/constants.js';
import { roundRect, drawSNKText } from '../utils.js';
import type { TrainingModeState, FrameDataDisplay, InputHistoryEntry } from '../../state/trainingMode.js';
import type { MoveListEntry } from '../../core/types.js';
import { CN_MOVE_NAMES } from '../moveNameDisplay.js';

// ===== Training Mode HUD =====

/**
 * Draw the full training mode HUD overlay.
 * - Top: "TRAINING MODE" label + dummy behavior
 * - Left top: Move list panel
 * - Left bottom: Input history panel
 * - Bottom: Frame data panel
 * - Right: Controls help
 */
export function drawTrainingHUD(
  ctx: CanvasRenderingContext2D,
  training: TrainingModeState,
  comboCount: number,
  comboDamage: number,
  tick: number,
  moveList: MoveListEntry[] = [],
  lastAttackType: string | null = null,
  motionProgress: { motion: string; steps: number; total: number } | null = null,
): void {
  ctx.save();

  // ===== Top bar: TRAINING MODE label =====
  const topBarH = 30;
  const topGrad = ctx.createLinearGradient(0, 0, 0, topBarH);
  topGrad.addColorStop(0, 'rgba(0, 50, 0, 0.75)');
  topGrad.addColorStop(1, 'rgba(0, 30, 0, 0.5)');
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, topBarH);
  // Bottom border
  ctx.strokeStyle = 'rgba(68, 255, 68, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, topBarH);
  ctx.lineTo(CANVAS_WIDTH, topBarH);
  ctx.stroke();

  ctx.font = 'bold 14px "Courier New", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#44ff44';
  ctx.fillText('TRAINING MODE', 12, 16);

  // Dummy behavior display (top right)
  ctx.textAlign = 'right';
  ctx.font = '11px "Courier New", monospace';
  ctx.fillStyle = '#888';
  ctx.fillText('Dummy:', CANVAS_WIDTH - 140, 11);
  ctx.fillStyle = '#ffcc00';
  ctx.font = 'bold 11px "Courier New", monospace';
  ctx.fillText(training.getDummyBehaviorLabel(), CANVAS_WIDTH - 12, 11);

  // Combo display
  ctx.fillStyle = '#aaa';
  ctx.font = '10px "Courier New", monospace';
  ctx.fillText('Combo:', CANVAS_WIDTH - 140, 23);
  ctx.fillStyle = '#ffcc00';
  ctx.fillText(`${comboCount}`, CANVAS_WIDTH - 90, 23);
  ctx.fillStyle = '#aaa';
  ctx.fillText('Dmg:', CANVAS_WIDTH - 75, 23);
  ctx.fillStyle = '#ff6644';
  ctx.fillText(`${comboDamage}`, CANVAS_WIDTH - 45, 23);

  // ===== Left top panel: Move list =====
  if (training.showMoveList) {
    drawMoveListPanel(ctx, moveList);
  }

  // ===== Left bottom panel: Input history =====
  if (training.showInputHistory) {
    drawInputHistoryPanelAdjusted(ctx, training.inputHistory, tick, training.showMoveList, moveList, lastAttackType);
  }

  // ===== Bottom panel: Frame data =====
  if (training.showFrameData) {
    drawFrameDataPanel(ctx, training.lastFrameData);
  }

  // ===== Right panel: Controls help =====
  drawControlsPanel(ctx);

  // ===== MAX/Burst system explanation (below controls) =====
  drawMaxBurstInfoPanel(ctx);

  // ===== Motion progress indicator (bottom-right) =====
  if (motionProgress) {
    drawMotionProgress(ctx, motionProgress, tick);
  }

  ctx.restore();
}

/** Motion progress indicator — shows partial command input status */
function drawMotionProgress(
  ctx: CanvasRenderingContext2D,
  progress: { motion: string; steps: number; total: number },
  tick: number,
): void {
  const panelW = 120;
  const panelH = 28;
  const panelX = CANVAS_WIDTH - panelW - 4;
  const panelY = CANVAS_HEIGHT - panelH - 30;

  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  roundRect(ctx, panelX, panelY, panelW, panelH, 4);
  ctx.fill();
  ctx.strokeStyle = 'rgba(68, 255, 68, 0.15)';
  ctx.lineWidth = 1;
  roundRect(ctx, panelX, panelY, panelW, panelH, 4);
  ctx.stroke();

  // Motion name
  ctx.font = 'bold 9px "Courier New", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#88ccff';
  ctx.fillText(progress.motion, panelX + 6, panelY + 3);

  // Progress bar
  const barX = panelX + 40;
  const barY = panelY + 5;
  const barW = 70;
  const barH = 6;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.fillRect(barX, barY, barW, barH);

  const fillRatio = progress.steps / progress.total;
  const isComplete = fillRatio >= 1;
  const fillColor = isComplete ? '#44ff44' : fillRatio > 0.5 ? '#ffcc44' : '#ff8844';
  ctx.fillStyle = fillColor;
  ctx.fillRect(barX, barY, barW * fillRatio, barH);

  // Step dots
  ctx.font = '9px "Courier New", monospace';
  ctx.fillStyle = isComplete ? '#44ff44' : '#888';
  ctx.textAlign = 'left';
  ctx.fillText(`${progress.steps}/${progress.total}`, barX, barY + 10);

  // Pulse effect when complete
  if (isComplete) {
    const pulse = Math.sin(tick * 0.3) * 0.3 + 0.7;
    ctx.strokeStyle = `rgba(68, 255, 68, ${pulse * 0.5})`;
    ctx.lineWidth = 2;
    roundRect(ctx, panelX, panelY, panelW, panelH, 4);
    ctx.stroke();
  }

  ctx.restore();
}

/** SNK-style categorized move list panel with section headers */
function drawMoveListPanel(ctx: CanvasRenderingContext2D, moveList: MoveListEntry[]): void {
  const panelX = 4;
  const panelY = 36;
  const panelW = 270;
  const lineH = 13;
  const sectionH = 16;

  // Group moves by category in KOF order
  const categoryOrder: { key: string; label: string }[] = [
    { key: 'command', label: 'COMMAND NORMALS' },
    { key: 'special', label: 'SPECIAL MOVES' },
    { key: 'dm', label: 'DESPERATION MOVES' },
    { key: 'sdm', label: 'MAX DM' },
    { key: 'hsdm', label: 'HIDDEN SUPER DM' },
    { key: 'system', label: 'SYSTEM' },
  ];

  const groups = new Map<string, MoveListEntry[]>();
  for (const cat of categoryOrder) {
    groups.set(cat.key, []);
  }
  for (const move of moveList) {
    const type = move.type ?? 'normal';
    if (groups.has(type)) {
      groups.get(type)!.push(move);
    }
  }

  // Calculate panel height
  let totalLines = 0;
  let hasContent = false;
  for (const cat of categoryOrder) {
    const entries = groups.get(cat.key)!;
    if (entries.length > 0) {
      totalLines += sectionH + entries.length * lineH;
      hasContent = true;
    }
  }
  if (!hasContent) totalLines = 40;
  const panelH = 20 + totalLines + 4;

  // Background with SNK-style dark gradient
  const bg = ctx.createLinearGradient(panelX, panelY, panelX, panelY + panelH);
  bg.addColorStop(0, 'rgba(10, 10, 20, 0.85)');
  bg.addColorStop(1, 'rgba(5, 5, 15, 0.75)');
  ctx.fillStyle = bg;
  roundRect(ctx, panelX, panelY, panelW, panelH, 6);
  ctx.fill();

  // Gold border — SNK style
  ctx.strokeStyle = 'rgba(200, 160, 60, 0.5)';
  ctx.lineWidth = 1;
  roundRect(ctx, panelX, panelY, panelW, panelH, 6);
  ctx.stroke();

  // Header bar
  ctx.fillStyle = 'rgba(200, 160, 60, 0.15)';
  ctx.fillRect(panelX + 1, panelY + 1, panelW - 2, 16);
  ctx.font = 'bold 10px "Courier New", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#ddb840';
  ctx.fillText('MOVE LIST', panelX + 8, panelY + 4);
  ctx.fillStyle = '#886';
  ctx.font = '8px "Courier New", monospace';
  ctx.fillText('[F5]', panelX + panelW - 30, panelY + 5);

  if (!moveList.length) {
    ctx.fillStyle = '#666';
    ctx.font = '9px "Courier New", monospace';
    ctx.fillText('暂无招式表数据', panelX + 12, panelY + 22);
    return;
  }

  // Section header styling
  const sectionStyle: Record<string, { color: string; bg: string }> = {
    command: { color: '#88ccff', bg: 'rgba(80, 140, 220, 0.1)' },
    special: { color: '#ffcc44', bg: 'rgba(220, 180, 40, 0.1)' },
    dm: { color: '#ff8844', bg: 'rgba(220, 120, 40, 0.12)' },
    sdm: { color: '#ff4466', bg: 'rgba(220, 50, 80, 0.12)' },
    hsdm: { color: '#ff66cc', bg: 'rgba(220, 80, 180, 0.15)' },
    system: { color: '#88ff88', bg: 'rgba(80, 200, 80, 0.1)' },
  };

  let curY = panelY + 20;

  for (const cat of categoryOrder) {
    const entries = groups.get(cat.key)!;
    if (entries.length === 0) continue;

    const style = sectionStyle[cat.key] ?? { color: '#ccc', bg: 'rgba(128,128,128,0.1)' };

    // Section header with colored left accent bar
    ctx.fillStyle = style.bg;
    ctx.fillRect(panelX + 2, curY, panelW - 4, sectionH - 2);
    ctx.fillStyle = style.color;
    ctx.fillRect(panelX + 2, curY, 3, sectionH - 2);

    ctx.font = 'bold 9px "Courier New", monospace';
    ctx.fillStyle = style.color;
    ctx.fillText(cat.label, panelX + 10, curY + 2);
    curY += sectionH;

    // Move entries
    ctx.font = '9px "Courier New", monospace';
    for (const move of entries) {
      // Move name
      ctx.fillStyle = '#ddd';
      const nameX = panelX + 10;
      ctx.fillText(move.name, nameX, curY + 1);

      // Input notation — right-aligned
      ctx.textAlign = 'right';
      ctx.fillStyle = style.color;
      ctx.fillText(move.input, panelX + panelW - 8, curY + 1);
      ctx.textAlign = 'left';
      curY += lineH;
    }
    curY += 2;
  }
}

/** Input history panel on the left side (adjusted for move list above) */
function drawInputHistoryPanelAdjusted(
  ctx: CanvasRenderingContext2D,
  history: InputHistoryEntry[],
  tick: number,
  showMoveList: boolean,
  moveList: MoveListEntry[],
  lastAttackType: string | null = null,
): void {
  // Calculate move list panel height to position input history below it
  let moveListBottom = 36;
  if (showMoveList && moveList.length > 0) {
    const lineH = 13;
    const sectionH = 16;
    let totalLines = 0;
    const seen = new Set<string>();
    for (const move of moveList) {
      const t = move.type ?? 'normal';
      if (!seen.has(t)) { seen.add(t); totalLines += sectionH; }
      totalLines += lineH;
    }
    moveListBottom = 36 + 20 + totalLines + 6;
  } else if (showMoveList) {
    moveListBottom = 36 + 44;
  }

  // Detected move name banner height
  const detectedMoveH = lastAttackType ? 18 : 0;

  const panelX = 4;
  const panelY = moveListBottom + 4;
  const panelW = 220;
  const lineH = 14;
  const maxLines = 12;
  const panelH = 20 + maxLines * lineH + detectedMoveH;

  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  roundRect(ctx, panelX, panelY, panelW, panelH, 6);
  ctx.fill();
  ctx.strokeStyle = 'rgba(68, 255, 68, 0.2)';
  ctx.lineWidth = 1;
  roundRect(ctx, panelX, panelY, panelW, panelH, 6);
  ctx.stroke();

  // Header
  ctx.font = 'bold 10px "Courier New", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#44ff44';
  ctx.fillText('INPUT HISTORY', panelX + 8, panelY + 4);

  // Detected move name banner
  let entryStartY = panelY + 20;
  if (lastAttackType) {
    const cnName = CN_MOVE_NAMES[lastAttackType];
    if (cnName) {
      ctx.fillStyle = 'rgba(255, 200, 60, 0.12)';
      ctx.fillRect(panelX + 2, panelY + 16, panelW - 4, detectedMoveH - 1);
      ctx.fillStyle = '#ffcc44';
      ctx.font = 'bold 10px "Courier New", monospace';
      ctx.fillText('>> ' + cnName, panelX + 8, panelY + 19);
    }
    entryStartY = panelY + 20 + detectedMoveH;
  }

  // Entries
  ctx.font = '10px "Courier New", monospace';
  const startIdx = Math.max(0, history.length - maxLines);
  for (let i = startIdx; i < history.length; i++) {
    const entry = history[i];
    const lineIdx = i - startIdx;
    const y = entryStartY + lineIdx * lineH;

    // Fade older entries
    const age = tick - entry.frame;
    const alpha = Math.max(0.3, 1 - age / 300);
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
    ctx.font = '10px "Courier New", monospace';
    ctx.fillText('(no input yet)', panelX + 8, entryStartY + 4);
  }
}

/** Frame data panel at the bottom */
function drawFrameDataPanel(
  ctx: CanvasRenderingContext2D,
  frameData: FrameDataDisplay | null,
): void {
  const panelW = CANVAS_WIDTH - 8;
  const panelH = 52;
  const panelX = 4;
  const panelY = CANVAS_HEIGHT - panelH - 4;

  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  roundRect(ctx, panelX, panelY, panelW, panelH, 6);
  ctx.fill();
  ctx.strokeStyle = 'rgba(68, 255, 68, 0.2)';
  ctx.lineWidth = 1;
  roundRect(ctx, panelX, panelY, panelW, panelH, 6);
  ctx.stroke();

  if (!frameData) {
    ctx.font = '12px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#555';
    ctx.fillText('Attack to see frame data', panelX + panelW / 2, panelY + panelH / 2);
    return;
  }

  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  // Attack name + phase indicator
  const phaseColors: Record<string, string> = {
    startup: '#8888ff',
    active: '#ff4444',
    recovery: '#44cc44',
    none: '#888',
  };
  const phaseColor = phaseColors[frameData.phase] || '#888';

  // Row 1: Attack name, phase, current frame
  ctx.font = 'bold 11px "Courier New", monospace';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(frameData.attackName, panelX + 10, panelY + 6);

  // Phase indicator with colored dot
  ctx.fillStyle = phaseColor;
  ctx.beginPath();
  ctx.arc(panelX + 10 + ctx.measureText(frameData.attackName).width + 14, panelY + 12, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = phaseColor;
  ctx.font = '10px "Courier New", monospace';
  ctx.fillText(frameData.phase.toUpperCase(), panelX + 10 + ctx.measureText(frameData.attackName).width + 22, panelY + 7);

  // Current frame / total
  const totalFrames = frameData.startup + frameData.active + frameData.recovery;
  ctx.fillStyle = '#aaa';
  ctx.fillText(`f${frameData.currentFrame}/${totalFrames}`, panelX + 10 + ctx.measureText(frameData.attackName).width + 85, panelY + 7);

  // Row 2: Frame data columns
  const row2Y = panelY + 22;
  const colW = 85;
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
    ctx.font = 'bold 12px "Courier New", monospace';
    ctx.fillText(cols[i].value, cx, row2Y + 12);
    ctx.font = '9px "Courier New", monospace';
  }

  // Advantage display (right side)
  const advX = panelX + panelW - 180;
  ctx.fillStyle = '#666';
  ctx.fillText('ADV HIT', advX, row2Y);
  const advHitColor = frameData.advantageHit >= 0 ? '#44ff44' : '#ff4444';
  ctx.fillStyle = advHitColor;
  ctx.font = 'bold 12px "Courier New", monospace';
  ctx.fillText(frameData.advantageHit >= 0 ? `+${frameData.advantageHit}` : `${frameData.advantageHit}`, advX, row2Y + 12);

  ctx.font = '9px "Courier New", monospace';
  ctx.fillStyle = '#666';
  ctx.fillText('ADV BLOCK', advX + 80, row2Y);
  const advBlockColor = frameData.advantageBlock >= 0 ? '#44ff44' : '#ff4444';
  ctx.fillStyle = advBlockColor;
  ctx.font = 'bold 12px "Courier New", monospace';
  ctx.fillText(frameData.advantageBlock >= 0 ? `+${frameData.advantageBlock}` : `${frameData.advantageBlock}`, advX + 80, row2Y + 12);

  // Guard type badge
  if (frameData.guardType) {
    const guardColors: Record<string, string> = { MID: '#44aaff', LOW: '#44ff44', HIGH: '#ff8844', UNBLOCKABLE: '#ff4444' };
    const guardX = panelX + panelW - 300;
    ctx.font = '9px "Courier New", monospace';
    ctx.fillStyle = '#666';
    ctx.fillText('GUARD', guardX, row2Y);
    ctx.fillStyle = guardColors[frameData.guardType] ?? '#aaa';
    ctx.font = 'bold 11px "Courier New", monospace';
    ctx.fillText(frameData.guardType, guardX, row2Y + 12);
  }

  // Cancel options (truncated)
  if (frameData.cancelInto && frameData.cancelInto.length > 0) {
    const cancelX = panelX + panelW - 230;
    ctx.font = '9px "Courier New", monospace';
    ctx.fillStyle = '#666';
    ctx.fillText('CANCEL', cancelX, row2Y);
    ctx.fillStyle = '#ddaaff';
    ctx.font = '9px "Courier New", monospace';
    const cancelText = frameData.cancelInto.slice(0, 3).join(', ');
    ctx.fillText(cancelText, cancelX, row2Y + 12);
  }
}

/** Controls help panel on the right side */
function drawControlsPanel(ctx: CanvasRenderingContext2D): void {
  const panelW = 155;
  const panelH = 136;
  const panelX = CANVAS_WIDTH - panelW - 4;
  const panelY = 36;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  roundRect(ctx, panelX, panelY, panelW, panelH, 6);
  ctx.fill();
  ctx.strokeStyle = 'rgba(68, 255, 68, 0.15)';
  ctx.lineWidth = 1;
  roundRect(ctx, panelX, panelY, panelW, panelH, 6);
  ctx.stroke();

  ctx.font = '9px "Courier New", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  const lines = [
    { key: 'F1', desc: 'Dummy behavior' },
    { key: 'F2', desc: 'Reset positions' },
    { key: 'F3', desc: 'Input display' },
    { key: 'F4', desc: 'Frame data' },
    { key: 'F5', desc: 'Move list' },
    { key: 'F6', desc: 'CRT filter' },
    { key: 'ESC', desc: 'Back to select' },
  ];

  for (let i = 0; i < lines.length; i++) {
    const y = panelY + 6 + i * 18;
    ctx.fillStyle = '#ffcc00';
    ctx.fillText(lines[i].key, panelX + 6, y);
    ctx.fillStyle = '#888';
    ctx.fillText(lines[i].desc, panelX + 36, y);
  }
}

/** MAX/Burst system explanation panel — KOF2002 mechanic reference */
function drawMaxBurstInfoPanel(ctx: CanvasRenderingContext2D): void {
  const panelW = 155;
  const panelX = CANVAS_WIDTH - panelW - 4;
  const panelY = 178; // below controls panel (36 + 136 + 6)

  const sections = [
    { title: '— MAX MODE —', color: '#4488ff', lines: [
      { cmd: 'O / 9', desc: 'Activate MAX' },
      { cmd: 'Cost', desc: '3 power stocks' },
      { cmd: 'Buff', desc: 'DM → SDM upgrade' },
      { cmd: 'Timer', desc: '~10 sec duration' },
    ]},
    { title: '— BURST —', color: '#ff8844', lines: [
      { cmd: 'Low HP', desc: 'DM available <25%' },
      { cmd: 'MAX+DM', desc: 'SDM free upgrade' },
      { cmd: 'MAX+Low', desc: 'HSDM unlock' },
    ]},
  ];

  let totalLines = 0;
  for (const s of sections) totalLines += s.lines.length;
  const sectionHeaderH = 14;
  const lineH = 12;
  const panelH = 6 + sections.length * sectionHeaderH + totalLines * lineH + 4;

  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  roundRect(ctx, panelX, panelY, panelW, panelH, 6);
  ctx.fill();
  ctx.strokeStyle = 'rgba(68, 255, 68, 0.15)';
  ctx.lineWidth = 1;
  roundRect(ctx, panelX, panelY, panelW, panelH, 6);
  ctx.stroke();

  let y = panelY + 4;
  for (const section of sections) {
    ctx.font = 'bold 9px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = section.color;
    ctx.fillText(section.title, panelX + panelW / 2, y);
    y += sectionHeaderH;

    ctx.font = '8px "Courier New", monospace';
    ctx.textAlign = 'left';
    for (const line of section.lines) {
      ctx.fillStyle = '#ffcc00';
      ctx.fillText(line.cmd, panelX + 6, y);
      ctx.fillStyle = '#999';
      ctx.fillText(line.desc, panelX + 50, y);
      y += lineH;
    }
  }

  ctx.restore();
}
