# 资产管线架构

本文定义角色美术、肖像、sprite、动作、判定和反馈如何进入运行时。所有视觉和动作相关迭代必须遵守本文。

## 1. 总原则

- 运行时只消费 manifest。
- 工具层负责解析、裁剪、打包、校验、报告。
- 渲染只画 sprite，不决定判定。
- 战斗只读 frame/hitbox/feedback 数据，不依赖 Canvas。
- placeholder 只作为 fallback，不作为长期美术方向。

## 2. 数据层级

```text
source asset
  -> atlas build
  -> sprite manifest
  -> animation manifest
  -> frame contract
  -> runtime rendering/combat/audio/vfx
```

## 3. 必需 manifest

### 3.1 Portrait Manifest

描述角色肖像：

- `characterId`
- `size`: select / hud / vs / win
- `imageRef`
- `atlas rect`
- `anchor`
- `fallback`
- `license/source note`

### 3.2 Sprite Atlas Manifest

描述逐帧 sprite：

- `spriteId`
- `imageRef`
- `atlasX`
- `atlasY`
- `width`
- `height`
- `anchorX`
- `anchorY`
- `palette`

### 3.3 Animation Manifest

描述动作：

- `characterId`
- `actionId`
- `loop`
- `frames`
- `duration`
- `cancel windows`
- `event tags`

### 3.4 Hitbox Manifest

描述判定：

- `hurtbox`
- `hitbox`
- `throwbox`
- `pushbox`
- `invincible`
- `armor`

### 3.5 Feedback Manifest

描述命中反馈：

- `hitstop`
- `blockstop`
- `hitstun`
- `blockstun`
- `pushback`
- `spark`
- `shake`
- `sfx`
- `camera`

## 4. Frame Contract

`Frame Contract` 是视觉、判定、反馈的对齐点。一个动作帧必须能回答：

- 这一帧画哪张图？
- 脚底 anchor 在哪里？
- hurtbox 在哪里？
- hitbox 是否出现？
- 这一帧触发什么事件？
- 命中后使用哪档反馈？

任何实现可以拆文件，但语义必须完整。

## 5. 目录建议

```text
assets/
  source/
    ryo/
      portraits/
      sprites/
      palettes/
  generated/
    ryo/
      ryo.atlas.png
      ryo.sprite.json
      ryo.portrait.json
      ryo.animation.json
      ryo.hitbox.json
      ryo.feedback.json

tools/
  asset-pipeline/
    build-atlas.ts
    validate-manifest.ts
    report-character-completeness.ts
```

## 6. 验收

资产管线改动必须至少满足：

- manifest 可被类型检查。
- manifest 有校验路径。
- Ryo 有一个动作或一个肖像尺寸被实际接入。
- fallback 仍可用。
- 不破坏 `npx tsc --noEmit` 和 `npx vite build`。

## 7. 授权边界

- 可以学习 MUGEN/IKEMEN 的数据组织。
- 可以使用确认许可的社区资源。
- 不得提交无法确认许可的商业 sprite、音频、肖像。
- 研究资料只能留在 `references/`，不得进入运行时。
