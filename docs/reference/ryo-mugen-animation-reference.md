# MUGEN Animation Reference for Ryo Sakazaki

## Source

Animation structure data extracted from `references/mugen/chars/warusaki3/cvsryo` (Warusaki3's CVS Ryo). This is a Capcom vs. SNK style Ryo, not a direct KOF2002 Ryo, but the animation structure, frame counts, timing patterns, and collision box ratios are representative of 2D fighting game engineering practice.

Also referenced: `references/mugen/ikemen-go-ready/chars/kfm/` (Kung Fu Man, the MUGEN default character) for comparison.

## Available Characters in references/mugen/

| Directory | Character | Files |
|-----------|-----------|-------|
| `chars/warusaki3/cvsryo` | Ryo Sakazaki (CVS style) | .air, .cns, .cmd, .sff, .snd |
| `chars/warusaki3/cvskyo` | Kyo Kusanagi (CVS style) | .air, .cns, .cmd, .sff, .snd |
| `chars/warusaki3/cvsiori` | Iori Yagami (CVS style) | Not verified, likely present |
| `chars/warusaki3/cvsryu` | Ryu (CVS style) | For comparison |
| `chars/Angel/` | Angel (KOF2002UM) | In archive |
| `chars/Clark/` | Clark (KOF) | In archive |
| `ikemen-go-ready/chars/kfm/` | Kung Fu Man (default) | .air, .cns, .cmd |

Note: Characters are stored as archives (.zip, .rar). Warusaki3 is a single zip containing ~40 CVS-style characters including cvsryo.

## MUGEN Animation Action Number Mapping

Standard MUGEN action numbers (shared by cvsryo and KFM):

| Action # | Name | Frames | Total Ticks |
|----------|------|--------|-------------|
| 0 | Standing idle | 15 | 135 |
| 5 | Turn | 3 | 12 |
| 6 | Crouch turn | 3 | 12 |
| 10 | Stand to crouch | 2 | 4 |
| 11 | Crouching | 0* | 0* |
| 12 | Crouch to stand | 2 | 4 |
| 20 | Walk forward | 10 | 50 |
| 21 | Walk backward | 10 | 50 |
| 40 | Jump start | 1 | 2 |
| 42 | Jump forward | 3+ | 10+ |
| 100 | Run/dash forward | 9 | 43 |
| 105 | Hop backward | 3 | 9 |
| **200** | **Stand light punch (far)** | **5** | **11** |
| 201 | Stand light punch (close) | 5 | 10 |
| **210** | **Stand medium punch** | **8** | **21** |
| 211 | Stand medium punch (close) | 7 | 19 |
| **220** | **Stand heavy punch** | **9** | **33** |
| 230 | Stand light kick (far) | 6 | 17 |
| 231 | Stand light kick (close) | 6 | 17 |
| **240** | **Stand medium kick** | **8** | **21** |
| **250** | **Stand heavy kick** | **8** | **23** |
| 300 | Dodge | 9 | 34 |
| **400** | **Crouch light punch** | **5** | **11** |
| **410** | **Crouch medium punch** | **5** | **16** |
| 420 | Crouch heavy punch | 8 | 28 |
| **430** | **Crouch light kick** | **5** | **11** |
| **440** | **Crouch medium kick** | **8** | **22** |
| **450** | **Crouch heavy kick** | **7** | **31** |
| 600 | Jump light punch | 10 | 25 |
| 610 | Jump medium punch | 8 | 20 |
| 620 | Jump heavy punch | 6 | 19 |
| 630 | Jump light kick | 11 | 30 |
| 640 | Jump medium kick | 7 | 22 |
| 650 | Jump heavy kick | 7 | 19 |
| 800 | Throw attempt | 12 | 24 |
| 1000 | Ko'ou Ken startup | 9 | 40 |
| 1100 | Kohou (DP) A version | 10 | 35 |
| 1200 | Hien Shippu Kyaku | 4 | 18 |
| 1300 | Zanretsu Ken (multi-hit) | 16 | 48 |
| 1400 | Hio Hacker (command normal) | 7 | 25 |
| 1500 | CD attack | 9 | 20 |

(*Note: Action 11 has 0 counted frames because its tick value is -1, meaning "display forever until changed".)

## Frame Timing Patterns

### Frame line format in .air files
```
sprite_group, sprite_index, x_offset, y_offset, ticks
```
- 1 tick = 1 frame at 60 FPS
- tick value of -1 = display until state changes (used for crouch/stance loops)
- `Loopstart` keyword = repeat from this point

### Light attack timing (Actions 200, 400, 430)
- **Frame count**: 5 frames total
- **Tick breakdown**: ~[3, 1, 2, 3, 2] (startup, active1, active2, recovery1, recovery2)
- **Startup ticks**: 3 (first frame before Clsn1 appears)
- **Active ticks**: ~2-3 (frames with Clsn1)
- **Recovery ticks**: ~5 (frames after last active)
- **Total duration**: 11 ticks (~183ms at 60fps)

### Medium attack timing (Actions 210, 410)
- **Frame count**: 5-8 frames
- **Startup ticks**: ~3-5
- **Active ticks**: ~2-3
- **Recovery ticks**: ~9-13
- **Total duration**: 16-21 ticks (~267-350ms)

### Heavy attack timing (Actions 220, 420, 450)
- **Frame count**: 7-9 frames
- **Startup ticks**: ~5-8
- **Active ticks**: ~3-5
- **Recovery ticks**: ~15-19
- **Total duration**: 23-33 ticks (~383-550ms)

### Special move timing
- **Ko'ou Ken (projectile)**: 40 total ticks (startup 10, then projectile separates)
- **Kohou (DP)**: 35 total ticks, active frames at positions 2-4
- **Hien Shippu Kyaku**: 18 total ticks, multi-phase
- **Zanretsu Ken**: 48 total ticks, 8 active phases across 16 frames

### Idle/Walk timing
- **Standing idle**: 15 frames x 9 ticks each = 135 ticks (~2.25s per cycle)
- **Walk forward**: 10 frames x 5 ticks each = 50 ticks (~0.83s per cycle)
- **Run forward**: 9 frames, varying ticks (3-5), total 43 ticks

## Collision Box Analysis

### MUGEN collision box types
- **Clsn1**: Attack box (red) - only present on active frames
- **Clsn2**: Defense/hurt box (blue) - present on most frames
- **Clsn2Default**: Default hurt box applied to all frames unless overridden

### Attack box (Clsn1) sizes by attack type

| Attack Type | Typical Width | Typical Height | Width:Height Ratio |
|-------------|--------------|----------------|-------------------|
| Light punch | 40-48 px | 9-18 px | ~3:1 to 5:1 |
| Medium punch | 42 px | 13-28 px | ~1.5:1 to 3:1 |
| Heavy punch | 38 px | 26 px | ~1.5:1 |
| Light kick | 31-40 px | 19-20 px | ~2:1 |
| Medium kick | 52-55 px | 15-34 px | ~1.5:1 to 3.5:1 |
| Heavy kick | 54-56 px | 34 px | ~1.6:1 |
| Jump light | 25 px | 19-22 px | ~1.2:1 |
| Jump heavy | 33-82 px | 26-27 px | ~1.3:1 to 3:1 |

Key observation: **Light attacks have very flat, wide attack boxes** (high width:height ratio), while **heavy attacks have taller, more square boxes**. This matches the visual reach of light jabs (horizontal) versus heavy swings (arc-like).

### Hurt box (Clsn2) sizes

Ryo's hurt box structure is consistently 3 boxes per frame:
1. **Head box**: ~18-20 px wide, ~19-22 px tall
2. **Body box**: ~41-44 px wide, ~55-90 px tall (dominant box)
3. **Extension box**: varies (arm/leg during attack)

Total hurt box coverage:
- **Standing**: ~43 px wide x ~88 px tall (body only)
- **Crouching**: ~48 px wide x ~58 px tall
- **Jumping**: ~36-38 px wide x ~76-79 px tall

### Attack-to-Hurt box ratio

| Attack | Clsn1 Avg (WxH) | Clsn2 Avg (WxH) | Clsn1/Clsn2 Width Ratio |
|--------|-----------------|-----------------|-------------------------|
| Stand LP | 48x9 | 34x48 | 1.41 |
| Stand MP | 42x13 | 41x37 | 1.02 |
| Stand HP | 38x26 | 41x41 | 0.93 |
| Stand LK | 40x20 | 35x48 | 1.14 |
| Stand MK | 52x16 | 32x39 | 1.63 |
| Stand HK | 55x34 | 33x39 | 1.67 |
| Crouch LP | 40x10 | 37x35 | 1.08 |
| Crouch LK | 48x11 | 38x33 | 1.26 |

Key pattern: **Light attacks have attack boxes slightly wider than hurt boxes, making them safe pokes. Heavy attacks have attack boxes comparable to or slightly narrower than hurt boxes, making them committal.**

## Physics Constants (CVS Ryo vs KFM)

| Parameter | CVS Ryo | KFM | Our Project Notes |
|-----------|---------|-----|-------------------|
| walk.fwd | 2.67 | 2.4 | Ryo is slightly faster |
| walk.back | -1.6 | -2.2 | Ryo retreats slower |
| run.fwd | 4.93, 0 | 4.6, 0 | Ryo dashes faster |
| run.back | -4.8, -4.5 | -4.5, -3.8 | Similar |
| jump.neu | 0, -9.33 | 0, -8.4 | Ryo jumps higher |
| jump.fwd | 2.47 | 2.5 | Similar |
| yaccel | 0.57 | 0.44 | Ryo falls faster |
| stand.friction | 0.85 | 0.85 | Same |
| crouch.friction | 0.82 | 0.82 | Same |
| ground.back | 15 | 15 | Same |
| ground.front | 15 | 16 | Nearly same |
| attack.dist | 160 | 160 | Same |
| airjuggle | 15 | 15 | Same |

## HitDef Timing Patterns (from .cns)

| State | Anim Type | Damage Base | Hit Pause | Ground Hit Time | Guard Ctrl Time |
|-------|-----------|-------------|-----------|-----------------|-----------------|
| 200 (S.LP) | Light | 21 | ~4-5 | 10+ | 11 |
| 210 (S.MP) | Medium | 63 | ~5-6 | 14+ | 14 |
| 220 (S.HP) | Heavy | 98 | ~6-7 | 17+ | 17 |
| 230 (S.LK) | Light | 35 | ~4-5 | 10+ | 11 |
| 400 (C.LP) | Light | 21 | ~4-5 | 10+ | 11 |
| 410 (C.MP) | Medium | 63 | ~5-6 | 14+ | 14 |
| 430 (C.LK) | Light | 28 | ~4-5 | 10+ | 11 |
| 600 (J.LP) | Light | 35 | ~4-5 | 9+ | 12 |

Note: Warusaki3 characters use variable-based damage scaling (`fvar(10)`) and groove modifiers (`var(16)`). The base damage values shown are the raw numbers before scaling.

## Mapping MUGEN Timing to Our FRAME_DATA

### Startup frames
Our FRAME_DATA counts startup as frames before the first active frame (inclusive of first active frame in KOF convention). MUGEN counts the frame where Clsn1 first appears.

| Move | MUGEN Startup (ticks to first Clsn1) | Our FRAME_DATA startup | Comparison |
|------|---------------------------------------|----------------------|------------|
| Stand LP | 3 ticks (~3 frames) | 6 | Our value is higher; KOF convention counts differently |
| Stand MP | 3 ticks (~3 frames) | 7 | Reasonable for CVS vs KOF |
| Stand HP | 5 ticks (~5 frames) | 7 | Close |
| Crouch LP | 3 ticks (~3 frames) | 5 | Close |
| Crouch LK | 3 ticks (~3 frames) | 5 | Close |
| Jump LP | 3 ticks (~3 frames) | 3 | Match |

The MUGEN cvsryo data uses CVS-style pacing which is slightly faster than KOF2002. Our FRAME_DATA uses KOF2002 values from SuperCombo Wiki, which naturally have higher startup values for normals.

### Active/Recovery ratios
Pattern from MUGEN data:
- **Light**: active ~2-3 ticks, recovery ~5 ticks (ratio ~0.4-0.6)
- **Medium**: active ~2-3 ticks, recovery ~9-13 ticks (ratio ~0.15-0.3)
- **Heavy**: active ~3-5 ticks, recovery ~15-19 ticks (ratio ~0.16-0.33)

Our FRAME_DATA ratios:
- **Light**: active 3-5, recovery 5-7 (ratio ~0.4-1.0)
- **Heavy**: active 3-8, recovery 11-20 (ratio ~0.27-0.4)

Our ratios are in the same general range, confirming our timing data is reasonable.

## Recommendations for Our Ryo Implementation

1. **Attack box shapes**: Use flat, wide boxes for light pokes (3:1+ width:height) and more square boxes for heavy attacks. Our current hitbox system should reflect this shape difference.

2. **Startup alignment**: Our FRAME_DATA startup values (from KOF2002 frame data) are appropriate for KOF pacing. Do not reduce them to match the faster CVS-style MUGEN data.

3. **Frame tick rates**: MUGEN uses uniform tick rates within an animation (e.g., all idle frames at 9 ticks). Our animation manifest should aim for similar consistency.

4. **Hurt box stability**: MUGEN hurt boxes change very little between frames of the same animation. Only attack animations show significant hurt box shifts. Our implementation should similarly keep hurt boxes stable during locomotion.

5. **Total animation duration**: Use MUGEN total tick counts as sanity checks. If our animations are dramatically shorter or longer, investigate.

6. **Walk/run speed**: CVS Ryo walks at 2.67 px/frame and runs at 4.93 px/frame. Our implementation should be in this range (after coordinate system scaling).

7. **Gravity**: Ryo's yaccel of 0.57 is notably higher than KFM's 0.44, making Ryo fall faster. Our gravity constant should be tuned per this pattern.

8. **Juggle system**: MUGEN standard `airjuggle = 15` points. Our juggle point system should produce similar combo limits.
