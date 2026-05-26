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
  spawnTauntSparks,
  spawnCancelFlash,
  spawnDizzyStars,
  spawnFloatingComboText,
  spawnKooukenVFX,
  spawnKoHouVFX,
  spawnHienTrail,
  spawnDMTenHaOuVFX,
  spawnHaouFlash,
  spawnMoveNameText,
} from './vfxPresets.js';
import type { Particle } from './vfxPresets.js';

// re-export Particle接口, 保持外部导入路径不变
export type { Particle } from './vfxPresets.js';
export { getSparkSizeScaleFromDamage } from './vfxPresets.js';

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

  /** 角色专属命中火花 — KOF风格, 更大更亮. facing: 攻击者朝向(1右/-1左)控制飞散方向 */
  spawnCharacterHitSparks(worldX: number, worldY: number, count: number, charColor: string, sizeScale?: number, speedScale?: number, starRatio?: number, lowGravity?: boolean, facing?: number): void {
    spawnCharacterHitSparks(this.particles, worldX, worldY, count, charColor, sizeScale, speedScale, starRatio, lowGravity, facing);
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

  spawnTauntSparks(worldX: number, worldY: number): void {
    spawnTauntSparks(this.particles, worldX, worldY);
  }

  /** 取消点闪光 — 命中可取消时在攻击者身上显示短暂蓝白光环 */
  spawnCancelFlash(x: number, y: number, height: number): void {
    spawnCancelFlash(this.particles, x, y, height);
  }

  /** Dizzy stars — orbiting stars above character's head during stun */
  spawnDizzyStars(worldX: number, worldY: number): void {
    spawnDizzyStars(this.particles, worldX, worldY);
  }

  /** 浮动连击文本 — "N HIT (totalDmg)" 格式, 2-4白色/5-9黄色/10+红色 */
  spawnFloatingComboText(worldX: number, worldY: number, combo: number, totalDamage: number): void {
    spawnFloatingComboText(this.particles, worldX, worldY, combo, totalDamage);
  }

  /** Ryo: Ko'ou Ken (虎煌拳) projectile ki blast VFX */
  spawnKooukenVFX(worldX: number, worldY: number, facing: number, charId: string): void {
    spawnKooukenVFX(this.particles, worldX, worldY, facing, charId);
  }

  /** Ryo: Ko Hou (虎咲) uppercut flame column VFX */
  spawnKoHouVFX(worldX: number, worldY: number, charId: string): void {
    spawnKoHouVFX(this.particles, worldX, worldY, charId);
  }

  /** Ryo: Hien (飛燕) flying kick speed line trail */
  spawnHienTrail(worldX: number, worldY: number, facing: number, charId: string): void {
    spawnHienTrail(this.particles, worldX, worldY, facing, charId);
  }

  /** Ryo: DM Ten Ha Ou (天地霸煌拳) massive energy burst */
  spawnDMTenHaOuVFX(worldX: number, worldY: number, charId: string): void {
    spawnDMTenHaOuVFX(this.particles, worldX, worldY, charId);
  }

  /** Ryo: Haou Shou Kou Ken (霸王翔吼拳) counter activation flash */
  spawnHaouFlash(worldX: number, worldY: number, charId: string): void {
    spawnHaouFlash(this.particles, worldX, worldY, charId);
  }

  /** 命中招式名显示 — KOF2002风格浮动文本 */
  spawnMoveNameText(worldX: number, worldY: number, moveName: string, color: string, fontSize: number): void {
    spawnMoveNameText(this.particles, worldX, worldY, moveName, color, fontSize);
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
          // KOF2002: 火花只保留短促白核，避免层次过多
          if (p.life > p.maxLife - 3) {
            ctx.globalAlpha = alpha * 0.7;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(sx, p.y, p.size * alpha * 0.5, 0, Math.PI * 2);
            ctx.fill();
          }
          if (p.size > 3) {
            ctx.globalAlpha = alpha * 0.18;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(sx, p.y, p.size * alpha * 1.2, 0, Math.PI * 2);
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
          // KOF2002: 星芒只留一层很轻的外晕
          ctx.globalAlpha = alpha * 0.16;
          const starGlowR = p.size * alpha * 1.9;
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
          const scale = 1 + progress * 0.22;
          // KOF2002: 保留一个明确的核心爆发，减少外围重复层
          const sbEarly = p.life > p.maxLife - 5 && p.color === '#ffffff';
          ctx.globalAlpha = sbEarly ? Math.min(1, alpha * 0.9) : alpha * 0.62;
          const sbGrad = ctx.createRadialGradient(sx, p.y, 0, sx, p.y, p.size * scale);
          sbGrad.addColorStop(0, '#ffffff');
          sbGrad.addColorStop(0.18, '#ffffffcc');
          sbGrad.addColorStop(0.38, p.color);
          sbGrad.addColorStop(0.72, p.color + '22');
          sbGrad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = sbGrad;
          ctx.beginPath();
          ctx.arc(sx, p.y, p.size * scale, 0, Math.PI * 2);
          ctx.fill();
          // 外围只保留一条薄环，避免爆发太散
          if (alpha > 0.2) {
            ctx.globalAlpha = alpha * 0.12;
            const haloR = p.size * scale * 1.4;
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 2 + alpha * 1.5;
            ctx.beginPath();
            ctx.arc(sx, p.y, haloR, 0, Math.PI * 2);
            ctx.stroke();
          }
          ctx.restore();
          break;
        }
        case 'groundslam': {
          ctx.save();
          const slamRadius = p.size * (1 + progress * 0.35);
          // KOF2002: 只保留一次性核心闪光，不铺太多层
          if (p.life > p.maxLife - 5) {
            ctx.globalAlpha = alpha * 0.7;
            const coreGrad = ctx.createRadialGradient(sx, p.y, 0, sx, p.y, slamRadius * 0.5);
            coreGrad.addColorStop(0, '#ffffff');
            coreGrad.addColorStop(0.5, '#ffddaa');
            coreGrad.addColorStop(1, 'rgba(255,68,0,0)');
            ctx.fillStyle = coreGrad;
            ctx.beginPath();
            ctx.arc(sx, p.y, slamRadius * 0.4, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = alpha * 0.42;
          const slamGrad = ctx.createRadialGradient(sx, p.y, 0, sx, p.y, slamRadius);
          slamGrad.addColorStop(0, '#ff4400');
          slamGrad.addColorStop(0.4, p.color);
          slamGrad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = slamGrad;
          ctx.beginPath();
          ctx.ellipse(sx, p.y, p.size * 1.05, p.size * 0.75, 0, 0, Math.PI * 2);
          ctx.fill();
          // 只保留一条清晰冲击波环
          ctx.globalAlpha = alpha * 0.26;
          const waveR = slamRadius * (0.6 + progress * 0.8);
          ctx.strokeStyle = '#ff6633';
          ctx.lineWidth = 2 + alpha * 2;
          ctx.beginPath();
          ctx.arc(sx, p.y, waveR, 0, Math.PI * 2);
          ctx.stroke();
          // 暗色叠加压到更轻，防止画面发脏
          ctx.globalAlpha = alpha > 0.5 ? alpha * 0.18 : alpha * alpha * 0.18;
          ctx.fillStyle = '#000';
          ctx.beginPath();
          ctx.ellipse(sx, p.y, p.size * 1.15, p.size * 0.85, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          break;
        }
        case 'ring': {
          ctx.save();
          // KOF2002: 冲击环改成更直接的单层扩散
          const ringExpandSpeed = p.size > 10 ? 2.4 : p.size > 6 ? 4.2 : 5.5;
          const ringRadius = p.size + (p.maxLife - p.life) * ringExpandSpeed;
          // 只保留很短的白核，随后迅速回到角色色
          const isEarly = p.life > p.maxLife - 3;
          if (isEarly) {
            ctx.globalAlpha = alpha * 0.36;
            const coreGrad = ctx.createRadialGradient(sx, p.y, 0, sx, p.y, ringRadius * 0.6);
            coreGrad.addColorStop(0, '#ffffff');
            coreGrad.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = coreGrad;
            ctx.beginPath();
            ctx.arc(sx, p.y, ringRadius * 0.6, 0, Math.PI * 2);
            ctx.fill();
          }
          // 只留一条主环，去掉 shadowBlur 造成的泛滥感
          ctx.globalAlpha = alpha * 0.62;
          ctx.strokeStyle = isEarly ? '#ffffff' : p.color;
          ctx.lineWidth = 2 + alpha * 1.3 + (ringRadius > 50 ? 1 : 0);
          ctx.beginPath();
          ctx.arc(sx, p.y, ringRadius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
          break;
        }
        case 'slash': {
          ctx.save();
          ctx.globalAlpha = alpha * 0.76;
          ctx.translate(sx, p.y);
          ctx.rotate(p.rotation || 0);
          const slashLen = p.size * (0.42 + alpha * 0.38);
          const slashW = (2 + alpha * 2.2) * (0.55 + alpha * 0.3);
          const curve = slashW * 0.65;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          // 白核：更像撕开的斩痕，不用硬矩形
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = Math.max(1.5, slashW * 0.55);
          ctx.globalAlpha = alpha * 0.9;
          ctx.beginPath();
          ctx.moveTo(-slashLen, curve * 0.18);
          ctx.quadraticCurveTo(0, -curve, slashLen, -curve * 0.08);
          ctx.stroke();
          // 角色色主体：稍宽、稍偏移，形成有层次的刀光
          ctx.strokeStyle = p.color;
          ctx.lineWidth = Math.max(2, slashW);
          ctx.globalAlpha = alpha * 0.72;
          ctx.beginPath();
          ctx.moveTo(-slashLen, curve * 0.28);
          ctx.quadraticCurveTo(0, curve * 0.1, slashLen, -curve * 0.18);
          ctx.stroke();
          // 两端收口，让刀光更像“切开”而不是横杠
          ctx.globalAlpha = alpha * 0.34;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.ellipse(-slashLen, curve * 0.18, slashW * 0.55, slashW * 0.32, -0.35, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(slashLen, -curve * 0.08, slashW * 0.65, slashW * 0.36, 0.25, 0, Math.PI * 2);
          ctx.fill();
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
      // elapsed = frames since trigger fired (0-based)
      const elapsed = this.maxDuration - this.duration - 1;

      if (elapsed < 3) {
        // Phase 1 (first 3 frames): deterministic displacement along biasX direction
        const t = elapsed / 3;
        this.offsetX = this.biasX * this.intensity * (1 - t * 0.3);
        this.offsetY = this.intensity * 0.5 * (1 - t);
      } else {
        // Phase 2 (after frame 3): damped spring rebound — no randomness
        const remaining = this.maxDuration - 3;
        const progress = remaining > 0 ? (elapsed - 3) / remaining : 0;
        const decay = Math.exp(-progress * 4);
        const frequency = 8;
        const phase = progress * frequency * Math.PI;
        this.offsetX = this.biasX * this.intensity * 0.5 * Math.sin(phase) * decay;
        this.offsetY = this.intensity * 0.3 * Math.sin(phase + 0.5) * decay;
      }

      // Clamp offsets to reasonable pixel range
      this.offsetX = Math.max(-30, Math.min(30, this.offsetX));
      this.offsetY = Math.max(-20, Math.min(20, this.offsetY));

      if (this.duration === 0) {
        this.offsetX = 0;
        this.offsetY = 0;
        this.intensity = 0;
      }
    }
  }
}
