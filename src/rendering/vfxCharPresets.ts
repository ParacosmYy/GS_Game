/** Character-specific & combat VFX presets — extracted from vfxPresets.ts for file size compliance. */

import type { Particle } from './vfxPresets.js';

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
  particles.push({
    x, y: coreY, vx: coreVx, vy: 0,
    life: 40, maxLife: 40, size: 39,
    color: '#ffaa22', type: 'flash',
  });
  particles.push({
    x, y: coreY, vx: coreVx, vy: 0,
    life: 35, maxLife: 35, size: 20,
    color: '#ffffff', type: 'flash',
  });

  const ringCount = 6;
  const ringRadius = 22;
  const ringSpeed = 0.35;
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
  particles.push({
    x, y: y - 20, vx: 0, vy: -6,
    life: 12, maxLife: 12, size: 35,
    color: '#ffffff', type: 'flash',
  });
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
  particles.push({
    x, y: y, vx: 0, vy: 0,
    life: 12, maxLife: 12, size: 8,
    color: '#ff6600', type: 'ring',
  });

  const dustColors = ['#9a7b5d', '#bb9a73', '#887766', '#aa9070', '#776655'];
  for (let i = 0; i < 5; i++) {
    const angle = -Math.PI * 0.15 - (i / 4) * Math.PI * 0.7;
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
      rotation: -Math.PI / 2,
    });
  }
}

/**
 * Ko Hou C version (虎咲C) — doubled intensity: larger flame, more particles.
 */
export function spawnKoHouCVFX(particles: Particle[], x: number, y: number, _charId: string): void {
  particles.push({
    x, y: y - 20, vx: 0, vy: -6,
    life: 16, maxLife: 16, size: 50,
    color: '#ffffff', type: 'flash',
  });
  particles.push({
    x, y: y - 30, vx: 0, vy: -5,
    life: 14, maxLife: 14, size: 40,
    color: '#ffcc66', type: 'flash',
  });
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

  for (let i = 0; i < 3; i++) {
    const arcOffset = (i - 1) * 12;
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
 * Kyo Red Kick (R.E.D. Kick / 紅丸脚) fire trail — arc-shaped flame burst on impact.
 */
export function spawnKyoFireKickTrail(particles: Particle[], x: number, y: number, facing: number): void {
  const flameColors = ['#ff4400', '#ff6622', '#ff8833', '#ffaa44', '#ffdd66'];
  for (let i = 0; i < 5; i++) {
    const t = i / 4;
    const arcX = x - facing * (10 + i * 14);
    const arcY = y - 25 + Math.sin(t * Math.PI) * 30;
    particles.push({
      x: arcX + (Math.random() - 0.5) * 6,
      y: arcY + (Math.random() - 0.5) * 6,
      vx: -facing * (1.5 + Math.random() * 2),
      vy: -1.5 - Math.random() * 2,
      life: 12 + Math.floor(Math.random() * 6),
      maxLife: 18,
      size: 8 + Math.random() * 8,
      color: flameColors[i],
      type: 'spark',
      gravity: 0.04,
      friction: 0.96,
    });
  }
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + Math.random() * 0.3;
    particles.push({
      x: x + Math.cos(angle) * 6,
      y: y + Math.sin(angle) * 4,
      vx: Math.cos(angle) * 3 + facing * 1.5,
      vy: Math.sin(angle) * 3 - 2,
      life: 8 + Math.floor(Math.random() * 5),
      maxLife: 13,
      size: 5 + Math.random() * 4,
      color: flameColors[i % flameColors.length],
      type: 'spark',
      gravity: 0.06,
      friction: 0.94,
    });
  }
  for (let i = 0; i < 3; i++) {
    particles.push({
      x: x + (Math.random() - 0.5) * 20,
      y: y + (Math.random() - 0.5) * 10,
      vx: (Math.random() - 0.5) * 2,
      vy: -2.5 - Math.random() * 2,
      life: 16 + Math.floor(Math.random() * 8),
      maxLife: 24,
      size: 2 + Math.random() * 2,
      color: '#ffcc44',
      type: 'spark',
      gravity: -0.03,
      friction: 0.98,
    });
  }
}

/**
 * DM Ten Ha Ou (天地霸煌拳) energy burst — massive energy explosion.
 */
export function spawnDMTenHaOuVFX(particles: Particle[], x: number, y: number, charId: string): void {
  const dmColors: Record<string, { burst: string; stars: string[] }> = {
    kyo: { burst: '#ff6600', stars: ['#ffffff', '#ffee66', '#ff4400'] },
    iori: { burst: '#8822cc', stars: ['#ffffff', '#cc66ff', '#6600aa'] },
    ryo: { burst: '#4488ff', stars: ['#ffffff', '#88ccff', '#2266dd'] },
  };
  const colors = dmColors[charId] ?? { burst: '#ffcc00', stars: ['#ffffff', '#ffee66', '#ffaa00'] };

  particles.push({
    x, y: y - 20, vx: 0, vy: 0,
    life: 20, maxLife: 20, size: 90,
    color: '#ffffff', type: 'superburst',
  });
  particles.push({
    x, y: y - 20, vx: 0, vy: 0,
    life: 30, maxLife: 30, size: 110,
    color: colors.burst, type: 'superburst',
  });
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
      color: colors.stars[i % colors.stars.length],
      type: 'star',
      gravity: 0.1,
      friction: 0.94,
      rotation: angle,
      rotSpeed: (Math.random() - 0.5) * 0.5,
    });
  }
  for (let r = 0; r < 3; r++) {
    particles.push({
      x, y: y - 20, vx: 0, vy: 0,
      life: 15 + r * 5, maxLife: 15 + r * 5, size: 6 + r * 3,
      color: r === 0 ? '#ffffff' : r === 1 ? colors.stars[1] : colors.burst,
      type: 'ring',
    });
  }
}

/**
 * Haou Shou Kou Ken (霸王翔吼拳) counter flash — bright shield-like burst on counter activation.
 */
export function spawnHaouFlash(particles: Particle[], x: number, y: number, charId: string): void {
  const elColors: Record<string, { burst: string; sparks: string[]; ring: string }> = {
    ryo: { burst: '#4488ff', sparks: ['#ffffff', '#88ccff', '#4488ff'], ring: '#4488ff' },
    kyo: { burst: '#ff8c1e', sparks: ['#ffffff', '#ffaa44', '#ff6622'], ring: '#ff8c1e' },
    iori: { burst: '#8822cc', sparks: ['#ffffff', '#bb66ff', '#6600aa'], ring: '#8822cc' },
  };
  const el = elColors[charId] ?? { burst: '#ffcc44', sparks: ['#ffffff', '#ffcc44', '#ffaa22'], ring: '#ffcc44' };

  particles.push({
    x, y: y - 20, vx: 0, vy: 0,
    life: 10, maxLife: 10, size: 50,
    color: '#ffffff', type: 'flash',
  });
  particles.push({
    x, y: y - 20, vx: 0, vy: 0,
    life: 12, maxLife: 12, size: 65,
    color: el.burst, type: 'flash',
  });
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
      color: el.sparks[i % el.sparks.length],
      type: 'spark',
      gravity: 0,
      friction: 0.92,
    });
  }
  particles.push({
    x, y: y - 20, vx: 0, vy: 0,
    life: 12, maxLife: 12, size: 10,
    color: el.ring, type: 'ring',
  });
}

/**
 * 命中招式名显示 — KOF2002风格, 命中时在命中位置上方浮动显示招式名
 */
export function spawnMoveNameText(particles: Particle[], worldX: number, worldY: number, moveName: string, color: string, fontSize: number): void {
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
 */
export function spawnTenHaOuBlast(particles: Particle[], x: number, y: number, facing: number): void {
  particles.push({
    x, y: y - 20, vx: 0, vy: 0,
    life: 16, maxLife: 16, size: 120,
    color: '#ffffff', type: 'superburst',
  });
  particles.push({
    x, y: y - 20, vx: 0, vy: 0,
    life: 25, maxLife: 25, size: 150,
    color: '#ffcc00', type: 'superburst',
  });
  for (let r = 0; r < 3; r++) {
    particles.push({
      x, y: y - 20, vx: 0, vy: 0,
      life: 18 + r * 6, maxLife: 18 + r * 6, size: 8 + r * 4,
      color: r === 0 ? '#ffffff' : r === 1 ? '#ffee44' : '#ffaa00',
      type: 'ring',
    });
  }
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
 */
export function spawnScreenCracks(particles: Particle[], x: number, y: number): void {
  const crackCount = 12;
  for (let i = 0; i < crackCount; i++) {
    const angle = (i / crackCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
    const length = 80 + Math.random() * 120;
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
  particles.push({
    x, y, vx: 0, vy: 0,
    life: 12, maxLife: 12, size: 60,
    color: '#ff1133', type: 'flash',
  });
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
 */
export function spawnFloatingComboText(particles: Particle[], worldX: number, worldY: number, combo: number, totalDamage: number): void {
  let color: string;
  if (combo >= 10) color = '#ff3333';
  else if (combo >= 5) color = '#ffcc00';
  else color = '#ffffff';

  const size = combo >= 10 ? 20 : combo >= 5 ? 17 : 14;
  const text = `${combo} HIT (${totalDamage})`;

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
 */
export function spawnRyukoRanbuSpeedLines(particles: Particle[], centerX: number, centerY: number): void {
  const lineCount = 12;
  for (let i = 0; i < lineCount; i++) {
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
 */
export function spawnRyukoRanbuFinalBurst(particles: Particle[], x: number, y: number, facing: number): void {
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
 */
export function spawnKOSuperBurst(particles: Particle[], x: number, y: number): void {
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

/** Kyo Orochinagi (大蛇薙) startup — flame pillar burst */
export function spawnKyoOrochinagiVFX(particles: Particle[], x: number, y: number, facing: number): void {
  for (let i = 0; i < 14; i++) {
    const spread = (Math.random() - 0.5) * 20;
    const heightOffset = i * 8;
    particles.push({
      x: x + spread,
      y: y - heightOffset,
      vx: facing * (1 + Math.random() * 2),
      vy: -(3 + Math.random() * 4),
      life: 18 + Math.random() * 8,
      maxLife: 26,
      size: 6 + Math.random() * 6 + i * 0.3,
      color: i < 4 ? '#ffffff' : i < 8 ? '#ffcc00' : i < 11 ? '#ff6600' : '#ff2200',
      type: 'spark',
      gravity: -0.3,
      friction: 0.94,
    });
  }
  particles.push({
    x, y: y - 30,
    vx: 0, vy: 0,
    life: 8, maxLife: 8, size: 50,
    color: '#ffaa44',
    type: 'flash',
  });
  particles.push({
    x, y: y - 30,
    vx: 0, vy: 0,
    life: 15, maxLife: 15, size: 40,
    color: '#ff4400',
    type: 'ring',
  });
}

/** Iori Yamibarai (闇払い) launch — dark energy burst */
export function spawnIoriYamibaraiVFX(particles: Particle[], x: number, y: number, facing: number): void {
  particles.push({
    x, y: y - 10,
    vx: facing * 7, vy: 0,
    life: 35, maxLife: 35, size: 28,
    color: '#7722cc',
    type: 'flash',
  });
  particles.push({
    x, y: y - 10,
    vx: facing * 7, vy: 0,
    life: 30, maxLife: 30, size: 14,
    color: '#bb66ff',
    type: 'flash',
  });
  for (let i = 0; i < 6; i++) {
    particles.push({
      x: x - facing * (6 + i * 5),
      y: y - 10 + (Math.random() - 0.5) * 12,
      vx: facing * (3 + Math.random() * 2),
      vy: (Math.random() - 0.5) * 2,
      life: 12 + Math.random() * 6,
      maxLife: 18,
      size: 4 + Math.random() * 4,
      color: i % 2 === 0 ? '#5500aa' : '#8833dd',
      type: 'spark',
      gravity: 0,
      friction: 0.92,
    });
  }
}

/** Kyo Oniyaki (鬼焼き) — rising flame uppercut column */
export function spawnKyoOniyakiVFX(particles: Particle[], x: number, y: number, facing: number, isHeavy: boolean): void {
  const count = isHeavy ? 12 : 8;
  for (let i = 0; i < count; i++) {
    const spread = (Math.random() - 0.5) * 16;
    particles.push({
      x: x + spread,
      y: y + i * 6,
      vx: facing * (0.5 + Math.random()) + (Math.random() - 0.5),
      vy: -(4 + Math.random() * 3),
      life: 14 + Math.random() * 6,
      maxLife: 20,
      size: 4 + Math.random() * 4 + (isHeavy ? 2 : 0),
      color: i < 3 ? '#ffffff' : i < 6 ? '#ffcc00' : '#ff4400',
      type: 'spark',
      gravity: -0.4,
      friction: 0.94,
    });
  }
  particles.push({
    x, y: y - 20,
    vx: 0, vy: 0,
    life: 6, maxLife: 6,
    size: isHeavy ? 35 : 25,
    color: '#ff8800',
    type: 'flash',
  });
}

/** Iori Oniyaki (鬼焼き) — rising dark energy uppercut column */
export function spawnIoriOniyakiVFX(particles: Particle[], x: number, y: number, facing: number, isHeavy: boolean): void {
  const count = isHeavy ? 12 : 8;
  for (let i = 0; i < count; i++) {
    const spread = (Math.random() - 0.5) * 16;
    particles.push({
      x: x + spread,
      y: y + i * 6,
      vx: facing * (0.5 + Math.random()) + (Math.random() - 0.5),
      vy: -(4 + Math.random() * 3),
      life: 14 + Math.random() * 6,
      maxLife: 20,
      size: 4 + Math.random() * 4 + (isHeavy ? 2 : 0),
      color: i < 3 ? '#ddccff' : i < 6 ? '#9944dd' : '#550088',
      type: 'spark',
      gravity: -0.4,
      friction: 0.94,
    });
  }
  particles.push({
    x, y: y - 20,
    vx: 0, vy: 0,
    life: 6, maxLife: 6,
    size: isHeavy ? 35 : 25,
    color: '#8822cc',
    type: 'flash',
  });
}

/** Iori Aoihana rekka hit trail — dark energy slash wisps trailing the claw strike */
export function spawnIoriAoihanaTrail(particles: Particle[], x: number, y: number, facing: number, hitIndex: number): void {
  const count = 4 + hitIndex * 3;
  for (let i = 0; i < count; i++) {
    const angle = facing > 0
      ? (-Math.PI * 0.3 + Math.random() * Math.PI * 0.6)
      : (Math.PI - Math.PI * 0.3 + Math.random() * Math.PI * 0.6);
    const speed = 1.5 + Math.random() * 2 + hitIndex * 0.5;
    particles.push({
      x: x + (Math.random() - 0.5) * 12,
      y: y + (Math.random() - 0.5) * 16,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1,
      life: 10 + Math.floor(Math.random() * 8) + hitIndex * 3,
      maxLife: 18 + hitIndex * 4,
      size: 2 + Math.random() * 3 + hitIndex,
      color: i < count / 3 ? '#cc88ff' : i < count * 2 / 3 ? '#8833cc' : '#440066',
      type: 'spark',
      gravity: -0.2,
      friction: 0.96,
    });
  }
}

/** Kyo Dokugami rekka hit trail — fire slash wisps trailing the flame punch */
export function spawnKyoDokugamiTrail(particles: Particle[], x: number, y: number, facing: number, hitIndex: number): void {
  const count = 5 + hitIndex * 3;
  for (let i = 0; i < count; i++) {
    const angle = facing > 0
      ? (-Math.PI * 0.4 + Math.random() * Math.PI * 0.8)
      : (Math.PI - Math.PI * 0.4 + Math.random() * Math.PI * 0.8);
    const speed = 2 + Math.random() * 2.5 + hitIndex * 0.5;
    particles.push({
      x: x + (Math.random() - 0.5) * 14,
      y: y + (Math.random() - 0.5) * 14,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 0.5,
      life: 10 + Math.floor(Math.random() * 8) + hitIndex * 3,
      maxLife: 18 + hitIndex * 4,
      size: 2 + Math.random() * 3 + hitIndex,
      color: i < count / 3 ? '#ffee88' : i < count * 2 / 3 ? '#ff8822' : '#cc4400',
      type: 'spark',
      gravity: -0.15,
      friction: 0.95,
    });
  }
}

/** Iori Yatagarasu (八咫烏) DM startup — dark energy spiral vortex */
export function spawnIoriYatagarasuVFX(particles: Particle[], x: number, y: number, facing: number): void {
  for (let i = 0; i < 16; i++) {
    const spiralAngle = (i / 16) * Math.PI * 4 + i * 0.4;
    const spiralRadius = 4 + i * 1.5;
    const heightOffset = i * 6;
    particles.push({
      x: x + Math.cos(spiralAngle) * spiralRadius,
      y: y - heightOffset,
      vx: Math.cos(spiralAngle) * 1.5 + facing * 0.5,
      vy: -(3 + Math.random() * 3),
      life: 16 + Math.random() * 8,
      maxLife: 24,
      size: 4 + Math.random() * 5,
      color: i < 4 ? '#ffffff' : i < 8 ? '#cc66ff' : i < 12 ? '#7722cc' : '#330066',
      type: 'spark',
      gravity: -0.35,
      friction: 0.93,
      rotation: spiralAngle,
      rotSpeed: 0.15,
    });
  }
  particles.push({
    x, y: y - 25,
    vx: 0, vy: 0,
    life: 10, maxLife: 10, size: 45,
    color: '#5500aa',
    type: 'flash',
  });
  particles.push({
    x, y: y - 25,
    vx: 0, vy: 0,
    life: 6, maxLife: 6, size: 20,
    color: '#ddbbff',
    type: 'flash',
  });
  particles.push({
    x, y: y - 30,
    vx: 0, vy: 0,
    life: 14, maxLife: 14, size: 35,
    color: '#6600aa',
    type: 'ring',
  });
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
    const speed = 2 + Math.random() * 3;
    particles.push({
      x: x + Math.cos(angle) * 10,
      y: y - 20 + Math.sin(angle) * 10,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      life: 14 + Math.floor(Math.random() * 6),
      maxLife: 20,
      size: 3 + Math.random() * 3,
      color: i % 2 === 0 ? '#8833dd' : '#440088',
      type: 'spark',
      gravity: -0.2,
      friction: 0.94,
    });
  }
}

/** Victory aura sparkle — character-element-coded rising energy around the winner. */
export function spawnVictoryAuraSpark(particles: Particle[], x: number, y: number, charColor: string): void {
  const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.6;
  const speed = 1.5 + Math.random() * 2;
  particles.push({
    x: x + (Math.random() - 0.5) * 30,
    y: y - Math.random() * 20,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - 1,
    life: 20 + Math.floor(Math.random() * 10),
    maxLife: 30,
    size: 2 + Math.random() * 3,
    color: Math.random() < 0.3 ? '#ffffff' : charColor,
    type: Math.random() < 0.2 ? 'star' : 'spark',
    gravity: -0.15,
    friction: 0.96,
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.2,
  });
  if (Math.random() < 0.15) {
    particles.push({
      x: x + (Math.random() - 0.5) * 40,
      y: y - 10 - Math.random() * 30,
      vx: 0, vy: -0.5,
      life: 6, maxLife: 6, size: 12 + Math.random() * 8,
      color: charColor, type: 'flash',
    });
  }
}

/**
 * Iori Kuzukaze (屑風) dark vortex — command grab dark energy twist.
 */
export function spawnIoriKuzukazeVFX(particles: Particle[], x: number, y: number, facing: number): void {
  const purpleCore = '#6600aa';
  const darkOuter = '#330066';
  const clawWhite = '#cc88ff';
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const radius = 15 + i * 4;
    particles.push({
      x: x + Math.cos(angle) * radius,
      y: y + Math.sin(angle) * radius * 0.6 - 10,
      vx: Math.cos(angle + Math.PI) * 2.5,
      vy: Math.sin(angle + Math.PI) * 1.5,
      life: 14 + Math.floor(Math.random() * 6),
      maxLife: 20,
      size: 6 + Math.random() * 4,
      color: i % 2 === 0 ? purpleCore : darkOuter,
      type: 'spark',
      gravity: -0.05,
      friction: 0.93,
    });
  }
  const clawAngles = [-0.4, 0.4, -1.2, 1.2];
  for (let i = 0; i < 4; i++) {
    const angle = clawAngles[i] + (facing > 0 ? 0 : Math.PI);
    particles.push({
      x: x + Math.cos(angle) * 10,
      y: y - 15 + Math.sin(angle) * 8,
      vx: Math.cos(angle) * 5,
      vy: Math.sin(angle) * 3,
      life: 10 + Math.floor(Math.random() * 4),
      maxLife: 14,
      size: 20 + Math.random() * 10,
      color: clawWhite,
      type: 'slash',
      rotation: angle,
    });
  }
  for (let i = 0; i < 4; i++) {
    particles.push({
      x: x + (Math.random() - 0.5) * 20,
      y: y - 5 + (Math.random() - 0.5) * 20,
      vx: (Math.random() - 0.5) * 3,
      vy: -1.5 - Math.random() * 2,
      life: 18 + Math.floor(Math.random() * 8),
      maxLife: 26,
      size: 3 + Math.random() * 3,
      color: '#440088',
      type: 'spark',
      gravity: -0.03,
      friction: 0.97,
    });
  }
}
