/**
 * projectileEntity.test.ts — Projectile 实体单元测试
 *
 * 覆盖构造函数初始化、移动、碰撞盒、所有者判定、生命周期转换。
 * 15 个测试用例，纯单元测试，无 Fighter/CombatSystem 依赖。
 */
import { describe, it, expect } from 'vitest';
import { Projectile } from '../src/entities/projectile.js';
import { PROJECTILE_SPEED } from '../src/core/constants.js';

// ===== Construction =====
describe('Projectile: Construction', () => {
  it('构造函数正确初始化所有属性', () => {
    const p = new Projectile(100, 200, 1, 60, 0, 'kyo');
    expect(p.x).toBe(100);
    expect(p.y).toBe(200);
    expect(p.facing).toBe(1);
    expect(p.activeFrames).toBe(60);
    expect(p.ownerId).toBe(0);
    expect(p.charId).toBe('kyo');
    expect(p.active).toBe(true);
    expect(p.currentFrame).toBe(0);
  });

  it('速度方向与 facing 一致 (右 = 1, 左 = -1)', () => {
    const right = new Projectile(0, 0, 1, 60, 0);
    expect(right.vx).toBe(PROJECTILE_SPEED); // +8

    const left = new Projectile(0, 0, -1, 60, 0);
    expect(left.vx).toBe(-PROJECTILE_SPEED); // -8
  });

  it('activeFrames 正确设置且 currentFrame 从 0 开始', () => {
    const p = new Projectile(0, 0, 1, 30, 0);
    expect(p.activeFrames).toBe(30);
    expect(p.currentFrame).toBe(0);

    const pLong = new Projectile(0, 0, 1, 120, 1);
    expect(pLong.activeFrames).toBe(120);
  });
});

// ===== Movement =====
describe('Projectile: Movement', () => {
  it('每帧按 velocity 移动', () => {
    const p = new Projectile(100, 200, 1, 60, 0);
    p.update();
    expect(p.x).toBe(100 + PROJECTILE_SPEED);
    expect(p.currentFrame).toBe(1);

    // Second frame moves again
    p.update();
    expect(p.x).toBe(100 + 2 * PROJECTILE_SPEED);
    expect(p.currentFrame).toBe(2);
  });

  it('到达 activeFrames 后变为 inactive', () => {
    const p = new Projectile(500, 300, 1, 3, 0);
    expect(p.active).toBe(true);

    p.update(); // frame 1
    expect(p.active).toBe(true);

    p.update(); // frame 2
    expect(p.active).toBe(true);

    p.update(); // frame 3: currentFrame >= activeFrames
    expect(p.active).toBe(false);
    expect(p.currentFrame).toBe(3);
  });

  it('超出屏幕右边界时标记为 inactive', () => {
    // x > 1600 triggers deactivation
    const p = new Projectile(1595, 300, 1, 999, 0);
    // vx = +8, so after update: x = 1595+8 = 1603 > 1600
    p.update();
    expect(p.active).toBe(false);
  });

  it('超出屏幕左边界时标记为 inactive', () => {
    // x < -100 triggers deactivation
    const p = new Projectile(-95, 300, -1, 999, 0);
    // vx = -8, so after update: x = -95-8 = -103 < -100
    p.update();
    expect(p.active).toBe(false);
  });
});

// ===== Hitbox =====
describe('Projectile: Hitbox', () => {
  it('getHitbox 返回正确矩形 (30x30, 中心偏移)', () => {
    const p = new Projectile(100, 200, 1, 60, 0);
    const hitbox = p.getHitbox();
    expect(hitbox).not.toBeNull();
    expect(hitbox!.x).toBe(100 - 15);
    expect(hitbox!.y).toBe(200 - 15);
    expect(hitbox!.width).toBe(30);
    expect(hitbox!.height).toBe(30);
  });

  it('inactive 时 getHitbox 返回 null', () => {
    const p = new Projectile(100, 200, 1, 1, 0);
    p.update(); // currentFrame >= activeFrames -> inactive
    expect(p.active).toBe(false);
    expect(p.getHitbox()).toBeNull();
  });

  it('hitbox 位置跟随 projectile 位置移动', () => {
    const p = new Projectile(200, 400, 1, 60, 0);

    // Initial hitbox
    const h0 = p.getHitbox()!;
    expect(h0.x).toBe(200 - 15);

    // Move one frame
    p.update();
    const h1 = p.getHitbox()!;
    expect(h1.x).toBe(200 + PROJECTILE_SPEED - 15);

    // Move another frame
    p.update();
    const h2 = p.getHitbox()!;
    expect(h2.x).toBe(200 + 2 * PROJECTILE_SPEED - 15);
  });
});

// ===== Owner =====
describe('Projectile: Owner', () => {
  it('ownerId 正确设置 (P1=0, P2=1)', () => {
    const p1 = new Projectile(100, 200, 1, 60, 0);
    expect(p1.ownerId).toBe(0);

    const p2 = new Projectile(700, 200, -1, 60, 1);
    expect(p2.ownerId).toBe(1);
  });

  it('不同 owner 的 projectile 不会互相干扰', () => {
    const p1 = new Projectile(200, 300, 1, 60, 0, 'kyo');
    const p2 = new Projectile(600, 300, -1, 60, 1, 'iori');

    // Move both
    p1.update();
    p2.update();

    // P1 moves right, P2 moves left
    expect(p1.x).toBe(200 + PROJECTILE_SPEED);
    expect(p2.x).toBe(600 - PROJECTILE_SPEED);

    // Both still active
    expect(p1.active).toBe(true);
    expect(p2.active).toBe(true);

    // Owners are distinct
    expect(p1.ownerId).not.toBe(p2.ownerId);
    expect(p1.charId).not.toBe(p2.charId);
  });

  it('charId 默认值为 kyo', () => {
    const p = new Projectile(100, 200, 1, 60, 0);
    expect(p.charId).toBe('kyo');
  });
});

// ===== Lifecycle =====
describe('Projectile: Lifecycle', () => {
  it('active -> inactive 转换后 update 不再移动', () => {
    const p = new Projectile(500, 300, 1, 2, 0);

    p.update(); // frame 1
    expect(p.active).toBe(true);

    p.update(); // frame 2: currentFrame >= activeFrames
    expect(p.active).toBe(false);
    const xWhenDeactivated = p.x;

    // Further updates should not move
    p.update();
    expect(p.x).toBe(xWhenDeactivated);
  });

  it('inactive 后 getHitbox 持续返回 null', () => {
    const p = new Projectile(500, 300, 1, 1, 0);

    // Before deactivation
    expect(p.getHitbox()).not.toBeNull();

    p.update(); // deactivates
    expect(p.getHitbox()).toBeNull();

    // Still null after more updates
    p.update();
    expect(p.getHitbox()).toBeNull();
  });

  it('外部设置 active=false 后停止移动且 hitbox 为 null', () => {
    const p = new Projectile(500, 300, 1, 999, 0);
    expect(p.active).toBe(true);

    // Simulate hit callback setting active to false
    p.active = false;
    expect(p.getHitbox()).toBeNull();

    const xBefore = p.x;
    p.update();
    expect(p.x).toBe(xBefore); // no movement
  });
});
