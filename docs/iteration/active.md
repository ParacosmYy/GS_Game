# 当前迭代

## 目标

- Phase 2 (1004→2000) 持续迭代
- 当前分数：112/2000
- 本轮：Kyo/Iori 专属 attackSFX 接入（闭合差距矩阵 1.3 打击反馈差距）

## 当前状态

- 当前主线：Phase 2 质量提升 + 多角色闭环
- Phase 1：Ryo Vertical Slice 100% 完成，退出条件全部满足
- 战斗系统：8/8 KOF2002 深层机制已实现
- 当前最高优先级仍然是按 [KOF 差距矩阵](../product/kof-gap-matrix.md) 逐项闭合差距

## Phase 2 维度与进度

| 维度 | 满分 | 当前进度 | 下一目标 |
| --- | ---: | --- | --- |
| 角色美术（进阶） | 150 | 4/150 | Ryo帧进阶已完成,下一步:SNK风格纹理深化 |
| 多角色闭环 | 200 | 30/200 | Kyo+Iori SFX接入完成→继续Kyo/Iori游戏内集成 |
| 舞台美术（进阶） | 100 | 0/100 | 需要位图品质提升 |
| 深层机制 | 200 | ~80/200 | 系统已实现,需多角色cancel paths+验证 |
| 音频品质（进阶） | 100 | 16/100 | Kyo/Iori专属SFX已接入→连段音/BGM编曲 |
| 游戏流程（进阶） | 150 | 0/150 | Options菜单/暂停/Title完善 |
| UI/HUD品质（进阶） | 100 | 0/100 | SNK风格菜单/VS画面 |

## 本轮任务

- 本轮已完成：Kyo/Iori 专属 attackSFX 接入，替换通用 playSpecialLight/Heavy
  - Kyo: 7个必杀技→playKyo*专属函数 + 普通攻击 fire accent
  - Iori: 6个必杀技→playIori*专属函数
  - 新增 playHitAccentFire / playHitAccentPurple 函数

## 回退方案

- 所有改动只涉及 SFX 调度映射，不改合成逻辑
- 回退 git revert 即可
