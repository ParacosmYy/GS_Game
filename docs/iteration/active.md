# 当前迭代

## 目标

- MUGEN Asset Integration — 将已有 MUGEN 资产全面接入运行时
- 当前分数：300/2000
- 本轮方向：cvskyo/cvsryo/cvskfm PNG sprite 运行时接入 + 程序化 fallback 降级

## 当前状态

- 当前主线：MUGEN-first 资产集成 + 多角色运行时闭环
- MUGEN 管线已闭环：parseAir → buildSpriteManifest → convertAirHitboxes → extractCharacterSprites
- 已导入资产：cvskyo (1,809 PNG)、cvsryo (1,231 PNG)、kfm (281 PNG)，各含 manifest
- 运行时双路径：PNG sprite（优先）+ 程序化帧（fallback）
- 战斗系统：8/8 KOF2002 深层机制已实现
- 测试总数 10123+ (0 failures)
- 当前tag: v3.00
- 内容包完整度：5角色（Ryo/Kyo/Iori 全量，Terry/Kim 部分内容包）
- 28 roster 定义，仅 KOF2002 原版角色
- Frame Contract 校验：3角色全部 0 issues

## 本轮完成

- MUGEN 管线全链路打通（parseAir / buildSpriteManifest / convertAirHitboxes / extractCharacterSprites）
- 3 组角色 PNG sprite 批量导入（cvskyo / cvsryo / kfm），共计 3,321 张 PNG + 3 份 manifest
- 运行时双路径渲染器接入：PNG sprite 优先加载，程序化 fallback 兜底
- 5 角色内容包（Ryo/Kyo/Iori 全量，Terry/Kim commands/moves/cancelPaths）

## 复盘

- MUGEN-first 转向已落地：工具链从 AIR/SFF 解析到 PNG 提取全链路可用
- 真实 sprite 资产已到位，下一步是把它们接进角色渲染器、替换程序化骨架
- 内容包模板稳定：新角色只需提供 MUGEN DEF/AIR/SFF，管线自动产出 manifest + PNG
- 当前最大差距：已导入 PNG 尚未完全接入 Kyo/Ryo 角色渲染器，仍有 fallback 可见

## 下一步

- 将 cvskyo PNG sprite 接入 Kyo 运行时渲染器，替换程序化帧
- 将 cvsryo PNG sprite 接入 Ryo 运行时渲染器
- Terry/Kim 内容包用 MUGEN 管线补全
- 批量提取 references/mugen/ 下其余 KOF2002 角色资源

## 回退方案

- git revert 即可
- 程序化 fallback 始终保留，PNG 加载失败不会导致角色消失
