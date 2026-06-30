# -*- coding: utf-8 -*-
"""
GS_PythonShooter — PBR 着色器管线
对应 C++ 渲染系统中的 PBR 材质

基于 GLSL 的微表面 PBR 着色器
"""
from panda3d.core import Shader, NodePath


# ─── 顶点着色器 ─────────────────────────────────────────
PBR_VERTEX_SHADER = """
#version 140

uniform mat4 p3d_ModelViewProjectionMatrix;
uniform mat4 p3d_ModelMatrix;
uniform mat3 p3d_NormalMatrix;

in vec4 p3d_Vertex;
in vec3 p3d_Normal;
in vec2 p3d_MultiTexCoord0;

out vec2 texcoord;
out vec3 world_normal;
out vec3 world_position;

void main() {
    gl_Position = p3d_ModelViewProjectionMatrix * p3d_Vertex;

    vec4 world_pos = p3d_ModelMatrix * p3d_Vertex;
    world_position = world_pos.xyz;
    world_normal = normalize(p3d_NormalMatrix * p3d_Normal);
    texcoord = p3d_MultiTexCoord0;
}
"""

# ─── 片元着色器（Cook-Torrance BRDF） ──────────────────
PBR_FRAGMENT_SHADER = """
#version 140

uniform vec4 p3d_ColorScale;
uniform vec4 base_color;
uniform float metallic;
uniform float roughness;

in vec2 texcoord;
in vec3 world_normal;
in vec3 world_position;

out vec4 frag_color;

// 光源数据
const int MAX_LIGHTS = 4;
uniform vec3 light_positions[MAX_LIGHTS];
uniform vec3 light_colors[MAX_LIGHTS];
uniform float light_intensities[MAX_LIGHTS];

uniform vec3 camera_position;

// ─── PBR 函数 ─────────────────────────────────────

float DistributionGGX(vec3 N, vec3 H, float roughness) {
    float a = roughness * roughness;
    float a2 = a * a;
    float NdotH = max(dot(N, H), 0.0);
    float NdotH2 = NdotH * NdotH;
    float denom = NdotH2 * (a2 - 1.0) + 1.0;
    return a2 / (3.14159 * denom * denom);
}

float GeometrySchlickGGX(float NdotV, float roughness) {
    float r = roughness + 1.0;
    float k = (r * r) / 8.0;
    return NdotV / (NdotV * (1.0 - k) + k);
}

float GeometrySmith(vec3 N, vec3 V, vec3 L, float roughness) {
    return GeometrySchlickGGX(max(dot(N, V), 0.0), roughness)
         * GeometrySchlickGGX(max(dot(N, L), 0.0), roughness);
}

vec3 FresnelSchlick(float cosTheta, vec3 F0) {
    return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
}

void main() {
    vec3 albedo = base_color.rgb * p3d_ColorScale.rgb;
    float alpha = base_color.a * p3d_ColorScale.a;

    vec3 N = normalize(world_normal);
    vec3 V = normalize(camera_position - world_position);

    vec3 F0 = mix(vec3(0.04), albedo, metallic);

    vec3 Lo = vec3(0.0);

    for (int i = 0; i < MAX_LIGHTS; i++) {
        vec3 L = normalize(light_positions[i] - world_position);
        vec3 H = normalize(V + L);

        float distance = length(light_positions[i] - world_position);
        float attenuation = 1.0 / (distance * distance);
        vec3 radiance = light_colors[i] * light_intensities[i] * attenuation;

        float NDF = DistributionGGX(N, H, roughness);
        float G = GeometrySmith(N, V, L, roughness);
        vec3 F = FresnelSchlick(max(dot(H, V), 0.0), F0);

        vec3 kS = F;
        vec3 kD = vec3(1.0) - kS;
        kD *= 1.0 - metallic;

        float NdotL = max(dot(N, L), 0.0);

        vec3 specular = NDF * G * F / max(4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0), 0.001);
        vec3 diffuse = kD * albedo / 3.14159;

        Lo += (diffuse + specular) * radiance * NdotL;
    }

    // 环境光（简化版）
    vec3 ambient = vec3(0.03) * albedo;

    vec3 final_color = ambient + Lo;

    // Tone mapping
    final_color = final_color / (final_color + vec3(1.0));

    // Gamma 校正
    final_color = pow(final_color, vec3(1.0 / 2.2));

    frag_color = vec4(final_color, alpha);
}
"""


class PBRShader:
    """
    PBR 渲染管线

    用法:
        pbr = PBRShader(base)
        pbr.apply_to(my_model, metallic=0.8, roughness=0.2)
    """

    def __init__(self, base):
        self.base = base
        self.shader = Shader.make(Shader.SL_GLSL,
                                   PBR_VERTEX_SHADER,
                                   PBR_FRAGMENT_SHADER)

    def apply_to(self, node: NodePath,
                 base_color: tuple = (0.5, 0.5, 0.5, 1.0),
                 metallic: float = 0.0,
                 roughness: float = 0.5):
        """
        为节点应用 PBR 材质

        Args:
            node: 目标节点
            base_color: 基础颜色 (r, g, b, a)
            metallic: 金属度 0-1
            roughness: 粗糙度 0-1
        """
        node.setShader(self.shader)
        node.setShaderInput("base_color", *base_color)
        node.setShaderInput("metallic", metallic)
        node.setShaderInput("roughness", roughness)

        # 设置光照数据（会在每帧更新）
        self._update_lighting(node)

    def _update_lighting(self, node: NodePath):
        """更新光照数据到着色器"""
        # 获取场景中的光源
        lights = self.base.render.findallMatches("**/+Light")
        positions = []
        colors = []
        intensities = []

        for light_path in lights:
            light = light_path.node()
            pos = light_path.getPos(self.base.render)
            positions.append((pos.x, pos.y, pos.z))
            colors.append((1.0, 1.0, 1.0))
            intensities.append(1.0)

        # 补齐到 MAX_LIGHTS
        while len(positions) < 4:
            positions.append((0, 0, 0))
            colors.append((0, 0, 0))
            intensities.append(0.0)

        node.setShaderInput("light_positions", *positions)
        node.setShaderInput("light_colors", *colors)
        node.setShaderInput("light_intensities", *intensities)
        node.setShaderInput("camera_position",
                            self.base.camera.getPos(self.base.render))
