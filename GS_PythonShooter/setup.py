#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GS_PythonShooter — 安装脚本
"""
from setuptools import setup, find_packages

setup(
    name="GS_PythonShooter",
    version="1.0.0",
    description="GS_TacticalShooter Python 移植版 — Panda3D 引擎",
    author="GS Team",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    python_requires=">=3.10",
    install_requires=[
        "panda3d>=1.10.14",
        "numpy>=1.26.0",
        "Pillow>=10.0.0",
    ],
    entry_points={
        "console_scripts": [
            "gshooter=run_game:main",
        ],
    },
)
