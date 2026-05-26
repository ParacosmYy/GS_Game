# P0 Ryo 切片闭环 — 系统设计

## 概述

本文档描述 Ryo 垂直切片闭环所需的 5 个功能需求(FR)的技术设计。
目标：让 Ryo 的视觉、打击感、判定、反馈形成完整闭环。

---

## FR-1: 补全 hurt/knockdown/jump 像素帧

### 现状
- `ryoHighResRender.ts` 已注册 IDLE/WALK_FORWARD/WALK_BACKWARD/STAND_A/STAND_C
- HURT、KNOCKDOWN、JUMP 的 registry key 已在 `resolveFrameKey()` 中映射
- 但 `tryRegisterDamageFrames()` 和 `tryRegisterJumpFrames()` 为空壳
- 无实际像素数据

### 设计方案

**策略**: 创建占位 PNG → 运行时加载为 ImageData → 提取像素索引 → 注册到 FrameRegistry

```
assets/
  source/
    ryo/
      sprites/
        hurt.png          (48×72, 3帧横排)
        knockdown.png     (48×72, 4帧横排)
        jump.png          (48×72, 4帧横排)
```

**替代方案(推荐)**: 不走 PNG 路径，直接用代码生成占位像素帧(与 idle/walk 一致)，
因为当前没有美术资源。PNG 管线在 FR-5(资产管线工具)中实现。

### 代码变更

**新增文件**: `src/rendering/sprites/ryoDamageFrames.ts`
- 定义 HURT_FRAMES (3帧, 48×72)
- 定义 KNOCKDOWN_FRAMES (4帧, 48×72)
- 使用与 idle 相同的 PALETTE

**新增文件**: `src/rendering/sprites/ryoJumpFrames.ts`
- 定义 JUMP_UP_FRAMES (4帧, 48×72)
- 定义 JUMP_FORWARD_FRAMES (4帧, 48×72)

**修改文件**: `src/rendering/sprites/ryoHighResRender.ts`
- import 新帧数据
- 在 `tryRegisterDamageFrames()` 中注册 HURT/KNOCKDOWN
- 在 `tryRegisterJumpFrames()` 中注册 JUMP_UP/JUMP_FORWARD
- `resolveFrameKey()` 增加 JUMP 子类型区分(上升 vs 前跳)

### 接口变更

```ts
// ryoHighResRender.ts — resolveFrameKey 新增逻辑
case FighterState.HITSTUN:
  return 'HURT';  // 已有

case FighterState.KNOCKDOWN:
  return 'KNOCKDOWN';  // 已有

case FighterState.JUMP:
case FighterState.HOP:
case FighterState.RUN_JUMP:
case FighterState.HYPER_JUMP:
  // 需要区分上升/前跳？或统一用 JUMP
  return 'JUMP';
```

`drawHighResFrame()` 和 `hasHighResFrame()` 签名不变。

### 验收
- Ryo 8 个必需动作全部有可渲染帧
- 无 fallback 到骨骼渲染

---

## FR-2: Spark 差异化

### 现状
- `vfxPresets.ts` 中 `spawnHitSparks()` 是统一的火花生成
- `hitCallback.ts` 已从 feedbackManifest 读取 sparkCount/sparkSize/sparkStarRatio
- 但所有火花使用相同的颜色(#ffcc00/#ff6600)、速度、生命周期
- Particle.type 只有 'spark'，没有按 tier 区分绘制逻辑

### 设计方案

**核心思路**: 在 `FeedbackParams` 中新增 spark 视觉参数，`hitCallback` 传递给新的 tier-aware spawn 函数。

### FeedbackParams 扩展

```ts
// feedbackManifest.ts — FeedbackParams 新增字段
export interface FeedbackParams {
  // ... 现有字段 ...

  /** 火花颜色方案 */
  sparkPalette: string[];       // 2-3个颜色交替使用
  /** 火花类型 */
  sparkType: 'small' | 'medium' | 'large' | 'burst' | 'mega';
  /** 火花速度缩放 */
  sparkSpeed: number;           // 1.0 = 基准
}
```

### 5 档火花视觉规格

| Tier | sparkType | sparkPalette | sparkSpeed | 视觉描述 |
|------|-----------|-------------|-----------|---------|
| light | small | [#fff, #ffcc00] | 1.0 | 小圆点，白色+黄色 |
| heavy | medium | [#ffcc00, #ff6600] | 1.3 | 中等十字，黄+橙 |
| special | large | [#88ccff, #ffffff, #4488ff] | 1.6 | 大型扩散，蓝+白 |
| dm | burst | [#ffffff, #ffff00, #ff8800] | 2.0 | 爆发式扩散+环形冲击波 |
| sdm | mega | [#ffffff, #ffcc00, #ff4400] | 2.5 | 全屏闪光+多波扩散 |

### 代码变更

**修改文件**: `src/core/feedbackManifest.ts`
- FeedbackParams 接口新增 sparkPalette/sparkType/sparkSpeed
- FEEDBACK_TIERS 每档补充新字段值

**修改文件**: `src/rendering/vfxPresets.ts`
- 新增 `spawnTierSparks()` 函数，接收 tier 参数
- 根据 sparkType 选择不同的粒子生成逻辑：
  - small: 现有 spawnHitSparks 行为
  - medium: 更多粒子 + 更大 size
  - large: 径向扩散 + 星形粒子
  - burst: 环形爆发 + flash 粒子
  - mega: 双重环形 + superburst 粒子

**修改文件**: `src/combat/hitCallback.ts`
- 将 `vfx.spawnCharacterHitSparks()` 替换为新的 tier-aware 版本
- 传递 `fb.sparkPalette`, `fb.sparkType`, `fb.sparkSpeed`

### 验收
- 5 档攻击的 spark 肉眼可区分
- DM 命中时有明显的爆发效果

---

## FR-3: Pushback 物理接入

### 现状
- `FRAME_DATA` 每招有 `pushback` 值(如 STAND_A=4, STAND_C=8)
- `combatSystem.ts` 已将 pushback 转为 vx 并应用
- 但 pushback 值偏小(最大 ~10)，重攻击推退感不明显
- `FeedbackParams` 不包含 pushback 参数
- pushback 无 tier-based 加权

### 设计方案

**策略A(推荐)**: 在 FeedbackParams 中添加 pushback 乘数，与 frameData.pushback 相乘

```ts
// feedbackManifest.ts — 新增
export interface FeedbackParams {
  // ... 现有字段 ...
  /** 命中推退力度乘数 (1.0 = frameData原值) */
  hitPushbackScale: number;
  /** 防御推退力度乘数 */
  blockPushbackScale: number;
}
```

5 档乘数:
- light: hitPushbackScale=1.0, blockPushbackScale=0.8
- heavy: hitPushbackScale=1.5, blockPushbackScale=1.2
- special: hitPushbackScale=2.0, blockPushbackScale=1.5
- dm: hitPushbackScale=3.0, blockPushbackScale=2.0
- sdm: hitPushbackScale=3.5, blockPushbackScale=2.5

### 代码变更

**修改文件**: `src/core/feedbackManifest.ts`
- 新增 hitPushbackScale/blockPushbackScale 字段和值

**修改文件**: `src/combat/combatSystem.ts`
- 命中路径: `effectivePushback *= fb.hitPushbackScale`
- 防御路径: `pushback *= fb.blockPushbackScale`

关键代码位置 (`combatSystem.ts` ~line 607):
```ts
// 当前:
const effectivePushback = data.pushback * comboScale;
// 变更:
const fb = getFeedback(attackType);
const effectivePushback = data.pushback * comboScale * fb.hitPushbackScale;
```

防御路径 (`combatSystem.ts` ~line 620):
```ts
// 当前:
defender.applyBlockstun(data.blockstun, data.pushback * pushblockMult);
// 变更:
defender.applyBlockstun(data.blockstun, data.pushback * pushblockMult * fb.blockPushbackScale);
```

### 验收
- STAND_C 命中推退距离明显大于 STAND_A
- DM 命中对手飞远

---

## FR-4: DM 超级闪光增强

### 现状
- `cinematicState.ts`: triggerSuperFlash() 硬编码 28 帧
- `overlayScreens.ts`: drawSuperFlash() 区分 DM/SDM，无 HSDM
- `dmManager.ts`: 调用 triggerSuperFlash() 时无参数配置

### 设计方案

**1. 可配置闪光时长**

```ts
// cinematicState.ts
triggerSuperFlash(x, y, attacker, duration?: number): void {
  const dur = duration ?? 28;  // 默认 28，可配置
  this.superFlashTimer = dur;
  this.hitStop = dur;
}
```

**2. HSDM 视觉类型**

```ts
// overlayScreens.ts
flashType: 'DM' | 'SDM' | 'HSDM'  // 新增 HSDM

// HSDM 视觉规格:
// - 双层闪光(白+红叠加)
// - 更大的爆发光晕
// - 持续时间更长
```

**3. DMManager 传递类型**

```ts
// dmManager.ts — checkDMActivation
if (this.isHSDMAttack(atk)) {
  cinematic.triggerSuperFlash(f.x, ..., i, 32);  // HSDM 更长
} else if (this.isSDMAttack(atk)) {
  cinematic.triggerSuperFlash(f.x, ..., i, 28);  // SDM 标准
} else {
  cinematic.triggerSuperFlash(f.x, ..., i, 24);  // DM 稍短
}
```

### 代码变更

**修改文件**: `src/state/cinematicState.ts`
- triggerSuperFlash 新增可选 duration 参数

**修改文件**: `src/rendering/overlayScreens.ts`
- drawSuperFlash 的 flashType 扩展为 `'DM' | 'SDM' | 'HSDM'`
- 新增 HSDM 分支：双层渐变(白+品红)，更大光晕半径

**修改文件**: `src/combat/dmManager.ts`
- checkDMActivation 根据 DM/SDM/HSDM 传递不同 duration

**修改文件**: `src/main.ts` (line ~883)
- 传递正确的 flashType 给 renderer.drawSuperFlash()

### 验收
- DM 命中: 白色闪光 + 标准光晕
- SDM 命中: 金色闪光 + 较大光晕
- HSDM 命中: 品红+白双层闪光 + 最大光晕

---

## FR-5: 简易资产管线工具

### 现状
- `src/tools/` 有 ryoCompletenessReport 和 ryoAuthenticityCheck
- 无 atlas 构建工具
- 无 manifest 校验工具
- package.json 无 tools:* 脚本
- assets/ 目录为空

### 设计方案

**工具 1: manifest 校验工具**

```
npx tsx src/tools/validateManifest.ts ryo
```

校验内容:
- FRAME_DATA 中每个 Ryo 攻击在 ATTACK_FRAMES 中有对应条目
- ATTACK_FRAMES 数组长度 === FRAME_DATA.active 值
- FEEDBACK_MANIFEST 中每个 Ryo 攻击有显式 tier 映射
- SPRITE_MANIFEST 中 Ryo 的 8 个必需动作有动画条目
- HURTBOX_TABLE 中 8 个必需状态有 hurtbox 条目

输出:
```
Ryo Manifest Validation
  frameData ↔ attackFrames: 33/33 ✅
  feedback tier mapping:    33/33 ✅
  sprite manifest:          11/11 ✅
  hurtbox coverage:         8/8   ✅
  OVERALL: PASS
```

**工具 2: 占位资产生成工具**

```
npx tsx src/tools/generatePlaceholderAssets.ts ryo
```

功能:
- 为缺失的 sprite 动作生成占位 PNG (纯色方块 + 标签文字)
- 输出到 `assets/generated/ryo/`
- 不覆盖已有文件

### 代码结构

```
src/tools/
  validateManifest.ts      (新建)
  generatePlaceholderAssets.ts  (新建)
  ryoCompletenessReport.ts (已有)
  ryoAuthenticityCheck.ts  (已有)
```

### package.json 脚本

```json
{
  "tools:validate": "npx tsx src/tools/validateManifest.ts",
  "tools:validate:ryo": "npx tsx src/tools/validateManifest.ts ryo",
  "tools:report:ryo": "npx tsx src/tools/ryoCompletenessReport.ts",
  "tools:authenticity:ryo": "npx tsx src/tools/ryoAuthenticityCheck.ts",
  "tools:placeholders": "npx tsx src/tools/generatePlaceholderAssets.ts"
}
```

### 验收
- `npm run tools:validate:ryo` 通过
- 输出三方对齐报告(frameData ↔ attackFrames ↔ feedbackManifest)

---

## 依赖关系与执行顺序

```
FR-5 (工具) ←── 独立，可先做
FR-1 (像素帧) ←── 独立，可先做
FR-3 (pushback) ←── 依赖 feedbackManifest 改动
FR-2 (spark) ←── 依赖 feedbackManifest 改动
FR-4 (super flash) ←── 独立
```

建议执行顺序:
1. FR-3 + FR-2 (一起改 feedbackManifest)
2. FR-1 (独立，可并行)
3. FR-4 (独立)
4. FR-5 (最后，校验前面所有工作)

---

## 风险评估

| 风险 | 概率 | 影响 | 缓解 |
|------|------|------|------|
| pushback 乘数过大导致角色飞出屏幕 | 中 | 低 | 加 x 坐标 clamp |
| spark 粒子数量过多影响帧率 | 低 | 中 | DM 档限制在 20 粒子内 |
| HSDM 闪光与 SDM 视觉差异不够 | 低 | 低 | 用品红色系区分 |
| 占位像素帧与骨骼 pose 视觉割裂 | 高 | 中 | 同一 palette + 一致的轮廓风格 |
