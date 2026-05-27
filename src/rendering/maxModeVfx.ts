/**
 * MAX Mode Visual Effects — element-coded pulsing aura, energy wisps, activation flash
 *
 * Renders a per-frame aura around fighters in MAX mode.
 * Aura colors are tinted by character element:
 *   - Ryo: blue-white (lightning)
 *   - Kyo: orange-gold (fire)
 *   - Iori: purple-magenta (dark flame)
 *   - Default: blue-white
 */
import type { MaxModeState } from '../core/types.js';

/** Energy wisp particle state (managed internally) */
interface EnergyWisp {
  x: number;
  y: number;
  vy: number;
  vx: number;
  life: number;
  maxLife: number;
  size: number;
}

/** Per-player wisp pool */
const wispPools: [EnergyWisp[], EnergyWisp[]] = [[], []];
const MAX_WISPS_PER_PLAYER = 12;

// ===== Character Element Colors =====

interface ElementColors {
  /** Core glow (inner) */
  core: [number, number, number];
  /** Mid aura */
  mid: [number, number, number];
  /** Outer aura */
  outer: [number, number, number];
  /** Wisp bright core */
  wispCore: [number, number, number];
  /** Wisp glow */
  wispGlow: [number, number, number];
  /** Ring / accent */
  ring: [number, number, number];
}

const ELEMENT_DEFAULT: ElementColors = {
  core: [180, 220, 255],
  mid: [100, 180, 255],
  outer: [40, 100, 220],
  wispCore: [200, 230, 255],
  wispGlow: [100, 180, 255],
  ring: [120, 200, 255],
};

const ELEMENT_KYO: ElementColors = {
  core: [255, 220, 120],
  mid: [255, 160, 40],
  outer: [200, 80, 10],
  wispCore: [255, 240, 180],
  wispGlow: [255, 160, 40],
  ring: [255, 180, 60],
};

const ELEMENT_IORI: ElementColors = {
  core: [200, 120, 255],
  mid: [140, 40, 200],
  outer: [80, 10, 140],
  wispCore: [220, 160, 255],
  wispGlow: [140, 40, 200],
  ring: [160, 80, 220],
};

const ELEMENT_MAP: Record<string, ElementColors> = {
  kyo: ELEMENT_KYO,
  iori: ELEMENT_IORI,
  ryo: ELEMENT_DEFAULT,
};

function getElementColors(charId: string): ElementColors {
  return ELEMENT_MAP[charId] ?? ELEMENT_DEFAULT;
}

/** Draw the continuous MAX mode aura around a fighter.
 *  Call every frame while maxMode.active is true.
 */
export function drawMAXModeAura(
  ctx: CanvasRenderingContext2D,
  screenX: number,
  groundY: number,
  displayHeight: number,
  tick: number,
  maxMode: MaxModeState,
  playerIdx: 0 | 1,
  charId: string = 'ryo',
): void {
  if (!maxMode.active) return;

  const el = getElementColors(charId);
  const centerX = screenX;
  const centerY = groundY - displayHeight / 2;
  const auraRadius = displayHeight * 0.75;

  // Pulsing alpha between 0.20 and 0.45 (enhanced visibility — was 0.15–0.35)
  const pulsePhase = Math.sin(tick * 0.08);
  const baseAlpha = 0.325 + pulsePhase * 0.125;

  // === 1. Radial gradient aura (element-coded glow) ===
  ctx.save();
  const auraGrad = ctx.createRadialGradient(
    centerX, centerY, auraRadius * 0.15,
    centerX, centerY, auraRadius,
  );
  auraGrad.addColorStop(0, `rgba(${el.core[0]}, ${el.core[1]}, ${el.core[2]}, ${baseAlpha * 1.4})`);
  auraGrad.addColorStop(0.3, `rgba(${el.mid[0]}, ${el.mid[1]}, ${el.mid[2]}, ${baseAlpha})`);
  auraGrad.addColorStop(0.6, `rgba(${el.mid[0]}, ${el.mid[1]}, ${el.mid[2]}, ${baseAlpha * 0.5})`);
  auraGrad.addColorStop(0.85, `rgba(${el.outer[0]}, ${el.outer[1]}, ${el.outer[2]}, ${baseAlpha * 0.15})`);
  auraGrad.addColorStop(1, `rgba(${el.outer[0]}, ${el.outer[1]}, ${el.outer[2]}, 0)`);
  ctx.fillStyle = auraGrad;
  ctx.fillRect(
    Math.round(centerX - auraRadius),
    Math.round(centerY - auraRadius),
    Math.round(auraRadius * 2),
    Math.round(auraRadius * 2),
  );
  ctx.restore();

  // === 2. Pulsing outer ring ===
  const ringPhase = (tick % 80) / 80;
  const ringR = 15 + ringPhase * auraRadius * 1.1;
  const ringAlpha = (1 - ringPhase) * 0.3;
  ctx.save();
  ctx.strokeStyle = `rgba(${el.ring[0]}, ${el.ring[1]}, ${el.ring[2]}, ${ringAlpha})`;
  ctx.lineWidth = 2 * (1 - ringPhase) + 0.5;
  ctx.beginPath();
  ctx.arc(centerX, centerY, ringR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // === 5. Golden outline pulse (KOF2002 MAX mode signature) ===
  const goldPulse = Math.sin(tick * 0.12) * 0.15 + 0.2;
  ctx.save();
  ctx.strokeStyle = `rgba(255, 215, 0, ${Math.max(0, goldPulse)})`;
  ctx.lineWidth = 1.5 + Math.sin(tick * 0.1) * 0.5;
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, auraRadius * 0.55, auraRadius * 0.45, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // === 6. Foot-level golden spark particles ===
  if (tick % 3 === 0) {
    const sparkAngle = Math.random() * Math.PI * 2;
    const sparkDist = 5 + Math.random() * 15;
    const sparkX = centerX + Math.cos(sparkAngle) * sparkDist;
    const sparkY = groundY - 2 + Math.sin(sparkAngle) * 3;
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(sparkX, sparkY, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // === 3. Energy wisps (small upward-drifting particles) ===
  spawnWisps(playerIdx, centerX, centerY, auraRadius, tick);
  updateAndDrawWisps(ctx, playerIdx, tick, el);

  // === 4. Ground-level energy shimmer ===
  ctx.save();
  const groundShimmer = ctx.createRadialGradient(
    centerX, groundY, 5,
    centerX, groundY, auraRadius * 0.6,
  );
  const shimmerAlpha = 0.08 + pulsePhase * 0.04;
  groundShimmer.addColorStop(0, `rgba(${el.mid[0]}, ${el.mid[1]}, ${el.mid[2]}, ${shimmerAlpha})`);
  groundShimmer.addColorStop(0.5, `rgba(${el.outer[0]}, ${el.outer[1]}, ${el.outer[2]}, ${shimmerAlpha * 0.4})`);
  groundShimmer.addColorStop(1, `rgba(${el.outer[0]}, ${el.outer[1]}, ${el.outer[2]}, 0)`);
  ctx.fillStyle = groundShimmer;
  ctx.beginPath();
  ctx.ellipse(centerX, groundY, auraRadius * 0.6, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Spawn new energy wisps at a controlled rate */
function spawnWisps(
  playerIdx: 0 | 1,
  centerX: number,
  centerY: number,
  radius: number,
  tick: number,
): void {
  // Spawn 1 wisp every 4 frames (15 per second)
  if (tick % 4 !== 0) return;
  const pool = wispPools[playerIdx];
  if (pool.length >= MAX_WISPS_PER_PLAYER) return;

  // Spawn around the body perimeter
  const angle = Math.random() * Math.PI * 2;
  const dist = radius * (0.3 + Math.random() * 0.4);
  pool.push({
    x: centerX + Math.cos(angle) * dist,
    y: centerY + Math.sin(angle) * dist,
    vx: (Math.random() - 0.5) * 0.5,
    vy: -1.0 - Math.random() * 1.5, // drift upward
    life: 20 + Math.floor(Math.random() * 15),
    maxLife: 35,
    size: 1.5 + Math.random() * 2,
  });
}

/** Update and render active wisps */
function updateAndDrawWisps(
  ctx: CanvasRenderingContext2D,
  playerIdx: 0 | 1,
  _tick: number,
  el: ElementColors,
): void {
  const pool = wispPools[playerIdx];
  for (let i = pool.length - 1; i >= 0; i--) {
    const w = pool[i];
    w.x += w.vx;
    w.y += w.vy;
    w.vy -= 0.02; // gentle upward acceleration
    w.life--;
    if (w.life <= 0) {
      pool.splice(i, 1);
      continue;
    }

    const alpha = Math.max(0, w.life / w.maxLife) * 0.7;
    const progress = 1 - w.life / w.maxLife;

    ctx.save();
    ctx.globalAlpha = alpha;

    // Bright core
    ctx.fillStyle = `rgba(${el.wispCore[0]}, ${el.wispCore[1]}, ${el.wispCore[2]}, ${alpha})`;
    ctx.beginPath();
    ctx.arc(w.x, w.y, w.size * (1 - progress * 0.3), 0, Math.PI * 2);
    ctx.fill();

    // Soft outer glow
    ctx.fillStyle = `rgba(${el.wispGlow[0]}, ${el.wispGlow[1]}, ${el.wispGlow[2]}, ${alpha * 0.4})`;
    ctx.beginPath();
    ctx.arc(w.x, w.y, w.size * 2 * (1 - progress * 0.2), 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

/** Draw MAX mode activation flash — brief white flash centered on fighter (4 ticks)
 *  and golden screen-wide tint (2 ticks).
 *  Call once at the moment of activation, with the remaining timer counting down.
 */
export function drawMAXActivationFlash(
  ctx: CanvasRenderingContext2D,
  screenX: number,
  groundY: number,
  displayHeight: number,
  timer: number,
  canvasW: number,
  canvasH: number,
  charId: string = 'ryo',
): void {
  if (timer <= 0) return;

  const el = getElementColors(charId);
  const centerY = groundY - displayHeight / 2;

  // Phase 1: White flash centered on fighter (4 ticks) — enhanced with cross-star burst
  if (timer > 0) {
    const flashAlpha = Math.min(1, timer / 4);
    const flashRadius = displayHeight * 0.8;

    ctx.save();
    const flashGrad = ctx.createRadialGradient(
      screenX, centerY, 0,
      screenX, centerY, flashRadius,
    );
    flashGrad.addColorStop(0, `rgba(255, 255, 255, ${flashAlpha * 0.95})`);
    flashGrad.addColorStop(0.3, `rgba(${el.core[0]}, ${el.core[1]}, ${el.core[2]}, ${flashAlpha * 0.55})`);
    flashGrad.addColorStop(0.6, `rgba(${el.mid[0]}, ${el.mid[1]}, ${el.mid[2]}, ${flashAlpha * 0.25})`);
    flashGrad.addColorStop(1, `rgba(${el.outer[0]}, ${el.outer[1]}, ${el.outer[2]}, 0)`);
    ctx.fillStyle = flashGrad;
    ctx.fillRect(
      Math.round(screenX - flashRadius),
      Math.round(centerY - flashRadius),
      Math.round(flashRadius * 2),
      Math.round(flashRadius * 2),
    );
    ctx.restore();

    // Cross-star burst rays during first 2 frames
    if (timer >= 2) {
      ctx.save();
      ctx.globalAlpha = flashAlpha * 0.6;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2 + Math.PI / 8;
        const rayLen = flashRadius * 0.8;
        ctx.beginPath();
        ctx.moveTo(screenX, centerY);
        ctx.lineTo(
          screenX + Math.cos(angle) * rayLen,
          centerY + Math.sin(angle) * rayLen,
        );
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  // Phase 2: Golden screen-wide tint (2 ticks)
  if (timer >= 2) {
    const tintAlpha = (timer - 2) / 2 * 0.15;
    ctx.save();
    ctx.fillStyle = `rgba(255, 220, 80, ${tintAlpha})`;
    ctx.fillRect(0, 0, canvasW, canvasH);
    ctx.restore();
  }
}

/** Clear wisp pools (call on round reset) */
export function resetMAXWisps(): void {
  wispPools[0].length = 0;
  wispPools[1].length = 0;
}
