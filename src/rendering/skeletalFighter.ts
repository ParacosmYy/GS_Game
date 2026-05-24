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

/** Draw base head + character-specific hair/accessory decorations */
function drawCharacterHead(
  ctx: CanvasRenderingContext2D, charId: string, facing: number, headColor: string, headW: number,
): void {
  const r = headW / 2;
  const hg = ctx.createLinearGradient(-r, -r, r, r);
  hg.addColorStop(0, shiftColor(headColor, 20)); hg.addColorStop(1, headColor);
  ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#00000060'; ctx.lineWidth = 1.5; ctx.stroke();
  // Eyes
  const es = 3 * facing;
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(es, -1, 4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(es - 7 * facing, -1, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.arc(es + 1.2 * facing, -1, 2.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(es - 7 * facing + 1.2 * facing, -1, 2.2, 0, Math.PI * 2); ctx.fill();
  // Character decorations
  if (charId === 'kyo') {
    ctx.fillStyle = '#d44000';
    for (let i = -1; i <= 1; i++) { const sx = i * 5; ctx.beginPath(); ctx.moveTo(sx - 3, -r + 2); ctx.lineTo(sx, -r - 12); ctx.lineTo(sx + 3, -r + 2); ctx.closePath(); ctx.fill(); }
    ctx.fillStyle = '#cc2200'; ctx.fillRect(-r + 1, -r + 5, headW - 2, 3);
  } else if (charId === 'iori') {
    const fx = r * facing * 0.6; ctx.fillStyle = '#8833aa'; ctx.beginPath();
    ctx.moveTo(-3 * facing, -r); ctx.quadraticCurveTo(fx + 2 * facing, -r + 2, fx + 6 * facing, r + 6);
    ctx.lineTo(fx + 2 * facing, r + 3); ctx.quadraticCurveTo(fx - 2 * facing, -r + 5, -1 * facing, -r); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(100,30,150,0.15)'; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  } else if (charId === 'terry') {
    const cw = headW + 8, ch = 10; ctx.fillStyle = '#cc2222'; ctx.beginPath();
    ctx.moveTo(-cw / 2, -r + 1); ctx.lineTo(-cw / 2 + 2, -r - ch); ctx.lineTo(cw / 2 - 2, -r - ch); ctx.lineTo(cw / 2, -r + 1); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#aa1111'; ctx.fillRect(-cw / 2, -r - 2, cw, 3);
    ctx.fillStyle = '#cc2222'; ctx.fillRect(-2 * facing, -r, cw / 2 + 2, 3);
    ctx.fillStyle = '#e8c840'; ctx.fillRect(-r + 1, -r + 4, 4, 4);
  } else if (charId === 'kim') {
    ctx.fillStyle = '#2244aa'; ctx.beginPath();
    ctx.moveTo(-r + 3, -r); ctx.lineTo(-r + 2, -r - 4); ctx.quadraticCurveTo(0, -r - 6, r - 2, -r - 4); ctx.lineTo(r - 3, -r); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#1a3388'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-r + 4, -r + 1); ctx.lineTo(-r + 3, -r - 3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(r - 4, -r + 1); ctx.lineTo(r - 3, -r - 3); ctx.stroke();
  }
}

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

  // Resolve pose — 支持单 Pose 或 Pose[] 动画序列
  const rawPose = poseSet?.[f.state] ?? poseSet?.[FighterState.IDLE] ?? pose({
    armFront: bone(10, 20, 0.3),
    armBack: bone(-8, 15, -0.5),
  });

  let currentPose: Pose;
  if (Array.isArray(rawPose)) {
    // 多帧动画：攻击状态按 attackFrame 选择，非攻击按 tick 循环
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
  const headW = 20, headH = 20;
  const torsoW = 28, torsoH = 34;
  const armW = 12, armH = 22;
  const legW = 14, legH = 30;

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
    roundRect(ctx, -w / 2, -h / 2, w, h, 4);
    ctx.fill();
    ctx.strokeStyle = outline;
    ctx.lineWidth = 1.5;
    roundRect(ctx, -w / 2, -h / 2, w, h, 4);
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
  drawCharacterHead(ctx, f.charId, f.facing, headColor, headW);
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
    // Arms raised high in triumph
    armFront: { ox: 12, oy: -50 + bounce * 0.3, rot: -1.8, scale: 1.1 },
    armBack: { ox: -10, oy: -50 + bounce * 0.3, rot: 1.8, scale: 1.1 },
    // Stable stance
    legFront: { ox: 8, oy: 0, rot: 0.1, scale: 1 },
    legBack: { ox: -6, oy: 0, rot: -0.1, scale: 1 },
  };

  // Clone pose
  const p = {
    head: { ...victoryPose.head },
    body: { ...victoryPose.body },
    armFront: { ...victoryPose.armFront },
    armBack: { ...victoryPose.armBack },
    legFront: { ...victoryPose.legFront },
    legBack: { ...victoryPose.legBack },
  };

  // Body dimensions (same as drawSkeletalFighter)
  const headW = 20, headH = 20;
  const torsoW = 28, torsoH = 34;
  const armW = 12, armH = 22;
  const legW = 14, legH = 30;

  const refX = sx;
  const refY = sy - 100; // FIGHTER_HEIGHT

  const boneScreen = (bp: BonePose) => ({
    x: refX + bp.ox * facing,
    y: refY + bp.oy,
    rot: bp.rot * facing,
    scale: bp.scale,
  });

  const armColor = shiftColor(bodyColor, 15);
  const legColor = shiftColor(bodyColor, -15);
  const headColor = shiftColor(bodyColor, 25);

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
    roundRect(ctx, -w / 2, -h / 2, w, h, 4);
    ctx.fill();
    ctx.strokeStyle = outline;
    ctx.lineWidth = 1.5;
    roundRect(ctx, -w / 2, -h / 2, w, h, 4);
    ctx.stroke();
    ctx.restore();
  };

  const shoulderY = refY + 8;
  const hipY = refY + 32;

  // Back arm
  const backArm = boneScreen(p.armBack);
  drawBone(
    backArm.x, shoulderY + p.armBack.oy,
    armW * p.armBack.scale, armH * p.armBack.scale, backArm.rot,
    shiftColor(armColor, 10), armColor, outlineColor,
  );

  // Back leg
  const backLeg = boneScreen(p.legBack);
  drawBone(
    backLeg.x, hipY + p.legBack.oy,
    legW * p.legBack.scale, legH * p.legBack.scale, backLeg.rot,
    shiftColor(legColor, 10), legColor, outlineColor,
  );

  // Torso
  const torsoCenterY = refY + 18 + p.body.oy;
  const torsoX = refX + p.body.ox * facing;
  drawBone(
    torsoX, torsoCenterY,
    torsoW, torsoH, p.body.rot * facing,
    shiftColor(bodyColor, 25), shiftColor(bodyColor, -10), outlineColor,
  );

  // Head
  const headPos = boneScreen(p.head);
  const headCenterY = refY + 4 + p.head.oy;
  ctx.save();
  ctx.translate(headPos.x, headCenterY);
  ctx.rotate(p.head.rot * facing);
  drawCharacterHead(ctx, charId, facing, headColor, headW);
  ctx.restore();

  // Front leg
  const frontLeg = boneScreen(p.legFront);
  drawBone(
    frontLeg.x, hipY + p.legFront.oy,
    legW * p.legFront.scale, legH * p.legFront.scale, frontLeg.rot,
    shiftColor(legColor, 15), legColor, outlineColor,
  );

  // Front arm
  const frontArm = boneScreen(p.armFront);
  drawBone(
    frontArm.x, shoulderY + p.armFront.oy,
    armW * p.armFront.scale, armH * p.armFront.scale, frontArm.rot,
    shiftColor(armColor, 15), armColor, outlineColor,
  );

  // Victory golden glow
  const glowPulse = 0.2 + Math.sin(tick / 6) * 0.1;
  const glowGrad = ctx.createRadialGradient(
    sx, sy - 50, 10,
    sx, sy - 50, 80
  );
  glowGrad.addColorStop(0, `rgba(255, 215, 0, ${glowPulse})`);
  glowGrad.addColorStop(0.5, `rgba(255, 180, 0, ${glowPulse * 0.4})`);
  glowGrad.addColorStop(1, 'rgba(255, 150, 0, 0)');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(Math.round(sx - 80), Math.round(sy - 130), 160, 130);
}
