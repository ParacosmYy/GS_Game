/** Lightweight particle / VFX system for hit sparks, block flashes, etc. */

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'spark' | 'flash' | 'ring' | 'text' | 'star' | 'slash' | 'superburst' | 'groundslam';
  text?: string;
  gravity?: number;
  friction?: number;
  rotation?: number;
  rotSpeed?: number;
}

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
    const alpha = (this.timer / this.maxTimer) * this.intensity;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.fillRect(0, 0, canvasW, canvasH);
    ctx.restore();
  }

  get active(): boolean { return this.timer > 0; }

  reset(): void { this.timer = 0; }
}

export class VFXSystem {
  private particles: Particle[] = [];

  spawnHitSparks(worldX: number, worldY: number, count: number = 8): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      this.particles.push({
        x: worldX, y: worldY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 10 + Math.floor(Math.random() * 10),
        maxLife: 20,
        size: 2 + Math.random() * 3,
        color: Math.random() > 0.5 ? '#ffcc00' : '#ff6600',
        type: 'spark',
        gravity: 0.15,
        friction: 0.96,
      });
    }
  }

  spawnBlockFlash(worldX: number, worldY: number): void {
    this.particles.push({
      x: worldX, y: worldY, vx: 0, vy: 0,
      life: 8, maxLife: 8, size: 40,
      color: '#aaccff', type: 'flash',
    });
  }

  /** 角色专属命中火花 — KOF风格, 更大更亮 */
  spawnCharacterHitSparks(worldX: number, worldY: number, count: number, charColor: string): void {
    // 中央闪光 — 更强的命中反馈
    this.particles.push({
      x: worldX, y: worldY, vx: 0, vy: 0,
      life: 6, maxLife: 6, size: 25,
      color: charColor, type: 'flash',
    });
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 7;
      const isStar = Math.random() > 0.25;
      this.particles.push({
        x: worldX, y: worldY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        life: 14 + Math.floor(Math.random() * 10),
        maxLife: 24,
        size: isStar ? 4 + Math.random() * 5 : 2 + Math.random() * 3,
        color: Math.random() > 0.35 ? charColor : '#ffffff',
        type: isStar ? 'star' : 'spark',
        gravity: 0.12,
        friction: 0.94,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.4,
      });
    }
  }

  spawnGuardCrushSparks(worldX: number, worldY: number): void {
    this.particles.push({
      x: worldX, y: worldY, vx: 0, vy: 0,
      life: 15, maxLife: 15, size: 60,
      color: '#ff4444', type: 'flash',
    });
    for (let i = 0; i < 16; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 6;
      this.particles.push({
        x: worldX, y: worldY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        life: 15 + Math.floor(Math.random() * 8),
        maxLife: 23,
        size: 3 + Math.random() * 4,
        color: i % 3 === 0 ? '#ffffff' : '#ff3333',
        type: 'star', gravity: 0.18, friction: 0.95,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.4,
      });
    }
  }

  spawnThrowEscapeSparks(worldX: number, worldY: number): void {
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      this.particles.push({
        x: worldX, y: worldY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 12 + Math.floor(Math.random() * 8),
        maxLife: 20,
        size: 2 + Math.random() * 3,
        color: i % 2 === 0 ? '#4488ff' : '#aaccff',
        type: 'spark', gravity: 0.1, friction: 0.94,
      });
    }
  }

  spawnImpactRing(worldX: number, worldY: number): void {
    // 主冲击环 — 更大更亮
    this.particles.push({
      x: worldX, y: worldY, vx: 0, vy: 0,
      life: 14, maxLife: 14, size: 8,
      color: '#ffffff', type: 'ring',
    });
    // 第二层冲击环 — 稍小延迟
    this.particles.push({
      x: worldX, y: worldY, vx: 0, vy: 0,
      life: 10, maxLife: 10, size: 5,
      color: '#ffcc44', type: 'ring',
    });
  }

  /** 打击斩击线 — 重攻击命中时的横向闪光 */
  spawnSlashLine(worldX: number, worldY: number, facing: number, color: string): void {
    this.particles.push({
      x: worldX, y: worldY, vx: 0, vy: 0,
      life: 8, maxLife: 8, size: 30 + Math.random() * 20,
      color, type: 'slash',
      rotation: (Math.random() - 0.5) * 0.6,
    });
    this.particles.push({
      x: worldX, y: worldY, vx: 0, vy: 0,
      life: 8, maxLife: 8, size: 20 + Math.random() * 15,
      color: '#ffffff', type: 'slash',
      rotation: (Math.random() - 0.5) * 0.6 - 0.3,
    });
  }

  /** DM/超必杀激活时的华丽爆发 */
  spawnSuperBurst(worldX: number, worldY: number, color: string, glow: string): void {
    // 中心白色闪光
    this.particles.push({
      x: worldX, y: worldY, vx: 0, vy: 0,
      life: 20, maxLife: 20, size: 80,
      color: '#ffffff', type: 'superburst',
    });
    // 角色色大闪光
    this.particles.push({
      x: worldX, y: worldY, vx: 0, vy: 0,
      life: 25, maxLife: 25, size: 100,
      color, type: 'superburst',
    });
    // 辉光粒子散射
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2 + Math.random() * 0.2;
      const speed = 4 + Math.random() * 8;
      this.particles.push({
        x: worldX, y: worldY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 18 + Math.floor(Math.random() * 12),
        maxLife: 30,
        size: 3 + Math.random() * 5,
        color: i % 4 === 0 ? '#ffffff' : i % 2 === 0 ? glow : color,
        type: 'star', gravity: 0.12, friction: 0.94,
        rotation: angle, rotSpeed: (Math.random() - 0.5) * 0.5,
      });
    }
    // 冲击波环 ×2
    for (let r = 0; r < 2; r++) {
      this.particles.push({
        x: worldX, y: worldY, vx: 0, vy: 0,
        life: 15 + r * 5, maxLife: 15 + r * 5, size: 5 + r * 3,
        color: r === 0 ? '#ffffff' : glow, type: 'ring',
      });
    }
  }

  /** KO落地时的震撼效果 */
  spawnGroundSlam(worldX: number, worldY: number): void {
    this.particles.push({
      x: worldX, y: worldY, vx: 0, vy: 0,
      life: 30, maxLife: 30, size: 120,
      color: '#ff2200', type: 'groundslam',
    });
    // 地面尘土
    for (let i = 0; i < 20; i++) {
      const angle = -Math.PI + Math.random() * Math.PI;
      const speed = 2 + Math.random() * 5;
      this.particles.push({
        x: worldX + (Math.random() - 0.5) * 40,
        y: worldY - 5,
        vx: Math.cos(angle) * speed,
        vy: -Math.random() * 4 - 1,
        life: 20 + Math.floor(Math.random() * 15),
        maxLife: 35,
        size: 5 + Math.random() * 8,
        color: '#aa8866', type: 'spark', gravity: 0.12, friction: 0.96,
      });
    }
    // 碎石(亮色)
    for (let i = 0; i < 12; i++) {
      const angle = -Math.PI * 0.2 - Math.random() * Math.PI * 0.6;
      const speed = 3 + Math.random() * 6;
      this.particles.push({
        x: worldX + (Math.random() - 0.5) * 30,
        y: worldY - 5,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 15 + Math.floor(Math.random() * 10),
        maxLife: 25,
        size: 2 + Math.random() * 3,
        color: i % 2 === 0 ? '#ff6644' : '#ffcc00', type: 'star',
        gravity: 0.25, friction: 0.95,
        rotation: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.6,
      });
    }
  }

  spawnDamageText(worldX: number, worldY: number, value: number): void {
    const isCombo = value > 0 && value <= 50;
    this.particles.push({
      x: worldX, y: worldY, vx: 0, vy: -1.5,
      life: 40, maxLife: 40,
      size: isCombo ? 18 : 14,
      color: isCombo ? '#ffcc00' : '#ff4444',
      type: 'text',
      text: isCombo ? `${value} HITS!` : `-${value}`,
    });
  }

  spawnCounterText(worldX: number, worldY: number): void {
    this.particles.push({
      x: worldX, y: worldY, vx: 0, vy: -2,
      life: 50, maxLife: 50, size: 20,
      color: '#ff8800', type: 'text', text: 'COUNTER!',
    });
  }

  spawnTechText(worldX: number, worldY: number): void {
    this.particles.push({
      x: worldX, y: worldY, vx: 0, vy: -1.8,
      life: 45, maxLife: 45, size: 18,
      color: '#44aaff', type: 'text', text: 'TECH!',
    });
  }

  spawnFirstAttackText(worldX: number, worldY: number): void {
    this.particles.push({
      x: worldX, y: worldY, vx: 0, vy: -1.5,
      life: 70, maxLife: 70, size: 22,
      color: '#ffdd00', type: 'text', text: 'FIRST ATTACK!',
    });
  }

  spawnDust(worldX: number, worldY: number): void {
    for (let i = 0; i < 6; i++) {
      const dir = (i - 3) * 1.2;
      this.particles.push({
        x: worldX + dir * 2, y: worldY - 2,
        vx: dir * 0.8, vy: -Math.random() * 1.5,
        life: 15 + Math.floor(Math.random() * 8),
        maxLife: 23,
        size: 4 + Math.random() * 4,
        color: '#888899', type: 'spark', gravity: 0.05, friction: 0.94,
      });
    }
  }

  spawnCounterWireSparks(worldX: number, worldY: number): void {
    for (let i = 0; i < 12; i++) {
      this.particles.push({
        x: worldX, y: worldY,
        vx: (Math.random() - 0.5) * 8, vy: -Math.random() * 6 - 2,
        life: 15 + Math.floor(Math.random() * 10), maxLife: 25,
        size: 3 + Math.random() * 4, color: '#ffdd44',
        type: 'star', gravity: 0.2, friction: 0.95,
        rotation: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.5,
      });
    }
  }

  /** MAX模式激活光环 */
  spawnMAXAura(worldX: number, worldY: number): void {
    // 中心爆发
    for (let r = 0; r < 3; r++) {
      this.particles.push({
        x: worldX, y: worldY - 30, vx: 0, vy: 0,
        life: 18 + r * 6, maxLife: 18 + r * 6, size: 8 + r * 5,
        color: r === 0 ? '#ffffff' : r === 1 ? '#44ff88' : '#22cc55', type: 'ring',
      });
    }
    // 能量粒子向上散射
    for (let i = 0; i < 16; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.2;
      const speed = 3 + Math.random() * 5;
      this.particles.push({
        x: worldX + (Math.random() - 0.5) * 30,
        y: worldY - 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 15 + Math.floor(Math.random() * 10),
        maxLife: 25,
        size: 2 + Math.random() * 4,
        color: i % 3 === 0 ? '#ffffff' : i % 2 === 0 ? '#88ffaa' : '#44ff66',
        type: 'star', gravity: -0.05, friction: 0.94,
        rotation: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.4,
      });
    }
  }

  /** Perfect闪光 */
  spawnPerfectFlash(worldX: number, worldY: number): void {
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 7;
      this.particles.push({
        x: worldX, y: worldY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        life: 20 + Math.floor(Math.random() * 15),
        maxLife: 35,
        size: 3 + Math.random() * 5,
        color: i % 3 === 0 ? '#ffffff' : i % 2 === 0 ? '#ffcc00' : '#ff8800',
        type: 'star', gravity: 0.1, friction: 0.94,
        rotation: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.5,
      });
    }
    // 大金色冲击环
    this.particles.push({
      x: worldX, y: worldY, vx: 0, vy: 0,
      life: 25, maxLife: 25, size: 15,
      color: '#ffcc00', type: 'ring',
    });
  }

  spawnProjectileExplosion(worldX: number, worldY: number, charColor: string, charGlow: string): void {
    this.particles.push({
      x: worldX, y: worldY, vx: 0, vy: 0,
      life: 12, maxLife: 12, size: 50,
      color: charGlow, type: 'flash',
    });
    for (let i = 0; i < 14; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 6;
      this.particles.push({
        x: worldX, y: worldY,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 2,
        life: 12 + Math.floor(Math.random() * 8), maxLife: 20,
        size: 3 + Math.random() * 4,
        color: i % 3 === 0 ? '#ffffff' : charColor,
        type: 'star', gravity: 0.2, friction: 0.94,
        rotation: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.4,
      });
    }
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
          // 小辉光
          if (p.size > 3) {
            ctx.globalAlpha = alpha * 0.3;
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
          // 外层辉光 — 更大更亮
          ctx.globalAlpha = alpha * 0.35;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(0, 0, p.size * alpha * 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.restore();
          break;
        }
        case 'flash': {
          ctx.save();
          ctx.globalAlpha = alpha * 0.6;
          const grad = ctx.createRadialGradient(sx, p.y, 0, sx, p.y, p.size * (1 - alpha * 0.5));
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.4, p.color);
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = grad;
          ctx.fillRect(sx - p.size, p.y - p.size, p.size * 2, p.size * 2);
          ctx.restore();
          break;
        }
        case 'superburst': {
          ctx.save();
          const scale = 1 + progress * 0.3;
          ctx.globalAlpha = alpha * 0.7;
          const sbGrad = ctx.createRadialGradient(sx, p.y, 0, sx, p.y, p.size * scale);
          sbGrad.addColorStop(0, '#ffffff');
          sbGrad.addColorStop(0.3, p.color);
          sbGrad.addColorStop(0.7, p.color + '44');
          sbGrad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = sbGrad;
          ctx.beginPath();
          ctx.arc(sx, p.y, p.size * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          break;
        }
        case 'groundslam': {
          ctx.save();
          ctx.globalAlpha = alpha * 0.5;
          const slamGrad = ctx.createRadialGradient(sx, p.y, 0, sx, p.y, p.size * (1 + progress * 0.5));
          slamGrad.addColorStop(0, '#ff4400');
          slamGrad.addColorStop(0.4, p.color);
          slamGrad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = slamGrad;
          ctx.fillRect(sx - p.size, p.y - p.size, p.size * 2, p.size * 2);
          // 暗色叠加
          ctx.globalAlpha = alpha * 0.3;
          ctx.fillStyle = '#000';
          ctx.fillRect(sx - p.size * 1.5, p.y - p.size * 1.5, p.size * 3, p.size * 3);
          ctx.restore();
          break;
        }
        case 'ring': {
          ctx.save();
          ctx.globalAlpha = alpha * 0.7;
          const radius = p.size + (p.maxLife - p.life) * 5;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 2 + alpha * 2;
          ctx.beginPath();
          ctx.arc(sx, p.y, radius, 0, Math.PI * 2);
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
          const slashW = 2 + alpha * 3;
          ctx.fillStyle = p.color;
          ctx.fillRect(-slashLen, -slashW / 2, slashLen * 2, slashW);
          // 外发光
          ctx.globalAlpha = alpha * 0.3;
          ctx.fillRect(-slashLen * 1.2, -slashW, slashLen * 2.4, slashW * 4);
          ctx.restore();
          break;
        }
        case 'text': {
          ctx.save();
          ctx.globalAlpha = alpha;
          // 描边
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 3;
          ctx.font = `bold ${p.size}px "Courier New", monospace`;
          ctx.textAlign = 'center';
          ctx.strokeText(p.text || '', sx, p.y);
          // 填充
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

/** Screen shake state */
export class ScreenShake {
  private intensity = 0;
  private duration = 0;
  offsetX = 0;
  offsetY = 0;

  trigger(intensity: number, duration: number): void {
    this.intensity = intensity;
    this.duration = duration;
  }

  update(): void {
    if (this.duration > 0) {
      this.duration--;
      const decay = this.duration / 10;
      this.offsetX = (Math.random() - 0.5) * this.intensity * decay;
      this.offsetY = (Math.random() - 0.5) * this.intensity * decay;
    } else {
      this.offsetX = 0;
      this.offsetY = 0;
    }
  }
}
