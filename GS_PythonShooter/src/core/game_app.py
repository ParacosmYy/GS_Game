# -*- coding: utf-8 -*-
"""
GS_PythonShooter — 主游戏引擎
修复：接入真实玩家对象到 GameLoop
"""
from panda3d.core import loadPrcFileData

loadPrcFileData("", """
win-size 1280 720
window-title GS_PythonShooter
show-frame-rate-meter 1
sync-video 0
gl-version 3 3
model-path $MAIN_DIR/assets
audio-library-name null
""")

from direct.showbase.ShowBase import ShowBase
from .game_loop import GameLoop, TeamSide
from .event_system import global_events
from ..input.input_manager import InputManager
from ..character.first_person_controller import FirstPersonController
from ..character.anim_state_machine import AnimStateMachine
from ..weapon.weapon_component import WeaponComponent
from ..environment.scene import SceneManager
from ..effects.impact_manager import ImpactManager
from ..ui.hud import HUD


class GameApp(ShowBase):
    def __init__(self):
        ShowBase.__init__(self)
        self.disableMouse()
        self.setFrameRateMeter(True)
        self.game_loop = GameLoop()
        self.player = self.game_loop.add_player("Player")
        self.input_mgr = InputManager(self)
        self.controller = FirstPersonController(self)
        self.weapon_component = WeaponComponent()
        self.weapon_component.spawn_defaults()
        self.weapon_component.equip("AK-47")
        self.anim_sm = AnimStateMachine()
        self.scene = SceneManager(self)
        self.scene.create_test_arena()
        self.scene.create_lighting()
        self.impact_mgr = ImpactManager(self)
        self.hud = HUD(self)
        self._bind_inputs()
        self.accept("escape", self.userExit)
        global_events.on("phase_changed", lambda p: None)
        self.taskMgr.add(self._update, "MainUpdate")
        print("[GS_PythonShooter] 启动完成")

    def _bind_inputs(self):
        im = self.input_mgr
        im.bind_action(im.MOVE_FORWARD, lambda v:
            self.controller.set_move_input(
                (1.0 if v else 0.0) if self.controller.move_input[0] == 0
                else self.controller.move_input[0], self.controller.move_input[1]))
        im.bind_action(im.MOVE_BACKWARD, lambda v:
            self.controller.set_move_input(-1.0 if v else 0.0, self.controller.move_input[1]))
        im.bind_action(im.MOVE_LEFT, lambda v:
            self.controller.set_move_input(self.controller.move_input[0], -1.0 if v else 0.0))
        im.bind_action(im.MOVE_RIGHT, lambda v:
            self.controller.set_move_input(self.controller.move_input[0], 1.0 if v else 0.0))
        im.bind_action(im.JUMP, lambda v: self.controller.do_jump() if v else None)
        im.bind_action(im.CROUCH, self.controller.set_crouch)
        im.bind_action(im.SPRINT, self.controller.set_sprint)
        im.bind_action(im.FIRE, lambda v: (
            self.weapon_component.start_fire() if v else self.weapon_component.end_fire()))
        im.bind_action(im.ADS, self.controller.set_ads)
        im.bind_action(im.RELOAD, lambda v: self.weapon_component.reload() if v else None)

    def _update(self, task):
        dt = globalClock.getDt()
        self.input_mgr.update()
        dx, dy = self.input_mgr.get_mouse_delta()
        self.controller.set_mouse_delta(dx, dy)
        self.controller.update(dt)
        self.weapon_component.update(dt)
        self.game_loop.update(dt)
        self.scene.update(dt)
        self.impact_mgr.update(dt)
        return task.cont
