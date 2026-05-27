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

## 1. 当前总方向

项目已经停止“横向堆角色、堆系统、堆 placeholder”的路线。

从现在开始，主线只有一条：

> 以 Ryo 为唯一样板角色，建立角色美术、逐帧动作、帧数据、碰撞盒、命中反馈、肖像与资产管线的完整闭环。

当前最高优先级不是“继续加功能”，而是按 [KOF 差距矩阵](docs/product/kof-gap-matrix.md) 逐项闭合最显眼的差距。所有新增功能都必须先说明它正在关闭矩阵里的哪一项差距。

如果项目已经进入 Phase 2 或多角色阶段，也必须先服从这份差距矩阵，再决定是继续补 Ryo、补 Kyo/Iori，还是补通用管线。

这条主线还要求“先收口，再扩张”：

- 先把一个人物做精，再做其他人物。
- 先把 Ryo 的内容边界收成单一闭环，再考虑 Kyo / Iori。
- 任何文件重排都必须服务 Ryo 闭环，不得趁机横向扩目录。

当前真实代码状态已经不是单体堆叠，而是开始按职责分层：

- `src/content/characters/ryo/` 已经形成内容包雏形，兼容入口和真实数据迁移需要同时存在。
- `src/rendering/sprites/`、`src/state/`、`src/tools/validateManifest.ts` 已经开始承担更明确的分工。
- 后续新增内容应优先落到对应子域，不要重新把数据塞回单一巨型文件。

在 Ryo 样板闭环达标前，禁止把主要精力投入：

- 新增角色。
- 新增玩法模式。
- 大规模美化骨骼假人。
- 给 placeholder 继续叠特效。
- 因为观感不佳而直接换技术栈。

## 2. 产品目标

目标不是复制正版商业素材，而是做出尽可能接近 KOF2002 / KOF2002UM / QF 街机体验的原创 2D 格斗游戏工程。

优先级固定为：

1. 角色气质与肖像可信。
2. 逐帧动作节奏可信。
3. 动作帧、判定帧、命中反馈同源。
4. 输入响应和取消窗口稳定。
5. 打击反馈有重量。
6. 流程与 UI 有街机仪式感。
7. 角色数量扩展。

## 3. 当前技术栈策略

当前技术栈继续使用 TypeScript + Vite + Canvas 2D。

默认不换栈。换栈只能在完成技术栈决策门后进行，规则见 [未来引擎架构](docs/architecture/future-engine-architecture.md)。

当前瓶颈判断：

- 已证实的问题：资产管线、动作闭环、placeholder 视觉、打击反馈矩阵不足。
- 未证实的问题：Canvas 2D 已经无法承载目标效果。

因此下一阶段先做数据和资产边界，不用框架名逃避生产线问题。

## 4. 每轮强制闭环

每轮必须按以下顺序执行，除非用户明确要求只回答问题：

1. `启动检查`：查看 `git status --short`，识别用户/他人未提交改动，不得误改。
2. `读取约束`：读 `AGENTS.md`、`CLAUDE.md`、[Ryo 样板线](docs/product/ryo-vertical-slice-plan.md)、[迭代流程](docs/process/iteration-workflow.md)。
3. `自侦测前置`：按 [自侦测前置](docs/process/self-detection.md) 并行调用 3 个自侦测角色，先判定 `green / yellow / red`。
4. `决策门`：按 [决策门](docs/process/decision-gates.md) 判断本轮是否允许实施。自侦测若出现 `yellow` 或 `red`，必须先收敛范围或升级深审。
5. `研究参考`：查 `references/mugen/` 或公开资料，只学习数据组织和工具链，不复制受保护素材。
6. `深审协作`：仅当任务属于高风险、跨层、资产管线、角色扩展、打击感、换栈或自侦测非绿时，按 [角色协同模板](docs/process/role-prompts.md) 默认调用 8 个子 agent，允许 6-9 个；最少覆盖 2 架构、4 研发、1 产品、1 测试。
7. `方案`：写清本轮目标、范围、非目标、文件归属、自侦测结论、深审结论（如有）、验收、回退。
8. `实施`：只做本轮闭环，不扩张。
9. `验证`：按 [质量门禁](docs/process/quality-gates.md) 执行。
10. `复盘评分`：按 [评分规则](docs/process/scoring.md) 说明是否 +1。
11. `提交`：按 [Git 规则](docs/process/git-rules.md) 中文 Conventional Commit。

补充节奏：

- 每累计 5 个 commit，尝试 push 一次。
- 如果首次 push 失败，继续正常 commit，不要停在推送错误上。
- push 失败要记录原因，后续再补推。

补充 tag 节奏：

- 每累计 5 个 commit，打一个 tag。
- tag 按历史记录口径每次记 `0.01`。
- 累计 10 个 tag 后按 `0.1` 进位。
- 如果首次打 tag 失败，继续正常 commit，后面再补打。

没有验收标准的改动不得实施。不能说明“更接近 KOF 在哪里”的改动不得加分。

如果工具环境无法创建子 agent，必须显式记录失败原因，并由主 agent 按同样角色清单补齐结论。不得伪造“已调用”。

## 5. 架构铁律

- 新功能先确定职责域，再写代码。
- 通用逻辑不得认识具体角色名。
- `combat/`、`entities/`、`input/` 不得依赖 `rendering/`、`audio/`、DOM。
- `characters/` 只声明角色数据和招式路由，不承载通用战斗规则。
- 资产解析、atlas 生成、SFF/ACT/PNG 处理必须放在工具层或离线流程，不进入浏览器主循环。
- 视觉帧、判定帧、命中反馈必须通过同一个 `Frame Contract` 对齐。
- 骨骼/像素块/placeholder 只能作为 fallback，不得继续冒充正式美术方向。
- 新状态必须声明归属、生命周期、reset、snapshot/replay 影响。

模块细则见 [模块边界](docs/architecture/module-boundaries.md)，资产细则见 [资产管线架构](docs/architecture/asset-pipeline.md)。

大型项目目标结构见 [工作区目标架构](docs/architecture/workspace-architecture-target.md)。新增目录、迁移文件、拆分大文件前必须先对照该文档。

## 6. Ryo 样板线硬规则

在 Ryo 样板线达标前：

- 所有角色内容收口优先级都低于 Ryo。
- 任何 Ryo 相关新增文件，必须优先归属到 Ryo 内容包目标结构；如果暂时还在旧目录，必须写清迁移计划与回退点。
- 默认只允许改 Ryo 相关资产、Ryo 相关动作、Ryo 验收工具、通用资产管线和通用打击反馈矩阵。
- Kyo/Iori 只能用于接口兼容性校验，不作为主迭代目标。
- 新增角色必须被拒绝，除非用户明确覆盖本规则。
- 任何“全角色优化”必须先证明不会稀释 Ryo 样板目标。

Ryo 样板的完整定义见 [Ryo Vertical Slice](docs/product/ryo-vertical-slice-plan.md)。

## 7. 质量门禁

提交前至少执行：

```bash
npx tsc --noEmit
npx vite build
```

涉及核心逻辑时还要运行相关 `vitest`。如果工作区已有他人未提交代码导致验证失败，必须说明失败来自哪些未归属改动，不得擅自回滚。

## 8. 文档索引

- [CLAUDE.md](CLAUDE.md)：长期 AI 执行手册。
- [README.md](README.md)：项目入口。
- [Ryo Vertical Slice](docs/product/ryo-vertical-slice-plan.md)：当前唯一产品主线。
- [真实性标准](docs/product/authenticity-standard.md)：接近 KOF 的验收标准。
- [KOF 差距矩阵](docs/product/kof-gap-matrix.md)：当前最高优先级差距清单。
- [路线图](docs/product/roadmap.md)：阶段路线。
- [迭代工作区](docs/iteration/README.md)：所有后续迭代文件的统一收纳区。
- [当前架构](docs/architecture/current-architecture.md)：真实结构。
- [模块边界](docs/architecture/module-boundaries.md)：依赖和职责。
- [工作区目标架构](docs/architecture/workspace-architecture-target.md)：大型项目目录目标和迁移阶段。
- [资产管线架构](docs/architecture/asset-pipeline.md)：sprite/portrait/frame/hitbox 管线。
- [未来引擎架构](docs/architecture/future-engine-architecture.md)：换栈决策。
- [角色内容包架构](docs/architecture/character-content-package.md)：每个人物、每个技能、每个攻击的目录归类方式。
- [自侦测前置](docs/process/self-detection.md)：3 人前置快筛。
- [迭代流程](docs/process/iteration-workflow.md)：每轮闭环。
- [迭代工作区](docs/iteration/README.md)：当前轮、待办、交接、归档的统一文件夹。
- [决策门](docs/process/decision-gates.md)：新功能、架构迁移、资产、角色、打击感、换栈的允许条件。
- [角色模板](docs/process/role-prompts.md)：PM/玩家/研发/测试/架构师模板。
- [质量门禁](docs/process/quality-gates.md)：验证规则。
- [评分规则](docs/process/scoring.md)：千分制和 +1 规则。
- [Git 规则](docs/process/git-rules.md)：提交规则。
- [格斗游戏工程架构参考](docs/reference/fighting-game-architecture-reference.md)：公开可参考的成熟格斗工程分层。
