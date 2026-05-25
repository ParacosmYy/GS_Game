/**
 * 角色专属胜利姿势 + VFX
 * 从 skeletalFighter.ts 拆分
 */
import type { Pose } from '../characters/types.js';

/** 每角色专属胜利姿势定义 */
export function getVictoryPose(charId: string, tick: number): Pose {
  const bounce = Math.sin(tick * 0.08) * 3;
  switch (charId) {
    case 'kyo': return {
      head: { ox: 3, oy: bounce, rot: -0.1, scale: 1 },
      body: { ox: 2, oy: bounce * 0.7, rot: -0.08, scale: 1 },
      armFront: { ox: 14, oy: -52 + bounce * 0.3, rot: -1.9, scale: 1.15 },
      armBack: { ox: -8, oy: 8, rot: -0.3, scale: 0.9 },
      legFront: { ox: 10, oy: 0, rot: 0.12, scale: 1 },
      legBack: { ox: -6, oy: 0, rot: -0.08, scale: 1 },
    };
    case 'iori': return {
      head: { ox: -4, oy: bounce * 0.5, rot: 0.25, scale: 1 },
      body: { ox: -3, oy: bounce * 0.3, rot: -0.12, scale: 1 },
      armFront: { ox: 6, oy: 10, rot: -0.6, scale: 0.9 },
      armBack: { ox: -12, oy: -30 + bounce * 0.2, rot: 0.8, scale: 1 },
      legFront: { ox: 6, oy: 0, rot: -0.05, scale: 1 },
      legBack: { ox: -8, oy: 0, rot: 0.08, scale: 1 },
    };
    case 'terry': return {
      head: { ox: 0, oy: bounce, rot: 0, scale: 1 },
      body: { ox: 0, oy: bounce * 0.7, rot: 0, scale: 1 },
      armFront: { ox: 16, oy: -8, rot: -1.2, scale: 1.05 },
      armBack: { ox: -16, oy: -8, rot: 1.2, scale: 1.05 },
      legFront: { ox: 8, oy: 0, rot: 0.08, scale: 1 },
      legBack: { ox: -6, oy: 0, rot: -0.08, scale: 1 },
    };
    case 'kim': return {
      head: { ox: 0, oy: bounce * 0.5 + 4, rot: 0.15, scale: 1 },
      body: { ox: 0, oy: bounce * 0.4 + 3, rot: 0.1, scale: 1 },
      armFront: { ox: 12, oy: 12, rot: 0.4, scale: 1 },
      armBack: { ox: -12, oy: 12, rot: -0.4, scale: 1 },
      legFront: { ox: 10, oy: 0, rot: 0.1, scale: 1 },
      legBack: { ox: -8, oy: 0, rot: -0.1, scale: 1 },
    };
    case 'ryo': return {
      head: { ox: 4, oy: bounce * 0.5, rot: -0.05, scale: 1 },
      body: { ox: 3, oy: bounce * 0.4, rot: -0.05, scale: 1 },
      armFront: { ox: 22, oy: -5, rot: -0.1, scale: 1.2 },
      armBack: { ox: -10, oy: 5, rot: -0.8, scale: 0.85 },
      legFront: { ox: 10, oy: 0, rot: 0.15, scale: 1.05 },
      legBack: { ox: -8, oy: 0, rot: -0.1, scale: 1 },
    };
    case 'leona': return {
      head: { ox: 0, oy: bounce * 0.3, rot: 0, scale: 1 },
      body: { ox: 0, oy: bounce * 0.2, rot: 0, scale: 1 },
      armFront: { ox: 6, oy: -10, rot: -0.2, scale: 1 },
      armBack: { ox: -6, oy: -10, rot: 0.2, scale: 1 },
      legFront: { ox: 5, oy: 0, rot: 0, scale: 1 },
      legBack: { ox: -5, oy: 0, rot: 0, scale: 1 },
    };
    case 'kdash': return {
      head: { ox: -2, oy: bounce * 0.4, rot: 0.08, scale: 1 },
      body: { ox: -1, oy: bounce * 0.3, rot: 0.05, scale: 1 },
      armFront: { ox: 10, oy: 12, rot: 0.3, scale: 0.9 },
      armBack: { ox: -8, oy: 14, rot: -0.15, scale: 0.85 },
      legFront: { ox: 8, oy: 0, rot: 0.06, scale: 1 },
      legBack: { ox: -6, oy: 0, rot: -0.06, scale: 1 },
    };
    case 'kula': return {
      head: { ox: 0, oy: bounce * 1.2, rot: Math.sin(tick * 0.06) * 0.08, scale: 1 },
      body: { ox: 0, oy: bounce * 0.8, rot: 0, scale: 1 },
      armFront: { ox: 14, oy: -20 + bounce * 0.5, rot: -1.4, scale: 1.05 },
      armBack: { ox: -14, oy: -20 + bounce * 0.5, rot: 1.4, scale: 1.05 },
      legFront: { ox: 6, oy: 0, rot: 0.08, scale: 1 },
      legBack: { ox: -5, oy: 0, rot: -0.08, scale: 1 },
    };
    case 'robert': return {
      head: { ox: 0, oy: bounce, rot: -0.05, scale: 1 },
      body: { ox: 1, oy: bounce * 0.7, rot: -0.05, scale: 1 },
      armFront: { ox: 16, oy: -35 + bounce * 0.4, rot: -1.5, scale: 1.1 },
      armBack: { ox: -16, oy: -35 + bounce * 0.4, rot: 1.5, scale: 1.1 },
      legFront: { ox: 8, oy: 0, rot: 0.1, scale: 1 },
      legBack: { ox: -6, oy: 0, rot: -0.1, scale: 1 },
    };
    default: return {
      head: { ox: 0, oy: bounce, rot: 0, scale: 1 },
      body: { ox: 0, oy: bounce * 0.7, rot: 0, scale: 1 },
      armFront: { ox: 12, oy: -50 + bounce * 0.3, rot: -1.8, scale: 1.1 },
      armBack: { ox: -10, oy: -50 + bounce * 0.3, rot: 1.8, scale: 1.1 },
      legFront: { ox: 8, oy: 0, rot: 0.1, scale: 1 },
      legBack: { ox: -6, oy: 0, rot: -0.1, scale: 1 },
    };
  }
}

/** 角色专属胜利VFX — 火焰/冰晶/气场等 */
export function drawVictoryVFX(
  ctx: CanvasRenderingContext2D, sx: number, sy: number,
  tick: number, charId: string, facing: number,
): void {
  ctx.save();
  switch (charId) {
    case 'kyo': {
      const flicker = 0.4 + Math.sin(tick * 0.15) * 0.2;
      ctx.shadowColor = '#ff4400';
      ctx.shadowBlur = 20;
      ctx.fillStyle = `rgba(255, 100, 0, ${flicker})`;
      ctx.beginPath();
      ctx.arc(sx + 20 * facing, sy - 70, 12 + Math.sin(tick * 0.2) * 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(255, 200, 50, ${flicker * 0.6})`;
      ctx.beginPath();
      ctx.arc(sx + 20 * facing, sy - 70, 6, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'iori': {
      const flicker = 0.3 + Math.sin(tick * 0.12) * 0.15;
      ctx.shadowColor = '#8800cc';
      ctx.shadowBlur = 15;
      ctx.fillStyle = `rgba(136, 0, 204, ${flicker})`;
      ctx.beginPath();
      ctx.arc(sx - 15 * facing, sy - 30, 10 + Math.sin(tick * 0.18) * 3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'terry': {
      const hatPhase = (tick * 0.04) % 1;
      const hatY = sy - 120 - hatPhase * 40;
      const hatX = sx + Math.sin(hatPhase * Math.PI * 2) * 15;
      ctx.strokeStyle = '#ffcc00';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(hatX, hatY, 12, 5, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case 'kim': {
      const pulse = 0.2 + Math.sin(tick * 0.1) * 0.1;
      ctx.strokeStyle = `rgba(255, 255, 200, ${pulse})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sx, sy - 50, 45 + Math.sin(tick * 0.08) * 5, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case 'ryo': {
      const burst = (tick * 0.03) % 1;
      ctx.strokeStyle = `rgba(255, 180, 0, ${0.4 * (1 - burst)})`;
      ctx.lineWidth = 3 * (1 - burst);
      ctx.beginPath();
      ctx.arc(sx + 30 * facing, sy - 55, 10 + burst * 30, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case 'leona': {
      const flash = Math.sin(tick * 0.15) > 0.7 ? 0.6 : 0;
      if (flash > 0) {
        ctx.strokeStyle = `rgba(100, 255, 100, ${flash})`;
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
          const angle = i * Math.PI * 0.7 + tick * 0.05;
          ctx.beginPath();
          ctx.moveTo(sx + Math.cos(angle) * 10, sy - 50 + Math.sin(angle) * 10);
          ctx.lineTo(sx + Math.cos(angle) * 40, sy - 50 + Math.sin(angle) * 40);
          ctx.stroke();
        }
      }
      break;
    }
    case 'kdash': {
      const flicker = 0.3 + Math.sin(tick * 0.2) * 0.15;
      ctx.shadowColor = '#ff4400';
      ctx.shadowBlur = 8;
      ctx.fillStyle = `rgba(255, 80, 0, ${flicker})`;
      ctx.beginPath();
      ctx.arc(sx + 8 * facing, sy - 45, 5 + Math.sin(tick * 0.25) * 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'kula': {
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2 + tick * 0.04;
        const dist = 35 + Math.sin(tick * 0.06 + i) * 5;
        const ix = sx + Math.cos(angle) * dist;
        const iy = sy - 55 + Math.sin(angle) * dist * 0.5;
        ctx.fillStyle = `rgba(150, 220, 255, ${0.4 + Math.sin(tick * 0.1 + i) * 0.2})`;
        ctx.beginPath();
        ctx.arc(ix, iy, 3 + Math.sin(tick * 0.08 + i) * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'robert': {
      const spin = tick * 0.06;
      for (let i = 0; i < 3; i++) {
        const angle = spin + (i / 3) * Math.PI * 2;
        const dist = 30 + Math.sin(spin * 2 + i) * 8;
        ctx.fillStyle = `rgba(68, 255, 136, ${0.3 + Math.sin(spin + i) * 0.15})`;
        ctx.beginPath();
        ctx.arc(sx + Math.cos(angle) * dist, sy - 55 + Math.sin(angle) * dist * 0.4,
          4 + Math.sin(spin + i) * 2, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
  }
  ctx.restore();
}
