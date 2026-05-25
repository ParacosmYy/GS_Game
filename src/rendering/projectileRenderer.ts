/**
 * Projectile renderer — character-specific fireball visuals with trails, glow, pulsation.
 * Extracted from renderer.ts for separation of concerns.
 */
import { Projectile } from '../entities/projectile.js';
import { ROSTER } from '../characters/index.js';
import type { Camera } from '../core/camera.js';
import { STAGE_GROUND_Y } from '../core/constants.js';

interface ProjectileVisuals {
  baseRadius: number;
  stretch: number;       // horizontal stretch (1.0 = circle)
  groundHug: boolean;    // stays on ground (Terry Power Wave)
  trailCount: number;
  trailSpacing: number;
  pulseSpeed: number;
  pulseAmount: number;   // 0–1
  energyLines: number;   // 旋转能量线数量
  energySpeed: number;   // 能量线旋转速度
}

const VISUALS: Record<string, ProjectileVisuals> = {
  kyo:   { baseRadius: 12, stretch: 1.6, groundHug: false, trailCount: 4, trailSpacing: 16, pulseSpeed: 8, pulseAmount: 0.25, energyLines: 3, energySpeed: 0.15 },
  iori:  { baseRadius: 11, stretch: 1.3, groundHug: false, trailCount: 3, trailSpacing: 14, pulseSpeed: 6, pulseAmount: 0.2, energyLines: 2, energySpeed: 0.12 },
  terry: { baseRadius: 10, stretch: 2.0, groundHug: true,  trailCount: 5, trailSpacing: 12, pulseSpeed: 10, pulseAmount: 0.15, energyLines: 4, energySpeed: 0.2 },
  kim:   { baseRadius: 10, stretch: 1.0, groundHug: false, trailCount: 3, trailSpacing: 14, pulseSpeed: 7, pulseAmount: 0.2, energyLines: 2, energySpeed: 0.1 },
  ryo:   { baseRadius: 13, stretch: 1.5, groundHug: false, trailCount: 4, trailSpacing: 15, pulseSpeed: 9, pulseAmount: 0.22, energyLines: 3, energySpeed: 0.18 },
  leona: { baseRadius: 11, stretch: 1.4, groundHug: false, trailCount: 4, trailSpacing: 14, pulseSpeed: 8, pulseAmount: 0.2, energyLines: 2, energySpeed: 0.14 },
  kdash: { baseRadius: 12, stretch: 1.5, groundHug: false, trailCount: 4, trailSpacing: 15, pulseSpeed: 9, pulseAmount: 0.2, energyLines: 3, energySpeed: 0.16 },
  kula:    { baseRadius: 11, stretch: 1.3, groundHug: false, trailCount: 3, trailSpacing: 14, pulseSpeed: 7, pulseAmount: 0.22, energyLines: 4, energySpeed: 0.1 },
  robert:  { baseRadius: 13, stretch: 1.5, groundHug: false, trailCount: 4, trailSpacing: 15, pulseSpeed: 9, pulseAmount: 0.22, energyLines: 3, energySpeed: 0.18 },
  athena:  { baseRadius: 11, stretch: 1.4, groundHug: false, trailCount: 4, trailSpacing: 14, pulseSpeed: 8, pulseAmount: 0.2, energyLines: 3, energySpeed: 0.15 },
  mai:     { baseRadius: 10, stretch: 1.3, groundHug: false, trailCount: 3, trailSpacing: 13, pulseSpeed: 7, pulseAmount: 0.22, energyLines: 2, energySpeed: 0.12 },
  joe:     { baseRadius: 14, stretch: 1.8, groundHug: false, trailCount: 5, trailSpacing: 16, pulseSpeed: 10, pulseAmount: 0.18, energyLines: 4, energySpeed: 0.2 },
  andy:    { baseRadius: 10, stretch: 1.4, groundHug: false, trailCount: 3, trailSpacing: 14, pulseSpeed: 8, pulseAmount: 0.2, energyLines: 2, energySpeed: 0.14 },
  billy:   { baseRadius: 9,  stretch: 2.2, groundHug: true,  trailCount: 4, trailSpacing: 18, pulseSpeed: 12, pulseAmount: 0.12, energyLines: 3, energySpeed: 0.22 },
  yashiro: { baseRadius: 12, stretch: 1.4, groundHug: false, trailCount: 4, trailSpacing: 15, pulseSpeed: 8, pulseAmount: 0.2, energyLines: 2, energySpeed: 0.14 },
  chris:   { baseRadius: 10, stretch: 1.3, groundHug: false, trailCount: 3, trailSpacing: 14, pulseSpeed: 7, pulseAmount: 0.22, energyLines: 2, energySpeed: 0.12 },
  mature:  { baseRadius: 10, stretch: 1.5, groundHug: false, trailCount: 3, trailSpacing: 14, pulseSpeed: 7, pulseAmount: 0.2, energyLines: 2, energySpeed: 0.13 },
};

const DEFAULT_VIS: ProjectileVisuals = { baseRadius: 10, stretch: 1.0, groundHug: false, trailCount: 3, trailSpacing: 14, pulseSpeed: 7, pulseAmount: 0.2, energyLines: 2, energySpeed: 0.15 };

export function drawProjectiles(ctx: CanvasRenderingContext2D, projectiles: Projectile[], camera: Camera): void {
  for (const proj of projectiles) {
    if (!proj.active) continue;

    const sx = camera.worldToScreen(proj.x);
    const charDef = ROSTER.find(c => c.id === proj.charId);
    const color = charDef?.specialColor || '#ff8800';
    const glow = charDef?.specialGlow || '#ff6600';
    const vis = VISUALS[proj.charId] || DEFAULT_VIS;

    const y = vis.groundHug ? STAGE_GROUND_Y - 5 : proj.y;
    const pulse = 1 + Math.sin(proj.currentFrame * vis.pulseSpeed * 0.1) * vis.pulseAmount;
    const radius = vis.baseRadius * pulse;
    const fadeIn = Math.min(1, proj.currentFrame / 5);

    ctx.save();
    ctx.globalAlpha = fadeIn;

    // Trail echoes
    for (let i = vis.trailCount; i >= 1; i--) {
      ctx.globalAlpha = (0.15 / i) * fadeIn;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(sx - proj.facing * vis.trailSpacing * i, y, radius * (1 - i * 0.12) * vis.stretch, radius * (1 - i * 0.12), 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // KOF2002: 尾焰 — 飞行道具后方的渐变火焰尾迹
    ctx.save();
    const flameLen = radius * vis.stretch * 2;
    const flameGrad = ctx.createLinearGradient(sx, y, sx - proj.facing * flameLen, y);
    flameGrad.addColorStop(0, color + '60');
    flameGrad.addColorStop(0.3, glow + '30');
    flameGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = 0.4 * fadeIn;
    ctx.fillStyle = flameGrad;
    ctx.beginPath();
    ctx.moveTo(sx - proj.facing * radius * vis.stretch * 0.5, y - radius * 0.6);
    ctx.lineTo(sx - proj.facing * flameLen, y);
    ctx.lineTo(sx - proj.facing * radius * vis.stretch * 0.5, y + radius * 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Outer glow aura
    ctx.globalAlpha = 0.4 * fadeIn;
    const auraGrad = ctx.createRadialGradient(sx, y, radius * 0.5, sx, y, radius * 2.5);
    auraGrad.addColorStop(0, glow);
    auraGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.ellipse(sx, y, radius * 2.5 * vis.stretch, radius * 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Main body
    ctx.globalAlpha = 0.9 * fadeIn;
    ctx.shadowColor = glow;
    ctx.shadowBlur = 20;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(sx, y, radius * vis.stretch, radius, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // White-hot core
    ctx.globalAlpha = fadeIn;
    const coreGrad = ctx.createRadialGradient(sx, y, 0, sx, y, radius * 0.6);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.5, '#fff8e0');
    coreGrad.addColorStop(1, color);
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.ellipse(sx, y, radius * 0.6 * vis.stretch, radius * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 角色专属能量线 — KOF风格旋转能量
    ctx.globalAlpha = 0.5 * fadeIn;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    const rotBase = proj.currentFrame * vis.energySpeed;
    for (let e = 0; e < vis.energyLines; e++) {
      const angle = rotBase + (e * Math.PI * 2 / vis.energyLines);
      const innerR = radius * 0.3;
      const outerR = radius * 0.9;
      ctx.beginPath();
      ctx.moveTo(sx + Math.cos(angle) * innerR * vis.stretch, y + Math.sin(angle) * innerR);
      ctx.lineTo(sx + Math.cos(angle + 0.3) * outerR * vis.stretch, y + Math.sin(angle + 0.3) * outerR);
      ctx.stroke();
    }

    // 角色专属细节: Kyo火焰尖端 / Iori爪痕 / Terry地面波 / Kula冰晶 / Athena精神环
    ctx.globalAlpha = 0.7 * fadeIn;
    switch (proj.charId) {
      case 'kyo': {
        // 火焰尖端 — 前方3个火焰舌
        for (let t = 0; t < 3; t++) {
          const tAngle = -0.4 + t * 0.4 + Math.sin(proj.currentFrame * 0.3 + t) * 0.15;
          const tLen = radius * 1.2 + Math.sin(proj.currentFrame * 0.4 + t * 2) * 3;
          const tx = sx + proj.facing * radius * vis.stretch * 0.5 + Math.cos(tAngle) * tLen * proj.facing;
          const ty = y + Math.sin(tAngle) * tLen;
          ctx.fillStyle = t === 1 ? '#ffee44' : '#ff8800';
          ctx.beginPath();
          ctx.moveTo(sx + proj.facing * radius * vis.stretch * 0.3, y + (t - 1) * 4);
          ctx.lineTo(tx, ty);
          ctx.lineTo(sx + proj.facing * radius * vis.stretch * 0.3, y + (t - 1) * 4 + 3 * proj.facing);
          ctx.fill();
        }
        break;
      }
      case 'iori': {
        // 紫色爪痕 — 3条斜线
        ctx.strokeStyle = '#cc44ff';
        ctx.lineWidth = 2;
        for (let c = 0; c < 3; c++) {
          const cx = sx + proj.facing * (radius * 0.5 + c * 6);
          const wobble = Math.sin(proj.currentFrame * 0.25 + c) * 3;
          ctx.beginPath();
          ctx.moveTo(cx, y - radius * 0.8 + wobble);
          ctx.lineTo(cx + proj.facing * 5, y + radius * 0.8 + wobble);
          ctx.stroke();
        }
        break;
      }
      case 'terry': {
        // 地面波纹 — Terry Power Wave沿地面传播的弧形波
        if (vis.groundHug) {
          ctx.strokeStyle = '#ffcc44';
          ctx.lineWidth = 2;
          for (let w = 0; w < 3; w++) {
            const wOff = w * 8 - 4;
            const wH = 6 + Math.sin(proj.currentFrame * 0.3 + w) * 3;
            ctx.beginPath();
            ctx.arc(sx + proj.facing * wOff, y + 3, wH, Math.PI, 0);
            ctx.stroke();
          }
        }
        break;
      }
      case 'kula': {
        // 冰晶碎片 — 4个小菱形环绕
        ctx.fillStyle = '#88ddff';
        for (let i = 0; i < 4; i++) {
          const iAngle = rotBase * 2 + i * Math.PI * 0.5;
          const iR = radius * 1.1;
          const ix = sx + Math.cos(iAngle) * iR * vis.stretch;
          const iy = y + Math.sin(iAngle) * iR;
          const sz = 2;
          ctx.beginPath();
          ctx.moveTo(ix, iy - sz); ctx.lineTo(ix + sz, iy);
          ctx.lineTo(ix, iy + sz); ctx.lineTo(ix - sz, iy);
          ctx.closePath(); ctx.fill();
        }
        break;
      }
      case 'athena': {
        // 精神能量环 — 外圈旋转环
        ctx.strokeStyle = '#ff88cc';
        ctx.lineWidth = 1.5;
        const ringAngle = rotBase * 1.5;
        ctx.beginPath();
        ctx.ellipse(sx, y, radius * 1.3 * vis.stretch, radius * 1.3, ringAngle, 0, Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(sx, y, radius * 1.3 * vis.stretch, radius * 1.3, ringAngle + Math.PI, 0, Math.PI);
        ctx.stroke();
        break;
      }
      case 'robert': {
        // 龙气旋涡 — 螺旋线条
        ctx.strokeStyle = '#ffaa33';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let s = 0; s < 20; s++) {
          const sAngle = rotBase * 3 + s * 0.5;
          const sR = radius * (0.4 + s * 0.04);
          const px = sx + Math.cos(sAngle) * sR * vis.stretch;
          const py = y + Math.sin(sAngle) * sR;
          if (s === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
        break;
      }
      default: break;
    }

    // 生成时爆发环 (前6帧)
    if (proj.currentFrame < 6) {
      const prog = proj.currentFrame / 6;
      ctx.globalAlpha = (1 - prog) * 0.5;
      ctx.strokeStyle = glow;
      ctx.lineWidth = 2 * (1 - prog) + 1;
      ctx.beginPath();
      ctx.arc(sx, y, 10 + prog * 40, 0, Math.PI * 2);
      ctx.stroke();
    }

    // KOF2002: 飞行道具地面阴影
    if (!vis.groundHug) {
      const groundSy = STAGE_GROUND_Y;
      const shadowDist = groundSy - y;
      if (shadowDist > 0 && shadowDist < 200) {
        ctx.globalAlpha = 0.15 * fadeIn * (1 - shadowDist / 200);
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(sx, groundSy, radius * vis.stretch * 0.8, 3, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }
}
