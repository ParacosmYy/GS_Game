# -*- coding: utf-8 -*-
"""
GS_PythonShooter — 弹道模拟系统
修复：_check_hit 接入 Panda3D CollisionRay
"""
import math
from typing import List, Tuple, Optional
from ..core.constants import BallisticHitResult, GameConstants


class Ballistics:
    GRAVITY = 980.0
    DRAG_COEFF = 0.001
    TIME_STEP = 0.001
    MAX_TIME = 0.5
    MAX_PENETRATIONS = 3

    SURFACE_RESISTANCE = {0: 0.5, 1: 0.2, 2: 0.5, 3: 1.0, 4: 2.0, 5: 5.0}

    def __init__(self):
        self._active_projectiles: List[dict] = []

    @classmethod
    def solve(cls, start_pos, direction, speed, damage,
              penetration_power, world=None, max_distance=50000.0):
        hits = []
        pos = list(start_pos)
        d = list(direction)
        inv = 1.0 / math.sqrt(sum(x*x for x in d)) if sum(x*x for x in d) > 0 else 1.0
        dir_vec = [x * inv for x in d]
        current_speed = speed
        current_damage = damage
        pen_count = 0
        traveled = 0.0

        for _ in range(int(cls.MAX_TIME / cls.TIME_STEP)):
            drag = cls.DRAG_COEFF * current_speed * current_speed * cls.TIME_STEP * 100.0
            current_speed -= drag
            if current_speed < 100.0:
                break
            step = current_speed * cls.TIME_STEP
            if traveled + step > max_distance:
                break
            traveled += step
            new_pos = [pos[i] + dir_vec[i] * step for i in range(3)]

            if world:
                hit_info = cls._check_hit(tuple(pos), tuple(new_pos), world, hits)
                if hit_info:
                    hit_result, exit_pos = hit_info
                    hit_result.final_damage = cls._calculate_damage(
                        current_damage, traveled, hit_result.bone_name)
                    if (pen_count < cls.MAX_PENETRATIONS and penetration_power > 0.3):
                        pen_damage = cls._calc_penetration(
                            hit_result.final_damage, 20.0, penetration_power,
                            hit_result.impact_material_index)
                        if pen_damage > 0:
                            hit_result.penetrated = True
                            hit_result.exit_location = exit_pos or tuple(new_pos)
                            hit_result.penetration_depth = 20.0
                            current_damage = pen_damage
                            pen_count += 1
                            pos = list(exit_pos or new_pos)
                            hits.append(hit_result)
                            continue
                    hits.append(hit_result)
                    return hits

            dir_vec[2] -= cls.GRAVITY * cls.TIME_STEP / current_speed if current_speed > 0 else 0
            inv2 = 1.0 / math.sqrt(sum(x*x for x in dir_vec))
            dir_vec = [x * inv2 for x in dir_vec]
            pos = new_pos
        return hits

    @classmethod
    def solve_line(cls, start, end, damage=36.0):
        result = BallisticHitResult()
        dx, dy, dz = end[0]-start[0], end[1]-start[1], end[2]-start[2]
        d = math.sqrt(dx*dx + dy*dy + dz*dz)
        falloff = cls._distance_falloff(damage, d)
        result.final_damage = damage * falloff
        result.location = end
        return result

    @classmethod
    def _check_hit(cls, start, end, world, existing_hits):
        """射线碰撞检测"""
        if not world:
            return None
        try:
            from panda3d.core import (CollisionTraverser, CollisionNode,
                CollisionHandlerQueue, CollisionRay, NodePath, BitMask32)
            dx = end[0] - start[0]
            dy = end[1] - start[1]
            dz = end[2] - start[2]
            dist = math.sqrt(dx*dx + dy*dy + dz*dz)
            if dist < 1:
                return None
            ray = CollisionRay(start[0], start[1], start[2],
                               dx/dist, dy/dist, dz/dist)
            rn = CollisionNode('ray')
            rn.addSolid(ray)
            rnp = NodePath(rn)
            q = CollisionHandlerQueue()
            t = CollisionTraverser()
            t.addCollider(rnp, q)
            t.traverse(world)
            rnp.removeNode()
            if q.getNumEntries() > 0:
                e = q.getEntry(0)
                bh = BallisticHitResult()
                p = e.getSurfacePoint(e.getIntoNodePath())
                n = e.getSurfaceNormal(e.getIntoNodePath())
                bh.hit_actor = e.getIntoNodePath()
                bh.location = (p.x, p.y, p.z)
                bh.normal = (n.x, n.y, n.z)
                return (bh, None)
        except Exception:
            pass
        return None

    @classmethod
    def _calculate_damage(cls, base_damage, distance, bone_name=""):
        falloff = cls._distance_falloff(base_damage, distance)
        dmg = base_damage * falloff
        if bone_name.lower() in ("head", "neck"):
            dmg *= GameConstants.HEADSHOT_MULTIPLIER
        return dmg

    @classmethod
    def _distance_falloff(cls, base, dist, mn=500.0, mx=5000.0):
        if dist <= mn:
            return 1.0
        if dist >= mx:
            return 0.5
        a = (dist - mn) / (mx - mn)
        return 1.0 - a * 0.5

    @classmethod
    def _calc_penetration(cls, damage, thickness, pen_power, surface=0):
        r = cls.SURFACE_RESISTANCE.get(surface, 0.5)
        loss = thickness * r * (1.0 - pen_power)
        return 0.0 if loss > damage else damage - loss

    @classmethod
    def should_ricochet(cls, impact_normal, incident_dir):
        dot = abs(sum(impact_normal[i] * incident_dir[i] for i in range(3)))
        angle = math.degrees(math.acos(min(dot, 1.0)))
        return (angle < 30.0, angle)
