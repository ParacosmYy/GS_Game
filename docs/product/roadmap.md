# 路线图

当前路线图已重排：先 Ryo 样板，再 Kyo/Iori，再扩展系统和角色。

## P0 方向收敛

- 固化 `AGENTS.md` / `CLAUDE.md` / `docs/` 的执行链。
- 固化 [工作区目标架构](../architecture/workspace-architecture-target.md) 和 [决策门](../process/decision-gates.md)。
- 停止横向新增角色。
- 停止把 placeholder 当作正式美术方向。
- 明确 Ryo Vertical Slice 是唯一主线。

## P1 Ryo 资产格式

- 建立 `src/content/characters/ryo/` 目标包结构草案。
- 定义 portrait manifest。
- 定义 sprite atlas manifest。
- 定义 animation manifest。
- 定义 hitbox/hurtbox manifest。
- 定义 feedback manifest。
- 定义 Frame Contract。

## P1.5 Ryo 内容包细分

- 把 Ryo 内容包拆成 `commands/`、`moves/`、`attacks/`、`animations/`、`hitboxes/`、`feedback/`、`portraits/`、`reports/`。
- 把 definition / stats / completeness 保留为兼容入口。
- 让新增内容优先进入对应子目录，不再回流到单个大文件。

## P2 Ryo 最小动作闭环

- `idle`
- `walk_forward`
- `walk_backward`
- `jump`
- `stand_a`
- `stand_c`
- `hurt`
- `knockdown`

每个动作必须完成视觉帧、判定帧、反馈或状态语义。

## P3 Ryo 打击感样板

- light feedback：stand A。
- heavy feedback：stand C。
- special feedback：选择一个 Ryo 必杀技。
- 统一 hitstop / spark / shake / sfx / pushback。

## P4 Ryo 完整度工具

- 角色完整度报告。
- manifest 校验。
- frame contract 校验。
- hitbox 可视化来源校验。
- fallback 覆盖率报告。

## P4.5 大型项目化迁移

- 从 `characters/ryo.ts` 抽出 Ryo content package。
- 从 `entities/combat/input` 抽出 simulation 边界。
- 从 `rendering/` 抽出 canvas2d、debug、hud、stage 子域。
- 建立 tools validators 和 reports。
- 每轮只迁一个领域，不混玩法变更。

## P5 复制到 Kyo / Iori

前置条件：

- Ryo 8 个基础动作全部完成。
- Ryo light/heavy 反馈完成。
- 肖像 select/HUD 完成。
- 构建和测试通过。

复制原则：

- 复制格式和工具。
- 不复制 Ryo 具体动作。
- 不把角色名写进通用逻辑。

## P6 深层机制

在 Ryo/Kyo/Iori 样板稳定后再做：

- MAX。
- Free Cancel。
- Guard Cancel。
- Juggle。
- Counter Wire。
- Training / Replay UI。

## P7 技术栈升级

仅在真实资产管线跑通后评估：

- PixiJS。
- WebGL2。
- Godot。
- Rust/WASM。

不得在 placeholder 阶段以“更专业”为理由换栈。
