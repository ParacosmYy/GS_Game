/** Lightweight particle / VFX system for hit sparks, block flashes, etc. */

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;      // frames remaining
  maxLife: number;   // initial life
  size: number;
  color: string;
  type: 'spark' | 'flash' | 'ring' | 'text';
  text?: string;
  gravity?: number;
  friction?: number;
}

export class VFXSystem {
  private particles: Particle[] = [];

  /** Spawn hit spark particles at world position */
  spawnHitSparks(worldX: number, worldY: number, count: number = 8): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      this.particles.push({
        x: worldX,
        y: worldY,
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

  /** Spawn block flash at world position */
  spawnBlockFlash(worldX: number, worldY: number): void {
    this.particles.push({
      x: worldX,
      y: worldY,
      vx: 0,
      vy: 0,
      life: 8,
      maxLife: 8,
      size: 40,
      color: '#aaccff',
      type: 'flash',
    });
  }

  /** Spawn impact ring at world position */
  spawnImpactRing(worldX: number, worldY: number): void {
    this.particles.push({
      x: worldX,
      y: worldY,
      vx: 0,
      vy: 0,
      life: 12,
      maxLife: 12,
      size: 5,
      color: '#ffffff',
      type: 'ring',
    });
  }

  /** Spawn floating damage text */
  spawnDamageText(worldX: number, worldY: number, value: number): void {
    const isCombo = value > 0 && value <= 50;
    this.particles.push({
      x: worldX,
      y: worldY,
      vx: 0,
      vy: -1.5,
      life: 40,
      maxLife: 40,
      size: isCombo ? 18 : 14,
      color: isCombo ? '#ffcc00' : '#ff4444',
      type: 'text',
      text: isCombo ? `${value} HITS!` : `-${value}`,
    });
  }

  spawnCounterText(worldX: number, worldY: number): void {
    this.particles.push({
      x: worldX,
      y: worldY,
      vx: 0,
      vy: -2,
      life: 50,
      maxLife: 50,
      size: 20,
      color: '#ff8800',
      type: 'text',
      text: 'COUNTER!',
    });
  }

  /** Spawn landing dust particles */
  spawnDust(worldX: number, worldY: number): void {
    for (let i = 0; i < 6; i++) {
      const dir = (i - 3) * 1.2;
      this.particles.push({
        x: worldX + dir * 2,
        y: worldY - 2,
        vx: dir * 0.8,
        vy: -Math.random() * 1.5,
        life: 15 + Math.floor(Math.random() * 8),
        maxLife: 23,
        size: 4 + Math.random() * 4,
        color: '#888899',
        type: 'spark',
        gravity: 0.05,
        friction: 0.94,
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
    }
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number): void {
    for (const p of this.particles) {
      const sx = p.x - cameraX;
      const alpha = Math.max(0, p.life / p.maxLife);

      switch (p.type) {
        case 'spark': {
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(sx, p.y, p.size * alpha, 0, Math.PI * 2);
          ctx.fill();
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
        case 'ring': {
          ctx.save();
          ctx.globalAlpha = alpha * 0.7;
          const radius = p.size + (p.maxLife - p.life) * 4;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(sx, p.y, radius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
          break;
        }
        case 'text': {
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = p.color;
          ctx.font = `bold ${p.size}px monospace`;
          ctx.textAlign = 'center';
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
