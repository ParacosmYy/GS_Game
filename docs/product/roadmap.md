# 路线图

当前路线图已重排：先公共骨架，再单角色样板，再 Phase 2 的多角色内容包、流程仪式感和系统收口。

当前实际执行已经进入 Phase 2：Ryo 继续作为 baseline 与合同参照，当前门面样板优先推进 Kyo。公共骨架必须先收紧，Kyo/Iori 内容包与街机流程、UI/HUD、稳定性和工具链一起推进，不过所有新增都要先落到公共骨架上。路线图以 [KOF 差距矩阵](kof-gap-matrix.md) 为优先级来源。

## P0 公共骨架

- 固化 `AGENTS.md` / `CLAUDE.md` / `docs/` 的执行链。
- 固化 [工作区目标架构](../architecture/workspace-architecture-target.md) 和 [决策门](../process/decision-gates.md)。
- 固化 [公共基础组件总说明](../architecture/public-base-components.md)。
- 停止无边界横向新增角色。
- 停止把 placeholder 当作正式美术方向。
- 停止为每个角色重复实现输入提示、头像裁切、反馈流程、高分辨率帧入口。
- 明确公共骨架优先于角色私有实现。

## P1 单角色样板

- 明确当前门面样板角色是 Kyo。
- 让 Kyo 的所有数据和表现都走公共骨架。
- 把 select / HUD / VS / battle / win 的角色识别度做稳定。

## P1.5 公共数据模型

- 定义 portrait manifest。
- 定义 sprite atlas manifest。
- 定义 animation manifest。
- 定义 hitbox/hurtbox manifest。
- 定义 feedback manifest。
- 定义 Frame Contract。
- 定义 MoveEntry / MoveCategory 统一模型。
- 定义输入提示和招式表公共 schema。

## P1.6 KOF 差距闭合

- 先闭合 [KOF 差距矩阵](kof-gap-matrix.md) 里的最高优先级差距。
- 当前 Phase 2 先补公共骨架、多角色内容包、输入可见性、打击反馈和资源规则。
- 再补肖像气质、动作节奏、内容包稳定化、回归保护。
- 所有新功能必须明确自己关闭的是哪一项差距。

## P2 Kyo 内容包细分

- 把 Kyo 内容包拆成 `commands/`、`moves/`、`attacks/`、`animations/`、`hitboxes/`、`feedback/`、`portraits/`、`reports/`。
- 把 definition / stats / completeness 保留为兼容入口。
- 把当前已经出现的分层实现继续向真实数据迁移，而不是停留在 README 和目录骨架。
- 让新增内容优先进入对应子目录，不再回流到单个大文件。

## P3 Kyo 最小动作闭环

- `idle`
- `walk_forward`
- `walk_backward`
- `jump`
- `stand_a`
- `stand_c`
- `hurt`
- `knockdown`

每个动作必须完成视觉帧、判定帧、反馈或状态语义。

## P4 Kyo 打击感样板

- light feedback：stand A。
- heavy feedback：stand C。
- special feedback：选择一个 Kyo 必杀技。
- 统一 hitstop / spark / shake / sfx / pushback。

## P5 Ryo 完整度工具

- 角色完整度报告。
- manifest 校验。
- frame contract 校验。
- hitbox 可视化来源校验。
- fallback 覆盖率报告。

## P5.5 大型项目化迁移

- 从 `characters/kyo.ts` 抽出 Kyo content package。
- 从 `entities/combat/input` 抽出 simulation 边界。
- 从 `rendering/` 抽出 canvas2d、debug、hud、stage 子域。
- 建立 tools validators 和 reports。
- 每轮只迁一个领域，不混玩法变更。

## P6 复制到其他角色

前置条件：

- Kyo 8 个基础动作全部完成。
- Kyo light/heavy 反馈完成。
- 肖像 select/HUD 完成。
- 构建和测试通过。

复制原则：

- 复制格式和工具。
- 不复制 Kyo 具体动作。
- 不把角色名写进通用逻辑。

## P7 深层机制

在 Ryo/Kyo/Iori 样板稳定后再做：

- MAX。
- Free Cancel。
- Guard Cancel。
- Juggle。
- Counter Wire。
- Training / Replay UI。

## P8 技术栈升级

仅在真实资产管线跑通后评估：

- PixiJS。
- WebGL2。
- Godot。
- Rust/WASM。

不得在 placeholder 阶段以“更专业”为理由换栈。
