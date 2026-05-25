# 拳皇2002 风云再起

KOF2002 风格 2D 格斗游戏样机。当前项目重点已经从“继续堆功能”转向“整理架构、建立数据/资产管线、对齐正版手感与流程”。

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
npx vitest run
```

## 当前技术栈

- TypeScript
- Vite
- HTML5 Canvas 2D
- Vitest

当前默认不换栈。是否迁移到 WebGL2 / PixiJS / Rust / C++ / Godot，必须按 [未来引擎架构](docs/architecture/future-engine-architecture.md) 的技术栈决策门评估。

## 文档入口

- [AGENTS.md](AGENTS.md)：AI 自动迭代最高约束。
- [当前架构](docs/architecture/current-architecture.md)：当前真实代码结构。
- [模块边界](docs/architecture/module-boundaries.md)：依赖方向和禁止事项。
- [迭代流程](docs/process/iteration-workflow.md)：每轮闭环流程。
- [质量门禁](docs/process/quality-gates.md)：测试、构建、手测要求。
- [评分规则](docs/process/scoring.md)：千分制和每轮 +5 规则。
- [真实性标准](docs/product/authenticity-standard.md)：对标正版 KOF/QF 的验收标准。
- [路线图](docs/product/roadmap.md)：当前 P0-P4 backlog。
- [角色完整性](docs/product/character-completeness.md)：完整角色定义。
- [操作说明](docs/reference/controls.md)：键位。
- [公开参考源](docs/reference/public-research-sources.md)：MUGEN / IKEMEN / QF 参考边界。

## 参考资料

`references/mugen/` 中保存了 IKEMEN GO、SFF 工具、sprite viewer、MUGEN 角色包等研究资料。它们只用于学习工程结构、数据驱动方式、资产工具链和差距分析；不得直接复制受版权保护的素材、角色实现、音频或商业表达进入运行时。

## 当前核心方向

1. 清理文档和约束，让长期 AI 迭代不再读取冲突规则。
2. 保持回放、输入、RNG 可复现。
3. 建立正式 sprite / atlas / frame data / hitbox 资产管线。
4. 先做 Ryo、Kyo、Iori 样板，再复制到更多角色。
5. 只有当当前栈被验证为瓶颈时，才启动技术栈迁移。
