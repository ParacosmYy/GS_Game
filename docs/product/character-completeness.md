# 角色完整性标准

本文定义一个角色何时算“完整”。当前以 Ryo 作为基线定义，Phase 2 的 Kyo / Iori 复用同一套标准。

## 1. 完整角色定义

一个完整角色必须具备：

- 肖像：select、HUD、VS、win。
- 基础动作：idle、walk、jump、crouch、turn。
- 攻击动作：轻/重/蹲/跳/必杀/超必杀。
- 受击动作：站受击、蹲受击、空中受击、倒地、起身。
- 判定数据：pushbox、hurtbox、hitbox、throwbox。
- 输入数据：普通技、特殊技、必杀、DM。
- 反馈数据：light/heavy/special/DM。
- 音频事件：挥拳、命中、防御、倒地、胜利。
- 胜利与失败表现。

## 2. 当前最小完整性

Phase 1 基线只要求：

- select 肖像。
- HUD 肖像。
- idle。
- walk_forward。
- walk_backward。
- jump。
- stand_a。
- stand_c。
- hurt。
- knockdown。
- light feedback。
- heavy feedback。
- hitbox/hurtbox 数据可读。
- fallback 可用。

## 3. 完整度报告

后续应提供工具输出：

```text
Ryo completeness:
- portrait: select OK, hud OK, vs missing, win missing
- animation: idle OK, walk_forward OK, stand_a OK, stand_c missing
- hitbox: stand_a OK, stand_c missing
- feedback: light OK, heavy missing
- fallback: available
```

## 4. 扩展规则

在 Phase 1 基线达标前：

- 不新增角色。
- 不宣称全角色优化完成。
- 不把 Kyo/Iori 作为正式主线。

Phase 1 基线达标后，Kyo/Iori 使用同一份完整性标准；Phase 2 的角色完整度报告应该同时显示多角色差距，而不是只显示单个角色。
