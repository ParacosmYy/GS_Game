# 资产管线架构

本文定义角色美术、肖像、sprite、动作、判定和反馈如何进入运行时。所有视觉和动作相关迭代必须遵守本文。

## 1. 总原则

- 当前 MUGEN 提取管线已实现并可运行，不再是理论规划。
- 任何能把公开、合法、可用的 SFF / ACT / PNG / palette 资源接入现有项目的工作，都应优先于继续精修 placeholder 或骨架假人。
- 运行时只消费 manifest。
- 工具层负责解析、裁剪、打包、校验、报告。
- 渲染只画 sprite，不决定判定。
- 战斗只读 frame/hitbox/feedback 数据，不依赖 Canvas。
- placeholder 只作为 fallback，不作为长期美术方向。

## 2. 已实现的数据流

```text
SFF 文件（MUGEN 角色目录中的 .sff）
  │
  ▼
extractCharacterSprites.ts
  ├── 调用 sff-extractor（references/mugen/sff-extractor/）
  │     → 逐帧 PNG sprite：{group}_{index}.png
  │     → sprites.json：sprite 元数据（尺寸、group/index 映射）
  │
  ├── 调用 parseAir.ts
  │     → animations.json：动作帧序列 + Clsn 碰撞数据
  │
  ├── 调用 buildSpriteManifest.ts
  │     → manifest.json：运行时唯一消费产物
  │         （合并 sprite 元数据 + AIR 动画 + DEFAULT_STATE_MAP）
  │
  └── 调用 convertAirHitboxes.ts
        → hitboxes.json：Clsn → FrameBox 格式转换

运行时：
  public/sprites/<角色ID>/manifest.json
    │
    ▼
  spriteLoader.ts / realSpriteLoader.ts
    → fetch manifest.json
    → 预加载全部 PNG 为 HTMLImageElement
    → 返回 Map<actionId, SpriteImageFrame[]>
    │
    ▼
  baseHighResRenderer.ts
    → registerImageFrames()：PNG 图像路径（优先）
    → registerFrames()：程序化 PixelFrame 路径（fallback）
    → drawImageFromRegistry()：ctx.drawImage()
    → drawFromRegistry()：逐像素 fillRect
```

## 3. Manifest 类型体系

### 3.1 运行时 Manifest（MUGEN-sourced，自动生成）

**manifest.json** — 由 `buildSpriteManifest.ts` 从 SFF + AIR 自动合并生成。

这是运行时唯一消费的 manifest，包含三个核心部分：

```json
{
  "characterId": "cvskyo",
  "sprites": {
    "0_0": { "group": 0, "index": 0, "file": "00000_0000.png", "width": 47, "height": 106 },
    "0_1": { "group": 0, "index": 1, "file": "00000_0001.png", "width": 49, "height": 108 }
  },
  "animations": {
    "0": {
      "name": "Standing",
      "loopStart": -1,
      "defaultHurtboxes": [...],
      "frames": [
        { "group": 0, "index": 0, "offsetX": 0, "offsetY": 0, "duration": 10, "flipH": false,
          "hurtboxes": null, "attackBoxes": null }
      ]
    }
  },
  "stateMap": {
    "0": "IDLE", "20": "WALK_FORWARD", "200": "STAND_A", ...
  }
}
```

数据来源：
- `sprites` — 来自 SFF 提取的 PNG 元数据（MUGEN-sourced）
- `animations` — 来自 AIR 解析的动作帧序列 + Clsn 数据（MUGEN-sourced）
- `stateMap` — MUGEN action ID → KOF FighterState 的标准映射（`DEFAULT_STATE_MAP`，内嵌在 `buildSpriteManifest.ts` 中）

### 3.2 碰撞数据 Manifest（MUGEN-sourced，自动生成）

**hitboxes.json** — 由 `convertAirHitboxes.ts` 从 AIR Clsn 数据转换。

数据来源：MUGEN AIR 文件中的 Clsn1/Clsn2 定义。

转换规则：
- MUGEN 格式：left, top, right, bottom（Y 轴负值向上，原点在角色脚底中心）
- 本项目格式：ox, oy, w, h（oy 负值向上，原点在角色位置）
- Clsn1 → 攻击判定 hitbox
- Clsn2 → 受击判定 hurtbox

### 3.3 Portrait Manifest（待实现，需手动/半自动创建）

描述角色肖像：

- `characterId`
- `size`: select / hud / vs / win
- `imageRef`
- `atlas rect`
- `anchor`
- `fallback`
- `license/source note`

数据来源：MUGEN SFF 中 group 9000 的 sprite 可作为肖像源，但需要手动裁剪和分级。

### 3.4 Feedback Manifest（手动编写）

描述命中反馈，按攻击类型分级：

- `hitstop`
- `blockstop`
- `hitstun`
- `blockstun`
- `pushback`
- `spark`
- `shake`
- `sfx`
- `camera`

数据来源：手动 authored，参考 KOF2002 实际打击感调参。当前已有 `feedbackManifest.ts` 定义三档反馈（light/heavy/special）。

### 3.5 角色特化映射（手动编写）

**resolveXxxMugenAction()** 函数在 `realSpriteLoader.ts` 中手动编写，负责将 `FighterState + AttackType` 映射到具体角色的 MUGEN action ID。

数据来源：手动 authored，依据角色 .air 文件中的 `[Begin Action N]` 编号。

当前已实现的映射：
- `resolveKyoMugenAction()` — Kyo 的完整状态/攻击 → action 映射
- `resolveRyoMugenAction()` — Ryo 的完整状态/攻击 → action 映射

### Manifest 类型来源汇总

| Manifest | 数据来源 | 生成方式 | 当前状态 |
|---|---|---|---|
| manifest.json | MUGEN SFF + AIR | 自动生成（buildSpriteManifest.ts） | 已实现 |
| hitboxes.json | MUGEN AIR Clsn | 自动生成（convertAirHitboxes.ts） | 已实现 |
| Portrait manifest | MUGEN SFF group 9000 / 手动 | 半自动（需裁剪和分级） | 待实现 |
| Feedback manifest | 手动调参 | 手动编写 | 已有基础（feedbackManifest.ts） |
| 角色特化映射 | 角色AIR + FighterState枚举 | 手动编写（resolveXxxMugenAction） | Kyo/Ryo 已实现 |

## 4. Frame Contract

`Frame Contract` 是视觉、判定、反馈的对齐点。在 MUGEN 管线下，**MUGEN action ID 是帧数据的规范标识符**。

一个动作帧必须能回答：

- 这一帧画哪张图？→ manifest.json 中 animations[actionId].frames[i] 的 group/index 定位 sprites[key]
- 脚底 anchor 在哪里？→ 从 sprite 尺寸 + AIR offsetX/offsetY 计算
- hurtbox 在哪里？→ AIR Clsn2 数据，经 convertAirHitboxes 转换
- hitbox 是否出现？→ AIR Clsn1 数据，经 convertAirHitboxes 转换
- 这一帧触发什么事件？→ AIR duration + eventTags
- 命中后使用哪档反馈？→ feedbackManifest 按攻击类型分级

MUGEN action ID 在管线中的流转：

```text
AIR 文件中的 [Begin Action 200]
  → parseAir 输出 animations["200"]
  → buildSpriteManifest 写入 manifest.animations["200"]
  → stateMap 标记 "200": "STAND_A"
  → spriteLoader 按 actionId="200" 加载帧序列
  → realSpriteLoader.resolveXxxMugenAction(FighterState.STAND_ATTACK, AttackType.STAND_A) 返回 "200"
  → baseHighResRenderer 用 actionId="200" 查找并渲染
```

任何实现可以拆文件，但语义必须完整。MUGEN action ID 是贯穿工具链和运行时的统一标识。

## 5. 目录结构（实际现状）

### 5.1 工具层

```text
src/tools/
  extractCharacterSprites.ts   — 端到端提取入口
  parseAir.ts                  — AIR 文件解析
  buildSpriteManifest.ts       — Manifest 合并构建
  convertAirHitboxes.ts        — Clsn → FrameBox 转换
```

### 5.2 运行时

```text
src/rendering/sprites/
  shared/
    baseHighResRenderer.ts     — 双路径渲染基类
    spriteLoader.ts            — Manifest + PNG 运行时加载
    realSpriteLoader.ts        — MUGEN action ID 解析 + loadRealSprites()
    pixelFrameRenderer.ts      — 程序化 PixelFrame 渲染（fallback）
  kyo/
    kyoHighResRender.ts        — Kyo 角色渲染器
  iori/
    ioriHighResRender.ts       — Iori 角色渲染器
  ryo/                         — Ryo 角色渲染器目录
```

### 5.3 产出资产

```text
public/sprites/
  cvskyo/
    *.png                      — 1,809 张 sprite
    manifest.json              — 运行时 manifest
    sprites.json               — sprite 元数据
    animations.json            — AIR 动作数据
    hitboxes.json              — 碰撞数据
  cvsryo/
    *.png                      — 1,231 张 sprite
    manifest.json
  kfm/
    *.png                      — 281 张 sprite
    manifest.json
```

### 5.4 参考资源（不入运行时）

```text
references/mugen/
  chars-extracted/warusaki3/characters/   — 60+ MUGEN 角色原始文件（SFF/AIR/ACT）
  sprites-kof2002/                        — 18 角色已提取 sprite 目录
  sff-extractor/                          — Node.js SFF 解析库
```

### 5.5 目录迁移方向

后续迁移须符合 [工作区目标架构](workspace-architecture-target.md)：

```text
content/
  characters/
    <角色ID>/
      portraits/          — 肖像
      animations/         — 动作帧与 pose
      hitboxes/           — 判定
      feedback/           — 命中反馈

tools/
  asset-pipeline/
    extractCharacterSprites.ts
    parseAir.ts
    buildSpriteManifest.ts
    convertAirHitboxes.ts
    validateManifest.ts          — 待实现
    reportCompleteness.ts        — 待实现
```

当前工具文件仍在 `src/tools/` 中，角色渲染器仍在 `src/rendering/sprites/` 中。迁移方向按 [决策门](../process/decision-gates.md) 逐步执行，不一次搬迁。

## 6. 角色接入检查清单

新角色接入时，以下产物必须齐全：

- [ ] SFF 提取完成：`public/sprites/<角色ID>/*.png` 存在且数量正确
- [ ] AIR 解析完成：`animations.json` 存在且包含所有标准动作
- [ ] Manifest 构建完成：`manifest.json` 存在且 sprite 引用无缺失
- [ ] 碰撞数据转换完成：`hitboxes.json` 存在且 FrameBox 格式正确
- [ ] 角色特化映射完成：`resolveXxxMugenAction()` 已编写
- [ ] 渲染器接入完成：角色渲染器调用 loadRealSprites + registerImageFrames
- [ ] Fallback 可用：PNG 缺失时程序化 PixelFrame 正常降级
- [ ] 不破坏 `npx tsc --noEmit` 和 `npx vite build`

## 7. 验收

资产管线改动必须至少满足：

- manifest 可被类型检查。
- manifest 有校验路径。
- 至少一个角色的真实 sprite 被实际接入运行时。
- fallback 仍可用。
- 不破坏 `npx tsc --noEmit` 和 `npx vite build`。
- 通过 [决策门](../process/decision-gates.md) 的资产管线决策门。

## 8. 授权边界

- 可以学习 MUGEN/IKEMEN 的数据组织方式。
- 可以使用确认许可的社区资源。
- 不得提交无法确认许可的商业 sprite、音频、肖像。
- 研究资料只能留在 `references/`，不得进入运行时。
- KFM（MIT 许可）可用于分发和示例。
- KOF 角色资源仅用于开发和个人研究。

## 9. 资产导入优先级

如果本轮目标涉及视觉提升，优先顺序必须是：

1. 先确认资源是否合法且可用。（已确认：18 角色已提取）
2. SFF / AIR 解析已实现。（extractCharacterSprites.ts + parseAir.ts）
3. Manifest 构建已实现。（buildSpriteManifest.ts）
4. 运行时加载已实现。（spriteLoader.ts + realSpriteLoader.ts）
5. 后续优先做：Palette 支持（ACT 解析）、Atlas 打包、完整度报告。
6. 最后才补骨架 fallback 或表面视觉修饰。

## 10. Phase D 待实现能力

当前管线覆盖了从 SFF 到运行时的核心链路。以下能力待实现：

| 能力 | 说明 | 优先级 |
|---|---|---|
| Palette 支持 | 从 ACT 文件提取调色板，支持运行时 1P/2P 色切换 | 高 |
| 批量提取脚本 | 一键从 warusaki3 角色库提取全部 60+ 角色 | 中 |
| 自动化测试 | manifest 校验、sprite 引用完整性、动作覆盖率检查 | 中 |
| Atlas 打包 | 散装 PNG 合并为 atlas 纹理，减少 GPU 纹理切换 | 低 |
| 完整度报告 | 自动检测 MUGEN action → FighterState 映射缺失 | 中 |
| Portrait 裁剪 | 从 SFF group 9000 自动裁剪并生成 portrait manifest | 高 |
