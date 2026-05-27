/**
 * Character Intro Animations — KOF2002 character-specific entrance
 *
 * After the generic walk-in (frames 0-40), each character plays a
 * unique intro animation before the round starts. This is a signature
 * KOF feature — Kyo's flame ignition, Iori's back-turn aura, etc.
 *
 * Timeline during INTRO phase:
 *   0-40:  Walk in from edges (handled by main.ts)
 *   41-100: Character-specific intro pose + VFX (this module)
 *   41-90:  "ROUND X" overlay
 *   90-150: "FIGHT!" overlay → transition to FIGHTING
 */

import { CANVAS_WIDTH } from '../core/constants.js';

// ─── Intro particle system ──────────────────────────────────────

interface IntroParticle {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  color: string; size: number;
}

const particles: IntroParticle[] = [];

function spawnParticle(
  x: number, y: number, vx: number, vy: number,
  life: number, color: string, size: number,
): void {
  particles.push({ x, y, vx, vy, life, maxLife: life, color, size });
}

function tickParticles(): void {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

function drawParticles(ctx: CanvasRenderingContext2D): void {
  for (const p of particles) {
    const alpha = p.life / p.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ─── Per-character intro sequences ──────────────────────────────

/** Intro timer (0 = not active, >0 = intro playing) */
let introTimer = 0;
let introActive = false;

export function isIntroActive(): boolean { return introActive; }

/** Character intro state for both fighters */
interface CharIntroState {
  charId: string;
  phase: 'idle' | 'playing' | 'done';
  timer: number;
}

const p1Intro: CharIntroState = { charId: '', phase: 'idle', timer: 0 };
const p2Intro: CharIntroState = { charId: '', phase: 'idle', timer: 0 };

export function startCharIntro(p1CharId: string, p2CharId: string): void {
  p1Intro.charId = p1CharId;
  p1Intro.phase = 'playing';
  p1Intro.timer = 0;

  p2Intro.charId = p2CharId;
  p2Intro.phase = 'playing';
  p2Intro.timer = 0;

  introTimer = 0;
  introActive = true;
  particles.length = 0;
}

export function resetCharIntro(): void {
  p1Intro.phase = 'idle';
  p2Intro.phase = 'idle';
  introActive = false;
  particles.length = 0;
}

export function tickCharIntro(): void {
  if (!introActive) return;
  introTimer++;
  p1Intro.timer++;
  p2Intro.timer++;

  // Intro plays for 60 frames, then done
  if (introTimer > 60) {
    p1Intro.phase = 'done';
    p2Intro.phase = 'done';
    introActive = false;
  }

  tickParticles();
}

// ─── Character-specific intro VFX ───────────────────────────────

function introVFX_kyo(ctx: CanvasRenderingContext2D, sx: number, sy: number, facing: number, timer: number): void {
  // Kyo intro: Flames ignite on both hands with rising fire particles
  // Phase 1 (0-15): Flame ignition — fire bursts from fists
  // Phase 2 (16-40): Sustained flame aura on hands
  // Phase 3 (41-60): Flame fades out

  if (timer < 15) {
    // Ignition burst
    const igniteP = timer / 15;
    const burstSize = (1 - igniteP) * 25 + 5;
    const burstAlpha = 0.8 * (1 - igniteP * 0.5);

    ctx.save();
    ctx.shadowColor = '#ff4400';
    ctx.shadowBlur = 20;

    // Right hand flame burst
    ctx.fillStyle = `rgba(255, 100, 0, ${burstAlpha})`;
    ctx.beginPath();
    ctx.arc(sx + 18 * facing, sy - 65, burstSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(255, 220, 50, ${burstAlpha * 0.7})`;
    ctx.beginPath();
    ctx.arc(sx + 18 * facing, sy - 65, burstSize * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Left hand flame burst
    ctx.fillStyle = `rgba(255, 100, 0, ${burstAlpha})`;
    ctx.beginPath();
    ctx.arc(sx - 8 * facing, sy - 60, burstSize * 0.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Spawn fire particles
    if (timer % 2 === 0) {
      for (let i = 0; i < 3; i++) {
        spawnParticle(
          sx + (Math.random() - 0.5) * 30 * facing,
          sy - 60 - Math.random() * 20,
          (Math.random() - 0.5) * 1.5,
          -1.5 - Math.random() * 2,
          15 + Math.random() * 10,
          Math.random() > 0.5 ? '#ff6622' : '#ffaa44',
          2 + Math.random() * 2,
        );
      }
    }
  } else if (timer < 40) {
    // Sustained hand flames — flickering
    const flicker = 0.3 + Math.sin(timer * 0.25) * 0.15;
    ctx.save();
    ctx.shadowColor = '#ff4400';
    ctx.shadowBlur = 12;

    // Right hand
    ctx.fillStyle = `rgba(255, 120, 0, ${flicker})`;
    ctx.beginPath();
    ctx.arc(sx + 16 * facing, sy - 65, 8 + Math.sin(timer * 0.3) * 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(255, 220, 80, ${flicker * 0.5})`;
    ctx.beginPath();
    ctx.arc(sx + 16 * facing, sy - 65, 4, 0, Math.PI * 2);
    ctx.fill();

    // Left hand
    ctx.fillStyle = `rgba(255, 100, 0, ${flicker * 0.8})`;
    ctx.beginPath();
    ctx.arc(sx - 6 * facing, sy - 58, 6 + Math.sin(timer * 0.35) * 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Occasional ember particles
    if (timer % 4 === 0) {
      spawnParticle(
        sx + (Math.random() - 0.3) * 20 * facing,
        sy - 62,
        (Math.random() - 0.5) * 0.8,
        -1 - Math.random() * 1.5,
        12 + Math.random() * 8,
        '#ff8833',
        1.5 + Math.random() * 1.5,
      );
    }
  } else {
    // Fade out
    const fadeP = (timer - 40) / 20;
    const fadeAlpha = 0.3 * (1 - fadeP);
    if (fadeAlpha > 0.01) {
      ctx.save();
      ctx.shadowColor = '#ff4400';
      ctx.shadowBlur = 8 * (1 - fadeP);
      ctx.fillStyle = `rgba(255, 120, 0, ${fadeAlpha})`;
      ctx.beginPath();
      ctx.arc(sx + 16 * facing, sy - 65, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}

function introVFX_iori(ctx: CanvasRenderingContext2D, sx: number, sy: number, facing: number, timer: number): void {
  // Iori intro: Purple Orochi energy claws materialize from hands
  // Phase 1 (0-10): Dark energy gathers
  // Phase 2 (11-35): Claw energy extends — 3 purple claw arcs
  // Phase 3 (36-60): Energy dissipates

  if (timer < 10) {
    // Dark energy gathering
    const gatherP = timer / 10;
    const gatherAlpha = 0.3 * gatherP;
    const gatherSize = 5 + gatherP * 15;

    ctx.save();
    ctx.shadowColor = '#7700cc';
    ctx.shadowBlur = 15 * gatherP;

    // Dark aura around body
    ctx.fillStyle = `rgba(100, 0, 170, ${gatherAlpha * 0.4})`;
    ctx.beginPath();
    ctx.arc(sx, sy - 55, gatherSize, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  } else if (timer < 35) {
    // Claw energy — purple arcs extending from hands
    const clawP = (timer - 10) / 25;
    const clawAlpha = 0.6 * (1 - clawP * 0.4);

    ctx.save();
    ctx.shadowColor = '#aa00ff';
    ctx.shadowBlur = 15;
    ctx.strokeStyle = `rgba(170, 50, 255, ${clawAlpha})`;
    ctx.lineWidth = 2.5;

    // Three claw arcs from right hand
    for (let i = 0; i < 3; i++) {
      const angle = (-0.4 + i * 0.35) * facing;
      const len = 25 + clawP * 15;
      const ox = sx + 18 * facing;
      const oy = sy - 65;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.quadraticCurveTo(
        ox + Math.cos(angle) * len * 0.6,
        oy + Math.sin(angle) * len * 0.6 - 5,
        ox + Math.cos(angle) * len,
        oy + Math.sin(angle) * len,
      );
      ctx.stroke();
    }

    // Purple glow on hands
    const glow = 0.4 + Math.sin(timer * 0.3) * 0.15;
    ctx.fillStyle = `rgba(140, 30, 220, ${glow})`;
    ctx.beginPath();
    ctx.arc(sx + 18 * facing, sy - 65, 7 + Math.sin(timer * 0.25) * 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(200, 100, 255, ${glow * 0.5})`;
    ctx.beginPath();
    ctx.arc(sx + 18 * facing, sy - 65, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Purple particles
    if (timer % 3 === 0) {
      spawnParticle(
        sx + (Math.random() - 0.5) * 30 * facing,
        sy - 55 - Math.random() * 20,
        (Math.random() - 0.5) * 1.2,
        -0.8 - Math.random() * 1.2,
        15 + Math.random() * 10,
        Math.random() > 0.5 ? '#9933ff' : '#cc66ff',
        2 + Math.random() * 1.5,
      );
    }
  } else {
    // Fade out
    const fadeP = (timer - 35) / 25;
    const fadeAlpha = 0.25 * (1 - fadeP);
    if (fadeAlpha > 0.01) {
      ctx.save();
      ctx.shadowColor = '#8800cc';
      ctx.shadowBlur = 8 * (1 - fadeP);
      ctx.fillStyle = `rgba(120, 30, 200, ${fadeAlpha})`;
      ctx.beginPath();
      ctx.arc(sx + 15 * facing, sy - 60, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}

function introVFX_ryo(ctx: CanvasRenderingContext2D, sx: number, sy: number, facing: number, timer: number): void {
  // Ryo intro: Ki energy gathering — golden energy rings expand from fists
  // Phase 1 (0-10): Energy concentrates around fists
  // Phase 2 (11-40): Expanding energy rings + ki particles
  // Phase 3 (41-60): Energy settles

  if (timer < 10) {
    // Concentration phase — small energy points on fists
    const concP = timer / 10;
    const concAlpha = 0.5 * concP;

    ctx.save();
    ctx.shadowColor = '#ffcc00';
    ctx.shadowBlur = 10 * concP;

    // Both fists glow
    ctx.fillStyle = `rgba(255, 200, 50, ${concAlpha})`;
    ctx.beginPath();
    ctx.arc(sx + 25 * facing, sy - 58, 4 + concP * 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(sx + 15 * facing, sy - 55, 3 + concP * 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  } else if (timer < 40) {
    // Ki expansion — rings burst outward from fists
    const ringP = (timer - 10) / 30;
    const numRings = 3;

    ctx.save();
    ctx.shadowColor = '#ffaa00';
    ctx.shadowBlur = 12;

    for (let i = 0; i < numRings; i++) {
      const phase = (ringP + i * 0.25) % 1;
      const ringR = 5 + phase * 40;
      const ringAlpha = 0.5 * (1 - phase);

      ctx.strokeStyle = `rgba(255, 200, 60, ${ringAlpha})`;
      ctx.lineWidth = 2.5 * (1 - phase) + 0.5;
      ctx.beginPath();
      ctx.arc(sx + 22 * facing, sy - 56, ringR, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Persistent fist glow
    const fistGlow = 0.4 + Math.sin(timer * 0.2) * 0.15;
    ctx.fillStyle = `rgba(255, 220, 80, ${fistGlow})`;
    ctx.beginPath();
    ctx.arc(sx + 24 * facing, sy - 58, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(255, 240, 120, ${fistGlow * 0.6})`;
    ctx.beginPath();
    ctx.arc(sx + 24 * facing, sy - 58, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Ki particles — golden motes floating upward
    if (timer % 3 === 0) {
      spawnParticle(
        sx + (Math.random() - 0.3) * 40 * facing,
        sy - 50 - Math.random() * 15,
        (Math.random() - 0.5) * 0.6,
        -0.8 - Math.random() * 1,
        12 + Math.random() * 8,
        Math.random() > 0.5 ? '#ffdd66' : '#ffee99',
        1.5 + Math.random(),
      );
    }
  } else {
    // Settle — fade the last glow
    const fadeP = (timer - 40) / 20;
    const fadeAlpha = 0.25 * (1 - fadeP);
    if (fadeAlpha > 0.01) {
      ctx.save();
      ctx.shadowColor = '#ffaa00';
      ctx.shadowBlur = 6 * (1 - fadeP);
      ctx.fillStyle = `rgba(255, 210, 60, ${fadeAlpha})`;
      ctx.beginPath();
      ctx.arc(sx + 22 * facing, sy - 57, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}

// ─── Public rendering API ───────────────────────────────────────

export function drawCharIntro(
  ctx: CanvasRenderingContext2D,
  p1CharId: string, p1X: number, p1Y: number, p1Facing: number,
  p2CharId: string, p2X: number, p2Y: number, p2Facing: number,
): void {
  if (!introActive) return;

  // Draw particles first (behind characters)
  drawParticles(ctx);

  // P1 intro
  if (p1Intro.phase === 'playing' && p1Intro.timer > 0) {
    ctx.save();
    switch (p1CharId) {
      case 'kyo': introVFX_kyo(ctx, p1X, p1Y, p1Facing, p1Intro.timer); break;
      case 'iori': introVFX_iori(ctx, p1X, p1Y, p1Facing, p1Intro.timer); break;
      case 'ryo': introVFX_ryo(ctx, p1X, p1Y, p1Facing, p1Intro.timer); break;
    }
    ctx.restore();
  }

  // P2 intro
  if (p2Intro.phase === 'playing' && p2Intro.timer > 0) {
    ctx.save();
    switch (p2CharId) {
      case 'kyo': introVFX_kyo(ctx, p2X, p2Y, p2Facing, p2Intro.timer); break;
      case 'iori': introVFX_iori(ctx, p2X, p2Y, p2Facing, p2Intro.timer); break;
      case 'ryo': introVFX_ryo(ctx, p2X, p2Y, p2Facing, p2Intro.timer); break;
    }
    ctx.restore();
  }
}
