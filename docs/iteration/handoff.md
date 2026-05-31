# 迭代交接

## 给下一位 AI 的提示

- 先读 `AGENTS.md`。
- 再读 `CLAUDE.md`。
- 再读 `docs/product/kof-gap-matrix.md`（已更新至 2026-05-31）。
- 只处理当前 active 中的任务，不要自己扩张范围。
- 当前样板顺序固定为：Kyo 第一，Ryo 继续作为 baseline，其他角色全部按 Kyo 的链路复制。
- 如果发现自己在写新的原则，而不是迁移到具体子目录并接入真实数据，就说明已经跑偏。
- 当前无论是 Phase 1 还是 Phase 2，第一优先级都必须对齐 [KOF 差距矩阵](../product/kof-gap-matrix.md)。

## 关键诊断（2026-05-31）

### 为什么用户看到"只有 Kyo 有素材"（已修复）

**根因**：`initAllCharacterSprites()` 只把 kyo/ryo 设为 PRIORITY，`main.ts` 不等加载完就启动游戏循环。非 kyo/ryo 角色在用户进入战斗时 manifest 未加载、Image 对象未创建，导致 `drawGenericCharacterSprite` 返回 false → fallback 到骨架。

**修复**：
1. `initAllCharacterSprites.ts`：全部角色 manifest 前置加载 + idle PNG `img.decode()` 预热
2. `main.ts`：`GameLoop.start()` 移到 `initAllCharacterSprites().then()` 里，等加载完再启动

**真正缺素材的 ROSTER 角色（11 个）**：leona、kula、robert、ralf、joe、billy、choi、chang、mature、chris、mary — 完全没有 MUGEN 源文件，没有 PNG，没有注册。这些角色无论怎么修加载逻辑都会显示骨架，需要下载 MUGEN 源。

**有素材但不在 ROSTER 的 KOF2002 角色（8 个）**：benimaru、yuri、kensou、takuma、heidern、rugal、g_rugal、king — 只需要创建 charDef 加入 ROSTER 就能上场。

### 下一步优先行动

1. **差距 A（最快见效）**：为 kdash/mai/andy/clark/yashiro 创建内容包（已有 sprite 全链路）
2. **差距 C（快速扩展）**：为 benimaru/yuri/kensou/takuma/heidern/rugal/g_rugal/king 创建 charDef + 加入 ROSTER
3. **差距 B（需要下载）**：为 11 个缺 MUGEN 源的角色下载素材 — 推荐来源：ZZZasd KOF2002 Complete Pack (AK1)

### 已知下载来源

- AK1：ZZZasd KOF2002 Complete Pack（31.55 MB，包含全部角色）
- Mega.nz：KOF Anthology（8.72 GB，包含所有 16 个缺失角色的已知作者版本）
- MUGEN Archive：单个角色下载（需注册）
- MFFA：KOF Anthology（需注册）

## 未完成事项

- Kyo 内容包的 commands / moves / attacks / animations / hitboxes / feedback / portraits / reports 必须优先闭合，再把同一条链路复制到 Ryo / Iori / 其他角色。
- 当前兼容入口 `definition.ts` / `stats.ts` / `completeness.ts` 先保留，迁移时不要删除。
- 如果新文件只是在重复 README 描述，优先回到数据层而不是继续复制说明文字。
- 迁移过程中如果出现验证失败，先收回到兼容入口，再继续细拆。
- 如果下一位 AI 只是在继续扩 scope，却没有闭合差距矩阵中的项目，就应该先停下来重写方案。
