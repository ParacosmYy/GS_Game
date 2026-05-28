/**
 * Hit Feedback Tier System Consistency Tests
 *
 * Validates that hitstop, blockstop, shake, and spark tiers
 * form a consistent progression across attack categories:
 * light < heavy < special < DM < SDM
 *
 * Also validates getter functions return correct tier values.
 */
import { describe, it, expect } from 'vitest';
import {
  HITSTOP_LIGHT, HITSTOP_MEDIUM, HITSTOP_SPECIAL, HITSTOP_DM, HITSTOP_SDM,
  BLOCKSTOP_LIGHT, BLOCKSTOP_HEAVY, BLOCKSTOP_SPECIAL, BLOCKSTOP_DM,
  SHAKE_LIGHT, SHAKE_HEAVY, SHAKE_SPECIAL, SHAKE_DM, SHAKE_KO,
  SHAKE_DURATION_LIGHT, SHAKE_DURATION_HEAVY, SHAKE_DURATION_SPECIAL, SHAKE_DURATION_DM, SHAKE_DURATION_KO,
  SPARK_SIZE_LIGHT, SPARK_SIZE_HEAVY, SPARK_SIZE_SPECIAL, SPARK_SIZE_DM, SPARK_SIZE_SDM,
  SPARK_COUNT_LIGHT, SPARK_COUNT_HEAVY, SPARK_COUNT_SPECIAL, SPARK_COUNT_DM, SPARK_COUNT_SDM,
  getHitstopFrames,
  getSparkType,
  getSparkSizeScale,
  getSparkCount,
  getShakeIntensity,
  getShakeDuration,
} from '../src/core/constants.js';

describe('Hitstop tier progression', () => {
  it('light < medium < special < DM < SDM', () => {
    expect(HITSTOP_LIGHT).toBeLessThan(HITSTOP_MEDIUM);
    expect(HITSTOP_MEDIUM).toBeLessThan(HITSTOP_SPECIAL);
    expect(HITSTOP_SPECIAL).toBeLessThan(HITSTOP_DM);
    expect(HITSTOP_DM).toBeLessThan(HITSTOP_SDM);
  });

  it('all hitstop values are positive', () => {
    expect(HITSTOP_LIGHT).toBeGreaterThan(0);
    expect(HITSTOP_SDM).toBeGreaterThan(0);
  });

  it('getHitstopFrames returns correct values for each tier', () => {
    expect(getHitstopFrames('STAND_A')).toBe(HITSTOP_LIGHT);
    expect(getHitstopFrames('STAND_C')).toBe(HITSTOP_MEDIUM);
    expect(getHitstopFrames('CLOSE_D')).toBe(HITSTOP_MEDIUM);
    expect(getHitstopFrames('RYO_KOOU')).toBe(HITSTOP_LIGHT); // specials not heavy normals
    expect(getHitstopFrames('DM_TEN_HA_OU')).toBe(HITSTOP_DM);
    expect(getHitstopFrames('SDM_OROCHINAGI')).toBe(HITSTOP_SDM);
    expect(getHitstopFrames('HSDM_RYUKO_RANBU')).toBe(HITSTOP_SDM);
  });
});

describe('Blockstop tier progression', () => {
  it('light < heavy < special < DM', () => {
    expect(BLOCKSTOP_LIGHT).toBeLessThan(BLOCKSTOP_HEAVY);
    expect(BLOCKSTOP_HEAVY).toBeLessThan(BLOCKSTOP_SPECIAL);
    expect(BLOCKSTOP_SPECIAL).toBeLessThan(BLOCKSTOP_DM);
  });

  it('blockstop is shorter than hitstop for each tier', () => {
    expect(BLOCKSTOP_LIGHT).toBeLessThan(HITSTOP_LIGHT);
    expect(BLOCKSTOP_HEAVY).toBeLessThan(HITSTOP_MEDIUM);
    expect(BLOCKSTOP_SPECIAL).toBeLessThan(HITSTOP_SPECIAL);
    expect(BLOCKSTOP_DM).toBeLessThan(HITSTOP_DM);
  });
});

describe('Shake tier progression', () => {
  it('light < heavy < special < DM < KO', () => {
    expect(SHAKE_LIGHT).toBeLessThan(SHAKE_HEAVY);
    expect(SHAKE_HEAVY).toBeLessThan(SHAKE_SPECIAL);
    expect(SHAKE_SPECIAL).toBeLessThan(SHAKE_DM);
    expect(SHAKE_DM).toBeLessThan(SHAKE_KO);
  });

  it('shake duration: light < heavy < special < DM < KO', () => {
    expect(SHAKE_DURATION_LIGHT).toBeLessThan(SHAKE_DURATION_HEAVY);
    expect(SHAKE_DURATION_HEAVY).toBeLessThan(SHAKE_DURATION_SPECIAL);
    expect(SHAKE_DURATION_SPECIAL).toBeLessThan(SHAKE_DURATION_DM);
    expect(SHAKE_DURATION_DM).toBeLessThan(SHAKE_DURATION_KO);
  });

  it('getShakeIntensity returns DM for DM attacks', () => {
    expect(getShakeIntensity('DM_TEN_HA_OU', 80, false)).toBe(SHAKE_DM);
    expect(getShakeIntensity('SDM_OROCHINAGI', 100, false)).toBe(SHAKE_DM);
  });

  it('getShakeIntensity returns special for special attacks', () => {
    expect(getShakeIntensity('RYO_KOOU', 60, false)).toBe(SHAKE_SPECIAL);
  });

  it('getShakeIntensity returns heavy for heavy normals', () => {
    expect(getShakeIntensity('STAND_C', 50, false)).toBe(SHAKE_HEAVY);
    expect(getShakeIntensity('CLOSE_D', 60, false)).toBe(SHAKE_HEAVY);
  });

  it('getShakeIntensity returns light for light normals', () => {
    expect(getShakeIntensity('STAND_A', 20, false)).toBe(SHAKE_LIGHT);
  });

  it('getShakeIntensity returns counter for counter hits', () => {
    expect(getShakeIntensity('STAND_A', 20, true)).toBe(6); // SHAKE_COUNTER
  });

  it('getShakeDuration returns correct values', () => {
    expect(getShakeDuration('STAND_A')).toBe(SHAKE_DURATION_LIGHT);
    expect(getShakeDuration('STAND_C')).toBe(SHAKE_DURATION_HEAVY);
    expect(getShakeDuration('DM_TEN_HA_OU')).toBe(SHAKE_DURATION_DM);
    expect(getShakeDuration('RYO_KOOU')).toBe(SHAKE_DURATION_SPECIAL);
  });
});

describe('Spark tier progression', () => {
  it('spark size: light < heavy < special < DM < SDM', () => {
    expect(SPARK_SIZE_LIGHT).toBeLessThan(SPARK_SIZE_HEAVY);
    expect(SPARK_SIZE_HEAVY).toBeLessThan(SPARK_SIZE_SPECIAL);
    expect(SPARK_SIZE_SPECIAL).toBeLessThan(SPARK_SIZE_DM);
    expect(SPARK_SIZE_DM).toBeLessThan(SPARK_SIZE_SDM);
  });

  it('spark count: light < heavy < special < DM < SDM', () => {
    expect(SPARK_COUNT_LIGHT).toBeLessThan(SPARK_COUNT_HEAVY);
    expect(SPARK_COUNT_HEAVY).toBeLessThan(SPARK_COUNT_SPECIAL);
    expect(SPARK_COUNT_SPECIAL).toBeLessThan(SPARK_COUNT_DM);
    expect(SPARK_COUNT_DM).toBeLessThan(SPARK_COUNT_SDM);
  });

  it('getSparkType returns correct categories', () => {
    expect(getSparkType('STAND_A')).toBe('light');
    expect(getSparkType('STAND_C')).toBe('heavy');
    expect(getSparkType('RYO_KOOU')).toBe('special');
    expect(getSparkType('DM_TEN_HA_OU')).toBe('dm');
    expect(getSparkType('SDM_OROCHINAGI')).toBe('sdm');
    expect(getSparkType('THROW_FORWARD')).toBe('throw');
  });

  it('getSparkSizeScale returns correct values', () => {
    expect(getSparkSizeScale('STAND_A')).toBe(SPARK_SIZE_LIGHT);
    expect(getSparkSizeScale('STAND_C')).toBe(SPARK_SIZE_HEAVY);
    expect(getSparkSizeScale('RYO_KOOU')).toBe(SPARK_SIZE_SPECIAL);
    expect(getSparkSizeScale('DM_TEN_HA_OU')).toBe(SPARK_SIZE_DM);
    expect(getSparkSizeScale('SDM_OROCHINAGI')).toBe(SPARK_SIZE_SDM);
  });

  it('getSparkCount returns correct values', () => {
    expect(getSparkCount('STAND_A')).toBe(SPARK_COUNT_LIGHT);
    expect(getSparkCount('STAND_C')).toBe(SPARK_COUNT_HEAVY);
    expect(getSparkCount('DM_TEN_HA_OU')).toBe(SPARK_COUNT_DM);
    expect(getSparkCount('SDM_OROCHINAGI')).toBe(SPARK_COUNT_SDM);
  });
});

describe('Cross-tier feedback consistency', () => {
  it('heavier attacks have longer hitstop, more shake, bigger sparks', () => {
    // Light vs Heavy
    expect(getHitstopFrames('STAND_C')).toBeGreaterThan(getHitstopFrames('STAND_A'));
    expect(getShakeDuration('STAND_C')).toBeGreaterThan(getShakeDuration('STAND_A'));
    expect(getSparkSizeScale('STAND_C')).toBeGreaterThan(getSparkSizeScale('STAND_A'));
    expect(getSparkCount('STAND_C')).toBeGreaterThan(getSparkCount('STAND_A'));
  });

  it('DM has bigger feedback than special', () => {
    expect(getHitstopFrames('DM_TEN_HA_OU')).toBeGreaterThan(HITSTOP_LIGHT);
    expect(getShakeDuration('DM_TEN_HA_OU')).toBeGreaterThan(getShakeDuration('RYO_KOOU'));
    expect(getSparkCount('DM_TEN_HA_OU')).toBeGreaterThan(getSparkCount('RYO_KOOU'));
  });

  it('all shake intensities are non-negative', () => {
    expect(SHAKE_LIGHT).toBeGreaterThanOrEqual(0);
    expect(SHAKE_HEAVY).toBeGreaterThanOrEqual(0);
    expect(SHAKE_SPECIAL).toBeGreaterThanOrEqual(0);
    expect(SHAKE_DM).toBeGreaterThanOrEqual(0);
    expect(SHAKE_KO).toBeGreaterThanOrEqual(0);
  });

  it('all spark sizes are positive', () => {
    expect(SPARK_SIZE_LIGHT).toBeGreaterThan(0);
    expect(SPARK_SIZE_SDM).toBeGreaterThan(0);
  });

  it('all spark counts are positive', () => {
    expect(SPARK_COUNT_LIGHT).toBeGreaterThan(0);
    expect(SPARK_COUNT_SDM).toBeGreaterThan(0);
  });
});
