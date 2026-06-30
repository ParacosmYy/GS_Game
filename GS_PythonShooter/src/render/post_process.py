# -*- coding: utf-8 -*-
"""
GS_PythonShooter — 后处理效果
对应 C++ UShooterRenderSettings 的后处理部分

管理：Bloom、色调映射、Vignette
"""
from panda3d.core import (
    NodePath, Shader, CardMaker, Texture, Vec4
)


class PostProcess:
    """
    后处理管线

    使用 Panda3D 的 Shader 实现屏幕后处理效果
    """

    # ─── Bloom 着色器 ──────────────────────────────────
    BLOOM_SHADER_VERT = """
    #version 140
    in vec4 p3d_Vertex;
    in vec2 p3d_MultiTexCoord0;
    out vec2 texcoord;
    void main() {
        gl_Position = p3d_Vertex;
        texcoord = p3d_MultiTexCoord0;
    }
    """

    BLOOM_SHADER_FRAG = """
    #version 140
    uniform sampler2D screen_texture;
    uniform float bloom_intensity;
    uniform float vignette_intensity;

    in vec2 texcoord;
    out vec4 frag_color;

    void main() {
        vec4 color = texture(screen_texture, texcoord);

        // Bloom (简化版：高亮区域模糊)
        vec2 offsets[9] = vec2[](
            vec2(-0.003, -0.003), vec2(0.0, -0.003), vec2(0.003, -0.003),
            vec2(-0.003, 0.0),    vec2(0.0, 0.0),     vec2(0.003, 0.0),
            vec2(-0.003, 0.003),  vec2(0.0, 0.003),   vec2(0.003, 0.003)
        );

        vec3 bloom = vec3(0.0);
        for (int i = 0; i < 9; i++) {
            vec3 sample = texture(screen_texture, texcoord + offsets[i]).rgb;
            float brightness = dot(sample, vec3(0.2126, 0.7152, 0.0722));
            bloom += sample * max(brightness - 0.8, 0.0);
        }
        bloom /= 9.0;

        color.rgb += bloom * bloom_intensity;

        // Vignette (暗角)
        vec2 center = texcoord - 0.5;
        float dist = length(center);
        float vignette = 1.0 - dist * dist * vignette_intensity;
        color.rgb *= vignette;

        frag_color = color;
    }
    """

    def __init__(self, base):
        self.base = base
        self._enabled = True

        # Bloom 参数
        self.bloom_intensity = 1.2
        self.vignette_intensity = 0.4

        # 创建后处理 Shader
        self._shader = Shader.make(Shader.SL_GLSL,
                                    self.BLOOM_SHADER_VERT,
                                    self.BLOOM_SHADER_FRAG)

        # 创建全屏 Quad
        cm = CardMaker("PostProcessQuad")
        cm.setFrame(-1, 1, -1, 1)
        self._quad = NodePath(cm.generate())
        self._quad.setDepthTest(False)
        self._quad.setDepthWrite(False)
        self._quad.setBin("fixed", 50)
        self._quad.reparentTo(base.render2d)

        self._quad.setShader(self._shader)

    def update(self, dt: float):
        """每帧更新后处理参数"""
        if not self._enabled:
            return

        self._quad.setShaderInput("bloom_intensity", self.bloom_intensity)
        self._quad.setShaderInput("vignette_intensity", self.vignette_intensity)

    def set_enabled(self, enabled: bool):
        self._enabled = enabled
        if enabled:
            self._quad.show()
        else:
            self._quad.hide()

    def destroy(self):
        self._quad.removeNode()
