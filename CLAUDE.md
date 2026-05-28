# CLAUDE.md — 长期 AI 执行手册

本文件是长期协作 AI 的详细执行手册。`AGENTS.md` 是最高约束，本文件负责把约束转成每轮可执行动作。

## 1. 一句话方向

不要继续横向堆角色和 placeholder。当前项目已经进入 Phase 2，执行口径应收敛到：

> 先沉淀公共基础组件，再以 Ryo 为基线完成单角色样板闭环；当前最优先的门面样板角色是 Kyo，Kyo/Iori 只在不会破坏公共骨架的前提下继续接入。

Ryo 仍是基线和质量参照，但样板目标已经从“只做角色”升级为“角色 + 公共骨架 + 可复制模板”。当前对外最值得做精的样板角色是 Kyo；Ryo 继续承担合同和数据基线角色。Kyo/Iori 已进入内容包与运行时接入阶段，但它们的存在不应反向破坏公共组件复用。

补充执行原则：

- 先把一个人物做精，再做其他人物，但前提是这个人物的所有表现都走同一套公共骨架。当前优先把 Kyo 做成门面样板，同时让 Ryo 保持基线与合同参照。
- 所有内容优先向各自内容包收口，不允许在多个目录之间横向散落。
- 公共骨架优先于角色私有实现；如果某个能力会被第二个角色复用，就应该先抽公共层。
- 目录整理的目标不是“看起来更整齐”，而是让动作、肖像、判定、反馈、报告都能在内容包里复用。
- 当前最高优先级是按 [KOF 差距矩阵](docs/product/kof-gap-matrix.md) 逐项闭合真实差距，而不是继续堆“看起来更完整”的功能。
- 在所有差距里，资产优先级最高：真实 sprite / portrait / atlas / palette 的导入与接入，优先于继续抠骨架假人、placeholder 特效或表面参数。
- 真实差距的闭合方式不是先写角色专属代码，而是先把公共 schema、公共渲染器、公共输入和公共校验搭起来。
- 如果项目当前处在 Phase 2 或多角色阶段，也必须先对齐差距矩阵，再决定具体补内容包、流程 UI，还是补通用管线。

当前真实代码已经进入“多角色内容包 + 统一入口”的过渡阶段：

- `src/content/index.ts` 是内容包顶层统一入口。
- `src/content/characters/index.ts` 汇总 Ryo / Kyo / Iori 内容包导出。
- `src/content/characters/ryo/`、`src/content/characters/kyo/`、`src/content/characters/iori/` 里已经存在按职责拆分的分层入口。
- `docs/architecture/public-base-components.md` 描述了所有角色必须共用的底座。
- 兼容层文件仍可保留，但新增数据优先进入子目录或同名职责文件。
- `src/tools/validateManifest.ts` 这类校验工具应作为内容包闭环的一部分，而不是临时脚本。
- 后续新功能优先从差距矩阵里找目标，而不是从“我还想加什么”开始。
- 所有“文件池”都必须按职责拆分，状态机文件不得把状态、转移、副作用、渲染混成一个大文件。
- 默认任何单个文件都不应超过 2000 行；`main.ts` 必须更小，只能承担启动和组装职责。

## 2. 为什么要改方向

现状问题不是“优化不够”，而是优化分散：

- 角色内容包已经有多角色入口，但多角色之间的体验和完整度仍不一致。
- frame data 有不少，但视觉帧仍存在 placeholder 和程序化 fallback。
- 肖像 manifest 有结构，但还需要继续向正式资源闭环推进。
- 骨骼/像素块渲染继续存在，导致部分角色气质不像 SNK/KOF。
- 最快提升视觉质量的路径是把真实合法 sprite 资产导入现有管线，而不是继续靠骨架假人和程序化轮廓修饰。
- 打击感有 hitstop、spark、shake 等组件，但没有按攻击类型形成统一反馈矩阵。
- Phase 2 已经从“角色闭环”转入“流程仪式感 + 多角色复制管线”阶段，但文档如果继续写成单角色主线，就会和真实代码状态脱节。
- 技术栈不是当前第一瓶颈，资产生产线和内容包边界才是。

因此后续 agent 必须从“多点优化”改成“样板线闭环”。

## 3. 当前主线

主线名称：`Phase 2 Multi-Role Closure`。

主线目标：

- 让 Ryo 继续作为 baseline 和验收参照。
- 把 Kyo/Iori 内容包、街机流程、菜单/UI、流程仪式感推进到可复制模板。
- 用统一 content loader / manifest / frame contract 验证多角色资产格式、动作格式、判定格式和反馈格式。
- 把骨骼/placeholder 降级为 fallback。
- 优先把合法或公开可用的 sprite / portrait 资源接进来，再考虑骨架细节优化。
- 形成可以复制给后续角色的生产模板。

主线基线文档：[docs/product/ryo-vertical-slice-plan.md](docs/product/ryo-vertical-slice-plan.md)。
当前优先级文档：[docs/product/kof-gap-matrix.md](docs/product/kof-gap-matrix.md)。

## 4. 每轮启动脚本

每轮开始必须按顺序做：

1. 查看 `git status --short`。
2. 如果存在非本轮改动，记录它们，绝不回滚。
3. 阅读：
   - `AGENTS.md`
   - `CLAUDE.md`
   - `docs/product/ryo-vertical-slice-plan.md`
   - `docs/process/iteration-workflow.md`
   - `docs/process/decision-gates.md`
   - `docs/architecture/workspace-architecture-target.md`
   - 本轮相关架构/产品文档
4. 判断本轮属于哪一类：
   - 资产格式
   - 肖像
   - 动作帧
   - 判定帧
   - 命中反馈
   - 验收工具
   - 文档约束
   - 流程与场景仪式感
   - 多角色内容包
5. 先执行 [自侦测前置](docs/process/self-detection.md) 的 3 个角色：架构、研发、产品。
6. 只有自侦测通过，才决定是否需要升级到深审编队。
7. 输出本轮 PM/玩家/研发/测试/架构结论。
8. 写方案后再实施。

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

允许范围是 6-9 个子 agent。低于 6 个视为流程不完整。涉及换栈、大迁移、资产管线时建议增加第 9 个“参考研究员”或“发布集成负责人”。

如果当前工具环境无法创建子 agent，必须写明原因，并在主线程按同样角色逐项输出结论。不能假装已经并行调用。

## 4.1.1 资产优先规则

本项目当前最高优先级的最高优先级是资产导入与资产接入。只要本轮能推进以下任何一项，就应优先于继续抠骨架假人、placeholder 特效或渲染表面参数：

- 资产来源确认。
- SFF / ACT / palette 解析。
- sprite atlas / portrait manifest 生成。
- Frame Contract / animation manifest 对齐。
- 运行时接入与校验工具补全。

推荐执行顺序：

1. 先确认资源合法性与可用性。
2. 再做 SFF / ACT / palette 解析。
3. 再生成 manifest 与 atlas。
4. 再接入运行时。
5. 最后才考虑骨架 fallback 的美观度修饰。

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
- 资产导入管线优先级高于继续修改运行时骨架；如果能从公开/合法资源中解析出 sprite / portrait / palette，就先落工具层。

不要为了“显得大型”做大搬家。每次只迁移一个领域，并通过 [决策门](docs/process/decision-gates.md) 验收。

所有“后续要继续迭代”的文件、草案、待办、交接和归档，统一放进 [迭代工作区](docs/iteration/README.md)：

- `docs/iteration/active.md`：当前正在推进的内容。
- `docs/iteration/backlog.md`：未进入本轮的候选项。
- `docs/iteration/handoff.md`：交接给下一位 AI 的固定说明。
- `docs/iteration/archive/`：已完成历史记录。

不要把迭代草案散落到仓库根目录、临时 markdown、或无归属的新文档里。

## 4.3 单角色收口规则

当前允许被持续打磨的样板角色优先是 Kyo；Ryo 继续作为基线与合同参照。

每轮若涉及角色内容，必须先回答：

- 这件事是否直接服务当前样板角色的闭环？
- 这件事能否收进当前样板角色的单一内容边界？
- 这件事是否会让代码/资产从“散点”变成“单点真源”？

如果答案不清楚，先停，不要横向扩新目录。

Ryo 相关内容的目标归属是 `src/content/characters/ryo/` 方向，Kyo 的样板内容则优先收口到 `src/content/characters/kyo/` 方向。即使当前仍有历史文件留在旧位置，也只能作为过渡层存在，不得把新的角色数据继续分散进更多位置。

更细的目录切分建议是：

- `commands/`：输入与路由。
- `moves/`：技能与招式说明。
- `attacks/`：普通攻击与攻击归类。
- `animations/`：动作帧与 pose。
- `hitboxes/`：判定。
- `feedback/`：命中反馈。
- `portraits/`：肖像。
- `reports/`：完整度和验收结果。

新增任何 Ryo 内容时，先问自己属于哪一类，再决定放哪一个子目录，不能再塞回单一巨型文件。

当前与 Ryo 相关的真实实现已包含一批平面兼容文件和分层入口，后续文档必须同时承认“兼容层存在”和“子域迁移进行中”两个事实，不能把现状写成已经完全迁完，也不能继续假装还没有开始拆分。

## 4.4 文件池与状态机拆分规则

所谓“文件池”，不是把很多代码文件堆在一起，而是把同一职责域拆成可以单独替换、单独测试、单独拼接的最小文件集合。

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

如果一个文件已经变成“梦文件”，优先按职责拆成文件池，而不是继续在里面堆分支。
如果一个文件接近或超过 2000 行，优先拆分，不要继续做“临时压缩”。

## 5. 每轮禁止事项

除非用户当前明确覆盖，否则禁止：

- 新增角色。
- 新增玩法模式。
- 把 placeholder 继续精修成正式方向。
- 继续精修 placeholder 或骨架假人，而不是先做资产导入。
- 重写整个引擎。
- 未完成 Ryo 样板就扩展 Kyo/Iori。
- 不经决策门直接引入 PixiJS/Godot/Rust/C++。
- 为了评分做无法验收的“看起来变多”改动。
- 把 MUGEN/IKEMEN/QF 的商业素材或受保护角色实现复制进运行时。

## 6. 每轮必须产出的方案

实施前必须写：

```text
本轮目标：
- ...

主线归属：
- Ryo 肖像 / Ryo 动作 / Ryo 判定 / Ryo 命中反馈 / 资产管线 / 验收工具 / 文档约束

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

## 7. Ryo 样板验收标准

Ryo 不达标时，不允许把主线扩到更多角色。

### 7.1 肖像

- 选人、HUD、胜利至少有明确尺寸规范。
- 不再只依赖 fallback 颜色。
- 肖像来源必须合法、原创或明确可用。
- 肖像 manifest 必须能替换资产而不改 UI 逻辑。

### 7.2 动作

第一批只做：

- `idle`
- `walk_forward`
- `walk_backward`
- `jump`
- `stand_a`
- `stand_c`
- `hurt`
- `knockdown`

每个动作必须有：

- 帧名。
- 帧序列。
- 每帧 duration。
- anchor。
- 视觉 offset。
- 可选 hurtbox/hitbox。
- 对应 frame data 或说明。

### 7.3 判定

- startup/active/recovery 与视觉帧能对齐。
- hitbox/hurtbox 不写在渲染函数里。
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

- `spriteRef` 指向视觉资产。
- `hurtboxes` / `hitboxes` 指向判定资产。
- `eventTags` 触发脚步、挥拳、命中、落地等事件。
- combat 不读取 Canvas。
- rendering 不决定命中。
- audio/vfx 只响应事件。

## 9. 资产管线方向

运行时只消费 manifest。资产解析、atlas 生成、图片裁剪、palette 处理都属于工具层。

目标目录方向：

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
      ryo.atlas.json
      ryo.portraits.json
      ryo.animations.json
      ryo.hitboxes.json

tools/
  asset-pipeline/
    build-atlas.ts
    validate-manifest.ts
    report-character-completeness.ts
```

当前可以先写 manifest 和校验工具，不必一次生成正式美术。

## 10. 技术栈决策

当前不要因为“不像 KOF”直接换栈。

换栈前必须满足：

- Ryo 已有真实 atlas/manifest。
- Canvas 2D 在真实资产下出现可复现性能或能力瓶颈。
- combat/input/state 已经和 rendering 解耦。
- 迁移方案能保留角色数据和 frame contract。

如果只是 placeholder 丑，换 PixiJS/Godot 也不会变成 KOF。

## 11. 评分规则

每轮最多 +1。

可加分条件：

- 推进了 Ryo 样板闭环。
- 或降低了资产/动作/判定/反馈管线风险。
- 或修复了阻碍 Ryo 闭环的稳定性问题。
- 或让约束文档更能防止跑偏。

不可加分：

- 新增角色。
- 无验收标准的泛泛优化。
- 构建失败。
- 只让 placeholder 更花。
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

## 13. 给后续 AI 的执行口令

每次想新增东西前，先问：

> 这是否明确闭合了 [KOF 差距矩阵](docs/product/kof-gap-matrix.md) 中的一项差距？

如果答案不是明确的“是”，不要做。
