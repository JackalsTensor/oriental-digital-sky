/**
 * WebGL 场景组合。
 * flat = 关闭色调映射:所有颜色在数据/材质层已按克制原则设计。
 */
'use client'
import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import Controls from './Controls'
import BackgroundStars from '@/components/stars/BackgroundStars'
import MilkyWay from '@/components/stars/MilkyWay'
import Nebulae from '@/components/stars/Nebulae'
import MansionSystem from '@/components/mansions/MansionSystem'
import { makeStarMaterial, makeStarGeometry } from '@/components/stars/starMaterial'
import { runtime, smoothstep } from '@/store/sky'

/**
 * 开屏第一道光:极小光点,逐渐变亮,随后融入星空。
 * 位于初始视线方向(心宿二一侧)。
 */
function OpeningStar() {
  const geo = useMemo(() => {
    const pos = new Float32Array([0, 0, 0])
    return makeStarGeometry(pos, {
      size: 5.5,
      alpha: 0,
      color: [1.0, 0.97, 0.88],
      coreRatio: 0.1,
      twinkle: 0,
    })
  }, [])
  const mat = useMemo(() => makeStarMaterial({ opacity: 1 }), [])
  const ref = useRef<THREE.Points>(null)
  const { camera } = useThree()

  useFrame((state) => {
    const a = runtime.anchorDir
    if (a && ref.current) {
      // 跟随初始视线方向,位置略近于天球
      ref.current.position.set(a.x * 498, a.y * 498, a.z * 498)
    }
    const reveal = runtime.reveal
    const inWin = smoothstep(0.02, 0.2, reveal)
    const outWin = 1 - smoothstep(0.5, 0.8, reveal)
    ;(geo.getAttribute('aAlpha') as THREE.BufferAttribute).setX(0, inWin * outWin * 0.95)
    ;(geo.getAttribute('aAlpha') as THREE.BufferAttribute).needsUpdate = true
    mat.uniforms.uTime.value = runtime.t
    mat.uniforms.uProjScale.value =
      ((state.size.height * state.viewport.dpr) / 2) /
      Math.tan(((camera as THREE.PerspectiveCamera).fov * Math.PI) / 360)
  })

  return <points ref={ref} geometry={geo} material={mat} frustumCulled={false} />
}

export default function Sky() {
  return (
    <div className="absolute inset-0">
      <Canvas
        flat
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ fov: 55, near: 0.5, far: 12000, position: [0, 0, 60] }}
        onCreated={({ gl, camera }) => {
          gl.setClearColor('#04060d')
          // 调试句柄(仅用于开发检查)
          if (typeof window !== 'undefined')
            (window as unknown as Record<string, unknown>).__SKY = { camera, gl, THREE }
        }}
      >
        <Controls />
        <OpeningStar />
        <BackgroundStars />
        <MilkyWay />
        <Nebulae />
        <MansionSystem />
      </Canvas>
    </div>
  )
}
