@echo off
chcp 65001 >nul
title GS_PythonShooter
color 0A

setlocal enabledelayedexpansion

set "GAME_DIR=%~dp0GS_PythonShooter"
set "VENV_DIR=%GAME_DIR%\.venv"
set "PYTHON_EXE=%VENV_DIR%\Scripts\python.exe"

:: ─── 检测 venv ──────────────────────────────────────────
:CHECK_VENV
if exist "%PYTHON_EXE%" goto :VENV_OK

cls
echo ================================================
echo    GS_PythonShooter - 虚拟环境检测
echo ================================================
echo.
echo 未检测到虚拟环境 .venv
echo.
echo   [1] 自动创建虚拟环境并安装依赖 (推荐)
echo   [2] 重新检测
echo   [0] 退出
echo.
set /p CHOICE="请选择 [0-2]: "

if "%CHOICE%"=="1" goto :CREATE_VENV
if "%CHOICE%"=="2" goto :CHECK_VENV
if "%CHOICE%"=="0" exit /b 0
goto :CHECK_VENV

:CREATE_VENV
cls
echo [创建] 正在创建虚拟环境...
cd /d "%GAME_DIR%"
python -m venv .venv
if %errorlevel% neq 0 (
    echo [错误] 创建虚拟环境失败
    pause
    exit /b 1
)
echo [安装] 正在安装项目依赖...
.venv\Scripts\pip install --upgrade pip -q
.venv\Scripts\pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [错误] 依赖安装失败
    pause
    exit /b 1
)
echo [完成] 虚拟环境已就绪
timeout /t 2 >nul

:: ─── venv 就绪 → 菜单 ─────────────────────────────────
:VENV_OK
:MENU
cls
echo === GS_PythonShooter - 战术射击游戏 ===
echo   环境: .venv (隔离虚拟环境)
echo   引擎: Panda3D
echo.
echo  1 - 启动游戏
echo  2 - 系统自检
echo  3 - 依赖审计 (检查是否全局安装)
echo  4 - 安装/更新依赖
echo  5 - 进入 venv Shell
echo  6 - 查看文档
echo  0 - 退出
echo.
set /p CHOICE="请输入数字 [0-6]: "

if "%CHOICE%"=="1" goto :LAUNCH
if "%CHOICE%"=="2" goto :TEST
if "%CHOICE%"=="3" goto :AUDIT
if "%CHOICE%"=="4" goto :INSTALL
if "%CHOICE%"=="5" goto :SHELL
if "%CHOICE%"=="6" goto :DOCS
if "%CHOICE%"=="0" exit /b 0
goto :MENU

:LAUNCH
cls
echo [启动] 正在启动游戏...
cd /d "%GAME_DIR%"
"%PYTHON_EXE%" run_game.py --windowed
if %errorlevel% neq 0 (
    echo [错误] 启动失败，错误码：%errorlevel%
    pause
)
goto :MENU

:TEST
cls
echo [测试] 运行系统自检...
echo.
cd /d "%GAME_DIR%"
"%PYTHON_EXE%" run_game.py --test
echo.
pause
goto :MENU

:AUDIT
cls
echo [审计] 运行依赖审计...
echo.
cd /d "%GAME_DIR%"
"%PYTHON_EXE%" audit_deps.py
echo.
pause
goto :MENU

:INSTALL
cls
echo [安装] 在虚拟环境中安装/更新依赖...
cd /d "%GAME_DIR%"
.venv\Scripts\pip install --upgrade pip -q
.venv\Scripts\pip install -r requirements.txt
if %errorlevel% equ 0 (
    echo [完成] 依赖安装成功
) else (
    echo [错误] 安装失败
)
echo.
pause
goto :MENU

:SHELL
cls
echo [Shell] 正在打开虚拟环境 Shell
echo   退出请运行: deactivate
echo.
cd /d "%GAME_DIR%"
cmd /k ".venv\Scripts\activate.bat"
goto :MENU

:DOCS
cls
echo 项目文档:
echo.
echo   README.md             - 项目说明
echo   CONSTRAINT_DOC.md     - 架构约束
echo   SUBAGENT_PLAN.md      - 代理协同方案
echo.
echo 源码结构:
echo   src/core/       - 核心系统
echo   src/input/      - 输入管理
echo   src/character/  - FPS 控制器 + 动画
echo   src/weapon/     - 武器 + 弹道 + 伤害
echo   src/ai/         - 行为树 + AI 控制器
echo   src/environment/- 场景 + 可破坏物
echo   src/effects/    - 命中效果
echo   src/ui/         - HUD + 菜单
echo   src/render/     - PBR + 后处理 + 光照
echo.
pause
goto :MENU
