/**
 * Seeded PRNG — xorshift32 衍生
 * 同一 seed 产生同一序列。逻辑层(AI/战斗)必须用 gameRng。
 */

export interface RNGSnapshot {
  state: number;
}

export class SeededRNG {
  private state: number;

  constructor(seed: number) {
    this.state = SeededRNG.normalizeState(seed);
    // 预热
    for (let i = 0; i < 16; i++) this.raw();
  }

  private static normalizeState(seed: number): number {
    // 统一收敛到无符号 32 位，避免不同调用点传入负数/浮点时出现歧义。
    let state = (seed ^ 0xDEECE66D) >>> 0;
    if (state === 0) state = 1;
    return state;
  }

  private raw(): number {
    let x = this.state;
    x ^= x << 13;
    x ^= x >> 17;
    x ^= x << 5;
    this.state = x >>> 0;
    return this.state;
  }

  /** [0, 1) */
  next(): number {
    return this.raw() / 4294967296;
  }

  /** [0, max) 整数 */
  nextInt(max: number): number {
    return Math.floor(this.next() * max);
  }

  /** [min, max) */
  nextRange(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  getState(): number { return this.state; }
  setState(s: number): void { this.state = s >>> 0; }

  snapshot(): RNGSnapshot {
    return { state: this.state };
  }

  restore(snapshot: RNGSnapshot): void {
    this.setState(snapshot.state);
  }

  clone(): SeededRNG {
    const clone = new SeededRNG(this.state);
    clone.setState(this.state);
    return clone;
  }
}

// 全局游戏逻辑 RNG — 每局开始时 reset seed
let gameRng = new SeededRNG(12345);

export function getGameRng(): SeededRNG { return gameRng; }
export function resetGameRng(seed: number): void { gameRng = new SeededRNG(seed); }
export function getGameRngState(): number { return gameRng.getState(); }
export function setGameRngState(state: number): void { gameRng.setState(state); }
export function getGameRngSnapshot(): RNGSnapshot { return gameRng.snapshot(); }
export function restoreGameRngSnapshot(snapshot: RNGSnapshot): void { gameRng.restore(snapshot); }
export function gameRandom(): number { return gameRng.next(); }
export function gameRandomInt(max: number): number { return gameRng.nextInt(max); }
export function gameRandomRange(min: number, max: number): number { return gameRng.nextRange(min, max); }
