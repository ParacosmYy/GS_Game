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
  type: 'spark' | 'flash' | 'ring' | 'text' | 'star' | 'slash' | 'superburst' | 'groundslam';
  text?: string;
  gravity?: number;
  friction?: number;
  rotation?: number;
  rotSpeed?: number;
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

export function spawnBlockFlash(particles: Particle[], worldX: number, worldY: number, scale: number = 1.0): void {
  particles.push({
    x: worldX, y: worldY, vx: 0, vy: 0,
    life: 8, maxLife: 8, size: 40 * scale,
    color: '#aaccff', type: 'flash',
  });
}

/** 角色专属命中火花 — KOF风格, 更大更亮. starRatio: DM 0.7, 必杀 0.5, 重攻击 0.35, 轻攻击 0.25 */
export function spawnCharacterHitSparks(particles: Particle[], worldX: number, worldY: number, count: number, charColor: string, sizeScale: number = 1.0, speedScale: number = 1.0, starRatio: number = 0.25, lowGravity: boolean = false): void {
  particles.push({
    x: worldX, y: worldY, vx: 0, vy: 0,
    life: 6, maxLife: 6, size: 25 * sizeScale,
    color: charColor, type: sizeScale >= 1.5 ? 'superburst' : 'flash',
  });
  const grav = lowGravity ? 0.04 : 0.12;
  // KOF2002: 火花方向偏置 — 向上扩散为主(前半球偏重), 更自然
  for (let i = 0; i < count; i++) {
    const angle = -Math.PI * 0.8 + Math.random() * Math.PI * 1.6;
    const speed = (3 + Math.random() * 7) * sizeScale * speedScale;
    const isStar = Math.random() < starRatio;
    particles.push({
      x: worldX, y: worldY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 3 * sizeScale,
      life: Math.floor((14 + Math.random() * 10) * sizeScale),
      maxLife: Math.floor(24 * sizeScale),
      size: (isStar ? 4 + Math.random() * 5 : 2 + Math.random() * 3) * sizeScale,
      color: Math.random() > 0.35 ? charColor : '#ffffff',
      type: isStar ? 'star' : 'spark',
      gravity: grav,
      friction: 0.94,
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
    life: 6, maxLife: 6, size: 35,
    color: '#ffffff', type: 'flash',
  });
  for (let i = 0; i < 16; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 3 + Math.random() * 6;
    particles.push({
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

export function spawnGuardCrushText(particles: Particle[], worldX: number, worldY: number): void {
  // KOF2002: 防御崩坏文字 — 更大更醒目, 白红交替色
  particles.push({
    x: worldX, y: worldY, vx: 0, vy: -0.8,
    life: 55, maxLife: 55, size: 24,
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
    const speed = 2 + Math.random() * 4;
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

export function spawnImpactRing(particles: Particle[], worldX: number, worldY: number, scale: number = 1.0): void {
  particles.push({
    x: worldX, y: worldY, vx: 0, vy: 0,
    life: 14, maxLife: 14, size: 8 * scale,
    color: '#ffffff', type: 'ring',
  });
  particles.push({
    x: worldX, y: worldY, vx: 0, vy: 0,
    life: 10, maxLife: 10, size: 5 * scale,
    color: '#ffcc44', type: 'ring',
  });
}

/** 打击斩击线 — 重攻击命中时的横向闪光. scale: 重1.0, 必杀1.4, DM2.0 */
export function spawnSlashLine(particles: Particle[], worldX: number, worldY: number, _facing: number, color: string, scale: number = 1.0): void {
  particles.push({
    x: worldX, y: worldY, vx: 0, vy: 0,
    life: 8, maxLife: 8, size: (30 + Math.random() * 20) * scale,
    color, type: 'slash',
    rotation: (Math.random() - 0.5) * 0.6,
  });
  particles.push({
    x: worldX, y: worldY, vx: 0, vy: 0,
    life: 8, maxLife: 8, size: (20 + Math.random() * 15) * scale,
    color: '#ffffff', type: 'slash',
    rotation: (Math.random() - 0.5) * 0.6 - 0.3,
  });
}

/** DM/超必杀激活时的华丽爆发 */
export function spawnSuperBurst(particles: Particle[], worldX: number, worldY: number, color: string, glow: string, isSDM: boolean = false): void {
  const burstCount = isSDM ? 36 : 24;
  const burstSize = isSDM ? 120 : 100;
  particles.push({
    x: worldX, y: worldY, vx: 0, vy: 0,
    life: isSDM ? 25 : 20, maxLife: isSDM ? 25 : 20, size: isSDM ? 100 : 80,
    color: '#ffffff', type: 'superburst',
  });
  particles.push({
    x: worldX, y: worldY, vx: 0, vy: 0,
    life: isSDM ? 30 : 25, maxLife: isSDM ? 30 : 25, size: burstSize,
    color, type: 'superburst',
  });
  for (let i = 0; i < burstCount; i++) {
    const angle = (i / burstCount) * Math.PI * 2 + Math.random() * 0.2;
    const speed = 4 + Math.random() * (isSDM ? 10 : 8);
    particles.push({
      x: worldX, y: worldY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      life: 18 + Math.floor(Math.random() * (isSDM ? 16 : 12)),
      maxLife: isSDM ? 35 : 30,
      size: 3 + Math.random() * (isSDM ? 7 : 5),
      color: i % 4 === 0 ? '#ffffff' : i % 2 === 0 ? glow : color,
      type: 'star', gravity: 0.12, friction: 0.94,
      rotation: angle, rotSpeed: (Math.random() - 0.5) * 0.5,
    });
  }
  // KOF2002: 冲击波差分扩展 — 内环快外环慢, 层次感更强
  const ringSpeeds = isSDM ? [7, 5, 3.5] : [6, 4];
  for (let r = 0; r < (isSDM ? 3 : 2); r++) {
    particles.push({
      x: worldX, y: worldY, vx: 0, vy: 0,
      life: 15 + r * 5, maxLife: 15 + r * 5, size: 4 + r * 2,
      color: r === 0 ? '#ffffff' : glow, type: 'ring',
    });
  }
}

/** KO落地时的震撼效果 */
export function spawnGroundSlam(particles: Particle[], worldX: number, worldY: number): void {
  particles.push({
    x: worldX, y: worldY, vx: 0, vy: 0,
    life: 30, maxLife: 30, size: 120,
    color: '#ff2200', type: 'groundslam',
  });
  for (let i = 0; i < 20; i++) {
    const angle = -Math.PI + Math.random() * Math.PI;
    const speed = 2 + Math.random() * 5;
    particles.push({
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
  for (let i = 0; i < 12; i++) {
    const angle = -Math.PI * 0.2 - Math.random() * Math.PI * 0.6;
    const speed = 3 + Math.random() * 6;
    particles.push({
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

export function spawnDamageText(particles: Particle[], worldX: number, worldY: number, value: number, overrideColor?: string): void {
  const isCombo = value > 0 && value <= 50;
  const dmgSize = isCombo ? 18 + Math.min(value, 10) : value >= 120 ? 24 : value >= 80 ? 22 : value >= 50 ? 18 : 14;
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
  const driftX = isCombo ? 1.2 : -0.8;
  particles.push({
    x: worldX, y: worldY, vx: driftX + (Math.random() - 0.5) * 0.3, vy: -1.5,
    life: 50, maxLife: 50,
    size: dmgSize,
    color,
    type: 'text',
    text: isCombo ? `${value} HITS!` : `-${value}`,
  });
}

export function spawnCounterText(particles: Particle[], worldX: number, worldY: number): void {
  particles.push({
    x: worldX, y: worldY, vx: 0, vy: -2,
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
  for (let i = 0; i < 4; i++) {
    const angle = Math.PI / 2 * i + Math.random() * 0.5;
    particles.push({
      x: worldX, y: worldY,
      vx: Math.cos(angle) * 1.5, vy: Math.sin(angle) * 1.5,
      life: 8, maxLife: 8, size: 2,
      color: '#ffffff', type: 'spark', gravity: 0, friction: 0.9,
    });
  }
}

export function spawnDust(particles: Particle[], worldX: number, worldY: number): void {
  // KOF2002: 尘土更飘散 — 10个粒子, 更宽分布
  for (let i = 0; i < 10; i++) {
    const dir = (i - 5) * 1.5;
    particles.push({
      x: worldX + dir * 2, y: worldY - 2,
      vx: dir * 0.9, vy: -Math.random() * 1.8 - 0.3,
      life: 15 + Math.floor(Math.random() * 8),
      maxLife: 23,
      size: 3 + Math.random() * 5,
      color: i % 3 === 0 ? '#aaaabb' : '#888899', type: 'spark', gravity: 0.04, friction: 0.94,
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
    const speed = 3 + Math.random() * 7;
    particles.push({
      x: worldX, y: worldY,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 2,
      life: 15 + Math.floor(Math.random() * 10), maxLife: 25,
      size: 3 + Math.random() * 5, color: i % 3 === 0 ? '#ff6622' : '#ffdd44',
      type: 'star', gravity: 0.15, friction: 0.95,
      rotation: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.5,
    });
  }
  // 壁弹冲击环
  particles.push({
    x: worldX, y: worldY, vx: 0, vy: 0,
    life: 15, maxLife: 15, size: 40,
    color: '#ffaa22', type: 'ring',
  });
}

/** MAX模式激活光环 */
export function spawnMAXAura(particles: Particle[], worldX: number, worldY: number): void {
  for (let r = 0; r < 3; r++) {
    particles.push({
      x: worldX, y: worldY - 30, vx: 0, vy: 0,
      life: 18 + r * 6, maxLife: 18 + r * 6, size: 8 + r * 5,
      color: r === 0 ? '#ffffff' : r === 1 ? '#44ff88' : '#22cc55', type: 'ring',
    });
  }
  for (let i = 0; i < 16; i++) {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.2;
    const speed = 3 + Math.random() * 5;
    particles.push({
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

/** MAX mode activation flash — dramatic screen-wide energy burst */
export function spawnMAXActivationFlash(particles: Particle[], worldX: number, worldY: number): void {
  // KOF2002: MAX激活初始白色核心爆发
  particles.push({
    x: worldX, y: worldY, vx: 0, vy: 0,
    life: 8, maxLife: 8, size: 50,
    color: '#ffffff', type: 'flash',
  });
  for (let r = 0; r < 5; r++) {
    particles.push({
      x: worldX, y: worldY, vx: 0, vy: 0,
      life: 20 + r * 4, maxLife: 20 + r * 4, size: 12 + r * 8,
      color: r < 2 ? '#ffffff' : r < 4 ? '#44ff88' : '#22cc55', type: 'ring',
    });
  }
  for (let i = 0; i < 24; i++) {
    const angle = (Math.PI * 2 * i) / 24;
    const speed = 4 + Math.random() * 6;
    particles.push({
      x: worldX, y: worldY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 18 + Math.floor(Math.random() * 8),
      maxLife: 26, size: 3 + Math.random() * 3,
      color: i % 2 === 0 ? '#aaffcc' : '#44ff88',
      type: 'star', gravity: 0, friction: 0.92,
      rotation: angle, rotSpeed: 0,
    });
  }
}

/** Perfect闪光 — 金色粒子+双层辉光环 */
export function spawnPerfectFlash(particles: Particle[], worldX: number, worldY: number): void {
  for (let i = 0; i < 20; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 3 + Math.random() * 7;
    particles.push({
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
  particles.push({
    x: worldX, y: worldY, vx: 0, vy: 0,
    life: 25, maxLife: 25, size: 15,
    color: '#ffcc00', type: 'ring',
  });
  // KOF2002: Perfect额外外层白色辉光环
  particles.push({
    x: worldX, y: worldY, vx: 0, vy: 0,
    life: 30, maxLife: 30, size: 10,
    color: '#ffffff', type: 'ring',
  });
}

export function spawnProjectileExplosion(particles: Particle[], worldX: number, worldY: number, charColor: string, charGlow: string): void {
  particles.push({
    x: worldX, y: worldY, vx: 0, vy: 0,
    life: 12, maxLife: 12, size: 50,
    color: charGlow, type: 'flash',
  });
  for (let i = 0; i < 14; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 3 + Math.random() * 6;
    particles.push({
      x: worldX, y: worldY,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 2,
      life: 12 + Math.floor(Math.random() * 8), maxLife: 20,
      size: 3 + Math.random() * 4,
      color: i % 3 === 0 ? '#ffffff' : charColor,
      type: 'star', gravity: 0.2, friction: 0.94,
      rotation: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.4,
    });
  }
  // KOF2002: 飞行道具爆炸二次扩散冲击环
  particles.push({
    x: worldX, y: worldY, vx: 0, vy: 0,
    life: 12, maxLife: 12, size: 8,
    color: charColor, type: 'ring',
  });
  particles.push({
    x: worldX, y: worldY, vx: 0, vy: 0,
    life: 18, maxLife: 18, size: 4,
    color: '#ffffff', type: 'ring',
  });
}
