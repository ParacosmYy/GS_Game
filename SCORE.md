# 当前评分摘要

当前总分：`94/1000`

评分规则见 [docs/process/scoring.md](docs/process/scoring.md)。

完整历史见 [docs/archive/SCORE.history.md](docs/archive/SCORE.history.md)。

## 最新方向

- 当前主线：Ryo Vertical Slice。
- 目标：从横向堆功能转为纵向完成一个角色样板闭环。
- 每轮只允许 `+1`。
- 下一目标：`95/1000`。

## 下一轮建议

优先做 Ryo animation manifest 填充真实pose数据，将骨骼pose数据转化为数据驱动的manifest条目。按测试治理要求先跑 `npm run test:smoke`，再按改动范围追加 `test:ryo`、`test:content`。
