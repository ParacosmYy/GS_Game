/**
 * 移动视觉反馈 — 从main.ts提取
 */
import { FighterState } from '../core/types.js';
import { STAGE_GROUND_Y, STAGE_LEFT, STAGE_RIGHT } from '../core/constants.js';
import type { Fighter } from '../entities/fighter.js';
import type { VFXSystem } from '../rendering/vfx.js';

/** 每帧移动视觉反馈: 跑步尘埃/着陆检测/壁弹火花 */
export function updateMovementVfx(fighters: Fighter[], vfx: VFXSystem, tick: number): void {
  for (const f of fighters) {
    if (f.state === FighterState.RUN && tick % 8 === 0) {
      vfx.spawnDust(f.x, STAGE_GROUND_Y);
    }
    if (f.state === FighterState.WALK && tick % 16 === 0 && f.isGrounded()) {
      vfx.spawnDust(f.x, STAGE_GROUND_Y);
    }
    if (f.prevState !== FighterState.BACKDASH && f.state === FighterState.BACKDASH) {
      vfx.spawnHeavyDust(f.x, STAGE_GROUND_Y, 4);
    }
    if ((f.prevState !== FighterState.ROLL && f.state === FighterState.ROLL)
      || (f.prevState !== FighterState.BACK_ROLL && f.state === FighterState.BACK_ROLL)) {
      vfx.spawnDust(f.x, STAGE_GROUND_Y);
    }
    const wasAir = f.prevState === FighterState.JUMP
      || f.prevState === FighterState.RUN_JUMP
      || f.prevState === FighterState.HOP
      || f.prevState === FighterState.HYPER_JUMP
      || f.prevState === FighterState.AIR_ATTACK
      || f.prevState === FighterState.AIR_BLOCK;
    const isGround = f.state === FighterState.IDLE
      || f.state === FighterState.CROUCH
      || f.state === FighterState.WALK;
    if (wasAir && isGround) {
      vfx.spawnHeavyDust(f.x, STAGE_GROUND_Y, 5);
    }
    const hitLeft = f.x <= STAGE_LEFT + 5;
    const hitRight = f.x >= STAGE_RIGHT - 5;
    if ((hitLeft || hitRight) && (f.state === FighterState.HITSTUN || f.state === FighterState.KNOCKDOWN)) {
      const wallX = hitLeft ? STAGE_LEFT : STAGE_RIGHT;
      if (tick % 3 === 0) {
        vfx.spawnCharacterHitSparks(wallX, f.y - f.displayHeight / 2, 6, '#ffaa44');
      }
    }
    // KOF2002: 起身尘埃 — 从KNOCKDOWN恢复到GETUP或从GETUP恢复到IDLE时
    if (f.prevState === FighterState.KNOCKDOWN && f.state === FighterState.GETUP) {
      vfx.spawnHeavyDust(f.x, STAGE_GROUND_Y, 6);
    }
    if (f.prevState === FighterState.GETUP && f.state === FighterState.IDLE) {
      vfx.spawnHeavyDust(f.x, STAGE_GROUND_Y, 4);
    }
    // KOF2002: 跑步急停尘埃 — 从RUN转到IDLE时产生更大的灰尘
    if (f.prevState === FighterState.RUN && f.state === FighterState.IDLE) {
      vfx.spawnHeavyDust(f.x, STAGE_GROUND_Y, 8);
    }
    // KOF2002: 倒地冲击 — 空中受击转入KNOCKDOWN时产生地面冲击
    const wasAirKD = (f.prevState === FighterState.HITSTUN || f.prevState === FighterState.AIR_ATTACK)
      && f.state === FighterState.KNOCKDOWN && f.isGrounded();
    if (wasAirKD) {
      vfx.spawnImpactRing(f.x, STAGE_GROUND_Y, 1.5);
      vfx.spawnHeavyDust(f.x, STAGE_GROUND_Y, 10);
    }
  }
}
