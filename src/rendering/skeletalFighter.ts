/**
 * Skeletal fighter rendering — 6-bone pose system, idle breathing, walk cycle
 */
import { Fighter } from '../entities/fighter.js';
import { FighterState } from '../core/types.js';
import { FIGHTER_WIDTH } from '../core/constants.js';
import { ROSTER } from '../characters/index.js';
import { bone, pose } from '../characters/types.js';
import type { Pose, BonePose } from '../characters/types.js';
import { shiftColor, roundRect } from './utils.js';

/** Draw skeletal body using 6-bone pose system */
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

  // Get pose for current state, fallback to IDLE default
  let currentPose = poseSet?.[f.state] ?? poseSet?.[FighterState.IDLE] ?? pose({
    armFront: bone(10, 20, 0.3),
    armBack: bone(-8, 15, -0.5),
  });

  // Clone pose so we can mutate for animations
  const p = {
    head: { ...currentPose.head },
    body: { ...currentPose.body },
    armFront: { ...currentPose.armFront },
    armBack: { ...currentPose.armBack },
    legFront: { ...currentPose.legFront },
    legBack: { ...currentPose.legBack },
  };

  // Idle breathing: subtle sinusoidal Y oscillation on body
  if (f.state === FighterState.IDLE) {
    const breathe = Math.sin(globalTick / 30) * 2;
    p.body.oy += breathe;
    p.head.oy += breathe;
  }

  // Walk cycle: alternating leg motion
  if (f.state === FighterState.WALK) {
    const walkCycle = Math.sin(globalTick / 8) * 5;
    p.legFront.oy += walkCycle;
    p.legBack.oy -= walkCycle;
  }

  // Crouch/roll height factor — squash all Y offsets
  const isCrouching = f.state === FighterState.CROUCH;
  const isRolling = f.state === FighterState.ROLL || f.state === FighterState.BACK_ROLL;
  const heightFactor = (isCrouching || isRolling) ? 0.6 : 1.0;

  // Body dimensions
  const headW = 16, headH = 16;
  const torsoW = 24, torsoH = 30;
  const armW = 6, armH = 22;
  const legW = 8, legH = 28;

  // Reference point: top-center of the full body bounding box
  const refX = sx;
  const refY = sy - f.displayHeight;

  // Helper: compute screen position of a bone's anchor
  const boneScreen = (bp: BonePose) => ({
    x: refX + bp.ox * f.facing,
    y: refY + bp.oy * heightFactor,
    rot: bp.rot * f.facing,
    scale: bp.scale,
  });

  // Colors
  const armColor = shiftColor(bodyColor, 15);
  const legColor = shiftColor(bodyColor, -15);
  const headColor = shiftColor(bodyColor, 25);

  // Draw a single bone as a rounded rectangle with gradient + outline
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
    roundRect(ctx, -w / 2, -h / 2, w, h, 3);
    ctx.fill();
    ctx.strokeStyle = outline;
    ctx.lineWidth = 1.5;
    roundRect(ctx, -w / 2, -h / 2, w, h, 3);
    ctx.stroke();
    ctx.restore();
  };

  // === Layer order: back → body → front ===

  // 1. Back arm (behind body)
  const backArm = boneScreen(p.armBack);
  const shoulderY = refY + 8 * heightFactor; // top of torso area
  drawBone(
    backArm.x, shoulderY + p.armBack.oy * heightFactor,
    armW * p.armBack.scale, armH * p.armBack.scale, backArm.rot,
    shiftColor(armColor, 10), armColor, outlineColor,
  );

  // 2. Back leg (behind body)
  const backLeg = boneScreen(p.legBack);
  const hipY = refY + 32 * heightFactor; // bottom of torso
  drawBone(
    backLeg.x, hipY + p.legBack.oy * heightFactor,
    legW * p.legBack.scale, legH * p.legBack.scale, backLeg.rot,
    shiftColor(legColor, 10), legColor, outlineColor,
  );

  // 3. Torso (body)
  const torsoCenterY = refY + 18 * heightFactor + p.body.oy * heightFactor;
  const torsoX = refX + p.body.ox * f.facing;
  drawBone(
    torsoX, torsoCenterY,
    torsoW, torsoH * heightFactor, p.body.rot * f.facing,
    shiftColor(bodyColor, 25), shiftColor(bodyColor, -10), outlineColor,
  );

  // 4. Head
  const headPos = boneScreen(p.head);
  const headCenterY = refY + 4 * heightFactor + p.head.oy * heightFactor;
  ctx.save();
  ctx.translate(headPos.x, headCenterY);
  ctx.rotate(p.head.rot * f.facing);
  // Head gradient
  const hGrad = ctx.createLinearGradient(-headW / 2, -headH / 2, headW / 2, headH / 2);
  hGrad.addColorStop(0, shiftColor(headColor, 20));
  hGrad.addColorStop(1, headColor);
  ctx.fillStyle = hGrad;
  ctx.beginPath();
  ctx.arc(0, 0, headW / 2, 0, Math.PI * 2);
  ctx.fill();
  // Head outline
  ctx.strokeStyle = outlineColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Eyes
  const eyeShift = 3 * f.facing;
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(eyeShift, -1, 3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(eyeShift - 7 * f.facing, -1, 3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.arc(eyeShift + 1.2 * f.facing, -1, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(eyeShift - 7 * f.facing + 1.2 * f.facing, -1, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // 5. Front leg (in front of body)
  const frontLeg = boneScreen(p.legFront);
  drawBone(
    frontLeg.x, hipY + p.legFront.oy * heightFactor,
    legW * p.legFront.scale, legH * p.legFront.scale, frontLeg.rot,
    shiftColor(legColor, 15), legColor, outlineColor,
  );

  // 6. Front arm (in front of body)
  const frontArm = boneScreen(p.armFront);
  drawBone(
    frontArm.x, shoulderY + p.armFront.oy * heightFactor,
    armW * p.armFront.scale, armH * p.armFront.scale, frontArm.rot,
    shiftColor(armColor, 15), armColor, outlineColor,
  );

  // === MAX mode glow aura ===
  if (maxModeActive) {
    const glowPulse = 0.15 + Math.sin(globalTick / 4) * 0.1;
    const glowGrad = ctx.createRadialGradient(
      sx, sy - f.displayHeight / 2, 10,
      sx, sy - f.displayHeight / 2, f.displayHeight * 0.8
    );
    glowGrad.addColorStop(0, `rgba(255, 255, 100, ${glowPulse})`);
    glowGrad.addColorStop(0.5, `rgba(255, 220, 50, ${glowPulse * 0.5})`);
    glowGrad.addColorStop(1, 'rgba(255, 200, 50, 0)');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(Math.round(sx - 50), Math.round(sy - f.displayHeight - 20), 100, f.displayHeight + 40);
  }
}
