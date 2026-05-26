import { describe, it, expect } from 'vitest';
import { announcerOverlay } from '../src/rendering/announcerOverlay.js';

describe('announcerOverlay', () => {
  it('initially not active', () => {
    announcerOverlay.clear();
    expect(announcerOverlay.isActive()).toBe(false);
  });
  it('trigger makes it active', () => {
    announcerOverlay.clear();
    announcerOverlay.trigger('fight');
    expect(announcerOverlay.isActive()).toBe(true);
  });
  it('getCurrentEventType returns triggered type', () => {
    announcerOverlay.clear();
    announcerOverlay.trigger('ko');
    expect(announcerOverlay.getCurrentEventType()).toBe('ko');
  });
  it('tick eventually deactivates', () => {
    announcerOverlay.clear();
    announcerOverlay.trigger('fight');
    // fight duration = 50
    for (let i = 0; i < 60; i++) announcerOverlay.tick();
    expect(announcerOverlay.isActive()).toBe(false);
  });
  it('clear deactivates', () => {
    announcerOverlay.trigger('fight');
    announcerOverlay.clear();
    expect(announcerOverlay.isActive()).toBe(false);
  });
  it('queued events play after current', () => {
    announcerOverlay.clear();
    announcerOverlay.trigger('fight');
    announcerOverlay.trigger('ko');
    // Tick through fight (duration 50)
    for (let i = 0; i < 55; i++) announcerOverlay.tick();
    // ko should now be playing
    expect(announcerOverlay.isActive()).toBe(true);
    expect(announcerOverlay.getCurrentEventType()).toBe('ko');
  });
});
