# Sprite Pipeline Requirements: SFF → Real Pixel Art

## 1. Problem Statement

Current character sprites are **procedural pixel arrays** (`SourcePixelFrame { pixels: number[][] }`), programmatically generated with color palettes. They look blocky and lack SNK/KOF authenticity. The rendering infrastructure (`baseHighResRenderer.ts`, `pixelFrameRenderer.ts`) is solid — the bottleneck is **asset quality**, not engine capability.

**Solution**: Extract real pixel art from M.U.G.E.N SFF files (already validated with KFM), parse AIR animation data, and feed real PNG sprites into the existing Canvas 2D pipeline.

## 2. Pipeline Overview

```
SFF file → sff-extractor → individual PNG sprites
AIR file → air-parser   → animation definitions (frames + timing + hitboxes)
     ↓                         ↓
     └─────→ spriteManifest.json ←─────┘
                    ↓
         runtime spriteLoader.ts
                    ↓
     createHighResRenderer() with PNG support
                    ↓
         existing Canvas 2D draw pipeline
```

## 3. Functional Requirements

### 3.1 SFF Extraction Tool (`tools/extractSprites.ts`)

**Input**: SFF v2 file path
**Output**: Directory of PNG sprites + metadata JSON

- Reuse existing `references/mugen/sff-extractor/` library
- Extract all sprites as PNG files named `{group}_{index}.png`
- Generate `sprites.json` metadata:
  ```json
  {
    "characterId": "kfm",
    "totalSprites": 281,
    "sprites": [
      { "group": 0, "index": 0, "file": "00000_0000.png", "width": 47, "height": 106 },
      ...
    ]
  }
  ```

### 3.2 AIR Parser Tool (`tools/parseAir.ts`)

**Input**: AIR file path
**Output**: Animation JSON manifest

- Parse `[Begin Action N]` blocks
- Extract per-frame data: `group, index, offsetX, offsetY, duration`
- Extract `Clsn1` (attack hitboxes) and `Clsn2` (hurtboxes)
- Handle `Loopstart` markers
- Handle `-1` group (blank/invisible frames)
- Handle `H` flag (horizontal flip)
- Output `animations.json`:
  ```json
  {
    "characterId": "kfm",
    "animations": {
      "0": {
        "name": "Standing",
        "loopStart": -1,
        "frames": [
          {
            "group": 0, "index": 0, "offsetX": 0, "offsetY": 0, "duration": 10,
            "hurtboxes": [[-13,0,16,-79],[5,-79,-7,-93]],
            "attackBoxes": null
          },
          ...
        ]
      },
      ...
    }
  }
  ```

### 3.3 MUGEN→KOF State Mapping

Map MUGEN Action numbers to KOF2002 `FighterState`:

| MUGEN Action | KOF State | Description |
|---|---|---|
| 0 | IDLE | Standing |
| 5 | IDLE (turn) | Turning |
| 10 | CROUCH (transition) | Stand→Crouch |
| 11 | CROUCH | Crouching |
| 12 | CROUCH (transition) | Crouch→Stand |
| 20 | WALK_FORWARD | Walk Forward |
| 21 | WALK_BACKWARD | Walk Backward |
| 40 | JUMP (start) | Jump Start |
| 41 | JUMP | Jump Up |
| 42 | JUMP (fwd) | Jump Forward |
| 43 | JUMP (back) | Jump Backward |
| 47 | IDLE (land) | Jump Landing |
| 100 | RUN | Run Forward |
| 105 | BACKDASH | Hop Backward |
| 170 | LOSE | Lose Time Over |
| 181 | WIN | Win Pose |
| 190 | INTRO | Intro |
| 195 | TAUNT | Taunt |
| 200 | STAND_ATTACK (stand_a) | Stand Light Punch |
| 210 | STAND_ATTACK (stand_c) | Stand Strong Punch |
| 230 | STAND_ATTACK (stand_b) | Stand Light Kick |
| 240 | STAND_ATTACK (stand_d) | Stand Strong Kick |
| 400 | CROUCH_ATTACK (crouch_a) | Crouch Light Punch |
| 410 | CROUCH_ATTACK (crouch_c) | Crouch Strong Punch |
| 430 | CROUCH_ATTACK (crouch_b) | Crouch Light Kick |
| 440 | CROUCH_ATTACK (crouch_d) | Crouch Strong Kick |
| 600 | AIR_ATTACK (air_a) | Air Light Punch |
| 610 | AIR_ATTACK (air_c) | Air Strong Punch |
| 630 | AIR_ATTACK (air_b) | Air Light Kick |
| 640 | AIR_ATTACK (air_d) | Air Strong Kick |
| 800 | THROW | Throw |
| 1000-1400 | STAND_ATTACK (specials) | Special Moves |
| 5000-5090 | HITSTUN/KNOCKDOWN | Get-hit states |
| 5300 | KNOCKDOWN | Lie Down |
| 9000 | (portrait) | Portraits |

This mapping lives in `src/content/characters/{char}/mugenMapping.ts` per character.

### 3.4 Runtime PNG Sprite Loader

**New interface** alongside existing `SourcePixelFrame`:

```typescript
interface SpriteImageFrame {
  /** HTMLImageElement loaded from PNG */
  image: HTMLImageElement;
  /** Source rectangle within the image (full image for individual PNGs) */
  srcRect: { x: number; y: number; w: number; h: number };
  /** Anchor point (character center-bottom in sprite coords) */
  anchor: { x: number; y: number };
  /** Duration in ticks */
  duration: number;
}
```

**Integration point**: `baseHighResRenderer.ts` needs a new code path that:
1. At register time, stores `SpriteImageFrame[]` instead of (or alongside) `PixelFrame[]`
2. At draw time, uses `ctx.drawImage()` instead of pixel-by-pixel fill
3. Prerendering becomes unnecessary — `drawImage` is already GPU-accelerated
4. Facing/mirror still handled via `ctx.scale(-1, 1)` transform

### 3.5 AIR Hitbox Integration

MUGEN AIR files contain real `Clsn` collision data. The pipeline should:

1. Parse Clsn1/Clsn2 from AIR
2. Convert to our `FrameBox` format (note: MUGEN uses left,top,right,bottom; we may use x,y,w,h)
3. Store in animation manifest alongside sprite references
4. Feed into combat system via existing `ATTACK_FRAMES` tables

This replaces manually authored hitbox data with data extracted from the source material.

## 4. Non-Functional Requirements

### 4.1 Performance
- PNG sprites rendered via `ctx.drawImage()` are faster than per-pixel `fillRect`
- No runtime PNG decoding — all sprites pre-loaded as `HTMLImageElement`
- Memory: ~281 sprites × ~5KB average = ~1.4MB per character (trivial)

### 4.2 Asset Pipeline
- Extraction tools run **offline** (build time), not at runtime
- Runtime only loads pre-extracted PNGs and JSON manifests
- `sff-extractor` stays in `references/`; tools import it or shell out

### 4.3 Compatibility
- Existing procedural `SourcePixelFrame` path remains as **fallback**
- New PNG path takes priority when manifest is available
- No changes to combat, input, or game state systems
- `HighResRenderer` interface unchanged — internal implementation swaps

### 4.4 Extensibility
- KFM validates the pipeline end-to-end (open source, MIT license)
- Same pipeline applies to KOF characters (SFF v2 format is identical)
- Per-character mapping config (`mugenMapping.ts`) handles state naming differences

## 5. Implementation Phases

### Phase A: PNG Rendering Path (minimal, KFM proof-of-concept)

**Goal**: Draw one real KFM sprite on screen via existing renderer.

1. Add `SpriteImageFrame` type to `baseHighResRenderer.ts`
2. Add `registerImageFrames()` function (parallel to `registerFrames()`)
3. Add `drawImageFromRegistry()` using `ctx.drawImage()` with anchor+offset+facing
4. Wire into `createHighResRenderer()` — check image registry first, fall back to pixel registry
5. **Manual test**: Load one KFM idle frame PNG and display it

**Files changed**:
- `src/rendering/sprites/shared/baseHighResRenderer.ts` (add image path)
- New: `src/rendering/sprites/kfm/kfmSpriteRender.ts` (KFM renderer using PNG)

### Phase B: AIR Parser + Full Animation

**Goal**: KFM plays full idle/walk/attack animations with real sprites.

1. Build `tools/parseAir.ts` — parse KFM AIR → `animations.json`
2. Build `tools/buildSpriteManifest.ts` — combine SFF metadata + AIR data → per-character manifest
3. Runtime: `spriteLoader.ts` — load manifest + PNGs as HTMLImageElement[]
4. Wire into `kfmSpriteRender.ts` with full state→animation mapping
5. **Manual test**: KFM idle, walk, stand_a, crouch_a all animate correctly

### Phase C: Hitbox Data Integration

**Goal**: Real collision data from AIR feeds into combat system.

1. Extend AIR parser to output Clsn data in our FrameBox format
2. Map Clsn1→hitboxes, Clsn2→hurtboxes per frame
3. Wire into existing `ATTACK_FRAMES` system
4. **Test**: Hit detection works with real hitbox data

### Phase D: KOF Character Pipeline

**Goal**: Same pipeline works for KOF characters (Kyo/Iori/Ryo first).

1. Extract KOF character SFF files (decompress archives in `references/mugen/chars/`)
2. Parse their AIR files
3. Build per-character manifests
4. Create per-character renderers using the same `createHighResRenderer()` factory
5. Map KOF-specific action numbers to our FighterState enum

## 6. Success Criteria

- [ ] KFM sprite renders on screen via `ctx.drawImage()` (not per-pixel)
- [ ] KFM idle animation plays with correct timing (6 frames, [8,9,12,9,10,8] tpf)
- [ ] KFM walk/attack/crouch animations all functional
- [ ] Real hitbox data from AIR feeds into combat
- [ ] Procedural pixel fallback still works for characters without PNG data
- [ ] Pipeline is reproducible: `npm run extract:kfm` produces all assets
- [ ] No regression in existing Kyo/Iori/Ryo rendering

## 7. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| SFF v1 vs v2 differences | Extraction fails | sff-extractor handles both; validate per-character |
| MUGEN coordinate system differs | Sprites offset/anchored wrong | AIR provides per-frame x,y offsets; anchor from sprite center-bottom |
| Hitbox coordinate mismatch | Combat broken | MUGEN uses left,top,right,bottom (inverted Y); convert carefully |
| PNG loading async | Flash of missing sprite | Preload all sprites before match starts |
| Copyright for KOF sprites | Legal risk | KOF sprites for dev/personal use only; KFM (MIT) for distribution |

## 8. Architecture Impact

**No architectural changes required.** The sprite pipeline slots into the existing rendering layer:

```
rendererFighter.ts
  → createHighResRenderer()
    → registerFrames()      (existing: procedural pixel data)
    → registerImageFrames()  (NEW: PNG image data)
    → drawFromRegistry()     (existing: pixel path)
    → drawImageFromRegistry() (NEW: drawImage path)
```

The `HighResRenderer` interface (`has`, `draw`, `drawAfterimage`, `drawWinPose`) stays identical. Callers (rendererFighter.ts) don't change at all.
