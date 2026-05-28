# 质量门禁

质量门禁用于保证每轮改动可验证、可回退、可复盘。

## 1. 最低门禁

每次提交前必须运行：

```bash
npx tsc --noEmit
npx vite build
npm run test:smoke
```

如果这两项失败，不得声称完成。

测试分层按 [测试治理](test-governance.md) 执行。默认不盲跑全量测试，除非本轮是阶段验收、发布前、大规模重构，或用户明确要求。

## 2. 按改动类型增加验证

| 改动类型 | 必须增加的验证 |
| --- | --- |
| 输入/回放/RNG | 相关 vitest，确认 determinism |
| combat/frame data | 攻击、命中、防御、cancel、reset 相关测试 |
| animation manifest | 帧数、duration、loop、actionId 校验 |
| hitbox/hurtbox | 数据读取、active frame、debug draw 来源校验 |
| portrait/sprite manifest | 资源引用、尺寸、anchor、fallback 校验 |
| rendering | 本地手测路径，确认 fallback 可用 |
| 文档 | 链接一致性、优先级一致性、无冲突规则 |

如果本轮只改文档，可用 `npx tsc --noEmit`、`npx vite build` 和链接/规则一致性检查替代领域测试；但涉及测试策略或脚本时必须至少运行 `npm run test:smoke`。

任何验证通过都必须能回到 [KOF 差距矩阵](../product/kof-gap-matrix.md) 的某一项差距：如果验证只能说明“没坏”，却不能说明“补了什么差距”，就不算高价值推进。

## 3. Phase 2 内容包门禁

涉及 Phase 2 主线时必须回答：

- 是否推进 [Ryo Vertical Slice](../product/ryo-vertical-slice-plan.md) 这条基线，并服务当前样板角色闭环？
- 是否推进 [KOF 差距矩阵](../product/kof-gap-matrix.md) 中的一项高优先级差距？
- 是否使用或完善 [资产管线架构](../architecture/asset-pipeline.md)？
- 是否符合 [工作区目标架构](../architecture/workspace-architecture-target.md)？
- 是否通过 [决策门](decision-gates.md)？
- 是否保持 Frame Contract 语义？
- 是否保留 fallback？
- 是否避免把内容散落到多个没有统一入口的角色目录里？

## 4. 手测要求

涉及视觉、动作、打击感时，需要说明：

- 进入哪个页面或模式。
- 选择哪个角色。
- 执行哪个动作。
- 观察哪个反馈。
- 预期结果是什么。

无法手测时必须写明原因。

## 5. 文件池门禁

涉及文件池重构时必须回答：

- 这次拆分是不是让职责更单一？
- 状态机是否拆成了状态、转移、副作用、查询、测试？
- 是否仍然保留统一入口？
- 是否只是把大文件换成更多大文件？
- 是否让通用模块更少知道具体角色细节？
- 是否避免任何单文件逼近或超过 2000 行？
- `main.ts` 是否仍然只是最小化启动壳？

## 6. 失败处理

如果验证失败：

- 先定位是否来自本轮改动。
- 如果来自他人未提交改动，不得回滚，必须说明。
- 如果来自本轮改动，修复后重跑。
- 如果无法修复，撤回本轮改动或请求用户决策。
