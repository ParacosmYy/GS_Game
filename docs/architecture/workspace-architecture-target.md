# 工作区目标架构

本文定义项目最终应收敛到的大型工程结构。后续 AI 不得为了短期方便继续把功能堆进现有大文件；所有新工作都必须朝本文结构迁移。

## 1. 架构目标

当前项目已经能运行，但还不像大型项目。目标是把代码、内容、工具、测试、文档分成可替换、可测试、可交接的层。

最终结构应接近：

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

## 2. 当前到目标的迁移原则

- 不做一次性大搬家。
- 新功能优先落到目标架构的新目录。
- 旧文件只在服务 Ryo 主线时逐步抽离。
- 每次迁移都必须保持构建通过。
- 每次迁移都必须保留 fallback。
- 不得把代码搬迁和玩法改动混在同一个提交。

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

## 4. 迁移阶段

### 阶段 A：文档和边界

- 完成本文。
- 完成 [决策门](../process/decision-gates.md)。
- 所有 AI 先按目标结构判断文件归属。

### 阶段 B：Ryo content package

- 新建 `src/content/characters/ryo/`。
- 先迁移数据，不迁移行为。
- 从 `characters/ryo.ts` 中抽出 stats、frameData、pose/animation、feedback。

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
| 入口/组装文件 | 200 行 |
| 单个 simulation 系统 | 300 行 |
| 单个角色数据文件 | 250 行 |
| 单个渲染组件 | 350 行 |
| 单个工具脚本 | 300 行 |
| 单个测试文件 | 300 行 |

超过预算不是立刻重构的理由，但新增代码不得继续扩大超大文件，除非本轮目标就是拆分它。

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
