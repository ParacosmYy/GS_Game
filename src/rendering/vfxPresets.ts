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
export function spawnGroundSlam(particles: Particle[], worldX: number, worldY: number, dustColors?: [string, string]): void {
  const dc = dustColors || ['#9a7b5d', '#bb9a73'];
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
      color: i % 2 === 0 ? dc[0] : dc[1], type: 'spark', gravity: 0.12, friction: 0.96,
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


// Character-specific and combat VFX functions moved to vfxCharPresets.ts
// Re-export for backward compatibility
export {
  spawnKooukenVFX, spawnKoHouVFX, spawnKoHouCVFX, spawnHienTrail, spawnHienLandingDust,
  spawnKyoFireKickTrail, spawnDMTenHaOuVFX, spawnHaouFlash, spawnMoveNameText,
  spawnTenHaOuBlast, spawnScreenCracks, spawnFloatingComboText, spawnComboSpeedLines,
  spawnRyukoRanbuSpeedLines, spawnRyukoRanbuFinalBurst, spawnKOSuperBurst,
  spawnRunSpeedLines, spawnScorchMark, spawnKyoOrochinagiVFX, spawnIoriYamibaraiVFX,
  spawnKyoOniyakiVFX, spawnIoriOniyakiVFX, spawnIoriAoihanaTrail, spawnKyoDokugamiTrail,
  spawnIoriYatagarasuVFX, spawnVictoryAuraSpark, spawnIoriKuzukazeVFX,
} from './vfxCharPresets.js';
