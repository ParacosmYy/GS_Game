# Ryo 内容包

这里是 `Ryo` 的单一内容包入口。

## 目标

- 让 Ryo 的角色数据、技能、攻击、动画、判定、反馈、肖像和报告都有明确归属。
- 让以后所有 Ryo 内容只认这一个目录，不再散落到别的地方。

## 当前结构

```text
src/content/characters/ryo/
├── definition.ts      # 角色定义入口，当前兼容层
├── stats.ts           # 角色数值入口，当前兼容层
├── completeness.ts    # 完整度/报告入口，当前兼容层
├── commands/          # 指令、出招、路由说明
├── moves/             # 必杀技、超必杀、EX/强化版本
├── attacks/           # 普通技、命中性质、攻击分组
├── animations/        # 动作帧、pose、manifest
├── hitboxes/          # 判定框与受击框数据
├── feedback/          # 命中火花、音效、屏闪、停顿反馈
├── portraits/         # 头像、胜利图、HUD 肖像
└── reports/           # 完整度、验收、对齐报告
```

## 归类规则

- `commands/` 只放“怎么按”的规则，不放动画。
- `moves/` 只放“技能是什么”和“如何触发”，不放渲染细节。
- `attacks/` 只放“攻击分类”和攻击基础数据，不负责画面。
- `animations/` 只放动作帧和姿势，不决定命中。
- `hitboxes/` 只放判定，不决定特效。
- `feedback/` 只放命中反馈，不决定判定。
- `portraits/` 只放头像相关数据。
- `reports/` 只放校验和完整度结果。

## 过渡原则

- 现有根目录 `definition.ts`、`stats.ts`、`completeness.ts` 暂时保留为兼容层。
- 新增内容优先进入对应子目录。
- 以后如果要继续拆分，优先从 `moves/`、`animations/`、`hitboxes/`、`feedback/` 开始。
