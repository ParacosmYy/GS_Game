# AGENTS.md — KOF2002 自动迭代最高约束

本文件是所有 AI agent 的最高执行入口。根目录其他文档只作导航；详细规则在 `docs/` 下。若规则冲突，按本文件的优先级处理。

## 0. 优先级

1. 用户当前明确指令
2. `AGENTS.md`
3. `CLAUDE.md`
4. `docs/process/*`
5. `docs/architecture/*`
6. `docs/product/*`
7. `docs/reference/*`
8. `README.md`
9. `docs/archive/*` 仅作历史参考，不参与当前约束

## 1. 项目目标

- 目标是做出接近正版 KOF2002 / KOF2002UM 街机气质的 2D 格斗游戏样机。
- 优先还原：输入响应、帧节奏、打击反馈、攻防机制、角色气质、流程仪式感。
- 不追求无授权的素材复制。参考 MUGEN / IKEMEN / QF 资源时，只学习工程结构、数据驱动方式、资产管线和验收标准。
- 如果当前技术栈无法稳定实现目标，必须先写技术栈评估和迁移方案，再请求用户确认。

## 2. 当前技术栈

- TypeScript + Vite + HTML5 Canvas 2D。
- 当前阶段默认不换栈，优先整理数据、资源管线、渲染边界和可复现性。
- WebGL2 / PixiJS / Rust / C++ / Godot 只在触发技术栈决策门后考虑，规则见 [技术栈决策](docs/architecture/future-engine-architecture.md)。

## 3. 每轮执行流程

除非用户明确要求只讨论或只整理文档，否则每轮迭代必须闭环：

1. 研究：先查 `references/` 和公开资料，记录可借鉴点。
2. 需求：至少从 PM 视角和玩家/用户视角确认本轮目标；需要长期协同时按 `CLAUDE.md` 和 [角色模板](docs/process/role-prompts.md) 执行。
3. 方案：说明职责归属、改动范围、验收标准。
4. 实施：只改本轮范围内文件，不做无关功能扩张。
5. 验证：按质量门禁运行测试、类型检查、构建或手测。
6. 评估：更新评分或文档，说明是否更接近正版。
7. 提交：每轮必须 commit，中文 Conventional Commit，正文分点写原因、差异、风险。

详细流程见 [迭代流程](docs/process/iteration-workflow.md)。

## 4. 架构铁律

- 新功能先确定职责域，再写代码。
- 禁止 `window.__*`、隐式全局状态、跨模块可变单例。
- 禁止角色名、招式名硬编码泄露到 `combat/`、`entities/`、`input/` 的通用逻辑。
- `input/commandBuffer.ts` 只能处理通用方向历史、按钮边沿、缓冲窗口、指令匹配；角色指令由 `characters/*.ts` 声明。
- 战斗逻辑不得依赖渲染、音频、DOM 或调试 UI。
- 资产转换、SFF/ACT/PNG 解析、sprite sheet 生成、资源统计必须放在工具层或离线流程，不进入浏览器主循环。
- 新状态变量必须声明归属模块、生命周期、reset 行为和未来 snapshot/replay 影响。
- 参考源码只能转译成当前架构下的模块职责，不直接移植 IKEMEN/MUGEN 的引擎结构或商业素材。

当前架构见 [当前架构](docs/architecture/current-architecture.md)，模块边界见 [模块边界](docs/architecture/module-boundaries.md)。

## 5. 质量门禁

每次提交前至少执行：

```bash
npx tsc --noEmit
npx vite build
```

涉及核心逻辑时还要运行相关 `vitest`。涉及玩法、流程或渲染时必须说明是否完成手测；不能手测时必须写明原因。

详细门禁见 [质量门禁](docs/process/quality-gates.md)。

## 6. 产品与评分

- 当前评分以千分制管理，每轮只允许 `+5`，不按文件数或功能数叠加。
- 每轮必须说明：本轮更像正版在哪里；仍不像正版在哪里。
- 角色数量不是主要目标。样板线优先，默认顺序：`Ryo -> Kyo -> Iori`。
- 做视觉和资产前，必须先保证 fallback、构建和可回退路径。

评分规则见 [评分规则](docs/process/scoring.md)，正版标准见 [真实性标准](docs/product/authenticity-standard.md)，路线图见 [路线图](docs/product/roadmap.md)。

## 7. Git 规则

- 分支：当前开发分支为 `kof-2002`。
- Commit 格式：`type(scope): 中文标题`。
- Commit 正文必须分点写：`原因`、`差异`、`验证`、`风险`。
- 禁止 `git reset --hard`、`git checkout --`、`--force`、`--no-verify`，除非用户明确要求。
- 不要把多轮迭代混成一个提交。

详细规则见 [Git 规则](docs/process/git-rules.md)。

## 8. 文档索引

- [README](README.md)：人类入口、运行方式、项目现状。
- [CLAUDE](CLAUDE.md)：长期 AI 迭代执行手册。
- [当前架构](docs/architecture/current-architecture.md)：当前 `src/` 真实结构。
- [模块边界](docs/architecture/module-boundaries.md)：依赖方向、文件职责、禁止事项。
- [未来引擎架构](docs/architecture/future-engine-architecture.md)：是否换栈和渐进迁移方案。
- [迭代流程](docs/process/iteration-workflow.md)：长期 AI 自动迭代流程。
- [角色模板](docs/process/role-prompts.md)：PM、玩家、研发、测试、架构师协同模板。
- [质量门禁](docs/process/quality-gates.md)：测试、构建、手测和反退化。
- [评分规则](docs/process/scoring.md)：千分制、+5 规则、最新分数。
- [真实性标准](docs/product/authenticity-standard.md)：对标 KOF/QF 的验收标准。
- [角色完整性](docs/product/character-completeness.md)：完整角色定义。
- [公开参考源](docs/reference/public-research-sources.md)：MUGEN/IKEMEN/QF 参考边界。
- [历史评分](docs/archive/SCORE.history.md)：长评分日志，仅作历史审计。
