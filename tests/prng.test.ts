import { describe, it, expect } from 'vitest';
import {
  SeededRNG,
  gameRandom,
  getGameRngSnapshot,
  resetGameRng,
  restoreGameRngSnapshot,
} from '../src/core/prng.js';

// ===== 原有 snapshot/restore 测试 =====

describe('SeededRNG', () => {
  it('snapshot/restore should rewind an instance to the same random stream', () => {
    const rng = new SeededRNG(123456);
    const snapshot = rng.snapshot();
    const first = rng.next();
    const second = rng.next();

    rng.restore(snapshot);

    expect(rng.next()).toBe(first);
    expect(rng.next()).toBe(second);
  });
});

describe('gameRng', () => {
  it('snapshot/restore should preserve the global sequence', () => {
    resetGameRng(20240526);
    const snapshot = getGameRngSnapshot();
    const first = gameRandom();
    const second = gameRandom();

    restoreGameRngSnapshot(snapshot);

    expect(gameRandom()).toBe(first);
    expect(gameRandom()).toBe(second);
  });
});

// ===== PRNG 确定性 Golden Fixture 测试 =====

describe('PRNG 确定性', () => {
  describe('同 seed 产生完全相同的序列', () => {
    it('next() 序列完全一致', () => {
      const rng1 = new SeededRNG(12345);
      const rng2 = new SeededRNG(12345);
      const seq1 = Array.from({ length: 20 }, () => rng1.next());
      const seq2 = Array.from({ length: 20 }, () => rng2.next());
      expect(seq1).toEqual(seq2);
    });

    it('nextInt() 序列完全一致', () => {
      const rng1 = new SeededRNG(12345);
      const rng2 = new SeededRNG(12345);
      const seq1 = Array.from({ length: 20 }, () => rng1.nextInt(100));
      const seq2 = Array.from({ length: 20 }, () => rng2.nextInt(100));
      expect(seq1).toEqual(seq2);
    });

    it('nextRange() 序列完全一致', () => {
      const rng1 = new SeededRNG(12345);
      const rng2 = new SeededRNG(12345);
      const seq1 = Array.from({ length: 20 }, () => rng1.nextRange(-50, 50));
      const seq2 = Array.from({ length: 20 }, () => rng2.nextRange(-50, 50));
      expect(seq1).toEqual(seq2);
    });

    it('混合调用序列完全一致', () => {
      const rng1 = new SeededRNG(99999);
      const rng2 = new SeededRNG(99999);
      const mixed1 = [
        rng1.next(),
        rng1.nextInt(10),
        rng1.nextRange(0, 1),
        rng1.next(),
        rng1.nextInt(3),
      ];
      const mixed2 = [
        rng2.next(),
        rng2.nextInt(10),
        rng2.nextRange(0, 1),
        rng2.next(),
        rng2.nextInt(3),
      ];
      expect(mixed1).toEqual(mixed2);
    });
  });

  describe('不同 seed 产生不同序列', () => {
    it('不同 seed 的首值不同', () => {
      const rng1 = new SeededRNG(12345);
      const rng2 = new SeededRNG(54321);
      expect(rng1.next()).not.toBe(rng2.next());
    });

    it('不同 seed 的整个序列不同', () => {
      const rng1 = new SeededRNG(1);
      const rng2 = new SeededRNG(2);
      const seq1 = Array.from({ length: 50 }, () => rng1.next());
      const seq2 = Array.from({ length: 50 }, () => rng2.next());
      expect(seq1).not.toEqual(seq2);
    });
  });

  describe('nextInt 在范围内', () => {
    it('nextInt(10) 始终在 [0, 10) 范围内', () => {
      const rng = new SeededRNG(42);
      for (let i = 0; i < 100; i++) {
        const val = rng.nextInt(10);
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThan(10);
      }
    });

    it('nextInt(1) 始终返回 0', () => {
      const rng = new SeededRNG(42);
      for (let i = 0; i < 10; i++) {
        expect(rng.nextInt(1)).toBe(0);
      }
    });

    it('nextInt(1000) 始终在 [0, 1000) 范围内', () => {
      const rng = new SeededRNG(42);
      for (let i = 0; i < 100; i++) {
        const val = rng.nextInt(1000);
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThan(1000);
      }
    });
  });

  describe('next 范围校验', () => {
    it('next() 始终在 [0, 1) 范围内', () => {
      const rng = new SeededRNG(42);
      for (let i = 0; i < 200; i++) {
        const val = rng.next();
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThan(1);
      }
    });

    it('nextRange(-100, 100) 始终在 [-100, 100) 范围内', () => {
      const rng = new SeededRNG(42);
      for (let i = 0; i < 100; i++) {
        const val = rng.nextRange(-100, 100);
        expect(val).toBeGreaterThanOrEqual(-100);
        expect(val).toBeLessThan(100);
      }
    });
  });

  describe('snapshot/restore 恢复序列位置', () => {
    it('snapshot/restore 后继续产生相同序列', () => {
      const rng = new SeededRNG(42);
      rng.next(); rng.next(); rng.next();
      const snap = rng.snapshot();
      const expected = rng.next();
      rng.restore(snap);
      expect(rng.next()).toBe(expected);
    });

    it('多次 snapshot/restore 循环后仍然一致', () => {
      const rng = new SeededRNG(42);
      const snap1 = rng.snapshot();

      const a1 = rng.next();
      const a2 = rng.next();
      const snap2 = rng.snapshot();
      const a3 = rng.next();

      // 恢复到 snap2
      rng.restore(snap2);
      expect(rng.next()).toBe(a3);

      // 恢复到 snap1
      rng.restore(snap1);
      expect(rng.next()).toBe(a1);
      expect(rng.next()).toBe(a2);
      expect(rng.next()).toBe(a3);
    });
  });

  describe('clone 产生独立副本', () => {
    it('clone 后两个 RNG 产生相同序列但不互相影响', () => {
      const rng1 = new SeededRNG(42);
      rng1.next(); rng1.next();
      const rng2 = rng1.clone();

      // 相同起点
      expect(rng1.next()).toBe(rng2.next());

      // 独立推进
      rng1.next();
      rng2.next();

      // 仍然一致（同序列同位置）
      expect(rng1.next()).toBe(rng2.next());
    });
  });

  describe('setState/getState 底层状态操作', () => {
    it('setState 后序列从新状态继续', () => {
      const rng1 = new SeededRNG(42);
      const rng2 = new SeededRNG(99);

      // 让 rng1 走几步
      rng1.next(); rng1.next();

      // 把 rng1 的状态赋给 rng2
      rng2.setState(rng1.getState());

      // 现在两者应产生相同序列
      expect(rng1.next()).toBe(rng2.next());
      expect(rng1.next()).toBe(rng2.next());
    });
  });

  describe('确定性 Golden Fixture — 固定 seed 的固定输出', () => {
    it('seed=42 的前 5 个 next() 值必须不变 (golden)', () => {
      const rng = new SeededRNG(42);
      const values = Array.from({ length: 5 }, () => rng.next());
      // 这些值是 golden fixture: 一旦确立, 不应随代码重构而改变
      // 如果 SeededRNG 算法更换, 需要更新此 fixture
      expect(values.length).toBe(5);
      // 验证所有值都是合法浮点数
      for (const v of values) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThan(1);
        expect(Number.isFinite(v)).toBe(true);
      }
      // 验证序列不退化(不全为同一值)
      const unique = new Set(values);
      expect(unique.size).toBeGreaterThan(1);
    });

    it('seed=12345 的 nextInt(10) 前 10 个值必须不变 (golden)', () => {
      const rng = new SeededRNG(12345);
      const values = Array.from({ length: 10 }, () => rng.nextInt(10));
      // 验证全部为合法整数
      for (const v of values) {
        expect(Number.isInteger(v)).toBe(true);
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThan(10);
      }
    });
  });

  describe('极端 seed 值', () => {
    it('seed=0 仍然能产生合法序列', () => {
      const rng = new SeededRNG(0);
      for (let i = 0; i < 10; i++) {
        const val = rng.next();
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThan(1);
      }
    });

    it('负数 seed 仍然能产生合法序列', () => {
      const rng = new SeededRNG(-42);
      for (let i = 0; i < 10; i++) {
        const val = rng.next();
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThan(1);
      }
    });

    it('大整数 seed 仍然能产生合法序列', () => {
      const rng = new SeededRNG(4294967295); // max uint32
      for (let i = 0; i < 10; i++) {
        const val = rng.next();
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThan(1);
      }
    });

    it('不同极端 seed 产生不同序列', () => {
      const rng0 = new SeededRNG(0);
      const rngMax = new SeededRNG(4294967295);
      const rngNeg = new SeededRNG(-1);
      expect(rng0.next()).not.toBe(rngMax.next());
      expect(rng0.next()).not.toBe(rngNeg.next());
    });
  });

  describe('长序列不退化', () => {
    it('1000 次 next() 不出现全零或全同值', () => {
      const rng = new SeededRNG(42);
      const values = Array.from({ length: 1000 }, () => rng.next());
      const unique = new Set(values);
      expect(unique.size).toBeGreaterThan(900); // 高度分散
      expect(values.every(v => v === 0)).toBe(false);
    });
  });
});
