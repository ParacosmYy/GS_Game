/** Lightweight particle / VFX system for hit sparks, block flashes, etc. */

// 粒子预设函数
import {
  spawnHitSparks,
  spawnBlockFlash,
  spawnCharacterHitSparks,
  spawnGuardCrushSparks,
  spawnGuardCrushText,
  spawnWireText,
  spawnQuickStandText,
  spawnThrowEscapeSparks,
  spawnImpactRing,
  spawnSlashLine,
  spawnSuperBurst,
  spawnGroundSlam,
  spawnDamageText,
  spawnCounterText,
  spawnTechText,
  spawnFirstAttackText,
  spawnComboEndText,
  spawnComboDamageText,
  spawnSuperCancelText,
  spawnFreeCancelText,
  spawnGCCDText,
  spawnCounterStanceText,
  spawnReversalText,
  spawnRecoverySpark,
  spawnDust,
  spawnHeavyDust,
  spawnCounterWireSparks,
  spawnMAXAura,
  spawnMAXActivationFlash,
  spawnPerfectFlash,
  spawnProjectileExplosion,
} from './vfxPresets.js';
import type { Particle } from './vfxPresets.js';

// re-export Particle接口, 保持外部导入路径不变
export type { Particle } from './vfxPresets.js';

/** 全屏冲击闪光叠加层 */
export class ScreenFlash {
  private timer = 0;
  private maxTimer = 0;
  private color = '#ffffff';
  private intensity = 0;

  trigger(color: string, intensity: number, frames: number): void {
    this.color = color;
    this.intensity = intensity;
    this.timer = frames;
    this.maxTimer = frames;
  }

  update(): void {
    if (this.timer > 0) this.timer--;
  }

  render(ctx: CanvasRenderingContext2D, canvasW: number, canvasH: number): void {
    if (this.timer <= 0) return;
    // KOF2002: 闪光先快后慢衰减 (ease-out quartic) — 首帧更突出
    const linear = this.timer / this.maxTimer;
    const eased = 1 - Math.pow(1 - linear, 4);
    const alpha = eased * this.intensity;
    // KOF2002: 首帧纯白闪光, 更强的初始冲击
    const isFirstFrame = this.timer === this.maxTimer;
    ctx.save();
    ctx.globalAlpha = isFirstFrame ? Math.min(1, alpha * 1.7) : alpha;
    ctx.fillStyle = isFirstFrame ? '#ffffff' : this.color;
    ctx.fillRect(0, 0, canvasW, canvasH);
    ctx.restore();
  }

  get active(): boolean { return this.timer > 0; }

  reset(): void { this.timer = 0; }
}

export class VFXSystem {
  private particles: Particle[] = [];

  spawnHitSparks(worldX: number, worldY: number, count: number = 8): void {
    spawnHitSparks(this.particles, worldX, worldY, count);
  }

  spawnBlockFlash(worldX: number, worldY: number, scale?: number): void {
    spawnBlockFlash(this.particles, worldX, worldY, scale);
  }

  /** 角色专属命中火花 — KOF风格, 更大更亮 */
  spawnCharacterHitSparks(worldX: number, worldY: number, count: number, charColor: string, sizeScale?: number, speedScale?: number, starRatio?: number, lowGravity?: boolean): void {
    spawnCharacterHitSparks(this.particles, worldX, worldY, count, charColor, sizeScale, speedScale, starRatio, lowGravity);
  }

  spawnGuardCrushSparks(worldX: number, worldY: number): void {
    spawnGuardCrushSparks(this.particles, worldX, worldY);
  }

  spawnGuardCrushText(worldX: number, worldY: number): void {
    spawnGuardCrushText(this.particles, worldX, worldY);
  }

  spawnWireText(worldX: number, worldY: number): void {
    spawnWireText(this.particles, worldX, worldY);
  }

  spawnQuickStandText(worldX: number, worldY: number): void {
    spawnQuickStandText(this.particles, worldX, worldY);
  }

  spawnThrowEscapeSparks(worldX: number, worldY: number): void {
    spawnThrowEscapeSparks(this.particles, worldX, worldY);
  }

  spawnImpactRing(worldX: number, worldY: number, scale?: number): void {
    spawnImpactRing(this.particles, worldX, worldY, scale);
  }

  /** 打击斩击线 — 重攻击命中时的横向闪光 */
  spawnSlashLine(worldX: number, worldY: number, facing: number, color: string, scale?: number): void {
    spawnSlashLine(this.particles, worldX, worldY, facing, color, scale);
  }

  /** DM/超必杀激活时的华丽爆发 */
  spawnSuperBurst(worldX: number, worldY: number, color: string, glow: string, isSDM?: boolean): void {
    spawnSuperBurst(this.particles, worldX, worldY, color, glow, isSDM);
  }

  /** KO落地时的震撼效果 */
  spawnGroundSlam(worldX: number, worldY: number): void {
    spawnGroundSlam(this.particles, worldX, worldY);
  }

  spawnDamageText(worldX: number, worldY: number, value: number, overrideColor?: string): void {
    spawnDamageText(this.particles, worldX, worldY, value, overrideColor);
  }

  spawnCounterText(worldX: number, worldY: number): void {
    spawnCounterText(this.particles, worldX, worldY);
  }

  spawnTechText(worldX: number, worldY: number): void {
    spawnTechText(this.particles, worldX, worldY);
  }

  spawnFirstAttackText(worldX: number, worldY: number): void {
    spawnFirstAttackText(this.particles, worldX, worldY);
  }

  spawnComboEndText(worldX: number, worldY: number, hits: number): void {
    spawnComboEndText(this.particles, worldX, worldY, hits);
  }

  spawnComboDamageText(worldX: number, worldY: number, totalDmg: number): void {
    spawnComboDamageText(this.particles, worldX, worldY, totalDmg);
  }

  spawnSuperCancelText(worldX: number, worldY: number): void {
    spawnSuperCancelText(this.particles, worldX, worldY);
  }

  spawnFreeCancelText(worldX: number, worldY: number): void {
    spawnFreeCancelText(this.particles, worldX, worldY);
  }

  spawnGCCDText(worldX: number, worldY: number): void {
    spawnGCCDText(this.particles, worldX, worldY);
  }

  spawnCounterStanceText(worldX: number, worldY: number): void {
    spawnCounterStanceText(this.particles, worldX, worldY);
  }

  spawnReversalText(worldX: number, worldY: number): void {
    spawnReversalText(this.particles, worldX, worldY);
  }

  /** Recovery spark — subtle white flash when hitstun ends */
  spawnRecoverySpark(worldX: number, worldY: number): void {
    spawnRecoverySpark(this.particles, worldX, worldY);
  }

  spawnDust(worldX: number, worldY: number): void {
    spawnDust(this.particles, worldX, worldY);
  }

  spawnHeavyDust(worldX: number, worldY: number, count?: number): void {
    spawnHeavyDust(this.particles, worldX, worldY, count);
  }

  spawnCounterWireSparks(worldX: number, worldY: number): void {
    spawnCounterWireSparks(this.particles, worldX, worldY);
  }

  /** MAX模式激活光环 */
  spawnMAXAura(worldX: number, worldY: number): void {
    spawnMAXAura(this.particles, worldX, worldY);
  }

  /** MAX mode activation flash — dramatic screen-wide energy burst */
  spawnMAXActivationFlash(worldX: number, worldY: number): void {
    spawnMAXActivationFlash(this.particles, worldX, worldY);
  }

  /** Perfect闪光 */
  spawnPerfectFlash(worldX: number, worldY: number): void {
    spawnPerfectFlash(this.particles, worldX, worldY);
  }

  spawnProjectileExplosion(worldX: number, worldY: number, charColor: string, charGlow: string): void {
    spawnProjectileExplosion(this.particles, worldX, worldY, charColor, charGlow);
  }

  update(): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life--;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx;
      p.y += p.vy;
      if (p.gravity) p.vy += p.gravity;
      if (p.friction) {
        p.vx *= p.friction;
        p.vy *= p.friction;
      }
      if (p.rotation !== undefined && p.rotSpeed !== undefined) {
        p.rotation += p.rotSpeed;
      }
    }
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number): void {
    for (const p of this.particles) {
      const sx = p.x - cameraX;
      const alpha = Math.max(0, p.life / p.maxLife);
      const progress = 1 - alpha;

      switch (p.type) {
        case 'spark': {
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(sx, p.y, p.size * alpha, 0, Math.PI * 2);
          ctx.fill();
          // KOF2002: 火花前3帧白色核心闪烁, 然后渐变辉光
          if (p.life > p.maxLife - 3) {
            ctx.globalAlpha = alpha * 0.7;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(sx, p.y, p.size * alpha * 0.5, 0, Math.PI * 2);
            ctx.fill();
          }
          if (p.size > 3) {
            ctx.globalAlpha = alpha * 0.3;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(sx, p.y, p.size * alpha * 2, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
          break;
        }
        case 'star': {
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.translate(sx, p.y);
          ctx.rotate(p.rotation || 0);
          ctx.fillStyle = p.color;
          drawStar(ctx, 0, 0, p.size * alpha, 4);
          // KOF2002: 外层辉光 — 用径向渐变替代shadowBlur, 减少draw call
          ctx.globalAlpha = alpha * 0.25;
          const starGlowR = p.size * alpha * 2.5;
          const starGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, starGlowR);
          starGrad.addColorStop(0, p.color);
          starGrad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = starGrad;
          ctx.beginPath();
          ctx.arc(0, 0, starGlowR, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          break;
        }
        case 'flash': {
          ctx.save();
          // KOF2002: 闪光前2帧纯白增强, 之后ease-out衰减
          const flashEarly = p.life > p.maxLife - 2;
          const flashDecay = flashEarly ? alpha : alpha * alpha;
          const flashAlpha = flashEarly ? Math.min(1, flashDecay * 1.3) : flashDecay * 0.7;
          ctx.globalAlpha = flashAlpha;
          const flashRadius = p.size * (1 - alpha * 0.5);
          const grad = ctx.createRadialGradient(sx, p.y, 0, sx, p.y, flashRadius);
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(flashEarly ? 0.6 : 0.4, p.color);
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(sx, p.y, flashRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          break;
        }
        case 'superburst': {
          ctx.save();
          const scale = 1 + progress * 0.3;
          // KOF2002: 白色核心前5帧纯白增强
          const sbEarly = p.life > p.maxLife - 5 && p.color === '#ffffff';
          // KOF2002: Superburst多层渲染 — 白色核心+角色色中段+外围光晕
          ctx.globalAlpha = sbEarly ? Math.min(1, alpha * 0.9) : alpha * 0.7;
          const sbGrad = ctx.createRadialGradient(sx, p.y, 0, sx, p.y, p.size * scale);
          sbGrad.addColorStop(0, '#ffffff');
          sbGrad.addColorStop(0.15, '#ffffffcc');
          sbGrad.addColorStop(0.3, p.color);
          sbGrad.addColorStop(0.7, p.color + '44');
          sbGrad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = sbGrad;
          ctx.beginPath();
          ctx.arc(sx, p.y, p.size * scale, 0, Math.PI * 2);
          ctx.fill();
          // 外围光晕环 — 脉冲扩展
          if (alpha > 0.2) {
            ctx.globalAlpha = alpha * 0.2;
            const haloR = p.size * scale * 1.4;
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 3 + alpha * 4;
            ctx.beginPath();
            ctx.arc(sx, p.y, haloR, 0, Math.PI * 2);
            ctx.stroke();
          }
          ctx.restore();
          break;
        }
        case 'groundslam': {
          ctx.save();
          const slamRadius = p.size * (1 + progress * 0.5);
          // KOF2002: 初始白色闪光核心(前5帧)
          if (p.life > p.maxLife - 5) {
            ctx.globalAlpha = alpha * 0.8;
            const coreGrad = ctx.createRadialGradient(sx, p.y, 0, sx, p.y, slamRadius * 0.5);
            coreGrad.addColorStop(0, '#ffffff');
            coreGrad.addColorStop(0.5, '#ffddaa');
            coreGrad.addColorStop(1, 'rgba(255,68,0,0)');
            ctx.fillStyle = coreGrad;
            ctx.beginPath();
            ctx.arc(sx, p.y, slamRadius * 0.4, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = alpha * 0.5;
          const slamGrad = ctx.createRadialGradient(sx, p.y, 0, sx, p.y, slamRadius);
          slamGrad.addColorStop(0, '#ff4400');
          slamGrad.addColorStop(0.4, p.color);
          slamGrad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = slamGrad;
          ctx.fillRect(sx - p.size, p.y - p.size, p.size * 2, p.size * 2);
          // 扩展冲击波环
          ctx.globalAlpha = alpha * 0.4;
          const waveR = slamRadius * (0.6 + progress * 0.8);
          ctx.strokeStyle = '#ff6633';
          ctx.lineWidth = 3 + alpha * 4;
          ctx.beginPath();
          ctx.arc(sx, p.y, waveR, 0, Math.PI * 2);
          ctx.stroke();
          // 暗色叠加 — KOF2002: ease-out衰减, 前半段强后半段快速消失
          ctx.globalAlpha = alpha > 0.5 ? alpha * 0.3 : alpha * alpha * 0.3;
          ctx.fillStyle = '#000';
          ctx.fillRect(sx - p.size * 1.5, p.y - p.size * 1.5, p.size * 3, p.size * 3);
          ctx.restore();
          break;
        }
        case 'ring': {
          ctx.save();
          // KOF2002: 冲击环扩展速度差分 — 大环慢扩小环快扩, 层次感更强
          const ringExpandSpeed = p.size > 10 ? 3 : p.size > 6 ? 5 : 7;
          const ringRadius = p.size + (p.maxLife - p.life) * ringExpandSpeed;
          // KOF2002: 冲击环初始白色核心闪光(前3帧), 之后渐变为环色
          const isEarly = p.life > p.maxLife - 3;
          if (isEarly) {
            ctx.globalAlpha = alpha * 0.5;
            const coreGrad = ctx.createRadialGradient(sx, p.y, 0, sx, p.y, ringRadius * 0.6);
            coreGrad.addColorStop(0, '#ffffff');
            coreGrad.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = coreGrad;
            ctx.beginPath();
            ctx.arc(sx, p.y, ringRadius * 0.6, 0, Math.PI * 2);
            ctx.fill();
          }
          // 外发光层
          ctx.globalAlpha = alpha * 0.25;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 10;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 4 + alpha * 3;
          ctx.beginPath();
          ctx.arc(sx, p.y, ringRadius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.shadowBlur = 0;
          // 主环 — 大环更粗
          ctx.globalAlpha = alpha * 0.7;
          ctx.strokeStyle = isEarly ? '#ffffff' : p.color;
          ctx.lineWidth = 2 + alpha * 2 + (ringRadius > 50 ? 2 : 0);
          ctx.beginPath();
          ctx.arc(sx, p.y, ringRadius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
          break;
        }
        case 'slash': {
          ctx.save();
          ctx.globalAlpha = alpha * 0.8;
          ctx.translate(sx, p.y);
          ctx.rotate(p.rotation || 0);
          const slashLen = p.size * (0.5 + alpha * 0.5);
          // KOF2002: 斩击线宽度脉冲 — 初始宽后快速变窄
          const slashW = (2 + alpha * 3) * (0.5 + alpha * 0.5);
          // 白色核心线
          ctx.fillStyle = '#ffffff';
          ctx.globalAlpha = alpha * 0.9;
          ctx.fillRect(-slashLen, -slashW * 0.3, slashLen * 2, slashW * 0.6);
          // 角色色主体
          ctx.globalAlpha = alpha * 0.8;
          ctx.fillStyle = p.color;
          ctx.fillRect(-slashLen, -slashW / 2, slashLen * 2, slashW);
          // 外发光 — 缩窄聚焦
          ctx.globalAlpha = alpha * 0.25;
          ctx.fillRect(-slashLen * 1.1, -slashW * 0.8, slashLen * 2.2, slashW * 3);
          ctx.restore();
          break;
        }
        case 'text': {
          ctx.save();
          ctx.globalAlpha = alpha;
          // KOF2002: 文字初始2帧微放大+弹出, 产生"弹出"感
          const textScale = p.life > p.maxLife - 2 ? 1 + (p.maxLife - p.life === 0 ? 0.18 : 0.08) : 1;
          ctx.font = `bold ${Math.round(p.size * textScale)}px "Courier New", monospace`;
          ctx.textAlign = 'center';
          // 描边层 — 黑底白边
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 3;
          ctx.strokeText(p.text || '', sx, p.y);
          // KOF2002: 大文字(size>=18)外发光层 — 用半透明重绘替代shadowBlur
          if (p.size >= 18 && alpha > 0.3) {
            ctx.globalAlpha = alpha * 0.3;
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 6;
            ctx.strokeText(p.text || '', sx, p.y);
            ctx.globalAlpha = alpha;
          }
          ctx.fillStyle = p.color;
          ctx.fillText(p.text || '', sx, p.y);
          ctx.restore();
          break;
        }
      }
    }
  }

  get count(): number {
    return this.particles.length;
  }

  reset(): void {
    this.particles.length = 0;
  }
}

/** 绘制N角星 */
function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, points: number): void {
  const outerR = r;
  const innerR = r * 0.4;
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerR : innerR;
    const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    if (i === 0) ctx.moveTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
    else ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
  }
  ctx.closePath();
  ctx.fill();
}

/** Screen shake state — with directional bias for KOF-style impact feel */
export class ScreenShake {
  private intensity = 0;
  private duration = 0;
  private maxDuration = 1;
  private biasX = 0;
  offsetX = 0;
  offsetY = 0;

  trigger(intensity: number, duration: number, biasX: number = 0): void {
    if (intensity >= this.intensity) {
      this.intensity = intensity;
      this.duration = duration;
      this.maxDuration = duration;
      this.biasX = biasX;
    }
  }

  update(): void {
    if (this.duration > 0) {
      this.duration--;
      const t = this.duration / this.maxDuration;
      // KOF2002: 初始3帧强冲击(完整强度), 之后快速衰减
      const isImpactFrame = this.duration >= this.maxDuration - 3;
      const randomDecay = isImpactFrame ? 1 : t * t;
      const biasDecay = isImpactFrame ? 1 : Math.pow(t, 1.5);
      this.offsetX = (Math.random() - 0.5) * this.intensity * randomDecay + this.biasX * biasDecay * 0.3;
      this.offsetY = (Math.random() - 0.5) * this.intensity * randomDecay * 0.7;
    } else {
      this.offsetX = 0;
      this.offsetY = 0;
      this.intensity = 0;
    }
  }
}
