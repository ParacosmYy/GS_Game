# 角色完整性

## 完整角色定义

一个可结算为“完整”的角色至少包含：

- 站立近/远 A/B/C/D
- 蹲 A/B/C/D
- 跳 A/B/C/D
- 站 CD / 空中 CD
- 前投 / 后投
- 至少 1 个命令通常技
- 至少 2 个必杀技，区分轻重版本
- 至少 1 个 DM / SDM 路径
- startup / active / recovery / damage / hitstun / blockstun / pushback
- hitbox / hurtbox / throwbox / pushbox
- 取消窗口
- 命中/防御特效事件引用
- 头像、站姿、走路、受击、倒地、胜利姿势
- 至少 2 套配色

## 样板优先

默认样板顺序：

1. Ryo
2. Kyo
3. Iori

样板未完成时，不应盲目扩角色数量。

## 数据驱动

- 角色差异写在角色定义或数据文件。
- 通用机制写在引擎/系统层。
- 两个以上角色共享的行为应抽象为模板或共享 helper。
- 不允许为了新增角色修改通用状态机的角色硬编码。

