/**
 * Skeletal fighter rendering — enhanced 6-bone pose system
 * Larger proportions, outlines, shadows, character-specific details
 */
import { Fighter } from '../entities/fighter.js';
import { FighterState } from '../core/types.js';
import { FIGHTER_WIDTH } from '../core/constants.js';
import { ROSTER } from '../characters/index.js';
import { bone, pose } from '../characters/types.js';
import type { Pose, BonePose } from '../characters/types.js';
import { shiftColor, roundRect } from './utils.js';

// Character-specific outfit color overrides (secondary colors)
const CHAR_OUTFIT: Record<string, { shirt: string; pants: string; belt: string; shoes: string }> = {
  kyo: { shirt: '#cc4400', pants: '#2a2a55', belt: '#884422', shoes: '#442211' },
  iori: { shirt: '#e8e0d0', pants: '#2a1a3a', belt: '#882244', shoes: '#1a0a2a' },
  terry: { shirt: '#cc3333', pants: '#334488', belt: '#aa8833', shoes: '#443322' },
  kim: { shirt: '#f0f0f0', pants: '#2244aa', belt: '#cc3333', shoes: '#2244aa' },
  ryo: { shirt: '#cc8833', pants: '#cc8833', belt: '#333', shoes: '#443322' },
  leona: { shirt: '#335588', pants: '#335588', belt: '#888', shoes: '#223344' },
  kdash: { shirt: '#333344', pants: '#2a2a3a', belt: '#666', shoes: '#222233' },
  kula: { shirt: '#4488cc', pants: '#336699', belt: '#88ccff', shoes: '#335588' },
};

const DEFAULT_OUTFIT = { shirt: '#888', pants: '#556', belt: '#444', shoes: '#333' };

function getOutfit(charId: string) {
  return CHAR_OUTFIT[charId] ?? DEFAULT_OUTFIT;
}

/** Draw character-specific head with detailed features */
function drawCharacterHead(
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

function getHairColor(charId: string): string {
  const colors: Record<string, string> = {
    kyo: '#8B4513', iori: '#8B0000', terry: '#C6A355',
    kim: '#1a1a1a', ryo: '#8B6914', leona: '#DAA520',
    kdash: '#C0C0C0', kula: '#cc8855',
  };
  return colors[charId] ?? '#333';
}

function getEyeColor(charId: string): string {
  const colors: Record<string, string> = {
    kyo: '#6B4226', iori: '#8B0000', terry: '#4169E1',
    kim: '#1a1a1a', ryo: '#4169E1', leona: '#4169E1',
    kdash: '#ff4400', kula: '#4488ff',
  };
  return colors[charId] ?? '#444';
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
  }
}

/** Draw skeletal body using 6-bone pose system — enhanced rendering */
export function drawSkeletalFighter(
  ctx: CanvasRenderingContext2D,
  f: Fighter,
  sx: number,
  sy: number,
  bodyColor: string,
  outlineColor: string,
  globalTick: number,
  maxModeActive: boolean = false,
): void {
  const charDef = ROSTER.find(c => c.id === f.charId);
  const poseSet = charDef?.poses;
  const outfit = getOutfit(f.charId);

  // Resolve pose
  const rawPose = poseSet?.[f.state] ?? poseSet?.[FighterState.IDLE] ?? pose({
    armFront: bone(10, 20, 0.3),
    armBack: bone(-8, 15, -0.5),
  });

  let currentPose: Pose;
  if (Array.isArray(rawPose)) {
    const frames = rawPose as Pose[];
    if (f.attackPhase === 'active' || f.attackPhase === 'startup' || f.attackPhase === 'recovery') {
      const idx = Math.min(f.attackFrame, frames.length - 1);
      currentPose = frames[Math.max(0, idx)];
    } else {
      currentPose = frames[globalTick % frames.length];
    }
  } else {
    currentPose = rawPose as Pose;
  }

  // Clone pose for animation mutations
  const p = {
    head: { ...currentPose.head },
    body: { ...currentPose.body },
    armFront: { ...currentPose.armFront },
    armBack: { ...currentPose.armBack },
    legFront: { ...currentPose.legFront },
    legBack: { ...currentPose.legBack },
  };

  // Idle breathing
  if (f.state === FighterState.IDLE) {
    const breathe = Math.sin(globalTick / 30) * 2;
    p.body.oy += breathe;
    p.head.oy += breathe;
  }

  // Walk cycle
  if (f.state === FighterState.WALK) {
    const walkCycle = Math.sin(globalTick / 8) * 5;
    p.legFront.oy += walkCycle;
    p.legBack.oy -= walkCycle;
    p.armFront.oy -= walkCycle * 0.3;
    p.armBack.oy += walkCycle * 0.3;
  }

  // Run cycle — more exaggerated
  if (f.state === FighterState.RUN) {
    const runCycle = Math.sin(globalTick / 5) * 8;
    p.legFront.oy += runCycle;
    p.legBack.oy -= runCycle;
    p.armFront.rot -= 0.3;
    p.armBack.rot += 0.3;
  }

  // Height factor for crouch/roll
  const isCrouching = f.state === FighterState.CROUCH;
  const isRolling = f.state === FighterState.ROLL || f.state === FighterState.BACK_ROLL;
  const heightFactor = (isCrouching || isRolling) ? 0.6 : 1.0;

  // === Enhanced body dimensions (larger, KOF-proportional) ===
  const headW = 44, headH = 44;
  const torsoW = 56, torsoH = 68;
  const armW = 22, armH = 48;
  const legW = 26, legH = 60;

  // Reference point
  const refX = sx;
  const refY = sy - f.displayHeight;

  // Screen position helper
  const boneScreen = (bp: BonePose) => ({
    x: refX + bp.ox * f.facing,
    y: refY + bp.oy * heightFactor,
    rot: bp.rot * f.facing,
    scale: bp.scale,
  });

  // Colors
  const skinColor = '#e8b88a';
  const skinColorDark = shiftColor(skinColor, -20);

  // Draw a bone with gradient, outline, and optional detail stripe
  const drawBone = (
    cx: number, cy: number, w: number, h: number, rot: number,
    fillTop: string, fillBot: string, outline: string,
    detailStripe?: string,
  ) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    const grad = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
    grad.addColorStop(0, fillTop);
    grad.addColorStop(0.5, fillBot);
    grad.addColorStop(1, shiftColor(fillBot, -15));
    ctx.fillStyle = grad;
    roundRect(ctx, -w / 2, -h / 2, w, h, 5);
    ctx.fill();
    // Detail stripe (clothing seam line)
    if (detailStripe) {
      ctx.strokeStyle = detailStripe;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(0, -h / 2 + 3);
      ctx.lineTo(0, h / 2 - 3);
      ctx.stroke();
    }
    // Outline
    ctx.strokeStyle = outline;
    ctx.lineWidth = 2;
    roundRect(ctx, -w / 2, -h / 2, w, h, 5);
    ctx.stroke();
    ctx.restore();
  };

  // Draw shadow on ground
  const shadowY = sy + 2;
  const shadowW = 60;
  ctx.save();
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(sx, shadowY, shadowW, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Hit flash overlay — pure white for first 4 frames after hit
  const isFlashing = f.hitFlashFrames > 0;
  const flashOverride = isFlashing ? '#ffffff' : undefined;
  const flashOutline = isFlashing ? '#ddd' : undefined;

  // Effective colors (may be overridden by flash)
  const effBodyColor = flashOverride ?? outfit.shirt;
  const effLegColor = flashOverride ?? outfit.pants;
  const effSkinColor = flashOverride ?? skinColor;
  const effOutline = flashOutline ?? shiftColor(outfit.shirt, -50);

  const shoulderY = refY + 16 * heightFactor;
  const hipY = refY + 60 * heightFactor;

  // === Layer order: shadow → back → body → front ===

  // 1. Back arm (behind body)
  const backArm = boneScreen(p.armBack);
  drawBone(
    backArm.x, shoulderY + p.armBack.oy * heightFactor,
    armW * p.armBack.scale, armH * p.armBack.scale, backArm.rot,
    flashOverride ?? shiftColor(skinColor, 10), effSkinColor, flashOutline ?? skinColorDark,
  );

  // 2. Back leg (behind body)
  const backLeg = boneScreen(p.legBack);
  drawBone(
    backLeg.x, hipY + p.legBack.oy * heightFactor,
    legW * p.legBack.scale, legH * p.legBack.scale, backLeg.rot,
    flashOverride ?? shiftColor(outfit.pants, 10), effLegColor, flashOutline ?? shiftColor(outfit.pants, -30),
    flashOverride ? undefined : shiftColor(outfit.pants, -10),
  );
  // Shoe on back leg
  if (!isFlashing) {
    drawShoe(ctx, backLeg.x, hipY + p.legBack.oy * heightFactor + legH * p.legBack.scale * 0.4,
      legW * p.legBack.scale * 0.7, 8, backLeg.rot, outfit.shoes, f.facing);
  }

  // 3. Torso (body) — shirt color with collar detail
  const torsoCenterY = refY + 34 * heightFactor + p.body.oy * heightFactor;
  const torsoX = refX + p.body.ox * f.facing;
  drawBone(
    torsoX, torsoCenterY,
    torsoW, torsoH * heightFactor, p.body.rot * f.facing,
    flashOverride ?? shiftColor(outfit.shirt, 20), effBodyColor, effOutline,
    flashOverride ? undefined : shiftColor(outfit.shirt, -15),
  );

  // Collar/neckline detail on torso
  if (!isFlashing) {
    ctx.save();
    ctx.translate(torsoX, torsoCenterY);
    ctx.rotate(p.body.rot * f.facing);
    ctx.strokeStyle = shiftColor(outfit.shirt, -25);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-6, -torsoH * heightFactor / 2 + 3);
    ctx.lineTo(0, -torsoH * heightFactor / 2 + 7);
    ctx.lineTo(6, -torsoH * heightFactor / 2 + 3);
    ctx.stroke();
    // Belt line
    ctx.fillStyle = outfit.belt;
    ctx.fillRect(-torsoW / 2 + 2, torsoH * heightFactor / 2 - 5, torsoW - 4, 4);
    ctx.restore();
  }

  // 4. Head
  const headPos = boneScreen(p.head);
  const headCenterY = refY + 8 * heightFactor + p.head.oy * heightFactor;
  ctx.save();
  ctx.translate(headPos.x, headCenterY);
  ctx.rotate(p.head.rot * f.facing);
  if (isFlashing) {
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(0, 0, headW / 2, 0, Math.PI * 2); ctx.fill();
  } else {
    drawCharacterHead(ctx, f.charId, f.facing, skinColor, headW);
  }
  ctx.restore();

  // 5. Front leg (in front of body)
  const frontLeg = boneScreen(p.legFront);
  drawBone(
    frontLeg.x, hipY + p.legFront.oy * heightFactor,
    legW * p.legFront.scale, legH * p.legFront.scale, frontLeg.rot,
    flashOverride ?? shiftColor(outfit.pants, 15), effLegColor, flashOutline ?? shiftColor(outfit.pants, -25),
    flashOverride ? undefined : shiftColor(outfit.pants, -8),
  );
  // Shoe on front leg
  if (!isFlashing) {
    drawShoe(ctx, frontLeg.x, hipY + p.legFront.oy * heightFactor + legH * p.legFront.scale * 0.4,
      legW * p.legFront.scale * 0.7, 8, frontLeg.rot, outfit.shoes, f.facing);
  }

  // 6. Front arm (in front of body) — skin colored (bare hands)
  const frontArm = boneScreen(p.armFront);
  drawBone(
    frontArm.x, shoulderY + p.armFront.oy * heightFactor,
    armW * p.armFront.scale, armH * p.armFront.scale, frontArm.rot,
    flashOverride ?? shiftColor(skinColor, 15), effSkinColor, flashOutline ?? skinColorDark,
  );

  // Fist detail on front arm when attacking
  if (!isFlashing && (f.state === FighterState.STAND_ATTACK || f.state === FighterState.CROUCH_ATTACK || f.state === FighterState.AIR_ATTACK)) {
    ctx.save();
    ctx.translate(frontArm.x, shoulderY + p.armFront.oy * heightFactor);
    ctx.rotate(frontArm.rot);
    // Fist — slightly larger circle at end of arm
    ctx.fillStyle = skinColor;
    ctx.strokeStyle = skinColorDark;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, armH * p.armFront.scale / 2 - 2, armW * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // === MAX mode glow aura ===
  if (maxModeActive) {
    const glowPulse = 0.2 + Math.sin(globalTick / 4) * 0.1;
    const glowGrad = ctx.createRadialGradient(
      sx, sy - f.displayHeight / 2, 10,
      sx, sy - f.displayHeight / 2, f.displayHeight * 0.8,
    );
    glowGrad.addColorStop(0, `rgba(255, 255, 100, ${glowPulse})`);
    glowGrad.addColorStop(0.4, `rgba(255, 220, 50, ${glowPulse * 0.5})`);
    glowGrad.addColorStop(0.7, `rgba(255, 150, 0, ${glowPulse * 0.2})`);
    glowGrad.addColorStop(1, 'rgba(255, 200, 50, 0)');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(Math.round(sx - 60), Math.round(sy - f.displayHeight - 30), 120, f.displayHeight + 50);

    // MAX mode particle sparkles
    if (globalTick % 6 === 0) {
      const sparkleX = sx + (Math.random() - 0.5) * 50;
      const sparkleY = sy - Math.random() * f.displayHeight;
      ctx.save();
      ctx.fillStyle = `rgba(255, 255, 150, ${0.5 + Math.random() * 0.3})`;
      ctx.beginPath();
      ctx.arc(sparkleX, sparkleY, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}

/** Draw a small shoe/boot shape at the bottom of a leg */
function drawShoe(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, rot: number, color: string, facing: number): void {
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

/** Draw victory pose — fighter standing triumphant with arms raised */
export function drawVictoryPose(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  facing: number,
  bodyColor: string,
  outlineColor: string,
  tick: number,
  charId: string = 'kyo',
): void {
  const bounce = Math.sin(tick * 0.08) * 3;
  const victoryPose: Pose = {
    head: { ox: 0, oy: bounce, rot: 0, scale: 1 },
    body: { ox: 0, oy: bounce * 0.7, rot: 0, scale: 1 },
    armFront: { ox: 12, oy: -50 + bounce * 0.3, rot: -1.8, scale: 1.1 },
    armBack: { ox: -10, oy: -50 + bounce * 0.3, rot: 1.8, scale: 1.1 },
    legFront: { ox: 8, oy: 0, rot: 0.1, scale: 1 },
    legBack: { ox: -6, oy: 0, rot: -0.1, scale: 1 },
  };

  const p = {
    head: { ...victoryPose.head },
    body: { ...victoryPose.body },
    armFront: { ...victoryPose.armFront },
    armBack: { ...victoryPose.armBack },
    legFront: { ...victoryPose.legFront },
    legBack: { ...victoryPose.legBack },
  };

  const outfit = getOutfit(charId);
  const skinColor = '#e8b88a';
  const skinColorDark = shiftColor(skinColor, -20);

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

  const drawBone = (
    cx: number, cy: number, w: number, h: number, rot: number,
    fillTop: string, fillBot: string, outline: string,
  ) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    const grad = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
    grad.addColorStop(0, fillTop);
    grad.addColorStop(1, fillBot);
    ctx.fillStyle = grad;
    roundRect(ctx, -w / 2, -h / 2, w, h, 5);
    ctx.fill();
    ctx.strokeStyle = outline;
    ctx.lineWidth = 2;
    roundRect(ctx, -w / 2, -h / 2, w, h, 5);
    ctx.stroke();
    ctx.restore();
  };

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
  drawBone(backArm.x, shoulderY + p.armBack.oy, armW * p.armBack.scale, armH * p.armBack.scale, backArm.rot,
    shiftColor(skinColor, 10), skinColor, skinColorDark);

  // Back leg
  const backLeg = boneScreen(p.legBack);
  drawBone(backLeg.x, hipY + p.legBack.oy, legW * p.legBack.scale, legH * p.legBack.scale, backLeg.rot,
    shiftColor(outfit.pants, 10), outfit.pants, shiftColor(outfit.pants, -30));

  // Torso
  const torsoCenterY = refY + 20 + p.body.oy;
  drawBone(refX + p.body.ox * facing, torsoCenterY, torsoW, torsoH, p.body.rot * facing,
    shiftColor(outfit.shirt, 20), outfit.shirt, shiftColor(outfit.shirt, -50));

  // Head
  const headPos = boneScreen(p.head);
  ctx.save();
  ctx.translate(headPos.x, refY + 5 + p.head.oy);
  ctx.rotate(p.head.rot * facing);
  drawCharacterHead(ctx, charId, facing, skinColor, headW);
  ctx.restore();

  // Front leg
  const frontLeg = boneScreen(p.legFront);
  drawBone(frontLeg.x, hipY + p.legFront.oy, legW * p.legFront.scale, legH * p.legFront.scale, frontLeg.rot,
    shiftColor(outfit.pants, 15), outfit.pants, shiftColor(outfit.pants, -25));

  // Front arm
  const frontArm = boneScreen(p.armFront);
  drawBone(frontArm.x, shoulderY + p.armFront.oy, armW * p.armFront.scale, armH * p.armFront.scale, frontArm.rot,
    shiftColor(skinColor, 15), skinColor, skinColorDark);

  // Victory golden glow
  const glowPulse = 0.25 + Math.sin(tick / 6) * 0.1;
  const glowGrad = ctx.createRadialGradient(sx, sy - 50, 10, sx, sy - 50, 90);
  glowGrad.addColorStop(0, `rgba(255, 215, 0, ${glowPulse})`);
  glowGrad.addColorStop(0.5, `rgba(255, 180, 0, ${glowPulse * 0.4})`);
  glowGrad.addColorStop(1, 'rgba(255, 150, 0, 0)');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(Math.round(sx - 90), Math.round(sy - 140), 180, 140);
}
