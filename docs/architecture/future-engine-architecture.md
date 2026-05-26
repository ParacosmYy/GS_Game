# 未来引擎架构与技术栈决策

本文规定什么时候可以考虑换技术栈。

## 1. 当前结论

现在不换栈。

原因：

- 当前最明显的问题是资产生产线和动作闭环，不是 Canvas 2D 已被证明不够。
- placeholder 阶段换 PixiJS/Godot/WebGL 不能自动获得 KOF 质感。
- 迁移前必须先有可迁移的 manifest、Frame Contract 和样板角色数据。

## 2. 必须先完成的前置条件

换栈评估前必须满足：

- Ryo 有真实或准正式 sprite atlas manifest。
- Ryo 有 animation/hitbox/feedback manifest。
- combat/input/state 不依赖 rendering。
- fallback 清晰。
- 有性能或能力瓶颈证据。

## 3. 触发条件

满足任一条件后，才写技术栈评估：

- Canvas 2D 在真实 Ryo/Kyo/Iori 资产下无法稳定 60 FPS。
- 需要 shader 级 palette swap、残影、bloom、CRT、扭曲。
- sprite atlas 数量导致加载、缓存、内存释放失控。
- 渲染层阻碍 Frame Contract 表达。
- 用户明确要求换栈评估。

## 4. 候选路线

| 路线 | 适用时机 | 风险 |
| --- | --- | --- |
| Canvas 2D 强化 | 当前阶段 | 能力上限较低，但成本最低 |
| PixiJS | 需要 WebGL sprite/filter/atlas | 引入框架依赖 |
| WebGL2 自研 | 需要精细 shader 和批处理 | 工程复杂度中高 |
| Godot 4 2D | 需要编辑器和内容制作流程 | 迁移成本高 |
| Rust/WASM 核心 | 模拟层性能/确定性瓶颈 | 复杂度高 |
| C++/SDL/OpenGL | 桌面重启项目 | 成本最高 |

## 5. 迁移原则

- 先迁数据，不迁表现。
- 保留 Frame Contract。
- 保留 combat/input/state 测试。
- 先做渲染后端替换实验，不重写全部游戏。
- 必须有回退方案。

## 6. 禁止

- 因为角色丑而换栈。
- 因为文件大而换栈。
- 因为“正版应该不是这么写”而换栈。
- 没有样板资产就重写引擎。
