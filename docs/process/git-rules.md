# Git 规则

## Commit

格式：

```text
type(scope): 中文标题

- 原因: ...
- 差异: ...
- 验证: ...
- 风险: ...
```

常用类型：

- `feat`
- `fix`
- `refactor`
- `docs`
- `test`
- `chore`

## 禁止

- `git reset --hard`
- `git checkout --`
- `git push --force`
- `--no-verify`
- 交互式 git 控制台

除非用户明确要求，否则不得执行上述操作。

## 分支

- 当前开发分支：`kof-2002`
- 不直接修改 `main`
- 合并到稳定分支前需要用户确认

## Tag

- 只有达到明确里程碑时才打 tag。
- 1000 分可作为一个里程碑。
- 打 tag 前必须确认代码已 commit，且质量门禁通过。

