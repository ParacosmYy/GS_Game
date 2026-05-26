# 拳皇2002 风云再起

KOF2002 风格 2D 格斗游戏样机。

当前项目已经停止“继续堆角色、堆系统、堆 placeholder”的路线，转向：

> 以 Ryo 为唯一样板角色，跑通肖像、sprite atlas、动作帧、判定帧、命中反馈和验收工具的完整闭环。

## 快速启动

```bash
npm install
npm run dev
```

生产构建：

```bash
npm run build
```

质量检查：

```bash
npx tsc --noEmit
npx vite build
npx vitest run
```

## 当前技术栈

- TypeScript
- Vite
- HTML5 Canvas 2D
- Vitest

当前默认不换栈。是否迁移到 PixiJS / WebGL2 / Godot / Rust，必须先满足 [未来引擎架构](docs/architecture/future-engine-architecture.md) 的决策门。

## 文档入口

必须按顺序阅读：

1. [AGENTS.md](AGENTS.md)：最高执行约束。
2. [CLAUDE.md](CLAUDE.md)：长期 AI 执行手册。
3. [Ryo Vertical Slice](docs/product/ryo-vertical-slice-plan.md)：当前唯一产品主线。
4. [迭代流程](docs/process/iteration-workflow.md)：每轮闭环。
5. [角色协同模板](docs/process/role-prompts.md)：PM、玩家、研发、测试、架构评审。

架构相关：

- [当前架构](docs/architecture/current-architecture.md)
- [模块边界](docs/architecture/module-boundaries.md)
- [资产管线架构](docs/architecture/asset-pipeline.md)
- [未来引擎架构](docs/architecture/future-engine-architecture.md)

产品相关：

- [真实性标准](docs/product/authenticity-standard.md)
- [路线图](docs/product/roadmap.md)
- [角色完整性](docs/product/character-completeness.md)

流程相关：

- [质量门禁](docs/process/quality-gates.md)
- [评分规则](docs/process/scoring.md)
- [Git 规则](docs/process/git-rules.md)

参考：

- [公开参考源](docs/reference/public-research-sources.md)
- [操作说明](docs/reference/controls.md)

## 当前禁止方向

- 不新增角色。
- 不继续把骨骼/像素块 placeholder 当正式方向。
- 不因为观感不好直接换技术栈。
- 不复制无授权商业素材。
- 不做无法验收的泛泛优化。

## 当前推荐下一步

优先完成 Ryo 的资产和动作闭环：

1. portrait manifest。
2. sprite atlas manifest。
3. animation manifest。
4. hitbox/hurtbox manifest。
5. feedback manifest。
6. Ryo `idle` / `stand_a` / `stand_c` 样板。
