/**
 * Terry & Kim Content Package Tests
 *
 * Verifies that Terry and Kim content packages have complete
 * move lists, cancel paths, and consistent data structures.
 */
import { describe, it, expect } from 'vitest';

// ── Terry Commands ─────────────────────────────────────────────
describe('Terry content package — commands', () => {
  it('has complete move list with all categories', async () => {
    const { TERRY_MOVE_LIST } = await import('../src/content/characters/terry/commands/terryCommands.js');
    const categories = new Set(TERRY_MOVE_LIST.map(m => m.type));
    expect(categories.has('command')).toBe(true);
    expect(categories.has('special')).toBe(true);
    expect(categories.has('dm')).toBe(true);
    expect(categories.has('sdm')).toBe(true);
    expect(categories.has('hsdm')).toBe(true);
    expect(TERRY_MOVE_LIST.length).toBeGreaterThanOrEqual(10);
  });

  it('all special moves have attackTypeKey', async () => {
    const { TERRY_MOVE_LIST } = await import('../src/content/characters/terry/commands/terryCommands.js');
    const specials = TERRY_MOVE_LIST.filter(m => m.type === 'special');
    for (const s of specials) {
      expect(s.attackTypeKey, `${s.name} should have attackTypeKey`).toBeTruthy();
    }
  });

  it('has win quotes', async () => {
    const { TERRY_WIN_QUOTES } = await import('../src/content/characters/terry/commands/terryCommands.js');
    expect(TERRY_WIN_QUOTES.length).toBeGreaterThanOrEqual(3);
  });

  it('has available actions including all basics', async () => {
    const { TERRY_AVAILABLE_ACTIONS } = await import('../src/content/characters/terry/commands/terryCommands.js');
    const required = ['idle', 'walk_forward', 'crouch', 'jump_up', 'stand_a', 'hitstun', 'knockdown', 'win'];
    for (const r of required) {
      expect(TERRY_AVAILABLE_ACTIONS, `should include ${r}`).toContain(r);
    }
  });
});

// ── Kim Commands ───────────────────────────────────────────────
describe('Kim content package — commands', () => {
  it('has complete move list with all categories', async () => {
    const { KIM_MOVE_LIST } = await import('../src/content/characters/kim/commands/kimCommands.js');
    const categories = new Set(KIM_MOVE_LIST.map(m => m.type));
    expect(categories.has('command')).toBe(true);
    expect(categories.has('special')).toBe(true);
    expect(categories.has('dm')).toBe(true);
    expect(categories.has('sdm')).toBe(true);
    expect(categories.has('hsdm')).toBe(true);
    expect(KIM_MOVE_LIST.length).toBeGreaterThanOrEqual(10);
  });

  it('all special moves have attackTypeKey', async () => {
    const { KIM_MOVE_LIST } = await import('../src/content/characters/kim/commands/kimCommands.js');
    const specials = KIM_MOVE_LIST.filter(m => m.type === 'special');
    for (const s of specials) {
      expect(s.attackTypeKey, `${s.name} should have attackTypeKey`).toBeTruthy();
    }
  });

  it('has win quotes', async () => {
    const { KIM_WIN_QUOTES } = await import('../src/content/characters/kim/commands/kimCommands.js');
    expect(KIM_WIN_QUOTES.length).toBeGreaterThanOrEqual(3);
  });

  it('has available actions including all basics', async () => {
    const { KIM_AVAILABLE_ACTIONS } = await import('../src/content/characters/kim/commands/kimCommands.js');
    const required = ['idle', 'walk_forward', 'crouch', 'jump_up', 'stand_a', 'hitstun', 'knockdown', 'win'];
    for (const r of required) {
      expect(KIM_AVAILABLE_ACTIONS, `should include ${r}`).toContain(r);
    }
  });
});

// ── Terry Moves ────────────────────────────────────────────────
describe('Terry content package — moves', () => {
  it('has all required categories of moves', async () => {
    const { TERRY_MOVES } = await import('../src/content/characters/terry/moves/terryMoves.js');
    const cats = new Set(TERRY_MOVES.map(m => m.category));
    expect(cats.has('command_normal')).toBe(true);
    expect(cats.has('special')).toBe(true);
    expect(cats.has('dm')).toBe(true);
    expect(cats.has('sdm')).toBe(true);
    expect(cats.has('hsdm')).toBe(true);
  });

  it('all moves have at least one version', async () => {
    const { TERRY_MOVES } = await import('../src/content/characters/terry/moves/terryMoves.js');
    for (const m of TERRY_MOVES) {
      expect(m.versions.length, `${m.key} should have versions`).toBeGreaterThanOrEqual(1);
    }
  });

  it('query functions work', async () => {
    const mod = await import('../src/content/characters/terry/moves/terryMoves.js');
    const pw = mod.getMoveByKey('TERRY_POWER_WAVE');
    expect(pw).toBeTruthy();
    expect(pw!.nameEn).toBe('Power Wave');
    const found = mod.getMoveByAttackType('TERRY_BURN_KNUCKLE');
    expect(found).toBeTruthy();
    expect(found!.key).toBe('TERRY_BURN_KNUCKLE');
    const specials = mod.getMovesByCategory('special');
    expect(specials.length).toBeGreaterThanOrEqual(5);
    const proj = mod.getProjectileMoves();
    expect(proj.length).toBeGreaterThanOrEqual(1);
    const inv = mod.getInvincibleMoves();
    expect(inv.length).toBeGreaterThanOrEqual(2); // Power Dunk + Rising Tackle
  });

  it('version entries have valid multipliers', async () => {
    const { TERRY_MOVES } = await import('../src/content/characters/terry/moves/terryMoves.js');
    for (const m of TERRY_MOVES) {
      for (const v of m.versions) {
        expect(v.damageMultiplier, `${m.key} ${v.version} multiplier`).toBeGreaterThan(0);
      }
    }
  });
});

// ── Kim Moves ──────────────────────────────────────────────────
describe('Kim content package — moves', () => {
  it('has all required categories of moves', async () => {
    const { KIM_MOVES } = await import('../src/content/characters/kim/moves/kimMoves.js');
    const cats = new Set(KIM_MOVES.map(m => m.category));
    expect(cats.has('command_normal')).toBe(true);
    expect(cats.has('special')).toBe(true);
    expect(cats.has('dm')).toBe(true);
    expect(cats.has('sdm')).toBe(true);
    expect(cats.has('hsdm')).toBe(true);
  });

  it('all moves have at least one version', async () => {
    const { KIM_MOVES } = await import('../src/content/characters/kim/moves/kimMoves.js');
    for (const m of KIM_MOVES) {
      expect(m.versions.length, `${m.key} should have versions`).toBeGreaterThanOrEqual(1);
    }
  });

  it('query functions work', async () => {
    const mod = await import('../src/content/characters/kim/moves/kimMoves.js');
    const hz = mod.getMoveByKey('KIM_HIENZAN');
    expect(hz).toBeTruthy();
    expect(hz!.nameEn).toContain('Hienzan');
    const found = mod.getMoveByAttackType('KIM_HANGETSU');
    expect(found).toBeTruthy();
    expect(found!.key).toBe('KIM_HANGETSU');
    const specials = mod.getMovesByCategory('special');
    expect(specials.length).toBeGreaterThanOrEqual(4);
    const inv = mod.getInvincibleMoves();
    expect(inv.length).toBeGreaterThanOrEqual(1); // Hienzan
  });

  it('version entries have valid multipliers', async () => {
    const { KIM_MOVES } = await import('../src/content/characters/kim/moves/kimMoves.js');
    for (const m of KIM_MOVES) {
      for (const v of m.versions) {
        expect(v.damageMultiplier, `${m.key} ${v.version} multiplier`).toBeGreaterThan(0);
      }
    }
  });
});

// ── Terry Cancel Paths ─────────────────────────────────────────
describe('Terry content package — cancel paths', () => {
  it('has cancel routes for all cancel types', async () => {
    const { TERRY_CANCEL_PATHS } = await import('../src/content/characters/terry/cancelPaths.js');
    const types = new Set(TERRY_CANCEL_PATHS.map(r => r.cancelType));
    expect(types.has('normal')).toBe(true);
    expect(types.has('rapid')).toBe(true);
    expect(types.has('super')).toBe(true);
    expect(types.has('free')).toBe(true);
  });

  it('stand normals can cancel into specials', async () => {
    const { getCancelTargets } = await import('../src/content/characters/terry/cancelPaths.js');
    const targets = getCancelTargets('STAND_C');
    expect(targets).toContain('TERRY_BURN_KNUCKLE');
    expect(targets).toContain('TERRY_POWER_WAVE');
  });

  it('specials can super cancel into DMs', async () => {
    const { getCancelTargets } = await import('../src/content/characters/terry/cancelPaths.js');
    const targets = getCancelTargets('TERRY_POWER_WAVE');
    expect(targets.some(t => t.startsWith('DM_') || t.startsWith('SDM_'))).toBe(true);
  });

  it('validation works for valid and invalid cancels', async () => {
    const { validateCancel } = await import('../src/content/characters/terry/cancelPaths.js');
    const valid = validateCancel('STAND_C', 'TERRY_POWER_WAVE', true, 0, false, 0, 0, 0);
    expect(valid.valid).toBe(true);
    const invalid = validateCancel('STAND_C', 'NONEXISTENT', true, 0, false, 0, 0, 0);
    expect(invalid.valid).toBe(false);
  });

  it('free cancel requires MAX mode', async () => {
    const { validateCancel } = await import('../src/content/characters/terry/cancelPaths.js');
    const noMax = validateCancel('TERRY_POWER_WAVE', 'TERRY_BURN_KNUCKLE', true, 0, false, 0, 0, 0);
    expect(noMax.valid).toBe(false);
    const withMax = validateCancel('TERRY_POWER_WAVE', 'TERRY_BURN_KNUCKLE', true, 0, true, 100, 100, 0);
    expect(withMax.valid).toBe(true);
  });
});

// ── Kim Cancel Paths ───────────────────────────────────────────
describe('Kim content package — cancel paths', () => {
  it('has cancel routes including rekka type', async () => {
    const { TERRY_CANCEL_PATHS } = await import('../src/content/characters/terry/cancelPaths.js');
    const { KIM_CANCEL_PATHS } = await import('../src/content/characters/kim/cancelPaths.js');
    const kimTypes = new Set(KIM_CANCEL_PATHS.map(r => r.cancelType));
    expect(kimTypes.has('rekka')).toBe(true); // Sanren
    expect(kimTypes.has('normal')).toBe(true);
    expect(kimTypes.has('super')).toBe(true);
    expect(kimTypes.has('free')).toBe(true);
  });

  it('stand normals can cancel into Kim specials', async () => {
    const { getCancelTargets } = await import('../src/content/characters/kim/cancelPaths.js');
    const targets = getCancelTargets('CLOSE_C');
    expect(targets).toContain('KIM_HIENZAN');
    expect(targets).toContain('KIM_HANGETSU');
  });

  it('Sanren rekka chain is valid', async () => {
    const { findCancelRoute } = await import('../src/content/characters/kim/cancelPaths.js');
    const route = findCancelRoute('KIM_SANREN', 'KIM_SANREN');
    expect(route).toBeTruthy();
    expect(route!.cancelType).toBe('rekka');
  });

  it('specials can super cancel into DMs', async () => {
    const { getCancelTargets } = await import('../src/content/characters/kim/cancelPaths.js');
    const targets = getCancelTargets('KIM_HIENZAN');
    expect(targets).toContain('DM_PHOENIX_KICK');
    expect(targets).toContain('DM_PHOENIX_HITEN');
  });

  it('validation works correctly', async () => {
    const { validateCancel } = await import('../src/content/characters/kim/cancelPaths.js');
    const valid = validateCancel('STAND_C', 'KIM_HIENZAN', true, 0, false, 0, 0, 0);
    expect(valid.valid).toBe(true);
    const invalid = validateCancel('STAND_C', 'NONEXISTENT', true, 0, false, 0, 0, 0);
    expect(invalid.valid).toBe(false);
  });
});

// ── Barrel Export Completeness ─────────────────────────────────
describe('Terry/Kim barrel export completeness', () => {
  it('Terry index exports all expected symbols', async () => {
    const mod = await import('../src/content/characters/terry/index.js');
    expect(mod.TERRY_MOVE_LIST).toBeTruthy();
    expect(mod.TERRY_MOVES).toBeTruthy();
    expect(mod.TERRY_CANCEL_PATHS).toBeTruthy();
    expect(mod.TERRY_HIT_EFFECTS).toBeTruthy();
    expect(typeof mod.registerTerryAudio).toBe('function');
    expect(typeof mod.findCancelRoute).toBe('function');
  });

  it('Kim index exports all expected symbols', async () => {
    const mod = await import('../src/content/characters/kim/index.js');
    expect(mod.KIM_MOVE_LIST).toBeTruthy();
    expect(mod.KIM_MOVES).toBeTruthy();
    expect(mod.KIM_CANCEL_PATHS).toBeTruthy();
    expect(mod.KIM_HIT_EFFECTS).toBeTruthy();
    expect(typeof mod.registerKimAudio).toBe('function');
    expect(typeof mod.findCancelRoute).toBe('function');
  });

  it('characters/index.ts exports Terry and Kim', async () => {
    const mod = await import('../src/content/characters/index.js');
    // Terry
    expect(mod.TERRY_MOVE_LIST).toBeTruthy();
    expect(mod.TERRY_CANCEL_PATHS).toBeTruthy();
    expect(mod.TERRY_HIT_EFFECTS).toBeTruthy();
    // Kim
    expect(mod.KIM_MOVE_LIST).toBeTruthy();
    expect(mod.KIM_CANCEL_PATHS).toBeTruthy();
    expect(mod.KIM_HIT_EFFECTS).toBeTruthy();
  });
});
