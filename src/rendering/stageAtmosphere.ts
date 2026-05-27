/**
 * Stage Atmosphere — Per-stage color grading and atmospheric effects
 *
 * Each KOF2002 stage has a distinctive color palette and mood.
 * This module provides stage-specific overlays that make each
 * stage feel unique and atmospheric:
 *   - Color grading tint (stage-specific color temperature)
 *   - Animated light rays (stage-specific directional lighting)
 *   - Enhanced vignette with stage mood
 *   - Per-stage ambient particle characteristics
 */
import { CANVAS_WIDTH, CANVAS_HEIGHT, STAGE_GROUND_Y } from '../core/constants.js';
import type { StageId } from './stage.js';

interface StageAtmosphere {
  /** Color grading overlay: [r, g, b, alpha] */
  gradeColor: [number, number, number, number];
  /** Light ray color */
  rayColor: string;
  /** Light ray direction angle (radians from top) */
  rayAngle: number;
  /** Number of light rays */
  rayCount: number;
  /** Light ray alpha */
  rayAlpha: number;
  /** Vignette inner tint [r, g, b] */
  vigTint: [number, number, number];
  /** Ambient particle color */
  particleColor: string;
  /** Ground fog tint [r, g, b] */
  fogTint: [number, number, number];
}

const STAGE_ATMOSPHERE: Record<StageId, StageAtmosphere> = {
  temple: {
    gradeColor: [255, 200, 100, 0.04],
    rayColor: '255, 200, 120',
    rayAngle: -0.3,
    rayCount: 4,
    rayAlpha: 0.06,
    vigTint: [40, 20, 5],
    particleColor: '#ffddaa',
    fogTint: [200, 170, 130],
  },
  china: {
    gradeColor: [255, 80, 40, 0.05],
    rayColor: '255, 150, 50',
    rayAngle: -0.2,
    rayCount: 3,
    rayAlpha: 0.07,
    vigTint: [50, 12, 12],
    particleColor: '#ffaaaa',
    fogTint: [200, 150, 130],
  },
  factory: {
    gradeColor: [60, 100, 180, 0.05],
    rayColor: '120, 160, 255',
    rayAngle: -0.5,
    rayCount: 2,
    rayAlpha: 0.04,
    vigTint: [8, 18, 35],
    particleColor: '#aaddff',
    fogTint: [130, 140, 160],
  },
  orochi: {
    gradeColor: [120, 40, 180, 0.06],
    rayColor: '180, 80, 255',
    rayAngle: 0.1,
    rayCount: 5,
    rayAlpha: 0.05,
    vigTint: [25, 5, 35],
    particleColor: '#cc88ff',
    fogTint: [150, 120, 170],
  },
  street: {
    gradeColor: [255, 140, 40, 0.04],
    rayColor: '255, 180, 80',
    rayAngle: -0.4,
    rayCount: 3,
    rayAlpha: 0.05,
    vigTint: [35, 15, 5],
    particleColor: '#ffcc88',
    fogTint: [170, 150, 130],
  },
};

export function getStageAtmosphere(stageId: StageId): StageAtmosphere {
  return STAGE_ATMOSPHERE[stageId];
}

/** Draw the color grading overlay for a stage */
export function drawColorGrade(
  ctx: CanvasRenderingContext2D,
  stageId: StageId,
): void {
  const atm = STAGE_ATMOSPHERE[stageId];
  const [r, g, b, a] = atm.gradeColor;
  ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

/** Draw stage-specific animated light rays */
export function drawLightRays(
  ctx: CanvasRenderingContext2D,
  stageId: StageId,
  tick: number,
): void {
  const atm = STAGE_ATMOSPHERE[stageId];
  const { rayColor, rayAngle, rayCount, rayAlpha } = atm;
  ctx.save();

  for (let i = 0; i < rayCount; i++) {
    const phase = tick * 0.003 + i * 1.8;
    const sway = Math.sin(phase) * 30;
    const pulse = 0.6 + Math.sin(phase * 0.7 + i) * 0.4;
    const alpha = rayAlpha * pulse;

    // Each ray is a trapezoid from top of screen spreading downward
    const topX = CANVAS_WIDTH * (0.2 + i * 0.2) + sway;
    const topWidth = 15 + Math.sin(phase + 1) * 5;
    const bottomWidth = 80 + Math.sin(phase + 2) * 20;

    const rayGrad = ctx.createLinearGradient(
      topX, 0,
      topX + Math.sin(rayAngle) * CANVAS_HEIGHT, CANVAS_HEIGHT,
    );
    rayGrad.addColorStop(0, `rgba(${rayColor}, ${alpha})`);
    rayGrad.addColorStop(0.3, `rgba(${rayColor}, ${alpha * 0.6})`);
    rayGrad.addColorStop(0.7, `rgba(${rayColor}, ${alpha * 0.2})`);
    rayGrad.addColorStop(1, `rgba(${rayColor}, 0)`);

    ctx.fillStyle = rayGrad;
    ctx.beginPath();
    ctx.moveTo(topX - topWidth / 2, 0);
    ctx.lineTo(topX + topWidth / 2, 0);
    ctx.lineTo(topX + bottomWidth / 2 + Math.sin(rayAngle) * CANVAS_HEIGHT, CANVAS_HEIGHT);
    ctx.lineTo(topX - bottomWidth / 2 + Math.sin(rayAngle) * CANVAS_HEIGHT, CANVAS_HEIGHT);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

/** Draw stage-specific vignette with mood tinting */
export function drawStageVignette(
  ctx: CanvasRenderingContext2D,
  stageId: StageId,
): void {
  const atm = STAGE_ATMOSPHERE[stageId];
  const [r, g, b] = atm.vigTint;
  const vigGrad = ctx.createRadialGradient(
    CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH * 0.28,
    CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH * 0.65,
  );
  vigGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vigGrad.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, 0.10)`);
  vigGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.42)`);
  ctx.fillStyle = vigGrad;
  ctx.fillRect(-10, -10, CANVAS_WIDTH + 20, CANVAS_HEIGHT + 20);
}

/** Draw stage-specific ground fog */
export function drawStageFog(
  ctx: CanvasRenderingContext2D,
  stageId: StageId,
  tick: number,
): void {
  const atm = STAGE_ATMOSPHERE[stageId];
  const [r, g, b] = atm.fogTint;

  // Base fog layer
  const fogGrad = ctx.createLinearGradient(0, STAGE_GROUND_Y + 10, 0, STAGE_GROUND_Y + 60);
  fogGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`);
  fogGrad.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, 0.07)`);
  fogGrad.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, 0.10)`);
  fogGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.14)`);
  ctx.fillStyle = fogGrad;
  ctx.fillRect(-10, STAGE_GROUND_Y + 10, CANVAS_WIDTH + 20, 60);

  // Animated fog wisps
  ctx.save();
  for (let i = 0; i < 5; i++) {
    const wispX = ((tick * 0.2 + i * 180) % (CANVAS_WIDTH + 100)) - 50;
    const wispY = STAGE_GROUND_Y + 5 + Math.sin(tick * 0.015 + i * 2) * 8;
    const wispW = 60 + Math.sin(tick * 0.02 + i) * 20;
    const wispAlpha = 0.04 + Math.sin(tick * 0.025 + i * 1.3) * 0.02;
    const wispGrad = ctx.createRadialGradient(wispX, wispY, 0, wispX, wispY, wispW);
    wispGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${wispAlpha})`);
    wispGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
    ctx.fillStyle = wispGrad;
    ctx.beginPath();
    ctx.ellipse(wispX, wispY, wispW, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** Draw stage-specific ambient particles */
export function drawStageParticles(
  ctx: CanvasRenderingContext2D,
  stageId: StageId,
  tick: number,
): void {
  const atm = STAGE_ATMOSPHERE[stageId];
  ctx.save();

  // Orochi: mystical rising particles
  if (stageId === 'orochi') {
    for (let pi = 0; pi < 12; pi++) {
      const px = ((pi * 73 + tick * 0.4) % (CANVAS_WIDTH + 40)) - 20;
      const py = STAGE_GROUND_Y - ((tick * 0.5 + pi * 45) % (STAGE_GROUND_Y - 50));
      const alpha = 0.1 + Math.sin(tick * 0.04 + pi * 0.8) * 0.06;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = atm.particleColor;
      ctx.beginPath();
      ctx.arc(px, py, 1 + Math.sin(tick * 0.03 + pi) * 0.5, 0, Math.PI * 2);
      ctx.fill();
      // Glow
      ctx.globalAlpha = alpha * 0.3;
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    return;
  }

  // Standard floating particles with per-stage count and behavior
  const count = stageId === 'temple' ? 10 : stageId === 'street' ? 6 : 8;
  for (let pi = 0; pi < count; pi++) {
    const speed = stageId === 'street' ? 0.5 : 0.3;
    const px = ((tick * speed + pi * 120) % (CANVAS_WIDTH + 40)) - 20;
    const py = CANVAS_HEIGHT * 0.3 + Math.sin(tick * 0.02 + pi * 1.7) * 60 + pi * 20;
    const alpha = 0.08 + Math.sin(tick * 0.03 + pi) * 0.04;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = atm.particleColor;
    ctx.beginPath();
    ctx.arc(px, py, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
