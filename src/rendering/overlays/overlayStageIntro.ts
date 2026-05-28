/**
 * Stage intro ceremony overlay — cinematic stage name reveal
 * Plays between NEXT_MATCH and INTRO in arcade mode.
 */
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../core/constants.js';
import { drawSNKText, roundRect } from '../utils.js';

const STAGE_INTRO_DURATION = 120; // 2 seconds at 60fps

export { STAGE_INTRO_DURATION };

/** Stage accent colors for cinematic intro */
const STAGE_ACCENT: Record<string, string> = {
  temple: '#ffcc44',
  china: '#ff4444',
  factory: '#8888aa',
  orochi: '#aa44ff',
  street: '#44aaff',
  rooftop: '#44ffaa',
};

export function getStageAccent(stageId: string): string {
  return STAGE_ACCENT[stageId] ?? '#ffcc44';
}

/**
 * Draw the stage intro ceremony overlay.
 * Phase:
 *   0-20:  fade in from black
 *   15-80: stage name display (announceSequence handles text)
 *   80-100: character silhouettes at edges
 *   100-120: reveal flash + fade to INTRO
 */
export function drawStageIntro(
  ctx: CanvasRenderingContext2D,
  timer: number,
  stageName: string,
  stageId: string,
): void {
  ctx.save();
  const accent = getStageAccent(stageId);
  const progress = timer / STAGE_INTRO_DURATION;

  // Full-screen dark overlay with stage atmosphere
  const overlayAlpha = progress < 0.17
    ? progress / 0.17 * 0.6
    : progress > 0.83
      ? (1 - progress) / 0.17 * 0.6
      : 0.6;
  ctx.fillStyle = `rgba(0, 0, 0, ${overlayAlpha})`;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Stage name text (rendered by announceSequence — this adds accent bars)
  if (timer > 15 && timer < 100) {
    const nameProgress = Math.min(1, (timer - 15) / 65);
    const barWidth = CANVAS_WIDTH * 0.6 * nameProgress;
    const barY = CANVAS_HEIGHT / 2 - 4;

    // Accent bars flanking the stage name
    ctx.globalAlpha = nameProgress * 0.7;
    ctx.fillStyle = accent;
    // Left bar
    ctx.fillRect(CANVAS_WIDTH / 2 - barWidth / 2 - 8, barY - 2, 6, 4);
    // Right bar
    ctx.fillRect(CANVAS_WIDTH / 2 + barWidth / 2 + 2, barY - 2, 6, 4);
    ctx.globalAlpha = 1;
  }

  // Decorative top/bottom cinematic bars (subtle)
  const barHeight = 12;
  const barAlpha = progress < 0.17 ? progress / 0.17 * 0.5 : progress > 0.83 ? (1 - progress) / 0.17 * 0.5 : 0.5;
  ctx.fillStyle = `rgba(0, 0, 0, ${barAlpha})`;
  ctx.fillRect(0, 0, CANVAS_WIDTH, barHeight);
  ctx.fillRect(0, CANVAS_HEIGHT - barHeight, CANVAS_WIDTH, barHeight);

  // Thin accent line at top/bottom edges
  ctx.fillStyle = accent;
  ctx.globalAlpha = barAlpha;
  ctx.fillRect(0, barHeight - 1, CANVAS_WIDTH, 1);
  ctx.fillRect(0, CANVAS_HEIGHT - barHeight, CANVAS_WIDTH, 1);
  ctx.globalAlpha = 1;

  // Stage number / progress indicator
  if (timer > 20 && timer < 100) {
    ctx.globalAlpha = Math.min(1, (timer - 20) / 20) * 0.5;
    drawSNKText(ctx, stageName, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30, 12, accent);
    ctx.globalAlpha = 1;
  }

  // Reveal flash at transition end
  if (timer >= 100 && timer < 106) {
    const flashAlpha = (106 - timer) / 6 * 0.3;
    ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  ctx.restore();
}
