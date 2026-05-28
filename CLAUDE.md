# CLAUDE.md — 长期 AI 执行手册

本文件是长期协作 AI 的详细执行手册。`AGENTS.md` 是最高约束，本文件负责把约束转成每轮可执行动作。

## 1. 一句话方向

当前项目已进入 **MUGEN 资产集成阶段**，执行口径统一为：

> **从 MUGEN 中来** -- MUGEN 文件（SFF/AIR/ACT）是所有 sprite、动画、判定和 palette 数据的唯一真源。工具链负责提取，运行时只消费 manifest。

补充执行原则：

- 所有角色通过 MUGEN 提取管线统一接入，运行时只消费 manifest JSON。
- 程序化像素帧 / 骨骼渲染只作为 fallback，当 MUGEN sprite 可用时必须替换。
- 公共骨架优先于角色私有实现；如果某个能力会被第二个角色复用，就应该先抽公共层。
- 所有内容优先向各自内容包收口，不允许在多个目录之间横向散落。
- 当前最高优先级是按 [KOF 差距矩阵](docs/product/kof-gap-matrix.md) 逐项闭合真实差距。
- 差距闭合的标准是 MUGEN 管线数据到位，纯程序化/fallback 方案不构成闭合。
- 只有 KOF2002 原版阵容角色（约 44 人）在范围内。
- 后续新功能优先从差距矩阵里找目标，而不是从"我还想加什么"开始。

当前真实代码状态：

- `src/content/characters/` 下 5 个角色有完整内容包（Ryo/Kyo/Iori/Terry/Kim）。
- `public/sprites/` 下 17 个角色目录共 26,793 张 PNG + manifest。
- `src/tools/` 下 MUGEN 提取工具链已完整：parseAir、buildSpriteManifest、convertAirHitboxes、extractCharacterSprites。
- 运行时双路径渲染：PNG sprite 优先，程序化帧 fallback。
- 28 个角色有 roster 定义，10,000+ 测试全部通过。
- 版本 v3.05，316 个 tag。

## 2. 为什么要走 MUGEN-First

项目已经完成了从"手工拼凑"到"管线驱动"的跨越：

- **工具链已经就位且经过验证**：extractCharacterSprites 从 SFF 提取 PNG，parseAir 解析 AIR 动画帧，convertAirHitboxes 转换 Clsn 判定，buildSpriteManifest 生成 manifest。这条链路已经被 17 个角色、26,793 张 PNG 验证过。
- **资产已经批量导入**：17 个角色目录已有 PNG + manifest，MUGEN hitbox 数据覆盖全 17 角色共 37,126 行。
- **运行时已经支持双路径**：spriteLoader + realSpriteLoader + baseHighResRenderer 提供 PNG 优先、fallback 降级的渲染路径。
- **继续精修程序化像素帧是零和博弈**：每多花一分钟调骨架假人的像素块，就少一分钟把真实 MUGEN sprite 接入运行时。真实 sprite 的视觉质量提升远超任何程序化修饰。
- **管线已经是可复制的**：新角色接入走同一条 extractCharacterSprites -> manifest -> 内容包 -> 运行时链路，不需要每个角色各搞一套。

因此后续 agent 必须从"多点优化"改成"MUGEN 管线闭环"。

## 3. 当前主线

主线名称：`MUGEN Asset Integration Phase`。

主线目标：

- 完成全部 17 个已有 PNG 角色的 MUGEN sprite 运行时接入（animations.json + hitboxes.json 消费）。
- 扩展 MUGEN 提取覆盖到更多 KOF2002 阵容角色。
- 用 MUGEN AIR 动画数据和 Clsn 判定数据替换手写帧序列和判定框。
- 深化打击反馈和取消系统，使 MUGEN 帧数据真正驱动游戏体验。
- 把程序化 fallback 降级为纯兜底，确保所有视觉表现走 MUGEN 数据。

优先级文档：[KOF 差距矩阵](docs/product/kof-gap-matrix.md)。

主线执行优先级（按差距矩阵 Tier 0 排序）：

1. AIR 解析管线端到端：parseAir + convertAirHitboxes 输出持久化为 animations.json / hitboxes.json。
2. 运行时消费 MUGEN 动画和判定数据，替换手写数据。
3. 通常技 action number 映射系统化。
4. 为已有 SFF 源但未提取的角色运行管线。
5. 为缺失源文件的角色寻找替代 MUGEN 角色包。
6. 内容包基于 MUGEN 数据重建。
7. 视觉与流程打磨。

## 4. 每轮启动脚本

每轮开始必须按顺序做：

1. 查看 `git status --short`。
2. 如果存在非本轮改动，记录它们，绝不回滚。
3. 阅读：
   - `AGENTS.md`
   - `CLAUDE.md`
   - `docs/product/kof-gap-matrix.md`
   - `docs/process/iteration-workflow.md`
   - `docs/process/decision-gates.md`
   - `docs/architecture/workspace-architecture-target.md`
   - 本轮相关架构/产品文档
4. MUGEN 管线状态检查：确认本轮目标角色在 `public/sprites/` 和 `references/mugen/` 中的状态。如果 PNG 已存在但 manifest/内容包未就位，优先完成管线后半段。
5. 判断本轮属于哪一类：
   - MUGEN 管线（提取/manifest/动画/判定）
   - 运行时接入（sprite 加载/渲染/动作映射）
   - 内容包（角色数据/判定/反馈/取消路径）
   - 打击反馈与 VFX
   - 流程与场景仪式感
   - 验收工具与校验
   - 文档约束
6. 先执行 [自侦测前置](docs/process/self-detection.md) 的 3 个角色：架构、研发、产品。
7. 只有自侦测通过，才决定是否需要升级到深审编队。
8. 输出本轮 PM/玩家/研发/测试/架构结论。
9. 写方案后再实施。

## 4.0 自侦测前置

每轮默认先调用 3 个自侦测子 agent：

- 架构自检：总架构与边界。
- 研发自检：simulation / combat / 文件影响面。
- 产品自检：玩家价值、范围、验收。

如果三者出现 `yellow` 或 `red`，先通过 [决策门](docs/process/decision-gates.md) 再决定是否升级。

## 4.1 深审编队

当任务涉及换栈、大迁移、资产管线、角色扩展、打击感，或自侦测未全绿时，再调用 6-9 个并行子 agent：

- 架构师 A：总架构与边界。
- 架构师 B：Frame Contract 与资产管线。
- 研发 A：simulation / combat。
- 研发 B：content / character。
- 研发 C：rendering / animation。
- 研发 D：tools / asset pipeline。
- 产品经理：玩家价值、范围、验收。
- 测试负责人：自动测试、手测、回归风险。

允许范围是 6-9 个子 agent。低于 6 个视为流程不完整。涉及换栈、大迁移、资产管线时建议增加第 9 个"参考研究员"或"发布集成负责人"。

如果当前工具环境无法创建子 agent，必须写明原因，并在主线程按同样角色逐项输出结论。不能假装已经并行调用。

## 4.1.1 资产优先规则

MUGEN 资产导入管线已基本建成，当前优先级从"建管线"转向"填管线"。只要本轮能推进以下任何一项，就应优先于继续精修程序化 fallback 或表面参数：

- AIR 动画数据端到端输出：parseAir -> animations.json -> 运行时消费。
- AIR Clsn 判定数据端到端输出：convertAirHitboxes -> hitboxes.json -> 运行时消费。
- 通常技 action number 到 AttackType 的系统化映射。
- 已有 PNG 角色的运行时 sprite 配置补全。
- 缺失 MUGEN 源的角色寻找替代角色包并提取。
- 内容包基于 MUGEN 数据重建而非手写。

推荐执行顺序：

1. 先确认目标角色的 MUGEN 源文件可用性。
2. 运行 extractCharacterSprites 提取 PNG（如尚未提取）。
3. 运行 parseAir + convertAirHitboxes 生成动画和判定数据。
4. 完成 manifest -> 内容包 -> 运行时链路。
5. 最后才考虑 fallback 的视觉修饰。

## 4.2 大型项目化方向

所有后续迁移都必须朝 [工作区目标架构](docs/architecture/workspace-architecture-target.md) 收敛：

- `app/` 只负责启动和依赖组装。
- `engine/` 只负责通用运行时。
- `simulation/` 只负责纯游戏模拟。
- `content/` 承载角色、舞台、manifest 和 frame contract 数据。
- `rendering/` 只读快照和 manifest。
- `audio/` 只响应事件。
- `tools/` 负责离线资产生成、校验和报告。
- 公共基础组件的具体清单见 [公共基础组件总说明](docs/architecture/public-base-components.md)。

不要为了"显得大型"做大搬家。每次只迁移一个领域，并通过 [决策门](docs/process/decision-gates.md) 验收。

所有"后续要继续迭代"的文件、草案、待办、交接和归档，统一放进 [迭代工作区](docs/iteration/README.md)：

- `docs/iteration/active.md`：当前正在推进的内容。
- `docs/iteration/backlog.md`：未进入本轮的候选项。
- `docs/iteration/handoff.md`：交接给下一位 AI 的固定说明。
- `docs/iteration/archive/`：已完成历史记录。

不要把迭代草案散落到仓库根目录、临时 markdown、或无归属的新文档里。

## 4.3 角色收口规则

所有 KOF2002 阵容角色均通过 MUGEN 提取管线统一接入。内容包 = MUGEN 提取结果 + 游戏逻辑层。

每轮若涉及角色内容，必须先回答：

- 这件事是否推进了某个 KOF2002 角色的 MUGEN 管线完整度？
- 这件事能否收进该角色的单一内容包边界？
- 这件事是否会让代码/资产从"散点"变成"单点真源"？

如果答案不清楚，先停，不要横向扩新目录。

每个角色的内容归属是 `src/content/characters/<characterId>/`。即使当前仍有历史文件留在旧位置，也只能作为过渡层存在，不得把新数据继续分散进更多位置。

内容包子目录结构：

- `commands/`：输入与路由。
- `moves/`：技能与招式说明。
- `attacks/`：普通攻击与攻击归类。
- `animations/`：动作帧与 pose（从 AIR 解析）。
- `hitboxes/`：判定（从 AIR Clsn 提取）。
- `feedback/`：命中反馈配置。
- `portraits/`：肖像（从 SFF 9000,0 提取）。
- `reports/`：完整度和验收结果。

新增任何角色内容时，先问自己属于哪一类，再决定放哪一个子目录。

当前已有内容包的角色：Ryo、Kyo、Iori（完整）、Terry、Kim（部分）。Ryo 继续作为基线与合同参照。

## 4.4 文件池与状态机拆分规则

所谓"文件池"，不是把很多代码文件堆在一起，而是把同一职责域拆成可以单独替换、单独测试、单独拼接的最小文件集合。

每个状态机文件都应尽量遵循：

- `state.ts` 只管状态数据。
- `transitions.ts` 只管状态流转。
- `effects.ts` 只管副作用触发。
- `selectors.ts` 只管只读查询。
- `tests/*.test.ts` 只管验证。

禁止把下面这些内容长期塞在一个文件里：

- 状态定义 + 转移规则 + 渲染逻辑。
- 输入解析 + 战斗判定 + 音频触发。
- 角色数据 + 通用规则 + UI 绘制。

如果一个文件已经变成"梦文件"，优先按职责拆成文件池，而不是继续在里面堆分支。
如果一个文件接近或超过 2000 行，优先拆分，不要继续做"临时压缩"。

## 5. 每轮禁止事项

除非用户当前明确覆盖，否则禁止：

- 添加非 KOF2002 原版阵容的角色。
- 不经 MUGEN 提取管线接入新角色（每个角色必须走 SFF -> PNG -> manifest -> 内容包 -> 运行时全链路）。
- 在有 MUGEN sprite 可用时继续精修程序化 fallback。
- 新增玩法模式。
- 重写整个引擎。
- 不经决策门直接引入 PixiJS/Godot/Rust/C++。
- 为了评分做无法验收的"看起来变多"改动。
- 把 MUGEN/IKEMEN/QF 的商业素材或受保护代码复制进运行时（只提取 sprite/动画/判定数据）。

## 6. 每轮必须产出的方案

实施前必须写：

```text
本轮目标：
- ...

主线归属：
- MUGEN 管线 / 运行时接入 / 内容包 / 打击反馈 / 流程仪式感 / 验收工具 / 文档约束

PM 结论：
- 玩家会感到哪里变好？

玩家结论：
- 当前最刺眼的问题是什么？

研发方案：
- 改哪些文件？
- 不改哪些文件？

测试方案：
- 自动测试是什么？
- 手测路径是什么？

架构结论：
- 是否保持 Frame Contract？
- 是否保持运行时和工具链分离？
- 是否符合工作区目标架构？
- 是否通过对应决策门？

验收标准：
- ...

回退方案：
- ...
```

## 7. 角色接入验收标准

所有 KOF2002 阵容角色通过 MUGEN 管线接入时，必须满足以下标准。标准不区分角色，所有角色统一要求。

### 7.1 肖像

- 选人、HUD、胜利至少有明确尺寸规范。
- 肖像优先从 MUGEN SFF 9000,0 sprite 提取。
- 肖像 manifest 必须能替换资产而不改 UI 逻辑。

### 7.2 动作

第一批核心动作：

- `idle`、`walk_forward`、`walk_backward`、`jump`
- `stand_a`、`stand_c`、`crouch_a`、`crouch_c`
- `hurt`、`knockdown`

每个动作必须有：

- MUGEN AIR 源的帧序列和 duration。
- anchor 和视觉 offset。
- 对应 spriteRef 指向真实 PNG。
- 可选 hurtbox/hitbox（来自 AIR Clsn）。
- 对应 frame data 或说明。

### 7.3 判定

- startup/active/recovery 与 MUGEN 动画帧对齐。
- hitbox/hurtbox 来自 AIR Clsn 数据，不手写。
- 判定数据可以被测试读取。
- 调试框只读取判定数据，不成为判定来源。

### 7.4 打击反馈

至少建立三档：

- light：短 hitstop，小 spark，小 pushback。
- heavy：更长 hitstop，更明显受击和 shake。
- special：专属 spark、音效、位移或残影。

每档必须绑定到 hit event，而不是散落在渲染函数里。

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
- `hurtboxes` / `hitboxes` 来自 AIR 解析的 Clsn 判定数据。
- `eventTags` 触发脚步、挥拳、命中、落地等事件。
- combat 不读取 Canvas。
- rendering 不决定命中。
- audio/vfx 只响应事件。

## 9. MUGEN 资产管线

运行时只消费 manifest。MUGEN 文件解析、PNG 提取、判定转换都在工具层完成。

### 9.1 核心工具链

| 工具 | 入口 | 职责 |
|------|------|------|
| AIR 解析 | `src/tools/parseAir.ts` | 解析 MUGEN AIR 文件，提取动作帧序列、时间、锚点 |
| Sprite 提取 | `src/tools/extractCharacterSprites.ts` | 从 SFF 提取角色 sprite 为 PNG |
| Sprite Manifest | `src/tools/buildSpriteManifest.ts` | 从提取的 PNG 生成 manifest.json |
| Hitbox 转换 | `src/tools/convertAirHitboxes.ts` | 将 AIR Clsn 碰撞体转为项目判定格式 |
| Atlas 打包 | `src/tools/buildSpriteAtlas.ts` | 16 角色 atlas.json + shelf 装箱算法 |
| 动画时间对比 | `src/tools/compareAnimTiming.ts` | manifest timing vs hitbox timing 逐动作对比 |
| Manifest 校验 | `src/tools/validateManifest.ts` / `validateManifests.ts` | 校验 manifest 完整性和一致性 |
| Frame Contract 校验 | `src/tools/validateFrameContract.ts` | 校验 Frame Contract 数据完整性 |
| 完整度报告 | `src/tools/characterCompletenessReport.ts` / `multiCharReport.ts` | 角色完整度评分 |
| 多角色验证 | `src/tools/multiCharValidation.ts` | 跨角色一致性校验 |

### 9.2 资产流水线标准路径

```text
MUGEN 源文件
  references/mugen/chars-extracted/warusaki3/characters/<char>/
    <char>.sff  ->  extractCharacterSprites  ->  public/sprites/<char>/*.png
    <char>.air  ->  parseAir                 ->  animation manifest (帧序列+duration)
    <char>.air  ->  convertAirHitboxes       ->  hitbox manifest (Clsn 判定框)
    <char>.act  ->  palette 提取             ->  palette manifest

产出物
  public/sprites/<char>/
    manifest.json       (buildSpriteManifest 生成)
    00000_0000.png ...  (extractCharacterSprites 提取)

内容包接入
  src/content/characters/<char>/
    index.ts            内容包入口
    animations/         AIR 解析后的动画数据
    hitboxes/           AIR 解析后的判定数据
    portraits/          肖像数据
    attacks/            攻击归类
    commands/           输入路由
    feedback/           命中反馈配置
    moves/              招式路由与命令输入
```

### 9.3 运行时消费路径

- `spriteLoader.ts` 加载 PNG sprite。
- `realSpriteLoader.ts` 提供通用 manifest -> sprite 映射。
- `baseHighResRenderer.ts` 提供双路径：PNG 优先、程序化 fallback。
- `mugenHitboxLoader.ts` 加载 MUGEN Clsn hitbox 数据。
- `mugenHurtboxLoader.ts` 加载 MUGEN Clsn hurtbox 数据。
- `animStateSync.ts` 动画状态同步 + MUGEN 帧索引映射。
- `characterSpriteRegistry.ts` + `characterSpriteConfigs.ts` 角色注册与配置。

运行时不得包含 MUGEN 文件解析逻辑。所有解析在构建时或离线完成。

## 10. 技术栈决策

当前不要因为"不像 KOF"直接换栈。

换栈前必须满足：

- 全部已有角色已用 MUGEN sprite 替换 fallback。
- Canvas 2D 在真实资产下出现可复现性能或能力瓶颈。
- combat/input/state 已经和 rendering 解耦。
- 迁移方案能保留角色数据和 frame contract。

如果只是 placeholder 丑，换 PixiJS/Godot 也不会变成 KOF。先用 MUGEN 真实 sprite 把视觉质量拉上去，再判断是否需要换栈。

## 11. 评分规则

每轮最多 +1。

可加分条件：

- 推进了某个 KOF2002 角色的 MUGEN 管线完整度（提取/动画/判定/运行时接入）。
- 降低了资产/动作/判定/反馈管线风险。
- 修复了阻碍 MUGEN 管线闭环的稳定性问题。
- 让约束文档更能防止跑偏。

不可加分：

- 不经 MUGEN 管线横向扩角色。
- 无验收标准的泛泛优化。
- 构建失败。
- 只让程序化 fallback 更花而不推进 MUGEN 接入。
- 不能说明更接近 KOF 在哪里。

## 12. 提交规则

每轮一个 commit，但前提是本轮存在实质文件改动；如果本轮只是验证通过、没有任何文件变更，禁止为了流程强行提交。

每次 commit 前还必须满足最低改动门槛：

- 本轮用于提交的有效改动必须达到至少 `200` 行变更，以 `git diff --shortstat` 的新增+删除总和为准。
- 如果没有达到这个门槛，即使验证通过，也只记录结果，不提交。

标题：

```text
type(scope): 中文标题
```

正文必须包含：

```text
原因：
- ...

差异：
- ...

验证：
- ...

风险：
- ...
```

额外节奏要求：

- 每累计 5 个 commit，尝试 push 一次。
- 如果首次 push 失败，不要停工等推送修好，继续按正常节奏 commit。
- push 可以在后续节点重试，但不要为了 push 打断迭代闭环。

额外 tag 节奏：

- 每累计 5 个 commit，打一个 tag。
- tag 用来记录阶段里程碑，不替代 commit。
- tag 的历史记录口径按 `0.01` 递增，累计 10 个 tag 后按 `0.1` 进位。
- 如果首次打 tag 失败，继续正常 commit，后面再补打。
- 只有在累计到 5 个有效 commit 后，才允许打一个 tag；如果中途 commit 不满足最低改动门槛，则不计入这 5 次。

如果工作区有他人改动，只 stage 本轮文件。

## 13. KOF2002 角色白名单

本项目只面向 KOF2002 原版出场角色。只有以下角色允许被新增或扩展：

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

任何不在名单内的角色，除非用户明确覆盖，否则不得引入。

## 14. 给后续 AI 的执行口令

每次想新增东西前，先问：

> 1. 这是否推进了某个 KOF2002 角色的 MUGEN 管线完整度？
> 2. 如果不是，这是否明确闭合了 [KOF 差距矩阵](docs/product/kof-gap-matrix.md) 中的一项差距？

如果两个答案都不是明确的"是"，不要做。
