# Ryo 内容包

这里是 `Ryo` 的单一内容包入口。

## 当前状态

- 这个目录已经不再是纯概念占位，而是实际内容迁移的主入口。
- 根部兼容层仍保留，用来接住旧代码和逐步迁移期间的调用。
- 新数据优先进入职责子域，不再回流到单文件堆叠。

## 当前结构

```text
src/content/characters/ryo/
├── index.ts            # 对外统一导出入口
├── definition.ts       # 角色定义兼容层
├── stats.ts            # 数值兼容层
├── completeness.ts     # 完整度/报告兼容层
├── commands/           # 指令、出招、路由说明
├── moves/              # 必杀技、超必杀、强化版关系
├── attacks/            # 普通技、攻击分类、攻击分组
├── animations/         # 动作帧、pose、manifest
├── hitboxes/           # 判定框与受击框
├── feedback/           # 命中反馈、音效、屏闪、停顿
├── portraits/          # 头像、胜利图、HUD 肖像
└── reports/            # 完整度、验收、对齐报告
```

## 兼容层与迁移层

- `definition.ts`、`stats.ts`、`completeness.ts` 继续承担兼容入口职责。
- `index.ts` 是对外单一入口，运行时应优先依赖它，而不是直接穿透到多个内部文件。
- 子目录目前以目录骨架和迁移说明为主，后续会逐步放入真实数据文件。

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

- 新增 Ryo 内容优先进入对应子目录。
- 旧入口先保留，不要为了“整理干净”直接删适配层。
- 每次迁移都要保留回退路径。
- 后续如果继续拆分，优先从 `moves/`、`animations/`、`hitboxes/`、`feedback/`、`portraits/` 的真实数据开始。
