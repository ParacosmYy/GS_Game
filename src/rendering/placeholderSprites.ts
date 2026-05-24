/** 程序化像素精灵图生成器 — 生成KOF风格的像素角色精灵帧
 * 每帧用Canvas绘制像素风格角色, 比骨骼矩形更接近正版KOF外观
 * 支持按角色差异化体型/配色/发型
 */

import { FighterState } from '../core/types.js';
import type { SpriteAnimationMap, SpriteFrame } from './spriteRenderer.js';

const PW = 120;  // 帧宽度
const PH = 200;  // 帧高度
const PIXEL = 4; // 像素块大小 (模拟低分辨率像素感)

/** 角色视觉定义 */
interface CharVisual {
  hairColor: string;
  skinColor: string;
  shirtColor: string;
  pantsColor: string;
  shoeColor: string;
  beltColor: string;
  headW: number; // 头宽 (像素块数)
  bodyW: number;
  legLen: number;
  hairStyle: 'spiky' | 'long' | 'short' | 'ponytail' | 'wild';
}

const CHAR_VISUALS: Record<string, CharVisual> = {
  kyo: {
    hairColor: '#1a1a2e', skinColor: '#f5d0a9', shirtColor: '#ffffff',
    pantsColor: '#2a2a3a', shoeColor: '#8b4513', beltColor: '#4a3520',
    headW: 5, bodyW: 6, legLen: 6, hairStyle: 'spiky',
  },
  iori: {
    hairColor: '#c41e3a', skinColor: '#f5d0a9', shirtColor: '#1a1a2e',
    pantsColor: '#1a1a2e', shoeColor: '#2a2a3a', beltColor: '#8b0000',
    headW: 5, bodyW: 6, legLen: 6, hairStyle: 'wild',
  },
  terry: {
    hairColor: '#c4a000', skinColor: '#f5d0a9', shirtColor: '#2a5a8a',
    pantsColor: '#3a3a4a', shoeColor: '#6a3a1a', beltColor: '#3a3a3a',
    headW: 5, bodyW: 7, legLen: 6, hairStyle: 'short',
  },
  kim: {
    hairColor: '#1a1a1a', skinColor: '#f5d0a9', shirtColor: '#ffffff',
    pantsColor: '#ffffff', shoeColor: '#1a1a1a', beltColor: '#000000',
    headW: 5, bodyW: 5, legLen: 7, hairStyle: 'short',
  },
  ryo: {
    hairColor: '#2a1a0a', skinColor: '#f5d0a9', shirtColor: '#cc3333',
    pantsColor: '#1a1a3a', shoeColor: '#3a2a1a', beltColor: '#000000',
    headW: 5, bodyW: 7, legLen: 6, hairStyle: 'spiky',
  },
  leona: {
    hairColor: '#1a3a8a', skinColor: '#fce4c8', shirtColor: '#3a3a5a',
    pantsColor: '#2a2a4a', shoeColor: '#1a1a2a', beltColor: '#4a4a6a',
    headW: 4, bodyW: 5, legLen: 6, hairStyle: 'ponytail',
  },
  kdash: {
    hairColor: '#c0c0c0', skinColor: '#f5d0a9', shirtColor: '#1a1a2e',
    pantsColor: '#2a2a3a', shoeColor: '#4a4a4a', beltColor: '#c41e3a',
    headW: 5, bodyW: 6, legLen: 6, hairStyle: 'spiky',
  },
  kula: {
    hairColor: '#c4a060', skinColor: '#fce4c8', shirtColor: '#4a8aff',
    pantsColor: '#3a3a5a', shoeColor: '#4a4a6a', beltColor: '#6ab0ff',
    headW: 4, bodyW: 5, legLen: 5, hairStyle: 'long',
  },
};

function getDefaultVisual(): CharVisual {
  return CHAR_VISUALS.kyo;
}

/** 像素块绘制 */
function px(c: CanvasRenderingContext2D, bx: number, by: number, color: string): void {
  c.fillStyle = color;
  c.fillRect(bx * PIXEL, by * PIXEL, PIXEL, PIXEL);
}

/** 绘制像素角色帧 */
function drawPixelChar(
  c: CanvasRenderingContext2D, v: CharVisual,
  headOff: number, bodyLean: number, armLAngle: number, armRAngle: number,
  legLSpread: number, legRSpread: number, crouching: boolean,
): void {
  const scale = crouching ? 0.8 : 1;
  const baseY = crouching ? 15 : 8;
  const cx = Math.floor(PW / PIXEL / 2); // center X in pixel blocks

  // === 头部 ===
  const headY = baseY;
  const headX = cx + headOff;
  const hw = v.headW;
  const hh = hw;
  // 头轮廓
  for (let dy = 0; dy < hh; dy++) {
    for (let dx = -Math.floor(hw / 2); dx <= Math.floor(hw / 2); dx++) {
      // 椭圆裁剪
      const nx = dx / (hw / 2);
      const ny = dy / hh;
      if (nx * nx + (ny - 0.5) * (ny - 0.5) * 4 < 1) {
        px(c, headX + dx, headY + dy, v.skinColor);
      }
    }
  }
  // 发型
  drawHair(c, headX, headY, hw, v.hairColor, v.hairStyle);
  // 眼睛
  px(c, headX - 1, headY + Math.floor(hh / 2), '#1a1a1a');
  px(c, headX + 1, headY + Math.floor(hh / 2), '#1a1a1a');

  // === 躯干 ===
  const torsoY = headY + hh + 1;
  const bw = v.bodyW;
  const torsoH = crouching ? 5 : 7;
  const torsoX = cx + bodyLean;
  for (let dy = 0; dy < torsoH; dy++) {
    const w = dy < 2 ? bw : bw - 1; // 肩宽腰窄
    for (let dx = -Math.floor(w / 2); dx <= Math.floor(w / 2); dx++) {
      px(c, torsoX + dx, torsoY + dy, v.shirtColor);
    }
  }
  // 腰带
  for (let dx = -Math.floor(bw / 2); dx <= Math.floor(bw / 2); dx++) {
    px(c, torsoX + dx, torsoY + torsoH - 1, v.beltColor);
  }

  // === 手臂 ===
  const shoulderY = torsoY + 1;
  const armLen = 5;
  // 左臂
  drawArm(c, torsoX - Math.floor(bw / 2) - 1, shoulderY, armLAngle, armLen, v.skinColor);
  // 右臂
  drawArm(c, torsoX + Math.floor(bw / 2) + 1, shoulderY, armRAngle, armLen, v.skinColor);

  // === 腿部 ===
  const legY = torsoY + torsoH;
  const legLen = Math.floor(v.legLen * scale);
  drawLeg(c, torsoX - 1, legY, legLSpread, legLen, v.pantsColor, v.shoeColor);
  drawLeg(c, torsoX + 1, legY, legRSpread, legLen, v.pantsColor, v.shoeColor);
}

function drawArm(c: CanvasRenderingContext2D, sx: number, sy: number, angle: number, len: number, color: string): void {
  let x = sx, y = sy;
  for (let i = 0; i < len; i++) {
    x += Math.round(Math.sin(angle));
    y += Math.round(Math.cos(angle));
    px(c, x, y, color);
    px(c, x, y + 1, color); // 手臂2像素宽
  }
  // 拳头 (末端大一点)
  px(c, x, y - 1, color);
}

function drawLeg(c: CanvasRenderingContext2D, sx: number, sy: number, spread: number, len: number, pantsColor: string, shoeColor: string): void {
  let x = sx + spread, y = sy;
  for (let i = 0; i < len; i++) {
    y += 1;
    px(c, x, y, pantsColor);
    px(c, x + 1, y, pantsColor);
  }
  // 鞋子
  px(c, x - 1, y + 1, shoeColor);
  px(c, x, y + 1, shoeColor);
  px(c, x + 1, y + 1, shoeColor);
  px(c, x + 2, y + 1, shoeColor);
}

function drawHair(c: CanvasRenderingContext2D, hx: number, hy: number, hw: number, color: string, style: string): void {
  switch (style) {
    case 'spiky':
      // 尖刺向上
      px(c, hx, hy - 2, color);
      px(c, hx - 1, hy - 1, color);
      px(c, hx + 1, hy - 1, color);
      px(c, hx - 2, hy, color);
      px(c, hx + 2, hy, color);
      px(c, hx - 2, hy + 1, color);
      px(c, hx + 2, hy + 1, color);
      break;
    case 'wild':
      // 野性发型 (八神)
      px(c, hx, hy - 2, color);
      px(c, hx - 1, hy - 1, color);
      px(c, hx + 1, hy - 1, color);
      px(c, hx - 3, hy, color);
      px(c, hx + 3, hy, color);
      px(c, hx - 2, hy + 1, color);
      px(c, hx + 2, hy + 1, color);
      px(c, hx - 3, hy + 2, color);
      px(c, hx + 3, hy + 2, color);
      break;
    case 'long':
      // 长发 (Kula)
      for (let dy = -1; dy <= 3; dy++) {
        px(c, hx - Math.floor(hw / 2) - 1, hy + dy, color);
        px(c, hx + Math.floor(hw / 2) + 1, hy + dy, color);
      }
      px(c, hx, hy - 1, color);
      px(c, hx - 1, hy - 1, color);
      px(c, hx + 1, hy - 1, color);
      break;
    case 'ponytail':
      // 马尾 (Leona)
      px(c, hx, hy - 1, color);
      px(c, hx - 1, hy - 1, color);
      px(c, hx + 1, hy - 1, color);
      for (let dy = 0; dy < 4; dy++) {
        px(c, hx + Math.floor(hw / 2) + 1 + dy, hy + dy, color);
        px(c, hx + Math.floor(hw / 2) + 2 + dy, hy + dy, color);
      }
      break;
    case 'short':
      // 短发 (Terry/Kim)
      px(c, hx, hy - 1, color);
      px(c, hx - 1, hy - 1, color);
      px(c, hx + 1, hy - 1, color);
      px(c, hx - 2, hy, color);
      px(c, hx + 2, hy, color);
      break;
  }
}

/** 姿态定义 */
interface Pose {
  headOff: number; bodyLean: number; armL: number; armR: number; legL: number; legR: number; crouch: boolean;
}

const IDLE_POSES: Pose[] = [
  { headOff: 0, bodyLean: 0, armL: 0.3, armR: -0.3, legL: -1, legR: 1, crouch: false },
  { headOff: 0, bodyLean: 0, armL: 0.35, armR: -0.25, legL: -1, legR: 1, crouch: false },
  { headOff: 0, bodyLean: 0, armL: 0.3, armR: -0.3, legL: -1, legR: 1, crouch: false },
  { headOff: 0, bodyLean: 0, armL: 0.25, armR: -0.35, legL: -1, legR: 1, crouch: false },
];
const WALK_POSES: Pose[] = [
  { headOff: 0, bodyLean: 1, armL: 0.5, armR: -0.1, legL: -2, legR: 2, crouch: false },
  { headOff: 0, bodyLean: 0, armL: 0.3, armR: -0.3, legL: 0, legR: 0, crouch: false },
  { headOff: 0, bodyLean: -1, armL: 0.1, armR: -0.5, legL: 2, legR: -2, crouch: false },
  { headOff: 0, bodyLean: 0, armL: 0.3, armR: -0.3, legL: 0, legR: 0, crouch: false },
];
const ATTACK_POSES: Pose[] = [
  { headOff: 1, bodyLean: 2, armL: 0.4, armR: -1.5, legL: -1, legR: 2, crouch: false },
  { headOff: 1, bodyLean: 3, armL: 0.3, armR: -1.8, legL: -1, legR: 2, crouch: false },
  { headOff: 0, bodyLean: 1, armL: 0.4, armR: -0.5, legL: -1, legR: 1, crouch: false },
  { headOff: 0, bodyLean: 0, armL: 0.3, armR: -0.3, legL: -1, legR: 1, crouch: false },
];
const CROUCH_POSES: Pose[] = [
  { headOff: 0, bodyLean: 0, armL: 0.4, armR: -0.4, legL: -2, legR: 2, crouch: true },
  { headOff: 0, bodyLean: 0, armL: 0.45, armR: -0.35, legL: -2, legR: 2, crouch: true },
  { headOff: 0, bodyLean: 0, armL: 0.4, armR: -0.4, legL: -2, legR: 2, crouch: true },
  { headOff: 0, bodyLean: 0, armL: 0.35, armR: -0.45, legL: -2, legR: 2, crouch: true },
];
const JUMP_POSES: Pose[] = [
  { headOff: 0, bodyLean: 0, armL: -0.5, armR: 0.5, legL: -1, legR: 1, crouch: false },
  { headOff: 0, bodyLean: 0, armL: -0.8, armR: 0.8, legL: 1, legR: -1, crouch: false },
  { headOff: 0, bodyLean: 0, armL: -0.3, armR: 0.3, legL: 0, legR: 0, crouch: false },
  { headOff: 0, bodyLean: 0, armL: 0, armR: 0, legL: -1, legR: 1, crouch: false },
];
const HIT_POSES: Pose[] = [
  { headOff: -1, bodyLean: -2, armL: 0.8, armR: 0.6, legL: 0, legR: 0, crouch: false },
  { headOff: -1, bodyLean: -3, armL: 1, armR: 0.8, legL: -1, legR: 1, crouch: false },
  { headOff: -2, bodyLean: -2, armL: 0.6, armR: 0.4, legL: 0, legR: 0, crouch: false },
  { headOff: -1, bodyLean: -1, armL: 0.4, armR: 0.3, legL: 0, legR: 0, crouch: false },
];
const BLOCK_POSES: Pose[] = [
  { headOff: -1, bodyLean: -1, armL: -0.8, armR: -0.8, legL: -1, legR: 1, crouch: false },
  { headOff: -1, bodyLean: -1, armL: -0.7, armR: -0.9, legL: -1, legR: 1, crouch: false },
  { headOff: -1, bodyLean: -1, armL: -0.8, armR: -0.8, legL: -1, legR: 1, crouch: false },
  { headOff: -1, bodyLean: -1, armL: -0.9, armR: -0.7, legL: -1, legR: 1, crouch: false },
];

/** KO倒地帧 — 单独绘制 */
function drawKO(c: CanvasRenderingContext2D, v: CharVisual): void {
  const cy = Math.floor(PH / PIXEL) - 6;
  const cx = Math.floor(PW / PIXEL / 2);
  // 横躺身体
  for (let dx = -6; dx <= 6; dx++) {
    px(c, cx + dx, cy, v.shirtColor);
    px(c, cx + dx, cy + 1, v.shirtColor);
  }
  // 头
  px(c, cx - 7, cy - 1, v.skinColor);
  px(c, cx - 7, cy, v.skinColor);
  px(c, cx - 8, cy - 1, v.hairColor);
  // 腿
  for (let dx = 7; dx <= 10; dx++) {
    px(c, cx + dx, cy, v.pantsColor);
    px(c, cx + dx, cy + 1, v.pantsColor);
  }
}

type PoseSet = 'idle' | 'walk' | 'attack' | 'crouch' | 'jump' | 'hit' | 'block';

function stateToPoseSet(state: FighterState): PoseSet {
  switch (state) {
    case FighterState.WALK: case FighterState.RUN: return 'walk';
    case FighterState.STAND_ATTACK: case FighterState.CROUCH_ATTACK:
    case FighterState.AIR_ATTACK: case FighterState.THROW:
    case FighterState.COUNTER_STANCE: case FighterState.MAX_MODE: return 'attack';
    case FighterState.CROUCH: case FighterState.ROLL: case FighterState.BACK_ROLL: return 'crouch';
    case FighterState.JUMP: case FighterState.HOP: case FighterState.RUN_JUMP:
    case FighterState.HYPER_JUMP: case FighterState.BACKDASH: return 'jump';
    case FighterState.HITSTUN: case FighterState.GUARD_CRUSH: return 'hit';
    case FighterState.BLOCK: case FighterState.AIR_BLOCK: return 'block';
    case FighterState.KNOCKDOWN: return 'hit';
    default: return 'idle';
  }
}

const POSE_MAP: Record<PoseSet, Pose[]> = {
  idle: IDLE_POSES, walk: WALK_POSES, attack: ATTACK_POSES,
  crouch: CROUCH_POSES, jump: JUMP_POSES, hit: HIT_POSES, block: BLOCK_POSES,
};

/** 生成角色精灵图集 — 返回Image + AnimationMap */
export function generatePlaceholderSpritesheet(color: string, charId: string): {
  image: HTMLImageElement;
  animations: SpriteAnimationMap;
} {
  const v = CHAR_VISUALS[charId] ?? getDefaultVisual();
  // 用角色配色覆盖
  v.shirtColor = color;

  const poseSets: PoseSet[] = ['idle', 'walk', 'attack', 'crouch', 'jump', 'hit', 'block'];
  const framesPerSet = 4;
  const cols = poseSets.length;
  const atlasW = PW * cols;
  const atlasH = PH * 2; // 上半部正常帧, 下半部KO帧

  const atlas = document.createElement('canvas');
  atlas.width = atlasW;
  atlas.height = atlasH;
  const actx = atlas.getContext('2d')!;

  // 绘制各姿态帧
  poseSets.forEach((set, col) => {
    const poses = POSE_MAP[set];
    poses.forEach((pose, f) => {
      const frame = document.createElement('canvas');
      frame.width = PW;
      frame.height = PH;
      const fc = frame.getContext('2d')!;
      // 关闭抗锯齿保持像素感
      fc.imageSmoothingEnabled = false;
      drawPixelChar(fc, { ...v }, pose.headOff, pose.bodyLean, pose.armL, pose.armR, pose.legL, pose.legR, pose.crouch);
      actx.drawImage(frame, col * PW + (f % 2), 0);
    });
  });

  // KO帧在下半部
  const koFrame = document.createElement('canvas');
  koFrame.width = PW;
  koFrame.height = PH;
  const kc = koFrame.getContext('2d')!;
  drawKO(kc, v);
  actx.drawImage(koFrame, 0, PH);

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
    FighterState.HITSTUN, FighterState.BACKDASH,
  ];

  const animations: SpriteAnimationMap = {};
  for (const state of allStates) {
    const set = stateToPoseSet(state);
    const col = poseSets.indexOf(set);
    const frames: SpriteFrame[] = [];
    for (let f = 0; f < framesPerSet; f++) {
      frames.push({
        sx: col * PW + (f % 2),
        sy: 0,
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
    sx: 0, sy: PH, sw: PW, sh: PH, ox: -PW / 2, oy: -PH,
  }];

  return { image, animations };
}
