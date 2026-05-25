# 拳皇2002风云再起 (KOF 2002 UM) - 终极架构设计 (V2)

> 背景：由于项目解除了 150KB 和 100MB 的死板限制，全面拥抱 **GB级别的数据量** 和 **逐帧原生精灵图 (Sprite Sheets)**，当前的单体/面条式架构必然在中期崩溃。为了支撑海量的帧数据、复杂的组件级交互以及真正的街机物理，我们需要向**数据驱动+高内聚引擎**的现代化架构演进。

---

## 1. 终极目录结构规划

全新的架构采用 **"引擎 (Engine) 与 内容 (Content) 分离"** 的原则。所有的底层必须剥离具体的角色业务，靠读取庞大的数据文件来运作。

```text
KOF2002_UM/
├── public/                 # (新) 静态资源目录 (无上限边界)
│   ├── sprites/            # 巨型精灵图
│   │   ├── chars/          # 角色图集 (kyo.webp, iori.webp)
│   │   ├── vfx/            # 全局特效 (hit_sparks.webp)
│   │   └── stages/         # 场景切片 (用于视差滚动)
│   ├── audio/              # BGM与音效 (Ogg/MP3)
│   └── data/               # (核心) 原版解析出的帧数据与碰撞框 JSON
│
├── src/
│   ├── main.ts             # 游戏总入口，负责统筹加载与初始化
│   │
│   ├── engine/             # [黑盒引擎层] 绝对纯净的底层设施，不论是KOF还是街霸都能用
│   │   ├── core/           # 核心：GameLoop固定步长循环, EventBus事件总线, Camera带震动逻辑
│   │   ├── asset/          # 资源：AssetManager(支持分包动态按需加载, LruCache内存淘汰)
│   │   ├── physics/        # 物理：Pushbox力学引擎, AABB四维交叉碰撞(Hurt/Hit/Throw)
│   │   ├── input/          # 输入：CommandBuffer前向留存, InputParser指令解析(支持复合变种)
│   │   └── rendering/      # 渲染：SpriteRenderer引擎(替代原来的骨架), PaletteShader色板替换算法
│   │
│   ├── game/               # [游戏业务层] 特化为 KOF2002UM 的独特机制
│   │   ├── combat/         # 斗剧逻辑：DamageCalculator(伤害衰减), MeterSystem(爆气与气槽)
│   │   ├── states/         # 游戏流程控制(FSM)：
│   │   │   ├── TitleState.ts        # 标题画面
│   │   │   ├── SelectState.ts       # 选人界面
│   │   │   ├── OrderSelectState.ts  # [新增] 组队排阵(首发/次发)
│   │   │   └── MatchState.ts        # 核心对战调度机
│   │   │
│   │   ├── entities/       # 实体控制器：
│   │   │   ├── Fighter.ts           # 角色基类 (只负责拼装 Component，无具体招式)
│   │   │   ├── Projectile.ts        # 波/飞行道具处理
│   │   │   └── EffectEntity.ts      # 视觉特效留存(火花、残影)
│   │   │
│   │   ├── characters/     # [内容层] 角色特化控制脚本 (完全数据驱动)
│   │   │   ├── CharacterBase.ts     # 基类提供基础状态机 (跳、走、防、出招)
│   │   │   ├── kyo/                 # 京的具体定义（不再存庞大Hitbox，只写招式派生逻辑）
│   │   │   │   ├── kyoLogic.ts      # 特殊的取消树(例如毒咬接罪咏)
│   │   │   │   └── kyoCommand.ts    # 专属出招表组合
│   │   │   └── roster.ts            # 阵容注册表
│   │   │
│   │   └── stages/         # [内容层] 场景特化脚本
│   │       └── StageController.ts   # 负责控制背景NPC动画、视差层、边界墙反弹(Wall Bounce)
│   │
│   └── ui/                 # HTML/Canvas 混编 UI 层
│       ├── menus/          # 选人、模式、设置
│       └── hud/            # 对战血条、连击数(Combo)、时间
```

---

## 2. 突破当前瓶颈的四大核心变更

### 2.1 引入 `AssetManager` (资源大管家)
*   **当前弊端**：全靠硬编码直接生成矩形，没有真正的资源预加载和内存释放。
*   **新架构设计**：你的代码中必须有一个 `AssetManager` 单例。在跳转到 MatchState 之前，`AssetManager.loadCharacter('kyo')` 会去读取 50MB 的雪碧图并解析。在换场景时，负责清理上个场景释放内存（垃圾回收）。

### 2.2 极致的“数据驱动开发 (Data-Driven)”
*   **当前弊端**：Hitbox和帧数据（`constants.ts`）跟逻辑揉在一起。如果写 40 个角色的数据，文件会达到数万行，VSCode 都会卡顿。
*   **新架构设计**：数据不应该写在 TS 文件里，而应该放在 `/public/data/kyo.json`。这个巨型 JSON 里包含每一帧图片对应的前后上下4个维度的碰撞框坐标。在进入游戏时，系统通过 `fetch` 读取 JSON 喂给组件。

### 2.3 `SpriteRenderer` 取代 `SkeletalFighter`
*   **当前弊端**：骨骼计算不仅“假”，也违背了街机逐帧动画的本质。
*   **新架构设计**：底层写一个强大的贴图剪裁与播放引擎。将当前时间传递给 `SpriteRenderer`，它会根据当前角色的状态和 Frame 数据，自动计算出该去大图集提取那块 `(x, y, w, h)` 的像素并渲染在 Canvas 上。

### 2.4 从面条状态机到层次化组件 (Components)
*   **当前弊端**：`fighterController.ts` 全揽了物理推挤、血量、输入读取和判断，长此以往根本无法维护复杂的招式取消网络。
*   **新架构设计**：Fighter实体解耦，由单独的 `InputComponent` 处理用户的输入流，由 `PhysicsComponent` 更新被撞击的物理坐标，由 `AnimationComponent` 管理特效播放，这才是支撑几百个状态（硬直、倒地、防空、各种死法）的现代解法。

---

## 3. 下一步技术基建方向（如何平滑过渡）

你不需要把当前项目立刻删了重建，而是采用**渐进式绞杀者模式**：

1. **第一步（新建物理沙盒）**：先在根目录建立 `/src/engine`，把你的 `core` / `input` 移进去重构。
2. **第二步（构建数据流）**：写一个脚本或者系统，跑通从外部加载 JSON 帧数据和加载任意一张完整雪碧图的功能。
3. **第三步（状态机大换血）**：拿一个角色（比如草薙京）当试验田，将他切换为完全用 `SpriteRenderer` 和 `Data-driven hitbox` 的新体系下运行，此时草薙京看起来是原汁原味的，其他角色还是骨块。
4. **第四步（全面应用）**：新跑通之后，全面接轨新架构并拓展角色池。