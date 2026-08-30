/**
 * 星点着色器:单点同时绘制「亮核 + 宽光晕」,加性混合。
 * 所有星点层(背景、成员星、星宿节点、北斗、银河尘埃、流动粒子)共用此材质,
 * 通过 attribute 控制大小、亮度、颜色与闪烁幅度。
 */
import * as THREE from 'three'
import { makeGlowTexture } from '@/lib/utils/textures'

let sharedTex: THREE.Texture | null = null
const getTex = () => (sharedTex ??= makeGlowTexture(128))

export interface StarMaterialOptions {
  opacity?: number
  /** 初始尺寸缩放 */
  scale?: number
}

export function makeStarMaterial(opts: StarMaterialOptions = {}): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: opts.opacity ?? 1 },
      uScale: { value: opts.scale ?? 1 },
      /** 每单位距离对应的像素数 = (height/2)/tan(fov/2),每帧更新 */
      uProjScale: { value: 1000 },
      uTex: { value: getTex() },
    },
    vertexShader: /* glsl */ `
      attribute float aSize;
      attribute float aAlpha;
      attribute vec3 aColor;
      attribute float aCoreRatio;
      attribute float aTwinkle;
      attribute float aPhase;
      uniform float uTime;
      uniform float uScale;
      uniform float uProjScale;
      varying float vAlpha;
      varying vec3 vColor;
      varying float vCoreRatio;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aSize * uScale * (uProjScale / max(0.001, -mv.z));
        gl_PointSize = clamp(gl_PointSize, 2.0, 140.0);
        // 极轻微的呼吸感(振幅由 aTwinkle 控制,通常 0.02–0.08)
        vAlpha = aAlpha * (1.0 + aTwinkle * sin(uTime * 0.65 + aPhase));
        vColor = aColor;
        vCoreRatio = aCoreRatio;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uTex;
      uniform float uOpacity;
      varying float vAlpha;
      varying vec3 vColor;
      varying float vCoreRatio;
      void main() {
        float d = length(gl_PointCoord - vec2(0.5)) * 2.0; // 0=中心 1=边缘
        float halo = pow(max(0.0, 1.0 - d), 2.6);
        float core = smoothstep(vCoreRatio, vCoreRatio * 0.4, d);
        vec3 col = vColor * (core * 1.7 + halo * 0.6);
        float alpha = (core * 0.95 + halo * 0.8) * vAlpha * uOpacity;
        if (alpha < 0.004) discard;
        gl_FragColor = vec4(col, alpha);
      }
    `,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
  })
}

/**
 * 便捷工具:创建带标准 attributes 的 BufferGeometry
 * @param positions Float32Array(N*3)
 * @param size (world units,即光晕直径) 数值或数组
 * @param alpha 数值或数组
 * @param color [r,g,b] 或 Float32Array(N*3)
 * @param coreRatio 亮核半径占比(0.12 亮核小光晕大 / 0.5 近似纯点)
 * @param twinkle 闪烁幅度(建议 ≤ 0.08)
 */
export function makeStarGeometry(
  positions: Float32Array,
  opts: {
    size?: number | Float32Array
    alpha?: number | Float32Array
    color?: [number, number, number] | Float32Array
    coreRatio?: number | Float32Array
    twinkle?: number | Float32Array
    seed?: number
  } = {},
): THREE.BufferGeometry {
  const n = positions.length / 3
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const fill = (val: number | Float32Array | undefined, per: number, fallback: number) =>
    typeof val === 'number'
      ? new Float32Array(n * per).fill(val)
      : (val ?? new Float32Array(n * per).fill(fallback))
  geo.setAttribute('aSize', new THREE.BufferAttribute(fill(opts.size, 1, 2), 1))
  geo.setAttribute('aAlpha', new THREE.BufferAttribute(fill(opts.alpha, 1, 0.5), 1))
  if (opts.color instanceof Float32Array) {
    geo.setAttribute('aColor', new THREE.BufferAttribute(opts.color, 3))
  } else {
    const c = new Float32Array(n * 3)
    const base = (opts.color ?? [1, 1, 1]) as [number, number, number]
    for (let i = 0; i < n; i++) {
      c[i * 3] = base[0]
      c[i * 3 + 1] = base[1]
      c[i * 3 + 2] = base[2]
    }
    geo.setAttribute('aColor', new THREE.BufferAttribute(c, 3))
  }
  geo.setAttribute('aCoreRatio', new THREE.BufferAttribute(fill(opts.coreRatio, 1, 0.45), 1))
  const s = opts.seed ?? 1
  let st = s >>> 0
  const rnd = () => {
    st |= 0
    st = (st + 0x6d2b79f5) | 0
    let t = Math.imul(st ^ (st >>> 15), 1 | st)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const tw = fill(opts.twinkle, 1, 0)
  const ph = new Float32Array(n)
  for (let i = 0; i < n; i++) ph[i] = rnd() * Math.PI * 2
  geo.setAttribute('aTwinkle', new THREE.BufferAttribute(tw, 1))
  geo.setAttribute('aPhase', new THREE.BufferAttribute(ph, 1))
  return geo
}
