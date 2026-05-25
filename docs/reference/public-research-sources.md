# 公开参考源与本地 references

## 本地参考

- `references/mugen/ikemen-go`：开源格斗引擎结构参考。
- `references/mugen/sff-extractor`：SFF 提取和 palette/sprite 数据结构参考。
- `references/mugen/sprite-viewer`：SFF 浏览、导出、sprite sheet 工具参考。
- `references/mugen/chars`：本地研究素材，只能用于学习结构和差距，不得直接并入运行时。

## 可借鉴内容

- 数据驱动角色、动画、命令、常量。
- 运行时与资产工具链分离。
- animation frame 绑定 sprite、offset、duration、collision boxes。
- palette 和 sprite group/number 管理。
- 状态可保存、可恢复、可回放。

## 不可借鉴或需谨慎

- 不复制商业角色素材、音频、screenpack。
- 不直接照搬 IKEMEN 的全局 `sys` 大对象。
- 不直接引入 MUGEN 脚本编译器复杂度。
- 不把离线查看器/提取器逻辑放进浏览器运行时。

