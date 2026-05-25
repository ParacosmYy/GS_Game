/**
 * 像素风格身体部位渲染
 * 躯干、手臂、腿部的精细绘制，替代圆角矩形
 */
import { shiftColor, roundRect } from './utils.js';
import { getOutfit } from './skeletalParts.js';

// SNK风格统一深色描边
const OUTLINE_COLOR = '#1a1a1a';
const OUTLINE_WIDTH = 2.5;

/** 画像素风格躯干 — 肩宽腰窄梯形 + 角色专属服装细节 */
export function drawPixelTorso(
  ctx: CanvasRenderingContext2D, charId: string, w: number, h: number,
): void {
  const outfit = getOutfit(charId);
  const hw = w / 2, hh = h / 2;
  const shoulderW = hw;
  const waistW = hw * 0.82;

  // 主形状 — 梯形
  ctx.fillStyle = outfit.shirt;
  ctx.beginPath();
  ctx.moveTo(-shoulderW, -hh);
  ctx.lineTo(shoulderW, -hh);
  ctx.lineTo(waistW, hh);
  ctx.lineTo(-waistW, hh);
  ctx.closePath();
  ctx.fill();

  // 高光带（上部18%）
  ctx.fillStyle = shiftColor(outfit.shirt, 22);
  const hlY = -hh + h * 0.18;
  ctx.beginPath();
  ctx.moveTo(-shoulderW + 1, -hh + 1);
  ctx.lineTo(shoulderW - 1, -hh + 1);
  ctx.lineTo(shoulderW - (shoulderW - waistW) * 0.18, hlY);
  ctx.lineTo(-shoulderW + (shoulderW - waistW) * 0.18, hlY);
  ctx.closePath();
  ctx.fill();

  // 暗影带（下部18%）
  ctx.fillStyle = shiftColor(outfit.shirt, -18);
  const shY = hh - h * 0.18;
  ctx.beginPath();
  ctx.moveTo(-waistW + (shoulderW - waistW) * 0.15, shY);
  ctx.lineTo(waistW - (shoulderW - waistW) * 0.15, shY);
  ctx.lineTo(waistW - 1, hh - 1);
  ctx.lineTo(-waistW + 1, hh - 1);
  ctx.closePath();
  ctx.fill();

  // 腰带
  const beltH = Math.max(3, h * 0.08);
  ctx.fillStyle = outfit.belt;
  ctx.fillRect(-waistW + 2, hh - beltH * 3, (waistW - 2) * 2, beltH);
  ctx.fillStyle = shiftColor(outfit.belt, 30);
  ctx.fillRect(-2, hh - beltH * 3, 4, beltH);

  // 角色专属领口和装饰
  drawTorsoDetail(ctx, charId, w, h, outfit, shoulderW, waistW, hh);

  // SNK风格轮廓线
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = OUTLINE_WIDTH;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(-shoulderW, -hh);
  ctx.lineTo(shoulderW, -hh);
  ctx.lineTo(waistW, hh);
  ctx.lineTo(-waistW, hh);
  ctx.closePath();
  ctx.stroke();
}

/** 角色专属躯干细节 — 领口、图案、服装特征 */
function drawTorsoDetail(
  ctx: CanvasRenderingContext2D, charId: string, w: number, h: number,
  outfit: { shirt: string; pants: string; belt: string; shoes: string },
  sw: number, ww: number, hh: number,
): void {
  const PX = Math.max(2, Math.round(w / 14));
  if (charId === 'kyo') {
    ctx.fillStyle = '#2a2a3a';
    ctx.beginPath();
    ctx.moveTo(-PX * 1.5, -hh + PX);
    ctx.lineTo(0, -hh + PX * 4);
    ctx.lineTo(PX * 1.5, -hh + PX);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = shiftColor(outfit.shirt, -30);
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-PX * 1.5, -hh + PX); ctx.lineTo(-PX * 2, hh * 0.3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(PX * 1.5, -hh + PX); ctx.lineTo(PX * 2, hh * 0.3); ctx.stroke();
    ctx.fillStyle = '#cc4400';
    ctx.beginPath(); ctx.arc(0, -hh * 0.15, PX * 1.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ff6622';
    ctx.beginPath(); ctx.arc(0, -hh * 0.15, PX * 0.6, 0, Math.PI * 2); ctx.fill();
  } else if (charId === 'iori') {
    ctx.fillStyle = '#e8e0d0';
    ctx.beginPath();
    ctx.moveTo(-PX * 1.2, -hh + PX);
    ctx.lineTo(0, -hh + PX * 3);
    ctx.lineTo(PX * 1.2, -hh + PX);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#882244';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(PX, -hh * 0.2, PX * 1.5, Math.PI * 0.8, Math.PI * 2.2);
    ctx.stroke();
    ctx.strokeStyle = shiftColor(outfit.shirt, 12);
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(0, -hh + PX * 3); ctx.lineTo(0, hh * 0.5); ctx.stroke();
  } else if (charId === 'terry') {
    ctx.fillStyle = '#e8e8e8';
    ctx.fillRect(-sw * 0.5, -hh + PX, sw, h * 0.35);
    ctx.fillStyle = outfit.shirt;
    ctx.fillRect(-sw * 0.85, -hh + PX, sw * 0.2, h * 0.5);
    ctx.fillRect(sw * 0.65, -hh + PX, sw * 0.2, h * 0.5);
    ctx.fillStyle = '#aa8833';
    ctx.beginPath(); ctx.arc(-PX, -hh * 0.1, PX * 0.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(-PX, hh * 0.15, PX * 0.5, 0, Math.PI * 2); ctx.fill();
  } else if (charId === 'kim') {
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-PX * 1.8, -hh + PX);
    ctx.lineTo(0, -hh + PX * 5);
    ctx.lineTo(PX * 1.8, -hh + PX);
    ctx.stroke();
    ctx.strokeStyle = shiftColor(outfit.shirt, -12);
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(-PX * 1, -hh + PX * 3); ctx.lineTo(-PX * 2, hh * 0.4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(PX * 1, -hh + PX * 3); ctx.lineTo(PX * 2, hh * 0.4); ctx.stroke();
    ctx.fillStyle = '#cc3333';
    ctx.fillRect(-1, hh * 0.75, 2, 5);
  } else if (charId === 'ryo') {
    ctx.strokeStyle = shiftColor(outfit.shirt, -25);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-PX * 2, -hh + PX);
    ctx.lineTo(0, -hh + PX * 5);
    ctx.lineTo(PX * 2, -hh + PX);
    ctx.stroke();
    ctx.strokeStyle = shiftColor(outfit.shirt, -15);
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-PX * 1.5, -hh + PX * 2); ctx.lineTo(PX * 1.5, hh * 0.2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(PX * 1.5, -hh + PX * 2); ctx.lineTo(-PX * 1.5, hh * 0.2); ctx.stroke();
  } else if (charId === 'leona') {
    ctx.strokeStyle = shiftColor(outfit.shirt, -20);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-sw * 0.5, -hh + 1);
    ctx.lineTo(-sw * 0.3, -hh - PX);
    ctx.lineTo(sw * 0.3, -hh - PX);
    ctx.lineTo(sw * 0.5, -hh + 1);
    ctx.stroke();
    ctx.fillStyle = shiftColor(outfit.shirt, 10);
    ctx.fill();
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, -hh + PX); ctx.lineTo(0, hh * 0.6); ctx.stroke();
    ctx.strokeStyle = shiftColor(outfit.shirt, -15);
    ctx.lineWidth = 0.8;
    ctx.strokeRect(sw * 0.15, -hh * 0.3, PX * 2.5, PX * 2);
  } else if (charId === 'kdash') {
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(0, -hh + PX); ctx.lineTo(0, hh * 0.6); ctx.stroke();
    for (let i = 0; i < 5; i++) {
      const yy = -hh + PX * 2 + i * PX * 1.5;
      ctx.fillStyle = '#888';
      ctx.fillRect(-1, yy, 2, 1);
    }
    ctx.strokeStyle = shiftColor(outfit.shirt, 15);
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(-sw * 0.6, hh * 0.1); ctx.lineTo(-sw * 0.3, hh * 0.1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sw * 0.3, hh * 0.1); ctx.lineTo(sw * 0.6, hh * 0.1); ctx.stroke();
  } else if (charId === 'kula') {
    ctx.fillStyle = '#88ccff';
    ctx.beginPath();
    ctx.moveTo(-PX * 1.5, -hh + PX);
    ctx.lineTo(0, -hh + PX * 3);
    ctx.lineTo(PX * 1.5, -hh + PX);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#aaeeff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -hh * 0.25);
    ctx.lineTo(-PX * 1.2, -hh * 0.1);
    ctx.moveTo(0, -hh * 0.25);
    ctx.lineTo(PX * 1.2, -hh * 0.1);
    ctx.moveTo(0, -hh * 0.25);
    ctx.lineTo(0, -hh * 0.05);
    ctx.stroke();
    ctx.strokeStyle = shiftColor(outfit.shirt, 15);
    ctx.lineWidth = 0.6;
    for (let i = 0; i < 3; i++) {
      const yy = hh * 0.15 + i * PX;
      ctx.beginPath();
      ctx.moveTo(-ww + 3, yy);
      ctx.lineTo(ww - 3, yy);
      ctx.stroke();
    }
  }
}

/** 画像素风格手臂 — 袖口 + 前臂皮肤 + 手 */
export function drawPixelArm(
  ctx: CanvasRenderingContext2D, charId: string, w: number, h: number, isBack: boolean,
): void {
  const outfit = getOutfit(charId);
  const hw = w / 2, hh = h / 2;
  const skinColor = '#e8b88a';

  const sleeveH = h * 0.3;
  ctx.fillStyle = isBack ? shiftColor(outfit.shirt, -8) : outfit.shirt;
  ctx.fillRect(-hw, -hh, w, sleeveH);
  ctx.fillStyle = shiftColor(outfit.shirt, 18);
  ctx.fillRect(-hw + 1, -hh + 1, w - 2, sleeveH * 0.3);

  ctx.fillStyle = isBack ? shiftColor(skinColor, -8) : skinColor;
  ctx.fillRect(-hw + 1, -hh + sleeveH, w - 2, h * 0.55);
  ctx.fillStyle = shiftColor(skinColor, 15);
  ctx.fillRect(-hw + 2, -hh + sleeveH, w * 0.35, h * 0.3);

  const fistY = hh - h * 0.15;
  ctx.fillStyle = skinColor;
  ctx.fillRect(-hw * 0.8, fistY, w * 0.8, h * 0.15);

  // 角色专属手套/护手
  if (charId === 'kyo' || charId === 'iori') {
    ctx.fillStyle = '#cc3300';
    ctx.fillRect(-hw + 1, -hh + sleeveH - 2, w - 2, 4);
  } else if (charId === 'kdash') {
    ctx.fillStyle = '#ff4400';
    ctx.fillRect(-hw * 0.8 + 1, fistY - 1, w * 0.8 - 2, 3);
  } else if (charId === 'kula') {
    ctx.fillStyle = '#aaeeff';
    ctx.fillRect(-hw + 1, -hh + sleeveH - 2, w - 2, 3);
  }

  // SNK风格轮廓线
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = OUTLINE_WIDTH;
  ctx.lineJoin = 'round';
  roundRect(ctx, -hw, -hh, w, h, 3);
  ctx.stroke();

  // 袖口分界线
  ctx.strokeStyle = shiftColor(outfit.shirt, -25);
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-hw, -hh + sleeveH);
  ctx.lineTo(hw, -hh + sleeveH);
  ctx.stroke();
}

/** 画像素风格腿 — 裤子 + 鞋 */
export function drawPixelLeg(
  ctx: CanvasRenderingContext2D, charId: string, w: number, h: number, isBack: boolean,
): void {
  const outfit = getOutfit(charId);
  const hw = w / 2, hh = h / 2;
  const shoeH = Math.max(6, h * 0.12);

  const pantsColor = isBack ? shiftColor(outfit.pants, -8) : outfit.pants;
  ctx.fillStyle = pantsColor;
  roundRect(ctx, -hw, -hh, w, h - shoeH, 2);
  ctx.fill();

  ctx.fillStyle = shiftColor(pantsColor, 15);
  ctx.fillRect(-hw * 0.2, -hh + 2, w * 0.2, h - shoeH - 4);

  ctx.fillStyle = shiftColor(pantsColor, -12);
  ctx.fillRect(hw * 0.3, -hh + 2, w * 0.15, h - shoeH - 4);

  if (charId === 'terry') {
    ctx.strokeStyle = shiftColor(outfit.pants, 20);
    ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.moveTo(-hw * 0.3, -hh + 4); ctx.lineTo(-hw * 0.3, hh - shoeH - 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hw * 0.3, -hh + 4); ctx.lineTo(hw * 0.3, hh - shoeH - 2); ctx.stroke();
  } else if (charId === 'kdash') {
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-hw + 2, -hh + h * 0.3);
    ctx.lineTo(-hw + 2, -hh + h * 0.5);
    ctx.lineTo(-hw + 5, -hh + h * 0.6);
    ctx.stroke();
  } else if (charId === 'kula') {
    ctx.fillStyle = 'rgba(150, 220, 255, 0.25)';
    ctx.fillRect(-hw + 1, -hh + h * 0.2, w - 2, 2);
    ctx.fillRect(-hw + 1, -hh + h * 0.5, w - 2, 2);
  }

  ctx.fillStyle = outfit.shoes;
  ctx.fillRect(-hw, hh - shoeH, w, shoeH);
  ctx.fillStyle = shiftColor(outfit.shoes, 20);
  ctx.fillRect(-hw + 1, hh - shoeH, w * 0.4, shoeH * 0.5);
  ctx.fillStyle = shiftColor(outfit.shoes, -20);
  ctx.fillRect(-hw, hh - 2, w, 2);

  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = OUTLINE_WIDTH;
  ctx.lineJoin = 'round';
  roundRect(ctx, -hw, -hh, w, h, 3);
  ctx.stroke();

  ctx.strokeStyle = shiftColor(outfit.shoes, -25);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-hw, hh - shoeH);
  ctx.lineTo(hw, hh - shoeH);
  ctx.stroke();
}
