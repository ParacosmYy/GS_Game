# 迭代流程

本文规定每轮 AI 迭代的强制流程。任何代码、文档、资产、测试改动都必须形成闭环。

## 1. 当前迭代主线

默认主线是 [Ryo Vertical Slice](../product/ryo-vertical-slice-plan.md)。

每轮必须先判断是否服务以下目标之一：

- Ryo 肖像闭环。
- Ryo sprite atlas 闭环。
- Ryo animation manifest 闭环。
- Ryo hitbox/hurtbox 闭环。
- Ryo light/heavy hit feedback 闭环。
- Ryo 完整度报告或校验工具。
- 支撑 Ryo 主线的架构/文档/稳定性工作。

不服务这些目标的任务默认不做，除非用户当前明确要求。

## 2. 标准流程

### 2.1 启动检查

- 运行 `git status --short`。
- 识别用户或其他 AI 的未提交改动。
- 只修改本轮范围内文件。
- 不回滚、不覆盖无关改动。

### 2.2 读取约束

必读：

- `AGENTS.md`
- `CLAUDE.md`
- [Ryo Vertical Slice](../product/ryo-vertical-slice-plan.md)
- 本文件
- [决策门](decision-gates.md)

按需读：

- [资产管线架构](../architecture/asset-pipeline.md)
- [工作区目标架构](../architecture/workspace-architecture-target.md)
- [模块边界](../architecture/module-boundaries.md)
- [真实性标准](../product/authenticity-standard.md)
- [质量门禁](quality-gates.md)
- [自侦测前置](self-detection.md)
- [测试治理](test-governance.md)

### 2.3 自侦测前置

按 [自侦测前置](self-detection.md) 并行调用 3 个自侦测角色：

- 架构自检。
- 研发自检。
- 产品自检。

必须先输出 green/yellow/red，再决定是否进入深审或实施。

无法创建子 agent 时，必须明确说明工具限制，并由主 agent 按同样 3 个角色输出结论；不得省略自侦测。

### 2.4 决策门与深审

如果自侦测出现 yellow/red，或者任务属于架构迁移、资产管线、角色扩展、打击感、换栈或大型文档重构，则先通过 [决策门](decision-gates.md) 再按 [角色协同模板](role-prompts.md) 并行调用 6-9 个子 agent，默认 8 个角色。

深审前必须写：

- 本轮目标。
- 主线归属。
- 决策类型和允许理由。
- 改动文件。
- 不改文件。
- 验收标准。
- 回退方案。
- 是否允许 +1。
- 子 agent 调用情况。

### 2.5 研究

实施前先通过 [决策门](decision-gates.md)。如果本轮属于架构迁移、资产管线、角色扩展、打击感、换栈或文档修改，必须写明为什么允许。

- 先查 `references/mugen/` 和本地代码。
- 可以查公开资料，但只能学习工程结构、数据组织、验收标准。
- 不复制商业素材、音频、角色实现。

研究必须输出：

- 可借鉴点。
- 不能照搬的内容。
- 本轮落地到哪个模块。

### 2.6 方案

实施前必须把自侦测结论和深审结论合并成一份方案：

- 本轮目标。
- 主线归属。
- 自侦测结论。
- 深审结论（如有）。
- 决策类型和允许理由。
- 改动文件。
- 不改文件。
- 验收标准。
- 回退方案。
- 是否允许 +1。
- 子 agent 调用情况。

### 2.7 实施

- 小步改动。
- 优先数据格式和校验。
- 保留 fallback。
- 不做无关重构。
- 不把角色专属逻辑放入通用模块。
- 涉及战斗界面或训练界面时，必须同步当前角色的真实 `moveList`、爆气说明和标准/快捷键位显示，禁止继续使用示例文本。

### 2.8 验证

按 [质量门禁](quality-gates.md) 执行。

最低要求：

```bash
npx tsc --noEmit
npx vite build
```

涉及核心逻辑时运行相关 `vitest`。

测试选择必须遵守 [测试治理](test-governance.md)：默认先跑 `npm run test:smoke`，再按本轮改动追加 `test:ryo`、`test:combat` 或 `test:content`。不得因为测试文件多而直接删除回归测试。

### 2.9 复盘

每轮结束必须回答：

- 本轮是否推进 Ryo 样板闭环？
- 更像 KOF 在哪里？
- 仍不像 KOF 在哪里？
- 是否引入新技术债？
- 下一轮最小任务是什么？

### 2.10 提交

按 [Git 规则](git-rules.md) 提交。每轮一个 commit。

## 3. 停止条件

遇到以下情况停止实施，先向用户说明：

- 需要换技术栈。
- 需要删除大量代码或资产。
- 需要引入大型依赖。
- 验证失败且原因不明。
- 参考资源授权不清。
- 工作区无关改动与本轮文件冲突。

## 4. 跑偏判定

如果本轮无法回答“如何让 Ryo 的肖像、动作、判定、反馈闭环更完整”，就是跑偏。
