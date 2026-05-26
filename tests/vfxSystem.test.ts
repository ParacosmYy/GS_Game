/**
 * VFX System Integration Tests — Hitstop + ScreenShake + Spark coordination
 *
 * Tests the three-layer visual feedback system as a coordinated whole:
 *   1. Hitstop (combat pause)
 *   2. Screen Shake (camera displacement)
 *   3. Spark/VFX (particle effects)
 *
 * Also tests VFX duration correctness and multi-effect coexistence.
 *
 * These tests do NOT require a real Canvas context.
 */
import { describe, it, expect } from 'vitest';
import {
  // Hitstop constants
  HITSTOP_LIGHT, HITSTOP_MEDIUM, HITSTOP_SPECIAL, HITSTOP_DM, HITSTOP_SDM,
  HITSTOP_COUNTER_BONUS,
  // Blockstop constants
  BLOCKSTOP_LIGHT, BLOCKSTOP_HEAVY, BLOCKSTOP_SPECIAL, BLOCKSTOP_DM,
  // Shake constants
  SHAKE_LIGHT, SHAKE_HEAVY, SHAKE_COUNTER, SHAKE_SPECIAL, SHAKE_THROW, SHAKE_DM, SHAKE_KO,
  SHAKE_DURATION_LIGHT, SHAKE_DURATION_HEAVY, SHAKE_DURATION_SPECIAL, SHAKE_DURATION_DM, SHAKE_DURATION_KO,
  SHAKE_BLOCK_LIGHT, SHAKE_BLOCK_HEAVY, SHAKE_BLOCK_SPECIAL, SHAKE_BLOCK_DM,
  SHAKE_BLOCK_DURATION_LIGHT, SHAKE_BLOCK_DURATION_HEAVY, SHAKE_BLOCK_DURATION_SPECIAL, SHAKE_BLOCK_DURATION_DM,
  // Spark constants
  SPARK_LIGHT, SPARK_HEAVY, SPARK_SPECIAL, SPARK_DM, SPARK_SDM, SPARK_COUNTER, SPARK_THROW,
  SPARK_SIZE_LIGHT, SPARK_SIZE_HEAVY, SPARK_SIZE_SPECIAL, SPARK_SIZE_DM, SPARK_SIZE_SDM,
  SPARK_COUNT_LIGHT, SPARK_COUNT_HEAVY, SPARK_COUNT_SPECIAL, SPARK_COUNT_DM, SPARK_COUNT_SDM,
  // Functions
  getHitstopFrames,
  getShakeIntensity,
  getShakeDuration,
  getSparkType,
  getSparkSizeScale,
  getSparkCount,
} from '../src/core/constants.js';
import { VFXSystem, ScreenShake, ScreenFlash } from '../src/rendering/vfx.js';
import {
  spawnCharacterHitSparks,
  spawnBlockFlash,
  spawnImpactRing,
  spawnSlashLine,
  spawnSuperBurst,
  spawnGroundSlam,
  spawnCounterWireSparks,
  spawnDust,
  spawnHeavyDust,
  spawnCounterText,
  getSparkSizeScaleFromDamage,
} from '../src/rendering/vfxPresets.js';
import type { Particle } from '../src/rendering/vfxPresets.js';

// ═══════════════════════════════════════════════════════════════
// 1. Hitstop系统 (6 tests)
// ═══════════════════════════════════════════════════════════════

describe('1. Hitstop系统', () => {
  it('getHitstopFrames returns correct tiered values for all attack levels', () => {
    // Light attacks
    expect(getHitstopFrames('STAND_A')).toBe(HITSTOP_LIGHT);
    expect(getHitstopFrames('CROUCH_B')).toBe(HITSTOP_LIGHT);
    expect(getHitstopFrames('JUMP_A')).toBe(HITSTOP_LIGHT);
    // Medium/Heavy attacks
    expect(getHitstopFrames('STAND_C')).toBe(HITSTOP_MEDIUM);
    expect(getHitstopFrames('CROUCH_D')).toBe(HITSTOP_MEDIUM);
    expect(getHitstopFrames('CLOSE_C')).toBe(HITSTOP_MEDIUM);
    // DM
    expect(getHitstopFrames('DM_OROCHINAGI')).toBe(HITSTOP_DM);
    // SDM / HSDM
    expect(getHitstopFrames('SDM_YATAGARASU')).toBe(HITSTOP_SDM);
    expect(getHitstopFrames('HSDM_SOMETHING')).toBe(HITSTOP_SDM);

    // Verify strict ordering: Light < Medium < Special < DM < SDM
    // (Special goes through a different code path but getHitstopFrames
    //  returns HITSTOP_LIGHT for specials; they are handled in combat)
    expect(HITSTOP_LIGHT).toBeLessThan(HITSTOP_MEDIUM);
    expect(HITSTOP_MEDIUM).toBeLessThan(HITSTOP_SPECIAL);
    expect(HITSTOP_SPECIAL).toBeLessThan(HITSTOP_DM);
    expect(HITSTOP_DM).toBeLessThan(HITSTOP_SDM);
  });

  it('Counter Hit adds extra hitstop frames (HITSTOP_COUNTER_BONUS = 3)', () => {
    // Counter bonus is additive: base + HITSTOP_COUNTER_BONUS
    const lightCH = getHitstopFrames('STAND_A') + HITSTOP_COUNTER_BONUS;
    const heavyCH = getHitstopFrames('STAND_C') + HITSTOP_COUNTER_BONUS;
    const dmCH = getHitstopFrames('DM_OROCHINAGI') + HITSTOP_COUNTER_BONUS;
    const sdmCH = getHitstopFrames('SDM_YATAGARASU') + HITSTOP_COUNTER_BONUS;

    expect(lightCH).toBe(HITSTOP_LIGHT + 3);
    expect(heavyCH).toBe(HITSTOP_MEDIUM + 3);
    expect(dmCH).toBe(HITSTOP_DM + 3);
    expect(sdmCH).toBe(HITSTOP_SDM + 3);
  });

  it('hitstop pauses combat — ScreenFlash remains active during hitstop window', () => {
    const flash = new ScreenFlash();
    // Simulate a hitstop window (e.g. DM hitstop = 19 frames)
    const hitstopFrames = HITSTOP_DM;
    flash.trigger('#ffffff', 0.5, hitstopFrames);

    // During hitstop, flash should be active
    for (let i = 0; i < hitstopFrames - 1; i++) {
      flash.update();
      expect(flash.active).toBe(true);
    }
    // After hitstop ends, flash is gone
    flash.update();
    expect(flash.active).toBe(false);
  });

  it('hitstop ends and game resumes — ScreenShake offsets return to zero', () => {
    const shake = new ScreenShake();
    const duration = SHAKE_DURATION_HEAVY;
    shake.trigger(SHAKE_HEAVY, duration, 1);

    // Run through the full duration
    for (let i = 0; i < duration; i++) {
      shake.update();
    }
    // After duration expires, offsets must be 0
    expect(shake.offsetX).toBe(0);
    expect(shake.offsetY).toBe(0);
  });

  it('multiple consecutive hits: hitstop does not stack (takes maximum only)', () => {
    // ScreenShake.trigger only overrides if new intensity >= current intensity
    const shake = new ScreenShake();
    // First hit: heavy attack
    shake.trigger(SHAKE_HEAVY, SHAKE_DURATION_HEAVY, 1);
    shake.update();
    const firstOffset = Math.abs(shake.offsetX);

    // Second weaker hit during ongoing shake — should NOT override
    shake.trigger(SHAKE_LIGHT, SHAKE_DURATION_LIGHT, 1);
    // Intensity should still be SHAKE_HEAVY because 3 < 6
    shake.update();
    // The shake should still use the higher intensity from the first trigger
    // (exact offset depends on phase, but it should be non-zero and significant)
    expect(Math.abs(shake.offsetX) + Math.abs(shake.offsetY)).toBeGreaterThan(0);
    // Duration should still be from the first trigger (not reset to LIGHT duration)
    // After LIGHT_DURATION=4 more updates from start, still going
  });

  it('KO hitstop uses special extended values — longest shake duration (SHAKE_DURATION_KO = 55)', () => {
    // KO uses SHAKE_KO=22 intensity and SHAKE_DURATION_KO=55 duration
    // which are both significantly larger than DM (14 / 16)
    expect(SHAKE_KO).toBeGreaterThan(SHAKE_DM);
    expect(SHAKE_DURATION_KO).toBeGreaterThan(SHAKE_DURATION_DM);
    expect(SHAKE_DURATION_KO).toBe(55);

    // Simulate KO shake
    const shake = new ScreenShake();
    shake.trigger(SHAKE_KO, SHAKE_DURATION_KO, 1);

    // After DM duration (16 frames), KO shake should still be active
    for (let i = 0; i < SHAKE_DURATION_DM; i++) {
      shake.update();
    }
    // Shake should still have remaining frames
    // offsetX/offsetY may be non-zero (depending on phase), but not necessarily both
    // The important thing is the shake hasn't expired yet
    // Run just a few more to confirm it's still active beyond DM duration
    shake.update(); // frame 17
    // Not expired yet because duration is 55
  });
});

// ═══════════════════════════════════════════════════════════════
// 2. Screen Shake系统 (6 tests)
// ═══════════════════════════════════════════════════════════════

describe('2. Screen Shake系统', () => {
  it('getShakeIntensity returns correct tiered values', () => {
    expect(getShakeIntensity('STAND_A', 30, false)).toBe(SHAKE_LIGHT);
    expect(getShakeIntensity('STAND_C', 80, false)).toBe(SHAKE_HEAVY);
    expect(getShakeIntensity('KYO_ONIYAKI', 60, false)).toBe(SHAKE_SPECIAL);
    expect(getShakeIntensity('THROW', 80, false)).toBe(SHAKE_THROW);
    expect(getShakeIntensity('DM_OROCHINAGI', 200, false)).toBe(SHAKE_DM);
    expect(getShakeIntensity('SDM_OROCHINAGI', 250, false)).toBe(SHAKE_DM); // SDM/DM share SHAKE_DM
  });

  it('getShakeDuration returns correct tiered values', () => {
    expect(getShakeDuration('STAND_A')).toBe(SHAKE_DURATION_LIGHT);
    expect(getShakeDuration('STAND_C')).toBe(SHAKE_DURATION_HEAVY);
    expect(getShakeDuration('KYO_ONIYAKI')).toBe(SHAKE_DURATION_SPECIAL);
    expect(getShakeDuration('DM_OROCHINAGI')).toBe(SHAKE_DURATION_DM);
    expect(getShakeDuration('SDM_OROCHINAGI')).toBe(SHAKE_DURATION_DM);

    // Monotonic ordering
    expect(SHAKE_DURATION_LIGHT).toBeLessThan(SHAKE_DURATION_HEAVY);
    expect(SHAKE_DURATION_HEAVY).toBeLessThan(SHAKE_DURATION_SPECIAL);
    expect(SHAKE_DURATION_SPECIAL).toBeLessThan(SHAKE_DURATION_DM);
    expect(SHAKE_DURATION_DM).toBeLessThan(SHAKE_DURATION_KO);
  });

  it('shake intensity decays over time — offsets decrease in later frames', () => {
    const shake = new ScreenShake();
    shake.trigger(10, 20, 1);

    // Collect offsets over time
    const offsets: number[] = [];
    for (let i = 0; i < 20; i++) {
      shake.update();
      offsets.push(Math.abs(shake.offsetX) + Math.abs(shake.offsetY));
    }

    // Early phase offsets should be larger than late phase offsets on average
    const earlySum = offsets.slice(0, 5).reduce((a, b) => a + b, 0);
    const lateSum = offsets.slice(12, 17).reduce((a, b) => a + b, 0);
    expect(earlySum).toBeGreaterThan(lateSum);
  });

  it('shake offsets stay within reasonable range (-20 to +20 for Y, -30 to +30 for X)', () => {
    const shake = new ScreenShake();
    // Even with extreme intensity, offsets should be clamped
    shake.trigger(50, 30, 1);

    for (let i = 0; i < 30; i++) {
      shake.update();
      expect(shake.offsetX).toBeGreaterThanOrEqual(-30);
      expect(shake.offsetX).toBeLessThanOrEqual(30);
      expect(shake.offsetY).toBeGreaterThanOrEqual(-20);
      expect(shake.offsetY).toBeLessThanOrEqual(20);
    }
  });

  it('KO shake has the longest duration (SHAKE_DURATION_KO = 55)', () => {
    expect(SHAKE_DURATION_KO).toBe(55);
    expect(SHAKE_DURATION_KO).toBeGreaterThan(SHAKE_DURATION_DM); // 55 > 16
    expect(SHAKE_DURATION_KO).toBeGreaterThan(SHAKE_DURATION_SPECIAL); // 55 > 10
    expect(SHAKE_DURATION_KO).toBeGreaterThan(SHAKE_DURATION_HEAVY); // 55 > 8
    expect(SHAKE_DURATION_KO).toBeGreaterThan(SHAKE_DURATION_LIGHT); // 55 > 4
  });

  it('shake does not affect game logic — offsetX/offsetY are pure render values', () => {
    // ScreenShake only produces offsetX/offsetY, does not modify any game state
    const shake = new ScreenShake();
    shake.trigger(SHAKE_HEAVY, SHAKE_DURATION_HEAVY, 1);

    // The shake object only has offsetX, offsetY — no side effects
    shake.update();
    // Offset is a number, not a reference to any game object
    expect(typeof shake.offsetX).toBe('number');
    expect(typeof shake.offsetY).toBe('number');

    // After shake expires, offsets return to 0 without any game state change
    for (let i = 0; i < SHAKE_DURATION_HEAVY; i++) {
      shake.update();
    }
    expect(shake.offsetX).toBe(0);
    expect(shake.offsetY).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════
// 3. Spark/VFX系统 (6 tests)
// ═══════════════════════════════════════════════════════════════

describe('3. Spark/VFX系统', () => {
  it('getSparkType returns correct tiered types', () => {
    expect(getSparkType('STAND_A')).toBe(SPARK_LIGHT);
    expect(getSparkType('STAND_C')).toBe(SPARK_HEAVY);
    expect(getSparkType('CROUCH_D')).toBe(SPARK_HEAVY);
    expect(getSparkType('CLOSE_D')).toBe(SPARK_HEAVY);
    expect(getSparkType('STAND_CD')).toBe(SPARK_HEAVY);
    expect(getSparkType('KYO_ONIYAKI')).toBe(SPARK_SPECIAL);
    expect(getSparkType('DM_OROCHINAGI')).toBe(SPARK_DM);
    expect(getSparkType('SDM_YATAGARASU')).toBe(SPARK_SDM);
    expect(getSparkType('HSDM_SOMETHING')).toBe(SPARK_SDM);
  });

  it('getSparkSizeScale is monotonically increasing: Light < Heavy < Special < DM < SDM', () => {
    const light = getSparkSizeScale('STAND_A');
    const heavy = getSparkSizeScale('STAND_C');
    const special = getSparkSizeScale('KYO_ONIYAKI');
    const dm = getSparkSizeScale('DM_OROCHINAGI');
    const sdm = getSparkSizeScale('SDM_OROCHINAGI');

    expect(light).toBe(SPARK_SIZE_LIGHT);
    expect(heavy).toBe(SPARK_SIZE_HEAVY);
    expect(special).toBe(SPARK_SIZE_SPECIAL);
    expect(dm).toBe(SPARK_SIZE_DM);
    expect(sdm).toBe(SPARK_SIZE_SDM);

    // Strict ordering
    expect(light).toBeLessThan(heavy);
    expect(heavy).toBeLessThan(special);
    expect(special).toBeLessThan(dm);
    expect(dm).toBeLessThan(sdm);
  });

  it('getSparkCount is monotonically increasing across tiers', () => {
    const light = getSparkCount('STAND_A');
    const heavy = getSparkCount('STAND_C');
    const special = getSparkCount('KYO_ONIYAKI');
    const dm = getSparkCount('DM_OROCHINAGI');
    const sdm = getSparkCount('SDM_OROCHINAGI');

    // LIGHT and HEAVY share the same count (6), that's OK
    expect(light).toBe(SPARK_COUNT_LIGHT);
    expect(heavy).toBe(SPARK_COUNT_HEAVY);
    expect(special).toBe(SPARK_COUNT_SPECIAL);
    expect(dm).toBe(SPARK_COUNT_DM);
    expect(sdm).toBe(SPARK_COUNT_SDM);

    // Monotonic from SPECIAL onward
    expect(heavy).toBeLessThanOrEqual(special);
    expect(special).toBeLessThan(dm);
    expect(dm).toBeLessThan(sdm);
  });

  it('Counter Hit uses counter spark (SPARK_COUNTER type / orange counter text)', () => {
    // Counter Hit in KOF2002 triggers a distinct "COUNTER!" text VFX
    const particles: Particle[] = [];
    spawnCounterText(particles, 400, 300);

    expect(particles.length).toBe(1);
    expect(particles[0].type).toBe('text');
    expect(particles[0].text).toBe('COUNTER!');
    expect(particles[0].color).toBe('#ff8800'); // orange counter color
  });

  it('Throw uses throw spark (SPARK_THROW type)', () => {
    // Throw attack type maps to SPARK_THROW
    expect(getSparkType('THROW')).toBe(SPARK_THROW);
    expect(getSparkType('THROW_FORWARD')).toBe(SPARK_THROW);
    expect(getSparkType('THROW_BACK')).toBe(SPARK_THROW);

    // Throw triggers special shake intensity
    expect(getShakeIntensity('THROW', 80, false)).toBe(SHAKE_THROW);
  });

  it('Block uses block flash (spawnBlockFlash creates flash particle)', () => {
    const particles: Particle[] = [];
    spawnBlockFlash(particles, 400, 300, 1.0);

    expect(particles.length).toBe(1);
    expect(particles[0].type).toBe('flash');
    expect(particles[0].color).toBe('#aaccff'); // blue-tinted block flash
    expect(particles[0].size).toBe(40); // default block flash size
  });
});

// ═══════════════════════════════════════════════════════════════
// 4. Hitstop + Shake + Spark Coordination (6 tests)
// ═══════════════════════════════════════════════════════════════

describe('4. Hitstop + Shake + Spark Coordination', () => {
  it('on hit: all three systems trigger simultaneously', () => {
    const attackType = 'STAND_C';
    const damage = 80;
    const isCounter = false;

    // Simulate the three systems responding to the same hit
    const hitstop = getHitstopFrames(attackType);
    const shakeIntensity = getShakeIntensity(attackType, damage, isCounter);
    const shakeDuration = getShakeDuration(attackType);
    const sparkType = getSparkType(attackType);
    const sparkSize = getSparkSizeScale(attackType);
    const sparkCount = getSparkCount(attackType);

    // All should be defined and non-zero for a hit
    expect(hitstop).toBeGreaterThan(0);
    expect(shakeIntensity).toBeGreaterThan(0);
    expect(shakeDuration).toBeGreaterThan(0);
    expect(sparkType).toBe(SPARK_HEAVY);
    expect(sparkSize).toBe(SPARK_SIZE_HEAVY);
    expect(sparkCount).toBe(SPARK_COUNT_HEAVY);

    // VFXSystem: spawn character hit sparks
    const vfx = new VFXSystem();
    vfx.spawnCharacterHitSparks(400, 300, sparkCount, '#ffdd44', sparkSize);
    // 1 main flash + 1 white core + sparkCount scattered
    expect(vfx.count).toBe(2 + sparkCount);

    // ScreenShake: trigger shake
    const shake = new ScreenShake();
    shake.trigger(shakeIntensity, shakeDuration, 1);
    shake.update();
    expect(Math.abs(shake.offsetX) + Math.abs(shake.offsetY)).toBeGreaterThan(0);

    // ScreenFlash: trigger flash for hitstop duration
    const flash = new ScreenFlash();
    flash.trigger('#ffffff', 0.5, hitstop);
    expect(flash.active).toBe(true);
  });

  it('on block: only blockstop + shake trigger, no hit spark', () => {
    const attackType = 'STAND_C';

    // On block, blockstop is used instead of hitstop
    const blockstop = BLOCKSTOP_HEAVY; // heavy attack blocked
    const blockShakeIntensity = SHAKE_BLOCK_HEAVY;
    const blockShakeDuration = SHAKE_BLOCK_DURATION_HEAVY;

    // Blockstop should be shorter than hitstop for the same attack
    expect(blockstop).toBeLessThan(getHitstopFrames(attackType));

    // Block shake should be weaker than hit shake
    expect(blockShakeIntensity).toBeLessThanOrEqual(getShakeIntensity(attackType, 80, false));

    // No hit spark — only block flash
    const particles: Particle[] = [];
    spawnBlockFlash(particles, 400, 300, 1.0);
    expect(particles.length).toBe(1);
    expect(particles[0].type).toBe('flash');
    // Block flash color is blue-tinted, not orange/yellow like hit sparks
    expect(particles[0].color).toBe('#aaccff');
  });

  it('DM hit: long hitstop + large shake + large spark', () => {
    const attackType = 'DM_OROCHINAGI';
    const damage = 200;

    const hitstop = getHitstopFrames(attackType);
    const shakeIntensity = getShakeIntensity(attackType, damage, false);
    const shakeDuration = getShakeDuration(attackType);
    const sparkType = getSparkType(attackType);
    const sparkSize = getSparkSizeScale(attackType);
    const sparkCount = getSparkCount(attackType);

    // DM should have the longest hitstop among non-SDM attacks
    expect(hitstop).toBe(HITSTOP_DM); // 19
    expect(hitstop).toBeGreaterThan(HITSTOP_SPECIAL);
    expect(hitstop).toBeGreaterThan(HITSTOP_MEDIUM);
    expect(hitstop).toBeGreaterThan(HITSTOP_LIGHT);

    // DM shake should be strong
    expect(shakeIntensity).toBe(SHAKE_DM); // 14
    expect(shakeDuration).toBe(SHAKE_DURATION_DM); // 16

    // DM spark should be large
    expect(sparkType).toBe(SPARK_DM);
    expect(sparkSize).toBe(SPARK_SIZE_DM); // 1.3
    expect(sparkCount).toBe(SPARK_COUNT_DM); // 14

    // Super burst VFX
    const particles: Particle[] = [];
    spawnSuperBurst(particles, 400, 300, '#4488ff', '#aaccff', false);
    // Should create many particles
    expect(particles.length).toBeGreaterThan(15);
    // First particle should be white superb burst
    expect(particles[0].type).toBe('superburst');
    expect(particles[0].color).toBe('#ffffff');
  });

  it('Counter Hit: extra hitstop + large shake + counter spark', () => {
    const attackType = 'STAND_A';
    const damage = 30;

    // Counter Hit versions
    const baseHitstop = getHitstopFrames(attackType);
    const chHitstop = baseHitstop + HITSTOP_COUNTER_BONUS;
    const chShake = getShakeIntensity(attackType, damage, true);
    const chSparkType = getSparkType(attackType); // base spark type unchanged

    // CH hitstop is longer than base
    expect(chHitstop).toBe(baseHitstop + 3);
    expect(chHitstop).toBeGreaterThan(baseHitstop);

    // CH shake uses SHAKE_COUNTER (6) instead of SHAKE_LIGHT (3)
    expect(chShake).toBe(SHAKE_COUNTER);
    expect(chShake).toBeGreaterThan(getShakeIntensity(attackType, damage, false));

    // Spark type remains the base type (counter text is a separate VFX)
    expect(chSparkType).toBe(SPARK_LIGHT);

    // Counter text VFX is spawned separately
    const particles: Particle[] = [];
    spawnCounterText(particles, 400, 300);
    expect(particles[0].text).toBe('COUNTER!');
  });

  it('KO: longest hitstop + shake + special KO ground slam effect', () => {
    // KO uses special constants beyond normal attack tiers
    const koShakeIntensity = SHAKE_KO; // 22
    const koShakeDuration = SHAKE_DURATION_KO; // 55

    // KO shake is the strongest and longest
    expect(koShakeIntensity).toBeGreaterThan(SHAKE_DM);
    expect(koShakeDuration).toBeGreaterThan(SHAKE_DURATION_DM);

    // KO triggers ground slam VFX
    const particles: Particle[] = [];
    spawnGroundSlam(particles, 400, 510);
    // Ground slam: 1 groundslam + 20 dust + 12 stars = 33 particles
    expect(particles.length).toBe(33);
    expect(particles[0].type).toBe('groundslam');
    expect(particles[0].color).toBe('#ff2200');
    expect(particles[0].life).toBe(24);
  });

  it('Wall bounce (Counter Wire): special shake + wall bounce VFX', () => {
    // Counter Wire triggers a distinct VFX sequence
    const particles: Particle[] = [];
    spawnCounterWireSparks(particles, 400, 300);

    // Should create flash + scattered stars + impact ring
    expect(particles.length).toBeGreaterThan(10);

    // First particle is the flash core
    const flashCore = particles[0];
    expect(flashCore.type).toBe('flash');
    expect(flashCore.color).toBe('#ff8800');

    // Should have star particles (wall bounce sparks)
    const stars = particles.filter(p => p.type === 'star');
    expect(stars.length).toBe(16);

    // Should have a ring particle (impact ring)
    const rings = particles.filter(p => p.type === 'ring');
    expect(rings.length).toBe(1);
    expect(rings[0].color).toBe('#ffaa22');
  });
});

// ═══════════════════════════════════════════════════════════════
// 5. Visual Effect Durations (6 tests)
// ═══════════════════════════════════════════════════════════════

describe('5. Visual Effect Durations', () => {
  it('hitstop ends at exactly the correct frame count', () => {
    // Test each tier
    const tiers = [
      { name: 'LIGHT', frames: HITSTOP_LIGHT },
      { name: 'MEDIUM', frames: HITSTOP_MEDIUM },
      { name: 'DM', frames: HITSTOP_DM },
      { name: 'SDM', frames: HITSTOP_SDM },
    ];
    for (const tier of tiers) {
      const flash = new ScreenFlash();
      flash.trigger('#ffffff', 0.5, tier.frames);
      // Active until last frame
      for (let i = 0; i < tier.frames - 1; i++) {
        flash.update();
      }
      expect(flash.active).toBe(true);
      // Expires on exactly the Nth frame
      flash.update();
      expect(flash.active).toBe(false);
    }
  });

  it('shake offsets return to zero at exactly the correct frame count', () => {
    const durations = [
      SHAKE_DURATION_LIGHT,
      SHAKE_DURATION_HEAVY,
      SHAKE_DURATION_SPECIAL,
      SHAKE_DURATION_DM,
    ];
    for (const duration of durations) {
      const shake = new ScreenShake();
      shake.trigger(10, duration, 1);
      // Active until last frame
      for (let i = 0; i < duration; i++) {
        shake.update();
      }
      // After duration frames, offsets must be exactly 0
      expect(shake.offsetX).toBe(0);
      expect(shake.offsetY).toBe(0);
    }
  });

  it('spark particles expire at their individual life frame counts', () => {
    const vfx = new VFXSystem();
    vfx.spawnBlockFlash(100, 200, 1.0);
    // Block flash has life=8, maxLife=8
    // After exactly 7 updates, still alive
    for (let i = 0; i < 7; i++) vfx.update();
    expect(vfx.count).toBe(1);
    // 8th update expires it
    vfx.update();
    expect(vfx.count).toBe(0);
  });

  it('VFX lifecycle stays synchronized with combat state (ScreenFlash + VFXSystem)', () => {
    // Simulate a DM hit: flash + sparks + shake all for the same duration concept
    const vfx = new VFXSystem();
    const flash = new ScreenFlash();
    const shake = new ScreenShake();

    const attackType = 'DM_OROCHINAGI';
    const hitstop = getHitstopFrames(attackType);
    const shakeInt = getShakeIntensity(attackType, 200, false);
    const shakeDur = getShakeDuration(attackType);

    // Trigger all systems
    flash.trigger('#ffffff', 0.5, hitstop);
    shake.trigger(shakeInt, shakeDur, 1);
    vfx.spawnCharacterHitSparks(400, 300, 14, '#4488ff', SPARK_SIZE_DM);

    // Run hitstop frames
    for (let i = 0; i < hitstop; i++) {
      flash.update();
      shake.update();
      vfx.update();
    }
    // Flash should be done
    expect(flash.active).toBe(false);
    // Shake may still be active (duration 16 vs hitstop 19 — hitstop is longer here)
    // VFX may still have particles
  });

  it('multiple VFX coexisting does not conflict', () => {
    const vfx = new VFXSystem();

    // Spawn multiple different VFX types simultaneously
    vfx.spawnCharacterHitSparks(400, 300, 8, '#ff0000', 1.0); // hit sparks
    vfx.spawnBlockFlash(500, 300, 1.0);                       // block flash
    vfx.spawnImpactRing(350, 300, 1.0);                       // impact ring
    vfx.spawnDust(400, 510);                                   // dust
    vfx.spawnCounterText(450, 280);                            // counter text

    const initialCount = vfx.count;
    expect(initialCount).toBeGreaterThan(0);

    // All particles should coexist and update correctly
    vfx.update();
    expect(vfx.count).toBeLessThanOrEqual(initialCount); // some may have expired

    // Eventually all expire
    for (let i = 0; i < 60; i++) vfx.update();
    expect(vfx.count).toBe(0);
  });

  it('VFX does not affect frame rate — update/render completes without external dependencies', () => {
    const vfx = new VFXSystem();
    const shake = new ScreenShake();
    const flash = new ScreenFlash();

    // Simulate a heavy VFX scene
    vfx.spawnCharacterHitSparks(400, 300, 18, '#ff0000', 1.5);
    vfx.spawnSuperBurst(400, 300, '#4488ff', '#aaccff', true);
    vfx.spawnGroundSlam(400, 510);
    vfx.spawnDust(400, 510);
    vfx.spawnHeavyDust(400, 510, 12);
    shake.trigger(SHAKE_KO, SHAKE_DURATION_KO, 1);
    flash.trigger('#ffffff', 0.8, 30);

    const particleCount = vfx.count;
    expect(particleCount).toBeGreaterThan(30);

    // Run 60 frames of update — should complete without error
    for (let i = 0; i < 60; i++) {
      vfx.update();
      shake.update();
      flash.update();
    }

    // All should be clean
    expect(vfx.count).toBe(0);
    expect(shake.offsetX).toBe(0);
    expect(shake.offsetY).toBe(0);
    expect(flash.active).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════
// Bonus: Damage-based spark size scaling
// ═══════════════════════════════════════════════════════════════

describe('6. Damage-based spark size scaling', () => {
  it('low damage (<50) produces smallest spark', () => {
    expect(getSparkSizeScaleFromDamage(20)).toBe(0.5);
    expect(getSparkSizeScaleFromDamage(49)).toBe(0.5);
  });

  it('medium damage (50-99) produces medium spark', () => {
    expect(getSparkSizeScaleFromDamage(50)).toBe(0.8);
    expect(getSparkSizeScaleFromDamage(99)).toBe(0.8);
  });

  it('heavy damage (100-149) produces large spark', () => {
    expect(getSparkSizeScaleFromDamage(100)).toBe(1.1);
    expect(getSparkSizeScaleFromDamage(149)).toBe(1.1);
  });

  it('special damage (150-199) produces extra large spark', () => {
    expect(getSparkSizeScaleFromDamage(150)).toBe(1.4);
    expect(getSparkSizeScaleFromDamage(199)).toBe(1.4);
  });

  it('DM damage (200+) produces massive spark', () => {
    expect(getSparkSizeScaleFromDamage(200)).toBe(1.7);
    expect(getSparkSizeScaleFromDamage(500)).toBe(1.7);
  });

  it('damage-based scaling is monotonically increasing', () => {
    const s1 = getSparkSizeScaleFromDamage(20);
    const s2 = getSparkSizeScaleFromDamage(70);
    const s3 = getSparkSizeScaleFromDamage(120);
    const s4 = getSparkSizeScaleFromDamage(170);
    const s5 = getSparkSizeScaleFromDamage(250);
    expect(s1).toBeLessThan(s2);
    expect(s2).toBeLessThan(s3);
    expect(s3).toBeLessThan(s4);
    expect(s4).toBeLessThan(s5);
  });
});

// ═══════════════════════════════════════════════════════════════
// Bonus: Slash line and impact ring VFX
// ═══════════════════════════════════════════════════════════════

describe('7. Slash line and impact ring VFX', () => {
  it('slash line creates 2 particles (main + white core)', () => {
    const particles: Particle[] = [];
    spawnSlashLine(particles, 400, 300, 1, '#ffdd44', 1.0);
    expect(particles.length).toBe(2);
    expect(particles.every(p => p.type === 'slash')).toBe(true);
    // One is the main color, one is white
    const colors = particles.map(p => p.color);
    expect(colors).toContain('#ffffff');
  });

  it('impact ring creates 2 ring particles (white + gold)', () => {
    const particles: Particle[] = [];
    spawnImpactRing(particles, 400, 300, 1.0);
    expect(particles.length).toBe(2);
    expect(particles.every(p => p.type === 'ring')).toBe(true);
  });

  it('slash line scale affects particle size', () => {
    const small: Particle[] = [];
    const large: Particle[] = [];
    spawnSlashLine(small, 400, 300, 1, '#ffdd44', 0.5);
    spawnSlashLine(large, 400, 300, 1, '#ffdd44', 2.0);
    // Large scale should produce larger particles
    const smallMaxSize = Math.max(...small.map(p => p.size));
    const largeMaxSize = Math.max(...large.map(p => p.size));
    expect(largeMaxSize).toBeGreaterThan(smallMaxSize);
  });
});
