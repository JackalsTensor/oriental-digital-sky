/**
 * 星云:3 片极淡的程序化云气,锚定在赤道坐标上,
 * 与天球一同旋转(银河中心、猎户、天鹅一带)。
 */
'use client'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { makeNebulaTexture } from '@/lib/utils/textures'
import { runtime, smoothstep, useSkyStore } from '@/store/sky'
import { computeSkyFrame } from '@/lib/astronomy'

interface NebulaDef {
  /** 赤道坐标(小时/度) */
  ra: number
  dec: number
  color: string
  scale: number
  opacity: number
}

const NEBULAE: NebulaDef[] = [
  { ra: 17.75, dec: -29.0, color: '#3a3f5e', scale: 520, opacity: 0.055 }, // 银河中心方向
  { ra: 5.6, dec: -5.0, color: '#4a3a4e', scale: 420, opacity: 0.045 }, // 猎户方向
  { ra: 20.5, dec: 42.0, color: '#2e3d52', scale: 460, opacity: 0.05 }, // 天鹅方向
]

const RADIUS = 532

function Nebula({ def, seed }: { def: NebulaDef; seed: number }) {
  const sprite = useRef<THREE.Sprite>(null)
  const map = useMemo(() => makeNebulaTexture(256, seed), [seed])

  useEffect(() => {
    const rebuild = (revision: number) => {
      const { site, time } = useSkyStore.getState()
      const frame = computeSkyFrame(site, time)
      const v = frame.radecToWorld(def.ra, def.dec)
      sprite.current?.position.set(v[0] * RADIUS, v[1] * RADIUS, v[2] * RADIUS)
    }
    rebuild(useSkyStore.getState().revision)
    return useSkyStore.subscribe((s, prev) => {
      if (s.revision !== prev.revision) rebuild(s.revision)
    })
  }, [def])

  useFrame(() => {
    if (!sprite.current) return
    const m = sprite.current.material
    const w = smoothstep(0.2, 0.6, runtime.reveal)
    m.opacity = def.opacity * w
  })

  return (
    <sprite ref={sprite} scale={[def.scale, def.scale, 1]}>
      <spriteMaterial
        map={map}
        color={def.color}
        transparent
        opacity={0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </sprite>
  )
}

export default function Nebulae() {
  return (
    <>
      {NEBULAE.map((def, i) => (
        <Nebula key={i} def={def} seed={31 + i * 97} />
      ))}
    </>
  )
}
