# 模块边界

## 依赖原则

- `core/` 不依赖其他业务目录。
- `entities/` 不依赖 `rendering/`、`audio/`、DOM。
- `combat/` 不依赖 `rendering/`、`audio/`、DOM。
- `input/` 不包含角色专属逻辑。
- `characters/` 负责角色数据和角色差异，不反向污染通用引擎。
- `rendering/` 只读取状态并绘制，不决定战斗结果。
- `audio/` 只响应事件或参数，不拥有战斗状态。
- `references/`、`tools/`、`docs/` 不得被运行时业务代码 import。

## 禁止事项

- 禁止 `window.__*` 调试全局。
- 禁止在通用系统中写 `if (charId === 'kyo')` 这类角色硬编码。
- 禁止在 `combat/` 中直接绘制、播放音频或访问浏览器事件。
- 禁止为了通过类型检查使用 `as any`。
- 禁止把 SFF/ACT/PNG 解析器塞进游戏主循环。
- 禁止把受版权保护的 MUGEN/QF/KOF 素材或角色包直接并入运行时。

## 文件大小建议

| 类型 | 建议上限 | 处理方式 |
| --- | ---: | --- |
| 入口编排 | 300 行 | 拆到 `state/` 或系统模块 |
| 状态模块 | 200 行 | 按阶段或职责拆分 |
| combat 系统 | 250 行 | 拆 resolver / calculator / event |
| rendering 文件 | 400 行 | 拆绘制子模块 |
| 角色定义 | 350 行 | 拆为角色目录 |
| 测试文件 | 300 行 | 按行为拆分 |

## 状态归属

新增状态变量必须说明：

- 谁创建它
- 谁更新它
- 谁读取它
- 何时 reset
- 是否要进入 replay/snapshot
- 是否影响确定性

## 资产边界

运行时只消费已经转换好的资产索引、JSON、PNG/WebP、音频文件。SFF 解包、ACT 调色板解析、sprite sheet 生成、CSV 导出等属于离线工具链。

