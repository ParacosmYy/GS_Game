# CLAUDE.md — 长期 AI 执行手册

本文件是长期协作 AI 的详细执行手册。`AGENTS.md` 是最高约束，本文件负责把约束转成每轮可执行动作。

## 1. 一句话方向

不要继续横向堆角色和 placeholder。当前项目必须收敛到：

> Ryo 一个角色，跑通肖像、sprite atlas、动作帧、判定帧、命中反馈、音画反馈和验收工具的完整闭环。

只有当 Ryo 闭环成立，Kyo/Iori 和更多角色才有复制意义。

补充执行原则：

- 先把一个人物做精，再做其他人物。
- 所有 Ryo 相关内容优先向单一内容包收口，不允许再在多个目录之间横向散落。
- 目录整理的目标不是“看起来更整齐”，而是让 Ryo 的动作、肖像、判定、反馈、报告都能在一个闭环里复用。

当前真实代码已经进入“单一内容包 + 兼容入口”的过渡阶段：

- `src/content/characters/ryo/` 里已经存在按职责拆分的分层入口。
- 兼容层文件仍可保留，但新增数据优先进入子目录或同名职责文件。
- `src/tools/validateManifest.ts` 这类校验工具应作为内容包闭环的一部分，而不是临时脚本。

## 2. 为什么要改方向

现状问题不是“优化不够”，而是优化分散：

- 角色很多，但没有一个达到街机样板闭环。
- frame data 有不少，但视觉帧仍大量 placeholder。
- 肖像 manifest 有结构，但没有正式资产接管。
- 骨骼/像素块渲染继续存在，导致角色气质不像 SNK/KOF。
- 打击感有 hitstop、spark、shake 等组件，但没有按攻击类型形成统一反馈矩阵。
- 角色内容包已经开始细分，但如果后续文档继续写成“未来要拆”，就会和真实代码状态脱节。
- 技术栈不是当前第一瓶颈，资产生产线才是。

因此后续 agent 必须从“多点优化”改成“样板线闭环”。

## 3. 当前唯一主线

主线名称：`Ryo Vertical Slice`。

主线目标：

- 让 Ryo 成为第一个可验收的 KOF 风格样板角色。
- 用 Ryo 验证所有资产格式、动作格式、判定格式和反馈格式。
- 把骨骼/placeholder 降级为 fallback。
- 形成可以复制给 Kyo/Iori 的角色生产模板。

主线文档：[docs/product/ryo-vertical-slice-plan.md](docs/product/ryo-vertical-slice-plan.md)。

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

## 4.2 大型项目化方向

所有后续迁移都必须朝 [工作区目标架构](docs/architecture/workspace-architecture-target.md) 收敛：

- `app/` 只负责启动和依赖组装。
- `engine/` 只负责通用运行时。
- `simulation/` 只负责纯游戏模拟。
- `content/` 承载角色、舞台、manifest 和 frame contract 数据。
- `rendering/` 只读快照和 manifest。
- `audio/` 只响应事件。
- `tools/` 负责离线资产生成、校验和报告。

不要为了“显得大型”做大搬家。每次只迁移一个领域，并通过 [决策门](docs/process/decision-gates.md) 验收。

所有“后续要继续迭代”的文件、草案、待办、交接和归档，统一放进 [迭代工作区](docs/iteration/README.md)：

- `docs/iteration/active.md`：当前正在推进的内容。
- `docs/iteration/backlog.md`：未进入本轮的候选项。
- `docs/iteration/handoff.md`：交接给下一位 AI 的固定说明。
- `docs/iteration/archive/`：已完成历史记录。

不要把迭代草案散落到仓库根目录、临时 markdown、或无归属的新文档里。

## 4.3 单角色收口规则

Ryo 仍是当前唯一允许被持续打磨的主线角色。

每轮若涉及角色内容，必须先回答：

- 这件事是否直接服务 Ryo 的闭环？
- 这件事能否收进 Ryo 的单一内容边界？
- 这件事是否会让代码/资产从“散点”变成“单点真源”？

如果答案不清楚，先停，不要横向扩新目录。

Ryo 相关内容的目标归属是 `src/content/characters/ryo/` 方向。即使当前仍有历史文件留在旧位置，也只能作为过渡层存在，不得把新的 Ryo 数据继续分散进更多位置。

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

## 5. 每轮禁止事项

除非用户当前明确覆盖，否则禁止：

- 新增角色。
- 新增玩法模式。
- 把 placeholder 继续精修成正式方向。
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

每轮一个 commit。标题：

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

如果工作区有他人改动，只 stage 本轮文件。

## 13. 给后续 AI 的执行口令

每次想新增东西前，先问：

> 这是否让 Ryo 的肖像、动作、判定、打击反馈闭环更完整？

如果答案不是明确的“是”，不要做。
