# Git 规则

## 1. 基本规则

- 每轮一个 commit。
- 不把多轮迭代混成一个提交。
- 不提交无关文件。
- 工作区有他人改动时，只 stage 本轮文件。
- 禁止 `git reset --hard`、`git checkout --`、`--force`、`--no-verify`，除非用户明确要求。

## 2. Commit 标题

格式：

```text
type(scope): 中文标题
```

常用 type：

- `docs`
- `feat`
- `fix`
- `refactor`
- `test`
- `chore`

scope 应体现主线，例如：

- `ryo`
- `asset-pipeline`
- `frame-contract`
- `feedback`
- `architecture`
- `decision`
- `docs`

## 3. Commit 正文

必须包含：

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

## 4. Ryo 主线提交要求

正文必须额外说明：

- 本轮推进 Ryo 哪个闭环。
- 是否保留 fallback。
- 是否触发技术栈决策门。
- 是否符合工作区目标架构。
