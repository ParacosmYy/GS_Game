# 质量门禁

质量门禁用于保证每轮改动可验证、可回退、可复盘。

## 1. 最低门禁

每次提交前必须运行：

```bash
npx tsc --noEmit
npx vite build
```

如果这两项失败，不得声称完成。

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

## 3. Ryo 样板专属门禁

涉及 Ryo 主线时必须回答：

- 是否推进 [Ryo Vertical Slice](../product/ryo-vertical-slice-plan.md)？
- 是否使用或完善 [资产管线架构](../architecture/asset-pipeline.md)？
- 是否符合 [工作区目标架构](../architecture/workspace-architecture-target.md)？
- 是否通过 [决策门](decision-gates.md)？
- 是否保持 Frame Contract 语义？
- 是否保留 fallback？
- 是否避免扩张到非 Ryo 角色？

## 4. 手测要求

涉及视觉、动作、打击感时，需要说明：

- 进入哪个页面或模式。
- 选择哪个角色。
- 执行哪个动作。
- 观察哪个反馈。
- 预期结果是什么。

无法手测时必须写明原因。

## 5. 失败处理

如果验证失败：

- 先定位是否来自本轮改动。
- 如果来自他人未提交改动，不得回滚，必须说明。
- 如果来自本轮改动，修复后重跑。
- 如果无法修复，撤回本轮改动或请求用户决策。
