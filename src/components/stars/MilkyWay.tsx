/**
 * 银河粒子带:按银道坐标生成,经天文学管线换算到天球 ——
 * 因此会随观测时间/地点与二十八宿一同旋转(岁差 + 周日运动)。
 *
 * 结构模型:
 *  - 密集核带(σ≈2.6°,稍亮、稍小)+ 弥散晕(σ≈8.5°,暗、稍大)
 *  - 银心隆起 + 旋臂团块 + 反银心变暗(方向性)
 *  - 径向深度散布(0.92–1.08 R)形成厚度
 *  - 沿带分布的极淡「银河雾」片
 */
'use client'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { makeStarMaterial, makeStarGeometry } from './starMaterial'
import { makeNebulaTexture } from '@/lib/utils/textures'
import { runtime, smoothstep, useSkyStore } from '@/store/sky'
import { computeSkyFrame } from '@/lib/astronomy'

const COUNT = 7000
const RADIUS = 528

/** 银河雾:沿带分布的极淡云气片(小而克制,避免大面积加性填充) */
const FOG: { l: number; b: number; color: string; scale: number; opacity: number }[] = [
  { l: 355, b: 1.5, color: '#2a3452', scale: 380, opacity: 0.02 },
  { l: 140, b: -2.5, color: '#26304a', scale: 340, opacity: 0.015 },
  { l: 292, b: -1.0, color: '#2a3450', scale: 360, opacity: 0.02 },
]

export default function MilkyWay() {
  const material = useMemo(() => makeStarMaterial({ opacity: 0 }), [])
  const fogRefs = useRef<(THREE.Sprite | null)[]>([])
  const fogMaps = useMemo(() => FOG.map((_, i) => makeNebulaTexture(256, 900 + i * 131)), [])

  // 银道坐标、尺寸、颜色、基础亮度 —— 生成一次
  const dirs = useMemo(() => {
    let st = 4242
    const rnd = () => {
      st |= 0
      st = (st + 0x6d2b79f5) | 0
      let t = Math.imul(st ^ (st >>> 15), 1 | st)
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
    const lArr = new Float32Array(COUNT)
    const bArr = new Float32Array(COUNT)
    const size = new Float32Array(COUNT)
    const alpha = new Float32Array(COUNT)
    const color = new Float32Array(COUNT * 3)
    for (let i = 0; i < COUNT; i++) {
      const l = rnd() * 360
      lArr[i] = l
      // 双层:核心带(密)与弥散晕(疏)
      const core = rnd() < 0.55
      const gauss = core
        ? (rnd() + rnd() + rnd() - 1.5) * 2.6 * 0.82
        : (rnd() + rnd() + rnd() - 1.5) * 8.5 * 0.82
      bArr[i] = Math.max(-30, Math.min(30, gauss))
      // 亮度模型:银心隆起 + 两侧旋臂团块 + 反银心变暗(方向性)
      const dl = Math.abs(l - 360 > 180 ? 360 - l : l)
      const bulge = Math.exp(-(dl * dl) / (2 * 38 * 38))
      const arm1 = Math.exp(-(((l - 60 + 360) % 360 - 180) ** 2) / (2 * 55 * 55))
      const arm2 = Math.exp(-(((l - 300 + 360) % 360 - 180) ** 2) / (2 * 55 * 55))
      const intensity = 0.3 + 0.8 * bulge + 0.3 * arm1 + 0.3 * arm2
      const layer = core ? 1.5 : 0.5
      size[i] = core ? 1.5 + rnd() * 3.0 : 2.6 + rnd() * 5.0
      alpha[i] = (0.042 + rnd() * 0.085) * intensity * layer * (1 - Math.abs(gauss) / 30)
      // 暖色尘埃与冷色星光的混合
      const warm = rnd() < 0.55
      color[i * 3] = warm ? 0.98 : 0.68
      color[i * 3 + 1] = warm ? 0.89 : 0.78
      color[i * 3 + 2] = warm ? 0.75 : 1.0
    }
    return { lArr, bArr, size, alpha, color }
  }, [])

  const geo = useMemo(() => {
    const pos = new Float32Array(COUNT * 3)
    return makeStarGeometry(pos, {
      size: dirs.size,
      alpha: dirs.alpha,
      color: dirs.color,
      coreRatio: 0.62,
      twinkle: 0.025,
      seed: 7,
    })
  }, [dirs])

  // 时间/地点变更 → 重算世界坐标(粒子 + 银河雾)
  useEffect(() => {
    const rebuild = (revision: number) => {
      const { site, time } = useSkyStore.getState()
      const frame = computeSkyFrame(site, time)
      const pos = geo.getAttribute('position') as THREE.BufferAttribute
      for (let i = 0; i < COUNT; i++) {
        const v = frame.galToWorld(dirs.lArr[i], dirs.bArr[i])
        // 径向深度散布:银河带具有厚度
        const r = RADIUS * (0.92 + 0.16 * ((i * 7919) % 1000) / 1000)
        pos.setXYZ(i, v[0] * r, v[1] * r, v[2] * r)
      }
      pos.needsUpdate = true
      FOG.forEach((f, i) => {
        const s = fogRefs.current[i]
        if (!s) return
        const v = frame.galToWorld(f.l, f.b)
        s.position.set(v[0] * RADIUS, v[1] * RADIUS, v[2] * RADIUS)
      })
    }
    rebuild(useSkyStore.getState().revision)
    return useSkyStore.subscribe((s, prev) => {
      if (s.revision !== prev.revision) rebuild(s.revision)
    })
  }, [geo, dirs])

  useFrame((state) => {
    const w = smoothstep(0.3, 0.68, runtime.reveal)
    material.uniforms.uOpacity.value = w * 0.9
    material.uniforms.uTime.value = runtime.t
    material.uniforms.uProjScale.value =
      ((state.size.height * state.viewport.dpr) / 2) /
      Math.tan(((state.camera as THREE.PerspectiveCamera).fov * Math.PI) / 360)
    const fogW = smoothstep(0.3, 0.72, runtime.reveal)
    FOG.forEach((f, i) => {
      const s = fogRefs.current[i]
      if (s) (s.material as THREE.SpriteMaterial).opacity = f.opacity * fogW
    })
  })

  return (
    <>
      <points geometry={geo} material={material} frustumCulled={false} />
      {FOG.map((f, i) => (
        <sprite
          key={i}
          ref={(el) => {
            fogRefs.current[i] = el
          }}
          scale={[f.scale, f.scale, 1]}
        >
          <spriteMaterial
            map={fogMaps[i]}
            color={f.color}
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </sprite>
      ))}
    </>
  )
}
