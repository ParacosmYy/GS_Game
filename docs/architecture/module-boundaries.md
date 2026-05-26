# 模块边界

本文是代码修改时的职责边界。任何新功能必须先归属模块。

## 1. 依赖方向

允许方向：

```text
main -> state -> combat -> entities -> core
characters -> core/input types
input -> core
rendering -> core/entities/readonly data
audio -> core events
tools -> assets/core schema
```

禁止方向：

- `combat` 导入 `rendering`。
- `combat` 导入 `audio`。
- `entities` 导入 `rendering`。
- `core` 导入业务模块。
- `input` 认识具体角色。
- 通用模块通过角色名分支实现角色行为。

## 2. Ryo 主线归属

| 任务 | 归属 |
| --- | --- |
| Ryo 肖像 manifest | `core/` schema + asset data，`rendering/` 只读 |
| Ryo sprite atlas | `core/` schema，`tools/` 生成，`rendering/` 绘制 |
| Ryo animation | `core/` manifest，`characters/` 只引用动作语义 |
| Ryo hitbox | `core/` 数据，`combat/` 读取 |
| Ryo feedback | `core/` 数据，`combat` 发事件，`rendering/audio` 响应 |
| 完整度报告 | `tools/` 或 `tests/` |

## 3. Frame Contract 边界

Frame Contract 是多个模块的共享协议：

- `core` 定义类型和数据。
- `tools` 生成和校验。
- `combat` 读取 hitbox/hurtbox 和 feedback key。
- `rendering` 读取 spriteRef/anchor/offset。
- `audio` 读取 eventTags。
- `vfx` 读取 feedback key。

任何模块不得绕过 contract 私自推导另一层信息。

## 4. Placeholder 规则

- placeholder 可以存在。
- placeholder 必须可替换。
- placeholder 不得成为新主线。
- 修改 placeholder 只能为 fallback 或迁移服务。

## 5. 文件大小

现有大文件暂不为了数字拆分。只有当拆分服务以下目标时才做：

- Ryo 样板线。
- Frame Contract。
- 资产管线。
- 测试可读性。
- 模块边界修复。
