/**
 * AnnouncerOverlay — visual text overlay for announcer events
 *
 * Renders pop-in/fade animations for game flow events:
 *   - Pop-in: text scales from 2x to 1x in the first 15% of duration
 *   - Hold: full alpha through the middle
 *   - Fade-out: alpha ramps down in the last 20%
 *
 * Usage:
 *   overlay.trigger('counter_hit');
 *   overlay.tick();    // call each frame
 *   overlay.draw(ctx, 800, 600);
 *
 * Pure rendering — no audio coupling. Audio is handled by Announcer class.
 */

import { ANNOUNCER_EVENTS, type AnnouncerEventType, type AnnouncerEventConfig } from '../audio/announcer.js';

// ─── Animation curves ────────────────────────────────────────

function popInScale(progress: number): number {
  if (progress < 0.15) {
    return 1 + (1 - progress / 0.15) * 1.2;
  }
  return 1;
}

function fadeInHoldOutAlpha(progress: number): number {
  if (progress < 0.15) return progress / 0.15;
  if (progress > 0.8) return (1 - progress) / 0.2;
  return 1;
}

function burstInScale(progress: number): number {
  if (progress < 0.1) return 1 + (1 - progress / 0.1) * 2.0;
  return 1;
}

function earlyFadeAlpha(progress: number): number {
  if (progress < 0.15) return progress / 0.15;
  if (progress > 0.5) return (1 - progress) / 0.5;
  return 1;
}

// ─── Active overlay entry ─────────────────────────────────────

interface ActiveOverlay {
  config: AnnouncerEventConfig;
  frame: number;
  /** True for burst-style (KO, FIGHT), false for pop-in */
  burst: boolean;
}

// ─── AnnouncerOverlay class ───────────────────────────────────

export class AnnouncerOverlay {
  private queue: ActiveOverlay[] = [];
  private current: ActiveOverlay | null = null;

  /**
   * Trigger an announcer event. If another event is playing,
   * the new one is queued and plays after the current finishes.
   */
  trigger(eventType: AnnouncerEventType): void {
    const config = ANNOUNCER_EVENTS[eventType];
    if (!config) return;

    const burst = eventType === 'fight' || eventType === 'ko';
    const entry: ActiveOverlay = { config, frame: 0, burst };

    if (!this.current) {
      this.current = entry;
    } else {
      this.queue.push(entry);
    }
  }

  /** Advance animation by one frame. Call once per game tick. */
  tick(): void {
    if (!this.current) return;
    this.current.frame++;
    if (this.current.frame >= this.current.config.duration) {
      this.current = this.queue.length > 0 ? this.queue.shift()! : null;
    }
  }

  /** Whether an overlay is currently active */
  isActive(): boolean {
    return this.current !== null;
  }

  /** Get the current event type, or null */
  getCurrentEventType(): AnnouncerEventType | null {
    if (!this.current) return null;
    const entry = this.current.config;
    for (const [key, cfg] of Object.entries(ANNOUNCER_EVENTS)) {
      if (cfg === entry) return key as AnnouncerEventType;
    }
    return null;
  }

  /** Clear all overlays */
  clear(): void {
    this.current = null;
    this.queue.length = 0;
  }

  /** Draw the overlay to the canvas */
  draw(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number): void {
    if (!this.current) return;

    const { config, frame, burst } = this.current;
    const progress = frame / config.duration;
    const scale = burst ? burstInScale(progress) : popInScale(progress);
    const alpha = burst ? earlyFadeAlpha(progress) : fadeInHoldOutAlpha(progress);

    if (alpha <= 0) return;

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const fontSize = Math.round(config.fontSize * scale);
    ctx.font = `bold ${fontSize}px "Courier New", monospace`;

    // Glow
    ctx.shadowColor = config.glowColor;
    ctx.shadowBlur = 25 + (scale > 1 ? (scale - 1) * 20 : 0);

    // Stroke (dark outline)
    ctx.strokeStyle = 'rgba(0,0,0,0.8)';
    ctx.lineWidth = 3;
    ctx.strokeText(config.text, canvasWidth / 2, canvasHeight / 2);

    // Fill
    ctx.fillStyle = config.fillColor;
    ctx.fillText(config.text, canvasWidth / 2, canvasHeight / 2);

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    ctx.restore();
  }
}

/** Singleton instance */
export const announcerOverlay = new AnnouncerOverlay();
