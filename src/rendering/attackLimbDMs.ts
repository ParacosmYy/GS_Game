/**
 * DM/SDM 超必杀技攻击肢体渲染 — 从 attackLimbSpecials2.ts 拆分
 */
import { Fighter } from '../entities/fighter.js';
import { FIGHTER_WIDTH } from '../core/constants.js';

/** 绘制DM/SDM/HSDM超必杀技的攻击肢体 */
export function drawDmLimb(
  ctx: CanvasRenderingContext2D,
  f: Fighter,
  sx: number,
  sy: number,
  progress: number,
  limbLen: number,
  attackName: string,
): void {
  switch (attackName) {
    case 'DM_YATAGARASU': drawDmYatagarasu(ctx, f, sx, sy, progress, limbLen); break;
    case 'DM_POWER_GEYSER': drawDmPowerGeyser(ctx, f, sx, sy, progress, limbLen); break;
    case 'DM_PHOENIX_KICK': drawDmPhoenixKick(ctx, f, sx, sy, progress, limbLen); break;
    case 'DM_OROCHINAGI': drawDmOrochinagi(ctx, f, sx, sy, progress, limbLen); break;
    case 'DM_CHAIN_SHOT': drawDmChainShot(ctx, f, sx, sy, progress, limbLen); break;
    case 'DM_FREEZE': drawDmFreeze(ctx, f, sx, sy, progress, limbLen); break;
    case 'DM_RYU_KO_RYU': drawDmRyuKoRyu(ctx, f, sx, sy, progress, limbLen); break;
    case 'DM_HAOU_SHOKOU': drawDmHaouShokou(ctx, f, sx, sy, progress, limbLen); break;
    case 'DM_TEN_HA_OU': drawDmTenHaOu(ctx, f, sx, sy, progress, limbLen); break;
    case 'SDM_TEN_HA_OU': drawSdmTenHaOu(ctx, f, sx, sy, progress, limbLen); break;
    case 'DM_RYUKO_RANBU': drawDmRyukoRanbu(ctx, f, sx, sy, progress, limbLen); break;
    case 'SDM_RYUKO_RANBU': drawSdmRyukoRanbu(ctx, f, sx, sy, progress, limbLen); break;
    case 'HSDM_RYUKO_RANBU': drawHsdmRyukoRanbu(ctx, f, sx, sy, progress, limbLen); break;
    case 'DM_V_SLASHER': drawDmVSlasher(ctx, f, sx, sy, progress, limbLen); break;
  }
}

function drawDmYatagarasu(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  progress: number, limbLen: number,
): void {
  ctx.strokeStyle = '#aa22ff';
  ctx.shadowColor = '#8800cc';
  ctx.shadowBlur = 25;
  ctx.lineWidth = 16;
  const reach = limbLen * 1.5;
  ctx.beginPath();
  ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.5);
  ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.4);
  ctx.stroke();
  ctx.fillStyle = '#aa22ff44';
  ctx.beginPath();
  ctx.arc(sx + (FIGHTER_WIDTH / 2 + reach * 0.5) * f.facing, sy - f.displayHeight * 0.45,
    20 + progress * 15, 0, Math.PI * 2);
  ctx.fill();
}

function drawDmPowerGeyser(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  progress: number, limbLen: number,
): void {
  ctx.strokeStyle = '#ffcc00';
  ctx.shadowColor = '#ff8800';
  ctx.shadowBlur = 25;
  ctx.lineWidth = 18;
  const reach = limbLen * 1.0;
  ctx.beginPath();
  ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.3);
  ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - 5);
  ctx.stroke();
  ctx.fillStyle = '#ffcc0066';
  for (let i = 0; i < 3; i++) {
    const ex = sx + (FIGHTER_WIDTH / 2 + reach * (0.3 + i * 0.3)) * f.facing;
    ctx.beginPath();
    ctx.moveTo(ex, sy);
    ctx.lineTo(ex - 8, sy - 30 - progress * 20 - i * 10);
    ctx.lineTo(ex + 8, sy);
    ctx.fill();
  }
}

function drawDmPhoenixKick(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  progress: number, limbLen: number,
): void {
  ctx.strokeStyle = '#44ddff';
  ctx.shadowColor = '#22aaff';
  ctx.shadowBlur = 25;
  ctx.lineWidth = 16;
  const reach = limbLen * 1.5;
  ctx.beginPath();
  ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.4);
  ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.3);
  ctx.stroke();
  ctx.strokeStyle = '#88ccff44';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(sx + (FIGHTER_WIDTH / 2 + reach * 0.6) * f.facing, sy - f.displayHeight * 0.35,
    25 + progress * 15, -Math.PI * 0.8, Math.PI * 0.3);
  ctx.stroke();
}

function drawDmOrochinagi(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  progress: number, limbLen: number,
): void {
  ctx.strokeStyle = '#ff4400';
  ctx.shadowColor = '#ff6600';
  ctx.shadowBlur = 20;
  ctx.lineWidth = 14;
  const reach = limbLen * 1.5;
  ctx.beginPath();
  ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.55);
  ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.45);
  ctx.stroke();
  ctx.strokeStyle = '#ffaa00';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(sx + (FIGHTER_WIDTH / 2 + reach * 0.7) * f.facing, sy - f.displayHeight * 0.5,
    15 * (0.5 + progress * 0.5), 0, Math.PI * 2);
  ctx.stroke();
}

function drawDmChainShot(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  progress: number, limbLen: number,
): void {
  ctx.strokeStyle = '#ff4400';
  ctx.shadowColor = '#ff2200';
  ctx.shadowBlur = 25;
  ctx.lineWidth = 18;
  const reach = limbLen * 1.5;
  ctx.beginPath();
  ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.55);
  ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.45);
  ctx.stroke();
  ctx.fillStyle = '#ff440044';
  ctx.beginPath();
  ctx.arc(sx + (FIGHTER_WIDTH / 2 + reach * 0.6) * f.facing, sy - f.displayHeight * 0.5,
    20 + progress * 15, 0, Math.PI * 2);
  ctx.fill();
}

function drawDmFreeze(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  progress: number, limbLen: number,
): void {
  ctx.strokeStyle = '#44ccff';
  ctx.shadowColor = '#88eeff';
  ctx.shadowBlur = 25;
  ctx.lineWidth = 18;
  const reach = limbLen * 1.3;
  ctx.beginPath();
  ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.5);
  ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.45);
  ctx.stroke();
  ctx.fillStyle = '#44ccff44';
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2 + progress * 2;
    const dist = 15 + progress * 25;
    ctx.beginPath();
    ctx.arc(sx + Math.cos(angle) * dist * f.facing, sy - f.displayHeight * 0.45 + Math.sin(angle) * dist,
      6 + progress * 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawDmRyuKoRyu(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  progress: number, limbLen: number,
): void {
  ctx.strokeStyle = '#44ff88';
  ctx.shadowColor = '#22dd66';
  ctx.shadowBlur = 25;
  ctx.lineWidth = 18;
  const reach = limbLen * 1.5;
  ctx.beginPath();
  ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.45);
  ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.35);
  ctx.stroke();
  ctx.fillStyle = '#44ff8844';
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + progress * 3;
    const dist = 12 + progress * 20;
    ctx.beginPath();
    ctx.arc(sx + (FIGHTER_WIDTH / 2 + reach * 0.5) * f.facing + Math.cos(angle) * dist * 0.3,
      sy - f.displayHeight * 0.4 + Math.sin(angle) * dist,
      8 + progress * 6, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawDmHaouShokou(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  progress: number, limbLen: number,
): void {
  ctx.strokeStyle = '#44ff88';
  ctx.shadowColor = '#22dd66';
  ctx.shadowBlur = 25;
  ctx.lineWidth = 16;
  const reach = limbLen * 1.5;
  ctx.beginPath();
  ctx.moveTo(sx + 10 * f.facing, sy - f.displayHeight * 0.55);
  ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.5);
  ctx.stroke();
  ctx.fillStyle = '#44ff8866';
  ctx.beginPath();
  ctx.arc(sx + (FIGHTER_WIDTH / 2 + reach * 0.6) * f.facing, sy - f.displayHeight * 0.52,
    20 + progress * 15, 0, Math.PI * 2);
  ctx.fill();
}

function drawDmTenHaOu(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  progress: number, limbLen: number,
): void {
  ctx.strokeStyle = '#ffaa22';
  ctx.shadowColor = '#ff8800';
  ctx.shadowBlur = 25;
  ctx.lineWidth = 18;
  const reach = limbLen * 1.5;
  ctx.beginPath();
  ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.45);
  ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.35);
  ctx.stroke();
  ctx.fillStyle = '#ffcc0044';
  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2 + progress * 2;
    const dist = 15 + progress * 20;
    ctx.beginPath();
    ctx.arc(sx + (FIGHTER_WIDTH / 2 + reach * 0.5) * f.facing + Math.cos(angle) * dist * 0.3,
      sy - f.displayHeight * 0.4 + Math.sin(angle) * dist,
      8 + progress * 6, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawDmVSlasher(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  progress: number, limbLen: number,
): void {
  ctx.strokeStyle = '#44aaff';
  ctx.shadowColor = '#88ccff';
  ctx.shadowBlur = 25;
  ctx.lineWidth = 18;
  const reach = limbLen * 1.5;
  ctx.beginPath();
  ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.5);
  ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.35);
  ctx.stroke();
  ctx.fillStyle = '#88ccff44';
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2 + progress * 2.5;
    const dist = 18 + progress * 22;
    ctx.beginPath();
    ctx.arc(sx + (FIGHTER_WIDTH / 2 + reach * 0.5) * f.facing + Math.cos(angle) * dist * 0.4,
      sy - f.displayHeight * 0.42 + Math.sin(angle) * dist,
      7 + progress * 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** SDM 天地霸煌拳 — 更大更持续的能量爆发 (金色+白色) */
function drawSdmTenHaOu(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  progress: number, limbLen: number,
): void {
  ctx.strokeStyle = '#ffdd44';
  ctx.shadowColor = '#ffaa00';
  ctx.shadowBlur = 30;
  ctx.lineWidth = 22;
  const reach = limbLen * 1.8;
  ctx.beginPath();
  ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.45);
  ctx.lineTo(sx + (FIGHTER_WIDTH / 2 + reach) * f.facing, sy - f.displayHeight * 0.35);
  ctx.stroke();
  // 持续扩展的双层能量球
  ctx.fillStyle = '#ffcc0066';
  const burstSize = 25 + progress * 20;
  ctx.beginPath();
  ctx.arc(sx + (FIGHTER_WIDTH / 2 + reach * 0.5) * f.facing, sy - f.displayHeight * 0.4,
    burstSize, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff44';
  ctx.beginPath();
  ctx.arc(sx + (FIGHTER_WIDTH / 2 + reach * 0.5) * f.facing, sy - f.displayHeight * 0.4,
    burstSize * 0.5, 0, Math.PI * 2);
  ctx.fill();
  // 多层旋转粒子
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2 + progress * 2.5;
    const dist = 20 + progress * 28;
    ctx.fillStyle = i % 2 === 0 ? '#ffee6644' : '#ffaa0044';
    ctx.beginPath();
    ctx.arc(sx + (FIGHTER_WIDTH / 2 + reach * 0.4) * f.facing + Math.cos(angle) * dist * 0.4,
      sy - f.displayHeight * 0.4 + Math.sin(angle) * dist,
      10 + progress * 8, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** DM 龍虎乱舞 — 快速连打肢体动画, 每帧切换拳脚角度+火花 */
function drawDmRyukoRanbu(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  progress: number, limbLen: number,
): void {
  const hitPhase = Math.floor(progress * 10) % 10;
  const reach = limbLen * 1.3;
  // 每一击使用不同角度模拟快速拳脚
  const angles = [-0.3, 0.15, -0.5, 0.1, -0.2, 0.3, -0.4, 0.2, -0.15, 0.4];
  const yOffsets = [-0.5, -0.4, -0.6, -0.3, -0.45, -0.55, -0.35, -0.48, -0.42, -0.38];
  const angle = angles[hitPhase];
  const yOff = yOffsets[hitPhase];

  ctx.strokeStyle = '#ffaa22';
  ctx.shadowColor = '#ff8800';
  ctx.shadowBlur = 20;
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.5);
  const endX = sx + (FIGHTER_WIDTH / 2 + reach * Math.cos(angle)) * f.facing;
  const endY = sy - f.displayHeight * yOff - reach * Math.sin(angle) * 0.3;
  ctx.lineTo(endX, endY);
  ctx.stroke();

  // 命中火花 — 每击在拳头位置产生小闪光
  ctx.fillStyle = '#ffcc0066';
  ctx.beginPath();
  ctx.arc(endX, endY, 10 + progress * 8, 0, Math.PI * 2);
  ctx.fill();
  // 白色核心
  ctx.fillStyle = '#ffffff55';
  ctx.beginPath();
  ctx.arc(endX, endY, 5 + progress * 4, 0, Math.PI * 2);
  ctx.fill();
}

/** SDM 龍虎乱舞 — 强化连打, 更多火花+更大的轨迹 */
function drawSdmRyukoRanbu(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  progress: number, limbLen: number,
): void {
  const hitPhase = Math.floor(progress * 13) % 13;
  const reach = limbLen * 1.5;
  const angles = [-0.3, 0.15, -0.5, 0.1, -0.2, 0.3, -0.4, 0.2, -0.15, 0.4, -0.35, 0.25, -0.1];
  const yOffsets = [-0.5, -0.4, -0.6, -0.3, -0.45, -0.55, -0.35, -0.48, -0.42, -0.38, -0.52, -0.36, -0.44];
  const angle = angles[hitPhase];
  const yOff = yOffsets[hitPhase];

  ctx.strokeStyle = '#ffcc44';
  ctx.shadowColor = '#ffaa00';
  ctx.shadowBlur = 25;
  ctx.lineWidth = 16;
  ctx.beginPath();
  ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.5);
  const endX = sx + (FIGHTER_WIDTH / 2 + reach * Math.cos(angle)) * f.facing;
  const endY = sy - f.displayHeight * yOff - reach * Math.sin(angle) * 0.3;
  ctx.lineTo(endX, endY);
  ctx.stroke();

  // 双层火花
  ctx.fillStyle = '#ffdd0066';
  ctx.beginPath();
  ctx.arc(endX, endY, 14 + progress * 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff55';
  ctx.beginPath();
  ctx.arc(endX, endY, 7 + progress * 5, 0, Math.PI * 2);
  ctx.fill();

  // 连打残影 — 额外短划线模拟速度
  if (hitPhase > 0) {
    ctx.strokeStyle = '#ffcc4433';
    ctx.lineWidth = 10;
    const prevAngle = angles[hitPhase - 1];
    const prevYOff = yOffsets[hitPhase - 1];
    ctx.beginPath();
    ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.5);
    ctx.lineTo(
      sx + (FIGHTER_WIDTH / 2 + reach * 0.8 * Math.cos(prevAngle)) * f.facing,
      sy - f.displayHeight * prevYOff - reach * 0.8 * Math.sin(prevAngle) * 0.3,
    );
    ctx.stroke();
  }
}

/** HSDM 龍虎乱舞 — 最华丽连打, 红+金交替+全屏爆发感 */
function drawHsdmRyukoRanbu(
  ctx: CanvasRenderingContext2D, f: Fighter, sx: number, sy: number,
  progress: number, limbLen: number,
): void {
  const totalHits = 22;
  const hitPhase = Math.floor(progress * totalHits) % totalHits;
  const reach = limbLen * 1.7;
  // Phase 1 (0-9): DM rush style, Phase 2 (10-21): HSDM finisher with bigger arcs
  const isPhase1 = hitPhase < 10;
  const angles = isPhase1
    ? [-0.3, 0.15, -0.5, 0.1, -0.2, 0.3, -0.4, 0.2, -0.15, 0.4]
    : [-0.4, 0.3, -0.6, 0.2, -0.3, 0.4, -0.5, 0.3, -0.2, 0.5, -0.35, 0.45];
  const idx = isPhase1 ? hitPhase : hitPhase - 10;
  const angle = angles[idx] ?? 0;
  const yOff = isPhase1
    ? [-0.5, -0.4, -0.6, -0.3, -0.45, -0.55, -0.35, -0.48, -0.42, -0.38][idx]
    : [-0.55, -0.35, -0.65, -0.3, -0.5, -0.4, -0.6, -0.35, -0.45, -0.38, -0.52, -0.4][idx];

  // HSDM: 红金色交替
  const isRed = hitPhase % 2 === 0;
  ctx.strokeStyle = isRed ? '#ff4422' : '#ffcc44';
  ctx.shadowColor = isRed ? '#ff2200' : '#ffaa00';
  ctx.shadowBlur = 28;
  ctx.lineWidth = isPhase1 ? 16 : 20;
  ctx.beginPath();
  ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.5);
  const endX = sx + (FIGHTER_WIDTH / 2 + reach * Math.cos(angle)) * f.facing;
  const endY = sy - f.displayHeight * (yOff ?? -0.45) - reach * Math.sin(angle) * 0.3;
  ctx.lineTo(endX, endY);
  ctx.stroke();

  // 大型命中火花
  ctx.fillStyle = isRed ? '#ff442244' : '#ffcc0066';
  ctx.beginPath();
  ctx.arc(endX, endY, 18 + progress * 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff66';
  ctx.beginPath();
  ctx.arc(endX, endY, 9 + progress * 7, 0, Math.PI * 2);
  ctx.fill();

  // Phase 2 额外效果: 能量扩散环
  if (!isPhase1 && idx % 3 === 0) {
    ctx.strokeStyle = isRed ? '#ff442244' : '#ffcc0044';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(endX, endY, 25 + idx * 5, 0, Math.PI * 2);
    ctx.stroke();
  }

  // 连打残影
  ctx.strokeStyle = isRed ? '#ff442222' : '#ffcc4422';
  ctx.lineWidth = 8;
  const prevIdx = (idx - 1 + angles.length) % angles.length;
  ctx.beginPath();
  ctx.moveTo(sx + 5 * f.facing, sy - f.displayHeight * 0.5);
  ctx.lineTo(
    sx + (FIGHTER_WIDTH / 2 + reach * 0.7 * Math.cos(angles[prevIdx])) * f.facing,
    sy - f.displayHeight * 0.45,
  );
  ctx.stroke();
}
