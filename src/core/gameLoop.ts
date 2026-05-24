import { TICK_RATE, MAX_FRAME_DELTA } from './constants.js';

type UpdateFn = () => void;
type RenderFn = () => void;

export class GameLoop {
  private lastTime = 0;
  private accumulator = 0;
  private running = false;
  private rafId = 0;

  private updateFn: UpdateFn;
  private renderFn: RenderFn;

  constructor(updateFn: UpdateFn, renderFn: RenderFn) {
    this.updateFn = updateFn;
    this.renderFn = renderFn;
  }

  start(): void {
    this.running = true;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.loop(this.lastTime);
  }

  stop(): void {
    this.running = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
  }

  private loop = (currentTime: number): void => {
    if (!this.running) return;

    const delta = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.accumulator += Math.min(delta, MAX_FRAME_DELTA);

    while (this.accumulator >= TICK_RATE) {
      this.updateFn();
      this.accumulator -= TICK_RATE;
    }

    this.renderFn();

    this.rafId = requestAnimationFrame(this.loop);
  };
}
