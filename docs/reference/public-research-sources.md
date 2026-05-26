# 公开参考源

本文规定如何参考 MUGEN、IKEMEN、QF 和公开资料。

## 1. 允许参考

- MUGEN/IKEMEN 的数据驱动结构。
- 角色状态机思想。
- sprite atlas、SFF/ACT、palette、动画帧组织方式。
- 公开 frame data、公开 wiki、玩家研究资料。
- 有明确许可的开源工具。

## 2. 禁止复制

- 商业 sprite。
- 商业音频。
- 未确认许可的 MUGEN 角色包。
- screenpack。
- 可识别的商业肖像。
- 受保护角色实现。

## 3. 当前参考重点

围绕 Ryo 样板线，只研究：

- 一个角色如何组织动作。
- 一个动作如何组织帧。
- hitbox/hurtbox 如何随帧变化。
- hit event 如何触发反馈。
- 工具如何生成 atlas 和 manifest。

更完整的工程架构参考见 [格斗游戏工程架构参考](fighting-game-architecture-reference.md)。

## 4. references 目录

`references/mugen/` 是研究资料目录。

使用规则：

- 可以阅读和学习结构。
- 不得把未确认许可资源复制到运行时。
- 不得把参考项目的完整架构照搬进本项目。
- 如需要使用任何资源，必须记录来源和许可。

## 5. 每轮研究记录

每轮如果参考了公开资料，必须在最终汇报写：

- 参考了什么。
- 学到了什么工程结构。
- 哪些内容没有照搬。
- 如何落到当前 Ryo 主线。
