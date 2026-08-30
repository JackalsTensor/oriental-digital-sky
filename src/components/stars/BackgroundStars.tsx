/**
 * 背景星层:近/中/远三层,提供空间纵深与视差。
 * 与天球计算无关,是包围天球之外的装饰性深空。
 */
'use client'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { makeStarMaterial, makeStarGeometry } from './starMaterial'
import { runtime, smoothstep, useSkyStore } from '@/store/sky'

interface LayerDef {
  radius: number
  count: number
  size: [number, number]
  alpha: [number, number]
  twinkle: number
  /** 揭示窗口(基于 runtime.reveal) */
  revealWindow: [number, number]
  /** 缓慢自转速度 rad/s */
  spin: number
}

const LAYERS: LayerDef[] = [
  // 近景尘埃层(在相机漫游范围内,提供最强视差;带缓慢漂移)
  { radius: 200, count: 460, size: [1.5, 3.2], alpha: [0.24, 0.75], twinkle: 0.05, revealWindow: [0.44, 0.82], spin: 0.0016 },
  // 中景
  { radius: 900, count: 3200, size: [1.1, 2.8], alpha: [0.26, 0.82], twinkle: 0.04, revealWindow: [0.34, 0.76], spin: -0.0011 },
  // 远景
  { radius: 2000, count: 5600, size: [0.9, 2.4], alpha: [0.16, 0.56], twinkle: 0.035, revealWindow: [0.26, 0.68], spin: 0.0007 },
  // 深空
  { radius: 3600, count: 5600, size: [0.7, 1.6], alpha: [0.1, 0.4], twinkle: 0.03, revealWindow: [0.2, 0.62], spin: -0.0005 },
  // 极深空(天穹尺度延展)
  { radius: 5200, count: 7000, size: [0.5, 1.2], alpha: [0.05, 0.22], twinkle: 0.025, revealWindow: [0.16, 0.58], spin: 0.0003 },
]

/** 选中星宿/四象时,背景整体缓慢降低的幅度 */
const SELECT_DIM = 0.8

function StarLayer({ def, seed }: { def: LayerDef; seed: number }) {
  const group = useRef<THREE.Group>(null)
  const dim = useRef(1)

  const geo = useMemo(() => {
    let st = seed >>> 0
    const rnd = () => {
      st |= 0
      st = (st + 0x6d2b79f5) | 0
      let t = Math.imul(st ^ (st >>> 15), 1 | st)
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
    const n = def.count
    const pos = new Float32Array(n * 3)
    const size = new Float32Array(n)
    const alpha = new Float32Array(n)
    const color = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      // 球面均匀分布
      const u = rnd() * 2 - 1
      const phi = rnd() * Math.PI * 2
      const s = Math.sqrt(1 - u * u)
      const r = def.radius * (0.9 + rnd() * 0.2)
      pos[i * 3] = s * Math.cos(phi) * r
      pos[i * 3 + 1] = u * r
      pos[i * 3 + 2] = s * Math.sin(phi) * r
      size[i] = def.size[0] + rnd() * (def.size[1] - def.size[0])
      alpha[i] = def.alpha[0] + rnd() * (def.alpha[1] - def.alpha[0])
      // 色温:暖白/冷白混合
      const warm = rnd() < 0.6
      const v = 0.85 + rnd() * 0.35
      color[i * 3] = warm ? v * 1.0 : v * 0.82
      color[i * 3 + 1] = warm ? v * 0.93 : v * 0.88
      color[i * 3 + 2] = warm ? v * 0.78 : v * 1.0
    }
    return makeStarGeometry(pos, {
      size,
      alpha,
      color,
      coreRatio: 0.55,
      twinkle: def.twinkle,
      seed: seed + 7,
    })
  }, [def, seed])

  const material = useMemo(() => makeStarMaterial({ opacity: 0 }), [])

  useFrame((state, dt) => {
    const g = group.current
    if (g) {
      g.rotation.y += def.spin * dt
      // 近景尘埃:极缓慢的整体漂移,增强空间感
      if (def.radius < 300) {
        g.position.x = Math.sin(runtime.t * 0.03) * 5
        g.position.y = Math.cos(runtime.t * 0.026) * 3.5
      }
    }
    // 选中星宿/四象时背景缓慢让步
    const st = useSkyStore.getState()
    const dimTarget = st.selectedMansion || st.selectedQuadrant ? SELECT_DIM : 1
    dim.current += (dimTarget - dim.current) * (1 - Math.exp(-dt * 1.6))
    const w = smoothstep(def.revealWindow[0], def.revealWindow[1], runtime.reveal)
    material.uniforms.uOpacity.value = w * dim.current
    material.uniforms.uTime.value = runtime.t
    material.uniforms.uProjScale.value =
      ((state.size.height * state.viewport.dpr) / 2) /
      Math.tan(((state.camera as THREE.PerspectiveCamera).fov * Math.PI) / 360)
  })

  return (
    <group ref={group}>
      <points geometry={geo} material={material} frustumCulled={false} />
    </group>
  )
}

export default function BackgroundStars() {
  return (
    <>
      {LAYERS.map((def, i) => (
        <StarLayer key={i} def={def} seed={100 + i * 53} />
      ))}
    </>
  )
}
