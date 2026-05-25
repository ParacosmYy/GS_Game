# 路线图

## 当前阶段判断

当前不是继续铺功能的阶段，而是整理架构、数据边界、资产管线和真实性验收标准的阶段。

## P0 稳定与可复现

- 输入链路可切换 live/replay。
- RNG、AI、回放、match envelope 可复现。
- `main.ts` 阶段编排继续向 `state/` 收口。
- 测试覆盖 replay/input/prng/command/combat 关键路径。

## P1 正式资产管线

- 建立 sprite atlas 数据格式。
- 建立 frame data 与视觉帧映射。
- 建立 hitbox/hurtbox/throwbox 随帧数据。
- 建立调色板/配色工具链。
- 从一个样板角色跑通。

## P2 角色与打击感样板

- Ryo/Kyo/Iori 三角色样板。
- 站姿、走路、攻击、受击、倒地、胜利动作统一气质。
- hitstop、shake、spark、SFX 分层。

## P3 深层机制

- Guard Crush
- GC Roll / GC CD
- MAX Free Cancel
- Juggle / Scaling
- Quick Stand
- Counter Wire

## P4 流程与产品化

- Order Select
- Special Intro
- Win Quote
- Continue
- Training Mode
- Replay Playback UI

