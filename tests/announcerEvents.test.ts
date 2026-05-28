/**
 * Announcer Events Registry Regression Test
 * Verifies all 14 announcer event types have valid configuration.
 */
import { describe, it, expect } from 'vitest';
import { ANNOUNCER_EVENTS, type AnnouncerEventType } from '../src/audio/announcer.js';

const ALL_EVENTS: AnnouncerEventType[] = [
  'round_start', 'ready', 'fight', 'ko', 'perfect', 'time_up',
  'you_win', 'counter_hit', 'max_activation', 'double_ko',
  'draw_game', 'first_attack', 'stun', 'guard_crush',
];

describe('Announcer events registry', () => {
  it('has exactly 14 event types', () => {
    expect(Object.keys(ANNOUNCER_EVENTS).length).toBe(14);
  });

  it('all expected event types exist', () => {
    for (const event of ALL_EVENTS) {
      expect(ANNOUNCER_EVENTS[event], `${event}`).toBeDefined();
    }
  });

  it('all events have non-empty text', () => {
    for (const event of ALL_EVENTS) {
      expect(ANNOUNCER_EVENTS[event].text.length, `${event}.text`).toBeGreaterThan(0);
    }
  });

  it('all events have positive duration', () => {
    for (const event of ALL_EVENTS) {
      expect(ANNOUNCER_EVENTS[event].duration, `${event}.duration`).toBeGreaterThan(0);
    }
  });

  it('all events have hex fillColor', () => {
    for (const event of ALL_EVENTS) {
      expect(ANNOUNCER_EVENTS[event].fillColor, `${event}.fillColor`).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it('all events have hex glowColor', () => {
    for (const event of ALL_EVENTS) {
      expect(ANNOUNCER_EVENTS[event].glowColor, `${event}.glowColor`).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it('all events have positive fontSize', () => {
    for (const event of ALL_EVENTS) {
      expect(ANNOUNCER_EVENTS[event].fontSize, `${event}.fontSize`).toBeGreaterThan(0);
    }
  });

  it('all events have non-empty soundId', () => {
    for (const event of ALL_EVENTS) {
      expect(ANNOUNCER_EVENTS[event].soundId.length, `${event}.soundId`).toBeGreaterThan(0);
    }
  });
});

describe('Announcer event hierarchy — KOF2002 calibrated', () => {
  it('KO has the largest fontSize (most dramatic)', () => {
    const koSize = ANNOUNCER_EVENTS.ko.fontSize;
    for (const event of ALL_EVENTS) {
      if (event === 'ko') continue;
      expect(koSize, `KO > ${event}`).toBeGreaterThanOrEqual(ANNOUNCER_EVENTS[event].fontSize);
    }
  });

  it('PERFECT has larger fontSize than COUNTER HIT', () => {
    expect(ANNOUNCER_EVENTS.perfect.fontSize).toBeGreaterThan(ANNOUNCER_EVENTS.counter_hit.fontSize);
  });

  it('FIGHT has large fontSize for impact', () => {
    expect(ANNOUNCER_EVENTS.fight.fontSize).toBeGreaterThanOrEqual(60);
  });

  it('KO has longest duration (most lingering)', () => {
    const koDur = ANNOUNCER_EVENTS.ko.duration;
    for (const event of ['fight', 'counter_hit', 'max_activation', 'first_attack'] as AnnouncerEventType[]) {
      expect(koDur, `KO duration > ${event}`).toBeGreaterThan(ANNOUNCER_EVENTS[event].duration);
    }
  });

  it('special events use distinct colors from normal events', () => {
    // KO uses red, PERFECT uses gold, MAX uses green — all different
    const koColor = ANNOUNCER_EVENTS.ko.fillColor;
    const perfectColor = ANNOUNCER_EVENTS.perfect.fillColor;
    const maxColor = ANNOUNCER_EVENTS.max_activation.fillColor;
    expect(new Set([koColor, perfectColor, maxColor]).size).toBe(3);
  });

  it('ready event exists for READY? announce', () => {
    expect(ANNOUNCER_EVENTS.ready).toBeDefined();
    expect(ANNOUNCER_EVENTS.ready.text).toContain('READY');
  });

  it('stun and guard_crush have unique text', () => {
    expect(ANNOUNCER_EVENTS.stun.text).not.toBe(ANNOUNCER_EVENTS.guard_crush.text);
  });
});
