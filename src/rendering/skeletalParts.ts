/**
 * Skeletal fighter character-specific visual parts
 * Outfit colors, head/face rendering, hair, shoes — detached from Fighter entity
 */
import { shiftColor, roundRect } from './utils.js';

// Character-specific outfit color overrides (secondary colors)
export const CHAR_OUTFIT: Record<string, { shirt: string; pants: string; belt: string; shoes: string }> = {
  kyo: { shirt: '#cc4400', pants: '#2a2a55', belt: '#884422', shoes: '#442211' },
  iori: { shirt: '#e8e0d0', pants: '#2a1a3a', belt: '#882244', shoes: '#1a0a2a' },
  terry: { shirt: '#cc3333', pants: '#334488', belt: '#aa8833', shoes: '#443322' },
  kim: { shirt: '#f0f0f0', pants: '#2244aa', belt: '#cc3333', shoes: '#2244aa' },
  ryo: { shirt: '#cc8833', pants: '#cc8833', belt: '#333', shoes: '#443322' },
  leona: { shirt: '#335588', pants: '#335588', belt: '#888', shoes: '#223344' },
  kdash: { shirt: '#333344', pants: '#2a2a3a', belt: '#666', shoes: '#222233' },
  kula: { shirt: '#4488cc', pants: '#336699', belt: '#88ccff', shoes: '#335588' },
  robert: { shirt: '#226633', pants: '#226633', belt: '#884422', shoes: '#443322' },
  athena: { shirt: '#cc2222', pants: '#cc2222', belt: '#fff', shoes: '#ff6688' },
  mai: { shirt: '#cc2244', pants: '#cc2244', belt: '#fff', shoes: '#cc2244' },
};

const DEFAULT_OUTFIT = { shirt: '#888', pants: '#556', belt: '#444', shoes: '#333' };

export function getOutfit(charId: string) {
  return CHAR_OUTFIT[charId] ?? DEFAULT_OUTFIT;
}

export function getHairColor(charId: string): string {
  const colors: Record<string, string> = {
    kyo: '#8B4513', iori: '#8B0000', terry: '#C6A355',
    kim: '#1a1a1a', ryo: '#8B6914', leona: '#DAA520',
    kdash: '#C0C0C0', kula: '#cc8855', robert: '#2a1a0a',
    athena: '#7744cc', mai: '#7a4828',
  };
  return colors[charId] ?? '#333';
}

export function getEyeColor(charId: string): string {
  const colors: Record<string, string> = {
    kyo: '#6B4226', iori: '#8B0000', terry: '#4169E1',
    kim: '#1a1a1a', ryo: '#4169E1', leona: '#4169E1',
    kdash: '#ff4400', kula: '#4488ff', robert: '#4169E1',
    athena: '#6644cc', mai: '#4488aa',
  };
  return colors[charId] ?? '#444';
}

/** Draw character-specific head with detailed features */
export function drawCharacterHead(
  ctx: CanvasRenderingContext2D, charId: string, facing: number, skinColor: string, headW: number,
): void {
  const r = headW / 2;

  // Head base — skin color with gradient
  const hg = ctx.createRadialGradient(-2, -2, 0, 0, 0, r);
  hg.addColorStop(0, shiftColor(skinColor, 25));
  hg.addColorStop(0.7, skinColor);
  hg.addColorStop(1, shiftColor(skinColor, -15));
  ctx.fillStyle = hg;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();

  // Head outline
  ctx.strokeStyle = shiftColor(skinColor, -40);
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();

  // Eyes — white sclera + colored iris + black pupil
  const eyeSpacing = 8;
  const eyeY = -2;
  const eyeR = 5.5;
  for (const side of [-1, 1]) {
    const ex = side * eyeSpacing;
    // Sclera
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(ex, eyeY, eyeR, eyeR + 0.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    ctx.stroke();
    // Iris
    ctx.fillStyle = getEyeColor(charId);
    ctx.beginPath(); ctx.arc(ex + facing * 1.5, eyeY, 3.2, 0, Math.PI * 2); ctx.fill();
    // Pupil
    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.arc(ex + facing * 2, eyeY, 1.6, 0, Math.PI * 2); ctx.fill();
    // Eye shine
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath(); ctx.arc(ex + facing * 0.8, eyeY - 1.5, 1.2, 0, Math.PI * 2); ctx.fill();
  }

  // Eyebrows
  ctx.strokeStyle = getHairColor(charId);
  ctx.lineWidth = 3;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(side * (eyeSpacing - 5), eyeY - 8);
    ctx.lineTo(side * (eyeSpacing + 5), eyeY - 8.5);
    ctx.stroke();
  }

  // Mouth — simple line, character-specific expression
  ctx.strokeStyle = shiftColor(skinColor, -30);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-5, r * 0.45);
  if (charId === 'iori') {
    ctx.lineTo(5, r * 0.5); // slight smirk
  } else {
    ctx.lineTo(5, r * 0.42); // neutral
  }
  ctx.stroke();

  // Nose hint
  ctx.fillStyle = shiftColor(skinColor, -10);
  ctx.beginPath();
  ctx.arc(facing * 1, r * 0.15, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // === Character-specific hair/accessories ===
  drawHair(ctx, charId, facing, r, headW);
}

function drawHair(ctx: CanvasRenderingContext2D, charId: string, facing: number, r: number, headW: number): void {
  if (charId === 'kyo') {
    // Kyo: brown spiky hair sticking up
    ctx.fillStyle = '#8B4513';
    const spikes = [[-12, -22], [-6, -28], [0, -25], [6, -28], [12, -22]];
    for (const [sx, sy] of spikes) {
      ctx.beginPath();
      ctx.moveTo(sx - 5, -r + 3);
      ctx.lineTo(sx, -r + sy);
      ctx.lineTo(sx + 5, -r + 3);
      ctx.closePath();
      ctx.fill();
    }
    // Hair band
    ctx.fillStyle = '#cc2200';
    ctx.fillRect(-r + 1, -r + 7, headW - 2, 5);
  } else if (charId === 'iori') {
    // Iori: long crimson hair flowing down
    ctx.fillStyle = '#8B0000';
    // Top volume
    ctx.beginPath();
    ctx.moveTo(-r - 2, -r + 3);
    ctx.quadraticCurveTo(-r + 2, -r - 8, 0, -r - 6);
    ctx.quadraticCurveTo(r - 2, -r - 8, r + 2, -r + 3);
    ctx.lineTo(r, -r + 6);
    ctx.lineTo(-r, -r + 6);
    ctx.closePath();
    ctx.fill();
    // Flowing side hair
    const sideX = r * facing * 0.6;
    ctx.fillStyle = '#8B0000';
    ctx.beginPath();
    ctx.moveTo(sideX * 0.5, -r);
    ctx.quadraticCurveTo(sideX + 4 * facing, -r + 4, sideX + 8 * facing, r + 10);
    ctx.lineTo(sideX + 4 * facing, r + 8);
    ctx.quadraticCurveTo(sideX - 2 * facing, -r + 8, sideX * 0.3, -r + 3);
    ctx.closePath();
    ctx.fill();
    // Dark overlay on face
    ctx.fillStyle = 'rgba(80,0,0,0.1)';
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  } else if (charId === 'terry') {
    // Terry: blonde hair + red cap
    ctx.fillStyle = '#C6A355';
    ctx.beginPath();
    ctx.moveTo(-r + 2, -r + 3);
    ctx.quadraticCurveTo(0, -r - 5, r - 2, -r + 3);
    ctx.lineTo(r - 4, -r + 6);
    ctx.lineTo(-r + 4, -r + 6);
    ctx.closePath();
    ctx.fill();
    // Red cap
    const cw = headW + 10, ch = 8;
    ctx.fillStyle = '#cc2222';
    ctx.beginPath();
    ctx.moveTo(-cw / 2, -r + 1);
    ctx.lineTo(-cw / 2 + 3, -r - ch);
    ctx.lineTo(cw / 2 - 3, -r - ch);
    ctx.lineTo(cw / 2, -r + 1);
    ctx.closePath();
    ctx.fill();
    // Cap brim
    ctx.fillStyle = '#aa1111';
    ctx.fillRect(-cw / 2, -r - 1, cw, 3);
    // Cap star emblem
    ctx.fillStyle = '#e8c840';
    ctx.beginPath();
    ctx.arc(-r + 6, -r - ch + 4, 2.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (charId === 'kim') {
    // Kim: short dark hair + blue headband
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.moveTo(-r + 2, -r + 3);
    ctx.quadraticCurveTo(0, -r - 6, r - 2, -r + 3);
    ctx.lineTo(r - 3, -r + 7);
    ctx.lineTo(-r + 3, -r + 7);
    ctx.closePath();
    ctx.fill();
    // Headband
    ctx.fillStyle = '#2244aa';
    ctx.beginPath();
    ctx.moveTo(-r + 1, -r + 2);
    ctx.lineTo(-r, -r - 3);
    ctx.quadraticCurveTo(0, -r - 5, r, -r - 3);
    ctx.lineTo(r - 1, -r + 2);
    ctx.closePath();
    ctx.fill();
    // Headband tails
    ctx.strokeStyle = '#1a3388';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-r, -r + 1); ctx.lineTo(-r - 6, -r + 5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(r, -r + 1); ctx.lineTo(r + 6, -r + 5); ctx.stroke();
  } else if (charId === 'ryo') {
    // Ryo: short spiky brown hair
    ctx.fillStyle = '#8B6914';
    for (let i = -1; i <= 1; i++) {
      const sx = i * 5;
      ctx.beginPath();
      ctx.moveTo(sx - 3, -r + 2);
      ctx.lineTo(sx, -r - 8);
      ctx.lineTo(sx + 3, -r + 2);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = '#6B4B14';
    ctx.fillRect(-r + 1, -r + 5, headW - 2, 2);
  } else if (charId === 'leona') {
    // Leona: short blonde hair
    ctx.fillStyle = '#DAA520';
    ctx.beginPath();
    ctx.moveTo(-r + 1, -r + 2);
    ctx.lineTo(-r - 1, -r - 7);
    ctx.quadraticCurveTo(0, -r - 9, r + 1, -r - 7);
    ctx.lineTo(r - 1, -r + 2);
    ctx.closePath();
    ctx.fill();
    // Side bangs
    ctx.fillStyle = '#B8860B';
    ctx.beginPath();
    ctx.moveTo(-r, -r + 4);
    ctx.lineTo(-r - 3, -r + 14);
    ctx.lineTo(-r + 2, -r + 10);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(r, -r + 4);
    ctx.lineTo(r + 3, -r + 14);
    ctx.lineTo(r - 2, -r + 10);
    ctx.closePath();
    ctx.fill();
  } else if (charId === 'kdash') {
    // K': silver spiky hair
    ctx.fillStyle = '#C0C0C0';
    const spikes = [[-7, -16], [-2, -20], [3, -18], [8, -14]];
    for (const [sx, sy] of spikes) {
      ctx.beginPath();
      ctx.moveTo(sx - 3, -r + 2);
      ctx.lineTo(sx, -r + sy);
      ctx.lineTo(sx + 3, -r + 2);
      ctx.closePath();
      ctx.fill();
    }
    // Dark tips
    ctx.fillStyle = '#888';
    for (const [sx, sy] of spikes) {
      ctx.beginPath();
      ctx.moveTo(sx - 1, -r + sy);
      ctx.lineTo(sx, -r + sy + 4);
      ctx.lineTo(sx + 1, -r + sy);
      ctx.closePath();
      ctx.fill();
    }
    // Sunglasses hint
    ctx.fillStyle = '#222';
    ctx.fillRect(-8, -3, 16, 4);
    ctx.fillStyle = '#ff4400';
    ctx.fillRect(-6, -2, 4, 2);
    ctx.fillRect(2, -2, 4, 2);
  } else if (charId === 'kula') {
    // Kula: strawberry blonde wavy hair
    ctx.fillStyle = '#cc8855';
    ctx.beginPath();
    ctx.moveTo(-r - 1, -r + 3);
    ctx.quadraticCurveTo(-r + 2, -r - 10, 0, -r - 8);
    ctx.quadraticCurveTo(r - 2, -r - 10, r + 1, -r + 3);
    ctx.lineTo(r - 1, -r + 6);
    ctx.lineTo(-r + 1, -r + 6);
    ctx.closePath();
    ctx.fill();
    // Side waves
    ctx.fillStyle = '#bb7744';
    ctx.beginPath();
    ctx.moveTo(-r, -r + 3);
    ctx.quadraticCurveTo(-r - 4, -r + 10, -r - 2, -r + 18);
    ctx.lineTo(-r + 2, -r + 12);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(r, -r + 3);
    ctx.quadraticCurveTo(r + 4, -r + 10, r + 2, -r + 18);
    ctx.lineTo(r - 2, -r + 12);
    ctx.closePath();
    ctx.fill();
    // Ice blue hair highlight
    ctx.fillStyle = 'rgba(100, 180, 255, 0.2)';
    ctx.beginPath();
    ctx.moveTo(-3, -r + 1);
    ctx.quadraticCurveTo(0, -r - 6, 3, -r + 1);
    ctx.lineTo(2, -r + 4);
    ctx.lineTo(-2, -r + 4);
    ctx.closePath();
    ctx.fill();
  } else if (charId === 'robert') {
    // Robert: slicked-back dark hair
    ctx.fillStyle = '#2a1a0a';
    ctx.beginPath();
    ctx.moveTo(-r + 2, -r + 3);
    ctx.quadraticCurveTo(-r + 4, -r - 8, 0, -r - 6);
    ctx.quadraticCurveTo(r - 4, -r - 8, r + 2, -r + 3);
    ctx.lineTo(r, -r + 6);
    ctx.lineTo(-r, -r + 6);
    ctx.closePath();
    ctx.fill();
    // Slicked-back volume
    ctx.fillStyle = '#1a0a00';
    ctx.beginPath();
    ctx.moveTo(-r + 4, -r + 1);
    ctx.quadraticCurveTo(0, -r - 4, r - 4, -r + 1);
    ctx.lineTo(r - 5, -r + 4);
    ctx.lineTo(-r + 5, -r + 4);
    ctx.closePath();
    ctx.fill();
    // Sideburns
    ctx.fillStyle = '#2a1a0a';
    ctx.beginPath();
    ctx.moveTo(-r, -r + 4);
    ctx.lineTo(-r - 2, -r + 10);
    ctx.lineTo(-r + 2, -r + 8);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(r, -r + 4);
    ctx.lineTo(r + 2, -r + 10);
    ctx.lineTo(r - 2, -r + 8);
    ctx.closePath();
    ctx.fill();
  } else if (charId === 'athena') {
    // Athena: long purple hair with ponytail
    ctx.fillStyle = '#7744cc';
    // Top volume — full rounded bangs
    ctx.beginPath();
    ctx.moveTo(-r - 2, -r + 3);
    ctx.quadraticCurveTo(-r + 2, -r - 10, 0, -r - 8);
    ctx.quadraticCurveTo(r - 2, -r - 10, r + 2, -r + 3);
    ctx.lineTo(r, -r + 6);
    ctx.lineTo(-r, -r + 6);
    ctx.closePath();
    ctx.fill();
    // Side bangs — flowing down on both sides
    ctx.fillStyle = '#6633bb';
    ctx.beginPath();
    ctx.moveTo(-r, -r + 4);
    ctx.quadraticCurveTo(-r - 5, -r + 12, -r - 3, -r + 22);
    ctx.lineTo(-r + 2, -r + 14);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(r, -r + 4);
    ctx.quadraticCurveTo(r + 5, -r + 12, r + 3, -r + 22);
    ctx.lineTo(r - 2, -r + 14);
    ctx.closePath();
    ctx.fill();
    // Ponytail flowing to the back
    ctx.fillStyle = '#7744cc';
    const ptX = -r * facing * 0.5;
    ctx.beginPath();
    ctx.moveTo(ptX, -r + 2);
    ctx.quadraticCurveTo(ptX - 6 * facing, -r + 8, ptX - 10 * facing, -r + 20);
    ctx.quadraticCurveTo(ptX - 8 * facing, -r + 12, ptX, -r + 5);
    ctx.closePath();
    ctx.fill();
    // Hair ribbon (star-shaped accessory)
    ctx.fillStyle = '#ffcc00';
    ctx.beginPath();
    ctx.arc(ptX - 2 * facing, -r + 5, 2.5, 0, Math.PI * 2);
    ctx.fill();
    // Light purple highlight
    ctx.fillStyle = 'rgba(170, 120, 255, 0.2)';
    ctx.beginPath();
    ctx.moveTo(-3, -r + 1);
    ctx.quadraticCurveTo(0, -r - 6, 3, -r + 1);
    ctx.lineTo(2, -r + 4);
    ctx.lineTo(-2, -r + 4);
    ctx.closePath();
    ctx.fill();
  } else if (charId === 'mai') {
    // Mai: long brown hair with ponytail and hair band
    ctx.fillStyle = '#7a4828';
    // Top volume — full flowing hair
    ctx.beginPath();
    ctx.moveTo(-r - 2, -r + 3);
    ctx.quadraticCurveTo(-r + 2, -r - 10, 0, -r - 8);
    ctx.quadraticCurveTo(r - 2, -r - 10, r + 2, -r + 3);
    ctx.lineTo(r, -r + 6);
    ctx.lineTo(-r, -r + 6);
    ctx.closePath();
    ctx.fill();
    // Side bangs — flowing down
    ctx.fillStyle = '#5a3018';
    ctx.beginPath();
    ctx.moveTo(-r, -r + 4);
    ctx.quadraticCurveTo(-r - 4, -r + 12, -r - 2, -r + 22);
    ctx.lineTo(-r + 2, -r + 14);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(r, -r + 4);
    ctx.quadraticCurveTo(r + 4, -r + 12, r + 2, -r + 22);
    ctx.lineTo(r - 2, -r + 14);
    ctx.closePath();
    ctx.fill();
    // Long ponytail flowing to the back
    ctx.fillStyle = '#7a4828';
    const ptX = -r * facing * 0.5;
    ctx.beginPath();
    ctx.moveTo(ptX, -r + 2);
    ctx.quadraticCurveTo(ptX - 8 * facing, -r + 10, ptX - 14 * facing, -r + 28);
    ctx.quadraticCurveTo(ptX - 10 * facing, -r + 14, ptX, -r + 5);
    ctx.closePath();
    ctx.fill();
    // Hair band
    ctx.fillStyle = '#ff4488';
    ctx.fillRect(-r + 1, -r + 5, headW - 2, 3);
    // Brown highlight
    ctx.fillStyle = 'rgba(160, 100, 50, 0.2)';
    ctx.beginPath();
    ctx.moveTo(-3, -r + 1);
    ctx.quadraticCurveTo(0, -r - 6, 3, -r + 1);
    ctx.lineTo(2, -r + 4);
    ctx.lineTo(-2, -r + 4);
    ctx.closePath();
    ctx.fill();
  }
}

/** Draw a small shoe/boot shape at the bottom of a leg */
export function drawShoe(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, rot: number, color: string, facing: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  const grad = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
  grad.addColorStop(0, shiftColor(color, 15));
  grad.addColorStop(1, shiftColor(color, -10));
  ctx.fillStyle = grad;
  roundRect(ctx, -w / 2 + facing * 2, -h / 2, w, h, 3);
  ctx.fill();
  ctx.strokeStyle = shiftColor(color, -30);
  ctx.lineWidth = 1;
  roundRect(ctx, -w / 2 + facing * 2, -h / 2, w, h, 3);
  ctx.stroke();
  ctx.restore();
}
