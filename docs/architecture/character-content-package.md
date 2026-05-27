# 角色内容包架构

这里定义一个角色内容包内部如何分门别类。

## 目标

- 把每个人物拆成独立内容包。
- 把每个技能、每个攻击、每个动画、每个判定和每个反馈分层。
- 让后续 AI 知道新增内容应该进哪个文件夹。

## 推荐目录

```text
src/content/characters/<id>/
├── index.ts
├── definition.ts
├── stats.ts
├── completeness.ts
├── commands/
├── moves/
├── attacks/
├── animations/
├── hitboxes/
├── feedback/
├── portraits/
└── reports/
```

## 当前状态

- Ryo 已经有兼容入口和职责分层的过渡形态。
- 根部的 `definition.ts` / `stats.ts` / `completeness.ts` 仍作为兼容层保留。
- 新的真实数据应优先进入对应子目录，而不是继续往单文件里堆。
- `index.ts` 应成为运行时面向角色内容包的单一导出入口。

## 归类原则

- `commands/` 关注“按键怎么按”。
- `moves/` 关注“技能是什么”。
- `attacks/` 关注“攻击归类是什么”。
- `animations/` 关注“动作怎么动”。
- `hitboxes/` 关注“打到哪里、被打到哪里”。
- `feedback/` 关注“命中后感觉如何”。
- `portraits/` 关注“人物长什么样”。
- `reports/` 关注“做得怎么样、是否达标”。

## 迁移顺序

1. 先建立目录和 README。
2. 再把 Ryo 的真实数据逐步迁进去。
3. 迁移时保持旧入口兼容，不一次性删掉适配层。
4. 通过 manifest / frame contract / 视觉回归验证后，再复制到其他角色。
