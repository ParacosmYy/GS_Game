/**
 * Projectile renderer — character-specific fireball visuals with trails, glow, pulsation.
 * Extracted from renderer.ts for separation of concerns.
 */
import { Projectile } from '../entities/projectile.js';
import { ROSTER } from '../characters/index.js';
import type { Camera } from '../core/camera.js';
import { STAGE_GROUND_Y } from '../core/constants.js';

interface ProjectileVisuals {
  baseRadius: number;
  stretch: number;       // horizontal stretch (1.0 = circle)
  groundHug: boolean;    // stays on ground (Terry Power Wave)
  trailCount: number;
  trailSpacing: number;
  pulseSpeed: number;
  pulseAmount: number;   // 0–1
}

const VISUALS: Record<string, ProjectileVisuals> = {
  kyo:   { baseRadius: 12, stretch: 1.6, groundHug: false, trailCount: 4, trailSpacing: 16, pulseSpeed: 8, pulseAmount: 0.25 },
  iori:  { baseRadius: 11, stretch: 1.3, groundHug: false, trailCount: 3, trailSpacing: 14, pulseSpeed: 6, pulseAmount: 0.2 },
  terry: { baseRadius: 10, stretch: 2.0, groundHug: true,  trailCount: 5, trailSpacing: 12, pulseSpeed: 10, pulseAmount: 0.15 },
  kim:   { baseRadius: 10, stretch: 1.0, groundHug: false, trailCount: 3, trailSpacing: 14, pulseSpeed: 7, pulseAmount: 0.2 },
  ryo:   { baseRadius: 13, stretch: 1.5, groundHug: false, trailCount: 4, trailSpacing: 15, pulseSpeed: 9, pulseAmount: 0.22 },
};

const DEFAULT_VIS: ProjectileVisuals = { baseRadius: 10, stretch: 1.0, groundHug: false, trailCount: 3, trailSpacing: 14, pulseSpeed: 7, pulseAmount: 0.2 };

export function drawProjectiles(ctx: CanvasRenderingContext2D, projectiles: Projectile[], camera: Camera): void {
  for (const proj of projectiles) {
    if (!proj.active) continue;

    const sx = camera.worldToScreen(proj.x);
    const charDef = ROSTER.find(c => c.id === proj.charId);
    const color = charDef?.specialColor || '#ff8800';
    const glow = charDef?.specialGlow || '#ff6600';
    const vis = VISUALS[proj.charId] || DEFAULT_VIS;

    const y = vis.groundHug ? STAGE_GROUND_Y - 5 : proj.y;
    const pulse = 1 + Math.sin(proj.currentFrame * vis.pulseSpeed * 0.1) * vis.pulseAmount;
    const radius = vis.baseRadius * pulse;
    const fadeIn = Math.min(1, proj.currentFrame / 5);

    ctx.save();
    ctx.globalAlpha = fadeIn;

    // Trail echoes
    for (let i = vis.trailCount; i >= 1; i--) {
      ctx.globalAlpha = (0.15 / i) * fadeIn;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(sx - proj.facing * vis.trailSpacing * i, y, radius * (1 - i * 0.12) * vis.stretch, radius * (1 - i * 0.12), 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Outer glow aura
    ctx.globalAlpha = 0.4 * fadeIn;
    const auraGrad = ctx.createRadialGradient(sx, y, radius * 0.5, sx, y, radius * 2.5);
    auraGrad.addColorStop(0, glow);
    auraGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.ellipse(sx, y, radius * 2.5 * vis.stretch, radius * 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Main body
    ctx.globalAlpha = 0.9 * fadeIn;
    ctx.shadowColor = glow;
    ctx.shadowBlur = 20;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(sx, y, radius * vis.stretch, radius, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // White-hot core
    ctx.globalAlpha = fadeIn;
    const coreGrad = ctx.createRadialGradient(sx, y, 0, sx, y, radius * 0.6);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.5, '#fff8e0');
    coreGrad.addColorStop(1, color);
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.ellipse(sx, y, radius * 0.6 * vis.stretch, radius * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Spawn burst ring (first 6 frames)
    if (proj.currentFrame < 6) {
      const prog = proj.currentFrame / 6;
      ctx.globalAlpha = (1 - prog) * 0.5;
      ctx.strokeStyle = glow;
      ctx.lineWidth = 2 * (1 - prog) + 1;
      ctx.beginPath();
      ctx.arc(sx, y, 10 + prog * 40, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }
}
