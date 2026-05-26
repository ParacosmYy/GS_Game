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
    life: 8, maxLife: 8, size: 30 * scale,
    color: '#aaccff', type: 'flash',
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

export function spawnImpactRing(particles: Particle[], worldX: number, worldY: number, scale: number = 1.0): void {
  particles.push({
    x: worldX, y: worldY, vx: 0, vy: 0,
    life: 12, maxLife: 12, size: 6 * scale,
    color: '#ffffff', type: 'ring',
  });
  particles.push({
    x: worldX, y: worldY, vx: 0, vy: 0,
    life: 8, maxLife: 8, size: 4 * scale,
    color: '#ffcc44', type: 'ring',
  });
}

/** 打击斩击线 — 重攻击命中时的横向闪光. scale: 重1.0, 必杀1.4, DM2.0 */
export function spawnSlashLine(particles: Particle[], worldX: number, worldY: number, _facing: number, color: string, scale: number = 1.0): void {
  const baseRotation = _facing !== 0 ? _facing * 0.55 : 0;
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
 * Orb is 30x30 effective size, 8 trailing particles fading from orange to transparent.
 * Trailing particles move forward at 8px/frame equivalent, duration 40 frames.
 */
export function spawnKooukenVFX(particles: Particle[], x: number, y: number, facing: number, _charId: string): void {
  // Core ki blast orb — orange/yellow flash
  particles.push({
    x, y: y - 10, vx: facing * 8, vy: 0,
    life: 40, maxLife: 40, size: 30,
    color: '#ffaa22', type: 'flash',
  });
  // White-hot center
  particles.push({
    x, y: y - 10, vx: facing * 8, vy: 0,
    life: 35, maxLife: 35, size: 15,
    color: '#ffffff', type: 'flash',
  });
  // 8 trailing particles — fading orange to transparent
  for (let i = 0; i < 8; i++) {
    const delay = i * 3;
    particles.push({
      x: x - facing * (8 + i * 6),
      y: y - 10 + (Math.random() - 0.5) * 10,
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
}

/**
 * Hien (飛燕) flying kick trail — speed lines behind the character during flight.
 * 6 horizontal lines with alpha fade. Color based on character accent color.
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
