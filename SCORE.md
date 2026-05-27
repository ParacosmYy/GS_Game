# 当前评分摘要

当前总分：`104/2000`

评分规则见 [docs/process/scoring.md](docs/process/scoring.md)。

完整历史见 [docs/archive/SCORE.history.md](docs/archive/SCORE.history.md)。

## 最新方向

- 当前主线：先按 [KOF 差距矩阵](docs/product/kof-gap-matrix.md) 闭合最高优先级差距，再推进 Phase 2 内容。
- 目标：从横向堆功能转为按差距矩阵逐项闭合可见体验差距。
- 每轮只允许 `+1`。
- 下一目标：`105/2000`。

## 下一轮建议

优先做最显眼的差距闭合项，例如肖像气质、动作节奏、打击反馈或输入可见性；如果继续做内容包，就要明确它对应差距矩阵里的哪一项。按测试治理要求先跑 `npm run test:smoke`，再按改动范围追加 `test:ryo`、`test:content`。
