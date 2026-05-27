/**
 * 像素风格身体部位渲染 — 精细化版本
 * 躯干、手臂、腿部的详细角色专属绘制
 * 每个角色的服装、饰品、图案都还原KOF2002经典形象
 */
import { shiftColor, roundRect } from './utils.js';
import { getOutfit } from './skeletalParts.js';

// SNK风格统一深色描边
const OUTLINE_COLOR = '#1a1a1a';
const OUTLINE_WIDTH = 2.5;

// 全局动画帧 — 由外部通过 setGlobalTick 注入
let _tick = 0;
export function setBodyPartTick(t: number): void { _tick = t; }

/** 画像素风格躯干 — S-curve解剖形状(胸宽→腰窄→臀稍宽) + 圆角 + 角色专属服装细节 */
export function drawPixelTorso(
  ctx: CanvasRenderingContext2D, charId: string, w: number, h: number,
  colorIndex?: number,
): void {
  const outfit = getOutfit(charId, colorIndex);
  const hw = w / 2, hh = h / 2;
  const shoulderW = hw;
  const chestW = hw * 0.95;      // 胸部略窄于肩
  const waistW = hw * 0.72;      // 腰部明显收窄
  const hipW = hw * 0.78;        // 臀部比腰稍宽
  const cr = Math.max(2, hw * 0.12); // 圆角半径

  // 主形状 — S-curve解剖路径（肩→胸→腰→臀），用bezierCurve实现圆角
  ctx.fillStyle = outfit.shirt;
  ctx.beginPath();
  // 左上肩起点（带圆角）
  ctx.moveTo(-shoulderW + cr, -hh);
  ctx.lineTo(shoulderW - cr, -hh);
  ctx.quadraticCurveTo(shoulderW, -hh, shoulderW, -hh + cr);
  // 右肩→右胸→右腰（S-curve内收）
  ctx.bezierCurveTo(shoulderW, -hh + h * 0.15, chestW, -hh + h * 0.25, chestW, -hh + h * 0.3);
  ctx.bezierCurveTo(chestW, -hh + h * 0.4, waistW + 1, -hh + h * 0.5, waistW, -hh + h * 0.55);
  // 右腰→右臀（S-curve外扩）
  ctx.bezierCurveTo(waistW - 1, -hh + h * 0.65, hipW, -hh + h * 0.78, hipW, -hh + h * 0.85);
  ctx.quadraticCurveTo(hipW, hh, hipW - cr, hh);
  // 底边
  ctx.lineTo(-hipW + cr, hh);
  ctx.quadraticCurveTo(-hipW, hh, -hipW, -hh + h * 0.85);
  // 左臀→左腰（S-curve外扩→内收）
  ctx.bezierCurveTo(-hipW, -hh + h * 0.78, -waistW + 1, -hh + h * 0.65, -waistW, -hh + h * 0.55);
  ctx.bezierCurveTo(-waistW - 1, -hh + h * 0.5, -chestW, -hh + h * 0.4, -chestW, -hh + h * 0.3);
  ctx.bezierCurveTo(-chestW, -hh + h * 0.25, -shoulderW, -hh + h * 0.15, -shoulderW, -hh + cr);
  ctx.quadraticCurveTo(-shoulderW, -hh, -shoulderW + cr, -hh);
  ctx.closePath();
  ctx.fill();

  // 高光带（上部18%）— 跟随S-curve
  ctx.fillStyle = shiftColor(outfit.shirt, 22);
  const hlY = -hh + h * 0.18;
  ctx.beginPath();
  ctx.moveTo(-shoulderW + 1, -hh + 1);
  ctx.lineTo(shoulderW - 1, -hh + 1);
  ctx.lineTo(shoulderW - (shoulderW - chestW) * 0.5, hlY);
  ctx.lineTo(-shoulderW + (shoulderW - chestW) * 0.5, hlY);
  ctx.closePath();
  ctx.fill();

  // 暗影带（下部18%）— 跟随S-curve
  ctx.fillStyle = shiftColor(outfit.shirt, -18);
  const shY = hh - h * 0.18;
  ctx.beginPath();
  ctx.moveTo(-hipW + 1, shY);
  ctx.lineTo(hipW - 1, shY);
  ctx.lineTo(hipW - 1, hh - 1);
  ctx.lineTo(-hipW + 1, hh - 1);
  ctx.closePath();
  ctx.fill();

  // 腰线阴影 — 在腰部最窄处加暗影强调S-curve
  ctx.fillStyle = shiftColor(outfit.shirt, -10);
  const waistY = -hh + h * 0.55;
  ctx.beginPath();
  ctx.moveTo(-chestW, waistY - h * 0.05);
  ctx.quadraticCurveTo(-waistW - 1, waistY, -hipW, waistY + h * 0.08);
  ctx.lineTo(-hipW + 2, waistY + h * 0.08);
  ctx.quadraticCurveTo(-waistW + 1, waistY, -chestW + 2, waistY - h * 0.03);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(chestW, waistY - h * 0.05);
  ctx.quadraticCurveTo(waistW + 1, waistY, hipW, waistY + h * 0.08);
  ctx.lineTo(hipW - 2, waistY + h * 0.08);
  ctx.quadraticCurveTo(waistW - 1, waistY, chestW - 2, waistY - h * 0.03);
  ctx.closePath();
  ctx.fill();

  // 腰带 — 放在臀部区域
  const beltH = Math.max(3, h * 0.08);
  ctx.fillStyle = outfit.belt;
  ctx.fillRect(-hipW + 2, hh - beltH * 3, (hipW - 2) * 2, beltH);
  ctx.fillStyle = shiftColor(outfit.belt, 30);
  ctx.fillRect(-2, hh - beltH * 3, 4, beltH);

  // 角色专属服装细节
  drawTorsoDetail(ctx, charId, w, h, outfit, shoulderW, waistW, hh);

  // SNK风格轮廓线 — 沿S-curve路径描边
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = OUTLINE_WIDTH;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(-shoulderW + cr, -hh);
  ctx.lineTo(shoulderW - cr, -hh);
  ctx.quadraticCurveTo(shoulderW, -hh, shoulderW, -hh + cr);
  ctx.bezierCurveTo(shoulderW, -hh + h * 0.15, chestW, -hh + h * 0.25, chestW, -hh + h * 0.3);
  ctx.bezierCurveTo(chestW, -hh + h * 0.4, waistW + 1, -hh + h * 0.5, waistW, -hh + h * 0.55);
  ctx.bezierCurveTo(waistW - 1, -hh + h * 0.65, hipW, -hh + h * 0.78, hipW, -hh + h * 0.85);
  ctx.quadraticCurveTo(hipW, hh, hipW - cr, hh);
  ctx.lineTo(-hipW + cr, hh);
  ctx.quadraticCurveTo(-hipW, hh, -hipW, -hh + h * 0.85);
  ctx.bezierCurveTo(-hipW, -hh + h * 0.78, -waistW + 1, -hh + h * 0.65, -waistW, -hh + h * 0.55);
  ctx.bezierCurveTo(-waistW - 1, -hh + h * 0.5, -chestW, -hh + h * 0.4, -chestW, -hh + h * 0.3);
  ctx.bezierCurveTo(-chestW, -hh + h * 0.25, -shoulderW, -hh + h * 0.15, -shoulderW, -hh + cr);
  ctx.quadraticCurveTo(-shoulderW, -hh, -shoulderW + cr, -hh);
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
  const breathe = Math.sin(_tick / 30) * 0.5; // 微妙呼吸偏移

  if (charId === 'kyo') {
    // 京: 白色外套+黑色高领+V领橙色内衬+胸前的日轮火焰纹章
    // 黑色高领区域
    ctx.fillStyle = '#2a2a3a';
    ctx.beginPath();
    ctx.moveTo(-PX * 2, -hh + PX);
    ctx.lineTo(0, -hh + PX * 4);
    ctx.lineTo(PX * 2, -hh + PX);
    ctx.closePath();
    ctx.fill();
    // 左右翻领线
    ctx.strokeStyle = '#1a1a2a';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-PX * 2, -hh + PX); ctx.lineTo(-PX * 2.5, hh * 0.2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(PX * 2, -hh + PX); ctx.lineTo(PX * 2.5, hh * 0.2); ctx.stroke();
    // V领内的橙色内衬
    ctx.fillStyle = '#ee5500';
    ctx.beginPath();
    ctx.moveTo(-PX * 1, -hh + PX * 1.5);
    ctx.lineTo(0, -hh + PX * 4);
    ctx.lineTo(PX * 1, -hh + PX * 1.5);
    ctx.closePath();
    ctx.fill();
    // 日轮火焰纹章 — 多层圆形+火焰射线
    const embY = -hh * 0.05 + breathe;
    ctx.fillStyle = '#cc4400';
    ctx.beginPath(); ctx.arc(0, embY, PX * 1.8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ff6622';
    ctx.beginPath(); ctx.arc(0, embY, PX * 1.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffaa44';
    ctx.beginPath(); ctx.arc(0, embY, PX * 0.6, 0, Math.PI * 2); ctx.fill();
    // 火焰射线
    ctx.strokeStyle = '#ff8833';
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + _tick * 0.02;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * PX * 1.3, embY + Math.sin(angle) * PX * 1.3);
      ctx.lineTo(Math.cos(angle) * PX * 2.2, embY + Math.sin(angle) * PX * 2.2);
      ctx.stroke();
    }
    // 肩线装饰
    ctx.strokeStyle = '#3a3a4a';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-sw * 0.7, -hh + 2); ctx.lineTo(-sw * 0.3, -hh + 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sw * 0.3, -hh + 2); ctx.lineTo(sw * 0.7, -hh + 2); ctx.stroke();

  } else if (charId === 'iori') {
    // 庵: 黑色外套+白色内衬衬衫+胸前红色月牙纹+垂直拉链线
    // 白色内衬V领
    ctx.fillStyle = '#e8e0d0';
    ctx.beginPath();
    ctx.moveTo(-PX * 1.5, -hh + PX);
    ctx.lineTo(0, -hh + PX * 4);
    ctx.lineTo(PX * 1.5, -hh + PX);
    ctx.closePath();
    ctx.fill();
    // 白色内衬延伸区域
    ctx.fillStyle = '#ddd8cc';
    ctx.fillRect(-PX * 1.2, -hh + PX * 3, PX * 2.4, h * 0.25);
    // 红色月牙 — Yagami家族纹章
    const moonY = -hh * 0.2 + breathe;
    ctx.strokeStyle = '#cc1133';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(PX * 0.5, moonY, PX * 2, Math.PI * 0.7, Math.PI * 1.6);
    ctx.stroke();
    // 月牙内部填充
    ctx.fillStyle = '#aa0022';
    ctx.beginPath();
    ctx.arc(PX * 0.5, moonY, PX * 1.8, Math.PI * 0.75, Math.PI * 1.55);
    ctx.lineTo(PX * 0.5 + Math.cos(Math.PI * 1.55) * PX * 1.2, moonY + Math.sin(Math.PI * 1.55) * PX * 1.2);
    ctx.arc(PX * 0.5, moonY, PX * 1.2, Math.PI * 1.55, Math.PI * 0.75, true);
    ctx.closePath();
    ctx.fill();
    // 外套前中线
    ctx.strokeStyle = shiftColor(outfit.shirt, 12);
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, -hh + PX * 4); ctx.lineTo(0, hh * 0.5); ctx.stroke();
    // 外套领口暗线
    ctx.strokeStyle = '#882244';
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(-PX * 2, -hh + 1); ctx.lineTo(-PX * 2.5, hh * 0.25); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(PX * 2, -hh + 1); ctx.lineTo(PX * 2.5, hh * 0.25); ctx.stroke();

  } else if (charId === 'terry') {
    // 特瑞: 红色背心+白色坦克衫内衬+背心上的星星+背心拉链
    // 白色坦克衫 — 全胸可见区域
    ctx.fillStyle = '#e8e8e8';
    ctx.fillRect(-sw * 0.55, -hh + PX, sw * 1.1, h * 0.4);
    // 坦克衫肩带
    ctx.fillStyle = '#ddd';
    ctx.fillRect(-sw * 0.85, -hh + PX, sw * 0.25, h * 0.45);
    ctx.fillRect(sw * 0.6, -hh + PX, sw * 0.25, h * 0.45);
    // 坦克衫领口V线
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-PX * 1, -hh + PX * 0.5);
    ctx.quadraticCurveTo(0, -hh + PX * 3, PX * 1, -hh + PX * 0.5);
    ctx.stroke();
    // 红色背心覆盖两侧
    ctx.fillStyle = outfit.shirt;
    ctx.fillRect(-sw * 0.95, -hh + PX, sw * 0.25, h * 0.5);
    ctx.fillRect(sw * 0.7, -hh + PX, sw * 0.25, h * 0.5);
    // 背心边缘高光
    ctx.strokeStyle = shiftColor(outfit.shirt, 20);
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(-sw * 0.55, -hh + PX); ctx.lineTo(-sw * 0.55, hh * 0.2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sw * 0.55, -hh + PX); ctx.lineTo(sw * 0.55, hh * 0.2); ctx.stroke();
    // 背心上的星星纹章
    const starX = -PX * 0.5, starY = -hh * 0.05 + breathe;
    drawStarEmblem(ctx, starX, starY, PX * 0.8, '#ffcc00', '#dd9900');
    // 纽扣/拉链装饰
    ctx.fillStyle = '#aa8833';
    ctx.beginPath(); ctx.arc(-PX * 0.5, -hh * 0.25, PX * 0.35, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(-PX * 0.5, hh * 0.05, PX * 0.35, 0, Math.PI * 2); ctx.fill();

  } else if (charId === 'kim') {
    // 金: 白色道袍+V领+黑色腰带+道袍前襟交叉线
    // V领 — 白色道袍经典V形开口
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-PX * 2, -hh + PX);
    ctx.lineTo(0, -hh + PX * 6);
    ctx.lineTo(PX * 2, -hh + PX);
    ctx.stroke();
    // 道袍前襟左片
    ctx.fillStyle = shiftColor(outfit.shirt, -5);
    ctx.beginPath();
    ctx.moveTo(-PX * 2, -hh + PX);
    ctx.lineTo(0, -hh + PX * 6);
    ctx.lineTo(-PX * 0.5, hh * 0.35);
    ctx.lineTo(-PX * 2.2, hh * 0.2);
    ctx.closePath();
    ctx.fill();
    // 道袍前襟右片
    ctx.fillStyle = shiftColor(outfit.shirt, 5);
    ctx.beginPath();
    ctx.moveTo(PX * 2, -hh + PX);
    ctx.lineTo(0, -hh + PX * 6);
    ctx.lineTo(PX * 0.5, hh * 0.35);
    ctx.lineTo(PX * 2.2, hh * 0.2);
    ctx.closePath();
    ctx.fill();
    // 黑色腰带 — 更粗更醒目
    ctx.fillStyle = '#111';
    ctx.fillRect(-ww + 1, hh * 0.55, (ww - 1) * 2, PX * 1.5);
    // 腰带结
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.moveTo(0, hh * 0.55);
    ctx.lineTo(-PX, hh * 0.55 + PX);
    ctx.lineTo(0, hh * 0.55 + PX * 2);
    ctx.lineTo(PX, hh * 0.55 + PX);
    ctx.closePath();
    ctx.fill();
    // 道袍侧缝线
    ctx.strokeStyle = shiftColor(outfit.shirt, -12);
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(-PX * 1.5, -hh + PX * 3); ctx.lineTo(-PX * 2.2, hh * 0.35); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(PX * 1.5, -hh + PX * 3); ctx.lineTo(PX * 2.2, hh * 0.35); ctx.stroke();

  } else if (charId === 'ryo') {
    // Ryo: Orange karate gi + black obi + deep V-neck + wide shoulders + training wear
    // === Shoulder line emphasis — Kyokugen karateka's broad shoulders ===
    ctx.strokeStyle = shiftColor(outfit.shirt, -25);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-sw + 2, -hh + 2);
    ctx.lineTo(-sw * 0.5, -hh + PX * 0.5);
    ctx.lineTo(0, -hh + PX);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(sw - 2, -hh + 2);
    ctx.lineTo(sw * 0.5, -hh + PX * 0.5);
    ctx.lineTo(0, -hh + PX);
    ctx.stroke();
    // Deltoid muscle lines — shoulder bulk
    ctx.strokeStyle = shiftColor(outfit.shirt, -12);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-sw * 0.9, -hh + PX * 0.8);
    ctx.quadraticCurveTo(-sw * 0.6, -hh + PX * 1.5, -sw * 0.3, -hh + PX * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(sw * 0.9, -hh + PX * 0.8);
    ctx.quadraticCurveTo(sw * 0.6, -hh + PX * 1.5, sw * 0.3, -hh + PX * 2);
    ctx.stroke();

    // === Gi V-neck — deep opening showing chest ===
    // V-neck outline — thick clear karate collar
    ctx.strokeStyle = shiftColor(outfit.shirt, -30);
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-PX * 2.5, -hh + PX);
    ctx.lineTo(0, -hh + PX * 6);
    ctx.lineTo(PX * 2.5, -hh + PX);
    ctx.stroke();
    // V-neck inner shadow — depth behind the collar
    ctx.fillStyle = shiftColor(outfit.shirt, -38);
    ctx.beginPath();
    ctx.moveTo(-PX * 1.8, -hh + PX * 1.2);
    ctx.lineTo(0, -hh + PX * 5.8);
    ctx.lineTo(PX * 1.8, -hh + PX * 1.2);
    ctx.closePath();
    ctx.fill();
    // Chest skin visible in V-neck
    const chestSkin = '#d4a07a';
    ctx.fillStyle = chestSkin;
    ctx.beginPath();
    ctx.moveTo(-PX * 1.2, -hh + PX * 1.8);
    ctx.lineTo(0, -hh + PX * 5.2);
    ctx.lineTo(PX * 1.2, -hh + PX * 1.8);
    ctx.closePath();
    ctx.fill();
    // Chest muscle line — pectoral division hint
    ctx.strokeStyle = shiftColor(chestSkin, -15);
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(0, -hh + PX * 3);
    ctx.lineTo(0, -hh + PX * 5);
    ctx.stroke();
    // Collarbone hints
    ctx.strokeStyle = shiftColor(chestSkin, -10);
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(-PX * 1.0, -hh + PX * 2);
    ctx.quadraticCurveTo(-PX * 0.3, -hh + PX * 1.6, 0, -hh + PX * 2.2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(PX * 1.0, -hh + PX * 2);
    ctx.quadraticCurveTo(PX * 0.3, -hh + PX * 1.6, 0, -hh + PX * 2.2);
    ctx.stroke();

    // === Gi lapels — overlapping left and right panels ===
    // Left panel (underneath, slightly darker)
    ctx.fillStyle = shiftColor(outfit.shirt, -8);
    ctx.beginPath();
    ctx.moveTo(-PX * 2.5, -hh + PX);
    ctx.lineTo(-PX * 0.3, -hh + PX * 6);
    ctx.lineTo(-PX * 0.8, hh * 0.4);
    ctx.lineTo(-PX * 2.5, hh * 0.3);
    ctx.closePath();
    ctx.fill();
    // Left panel edge highlight — fold line
    ctx.strokeStyle = shiftColor(outfit.shirt, 15);
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(-PX * 2.3, -hh + PX * 1.2);
    ctx.lineTo(-PX * 0.4, -hh + PX * 5.8);
    ctx.stroke();
    // Right panel (on top, slightly lighter)
    ctx.fillStyle = shiftColor(outfit.shirt, 5);
    ctx.beginPath();
    ctx.moveTo(PX * 2.5, -hh + PX);
    ctx.lineTo(PX * 0.3, -hh + PX * 6);
    ctx.lineTo(PX * 0.8, hh * 0.4);
    ctx.lineTo(PX * 2.5, hh * 0.3);
    ctx.closePath();
    ctx.fill();
    // Right panel edge highlight — fold line
    ctx.strokeStyle = shiftColor(outfit.shirt, 18);
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(PX * 2.3, -hh + PX * 1.2);
    ctx.lineTo(PX * 0.4, -hh + PX * 5.8);
    ctx.stroke();

    // === Gi fabric folds — diagonal draping lines ===
    ctx.strokeStyle = shiftColor(outfit.shirt, -10);
    ctx.lineWidth = 0.6;
    // Left side folds
    ctx.beginPath();
    ctx.moveTo(-PX * 2.0, -hh + PX * 2.5);
    ctx.quadraticCurveTo(-PX * 1.2, hh * 0.1, -PX * 1.5, hh * 0.35);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-sw * 0.5, -hh + PX * 2);
    ctx.quadraticCurveTo(-PX * 2.0, hh * 0.0, -PX * 2.2, hh * 0.3);
    ctx.stroke();
    // Right side folds
    ctx.beginPath();
    ctx.moveTo(PX * 2.0, -hh + PX * 2.5);
    ctx.quadraticCurveTo(PX * 1.2, hh * 0.1, PX * 1.5, hh * 0.35);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(sw * 0.5, -hh + PX * 2);
    ctx.quadraticCurveTo(PX * 2.0, hh * 0.0, PX * 2.2, hh * 0.3);
    ctx.stroke();

    // === Cross-tie lines — front panel binding ===
    ctx.strokeStyle = shiftColor(outfit.shirt, -15);
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(-PX * 1.5, -hh + PX * 2); ctx.lineTo(PX * 1.5, hh * 0.2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(PX * 1.5, -hh + PX * 2); ctx.lineTo(-PX * 1.5, hh * 0.2); ctx.stroke();

    // === Black obi (belt) — wider, clearer ===
    const beltY = hh * 0.48;
    // Belt body
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-ww + 1, beltY, (ww - 1) * 2, PX * 1.5);
    // Belt highlight — subtle sheen on top edge
    ctx.fillStyle = '#333';
    ctx.fillRect(-ww + 2, beltY, (ww - 2) * 2, PX * 0.4);
    // Belt bottom shadow
    ctx.fillStyle = '#111';
    ctx.fillRect(-ww + 1, beltY + PX * 1.1, (ww - 1) * 2, PX * 0.4);
    // Belt knot — diamond shape with tails
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.moveTo(0, beltY + PX * 0.2);
    ctx.lineTo(-PX * 0.9, beltY + PX);
    ctx.lineTo(0, beltY + PX * 1.8);
    ctx.lineTo(PX * 0.9, beltY + PX);
    ctx.closePath();
    ctx.fill();
    // Knot center highlight
    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath();
    ctx.arc(0, beltY + PX, PX * 0.25, 0, Math.PI * 2);
    ctx.fill();
    // Belt tails — hanging strips below knot
    ctx.fillStyle = '#181818';
    ctx.beginPath();
    ctx.moveTo(-PX * 0.15, beltY + PX * 1.7);
    ctx.quadraticCurveTo(-PX * 0.3, beltY + PX * 2.8, -PX * 0.2, beltY + PX * 3.5);
    ctx.lineTo(-PX * 0.05, beltY + PX * 3.5);
    ctx.quadraticCurveTo(-PX * 0.15, beltY + PX * 2.6, PX * 0.05, beltY + PX * 1.7);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(PX * 0.15, beltY + PX * 1.7);
    ctx.quadraticCurveTo(PX * 0.25, beltY + PX * 2.6, PX * 0.15, beltY + PX * 3.2);
    ctx.lineTo(PX * 0.03, beltY + PX * 3.2);
    ctx.quadraticCurveTo(PX * 0.1, beltY + PX * 2.4, -PX * 0.05, beltY + PX * 1.7);
    ctx.closePath();
    ctx.fill();

    // === Gi edge wear — battle-damaged hint ===
    ctx.strokeStyle = shiftColor(outfit.shirt, -20);
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(-sw * 0.8, -hh + 1);
    ctx.lineTo(-sw * 0.75, -hh + PX);
    ctx.lineTo(-sw * 0.7, -hh + 1);
    ctx.stroke();
    // Sweat/stain spots on gi — subtle worn look
    ctx.fillStyle = shiftColor(outfit.shirt, -5);
    ctx.beginPath();
    ctx.ellipse(-PX * 1.0, hh * 0.15, PX * 0.6, PX * 0.3, 0.2, 0, Math.PI * 2);
    ctx.fill();

  } else if (charId === 'leona') {
    // 莉安娜: 绿色军装夹克+高翻领+胸前口袋+军章+拉链
    // 高翻领
    ctx.strokeStyle = shiftColor(outfit.shirt, -20);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-sw * 0.5, -hh + 1);
    ctx.lineTo(-sw * 0.35, -hh - PX * 1);
    ctx.lineTo(sw * 0.35, -hh - PX * 1);
    ctx.lineTo(sw * 0.5, -hh + 1);
    ctx.stroke();
    ctx.fillStyle = shiftColor(outfit.shirt, 10);
    ctx.fill();
    // 拉链线
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, -hh + PX); ctx.lineTo(0, hh * 0.6); ctx.stroke();
    // 拉链齿
    for (let i = 0; i < 6; i++) {
      const yy = -hh + PX * 2 + i * PX * 1.2;
      ctx.fillStyle = '#999';
      ctx.fillRect(-1, yy, 2, 1);
    }
    // 左胸口袋
    ctx.strokeStyle = shiftColor(outfit.shirt, -15);
    ctx.lineWidth = 1;
    ctx.strokeRect(sw * 0.1, -hh * 0.3, PX * 2.5, PX * 2);
    // 口袋盖
    ctx.fillStyle = shiftColor(outfit.shirt, -8);
    ctx.fillRect(sw * 0.1, -hh * 0.3, PX * 2.5, PX * 0.5);
    // 军章 — 胸前小徽章
    ctx.fillStyle = '#ccaa33';
    ctx.beginPath(); ctx.arc(-sw * 0.25, -hh * 0.2, PX * 0.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#aa8822';
    ctx.beginPath(); ctx.arc(-sw * 0.25, -hh * 0.2, PX * 0.25, 0, Math.PI * 2); ctx.fill();
    // 肩章
    ctx.fillStyle = shiftColor(outfit.shirt, -10);
    ctx.fillRect(-sw * 0.8, -hh + 1, sw * 0.25, PX * 0.6);
    ctx.fillRect(sw * 0.55, -hh + 1, sw * 0.25, PX * 0.6);

  } else if (charId === 'kdash') {
    // K': 黑色皮夹克+链条装饰+敞开前襟+内衬
    // 中线
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(0, -hh + PX); ctx.lineTo(0, hh * 0.6); ctx.stroke();
    // 金属链条 — 从领口到腰部的装饰链
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(PX * 0.5, -hh + PX * 1.5);
    ctx.quadraticCurveTo(PX * 1.5, -hh * 0.2, PX * 0.3, hh * 0.3);
    ctx.stroke();
    // 链条上的环扣
    for (let i = 0; i < 4; i++) {
      const t = (i + 0.5) / 4;
      const cx = PX * 0.5 * (1 - t) + PX * 0.3 * t + Math.sin(t * Math.PI) * PX;
      const cy = (-hh + PX * 1.5) * (1 - t) + hh * 0.3 * t;
      ctx.fillStyle = '#ccc';
      ctx.beginPath(); ctx.arc(cx, cy, PX * 0.3, 0, Math.PI * 2); ctx.fill();
    }
    // 皮夹克左右翻领 — 敞开式
    ctx.fillStyle = shiftColor(outfit.shirt, 10);
    ctx.beginPath();
    ctx.moveTo(-PX * 1, -hh);
    ctx.lineTo(-PX * 0.3, -hh + PX * 4);
    ctx.lineTo(-sw * 0.5, -hh + PX);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(PX * 1, -hh);
    ctx.lineTo(PX * 0.3, -hh + PX * 4);
    ctx.lineTo(sw * 0.5, -hh + PX);
    ctx.closePath();
    ctx.fill();
    // 夹克口袋线
    ctx.strokeStyle = shiftColor(outfit.shirt, 15);
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(-sw * 0.6, hh * 0.1); ctx.lineTo(-sw * 0.3, hh * 0.1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sw * 0.3, hh * 0.1); ctx.lineTo(sw * 0.6, hh * 0.1); ctx.stroke();

  } else if (charId === 'kula') {
    // 库拉: 蓝色连衣裙+冰晶图案+白色毛绒领+蝴蝶结
    // 白色毛绒领口
    ctx.fillStyle = '#eef4ff';
    ctx.beginPath();
    ctx.moveTo(-PX * 2, -hh + PX);
    ctx.quadraticCurveTo(-PX * 2.2, -hh - PX * 0.5, -PX * 0.5, -hh - PX * 0.3);
    ctx.quadraticCurveTo(0, -hh - PX * 0.8, PX * 0.5, -hh - PX * 0.3);
    ctx.quadraticCurveTo(PX * 2.2, -hh - PX * 0.5, PX * 2, -hh + PX);
    ctx.closePath();
    ctx.fill();
    // 毛绒质感 — 细小圆点
    ctx.fillStyle = '#ddeeff';
    for (let i = 0; i < 5; i++) {
      const fx = -PX * 1.5 + i * PX * 0.75;
      ctx.beginPath(); ctx.arc(fx, -hh + PX * 0.3, PX * 0.25, 0, Math.PI * 2); ctx.fill();
    }
    // V领内蓝色连衣裙
    ctx.fillStyle = '#88ccff';
    ctx.beginPath();
    ctx.moveTo(-PX * 1.5, -hh + PX);
    ctx.lineTo(0, -hh + PX * 4);
    ctx.lineTo(PX * 1.5, -hh + PX);
    ctx.closePath();
    ctx.fill();
    // 冰晶图案 — 六角雪花
    const cryY = -hh * 0.2 + breathe;
    ctx.strokeStyle = '#aaeeff';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * PX * 1.5, cryY + Math.sin(angle) * PX * 1.5);
      ctx.lineTo(-Math.cos(angle) * PX * 1.5, cryY - Math.sin(angle) * PX * 1.5);
      ctx.stroke();
    }
    // 冰晶中心点
    ctx.fillStyle = '#ccf0ff';
    ctx.beginPath(); ctx.arc(0, cryY, PX * 0.4, 0, Math.PI * 2); ctx.fill();
    // 横向褶皱线 — 裙装质感
    ctx.strokeStyle = shiftColor(outfit.shirt, 15);
    ctx.lineWidth = 0.6;
    for (let i = 0; i < 3; i++) {
      const yy = hh * 0.15 + i * PX;
      ctx.beginPath();
      ctx.moveTo(-ww + 3, yy);
      ctx.lineTo(ww - 3, yy);
      ctx.stroke();
    }
    // 小蝴蝶结 — 腰间
    ctx.fillStyle = '#66aaee';
    ctx.beginPath();
    ctx.moveTo(0, hh * 0.5);
    ctx.lineTo(-PX, hh * 0.5 - PX * 0.5);
    ctx.lineTo(0, hh * 0.5 + PX * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, hh * 0.5);
    ctx.lineTo(PX, hh * 0.5 - PX * 0.5);
    ctx.lineTo(0, hh * 0.5 + PX * 0.3);
    ctx.closePath();
    ctx.fill();

  } else if (charId === 'robert') {
    // 罗伯特: 绿色道服+V领+腰带+交叉前襟
    ctx.strokeStyle = shiftColor(outfit.shirt, -25);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-PX * 2.5, -hh + PX);
    ctx.lineTo(0, -hh + PX * 5);
    ctx.lineTo(PX * 2.5, -hh + PX);
    ctx.stroke();
    // 交叉前襟
    ctx.fillStyle = shiftColor(outfit.shirt, 8);
    ctx.beginPath();
    ctx.moveTo(-PX * 2, -hh + PX);
    ctx.lineTo(PX * 0.5, -hh + PX * 5);
    ctx.lineTo(-PX * 0.3, hh * 0.3);
    ctx.lineTo(-PX * 2, hh * 0.2);
    ctx.closePath();
    ctx.fill();
    // 腰带
    ctx.fillStyle = '#884422';
    ctx.fillRect(-PX * 2, hh * 0.45, PX * 4, PX);
    ctx.strokeStyle = shiftColor(outfit.shirt, -12);
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(-PX * 1.5, -hh + PX * 3); ctx.lineTo(-PX * 2, hh * 0.4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(PX * 1.5, -hh + PX * 3); ctx.lineTo(PX * 2, hh * 0.4); ctx.stroke();

  } else if (charId === 'athena') {
    // 雅典娜: 水手服+蝴蝶结+白色领子
    // 水手领 — 左右两片翻领
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-sw * 0.55, -hh + PX);
    ctx.lineTo(-sw * 0.85, -hh - PX);
    ctx.lineTo(-sw * 0.15, -hh + PX * 3);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(sw * 0.55, -hh + PX);
    ctx.lineTo(sw * 0.85, -hh - PX);
    ctx.lineTo(sw * 0.15, -hh + PX * 3);
    ctx.closePath();
    ctx.fill();
    // 领子上的条纹
    ctx.strokeStyle = shiftColor(outfit.shirt, -10);
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-sw * 0.5, -hh + PX); ctx.lineTo(0, -hh + PX * 3); ctx.lineTo(sw * 0.5, -hh + PX); ctx.stroke();
    // 红色蝴蝶结
    ctx.fillStyle = '#cc2222';
    ctx.beginPath();
    ctx.moveTo(0, -hh + PX * 1.5);
    ctx.lineTo(-PX * 2, -hh + PX * 0.5);
    ctx.quadraticCurveTo(-PX * 1.5, -hh + PX * 1.5, 0, -hh + PX * 2.2);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, -hh + PX * 1.5);
    ctx.lineTo(PX * 2, -hh + PX * 0.5);
    ctx.quadraticCurveTo(PX * 1.5, -hh + PX * 1.5, 0, -hh + PX * 2.2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#aa1111';
    ctx.beginPath(); ctx.arc(0, -hh + PX * 1.5, PX * 0.5, 0, Math.PI * 2); ctx.fill();

  } else if (charId === 'mai') {
    // 舞: 红色忍服+胸前交叉带+流苏+金色饰品
    ctx.fillStyle = shiftColor(outfit.shirt, 20);
    ctx.beginPath();
    ctx.moveTo(-PX * 0.8, -hh + PX);
    ctx.lineTo(0, -hh + PX * 5);
    ctx.lineTo(PX * 0.8, -hh + PX);
    ctx.closePath();
    ctx.fill();
    // 胸前交叉装饰
    ctx.strokeStyle = '#ff88aa';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-PX * 2, -hh + PX * 1.5);
    ctx.quadraticCurveTo(-PX * 0.5, -hh + PX * 4, 0, -hh + PX * 5);
    ctx.quadraticCurveTo(PX * 0.5, -hh + PX * 4, PX * 2, -hh + PX * 1.5);
    ctx.stroke();
    // 流苏装饰 — 多根
    ctx.strokeStyle = '#ffcc44';
    ctx.lineWidth = 1;
    for (let i = -2; i <= 2; i++) {
      const sway = Math.sin(_tick / 20 + i) * PX * 0.3;
      ctx.beginPath();
      ctx.moveTo(i * PX * 0.6, -hh + PX * 5);
      ctx.quadraticCurveTo(i * PX * 0.6 + sway, -hh + PX * 7, i * PX * 0.4 + sway, -hh + PX * 9);
      ctx.stroke();
    }
    // 金色饰品
    ctx.fillStyle = '#ffcc44';
    ctx.beginPath(); ctx.arc(0, -hh + PX * 5, PX * 0.6, 0, Math.PI * 2); ctx.fill();

  } else if (charId === 'clark') {
    // 克拉克: 坦克衫+背带+狗牌+肩带
    ctx.strokeStyle = shiftColor(outfit.shirt, -20);
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-sw * 0.35, -hh + 1); ctx.lineTo(-sw * 0.25, hh * 0.4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sw * 0.35, -hh + 1); ctx.lineTo(sw * 0.25, hh * 0.4); ctx.stroke();
    // U型领口
    ctx.strokeStyle = shiftColor(outfit.shirt, 15);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-PX * 1.5, -hh + PX);
    ctx.quadraticCurveTo(0, -hh + PX * 4, PX * 1.5, -hh + PX);
    ctx.stroke();
    // 狗牌 — 两枚+链条
    ctx.strokeStyle = '#aa8833';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(-PX * 0.8, -hh + PX * 1.5);
    ctx.quadraticCurveTo(0, -hh * 0.15, PX * 0.8, -hh + PX * 1.5);
    ctx.stroke();
    ctx.fillStyle = '#cc9933';
    ctx.beginPath(); ctx.arc(-PX * 0.3, -hh * 0.05, PX * 0.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#aa7722';
    ctx.beginPath(); ctx.arc(PX * 0.4, -hh * 0.05 + PX * 0.4, PX * 0.4, 0, Math.PI * 2); ctx.fill();

  } else if (charId === 'ralf') {
    // 拉尔夫: 军用背心+坦克衫内衬+口袋+肩章
    ctx.fillStyle = shiftColor(outfit.shirt, 25);
    ctx.fillRect(-sw * 0.35, -hh + PX, sw * 0.7, h * 0.35);
    ctx.fillStyle = shiftColor(outfit.shirt, -8);
    ctx.fillRect(-sw * 0.9, -hh + PX, sw * 0.35, h * 0.5);
    ctx.fillRect(sw * 0.55, -hh + PX, sw * 0.35, h * 0.5);
    // 口袋+盖
    ctx.strokeStyle = shiftColor(outfit.shirt, -18);
    ctx.lineWidth = 1;
    ctx.strokeRect(-sw * 0.75, -hh * 0.1, PX * 2.8, PX * 2.2);
    ctx.strokeRect(sw * 0.15, -hh * 0.1, PX * 2.8, PX * 2.2);
    ctx.fillStyle = shiftColor(outfit.shirt, -12);
    ctx.fillRect(-sw * 0.75, -hh * 0.1, PX * 2.8, PX * 0.5);
    ctx.fillRect(sw * 0.15, -hh * 0.1, PX * 2.8, PX * 0.5);
    // V领
    ctx.strokeStyle = shiftColor(outfit.shirt, -25);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-PX * 1.5, -hh + PX); ctx.lineTo(0, -hh + PX * 4); ctx.lineTo(PX * 1.5, -hh + PX);
    ctx.stroke();

  } else if (charId === 'joe') {
    // 乔: 泰拳背心+胸部绑带+开胸
    ctx.fillStyle = shiftColor(outfit.shirt, 15);
    ctx.beginPath();
    ctx.moveTo(-PX, -hh + PX); ctx.lineTo(-sw * 0.75, -hh + PX);
    ctx.lineTo(-sw * 0.55, hh * 0.3); ctx.lineTo(-PX * 0.3, -hh + PX * 5);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(PX, -hh + PX); ctx.lineTo(sw * 0.75, -hh + PX);
    ctx.lineTo(sw * 0.55, hh * 0.3); ctx.lineTo(PX * 0.3, -hh + PX * 5);
    ctx.closePath(); ctx.fill();
    // 绑带
    ctx.strokeStyle = '#ffcc00';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-PX * 0.6, -hh + PX * 2); ctx.lineTo(PX * 0.6, -hh + PX * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-PX * 0.3, -hh + PX * 4); ctx.lineTo(PX * 0.3, -hh + PX * 4); ctx.stroke();
    ctx.strokeStyle = shiftColor(outfit.shirt, -25);
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(-PX, -hh + PX); ctx.lineTo(0, -hh + PX * 6); ctx.lineTo(PX, -hh + PX); ctx.stroke();

  } else if (charId === 'andy') {
    // 安迪: 忍者服+交叉带+斜襟
    ctx.fillStyle = shiftColor(outfit.shirt, 10);
    ctx.beginPath();
    ctx.moveTo(-sw * 0.65, -hh + PX);
    ctx.lineTo(PX * 0.5, -hh + PX * 6);
    ctx.lineTo(sw * 0.45, -hh + PX);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-PX * 2, -hh + PX); ctx.lineTo(PX * 2, hh * 0.3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(PX * 2, -hh + PX); ctx.lineTo(-PX * 2, hh * 0.3); ctx.stroke();
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(-PX * 2.5, hh * 0.5, PX * 5, PX);

  } else if (charId === 'billy') {
    // 比利: 衬衫+背带+纽扣
    ctx.strokeStyle = shiftColor(outfit.shirt, -20);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-PX * 1.2, -hh + PX);
    ctx.quadraticCurveTo(0, -hh + PX * 3, PX * 1.2, -hh + PX);
    ctx.stroke();
    ctx.strokeStyle = '#664422';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-sw * 0.4, -hh + 1); ctx.lineTo(-sw * 0.3, hh * 0.3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sw * 0.4, -hh + 1); ctx.lineTo(sw * 0.3, hh * 0.3); ctx.stroke();
    ctx.fillStyle = '#ccaa44';
    ctx.beginPath(); ctx.arc(-sw * 0.35, -hh * 0.15, PX * 0.6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(sw * 0.35, -hh * 0.15, PX * 0.6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ddd';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath(); ctx.arc(0, -hh * 0.1 + i * PX * 2, PX * 0.35, 0, Math.PI * 2); ctx.fill();
    }

  } else if (charId === 'chang') {
    // 陈: 囚服条纹+编号牌+粗腰带
    ctx.fillStyle = shiftColor(outfit.shirt, -20);
    for (let i = 0; i < 5; i++) {
      const stripeY = -hh + PX * 2 + i * PX * 2;
      ctx.fillRect(-sw + 2, stripeY, (sw - 2) * 2, PX * 0.8);
    }
    ctx.strokeStyle = shiftColor(outfit.shirt, -30);
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-PX * 2, -hh + PX); ctx.lineTo(0, -hh + PX * 4); ctx.lineTo(PX * 2, -hh + PX); ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.fillRect(-PX * 1.5, -hh * 0.3, PX * 3, PX * 1.5);
    ctx.fillStyle = '#333';
    ctx.fillRect(-PX * 1.2, -hh * 0.25, PX * 2.4, PX * 1);

  } else if (charId === 'choi') {
    // 蔡: 紧身衣+拉链
    ctx.strokeStyle = '#bbb';
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(0, -hh + PX); ctx.lineTo(0, hh * 0.5); ctx.stroke();
    ctx.fillStyle = '#ddd';
    ctx.fillRect(-PX * 0.4, -hh + PX, PX * 0.8, PX * 0.8);
    ctx.strokeStyle = shiftColor(outfit.shirt, -20);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-PX * 1, -hh + PX * 0.5);
    ctx.quadraticCurveTo(0, -hh + PX * 2.5, PX * 1, -hh + PX * 0.5);
    ctx.stroke();

  } else if (charId === 'mature') {
    // Mature: 裘皮领+低V领+胸针+装饰线
    ctx.fillStyle = '#ddbbaa';
    ctx.beginPath();
    ctx.moveTo(-sw * 0.65, -hh + PX);
    ctx.quadraticCurveTo(-sw * 0.85, -hh - PX, -sw * 0.3, -hh - PX * 0.8);
    ctx.quadraticCurveTo(0, -hh - PX * 1.5, sw * 0.3, -hh - PX * 0.8);
    ctx.quadraticCurveTo(sw * 0.85, -hh - PX, sw * 0.65, -hh + PX);
    ctx.closePath(); ctx.fill();
    // 毛绒质感
    ctx.fillStyle = '#ccaa99';
    for (let i = 0; i < 6; i++) {
      const fx = -sw * 0.5 + i * sw * 0.2;
      ctx.beginPath(); ctx.arc(fx, -hh + PX * 0.2, PX * 0.3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.strokeStyle = shiftColor(outfit.shirt, 20);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-PX * 1.5, -hh + PX * 1.5);
    ctx.quadraticCurveTo(0, -hh + PX * 6, PX * 1.5, -hh + PX * 1.5);
    ctx.stroke();
    ctx.fillStyle = '#cc88cc';
    ctx.beginPath(); ctx.arc(-PX * 0.5, -hh + PX * 2, PX * 0.6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#dd99dd';
    ctx.beginPath(); ctx.arc(-PX * 0.5, -hh + PX * 2, PX * 0.3, 0, Math.PI * 2); ctx.fill();

  } else if (charId === 'yashiro') {
    // Yashiro: 敞开背心+裸胸+项链
    const skinColor = '#d4a87a';
    ctx.fillStyle = skinColor;
    ctx.fillRect(-sw * 0.35, -hh + PX * 2, sw * 0.7, h * 0.4);
    // 胸肌暗示
    ctx.strokeStyle = shiftColor(skinColor, -12);
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(-sw * 0.1, -hh + PX * 3);
    ctx.quadraticCurveTo(-sw * 0.15, hh * 0.05, -sw * 0.1, hh * 0.15);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(sw * 0.1, -hh + PX * 3);
    ctx.quadraticCurveTo(sw * 0.15, hh * 0.05, sw * 0.1, hh * 0.15);
    ctx.stroke();
    // 中线
    ctx.strokeStyle = shiftColor(skinColor, -8);
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(0, -hh + PX * 4); ctx.lineTo(0, hh * 0.1); ctx.stroke();
    // 背心
    ctx.fillStyle = shiftColor(outfit.shirt, -5);
    ctx.fillRect(-sw * 0.95, -hh + PX, sw * 0.35, h * 0.55);
    ctx.fillRect(sw * 0.6, -hh + PX, sw * 0.35, h * 0.55);
    // 项链
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-PX * 1.8, -hh + PX * 2);
    ctx.quadraticCurveTo(0, -hh + PX * 5, PX * 1.8, -hh + PX * 2);
    ctx.stroke();
    ctx.fillStyle = '#ddd';
    ctx.beginPath(); ctx.arc(0, -hh + PX * 4, PX * 0.5, 0, Math.PI * 2); ctx.fill();

  } else if (charId === 'chris') {
    // Chris: 休闲衬衫+领子+星星纹章+纽扣
    ctx.fillStyle = shiftColor(outfit.shirt, 15);
    ctx.beginPath();
    ctx.moveTo(-PX * 1.5, -hh + PX);
    ctx.lineTo(-PX * 0.5, -hh - PX * 0.5);
    ctx.lineTo(0, -hh + PX * 1.5);
    ctx.lineTo(PX * 0.5, -hh - PX * 0.5);
    ctx.lineTo(PX * 1.5, -hh + PX);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = shiftColor(outfit.shirt, -20);
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-PX * 0.5, -hh + PX); ctx.lineTo(0, -hh + PX * 4); ctx.lineTo(PX * 0.5, -hh + PX); ctx.stroke();
    drawStarEmblem(ctx, sw * 0.35, -hh * 0.2, PX * 0.9, '#ffcc00', '#ff8800');
    ctx.fillStyle = shiftColor(outfit.shirt, -15);
    ctx.beginPath(); ctx.arc(0, -hh * 0.05, PX * 0.35, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(0, hh * 0.15, PX * 0.35, 0, Math.PI * 2); ctx.fill();

  } else if (charId === 'shermie') {
    // Shermie: 层叠上衣+斜拉链+高领
    ctx.fillStyle = shiftColor(outfit.shirt, 20);
    ctx.fillRect(-sw * 0.65, -hh + PX, sw * 1.3, h * 0.28);
    ctx.fillStyle = shiftColor(outfit.shirt, -10);
    ctx.fillRect(-sw * 0.75, -hh + h * 0.3, sw * 1.5, h * 0.22);
    ctx.strokeStyle = shiftColor(outfit.shirt, 30);
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-sw * 0.65, -hh + h * 0.3); ctx.lineTo(sw * 0.65, -hh + h * 0.3); ctx.stroke();
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(sw * 0.3, -hh + PX * 2); ctx.lineTo(-PX * 0.5, hh * 0.4); ctx.stroke();
    for (let i = 0; i < 6; i++) {
      const t = i / 6;
      const zx = sw * 0.3 * (1 - t) - PX * 0.5 * t;
      const zy = -hh + PX * 2 + t * (hh * 0.4 - (-hh + PX * 2));
      ctx.fillStyle = '#ccc';
      ctx.fillRect(zx - PX * 0.2, zy, PX * 0.4, 1);
    }
    ctx.fillStyle = shiftColor(outfit.shirt, 10);
    ctx.beginPath();
    ctx.moveTo(-PX * 1.2, -hh);
    ctx.lineTo(-PX * 1.5, -hh - PX * 0.8);
    ctx.quadraticCurveTo(0, -hh - PX * 1.3, PX * 1.5, -hh - PX * 0.8);
    ctx.lineTo(PX * 1.2, -hh);
    ctx.closePath(); ctx.fill();

  } else if (charId === 'vice') {
    // Vice: 深蓝夹克+高领+翻领+拉链
    ctx.fillStyle = shiftColor(outfit.shirt, -15);
    ctx.beginPath();
    ctx.moveTo(-PX * 1.8, -hh);
    ctx.lineTo(-PX * 2.2, -hh - PX * 1.2);
    ctx.quadraticCurveTo(0, -hh - PX * 2, PX * 2.2, -hh - PX * 1.2);
    ctx.lineTo(PX * 1.8, -hh);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = shiftColor(outfit.shirt, 25);
    ctx.fillRect(-PX, -hh + PX * 2, PX * 2, h * 0.3);
    ctx.fillStyle = shiftColor(outfit.shirt, -8);
    ctx.beginPath();
    ctx.moveTo(-PX * 1.8, -hh); ctx.lineTo(-PX * 0.5, -hh + PX * 5); ctx.lineTo(-PX * 0.3, -hh + PX); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(PX * 1.8, -hh); ctx.lineTo(PX * 0.5, -hh + PX * 5); ctx.lineTo(PX * 0.3, -hh + PX); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#667';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, -hh + PX * 3); ctx.lineTo(0, hh * 0.5); ctx.stroke();

  } else if (charId === 'yamazaki') {
    // Yamazaki: 西装+领带+衬衫
    ctx.fillStyle = '#e8e0d0';
    ctx.fillRect(-sw * 0.35, -hh + PX * 2, sw * 0.7, h * 0.4);
    ctx.fillStyle = shiftColor(outfit.shirt, -5);
    ctx.fillRect(-sw * 0.95, -hh + PX, sw * 0.4, h * 0.55);
    ctx.fillRect(sw * 0.55, -hh + PX, sw * 0.4, h * 0.55);
    // 翻领
    ctx.fillStyle = shiftColor(outfit.shirt, 8);
    ctx.beginPath();
    ctx.moveTo(-PX * 1.5, -hh); ctx.lineTo(-PX * 0.3, -hh + PX * 5); ctx.lineTo(-sw * 0.45, -hh + PX); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(PX * 1.5, -hh); ctx.lineTo(PX * 0.3, -hh + PX * 5); ctx.lineTo(sw * 0.45, -hh + PX); ctx.closePath(); ctx.fill();
    // 领带
    ctx.fillStyle = '#882222';
    ctx.beginPath();
    ctx.moveTo(0, -hh + PX * 2);
    ctx.lineTo(-PX * 0.6, -hh + PX * 4);
    ctx.lineTo(0, hh * 0.4);
    ctx.lineTo(PX * 0.6, -hh + PX * 4);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ddd';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath(); ctx.arc(0, -hh * 0.1 + i * PX * 2, PX * 0.3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#cc2222';
    ctx.fillRect(sw * 0.45, -hh * 0.2, PX * 1.8, PX * 1.4);

  } else if (charId === 'mary') {
    // Mary: 牛仔外套+内衬T恤+按扣+缝线
    ctx.fillStyle = shiftColor(outfit.shirt, 10);
    ctx.beginPath();
    ctx.moveTo(-PX * 1.5, -hh); ctx.lineTo(-PX * 0.3, -hh + PX * 5); ctx.lineTo(-sw * 0.55, -hh + PX); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(PX * 1.5, -hh); ctx.lineTo(PX * 0.3, -hh + PX * 5); ctx.lineTo(sw * 0.55, -hh + PX); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillRect(-sw * 0.3, -hh + PX * 2, sw * 0.6, h * 0.25);
    ctx.strokeStyle = '#ffcc44';
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(-sw * 0.7, -hh + PX * 2); ctx.lineTo(-sw * 0.65, hh * 0.3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sw * 0.7, -hh + PX * 2); ctx.lineTo(sw * 0.65, hh * 0.3); ctx.stroke();
    // 缝线点
    for (let i = 0; i < 4; i++) {
      const dy = -hh + PX * 3 + i * PX * 1.5;
      ctx.fillStyle = '#ffcc44';
      ctx.fillRect(-sw * 0.68, dy, 2, 2);
      ctx.fillRect(sw * 0.66, dy, 2, 2);
    }
    ctx.fillStyle = '#ccaa44';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath(); ctx.arc(-sw * 0.25, -hh * 0.05 + i * PX * 2, PX * 0.4, 0, Math.PI * 2); ctx.fill();
    }

  } else if (charId === 'kasumi') {
    // Kasumi: 道服+交领+系带
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(-sw * 0.75, -hh + PX);
    ctx.lineTo(PX * 0.8, -hh + PX * 6);
    ctx.lineTo(-PX * 0.3, hh * 0.3);
    ctx.lineTo(-sw * 0.55, hh * 0.2);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = shiftColor('#fff', -5);
    ctx.beginPath();
    ctx.moveTo(sw * 0.75, -hh + PX);
    ctx.lineTo(-PX * 0.3, -hh + PX * 6);
    ctx.lineTo(PX * 0.3, hh * 0.3);
    ctx.lineTo(sw * 0.55, hh * 0.2);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-PX * 1.5, -hh + PX); ctx.lineTo(0, -hh + PX * 6); ctx.lineTo(PX * 1.5, -hh + PX); ctx.stroke();
    ctx.fillStyle = '#dd4466';
    ctx.fillRect(-PX * 2.5, hh * 0.45, PX * 5, PX);
    ctx.beginPath(); ctx.arc(PX * 0.3, -hh + PX * 5, PX * 0.4, 0, Math.PI * 2); ctx.fill();

  } else if (charId === 'xiangfei') {
    // Xiangfei: 中式服装+立领+斜襟+盘扣
    ctx.fillStyle = shiftColor(outfit.shirt, 15);
    ctx.beginPath();
    ctx.moveTo(-PX * 1.2, -hh);
    ctx.lineTo(-PX * 1.5, -hh - PX);
    ctx.lineTo(-PX * 0.3, -hh - PX * 0.4);
    ctx.lineTo(PX * 0.3, -hh - PX * 0.4);
    ctx.lineTo(PX * 1.5, -hh - PX);
    ctx.lineTo(PX * 1.2, -hh);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = shiftColor(outfit.shirt, 10);
    ctx.beginPath();
    ctx.moveTo(-PX, -hh + PX);
    ctx.lineTo(sw * 0.35, -hh + PX * 2);
    ctx.lineTo(sw * 0.25, hh * 0.5);
    ctx.lineTo(-PX * 0.5, hh * 0.4);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#ffcc44';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 3; i++) {
      const by = -hh + PX * 2.5 + i * PX * 2;
      const bx = -PX * 0.2 + i * PX * 0.5;
      ctx.beginPath(); ctx.arc(bx, by, PX * 0.45, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bx + PX * 0.45, by); ctx.lineTo(bx + PX * 1.2, by); ctx.stroke();
    }
    ctx.strokeStyle = '#ffcc44';
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(-PX, -hh + PX); ctx.lineTo(-PX * 0.3, hh * 0.4); ctx.stroke();
  }
}

/** 画五角星纹章 — 用于Terry等角色的标志性装饰 */
function drawStarEmblem(
  ctx: CanvasRenderingContext2D, cx: number, cy: number,
  size: number, fillColor: string, strokeColor: string,
): void {
  ctx.fillStyle = fillColor;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const x = cx + Math.cos(angle) * size;
    const y = cy + Math.sin(angle) * size;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 0.8;
  ctx.stroke();
}

/** 画像素风格手臂 — 锥形(肩宽→肘中→腕窄→拳击手套拳) + 肘关节 + 椭圆拳击手套 */
export function drawPixelArm(
  ctx: CanvasRenderingContext2D, charId: string, w: number, h: number, isBack: boolean,
  colorIndex?: number,
): void {
  const outfit = getOutfit(charId, colorIndex);
  const hw = w / 2, hh = h / 2;
  const skinColor = '#e8b88a';
  const skinDark = shiftColor(skinColor, -10);
  const skinLight = shiftColor(skinColor, 12);

  const sleeveH = h * 0.3;
  const shirtColor = isBack ? shiftColor(outfit.shirt, -8) : outfit.shirt;

  // 锥形宽度: 肩部hw → 肘部(0.7*hw) → 腕部(0.5*hw)
  const shoulderHW = hw;
  const elbowHW = hw * 0.7;
  const wristHW = hw * 0.5;
  const elbowY = -hh + sleeveH;
  const midForearmY = -hh + sleeveH + (h * 0.55) * 0.5;
  const wristY = -hh + sleeveH + h * 0.55;

  // 袖子 — 锥形(肩→肘) + 渐变质感
  ctx.fillStyle = shirtColor;
  ctx.beginPath();
  ctx.moveTo(-shoulderHW, -hh);
  ctx.lineTo(shoulderHW, -hh);
  ctx.lineTo(elbowHW, elbowY);
  ctx.lineTo(-elbowHW, elbowY);
  ctx.closePath();
  ctx.fill();
  // 袖子高光
  ctx.fillStyle = shiftColor(shirtColor, 18);
  ctx.beginPath();
  ctx.moveTo(-shoulderHW + 1, -hh + 1);
  ctx.lineTo(shoulderHW - 1, -hh + 1);
  ctx.lineTo(elbowHW - 1, elbowY - sleeveH * 0.15);
  ctx.lineTo(-elbowHW + 1, elbowY - sleeveH * 0.15);
  ctx.closePath();
  ctx.fill();
  // 袖子暗影
  ctx.fillStyle = shiftColor(shirtColor, -12);
  ctx.beginPath();
  ctx.moveTo(-elbowHW + 1, elbowY - sleeveH * 0.25);
  ctx.lineTo(elbowHW - 1, elbowY - sleeveH * 0.25);
  ctx.lineTo(elbowHW - 1, elbowY);
  ctx.lineTo(-elbowHW + 1, elbowY);
  ctx.closePath();
  ctx.fill();

  // 前臂 — 锥形皮肤(肘→腕)
  ctx.fillStyle = isBack ? shiftColor(skinColor, -8) : skinColor;
  ctx.beginPath();
  ctx.moveTo(-elbowHW, elbowY);
  ctx.lineTo(elbowHW, elbowY);
  ctx.lineTo(wristHW, wristY);
  ctx.lineTo(-wristHW, wristY);
  ctx.closePath();
  ctx.fill();
  // 前臂高光
  ctx.fillStyle = skinLight;
  ctx.beginPath();
  ctx.moveTo(-elbowHW + 2, elbowY);
  ctx.lineTo(-elbowHW * 0.4, elbowY);
  ctx.lineTo(-wristHW * 0.3, wristY);
  ctx.lineTo(-wristHW, wristY);
  ctx.closePath();
  ctx.fill();

  // 肘关节圆
  const elbowR = Math.max(2, elbowHW * 0.35);
  ctx.fillStyle = shiftColor(skinColor, -6);
  ctx.beginPath();
  ctx.arc(0, elbowY, elbowR, 0, Math.PI * 2);
  ctx.fill();
  // 肘关节高光
  ctx.fillStyle = shiftColor(skinColor, 12);
  ctx.beginPath();
  ctx.arc(-elbowR * 0.2, elbowY - elbowR * 0.25, elbowR * 0.4, 0, Math.PI * 2);
  ctx.fill();

  // 手掌 — 椭圆拳击手套形状
  const fistY = hh - h * 0.15;
  const fistW = hw * 0.95;   // 手套宽度(比腕宽大)
  const fistH = h * 0.18;    // 手套高度
  ctx.fillStyle = skinColor;
  ctx.beginPath();
  ctx.ellipse(0, fistY + fistH * 0.3, fistW, fistH, 0, 0, Math.PI * 2);
  ctx.fill();
  // 拳套暗影侧
  ctx.fillStyle = skinDark;
  ctx.beginPath();
  ctx.ellipse(fistW * 0.2, fistY + fistH * 0.35, fistW * 0.6, fistH * 0.85, 0.15, 0, Math.PI * 2);
  ctx.fill();
  // 手指暗示线
  ctx.strokeStyle = skinDark;
  ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(-fistW * 0.35, fistY + 1); ctx.lineTo(-fistW * 0.35, fistY + h * 0.1); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(fistW * 0.1, fistY + 1); ctx.lineTo(fistW * 0.1, fistY + h * 0.1); ctx.stroke();

  // 角色专属手套/护腕/手部细节
  drawArmDetail(ctx, charId, w, h, hw, hh, sleeveH, fistY, skinColor, shirtColor, isBack);

  // SNK风格轮廓线 — 沿锥形路径描边
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = OUTLINE_WIDTH;
  ctx.lineJoin = 'round';
  // 上臂轮廓
  ctx.beginPath();
  ctx.moveTo(-shoulderHW, -hh);
  ctx.lineTo(shoulderHW, -hh);
  ctx.lineTo(elbowHW, elbowY);
  ctx.lineTo(-elbowHW, elbowY);
  ctx.closePath();
  ctx.stroke();
  // 前臂轮廓
  ctx.beginPath();
  ctx.moveTo(-elbowHW, elbowY);
  ctx.lineTo(elbowHW, elbowY);
  ctx.lineTo(wristHW, wristY);
  ctx.lineTo(-wristHW, wristY);
  ctx.closePath();
  ctx.stroke();
  // 拳套轮廓 — 椭圆描边
  ctx.beginPath();
  ctx.ellipse(0, fistY + fistH * 0.3, fistW + 1, fistH + 1, 0, 0, Math.PI * 2);
  ctx.stroke();

  // 袖口分界线 — 加粗+阴影
  ctx.strokeStyle = shiftColor(outfit.shirt, -30);
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-elbowHW, elbowY);
  ctx.lineTo(elbowHW, elbowY);
  ctx.stroke();
  ctx.strokeStyle = shiftColor(outfit.shirt, 10);
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(-elbowHW + 1, elbowY + 1);
  ctx.lineTo(elbowHW - 1, elbowY + 1);
  ctx.stroke();
}

/** 角色专属手臂/手套细节 */
function drawArmDetail(
  ctx: CanvasRenderingContext2D, charId: string, w: number, h: number,
  hw: number, hh: number, sleeveH: number, fistY: number,
  skinColor: string, shirtColor: string, isBack: boolean,
): void {
  if (charId === 'kyo') {
    // 京: 黑色半指手套+袖口红色护腕带
    ctx.fillStyle = '#2a2a3a';
    ctx.fillRect(-hw + 1, fistY - 2, w - 2, h * 0.12);
    ctx.fillStyle = '#cc3300';
    ctx.fillRect(-hw + 1, -hh + sleeveH - 3, w - 2, 5);
    // 护腕带扣
    ctx.fillStyle = '#ffaa00';
    ctx.fillRect(-1, -hh + sleeveH - 2, 2, 3);
  } else if (charId === 'iori') {
    // 庵: 紫黑色护腕+指尖露出
    ctx.fillStyle = '#2a1a3a';
    ctx.fillRect(-hw + 1, -hh + sleeveH - 2, w - 2, 5);
    ctx.fillStyle = '#4a2a5a';
    ctx.fillRect(-hw + 1, fistY - 2, w - 2, 3);
    // 指甲暗示 — 八神爪式格斗
    ctx.fillStyle = '#880022';
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(-hw * 0.5 + i * hw * 0.4, fistY + h * 0.08, 1, 2);
    }
  } else if (charId === 'terry') {
    // 特瑞: 红色拳击手套+白色腕带
    ctx.fillStyle = '#cc2222';
    roundRect(ctx, -hw * 0.85, fistY - 3, w * 0.85, h * 0.17, 3);
    ctx.fill();
    // 手套缝线
    ctx.strokeStyle = '#ee4444';
    ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.moveTo(-hw * 0.5, fistY - 1); ctx.lineTo(-hw * 0.5, fistY + h * 0.1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hw * 0.1, fistY - 1); ctx.lineTo(hw * 0.1, fistY + h * 0.1); ctx.stroke();
    // 白色腕带
    ctx.fillStyle = '#fff';
    ctx.fillRect(-hw + 1, fistY - 5, w - 2, 3);
  } else if (charId === 'kim') {
    // 金: 白色道服护腕+蓝色边
    ctx.fillStyle = '#e8e8e8';
    ctx.fillRect(-hw + 1, -hh + sleeveH - 3, w - 2, 5);
    ctx.strokeStyle = '#2244aa';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-hw + 1, -hh + sleeveH - 1); ctx.lineTo(hw - 1, -hh + sleeveH - 1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-hw + 1, -hh + sleeveH + 1); ctx.lineTo(hw - 1, -hh + sleeveH + 1); ctx.stroke();
  } else if (charId === 'ryo') {
    // Ryo: Karate gi sleeve with cuff + hand wraps + proper karate fist
    // === Sleeve cuff detail — gi sleeve opening with fold ===
    // Sleeve cuff fold — fabric rolls at the edge
    ctx.fillStyle = shiftColor(shirtColor, -15);
    ctx.fillRect(-hw, -hh + sleeveH - 3, w, 3);
    // Cuff highlight — lighter inner edge of fold
    ctx.fillStyle = shiftColor(shirtColor, 20);
    ctx.fillRect(-hw + 1, -hh + sleeveH - 1, w - 2, 1.5);
    // Cuff shadow — depth under the fold
    ctx.fillStyle = shiftColor(shirtColor, -25);
    ctx.fillRect(-hw + 1, -hh + sleeveH, w - 2, 1.5);
    // Sleeve fabric fold lines — gi wrinkles
    ctx.strokeStyle = shiftColor(shirtColor, -10);
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(-hw * 0.3, -hh + sleeveH * 0.3);
    ctx.lineTo(-hw * 0.5, -hh + sleeveH * 0.7);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(hw * 0.2, -hh + sleeveH * 0.2);
    ctx.lineTo(hw * 0.1, -hh + sleeveH * 0.65);
    ctx.stroke();

    // === Forearm — muscular kyokugen karateka forearm ===
    // Forearm muscle bulk
    ctx.fillStyle = shiftColor(skinColor, -6);
    ctx.fillRect(-hw * 0.85, -hh + sleeveH + h * 0.12, w * 0.3, h * 0.32);
    // Forearm tendon lines
    ctx.strokeStyle = shiftColor(skinColor, -12);
    ctx.lineWidth = 0.4;
    ctx.beginPath();
    ctx.moveTo(-hw * 0.15, -hh + sleeveH + h * 0.1);
    ctx.lineTo(-hw * 0.2, -hh + sleeveH + h * 0.4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(hw * 0.1, -hh + sleeveH + h * 0.08);
    ctx.lineTo(hw * 0.05, -hh + sleeveH + h * 0.38);
    ctx.stroke();
    // Forearm vein hint — subtle
    ctx.strokeStyle = shiftColor(skinColor, -5);
    ctx.lineWidth = 0.3;
    ctx.beginPath();
    ctx.moveTo(-hw * 0.5, -hh + sleeveH + h * 0.15);
    ctx.quadraticCurveTo(-hw * 0.35, -hh + sleeveH + h * 0.25, -hw * 0.4, -hh + sleeveH + h * 0.4);
    ctx.stroke();

    // === Wrist wraps — hand bandaging ===
    ctx.strokeStyle = '#e8e4dc';
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(-hw * 0.6, fistY - 5); ctx.lineTo(hw * 0.4, fistY - 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-hw * 0.4, fistY - 2); ctx.lineTo(hw * 0.5, fistY + 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-hw * 0.3, fistY + 1); ctx.lineTo(hw * 0.2, fistY + 4); ctx.stroke();

    // === Wrist guard — black karate guard ===
    ctx.fillStyle = '#222';
    ctx.fillRect(-hw * 0.85, fistY - 3, w * 0.85, 4);
    // Guard highlight
    ctx.fillStyle = '#333';
    ctx.fillRect(-hw * 0.8, fistY - 3, w * 0.8, 1.5);

    // === Karate fist — wider at knuckles, narrower at wrist ===
    const fistTop = fistY - 5;
    const fistBottom = fistY + h * 0.14;
    const fistKnuckleW = hw * 1.05;
    const fistWristW = hw * 0.75;
    // Fist base shape — trapezoid
    ctx.fillStyle = shiftColor(skinColor, 5);
    ctx.beginPath();
    ctx.moveTo(-fistKnuckleW, fistTop);
    ctx.lineTo(fistKnuckleW, fistTop);
    ctx.lineTo(fistWristW, fistBottom);
    ctx.lineTo(-fistWristW, fistBottom);
    ctx.closePath();
    ctx.fill();
    // Fist shadow side — 3D depth
    ctx.fillStyle = shiftColor(skinColor, -8);
    ctx.beginPath();
    ctx.moveTo(fistWristW * 0.3, fistTop + 1);
    ctx.lineTo(fistKnuckleW, fistTop);
    ctx.lineTo(fistWristW, fistBottom);
    ctx.lineTo(fistWristW * 0.3, fistBottom - 1);
    ctx.closePath();
    ctx.fill();
    // Knuckle ridge lines
    ctx.strokeStyle = shiftColor(skinColor, -15);
    ctx.lineWidth = 0.7;
    const knuckleLineY1 = fistTop + (fistBottom - fistTop) * 0.15;
    const knuckleLineY2 = fistTop + (fistBottom - fistTop) * 0.35;
    const knuckleLineY3 = fistTop + (fistBottom - fistTop) * 0.55;
    ctx.beginPath(); ctx.moveTo(-fistKnuckleW * 0.8, knuckleLineY1); ctx.lineTo(fistKnuckleW * 0.8, knuckleLineY1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-fistWristW * 0.75, knuckleLineY2); ctx.lineTo(fistWristW * 0.75, knuckleLineY2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-fistWristW * 0.65, knuckleLineY3); ctx.lineTo(fistWristW * 0.65, knuckleLineY3); ctx.stroke();
    // Knuckle bumps — 4 prominent
    ctx.fillStyle = shiftColor(skinColor, 10);
    for (let i = 0; i < 4; i++) {
      const bumpX = -fistKnuckleW * 0.6 + i * fistKnuckleW * 0.4;
      ctx.beginPath();
      ctx.arc(bumpX, fistTop + 1, fistKnuckleW * 0.16, 0, Math.PI * 2);
      ctx.fill();
    }
    // Knuckle highlight dots
    ctx.fillStyle = shiftColor(skinColor, 18);
    for (let i = 0; i < 4; i++) {
      const bumpX = -fistKnuckleW * 0.6 + i * fistKnuckleW * 0.4;
      ctx.beginPath();
      ctx.arc(bumpX - 0.5, fistTop + 0.5, fistKnuckleW * 0.06, 0, Math.PI * 2);
      ctx.fill();
    }
    // Thumb — side bump
    const thumbSide = isBack ? 1 : -1;
    ctx.fillStyle = shiftColor(skinColor, -3);
    ctx.beginPath();
    ctx.ellipse(thumbSide * fistKnuckleW * 0.88, fistTop + (fistBottom - fistTop) * 0.35,
      fistKnuckleW * 0.22, fistKnuckleW * 0.32, thumbSide * 0.3, 0, Math.PI * 2);
    ctx.fill();
    // Thumb nail hint
    ctx.fillStyle = shiftColor(skinColor, 15);
    ctx.beginPath();
    ctx.ellipse(thumbSide * fistKnuckleW * 0.92, fistTop + (fistBottom - fistTop) * 0.25,
      fistKnuckleW * 0.08, fistKnuckleW * 0.1, thumbSide * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // === Hand wrap texture — leather/strap cross-binding pattern ===
    // Wrap texture lines across the fist surface (karate hand wraps under gloves)
    ctx.strokeStyle = shiftColor('#e8e4dc', -8);
    ctx.lineWidth = 0.5;
    // Horizontal wrap bands
    for (let i = 0; i < 3; i++) {
      const wrapY = fistTop + (fistBottom - fistTop) * (0.2 + i * 0.25);
      const wrapWidthL = fistKnuckleW * (0.7 - i * 0.08);
      ctx.beginPath();
      ctx.moveTo(-wrapWidthL, wrapY);
      ctx.lineTo(wrapWidthL, wrapY);
      ctx.stroke();
    }
    // Diagonal wrap texture — X-pattern across back of hand
    ctx.strokeStyle = shiftColor('#e8e4dc', -4);
    ctx.lineWidth = 0.4;
    ctx.beginPath();
    ctx.moveTo(-fistKnuckleW * 0.5, fistTop + (fistBottom - fistTop) * 0.15);
    ctx.lineTo(fistKnuckleW * 0.3, fistTop + (fistBottom - fistTop) * 0.65);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(fistKnuckleW * 0.5, fistTop + (fistBottom - fistTop) * 0.15);
    ctx.lineTo(-fistKnuckleW * 0.3, fistTop + (fistBottom - fistTop) * 0.65);
    ctx.stroke();

    // === Glove leather texture — subtle grain lines matching gi color ===
    // Gi-colored leather patches on knuckles (karate sparring glove style)
    const glovePatchColor = shiftColor(shirtColor, -20);
    ctx.fillStyle = glovePatchColor;
    for (let i = 0; i < 4; i++) {
      const patchX = -fistKnuckleW * 0.55 + i * fistKnuckleW * 0.37;
      ctx.fillRect(patchX, fistTop - 1, fistKnuckleW * 0.25, (fistBottom - fistTop) * 0.2);
    }
    // Leather stitching lines on patches
    ctx.strokeStyle = shiftColor(glovePatchColor, 12);
    ctx.lineWidth = 0.3;
    for (let i = 0; i < 4; i++) {
      const patchX = -fistKnuckleW * 0.55 + i * fistKnuckleW * 0.37;
      const patchMidX = patchX + fistKnuckleW * 0.125;
      ctx.beginPath();
      ctx.moveTo(patchMidX, fistTop);
      ctx.lineTo(patchMidX, fistTop + (fistBottom - fistTop) * 0.18);
      ctx.stroke();
    }

    // === Impact glow on active attack frames ===
    // Triggered when the arm is scaled up (attack pose) — matches existing motion trail pattern
    const scale = w / (hw * 2 || 1);
    if (scale > 1.0) {
      const impactPulse = 0.4 + Math.sin(_tick * 0.5) * 0.2;
      // Radial glow around fist — warm orange/white burst
      const glowGrad = ctx.createRadialGradient(0, fistTop + (fistBottom - fistTop) * 0.3, 0,
        0, fistTop + (fistBottom - fistTop) * 0.3, fistKnuckleW * 1.5);
      glowGrad.addColorStop(0, `rgba(255, 240, 200, ${impactPulse})`);
      glowGrad.addColorStop(0.3, `rgba(255, 180, 60, ${impactPulse * 0.6})`);
      glowGrad.addColorStop(0.6, `rgba(255, 120, 20, ${impactPulse * 0.3})`);
      glowGrad.addColorStop(1, 'rgba(255, 100, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(0, fistTop + (fistBottom - fistTop) * 0.3, fistKnuckleW * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Bright impact line across knuckles
      ctx.strokeStyle = `rgba(255, 255, 220, ${impactPulse * 0.8})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-fistKnuckleW * 0.8, fistTop + 2);
      ctx.lineTo(fistKnuckleW * 0.8, fistTop + 2);
      ctx.stroke();

      // Attack motion trail — extending backward
      ctx.strokeStyle = `rgba(255, 160, 0, 0.3)`;
      ctx.lineWidth = 1.5;
      for (let i = 1; i <= 3; i++) {
        const trailAlpha = 0.3 - i * 0.08;
        ctx.strokeStyle = `rgba(255, 160, 0, ${trailAlpha})`;
        ctx.beginPath();
        ctx.moveTo(-hw - i * 3, fistTop + i * 2);
        ctx.lineTo(-hw - i * 3, fistBottom - i * 2);
        ctx.stroke();
      }
    }
  } else if (charId === 'leona') {
    // 莉安娜: 军用护腕+深蓝
    ctx.fillStyle = '#224466';
    ctx.fillRect(-hw + 1, -hh + sleeveH - 3, w - 2, 5);
    // 护腕扣
    ctx.fillStyle = '#aaa';
    ctx.fillRect(-1, -hh + sleeveH - 2, 2, 3);
  } else if (charId === 'kdash') {
    // K': 红色皮手套 — 特殊护手
    ctx.fillStyle = '#ff4400';
    roundRect(ctx, -hw * 0.85, fistY - 3, w * 0.85, h * 0.17, 2);
    ctx.fill();
    // 手套上的Rex标识暗示
    ctx.fillStyle = '#cc2200';
    ctx.fillRect(-hw * 0.4, fistY, w * 0.3, 2);
  } else if (charId === 'kula') {
    // 库拉: 冰蓝护腕+白色毛绒
    ctx.fillStyle = '#88ccee';
    ctx.fillRect(-hw + 1, -hh + sleeveH - 3, w - 2, 4);
    // 毛绒感
    ctx.fillStyle = '#ddeeff';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath(); ctx.arc(-hw + 2 + i * (w - 4) / 2, -hh + sleeveH - 1, 1.5, 0, Math.PI * 2); ctx.fill();
    }
    // 冰霜效果
    ctx.fillStyle = 'rgba(180, 230, 255, 0.4)';
    ctx.fillRect(-hw + 1, fistY - 1, w - 2, 3);
  } else if (charId === 'robert') {
    ctx.fillStyle = '#664422';
    ctx.fillRect(-hw * 0.85, fistY - 1, w * 0.85, 3);
  } else if (charId === 'athena') {
    ctx.fillStyle = '#ff6688';
    ctx.fillRect(-hw + 1, -hh + sleeveH - 3, w - 2, 4);
    // 粉色蝴蝶结暗示
    ctx.fillStyle = '#ff4466';
    ctx.fillRect(-hw * 0.3, -hh + sleeveH - 2, w * 0.6, 2);
  } else if (charId === 'mai') {
    ctx.fillStyle = '#ff4488';
    ctx.fillRect(-hw + 1, -hh + sleeveH - 2, w - 2, 3);
    ctx.fillStyle = '#ffcc44';
    ctx.fillRect(-hw * 0.6 + 1, -hh + sleeveH + 2, w * 0.6, 1);
  } else if (charId === 'ralf') {
    ctx.fillStyle = '#443322';
    ctx.fillRect(-hw * 0.85, fistY - 3, w * 0.85, 5);
    // 军用手套纹理
    ctx.strokeStyle = '#332211';
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(-hw * 0.5, fistY - 1); ctx.lineTo(hw * 0.2, fistY - 1); ctx.stroke();
  } else if (charId === 'clark') {
    ctx.fillStyle = '#445522';
    ctx.fillRect(-hw * 0.85, fistY - 1, w * 0.85, 3);
  } else if (charId === 'joe') {
    // 泰拳绑带 — 多层缠绕
    ctx.strokeStyle = '#ffcc00';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) {
      const wy = -hh + sleeveH + i * 3;
      ctx.beginPath(); ctx.moveTo(-hw + 2, wy); ctx.lineTo(hw - 2, wy); ctx.stroke();
    }
  } else if (charId === 'andy') {
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(-hw + 1, -hh + sleeveH - 3, w - 2, 4);
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(-hw + 2, -hh + sleeveH - 1); ctx.lineTo(hw - 2, -hh + sleeveH - 1); ctx.stroke();
  } else if (charId === 'billy') {
    ctx.fillStyle = '#886644';
    ctx.fillRect(-hw * 0.85, fistY - 1, w * 0.85, 3);
  } else if (charId === 'yashiro') {
    ctx.fillStyle = '#553377';
    ctx.fillRect(-hw * 0.75, fistY - 1, w * 0.75, 3);
  } else if (charId === 'chris') {
    ctx.fillStyle = '#ff8844';
    ctx.fillRect(-hw + 1, -hh + sleeveH - 3, w - 2, 4);
  } else if (charId === 'yamazaki') {
    ctx.fillStyle = '#c8a070';
    ctx.fillRect(-hw * 0.85, fistY, w * 0.85, 2);
  } else if (charId === 'mary') {
    ctx.fillStyle = '#4477aa';
    ctx.fillRect(-hw * 0.85, fistY - 1, w * 0.85, 3);
  } else if (charId === 'kasumi') {
    ctx.fillStyle = '#dd4466';
    ctx.fillRect(-hw + 1, -hh + sleeveH - 3, w - 2, 4);
  } else if (charId === 'xiangfei') {
    ctx.fillStyle = '#ffcc44';
    ctx.fillRect(-hw + 1, -hh + sleeveH - 2, w - 2, 3);
  } else if (charId === 'mature') {
    // Mature: 长手套 — 延伸到手背
    ctx.fillStyle = '#aa3377';
    ctx.fillRect(-hw + 1, -hh + sleeveH - 4, w - 2, 6);
    ctx.fillStyle = '#882266';
    ctx.fillRect(-hw * 0.8, fistY - 2, w * 0.8, 4);
  } else if (charId === 'shermie') {
    ctx.fillStyle = '#bb55aa';
    ctx.fillRect(-hw + 1, -hh + sleeveH - 3, w - 2, 4);
  } else if (charId === 'vice') {
    ctx.fillStyle = '#3366aa';
    ctx.fillRect(-hw * 0.85, fistY - 1, w * 0.85, 3);
  } else if (charId === 'chang') {
    // 无特殊
  } else if (charId === 'choi') {
    // 蔡: 利爪护手
    ctx.fillStyle = '#556633';
    ctx.fillRect(-hw * 0.85, fistY - 1, w * 0.85, 2);
    // 利爪暗示
    ctx.strokeStyle = '#aabb88';
    ctx.lineWidth = 0.8;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(-hw * 0.4 + i * hw * 0.35, fistY + h * 0.05);
      ctx.lineTo(-hw * 0.3 + i * hw * 0.35, fistY + h * 0.12);
      ctx.stroke();
    }
  }
}

/** 画像素风格腿 — 锥形(大腿宽→膝→小腿窄→踝) + 膝关节 + 鞋 */
export function drawPixelLeg(
  ctx: CanvasRenderingContext2D, charId: string, w: number, h: number, isBack: boolean,
  colorIndex?: number,
): void {
  const outfit = getOutfit(charId, colorIndex);
  const hw = w / 2, hh = h / 2;
  const shoeH = Math.max(6, h * 0.12);

  const pantsColor = isBack ? shiftColor(outfit.pants, -8) : outfit.pants;

  // 锥形宽度: 大腿hw → 膝部(0.8*hw) → 小腿下端(0.6*hw)
  const thighHW = hw;
  const kneeHW = hw * 0.8;
  const calfHW = hw * 0.6;
  const kneeY = -hh + (h - shoeH) * 0.48;
  const calfBottomY = hh - shoeH;

  // 裤子主形状 — 锥形(大腿→膝盖→小腿)
  ctx.fillStyle = pantsColor;
  ctx.beginPath();
  ctx.moveTo(-thighHW, -hh);
  ctx.lineTo(thighHW, -hh);
  ctx.lineTo(kneeHW, kneeY);
  ctx.lineTo(calfHW, calfBottomY);
  ctx.lineTo(-calfHW, calfBottomY);
  ctx.lineTo(-kneeHW, kneeY);
  ctx.closePath();
  ctx.fill();

  // 裤子高光（内侧）
  ctx.fillStyle = shiftColor(pantsColor, 15);
  ctx.beginPath();
  ctx.moveTo(-thighHW * 0.3, -hh + 2);
  ctx.lineTo(-thighHW * 0.1, -hh + 2);
  ctx.lineTo(-kneeHW * 0.1, kneeY);
  ctx.lineTo(-calfHW * 0.1, calfBottomY);
  ctx.lineTo(-calfHW * 0.4, calfBottomY);
  ctx.lineTo(-kneeHW * 0.4, kneeY);
  ctx.lineTo(-thighHW * 0.5, -hh + 2);
  ctx.closePath();
  ctx.fill();

  // 裤子暗影（外侧）
  ctx.fillStyle = shiftColor(pantsColor, -12);
  ctx.beginPath();
  ctx.moveTo(thighHW * 0.5, -hh + 2);
  ctx.lineTo(thighHW, -hh + 2);
  ctx.lineTo(kneeHW, kneeY);
  ctx.lineTo(calfHW, calfBottomY);
  ctx.lineTo(calfHW * 0.6, calfBottomY);
  ctx.lineTo(kneeHW * 0.6, kneeY);
  ctx.lineTo(thighHW * 0.6, -hh + 2);
  ctx.closePath();
  ctx.fill();

  // 膝关节圆
  const kneeR = Math.max(2, kneeHW * 0.3);
  ctx.fillStyle = shiftColor(pantsColor, -5);
  ctx.beginPath();
  ctx.arc(0, kneeY, kneeR, 0, Math.PI * 2);
  ctx.fill();
  // 膝关节高光
  ctx.fillStyle = shiftColor(pantsColor, 12);
  ctx.beginPath();
  ctx.arc(-kneeR * 0.2, kneeY - kneeR * 0.25, kneeR * 0.4, 0, Math.PI * 2);
  ctx.fill();

  // 角色专属腿部细节
  drawLegDetail(ctx, charId, w, h, hw, hh, shoeH, pantsColor, outfit, isBack);

  // 鞋子 — 更详细的分层绘制
  drawShoeDetail(ctx, charId, w, hw, hh, shoeH, outfit);

  // SNK风格轮廓线 — 沿锥形路径描边
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = OUTLINE_WIDTH;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(-thighHW, -hh);
  ctx.lineTo(thighHW, -hh);
  ctx.lineTo(kneeHW, kneeY);
  ctx.lineTo(calfHW, calfBottomY);
  ctx.lineTo(-calfHW, calfBottomY);
  ctx.lineTo(-kneeHW, kneeY);
  ctx.closePath();
  ctx.stroke();
  // 鞋底轮廓
  roundRect(ctx, -hw, hh - shoeH, w, shoeH, 2);
  ctx.stroke();

  // 鞋裤分界线
  ctx.strokeStyle = shiftColor(outfit.shoes, -25);
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-calfHW, calfBottomY);
  ctx.lineTo(calfHW, calfBottomY);
  ctx.stroke();
}

/** 角色专属腿部/裤子细节 */
function drawLegDetail(
  ctx: CanvasRenderingContext2D, charId: string, w: number, h: number,
  hw: number, hh: number, shoeH: number,
  pantsColor: string, outfit: { shirt: string; pants: string; belt: string; shoes: string },
  isBack: boolean,
): void {
  if (charId === 'terry') {
    // 特瑞: 牛仔裤 — 明显的侧缝线+膝盖磨损
    ctx.strokeStyle = shiftColor(outfit.pants, 25);
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-hw * 0.35, -hh + 4); ctx.lineTo(-hw * 0.35, hh - shoeH - 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hw * 0.35, -hh + 4); ctx.lineTo(hw * 0.35, hh - shoeH - 2); ctx.stroke();
    // 牛仔缝线点
    ctx.fillStyle = shiftColor(outfit.pants, 30);
    for (let i = 0; i < 5; i++) {
      const dy = -hh + h * 0.15 + i * h * 0.12;
      ctx.fillRect(-hw * 0.35 - 1, dy, 2, 2);
      ctx.fillRect(hw * 0.35 - 1, dy, 2, 2);
    }
    // 膝盖磨损
    ctx.fillStyle = shiftColor(outfit.pants, 12);
    ctx.fillRect(-hw * 0.2, -hh + h * 0.3, hw * 0.4, h * 0.06);
  } else if (charId === 'kyo') {
    // 京: 深色长裤 — 中线熨烫线
    ctx.strokeStyle = shiftColor(outfit.pants, 12);
    ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.moveTo(0, -hh + 4); ctx.lineTo(0, hh - shoeH - 2); ctx.stroke();
    // 侧口袋暗示
    ctx.strokeStyle = shiftColor(outfit.pants, -10);
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(-hw * 0.6, -hh + h * 0.15); ctx.lineTo(-hw * 0.4, -hh + h * 0.15); ctx.lineTo(-hw * 0.35, -hh + h * 0.3); ctx.stroke();
  } else if (charId === 'iori') {
    // 庵: 黑色紧身裤 — 几乎无装饰，暗纹
    ctx.strokeStyle = shiftColor(outfit.pants, 8);
    ctx.lineWidth = 0.4;
    ctx.beginPath(); ctx.moveTo(-hw * 0.15, -hh + 4); ctx.lineTo(-hw * 0.15, hh - shoeH - 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hw * 0.15, -hh + 4); ctx.lineTo(hw * 0.15, hh - shoeH - 2); ctx.stroke();
  } else if (charId === 'kim') {
    // 金: 跆拳道白色道裤+蓝色侧条纹+底部收口
    ctx.strokeStyle = '#2244aa';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-hw + 1, -hh + 4); ctx.lineTo(-hw + 1, hh - shoeH - 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hw - 1, -hh + 4); ctx.lineTo(hw - 1, hh - shoeH - 2); ctx.stroke();
    // 底部绑腿收口
    ctx.fillStyle = shiftColor(outfit.pants, -15);
    ctx.fillRect(-hw + 1, hh - shoeH - 4, w - 2, 3);
  } else if (charId === 'ryo') {
    // Ryo: Orange karate gi pants with loose drape + muscle hints + cuff
    // === Thigh muscle bulk — thick kyokugen legs ===
    ctx.fillStyle = shiftColor(pantsColor, 10);
    ctx.fillRect(-hw * 0.3, -hh + h * 0.1, w * 0.22, h * 0.25);
    // Inner thigh muscle line
    ctx.strokeStyle = shiftColor(pantsColor, 8);
    ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.moveTo(-hw * 0.1, -hh + h * 0.15); ctx.lineTo(-hw * 0.05, -hh + h * 0.45); ctx.stroke();

    // === Gi pants fabric drape — loose karate pants ===
    // Loose fabric fold — outer leg drape (karate pants billow outward)
    ctx.fillStyle = shiftColor(pantsColor, 6);
    ctx.beginPath();
    ctx.moveTo(-hw, -hh + h * 0.2);
    ctx.quadraticCurveTo(-hw - w * 0.05, -hh + h * 0.35, -hw * 0.95, -hh + h * 0.5);
    ctx.lineTo(-hw + 1, -hh + h * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(hw, -hh + h * 0.2);
    ctx.quadraticCurveTo(hw + w * 0.05, -hh + h * 0.35, hw * 0.95, -hh + h * 0.5);
    ctx.lineTo(hw - 1, -hh + h * 0.5);
    ctx.closePath();
    ctx.fill();

    // === Knee area — defined crease ===
    // Knee crease line
    ctx.strokeStyle = shiftColor(outfit.pants, -8);
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(-hw * 0.35, -hh + h * 0.48);
    ctx.lineTo(hw * 0.35, -hh + h * 0.48);
    ctx.stroke();
    // Below-knee tension line
    ctx.strokeStyle = shiftColor(outfit.pants, 12);
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(-hw * 0.25, -hh + h * 0.52);
    ctx.lineTo(hw * 0.25, -hh + h * 0.52);
    ctx.stroke();
    // Knee fabric drape — diagonal fold
    ctx.strokeStyle = shiftColor(pantsColor, -5);
    ctx.lineWidth = 0.4;
    ctx.beginPath();
    ctx.moveTo(-hw * 0.4, -hh + h * 0.42);
    ctx.quadraticCurveTo(-hw * 0.1, -hh + h * 0.5, hw * 0.1, -hh + h * 0.44);
    ctx.stroke();

    // === Center crease line — pressed pants look ===
    ctx.strokeStyle = shiftColor(outfit.pants, 20);
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(0, -hh + h * 0.15); ctx.lineTo(0, hh - shoeH - 2); ctx.stroke();

    // === Diagonal fabric fold lines — karate gi pants characteristic wrinkles ===
    ctx.strokeStyle = shiftColor(outfit.pants, 15);
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(-hw * 0.2, -hh + h * 0.2); ctx.lineTo(-hw * 0.15, hh - shoeH - 4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hw * 0.2, -hh + h * 0.2); ctx.lineTo(hw * 0.15, hh - shoeH - 4); ctx.stroke();
    // Cross-thigh diagonal folds
    ctx.strokeStyle = shiftColor(pantsColor, 8);
    ctx.lineWidth = 0.4;
    ctx.beginPath();
    ctx.moveTo(-hw * 0.35, -hh + h * 0.25);
    ctx.lineTo(hw * 0.1, -hh + h * 0.4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(hw * 0.35, -hh + h * 0.25);
    ctx.lineTo(-hw * 0.1, -hh + h * 0.4);
    ctx.stroke();

    // === Shin area — tapered tightness below knee ===
    ctx.fillStyle = shiftColor(pantsColor, -6);
    ctx.fillRect(-hw * 0.3, -hh + h * 0.55, w * 0.15, h * 0.25);
    ctx.fillRect(hw * 0.15, -hh + h * 0.55, w * 0.15, h * 0.25);

    // === Calf muscle hints ===
    ctx.fillStyle = shiftColor(pantsColor, 8);
    ctx.fillRect(-hw * 0.15, -hh + h * 0.6, w * 0.15, h * 0.12);

    // === Battle damage hint ===
    ctx.strokeStyle = shiftColor(outfit.pants, -15);
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(-hw * 0.4, -hh + h * 0.35); ctx.lineTo(-hw * 0.3, -hh + h * 0.4); ctx.stroke();

    // === Pants cuff — gi pants tied at ankle ===
    // Cuff band — darker binding at bottom
    ctx.fillStyle = shiftColor(outfit.pants, -15);
    ctx.fillRect(-hw + 1, hh - shoeH - 5, w - 2, 4);
    // Cuff highlight — top edge of binding
    ctx.fillStyle = shiftColor(outfit.pants, 5);
    ctx.fillRect(-hw + 2, hh - shoeH - 5, w - 4, 1);
    // Cuff gather lines — fabric bunching at ankle
    ctx.strokeStyle = shiftColor(outfit.pants, -8);
    ctx.lineWidth = 0.4;
    ctx.beginPath(); ctx.moveTo(-hw * 0.3, hh - shoeH - 4); ctx.lineTo(-hw * 0.35, hh - shoeH - 1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hw * 0.2, hh - shoeH - 4); ctx.lineTo(hw * 0.15, hh - shoeH - 1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-hw * 0.05, hh - shoeH - 4); ctx.lineTo(0, hh - shoeH - 1); ctx.stroke();
  } else if (charId === 'leona') {
    // 莉安娜: 军裤+侧口袋+绑带
    ctx.strokeStyle = shiftColor(outfit.pants, -12);
    ctx.lineWidth = 0.8;
    ctx.strokeRect(hw * 0.15, -hh + h * 0.2, hw * 0.5, h * 0.12);
    ctx.fillStyle = shiftColor(outfit.pants, -8);
    ctx.fillRect(hw * 0.15, -hh + h * 0.2, hw * 0.5, h * 0.03);
    // 绑腿
    ctx.fillStyle = shiftColor(outfit.pants, 8);
    ctx.fillRect(-hw + 2, hh - shoeH - 5, w - 4, 2);
  } else if (charId === 'kdash') {
    // K': 破洞牛仔裤+链条暗示
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-hw + 2, -hh + h * 0.28);
    ctx.lineTo(-hw + 2, -hh + h * 0.48);
    ctx.lineTo(-hw + 5, -hh + h * 0.58);
    ctx.stroke();
    // 破洞
    ctx.fillStyle = shiftColor(outfit.pants, 18);
    ctx.fillRect(-hw * 0.3, -hh + h * 0.35, hw * 0.6, h * 0.04);
  } else if (charId === 'kula') {
    // 库拉: 蓝色裙子/裤子+冰晶条纹+白色靴口
    ctx.fillStyle = 'rgba(150, 220, 255, 0.3)';
    ctx.fillRect(-hw + 1, -hh + h * 0.2, w - 2, 2);
    ctx.fillRect(-hw + 1, -hh + h * 0.5, w - 2, 2);
    // 冰晶闪烁
    const sparkle = Math.sin(_tick / 15) * 0.3 + 0.5;
    ctx.fillStyle = `rgba(200, 240, 255, ${sparkle})`;
    ctx.beginPath(); ctx.arc(-hw * 0.3, -hh + h * 0.35, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(hw * 0.2, -hh + h * 0.6, 1.5, 0, Math.PI * 2); ctx.fill();
  } else if (charId === 'robert') {
    ctx.strokeStyle = '#443322';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-hw + 1, -hh + 4); ctx.lineTo(-hw + 1, hh - shoeH - 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hw - 1, -hh + 4); ctx.lineTo(hw - 1, hh - shoeH - 2); ctx.stroke();
  } else if (charId === 'athena') {
    // Athena: 校服裙下紧身裤条纹
    ctx.strokeStyle = shiftColor(outfit.pants, 15);
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(-hw * 0.2, -hh + 4); ctx.lineTo(-hw * 0.2, hh - shoeH - 2); ctx.stroke();
  } else if (charId === 'mai') {
    ctx.strokeStyle = '#ffcc44';
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(-hw + 2, hh - shoeH - 5); ctx.lineTo(hw - 2, hh - shoeH - 5); ctx.stroke();
  } else if (charId === 'ralf') {
    ctx.strokeStyle = shiftColor(outfit.pants, -15);
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(hw * 0.5, -hh + h * 0.2); ctx.lineTo(hw * 0.5, hh - shoeH - 2); ctx.stroke();
  } else if (charId === 'clark') {
    ctx.fillStyle = shiftColor(outfit.pants, -10);
    ctx.fillRect(-hw + 3, -hh + h * 0.25, w - 6, h * 0.1);
  } else if (charId === 'joe') {
    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(-hw + 1, -hh + 2, w - 2, 3);
    ctx.fillStyle = shiftColor(outfit.pants, -15);
    ctx.fillRect(-hw + 1, -hh + 5, w - 2, 1);
  } else if (charId === 'andy') {
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(-hw + 2, -hh + h * 0.4); ctx.lineTo(hw - 2, -hh + h * 0.4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-hw + 2, -hh + h * 0.6); ctx.lineTo(hw - 2, -hh + h * 0.6); ctx.stroke();
  } else if (charId === 'billy') {
    ctx.strokeStyle = shiftColor(outfit.pants, -15);
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(-hw * 0.4, -hh + 4); ctx.lineTo(-hw * 0.4, hh - shoeH - 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hw * 0.4, -hh + 4); ctx.lineTo(hw * 0.4, hh - shoeH - 2); ctx.stroke();
  } else if (charId === 'chang') {
    ctx.fillStyle = shiftColor(outfit.pants, -20);
    ctx.fillRect(-hw + 2, -hh + h * 0.3, w - 4, 2);
    ctx.fillRect(-hw + 2, -hh + h * 0.55, w - 4, 2);
  } else if (charId === 'choi') {
    // 无特殊
  } else if (charId === 'mature') {
    ctx.strokeStyle = shiftColor(outfit.pants, 15);
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(-hw + 1, hh - shoeH - 4); ctx.lineTo(hw - 1, hh - shoeH - 4); ctx.stroke();
  } else if (charId === 'yashiro') {
    ctx.strokeStyle = shiftColor(outfit.pants, 15);
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-hw + 1, -hh + 4); ctx.lineTo(-hw + 1, hh - shoeH - 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hw - 1, -hh + 4); ctx.lineTo(hw - 1, hh - shoeH - 2); ctx.stroke();
  } else if (charId === 'chris') {
    ctx.fillStyle = shiftColor(outfit.pants, -8);
    ctx.fillRect(-hw + 3, -hh + h * 0.3, w - 6, h * 0.06);
  } else if (charId === 'shermie') {
    ctx.strokeStyle = shiftColor(outfit.pants, 15);
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(-hw + 1, -hh + h * 0.3); ctx.lineTo(-hw + 1, hh - shoeH - 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hw - 1, -hh + h * 0.3); ctx.lineTo(hw - 1, hh - shoeH - 2); ctx.stroke();
  } else if (charId === 'vice') {
    ctx.strokeStyle = shiftColor(outfit.pants, 20);
    ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.moveTo(-hw * 0.3, -hh + 4); ctx.lineTo(-hw * 0.3, hh - shoeH - 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hw * 0.3, -hh + 4); ctx.lineTo(hw * 0.3, hh - shoeH - 2); ctx.stroke();
  } else if (charId === 'yamazaki') {
    ctx.strokeStyle = shiftColor(outfit.pants, 12);
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(0, -hh + 4); ctx.lineTo(0, hh - shoeH - 2); ctx.stroke();
  } else if (charId === 'mary') {
    ctx.strokeStyle = '#ffcc44';
    ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.moveTo(-hw + 1, -hh + h * 0.4); ctx.lineTo(-hw + 1, hh - shoeH - 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hw - 1, -hh + h * 0.4); ctx.lineTo(hw - 1, hh - shoeH - 2); ctx.stroke();
  } else if (charId === 'kasumi') {
    ctx.strokeStyle = shiftColor(outfit.pants, 15);
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(-hw + 1, -hh + 4); ctx.lineTo(-hw + 1, hh - shoeH - 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hw - 1, -hh + 4); ctx.lineTo(hw - 1, hh - shoeH - 2); ctx.stroke();
  } else if (charId === 'xiangfei') {
    ctx.strokeStyle = '#ffcc44';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-hw + 2, hh - shoeH - 4); ctx.lineTo(hw - 2, hh - shoeH - 4); ctx.stroke();
  }
}

/** 角色专属鞋子细节 */
function drawShoeDetail(
  ctx: CanvasRenderingContext2D, charId: string, w: number,
  hw: number, hh: number, shoeH: number,
  outfit: { shirt: string; pants: string; belt: string; shoes: string },
): void {
  // 鞋子主体
  ctx.fillStyle = outfit.shoes;
  ctx.fillRect(-hw, hh - shoeH, w, shoeH);
  // 鞋面高光
  ctx.fillStyle = shiftColor(outfit.shoes, 20);
  ctx.fillRect(-hw + 1, hh - shoeH, w * 0.4, shoeH * 0.5);
  // 鞋底
  ctx.fillStyle = shiftColor(outfit.shoes, -20);
  ctx.fillRect(-hw, hh - 2, w, 2);

  // 角色专属鞋子细节
  if (charId === 'kyo') {
    // 京: 深棕色皮靴+鞋带暗示
    ctx.fillStyle = shiftColor(outfit.shoes, 8);
    ctx.fillRect(-hw + 1, hh - shoeH + 1, w - 2, 1);
    ctx.strokeStyle = shiftColor(outfit.shoes, 15);
    ctx.lineWidth = 0.4;
    ctx.beginPath(); ctx.moveTo(-hw * 0.3, hh - shoeH + 1); ctx.lineTo(hw * 0.1, hh - 3); ctx.stroke();
  } else if (charId === 'iori') {
    // 庵: 黑色长靴+暗红底
    ctx.fillStyle = '#1a0a1a';
    ctx.fillRect(-hw, hh - shoeH + 1, w, shoeH - 3);
    ctx.fillStyle = '#440022';
    ctx.fillRect(-hw, hh - 3, w, 1);
  } else if (charId === 'terry') {
    // 特瑞: 棕色工装靴+鞋底厚
    ctx.fillStyle = '#664422';
    ctx.fillRect(-hw, hh - 3, w, 3);
    // 鞋带孔
    ctx.fillStyle = '#553311';
    ctx.fillRect(-hw * 0.3, hh - shoeH + 2, w * 0.15, 1);
    ctx.fillRect(-hw * 0.3, hh - shoeH + 4, w * 0.15, 1);
  } else if (charId === 'kim') {
    // 金: 蓝色跆拳道鞋
    ctx.fillStyle = '#1a3388';
    ctx.fillRect(-hw + 1, hh - shoeH + 1, w - 2, shoeH - 3);
    // 白色鞋头
    ctx.fillStyle = '#ddd';
    ctx.fillRect(-hw * 0.3, hh - shoeH, hw * 0.6, 2);
  } else if (charId === 'leona') {
    // 莉安娜: 军靴+鞋带
    ctx.fillStyle = '#1a2233';
    ctx.fillRect(-hw, hh - shoeH, w, shoeH);
    ctx.strokeStyle = '#445566';
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(-hw * 0.2, hh - shoeH + 1); ctx.lineTo(hw * 0.2, hh - 3); ctx.stroke();
  } else if (charId === 'kdash') {
    // K': 黑色皮靴
    ctx.fillStyle = '#222233';
    ctx.fillRect(-hw, hh - shoeH, w, shoeH);
    ctx.fillStyle = '#333344';
    ctx.fillRect(-hw + 1, hh - shoeH + 1, w - 2, 2);
  } else if (charId === 'kula') {
    // 库拉: 白色靴子+蓝色边
    ctx.fillStyle = '#ddeeff';
    ctx.fillRect(-hw, hh - shoeH, w, shoeH);
    ctx.fillStyle = '#88bbee';
    ctx.fillRect(-hw, hh - shoeH, w, 2);
    ctx.fillStyle = '#6699cc';
    ctx.fillRect(-hw, hh - 2, w, 2);
  } else if (charId === 'ryo') {
    // Ryo: Brown karate training shoes — flat lightweight martial arts shoes
    // Shoe shape — slightly wider at sole than ankle (karate flat sole)
    const soleW = hw * 1.12;
    const ankleW = hw * 0.85;
    const soleThickness = Math.max(3, shoeH * 0.28);

    // === Shoe upper body — tapered from ankle to sole ===
    ctx.fillStyle = shiftColor(outfit.shoes, 5);
    ctx.beginPath();
    ctx.moveTo(-ankleW, hh - shoeH);
    ctx.lineTo(ankleW, hh - shoeH);
    ctx.lineTo(soleW, hh - soleThickness);
    ctx.lineTo(-soleW, hh - soleThickness);
    ctx.closePath();
    ctx.fill();

    // === Thick flat sole — karate shoes have distinct thick soles ===
    // Main sole body — dark rubber
    ctx.fillStyle = shiftColor(outfit.shoes, -25);
    ctx.fillRect(-soleW, hh - soleThickness, soleW * 2, soleThickness);
    // Sole top edge — lighter rim separating upper from sole
    ctx.fillStyle = shiftColor(outfit.shoes, -15);
    ctx.fillRect(-soleW, hh - soleThickness, soleW * 2, Math.max(1, soleThickness * 0.2));
    // Sole highlight — top of sole rim
    ctx.fillStyle = shiftColor(outfit.shoes, -5);
    ctx.fillRect(-soleW + 1, hh - soleThickness, soleW * 2 - 2, 1);
    // Tread pattern — horizontal grip lines
    ctx.strokeStyle = shiftColor(outfit.shoes, -40);
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 4; i++) {
      const tx = -soleW * 0.7 + i * soleW * 0.47;
      ctx.beginPath(); ctx.moveTo(tx, hh - 1); ctx.lineTo(tx + soleW * 0.2, hh); ctx.stroke();
    }
    // Toe cap — slightly curved front
    ctx.fillStyle = shiftColor(outfit.shoes, -10);
    ctx.beginPath();
    ctx.ellipse(soleW * 0.3, hh - soleThickness * 0.5, soleW * 0.25, soleThickness * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // === Shoe upper highlight — leather shine ===
    ctx.fillStyle = shiftColor(outfit.shoes, 18);
    ctx.beginPath();
    ctx.moveTo(-ankleW + 1, hh - shoeH + 1);
    ctx.lineTo(ankleW * 0.2, hh - shoeH + 1);
    ctx.lineTo(ankleW * 0.4, hh - shoeH * 0.5);
    ctx.lineTo(-ankleW * 0.3, hh - shoeH * 0.5);
    ctx.closePath();
    ctx.fill();
    // Leather grain — subtle vertical lines on shoe upper
    ctx.strokeStyle = shiftColor(outfit.shoes, 10);
    ctx.lineWidth = 0.3;
    for (let i = 0; i < 3; i++) {
      const gx = -ankleW * 0.4 + i * ankleW * 0.35;
      ctx.beginPath();
      ctx.moveTo(gx, hh - shoeH + 2);
      ctx.lineTo(gx + ankleW * 0.05, hh - soleThickness - 1);
      ctx.stroke();
    }

    // === Ankle collar — padded opening at top of shoe ===
    ctx.fillStyle = shiftColor(outfit.shoes, 25);
    ctx.fillRect(-ankleW, hh - shoeH, ankleW * 2, Math.max(2, shoeH * 0.2));
    // Collar stitching line
    ctx.strokeStyle = shiftColor(outfit.shoes, 15);
    ctx.lineWidth = 0.4;
    ctx.beginPath(); ctx.moveTo(-ankleW + 1, hh - shoeH + 1); ctx.lineTo(ankleW - 1, hh - shoeH + 1); ctx.stroke();

    // === Shoe laces / strap bindings — karate shoe style ===
    // Lace eyelets — small dots where laces thread through
    ctx.fillStyle = shiftColor(outfit.shoes, 30);
    for (let i = 0; i < 3; i++) {
      const eyeletY = hh - shoeH + shoeH * 0.25 + i * shoeH * 0.18;
      ctx.beginPath(); ctx.arc(-hw * 0.25, eyeletY, 0.8, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(hw * 0.25, eyeletY, 0.8, 0, Math.PI * 2); ctx.fill();
    }
    // Crossing lace lines — V-pattern lacing
    ctx.strokeStyle = shiftColor(outfit.shoes, 35);
    ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.moveTo(-hw * 0.25, hh - shoeH + shoeH * 0.25); ctx.lineTo(hw * 0.25, hh - shoeH + shoeH * 0.43); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hw * 0.25, hh - shoeH + shoeH * 0.25); ctx.lineTo(-hw * 0.25, hh - shoeH + shoeH * 0.43); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-hw * 0.25, hh - shoeH + shoeH * 0.43); ctx.lineTo(hw * 0.25, hh - shoeH + shoeH * 0.61); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hw * 0.25, hh - shoeH + shoeH * 0.43); ctx.lineTo(-hw * 0.25, hh - shoeH + shoeH * 0.61); ctx.stroke();

    // === Ankle strap — karate shoe has a strap across the instep ===
    ctx.fillStyle = shiftColor(outfit.shoes, 12);
    ctx.fillRect(-ankleW + 2, hh - shoeH + shoeH * 0.55, ankleW * 2 - 4, Math.max(2, shoeH * 0.12));
    // Strap buckle — small metal detail
    ctx.fillStyle = '#aaa';
    ctx.fillRect(-1, hh - shoeH + shoeH * 0.55, 2, Math.max(2, shoeH * 0.12));

    // === Kick/running motion trail — trailing afterimage behind shoe ===
    const legScale = w / (hw * 2 || 1);
    if (legScale > 1.0) {
      // Shoe is in a kicking/moving pose — draw speed lines behind it
      const trailAlpha = 0.25 + Math.sin(_tick * 0.3) * 0.08;
      ctx.strokeStyle = `rgba(180, 140, 80, ${trailAlpha})`;
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      for (let i = 1; i <= 3; i++) {
        const fade = trailAlpha - i * 0.06;
        ctx.strokeStyle = `rgba(180, 140, 80, ${Math.max(0.05, fade)})`;
        ctx.beginPath();
        ctx.moveTo(-soleW - i * 2.5, hh - shoeH * 0.5 + i);
        ctx.lineTo(-soleW - i * 2.5, hh - 1);
        ctx.stroke();
      }
      // Subtle wind streak behind sole
      ctx.strokeStyle = `rgba(220, 200, 160, ${trailAlpha * 0.4})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-soleW - 1, hh - soleThickness * 0.5);
      ctx.quadraticCurveTo(-soleW - 6, hh - soleThickness, -soleW - 8, hh - soleThickness * 0.3);
      ctx.stroke();
    }
  }
}
