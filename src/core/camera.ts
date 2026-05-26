import { Fighter } from '../entities/fighter.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT, STAGE_WIDTH } from './constants.js';

const ZOOM_MIN = 0.90;
const ZOOM_MAX = 1.15;
const ZOOM_KO = 1.30;
const ZOOM_KO_DURATION = 60;
const ZOOM_LERP = 0.08;
const DISTANCE_MIN = 80;
const DISTANCE_MAX = CANVAS_WIDTH;

export class Camera {
  x = 0;
  y = 0;
  zoom = 1.0;
  private targetX = 0;
  private targetY = 0;
  private targetZoom = 1.0;

  // KO zoom state
  private koZoomActive = false;
  private koZoomTimer = 0;
  private koTargetX = 0;
  private koTargetY = 0;

  update(targetA: Fighter, targetB: Fighter): void {
    if (this.koZoomActive) {
      this.updateKOZoom();
      return;
    }

    const midX = (targetA.x + targetB.x) / 2;
    this.targetX = Math.max(0, Math.min(midX - CANVAS_WIDTH / 2, STAGE_WIDTH - CANVAS_WIDTH));

    // Zoom based on distance
    const dist = Math.abs(targetA.x - targetB.x);
    const t = Math.max(0, Math.min(1, (dist - DISTANCE_MIN) / (DISTANCE_MAX - DISTANCE_MIN)));
    // Close = zoom in (1.15), far = zoom out (0.90)
    this.targetZoom = ZOOM_MAX - t * (ZOOM_MAX - ZOOM_MIN);

    this.lerp();
  }

  private lerp(): void {
    const diffX = this.targetX - this.x;
    if (Math.abs(diffX) < 0.5) this.x = this.targetX;
    else this.x += diffX * 0.15;

    const diffZoom = this.targetZoom - this.zoom;
    if (Math.abs(diffZoom) < 0.002) this.zoom = this.targetZoom;
    else this.zoom += diffZoom * ZOOM_LERP;
  }

  triggerKOZoom(worldX: number, worldY: number): void {
    this.koZoomActive = true;
    this.koZoomTimer = ZOOM_KO_DURATION;
    this.koTargetX = worldX - CANVAS_WIDTH / 2;
    this.koTargetY = worldY - CANVAS_HEIGHT / 2;
    this.targetZoom = ZOOM_KO;
  }

  private updateKOZoom(): void {
    this.koZoomTimer--;
    if (this.koZoomTimer <= 0) {
      this.koZoomActive = false;
      this.targetZoom = 1.0;
    }
    // During KO: lerp to KO target
    this.targetX = this.koTargetX;
    this.lerp();
  }

  worldToScreen(worldX: number): number {
    return (worldX - this.x) * this.zoom;
  }
}
