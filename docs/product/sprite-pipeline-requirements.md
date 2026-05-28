# Sprite Pipeline Requirements: SFF → Real Pixel Art

## 1. 问题陈述

当前项目已经拥有可运行的 MUGEN 资产提取管线，不再停留在规划阶段。真实 PNG sprite 已从 SFF 文件中提取完毕，AIR 动画数据已解析，运行时加载器已接入，双路径渲染（PNG 优先 + 程序化 PixelFrame fallback）已生效。

**已解决的痛点**：角色视觉不再是纯程序化像素块，而是来自真实 MUGEN SFF 的合法 sprite 资产。

**当前目标**：将管线能力从"能用"推向"可复制的生产模板"——任何 KOF2002 角色都能用一条命令完成从 SFF 到运行时接入的全流程。

## 2. 管线现状（已实现）

### 数据流

```text
SFF 文件 (MUGEN 角色目录)
  → extractCharacterSprites.ts（调用 sff-extractor）
    → {group}_{index}.png（逐帧 PNG sprite）
    → sprites.json（sprite 元数据）
  → parseAir.ts（解析 .air 文件）
    → animations.json（动作帧序列 + Clsn 碰撞数据）
  → buildSpriteManifest.ts（合并 sprite 元数据 + AIR 动画 + DEFAULT_STATE_MAP）
    → manifest.json（运行时唯一消费产物）
  → convertAirHitboxes.ts（Clsn → FrameBox 格式转换）
    → hitboxes.json（可选，用于战斗判定接入）

运行时：
  spriteLoader.ts / realSpriteLoader.ts
    → 加载 manifest.json + 预加载所有 PNG
    → 返回 Map<actionId, SpriteImageFrame[]>
  baseHighResRenderer.ts
    → 双路径渲染：PNG 图像（优先） + 程序化 PixelFrame（fallback）
```

### 已实现的工具链

| 工具 | 位置 | 输入 | 输出 | 状态 |
|---|---|---|---|---|
| SFF 提取 | `src/tools/extractCharacterSprites.ts` | 角色目录（含 .sff + .air） | PNG sprites + manifest.json + hitboxes.json | 已完成 |
| AIR 解析 | `src/tools/parseAir.ts` | .air 文件 | animations.json | 已完成 |
| Manifest 构建 | `src/tools/buildSpriteManifest.ts` | sprites 目录 + animations.json | manifest.json（含 DEFAULT_STATE_MAP） | 已完成 |
| 碰撞转换 | `src/tools/convertAirHitboxes.ts` | animations.json | hitboxes.json（FrameBox 格式） | 已完成 |

### 已实现的运行时

| 组件 | 位置 | 职责 | 状态 |
|---|---|---|---|
| spriteLoader | `src/rendering/sprites/shared/spriteLoader.ts` | 加载 manifest + 预加载 PNG → Map<actionId, SpriteImageFrame[]> | 已完成 |
| realSpriteLoader | `src/rendering/sprites/shared/realSpriteLoader.ts` | FighterState+AttackType → MUGEN action ID 解析 + loadRealSprites() | 已完成 |
| baseHighResRenderer | `src/rendering/sprites/shared/baseHighResRenderer.ts` | 双路径渲染：PNG 图像优先，PixelFrame fallback | 已完成 |

### 已导入的资产

| 角色 | 目录 | PNG 数量 | manifest.json | 来源 |
|---|---|---|---|---|
| cvskyo | `public/sprites/cvskyo/` | 1,809 | 有 | MUGEN SFF 提取 |
| cvsryo | `public/sprites/cvsryo/` | 1,231 | 有 | MUGEN SFF 提取 |
| kfm | `public/sprites/kfm/` | 281 | 有 | MUGEN SFF 提取（MIT 示例） |

### 参考资源

| 资源 | 位置 | 说明 |
|---|---|---|
| warusaki3 角色库 | `references/mugen/chars-extracted/warusaki3/characters/` | 60+ 角色，含 SFF/AIR/ACT |
| KOF2002 sprites | `references/mugen/sprites-kof2002/` | 18 角色目录，已从 SFF 提取 |
| sff-extractor | `references/mugen/sff-extractor/` | Node.js SFF v1/v2 解析库 |

## 3. 功能需求

### 3.1 SFF 提取（已完成）

`extractCharacterSprites.ts` 是端到端入口工具，一次调用完成：

1. 在角色目录中查找 .sff 文件（优先非 _ex 版本）
2. 调用 sff-extractor 将所有 sprite 解码为 PNG（`{group}_{index}.png` 命名）
3. 生成 `sprites.json` 元数据（尺寸、group/index 映射）
4. 如果存在 .air 文件，自动链式调用 parseAir → buildSpriteManifest → convertAirHitboxes

用法：
```bash
npx ts-node src/tools/extractCharacterSprites.ts <角色目录> <输出目录>
```

### 3.2 AIR 解析（已完成）

`parseAir.ts` 解析 MUGEN .air 文件，输出动作帧序列：

- 解析 `[Begin Action N]` 块
- 提取逐帧数据：group, index, offsetX, offsetY, duration
- 提取 Clsn1（攻击判定）和 Clsn2（受击判定）
- 处理 Loopstart 标记
- 处理 group=-1（空白/不可见帧）
- 处理 H 标记（水平翻转）

输出格式示例：
```json
{
  "animations": {
    "0": {
      "name": "Standing",
      "loopStart": -1,
      "defaultHurtboxes": [...],
      "frames": [
        { "group": 0, "index": 0, "offsetX": 0, "offsetY": 0, "duration": 10, "flipH": false, "hurtboxes": null, "attackBoxes": null }
      ]
    }
  }
}
```

### 3.3 MUGEN→KOF 状态映射（已完成）

`buildSpriteManifest.ts` 中的 `DEFAULT_STATE_MAP` 定义了标准映射：

| MUGEN Action | KOF State | 说明 |
|---|---|---|
| 0 | IDLE | 站立 |
| 5 | IDLE_TURN | 转身 |
| 11 | CROUCH | 蹲下 |
| 20 | WALK_FORWARD | 前走 |
| 21 | WALK_BACKWARD | 后走 |
| 42 | JUMP_FWD | 前跳 |
| 43 | JUMP_BACK | 后跳 |
| 100 | RUN | 跑步 |
| 105 | BACKDASH | 后闪 |
| 120 | GUARD_STAND | 站防 |
| 200 | STAND_A | 远A |
| 210 | STAND_C | 远C |
| 230 | STAND_B | 远B |
| 240 | STAND_D | 远D |
| 400 | CROUCH_A | 蹲A |
| 410 | CROUCH_C | 蹲C |
| 430 | CROUCH_B | 蹲B |
| 440 | CROUCH_D | 蹲D |
| 600 | AIR_A | 跳A |
| 610 | AIR_C | 跳C |
| 630 | AIR_B | 跳B |
| 640 | AIR_D | 跳D |
| 800 | THROW | 投技 |
| 1000-1500 | SPECIAL_1~5 | 必杀技 |
| 5000-5300 | HIT_*/FALL/LIE | 受击/倒地 |
| 9000 | PORTRAIT | 肖像 |

角色特化的状态映射在 `realSpriteLoader.ts` 中通过 `resolveXxxMugenAction()` 函数实现（如 resolveKyoMugenAction、resolveRyoMugenAction）。

### 3.4 运行时 PNG 加载（已完成）

`SpriteImageFrame` 类型已定义在 `baseHighResRenderer.ts`：

```typescript
interface SpriteImageFrame {
  image: HTMLImageElement;
  srcRect: { x: number; y: number; w: number; h: number };
  anchor: { x: number; y: number };
  duration: number;
}
```

`spriteLoader.ts` 提供：
- `loadSpriteManifest(manifestPath, spritesBaseDir)` — 加载 manifest + 预加载全部 PNG → Map<actionId, SpriteImageFrame[]>
- `clearSpriteCache()` — 场景切换时清缓存

`realSpriteLoader.ts` 提供：
- `loadRealSprites(manifestUrl, spritesBaseUrl)` — 同上的简化版
- `resolveKyoMugenAction(state, attack, vx, facing)` — Kyo 的 FighterState → MUGEN action ID
- `resolveRyoMugenAction(state, attack, vx, facing)` — Ryo 的 FighterState → MUGEN action ID

### 3.5 AIR 碰撞数据接入（已完成）

`convertAirHitboxes.ts` 将 MUGEN Clsn 数据转为 FrameBox 格式：

- MUGEN 格式：left, top, right, bottom（Y 轴：负值向上，原点在角色脚底中心）
- 本项目格式：ox, oy, w, h（oy 负值向上，原点在角色位置）
- Clsn1 → 攻击判定（hitbox），Clsn2 → 受击判定（hurtbox）

## 4. 新角色接入指南

以下是将一个新 KOF2002 角色从 MUGEN 资产接入运行时的完整步骤：

### 步骤 1：确认资源可用性

```bash
# 检查角色是否存在于参考库中
ls references/mugen/chars-extracted/warusaki3/characters/<角色目录名>/
# 确认 .sff 和 .air 文件存在
```

参考库中可用的 KOF2002 角色（18个已提取目录）：cvsathena, cvsbenimaru, cvschunli, cvsg_rugal, cvsgeese, cvsgouki, cvskim, cvsking, cvskyo, cvsrock, cvsryo, cvsterry, cvsvice, cvsyamazaki, heidern, kfm, shermie。

### 步骤 2：执行提取

```bash
# 一步完成：SFF 提取 → AIR 解析 → Manifest 构建 → 碰撞转换
npx ts-node src/tools/extractCharacterSprites.ts \
  references/mugen/chars-extracted/warusaki3/characters/<角色目录名> \
  public/sprites/<角色ID>/
```

产出物：
- `public/sprites/<角色ID>/*.png` — 所有 sprite 帧
- `public/sprites/<角色ID>/sprites.json` — sprite 元数据
- `public/sprites/<角色ID>/animations.json` — AIR 动作数据
- `public/sprites/<角色ID>/manifest.json` — 运行时 manifest（核心产物）
- `public/sprites/<角色ID>/hitboxes.json` — 碰撞数据

### 步骤 3：编写角色 MUGEN Action 解析器

在 `src/rendering/sprites/shared/realSpriteLoader.ts` 中新增 `resolveXxxMugenAction()` 函数：

```typescript
export function resolveXxxMugenAction(
  state: FighterState,
  attack: AttackType | null,
  vx: number,
  facing: number
): string | null {
  // 参照 resolveKyoMugenAction / resolveRyoMugenAction 的模式
  // 映射 FighterState + AttackType → MUGEN action ID 字符串
}
```

依据角色 .air 文件中的 `[Begin Action N]` 编号来确定映射关系。

### 步骤 4：接入角色渲染器

在 `src/rendering/sprites/<角色名>/` 目录下创建或更新渲染器文件，调用：

```typescript
import { loadRealSprites } from '../shared/realSpriteLoader.js';

const spriteMap = await loadRealSprites(
  '/sprites/<角色ID>/manifest.json',
  '/sprites/<角色ID>'
);
```

将 spriteMap 接入 `baseHighResRenderer.ts` 的 `registerImageFrames()` 机制。

### 步骤 5：验证

1. 启动 `npx vite dev`，选择对应角色
2. 检查站立、行走、跳跃动画是否正确播放
3. 检查攻击动作是否匹配正确的 sprite
4. 检查程序化 fallback 是否在 PNG 缺失时正常降级
5. 运行相关测试确保无回归

## 5. 非功能需求

### 5.1 性能

- PNG sprite 通过 `ctx.drawImage()` 渲染，比逐像素 `fillRect` 更快
- 所有 sprite 在比赛开始前预加载为 `HTMLImageElement`，运行时无解码开销
- 内存估算：约 1,200~1,800 张 sprite x 约 5KB/张 = 约 6~9MB/角色（可接受）

### 5.2 资产管线

- 提取工具在构建时离线运行，不在运行时执行
- 运行时只加载预提取的 PNG 和 manifest JSON
- sff-extractor 库保留在 `references/` 中，工具层通过子进程调用
- 一条命令即可完成从原始 SFF 到运行时可消费产物的全流程

### 5.3 兼容性

- 程序化 `SourcePixelFrame` 路径保留为 fallback
- PNG 路径在 manifest 可用时优先
- 战斗、输入、状态系统不因渲染路径切换而变化
- `HighResRenderer` 接口不变（has, draw, drawAfterimage, drawWinPose）

### 5.4 可扩展性

- KFM 已验证管线端到端可用（MIT 许可，开源角色）
- 同一管线适用于所有 KOF 角色（SFF v2 格式通用）
- 角色特化配置通过 `resolveXxxMugenAction()` 隔离
- DEFAULT_STATE_MAP 覆盖标准动作，特殊动作由角色特化解析器处理

## 6. 实现阶段

### Phase A：SFF 提取 + PNG 渲染路径（已完成）

**目标**：从 SFF 提取真实 sprite 并在屏幕上渲染。

- `extractCharacterSprites.ts` — 端到端 SFF 提取 + 工具链串联
- `baseHighResRenderer.ts` — 新增 `SpriteImageFrame` 类型和 `registerImageFrames()` 方法
- `buildSpriteManifest.ts` — 合并 sprite 元数据 + AIR 动画数据为运行时 manifest
- **验证**：KFM 281 张 sprite 提取 + manifest 生成 + 运行时加载

### Phase B：AIR 解析 + 完整动画（已完成）

**目标**：角色播放完整的 idle/walk/attack 动画，使用真实 sprite。

- `parseAir.ts` — 解析 MUGEN .air 文件为 JSON 动画清单
- `spriteLoader.ts` — 运行时 manifest 加载 + PNG 预加载
- `realSpriteLoader.ts` — FighterState+AttackType → MUGEN action ID 解析 + 通用加载函数
- **验证**：Kyo 1,809 张 sprite、Ryo 1,231 张 sprite 全部提取并接入

### Phase C：碰撞数据接入（已完成）

**目标**：真实 AIR Clsn 数据接入战斗系统。

- `convertAirHitboxes.ts` — Clsn → FrameBox 格式转换
- MUGEN 坐标系（left/top/right/bottom）→ 本项目坐标系的转换逻辑
- **验证**：attack actions 成功转换，输出 hitboxes.json

### Phase D：高级能力（待实现）

**目标**：将管线从"能用"推向"生产级"。

1. **Palette 支持**：从 ACT 文件提取调色板数据，支持运行时 palette 切换（1P/2P 色）
2. **批量提取**：一键从 `references/mugen/chars-extracted/warusaki3/` 提取所有 60+ 角色
3. **自动化测试**：manifest 校验、sprite 完整度报告、动作覆盖率检查
4. **Atlas 打包**：将散装 PNG 合并为 atlas 纹理，减少 GPU 纹理切换
5. **Sprite 完整度报告**：自动检测哪些 MUGEN action 缺少对应 FighterState 映射

## 7. 成功标准

- [x] KFM sprite 通过 `ctx.drawImage()` 渲染（非逐像素）
- [x] KFM idle 动画以正确时序播放
- [x] KFM walk/attack/crouch 动画功能正常
- [x] 真实 hitbox 数据从 AIR 提取并可接入战斗系统
- [x] 程序化 pixel fallback 在无 PNG 数据时仍可用
- [x] 管线可复现：一条命令从 SFF 到运行时 manifest
- [x] 多角色资产已接入：Kyo 1,809 张 + Ryo 1,231 张 + KFM 281 张
- [ ] Palette 切换（1P/2P 色）支持运行时切换
- [ ] Atlas 打包减少纹理切换开销
- [ ] 自动化完整度报告覆盖所有角色
- [ ] 60+ 参考角色批量提取脚本

## 8. 风险与缓解

| 风险 | 影响 | 缓解措施 | 当前状态 |
|---|---|---|---|
| SFF v1 vs v2 差异 | 提取失败 | sff-extractor 同时支持两种格式；逐角色验证 | 已缓解，18 角色提取成功 |
| MUGEN 坐标系差异 | sprite 偏移/锚点错误 | AIR 提供逐帧 x,y offset；anchor 从 sprite 中心底部计算 | 已解决 |
| 碰撞坐标不匹配 | 战斗判定错误 | MUGEN 用 left,top,right,bottom（Y 轴反转）；convertAirHitboxes 已处理转换 | 已解决 |
| PNG 异步加载 | sprite 闪烁 | 比赛开始前预加载全部 sprite | 已解决 |
| KOF sprite 版权 | 法律风险 | KOF sprite 仅用于开发/个人研究；KFM（MIT）用于分发 | 需持续注意 |

## 9. 架构影响

**无需架构变更。** sprite 管线直接嵌入现有渲染层：

```text
rendererFighter.ts
  → createHighResRenderer()
    → registerFrames()       (现有：程序化像素数据)
    → registerImageFrames()  (新增：PNG 图像数据)
    → drawFromRegistry()     (现有：像素路径)
    → drawImageFromRegistry() (新增：drawImage 路径)
```

`HighResRenderer` 接口（has, draw, drawAfterimage, drawWinPose）保持不变。上层调用方（rendererFighter.ts）无需修改。
