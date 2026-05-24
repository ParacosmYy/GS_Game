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

/** 描边像素块 — 在指定像素周围画深色描边 */
function pxOutline(c: CanvasRenderingContext2D, bx: number, by: number, outlineColor: string): void {
  const oc = outlineColor;
  px(c, bx - 1, by, oc); px(c, bx + 1, by, oc);
  px(c, bx, by - 1, oc); px(c, bx, by + 1, oc);
}

/** 深色变体 — 用于角色描边和阴影 */
function darken(hex: string, amount: number = 0.35): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const dr = Math.max(0, Math.floor(r * (1 - amount)));
  const dg = Math.max(0, Math.floor(g * (1 - amount)));
  const db = Math.max(0, Math.floor(b * (1 - amount)));
  return `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`;
}

/** 亮色变体 — 用于上方光照高光 */
function lighten(hex: string, amount: number = 0.3): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const lr = Math.min(255, Math.floor(r + (255 - r) * amount));
  const lg = Math.min(255, Math.floor(g + (255 - g) * amount));
  const lb = Math.min(255, Math.floor(b + (255 - b) * amount));
  return `#${lr.toString(16).padStart(2, '0')}${lg.toString(16).padStart(2, '0')}${lb.toString(16).padStart(2, '0')}`;
}

/** 绘制像素角色帧 — 带描边和精细身体部位 */
function drawPixelChar(
  c: CanvasRenderingContext2D, v: CharVisual,
  headOff: number, bodyLean: number, armLAngle: number, armRAngle: number,
  legLSpread: number, legRSpread: number, crouching: boolean,
): void {
  const scale = crouching ? 0.8 : 1;
  const baseY = crouching ? 15 : 8;
  const cx = Math.floor(PW / PIXEL / 2);
  const skinDark = darken(v.skinColor, 0.2);
  const shirtDark = darken(v.shirtColor, 0.3);
  const pantsDark = darken(v.pantsColor, 0.3);
  const shirtLight = lighten(v.shirtColor, 0.2);
  const hairLight = lighten(v.hairColor, 0.25);

  // === 头部 ===
  const headY = baseY;
  const headX = cx + headOff;
  const hw = v.headW;
  const hh = hw;
  // 头部描边
  for (let dy = -1; dy <= hh; dy++) {
    for (let dx = -Math.floor(hw / 2) - 1; dx <= Math.floor(hw / 2) + 1; dx++) {
      const nx = dx / (hw / 2 + 0.5);
      const ny = (dy - 0.5) / (hh + 1);
      if (nx * nx + (ny - 0.5) * (ny - 0.5) * 4 < 1) {
        const inx = dx / (hw / 2);
        const iny = dy / hh;
        const inside = inx * inx + (iny - 0.5) * (iny - 0.5) * 4 < 1;
        if (!inside) px(c, headX + dx, headY + dy, darken(v.hairColor, 0.3));
      }
    }
  }
  // 头部填充 — 上方光照: 顶部行用亮色
  for (let dy = 0; dy < hh; dy++) {
    for (let dx = -Math.floor(hw / 2); dx <= Math.floor(hw / 2); dx++) {
      const nx = dx / (hw / 2);
      const ny = dy / hh;
      if (nx * nx + (ny - 0.5) * (ny - 0.5) * 4 < 1) {
        // 上方1-2行用亮色模拟光照
        const color = dy < 2 ? lighten(v.skinColor, 0.15) : v.skinColor;
        px(c, headX + dx, headY + dy, color);
      }
    }
  }
  // 发型
  drawHair(c, headX, headY, hw, v.hairColor, v.hairStyle);
  // 眼睛 — 更大更清晰
  px(c, headX - 1, headY + Math.floor(hh / 2), '#ffffff');
  px(c, headX + 1, headY + Math.floor(hh / 2), '#ffffff');
  px(c, headX - 1, headY + Math.floor(hh / 2) + 1, '#1a1a1a');
  px(c, headX + 1, headY + Math.floor(hh / 2) + 1, '#1a1a1a');
  // 嘴巴
  if (hh > 4) px(c, headX, headY + hh - 1, skinDark);

  // === 躯干 — 带衣领和描边 ===
  const torsoY = headY + hh + 1;
  const bw = v.bodyW;
  const torsoH = crouching ? 5 : 7;
  const torsoX = cx + bodyLean;
  // 描边
  for (let dy = 0; dy < torsoH; dy++) {
    const w = dy < 2 ? bw : bw - 1;
    const left = torsoX - Math.floor(w / 2);
    const right = torsoX + Math.floor(w / 2);
    px(c, left - 1, torsoY + dy, shirtDark);
    px(c, right + 1, torsoY + dy, shirtDark);
  }
  px(c, torsoX - Math.floor(bw / 2), torsoY - 1, shirtDark);
  px(c, torsoX + Math.floor(bw / 2), torsoY - 1, shirtDark);
  // 填充 — 上方光照: 肩部行用亮色
  for (let dy = 0; dy < torsoH; dy++) {
    const w = dy < 2 ? bw : bw - 1;
    for (let dx = -Math.floor(w / 2); dx <= Math.floor(w / 2); dx++) {
      if (dy < 2 && Math.abs(dx) < 1) {
        px(c, torsoX + dx, torsoY + dy, v.skinColor);
      } else if (dy === 0) {
        // 最顶行用亮色模拟光照
        px(c, torsoX + dx, torsoY + dy, shirtLight);
      } else {
        px(c, torsoX + dx, torsoY + dy, v.shirtColor);
      }
    }
  }
  // 衣服阴影(右侧)
  for (let dy = 1; dy < torsoH - 1; dy++) {
    const w = dy < 2 ? bw : bw - 1;
    px(c, torsoX + Math.floor(w / 2), torsoY + dy, shirtDark);
  }
  // 腰带
  for (let dx = -Math.floor((bw - 1) / 2); dx <= Math.floor((bw - 1) / 2); dx++) {
    px(c, torsoX + dx, torsoY + torsoH - 1, v.beltColor);
  }

  // === 手臂 — 带拳头和描边 ===
  const shoulderY = torsoY + 1;
  const armLen = 5;
  drawArm(c, torsoX - Math.floor(bw / 2) - 1, shoulderY, armLAngle, armLen, v.skinColor, skinDark);
  drawArm(c, torsoX + Math.floor(bw / 2) + 1, shoulderY, armRAngle, armLen, v.skinColor, skinDark);

  // === 腿部 — 带描边 ===
  const legY = torsoY + torsoH;
  const legLen = Math.floor(v.legLen * scale);
  drawLeg(c, torsoX - 1, legY, legLSpread, legLen, v.pantsColor, v.shoeColor, pantsDark);
  drawLeg(c, torsoX + 1, legY, legRSpread, legLen, v.pantsColor, v.shoeColor, pantsDark);

  // === 地面阴影 — 简单暗色像素行 ===
  const shadowY = legY + legLen + 2;
  const shadowW = Math.max(v.bodyW + 2, 8);
  const shadowColor = '#1a1a1a';
  const shadowEdge = '#2a2a2a';
  for (let dx = -Math.floor(shadowW / 2); dx <= Math.floor(shadowW / 2); dx++) {
    const sx = cx + dx;
    px(c, sx, shadowY, Math.abs(dx) >= Math.floor(shadowW / 2) ? shadowEdge : shadowColor);
  }
}

function drawArm(c: CanvasRenderingContext2D, sx: number, sy: number, angle: number, len: number, color: string, outlineColor: string): void {
  let x = sx, y = sy;
  const points: [number, number][] = [];
  for (let i = 0; i < len; i++) {
    x += Math.round(Math.sin(angle));
    y += Math.round(Math.cos(angle));
    points.push([x, y]);
  }
  // 描边
  for (const [px2, py2] of points) {
    px(c, px2 - 1, py2, outlineColor);
    px(c, px2 + 1, py2 + 1, outlineColor);
  }
  // 填充手臂(2像素宽)
  for (const [px2, py2] of points) {
    px(c, px2, py2, color);
    px(c, px2, py2 + 1, color);
  }
  // 拳头 — 更大的3x2块
  const fx = points[points.length - 1][0];
  const fy = points[points.length - 1][1];
  px(c, fx - 1, fy - 1, outlineColor);
  px(c, fx, fy - 1, outlineColor);
  px(c, fx + 1, fy - 1, outlineColor);
  px(c, fx - 1, fy - 1, color);
  px(c, fx, fy - 1, color);
  px(c, fx + 1, fy - 1, color);
  px(c, fx - 1, fy, color);
  px(c, fx + 1, fy, color);
}

function drawLeg(c: CanvasRenderingContext2D, sx: number, sy: number, spread: number, len: number, pantsColor: string, shoeColor: string, outlineColor: string): void {
  let x = sx + spread, y = sy;
  // 描边
  for (let i = 0; i < len; i++) {
    y += 1;
    px(c, x - 1, y, outlineColor);
    px(c, x + 2, y, outlineColor);
  }
  // 填充
  y = sy;
  x = sx + spread;
  for (let i = 0; i < len; i++) {
    y += 1;
    px(c, x, y, pantsColor);
    px(c, x + 1, y, pantsColor);
    // 右侧阴影
    if (i > 1) px(c, x + 1, y, outlineColor);
  }
  // 鞋子 — 带描边
  const shoeDark = darken(shoeColor, 0.3);
  px(c, x - 1, y + 1, shoeDark);
  px(c, x, y + 1, shoeColor);
  px(c, x + 1, y + 1, shoeColor);
  px(c, x + 2, y + 1, shoeDark);
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
  { headOff: 0, bodyLean: 0, armL: 0.32, armR: -0.28, legL: -1, legR: 1, crouch: false },
  { headOff: 0, bodyLean: 0, armL: 0.35, armR: -0.25, legL: -1, legR: 1, crouch: false },
  { headOff: 0, bodyLean: 0, armL: 0.36, armR: -0.24, legL: -1, legR: 1, crouch: false },
  { headOff: 0, bodyLean: 0, armL: 0.35, armR: -0.25, legL: -1, legR: 1, crouch: false },
  { headOff: 0, bodyLean: 0, armL: 0.32, armR: -0.28, legL: -1, legR: 1, crouch: false },
  { headOff: 0, bodyLean: 0, armL: 0.28, armR: -0.32, legL: -1, legR: 1, crouch: false },
  { headOff: 0, bodyLean: 0, armL: 0.25, armR: -0.35, legL: -1, legR: 1, crouch: false },
];
const WALK_POSES: Pose[] = [
  { headOff: 0, bodyLean: 1, armL: 0.5, armR: -0.1, legL: -2, legR: 2, crouch: false },
  { headOff: 0, bodyLean: 0.5, armL: 0.4, armR: -0.2, legL: -1, legR: 1, crouch: false },
  { headOff: 0, bodyLean: 0, armL: 0.3, armR: -0.3, legL: 0, legR: 0, crouch: false },
  { headOff: 0, bodyLean: -0.5, armL: 0.2, armR: -0.4, legL: 1, legR: -1, crouch: false },
  { headOff: 0, bodyLean: -1, armL: 0.1, armR: -0.5, legL: 2, legR: -2, crouch: false },
  { headOff: 0, bodyLean: -0.5, armL: 0.2, armR: -0.4, legL: 1, legR: -1, crouch: false },
];
const ATTACK_POSES: Pose[] = [
  // startup: 拳收回准备
  { headOff: 0, bodyLean: -1, armL: 0.3, armR: 0.5, legL: -1, legR: 1, crouch: false },
  // active: 拳全力伸出
  { headOff: 1, bodyLean: 3, armL: 0.4, armR: -1.8, legL: -1, legR: 2, crouch: false },
  // recovery: 手臂开始收回
  { headOff: 0, bodyLean: 1, armL: 0.3, armR: -0.8, legL: -1, legR: 1, crouch: false },
  // end: 回到待机
  { headOff: 0, bodyLean: 0, armL: 0.3, armR: -0.3, legL: -1, legR: 1, crouch: false },
];
// 蹲攻击 — 身体压低, 手臂向下或水平
const CROUCH_ATTACK_POSES: Pose[] = [
  { headOff: 0, bodyLean: -1, armL: 0.3, armR: 0.3, legL: -3, legR: 3, crouch: true },
  { headOff: 1, bodyLean: 2, armL: 0.4, armR: -1.5, legL: -3, legR: 3, crouch: true },
  { headOff: 0, bodyLean: 1, armL: 0.3, armR: -0.6, legL: -3, legR: 3, crouch: true },
  { headOff: 0, bodyLean: 0, armL: 0.3, armR: -0.3, legL: -2, legR: 2, crouch: true },
];
// 空中攻击 — 身体前倾, 手臂向下或水平
const AIR_ATTACK_POSES: Pose[] = [
  { headOff: 0, bodyLean: 1, armL: -0.3, armR: 0.3, legL: 1, legR: -1, crouch: false },
  { headOff: 1, bodyLean: 2, armL: 0.2, armR: -1.2, legL: 0, legR: 2, crouch: false },
  { headOff: 0, bodyLean: 1, armL: 0.1, armR: -0.5, legL: -1, legR: 1, crouch: false },
  { headOff: 0, bodyLean: 0, armL: 0, armR: 0, legL: 0, legR: 0, crouch: false },
];
// 投技 — 双手前伸抓取
const THROW_POSES: Pose[] = [
  { headOff: 0, bodyLean: 1, armL: -0.8, armR: -0.8, legL: -1, legR: 1, crouch: false },
  { headOff: 1, bodyLean: 3, armL: -1.5, armR: -1.5, legL: -1, legR: 2, crouch: false },
  { headOff: 0, bodyLean: -2, armL: 0.6, armR: 0.6, legL: 0, legR: 0, crouch: false },
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

/** KO倒地帧 — 带描边 */
function drawKO(c: CanvasRenderingContext2D, v: CharVisual): void {
  const cy = Math.floor(PH / PIXEL) - 6;
  const cx = Math.floor(PW / PIXEL / 2);
  const shirtDark = darken(v.shirtColor, 0.3);
  const pantsDark = darken(v.pantsColor, 0.3);
  // 横躺身体描边
  for (let dx = -7; dx <= 7; dx++) {
    px(c, cx + dx, cy - 1, shirtDark);
    px(c, cx + dx, cy + 2, shirtDark);
  }
  // 横躺身体填充
  for (let dx = -6; dx <= 6; dx++) {
    px(c, cx + dx, cy, v.shirtColor);
    px(c, cx + dx, cy + 1, dx < 3 ? v.shirtColor : shirtDark);
  }
  // 头
  px(c, cx - 7, cy - 1, darken(v.hairColor, 0.3));
  px(c, cx - 7, cy, v.skinColor);
  px(c, cx - 7, cy + 1, v.skinColor);
  px(c, cx - 8, cy - 1, v.hairColor);
  px(c, cx - 8, cy, v.hairColor);
  // 腿
  for (let dx = 7; dx <= 10; dx++) {
    px(c, cx + dx, cy, v.pantsColor);
    px(c, cx + dx, cy + 1, dx > 8 ? pantsDark : v.pantsColor);
  }
  // 鞋
  px(c, cx + 11, cy, v.shoeColor);
  px(c, cx + 11, cy + 1, darken(v.shoeColor, 0.3));
}

type PoseSet = 'idle' | 'walk' | 'attack' | 'crouch_attack' | 'air_attack' | 'throw' | 'crouch' | 'jump' | 'hit' | 'block';

function stateToPoseSet(state: FighterState): PoseSet {
  switch (state) {
    case FighterState.WALK: case FighterState.RUN: return 'walk';
    case FighterState.CROUCH_ATTACK: return 'crouch_attack';
    case FighterState.AIR_ATTACK: return 'air_attack';
    case FighterState.THROW: return 'throw';
    case FighterState.STAND_ATTACK: case FighterState.COUNTER_STANCE:
    case FighterState.MAX_MODE: return 'attack';
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
  crouch_attack: CROUCH_ATTACK_POSES, air_attack: AIR_ATTACK_POSES, throw: THROW_POSES,
  crouch: CROUCH_POSES, jump: JUMP_POSES, hit: HIT_POSES, block: BLOCK_POSES,
};

/** 生成角色精灵图集 — 返回Image + AnimationMap
 * 图集布局: 每行一个PoseSet, 每行帧数可变
 * 最后一行是KO帧
 */
export function generatePlaceholderSpritesheet(color: string, charId: string): {
  image: HTMLImageElement;
  animations: SpriteAnimationMap;
} {
  const v = CHAR_VISUALS[charId] ?? getDefaultVisual();
  v.shirtColor = color;

  const poseSets: PoseSet[] = ['idle', 'walk', 'attack', 'crouch_attack', 'air_attack', 'throw', 'crouch', 'jump', 'hit', 'block'];

  // 计算图集尺寸
  let maxFrames = 0;
  for (const set of poseSets) {
    maxFrames = Math.max(maxFrames, POSE_MAP[set].length);
  }
  const atlasW = PW * maxFrames;
  const atlasH = PH * (poseSets.length + 1); // 每个PoseSet一行 + KO行

  const atlas = document.createElement('canvas');
  atlas.width = atlasW;
  atlas.height = atlasH;
  const actx = atlas.getContext('2d')!;

  // 绘制各姿态帧 — 每行一个PoseSet
  const rowMap = new Map<PoseSet, number>();
  poseSets.forEach((set, row) => {
    rowMap.set(set, row);
    const poses = POSE_MAP[set];
    poses.forEach((pose, f) => {
      const frame = document.createElement('canvas');
      frame.width = PW;
      frame.height = PH;
      const fc = frame.getContext('2d')!;
      fc.imageSmoothingEnabled = false;
      drawPixelChar(fc, { ...v }, pose.headOff, pose.bodyLean, pose.armL, pose.armR, pose.legL, pose.legR, pose.crouch);
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

  // 构建动画映射 — 使用每行的实际帧数
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
    const row = rowMap.get(set)!;
    const poseCount = POSE_MAP[set].length;
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
