# 格斗游戏工程架构参考

本文用于说明本项目如何参考成熟街机格斗工程，而不是声称知道 SNK 闭源代码。

## 1. 不可声称的内容

- 不声称知道 SNK / KOF2002 / KOF2002UM 的内部源码目录。
- 不声称知道正版工具链的私有文件格式。
- 不复制商业 sprite、音频、脚本或角色实现。

## 2. 可以参考的公开工程思想

- MUGEN/IKEMEN 的角色包思想。
- SFF/ACT 等资源拆包和 palette 思想。
- frame data 与 state machine 分离。
- hitbox/hurtbox 随帧变化。
- screenpack、stage、character、common system 分离。
- 调试器显示当前 state、animation、hitbox、input buffer。

## 3. 推断出的成熟格斗项目分层

成熟 2D 格斗工程通常至少需要：

- Runtime：固定步长、输入、场景、资源加载。
- Simulation：角色状态、物理、战斗、回放。
- Content：角色、舞台、系统数据。
- Asset Pipeline：离线生成 atlas、manifest、palette、音频包。
- Renderer：sprite、stage、HUD、debug overlay。
- Audio：事件驱动的 SFX/BGM/announcer。
- Tooling：动画查看器、hitbox 编辑器、完整度报告。
- QA：回放回归、帧数据测试、资源校验。

## 4. 本项目采用方式

本项目以 Ryo 为样板角色，把上述思想落成：

- `content/characters/ryo/`
- `assets/source/characters/ryo/`
- `assets/generated/atlases/ryo/`
- `data/frame-data/ryo/`
- `tools/asset-pipeline/`
- `tools/validators/`
- `reports/completeness/`

先建立数据边界，再考虑渲染后端升级。

## 5. 每轮参考资料输出

如果某轮参考了 MUGEN/IKEMEN/SNK 公开资料，最终汇报必须写：

- 参考来源。
- 学到的工程思想。
- 没有复制的内容。
- 如何落到 Ryo 样板线。
