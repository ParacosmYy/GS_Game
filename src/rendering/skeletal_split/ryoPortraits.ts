/**
 * Ryo portrait rendering for HUD and select screen
 * Split from skeletalParts.ts
 */
import { shiftColor, roundRect, verticalGrad } from '../utils.js';

// ===== Ryo portrait rendering — HUD & select screen =====

/** Ryo color palette variants for A/B/C/D color indices */
const RYO_COLOR_PALETTES: Array<{ hair: string; headband: string; skin: string; gi: string; giShadow: string }> = [
  // A: classic orange gi, gold-brown hair
  { hair: '#8B6914', headband: '#cc2222', skin: '#e8b07d', gi: '#f7f4ee', giShadow: '#d5cec2' },
  // B: dark gi, lighter hair
  { hair: '#a07828', headband: '#2255cc', skin: '#e8b07d', gi: '#2a2a3a', giShadow: '#1a1a2a' },
  // C: red gi, dark hair
  { hair: '#5a4020', headband: '#cc2222', skin: '#e8b07d', gi: '#cc3333', giShadow: '#992222' },
  // D: green gi, gold hair
  { hair: '#b8901a', headband: '#225522', skin: '#e8b07d', gi: '#338844', giShadow: '#226633' },
];

function getRyoPalette(colorIndex: number) {
  return RYO_COLOR_PALETTES[Math.max(0, Math.min(3, colorIndex))] ?? RYO_COLOR_PALETTES[0];
}

/**
 * Draw Ryo's HUD portrait — small face closeup for health bar area.
 *
 * Health-dependent effects:
 *   > 50%: normal expression
 *   25-50%: slightly bruised (darker shadows)
 *   < 25%: desperation (red tint, sweat drops)
 */
export function drawRyoPortrait(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  width: number, height: number,
  healthPercent: number,
  colorIndex: number,
): void {
  ctx.save();
  ctx.translate(x, y);

  const pal = getRyoPalette(colorIndex);
  const isLow = healthPercent < 0.5;
  const isDesperate = healthPercent < 0.25;

  // Clip to portrait bounds
  ctx.beginPath();
  roundRect(ctx, 0, 0, width, height, 3);
  ctx.clip();

  // Background
  ctx.fillStyle = verticalGrad(ctx, 0, 0, height, '#0a0a18', '#151520');
  ctx.fillRect(0, 0, width, height);

  // Center the head within the portrait box
  const cx = width / 2;
  const cy = height * 0.45;
  const headR = Math.min(width, height) * 0.36;

  // === Head shape — skin with depth gradient ===
  const skinGrad = ctx.createRadialGradient(cx - headR * 0.1, cy - headR * 0.1, 0, cx, cy, headR);
  skinGrad.addColorStop(0, shiftColor(pal.skin, 25));
  skinGrad.addColorStop(0.55, pal.skin);
  skinGrad.addColorStop(0.85, shiftColor(pal.skin, -12));
  skinGrad.addColorStop(1, shiftColor(pal.skin, -22));
  ctx.fillStyle = skinGrad;
  ctx.beginPath();
  ctx.ellipse(cx, cy, headR * 0.92, headR, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head outline — crisp SNK-style dark line
  ctx.strokeStyle = shiftColor(pal.skin, -45);
  ctx.lineWidth = Math.max(1, headR * 0.04);
  ctx.beginPath();
  ctx.ellipse(cx, cy, headR * 0.92, headR, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Cheekbone shadows — defined facial structure
  ctx.fillStyle = shiftColor(pal.skin, -10);
  ctx.beginPath();
  ctx.ellipse(cx - headR * 0.35, cy + headR * 0.12, headR * 0.18, headR * 0.12, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + headR * 0.35, cy + headR * 0.12, headR * 0.18, headR * 0.12, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Desperation red tint overlay
  if (isDesperate) {
    ctx.fillStyle = 'rgba(200, 30, 10, 0.15)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, headR * 0.92, headR, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Low health darker shadows
  if (isLow) {
    ctx.fillStyle = 'rgba(60, 20, 10, 0.18)';
    ctx.beginPath();
    ctx.ellipse(cx + headR * 0.3, cy + headR * 0.3, headR * 0.5, headR * 0.6, 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  // === Hair — short spiky swept-back brown hair with depth ===
  // Hair base — fuller coverage underneath spikes
  ctx.fillStyle = pal.hair;
  ctx.beginPath();
  ctx.moveTo(cx - headR * 0.9, cy - headR + headR * 0.12);
  ctx.quadraticCurveTo(cx - headR * 0.6, cy - headR - headR * 0.2, cx, cy - headR - headR * 0.15);
  ctx.quadraticCurveTo(cx + headR * 0.6, cy - headR - headR * 0.2, cx + headR * 0.9, cy - headR + headR * 0.12);
  ctx.lineTo(cx + headR * 0.88, cy - headR + headR * 0.25);
  ctx.quadraticCurveTo(cx, cy - headR + headR * 0.18, cx - headR * 0.88, cy - headR + headR * 0.25);
  ctx.closePath();
  ctx.fill();

  // Hair spikes — swept-back angular style with darker shadow layer
  const hairSpikes = [
    { x: -0.5, y: -1.15, w: 0.16 },
    { x: -0.18, y: -1.5, w: 0.18 },
    { x: 0.12, y: -1.38, w: 0.16 },
    { x: 0.38, y: -1.2, w: 0.14 },
    { x: 0.6, y: -1.0, w: 0.12 },
  ] as const;
  for (const spike of hairSpikes) {
    const spikeX = cx + spike.x * headR;
    const spikeY = cy + spike.y * headR;
    const spikeW = spike.w * headR;
    // Main spike
    ctx.fillStyle = pal.hair;
    ctx.beginPath();
    ctx.moveTo(spikeX - spikeW, cy - headR + headR * 0.1);
    ctx.lineTo(spikeX, spikeY);
    ctx.lineTo(spikeX + spikeW, cy - headR + headR * 0.1);
    ctx.closePath();
    ctx.fill();
    // Darker edge on each spike for depth
    ctx.fillStyle = shiftColor(pal.hair, -20);
    ctx.beginPath();
    ctx.moveTo(spikeX, spikeY);
    ctx.lineTo(spikeX + spikeW * 0.4, spikeY + headR * 0.06);
    ctx.lineTo(spikeX + spikeW, cy - headR + headR * 0.1);
    ctx.closePath();
    ctx.fill();
  }

  // Hair shadow band — darker zone near hairline for depth
  ctx.fillStyle = shiftColor(pal.hair, -25);
  ctx.fillRect(cx - headR * 0.85, cy - headR + headR * 0.16, headR * 1.7, headR * 0.06);
  // Hair highlight streak — subtle lighter band
  ctx.fillStyle = shiftColor(pal.hair, 20);
  ctx.fillRect(cx - headR * 0.15, cy - headR + headR * 0.08, headR * 0.1, headR * 0.12);

  // === Red headband — Ryo's signature with knot and trailing tails ===
  // Headband base — slightly wider than head for visible tails
  ctx.fillStyle = pal.headband;
  ctx.fillRect(cx - headR * 0.95, cy - headR + headR * 0.06, headR * 1.9, headR * 0.18);
  // Headband highlight — lighter center stripe
  ctx.fillStyle = shiftColor(pal.headband, 25);
  ctx.fillRect(cx - headR * 0.85, cy - headR + headR * 0.06, headR * 1.7, headR * 0.05);
  // Headband shadow — darker bottom edge
  ctx.fillStyle = shiftColor(pal.headband, -25);
  ctx.fillRect(cx - headR * 0.9, cy - headR + headR * 0.18, headR * 1.8, headR * 0.04);
  // Headband knot — small rectangle where tails emerge
  const knotX = cx - headR * 0.7;
  const knotY = cy - headR + headR * 0.14;
  ctx.fillStyle = shiftColor(pal.headband, -15);
  ctx.fillRect(knotX - headR * 0.06, knotY - headR * 0.06, headR * 0.12, headR * 0.12);
  // Headband tails — two trailing strips flowing backward
  const tailDark = shiftColor(pal.headband, -30);
  ctx.fillStyle = tailDark;
  // Tail 1 — longer, curving down
  ctx.beginPath();
  ctx.moveTo(knotX - headR * 0.04, knotY + headR * 0.04);
  ctx.quadraticCurveTo(knotX - headR * 0.25, knotY + headR * 0.15, knotX - headR * 0.35, knotY + headR * 0.45);
  ctx.lineTo(knotX - headR * 0.28, knotY + headR * 0.48);
  ctx.quadraticCurveTo(knotX - headR * 0.18, knotY + headR * 0.12, knotX + headR * 0.02, knotY + headR * 0.04);
  ctx.closePath();
  ctx.fill();
  // Tail 2 — shorter, overlapping
  ctx.beginPath();
  ctx.moveTo(knotX + headR * 0.02, knotY + headR * 0.04);
  ctx.quadraticCurveTo(knotX - headR * 0.15, knotY + headR * 0.2, knotX - headR * 0.2, knotY + headR * 0.55);
  ctx.lineTo(knotX - headR * 0.14, knotY + headR * 0.57);
  ctx.quadraticCurveTo(knotX - headR * 0.08, knotY + headR * 0.18, knotX + headR * 0.06, knotY + headR * 0.04);
  ctx.closePath();
  ctx.fill();
  // Tail highlight
  ctx.fillStyle = shiftColor(pal.headband, -10);
  ctx.beginPath();
  ctx.moveTo(knotX, knotY + headR * 0.04);
  ctx.quadraticCurveTo(knotX - headR * 0.2, knotY + headR * 0.12, knotX - headR * 0.3, knotY + headR * 0.4);
  ctx.lineTo(knotX - headR * 0.28, knotY + headR * 0.4);
  ctx.quadraticCurveTo(knotX - headR * 0.18, knotY + headR * 0.1, knotX + headR * 0.02, knotY + headR * 0.04);
  ctx.closePath();
  ctx.fill();

  // === Eyes — determined stare with upper eyelid line ===
  const eyeSpacing = headR * 0.3;
  const eyeY = cy - headR * 0.05;
  const eyeR = headR * 0.13;
  for (const side of [-1, 1]) {
    const ex = cx + side * eyeSpacing;
    // Eye socket shadow
    ctx.fillStyle = shiftColor(pal.skin, -18);
    ctx.beginPath();
    ctx.ellipse(ex, eyeY + 1, eyeR * 1.2, eyeR * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();
    // Sclera
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(ex, eyeY, eyeR, eyeR + 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    ctx.stroke();
    // Iris — deep blue
    ctx.fillStyle = '#4169E1';
    ctx.beginPath();
    ctx.arc(ex + 1, eyeY, eyeR * 0.55, 0, Math.PI * 2);
    ctx.fill();
    // Iris ring — darker outer edge
    ctx.strokeStyle = '#2a4a9a';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.arc(ex + 1, eyeY, eyeR * 0.55, 0, Math.PI * 2);
    ctx.stroke();
    // Pupil
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(ex + 1.2, eyeY, eyeR * 0.28, 0, Math.PI * 2);
    ctx.fill();
    // Eye shine — upper-left catchlight
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath();
    ctx.arc(ex + 0.3, eyeY - eyeR * 0.25, eyeR * 0.22, 0, Math.PI * 2);
    ctx.fill();
    // Lower eye shine — subtle
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.arc(ex + 1.5, eyeY + eyeR * 0.2, eyeR * 0.12, 0, Math.PI * 2);
    ctx.fill();
    // Upper eyelid line — thick, gives Ryo his characteristic narrow determined eyes
    ctx.strokeStyle = '#2a1a08';
    ctx.lineWidth = Math.max(1.5, headR * 0.06);
    ctx.beginPath();
    ctx.moveTo(ex - eyeR * 1.2, eyeY - eyeR * 0.3 - side * headR * 0.015);
    ctx.quadraticCurveTo(ex, eyeY - eyeR * 1.1, ex + eyeR * 1.2, eyeY - eyeR * 0.3 + side * headR * 0.015);
    ctx.stroke();
  }

  // === Brows — heavy angled brows, Ryo's trademark glare ===
  ctx.strokeStyle = shiftColor(pal.hair, -35);
  ctx.lineWidth = Math.max(2, headR * 0.09);
  ctx.lineCap = 'round';
  for (const side of [-1, 1]) {
    const browX = cx + side * eyeSpacing;
    ctx.beginPath();
    ctx.moveTo(browX - side * headR * 0.2, eyeY - headR * 0.18 - side * headR * 0.04);
    ctx.lineTo(browX + side * headR * 0.08, eyeY - headR * 0.24 + side * headR * 0.02);
    ctx.stroke();
  }

  // === Nose — more defined bridge and nostril hint ===
  // Nose bridge shadow line
  ctx.strokeStyle = shiftColor(pal.skin, -18);
  ctx.lineWidth = Math.max(0.8, headR * 0.035);
  ctx.beginPath();
  ctx.moveTo(cx + headR * 0.02, cy - headR * 0.02);
  ctx.lineTo(cx + headR * 0.05, cy + headR * 0.15);
  ctx.stroke();
  // Nose tip highlight
  ctx.fillStyle = shiftColor(pal.skin, 10);
  ctx.beginPath();
  ctx.arc(cx + headR * 0.02, cy + headR * 0.13, headR * 0.05, 0, Math.PI * 2);
  ctx.fill();
  // Nostril shadow
  ctx.fillStyle = shiftColor(pal.skin, -18);
  ctx.beginPath();
  ctx.ellipse(cx + headR * 0.08, cy + headR * 0.18, headR * 0.035, headR * 0.025, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // === Mouth — lip outline with expression ===
  const mouthY = cy + headR * 0.38;
  // Upper lip line
  ctx.strokeStyle = shiftColor(pal.skin, -30);
  ctx.lineWidth = Math.max(0.8, headR * 0.03);
  ctx.beginPath();
  ctx.moveTo(cx - headR * 0.14, mouthY);
  ctx.quadraticCurveTo(cx - headR * 0.04, mouthY - headR * 0.03, cx, mouthY - headR * 0.02);
  ctx.quadraticCurveTo(cx + headR * 0.04, mouthY - headR * 0.03, cx + headR * 0.14, mouthY);
  ctx.stroke();
  // Lower lip — subtle shadow
  ctx.fillStyle = shiftColor(pal.skin, -8);
  ctx.beginPath();
  ctx.moveTo(cx - headR * 0.12, mouthY);
  ctx.quadraticCurveTo(cx, mouthY + headR * 0.06, cx + headR * 0.12, mouthY);
  ctx.quadraticCurveTo(cx, mouthY + headR * 0.03, cx - headR * 0.12, mouthY);
  ctx.closePath();
  ctx.fill();
  // Mouth expression when desperate
  if (isDesperate) {
    ctx.strokeStyle = shiftColor(pal.skin, -40);
    ctx.lineWidth = Math.max(1, headR * 0.04);
    ctx.beginPath();
    ctx.moveTo(cx - headR * 0.15, mouthY - headR * 0.02);
    ctx.quadraticCurveTo(cx, mouthY + headR * 0.05, cx + headR * 0.15, mouthY - headR * 0.02);
    ctx.stroke();
  }

  // === Jaw line — strong defined jaw ===
  ctx.strokeStyle = shiftColor(pal.skin, -28);
  ctx.lineWidth = Math.max(0.8, headR * 0.035);
  ctx.beginPath();
  ctx.moveTo(cx - headR * 0.55, cy + headR * 0.55);
  ctx.quadraticCurveTo(cx - headR * 0.35, cy + headR * 0.85, cx, cy + headR * 0.9);
  ctx.quadraticCurveTo(cx + headR * 0.35, cy + headR * 0.85, cx + headR * 0.55, cy + headR * 0.55);
  ctx.stroke();
  // Chin shadow
  ctx.fillStyle = shiftColor(pal.skin, -12);
  ctx.beginPath();
  ctx.ellipse(cx, cy + headR * 0.78, headR * 0.2, headR * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();

  // Sweat drops when desperate
  if (isDesperate) {
    ctx.fillStyle = 'rgba(120, 200, 255, 0.7)';
    const sweatX = cx + headR * 0.7;
    const sweatY = cy - headR * 0.3;
    ctx.beginPath();
    ctx.moveTo(sweatX, sweatY - headR * 0.06);
    ctx.quadraticCurveTo(sweatX + headR * 0.04, sweatY, sweatX, sweatY + headR * 0.04);
    ctx.quadraticCurveTo(sweatX - headR * 0.04, sweatY, sweatX, sweatY - headR * 0.06);
    ctx.fill();
    // Second smaller drop
    ctx.fillStyle = 'rgba(120, 200, 255, 0.5)';
    ctx.beginPath();
    ctx.moveTo(sweatX - headR * 0.1, sweatY + headR * 0.12);
    ctx.quadraticCurveTo(sweatX - headR * 0.06, sweatY + headR * 0.16, sweatX - headR * 0.1, sweatY + headR * 0.19);
    ctx.quadraticCurveTo(sweatX - headR * 0.14, sweatY + headR * 0.16, sweatX - headR * 0.1, sweatY + headR * 0.12);
    ctx.fill();
  }

  // Portrait border — gold SNK-style frame
  ctx.strokeStyle = 'rgba(200, 168, 50, 0.6)';
  ctx.lineWidth = 1;
  roundRect(ctx, 0, 0, width, height, 3);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draw Ryo's select screen portrait — larger upper body bust.
 *
 * Shows: head + shoulders + gi V-neck + red headband.
 * Slight 3/4 view angle simulated with offset features.
 */
export function drawRyoSelectPortrait(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  size: number,
  colorIndex: number,
): void {
  ctx.save();
  ctx.translate(x, y);

  const pal = getRyoPalette(colorIndex);

  // Clip to portrait bounds
  ctx.beginPath();
  roundRect(ctx, 0, 0, size, size, 6);
  ctx.clip();

  // Background gradient
  const bgGrad = ctx.createRadialGradient(size * 0.5, size * 0.4, 0, size * 0.5, size * 0.5, size * 0.7);
  bgGrad.addColorStop(0, '#1a1520');
  bgGrad.addColorStop(1, '#080810');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, size, size);

  // Center of portrait — slightly off-center for 3/4 view feel
  const cx = size * 0.48;
  const headCy = size * 0.35;
  const headR = size * 0.22;

  // === Shoulders / Gi top ===
  const shoulderY = size * 0.62;
  const shoulderW = size * 0.72;

  // Gi body — gradient with fabric fold shading
  const giGrad = ctx.createLinearGradient(cx - shoulderW / 2, shoulderY, cx + shoulderW / 2, shoulderY + size * 0.4);
  giGrad.addColorStop(0, pal.gi);
  giGrad.addColorStop(0.3, shiftColor(pal.gi, -5));
  giGrad.addColorStop(0.6, shiftColor(pal.gi, -10));
  giGrad.addColorStop(1, pal.giShadow);
  ctx.fillStyle = giGrad;
  ctx.beginPath();
  ctx.moveTo(cx - shoulderW / 2, shoulderY);
  ctx.quadraticCurveTo(cx - shoulderW / 2 - size * 0.05, shoulderY + size * 0.15, cx - shoulderW / 2 + size * 0.05, size);
  ctx.lineTo(cx + shoulderW / 2 - size * 0.05, size);
  ctx.quadraticCurveTo(cx + shoulderW / 2 + size * 0.05, shoulderY + size * 0.15, cx + shoulderW / 2, shoulderY);
  ctx.closePath();
  ctx.fill();

  // Gi fabric folds — diagonal shading lines for fabric drape
  ctx.strokeStyle = shiftColor(pal.gi, -15);
  ctx.lineWidth = Math.max(0.6, size * 0.006);
  ctx.beginPath();
  ctx.moveTo(cx - shoulderW * 0.35, shoulderY + size * 0.04);
  ctx.quadraticCurveTo(cx - shoulderW * 0.2, shoulderY + size * 0.15, cx - shoulderW * 0.1, shoulderY + size * 0.3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + shoulderW * 0.3, shoulderY + size * 0.06);
  ctx.quadraticCurveTo(cx + shoulderW * 0.15, shoulderY + size * 0.18, cx + shoulderW * 0.08, shoulderY + size * 0.32);
  ctx.stroke();

  // Shoulder muscle definition — deltoid shadow lines
  ctx.strokeStyle = shiftColor(pal.gi, -20);
  ctx.lineWidth = Math.max(0.8, size * 0.007);
  ctx.beginPath();
  ctx.moveTo(cx - shoulderW * 0.42, shoulderY + size * 0.01);
  ctx.quadraticCurveTo(cx - shoulderW * 0.3, shoulderY + size * 0.05, cx - shoulderW * 0.15, shoulderY + size * 0.04);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + shoulderW * 0.42, shoulderY + size * 0.01);
  ctx.quadraticCurveTo(cx + shoulderW * 0.3, shoulderY + size * 0.05, cx + shoulderW * 0.15, shoulderY + size * 0.04);
  ctx.stroke();

  // Gi V-neck opening — skin visible with shadow depth
  const neckTopY = headCy + headR * 0.9;
  // V-neck shadow — darker recessed area
  ctx.fillStyle = shiftColor(pal.gi, -35);
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.07, neckTopY);
  ctx.lineTo(cx, shoulderY + size * 0.2);
  ctx.lineTo(cx + size * 0.07, neckTopY);
  ctx.closePath();
  ctx.fill();
  // V-neck skin — chest skin visible
  ctx.fillStyle = shiftColor(pal.skin, -8);
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.05, neckTopY);
  ctx.lineTo(cx, shoulderY + size * 0.17);
  ctx.lineTo(cx + size * 0.05, neckTopY);
  ctx.closePath();
  ctx.fill();
  // Chest muscle hint — pectoral line in the V-neck
  ctx.strokeStyle = shiftColor(pal.skin, -15);
  ctx.lineWidth = Math.max(0.5, size * 0.004);
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.025, neckTopY + size * 0.02);
  ctx.quadraticCurveTo(cx, neckTopY + size * 0.06, cx + size * 0.025, neckTopY + size * 0.02);
  ctx.stroke();

  // Gi V-neck outline — thick karate collar lines
  ctx.strokeStyle = shiftColor(pal.gi, -30);
  ctx.lineWidth = Math.max(1.5, size * 0.014);
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.065, neckTopY);
  ctx.lineTo(cx, shoulderY + size * 0.18);
  ctx.lineTo(cx + size * 0.065, neckTopY);
  ctx.stroke();

  // Gi collar fold — left and right lapel overlays
  // Left lapel — overlaps gi body
  ctx.fillStyle = shiftColor(pal.gi, 8);
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.065, neckTopY - size * 0.005);
  ctx.lineTo(cx - size * 0.12, shoulderY + size * 0.04);
  ctx.lineTo(cx - size * 0.02, shoulderY + size * 0.12);
  ctx.lineTo(cx - size * 0.01, neckTopY + size * 0.01);
  ctx.closePath();
  ctx.fill();
  // Right lapel
  ctx.fillStyle = shiftColor(pal.gi, -5);
  ctx.beginPath();
  ctx.moveTo(cx + size * 0.065, neckTopY - size * 0.005);
  ctx.lineTo(cx + size * 0.12, shoulderY + size * 0.04);
  ctx.lineTo(cx + size * 0.02, shoulderY + size * 0.12);
  ctx.lineTo(cx + size * 0.01, neckTopY + size * 0.01);
  ctx.closePath();
  ctx.fill();

  // Collar fold highlight lines
  ctx.strokeStyle = shiftColor(pal.gi, 30);
  ctx.lineWidth = Math.max(0.8, size * 0.006);
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.07, neckTopY - size * 0.008);
  ctx.lineTo(cx - size * 0.1, shoulderY + size * 0.05);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + size * 0.07, neckTopY - size * 0.008);
  ctx.lineTo(cx + size * 0.1, shoulderY + size * 0.05);
  ctx.stroke();

  // Belt / obi — visible at waist, black karate belt
  const beltY = shoulderY + size * 0.26;
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(cx - shoulderW * 0.35, beltY, shoulderW * 0.7, size * 0.028);
  // Belt highlight
  ctx.fillStyle = '#333';
  ctx.fillRect(cx - shoulderW * 0.33, beltY, shoulderW * 0.66, size * 0.008);
  // Belt knot — diamond shape
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.moveTo(cx, beltY - size * 0.005);
  ctx.lineTo(cx - size * 0.018, beltY + size * 0.014);
  ctx.lineTo(cx, beltY + size * 0.032);
  ctx.lineTo(cx + size * 0.018, beltY + size * 0.014);
  ctx.closePath();
  ctx.fill();
  // Belt tails — two strips hanging from knot
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.01, beltY + size * 0.03);
  ctx.quadraticCurveTo(cx - size * 0.02, beltY + size * 0.06, cx - size * 0.015, beltY + size * 0.09);
  ctx.lineTo(cx - size * 0.005, beltY + size * 0.09);
  ctx.quadraticCurveTo(cx - size * 0.01, beltY + size * 0.06, cx + size * 0.005, beltY + size * 0.03);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + size * 0.01, beltY + size * 0.03);
  ctx.quadraticCurveTo(cx + size * 0.015, beltY + size * 0.06, cx + size * 0.01, beltY + size * 0.085);
  ctx.lineTo(cx + size * 0.003, beltY + size * 0.085);
  ctx.quadraticCurveTo(cx + size * 0.005, beltY + size * 0.06, cx, beltY + size * 0.03);
  ctx.closePath();
  ctx.fill();

  // === Neck — with tendon/muscle detail ===
  // Neck shadow
  ctx.fillStyle = shiftColor(pal.skin, -15);
  ctx.beginPath();
  ctx.moveTo(cx - headR * 0.32, headCy + headR * 0.75);
  ctx.lineTo(cx - headR * 0.28, shoulderY + size * 0.02);
  ctx.lineTo(cx + headR * 0.28, shoulderY + size * 0.02);
  ctx.lineTo(cx + headR * 0.32, headCy + headR * 0.75);
  ctx.closePath();
  ctx.fill();
  // Neck main — skin
  ctx.fillStyle = shiftColor(pal.skin, -5);
  ctx.beginPath();
  ctx.moveTo(cx - headR * 0.25, headCy + headR * 0.75);
  ctx.lineTo(cx - headR * 0.2, shoulderY + size * 0.02);
  ctx.lineTo(cx + headR * 0.2, shoulderY + size * 0.02);
  ctx.lineTo(cx + headR * 0.25, headCy + headR * 0.75);
  ctx.closePath();
  ctx.fill();
  // Neck tendon line — sternocleidomastoid shadow
  ctx.strokeStyle = shiftColor(pal.skin, -12);
  ctx.lineWidth = Math.max(0.5, size * 0.004);
  ctx.beginPath();
  ctx.moveTo(cx - headR * 0.08, headCy + headR * 0.8);
  ctx.quadraticCurveTo(cx - headR * 0.05, shoulderY - size * 0.01, cx - size * 0.02, shoulderY + size * 0.02);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + headR * 0.08, headCy + headR * 0.8);
  ctx.quadraticCurveTo(cx + headR * 0.05, shoulderY - size * 0.01, cx + size * 0.02, shoulderY + size * 0.02);
  ctx.stroke();

  // === Head — detailed face with SNK-style depth ===
  const skinGrad = ctx.createRadialGradient(cx - headR * 0.1, headCy - headR * 0.1, 0, cx, headCy, headR);
  skinGrad.addColorStop(0, shiftColor(pal.skin, 25));
  skinGrad.addColorStop(0.5, pal.skin);
  skinGrad.addColorStop(0.8, shiftColor(pal.skin, -12));
  skinGrad.addColorStop(1, shiftColor(pal.skin, -20));
  ctx.fillStyle = skinGrad;
  ctx.beginPath();
  ctx.ellipse(cx, headCy, headR * 0.92, headR, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head outline
  ctx.strokeStyle = shiftColor(pal.skin, -40);
  ctx.lineWidth = Math.max(1, size * 0.006);
  ctx.beginPath();
  ctx.ellipse(cx, headCy, headR * 0.92, headR, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Cheekbone shadows
  ctx.fillStyle = shiftColor(pal.skin, -10);
  ctx.beginPath();
  ctx.ellipse(cx - headR * 0.32, headCy + headR * 0.15, headR * 0.16, headR * 0.1, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + headR * 0.32, headCy + headR * 0.15, headR * 0.16, headR * 0.1, 0.15, 0, Math.PI * 2);
  ctx.fill();

  // === Hair — swept back spiky with depth layers ===
  // Hair base — full coverage
  ctx.fillStyle = pal.hair;
  ctx.beginPath();
  ctx.moveTo(cx - headR * 0.9, headCy - headR + headR * 0.1);
  ctx.quadraticCurveTo(cx - headR * 0.5, headCy - headR - headR * 0.22, cx, headCy - headR - headR * 0.18);
  ctx.quadraticCurveTo(cx + headR * 0.5, headCy - headR - headR * 0.22, cx + headR * 0.9, headCy - headR + headR * 0.1);
  ctx.lineTo(cx + headR * 0.88, headCy - headR + headR * 0.24);
  ctx.quadraticCurveTo(cx, headCy - headR + headR * 0.16, cx - headR * 0.88, headCy - headR + headR * 0.24);
  ctx.closePath();
  ctx.fill();

  // Hair spikes with shadow depth
  const spikes = [
    { x: -0.6, y: -1.2, w: 0.17 },
    { x: -0.25, y: -1.55, w: 0.19 },
    { x: 0.1, y: -1.4, w: 0.17 },
    { x: 0.4, y: -1.15, w: 0.15 },
    { x: 0.6, y: -0.95, w: 0.13 },
  ] as const;
  for (const spike of spikes) {
    const spikeX = cx + spike.x * headR;
    const spikeY = headCy + spike.y * headR;
    const spikeW = spike.w * headR;
    // Main spike
    ctx.fillStyle = pal.hair;
    ctx.beginPath();
    ctx.moveTo(spikeX - spikeW, headCy - headR + headR * 0.08);
    ctx.lineTo(spikeX, spikeY);
    ctx.lineTo(spikeX + spikeW, headCy - headR + headR * 0.08);
    ctx.closePath();
    ctx.fill();
    // Darker edge on spike
    ctx.fillStyle = shiftColor(pal.hair, -20);
    ctx.beginPath();
    ctx.moveTo(spikeX, spikeY);
    ctx.lineTo(spikeX + spikeW * 0.35, spikeY + headR * 0.07);
    ctx.lineTo(spikeX + spikeW, headCy - headR + headR * 0.08);
    ctx.closePath();
    ctx.fill();
  }
  // Hair shadow band — darker zone at hairline
  ctx.fillStyle = shiftColor(pal.hair, -25);
  ctx.fillRect(cx - headR * 0.85, headCy - headR + headR * 0.17, headR * 1.7, headR * 0.06);
  // Hair highlight streak
  ctx.fillStyle = shiftColor(pal.hair, 22);
  ctx.fillRect(cx - headR * 0.12, headCy - headR + headR * 0.08, headR * 0.08, headR * 0.12);

  // === Red headband — with knot and flowing tails ===
  ctx.fillStyle = pal.headband;
  ctx.fillRect(cx - headR * 0.95, headCy - headR + headR * 0.06, headR * 1.9, headR * 0.2);
  // Headband highlight stripe
  ctx.fillStyle = shiftColor(pal.headband, 28);
  ctx.fillRect(cx - headR * 0.88, headCy - headR + headR * 0.06, headR * 1.76, headR * 0.05);
  // Headband shadow edge
  ctx.fillStyle = shiftColor(pal.headband, -25);
  ctx.fillRect(cx - headR * 0.92, headCy - headR + headR * 0.2, headR * 1.84, headR * 0.04);
  // Headband knot
  const selKnotX = cx - headR * 0.72;
  const selKnotY = headCy - headR + headR * 0.15;
  ctx.fillStyle = shiftColor(pal.headband, -12);
  ctx.fillRect(selKnotX - headR * 0.06, selKnotY - headR * 0.06, headR * 0.12, headR * 0.12);
  // Headband tails — flowing ribbons
  ctx.fillStyle = shiftColor(pal.headband, -20);
  ctx.beginPath();
  ctx.moveTo(selKnotX - headR * 0.04, selKnotY + headR * 0.04);
  ctx.quadraticCurveTo(selKnotX - headR * 0.3, selKnotY + headR * 0.18, selKnotX - headR * 0.4, selKnotY + headR * 0.52);
  ctx.lineTo(selKnotX - headR * 0.32, selKnotY + headR * 0.55);
  ctx.quadraticCurveTo(selKnotX - headR * 0.22, selKnotY + headR * 0.14, selKnotX + headR * 0.02, selKnotY + headR * 0.04);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(selKnotX + headR * 0.02, selKnotY + headR * 0.04);
  ctx.quadraticCurveTo(selKnotX - headR * 0.18, selKnotY + headR * 0.25, selKnotX - headR * 0.22, selKnotY + headR * 0.65);
  ctx.lineTo(selKnotX - headR * 0.15, selKnotY + headR * 0.67);
  ctx.quadraticCurveTo(selKnotX - headR * 0.1, selKnotY + headR * 0.22, selKnotX + headR * 0.06, selKnotY + headR * 0.04);
  ctx.closePath();
  ctx.fill();

  // === Eyes — 3/4 view with upper eyelid and depth ===
  const eyeSpacing = headR * 0.28;
  const eyeY = headCy - headR * 0.02;
  const eyeR = headR * 0.13;
  for (const side of [-1, 1]) {
    // Closer eye slightly larger for 3/4 perspective
    const adjustedR = side === 1 ? eyeR * 1.08 : eyeR * 0.94;
    const ex = cx + side * eyeSpacing;
    // Eye socket shadow
    ctx.fillStyle = shiftColor(pal.skin, -16);
    ctx.beginPath();
    ctx.ellipse(ex, eyeY + 1, adjustedR * 1.2, adjustedR * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();
    // Sclera
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(ex, eyeY, adjustedR, adjustedR + 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    ctx.stroke();
    // Iris — deep blue
    ctx.fillStyle = '#4169E1';
    ctx.beginPath();
    ctx.arc(ex + 1, eyeY, adjustedR * 0.55, 0, Math.PI * 2);
    ctx.fill();
    // Iris ring
    ctx.strokeStyle = '#2a4a9a';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.arc(ex + 1, eyeY, adjustedR * 0.55, 0, Math.PI * 2);
    ctx.stroke();
    // Pupil
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(ex + 1.2, eyeY, adjustedR * 0.28, 0, Math.PI * 2);
    ctx.fill();
    // Eye shine — upper-left catchlight
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath();
    ctx.arc(ex + 0.3, eyeY - adjustedR * 0.25, adjustedR * 0.22, 0, Math.PI * 2);
    ctx.fill();
    // Lower eye shine
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.arc(ex + 1.5, eyeY + adjustedR * 0.2, adjustedR * 0.12, 0, Math.PI * 2);
    ctx.fill();
    // Upper eyelid line — thick for Ryo's characteristic narrow determined eyes
    ctx.strokeStyle = '#2a1a08';
    ctx.lineWidth = Math.max(1.5, headR * 0.06);
    ctx.beginPath();
    ctx.moveTo(ex - adjustedR * 1.3, eyeY - adjustedR * 0.35 - side * headR * 0.015);
    ctx.quadraticCurveTo(ex, eyeY - adjustedR * 1.15, ex + adjustedR * 1.3, eyeY - adjustedR * 0.35 + side * headR * 0.015);
    ctx.stroke();
  }

  // === Brows — heavy angled, Ryo's trademark glare ===
  ctx.strokeStyle = shiftColor(pal.hair, -35);
  ctx.lineWidth = Math.max(2.5, size * 0.018);
  ctx.lineCap = 'round';
  for (const side of [-1, 1]) {
    const browX = cx + side * eyeSpacing;
    ctx.beginPath();
    ctx.moveTo(browX - side * headR * 0.22, eyeY - headR * 0.18 - side * headR * 0.04);
    ctx.lineTo(browX + side * headR * 0.08, eyeY - headR * 0.24 + side * headR * 0.02);
    ctx.stroke();
  }

  // === Nose — bridge, tip, and nostril ===
  // Nose bridge shadow
  ctx.strokeStyle = shiftColor(pal.skin, -18);
  ctx.lineWidth = Math.max(0.8, size * 0.005);
  ctx.beginPath();
  ctx.moveTo(cx + headR * 0.02, headCy + headR * 0.0);
  ctx.lineTo(cx + headR * 0.06, headCy + headR * 0.2);
  ctx.stroke();
  // Nose tip highlight
  ctx.fillStyle = shiftColor(pal.skin, 10);
  ctx.beginPath();
  ctx.arc(cx + headR * 0.03, headCy + headR * 0.17, headR * 0.055, 0, Math.PI * 2);
  ctx.fill();
  // Nostril shadow
  ctx.fillStyle = shiftColor(pal.skin, -18);
  ctx.beginPath();
  ctx.ellipse(cx + headR * 0.1, headCy + headR * 0.22, headR * 0.04, headR * 0.028, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // === Mouth — lip outline with confident smirk ===
  const mouthY = headCy + headR * 0.42;
  // Upper lip line — cupid's bow shape
  ctx.strokeStyle = shiftColor(pal.skin, -30);
  ctx.lineWidth = Math.max(0.8, size * 0.006);
  ctx.beginPath();
  ctx.moveTo(cx - headR * 0.14, mouthY);
  ctx.quadraticCurveTo(cx - headR * 0.04, mouthY - headR * 0.04, cx, mouthY - headR * 0.02);
  ctx.quadraticCurveTo(cx + headR * 0.04, mouthY - headR * 0.04, cx + headR * 0.14, mouthY - headR * 0.02);
  ctx.stroke();
  // Lower lip shadow
  ctx.fillStyle = shiftColor(pal.skin, -8);
  ctx.beginPath();
  ctx.moveTo(cx - headR * 0.12, mouthY + headR * 0.01);
  ctx.quadraticCurveTo(cx, mouthY + headR * 0.06, cx + headR * 0.13, mouthY - headR * 0.01);
  ctx.quadraticCurveTo(cx, mouthY + headR * 0.03, cx - headR * 0.12, mouthY + headR * 0.01);
  ctx.closePath();
  ctx.fill();

  // === Jaw line — strong defined jaw ===
  ctx.strokeStyle = shiftColor(pal.skin, -28);
  ctx.lineWidth = Math.max(1, size * 0.007);
  ctx.beginPath();
  ctx.moveTo(cx - headR * 0.5, headCy + headR * 0.55);
  ctx.quadraticCurveTo(cx - headR * 0.3, headCy + headR * 0.85, cx, headCy + headR * 0.9);
  ctx.quadraticCurveTo(cx + headR * 0.3, headCy + headR * 0.85, cx + headR * 0.5, headCy + headR * 0.55);
  ctx.stroke();
  // Chin shadow
  ctx.fillStyle = shiftColor(pal.skin, -10);
  ctx.beginPath();
  ctx.ellipse(cx, headCy + headR * 0.78, headR * 0.18, headR * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();

  // Portrait frame
  ctx.strokeStyle = 'rgba(200, 168, 50, 0.6)';
  ctx.lineWidth = 2;
  roundRect(ctx, 0, 0, size, size, 6);
  ctx.stroke();
  // Inner gold border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  roundRect(ctx, 1, 1, size - 2, size - 2, 5);
  ctx.stroke();

  ctx.restore();
}

/** Draw a small shoe/boot shape at the bottom of a leg */
