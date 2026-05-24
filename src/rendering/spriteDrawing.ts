/** 像素精灵绘制函数 — drawPixelChar, drawArm, drawLeg, drawHair, drawKO */

import type { CharVisual } from './spritePoseData.js';
import { PW, PH, PIXEL, px, darken, lighten } from './spritePoseData.js';

/** 绘制像素角色帧 — 带描边和精细身体部位 */
export function drawPixelChar(
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
  // 头部填充 — 上方光照
  for (let dy = 0; dy < hh; dy++) {
    for (let dx = -Math.floor(hw / 2); dx <= Math.floor(hw / 2); dx++) {
      const nx = dx / (hw / 2);
      const ny = dy / hh;
      if (nx * nx + (ny - 0.5) * (ny - 0.5) * 4 < 1) {
        const color = dy < 2 ? lighten(v.skinColor, 0.15) : v.skinColor;
        px(c, headX + dx, headY + dy, color);
      }
    }
  }
  // 发型
  drawHair(c, headX, headY, hw, v.hairColor, v.hairStyle);
  // 眼睛
  px(c, headX - 1, headY + Math.floor(hh / 2), '#ffffff');
  px(c, headX + 1, headY + Math.floor(hh / 2), '#ffffff');
  px(c, headX - 1, headY + Math.floor(hh / 2) + 1, '#1a1a1a');
  px(c, headX + 1, headY + Math.floor(hh / 2) + 1, '#1a1a1a');
  // 嘴巴
  if (hh > 4) px(c, headX, headY + hh - 1, skinDark);

  // === 躯干 ===
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
  // 填充
  for (let dy = 0; dy < torsoH; dy++) {
    const w = dy < 2 ? bw : bw - 1;
    for (let dx = -Math.floor(w / 2); dx <= Math.floor(w / 2); dx++) {
      if (dy < 2 && Math.abs(dx) < 1) {
        px(c, torsoX + dx, torsoY + dy, v.skinColor);
      } else if (dy === 0) {
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

  // === 手臂 ===
  const shoulderY = torsoY + 1;
  const armLen = 5;
  drawArm(c, torsoX - Math.floor(bw / 2) - 1, shoulderY, armLAngle, armLen, v.skinColor, skinDark);
  drawArm(c, torsoX + Math.floor(bw / 2) + 1, shoulderY, armRAngle, armLen, v.skinColor, skinDark);

  // === 腿部 ===
  const legY = torsoY + torsoH;
  const legLen = Math.floor(v.legLen * scale);
  drawLeg(c, torsoX - 1, legY, legLSpread, legLen, v.pantsColor, v.shoeColor, pantsDark);
  drawLeg(c, torsoX + 1, legY, legRSpread, legLen, v.pantsColor, v.shoeColor, pantsDark);

  // === 地面阴影 ===
  const shadowY = legY + legLen + 2;
  const shadowW = Math.max(v.bodyW + 2, 8);
  const shadowColor = '#1a1a1a';
  const shadowEdge = '#2a2a2a';
  for (let dx = -Math.floor(shadowW / 2); dx <= Math.floor(shadowW / 2); dx++) {
    const sx = cx + dx;
    px(c, sx, shadowY, Math.abs(dx) >= Math.floor(shadowW / 2) ? shadowEdge : shadowColor);
  }
}

/** 绘制手臂 */
export function drawArm(c: CanvasRenderingContext2D, sx: number, sy: number, angle: number, len: number, color: string, outlineColor: string): void {
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
  // 拳头
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

/** 绘制腿部 */
export function drawLeg(c: CanvasRenderingContext2D, sx: number, sy: number, spread: number, len: number, pantsColor: string, shoeColor: string, outlineColor: string): void {
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
    if (i > 1) px(c, x + 1, y, outlineColor);
  }
  // 鞋子
  const shoeDark = darken(shoeColor, 0.3);
  px(c, x - 1, y + 1, shoeDark);
  px(c, x, y + 1, shoeColor);
  px(c, x + 1, y + 1, shoeColor);
  px(c, x + 2, y + 1, shoeDark);
}

/** 绘制发型 */
export function drawHair(c: CanvasRenderingContext2D, hx: number, hy: number, hw: number, color: string, style: string): void {
  switch (style) {
    case 'spiky':
      px(c, hx, hy - 2, color);
      px(c, hx - 1, hy - 1, color);
      px(c, hx + 1, hy - 1, color);
      px(c, hx - 2, hy, color);
      px(c, hx + 2, hy, color);
      px(c, hx - 2, hy + 1, color);
      px(c, hx + 2, hy + 1, color);
      break;
    case 'wild':
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
      for (let dy = -1; dy <= 3; dy++) {
        px(c, hx - Math.floor(hw / 2) - 1, hy + dy, color);
        px(c, hx + Math.floor(hw / 2) + 1, hy + dy, color);
      }
      px(c, hx, hy - 1, color);
      px(c, hx - 1, hy - 1, color);
      px(c, hx + 1, hy - 1, color);
      break;
    case 'ponytail':
      px(c, hx, hy - 1, color);
      px(c, hx - 1, hy - 1, color);
      px(c, hx + 1, hy - 1, color);
      for (let dy = 0; dy < 4; dy++) {
        px(c, hx + Math.floor(hw / 2) + 1 + dy, hy + dy, color);
        px(c, hx + Math.floor(hw / 2) + 2 + dy, hy + dy, color);
      }
      break;
    case 'short':
      px(c, hx, hy - 1, color);
      px(c, hx - 1, hy - 1, color);
      px(c, hx + 1, hy - 1, color);
      px(c, hx - 2, hy, color);
      px(c, hx + 2, hy, color);
      break;
  }
}

/** KO倒地帧 */
export function drawKO(c: CanvasRenderingContext2D, v: CharVisual): void {
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
