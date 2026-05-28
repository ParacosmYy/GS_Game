/**
 * Victory pose rendering + attack accent glow
 * Extracted from skeletalFighter.ts
 */
import { shiftColor } from './utils.js';
import { drawCharacterHead } from './skeletalParts.js';
import { drawPixelTorso, drawPixelArm, drawPixelLeg, setBodyPartTick } from './bodyPartRenderer.js';
import { getVictoryPose, drawVictoryVFX } from './victoryPose.js';
import type { BonePose } from '../characters/types.js';

export interface AttackAccentGlow {
  shadow: string;
  blur: number;
  r: number;
  g: number;
  b: number;
  intensity: number;
  radius: number;
}

/** Per-character attack accent color configuration */
export function getAttackAccentGlow(charId: string): AttackAccentGlow | null {
  switch (charId) {
    case 'kyo':      return { shadow: '#ff4400', blur: 12, r: 255, g: 120, b: 0,   intensity: 1.0, radius: 3 };
    case 'iori':     return { shadow: '#8800cc', blur: 10, r: 136, g: 0,   b: 204, intensity: 1.0, radius: 2 };
    case 'terry':    return { shadow: '#ffcc00', blur: 8,  r: 255, g: 200, b: 0,   intensity: 0.7, radius: 2 };
    case 'kim':      return { shadow: '#4488ff', blur: 8,  r: 100, g: 150, b: 255, intensity: 0.6, radius: 2 };
    case 'ryo':      return { shadow: '#ff8800', blur: 10, r: 255, g: 160, b: 0,   intensity: 1.0, radius: 3 };
    case 'leona':    return { shadow: '#44ff88', blur: 6,  r: 80,  g: 255, b: 120, intensity: 0.5, radius: 1 };
    case 'kdash':    return { shadow: '#ff4400', blur: 8,  r: 255, g: 80,  b: 0,   intensity: 0.8, radius: 2 };
    case 'kula':     return { shadow: '#44ccff', blur: 8,  r: 100, g: 200, b: 255, intensity: 0.6, radius: 2 };
    case 'robert':   return { shadow: '#22dd66', blur: 8,  r: 68,  g: 255, b: 136, intensity: 0.7, radius: 2 };
    case 'mai':      return { shadow: '#ff4488', blur: 9,  r: 255, g: 100, b: 136, intensity: 0.8, radius: 2 };
    case 'clark':    return { shadow: '#88aa44', blur: 10, r: 136, g: 170, b: 68,  intensity: 0.8, radius: 3 };
    case 'ralf':     return { shadow: '#ff8844', blur: 12, r: 255, g: 136, b: 68,  intensity: 0.9, radius: 3 };
    case 'joe':      return { shadow: '#ff8800', blur: 10, r: 255, g: 170, b: 0,   intensity: 0.85, radius: 3 };
    case 'andy':     return { shadow: '#ffaa22', blur: 8,  r: 255, g: 180, b: 50,  intensity: 0.7, radius: 2 };
    case 'billy':    return { shadow: '#4488cc', blur: 8,  r: 80,  g: 150, b: 220, intensity: 0.7, radius: 2 };
    case 'chang':    return { shadow: '#cc8833', blur: 12, r: 200, g: 140, b: 50,  intensity: 0.9, radius: 4 };
    case 'yashiro':  return { shadow: '#9966cc', blur: 10, r: 150, g: 100, b: 200, intensity: 0.8, radius: 3 };
    case 'athena':   return { shadow: '#ff66aa', blur: 8,  r: 255, g: 100, b: 170, intensity: 0.7, radius: 2 };
    case 'mature':   return { shadow: '#cc0044', blur: 8,  r: 200, g: 0,   b: 68,  intensity: 0.7, radius: 2 };
    case 'chris':    return { shadow: '#ff8844', blur: 8,  r: 255, g: 140, b: 68,  intensity: 0.7, radius: 2 };
    case 'shermie':  return { shadow: '#cc44aa', blur: 8,  r: 200, g: 68,  b: 170, intensity: 0.7, radius: 2 };
    case 'vice':     return { shadow: '#6644cc', blur: 8,  r: 100, g: 68,  b: 200, intensity: 0.8, radius: 2 };
    case 'yamazaki': return { shadow: '#44aa00', blur: 9,  r: 68,  g: 170, b: 0,   intensity: 0.8, radius: 2 };
    case 'mary':     return { shadow: '#4488ff', blur: 8,  r: 80,  g: 140, b: 255, intensity: 0.7, radius: 2 };
    case 'kasumi':   return { shadow: '#ff6688', blur: 7,  r: 255, g: 100, b: 136, intensity: 0.6, radius: 2 };
    case 'xiangfei': return { shadow: '#ff8866', blur: 8,  r: 255, g: 140, b: 100, intensity: 0.7, radius: 2 };
    case 'choi':     return { shadow: '#aacc00', blur: 7,  r: 170, g: 200, b: 0,   intensity: 0.6, radius: 1 };
    default:         return null;
  }
}

/** 角色专属拳头光效 — 通常攻击时可见 */
export function drawFistGlow(
  ctx: CanvasRenderingContext2D, charId: string,
  fistR: number, fistY: number, tick: number,
): void {
  const skinColor = '#e8b88a';
  const skinDark = shiftColor(skinColor, -20);
  ctx.fillStyle = skinColor;
  ctx.strokeStyle = skinDark;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, fistY, fistR, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  const flicker = 0.3 + Math.sin(tick * 0.2) * 0.15;
  const glow = getAttackAccentGlow(charId);
  if (glow) {
    ctx.shadowColor = glow.shadow;
    ctx.shadowBlur = glow.blur;
    ctx.fillStyle = `rgba(${glow.r}, ${glow.g}, ${glow.b}, ${flicker * glow.intensity})`;
    ctx.beginPath(); ctx.arc(0, fistY, fistR + glow.radius, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
  }
}

/** Draw victory pose — character-specific win pose */
export function drawVictoryPose(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  facing: number,
  bodyColor: string,
  outlineColor: string,
  tick: number,
  charId: string = 'kyo',
  colorIndex?: number,
): void {
  const victoryPose = getVictoryPose(charId, tick);
  setBodyPartTick(tick);
  const p = {
    head: { ...victoryPose.head },
    body: { ...victoryPose.body },
    armFront: { ...victoryPose.armFront },
    armBack: { ...victoryPose.armBack },
    legFront: { ...victoryPose.legFront },
    legBack: { ...victoryPose.legBack },
  };

  const skinColor = '#e8b88a';
  const headW = 24;
  const torsoW = 32, torsoH = 38;
  const armW = 14, armH = 26;
  const legW = 16, legH = 34;

  const refX = sx;
  const refY = sy - 100;

  const boneScreen = (bp: BonePose) => ({
    x: refX + bp.ox * facing,
    y: refY + bp.oy,
    rot: bp.rot * facing,
    scale: bp.scale,
  });

  const shoulderY = refY + 10;
  const hipY = refY + 36;

  // Shadow
  ctx.save();
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.ellipse(sx, sy + 2, 40, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // Back arm
  const backArm = boneScreen(p.armBack);
  ctx.save();
  ctx.translate(backArm.x, shoulderY + p.armBack.oy);
  ctx.rotate(backArm.rot);
  drawPixelArm(ctx, charId, armW * p.armBack.scale, armH * p.armBack.scale, true, colorIndex);
  ctx.restore();

  // Back leg
  const backLeg = boneScreen(p.legBack);
  ctx.save();
  ctx.translate(backLeg.x, hipY + p.legBack.oy);
  ctx.rotate(backLeg.rot);
  drawPixelLeg(ctx, charId, legW * p.legBack.scale, legH * p.legBack.scale, true, colorIndex);
  ctx.restore();

  // Torso
  const torsoCenterY = refY + 20 + p.body.oy;
  ctx.save();
  ctx.translate(refX + p.body.ox * facing, torsoCenterY);
  ctx.rotate(p.body.rot * facing);
  drawPixelTorso(ctx, charId, torsoW, torsoH, colorIndex);
  ctx.restore();

  // Head
  const headPos = boneScreen(p.head);
  ctx.save();
  ctx.translate(headPos.x, refY + 5 + p.head.oy);
  ctx.rotate(headPos.rot * facing);
  drawCharacterHead(ctx, charId, facing, skinColor, headW, colorIndex, tick);
  ctx.restore();

  // Front leg
  const frontLeg = boneScreen(p.legFront);
  ctx.save();
  ctx.translate(frontLeg.x, hipY + p.legFront.oy);
  ctx.rotate(frontLeg.rot);
  drawPixelLeg(ctx, charId, legW * p.legFront.scale, legH * p.legFront.scale, false, colorIndex);
  ctx.restore();

  // Front arm
  const frontArm = boneScreen(p.armFront);
  ctx.save();
  ctx.translate(frontArm.x, shoulderY + p.armFront.oy);
  ctx.rotate(frontArm.rot);
  drawPixelArm(ctx, charId, armW * p.armFront.scale, armH * p.armFront.scale, false, colorIndex);
  ctx.restore();

  // Character-specific victory VFX
  drawVictoryVFX(ctx, sx, sy, tick, charId, facing);

  // Victory golden glow with radiating rings
  const glowPulse = 0.25 + Math.sin(tick / 6) * 0.1;
  const glowGrad = ctx.createRadialGradient(sx, sy - 50, 10, sx, sy - 50, 110);
  glowGrad.addColorStop(0, `rgba(255, 215, 0, ${glowPulse})`);
  glowGrad.addColorStop(0.3, `rgba(255, 200, 0, ${glowPulse * 0.6})`);
  glowGrad.addColorStop(0.6, `rgba(255, 180, 0, ${glowPulse * 0.3})`);
  glowGrad.addColorStop(1, 'rgba(255, 150, 0, 0)');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(Math.round(sx - 110), Math.round(sy - 160), 220, 170);
  const ringPulse = (tick % 60) / 60;
  const ringR = 30 + ringPulse * 80;
  ctx.strokeStyle = `rgba(255, 215, 0, ${(1 - ringPulse) * 0.2})`;
  ctx.lineWidth = 2 * (1 - ringPulse);
  ctx.beginPath();
  ctx.arc(sx, sy - 50, ringR, 0, Math.PI * 2);
  ctx.stroke();
}
