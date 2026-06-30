# -*- coding: utf-8 -*-
"""
GS_PythonShooter — 第一人称控制器
修复：velocity 随移动更新，运动状态使用实际速度
"""
from panda3d.core import Vec3, Point3
from ..core.constants import GameConstants, CharacterPose, MovementState


class FirstPersonController:
    def __init__(self, base):
        self.base = base
        self.camera = base.camera
        self.cam_node = base.camNode
        self.position = Point3(0, 0, 0)
        self.rotation = (0.0, 0.0)
        self.height = 64.0
        self.velocity = Vec3(0, 0, 0)
        self.move_input = (0.0, 0.0)
        self.is_grounded = True
        self.vertical_velocity = 0.0
        self.pose = CharacterPose.STANDING
        self.movement_state = MovementState.IDLE
        self.is_ads = False
        self.is_sprinting = False
        self.current_speed = GameConstants.MOVE_SPEED_DEFAULT
        self._target_speed = GameConstants.MOVE_SPEED_DEFAULT
        self.default_fov = 90.0
        self.ads_fov = 45.0
        self.current_fov = self.default_fov
        self._target_fov = self.default_fov
        self.gravity = -980.0
        self.jump_velocity = 420.0

    def set_move_input(self, f, r):
        self.move_input = (f, r)

    def set_mouse_delta(self, dx, dy):
        yaw = self.rotation[1] + dx * 0.1
        pitch = self.rotation[0] + dy * 0.1
        self.rotation = (max(-89.0, min(89.0, pitch)), yaw)

    def do_jump(self):
        if self.is_grounded and self.pose != CharacterPose.CROUCHING:
            self.vertical_velocity = self.jump_velocity
            self.is_grounded = False

    def set_crouch(self, c):
        self.pose = CharacterPose.CROUCHING if c else CharacterPose.STANDING
        self.height = 32.0 if c else 64.0

    def set_sprint(self, s):
        self.is_sprinting = s and not self.is_ads and abs(self.move_input[0]) > 0

    def set_ads(self, ads):
        self.is_ads = ads

    def update(self, dt):
        if dt <= 0:
            return

        # 速度目标
        if self.is_sprinting:
            self._target_speed = GameConstants.MOVE_SPEED_SPRINT
        elif self.is_ads:
            self._target_speed = GameConstants.MOVE_SPEED_ADS
        elif self.pose == CharacterPose.CROUCHING:
            self._target_speed = GameConstants.MOVE_SPEED_CROUCH
        else:
            self._target_speed = GameConstants.MOVE_SPEED_DEFAULT
        self.current_speed += (self._target_speed - self.current_speed) * dt * 8.0

        # 水平移动
        fwd = Vec3(self.camera.getQuat().getForward().x,
                   self.camera.getQuat().getForward().y, 0).normalized()
        rgt = Vec3(self.camera.getQuat().getRight().x,
                   self.camera.getQuat().getRight().y, 0).normalized()
        move = fwd * self.move_input[0] + rgt * self.move_input[1]
        if move.length() > 0:
            move.normalize()
            move *= self.current_speed * dt
        self.position.x += move.x
        self.position.y += move.y
        self.velocity = Vec3(move.x / dt, move.y / dt, 0)

        # 重力
        if not self.is_grounded:
            self.vertical_velocity += self.gravity * dt
            self.position.z += self.vertical_velocity * dt
            if self.position.z <= 0:
                self.position.z = 0
                self.vertical_velocity = 0
                self.is_grounded = True

        # 相机
        self.camera.setPos(self.position + Vec3(0, 0, self.height))
        self.camera.setHpr(self.rotation[1], self.rotation[0], 0)

        # FOV
        self._target_fov = self.ads_fov if self.is_ads else self.default_fov
        self.current_fov += (self._target_fov - self.current_fov) * dt * 5.0
        self.cam_node.getLens().setFov(self.current_fov)

        # 运动状态
        spd = self.velocity.length()
        if self.is_sprinting and spd > 10:
            self.movement_state = MovementState.SPRINTING
        elif self.is_ads and spd > 10:
            self.movement_state = MovementState.ADS_WALKING
        elif spd > 200:
            self.movement_state = MovementState.RUNNING
        elif spd > 10:
            self.movement_state = MovementState.WALKING
        else:
            self.movement_state = MovementState.IDLE
        if not self.is_grounded:
            self.movement_state = MovementState.RUNNING
