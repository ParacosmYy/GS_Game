/** 程序化像素精灵图生成器 — 生成KOF风格的像素角色精灵帧
 * 每帧用Canvas绘制像素风格角色, 比骨骼矩形更接近正版KOF外观
 * 支持按角色差异化体型/配色/发型
 */

import { FighterState } from '../core/types.js';
import type { SpriteAnimationMap, SpriteFrame } from './spriteRenderer.js';
import {
  PW, PH,
  CHAR_VISUALS, getDefaultVisual,
  type Pose,
  WALK_POSES, ATTACK_POSES, CROUCH_ATTACK_POSES, AIR_ATTACK_POSES,
  THROW_POSES, CROUCH_POSES,
  getIdlePoses, getRunPoses, getJumpPoses, getHitPoses, getBlockPoses,
} from './spritePoseData.js';
import { drawPixelChar, drawKO } from './spriteDrawing.js';

type PoseSet = 'idle' | 'walk' | 'run' | 'attack' | 'crouch_attack' | 'air_attack' | 'throw' | 'crouch' | 'jump' | 'hit' | 'block';

function stateToPoseSet(state: FighterState): PoseSet {
  switch (state) {
    case FighterState.WALK: return 'walk';
    case FighterState.RUN: return 'run';
    case FighterState.CROUCH_ATTACK: return 'crouch_attack';
    case FighterState.AIR_ATTACK: return 'air_attack';
    case FighterState.THROW: return 'throw';
    case FighterState.STAND_ATTACK: case FighterState.COUNTER_STANCE:
    case FighterState.MAX_MODE: return 'attack';
    case FighterState.CROUCH: case FighterState.ROLL: case FighterState.BACK_ROLL: return 'crouch';
    case FighterState.JUMP: case FighterState.HOP: case FighterState.RUN_JUMP:
    case FighterState.HYPER_JUMP: case FighterState.BACKDASH: return 'jump';
    case FighterState.HITSTUN: case FighterState.GUARD_CRUSH: case FighterState.DIZZY: return 'hit';
    case FighterState.BLOCK: case FighterState.AIR_BLOCK: return 'block';
    case FighterState.KNOCKDOWN: return 'hit';
    default: return 'idle';
  }
}

/** 生成角色精灵图集 — 返回Image + AnimationMap
 * 图集布局: 每行一个PoseSet, 每行帧数可变
 * 最后一行是KO帧
 */
export function generatePlaceholderSpritesheet(color: string, charId: string): {
  image: HTMLImageElement;
  animations: SpriteAnimationMap;
} {
  const v = { ...(CHAR_VISUALS[charId] ?? getDefaultVisual()) };
  if (charId === 'ryo') {
    v.shirtColor = '#f4f1e8';
    v.pantsColor = '#ddd6c5';
    v.beltColor = '#111111';
    v.shoeColor = '#3a2a1a';
  } else {
    v.shirtColor = color;
  }

  // 使用角色专属待机/跑步/跳跃/受击/防御姿态
  const idlePoses = getIdlePoses(v.idleStyle);
  const runPoses = getRunPoses(v.idleStyle);
  const jumpPoses = getJumpPoses(v.idleStyle);
  const hitPoses = getHitPoses(v.idleStyle);
  const blockPoses = getBlockPoses(v.idleStyle);
  const POSE_MAP_LOCAL: Record<PoseSet, Pose[]> = {
    idle: idlePoses, walk: WALK_POSES, run: runPoses, attack: ATTACK_POSES,
    crouch_attack: CROUCH_ATTACK_POSES, air_attack: AIR_ATTACK_POSES, throw: THROW_POSES,
    crouch: CROUCH_POSES, jump: jumpPoses, hit: hitPoses, block: blockPoses,
  };

  const poseSets: PoseSet[] = ['idle', 'walk', 'run', 'attack', 'crouch_attack', 'air_attack', 'throw', 'crouch', 'jump', 'hit', 'block'];

  // 计算图集尺寸
  let maxFrames = 0;
  for (const set of poseSets) {
    maxFrames = Math.max(maxFrames, POSE_MAP_LOCAL[set].length);
  }
  const atlasW = PW * maxFrames;
  const atlasH = PH * (poseSets.length + 1);

  const atlas = document.createElement('canvas');
  atlas.width = atlasW;
  atlas.height = atlasH;
  const actx = atlas.getContext('2d')!;

  // 绘制各姿态帧 — 每行一个PoseSet
  const rowMap = new Map<PoseSet, number>();
  poseSets.forEach((set, row) => {
    rowMap.set(set, row);
    const poses = POSE_MAP_LOCAL[set];
    poses.forEach((pose, f) => {
      const frame = document.createElement('canvas');
      frame.width = PW;
      frame.height = PH;
      const fc = frame.getContext('2d')!;
      fc.imageSmoothingEnabled = false;
      drawPixelChar(fc, { ...v }, pose.headOff, pose.bodyLean, pose.armL, pose.armR, pose.legL, pose.legR, pose.crouch, charId);
      actx.drawImage(frame, f * PW, row * PH);
    });
  });

  // KO帧在最后一行
  const koRow = poseSets.length;
  const koFrame = document.createElement('canvas');
  koFrame.width = PW;
  koFrame.height = PH;
  const kc = koFrame.getContext('2d')!;
  drawKO(kc, v);
  actx.drawImage(koFrame, 0, koRow * PH);

  const image = new Image();
  image.src = atlas.toDataURL();

  // 构建动画映射
  const allStates: FighterState[] = [
    FighterState.IDLE, FighterState.WALK, FighterState.RUN,
    FighterState.JUMP, FighterState.HOP, FighterState.RUN_JUMP, FighterState.HYPER_JUMP,
    FighterState.CROUCH, FighterState.ROLL, FighterState.BACK_ROLL,
    FighterState.STAND_ATTACK, FighterState.CROUCH_ATTACK, FighterState.AIR_ATTACK,
    FighterState.COUNTER_STANCE, FighterState.THROW, FighterState.MAX_MODE,
    FighterState.BLOCK, FighterState.AIR_BLOCK, FighterState.GUARD_CRUSH,
    FighterState.HITSTUN, FighterState.BACKDASH, FighterState.DIZZY,
  ];

  const animations: SpriteAnimationMap = {};
  for (const state of allStates) {
    const set = stateToPoseSet(state);
    const row = rowMap.get(set)!;
    const poseCount = POSE_MAP_LOCAL[set].length;
    const frames: SpriteFrame[] = [];
    for (let f = 0; f < poseCount; f++) {
      frames.push({
        sx: f * PW,
        sy: row * PH,
        sw: PW,
        sh: PH,
        ox: -PW / 2,
        oy: -PH,
      });
    }
    animations[state] = frames;
  }
  // KO特殊帧
  animations[FighterState.KNOCKDOWN] = [{
    sx: 0, sy: koRow * PH, sw: PW, sh: PH, ox: -PW / 2, oy: -PH,
  }];

  return { image, animations };
}
