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
import { STAGE_GROUND_Y } from '../core/constants.js';
import { shiftColor, roundRect } from './utils.js';
import { getOutfit, drawCharacterHead, setSkeletalPartsTick } from './skeletalParts.js';
import { drawPixelTorso, drawPixelArm, drawPixelLeg, setBodyPartTick } from './bodyPartRenderer.js';
import { getVictoryPose, drawVictoryVFX } from './victoryPose.js';
import { drawMAXModeAura } from './maxModeVfx.js';
import { spriteFrameCache } from './spriteFrameCache.js';

// ===== Sprite Frame Cache — opt-in cached rendering =====
// When enabled, completed pose frames are blitted from offscreen canvases
// instead of being re-drawn every frame. Default: off (live rendering).
/** Set to true to use cached sprite frames instead of live skeletal rendering */
export let useFrameCache = false;
export function setFrameCacheEnabled(enabled: boolean): void { useFrameCache = enabled; }

// ===== State transition blending =====
// Caches previous pose data per-fighter for smooth interpolation when state changes.

interface TransitionState {
  /** The state key (FighterState or attack key) on the previous render call */
  prevState: string;
  /** The fully-computed pose snapshot from the previous frame */
  prevPose: Pose;
  /** Remaining blend frames; decrements each call until 0 */
  remaining: number;
  /** Total blend duration for the current transition */
  duration: number;
  /** Blend curve type controlling how t progresses over the duration */
  curve: 'ease-in' | 'ease-out' | 'snap' | 'linear';
}

/**
 * Per-transition blend parameters based on (previousState, newState) pairs.
 *
 * Design rationale:
 *   - IDLE<->WALK: gradual ease-in so the character shifts weight naturally
 *   - IDLE->JUMP: snappy but not jarring; the player pressed a button, respond fast
 *   - ->HITSTUN: near-instant snap; being hit is sudden and violent
 *   - ->KNOCKDOWN: fast start (impact shock) then controlled settle
 *   - Attacks: quick commitment so the strike reads clearly
 *   - All others: moderate default blend
 */
interface TransitionProfile {
  duration: number;
  curve: 'ease-in' | 'ease-out' | 'snap' | 'linear';
}

function getTransitionProfile(from: string, to: string): TransitionProfile {
  // ── Hit reactions: near-instant snap ──
  if (to === FighterState.HITSTUN) return { duration: 1, curve: 'snap' };
  if (to === FighterState.KNOCKDOWN) return { duration: 2, curve: 'snap' };
  if (to === FighterState.GUARD_CRUSH) return { duration: 1, curve: 'snap' };

  // ── IDLE <-> WALK: gradual weight shift ──
  if (from === FighterState.IDLE && to === FighterState.WALK) return { duration: 5, curve: 'ease-in' };
  if (from === FighterState.WALK && to === FighterState.IDLE) return { duration: 4, curve: 'ease-out' };

  // ── IDLE <-> RUN: faster commitment than walk but still smooth ──
  if (from === FighterState.IDLE && to === FighterState.RUN) return { duration: 3, curve: 'ease-in' };
  if (from === FighterState.RUN && to === FighterState.IDLE) return { duration: 3, curve: 'ease-out' };
  if (from === FighterState.WALK && to === FighterState.RUN) return { duration: 2, curve: 'ease-in' };

  // ── Jump launch: snappy but not jarring ──
  if (to === FighterState.JUMP || to === FighterState.HOP || to === FighterState.HYPER_JUMP || to === FighterState.RUN_JUMP) {
    return { duration: 2, curve: 'ease-out' };
  }

  // ── Attacks: quick commitment so the strike reads clearly ──
  if (to === FighterState.STAND_ATTACK || to === FighterState.CROUCH_ATTACK || to === FighterState.AIR_ATTACK) {
    return { duration: 2, curve: 'ease-out' };
  }

  // ── Crouch transitions: moderate ──
  if (to === FighterState.CROUCH || from === FighterState.CROUCH) {
    return { duration: 3, curve: 'ease-in' };
  }

  // ── Block: quick guard raise ──
  if (to === FighterState.BLOCK || to === FighterState.AIR_BLOCK) {
    return { duration: 2, curve: 'ease-out' };
  }

  // ── Default: moderate linear blend ──
  return { duration: 3, curve: 'linear' };
}

/**
 * Compute blend factor (t) given remaining frames, total duration, and curve type.
 * t=0 means fully old pose, t=1 means fully new pose.
 */
function blendFactor(remaining: number, duration: number, curve: string): number {
  const progress = 1 - remaining / duration; // 0 at start, 1 at end
  switch (curve) {
    case 'snap':
      // Near-instant: jump to mostly-new on the first frame
      return 0.85 + progress * 0.15;
    case 'ease-in':
      // Slow start, accelerating: t follows a quadratic ease-in curve
      return progress * progress;
    case 'ease-out':
      // Fast start, decelerating: t follows a quadratic ease-out curve
      return 1 - (1 - progress) * (1 - progress);
    case 'linear':
    default:
      return progress;
  }
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
  playerIdx: 0 | 1 = 0,
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
  // KOF2002: Getup â fighter rises from lying to standing
  if (f.state === FighterState.GETUP) {
    const progress = 1 - ((f.getupTimer || 0) / (f.getupDuration || 15));
    // Gradually reduce body rotation (from lying to upright)
    p.body.rot *= (1 - progress);
    p.head.rot *= (1 - progress);
    // Arms come back to sides
    p.armFront.rot *= (1 - progress);
    p.armBack.rot *= (1 - progress);
    p.legFront.rot *= (1 - progress);
    p.legBack.rot *= (1 - progress);
    // Y offset rises from ground level
    p.body.oy -= progress * 15;
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
  const currBaseState = f.state;

  const cached = transitionCache.get(f);
  if (cached) {
    if (cached.prevState !== currentStateKey) {
      // State changed — look up the appropriate transition profile
      const prevBaseState = cached.prevState.split(':')[0];
      const profile = getTransitionProfile(prevBaseState, currBaseState);
      cached.remaining = profile.duration;
      cached.duration = profile.duration;
      cached.curve = profile.curve;
      cached.prevState = currentStateKey;
      // prevPose keeps its value (the last-frame snapshot) so blending can start.
    }

    if (cached.remaining > 0) {
      const t = blendFactor(cached.remaining, cached.duration, cached.curve);
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
    duration: cached?.duration ?? 3,
    curve: cached?.curve ?? 'linear',
  });

  // === Sprite frame cache — opt-in blit ===
  // Determine the frame index for cache lookup.
  // For array poses: use the resolved index. For single poses: 0.
  let cacheFrameIdx = 0;
  if (Array.isArray(rawPose)) {
    const frames = rawPose as Pose[];
    if (f.attackPhase === 'active' || f.attackPhase === 'startup' || f.attackPhase === 'recovery') {
      cacheFrameIdx = Math.min(f.attackFrame, frames.length - 1);
    } else {
      cacheFrameIdx = globalTick % frames.length;
    }
  }
  const cacheStateKey = attackKey || f.state;
  const cacheCharId = f.charId ?? 'unknown';

  if (useFrameCache) {
    const used = spriteFrameCache.blitCachedFrame(
      ctx, sx, sy,
      (drawCtx) => {
        // This drawFn is called on cache miss to render into the offscreen canvas.
        // It receives a context translated so (0,0) = character feet center.
        drawCachedSkeletalFrame(drawCtx, p, prop, widthFactor, heightFactor,
          f, sx, sy, globalTick, maxModeActive);
      },
      cacheCharId,
      cacheStateKey,
      cacheFrameIdx,
      colorIdx,
    );
    if (used) return; // Cached frame was blitted — skip live rendering
    // Cache unavailable (SSR/test) — fall through to live rendering
  }

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

  // Draw shadow on ground — dynamic based on character height above ground
  // Shadow stays on the ground plane (STAGE_GROUND_Y) regardless of character y position
  const airDist = Math.max(0, STAGE_GROUND_Y - f.y);
  // Shadow shrinks and fades as character rises; minimum 0.2 scale at max height
  const shadowScale = Math.max(0.2, 1 - airDist / 280);
  const shadowW = 60 * (0.5 + shadowScale * 0.5);
  const shadowH = 6 * shadowScale;
  // Alpha: grounded 0.28, maximum height 0.04
  const shadowAlpha = 0.04 + 0.24 * shadowScale;
  // Shadow is drawn on the ground plane, not at character feet
  const shadowY = STAGE_GROUND_Y + 2;
  ctx.save();
  // Radial gradient: sharp center, soft edges for near-ground; blurry when airborne
  const shadowGrad = ctx.createRadialGradient(sx, shadowY, 0, sx, shadowY, shadowW);
  shadowGrad.addColorStop(0, `rgba(0, 0, 0, ${shadowAlpha})`);
  shadowGrad.addColorStop(0.55, `rgba(0, 0, 0, ${shadowAlpha * 0.55})`);
  shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(sx, shadowY, shadowW, shadowH, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Hit flash overlay
  const isFlashing = f.hitFlashFrames > 0;
  const flashOverride = isFlashing ? f.hitFlashColor : undefined;
  const flashStrength = isFlashing ? Math.min(0.42, 0.18 + f.hitFlashFrames * 0.012) : 0;

  const shoulderY = refY + prop.shoulderY * heightFactor;
  const hipY = refY + prop.hipY * heightFactor;

  // === Layer order: shadow -> back -> body -> front ===

  // 1. Back arm (behind body)
  const backArm = boneScreen(p.armBack);
  ctx.save();
  ctx.translate(backArm.x, shoulderY + p.armBack.oy * heightFactor);
  ctx.rotate(backArm.rot);
  drawPixelArm(ctx, f.charId, armW * p.armBack.scale, armH * p.armBack.scale, true, colorIdx);
  ctx.restore();

  // 2. Back leg (behind body)
  const backLeg = boneScreen(p.legBack);
  ctx.save();
  ctx.translate(backLeg.x, hipY + p.legBack.oy * heightFactor);
  ctx.rotate(backLeg.rot);
  drawPixelLeg(ctx, f.charId, legW * p.legBack.scale, legH * p.legBack.scale, true, colorIdx);
  ctx.restore();

  // 3. Torso (body)
  const torsoCenterY = refY + prop.torsoCenterY * heightFactor + p.body.oy * heightFactor;
  const torsoX = refX + p.body.ox * f.facing;
  ctx.save();
  ctx.translate(torsoX, torsoCenterY);
  ctx.rotate(p.body.rot * f.facing);
  drawPixelTorso(ctx, f.charId, torsoW, torsoH * heightFactor, colorIdx);
  ctx.restore();

  // 4. Head
  const headPos = boneScreen(p.head);
  const headCenterY = refY + prop.headCenterY * heightFactor + p.head.oy * heightFactor;
  ctx.save();
  ctx.translate(headPos.x, headCenterY);
  ctx.rotate(p.head.rot * f.facing);
  drawCharacterHead(ctx, f.charId, f.facing, skinColor, headW, colorIdx, globalTick);
  ctx.restore();

  // 5. Front leg (in front of body)
  const frontLeg = boneScreen(p.legFront);
  ctx.save();
  ctx.translate(frontLeg.x, hipY + p.legFront.oy * heightFactor);
  ctx.rotate(frontLeg.rot);
  drawPixelLeg(ctx, f.charId, legW * p.legFront.scale, legH * p.legFront.scale, false, colorIdx);
  ctx.restore();

  // 6. Front arm (in front of body)
  const frontArm = boneScreen(p.armFront);
  ctx.save();
  ctx.translate(frontArm.x, shoulderY + p.armFront.oy * heightFactor);
  ctx.rotate(frontArm.rot);
  drawPixelArm(ctx, f.charId, armW * p.armFront.scale, armH * p.armFront.scale, false, colorIdx);
  ctx.restore();

  // === Joint balls at shoulder/elbow/knee/ankle for solid body look ===
  const jointR = Math.max(3, Math.min(4, armW * 0.18));
  const jointColor = '#e8b88a';
  const jointDark = shiftColor(jointColor, -20);
  const jointHighlight = shiftColor(jointColor, 15);
  // Helper to draw a joint ball
  const drawJoint = (jx: number, jy: number) => {
    ctx.fillStyle = jointColor;
    ctx.beginPath();
    ctx.arc(jx, jy, jointR, 0, Math.PI * 2);
    ctx.fill();
    // Highlight
    ctx.fillStyle = jointHighlight;
    ctx.beginPath();
    ctx.arc(jx - jointR * 0.2, jy - jointR * 0.25, jointR * 0.4, 0, Math.PI * 2);
    ctx.fill();
    // Outline
    ctx.strokeStyle = jointDark;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(jx, jy, jointR, 0, Math.PI * 2);
    ctx.stroke();
  };

  // Shoulder joints — where arms connect to torso
  const shoulderLX = torsoX - torsoW * 0.45 * f.facing;
  const shoulderRX = torsoX + torsoW * 0.45 * f.facing;
  drawJoint(shoulderLX, shoulderY);
  drawJoint(shoulderRX, shoulderY);

  // Elbow joints — midpoint of each arm
  const backArmElbowX = backArm.x + Math.cos(backArm.rot) * armH * p.armBack.scale * 0.3 * 0;
  const backArmElbowY = (shoulderY + p.armBack.oy * heightFactor) + Math.sin(backArm.rot) * armH * p.armBack.scale * 0.3;
  // Calculate arm midpoint in rotated space
  const backArmMidDist = armH * p.armBack.scale * 0.3;
  const baElbowX = backArm.x + Math.sin(backArm.rot) * backArmMidDist;
  const baElbowY = (shoulderY + p.armBack.oy * heightFactor) + Math.cos(backArm.rot) * backArmMidDist;
  drawJoint(baElbowX, baElbowY);

  const frontArmMidDist = armH * p.armFront.scale * 0.3;
  const faElbowX = frontArm.x + Math.sin(frontArm.rot) * frontArmMidDist;
  const faElbowY = (shoulderY + p.armFront.oy * heightFactor) + Math.cos(frontArm.rot) * frontArmMidDist;
  drawJoint(faElbowX, faElbowY);

  // Knee joints — midpoint of each leg
  const backLegMidDist = legH * p.legBack.scale * 0.45;
  const blKneeX = backLeg.x + Math.sin(backLeg.rot) * backLegMidDist;
  const blKneeY = (hipY + p.legBack.oy * heightFactor) + Math.cos(backLeg.rot) * backLegMidDist;
  drawJoint(blKneeX, blKneeY);

  const frontLegMidDist = legH * p.legFront.scale * 0.45;
  const flKneeX = frontLeg.x + Math.sin(frontLeg.rot) * frontLegMidDist;
  const flKneeY = (hipY + p.legFront.oy * heightFactor) + Math.cos(frontLeg.rot) * frontLegMidDist;
  drawJoint(flKneeX, flKneeY);

  // Ankle joints — near bottom of each leg
  const ankleDist = legH * p.legBack.scale * 0.85;
  const blAnkleX = backLeg.x + Math.sin(backLeg.rot) * ankleDist;
  const blAnkleY = (hipY + p.legBack.oy * heightFactor) + Math.cos(backLeg.rot) * ankleDist;
  drawJoint(blAnkleX, blAnkleY);

  const flAnkleDist = legH * p.legFront.scale * 0.85;
  const flAnkleX = frontLeg.x + Math.sin(frontLeg.rot) * flAnkleDist;
  const flAnkleY = (hipY + p.legFront.oy * heightFactor) + Math.cos(frontLeg.rot) * flAnkleDist;
  drawJoint(flAnkleX, flAnkleY);

  // Hip joints — where legs connect to body
  const hipLX = torsoX - torsoW * 0.25 * f.facing;
  const hipRX = torsoX + torsoW * 0.25 * f.facing;
  drawJoint(hipLX, hipY);
  drawJoint(hipRX, hipY);

  if (isFlashing) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = flashStrength;
    const flashRadius = Math.max(torsoW, torsoH * heightFactor) * 1.25;
    const flashGrad = ctx.createRadialGradient(
      torsoX, torsoCenterY, 0,
      torsoX, torsoCenterY, flashRadius,
    );
    flashGrad.addColorStop(0, 'rgba(255, 255, 255, 0.70)');
    flashGrad.addColorStop(0.3, `${flashOverride ?? '#ffffff'}aa`);
    flashGrad.addColorStop(0.7, `${flashOverride ?? '#ffffff'}44`);
    flashGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = flashGrad;
    ctx.beginPath();
    ctx.ellipse(torsoX, torsoCenterY, torsoW * 0.95, torsoH * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

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

  // === MAX mode glow aura — KOF2002 style ===
  if (maxModeActive) {
    // Element-coded pulsing aura with energy wisps
    drawMAXModeAura(ctx, sx, sy, f.displayHeight, globalTick,
      { active: true, timer: 1, maxDuration: 1 },
      playerIdx, f.charId ?? 'ryo');

    const glowPulse = 0.3 + Math.sin(globalTick / 4) * 0.12;

    // ── 1. Outer pulse ring: expands every 60 frames ──
    const ringPhase = (globalTick % 60) / 60;
    const ringR = 20 + ringPhase * f.displayHeight * 0.9;
    const ringAlpha = (1 - ringPhase) * 0.35;
    ctx.save();
    ctx.strokeStyle = `rgba(255, 210, 60, ${ringAlpha})`;
    ctx.lineWidth = 2.5 * (1 - ringPhase) + 0.5;
    ctx.beginPath();
    ctx.arc(sx, sy - f.displayHeight / 2, ringR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // ── 2. Main radial aura glow (radius increased to displayHeight * 1.0) ──
    const glowGrad = ctx.createRadialGradient(
      sx, sy - f.displayHeight / 2, 10,
      sx, sy - f.displayHeight / 2, f.displayHeight * 1.0,
    );
    glowGrad.addColorStop(0, `rgba(255, 255, 100, ${glowPulse})`);
    glowGrad.addColorStop(0.3, `rgba(255, 220, 50, ${glowPulse * 0.6})`);
    glowGrad.addColorStop(0.6, `rgba(255, 150, 0, ${glowPulse * 0.25})`);
    glowGrad.addColorStop(0.85, `rgba(255, 120, 0, ${glowPulse * 0.08})`);
    glowGrad.addColorStop(1, 'rgba(255, 200, 50, 0)');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(Math.round(sx - f.displayHeight), Math.round(sy - f.displayHeight * 1.6), f.displayHeight * 2, f.displayHeight * 2);

    // ── 3. Enhanced energy particles (every 3 frames, larger, float upward) ──
    if (globalTick % 3 === 0) {
      const sparkleX = sx + (Math.random() - 0.5) * 60;
      // Particles spawn across body height, then drift upward
      const sparkleBaseY = sy - Math.random() * f.displayHeight;
      const sparkleDrift = -1.5 - Math.random() * 2; // upward drift
      ctx.save();
      // Inner bright core
      ctx.fillStyle = `rgba(255, 255, 180, ${0.6 + Math.random() * 0.3})`;
      ctx.beginPath();
      ctx.arc(sparkleX, sparkleBaseY + sparkleDrift * ((globalTick % 12) / 12), 2.5, 0, Math.PI * 2);
      ctx.fill();
      // Outer soft glow around particle
      ctx.fillStyle = `rgba(255, 210, 80, ${0.25 + Math.random() * 0.15})`;
      ctx.beginPath();
      ctx.arc(sparkleX, sparkleBaseY + sparkleDrift * ((globalTick % 12) / 12), 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // ── 4. Afterimage / ghost trail (every 4 frames) ──
    if (globalTick % 4 === 0) {
      const afterimageOffset = -3 * f.facing; // trails behind movement direction
      ctx.save();
      ctx.globalAlpha = 0.15;
      // Draw a simplified silhouette behind the character
      const ghostX = sx + afterimageOffset;
      const ghostCenterY = sy - f.displayHeight / 2;
      const ghostH = f.displayHeight * 0.8;
      const ghostGrad = ctx.createRadialGradient(
        ghostX, ghostCenterY, 5,
        ghostX, ghostCenterY, ghostH * 0.5,
      );
      ghostGrad.addColorStop(0, 'rgba(255, 180, 50, 0.3)');
      ghostGrad.addColorStop(0.5, 'rgba(255, 140, 20, 0.12)');
      ghostGrad.addColorStop(1, 'rgba(255, 120, 0, 0)');
      ctx.fillStyle = ghostGrad;
      ctx.beginPath();
      ctx.ellipse(ghostX, ghostCenterY, 22, ghostH * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // ── 5. Outline glow on all body parts ──
    // Applied by re-drawing stroke outlines with golden shadow
    ctx.save();
    ctx.shadowColor = '#ffcc00';
    ctx.shadowBlur = 6;
    ctx.strokeStyle = 'rgba(255, 200, 60, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    // Back arm outline glow
    ctx.translate(backArm.x, shoulderY + p.armBack.oy * heightFactor);
    ctx.rotate(backArm.rot);
    if (!isFlashing) {
      roundRect(ctx, -armW * p.armBack.scale / 2, -armH * p.armBack.scale / 2,
        armW * p.armBack.scale, armH * p.armBack.scale, 3);
      ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    ctx.shadowColor = '#ffcc00';
    ctx.shadowBlur = 6;
    ctx.strokeStyle = 'rgba(255, 200, 60, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    // Back leg outline glow
    ctx.translate(backLeg.x, hipY + p.legBack.oy * heightFactor);
    ctx.rotate(backLeg.rot);
    if (!isFlashing) {
      roundRect(ctx, -legW * p.legBack.scale / 2, -legH * p.legBack.scale / 2,
        legW * p.legBack.scale, legH * p.legBack.scale, 3);
      ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    ctx.shadowColor = '#ffcc00';
    ctx.shadowBlur = 6;
    ctx.strokeStyle = 'rgba(255, 200, 60, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    // Torso outline glow
    ctx.translate(torsoX, torsoCenterY);
    ctx.rotate(p.body.rot * f.facing);
    if (!isFlashing) {
      roundRect(ctx, -torsoW / 2, -torsoH * heightFactor / 2, torsoW, torsoH * heightFactor, 5);
      ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    ctx.shadowColor = '#ffcc00';
    ctx.shadowBlur = 6;
    ctx.strokeStyle = 'rgba(255, 200, 60, 0.4)';
    ctx.lineWidth = 1.5;
    // Head outline glow
    ctx.translate(headPos.x, headCenterY);
    ctx.rotate(p.head.rot * f.facing);
    if (!isFlashing) {
      ctx.beginPath();
      ctx.arc(0, 0, headW / 2 + 1, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    ctx.shadowColor = '#ffcc00';
    ctx.shadowBlur = 6;
    ctx.strokeStyle = 'rgba(255, 200, 60, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    // Front leg outline glow
    ctx.translate(frontLeg.x, hipY + p.legFront.oy * heightFactor);
    ctx.rotate(frontLeg.rot);
    if (!isFlashing) {
      roundRect(ctx, -legW * p.legFront.scale / 2, -legH * p.legFront.scale / 2,
        legW * p.legFront.scale, legH * p.legFront.scale, 3);
      ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    ctx.shadowColor = '#ffcc00';
    ctx.shadowBlur = 6;
    ctx.strokeStyle = 'rgba(255, 200, 60, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    // Front arm outline glow
    ctx.translate(frontArm.x, shoulderY + p.armFront.oy * heightFactor);
    ctx.rotate(frontArm.rot);
    if (!isFlashing) {
      roundRect(ctx, -armW * p.armFront.scale / 2, -armH * p.armFront.scale / 2,
        armW * p.armFront.scale, armH * p.armFront.scale, 3);
      ctx.stroke();
    }
    ctx.restore();
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

/**
 * Draw a skeletal frame into an offscreen canvas context for caching.
 * The context is pre-translated so (0,0) = character feet center.
 * This mirrors the body-part drawing from drawSkeletalFighter but adapts
 * coordinates for the offscreen canvas (no shadow, no danger pulse).
 */
function drawCachedSkeletalFrame(
  ctx: CanvasRenderingContext2D,
  p: Pose,
  prop: BodyProportions,
  widthFactor: number,
  heightFactor: number,
  f: Fighter,
  _sx: number,  // original screen x (unused in cached context — origin is at 0,0)
  _sy: number,  // original screen y
  globalTick: number,
  maxModeActive: boolean,
): void {
  const colorIdx = f.colorIndex;
  const charId = f.charId ?? 'unknown';

  const headW = prop.headW, headH = prop.headH;
  const torsoW = prop.torsoW * widthFactor, torsoH = prop.torsoH;
  const armW = prop.armW, armH = prop.armH;
  const legW = prop.legW, legH = prop.legH;

  // In cached context, (0,0) = feet center = (sx, sy) in original coords
  const sx = 0;
  const sy = 0;
  const bodyBottom = prop.hipY + prop.legH / 2;
  const refX = sx;
  const refY = sy - bodyBottom;

  const boneScreen = (bp: BonePose) => ({
    x: refX + bp.ox * f.facing,
    y: refY + bp.oy * heightFactor,
    rot: bp.rot * f.facing,
    scale: bp.scale,
  });

  const skinColor = '#e8b88a';

  // Hit flash overlay
  const isFlashing = f.hitFlashFrames > 0;

  const shoulderY = refY + prop.shoulderY * heightFactor;
  const hipY = refY + prop.hipY * heightFactor;

  // Layer order: back → body → front

  // 1. Back arm
  const backArm = boneScreen(p.armBack);
  ctx.save();
  ctx.translate(backArm.x, shoulderY + p.armBack.oy * heightFactor);
  ctx.rotate(backArm.rot);
  drawPixelArm(ctx, charId, armW * p.armBack.scale, armH * p.armBack.scale, true, colorIdx);
  ctx.restore();

  // 2. Back leg
  const backLeg = boneScreen(p.legBack);
  ctx.save();
  ctx.translate(backLeg.x, hipY + p.legBack.oy * heightFactor);
  ctx.rotate(backLeg.rot);
  drawPixelLeg(ctx, charId, legW * p.legBack.scale, legH * p.legBack.scale, true, colorIdx);
  ctx.restore();

  // 3. Torso
  const torsoCenterY = refY + prop.torsoCenterY * heightFactor + p.body.oy * heightFactor;
  const torsoX = refX + p.body.ox * f.facing;
  ctx.save();
  ctx.translate(torsoX, torsoCenterY);
  ctx.rotate(p.body.rot * f.facing);
  drawPixelTorso(ctx, charId, torsoW, torsoH * heightFactor, colorIdx);
  ctx.restore();

  // 4. Head
  const headPos = boneScreen(p.head);
  const headCenterY = refY + prop.headCenterY * heightFactor + p.head.oy * heightFactor;
  ctx.save();
  ctx.translate(headPos.x, headCenterY);
  ctx.rotate(p.head.rot * f.facing);
  drawCharacterHead(ctx, charId, f.facing, skinColor, headW, colorIdx, globalTick);
  ctx.restore();

  // 5. Front leg
  const frontLeg = boneScreen(p.legFront);
  ctx.save();
  ctx.translate(frontLeg.x, hipY + p.legFront.oy * heightFactor);
  ctx.rotate(frontLeg.rot);
  drawPixelLeg(ctx, charId, legW * p.legFront.scale, legH * p.legFront.scale, false, colorIdx);
  ctx.restore();

  // 6. Front arm
  const frontArm = boneScreen(p.armFront);
  ctx.save();
  ctx.translate(frontArm.x, shoulderY + p.armFront.oy * heightFactor);
  ctx.rotate(frontArm.rot);
  drawPixelArm(ctx, charId, armW * p.armFront.scale, armH * p.armFront.scale, false, colorIdx);
  ctx.restore();

  // === Joint balls (cached version — same logic as main render) ===
  const cJointR = Math.max(3, Math.min(4, armW * 0.18));
  const cJointColor = '#e8b88a';
  const cJointDark = shiftColor(cJointColor, -20);
  const cJointHL = shiftColor(cJointColor, 15);
  const drawCJoint = (jx: number, jy: number) => {
    ctx.fillStyle = cJointColor;
    ctx.beginPath(); ctx.arc(jx, jy, cJointR, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = cJointHL;
    ctx.beginPath(); ctx.arc(jx - cJointR * 0.2, jy - cJointR * 0.25, cJointR * 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = cJointDark;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(jx, jy, cJointR, 0, Math.PI * 2); ctx.stroke();
  };
  // Shoulders
  drawCJoint(torsoX - torsoW * 0.45 * f.facing, shoulderY);
  drawCJoint(torsoX + torsoW * 0.45 * f.facing, shoulderY);
  // Elbows
  const cBAMid = armH * p.armBack.scale * 0.3;
  drawCJoint(backArm.x + Math.sin(backArm.rot) * cBAMid, (shoulderY + p.armBack.oy * heightFactor) + Math.cos(backArm.rot) * cBAMid);
  const cFAMid = armH * p.armFront.scale * 0.3;
  drawCJoint(frontArm.x + Math.sin(frontArm.rot) * cFAMid, (shoulderY + p.armFront.oy * heightFactor) + Math.cos(frontArm.rot) * cFAMid);
  // Knees
  const cBLMid = legH * p.legBack.scale * 0.45;
  drawCJoint(backLeg.x + Math.sin(backLeg.rot) * cBLMid, (hipY + p.legBack.oy * heightFactor) + Math.cos(backLeg.rot) * cBLMid);
  const cFLMid = legH * p.legFront.scale * 0.45;
  drawCJoint(frontLeg.x + Math.sin(frontLeg.rot) * cFLMid, (hipY + p.legFront.oy * heightFactor) + Math.cos(frontLeg.rot) * cFLMid);
  // Ankles
  const cBLAnk = legH * p.legBack.scale * 0.85;
  drawCJoint(backLeg.x + Math.sin(backLeg.rot) * cBLAnk, (hipY + p.legBack.oy * heightFactor) + Math.cos(backLeg.rot) * cBLAnk);
  const cFLAnk = legH * p.legFront.scale * 0.85;
  drawCJoint(frontLeg.x + Math.sin(frontLeg.rot) * cFLAnk, (hipY + p.legFront.oy * heightFactor) + Math.cos(frontLeg.rot) * cFLAnk);
  // Hips
  drawCJoint(torsoX - torsoW * 0.25 * f.facing, hipY);
  drawCJoint(torsoX + torsoW * 0.25 * f.facing, hipY);

  // Hit flash overlay (simplified — no radial gradient for cache)
  if (isFlashing) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(torsoX, torsoCenterY, torsoW * 0.95, torsoH * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Fist glow during attacks
  if (!isFlashing && (f.state === FighterState.STAND_ATTACK || f.state === FighterState.CROUCH_ATTACK || f.state === FighterState.AIR_ATTACK)) {
    ctx.save();
    ctx.translate(frontArm.x, shoulderY + p.armFront.oy * heightFactor);
    ctx.rotate(frontArm.rot);
    const fistR = armW * 0.45;
    const fistY = armH * p.armFront.scale / 2 - 2;
    drawFistGlow(ctx, charId, fistR, fistY, globalTick);
    ctx.restore();
  }

  // MAX mode outline glow (simplified for cache)
  if (maxModeActive) {
    ctx.save();
    ctx.shadowColor = '#ffcc00';
    ctx.shadowBlur = 6;
    ctx.strokeStyle = 'rgba(255, 200, 60, 0.4)';
    ctx.lineWidth = 1.5;

    // Torso glow
    ctx.translate(torsoX, torsoCenterY);
    ctx.rotate(p.body.rot * f.facing);
    if (!isFlashing) {
      roundRect(ctx, -torsoW / 2, -torsoH * heightFactor / 2, torsoW, torsoH * heightFactor, 5);
      ctx.stroke();
    }
    ctx.restore();
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
