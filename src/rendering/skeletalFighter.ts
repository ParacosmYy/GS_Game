/**
 * Skeletal fighter rendering — main render functions
 * Body composition, pose resolution, animation blending
 */
import { Fighter } from '../entities/fighter.js';
import { FighterState } from '../core/types.js';
import { ROSTER } from '../characters/index.js';
import { bone, pose } from '../characters/types.js';
import type { Pose, BonePose, BodyProportions } from '../characters/types.js';
import { DEFAULT_PROPORTIONS } from '../characters/types.js';
import { shiftColor, roundRect } from './utils.js';
import { getOutfit, drawCharacterHead, drawShoe } from './skeletalParts.js';

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
  const prop: BodyProportions = charDef?.proportions ?? DEFAULT_PROPORTIONS;

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

  // Idle breathing — character-specific
  if (f.state === FighterState.IDLE) {
    const charId = f.charId ?? '';
    // Breathing speed/amplitude varies by character
    let breathSpeed = 30;
    let breathAmp = 2;
    let headBob = 0;
    if (charId === 'kyo') { breathSpeed = 25; breathAmp = 2.5; headBob = 1; }
    else if (charId === 'iori') { breathSpeed = 35; breathAmp = 1.5; headBob = 0; } // iori: slower, menacing
    else if (charId === 'terry') { breathSpeed = 28; breathAmp = 3; headBob = 1.5; }
    else if (charId === 'kim') { breathSpeed = 22; breathAmp = 2; headBob = 0.5; } // kim: athletic, faster
    else if (charId === 'ryo') { breathSpeed = 26; breathAmp = 2.5; headBob = 1; }
    else if (charId === 'leona') { breathSpeed = 32; breathAmp = 1.5; headBob = 0; } // leona: controlled
    else if (charId === 'kdash') { breathSpeed = 24; breathAmp = 2; headBob = 0.5; }
    else if (charId === 'kula') { breathSpeed = 28; breathAmp = 1.8; headBob = 0.8; }
    const breathe = Math.sin(globalTick / breathSpeed) * breathAmp;
    p.body.oy += breathe;
    p.head.oy += breathe + headBob * Math.sin(globalTick / breathSpeed * 0.5);
  }

  // Walk cycle — character-specific stride
  if (f.state === FighterState.WALK) {
    const charId = f.charId ?? '';
    let walkSpeed = 8, walkAmp = 5;
    if (charId === 'kim') { walkSpeed = 7; walkAmp = 6; } // martial arts stance walk
    else if (charId === 'iori') { walkSpeed = 10; walkAmp = 4; } // deliberate, slower
    else if (charId === 'leona') { walkSpeed = 7; walkAmp = 5; }
    else if (charId === 'kdash') { walkSpeed = 8; walkAmp = 4.5; }
    const walkCycle = Math.sin(globalTick / walkSpeed) * walkAmp;
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

  // === Per-character body dimensions ===
  const headW = prop.headW, headH = prop.headH;
  const torsoW = prop.torsoW, torsoH = prop.torsoH;
  const armW = prop.armW, armH = prop.armH;
  const legW = prop.legW, legH = prop.legH;

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

  const shoulderY = refY + prop.shoulderY * heightFactor;
  const hipY = refY + prop.hipY * heightFactor;

  // === Layer order: shadow -> back -> body -> front ===

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
  const torsoCenterY = refY + prop.torsoCenterY * heightFactor + p.body.oy * heightFactor;
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
  const headCenterY = refY + prop.headCenterY * heightFactor + p.head.oy * heightFactor;
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
