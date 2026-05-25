# 当前架构

本文描述当前真实代码结构。它是执行约束，不是未来愿景。

## 技术栈

- TypeScript + Vite + HTML5 Canvas 2D
- Vitest 测试
- 浏览器运行，当前不依赖外部黑盒游戏引擎

## 当前目录职责

```text
src/
  main.ts        组装模块、驱动游戏循环和阶段分发
  core/          基础类型、常量、帧数据、RNG、回放日志、相机
  engine/        固定步长循环和可复用引擎雏形
  input/         原始输入、方向解析、指令缓冲、输入 provider
  entities/      Fighter / Projectile 实体和通用状态处理
  combat/        命中判定、伤害、气槽、DM、命中回调
  characters/    角色定义、招式路由、角色数据
  state/         游戏阶段、选人、回合、队伍、演出状态
  rendering/     Canvas 渲染、HUD、舞台、角色绘制、VFX、肖像
  audio/         音频上下文、BGM、采样/合成音效、播报
  ai/            AI 决策和角色路线
```

## 当前重要事实

- 角色仍处于程序化绘制和占位 sprite 混合阶段，尚未完成正版逐帧 sprite 资产管线。
- `references/mugen/` 是参考资料和工具来源，不是运行时代码。
- `core/replaySession.ts`、`core/replayInputSource.ts` 已开始形成可复现链路。
- `main.ts` 仍承担较多流程编排，后续应继续向 `state/` 收口。

## 当前优先整理方向

1. 让角色、帧数据、动画、判定框逐步数据化。
2. 让资产转换和 sprite sheet 生成进入工具链，而不是运行时。
3. 保持回放、RNG、输入链路可复现。
4. 保持战斗逻辑与渲染、音频、调试 UI 分离。

