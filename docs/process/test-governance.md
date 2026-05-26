# 测试治理

本文用于解决测试文件过多、运行效率下降、回归边界不清的问题。目标不是减少安全网，而是让测试按层级运行、按职责归档、按风险保留。

## 1. 现状判断

当前 `tests/` 已经形成横向膨胀：

- 大量测试按单个功能点新增，缺少分层入口。
- Ryo、combat、flow、rendering、AI 等测试混在同一层目录。
- 每轮 AI 容易为了保险盲跑全量测试，导致效率下降。
- 如果继续按“每加一个需求就加一个文件”的方式推进，测试目录会越来越难维护。

结论：允许优化测试结构，但禁止为了变少而删除有效回归。

## 2. 测试金字塔

测试按四层管理：

| 层级 | 目的 | 运行时机 | 示例命令 |
| --- | --- | --- | --- |
| Smoke | 快速确认基础不崩 | 每轮提交前默认运行 | `npm run test:smoke` |
| Focus | 当前改动相关领域 | 修改对应系统时运行 | `npm run test:ryo` / `npm run test:combat` |
| Contract | 数据契约和内容完整度 | 修改帧数据、manifest、资产时运行 | `npm run test:content` |
| Full | 全量回归 | 阶段门、发布前、重大重构后 | `npm run test:full` |

每轮不再默认跑全量 `vitest run`。全量测试只在高风险改动、阶段验收、发布前或用户明确要求时运行。

## 3. 脚本规范

`package.json` 必须保留以下入口：

- `test:smoke`：最小冒烟集，要求快、稳定、覆盖状态机/输入/关键 bug。
- `test:ryo`：Ryo Vertical Slice 专属测试。
- `test:combat`：战斗、cancel、命中、防御、浮空等核心逻辑。
- `test:content`：manifest、frame data、角色契约。
- `test:full`：完整回归。

新增测试时必须判断它属于哪一层。不能只新增文件而不说明运行入口。

## 4. 文件组织目标

短期允许继续放在 `tests/` 根目录，避免大规模移动造成噪音。

中期迁移为：

```text
tests/
├── smoke/
├── unit/
│   ├── combat/
│   ├── input/
│   ├── entities/
│   └── rendering/
├── contract/
│   ├── frame-data/
│   ├── manifest/
│   └── characters/
├── integration/
│   ├── match-flow/
│   ├── replay/
│   └── training/
└── regression/
    ├── bugs/
    └── ryo/
```

迁移规则：

- 每次最多迁移一个领域。
- 迁移时只移动文件和更新脚本，不混入业务改动。
- 迁移前后必须运行对应脚本确认行为一致。
- 历史 bug 测试放入 `regression/bugs/`，文件名保留 bug 语义。

## 5. 合并规则

允许合并测试文件，但必须满足：

- 同一领域、同一被测模块、同一 fixture。
- 合并后单文件不超过 500 行。
- 合并前后用例数量不减少，除非明确标记重复并说明原因。
- 删除重复测试前必须写明被哪个测试覆盖。

禁止：

- 因为文件多直接删除。
- 把无关系统测试塞进一个大文件。
- 为了追求覆盖率重复断言同一行为。
- 每个新需求都机械新增一个独立 `.test.ts`。

## 6. 每轮验证选择

提交前最低验证：

```bash
npx tsc --noEmit
npx vite build
npm run test:smoke
```

按改动追加：

| 改动范围 | 追加命令 |
| --- | --- |
| Ryo 角色、动作、肖像、手脚细节 | `npm run test:ryo` |
| 攻击、防御、cancel、hitstop、浮空 | `npm run test:combat` |
| frame data、manifest、资产契约 | `npm run test:content` |
| 架构迁移、大规模重构、发布前 | `npm run test:full` |

如果相关测试暂时失败但不是本轮引入，必须说明失败来源，不得用删除测试来掩盖。

## 7. AI 执行要求

每轮 AI 必须在方案里写：

- 本轮选择哪些测试脚本。
- 为什么不跑全量。
- 是否新增测试文件。
- 新增测试属于哪一层。
- 是否可以合并到现有测试。

测试治理本身也是技术债治理。目标是让测试更像工程资产，而不是越来越厚的杂物堆。
