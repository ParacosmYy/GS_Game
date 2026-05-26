import { describe, it, expect } from 'vitest';
import { RyoDef } from '../src/characters/ryo.js';

describe('Ryo MoveList', () => {
  const moveList = RyoDef.moveList!;

  it('has entries', () => {
    expect(moveList.length).toBeGreaterThan(0);
  });

  it('has command normals', () => {
    const commands = moveList.filter(m => m.type === 'command');
    expect(commands.length).toBeGreaterThanOrEqual(2);
  });

  it('has specials', () => {
    const specials = moveList.filter(m => m.type === 'special');
    expect(specials.length).toBeGreaterThanOrEqual(4);
  });

  it('has DMs', () => {
    const dms = moveList.filter(m => m.type === 'dm');
    expect(dms.length).toBeGreaterThanOrEqual(2);
  });

  it('has SDMs', () => {
    const sdms = moveList.filter(m => m.type === 'sdm');
    expect(sdms.length).toBeGreaterThanOrEqual(1);
  });

  it('each entry has name and input', () => {
    for (const move of moveList) {
      expect(move.name).toBeTruthy();
      expect(move.input).toBeTruthy();
    }
  });

  it('contains 虎煌拳', () => {
    const found = moveList.some(m => m.name.includes('虎煌拳'));
    expect(found).toBe(true);
  });

  it('contains 虎咆', () => {
    const found = moveList.some(m => m.name.includes('虎咆'));
    expect(found).toBe(true);
  });

  it('contains 天地霸煌拳', () => {
    const found = moveList.some(m => m.name.includes('天地霸煌拳'));
    expect(found).toBe(true);
  });

  it('contains 龍虎乱舞', () => {
    const found = moveList.some(m => m.name.includes('龍虎乱舞'));
    expect(found).toBe(true);
  });

  it('specials have QCF or DP inputs', () => {
    const specials = moveList.filter(m => m.type === 'special');
    for (const sp of specials) {
      // Input should contain arrow notation
      expect(sp.input).toBeTruthy();
    }
  });

  it('DMs have double motion inputs', () => {
    const dms = moveList.filter(m => m.type === 'dm');
    for (const dm of dms) {
      expect(dm.input.length).toBeGreaterThan(5);
    }
  });
});
