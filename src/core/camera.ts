/**
 * Camera — KOF2002 camera system
 *
 * Follows the midpoint between two fighters, clamps to stage bounds,
 * applies smooth interpolation and zoom effects.
 * Screen shake is applied as an offset layer (shakeX/shakeY).
 *
 * 归属: core/ — 纯逻辑，无 Canvas 依赖
 */
import { CANVAS_WIDTH, CANVAS_HEIGHT, STAGE_WIDTH } from './constants.js';

const ZOOM_MIN = 0.90;
const ZOOM_MAX = 1.15;
const ZOOM_KO = 1.30;
const ZOOM_KO_DURATION = 60;
const ZOOM_SUPER_FLASH = 1.08;
const ZOOM_LERP = 0.08;
const DISTANCE_MIN = 80;
const DISTANCE_MAX = CANVAS_WIDTH;
const CAMERA_LERP = 0.10;

export class Camera {
  x = 0;
  y = 0;
  zoom = 1.0;
  shakeX = 0;
  shakeY = 0;

  private targetX = 0;
  private targetY = 0;
  private targetZoom = 1.0;

  // KO zoom state
  private koZoomActive = false;
  private koZoomTimer = 0;
  private koTargetX = 0;
  private koTargetY = 0;

  // Super flash zoom state
  private superFlashZoomActive = false;
  private superFlashZoomTimer = 0;

  // Screen shake state
  private shakeIntensity = 0;
  private shakeDuration = 0;
  private shakeMaxDuration = 1;
  private shakeBiasX = 0;

  /** Main update: center camera between two x positions, clamped to stage */
  update(p1x: number, p2x: number, stageLeft: number = 0, stageRight: number = STAGE_WIDTH): void {
    if (this.koZoomActive) {
      this.updateKOZoom();
      this.updateShake();
      return;
    }

    const midX = (p1x + p2x) / 2;

    // Clamp so camera doesn't show beyond stage edges
    const halfView = CANVAS_WIDTH / (2 * this.zoom);
    const minX = stageLeft + halfView;
    const maxX = stageRight - halfView;
    // If stage is smaller than view, just center it
    if (minX > maxX) {
      this.targetX = (stageLeft + stageRight) / 2 - CANVAS_WIDTH / 2;
    } else {
      this.targetX = Math.max(stageLeft, Math.min(midX - CANVAS_WIDTH / (2 * this.zoom), stageRight - CANVAS_WIDTH));
    }

    // Distance-based zoom (close = zoom in, far = zoom out)
    const dist = Math.abs(p1x - p2x);
    const t = Math.max(0, Math.min(1, (dist - DISTANCE_MIN) / (DISTANCE_MAX - DISTANCE_MIN)));

    // Only apply distance zoom if super flash zoom isn't active
    if (!this.superFlashZoomActive) {
      this.targetZoom = ZOOM_MAX - t * (ZOOM_MAX - ZOOM_MIN);
    }

    this.lerp();
    this.updateShake();
  }

  /** Legacy update accepting Fighter objects — delegates to update() */
  updateFromFighters(targetA: { x: number }, targetB: { x: number }): void {
    this.update(targetA.x, targetB.x);
  }

  private lerp(): void {
    const diffX = this.targetX - this.x;
    if (Math.abs(diffX) < 0.5) this.x = this.targetX;
    else this.x += diffX * CAMERA_LERP;

    const diffZoom = this.targetZoom - this.zoom;
    if (Math.abs(diffZoom) < 0.002) this.zoom = this.targetZoom;
    else this.zoom += diffZoom * ZOOM_LERP;
  }

  // ===== Zoom Effects =====

  /** Trigger dramatic KO zoom on a world position */
  triggerKOZoom(worldX: number, worldY: number): void {
    this.koZoomActive = true;
    this.koZoomTimer = ZOOM_KO_DURATION;
    this.koTargetX = worldX - CANVAS_WIDTH / 2;
    this.koTargetY = worldY - CANVAS_HEIGHT / 2;
    this.targetZoom = ZOOM_KO;
  }

  /** Trigger slight zoom for super flash */
  triggerSuperFlashZoom(duration: number = 8): void {
    this.superFlashZoomActive = true;
    this.superFlashZoomTimer = duration;
    this.targetZoom = ZOOM_SUPER_FLASH;
  }

  /** Trigger brief zoom pulse on first hit — KOF2002 first impact emphasis */
  triggerFirstHitZoom(): void {
    this.targetZoom = 1.06;
    // Quick snap back via super flash zoom mechanism (12 frames)
    this.superFlashZoomActive = true;
    this.superFlashZoomTimer = 12;
  }

  private updateKOZoom(): void {
    this.koZoomTimer--;
    if (this.koZoomTimer <= 0) {
      this.koZoomActive = false;
      this.targetZoom = 1.0;
    }
    this.targetX = this.koTargetX;
    this.lerp();
  }

  private updateSuperFlashZoom(): void {
    if (!this.superFlashZoomActive) return;
    this.superFlashZoomTimer--;
    if (this.superFlashZoomTimer <= 0) {
      this.superFlashZoomActive = false;
      this.targetZoom = 1.0;
    }
  }

  // ===== Screen Shake =====

  /** Trigger screen shake with decay.
   *  Only triggers if new intensity >= current intensity. */
  triggerShake(intensity: number, duration: number, biasX: number = 0): void {
    if (intensity >= this.shakeIntensity) {
      this.shakeIntensity = intensity;
      this.shakeDuration = duration;
      this.shakeMaxDuration = duration;
      this.shakeBiasX = biasX;
    }
  }

  private updateShake(): void {
    this.updateSuperFlashZoom();

    if (this.shakeDuration > 0) {
      this.shakeDuration--;
      const elapsed = this.shakeMaxDuration - this.shakeDuration - 1;
      // Decay: amplitude proportional to remaining duration
      const decay = this.shakeDuration / this.shakeMaxDuration;

      if (elapsed < 3) {
        // Phase 1: deterministic displacement along bias direction
        const t = elapsed / 3;
        this.shakeX = this.shakeBiasX * this.shakeIntensity * (1 - t * 0.3) * decay;
        this.shakeY = this.shakeIntensity * 0.5 * (1 - t) * decay;
      } else {
        // Phase 2: damped spring rebound
        const remaining = this.shakeMaxDuration - 3;
        if (remaining > 0) {
          const phase = elapsed - 3;
          const springT = phase / remaining;
          const springDecay = 1 - springT;
          this.shakeX = this.shakeBiasX * 0.5 * this.shakeIntensity * springDecay * Math.sin(phase * 0.8);
          this.shakeY = this.shakeIntensity * 0.3 * springDecay * Math.cos(phase * 1.2);
        }
      }
    } else {
      this.shakeIntensity = 0;
      this.shakeX = 0;
      this.shakeY = 0;
    }
  }

  // ===== Coordinate Transform =====

  /** Get the transform to apply to the canvas context */
  getTransform(): { offsetX: number; offsetY: number; scale: number } {
    return {
      offsetX: -(this.x * this.zoom) + this.shakeX,
      offsetY: this.shakeY,
      scale: this.zoom,
    };
  }

  /** Convert world X to screen X */
  worldToScreen(worldX: number): number {
    return (worldX - this.x) * this.zoom;
  }

  /** Convert screen X to world X */
  screenToWorld(screenX: number): number {
    return screenX / this.zoom + this.x;
  }

  /** Check if KO zoom is active */
  isKOZoom(): boolean {
    return this.koZoomActive;
  }

  /** Reset camera to default state */
  reset(): void {
    this.x = 0;
    this.y = 0;
    this.zoom = 1.0;
    this.shakeX = 0;
    this.shakeY = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.targetZoom = 1.0;
    this.koZoomActive = false;
    this.koZoomTimer = 0;
    this.superFlashZoomActive = false;
    this.superFlashZoomTimer = 0;
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    this.shakeMaxDuration = 1;
    this.shakeBiasX = 0;
  }
}
