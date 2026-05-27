/** VFX粒子预设 — 从VFXSystem提取的spawn方法, 接收粒子数组并推入新粒子 */

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'spark' | 'flash' | 'ring' | 'text' | 'star' | 'slash' | 'superburst' | 'groundslam' | 'scorch';
  text?: string;
  gravity?: number;
  friction?: number;
  rotation?: number;
  rotSpeed?: number;
}

/** Tier-aware spark spawning — each sparkType produces a distinct pattern.
 *  biasX: direction bias for sparks (>0 = rightward density, <0 = leftward, 0 = uniform) */
export function spawnTierSparks(
  particles: Particle[],
  x: number, y: number,
  count: number,
  sparkType: 'small' | 'medium' | 'large' | 'burst' | 'mega' | 'hyper',
  sparkPalette: string[],
  sparkSpeed: number,
  biasX: number = 0,
): void {
  const pick = () => sparkPalette[Math.floor(Math.random() * sparkPalette.length)];

  // Direction bias: 70% of sparks concentrated toward attack direction, 30% uniform
  const biasedAngle = (): number => {
    if (biasX === 0) return Math.random() * Math.PI * 2;
    if (Math.random() < 0.7) {
      const base = biasX > 0 ? 0 : Math.PI;
      return base + (Math.random() - 0.5) * Math.PI;
    }
    return Math.random() * Math.PI * 2;
  };

  switch (sparkType) {
    case 'small': {
      // WHITE core flash — 2-frame radial gradient burst before sparks scatter
      particles.push({
        x, y, vx: 0, vy: 0,
        life: 2, maxLife: 2, size: 10,
        color: '#ffffff', type: 'flash',
      });
      for (let i = 0; i < count; i++) {
        const angle = biasX !== 0 ? biasedAngle() : -Math.PI * 0.8 + Math.random() * Math.PI * 1.6;
        const speed = (2 + Math.random() * 5) * sparkSpeed;
        particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2 * sparkSpeed,
          life: 10 + Math.floor(Math.random() * 10),
          maxLife: 20,
          size: 2 + Math.random() * 3,
          color: pick(),
          type: 'spark',
          gravity: 0.15,
          friction: 0.96,
        });
      }
      break;
    }
    case 'medium': {
      // 3-layer structure: white core → yellow mid → orange outer, 2-frame fade
      particles.push({
        x, y, vx: 0, vy: 0,
        life: 2, maxLife: 2, size: 8,
        color: '#ffffff', type: 'flash',
      });
      particles.push({
        x, y, vx: 0, vy: 0,
        life: 2, maxLife: 2, size: 16,
        color: '#ffcc44', type: 'flash',
      });
      particles.push({
        x, y, vx: 0, vy: 0,
        life: 2, maxLife: 2, size: 24,
        color: '#ff8844', type: 'flash',
      });
      // Sparks radiate OUTWARD from impact point (not upward)
      for (let i = 0; i < count; i++) {
        const angle = biasedAngle();
        const speed = (2.5 + Math.random() * 6) * sparkSpeed;
        particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 12 + Math.floor(Math.random() * 8),
          maxLife: 22,
          size: 2.5 + Math.random() * 3,
          color: pick(),
          type: Math.random() < 0.2 ? 'star' : 'spark',
          gravity: 0.12,
          friction: 0.95,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.3,
        });
      }
      break;
    }
    case 'large': {
      // Star-shaped burst: 6 rays + center white dot, 4-frame fade
      particles.push({
        x, y, vx: 0, vy: 0,
        life: 4, maxLife: 4, size: 14,
        color: '#ffffff', type: 'flash',
      });
      // 6 directional rays
      for (let r = 0; r < 6; r++) {
        const rayAngle = (r / 6) * Math.PI * 2;
        const speed = (4 + Math.random() * 3) * sparkSpeed;
        particles.push({
          x, y,
          vx: Math.cos(rayAngle) * speed,
          vy: Math.sin(rayAngle) * speed,
          life: 4, maxLife: 4,
          size: 5 + Math.random() * 3,
          color: '#ffffff',
          type: 'star',
          gravity: 0,
          friction: 0.9,
          rotation: rayAngle,
          rotSpeed: 0,
        });
      }
      // Original radial burst (enhanced)
      particles.push({
        x, y, vx: 0, vy: 0,
        life: 10, maxLife: 10, size: 28,
        color: '#ffffff', type: 'flash',
      });
      particles.push({
        x, y, vx: 0, vy: 0,
        life: 6, maxLife: 6, size: 16,
        color: pick(), type: 'flash',
      });
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.3;
        const speed = (3 + Math.random() * 5) * sparkSpeed;
        particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          life: 14 + Math.floor(Math.random() * 8),
          maxLife: 24,
          size: 3 + Math.random() * 4,
          color: pick(),
          type: 'star',
          gravity: 0.1,
          friction: 0.94,
          rotation: angle,
          rotSpeed: (Math.random() - 0.5) * 0.4,
        });
      }
      break;
    }
    case 'burst': {
      // Double ring shockwave: inner fast white + outer slow yellow
      particles.push({
        x, y, vx: 0, vy: 0,
        life: 8, maxLife: 8, size: 4,
        color: '#ffffff', type: 'ring',
      });
      particles.push({
        x, y, vx: 0, vy: 0,
        life: 14, maxLife: 14, size: 6,
        color: '#ffcc44', type: 'ring',
      });
      // Fragment particles — small sharp debris scattering
      for (let i = 0; i < 8; i++) {
        const angle = biasedAngle();
        const speed = (2 + Math.random() * 4) * sparkSpeed;
        particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 6 + Math.floor(Math.random() * 6),
          maxLife: 12,
          size: 1.5 + Math.random() * 2,
          color: Math.random() > 0.5 ? '#ffffff' : pick(),
          type: 'spark',
          gravity: 0.05,
          friction: 0.92,
        });
      }
      // Center superburst
      particles.push({
        x, y, vx: 0, vy: 0,
        life: 12, maxLife: 12, size: 40,
        color: '#ffffff', type: 'superburst',
      });
      particles.push({
        x, y, vx: 0, vy: 0,
        life: 16, maxLife: 16, size: 55,
        color: pick(), type: 'superburst',
      });
      // Ring particles
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const speed = (3 + Math.random() * 6) * sparkSpeed;
        particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2.5,
          life: 14 + Math.floor(Math.random() * 10),
          maxLife: 26,
          size: 2.5 + Math.random() * 4,
          color: pick(),
          type: 'star',
          gravity: 0.12,
          friction: 0.94,
          rotation: angle,
          rotSpeed: (Math.random() - 0.5) * 0.5,
        });
      }
      // Center flash particles (extra scatter)
      for (let i = 0; i < 6; i++) {
        const angle = biasedAngle();
        const speed = (1.5 + Math.random() * 3) * sparkSpeed;
        particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 8 + Math.floor(Math.random() * 6),
          maxLife: 14,
          size: 3 + Math.random() * 3,
          color: '#ffffff',
          type: 'spark',
          gravity: 0,
          friction: 0.92,
        });
      }
      break;
    }
    case 'mega': {
      // Triple ring shockwave (white→yellow→orange at decreasing speeds) + center explosion
      particles.push({
        x, y, vx: 0, vy: 0,
        life: 8, maxLife: 8, size: 5,
        color: '#ffffff', type: 'ring',
      });
      particles.push({
        x, y, vx: 0, vy: 0,
        life: 14, maxLife: 14, size: 7,
        color: '#ffcc44', type: 'ring',
      });
      particles.push({
        x, y, vx: 0, vy: 0,
        life: 20, maxLife: 20, size: 9,
        color: '#ff8844', type: 'ring',
      });
      // Center explosion
      particles.push({
        x, y, vx: 0, vy: 0,
        life: 12, maxLife: 12, size: 50,
        color: '#ffffff', type: 'superburst',
      });
      particles.push({
        x, y, vx: 0, vy: 0,
        life: 14, maxLife: 14, size: 55,
        color: '#ffffff', type: 'superburst',
      });
      particles.push({
        x, y, vx: 0, vy: 0,
        life: 20, maxLife: 20, size: 75,
        color: pick(), type: 'superburst',
      });
      // Outer ring — wide spread
      const outerCount = Math.ceil(count * 0.6);
      for (let i = 0; i < outerCount; i++) {
        const angle = (i / outerCount) * Math.PI * 2;
        const speed = (4 + Math.random() * 7) * sparkSpeed;
        particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 3,
          life: 16 + Math.floor(Math.random() * 12),
          maxLife: 30,
          size: 3 + Math.random() * 5,
          color: pick(),
          type: 'star',
          gravity: 0.1,
          friction: 0.93,
          rotation: angle,
          rotSpeed: (Math.random() - 0.5) * 0.5,
        });
      }
      // Inner ring — tighter, faster decay
      const innerCount = count - outerCount;
      for (let i = 0; i < innerCount; i++) {
        const angle = (i / innerCount) * Math.PI * 2;
        const speed = (2 + Math.random() * 4) * sparkSpeed;
        particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 10 + Math.floor(Math.random() * 8),
          maxLife: 18,
          size: 2 + Math.random() * 3,
          color: '#ffffff',
          type: 'spark',
          gravity: 0.05,
          friction: 0.92,
        });
      }
      break;
    }
    case 'hyper': {
      // Four-layer ring + cross burst + center mega-flash + screen crack lines
      // Four-layer expanding ring
      const ringColors = ['#ffffff', '#ffee44', '#ffaa22', '#ff6622'];
      for (let r = 0; r < 4; r++) {
        particles.push({
          x, y, vx: 0, vy: 0,
          life: 8 + r * 5, maxLife: 8 + r * 5, size: 5 + r * 2.5,
          color: ringColors[r], type: 'ring',
        });
      }
      // Cross burst: 4 directional star projectiles in + pattern
      for (let c = 0; c < 4; c++) {
        const crossAngle = (c / 4) * Math.PI * 2;
        const speed = 10 * sparkSpeed;
        particles.push({
          x, y,
          vx: Math.cos(crossAngle) * speed,
          vy: Math.sin(crossAngle) * speed,
          life: 10, maxLife: 10,
          size: 6,
          color: '#ffffff',
          type: 'star',
          gravity: 0,
          friction: 0.85,
          rotation: crossAngle,
          rotSpeed: 0,
        });
      }
      // Center mega-flash
      particles.push({
        x, y, vx: 0, vy: 0,
        life: 16, maxLife: 16, size: 80,
        color: '#ffffff', type: 'superburst',
      });
      // Screen crack lines — radial slash particles simulating cracks
      for (let i = 0; i < 8; i++) {
        const crackAngle = (i / 8) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
        particles.push({
          x: x + Math.cos(crackAngle) * 15,
          y: y + Math.sin(crackAngle) * 15,
          vx: Math.cos(crackAngle) * 2,
          vy: Math.sin(crackAngle) * 2,
          life: 14 + Math.floor(Math.random() * 8),
          maxLife: 22,
          size: 25 + Math.random() * 15,
          color: i % 2 === 0 ? '#ff2244' : '#ff6644',
          type: 'slash',
          rotation: crackAngle,
        });
      }
      // Original triple superburst
      particles.push({
        x, y, vx: 0, vy: 0,
        life: 18, maxLife: 18, size: 65,
        color: '#ffffff', type: 'superburst',
      });
      particles.push({
        x, y, vx: 0, vy: 0,
        life: 24, maxLife: 24, size: 90,
        color: pick(), type: 'superburst',
      });
      particles.push({
        x, y, vx: 0, vy: 0,
        life: 30, maxLife: 30, size: 110,
        color: '#ff44ff', type: 'superburst',
      });
      // Shockwave ring particles
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const speed = 8 * sparkSpeed;
        particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 12, maxLife: 12,
          size: 4,
          color: '#ff44ff',
          type: 'spark',
          gravity: 0,
          friction: 0.88,
        });
      }
      // Outer star cascade — widest spread
      const outerCount = Math.ceil(count * 0.5);
      for (let i = 0; i < outerCount; i++) {
        const angle = (i / outerCount) * Math.PI * 2;
        const speed = (5 + Math.random() * 9) * sparkSpeed;
        particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 4,
          life: 18 + Math.floor(Math.random() * 14),
          maxLife: 34,
          size: 3 + Math.random() * 6,
          color: pick(),
          type: 'star',
          gravity: 0.08,
          friction: 0.94,
          rotation: angle,
          rotSpeed: (Math.random() - 0.5) * 0.6,
        });
      }
      // Inner dense sparks
      const innerCount = count - outerCount;
      for (let i = 0; i < innerCount; i++) {
        const angle = biasedAngle();
        const speed = (3 + Math.random() * 5) * sparkSpeed;
        particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1,
          life: 14 + Math.floor(Math.random() * 10),
          maxLife: 24,
          size: 2 + Math.random() * 4,
          color: '#ffffff',
          type: 'spark',
          gravity: 0.05,
          friction: 0.92,
        });
      }
      break;
    }
  }
}

export function spawnHitSparks(particles: Particle[], worldX: number, worldY: number, count: number = 8): void {
  for (let i = 0; i < count; i++) {
    const angle = -Math.PI * 0.8 + Math.random() * Math.PI * 1.6;
    const speed = 2 + Math.random() * 5;
    particles.push({
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

/** Block flash — BLUE-TINTED defensive sparks (distinct from orange/yellow hit sparks).
 *  Block = defensive blue, Hit = offensive orange. */
export function spawnBlockFlash(particles: Particle[], worldX: number, worldY: number, scale: number = 1.0): void {
  // Blue core flash
  particles.push({
    x: worldX, y: worldY, vx: 0, vy: 0,
    life: 8, maxLife: 8, size: 30 * scale,
    color: '#4488ff', type: 'flash',
  });
  // White-hot center for contrast
  particles.push({
    x: worldX, y: worldY, vx: 0, vy: 0,
    life: 4, maxLife: 4, size: 14 * scale,
    color: '#ffffff', type: 'flash',
  });
  // Blue spark particles scattered around — defensive barrier feel
  for (let i = 0; i < 6; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.5 + Math.random() * 3;
    particles.push({
      x: worldX, y: worldY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 8 + Math.floor(Math.random() * 6),
      maxLife: 14,
      size: 2 + Math.random() * 2,
      color: i % 2 === 0 ? '#4488ff' : '#88bbff',
      type: 'spark',
      gravity: 0.05,
      friction: 0.92,
    });
  }
  // Blue impact ring — shield barrier visual
  particles.push({
    x: worldX, y: worldY, vx: 0, vy: 0,
    life: 10, maxLife: 10, size: 4 * scale,
    color: '#6699ff', type: 'ring',
  });
}

/**
 * 基于伤害量的火花尺寸分级:
 * - Light (damage < 50): small spark, sizeScale ~0.5
 * - Medium (50-100): medium spark, sizeScale ~0.8
 * - Heavy (100-150): large spark, sizeScale ~1.1
 * - Special (150-200): extra large + ring burst, sizeScale ~1.4
 * - DM (200+): screen flash + massive spark, sizeScale ~1.7
 */
export function getSparkSizeScaleFromDamage(damage: number): number {
  if (damage >= 200) return 1.7;
  if (damage >= 150) return 1.4;
  if (damage >= 100) return 1.1;
  if (damage >= 50) return 0.8;
  return 0.5;
}

/** 角色专属命中火花 — KOF风格, 更大更亮. facing: 攻击者朝向(1右/-1左), 控制火花飞散方向 */
export function spawnCharacterHitSparks(particles: Particle[], worldX: number, worldY: number, count: number, charColor: string, sizeScale: number = 1.0, speedScale: number = 1.0, starRatio: number = 0.2, lowGravity: boolean = false, facing: number = 0): void {
  particles.push({
    x: worldX, y: worldY, vx: 0, vy: 0,
    life: 6, maxLife: 6, size: 24 * sizeScale,
    color: charColor, type: sizeScale >= 1.5 ? 'superburst' : 'flash',
  });
  // KOF2002: 白色核心闪光收窄，避免命中过亮
  particles.push({
    x: worldX, y: worldY, vx: 0, vy: 0,
    life: 3, maxLife: 3, size: 11 * sizeScale,
    color: '#ffffff', type: 'flash',
  });
  const grav = lowGravity ? 0.04 : 0.12;
  // KOF2002: 火花方向偏置 — 根据攻击者朝向, 火花向被击者身后飞散
  // facing > 0: 攻击者面向右, 火花应向右扩散 (命中点右侧)
  // facing < 0: 攻击者面向左, 火花应向左扩散 (命中点左侧)
  // facing === 0: 保持旧版向上偏置 (向后兼容)
  const dirBias = facing !== 0 ? facing : 0;
  for (let i = 0; i < count; i++) {
    let angle: number;
    let speedX: number;
    if (dirBias !== 0) {
      // 方向性扩散: 主方向朝被击者身后, 带上下扩散
      // facing=1(右): 火花向右飞散, 角度范围 -PI/3 到 PI/3
      // facing=-1(左): 火花向左飞散, 角度范围 PI*2/3 到 PI*4/3
      angle = dirBias > 0
        ? -Math.PI / 3 + Math.random() * Math.PI * 2 / 3  // -60° to +60° (向右)
        : Math.PI * 2 / 3 + Math.random() * Math.PI * 2 / 3;  // 120° to 240° (向左)
      speedX = Math.cos(angle) * (2.5 + Math.random() * 6) * sizeScale * speedScale;
    } else {
      // 旧版: 向上半球偏置
      angle = -Math.PI * 0.8 + Math.random() * Math.PI * 1.6;
      speedX = Math.cos(angle) * (2.5 + Math.random() * 6) * sizeScale * speedScale;
    }
    const speedY = (dirBias !== 0
      ? Math.sin(angle) * (2 + Math.random() * 4)
      : Math.sin(angle) * (2.5 + Math.random() * 6) * sizeScale * speedScale - 3 * sizeScale
    );
    const speed = (2.5 + Math.random() * 6) * sizeScale * speedScale;
    const isStar = Math.random() < starRatio;
    particles.push({
      x: worldX, y: worldY,
      vx: dirBias !== 0 ? speedX : Math.cos(angle) * speed,
      vy: dirBias !== 0 ? speedY - 2 * sizeScale : Math.sin(angle) * speed - 3 * sizeScale,
      life: Math.floor((12 + Math.random() * 8) * sizeScale),
      maxLife: Math.floor(20 * sizeScale),
      size: (isStar ? 3.5 + Math.random() * 4 : 2 + Math.random() * 2.5) * sizeScale,
      color: Math.random() > 0.2 ? charColor : '#ffffff',
      type: isStar ? 'star' : 'spark',
      gravity: grav,
      friction: sizeScale < 0.8 ? 0.95 : 0.94,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.4,
    });
  }
}

export function spawnGuardCrushSparks(particles: Particle[], worldX: number, worldY: number): void {
  particles.push({
    x: worldX, y: worldY, vx: 0, vy: 0,
    life: 15, maxLife: 15, size: 60,
    color: '#ff4444', type: 'flash',
  });
  // KOF2002: 防御崩坏初始白色爆发核心
  particles.push({
    x: worldX, y: worldY, vx: 0, vy: 0,
    life: 8, maxLife: 8, size: 45,
    color: '#ffffff', type: 'flash',
  });
  for (let i = 0; i < 20; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 3 + Math.random() * 7;
    particles.push({
      x: worldX, y: worldY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 3,
      life: 15 + Math.floor(Math.random() * 10),
      maxLife: 25,
      size: 3 + Math.random() * 5,
      color: i % 3 === 0 ? '#ffffff' : '#ff3333',
      type: 'star', gravity: 0.18, friction: 0.95,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.4,
    });
  }
}

export function spawnGuardCrushText(particles: Particle[], worldX: number, worldY: number): void {
  // KOF2002: 防御崩坏文字 — 更大更醒目, 白红交替色
  particles.push({
    x: worldX, y: worldY, vx: 0, vy: -0.8,
    life: 55, maxLife: 55, size: 28,
    color: '#ff3333', type: 'text', text: 'GUARD CRUSH!',
  });
}

export function spawnWireText(particles: Particle[], worldX: number, worldY: number): void {
  particles.push({
    x: worldX, y: worldY, vx: 0, vy: -0.5,
    life: 45, maxLife: 45, size: 20,
    color: '#ff8800', type: 'text', text: 'WIRE!',
  });
}

export function spawnQuickStandText(particles: Particle[], worldX: number, worldY: number): void {
  particles.push({
    x: worldX, y: worldY, vx: 0, vy: -0.4,
    life: 30, maxLife: 30, size: 16,
    color: '#88ccff', type: 'text', text: 'RECOVERY',
  });
}

export function spawnThrowEscapeSparks(particles: Particle[], worldX: number, worldY: number): void {
  // KOF2002: 拆投初始蓝色闪光核心
  particles.push({
    x: worldX, y: worldY, vx: 0, vy: 0,
    life: 6, maxLife: 6, size: 25,
    color: '#4488ff', type: 'flash',
  });
  for (let i = 0; i < 10; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 3 + Math.random() * 3;
    particles.push({
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

/**
 * 冲击环 — KOF2002分层校准:
 * - light: 1 thin ring, fast fade
 * - heavy: 1 medium ring
 * - special: 2 rings (inner bright + outer glow)
 * - DM: 3 expanding rings with staggered timing
 * - SDM: 4 rings, largest spread
 */
export function spawnImpactRing(particles: Particle[], worldX: number, worldY: number, scale: number = 1.0, count: number = 1): void {
  const colors = ['#ffffff', '#ffcc44', '#ff8844', '#ffaa22'];
  for (let i = 0; i < count; i++) {
    const staggerLife = 12 + i * 3;
    const staggerSize = (6 + i * 2.5) * scale;
    particles.push({
      x: worldX, y: worldY, vx: 0, vy: 0,
      life: staggerLife, maxLife: staggerLife, size: staggerSize,
      color: colors[i % colors.length], type: 'ring',
    });
  }
  // Always include the secondary warm ring for count >= 2
  if (count >= 2) {
    particles.push({
      x: worldX, y: worldY, vx: 0, vy: 0,
      life: 8, maxLife: 8, size: 4 * scale,
      color: '#ffcc44', type: 'ring',
    });
  }
}

/** 打击斩击线 — 重攻击命中时的横向闪光.
 *  KOF2002: 角度按攻击部位差异化:
 *  - punch (拳): steep diagonal ~60°
 *  - kick (脚): shallow diagonal ~30°
 *  - uppercut: near-vertical ~80°
 *  - sweep: near-horizontal ~10°
 *  scale: 重1.0, 必杀1.4, DM2.0
 */
export function spawnSlashLine(particles: Particle[], worldX: number, worldY: number, _facing: number, color: string, scale: number = 1.0, angleDeg: number = 45): void {
  const angleRad = (angleDeg * Math.PI) / 180;
  const facingSign = _facing !== 0 ? _facing : 1;
  const baseRotation = facingSign > 0 ? -angleRad : Math.PI + angleRad;
  particles.push({
    x: worldX, y: worldY, vx: 0, vy: 0,
    life: 7, maxLife: 7, size: (30 + Math.random() * 16) * scale,
    color, type: 'slash',
    rotation: baseRotation + (Math.random() - 0.5) * 0.25,
  });
  particles.push({
    x: worldX, y: worldY, vx: 0, vy: 0,
    life: 7, maxLife: 7, size: (18 + Math.random() * 10) * scale,
    color: '#ffffff', type: 'slash',
    rotation: baseRotation * 0.7 + (Math.random() - 0.5) * 0.2 - 0.15,
  });
}

/** DM/超必杀激活时的华丽爆发 */
export function spawnSuperBurst(particles: Particle[], worldX: number, worldY: number, color: string, glow: string, isSDM: boolean = false): void {
  const burstCount = isSDM ? 28 : 20;
  const burstSize = isSDM ? 96 : 84;
  particles.push({
    x: worldX, y: worldY, vx: 0, vy: 0,
    life: isSDM ? 18 : 14, maxLife: isSDM ? 18 : 14, size: isSDM ? 72 : 58,
    color: '#ffffff', type: 'superburst',
  });
  particles.push({
    x: worldX, y: worldY, vx: 0, vy: 0,
    life: isSDM ? 24 : 20, maxLife: isSDM ? 24 : 20, size: burstSize,
    color, type: 'superburst',
  });
  for (let i = 0; i < burstCount; i++) {
    const angle = (i / burstCount) * Math.PI * 2 + Math.random() * 0.2;
    const speed = 3.5 + Math.random() * (isSDM ? 8 : 6.5);
    particles.push({
      x: worldX, y: worldY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      life: 14 + Math.floor(Math.random() * (isSDM ? 12 : 10)),
      maxLife: isSDM ? 28 : 24,
      size: 2.5 + Math.random() * (isSDM ? 6 : 4),
      color: i % 5 === 0 ? '#ffffff' : i % 3 === 0 ? glow : color,
      type: 'star', gravity: 0.12, friction: 0.94,
      rotation: angle, rotSpeed: (Math.random() - 0.5) * 0.5,
    });
  }
  // KOF2002: 冲击波差分扩展 — 内环快外环慢, 但整体收紧
  const ringSpeeds = isSDM ? [6, 4.2, 3] : [5.2, 3.6];
  for (let r = 0; r < (isSDM ? 3 : 2); r++) {
    particles.push({
      x: worldX, y: worldY, vx: 0, vy: 0,
      life: 12 + r * 4, maxLife: 12 + r * 4, size: 3 + r * 1.5,
      color: r === 0 ? '#ffffff' : r === 1 ? glow : color, type: 'ring',
    });
  }
}

/** KO落地时的震撼效果 */
export function spawnGroundSlam(particles: Particle[], worldX: number, worldY: number): void {
  particles.push({
    x: worldX, y: worldY, vx: 0, vy: 0,
    life: 24, maxLife: 24, size: 104,
    color: '#ff2200', type: 'groundslam',
  });
  for (let i = 0; i < 20; i++) {
    const angle = -Math.PI + Math.random() * Math.PI;
    const speed = 1.8 + Math.random() * 4.2;
    particles.push({
      x: worldX + (Math.random() - 0.5) * 40,
      y: worldY - 5,
      vx: Math.cos(angle) * speed,
      vy: -Math.random() * 3.4 - 0.8,
      life: 18 + Math.floor(Math.random() * 10),
      maxLife: 30,
      size: 4 + Math.random() * 6,
      color: i % 2 === 0 ? '#9a7b5d' : '#bb9a73', type: 'spark', gravity: 0.12, friction: 0.96,
    });
  }
  for (let i = 0; i < 12; i++) {
    const angle = -Math.PI * 0.2 - Math.random() * Math.PI * 0.6;
    const speed = 2.8 + Math.random() * 4.8;
    particles.push({
      x: worldX + (Math.random() - 0.5) * 30,
      y: worldY - 5,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 14 + Math.floor(Math.random() * 8),
      maxLife: 22,
      size: 2 + Math.random() * 2.5,
      color: i % 3 === 0 ? '#ff8855' : i % 2 === 0 ? '#ffcc00' : '#ff5533', type: 'star',
      gravity: 0.25, friction: 0.95,
      rotation: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.6,
    });
  }
}

export function spawnDamageText(particles: Particle[], worldX: number, worldY: number, value: number, overrideColor?: string): void {
  const isCombo = value > 0 && value <= 50;
  // KOF2002: damage font size scales with damage — bigger hits produce bigger numbers
  const dmgSize = isCombo ? 18 + Math.min(value, 10)
    : value >= 150 ? 28
    : value >= 120 ? 24
    : value >= 80 ? 22
    : value >= 50 ? 18
    : 14;
  // KOF2002: 伤害数字颜色分级 — 低伤害白色, 中等黄色, 高伤害橙红, 超高纯红
  let color: string;
  if (overrideColor) {
    color = overrideColor;
  } else if (isCombo) {
    color = value >= 10 ? '#ff8800' : '#ffcc00';
  } else if (value >= 120) {
    color = '#ff0000';
  } else if (value >= 80) {
    color = '#ff4444';
  } else if (value >= 50) {
    color = '#ffaa22';
  } else {
    color = '#ffffff';
  }
  // KOF2002: float upward from hit position, heavier hits drift less horizontally
  const driftX = isCombo ? 1.2 : (Math.random() - 0.5) * 1.0;
  // Upward float speed scales with damage importance — heavy damage rises faster
  const driftY = isCombo ? -1.4 : value >= 120 ? -2.8 : value >= 80 ? -2.2 : value >= 50 ? -1.6 : -1.2;
  // Lifetime: heavy damage numbers stay visible longer for readability
  const lifeSpan = isCombo ? 50 : value >= 120 ? 60 : value >= 80 ? 55 : 50;
  particles.push({
    x: worldX, y: worldY, vx: driftX, vy: driftY,
    life: lifeSpan, maxLife: lifeSpan,
    size: dmgSize,
    color,
    type: 'text',
    text: isCombo ? `${value} HITS!` : `-${value}`,
    gravity: 0.02,
    friction: 0.99,
  });
}

export function spawnCounterText(particles: Particle[], worldX: number, worldY: number): void {
  particles.push({
    x: worldX, y: worldY, vx: 0, vy: -2.8,
    life: 50, maxLife: 50, size: 20,
    color: '#ff8800', type: 'text', text: 'COUNTER!',
  });
}

export function spawnTechText(particles: Particle[], worldX: number, worldY: number): void {
  particles.push({
    x: worldX, y: worldY, vx: 0, vy: -1.8,
    life: 45, maxLife: 45, size: 18,
    color: '#44aaff', type: 'text', text: 'TECH!',
  });
}

export function spawnFirstAttackText(particles: Particle[], worldX: number, worldY: number): void {
  particles.push({
    x: worldX, y: worldY, vx: 0, vy: -1.5,
    life: 70, maxLife: 70, size: 22,
    color: '#ffdd00', type: 'text', text: 'FIRST ATTACK!',
  });
}

export function spawnComboEndText(particles: Particle[], worldX: number, worldY: number, hits: number): void {
  particles.push({
    x: worldX, y: worldY, vx: 0, vy: -1.2,
    life: 50, maxLife: 50, size: hits >= 10 ? 20 : hits >= 5 ? 18 : 16,
    color: hits >= 10 ? '#ff4444' : '#ff8844', type: 'text', text: `${hits} HITS`,
  });
}


// KOF2002: 实时连击计数器 — 每次命中(第2hit起)显示当前连击数
export function spawnComboHitCounter(particles: Particle[], worldX: number, worldY: number, hitCount: number): void {
  if (hitCount < 2) return; // 第1hit不显示
  const size = hitCount >= 10 ? 18 : hitCount >= 5 ? 16 : 14;
  const color = hitCount >= 10 ? '#ff4444' : hitCount >= 5 ? '#ff8844' : '#ffcc44';
  particles.push({
    x: worldX, y: worldY - 30, vx: 0, vy: -1.5,
    life: 30, maxLife: 30, size,
    color, type: 'text' as const, text: `${hitCount} HIT${hitCount > 1 ? 'S' : ''}`,
  });
}
// KOF2002: 连击结束显示总伤害
export function spawnComboDamageText(particles: Particle[], worldX: number, worldY: number, totalDmg: number): void {
  particles.push({
    x: worldX, y: worldY + 18, vx: 0, vy: -0.8,
    life: 55, maxLife: 55, size: totalDmg >= 200 ? 18 : totalDmg >= 100 ? 16 : 14,
    color: totalDmg >= 200 ? '#ff4444' : '#ffdd44', type: 'text', text: `DMG ${totalDmg}`,
  });
}

export function spawnSuperCancelText(particles: Particle[], worldX: number, worldY: number): void {
  particles.push({
    x: worldX, y: worldY, vx: 0, vy: -2,
    life: 50, maxLife: 50, size: 20,
    color: '#4488ff', type: 'text', text: 'S.CANCEL!',
  });
}

export function spawnFreeCancelText(particles: Particle[], worldX: number, worldY: number): void {
  particles.push({
    x: worldX, y: worldY, vx: 0, vy: -2,
    life: 50, maxLife: 50, size: 20,
    color: '#44ff88', type: 'text', text: 'F.CANCEL!',
  });
}

export function spawnGCCDText(particles: Particle[], worldX: number, worldY: number): void {
  particles.push({
    x: worldX, y: worldY, vx: 0, vy: -2,
    life: 50, maxLife: 50, size: 18,
    color: '#ff8800', type: 'text', text: 'GC CD!',
  });
}

export function spawnCounterStanceText(particles: Particle[], worldX: number, worldY: number): void {
  particles.push({
    x: worldX, y: worldY, vx: 0, vy: -2,
    life: 55, maxLife: 55, size: 22,
    color: '#44ffcc', type: 'text', text: 'COUNTER!',
  });
}

export function spawnReversalText(particles: Particle[], worldX: number, worldY: number): void {
  particles.push({
    x: worldX, y: worldY, vx: 0, vy: -2.5,
    life: 50, maxLife: 50, size: 20,
    color: '#ff44ff', type: 'text', text: 'REVERSAL!',
  });
}

/** Recovery spark — subtle white flash when hitstun ends */
export function spawnRecoverySpark(particles: Particle[], worldX: number, worldY: number): void {
  // KOF2002: 硬直恢复柔和白色闪光
  particles.push({
    x: worldX, y: worldY, vx: 0, vy: 0,
    life: 8, maxLife: 8, size: 20,
    color: '#ffffff', type: 'flash',
  });
  for (let i = 0; i < 6; i++) {
    const angle = Math.PI / 3 * i + Math.random() * 0.4;
    particles.push({
      x: worldX, y: worldY,
      vx: Math.cos(angle) * 1.5, vy: Math.sin(angle) * 1.5,
      life: 8, maxLife: 8, size: 2,
      color: '#ffffff', type: 'spark', gravity: 0, friction: 0.9,
    });
  }
}

export function spawnDust(particles: Particle[], worldX: number, worldY: number, dustColors?: [string, string]): void {
  // KOF2002: 尘土更飘散 — 10个粒子, 更宽分布, stage-specific colors
  const colors = dustColors || ['#aaaabb', '#888899'];
  for (let i = 0; i < 10; i++) {
    const dir = (i - 5) * 1.5;
    particles.push({
      x: worldX + dir * 2, y: worldY - 2,
      vx: dir * 0.9, vy: -Math.random() * 1.8 - 0.3,
      life: 15 + Math.floor(Math.random() * 8),
      maxLife: 23,
      size: 3 + Math.random() * 5,
      color: i % 3 === 0 ? colors[0] : colors[1], type: 'spark', gravity: 0.04, friction: 0.94,
    });
  }
}

export function spawnHeavyDust(particles: Particle[], worldX: number, worldY: number, count: number = 12): void {
  for (let i = 0; i < count; i++) {
    const dir = (i - count / 2) * 1.5;
    particles.push({
      x: worldX + dir * 2, y: worldY - 2,
      vx: dir * 1.2, vy: -Math.random() * 2.5 - 1,
      life: 20 + Math.floor(Math.random() * 10),
      maxLife: 30,
      size: 5 + Math.random() * 6,
      color: '#998877', type: 'spark', gravity: 0.08, friction: 0.93,
    });
  }
}

export function spawnCounterWireSparks(particles: Particle[], worldX: number, worldY: number): void {
  // KOF2002: 壁弹初始橙色闪光核心
  particles.push({
    x: worldX, y: worldY, vx: 0, vy: 0,
    life: 8, maxLife: 8, size: 30,
    color: '#ff8800', type: 'flash',
  });
  for (let i = 0; i < 16; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 8;
    particles.push({
      x: worldX, y: worldY,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 3,
      life: 15 + Math.floor(Math.random() * 10), maxLife: 25,
      size: 3 + Math.random() * 5, color: i % 3 === 0 ? '#ff6622' : '#ffdd44',
      type: 'star', gravity: 0.15, friction: 0.95,
      rotation: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.5,
    });
  }
  // 壁弹冲击环
  particles.push({
    x: worldX, y: worldY, vx: 0, vy: 0,
    life: 15, maxLife: 15, size: 50,
    color: '#ffaa22', type: 'ring',
  });
}

/** MAX模式激活光环 */
export function spawnMAXAura(particles: Particle[], worldX: number, worldY: number): void {
  for (let r = 0; r < 3; r++) {
    particles.push({
      x: worldX, y: worldY - 30, vx: 0, vy: 0,
      life: 16 + r * 5, maxLife: 16 + r * 5, size: 7 + r * 4,
      color: r === 0 ? '#ffffff' : r === 1 ? '#55ff99' : '#22bb55', type: 'ring',
    });
  }
  for (let i = 0; i < 16; i++) {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.2;
    const speed = 2.8 + Math.random() * 5.2;
    particles.push({
      x: worldX + (Math.random() - 0.5) * 30,
      y: worldY - 20,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      life: 13 + Math.floor(Math.random() * 8),
      maxLife: 22,
      size: 2 + Math.random() * 3,
      color: i % 4 === 0 ? '#ffffff' : i % 2 === 0 ? '#88ffaa' : '#44dd77',
      type: 'star', gravity: -0.05, friction: 0.94,
      rotation: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.4,
    });
  }
}

/** MAX mode activation flash — dramatic screen-wide energy burst */
export function spawnMAXActivationFlash(particles: Particle[], worldX: number, worldY: number): void {
  // KOF2002: MAX激活初始白色核心爆发
  particles.push({
    x: worldX, y: worldY, vx: 0, vy: 0,
    life: 7, maxLife: 7, size: 42,
    color: '#ffffff', type: 'flash',
  });
  for (let r = 0; r < 4; r++) {
    particles.push({
      x: worldX, y: worldY, vx: 0, vy: 0,
      life: 16 + r * 4, maxLife: 16 + r * 4, size: 10 + r * 6,
      color: r === 0 ? '#ffffff' : r === 1 ? '#ddffeb' : r === 2 ? '#44ff88' : '#22bb55', type: 'ring',
    });
  }
  for (let i = 0; i < 18; i++) {
    const angle = (Math.PI * 2 * i) / 18;
    const speed = 3.5 + Math.random() * 5;
    particles.push({
      x: worldX, y: worldY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 16 + Math.floor(Math.random() * 6),
      maxLife: 22, size: 2.5 + Math.random() * 2.5,
      color: i % 3 === 0 ? '#ffffff' : i % 2 === 0 ? '#aaffcc' : '#44ff88',
      type: 'star', gravity: 0, friction: 0.92,
      rotation: angle, rotSpeed: 0,
    });
  }
}

/** Perfect闪光 — 金色粒子+双层辉光环 */
export function spawnPerfectFlash(particles: Particle[], worldX: number, worldY: number): void {
  for (let i = 0; i < 20; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2.8 + Math.random() * 6;
    particles.push({
      x: worldX, y: worldY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 3,
      life: 18 + Math.floor(Math.random() * 10),
      maxLife: 28,
      size: 2.5 + Math.random() * 4,
      color: i % 4 === 0 ? '#ffffff' : i % 2 === 0 ? '#ffcc00' : '#ff9933',
      type: 'star', gravity: 0.1, friction: 0.94,
      rotation: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.5,
    });
  }
  particles.push({
    x: worldX, y: worldY, vx: 0, vy: 0,
    life: 22, maxLife: 22, size: 13,
    color: '#ffcc00', type: 'ring',
  });
  // KOF2002: Perfect保留外层白环, 但压缩铺张感
  particles.push({
    x: worldX, y: worldY, vx: 0, vy: 0,
    life: 24, maxLife: 24, size: 8,
    color: '#ffffff', type: 'ring',
  });
}

export function spawnProjectileExplosion(particles: Particle[], worldX: number, worldY: number, charColor: string, charGlow: string): void {
  particles.push({
    x: worldX, y: worldY, vx: 0, vy: 0,
    life: 14, maxLife: 14, size: 44,
    color: charGlow, type: 'flash',
  });
  for (let i = 0; i < 14; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2.8 + Math.random() * 5.2;
    particles.push({
      x: worldX, y: worldY,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 2,
      life: 11 + Math.floor(Math.random() * 7), maxLife: 18,
      size: 2.5 + Math.random() * 3.5,
      color: i % 3 === 0 ? '#ffffff' : charColor,
      type: 'star', gravity: 0.2, friction: 0.94,
      rotation: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.4,
    });
  }
  // KOF2002: 飞行道具爆炸二次扩散冲击环
  particles.push({
    x: worldX, y: worldY, vx: 0, vy: 0,
    life: 10, maxLife: 10, size: 7,
    color: charColor, type: 'ring',
  });
  particles.push({
    x: worldX, y: worldY, vx: 0, vy: 0,
    life: 14, maxLife: 14, size: 3.5,
    color: '#ffffff', type: 'ring',
  });
}

/** 取消点闪光 — 命中可取消时在攻击者身上显示短暂的蓝白光环, 提示取消窗口 */
export function spawnCancelFlash(particles: Particle[], x: number, y: number, height: number): void {
  // 蓝白色核心闪光 — 位于身体中心
  particles.push({
    x, y: y - height * 0.5, vx: 0, vy: 0,
    life: 8, maxLife: 8, size: 18,
    color: '#88ccff', type: 'flash',
  });
  // 围绕身体的蓝白粒子环
  const count = 8;
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    particles.push({
      x, y: y - height * 0.5,
      vx: Math.cos(angle) * 2.5,
      vy: Math.sin(angle) * 2.5,
      life: 8, maxLife: 8, size: 4,
      color: '#88ccff',
      type: 'spark',
      gravity: 0,
      friction: 0.9,
    });
  }
}

/** KOF2002: Taunt sparks — small descending energy particles */
export function spawnTauntSparks(particles: Particle[], worldX: number, worldY: number): void {
  for (let i = 0; i < 8; i++) {
    const angle = Math.PI * 0.3 + Math.random() * Math.PI * 0.4;
    const speed = 1.5 + Math.random() * 2;
    particles.push({
      x: worldX + (Math.random() - 0.5) * 20,
      y: worldY + (Math.random() - 0.5) * 10,
      vx: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1),
      vy: Math.sin(angle) * speed,
      life: 18 + Math.floor(Math.random() * 10),
      maxLife: 28,
      size: 2 + Math.random() * 3,
      color: i % 2 === 0 ? '#ffcc44' : '#ff8844',
      type: 'star',
      gravity: 0.05,
      friction: 0.96,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.3,
    });
  }
}

/** KOF2002: Dizzy stars — orbiting stars above the character's head */
export function spawnDizzyStars(particles: Particle[], worldX: number, worldY: number): void {
  // 3 stars orbiting above the head
  const starCount = 3;
  for (let i = 0; i < starCount; i++) {
    const angle = (i / starCount) * Math.PI * 2;
    particles.push({
      x: worldX + Math.cos(angle) * 15,
      y: worldY - 15,
      vx: Math.cos(angle) * 0.8,
      vy: -0.3,
      life: 60,
      maxLife: 60,
      size: 5 + Math.random() * 3,
      color: i === 0 ? '#ffff44' : i === 1 ? '#ff44ff' : '#44ffff',
      type: 'star',
      gravity: 0,
      friction: 1.0,
      rotation: angle,
      rotSpeed: 0.1,
    });
  }
}

// ═══════════════════════════════════════════════════════════════
// Ryo-specific Special Move VFX
// ═══════════════════════════════════════════════════════════════

/**
 * Ko'ou Ken (虎煌拳) projectile VFX — bright orange/yellow ki blast orb with trailing particles.
 * Orb is 39x39 effective size (+30%), rotating particle ring (6 orbiting dots),
 * 3 trailing blue energy dots per position that fade over 8 frames.
 * Trailing particles move forward at 8px/frame equivalent, duration 40 frames.
 */
export function spawnKooukenVFX(particles: Particle[], x: number, y: number, facing: number, _charId: string): void {
  const coreY = y - 10;
  const coreVx = facing * 8;
  // Core ki blast orb — orange/yellow flash (size increased by 30%: 30 → 39)
  particles.push({
    x, y: coreY, vx: coreVx, vy: 0,
    life: 40, maxLife: 40, size: 39,
    color: '#ffaa22', type: 'flash',
  });
  // White-hot center (size increased by 30%: 15 → 20)
  particles.push({
    x, y: coreY, vx: coreVx, vy: 0,
    life: 35, maxLife: 35, size: 20,
    color: '#ffffff', type: 'flash',
  });

  // === Rotating particle ring: 6 small particles orbiting the projectile center ===
  const ringCount = 6;
  const ringRadius = 22; // orbit radius around core
  const ringSpeed = 0.35; // angular speed per frame
  for (let i = 0; i < ringCount; i++) {
    const baseAngle = (i / ringCount) * Math.PI * 2;
    particles.push({
      x: x + Math.cos(baseAngle) * ringRadius,
      y: coreY + Math.sin(baseAngle) * ringRadius,
      vx: coreVx,
      vy: 0,
      life: 40, maxLife: 40, size: 3,
      color: i % 2 === 0 ? '#ffdd66' : '#ffffff',
      type: 'spark',
      gravity: 0,
      friction: 1.0,
      rotation: baseAngle,
      rotSpeed: ringSpeed,
    });
  }

  // === Trailing blue energy dots: 3 dots per frame position, fade over 8 frames ===
  // Simulate 3 trailing "frame positions" behind the projectile
  for (let t = 0; t < 5; t++) {
    const trailX = x - facing * (8 + t * 6);
    for (let j = 0; j < 3; j++) {
      particles.push({
        x: trailX + (Math.random() - 0.5) * 6,
        y: coreY + (Math.random() - 0.5) * 8,
        vx: facing * (2 + Math.random() * 2),
        vy: (Math.random() - 0.5) * 1.5,
        life: 8, maxLife: 8,
        size: 2 + Math.random() * 2,
        color: j === 0 ? '#4488ff' : j === 1 ? '#66aaff' : '#88ccff',
        type: 'spark',
        gravity: 0,
        friction: 0.92,
      });
    }
  }

  // Original trailing particles — fading orange to transparent
  for (let i = 0; i < 8; i++) {
    const delay = i * 3;
    particles.push({
      x: x - facing * (8 + i * 6),
      y: coreY + (Math.random() - 0.5) * 10,
      vx: facing * (8 - i * 0.6),
      vy: (Math.random() - 0.5) * 1.2,
      life: 20 - i * 2 + delay,
      maxLife: 20 + delay,
      size: 8 + Math.random() * 4 - i * 0.5,
      color: i % 2 === 0 ? '#ff8800' : '#ffcc44',
      type: 'spark',
      gravity: 0,
      friction: 0.96,
    });
  }
}

/**
 * Ko Hou (虎咲) uppercut flame column — rising flame from ground to peak.
 * Orange-red with white core, 12 particles in a column pattern, rising and fading.
 * Duration: 20 frames.
 * Enhanced: ground dust burst (5 brown/gray fan particles) + ascending air lines (3 vertical speed lines).
 */
export function spawnKoHouVFX(particles: Particle[], x: number, y: number, _charId: string): void {
  // White-hot core flash at ground level
  particles.push({
    x, y: y - 20, vx: 0, vy: -6,
    life: 12, maxLife: 12, size: 35,
    color: '#ffffff', type: 'flash',
  });
  // Orange-red flame column — 12 particles rising upward
  for (let i = 0; i < 12; i++) {
    const heightOffset = i * 8;
    const spread = (Math.random() - 0.5) * 10;
    particles.push({
      x: x + spread,
      y: y - heightOffset,
      vx: (Math.random() - 0.5) * 1.5,
      vy: -4 - Math.random() * 3,
      life: 18 - Math.floor(i * 0.8),
      maxLife: 20,
      size: 6 + Math.random() * 4,
      color: i < 3 ? '#ffffff' : i < 6 ? '#ffaa33' : '#ff4400',
      type: 'spark',
      gravity: -0.15,
      friction: 0.94,
    });
  }
  // Base impact ring
  particles.push({
    x, y: y, vx: 0, vy: 0,
    life: 12, maxLife: 12, size: 8,
    color: '#ff6600', type: 'ring',
  });

  // === Ground dust burst: 5 brown/gray fan-shaped particles rising from ground ===
  const dustColors = ['#9a7b5d', '#bb9a73', '#887766', '#aa9070', '#776655'];
  for (let i = 0; i < 5; i++) {
    const angle = -Math.PI * 0.15 - (i / 4) * Math.PI * 0.7; // fan spread upward
    const speed = 2.5 + Math.random() * 3;
    particles.push({
      x: x + (Math.random() - 0.5) * 20,
      y: y,
      vx: Math.cos(angle) * speed * (i < 2 ? -1 : 1) * 0.8,
      vy: -Math.abs(Math.sin(angle) * speed) - 1,
      life: 16 + Math.floor(Math.random() * 8),
      maxLife: 24,
      size: 4 + Math.random() * 5,
      color: dustColors[i],
      type: 'spark',
      gravity: 0.12,
      friction: 0.95,
    });
  }

  // === Ascending air lines: 3 vertical speed lines rising alongside the character ===
  for (let i = 0; i < 3; i++) {
    const lineX = x + (i - 1) * 14;
    particles.push({
      x: lineX,
      y: y + 10,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -8 - Math.random() * 4,
      life: 12 + Math.floor(Math.random() * 4),
      maxLife: 16,
      size: 20 + Math.random() * 15,
      color: i === 1 ? '#ffffff' : '#ffddaa',
      type: 'slash',
      rotation: -Math.PI / 2, // vertical
    });
  }
}

/**
 * Ko Hou C version (虎咲C) — doubled intensity: larger flame, more particles.
 * Same as spawnKoHouVFX but with 2x particle counts and larger sizes.
 */
export function spawnKoHouCVFX(particles: Particle[], x: number, y: number, _charId: string): void {
  // White-hot core flash — doubled size
  particles.push({
    x, y: y - 20, vx: 0, vy: -6,
    life: 16, maxLife: 16, size: 50,
    color: '#ffffff', type: 'flash',
  });
  // Extra bright core layer
  particles.push({
    x, y: y - 30, vx: 0, vy: -5,
    life: 14, maxLife: 14, size: 40,
    color: '#ffcc66', type: 'flash',
  });
  // Orange-red flame column — 24 particles (doubled), larger
  for (let i = 0; i < 24; i++) {
    const heightOffset = i * 7;
    const spread = (Math.random() - 0.5) * 14;
    particles.push({
      x: x + spread,
      y: y - heightOffset,
      vx: (Math.random() - 0.5) * 2,
      vy: -5 - Math.random() * 4,
      life: 22 - Math.floor(i * 0.7),
      maxLife: 24,
      size: 8 + Math.random() * 6,
      color: i < 4 ? '#ffffff' : i < 8 ? '#ffcc44' : i < 16 ? '#ff8800' : '#ff4400',
      type: 'spark',
      gravity: -0.18,
      friction: 0.93,
    });
  }
  // Base impact ring — doubled
  particles.push({
    x, y: y, vx: 0, vy: 0,
    life: 14, maxLife: 14, size: 12,
    color: '#ff6600', type: 'ring',
  });
  particles.push({
    x, y: y, vx: 0, vy: 0,
    life: 10, maxLife: 10, size: 6,
    color: '#ffffff', type: 'ring',
  });

  // === Ground dust burst: 10 brown/gray particles (doubled) ===
  const dustColors = ['#9a7b5d', '#bb9a73', '#887766', '#aa9070', '#776655'];
  for (let i = 0; i < 10; i++) {
    const angle = -Math.PI * 0.15 - (i / 9) * Math.PI * 0.7;
    const speed = 3 + Math.random() * 4;
    particles.push({
      x: x + (Math.random() - 0.5) * 30,
      y: y,
      vx: Math.cos(angle) * speed * (i < 5 ? -1 : 1) * 0.8,
      vy: -Math.abs(Math.sin(angle) * speed) - 1.5,
      life: 20 + Math.floor(Math.random() * 10),
      maxLife: 30,
      size: 5 + Math.random() * 6,
      color: dustColors[i % 5],
      type: 'spark',
      gravity: 0.12,
      friction: 0.94,
    });
  }

  // === Ascending air lines: 6 vertical speed lines (doubled) ===
  for (let i = 0; i < 6; i++) {
    const lineX = x + (i - 2.5) * 10;
    particles.push({
      x: lineX,
      y: y + 10,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -9 - Math.random() * 5,
      life: 14 + Math.floor(Math.random() * 4),
      maxLife: 18,
      size: 25 + Math.random() * 20,
      color: i % 2 === 0 ? '#ffffff' : '#ffddaa',
      type: 'slash',
      rotation: -Math.PI / 2,
    });
  }
}

/**
 * Hien (飛燕) flying kick trail — speed lines behind the character during flight.
 * 6 horizontal lines with alpha fade. Color based on character accent color.
 * Enhanced: 3 parallel curved lines following the kick arc trajectory.
 */
export function spawnHienTrail(particles: Particle[], x: number, y: number, facing: number, _charId: string): void {
  for (let i = 0; i < 6; i++) {
    const yOffset = (i - 2.5) * 8;
    particles.push({
      x: x - facing * (10 + i * 4),
      y: y - 15 + yOffset,
      vx: -facing * (3 + Math.random() * 2),
      vy: (Math.random() - 0.5) * 0.8,
      life: 12 - i,
      maxLife: 12,
      size: 20 + Math.random() * 15,
      color: i % 2 === 0 ? '#ffcc44' : '#ff8833',
      type: 'slash',
      rotation: facing > 0 ? 0 : Math.PI,
    });
  }

  // === Arc speed lines: 3 parallel curved lines following the kick arc ===
  for (let i = 0; i < 3; i++) {
    const arcOffset = (i - 1) * 12; // parallel offset
    const arcAngle = facing > 0 ? -0.4 + i * 0.2 : Math.PI + 0.4 - i * 0.2;
    particles.push({
      x: x - facing * (15 + i * 8),
      y: y - 20 + arcOffset,
      vx: -facing * (2 + Math.random() * 2),
      vy: 1.5 + Math.random(),
      life: 10 + i * 2,
      maxLife: 14,
      size: 28 + Math.random() * 12,
      color: '#ffdd66',
      type: 'slash',
      rotation: arcAngle,
    });
  }
}

/**
 * Hien (飛燕) landing dust — fan of dust particles when the character lands after the flying kick.
 * 5 particles in a fan shape rising from the ground.
 */
export function spawnHienLandingDust(particles: Particle[], x: number, y: number): void {
  const dustColors = ['#9a7b5d', '#bb9a73', '#887766', '#aa9070', '#776655'];
  for (let i = 0; i < 5; i++) {
    const fanAngle = -Math.PI * 0.1 - (i / 4) * Math.PI * 0.8;
    const speed = 2 + Math.random() * 3;
    const dir = (i < 2) ? -1 : (i > 2) ? 1 : 0;
    particles.push({
      x: x + dir * 8 + (Math.random() - 0.5) * 10,
      y: y,
      vx: dir * speed * 1.5,
      vy: -Math.abs(Math.sin(fanAngle) * speed) - 1,
      life: 14 + Math.floor(Math.random() * 8),
      maxLife: 22,
      size: 4 + Math.random() * 5,
      color: dustColors[i],
      type: 'spark',
      gravity: 0.12,
      friction: 0.95,
    });
  }
}

/**
 * DM Ten Ha Ou (天地霸煌拳) energy burst — massive energy explosion.
 * Expanding ring + flash + screen shake trigger. Golden yellow with white core.
 * 30+ particles in expanding circle pattern. Screen flash for 10 frames.
 * Duration: 40 frames.
 */
export function spawnDMTenHaOuVFX(particles: Particle[], x: number, y: number, _charId: string): void {
  // Massive white core explosion
  particles.push({
    x, y: y - 20, vx: 0, vy: 0,
    life: 20, maxLife: 20, size: 90,
    color: '#ffffff', type: 'superburst',
  });
  // Golden yellow main burst
  particles.push({
    x, y: y - 20, vx: 0, vy: 0,
    life: 30, maxLife: 30, size: 110,
    color: '#ffcc00', type: 'superburst',
  });
  // 30+ particles in expanding circle pattern
  for (let i = 0; i < 32; i++) {
    const angle = (i / 32) * Math.PI * 2 + Math.random() * 0.15;
    const speed = 3.5 + Math.random() * 7;
    particles.push({
      x, y: y - 20,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2.5,
      life: 18 + Math.floor(Math.random() * 14),
      maxLife: 35,
      size: 3 + Math.random() * 5,
      color: i % 4 === 0 ? '#ffffff' : i % 3 === 0 ? '#ffee66' : '#ffaa00',
      type: 'star',
      gravity: 0.1,
      friction: 0.94,
      rotation: angle,
      rotSpeed: (Math.random() - 0.5) * 0.5,
    });
  }
  // Multiple expanding rings for shockwave feel
  for (let r = 0; r < 3; r++) {
    particles.push({
      x, y: y - 20, vx: 0, vy: 0,
      life: 15 + r * 5, maxLife: 15 + r * 5, size: 6 + r * 3,
      color: r === 0 ? '#ffffff' : r === 1 ? '#ffee66' : '#ffaa00',
      type: 'ring',
    });
  }
}

/**
 * Haou Shou Kou Ken (霸王翔吼拳) counter flash — bright shield-like burst on counter activation.
 * Duration: 15 frames.
 */
export function spawnHaouFlash(particles: Particle[], x: number, y: number, _charId: string): void {
  // Bright shield-shaped flash
  particles.push({
    x, y: y - 20, vx: 0, vy: 0,
    life: 10, maxLife: 10, size: 50,
    color: '#ffffff', type: 'flash',
  });
  // Golden outer burst
  particles.push({
    x, y: y - 20, vx: 0, vy: 0,
    life: 12, maxLife: 12, size: 65,
    color: '#ffcc44', type: 'flash',
  });
  // Scattered golden sparks for shield effect
  for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * Math.PI * 2;
    const speed = 2 + Math.random() * 3;
    particles.push({
      x, y: y - 20,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 10 + Math.floor(Math.random() * 5),
      maxLife: 15,
      size: 3 + Math.random() * 3,
      color: i % 3 === 0 ? '#ffffff' : '#ffcc44',
      type: 'spark',
      gravity: 0,
      friction: 0.92,
    });
  }
  // Counter activation ring
  particles.push({
    x, y: y - 20, vx: 0, vy: 0,
    life: 12, maxLife: 12, size: 10,
    color: '#ffcc44', type: 'ring',
  });
}

/**
 * 命中招式名显示 — KOF2002风格, 命中时在命中位置上方浮动显示招式名
 * 从命中位置向上飘并淡出, 字体大小根据攻击类型分级:
 * - heavy (重通常技): 16px, 白色
 * - special (必杀技): 20px, 角色色
 * - DM/SDM (超必杀技): 26px, 金色
 */
export function spawnMoveNameText(particles: Particle[], worldX: number, worldY: number, moveName: string, color: string, fontSize: number): void {
  // KOF2002: 招式名弹出 — 先短暂放大再恢复, 然后上浮淡出
  const lifeSpan = fontSize >= 26 ? 65 : fontSize >= 20 ? 55 : 45;
  const driftY = fontSize >= 26 ? -2.2 : fontSize >= 20 ? -1.8 : -1.4;
  particles.push({
    x: worldX, y: worldY,
    vx: 0, vy: driftY,
    life: lifeSpan, maxLife: lifeSpan,
    size: fontSize,
    color,
    type: 'text',
    text: moveName,
    gravity: 0.01,
    friction: 0.995,
  });
}

/**
 * 天地霸煌拳 命中时能量爆炸 — 大型扩展能量爆破 + 全屏白色闪光
 * 命中后在命中位置产生巨大能量球扩展 + 全屏白色闪烁 + 强力震屏触发
 */
export function spawnTenHaOuBlast(particles: Particle[], x: number, y: number, facing: number): void {
  // Stage 1: 巨型白色核心闪光
  particles.push({
    x, y: y - 20, vx: 0, vy: 0,
    life: 16, maxLife: 16, size: 120,
    color: '#ffffff', type: 'superburst',
  });
  // Stage 2: 金色能量球持续扩展
  particles.push({
    x, y: y - 20, vx: 0, vy: 0,
    life: 25, maxLife: 25, size: 150,
    color: '#ffcc00', type: 'superburst',
  });
  // Stage 3: 外环扩散冲击波 (3层)
  for (let r = 0; r < 3; r++) {
    particles.push({
      x, y: y - 20, vx: 0, vy: 0,
      life: 18 + r * 6, maxLife: 18 + r * 6, size: 8 + r * 4,
      color: r === 0 ? '#ffffff' : r === 1 ? '#ffee44' : '#ffaa00',
      type: 'ring',
    });
  }
  // Stage 4: 放射状星粒子 (40个)
  for (let i = 0; i < 40; i++) {
    const angle = (i / 40) * Math.PI * 2 + Math.random() * 0.1;
    const speed = 4 + Math.random() * 9;
    particles.push({
      x, y: y - 20,
      vx: Math.cos(angle) * speed * (facing !== 0 ? (facing > 0 ? 1.2 : 0.8) : 1),
      vy: Math.sin(angle) * speed - 2.5,
      life: 20 + Math.floor(Math.random() * 16),
      maxLife: 38,
      size: 3 + Math.random() * 6,
      color: i % 5 === 0 ? '#ffffff' : i % 3 === 0 ? '#ffee66' : '#ffaa00',
      type: 'star',
      gravity: 0.08,
      friction: 0.93,
      rotation: angle,
      rotSpeed: (Math.random() - 0.5) * 0.6,
    });
  }
  // Stage 5: 方向性冲击波 — 面向方向扩展更快
  for (let i = 0; i < 8; i++) {
    const spreadAngle = (Math.random() - 0.5) * Math.PI * 0.6;
    const speed = 8 + Math.random() * 6;
    particles.push({
      x, y: y - 20,
      vx: Math.cos(spreadAngle) * speed * facing,
      vy: Math.sin(spreadAngle) * speed - 2,
      life: 14 + Math.floor(Math.random() * 10),
      maxLife: 24,
      size: 5 + Math.random() * 4,
      color: '#ffffff',
      type: 'star',
      gravity: 0.05,
      friction: 0.92,
      rotation: spreadAngle,
      rotSpeed: (Math.random() - 0.5) * 0.3,
    });
  }
}

/**
 * 屏幕裂纹效果 — HSDM激活时产生裂纹线粒子
 * 从中心向四周扩展的黑色/红色裂纹线
 */
export function spawnScreenCracks(particles: Particle[], x: number, y: number): void {
  // 裂纹线 — 从中心向外放射
  const crackCount = 12;
  for (let i = 0; i < crackCount; i++) {
    const angle = (i / crackCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
    const length = 80 + Math.random() * 120;
    // 用slash类型模拟裂纹线
    particles.push({
      x: x + Math.cos(angle) * 20,
      y: y + Math.sin(angle) * 20,
      vx: Math.cos(angle) * 3,
      vy: Math.sin(angle) * 3,
      life: 18 + Math.floor(Math.random() * 10),
      maxLife: 28,
      size: length * 0.3,
      color: i % 3 === 0 ? '#ff2244' : i % 2 === 0 ? '#220011' : '#440022',
      type: 'slash',
      rotation: angle,
    });
  }
  // 中心暗红闪光
  particles.push({
    x, y, vx: 0, vy: 0,
    life: 12, maxLife: 12, size: 60,
    color: '#ff1133', type: 'flash',
  });
  // 二次裂纹碎片 — 小型星粒子
  for (let i = 0; i < 16; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 5;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.5,
      life: 12 + Math.floor(Math.random() * 8),
      maxLife: 20,
      size: 2 + Math.random() * 3,
      color: i % 3 === 0 ? '#ff4466' : '#110011',
      type: 'star',
      gravity: 0.1,
      friction: 0.94,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.5,
    });
  }
}

/**
 * 浮动连击文本 — 在被击方头顶显示当前连击数和累计伤害
 * - 2-4 hits: 白色
 * - 5-9 hits: 黄色
 * - 10+ hits: 红色
 * 格式: "5 HIT (234)" — 连击数 + 累计伤害
 */
export function spawnFloatingComboText(particles: Particle[], worldX: number, worldY: number, combo: number, totalDamage: number): void {
  let color: string;
  if (combo >= 10) color = '#ff3333';
  else if (combo >= 5) color = '#ffcc00';
  else color = '#ffffff';

  const size = combo >= 10 ? 20 : combo >= 5 ? 17 : 14;
  const text = `${combo} HIT (${totalDamage})`;

  // 主文字 — 弹出+上浮+淡出
  particles.push({
    x: worldX, y: worldY,
    vx: 0, vy: -1.8,
    life: 50, maxLife: 50,
    size,
    color,
    type: 'text',
    text,
  });
}

/** KOF2002: 连击速度线 — 高连击时背景出现速度线增强紧迫感 */
export function spawnComboSpeedLines(particles: Particle[], centerX: number, centerY: number, comboCount: number): void {
  const lineCount = Math.min(8, Math.floor(comboCount / 3));
  for (let i = 0; i < lineCount; i++) {
    const angle = -Math.PI * 0.4 + (i / lineCount) * Math.PI * 0.8;
    const speed = 3 + Math.random() * 4;
    particles.push({
      x: centerX + (Math.random() - 0.5) * 60,
      y: centerY + (Math.random() - 0.5) * 40,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed * 0.5,
      life: 8 + Math.floor(Math.random() * 6),
      maxLife: 14,
      size: 1 + Math.random(),
      color: '#ffffff',
      type: 'spark',
      gravity: 0,
      friction: 0.95,
    });
  }
}

/**
 * DM Ryuko Ranbu (龍虎乱舞) speed line background — parallel lines streaming from edges toward center.
 * Creates the classic "rush" background effect during multi-hit DM.
 */
export function spawnRyukoRanbuSpeedLines(particles: Particle[], centerX: number, centerY: number): void {
  const lineCount = 12;
  for (let i = 0; i < lineCount; i++) {
    // Lines stream from left/right edges toward center
    const fromLeft = i < lineCount / 2;
    const edgeX = fromLeft ? centerX - 200 : centerX + 200;
    const yOffset = (Math.random() - 0.5) * 100;
    const speed = 8 + Math.random() * 6;
    particles.push({
      x: edgeX,
      y: centerY + yOffset,
      vx: fromLeft ? speed : -speed,
      vy: (Math.random() - 0.5) * 2,
      life: 10 + Math.floor(Math.random() * 6),
      maxLife: 16,
      size: 1.5 + Math.random(),
      color: i % 3 === 0 ? '#ffffff' : '#ffddaa',
      type: 'spark',
      gravity: 0,
      friction: 0.88,
    });
  }
}

/**
 * DM Ryuko Ranbu (龍虎乱舞) final hit burst — large impact burst + extra knockback spark.
 * Called on the final hit of the rush combo for a dramatic finisher.
 */
export function spawnRyukoRanbuFinalBurst(particles: Particle[], x: number, y: number, facing: number): void {
  // Massive white-gold impact burst
  particles.push({
    x, y: y - 20, vx: 0, vy: 0,
    life: 16, maxLife: 16, size: 70,
    color: '#ffffff', type: 'superburst',
  });
  particles.push({
    x, y: y - 20, vx: 0, vy: 0,
    life: 22, maxLife: 22, size: 90,
    color: '#ffcc00', type: 'superburst',
  });
  // Directional knockback sparks
  for (let i = 0; i < 16; i++) {
    const spreadAngle = (Math.random() - 0.5) * Math.PI * 0.8;
    const speed = 5 + Math.random() * 7;
    particles.push({
      x, y: y - 20,
      vx: Math.cos(spreadAngle) * speed * facing,
      vy: Math.sin(spreadAngle) * speed - 3,
      life: 14 + Math.floor(Math.random() * 8),
      maxLife: 22,
      size: 3 + Math.random() * 5,
      color: i % 3 === 0 ? '#ffffff' : '#ffcc00',
      type: 'star',
      gravity: 0.1,
      friction: 0.93,
      rotation: spreadAngle,
      rotSpeed: (Math.random() - 0.5) * 0.5,
    });
  }
  // Impact rings
  for (let r = 0; r < 3; r++) {
    particles.push({
      x, y: y - 20, vx: 0, vy: 0,
      life: 10 + r * 4, maxLife: 10 + r * 4, size: 5 + r * 3,
      color: r === 0 ? '#ffffff' : '#ffcc00',
      type: 'ring',
    });
  }
}

/**
 * KO super-burst spark — massive impact spark at KO hit point (2x size of DM spark).
 * Used for the conclusive KO effect.
 */
export function spawnKOSuperBurst(particles: Particle[], x: number, y: number): void {
  // Triple-layer superburst at 2x DM size
  particles.push({
    x, y, vx: 0, vy: 0,
    life: 24, maxLife: 24, size: 140,
    color: '#ffffff', type: 'superburst',
  });
  particles.push({
    x, y, vx: 0, vy: 0,
    life: 30, maxLife: 30, size: 180,
    color: '#ffcc00', type: 'superburst',
  });
  particles.push({
    x, y, vx: 0, vy: 0,
    life: 36, maxLife: 36, size: 220,
    color: '#ff4400', type: 'superburst',
  });
  // Radiating impact sparks
  for (let i = 0; i < 40; i++) {
    const angle = (i / 40) * Math.PI * 2;
    const speed = 6 + Math.random() * 10;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 3,
      life: 20 + Math.floor(Math.random() * 12),
      maxLife: 32,
      size: 3 + Math.random() * 6,
      color: i % 4 === 0 ? '#ffffff' : i % 3 === 0 ? '#ffdd66' : '#ffaa00',
      type: 'star',
      gravity: 0.08,
      friction: 0.93,
      rotation: angle,
      rotSpeed: (Math.random() - 0.5) * 0.6,
    });
  }
}

/** KOF2002: Running speed lines — horizontal streaks behind a dashing character */
export function spawnRunSpeedLines(particles: Particle[], x: number, y: number, facing: number, charColor: string): void {
  const lineCount = 2;
  for (let i = 0; i < lineCount; i++) {
    particles.push({
      x: x - facing * (8 + Math.random() * 12),
      y: y - 10 - Math.random() * (60 + i * 20),
      vx: -facing * (2.5 + Math.random() * 2),
      vy: (Math.random() - 0.5) * 0.5,
      life: 6 + Math.floor(Math.random() * 4),
      maxLife: 10,
      size: 0.8 + Math.random() * 0.4,
      color: charColor,
      type: 'spark',
      gravity: 0,
      friction: 0.92,
    });
  }
}

/** Ground scorch mark — fades over time, appears at heavy impact locations */
export function spawnScorchMark(particles: Particle[], x: number, groundY: number, color: string = '#332211'): void {
  particles.push({
    x: x + (Math.random() - 0.5) * 8,
    y: groundY,
    vx: 0,
    vy: 0,
    life: 60,
    maxLife: 60,
    size: 12 + Math.random() * 8,
    color,
    type: 'scorch',
    gravity: 0,
    friction: 1,
  });
}
