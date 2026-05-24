/** 占位精灵图生成器 — 在没有真实精灵图时生成更好看的角色剪影
 * 比骨骼矩形更接近最终效果, 过渡期使用
 */

import { FighterState } from '../core/types.js';
import type { SpriteAnimationMap, SpriteFrame } from './spriteRenderer.js';

const PW = 120;  // 占位帧宽度
const PH = 200;  // 占位帧高度

/** 为指定颜色生成角色剪影帧 */
function generateSilhouette(color: string, variant: 'idle' | 'walk' | 'attack' | 'crouch' | 'jump' | 'hit' | 'block' | 'ko'): HTMLCanvasElement {
  const cvs = document.createElement('canvas');
  cvs.width = PW;
  cvs.height = PH;
  const c = cvs.getContext('2d')!;

  // 身体基础轮廓
  const drawBody = (headY: number, torsoY: number, armAngle: number, legSpread: number) => {
    c.save();
    c.fillStyle = color;
    c.strokeStyle = '#000';
    c.lineWidth = 2;

    // 头部
    c.beginPath();
    c.arc(PW / 2, headY, 22, 0, Math.PI * 2);
    c.fill();
    c.stroke();

    // 躯干
    c.fillRect(PW / 2 - 18, torsoY, 36, 60);
    c.strokeRect(PW / 2 - 18, torsoY, 36, 60);

    // 左臂
    c.save();
    c.translate(PW / 2 - 18, torsoY + 8);
    c.rotate(armAngle);
    c.fillRect(-6, 0, 12, 45);
    c.strokeRect(-6, 0, 12, 45);
    c.restore();

    // 右臂
    c.save();
    c.translate(PW / 2 + 18, torsoY + 8);
    c.rotate(-armAngle);
    c.fillRect(-6, 0, 12, 45);
    c.strokeRect(-6, 0, 12, 45);
    c.restore();

    // 左腿
    c.fillRect(PW / 2 - 15 - legSpread, torsoY + 60, 14, 55);
    c.strokeRect(PW / 2 - 15 - legSpread, torsoY + 60, 14, 55);

    // 右腿
    c.fillRect(PW / 2 + 1 + legSpread, torsoY + 60, 14, 55);
    c.strokeRect(PW / 2 + 1 + legSpread, torsoY + 60, 14, 55);

    c.restore();
  };

  switch (variant) {
    case 'idle':
      drawBody(30, 55, 0.2, 0);
      break;
    case 'walk':
      drawBody(32, 57, 0.3, 5);
      break;
    case 'attack':
      drawBody(30, 55, -1.2, 0);
      // 攻击手臂延伸
      c.fillStyle = '#fff8';
      c.fillRect(PW / 2 + 24, 50, 40, 14);
      break;
    case 'crouch':
      drawBody(80, 100, 0.3, 12);
      break;
    case 'jump':
      drawBody(20, 45, -0.5, 8);
      break;
    case 'hit':
      drawBody(35, 60, 0.8, 2);
      break;
    case 'block':
      drawBody(32, 57, -0.6, 0);
      c.fillStyle = '#aaccff44';
      c.fillRect(PW / 2 - 30, 40, 60, 120);
      break;
    case 'ko':
      // 倒地
      c.fillStyle = color;
      c.fillRect(10, 170, 100, 24);
      c.strokeStyle = '#000';
      c.lineWidth = 2;
      c.strokeRect(10, 170, 100, 24);
      c.beginPath();
      c.arc(90, 170, 18, 0, Math.PI * 2);
      c.fill();
      c.stroke();
      break;
  }

  return cvs;
}

/** 将状态映射到占位精灵变体 */
function stateToVariant(state: FighterState): 'idle' | 'walk' | 'attack' | 'crouch' | 'jump' | 'hit' | 'block' | 'ko' {
  switch (state) {
    case FighterState.WALK:
    case FighterState.RUN:
      return 'walk';
    case FighterState.STAND_ATTACK:
    case FighterState.CROUCH_ATTACK:
    case FighterState.AIR_ATTACK:
    case FighterState.THROW:
    case FighterState.COUNTER_STANCE:
    case FighterState.MAX_MODE:
      return 'attack';
    case FighterState.CROUCH:
      return 'crouch';
    case FighterState.JUMP:
    case FighterState.HOP:
    case FighterState.RUN_JUMP:
    case FighterState.HYPER_JUMP:
      return 'jump';
    case FighterState.HITSTUN:
    case FighterState.KNOCKDOWN:
      return 'hit';
    case FighterState.BLOCK:
    case FighterState.AIR_BLOCK:
      return 'block';
    case FighterState.GUARD_CRUSH:
      return 'hit';
    case FighterState.ROLL:
    case FighterState.BACK_ROLL:
      return 'crouch';
    case FighterState.BACKDASH:
      return 'jump';
    default:
      return 'idle';
  }
}

/** 生成占位精灵图集 — 返回Image + AnimationMap */
export function generatePlaceholderSpritesheet(color: string, charId: string): {
  image: HTMLImageElement;
  animations: SpriteAnimationMap;
} {
  const variants: Array<'idle' | 'walk' | 'attack' | 'crouch' | 'jump' | 'hit' | 'block' | 'ko'> =
    ['idle', 'walk', 'attack', 'crouch', 'jump', 'hit', 'block', 'ko'];
  const framesPerVariant = 4;
  const cols = variants.length;
  const rows = 1;

  // 创建精灵图集
  const atlas = document.createElement('canvas');
  atlas.width = PW * cols;
  atlas.height = PH * rows;
  const actx = atlas.getContext('2d')!;

  // 每种变体的帧数据
  const variantFrames = new Map<string, SpriteFrame[]>();

  variants.forEach((variant, col) => {
    const frame = generateSilhouette(color, variant);
    // 微小的帧偏移模拟呼吸/晃动
    const frames: SpriteFrame[] = [];
    for (let f = 0; f < framesPerVariant; f++) {
      const offsetX = (f % 2 === 0 ? 0 : 1) * (variant === 'idle' ? 1 : 0);
      actx.drawImage(frame, col * PW + offsetX, 0);
      frames.push({
        sx: col * PW + offsetX,
        sy: 0,
        sw: PW,
        sh: PH,
        ox: -PW / 2,
        oy: -PH,
      });
    }
    variantFrames.set(variant, frames);
  });

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
    FighterState.HITSTUN, FighterState.KNOCKDOWN, FighterState.BACKDASH,
  ];

  const animations: SpriteAnimationMap = {};
  for (const state of allStates) {
    const variant = stateToVariant(state);
    const frames = variantFrames.get(variant);
    if (frames) {
      animations[state] = frames;
    }
  }

  return { image, animations };
}
