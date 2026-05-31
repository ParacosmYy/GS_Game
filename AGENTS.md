# AGENTS.md — KOF2002 项目最高执行约束

本文件是所有 AI agent 的第一入口和最高约束。任何 agent 开始工作前必须先读本文件，再按本文链接读取对应执行文档。

## 0. 规则优先级

1. 用户当前明确指令。
2. `AGENTS.md`。
3. `CLAUDE.md`。
4. `docs/process/*`。
5. `docs/product/*`。
6. `docs/architecture/*`。
7. `docs/reference/*`。
8. `README.md`。
9. `docs/archive/*` 仅作历史审计，不参与当前决策。

如果文档冲突：先服从高优先级文档；同时在本轮提交中修正低优先级冲突。

## 1. 当前总方向：MUGEN 资产集成阶段

项目已进入 **MUGEN 资产集成阶段**。核心原则是：

> **从 MUGEN 中来** — MUGEN 文件（SFF/AIR/ACT）是所有 sprite、动画、判定和 palette 数据的唯一真源。工具链负责提取，运行时只消费 manifest。

### 1.1 为什么是 MUGEN 优先

当前项目拥有 60+ 个 Warusaki3 MUGEN 角色（`references/mugen/chars-extracted/warusaki3/characters/`），其中 18 个 KOF2002 角色的 sprite 已提取到 `references/mugen/sprites-kof2002/`。工具链（`parseAir` -> `buildSpriteManifest` -> `convertAirHitboxes` -> `extractCharacterSprites`）已经可以完成 SFF -> PNG -> manifest 的完整转换。

运行时已支持双路径渲染：PNG sprite 优先，程序化帧作为 fallback。这意味着每导入一个角色的 MUGEN 资产，视觉质量就会产生实质性提升，而不是继续靠程序化渲染硬撑"像 KOF"。

当前执行顺序进一步收口为：**先把 Kyo 做成第一套可复制样板，再把同一条资产与内容包链路复制到其他角色**。Ryo 继续保留为合同参照，但不再是当前第一执行目标。

### 1.2 当前资产状态

- **已导入的 MUGEN sprite**：18 个角色（cvskyo 1808 张、cvsryo 1230 张、cvsterry 1407 张、cvskim 1247 张、cvsvice 1950 张、cvsyamazaki 1955 张、cvsg_rugal 2191 张 等），PNG + manifest 已存放在 `public/sprites/`。
- **已有内容包的角色**：Ryo、Kyo、Iori（完整）、Terry、Kim（部分），位于 `src/content/characters/`。
- **角色定义**：28 个 KOF2002 角色在 `src/characters/` 有 roster 定义。
- **工具链**：`parseAir.ts`、`buildSpriteManifest.ts`、`convertAirHitboxes.ts`、`extractCharacterSprites.ts`、`validateManifest.ts`、`validateFrameContract.ts` 等已就位。
- **运行时**：`spriteLoader` + `realSpriteLoader` + `baseHighResRenderer` 支持真实 sprite 加载与渲染。

### 1.3 KOF2002 原版阵容（角色白名单）

本项目只面向 KOF2002 原版出场角色。以下为完整名单：

- **日本队**：Kyo、Benimaru、Daimon
- **饿狼队**：Terry、Andy、Joe
- **龙虎队**：Ryo、Robert、Takuma
- **怒队**：Leona、Ralf、Clark
- **超能力队**：Athena、Kensou、Chin
- **韩国队**：Kim、Chang、Choi
- **女性格斗家队**：Mai、Yuri、May
- **八神队**：Iori、Mature、Vice
- **NESTS 队**：K'、Maxima、Whip
- **大蛇队**：Yashiro、Shermie、Chris
- **额外角色**：Billy、Yamazaki、Kusanagi、Rugal、Omega Rugal

只有上述角色允许被新增或扩展。任何不在名单内的角色，除非用户明确覆盖，否则不得引入。

### 1.4 本阶段的核心工作流

每个 KOF2002 角色的资产集成都必须遵循以下管线：

```text
MUGEN SFF/AIR/ACT（references/mugen/）
  -> extractCharacterSprites（提取 PNG）
  -> buildSpriteManifest（生成 manifest.json）
  -> parseAir + convertAirHitboxes（生成动画与判定数据）
  -> 内容包接入（src/content/characters/<char>/）
  -> 运行时渲染（spriteLoader + baseHighResRenderer）
```

优先级排序：

1. **先做 Kyo**：把 Kyo 的真实 sprite、portrait、animation、hitbox、feedback、moveList 和运行时接入闭合成第一套完整样板。
2. **再复制到其他角色**：把 Kyo 已验证的公共骨架复制到 Ryo / Iori / Terry / Kim 及后续角色。
3. 对已有 MUGEN PNG 但尚未接入运行时的其他角色，优先完成 manifest -> 内容包 -> 运行时链路。
4. 对已有内容包但尚未接入 MUGEN sprite 的角色（Terry、Kim），优先用 MUGEN sprite 替换程序化 fallback。
5. 对 MUGEN 素材库中已有但尚未提取的角色，运行 `extractCharacterSprites` 提取 PNG。
6. 工具链改进和校验补全。
7. 程序化 fallback 的视觉修饰（仅当上述全部完成或本轮无资产可做时）。

### 1.5 本阶段禁止事项

除非用户当前明确覆盖，否则禁止：

- 引入非 KOF2002 原版阵容的角色。
- 在有 MUGEN sprite 可用时继续精修程序化 fallback。
- 给 placeholder 叠特效而不先接入真实 sprite。
- 使用截图、屏幕抓图、静态对照图作为主要迭代方案；截图只能作为展示或辅助验收，不能替代真实资产、manifest 和运行时接入。
- 新增玩法模式。
- 不经决策门直接引入 PixiJS/Godot/Rust/C++。
- 为了评分做无法验收的"看起来变多"改动。
- 把 MUGEN/IKEMEN 的受保护代码或商业素材复制进运行时（只提取 sprite/动画/判定数据）。
- 重写整个引擎。

## 2. 产品目标

目标不是复制正版商业素材，而是做出尽可能接近 KOF2002 街机体验的原创 2D 格斗游戏工程。

优先级固定为：

1. MUGEN 资产管线稳定可复用。
2. 每个角色的 sprite / animation / hitbox / palette 数据完整闭环。
3. 角色气质与肖像可信。
4. 逐帧动作节奏可信。
5. 动作帧、判定帧、命中反馈同源。
6. 输入响应和取消窗口稳定。
7. 打击反馈有重量。
8. 流程与 UI 有街机仪式感。
9. 角色数量按 KOF2002 阵容逐步覆盖。

## 3. 当前技术栈策略

当前技术栈继续使用 TypeScript + Vite + Canvas 2D。

默认不换栈。换栈只能在完成技术栈决策门后进行，规则见 [未来引擎架构](docs/architecture/future-engine-architecture.md)。

当前瓶颈判断：

- 已证实的问题：MUGEN 资产尚未全部接入运行时、部分角色仍依赖程序化 fallback、打击反馈矩阵未完全建立。
- 未证实的问题：Canvas 2D 无法承载目标效果。

因此下一阶段先做资产接入和数据闭环，不用框架名逃避管线问题。

## 4. 每轮强制闭环

每轮必须按以下顺序执行，除非用户明确要求只回答问题：

1. `启动检查`：查看 `git status --short`，识别用户/他人未提交改动，不得误改。
2. `读取约束`：读 `AGENTS.md`、`CLAUDE.md`、[迭代流程](docs/process/iteration-workflow.md)。
3. `自侦测前置`：按 [自侦测前置](docs/process/self-detection.md) 并行调用 3 个自侦测角色，先判定 `green / yellow / red`。
4. `决策门`：按 [决策门](docs/process/decision-gates.md) 判断本轮是否允许实施。自侦测若出现 `yellow` 或 `red`，必须先收敛范围或升级深审。
5. `资产盘点`：确认本轮目标角色在 `references/mugen/sprites-kof2002/` 和 `public/sprites/` 中的状态。如果 PNG 已存在但 manifest/内容包未就位，优先完成管线后半段。
6. `深审协作`：仅当任务属于高风险、跨层、资产管线、角色扩展、打击感、换栈或自侦测非绿时，按 [角色协同模板](docs/process/role-prompts.md) 调用 6-9 个子 agent；最少覆盖 2 架构、4 研发、1 产品、1 测试。
7. `方案`：写清本轮目标、范围、非目标、文件归属、自侦测结论、深审结论（如有）、验收、回退。
8. `实施`：只做本轮闭环，不扩张。
9. `验证`：按 [质量门禁](docs/process/quality-gates.md) 执行。
10. `复盘评分`：按 [评分规则](docs/process/scoring.md) 说明是否 +1。
11. `提交`：按 [Git 规则](docs/process/git-rules.md) 中文 Conventional Commit；如果本轮没有任何文件实改，禁止提交。

补充节奏：

- 每累计 5 个 commit，尝试 push 一次。
- 如果首次 push 失败，继续正常 commit，不要停在推送错误上。
- push 失败要记录原因，后续再补推。

补充 tag 节奏：

- 每累计 5 个 commit，打一个 tag。
- tag 按历史记录口径每次记 `0.01`。
- 累计 10 个 tag 后按 `0.1` 进位。
- 如果首次打 tag 失败，继续正常 commit，后面再补打。
- 只有当本轮实际改动达到至少 `200` 行变更时，才允许形成一个有效 commit；仅验证通过但没有达到改动门槛时，不得为了流程而提交，也不得计入 5 次 commit / 5 次 tag 的节拍。

没有验收标准的改动不得实施。不能说明"更接近 KOF 在哪里"的改动不得加分。

如果工具环境无法创建子 agent，必须显式记录失败原因，并由主 agent 按同样角色清单补齐结论。不得伪造"已调用"。

## 5. 架构铁律

- **MUGEN 管线优先**：所有 sprite、动画、判定、palette 数据必须从 MUGEN 文件（SFF/AIR/ACT）经工具链提取。程序化渲染只作为 fallback。
- 新功能先确定职责域，再写代码。
- 通用逻辑不得认识具体角色名。
- `combat/`、`entities/`、`input/` 不得依赖 `rendering/`、`audio/`、DOM。
- `characters/` 只声明角色数据和招式路由，不承载通用战斗规则。
- 资产解析（SFF/AIR/ACT/PNG）、atlas 生成、palette 处理必须放在工具层（`src/tools/`），不进入浏览器主循环。
- 运行时（`spriteLoader`、`realSpriteRenderer`）只消费 manifest，不直接解析 MUGEN 文件。
- 视觉帧、判定帧、命中反馈必须通过同一个 `Frame Contract` 对齐。
- 程序化像素帧 / 骨骼渲染只能作为 fallback，不得继续冒充正式美术方向。当 MUGEN sprite 可用时，必须用 MUGEN sprite 替换 fallback。
- 通用能力必须先沉淀成公共组件，再允许角色复用；禁止每个角色各写一套"差不多"的私有流程。
- 新状态必须声明归属、生命周期、reset、snapshot/replay 影响。
- 任何状态机如果开始接近单文件 2000 行上限，必须优先拆成 state / transitions / effects / selectors / tests。
- 任何新角色内容都必须优先复用公共基础组件；如果发现要重复写第二遍，先停下来抽公共层。

模块细则见 [模块边界](docs/architecture/module-boundaries.md)，资产细则见 [资产管线架构](docs/architecture/asset-pipeline.md)。

大型项目目标结构见 [工作区目标架构](docs/architecture/workspace-architecture-target.md)。新增目录、迁移文件、拆分大文件前必须先对照该文档。

## 6. 内容包与角色规则

### 6.1 内容包结构

所有角色内容必须收口到对应内容包目录：`src/content/characters/<characterId>/`。

当前已有内容包的角色：

- **Ryo**（`src/content/characters/ryo/`）：基线与合同参照。
- **Kyo**（`src/content/characters/kyo/`）：门面样板角色。
- **Iori**（`src/content/characters/iori/`）：完整内容包。
- **Terry**（`src/content/characters/terry/`）：部分内容包，需 MUGEN sprite 接入。
- **Kim**（`src/content/characters/kim/`）：部分内容包，需 MUGEN sprite 接入。

内容包子目录建议：

- `animations/`：动作帧与 pose（从 AIR 解析）。
- `hitboxes/`：判定数据（从 AIR 解析）。
- `portraits/`：肖像（从 SFF 提取）。
- `feedback/`：命中反馈配置。
- `moves/`：招式路由与命令输入。
- `attacks/`：攻击归类。
- `commands/`：输入与路由。

### 6.2 角色扩展规则

在 MUGEN 资产集成阶段：

- 新增 KOF2002 阵容角色是被允许且鼓励的，但必须通过 MUGEN 提取管线完成。
- 每个新角色必须走完 `SFF -> PNG -> manifest -> 内容包 -> 运行时` 全链路。
- 新角色必须复用公共基础组件（渲染器、输入、反馈、Frame Contract），不得各造私有引擎。
- 新角色接入前，应先确认对应 MUGEN 源文件在 `references/mugen/sprites-kof2002/` 或 `references/mugen/chars-extracted/` 中存在。
- 优先完成已有 MUGEN PNG 但尚未接入的角色，再提取新角色。
- Ryo 继续作为基线与合同参照；Kyo 作为门面样板。

### 6.3 硬规则

- 任何角色相关新增文件，必须写清楚它属于哪一个内容包、哪一个子域、对应哪项 KOF 差距。
- 默认只允许改角色内容包、MUGEN 资产管线、通用打击反馈矩阵、流程/UI 收口和验证工具。
- 任何"全角色优化"必须先证明不会稀释当前资产集成主线。
- 兼容层文件可保留，但新增数据优先进入内容包子目录。
- 当前样板顺序固定为：Kyo 第一，其他角色后续复制；Ryo 仍保留为 baseline。

## 7. MUGEN 工具链

### 7.1 核心工具

| 工具 | 入口 | 职责 |
|------|------|------|
| AIR 解析 | `src/tools/parseAir.ts` | 解析 MUGEN AIR 文件，提取动作帧序列、时间、锚点 |
| Sprite Manifest | `src/tools/buildSpriteManifest.ts` | 从提取的 PNG 生成 manifest.json |
| Hitbox 转换 | `src/tools/convertAirHitboxes.ts` | 将 AIR 中的碰撞体转为项目判定格式 |
| Sprite 提取 | `src/tools/extractCharacterSprites.ts` | 从 SFF 提取角色 sprite 为 PNG |
| Manifest 校验 | `src/tools/validateManifest.ts` | 校验 manifest 完整性和一致性 |
| Frame Contract 校验 | `src/tools/validateFrameContract.ts` | 校验 Frame Contract 数据完整性 |

### 7.2 工具链与运行时的边界

- 工具链产出：PNG sprite、manifest.json、animation data、hitbox data。
- 运行时消费：`spriteLoader` 加载 PNG、`realSpriteRenderer` 渲染、`baseHighResRenderer` 提供双路径 fallback。
- 运行时不得包含 MUGEN 文件解析逻辑。所有解析在构建时或离线完成。
- 当 MUGEN sprite 存在时，渲染器必须优先使用真实 PNG；只有当 PNG 缺失时才降级到程序化 fallback。

### 7.3 资产流水线标准路径

```text
references/mugen/chars-extracted/warusaki3/characters/<char>/
  <char>.sff          -> extractCharacterSprites -> public/sprites/<char>/*.png
  <char>.air          -> parseAir -> animation manifest (帧序列、时间、锚点)
  <char>.act          -> palette 提取 -> palette manifest

public/sprites/<char>/
  manifest.json       -> buildSpriteManifest 生成
  00000_0000.png ...  -> extractCharacterSprites 提取

src/content/characters/<char>/
  index.ts            -> 内容包入口
  animations/         -> AIR 解析后的动画数据
  hitboxes/           -> AIR 解析后的判定数据
  portraits/          -> 肖像数据
```

## 8. Frame Contract

所有动作相关系统必须围绕 `Frame Contract` 对齐。

一个动作帧至少描述：

```ts
interface FrameContract {
  characterId: string;
  actionId: string;
  frameIndex: number;
  duration: number;
  spriteRef: string;
  anchor: { x: number; y: number };
  offset: { x: number; y: number };
  hurtboxes: string[];
  hitboxes: string[];
  eventTags: string[];
}
```

实现时可以拆成多个类型，但语义必须保留：

- `spriteRef` 指向真实 MUGEN sprite 资产（优先）或 fallback。
- `hurtboxes` / `hitboxes` 来自 AIR 解析的判定数据。
- `eventTags` 触发脚步、挥拳、命中、落地等事件。
- combat 不读取 Canvas。
- rendering 不决定命中。
- audio/vfx 只响应事件。

## 9. 质量门禁

提交前至少执行：

```bash
npx tsc --noEmit
npx vite build
```

涉及核心逻辑时还要运行相关 `vitest`。如果工作区已有他人未提交代码导致验证失败，必须说明失败来自哪些未归属改动，不得擅自回滚。

## 10. 文档索引

- [CLAUDE.md](CLAUDE.md)：长期 AI 执行手册。
- [README.md](README.md)：项目入口。
- [KOF 差距矩阵](docs/product/kof-gap-matrix.md)：当前最高优先级差距清单。
- [路线图](docs/product/roadmap.md)：阶段路线。
- [迭代工作区](docs/iteration/README.md)：所有后续迭代文件的统一收纳区。
- [当前架构](docs/architecture/current-architecture.md)：真实结构。
- [模块边界](docs/architecture/module-boundaries.md)：依赖和职责。
- [工作区目标架构](docs/architecture/workspace-architecture-target.md)：大型项目目录目标和迁移阶段。
- [公共基础组件总说明](docs/architecture/public-base-components.md)：帧、反馈、头像、输入、招式表的公共骨架。
- [文件池与状态机拆分约束](docs/architecture/file-pool-and-state-machine.md)：单文件职责、状态机拆分和文件池边界。
- [资产管线架构](docs/architecture/asset-pipeline.md)：MUGEN sprite/portrait/frame/hitbox 管线。
- [未来引擎架构](docs/architecture/future-engine-architecture.md)：换栈决策。
- [角色内容包架构](docs/architecture/character-content-package.md)：每个人物、每个技能、每个攻击的目录归类方式。
- [自侦测前置](docs/process/self-detection.md)：3 人前置快筛。
- [迭代流程](docs/process/iteration-workflow.md)：每轮闭环。
- [决策门](docs/process/decision-gates.md)：新功能、架构迁移、资产、角色、打击感、换栈的允许条件。
- [角色模板](docs/process/role-prompts.md)：PM/玩家/研发/测试/架构师模板。
- [质量门禁](docs/process/quality-gates.md)：验证规则。
- [评分规则](docs/process/scoring.md)：千分制和 +1 规则。
- [Git 规则](docs/process/git-rules.md)：提交规则。
- [格斗游戏工程架构参考](docs/reference/fighting-game-architecture-reference.md)：公开可参考的成熟格斗工程分层。

## 11. 给后续 AI 的执行口令

每次想新增东西前，先问：

> 1. 这是否让某个 KOF2002 角色的 MUGEN 资产管线更完整？
> 2. 如果不是，这是否明确闭合了 [KOF 差距矩阵](docs/product/kof-gap-matrix.md) 中的一项差距？

如果两个答案都不是明确的"是"，不要做。
