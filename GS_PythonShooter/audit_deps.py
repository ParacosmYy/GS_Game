# -*- coding: utf-8 -*-
"""
GS_PythonShooter — 依赖审计与修复工具

功能:
  1. 扫描所有依赖的实际安装路径（全局 vs venv）
  2. 检测 venv 是否被绕过（全局安装替代了 venv）
  3. 可选的全局依赖卸载
  4. 强制将依赖安装到项目 venv

用法:
  python audit_deps.py             只检测，不修改
  python audit_deps.py --fix       检测 + 修复
  python audit_deps.py --purge     检测 + 卸载全局版本 + 强制重装 venv
  python audit_deps.py --force     跳过检测，直接强制重装 venv

安全:
  - 默认只读（--fix/--purge/--force 需要显式传参）
  - 所有破坏性操作前都有确认提示
  - 卸载前备份 requirements.txt
"""
import os
import sys
import subprocess
import json
import re
import shutil
from pathlib import Path
from typing import List, Tuple, Optional

# ─── 项目路径 ────────────────────────────────────────────────
PROJECT_ROOT = Path(__file__).resolve().parent
VENV_DIR = PROJECT_ROOT / ".venv"
VENV_PYTHON = VENV_DIR / "Scripts" / "python.exe"
VENV_PIP = VENV_DIR / "Scripts" / "pip.exe"
REQUIREMENTS = PROJECT_ROOT / "requirements.txt"


# ─── 工具函数 ────────────────────────────────────────────────

def print_banner(title: str):
    """打印区块标题"""
    print()
    print("=" * 60)
    print(f"  {title}")
    print("=" * 60)


def print_result(label: str, value: str, status: str = "OK"):
    """格式化输出"""
    icon = {"OK": "[OK]", "WARN": "[!]", "ERR": "[X]", "SKIP": "[-]"}.get(status, "[?]")
    print(f"  {icon} {label}: {value}")


def run_cmd(cmd: List[str], timeout: int = 60) -> Tuple[int, str, str]:
    """
    安全运行命令

    Args:
        cmd: 命令列表
        timeout: 超时秒数

    Returns:
        (returncode, stdout, stderr)
    """
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout,
            creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == "win32" else 0,
        )
        return result.returncode, result.stdout.strip(), result.stderr.strip()
    except FileNotFoundError:
        return -1, "", f"找不到可执行文件: {cmd[0]}"
    except subprocess.TimeoutExpired:
        return -2, "", f"命令超时 ({timeout}s)"
    except PermissionError:
        return -3, "", f"权限不足: {cmd[0]}"
    except Exception as e:
        return -99, "", str(e)


# ═══════════════════════════════════════════════════════════════
#  第 1 步: 环境完整性检测
# ═══════════════════════════════════════════════════════════════

def check_venv_exists() -> Tuple[bool, str]:
    """检查 .venv 是否存在且完整"""
    if not VENV_DIR.exists():
        return False, ".venv 目录不存在"

    if not VENV_PYTHON.exists():
        return False, f".venv 中找不到 python.exe"

    if not VENV_PIP.exists():
        return False, f".venv 中找不到 pip.exe"

    # 验证 venv Python 能正常运行
    code, out, err = run_cmd([str(VENV_PYTHON), "--version"])
    if code != 0:
        return False, f"venv Python 无法运行: {err}"

    return True, out


def check_requirements_file() -> Tuple[bool, List[str]]:
    """解析 requirements.txt，返回依赖列表"""
    if not REQUIREMENTS.exists():
        return False, []

    deps = []
    with open(REQUIREMENTS, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            # 跳过注释和空行
            if not line or line.startswith("#"):
                continue
            # 提取包名（去掉版本约束）
            match = re.match(r"^([a-zA-Z0-9_.-]+)", line)
            if match:
                deps.append(match.group(1))

    return True, deps


# ═══════════════════════════════════════════════════════════════
#  第 2 步: 依赖安装路径检测
# ═══════════════════════════════════════════════════════════════

def get_package_location(package: str, python_exe: str) -> Tuple[str, str, str]:
    """
    获取单个包的安装信息

    Returns:
        (version, location, is_editable)
    """
    code, out, err = run_cmd([
        python_exe, "-m", "pip", "show", package
    ])

    if code != 0:
        return "", "", ""

    version = ""
    location = ""
    editable = ""

    for line in out.split("\n"):
        if line.startswith("Version:"):
            version = line.split(":", 1)[1].strip()
        elif line.startswith("Location:"):
            location = line.split(":", 1)[1].strip()
        elif line.startswith("Editable:"):
            editable = line.split(":", 1)[1].strip()

    return version, location, editable


def classify_path(location: str) -> str:
    """
    判断路径属于全局还是 venv

    Returns:
        "venv" / "global" / "unknown"
    """
    if not location:
        return "unknown"
    loc = Path(location).resolve()
    venv = VENV_DIR.resolve()

    # venv site-packages 路径特征
    venv_patterns = [
        venv / "Lib" / "site-packages",
        venv / "lib" / "python*/site-packages",
    ]

    for pattern in venv_patterns:
        try:
            if loc == pattern or pattern in loc.parents:
                return "venv"
        except (ValueError, OSError):
            pass

    # Windows 全局安装常见路径
    global_patterns = [
        Path(os.environ.get("APPDATA", "")) / "Python",
        Path(os.environ.get("LOCALAPPDATA", "")) / "Programs" / "Python",
        Path("C:\\Python*"),
        Path("C:\\Program Files\\Python*"),
        Path(sys.prefix) / "Lib" / "site-packages" if location else "",
    ]

    loc_str = str(loc).lower()
    for pattern in global_patterns:
        if not pattern:
            continue
        if str(pattern.resolve()).lower() in loc_str if pattern.exists() else False:
            return "global"

    # 基于字符串启发式判断
    if "site-packages" in loc_str:
        if ".venv" in loc_str or "venv" in loc_str:
            return "venv"
        # 检查 sys.base_prefix（原始全局 Python 路径）
        base = Path(sys.base_prefix).resolve()
        if str(base).lower() in loc_str:
            return "global"
        return "global"

    return "unknown"


def scan_dependencies(python_exe: str, dep_names: List[str]) -> List[dict]:
    """
    扫描所有依赖的安装状态

    Returns:
        [
            {
                "name": "panda3d",
                "version": "1.10.14",
                "location": "C:\\...",
                "env_type": "venv|global|not_installed",
                "required": True
            },
            ...
        ]
    """
    results = []

    for dep in dep_names:
        version, location, editable = get_package_location(dep, python_exe)
        env_type = classify_path(location) if version else "not_installed"

        results.append({
            "name": dep,
            "version": version,
            "location": location,
            "env_type": env_type,
            "editable": bool(editable),
        })

    return results


# ═══════════════════════════════════════════════════════════════
#  第 3 步: 报告生成
# ═══════════════════════════════════════════════════════════════

def generate_report(venv_info: Tuple, deps: List[str],
                     global_pkgs: List[dict], venv_pkgs: List[dict]):
    """生成格式化检测报告"""
    print_banner("环境完整性检测")

    venv_ok, venv_ver = venv_info
    if venv_ok:
        print_result("虚拟环境 (.venv)", f"就绪 — {venv_ver}")
    else:
        print_result("虚拟环境 (.venv)", venv_ver, "ERR")

    req_ok, req_deps = check_requirements_file()
    if req_ok:
        print_result("依赖清单 (requirements.txt)", f"{len(req_deps)} 个依赖")
    else:
        print_result("依赖清单 (requirements.txt)", "文件不存在", "ERR")

    print_banner("依赖安装路径扫描")

    any_global = False
    any_missing = False

    # 收集所有包名（去重）
    all_pkgs = set(deps)
    for p in global_pkgs + venv_pkgs:
        all_pkgs.add(p["name"])

    # 合并扫描结果
    pkg_map = {}
    for p in global_pkgs:
        pkg_map[p["name"]] = p
    for p in venv_pkgs:
        if p["name"] in pkg_map:
            # venv 结果覆盖全局
            pass
        pkg_map[p["name"]] = p

    for pkg_name in sorted(all_pkgs):
        info = pkg_map.get(pkg_name, {"name": pkg_name, "env_type": "not_installed",
                                        "version": "", "location": ""})

        if info["env_type"] == "venv":
            print_result(f"  {pkg_name} {info['version']}",
                         f"venv: {info['location'][:60]}...", "OK")
        elif info["env_type"] == "global":
            any_global = True
            print_result(f"  {pkg_name} {info['version']}",
                         f"[GLOBAL] {info['location'][:60]}...", "WARN")
        elif info["env_type"] == "not_installed":
            any_missing = True
            print_result(f"  {pkg_name}", "未安装", "SKIP")
        else:
            print_result(f"  {pkg_name} {info['version']}",
                         f"[UNKNOWN] {info['location'][:60]}...", "WARN")

    # 汇总
    print()
    print("-" * 60)

    if any_global:
        print("  [!] 发现全局安装的依赖 — venv 环境可能被绕过！")
    if any_missing:
        print("  [-] 部分依赖未安装")

    if not any_global and not any_missing:
        print("  [OK] 所有依赖已正确安装在 venv 中")

    return any_global, any_missing


# ═══════════════════════════════════════════════════════════════
#  第 4 步: 修复逻辑
# ═══════════════════════════════════════════════════════════════

def uninstall_global_packages(pkg_names: List[str]) -> Tuple[int, str]:
    """
    从全局 Python 卸载依赖

    Returns:
        (success_count, error_message)
    """
    if not pkg_names:
        return 0, "没有需要卸载的全局包"

    print_banner("卸载全局环境依赖")

    success = 0
    for pkg in pkg_names:
        print(f"  [卸载] {pkg}...", end=" ")
        code, out, err = run_cmd([
            sys.executable, "-m", "pip", "uninstall", pkg, "-y"
        ])
        if code == 0:
            print("完成")
            success += 1
        else:
            print(f"失败: {err[:60]}")

    return success, ""


def ensure_venv_exists() -> bool:
    """确保 .venv 存在，不存在则创建"""
    if VENV_PYTHON.exists():
        return True

    print_banner("创建虚拟环境")
    print(f"  路径: {VENV_DIR}")

    code, out, err = run_cmd([
        sys.executable, "-m", "venv", str(VENV_DIR)
    ], timeout=120)

    if code != 0:
        print(f"  [ERR] 创建失败: {err}")
        return False

    print("  [OK] 虚拟环境已创建")
    return True


def install_to_venv(dep_names: List[str]) -> Tuple[int, List[str]]:
    """
    强制将依赖安装到 venv

    Returns:
        (success_count, failed_packages)
    """
    print_banner("安装依赖到虚拟环境")

    # 升级 venv 的 pip
    print("  [升级] venv pip...")
    run_cmd([str(VENV_PYTHON), "-m", "pip", "install", "--upgrade", "pip"],
            timeout=60)

    # 安装依赖
    success = 0
    failed = []

    for dep in dep_names:
        print(f"  [安装] {dep}...", end=" ")
        code, out, err = run_cmd([
            str(VENV_PYTHON), "-m", "pip", "install", dep
        ], timeout=300)

        if code == 0:
            print("完成")
            success += 1
        else:
            print("失败")
            failed.append(dep)
            # 提取关键错误信息
            err_short = err[:100] if err else "未知错误"
            print(f"         原因: {err_short}")

    return success, failed


def batch_install_to_venv() -> Tuple[int, List[str]]:
    """
    批量安装（使用 -r requirements.txt，更快）

    Returns:
        (returncode, failed_packages)
    """
    print_banner("批量安装依赖到虚拟环境")

    code, out, err = run_cmd([
        str(VENV_PYTHON), "-m", "pip", "install",
        "-r", str(REQUIREMENTS),
        "--no-input"
    ], timeout=600)

    if code == 0:
        print("  [OK] 依赖全部安装成功")
        return 0, []
    else:
        print(f"  [ERR] 安装失败 (code={code})")
        print(f"  错误: {err[:200]}")
        # 尝试逐包安装回退
        _, deps = check_requirements_file()
        return install_to_venv(deps)


# ═══════════════════════════════════════════════════════════════
#  第 5 步: 主入口
# ═══════════════════════════════════════════════════════════════

def main():
    """主函数"""
    import argparse

    parser = argparse.ArgumentParser(
        description="GS_PythonShooter 依赖审计与修复工具",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  python audit_deps.py                 只检测不修改
  python audit_deps.py --fix           检测 + 修复缺失依赖
  python audit_deps.py --purge         检测 + 卸载全局依赖 + 重装 venv
  python audit_deps.py --force         跳过检测，直接强制重装 venv
  python audit_deps.py --verbose       详细输出
        """
    )
    parser.add_argument("--fix", action="store_true",
                        help="修复模式：安装缺失的依赖到 venv")
    parser.add_argument("--purge", action="store_true",
                        help="清理模式：卸载全局依赖并强制重装 venv")
    parser.add_argument("--force", action="store_true",
                        help="强制模式：跳过检测，直接重装 venv 所有依赖")
    parser.add_argument("--verbose", action="store_true",
                        help="详细输出")
    parser.add_argument("--yes", "-y", action="store_true",
                        help="自动确认所有操作（非交互模式）")

    args = parser.parse_args()

    # ─── 检测阶段 ───────────────────────────────────────
    print()
    print("  GS_PythonShooter — 依赖审计工具")
    print(f"  项目路径: {PROJECT_ROOT}")
    print(f"  虚拟环境: {VENV_DIR}")
    print(f"  全局 Python: {sys.executable}")
    print(f"  模式: {'只读' if not (args.fix or args.purge or args.force) else '修复'}")

    # Step 1: 检查 venv 完整性
    venv_info = check_venv_exists()

    # Step 2: 读取 requirements.txt
    req_ok, dep_names = check_requirements_file()
    if not req_ok:
        print(f"\n  [ERR] {REQUIREMENTS} 不存在或无法读取")
        sys.exit(1)

    if not dep_names:
        print(f"\n  [WARN] requirements.txt 中没有找到有效依赖")
        sys.exit(0)

    # Step 3: 扫描全局 Python 中的依赖
    print_banner("扫描全局环境")
    global_pkgs = scan_dependencies(sys.executable, dep_names)

    # Step 4: 如果 venv 存在，扫描 venv 中的依赖
    venv_pkgs = []
    if venv_info[0]:
        print_banner("扫描虚拟环境")
        venv_pkgs = scan_dependencies(str(VENV_PYTHON), dep_names)

    # Step 5: 生成报告
    any_global, any_missing = generate_report(venv_info, dep_names,
                                               global_pkgs, venv_pkgs)

    # ─── 只读模式 → 退出 ────────────────────────────────
    if not (args.fix or args.purge or args.force):
        print()
        print("  提示: 使用 --fix 修复缺失依赖")
        print("        使用 --purge 卸载全局 + 重装 venv")
        print("        使用 --force 跳过检测直接重装")
        sys.exit(0 if not (any_global or any_missing) else 1)

    # ─── 修复模式 ──────────────────────────────────────
    if args.fix and not args.purge and not args.force:
        if not any_missing:
            print("\n  [OK] 没有缺失的依赖，无需修复")
            sys.exit(0)

        # 确保 venv 存在
        if not ensure_venv_exists():
            print("\n  [ERR] 无法创建虚拟环境")
            sys.exit(1)

        # 安装缺失依赖
        missing = [p["name"] for p in global_pkgs + venv_pkgs
                   if p["env_type"] == "not_installed"]
        if args.yes or input("\n  确认安装缺失依赖到 venv? [y/N]: ").lower() == "y":
            success, failed = install_to_venv(missing)
            if failed:
                print(f"\n  [WARN] {len(failed)} 个依赖安装失败: {', '.join(failed)}")
                sys.exit(1)
            print("\n  [OK] 修复完成")
        sys.exit(0)

    # ─── 清理模式 ──────────────────────────────────────
    if args.purge:
        print()
        print("  [!!] 注意: 此操作将卸载全局 Python 中的项目依赖")
        print("        不影响其他项目，但操作不可逆")

        proceed = args.yes or input("\n  确认继续? [y/N]: ").lower() == "y"
        if not proceed:
            print("  已取消")
            sys.exit(0)

        # 1. 卸载全局依赖
        global_pkg_names = [p["name"] for p in global_pkgs
                            if p["env_type"] == "global"]
        if global_pkg_names:
            uninstall_global_packages(global_pkg_names)

        # 2. 确保 venv
        ensure_venv_exists()

        # 3. 如果 venv 已存在，先清空再重装
        if VENV_PYTHON.exists():
            print_banner("清理 venv 旧依赖")
            code, out, err = run_cmd([
                str(VENV_PYTHON), "-m", "pip", "freeze"
            ])
            if code == 0 and out.strip():
                installed = [l.split("==")[0] for l in out.split("\n")
                            if "==" in l and not l.startswith("-")]
                for pkg in installed:
                    print(f"  [卸载] {pkg}...", end=" ")
                    run_cmd([str(VENV_PYTHON), "-m", "pip",
                             "uninstall", pkg, "-y", "-q"])
                    print("完成")

        # 4. 批量重装
        batch_install_to_venv()

        # 5. 最终验证
        print_banner("最终验证")
        venv_pkgs = scan_dependencies(str(VENV_PYTHON), dep_names)
        all_ok = all(p["env_type"] == "venv" for p in venv_pkgs)
        if all_ok:
            print("  [OK] 所有依赖已正确安装在 venv 中")
        else:
            bad = [p["name"] for p in venv_pkgs if p["env_type"] != "venv"]
            print(f"  [WARN] 以下依赖仍有问题: {', '.join(bad)}")
            sys.exit(1)

        sys.exit(0)

    # ─── 强制模式 ──────────────────────────────────────
    if args.force:
        print()
        print("  [!!] 强制重装模式: 将清除 venv 并重新安装所有依赖")

        proceed = args.yes or input("\n  确认继续? [y/N]: ").lower() == "y"
        if not proceed:
            print("  已取消")
            sys.exit(0)

        # 重建 venv
        print_banner("重建虚拟环境")
        if VENV_DIR.exists():
            shutil.rmtree(VENV_DIR, ignore_errors=True)
            print("  [OK] 旧 .venv 已删除")

        if not ensure_venv_exists():
            sys.exit(1)

        # 批量安装
        batch_install_to_venv()

        # 最终验证
        print_banner("最终验证")
        venv_pkgs = scan_dependencies(str(VENV_PYTHON), dep_names)
        all_ok = all(p["env_type"] == "venv" for p in venv_pkgs)
        if all_ok:
            print("  [OK] 所有依赖已正确安装在 venv 中")
        else:
            bad = [p["name"] for p in venv_pkgs if p["env_type"] != "venv"]
            print(f"  [WARN] 以下依赖仍有问题: {', '.join(bad)}")
            sys.exit(1)

        sys.exit(0)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n  用户中断")
        sys.exit(1)
    except PermissionError as e:
        print(f"\n  [ERR] 权限不足: {e}")
        print("  提示: 请以管理员身份运行")
        sys.exit(1)
    except Exception as e:
        print(f"\n  [ERR] 意外错误: {e}")
        if "--verbose" in sys.argv or "-v" in sys.argv:
            import traceback
            traceback.print_exc()
        sys.exit(1)
