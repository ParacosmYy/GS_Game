/**
 * All character pixel portrait regression tests
 * Consolidated from portraitBatch1-5 (5 files → 1 file)
 */
import { describe, it, expect } from 'vitest';
import { kyoPortrait } from '../src/rendering/portraits/kyoPortrait.js';
import { ioriPortrait } from '../src/rendering/portraits/ioriPortrait.js';
import { terryPortrait } from '../src/rendering/portraits/terryPortrait.js';
import { ralfPortrait } from '../src/rendering/portraits/ralfPortrait.js';
import { clarkPortrait } from '../src/rendering/portraits/clarkPortrait.js';
import { andyPortrait } from '../src/rendering/portraits/andyPortrait.js';
import { athenaPortrait } from '../src/rendering/portraits/athenaPortrait.js';
import { billyPortrait } from '../src/rendering/portraits/billyPortrait.js';
import { changPortrait } from '../src/rendering/portraits/changPortrait.js';
import { choiPortrait } from '../src/rendering/portraits/choiPortrait.js';
import { chrisPortrait } from '../src/rendering/portraits/chrisPortrait.js';
import { joePortrait } from '../src/rendering/portraits/joePortrait.js';
import { kasumiPortrait } from '../src/rendering/portraits/kasumiPortrait.js';
import { kdashPortrait } from '../src/rendering/portraits/kdashPortrait.js';
import { kimPortrait } from '../src/rendering/portraits/kimPortrait.js';
import { kulaPortrait } from '../src/rendering/portraits/kulaPortrait.js';
import { leonaPortrait } from '../src/rendering/portraits/leonaPortrait.js';
import { maiPortrait } from '../src/rendering/portraits/maiPortrait.js';
import { maryPortrait } from '../src/rendering/portraits/maryPortrait.js';
import { maturePortrait } from '../src/rendering/portraits/maturePortrait.js';
import { robertPortrait } from '../src/rendering/portraits/robertPortrait.js';
import { shermiePortrait } from '../src/rendering/portraits/shermiePortrait.js';
import { vicePortrait } from '../src/rendering/portraits/vicePortrait.js';
import { xiangfeiPortrait } from '../src/rendering/portraits/xiangfeiPortrait.js';
import { yamazakiPortrait } from '../src/rendering/portraits/yamazakiPortrait.js';
import { yashiroPortrait } from '../src/rendering/portraits/yashiroPortrait.js';
import { ryoHudPortrait, ryoSelectPortrait, ryoVsPortrait, RYO_SIZED_PORTRAITS } from '../src/rendering/portraits/ryoPortraits.js';

interface PortraitData { width: number; height: number; palette: unknown; }

const ALL_PORTRAITS: [string, PortraitData][] = [
  ['kyo', kyoPortrait], ['iori', ioriPortrait], ['terry', terryPortrait],
  ['ralf', ralfPortrait], ['clark', clarkPortrait], ['andy', andyPortrait],
  ['athena', athenaPortrait], ['billy', billyPortrait], ['chang', changPortrait],
  ['choi', choiPortrait], ['chris', chrisPortrait], ['joe', joePortrait],
  ['kasumi', kasumiPortrait], ['kdash', kdashPortrait], ['kim', kimPortrait],
  ['kula', kulaPortrait], ['leona', leonaPortrait], ['mai', maiPortrait],
  ['mary', maryPortrait], ['mature', maturePortrait], ['robert', robertPortrait],
  ['shermie', shermiePortrait], ['vice', vicePortrait], ['xiangfei', xiangfeiPortrait],
  ['yamazaki', yamazakiPortrait], ['yashiro', yashiroPortrait],
];

describe('All pixel portraits', () => {
  for (const [name, portrait] of ALL_PORTRAITS) {
    it(`${name} has width/height/palette`, () => {
      expect(portrait.width).toBeGreaterThan(0);
      expect(portrait.height).toBeGreaterThan(0);
      expect(portrait.palette).toBeDefined();
    });
  }

  it('ryoPortraits has hud/select/vs variants', () => {
    expect(ryoHudPortrait.width).toBeGreaterThan(0);
    expect(ryoSelectPortrait.width).toBeGreaterThan(0);
    expect(ryoVsPortrait.width).toBeGreaterThan(0);
  });

  it('RYO_SIZED_PORTRAITS has entries', () => {
    expect(Object.keys(RYO_SIZED_PORTRAITS).length).toBeGreaterThan(0);
  });
});
