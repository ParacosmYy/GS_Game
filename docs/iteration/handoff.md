# 迭代交接

## 给下一位 AI 的提示

- 先读 `AGENTS.md`。
- 再读 `CLAUDE.md`。
- 再读 `docs/iteration/README.md`、`active.md`、`backlog.md`。
- 只处理当前 active 中的任务，不要自己扩张范围。
- 这轮的优先级不是扩角色，而是把 Ryo 内容包按职责继续迁到真实数据。
- 如果发现自己在写新的原则，而不是迁移到具体子目录并接入真实数据，就说明已经跑偏。

## 未完成事项

- Ryo 内容包的 commands / moves / attacks / animations / hitboxes / feedback / portraits / reports 仍需逐步填充真实数据。
- 当前兼容入口 `definition.ts` / `stats.ts` / `completeness.ts` 先保留，迁移时不要删除。
- 如果新文件只是在重复 README 描述，优先回到数据层而不是继续复制说明文字。
- 迁移过程中如果出现验证失败，先收回到兼容入口，再继续细拆。
