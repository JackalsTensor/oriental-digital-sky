/**
 * 东方天文仪环(极淡,仅结构暗示):
 *  - 赤道环:天赤道(dec=0),随天球与时间/地点一同重建
 *  - 黄道环:黄道大圆(北黄极 J2000 RA 18h / Dec +66.56°),同上
 *  - 子午环:观测者子午线(场景固定,过天顶的南北大圆),提供旋转视差
 * 透明度 0.02–0.03,加性混合;不参与拾取,不影响天文计算。
 */
'use client'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { computeSkyFrame, raDecToUnit, unitToRaDec } from '@/lib/astronomy'
import { runtime, useSkyStore } from '@/store/sky'

const RING_R = 530 // 略大于天球(DOME 520)
const SEGMENTS = 180

const makeMat = (color: string, opacity: number) =>
  new THREE.LineBasicMaterial({
    color: new THREE.Color(color),
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })

export default function CelestialRings() {
  // 赤道环:dec=0(J2000 单位向量序列)
  const equator = useMemo(() => {
    const pts: THREE.Vector3[] = []
    for (let i = 0; i < SEGMENTS; i++) {
      const ra = (i / SEGMENTS) * 360
      pts.push(new THREE.Vector3(...raDecToUnit(ra / 15, 0)))
    }
    return pts
  }, [])

  // 黄道环:绕北黄极(J2000 RA 18h, Dec 66.56°)的大圆
  const ecliptic = useMemo(() => {
    const pole = new THREE.Vector3(...raDecToUnit(18, 66.56))
    const a = new THREE.Vector3(0, 0, 1).cross(pole).normalize()
    const b = new THREE.Vector3().crossVectors(pole, a).normalize()
    const pts: THREE.Vector3[] = []
    for (let i = 0; i < SEGMENTS; i++) {
      const t = (i / SEGMENTS) * Math.PI * 2
      pts.push(
        new THREE.Vector3().addScaledVector(a, Math.cos(t)).addScaledVector(b, Math.sin(t)).normalize(),
      )
    }
    return pts
  }, [])

  const equatorGeo = useMemo(() => {
    const pos = new Float32Array(equator.length * 3)
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return g
  }, [equator])

  const eclipticGeo = useMemo(() => {
    const pos = new Float32Array(ecliptic.length * 3)
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return g
  }, [ecliptic])

  // 子午环:场景固定(过天顶的南北大圆)
  const meridian = useMemo(() => {
    const pos = new Float32Array(SEGMENTS * 3)
    for (let i = 0; i < SEGMENTS; i++) {
      const t = (i / SEGMENTS) * Math.PI * 2
      pos[i * 3] = 0
      pos[i * 3 + 1] = Math.sin(t) * RING_R
      pos[i * 3 + 2] = -Math.cos(t) * RING_R
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return g
  }, [])

  const matEquator = useMemo(() => makeMat('#5f7391', 0), [])
  const matEcliptic = useMemo(() => makeMat('#7d7262', 0), [])
  const matMeridian = useMemo(() => makeMat('#4c5d78', 0), [])

  // 时间/地点变更 → 赤道/黄道随天球重建
  useEffect(() => {
    const rebuild = () => {
      const st = useSkyStore.getState()
      const f = computeSkyFrame(st.site, st.time)
      const write = (geo: THREE.BufferGeometry, pts: THREE.Vector3[]) => {
        const attr = geo.getAttribute('position') as THREE.BufferAttribute
        pts.forEach((p, i) => {
          const eq = unitToRaDec([p.x, p.y, p.z])
          const w = f.radecToWorld(eq.raHours, eq.decDeg)
          attr.setXYZ(i, w[0] * RING_R, w[1] * RING_R, w[2] * RING_R)
        })
        attr.needsUpdate = true
      }
      write(equatorGeo, equator)
      write(eclipticGeo, ecliptic)
    }
    rebuild()
    return useSkyStore.subscribe((s, prev) => {
      if (s.revision !== prev.revision) rebuild()
    })
  }, [equator, ecliptic, equatorGeo, eclipticGeo])

  useFrame(() => {
    // 天穹展开末段浮现 + 极慢呼吸
    const w = Math.min(1, Math.max(0, (runtime.reveal - 0.8) / 0.2))
    const o = 0.6 + 0.4 * Math.sin(runtime.t * 0.07)
    matEquator.opacity = 0.03 * w * o
    matEcliptic.opacity = 0.022 * w * o
    matMeridian.opacity = 0.025 * w * o
  })

  return (
    <>
      <lineLoop geometry={equatorGeo} material={matEquator} frustumCulled={false} />
      <lineLoop geometry={eclipticGeo} material={matEcliptic} frustumCulled={false} />
      <lineLoop geometry={meridian} material={matMeridian} frustumCulled={false} />
    </>
  )
}
