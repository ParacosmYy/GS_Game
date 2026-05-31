# 工作区目标架构

本文定义项目最终应收敛到的大型工程结构。后续 AI 不得为了短期方便继续把功能堆进现有大文件；所有新工作都必须朝本文结构迁移。

## 1. 架构目标

当前项目已经能运行，但还不像大型项目。目标是把代码、内容、工具、测试、文档分成可替换、可测试、可交接的层，同时先沉淀公共基础组件，再让角色内容复用这些骨架。

最终工作区结构应接近：

```text
apps/
  web/                    # 浏览器版壳：Vite、Canvas挂载、输入适配
  tools-viewer/           # 本地资产/动画/碰撞盒查看器

packages/
  engine/                 # 可复用通用运行时
  simulation/             # 纯游戏模拟包
  content-schema/         # manifest、Frame Contract、校验 schema
  renderer-canvas2d/      # Canvas2D 渲染后端
  audio-runtime/          # 音频运行时

src/                      # 当前旧结构过渡区，逐步迁出到 apps/packages/content
  app/
  engine/
  simulation/
  content/
  rendering/
  audio/
  toolsRuntime/

content/
  characters/
    ryo/
    kyo/
    iori/
  stages/
  system/

assets/
  source/
    characters/
    stages/
    ui/
    audio/
  generated/
    atlases/
    manifests/
    reports/

data/
  frame-data/
  hitboxes/
  feedback/
  balance/
  localization/

tools/
  asset-pipeline/
  validators/
  reports/
  importers/
  exporters/
  dev-viewers/

state machine 类代码应拆成小文件池，而不是依赖单个巨型文件。

tests/
  unit/
  integration/
  regression/
  content/
  visual/

docs/
  architecture/
  process/
  product/
  reference/
  archive/

reports/
  completeness/
  performance/
  bundle/
  asset-license/

scripts/
  ci/
  local/
  release/

config/
  eslint/
  vite/
  vitest/
  tsconfig/
```

当前代码不需要一次性变成上面结构，但所有新目录和迁移都必须朝这个方向靠拢。

### 1.0.1 单角色内容包优先策略

当前阶段的第一收口对象已经是“多角色内容包 + 统一入口 + Phase 2 可复制管线”。

这意味着：

- Ryo、Kyo、Iori 的定义、stats、commands、frameData、animations、hitboxes、feedback、portraits、completeness 应逐步收拢为统一内容包体系，其中 **Kyo 是当前第一样板**，后续角色应先复制 Kyo 的链路。
- `src/content/index.ts` 和 `src/content/characters/index.ts` 这类 barrel 入口应承担“统一导出”，避免上层继续直连各个分散文件。
- 当前实现已经进入过渡态：兼容入口还在，子域拆分已经开始，后续任务是把真实数据继续搬进这些子域，而不是重新新增一套平面入口。
- 公共基础组件应先于角色私有实现稳定下来，详见 [公共基础组件总说明](public-base-components.md)。
- 运行时只消费该内容包导出的统一数据，不允许同一份内容继续散落在多个互不相干的文件里。
- 其他角色先保持只读参考或兼容校验，不作为目录扩张理由。
- 状态机相关逻辑也要遵循同样原则：状态、转移、副作用、查询、测试拆成不同文件池，不要让一个文件变成新的屎山入口。

角色内容包的目标形态应尽量接近：

```text
src/content/characters/<id>/
  index.ts
  definition.ts
  stats.ts
  commands.ts
  frameData.ts
  animations.ts
  hitboxes.ts
  feedback.ts
  portraits.ts
  completeness.ts
```

如果暂时做不到完全迁移，也必须保持一个明确的“单一真源”方向，不能让任何角色内容继续横向生长成多个来源。

运行时代码内部结构应接近：

```text
src/
  app/                    # 浏览器入口、依赖组装、场景启动
  engine/                 # 通用运行时：loop、time、scene、resource loader
  simulation/             # 纯游戏模拟：input、fighter、physics、combat、replay
  content/                # 可替换内容包：角色、舞台、UI数据、manifest
  rendering/              # 渲染后端和表现层
    canvas2d/
    hud/
    stage/
    debug/
  audio/                  # 音频运行时和事件响应
  toolsRuntime/           # 运行时 manifest 读取、schema 校验轻量入口

assets/
  source/                 # 原始合法资产，不直接由运行时读取
  generated/              # 工具生成的 atlas、json、manifest

tools/
  asset-pipeline/         # atlas、portrait、animation、hitbox、feedback 生成
  validators/             # manifest、Frame Contract、完整度校验
  reports/                # 角色完整度、资源体积、性能预算报告

tests/
  unit/
  integration/
  regression/
  content/
```

## 1.1 关于 SNK / 正版架构参考

正版 SNK 商业游戏的内部工程结构不是公开资料，不能声称已经知道其源码目录或私有工具链。

本项目只能参考这些可合理推断或公开可见的成熟格斗工程模式：

- 街机格斗通常有独立的角色内容包。
- 角色动作、判定、音效、特效、脚本通常由工具链离线产出。
- 运行时通常消费压缩后的资源包、动作表、碰撞表和事件表。
- 调试工具通常能查看当前 state、frame、hitbox、hurtbox、axis、input buffer。
- MUGEN/IKEMEN 等公开工程证明了 data-driven character package 的价值。

因此本项目目标不是“复刻 SNK 源码结构”，而是建立类似成熟商业格斗项目需要的内容生产线和运行时边界。

## 2. 当前到目标的迁移原则

- 不做一次性大搬家。
- 新功能优先落到目标架构的新目录。
- 旧文件只在服务 Phase 2 收口时逐步抽离。
- 每次迁移都必须保持构建通过。
- 每次迁移都必须保留 fallback。
- 不得把代码搬迁和玩法改动混在同一个提交。
- 每次迁移都必须让文件职责更单一，而不是只把文件数量变多。

## 3. 分层职责

### 3.1 `app/`

职责：

- 创建 canvas。
- 组装依赖。
- 启动 game loop。
- 连接场景和输入源。

禁止：

- 写 combat 规则。
- 写角色专属逻辑。
- 写具体渲染细节。

### 3.2 `engine/`

职责：

- 固定步长循环。
- 时间管理。
- 场景切换。
- 资源加载接口。
- debug/runtime flags。

禁止：

- 认识 Kyo/Ryo/Iori。
- 写 KOF 规则。
- 决定 hitbox。

### 3.3 `simulation/`

职责：

- Fighter 状态。
- 物理。
- 输入解析。
- combat hit resolution。
- replay/snapshot。
- determinism。

禁止：

- 导入 Canvas。
- 播放声音。
- 绘制 VFX。
- 读取 DOM。

### 3.4 `content/`

职责：

- 角色包。
- 舞台包。
- frame data。
- animation manifest。
- hitbox manifest。
- feedback manifest。
- portrait manifest。

Ryo 目标结构：

```text
src/content/characters/ryo/
  index.ts
  definition.ts
  stats.ts
  commands.ts
  frameData.ts
  animations.ts
  hitboxes.ts
  feedback.ts
  portraits.ts
  completeness.ts
```

禁止：

- 写通用 combat 算法。
- 直接调用 Canvas。
- 直接播放音效。
- 把 Ryo 专属数据继续拆散到多个顶层目录里。

### 3.5 `rendering/`

职责：

- 读取渲染快照。
- 绘制 sprite、HUD、stage、debug overlays。
- 显示 hitbox/hurtbox，但不决定判定。

目标结构：

```text
src/rendering/
  canvas2d/
    renderer.ts
    spriteBatch.ts
    fighterRenderer.ts
  hud/
  stage/
  debug/
```

禁止：

- 写战斗结果。
- 私自计算 hitbox。
- 让 placeholder 成为正式表现方向。

### 3.6 `audio/`

职责：

- 响应 simulation 事件。
- 播放 hit、block、jump、land、KO、announcer。
- 管理采样、BGM、音量。

禁止：

- 决定是否命中。
- 改 Fighter 状态。

### 3.7 `tools/`

职责：

- 生成 atlas。
- 生成 manifest。
- 校验 Frame Contract。
- 生成完整度报告。
- 资源授权/来源报告。

禁止：

- 被浏览器运行时直接导入。

### 3.8 `content/characters/<id>/`

职责：

- 一个角色一个目录。
- 角色目录内只放该角色数据、manifest、动作定义和完整度声明。
- 任一角色达标后，其他角色复制目录模板，不复制具体动作。

目标结构：

```text
content/characters/<id>/
  character.json
  portraits.manifest.json
  sprites.manifest.json
  animations.manifest.json
  hitboxes.manifest.json
  feedback.manifest.json
  commands.ts
  definition.ts
  completeness.ts
  README.md
```

在 `src/content/characters/<id>/` 的过渡结构中，推荐继续细分为：

```text
src/content/characters/ryo/
  definition.ts
  stats.ts
  completeness.ts
  commands/
  moves/
  attacks/
  animations/
  hitboxes/
  feedback/
  portraits/
  reports/
```

这样可以把“人物定义”“技能说明”“普通攻击”“动作帧”“判定”“反馈”“肖像”“完整度报告”拆到不同目录，避免继续堆在一个大文件里。

### 3.9 `reports/`

职责：

- 生成给 AI 和人看的审计结果。
- 不参与运行时。

关键报告：

- 角色完整度。
- manifest 校验。
- 资源授权。
- bundle 体积。
- 性能预算。

## 4. 迁移阶段

### 阶段 A：文档和边界

- 完成本文。
- 完成 [决策门](../process/decision-gates.md)。
- 所有 AI 先按目标结构判断文件归属。

### 阶段 B：Ryo content package

- 新建 `src/content/characters/ryo/` 或 `content/characters/ryo/` 的过渡目录。
- 先迁移数据，不迁移行为。
- 从 `characters/ryo.ts` 中抽出 stats、frameData、pose/animation、feedback。

### 阶段 B.5：工作区根目录扩充

- 建立 `content/`、`assets/`、`data/`、`tools/`、`reports/`、`scripts/`、`config/` 的空目录或 README。
- 每个目录必须有职责说明。
- 不允许创建没有用途说明的空文件夹。

### 阶段 C：Frame Contract

- 定义 contract 类型。
- Ryo `idle/stand_a/stand_c/hurt/knockdown` 先接入。
- debug overlay 从 contract 读取数据。

### 阶段 D：asset pipeline

- 建立 `tools/asset-pipeline/`。
- 建立 `assets/source/ryo` 和 `assets/generated/ryo`。
- 添加 manifest 校验。

### 阶段 E：simulation 分层

- 从 `entities/`、`combat/`、`input/` 逐步形成 `simulation/`。
- 保持旧路径 re-export，避免一次性改爆。

### 阶段 F：rendering 分层

- 把 `rendering/` 中巨大文件拆成 `canvas2d/hud/stage/debug`。
- 所有拆分必须只读 snapshot/manifest。

## 5. 文件大小预算

目标预算：

| 类型 | 目标上限 |
| --- | ---: |
| 单个文件硬上限 | 2000 行 |
| 入口/组装文件 | 200 行 |
| `main.ts` / 启动壳 | 100 行 |
| 单个 simulation 系统 | 300 行 |
| 单个角色数据文件 | 250 行 |
| 单个渲染组件 | 350 行 |
| 单个工具脚本 | 300 行 |
| 单个测试文件 | 300 行 |

超过预算不是立刻重构的理由，但新增代码不得继续扩大超大文件，除非本轮目标就是拆分它。

其中 `main.ts` 只能承担最小化启动与组装职责，不允许变成状态机、流程调度器或角色逻辑容器；一旦 `main.ts` 继续膨胀，优先拆 `state / transitions / effects` 再回收入口。

## 6. 验收标准

一次架构迁移提交必须满足：

- 说明旧位置和新位置。
- 说明依赖方向没有变坏。
- 说明是否保留兼容 re-export。
- 运行 `npx tsc --noEmit`。
- 运行 `npx vite build`。
- 涉及逻辑时运行相关测试。

## 7. 禁止事项

- 禁止以“大型项目标准”为名做无目标大重构。
- 禁止一次搬多个领域。
- 禁止同时搬架构和改玩法。
- 禁止删除 fallback。
- 禁止让工具层进入浏览器主循环。
- 禁止把未确认许可资源纳入 `assets/generated`。
