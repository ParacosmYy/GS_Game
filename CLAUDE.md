# CLAUDE.md — 长期 AI 执行手册

本文件是长期协作 AI 的详细执行手册。`AGENTS.md` 是最高约束，本文件负责把约束转成每轮可执行动作。

## 1. 一句话方向

不要继续横向堆角色和 placeholder。当前项目必须收敛到：

> Ryo 一个角色，跑通肖像、sprite atlas、动作帧、判定帧、命中反馈、音画反馈和验收工具的完整闭环。

只有当 Ryo 闭环成立，Kyo/Iori 和更多角色才有复制意义。

## 2. 为什么要改方向

现状问题不是“优化不够”，而是优化分散：

- 角色很多，但没有一个达到街机样板闭环。
- frame data 有不少，但视觉帧仍大量 placeholder。
- 肖像 manifest 有结构，但没有正式资产接管。
- 骨骼/像素块渲染继续存在，导致角色气质不像 SNK/KOF。
- 打击感有 hitstop、spark、shake 等组件，但没有按攻击类型形成统一反馈矩阵。
- 技术栈不是当前第一瓶颈，资产生产线才是。

因此后续 agent 必须从“多点优化”改成“样板线闭环”。

## 3. 当前唯一主线

主线名称：`Ryo Vertical Slice`。

主线目标：

- 让 Ryo 成为第一个可验收的 KOF 风格样板角色。
- 用 Ryo 验证所有资产格式、动作格式、判定格式和反馈格式。
- 把骨骼/placeholder 降级为 fallback。
- 形成可以复制给 Kyo/Iori 的角色生产模板。

主线文档：[docs/product/ryo-vertical-slice-plan.md](docs/product/ryo-vertical-slice-plan.md)。

## 4. 每轮启动脚本

每轮开始必须按顺序做：

1. 查看 `git status --short`。
2. 如果存在非本轮改动，记录它们，绝不回滚。
3. 阅读：
   - `AGENTS.md`
   - `CLAUDE.md`
   - `docs/product/ryo-vertical-slice-plan.md`
   - `docs/process/iteration-workflow.md`
   - `docs/process/decision-gates.md`
   - `docs/architecture/workspace-architecture-target.md`
   - 本轮相关架构/产品文档
4. 判断本轮属于哪一类：
   - 资产格式
   - 肖像
   - 动作帧
   - 判定帧
   - 命中反馈
   - 验收工具
   - 文档约束
5. 输出本轮 PM/玩家/研发/测试/架构结论。
6. 写方案后再实施。

## 4.1 大型项目化方向

所有后续迁移都必须朝 [工作区目标架构](docs/architecture/workspace-architecture-target.md) 收敛：

- `app/` 只负责启动和依赖组装。
- `engine/` 只负责通用运行时。
- `simulation/` 只负责纯游戏模拟。
- `content/` 承载角色、舞台、manifest 和 frame contract 数据。
- `rendering/` 只读快照和 manifest。
- `audio/` 只响应事件。
- `tools/` 负责离线资产生成、校验和报告。

不要为了“显得大型”做大搬家。每次只迁移一个领域，并通过 [决策门](docs/process/decision-gates.md) 验收。

## 5. 每轮禁止事项

除非用户当前明确覆盖，否则禁止：

- 新增角色。
- 新增玩法模式。
- 把 placeholder 继续精修成正式方向。
- 重写整个引擎。
- 未完成 Ryo 样板就扩展 Kyo/Iori。
- 不经决策门直接引入 PixiJS/Godot/Rust/C++。
- 为了评分做无法验收的“看起来变多”改动。
- 把 MUGEN/IKEMEN/QF 的商业素材或受保护角色实现复制进运行时。

## 6. 每轮必须产出的方案

实施前必须写：

```text
本轮目标：
- ...

主线归属：
- Ryo 肖像 / Ryo 动作 / Ryo 判定 / Ryo 命中反馈 / 资产管线 / 验收工具 / 文档约束

PM 结论：
- 玩家会感到哪里变好？

玩家结论：
- 当前最刺眼的问题是什么？

研发方案：
- 改哪些文件？
- 不改哪些文件？

测试方案：
- 自动测试是什么？
- 手测路径是什么？

架构结论：
- 是否保持 Frame Contract？
- 是否保持运行时和工具链分离？
- 是否符合工作区目标架构？
- 是否通过对应决策门？

验收标准：
- ...

回退方案：
- ...
```

## 7. Ryo 样板验收标准

Ryo 不达标时，不允许把主线扩到更多角色。

### 7.1 肖像

- 选人、HUD、胜利至少有明确尺寸规范。
- 不再只依赖 fallback 颜色。
- 肖像来源必须合法、原创或明确可用。
- 肖像 manifest 必须能替换资产而不改 UI 逻辑。

### 7.2 动作

第一批只做：

- `idle`
- `walk_forward`
- `walk_backward`
- `jump`
- `stand_a`
- `stand_c`
- `hurt`
- `knockdown`

每个动作必须有：

- 帧名。
- 帧序列。
- 每帧 duration。
- anchor。
- 视觉 offset。
- 可选 hurtbox/hitbox。
- 对应 frame data 或说明。

### 7.3 判定

- startup/active/recovery 与视觉帧能对齐。
- hitbox/hurtbox 不写在渲染函数里。
- 判定数据可以被测试读取。
- 调试框只读取判定数据，不成为判定来源。

### 7.4 打击反馈

至少建立三档：

- light：短 hitstop，小 spark，小 pushback。
- heavy：更长 hitstop，更明显受击和 shake。
- special：专属 spark、音效、位移或残影。

每档必须绑定到 hit event，而不是散落在渲染函数里。

## 8. Frame Contract

所有动作相关系统必须围绕 `Frame Contract` 对齐。

一个动作帧至少描述：

```ts
interface FrameContract {
  characterId: string;
  actionId: string;
  frameIndex: number;
  duration: number;
  spriteRef: string;
  anchor: { x: number; y: number };
  offset: { x: number; y: number };
  hurtboxes: string[];
  hitboxes: string[];
  eventTags: string[];
}
```

实现时可以拆成多个类型，但语义必须保留：

- `spriteRef` 指向视觉资产。
- `hurtboxes` / `hitboxes` 指向判定资产。
- `eventTags` 触发脚步、挥拳、命中、落地等事件。
- combat 不读取 Canvas。
- rendering 不决定命中。
- audio/vfx 只响应事件。

## 9. 资产管线方向

运行时只消费 manifest。资产解析、atlas 生成、图片裁剪、palette 处理都属于工具层。

目标目录方向：

```text
assets/
  source/
    ryo/
      portraits/
      sprites/
      palettes/
  generated/
    ryo/
      ryo.atlas.png
      ryo.atlas.json
      ryo.portraits.json
      ryo.animations.json
      ryo.hitboxes.json

tools/
  asset-pipeline/
    build-atlas.ts
    validate-manifest.ts
    report-character-completeness.ts
```

当前可以先写 manifest 和校验工具，不必一次生成正式美术。

## 10. 技术栈决策

当前不要因为“不像 KOF”直接换栈。

换栈前必须满足：

- Ryo 已有真实 atlas/manifest。
- Canvas 2D 在真实资产下出现可复现性能或能力瓶颈。
- combat/input/state 已经和 rendering 解耦。
- 迁移方案能保留角色数据和 frame contract。

如果只是 placeholder 丑，换 PixiJS/Godot 也不会变成 KOF。

## 11. 评分规则

每轮最多 +5。

可加分条件：

- 推进了 Ryo 样板闭环。
- 或降低了资产/动作/判定/反馈管线风险。
- 或修复了阻碍 Ryo 闭环的稳定性问题。
- 或让约束文档更能防止跑偏。

不可加分：

- 新增角色。
- 无验收标准的泛泛优化。
- 构建失败。
- 只让 placeholder 更花。
- 不能说明更接近 KOF 在哪里。

## 12. 提交规则

每轮一个 commit。标题：

```text
type(scope): 中文标题
```

正文必须包含：

```text
原因：
- ...

差异：
- ...

验证：
- ...

风险：
- ...
```

如果工作区有他人改动，只 stage 本轮文件。

## 13. 给后续 AI 的执行口令

每次想新增东西前，先问：

> 这是否让 Ryo 的肖像、动作、判定、打击反馈闭环更完整？

如果答案不是明确的“是”，不要做。
