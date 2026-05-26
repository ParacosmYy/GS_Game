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
import { getOutfit, drawCharacterHead, setSkeletalPartsTick } from './skeletalParts.js';
import { drawPixelTorso, drawPixelArm, drawPixelLeg, setBodyPartTick } from './bodyPartRenderer.js';
import { getVictoryPose, drawVictoryVFX } from './victoryPose.js';

// ===== State transition blending =====
// Caches previous pose data per-fighter for smooth interpolation when state changes.

interface TransitionState {
  /** The state key (FighterState or attack key) on the previous render call */
  prevState: string;
  /** The fully-computed pose snapshot from the previous frame */
  prevPose: Pose;
  /** Remaining blend frames; decrements each call until 0 */
  remaining: number;
}

/** How many frames to blend across when a state transition is detected */
const TRANSITION_DURATION = 3;

/**
 * Blend factor per remaining frame.
 * remaining=3 -> t=0.3, remaining=2 -> t=0.45, remaining=1 -> t=0.65
 * Higher t = more of the new pose. This progression gives a nice ease-in feel.
 */
function blendFactor(remaining: number): number {
  return 0.3 + (TRANSITION_DURATION - remaining) * 0.175;
}

/** Linear interpolation between two BonePose values */
function lerpBone(a: BonePose, b: BonePose, t: number): BonePose {
  return {
    ox: a.ox + (b.ox - a.ox) * t,
    oy: a.oy + (b.oy - a.oy) * t,
    rot: a.rot + (b.rot - a.rot) * t,
    scale: a.scale + (b.scale - a.scale) * t,
  };
}

/** Module-level cache keyed by Fighter instance — no mutation to Fighter itself */
const transitionCache = new WeakMap<Fighter, TransitionState>();

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
  const colorIdx = f.colorIndex;
  const outfit = getOutfit(f.charId, colorIdx);
  const prop: BodyProportions = charDef?.proportions ?? DEFAULT_PROPORTIONS;

  // 将动画帧传递给身体部位渲染器（用于呼吸偏移、闪烁等动态效果）
  setBodyPartTick(globalTick);
  setSkeletalPartsTick(globalTick);

  // Resolve pose — attack-specific poses take priority over state-based poses
  const attackKey = f.currentAttack as string;
  const attackPose = attackKey && poseSet?.[attackKey];
  // If the attack pose is a string reference (alias), follow it
  const resolvedAttackPose = typeof attackPose === 'string' ? poseSet?.[attackPose] : attackPose;
  const rawPose = resolvedAttackPose ?? poseSet?.[f.state] ?? poseSet?.[FighterState.IDLE] ?? pose({
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

  // Idle breathing — character-specific breathing + body language profiles
  // Each character gets unique breathSpeed (cycle period), breathAmp (vertical range),
  // headBob, chestLift, shoulderTilt, plus optional body sway and arm offsets.
  if (f.state === FighterState.IDLE) {
    const charId = f.charId ?? '';
    let breathSpeed = 30;
    let breathAmp = 2;
    let headBob = 0;
    let chestLift = 0;
    let shoulderTilt = 0;
    // Body sway: lateral oscillation for characters that shift weight side-to-side
    let bodySway = 0;
    // Arm position offsets: characters with distinct default arm angles
    let armFrontRotOffset = 0;
    let armBackRotOffset = 0;

    // ── Original 8 characters ──
    if (charId === 'kyo') { breathSpeed = 23; breathAmp = 2.9; headBob = 1.1; chestLift = -0.6; shoulderTilt = 0.05; }
    else if (charId === 'iori') { breathSpeed = 38; breathAmp = 1.2; headBob = -0.6; chestLift = 0.9; shoulderTilt = -0.08; }
    else if (charId === 'terry') { breathSpeed = 27; breathAmp = 2.8; headBob = 1.1; chestLift = -0.2; }
    else if (charId === 'kim') { breathSpeed = 22; breathAmp = 2.1; headBob = 0.6; chestLift = -0.3; }
    else if (charId === 'ryo') { breathSpeed = 25; breathAmp = 2.1; headBob = 0.4; chestLift = 0.3; shoulderTilt = 0.03; }
    else if (charId === 'leona') { breathSpeed = 32; breathAmp = 1.5; headBob = 0; }
    else if (charId === 'kdash') { breathSpeed = 24; breathAmp = 1.9; headBob = 0.4; }
    else if (charId === 'kula') { breathSpeed = 28; breathAmp = 1.8; headBob = 0.8; }
    // ── New characters: breathing profiles ──
    // Mai: graceful, slow breathing with gentle sway, fan-dancer posture
    else if (charId === 'mai') { breathSpeed = 32; breathAmp = 1.6; headBob = 0.7; chestLift = -0.3; bodySway = 1.2; armFrontRotOffset = 0.06; armBackRotOffset = -0.1; }
    // Robert: confident karateka, moderate breathing, slight head tilt
    else if (charId === 'robert') { breathSpeed = 26; breathAmp = 2.1; headBob = 0.9; chestLift = -0.2; shoulderTilt = 0.04; }
    // Clark: heavy grappler, slow deep breaths, very stable base
    else if (charId === 'clark') { breathSpeed = 20; breathAmp = 3.2; headBob = 0.5; chestLift = 0.4; shoulderTilt = 0.02; armFrontRotOffset = -0.04; }
    // Ralf: military brawler, powerful breaths, shoulders tense
    else if (charId === 'ralf') { breathSpeed = 21; breathAmp = 3.0; headBob = 0.6; chestLift = 0.3; shoulderTilt = 0.06; armFrontRotOffset = -0.06; }
    // Joe: Muay Thai stance, high guard, rhythmic bounce
    else if (charId === 'joe') { breathSpeed = 20; breathAmp = 2.6; headBob = 1.0; chestLift = -0.1; bodySway = 0.8; armFrontRotOffset = 0.08; }
    // Andy: disciplined Shiranui style, compact breathing
    else if (charId === 'andy') { breathSpeed = 25; breathAmp = 1.9; headBob = 0.5; chestLift = -0.2; shoulderTilt = 0.03; armFrontRotOffset = 0.04; }
    // Billy: tall staff user, upright posture, minimal movement
    else if (charId === 'billy') { breathSpeed = 34; breathAmp = 1.4; headBob = 0.3; chestLift = 0.1; armFrontRotOffset = -0.12; armBackRotOffset = 0.15; }
    // Chang: enormous, slow labored breathing, heavy sway
    else if (charId === 'chang') { breathSpeed = 18; breathAmp = 3.8; headBob = 1.4; chestLift = 0.6; bodySway = 1.8; armFrontRotOffset = -0.08; }
    // Yashiro: power fighter, broad shoulders, heavy breathing
    else if (charId === 'yashiro') { breathSpeed = 22; breathAmp = 2.5; headBob = 1.1; chestLift = 0.3; shoulderTilt = 0.05; armFrontRotOffset = -0.04; }
    // ── Existing extended roster ──
    else if (charId === 'mature') { breathSpeed = 30; breathAmp = 1.7; headBob = 0.4; }
    else if (charId === 'chris') { breathSpeed = 24; breathAmp = 2.2; headBob = 0.8; }
    else if (charId === 'shermie') { breathSpeed = 30; breathAmp = 1.6; headBob = 0.4; }
    else if (charId === 'vice') { breathSpeed = 26; breathAmp = 2.0; headBob = 0.6; }
    else if (charId === 'xiangfei') { breathSpeed = 22; breathAmp = 2.0; headBob = 0.7; }
    else if (charId === 'yamazaki') { breathSpeed = 28; breathAmp = 1.8; headBob = 0.2; }
    else if (charId === 'mary') { breathSpeed = 26; breathAmp = 1.8; headBob = 0.5; }
    else if (charId === 'kasumi') { breathSpeed = 28; breathAmp = 1.6; headBob = 0.4; }

    const breathe = Math.sin(globalTick / breathSpeed) * breathAmp;
    p.body.oy += breathe + chestLift;
    p.body.rot += shoulderTilt * Math.sin(globalTick / (breathSpeed * 2));
    p.head.oy += breathe + headBob * Math.sin(globalTick / breathSpeed * 0.5);
    // Body sway: lateral shift for characters with weight-shifting idle
    p.body.ox += bodySway * Math.sin(globalTick / (breathSpeed * 1.5)) * 0.5;
    // Arm offsets: character-specific default arm angle adjustments
    p.armFront.rot += armFrontRotOffset * Math.sin(globalTick / (breathSpeed * 1.2));
    p.armBack.rot += armBackRotOffset * Math.sin(globalTick / (breathSpeed * 1.2));

    // ── Character-specific idle silhouette adjustments ──
    if (charId === 'iori') {
      // Iori reads better when the silhouette feels coiled instead of upright.
      p.head.rot -= 0.05;
      p.armFront.rot += 0.08;
      p.armBack.rot -= 0.12;
      p.armFront.oy += 0.6;
    } else if (charId === 'kyo') {
      // Kyo should feel loose and confident, with the chest carrying the motion.
      p.head.rot += 0.03;
      p.armFront.rot -= 0.05;
      p.armBack.rot += 0.05;
    } else if (charId === 'ryo') {
      // Ryo stays compact and grounded so the torso feels disciplined, not floaty.
      p.head.rot += 0.02;
      p.armFront.rot -= 0.03;
      p.armBack.rot += 0.03;
    } else if (charId === 'mai') {
      // Mai: one hand slightly raised (fan position), graceful head tilt
      p.armFront.oy -= 2;
      p.armFront.rot += 0.12;
      p.head.rot -= 0.03;
      p.body.rot += 0.02;
    } else if (charId === 'clark') {
      // Clark: wide grappler stance, fists ready at chest level
      p.armFront.oy -= 3;
      p.armFront.rot -= 0.06;
      p.armBack.rot += 0.04;
      p.legFront.ox += 2;
      p.legBack.ox -= 2;
    } else if (charId === 'ralf') {
      // Ralf: aggressive military stance, fists clenched tight
      p.armFront.rot -= 0.08;
      p.armBack.rot += 0.06;
      p.head.rot -= 0.02;
      p.body.oy += 1;
    } else if (charId === 'chang') {
      // Chang: heavy labored stance, iron ball weight shows in posture
      p.body.oy += 2;
      p.head.oy += 1;
      p.armFront.rot += 0.15;
      p.armBack.rot -= 0.1;
      p.legFront.ox += 3;
      p.legBack.ox -= 3;
    } else if (charId === 'joe') {
      // Joe: Muay Thai high guard, bouncing rhythm
      p.armFront.oy -= 4;
      p.armFront.rot += 0.1;
      p.armBack.oy -= 3;
      p.armBack.rot -= 0.1;
      p.head.rot += 0.02;
    } else if (charId === 'billy') {
      // Billy: tall upright staff stance, one arm reaching up (holding staff)
      p.armFront.oy -= 6;
      p.armFront.rot -= 0.2;
      p.armBack.oy -= 2;
      p.armBack.rot += 0.08;
      p.head.oy -= 1;
    } else if (charId === 'yashiro') {
      // Yashiro: broad-shouldered power stance, fists loose at sides
      p.armFront.rot += 0.04;
      p.armBack.rot -= 0.06;
      p.body.oy += 1;
      p.legFront.ox += 2;
      p.legBack.ox -= 2;
    } else if (charId === 'andy') {
      // Andy: compact Shiranui stance, one hand forward
      p.armFront.oy -= 2;
      p.armFront.rot += 0.08;
      p.head.rot -= 0.02;
    }
  }

  // Walk cycle — character-specific stride and body language
  if (f.state === FighterState.WALK) {
    const charId = f.charId ?? '';
    let walkSpeed = 8;
    let walkAmp = 5;
    let bodyBob = 0;
    let headBob = 0;
    let armSwing = 0.3;
    let bodyLean = 0;
    let shoulderLead = 0;
    if (charId === 'kim') { walkSpeed = 7; walkAmp = 5.8; armSwing = 0.18; bodyBob = 0.9; headBob = 0.5; }
    else if (charId === 'iori') { walkSpeed = 10.5; walkAmp = 3.4; bodyBob = 1.2; headBob = 0.2; armSwing = 0.08; bodyLean = 0.08; shoulderLead = -0.8; }
    else if (charId === 'kyo') { walkSpeed = 6.8; walkAmp = 5.2; headBob = 1.2; armSwing = 0.42; bodyBob = 0.4; bodyLean = -0.04; shoulderLead = 0.7; }
    else if (charId === 'terry') { walkSpeed = 8; walkAmp = 5; bodyBob = 1; armSwing = 0.35; }
    else if (charId === 'leona') { walkSpeed = 7; walkAmp = 4.8; armSwing = 0.22; bodyLean = -0.05; }
    else if (charId === 'kdash') { walkSpeed = 8; walkAmp = 4.5; headBob = 0.45; armSwing = 0.2; bodyLean = -0.03; }
    else if (charId === 'kula') { walkSpeed = 9; walkAmp = 4; bodyBob = 0.8; armSwing = 0.35; }
    else if (charId === 'ryo') { walkSpeed = 7.4; walkAmp = 4.8; armSwing = 0.16; bodyBob = 0.45; headBob = 0.25; bodyLean = -0.06; shoulderLead = 0.3; }
    else if (charId === 'robert') { walkSpeed = 7; walkAmp = 5; headBob = 1.2; armSwing = 0.3; }
    else if (charId === 'mai') { walkSpeed = 9; walkAmp = 4.5; bodyBob = 2; armSwing = 0.4; }
    else if (charId === 'athena') { walkSpeed = 9; walkAmp = 4; bodyBob = 1; armSwing = 0.35; }
    else if (charId === 'yamazaki') { walkSpeed = 9; walkAmp = 3.8; headBob = 0.6; armSwing = 0.08; bodyLean = 0.06; }
    // KOF2002: backward walk detection — vx sign opposes facing when retreating
    const isWalkingBack = (f.vx * f.facing) < 0;

    // Backward walk modifiers: cautious retreat, smaller stride, body leans away
    if (isWalkingBack) {
      armSwing *= 0.55;        // arms swing much less when retreating
      walkAmp *= 0.65;         // shorter stride
      bodyLean = -bodyLean * 0.4; // reverse and reduce body lean (lean away)
      headBob *= 0.7;
    }

    const walkCycle = Math.sin(globalTick / walkSpeed) * walkAmp;
    p.legFront.oy += walkCycle;
    p.legBack.oy -= walkCycle;
    p.armFront.oy -= walkCycle * armSwing;
    p.armBack.oy += walkCycle * armSwing;
    p.body.oy += Math.sin(globalTick / walkSpeed * 2) * bodyBob;
    p.head.oy += Math.sin(globalTick / walkSpeed) * headBob;
    p.body.rot += Math.sin(globalTick / walkSpeed) * bodyLean;
    p.armFront.rot += shoulderLead * 0.05;
    p.armBack.rot -= shoulderLead * 0.05;

    // Backward walk: body tilts back, head tilts back — universal retreat posture
    if (isWalkingBack) {
      p.body.oy += 1;           // body shifts upward slightly (leaning back)
      p.head.rot += 0.03;       // head tilts back cautiously
    }

    if (charId === 'iori') {
      // Iori walks like a threat: low, narrow, and slightly forward.
      p.head.oy -= 1;
      p.armFront.rot += 0.15;
      p.armBack.rot -= 0.2;
      p.body.oy += 1.5;
    } else if (charId === 'kyo') {
      // Kyo should feel loose and self-assured, with the chest leading the step.
      p.body.oy -= 0.8;
      p.head.rot += 0.05;
      p.armFront.oy -= 0.8;
    } else if (charId === 'ryo') {
      // Ryo's walk is measured and rooted, not floaty or flashy.
      p.body.oy += 0.4;
      p.head.rot -= 0.02;
      p.armFront.oy += 0.3;
      // Ryo's backward walk: even more guarded, karate retreat stance
      if (isWalkingBack) {
        p.armFront.rot += 0.06;  // guard raised slightly higher
        p.armBack.rot += 0.04;   // back arm covers more
        p.body.oy += 0.5;        // lower center of gravity
      }
    }
  }

  // Run cycle — character-specific running style
  if (f.state === FighterState.RUN) {
    const charId = f.charId ?? '';
    let runSpeed = 5;
    let runAmp = 8;
    let bodyLean = -0.18;
    let headDrop = 0;
    let armPump = 0.3;
    if (charId === 'kyo') { runSpeed = 4.5; runAmp = 8.5; bodyLean = -0.08; headDrop = -1; armPump = 0.5; }
    else if (charId === 'iori') { runSpeed = 5.2; runAmp = 6.2; bodyLean = -0.22; headDrop = 1.2; armPump = 0.12; }
    else if (charId === 'ryo') { runSpeed = 4.8; runAmp = 7.2; bodyLean = -0.24; headDrop = -0.5; armPump = 0.42; }
    else if (charId === 'kim') { runSpeed = 4.4; runAmp = 7.5; bodyLean = -0.1; headDrop = -1.2; armPump = 0.28; }
    else if (charId === 'terry') { runSpeed = 4.8; runAmp = 8; bodyLean = -0.2; headDrop = -0.8; armPump = 0.45; }
    else if (charId === 'leona') { runSpeed = 4.6; runAmp = 7.6; bodyLean = -0.16; headDrop = -0.7; armPump = 0.34; }
    else if (charId === 'kdash') { runSpeed = 4.5; runAmp = 7.8; bodyLean = -0.25; headDrop = -1.4; armPump = 0.42; }
    else if (charId === 'kula') { runSpeed = 5; runAmp = 7.2; bodyLean = -0.12; headDrop = -0.6; armPump = 0.38; }
    const runCycle = Math.sin(globalTick / runSpeed) * runAmp;
    p.legFront.oy += runCycle;
    p.legBack.oy -= runCycle;
    p.body.oy += bodyLean * 8 + Math.sin(globalTick / runSpeed * 2) * 0.8;
    p.body.rot += bodyLean * 0.35;
    p.head.oy += headDrop + Math.sin(globalTick / runSpeed) * 0.8;
    p.armFront.rot -= armPump;
    p.armBack.rot += armPump;
    p.armFront.oy -= runCycle * 0.06;
    p.armBack.oy += runCycle * 0.06;
    if (charId === 'iori') {
      // Iori's run should feel like a low glide rather than a normal sprint.
      p.armFront.rot += 0.1;
      p.armBack.rot -= 0.18;
      p.body.oy += 1.5;
      p.head.rot -= 0.08;
    } else if (charId === 'kyo') {
      // Kyo is the most explosive here: chest up, shoulders alive, legs punching the floor.
      p.body.oy -= 1.5;
      p.head.rot += 0.08;
      p.armFront.oy -= 1;
      p.armBack.oy += 0.5;
    } else if (charId === 'ryo') {
      // Ryo keeps the dash compact so the silhouette reads as disciplined karate power.
      p.body.oy -= 1.0;
      p.armFront.rot -= 0.1;
      p.armBack.rot += 0.1;
      p.head.oy -= 0.5;
      p.legFront.oy += 0.5;   // driving legs harder into the ground
    }
  }

  // Taunt pose — character-specific gestures
  if (f.state === FighterState.TAUNT) {
    const progress = 1 - (f.tauntTimer / Fighter.TAUNT_DURATION);
    const charId = f.charId ?? '';
    // Phase 1 (0-0.4): windup, Phase 2 (0.4-0.7): gesture peak, Phase 3 (0.7-1.0): recovery
    if (progress < 0.4) {
      const t = progress / 0.4;
      p.armFront.rot -= t * 1.2;
      p.armFront.oy -= t * 8;
      p.head.oy -= t * 3;
    } else if (progress < 0.7) {
      const t = (progress - 0.4) / 0.3;
      p.armFront.rot = -1.2 + Math.sin(t * Math.PI) * 0.3;
      p.armFront.oy = -8 + Math.sin(t * Math.PI * 2) * 3;
      p.head.oy = -3;
      // Character-specific taunt variations
      if (charId === 'iori') {
        p.armBack.rot += 0.8; // Iori: one hand forward, other behind
        p.head.rot = 0.15; // slight head tilt
      } else if (charId === 'kyo') {
        p.armFront.rot = -1.5; // Kyo: arm up, confident
        p.armBack.rot = -0.3;
      } else if (charId === 'terry') {
        p.armFront.rot = -0.8; // Terry: casual wave
        p.head.rot = -0.1;
      } else if (charId === 'kim') {
        p.armFront.rot = -2.0; // Kim: sharp salute
        p.body.oy -= 2;
      }
    } else {
      const t = (progress - 0.7) / 0.3;
      p.armFront.rot = -1.2 * (1 - t);
      p.armFront.oy = -8 * (1 - t);
      p.head.oy = -3 * (1 - t);
    }
  }

  // ── Attack pose differentiation — character-specific attack stance modifiers ──
  // Applied on top of the base attack poses to make each character's strikes feel distinct
  if (f.state === FighterState.STAND_ATTACK || f.state === FighterState.CROUCH_ATTACK || f.state === FighterState.AIR_ATTACK) {
    const charId = f.charId ?? '';
    const isKicking = p.legFront.scale > 1.05; // detect kick attacks by leg scale
    if (charId === 'kyo') {
      // Kyo: wide karate stances, powerful punches with full body rotation
      p.body.rot += 0.06;
      p.armFront.oy -= 2;
      p.armFront.rot -= 0.08;
      p.legFront.ox += 2;
    } else if (charId === 'iori') {
      // Iori: claw-like hand positions, hunched forward, slashing motions
      p.head.rot += 0.06;
      p.body.rot += 0.04;
      p.body.oy += 2;
      p.armFront.rot += 0.12;
      p.armFront.scale *= 1.08;
    } else if (charId === 'terry') {
      // Terry: boxing-style punches, cap-like head forward, solid base
      p.head.oy += 1;
      p.head.rot -= 0.04;
      p.body.rot += 0.03;
      p.legFront.ox += 1;
    } else if (charId === 'kim') {
      // Kim: taekwondo high kicks, wide stance, upright posture on punches
      if (isKicking) {
        p.legFront.rot += 0.15;
        p.legFront.scale *= 1.1;
        p.body.oy -= 2;
      } else {
        p.armFront.rot -= 0.06;
        p.body.rot += 0.04;
      }
    } else if (charId === 'ryo') {
      // Ryo: kyokushin low stance, tight punches, rooted to the ground
      p.body.oy += 2;
      p.body.rot += 0.02;
      p.armFront.rot -= 0.1;
      p.head.rot -= 0.02;
      p.legFront.oy += 1;
    } else if (charId === 'mai') {
      // Mai: fan-like hand positions, graceful kicks with extended reach
      if (isKicking) {
        p.legFront.rot += 0.1;
        p.legFront.scale *= 1.06;
        p.body.rot -= 0.03;
      } else {
        p.armFront.rot += 0.08;
        p.armFront.scale *= 1.04;
      }
      p.head.rot -= 0.03;
      p.body.oy -= 1;
    } else if (charId === 'clark' || charId === 'ralf') {
      // Grapplers: wider body, heavier movements, more torso commitment
      p.body.rot += 0.08;
      p.armFront.scale *= 1.12;
      p.armFront.oy -= 2;
      p.legFront.ox += 2;
      p.legBack.ox -= 2;
      p.body.oy += 1;
      if (charId === 'ralf') {
        // Ralf: even more aggressive, lunging forward
        p.body.ox += 2;
        p.armFront.scale *= 1.06;
      }
    } else if (charId === 'chang') {
      // Chang: enormous swings, whole body behind the attack
      p.body.rot += 0.1;
      p.armFront.scale *= 1.2;
      p.armFront.oy -= 3;
      p.legFront.ox += 3;
      p.legBack.ox -= 3;
      p.body.oy += 2;
    } else if (charId === 'joe') {
      // Joe: Muay Thai elbows and knees, high guard maintained
      p.armBack.rot -= 0.08;
      p.armBack.oy -= 2;
      if (isKicking) {
        p.legFront.rot += 0.12;
        p.legFront.scale *= 1.08;
      }
      p.body.rot += 0.04;
    } else if (charId === 'billy') {
      // Billy: long-reaching staff strikes, one arm extended far
      p.armFront.oy -= 4;
      p.armFront.rot -= 0.15;
      p.armFront.scale *= 1.15;
      p.body.rot += 0.02;
    } else if (charId === 'yashiro') {
      // Yashiro: brutal power punches, broad shoulders commit fully
      p.body.rot += 0.08;
      p.armFront.scale *= 1.14;
      p.armFront.oy -= 2;
      p.legFront.ox += 2;
    } else if (charId === 'andy') {
      // Andy: fast, precise strikes from Shiranui style
      p.armFront.rot -= 0.04;
      p.body.rot += 0.03;
      p.head.rot -= 0.02;
    }
  }

  // Height factor for crouch/roll — KOF2002: 蹲下时宽度略增, 压缩感更自然
  const isCrouching = f.state === FighterState.CROUCH;
  const isRolling = f.state === FighterState.ROLL || f.state === FighterState.BACK_ROLL;
  const heightFactor = (isCrouching || isRolling) ? 0.6 : 1.0;
  const widthFactor = (isCrouching || isRolling) ? 1.12 : 1.0;

  // KOF2002: Character-specific hitstun reactions — heavier characters resist more, lighter fly further
  if (f.state === FighterState.HITSTUN) {
    const charId = f.charId ?? '';
    const stunProgress = Math.min(1, (f.hitstunTimer || 0) / 20);
    const recoil = stunProgress * stunProgress;
    // Weight factor: heavy characters lean less, light characters arc back more
    let leanFactor = 1.0;
    if (charId === 'ryo' || charId === 'ralf' || charId === 'chang' || charId === 'yashiro') leanFactor = 0.6;
    else if (charId === 'terry' || charId === 'clark' || charId === 'billy') leanFactor = 0.75;
    else if (charId === 'kyo' || charId === 'kim' || charId === 'andy' || charId === 'robert') leanFactor = 0.9;
    else if (charId === 'iori' || charId === 'kdash' || charId === 'joe' || charId === 'yamazaki') leanFactor = 1.0;
    else if (charId === 'leona' || charId === 'mai' || charId === 'mary' || charId === 'mature' || charId === 'shermie' || charId === 'vice') leanFactor = 1.1;
    else if (charId === 'kula' || charId === 'athena' || charId === 'chris' || charId === 'kasumi' || charId === 'xiangfei' || charId === 'choi') leanFactor = 1.3;
    p.body.rot += 0.26 * stunProgress * leanFactor;
    p.body.oy += 1.6 * recoil * leanFactor;
    p.head.rot += 0.18 * stunProgress * leanFactor;
    p.head.oy -= 1.4 * recoil;
    p.armFront.rot += 0.32 * stunProgress;
    p.armBack.rot -= 0.2 * stunProgress;
    p.armFront.oy -= 1.2 * recoil;
    p.armBack.oy += 0.8 * recoil;
    p.legFront.oy += 3 * stunProgress * leanFactor;
    p.legBack.oy -= 1.2 * recoil * leanFactor;
    if (charId === 'kyo') {
      // Kyo snaps upward a little before folding back, which keeps him feeling sharp.
      p.body.rot += 0.08 * stunProgress;
      p.head.rot += 0.05 * stunProgress;
      p.armFront.rot -= 0.1 * stunProgress;
    } else if (charId === 'ryo') {
      // Ryo should look like he absorbs impact through the core instead of flailing.
      p.body.oy += 0.8 * recoil;
      p.armFront.rot += 0.08 * stunProgress;
      p.armBack.rot -= 0.08 * stunProgress;
      p.head.oy -= 0.4 * recoil;
    } else if (charId === 'iori') {
      // Iori reads better with a twisted collapse, not a straight recoil.
      p.body.rot -= 0.12 * stunProgress;
      p.head.rot += 0.25 * stunProgress;
      p.armFront.rot += 0.5 * stunProgress;
      p.armBack.rot -= 0.45 * stunProgress;
      p.body.oy += 0.6 * recoil;
    }
  }
  // KOF2002: Dizzy wobble — character sways back and forth with drooping arms
  if (f.state === FighterState.DIZZY) {
    const wobble = Math.sin(globalTick * 0.15) * 0.15;
    const headWobble = Math.sin(globalTick * 0.2) * 0.2;
    p.body.rot += wobble;
    p.body.oy += Math.abs(Math.sin(globalTick * 0.12)) * 2;
    p.head.rot += headWobble;
    p.head.oy -= 3;
    // Arms droop lifelessly
    p.armFront.rot += 0.4 + Math.sin(globalTick * 0.1) * 0.1;
    p.armBack.rot += 0.35 + Math.sin(globalTick * 0.1 + 1) * 0.1;
    p.armFront.oy += 4;
    p.armBack.oy += 4;
    // Legs slightly buckled
    p.legFront.oy += 2;
    p.legBack.oy += 2;
  }
  // KOF2002: Knockdown tumble — character tumbles with rotation
  if (f.state === FighterState.KNOCKDOWN) {
    const charId = f.charId ?? '';
    const vy = f.vy || 0;
    const fall = Math.min(1, Math.abs(vy) / 18);
    const tumbleSpeed = charId === 'kula' || charId === 'choi' || charId === 'chris' ? 0.15
      : charId === 'ryo' || charId === 'ralf' || charId === 'chang' ? 0.06 : 0.1;
    const tumble = tumbleSpeed * vy;
    p.body.rot += tumble;
    p.body.oy += 2 * fall;
    p.head.rot += tumble * 0.45;
    p.head.oy -= 1.4 * fall;
    p.armFront.rot += tumble * 0.35;
    p.armBack.rot -= tumble * 0.35;
    p.legFront.rot -= tumble * 0.2;
    p.legBack.rot += tumble * 0.2;
    if (charId === 'kyo') {
      // Kyo should topple with a broader, more readable silhouette.
      p.armFront.oy -= 1.2 * fall;
      p.armBack.oy += 0.8 * fall;
      p.body.rot += 0.06 * vy;
    } else if (charId === 'ryo') {
      // Ryo falls more like a stiff block than a loose ragdoll.
      p.body.rot += tumble * 0.7;
      p.head.rot += tumble * 0.2;
      p.armFront.rot += tumble * 0.1;
      p.armBack.rot -= tumble * 0.1;
    } else if (charId === 'iori') {
      // Iori's collapse is tighter and uglier, with the limbs folding in.
      p.body.rot -= tumble * 0.25;
      p.head.rot += tumble * 0.6;
      p.armFront.rot += tumble * 0.15 - 0.35 * fall;
      p.armBack.rot -= tumble * 0.15 + 0.25 * fall;
      p.body.oy += 0.6 * fall;
    }
  }
  // KOF2002: Block stance — arms raised in guard position, slight recoil from impact
  if (f.state === FighterState.BLOCK) {
    const impact = Math.min(1, (f.blockstunTimer || 0) / 10);
    p.armFront.rot -= 0.8 + impact * 0.4;
    p.armBack.rot -= 0.6 + impact * 0.3;
    p.armFront.oy -= 5 + impact * 3;
    p.armBack.oy -= 4 + impact * 2;
    p.body.oy -= impact * 2;
  }
  // KOF2002: Guard Crush — exaggerated stagger, arms dropped
  if (f.state === FighterState.GUARD_CRUSH) {
    const crushProgress = 1 - Math.min(1, (f.hitstunTimer || 0) / 40);
    p.armFront.rot += 1.0 * (1 - crushProgress);
    p.armBack.rot += 0.8 * (1 - crushProgress);
    p.armFront.oy += 8 * (1 - crushProgress);
    p.armBack.oy += 6 * (1 - crushProgress);
    p.body.rot += 0.15 * (1 - crushProgress);
    p.head.rot += 0.2 * (1 - crushProgress);
  }
  // KOF2002: Counter Stance — focused pose, slight glow shimmer
  if (f.state === FighterState.COUNTER_STANCE) {
    const pulse = Math.sin(globalTick / 4) * 0.1;
    p.armFront.rot -= 0.5 + pulse;
    p.armBack.rot -= 0.3 - pulse;
    p.body.oy -= 2;
    p.legFront.oy += 2;
  }

  // === State transition blending ===
  // Determine the composite state key (state + attack phase) for this frame.
  const currentStateKey = `${f.state}:${f.currentAttack ?? ''}:${f.attackPhase ?? ''}`;

  const cached = transitionCache.get(f);
  if (cached) {
    if (cached.prevState !== currentStateKey) {
      // State changed — snapshot the previous pose as the blend source.
      // We snapshot the pose *before* the current mutations, so we must use
      // the last-frame snapshot.  cached.prevPose already holds that.
      // Re-initialise with the CURRENT pose as the old pose so blending starts
      // from where the character just was.  However, we already mutated `p`
      // above for the NEW state, so we need the PREVIOUS frame's final pose.
      // That's what cached.prevPose already is.  Reset the counter.
      cached.remaining = TRANSITION_DURATION;
      cached.prevState = currentStateKey;
      // prevPose keeps its value (the last-frame snapshot) so blending can start.
    }

    if (cached.remaining > 0) {
      const t = blendFactor(cached.remaining);
      p.head   = lerpBone(cached.prevPose.head,   p.head,   t);
      p.body   = lerpBone(cached.prevPose.body,   p.body,   t);
      p.armFront = lerpBone(cached.prevPose.armFront, p.armFront, t);
      p.armBack  = lerpBone(cached.prevPose.armBack,  p.armBack,  t);
      p.legFront = lerpBone(cached.prevPose.legFront, p.legFront, t);
      p.legBack  = lerpBone(cached.prevPose.legBack,  p.legBack,  t);
      cached.remaining--;
    }
  }

  // Snapshot the current (post-blend) pose for next frame's potential transition.
  transitionCache.set(f, {
    prevState: currentStateKey,
    prevPose: {
      head:     { ...p.head },
      body:     { ...p.body },
      armFront: { ...p.armFront },
      armBack:  { ...p.armBack },
      legFront: { ...p.legFront },
      legBack:  { ...p.legBack },
    },
    remaining: cached?.remaining ?? 0,
  });

  // === Per-character body dimensions ===
  const headW = prop.headW, headH = prop.headH;
  const torsoW = prop.torsoW * widthFactor, torsoH = prop.torsoH;
  const armW = prop.armW, armH = prop.armH;
  const legW = prop.legW, legH = prop.legH;

  // Reference point — anchor visual body so feet touch ground
  // displayHeight may be larger than actual body proportions; use actual body bottom
  const bodyBottom = prop.hipY + prop.legH / 2;
  const refX = sx;
  const refY = sy - bodyBottom;

  // Screen position helper
  const boneScreen = (bp: BonePose) => ({
    x: refX + bp.ox * f.facing,
    y: refY + bp.oy * heightFactor,
    rot: bp.rot * f.facing,
    scale: bp.scale,
  });

  // Colors
  const skinColor = '#e8b88a';

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

  // Hit flash overlay
  const isFlashing = f.hitFlashFrames > 0;
  const flashOverride = isFlashing ? f.hitFlashColor : undefined;

  const shoulderY = refY + prop.shoulderY * heightFactor;
  const hipY = refY + prop.hipY * heightFactor;

  // === Layer order: shadow -> back -> body -> front ===

  // 1. Back arm (behind body)
  const backArm = boneScreen(p.armBack);
  ctx.save();
  ctx.translate(backArm.x, shoulderY + p.armBack.oy * heightFactor);
  ctx.rotate(backArm.rot);
  if (isFlashing) {
    ctx.fillStyle = flashOverride!;
    roundRect(ctx, -armW * p.armBack.scale / 2, -armH * p.armBack.scale / 2,
      armW * p.armBack.scale, armH * p.armBack.scale, 3);
    ctx.fill();
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';    roundRect(ctx, -armW * p.armBack.scale / 2, -armH * p.armBack.scale / 2,
      armW * p.armBack.scale, armH * p.armBack.scale, 3);
    ctx.stroke();
  } else {
    drawPixelArm(ctx, f.charId, armW * p.armBack.scale, armH * p.armBack.scale, true, colorIdx);
  }
  ctx.restore();

  // 2. Back leg (behind body)
  const backLeg = boneScreen(p.legBack);
  ctx.save();
  ctx.translate(backLeg.x, hipY + p.legBack.oy * heightFactor);
  ctx.rotate(backLeg.rot);
  if (isFlashing) {
    ctx.fillStyle = flashOverride!;
    roundRect(ctx, -legW * p.legBack.scale / 2, -legH * p.legBack.scale / 2,
      legW * p.legBack.scale, legH * p.legBack.scale, 3);
    ctx.fill();
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';    roundRect(ctx, -legW * p.legBack.scale / 2, -legH * p.legBack.scale / 2,
      legW * p.legBack.scale, legH * p.legBack.scale, 3);
    ctx.stroke();
  } else {
    drawPixelLeg(ctx, f.charId, legW * p.legBack.scale, legH * p.legBack.scale, true, colorIdx);
  }
  ctx.restore();

  // 3. Torso (body)
  const torsoCenterY = refY + prop.torsoCenterY * heightFactor + p.body.oy * heightFactor;
  const torsoX = refX + p.body.ox * f.facing;
  ctx.save();
  ctx.translate(torsoX, torsoCenterY);
  ctx.rotate(p.body.rot * f.facing);
  if (isFlashing) {
    ctx.fillStyle = flashOverride!;
    roundRect(ctx, -torsoW / 2, -torsoH * heightFactor / 2, torsoW, torsoH * heightFactor, 5);
    ctx.fill();
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';    roundRect(ctx, -torsoW / 2, -torsoH * heightFactor / 2, torsoW, torsoH * heightFactor, 5);
    ctx.stroke();
  } else {
    drawPixelTorso(ctx, f.charId, torsoW, torsoH * heightFactor, colorIdx);
  }
  ctx.restore();

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
    drawCharacterHead(ctx, f.charId, f.facing, skinColor, headW, colorIdx, globalTick);
  }
  ctx.restore();

  // 5. Front leg (in front of body)
  const frontLeg = boneScreen(p.legFront);
  ctx.save();
  ctx.translate(frontLeg.x, hipY + p.legFront.oy * heightFactor);
  ctx.rotate(frontLeg.rot);
  if (isFlashing) {
    ctx.fillStyle = flashOverride!;
    roundRect(ctx, -legW * p.legFront.scale / 2, -legH * p.legFront.scale / 2,
      legW * p.legFront.scale, legH * p.legFront.scale, 3);
    ctx.fill();
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';    roundRect(ctx, -legW * p.legFront.scale / 2, -legH * p.legFront.scale / 2,
      legW * p.legFront.scale, legH * p.legFront.scale, 3);
    ctx.stroke();
  } else {
    drawPixelLeg(ctx, f.charId, legW * p.legFront.scale, legH * p.legFront.scale, false, colorIdx);
  }
  ctx.restore();

  // 6. Front arm (in front of body)
  const frontArm = boneScreen(p.armFront);
  ctx.save();
  ctx.translate(frontArm.x, shoulderY + p.armFront.oy * heightFactor);
  ctx.rotate(frontArm.rot);
  if (isFlashing) {
    ctx.fillStyle = flashOverride!;
    roundRect(ctx, -armW * p.armFront.scale / 2, -armH * p.armFront.scale / 2,
      armW * p.armFront.scale, armH * p.armFront.scale, 3);
    ctx.fill();
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';    roundRect(ctx, -armW * p.armFront.scale / 2, -armH * p.armFront.scale / 2,
      armW * p.armFront.scale, armH * p.armFront.scale, 3);
    ctx.stroke();
  } else {
    drawPixelArm(ctx, f.charId, armW * p.armFront.scale, armH * p.armFront.scale, false, colorIdx);
  }
  ctx.restore();

  // Fist glow on front arm when attacking — character-specific element
  if (!isFlashing && (f.state === FighterState.STAND_ATTACK || f.state === FighterState.CROUCH_ATTACK || f.state === FighterState.AIR_ATTACK)) {
    ctx.save();
    ctx.translate(frontArm.x, shoulderY + p.armFront.oy * heightFactor);
    ctx.rotate(frontArm.rot);
    const fistR = armW * 0.45;
    const fistY = armH * p.armFront.scale / 2 - 2;
    drawFistGlow(ctx, f.charId ?? '', fistR, fistY, globalTick);
    ctx.restore();
  }

  // KOF2002: Motion trail on attacking limbs — arc trail behind arm/leg during attacks
  if (!isFlashing && (f.state === FighterState.STAND_ATTACK || f.state === FighterState.CROUCH_ATTACK
      || f.state === FighterState.AIR_ATTACK) && f.attackPhase === 'active') {
    const charId = f.charId ?? '';
    const charDef = ROSTER.find(c => c.id === charId);
    const trailColor = charDef?.specialColor ?? '#ff6600';
    // Front arm trail
    const trailLen = 18;
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.strokeStyle = trailColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    const armTipX = frontArm.x + Math.cos(frontArm.rot) * armH * p.armFront.scale * 0.5;
    const armTipY = (shoulderY + p.armFront.oy * heightFactor) + Math.sin(frontArm.rot) * armH * p.armFront.scale * 0.5;
    ctx.moveTo(armTipX, armTipY);
    ctx.lineTo(armTipX - Math.cos(frontArm.rot) * trailLen * f.facing, armTipY - Math.sin(frontArm.rot) * trailLen);
    ctx.stroke();
    // Second lighter trail
    ctx.globalAlpha = 0.12;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(armTipX, armTipY);
    ctx.lineTo(armTipX - Math.cos(frontArm.rot) * trailLen * 1.5 * f.facing, armTipY - Math.sin(frontArm.rot) * trailLen * 1.5);
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

  // KOF2002: 低血量红色脉冲光环 — 血量<25%时可见的警告效果
  const healthRatio = f.health / f.maxHealth;
  if (healthRatio < 0.25 && healthRatio > 0) {
    const dangerPulse = Math.sin(globalTick * 0.15) * 0.15 + 0.15;
    const dangerGrad = ctx.createRadialGradient(
      sx, sy - f.displayHeight / 2, 5,
      sx, sy - f.displayHeight / 2, f.displayHeight * 0.6,
    );
    dangerGrad.addColorStop(0, `rgba(255, 50, 20, ${dangerPulse})`);
    dangerGrad.addColorStop(0.5, `rgba(255, 20, 0, ${dangerPulse * 0.4})`);
    dangerGrad.addColorStop(1, 'rgba(255, 0, 0, 0)');
    ctx.fillStyle = dangerGrad;
    ctx.fillRect(Math.round(sx - 55), Math.round(sy - f.displayHeight - 20), 110, f.displayHeight + 40);
  }
}

/** 角色专属拳头光效 — 通常攻击时可见 */
function drawFistGlow(
  ctx: CanvasRenderingContext2D, charId: string,
  fistR: number, fistY: number, tick: number,
): void {
  const skinColor = '#e8b88a';
  const skinDark = shiftColor(skinColor, -20);
  // 基础拳头
  ctx.fillStyle = skinColor;
  ctx.strokeStyle = skinDark;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, fistY, fistR, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // 角色专属光效 — each character has a unique attack accent color
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

/** Per-character attack accent color configuration */
function getAttackAccentGlow(charId: string): { shadow: string; blur: number; r: number; g: number; b: number; intensity: number; radius: number } | null {
  switch (charId) {
    case 'kyo':      return { shadow: '#ff4400', blur: 12, r: 255, g: 120, b: 0,   intensity: 1.0, radius: 3 };   // orange fire
    case 'iori':     return { shadow: '#8800cc', blur: 10, r: 136, g: 0,   b: 204, intensity: 1.0, radius: 2 };   // purple claw
    case 'terry':    return { shadow: '#ffcc00', blur: 8,  r: 255, g: 200, b: 0,   intensity: 0.7, radius: 2 };   // blue-gold (yellow glow)
    case 'kim':      return { shadow: '#4488ff', blur: 8,  r: 100, g: 150, b: 255, intensity: 0.6, radius: 2 };   // white-blue TKD
    case 'ryo':      return { shadow: '#ff8800', blur: 10, r: 255, g: 160, b: 0,   intensity: 1.0, radius: 3 };   // orange karate power
    case 'leona':    return { shadow: '#44ff88', blur: 6,  r: 80,  g: 255, b: 120, intensity: 0.5, radius: 1 };   // green military
    case 'kdash':    return { shadow: '#ff4400', blur: 8,  r: 255, g: 80,  b: 0,   intensity: 0.8, radius: 2 };   // red fire
    case 'kula':     return { shadow: '#44ccff', blur: 8,  r: 100, g: 200, b: 255, intensity: 0.6, radius: 2 };   // ice blue
    case 'robert':   return { shadow: '#22dd66', blur: 8,  r: 68,  g: 255, b: 136, intensity: 0.7, radius: 2 };   // green dragon
    case 'mai':      return { shadow: '#ff4488', blur: 9,  r: 255, g: 100, b: 136, intensity: 0.8, radius: 2 };   // pink flame (fan fire)
    case 'clark':    return { shadow: '#88aa44', blur: 10, r: 136, g: 170, b: 68,  intensity: 0.8, radius: 3 };   // olive-green military
    case 'ralf':     return { shadow: '#ff8844', blur: 12, r: 255, g: 136, b: 68,  intensity: 0.9, radius: 3 };   // orange-red explosion
    case 'joe':      return { shadow: '#ff8800', blur: 10, r: 255, g: 170, b: 0,   intensity: 0.85, radius: 3 };  // golden Muay Thai
    case 'andy':     return { shadow: '#ffaa22', blur: 8,  r: 255, g: 180, b: 50,  intensity: 0.7, radius: 2 };   // amber Shiranui
    case 'billy':    return { shadow: '#4488cc', blur: 8,  r: 80,  g: 150, b: 220, intensity: 0.7, radius: 2 };   // steel blue staff
    case 'chang':    return { shadow: '#cc8833', blur: 12, r: 200, g: 140, b: 50,  intensity: 0.9, radius: 4 };   // heavy iron brown
    case 'yashiro':  return { shadow: '#9966cc', blur: 10, r: 150, g: 100, b: 200, intensity: 0.8, radius: 3 };   // dark purple power
    case 'athena':   return { shadow: '#ff66aa', blur: 8,  r: 255, g: 100, b: 170, intensity: 0.7, radius: 2 };   // psychic pink
    case 'mature':   return { shadow: '#cc0044', blur: 8,  r: 200, g: 0,   b: 68,  intensity: 0.7, radius: 2 };   // blood red claw
    case 'chris':    return { shadow: '#ff8844', blur: 8,  r: 255, g: 140, b: 68,  intensity: 0.7, radius: 2 };   // warm orange flame
    case 'shermie':  return { shadow: '#cc44aa', blur: 8,  r: 200, g: 68,  b: 170, intensity: 0.7, radius: 2 };   // magenta lightning
    case 'vice':     return { shadow: '#6644cc', blur: 8,  r: 100, g: 68,  b: 200, intensity: 0.8, radius: 2 };   // dark violet
    case 'yamazaki': return { shadow: '#44aa00', blur: 9,  r: 68,  g: 170, b: 0,   intensity: 0.8, radius: 2 };   // sickly green snake
    case 'mary':     return { shadow: '#4488ff', blur: 8,  r: 80,  g: 140, b: 255, intensity: 0.7, radius: 2 };   // blue wolf
    case 'kasumi':   return { shadow: '#ff6688', blur: 7,  r: 255, g: 100, b: 136, intensity: 0.6, radius: 2 };   // soft pink judo
    case 'xiangfei': return { shadow: '#ff8866', blur: 8,  r: 255, g: 140, b: 100, intensity: 0.7, radius: 2 };   // warm coral
    case 'choi':     return { shadow: '#aacc00', blur: 7,  r: 170, g: 200, b: 0,   intensity: 0.6, radius: 1 };   // acidic yellow-green
    default:         return null;
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

  // Back arm — pixel art
  const backArm = boneScreen(p.armBack);
  ctx.save();
  ctx.translate(backArm.x, shoulderY + p.armBack.oy);
  ctx.rotate(backArm.rot);
  drawPixelArm(ctx, charId, armW * p.armBack.scale, armH * p.armBack.scale, true, colorIndex);
  ctx.restore();

  // Back leg — pixel art
  const backLeg = boneScreen(p.legBack);
  ctx.save();
  ctx.translate(backLeg.x, hipY + p.legBack.oy);
  ctx.rotate(backLeg.rot);
  drawPixelLeg(ctx, charId, legW * p.legBack.scale, legH * p.legBack.scale, true, colorIndex);
  ctx.restore();

  // Torso — pixel art
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
  ctx.rotate(p.head.rot * facing);
  drawCharacterHead(ctx, charId, facing, skinColor, headW, colorIndex, tick);
  ctx.restore();

  // Front leg — pixel art
  const frontLeg = boneScreen(p.legFront);
  ctx.save();
  ctx.translate(frontLeg.x, hipY + p.legFront.oy);
  ctx.rotate(frontLeg.rot);
  drawPixelLeg(ctx, charId, legW * p.legFront.scale, legH * p.legFront.scale, false, colorIndex);
  ctx.restore();

  // Front arm — pixel art
  const frontArm = boneScreen(p.armFront);
  ctx.save();
  ctx.translate(frontArm.x, shoulderY + p.armFront.oy);
  ctx.rotate(frontArm.rot);
  drawPixelArm(ctx, charId, armW * p.armFront.scale, armH * p.armFront.scale, false, colorIndex);
  ctx.restore();

  // Character-specific victory VFX
  drawVictoryVFX(ctx, sx, sy, tick, charId, facing);

  // Victory golden glow — enhanced with radiating rings
  const glowPulse = 0.25 + Math.sin(tick / 6) * 0.1;
  const glowGrad = ctx.createRadialGradient(sx, sy - 50, 10, sx, sy - 50, 110);
  glowGrad.addColorStop(0, `rgba(255, 215, 0, ${glowPulse})`);
  glowGrad.addColorStop(0.3, `rgba(255, 200, 0, ${glowPulse * 0.6})`);
  glowGrad.addColorStop(0.6, `rgba(255, 180, 0, ${glowPulse * 0.3})`);
  glowGrad.addColorStop(1, 'rgba(255, 150, 0, 0)');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(Math.round(sx - 110), Math.round(sy - 160), 220, 170);
  // KOF2002: 胜利光环 — 从角色中心扩展的金色光环
  const ringPulse = (tick % 60) / 60;
  const ringR = 30 + ringPulse * 80;
  ctx.strokeStyle = `rgba(255, 215, 0, ${(1 - ringPulse) * 0.2})`;
  ctx.lineWidth = 2 * (1 - ringPulse);
  ctx.beginPath();
  ctx.arc(sx, sy - 50, ringR, 0, Math.PI * 2);
  ctx.stroke();
}
