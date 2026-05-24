@echo off
chcp 65001 >nul 2>&1
echo ========================================
echo   拳皇2002 - 风云再起  打包工具
echo ========================================
echo.

echo [1/3] 安装依赖...
call npm install
if %errorlevel% neq 0 (
    echo 依赖安装失败!
    pause
    exit /b 1
)

echo.
echo [2/3] 构建项目...
call npx vite build
if %errorlevel% neq 0 (
    echo 构建失败!
    pause
    exit /b 1
)

echo.
echo [3/3] 打包ZIP...
where 7z >nul 2>&1
if %errorlevel% equ 0 (
    7z a -tzip KOF2002.zip .\dist\*
    echo.
    echo 打包完成! 文件: KOF2002.zip
) else (
    echo.
    echo 没有检测到7z, 已跳过ZIP打包。
    echo 你可以手动将 dist 文件夹压缩。
)

echo.
echo ========================================
echo   使用方法:
echo   1. 把 dist 文件夹 (或 KOF2002.zip 解压后)
echo      发给你的同学
echo   2. 双击打开 dist\index.html 即可游玩
echo   
echo   如果直接打开 HTML 黑屏, 请用本地服务器:
echo   方法: 在 dist 目录打开终端, 运行:
echo     npx serve .
echo   然后打开 http://localhost:3000
echo ========================================
echo.
pause
