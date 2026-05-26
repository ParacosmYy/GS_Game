/**
 * HUD Info Display — informational overlays for game state data
 *
 * Components:
 *  1. Match info panel (top-center): game mode, round, stage name
 *  2. Character info (under health bars): name, HP, meter dots
 *  3. Debug info overlay (F12 toggle): FPS, tick, fighter state, combo, meter, distance
 *  4. Input display (F3 toggle): directional + button state
 *  5. Training connection info: frame advantage, startup/active/recovery, damage
 */
import { Fighter } from '../entities/fighter.js';
import { Camera } from '../core/camera.js';
import type { PowerGauge, MaxModeState, PlayerInput } from '../core/types.js';
import {
  CANVAS_WIDTH, CANVAS_HEIGHT, MAX_HEALTH, MAX_STOCKS,
  HUD_BAR_WIDTH, HUD_BAR_Y, HUD_MARGIN, HUD_BAR_HEIGHT,
  STAGE_WIDTH, STAGE_LEFT, STAGE_RIGHT,
} from '../core/constants.js';
import { roundRect, drawSNKText } from './utils.js';

// ===== Toggle state =====
let debugOverlayVisible = false;
let inputDisplayVisible = false;

/** Toggle debug overlay (F12). Returns new visibility state. */
export function toggleDebugOverlay(): boolean {
  debugOverlayVisible = !debugOverlayVisible;
  return debugOverlayVisible;
}

/** Toggle input display (F3). Returns new visibility state. */
export function toggleInputDisplay(): boolean {
  inputDisplayVisible = !inputDisplayVisible;
  return inputDisplayVisible;
}

/** Is debug overlay currently visible? */
export function isDebugOverlayVisible(): boolean {
  return debugOverlayVisible;
}

/** Is input display currently visible? */
export function isInputDisplayVisible(): boolean {
  return inputDisplayVisible;
}

// ===== FPS tracker =====
let fpsFrameCount = 0;
let fpsLastTime = performance.now();
let fpsCurrentValue = 0;

/** Call once per render frame to update FPS counter. */
export function updateFPSTracker(): void {
  fpsFrameCount++;
  const now = performance.now();
  if (now - fpsLastTime >= 1000) {
    fpsCurrentValue = fpsFrameCount;
    fpsFrameCount = 0;
    fpsLastTime = now;
  }
}

/** Get current FPS value. */
export function getCurrentFPS(): number {
  return fpsCurrentValue;
}

// ===== 1. Match Info Panel (top-center) =====

export interface MatchInfoConfig {
  gameMode: 'ARCADE' | 'TRAINING' | 'VERSUS';
  currentRound: number;
  totalRounds: number;
  stageName: string;
}

/**
 * Draw match info panel at top-center, small text.
 * Only draws if a game mode is active (not on title/select screens).
 */
export function drawMatchInfoPanel(
  ctx: CanvasRenderingContext2D,
  config: MatchInfoConfig,
  tick: number,
): void {
  const centerX = CANVAS_WIDTH / 2;
  const panelY = 66;
  const panelW = 200;
  const panelH = 32;
  const panelX = centerX - panelW / 2;

  // Semi-transparent background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  roundRect(ctx, panelX, panelY, panelW, panelH, 4);
  ctx.fill();
  ctx.strokeStyle = 'rgba(200, 168, 50, 0.2)';
  ctx.lineWidth = 1;
  roundRect(ctx, panelX, panelY, panelW, panelH, 4);
  ctx.stroke();

  // Game mode
  const modeColor = config.gameMode === 'TRAINING' ? '#44ff44'
    : config.gameMode === 'VERSUS' ? '#ff8844'
    : '#ffcc44';
  drawSNKText(ctx, config.gameMode, centerX, panelY + 9, 9, modeColor, '#000000', 'center');

  // Round + Stage
  const roundStr = config.gameMode === 'TRAINING'
    ? config.stageName
    : `R${config.currentRound}/${config.totalRounds} ${config.stageName}`;
  drawSNKText(ctx, roundStr, centerX, panelY + 21, 8, '#aaaaaa', '#000000', 'center');
}

// ===== 2. Character Info Display (below health bars) =====

/**
 * Draw character info below each health bar: bold name, HP numbers, meter dots.
 */
export function drawCharacterInfo(
  ctx: CanvasRenderingContext2D,
  fighters: Fighter[],
  gauges: [PowerGauge, PowerGauge],
  p1Name: string,
  p2Name: string,
): void {
  if (fighters.length < 2) return;

  const infoY = HUD_BAR_Y + HUD_BAR_HEIGHT + 38;

  for (let p = 0; p < 2; p++) {
    const f = fighters[p];
    const gauge = gauges[p];
    const isP1 = p === 0;
    const name = isP1 ? p1Name : p2Name;
    const playerColor = isP1 ? '#ff6644' : '#4488ff';

    const baseX = isP1 ? HUD_MARGIN : CANVAS_WIDTH - HUD_MARGIN;
    const align = isP1 ? 'left' : 'right';

    // HP as number
    const hp = Math.max(0, Math.round(f.health));
    const hpStr = `${hp}/${MAX_HEALTH}`;
    const hpColor = hp / MAX_HEALTH > 0.5 ? '#88ff88'
      : hp / MAX_HEALTH > 0.25 ? '#ffcc44'
      : '#ff4444';

    // Draw HP text
    drawSNKText(ctx, hpStr, baseX + (isP1 ? 0 : 0), infoY, 9, hpColor, '#000000', align);

    // Meter dots — filled/empty circles for each stock
    const dotsY = infoY + 12;
    const dotRadius = 3;
    const dotSpacing = 10;
    const totalDots = MAX_STOCKS;

    for (let s = 0; s < totalDots; s++) {
      const dotX = isP1
        ? baseX + s * dotSpacing + dotRadius
        : baseX - s * dotSpacing - dotRadius;

      const isFilled = s < gauge.stocks;
      const isPartial = s === gauge.stocks && gauge.meter > 0;

      ctx.beginPath();
      ctx.arc(dotX, dotsY, dotRadius, 0, Math.PI * 2);

      if (isFilled) {
        ctx.fillStyle = playerColor;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else if (isPartial) {
        // Partial fill arc
        const fillRatio = gauge.meter / gauge.maxMeter;
        ctx.fillStyle = 'rgba(60, 60, 80, 0.5)';
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(dotX, dotsY);
        ctx.arc(dotX, dotsY, dotRadius, -Math.PI / 2, -Math.PI / 2 + fillRatio * Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = 'rgba(100, 180, 255, 0.6)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(100,180,255,0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(dotX, dotsY, dotRadius, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.strokeStyle = 'rgba(100, 100, 120, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // Exact meter value text
    const meterStr = `${gauge.stocks}:${Math.round(gauge.meter)}/${gauge.maxMeter}`;
    const meterX = isP1
      ? baseX + totalDots * dotSpacing + 6
      : baseX - totalDots * dotSpacing - 6;
    drawSNKText(ctx, meterStr, meterX, dotsY - 3, 7, '#7799bb', '#000000', align);
  }
}

// ===== 3. Debug Info Overlay (F12 toggle) =====

export interface DebugFighterInfo {
  state: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  health: number;
  comboCount: number;
  comboDamage: number;
  facing: number;
  isGrounded: boolean;
  hitstunTimer: number;
  blockstunTimer: number;
  currentAttack: string | null;
  attackPhase: string;
  attackFrame: number;
}

/**
 * Draw comprehensive debug info overlay.
 * Top-left corner, monospace font, semi-transparent background.
 */
export function drawDebugOverlay(
  ctx: CanvasRenderingContext2D,
  fighters: DebugFighterInfo[],
  gauges: [PowerGauge, PowerGauge],
  maxModes: [MaxModeState, MaxModeState],
  camera: Camera,
  tick: number,
  fps: number,
): void {
  if (!debugOverlayVisible) return;

  ctx.save();

  const panelW = 340;
  const panelH = 310;
  const panelX = 4;
  const panelY = 4;

  // Semi-transparent background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.82)';
  roundRect(ctx, panelX, panelY, panelW, panelH, 6);
  ctx.fill();
  ctx.strokeStyle = 'rgba(68, 255, 68, 0.3)';
  ctx.lineWidth = 1;
  roundRect(ctx, panelX, panelY, panelW, panelH, 6);
  ctx.stroke();

  ctx.font = '10px "Courier New", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  let y = panelY + 6;

  // Header: FPS + tick
  ctx.fillStyle = '#0f0';
  ctx.fillText(`FPS: ${fps}  Tick: ${tick}`, panelX + 8, y);
  y += 14;

  // Separator
  ctx.strokeStyle = 'rgba(68, 255, 68, 0.2)';
  ctx.beginPath();
  ctx.moveTo(panelX + 8, y);
  ctx.lineTo(panelX + panelW - 8, y);
  ctx.stroke();
  y += 4;

  // Fighter info for P1 and P2
  for (let i = 0; i < 2; i++) {
    const f = fighters[i];
    const gauge = gauges[i];
    const maxMode = maxModes[i];
    const isP1 = i === 0;
    const label = isP1 ? 'P1' : 'P2';
    const labelColor = isP1 ? '#ff5555' : '#5599ff';

    ctx.fillStyle = labelColor;
    ctx.fillText(`${label} ──────────────────────────`, panelX + 8, y);
    y += 13;

    ctx.fillStyle = '#ccc';
    ctx.fillText(` State: ${f.state}`, panelX + 8, y);
    y += 13;

    ctx.fillText(` Pos: (${Math.round(f.x)}, ${Math.round(f.y)})  Vel: (${f.vx.toFixed(1)}, ${f.vy.toFixed(1)})`, panelX + 8, y);
    y += 13;

    ctx.fillText(` Facing: ${f.facing === 1 ? '→' : '←'}  Grounded: ${f.isGrounded}`, panelX + 8, y);
    y += 13;

    ctx.fillStyle = f.health / MAX_HEALTH > 0.5 ? '#88ff88' : f.health / MAX_HEALTH > 0.25 ? '#ffcc44' : '#ff4444';
    ctx.fillText(` HP: ${Math.round(f.health)}/${MAX_HEALTH}`, panelX + 8, y);
    y += 13;

    // Meter info
    const maxModeStr = maxMode.active ? ` MAX(${maxMode.timer}/${maxMode.maxDuration})` : '';
    ctx.fillStyle = '#88aaff';
    ctx.fillText(` Meter: ${gauge.stocks} stocks + ${Math.round(gauge.meter)}/${gauge.maxMeter}${maxModeStr}`, panelX + 8, y);
    y += 13;

    // Combo
    if (f.comboCount >= 2) {
      ctx.fillStyle = f.comboCount >= 10 ? '#ff2222' : f.comboCount >= 5 ? '#ffdd00' : '#ffffff';
      ctx.fillText(` Combo: ${f.comboCount} hits / ${f.comboDamage} dmg`, panelX + 8, y);
    } else {
      ctx.fillStyle = '#555';
      ctx.fillText(` Combo: -`, panelX + 8, y);
    }
    y += 13;

    // Attack info
    if (f.currentAttack) {
      ctx.fillStyle = '#ffcc00';
      ctx.fillText(` Attack: ${f.currentAttack} [${f.attackPhase}] f${f.attackFrame}`, panelX + 8, y);
      y += 13;
    }

    // Stun/block timers
    if (f.hitstunTimer > 0) {
      ctx.fillStyle = '#ff8888';
      ctx.fillText(` Hitstun: ${f.hitstunTimer}f`, panelX + 8, y);
      y += 13;
    }
    if (f.blockstunTimer > 0) {
      ctx.fillStyle = '#8888ff';
      ctx.fillText(` Blockstun: ${f.blockstunTimer}f`, panelX + 8, y);
      y += 13;
    }

    y += 2;
  }

  // Distance between fighters
  if (fighters.length >= 2) {
    const dist = Math.abs(fighters[0].x - fighters[1].x);
    ctx.fillStyle = '#aaa';
    ctx.fillText(` Distance: ${Math.round(dist)}px`, panelX + 8, y);
    y += 13;
  }

  // Camera info
  ctx.fillStyle = '#aaa';
  ctx.fillText(` Camera: (${Math.round(camera.x)}, ${Math.round(camera.y)}) zoom:${camera.zoom.toFixed(2)}`, panelX + 8, y);
  y += 13;

  // Stage bounds
  ctx.fillStyle = '#888';
  ctx.fillText(` Stage: ${STAGE_LEFT}-${STAGE_RIGHT} (${STAGE_WIDTH}px)`, panelX + 8, y);

  ctx.restore();
}

// ===== 4. Input Display (F3 toggle) =====

/**
 * Convert PlayerInput direction state to numpad notation.
 * Facing right: 6=forward, 4=back. Facing left: flipped.
 * Returns a string like "5", "6", "2", "8", "3", "9", "1", "7".
 */
export function inputToNumpad(input: PlayerInput, facing: number): string {
  const u = input.up;
  const d = input.down;
  // facing right (1): right=forward. facing left (-1): left=forward.
  const fwd = facing === 1 ? input.right : input.left;
  const back = facing === 1 ? input.left : input.right;

  if (u && !d && !fwd && !back) return '8';
  if (u && !d && fwd && !back) return '9';
  if (!u && !d && fwd && !back) return '6';
  if (!u && d && fwd && !back) return '3';
  if (!u && d && !fwd && !back) return '2';
  if (!u && d && !fwd && back) return '1';
  if (!u && !d && !fwd && back) return '4';
  if (u && !d && !fwd && back) return '7';
  return '5';
}

/**
 * Convert numpad notation to an arrow symbol for display.
 */
export function numpadToArrow(numpad: string): string {
  const arrows: Record<string, string> = {
    '7': '↖', '8': '↑', '9': '↗',
    '4': '←', '5': '·', '6': '→',
    '1': '↙', '2': '↓', '3': '↘',
  };
  return arrows[numpad] || '·';
}

/**
 * Draw input display at bottom-center.
 * Shows directional arrow/numpad and button states (A B C D as lit/unlit circles).
 */
export function drawInputDisplay(
  ctx: CanvasRenderingContext2D,
  p1Input: PlayerInput,
  p2Input: PlayerInput,
  p1Facing: number,
  p2Facing: number,
): void {
  if (!inputDisplayVisible) return;

  ctx.save();

  const panelW = 320;
  const panelH = 44;
  const panelX = (CANVAS_WIDTH - panelW) / 2;
  const panelY = CANVAS_HEIGHT - panelH - 30;

  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
  roundRect(ctx, panelX, panelY, panelW, panelH, 6);
  ctx.fill();
  ctx.strokeStyle = 'rgba(200, 168, 50, 0.25)';
  ctx.lineWidth = 1;
  roundRect(ctx, panelX, panelY, panelW, panelH, 6);
  ctx.stroke();

  const inputs = [
    { input: p1Input, facing: p1Facing, label: 'P1', labelColor: '#ff5555', baseX: panelX + 10 },
    { input: p2Input, facing: p2Facing, label: 'P2', labelColor: '#5599ff', baseX: panelX + panelW / 2 + 10 },
  ];

  for (const { input, facing, label, labelColor, baseX } of inputs) {
    // Player label
    ctx.font = 'bold 10px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = labelColor;
    const ly = panelY + 14;
    ctx.fillText(label, baseX, ly);

    // Direction display: arrow + numpad
    const numpad = inputToNumpad(input, facing);
    const arrow = numpadToArrow(numpad);
    ctx.font = '16px "Courier New", monospace';
    ctx.fillStyle = numpad === '5' ? '#555' : '#ffffff';
    ctx.fillText(arrow, baseX + 26, ly);

    ctx.font = '9px "Courier New", monospace';
    ctx.fillStyle = '#888';
    ctx.fillText(numpad, baseX + 46, ly);

    // Button display: A B C D as circles
    const buttons = [
      { key: 'buttonA', label: 'A', pressed: input.buttonA },
      { key: 'buttonB', label: 'B', pressed: input.buttonB },
      { key: 'buttonC', label: 'C', pressed: input.buttonC },
      { key: 'buttonD', label: 'D', pressed: input.buttonD },
    ];

    const btnY = panelY + 33;
    const btnStartX = baseX + 26;
    const btnSpacing = 20;

    for (let b = 0; b < buttons.length; b++) {
      const btn = buttons[b];
      const btnX = btnStartX + b * btnSpacing;
      const r = 6;

      ctx.beginPath();
      ctx.arc(btnX, btnY, r, 0, Math.PI * 2);
      if (btn.pressed) {
        ctx.fillStyle = labelColor;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        ctx.fillStyle = 'rgba(40, 40, 50, 0.6)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(100, 100, 120, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Button label
      ctx.font = 'bold 7px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = btn.pressed ? '#000000' : '#666';
      ctx.fillText(btn.label, btnX, btnY);
    }

    // Throw + burst indicators
    const extraX = btnStartX + 4 * btnSpacing + 4;
    ctx.font = '8px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = input.throwAttack ? '#ffcc00' : '#444';
    ctx.fillText('CD', extraX, btnY - 3);
    ctx.fillStyle = input.burst ? '#44ff44' : '#444';
    ctx.fillText('BURST', extraX, btnY + 7);
  }

  ctx.restore();
}

// ===== 5. Training Connection Info =====

export interface TrainingAttackInfo {
  /** Name of the last performed attack */
  attackName: string | null;
  /** Startup frames */
  startup: number;
  /** Active frames */
  active: number;
  /** Recovery frames */
  recovery: number;
  /** Frame advantage on hit */
  advantageHit: number;
  /** Frame advantage on block */
  advantageBlock: number;
  /** Damage of last combo */
  lastComboDamage: number;
  /** Whether the last hit connected */
  wasHit: boolean;
  /** Whether the last hit was blocked */
  wasBlocked: boolean;
}

/**
 * Draw training mode connection info at bottom-right.
 * Shows frame advantage, startup/active/recovery, and combo damage.
 */
export function drawTrainingInfo(
  ctx: CanvasRenderingContext2D,
  attackInfo: TrainingAttackInfo,
): void {
  ctx.save();

  const panelW = 220;
  const panelH = 90;
  const panelX = CANVAS_WIDTH - panelW - 8;
  const panelY = CANVAS_HEIGHT - panelH - 32;

  // Semi-transparent background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
  roundRect(ctx, panelX, panelY, panelW, panelH, 6);
  ctx.fill();
  ctx.strokeStyle = 'rgba(68, 255, 68, 0.2)';
  ctx.lineWidth = 1;
  roundRect(ctx, panelX, panelY, panelW, panelH, 6);
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  if (!attackInfo.attackName) {
    ctx.font = '10px "Courier New", monospace';
    ctx.fillStyle = '#555';
    ctx.fillText('Attack to see frame data', panelX + 10, panelY + panelH / 2 - 5);
    ctx.restore();
    return;
  }

  let y = panelY + 6;

  // Attack name
  ctx.font = 'bold 10px "Courier New", monospace';
  ctx.fillStyle = '#ffcc00';
  ctx.fillText(attackInfo.attackName, panelX + 8, y);
  y += 15;

  // Startup / Active / Recovery
  ctx.font = '9px "Courier New", monospace';
  const frameLabels = [
    { label: 'STARTUP', value: `${attackInfo.startup}f`, color: '#8888ff' },
    { label: 'ACTIVE', value: `${attackInfo.active}f`, color: '#ff4444' },
    { label: 'RECOVERY', value: `${attackInfo.recovery}f`, color: '#44cc44' },
  ];
  for (const fl of frameLabels) {
    ctx.fillStyle = '#666';
    ctx.fillText(fl.label, panelX + 8, y);
    ctx.fillStyle = fl.color;
    ctx.fillText(fl.value, panelX + 70, y);
    y += 12;
  }

  // Frame advantage on hit/block
  const advHitColor = attackInfo.advantageHit >= 0 ? '#44ff44' : '#ff4444';
  const advBlockColor = attackInfo.advantageBlock >= 0 ? '#44ff44' : '#ff4444';
  ctx.fillStyle = '#666';
  ctx.fillText('ADV HIT', panelX + 8, y);
  ctx.fillStyle = advHitColor;
  const advHitStr = attackInfo.advantageHit >= 0 ? `+${attackInfo.advantageHit}` : `${attackInfo.advantageHit}`;
  ctx.fillText(advHitStr, panelX + 70, y);
  y += 12;

  ctx.fillStyle = '#666';
  ctx.fillText('ADV BLOCK', panelX + 8, y);
  ctx.fillStyle = advBlockColor;
  const advBlockStr = attackInfo.advantageBlock >= 0 ? `+${attackInfo.advantageBlock}` : `${attackInfo.advantageBlock}`;
  ctx.fillText(advBlockStr, panelX + 70, y);
  y += 12;

  // Combo damage
  if (attackInfo.lastComboDamage > 0) {
    ctx.fillStyle = '#ff6644';
    ctx.fillText(`COMBO DMG: ${attackInfo.lastComboDamage}`, panelX + 8, y);
  }

  ctx.restore();
}

// ===== Utility: collect debug info from fighters =====

/**
 * Collect DebugFighterInfo from Fighter instances for the debug overlay.
 */
export function collectDebugFighterInfo(fighters: Fighter[]): DebugFighterInfo[] {
  return fighters.map(f => ({
    state: f.state,
    x: f.x,
    y: f.y,
    vx: f.vx,
    vy: f.vy,
    health: f.health,
    comboCount: 0,
    comboDamage: 0,
    facing: f.facing,
    isGrounded: f.isGrounded(),
    hitstunTimer: f.hitstunTimer,
    blockstunTimer: f.blockstunTimer,
    currentAttack: f.currentAttack,
    attackPhase: f.attackPhase,
    attackFrame: f.attackFrame,
  }));
}
