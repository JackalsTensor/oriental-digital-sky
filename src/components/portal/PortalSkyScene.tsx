/**
 * 首页天穹背景 —— 东方宇宙观数字空间(极简、克制):
 * 不是道教素材拼贴,而是「古老宇宙观被重新数字化后的世界」的底色。
 *
 * 层级(默认全部极弱、缓慢运行):
 *  - 稀疏星尘(细小微光,密度远低于 observe)
 *  - 极淡银河(真实银道方向,经 astronomy 层 galToWorld,固定时刻)
 *  - 两条巨型天球弧线(如天球仪结构)
 *  - 天球刻度盘:双环 + 24 节气刻度(每 15°)+ 12 方位辐条(每 30°)—— 古代天文刻度
 *  - 阴阳 S 曲线:一条极淡的曲线,抽象阴阳之转,非太极图
 *  - 卦象三爻标记 ×3(极淡,含虚爻)—— 八卦几何秩序
 *  - 幽灵命盘:圆环 + 十二宫辐条 + 星曜点 —— 命理 hover 时浮现
 *  - 六爻线组(下三实、上三虚)—— 卜筮 hover 时浮现
 *  - 星图节点碎片 + 古字(天/星/文)—— 知识 hover 时浮现
 *
 * hover 氛围(视觉暗示,无任何术数算法):
 *  observe → 星尘/银河/弧线/刻度盘略微增强
 *  destiny → 命盘浮现
 *  divination → 六爻、S 曲线、卦象标记增强
 *  knowledge → 星图节点与古字浮现
 *
 * 动效为 10~240 秒级慢循环;星点复用 observe 的同一着色器;画布透明,叠加在 CSS 墨蓝渐变之上。
 */
'use client'
import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { makeStarMaterial, makeStarGeometry } from '@/components/stars/starMaterial'
import { makeNebulaTexture, makeTextSprite } from '@/lib/utils/textures'
import { computeSkyFrame } from '@/lib/astronomy'
import { DEFAULT_SITE } from '@/data/sites'
import { portalRuntime } from './portalRuntime'

const smoothstep = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)))
  return t * t * (3 - 2 * t)
}

const makeRnd = (seed: number) => {
  let s = seed >>> 0
  return () => {
    s |= 0
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** 非响应式缓动:每帧向 target 靠近(默认速率 1.8/s) */
const approach = (cur: { current: number }, target: number, dt: number, rate = 1.8) => {
  cur.current += (target - cur.current) * (1 - Math.exp(-dt * rate))
  return cur.current
}

const ringGeo = (radius: number, segments = 200) => {
  const pos = new Float32Array(segments * 3)
  for (let i = 0; i < segments; i++) {
    const a = (i / segments) * Math.PI * 2
    pos[i * 3] = Math.cos(a) * radius
    pos[i * 3 + 1] = Math.sin(a) * radius
    pos[i * 3 + 2] = 0
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  return g
}

const makeLineMat = (color: string) =>
  new THREE.LineBasicMaterial({
    color: new THREE.Color(color),
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })

// ─────────── 星尘(细小微光) ───────────

interface DustDef {
  radius: number
  count: number
  size: [number, number]
  alpha: [number, number]
  spin: number
  drift: number
  revealWindow: [number, number]
}

const DUST: DustDef[] = [
  { radius: 34, count: 160, size: [0.8, 1.5], alpha: [0.13, 0.38], spin: 0.0011, drift: 1.4, revealWindow: [0.08, 0.8] },
  { radius: 68, count: 300, size: [0.6, 1.1], alpha: [0.1, 0.3], spin: -0.00075, drift: 0.7, revealWindow: [0.05, 0.72] },
  { radius: 118, count: 380, size: [0.5, 0.9], alpha: [0.08, 0.24], spin: 0.00042, drift: 0, revealWindow: [0.03, 0.66] },
]

function StarDust({ def, seed }: { def: DustDef; seed: number }) {
  const group = useRef<THREE.Group>(null)
  const bright = useRef(1)

  const geo = useMemo(() => {
    const rnd = makeRnd(seed)
    const n = def.count
    const pos = new Float32Array(n * 3)
    const size = new Float32Array(n)
    const alpha = new Float32Array(n)
    const color = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      const u = rnd() * 2 - 1
      const phi = rnd() * Math.PI * 2
      const s = Math.sqrt(1 - u * u)
      const r = def.radius * (0.9 + rnd() * 0.2)
      pos[i * 3] = s * Math.cos(phi) * r
      pos[i * 3 + 1] = u * r
      pos[i * 3 + 2] = s * Math.sin(phi) * r
      size[i] = def.size[0] + rnd() * (def.size[1] - def.size[0])
      alpha[i] = def.alpha[0] + rnd() * (def.alpha[1] - def.alpha[0])
      const warm = rnd() < 0.6
      const v = 0.8 + rnd() * 0.3
      color[i * 3] = warm ? v : v * 0.82
      color[i * 3 + 1] = warm ? v * 0.93 : v * 0.88
      color[i * 3 + 2] = warm ? v * 0.78 : v
    }
    return makeStarGeometry(pos, {
      size,
      alpha,
      color,
      coreRatio: 0.5,
      twinkle: 0.04,
      seed: seed + 7,
    })
  }, [def, seed])

  const mat = useMemo(() => makeStarMaterial({ opacity: 0 }), [])

  useFrame((state, dt) => {
    const g = group.current
    if (g) {
      g.rotation.y += def.spin * dt
      if (def.drift > 0) {
        g.position.x = Math.sin(portalRuntime.t * 0.02) * def.drift
        g.position.y = Math.cos(portalRuntime.t * 0.017) * def.drift * 0.8
      }
    }
    const target = portalRuntime.ambience === 'observe' ? 1.16 : 1
    const w = smoothstep(def.revealWindow[0], def.revealWindow[1], portalRuntime.reveal)
    mat.uniforms.uOpacity.value = w * approach(bright, target, dt)
    mat.uniforms.uTime.value = portalRuntime.t
    mat.uniforms.uProjScale.value =
      ((state.size.height * state.viewport.dpr) / 2) /
      Math.tan(((state.camera as THREE.PerspectiveCamera).fov * Math.PI) / 360)
  })

  return (
    <group ref={group}>
      <points geometry={geo} material={mat} frustumCulled={false} />
    </group>
  )
}

// ─────────── 银河 ───────────

const MW_COUNT = 560
const MW_RADIUS = 124

const MW_FOG = [
  { l: 355, b: 2, color: '#1c2846', scale: 300, opacity: 0.02 },
  { l: 140, b: -3, color: '#1a2540', scale: 260, opacity: 0.016 },
]

function MilkyWayBand() {
  const group = useRef<THREE.Group>(null)
  const vis = useRef(0.55)
  const fogRefs = useRef<(THREE.Sprite | null)[]>([])
  const fogMaps = useMemo(() => MW_FOG.map((_, i) => makeNebulaTexture(256, 900 + i * 131)), [])

  const { geo, fogPos } = useMemo(() => {
    const rnd = makeRnd(4242)
    const lArr = new Float32Array(MW_COUNT)
    const bArr = new Float32Array(MW_COUNT)
    const size = new Float32Array(MW_COUNT)
    const alpha = new Float32Array(MW_COUNT)
    const color = new Float32Array(MW_COUNT * 3)
    for (let i = 0; i < MW_COUNT; i++) {
      const l = rnd() * 360
      lArr[i] = l
      const b = Math.max(-26, Math.min(26, (rnd() + rnd() + rnd() - 1.5) * 9 * 0.82))
      bArr[i] = b
      const dl = Math.abs(l > 180 ? 360 - l : l)
      const bulge = Math.exp(-(dl * dl) / (2 * 40 * 40))
      const intensity = 0.35 + 0.8 * bulge
      size[i] = 1.2 + rnd() * 2.2
      alpha[i] = (0.025 + rnd() * 0.05) * intensity * (1 - Math.abs(b) / 26)
      const warm = rnd() < 0.5
      color[i * 3] = warm ? 0.9 : 0.66
      color[i * 3 + 1] = warm ? 0.84 : 0.76
      color[i * 3 + 2] = warm ? 0.72 : 1.0
    }
    // 真实银道方向:经天文学管线换算(固定时刻,首页不需要时间交互)
    const frame = computeSkyFrame(DEFAULT_SITE, { year: 2026, month: 8, day: 30, hour: 22, minute: 0 })
    const pos = new Float32Array(MW_COUNT * 3)
    for (let i = 0; i < MW_COUNT; i++) {
      const v = frame.galToWorld(lArr[i], bArr[i])
      const r = MW_RADIUS * (0.96 + 0.08 * ((i * 7919) % 1000) / 1000)
      pos[i * 3] = v[0] * r
      pos[i * 3 + 1] = v[1] * r
      pos[i * 3 + 2] = v[2] * r
    }
    const fogPos = MW_FOG.map((f) => {
      const v = frame.galToWorld(f.l, f.b)
      return new THREE.Vector3(v[0] * MW_RADIUS, v[1] * MW_RADIUS, v[2] * MW_RADIUS)
    })
    const g = makeStarGeometry(pos, { size, alpha, color, coreRatio: 0.55, twinkle: 0.025, seed: 7 })
    return { geo: g, fogPos }
  }, [])

  const mat = useMemo(() => makeStarMaterial({ opacity: 0 }), [])

  useFrame((state, dt) => {
    const g = group.current
    if (g) g.rotation.y += 0.0004 * dt
    const target = portalRuntime.ambience === 'observe' ? 1 : 0.55
    const w = smoothstep(0.12, 0.62, portalRuntime.reveal)
    const v = approach(vis, target, dt)
    mat.uniforms.uOpacity.value = w * v * 0.5
    mat.uniforms.uTime.value = portalRuntime.t
    mat.uniforms.uProjScale.value =
      ((state.size.height * state.viewport.dpr) / 2) /
      Math.tan(((state.camera as THREE.PerspectiveCamera).fov * Math.PI) / 360)
    MW_FOG.forEach((f, i) => {
      const s = fogRefs.current[i]
      if (s) (s.material as THREE.SpriteMaterial).opacity = f.opacity * w * v
    })
  })

  return (
    <group ref={group}>
      <points geometry={geo} material={mat} frustumCulled={false} />
      {MW_FOG.map((f, i) => (
        <sprite
          key={i}
          ref={(el) => {
            fogRefs.current[i] = el
            if (el) el.position.copy(fogPos[i])
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
    </group>
  )
}

// ─────────── 天球弧线 ───────────

interface ArcDef {
  radius: number
  tilt: [number, number, number]
  axis: 'x' | 'y'
  spin: number
  base: number
  phase: number
}

const ARCS: ArcDef[] = [
  { radius: 56, tilt: [1.02, 0.35, 0], axis: 'y', spin: 0.00034, base: 0.05, phase: 0 },
  { radius: 41, tilt: [0.55, -0.5, 0.62], axis: 'x', spin: 0.00042, base: 0.038, phase: 2.1 },
]

function CelestialArc({ def, color }: { def: ArcDef; color: string }) {
  const group = useRef<THREE.Group>(null)
  const boost = useRef(1)

  const geo = useMemo(() => ringGeo(def.radius), [def])

  const mat = useMemo(() => makeLineMat(color), [color])

  useFrame((_, dt) => {
    const g = group.current
    if (g) {
      if (def.axis === 'y') g.rotation.y += def.spin * dt
      else g.rotation.x += def.spin * dt
    }
    const target = portalRuntime.ambience === 'observe' ? 1.3 : 1
    const breathe = 1 + 0.18 * Math.sin(portalRuntime.t * 0.16 + def.phase)
    mat.opacity =
      def.base * breathe * approach(boost, target, dt) * smoothstep(0.35, 0.85, portalRuntime.reveal)
  })

  return (
    <group ref={group}>
      <group rotation={[def.tilt[0], def.tilt[1], def.tilt[2]]}>
        <lineLoop geometry={geo} material={mat} frustumCulled={false} />
      </group>
    </group>
  )
}

// ─────────── 天球刻度盘:24 节气刻度 + 12 方位辐条 ───────────

function PolarPlate() {
  const group = useRef<THREE.Group>(null)
  const vis = useRef(1)

  const outer = useMemo(() => ringGeo(28), [])
  const inner = useMemo(() => ringGeo(20), [])

  const marks = useMemo(() => {
    // 24 刻(每 15°,如节气刻度)+ 12 辐(每 30°,如方位)
    const pos = new Float32Array((24 * 2 + 12 * 2) * 3)
    let i = 0
    for (let k = 0; k < 24; k++) {
      const a = (k / 24) * Math.PI * 2
      pos[i++] = Math.cos(a) * 28
      pos[i++] = Math.sin(a) * 28
      pos[i++] = 0
      pos[i++] = Math.cos(a) * 31
      pos[i++] = Math.sin(a) * 31
      pos[i++] = 0
    }
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2
      pos[i++] = Math.cos(a) * 20
      pos[i++] = Math.sin(a) * 20
      pos[i++] = 0
      pos[i++] = Math.cos(a) * 28
      pos[i++] = Math.sin(a) * 28
      pos[i++] = 0
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return g
  }, [])

  const mat = useMemo(() => makeLineMat('#5f7d99'), [])

  useFrame((_, dt) => {
    if (group.current) group.current.rotation.z += 0.0006 * dt
    const target = portalRuntime.ambience === 'observe' ? 1.35 : 1
    mat.opacity =
      0.04 * approach(vis, target, dt) * smoothstep(0.4, 0.9, portalRuntime.reveal)
  })

  return (
    <group ref={group} position={[-26, 12, -46]} rotation={[0.85, -0.12, 0.1]}>
      <lineLoop geometry={outer} material={mat} frustumCulled={false} />
      <lineLoop geometry={inner} material={mat} frustumCulled={false} />
      <lineSegments geometry={marks} material={mat} frustumCulled={false} />
    </group>
  )
}

// ─────────── 阴阳 S 曲线(抽象,非太极图;微暖墨色) ───────────

function YinCurve() {
  const group = useRef<THREE.Group>(null)
  const vis = useRef(0.45)

  const geo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(-12, 11, 0),
        new THREE.Vector3(-1, 13, 0),
        new THREE.Vector3(11, 5, 0),
        new THREE.Vector3(11, -3, 0),
        new THREE.Vector3(2, -12, 0),
        new THREE.Vector3(-11, -6, 0),
      ],
      false,
      'catmullrom',
      0.6,
    )
    const pts = curve.getPoints(64)
    const pos = new Float32Array(pts.length * 3)
    pts.forEach((p, i) => {
      pos[i * 3] = p.x
      pos[i * 3 + 1] = p.y
      pos[i * 3 + 2] = 0
    })
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return g
  }, [])

  const mat = useMemo(() => makeLineMat('#7d7262'), [])
  // R3F 的 JSX 类型无 <line>(与 SVG 冲突),按项目惯例用 primitive
  const lineObj = useMemo(() => {
    const l = new THREE.Line(geo, mat)
    l.frustumCulled = false
    return l
  }, [geo, mat])

  useFrame((_, dt) => {
    if (group.current) group.current.rotation.z = 0.12 + Math.sin(portalRuntime.t * 0.07) * 0.04
    const target = portalRuntime.ambience === 'divination' ? 1 : 0.45
    const breathe = 1 + 0.2 * Math.sin(portalRuntime.t * 0.13 + 1.7)
    mat.opacity =
      0.07 *
      approach(vis, target, dt, 2) *
      breathe *
      smoothstep(0.3, 0.8, portalRuntime.reveal)
  })

  return (
    <group ref={group} position={[-32, -2, -32]} rotation={[0, 0.15, 0]}>
      <primitive object={lineObj} />
    </group>
  )
}

// ─────────── 卦象三爻标记 ×3(含虚爻;八卦几何秩序的抽象) ───────────

const TRIGRAM_MARKS = [
  { pos: [-52, -14, -56] as const, rot: 0.5 },
  { pos: [52, 20, -54] as const, rot: -0.3 },
  { pos: [-8, 34, -50] as const, rot: 0.15 },
]

const makeMarkGeo = (broken: boolean) => {
  const segs = broken ? 4 : 3
  const pos = new Float32Array(segs * 2 * 3)
  let i = 0
  const line = (y: number, x0: number, x1: number) => {
    pos[i++] = x0
    pos[i++] = y
    pos[i++] = 0
    pos[i++] = x1
    pos[i++] = y
    pos[i++] = 0
  }
  line(2.2, -5, 5)
  if (broken) {
    line(0, -5, -1.2)
    line(0, 1.2, 5)
  } else {
    line(0, -5, 5)
  }
  line(-2.2, -5, 5)
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  return g
}

function TrigramMarks() {
  const vis = useRef(1)
  const geos = useMemo(() => [makeMarkGeo(false), makeMarkGeo(true), makeMarkGeo(false)], [])
  const mat = useMemo(() => makeLineMat('#6d7f96'), [])

  useFrame((_, dt) => {
    const target = portalRuntime.ambience === 'divination' ? 2.1 : 1
    const breathe = 1 + 0.25 * Math.sin(portalRuntime.t * 0.11)
    mat.opacity =
      0.033 * approach(vis, target, dt) * breathe * smoothstep(0.4, 0.9, portalRuntime.reveal)
  })

  return (
    <>
      {TRIGRAM_MARKS.map((m, i) => (
        <group key={i} position={[m.pos[0], m.pos[1], m.pos[2]]} rotation={[0, 0, m.rot]}>
          <lineSegments geometry={geos[i]} material={mat} frustumCulled={false} />
        </group>
      ))}
    </>
  )
}

// ─────────── 幽灵命盘:圆环 + 十二宫辐条 + 星曜点(命理 hover 浮现) ───────────

function DestinyChart() {
  const group = useRef<THREE.Group>(null)
  const vis = useRef(0.36)

  const ring = useMemo(() => ringGeo(24), [])

  const spokes = useMemo(() => {
    const pos = new Float32Array(12 * 2 * 3)
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2
      pos[k * 6] = Math.cos(a) * 12
      pos[k * 6 + 1] = Math.sin(a) * 12
      pos[k * 6 + 2] = 0
      pos[k * 6 + 3] = Math.cos(a) * 24
      pos[k * 6 + 4] = Math.sin(a) * 24
      pos[k * 6 + 5] = 0
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return g
  }, [])

  // 十二宫位星曜点(微暖色)
  const dotsGeo = useMemo(() => {
    const pos = new Float32Array(12 * 3)
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2 + Math.PI / 12
      pos[k * 3] = Math.cos(a) * 18
      pos[k * 3 + 1] = Math.sin(a) * 18
      pos[k * 3 + 2] = 0
    }
    return makeStarGeometry(pos, {
      size: 1.8,
      alpha: 0.55,
      color: [0.77, 0.73, 0.64],
      coreRatio: 0.4,
      twinkle: 0.03,
      seed: 5,
    })
  }, [])

  const lineMat = useMemo(() => makeLineMat('#8a8f9e'), [])
  const dotsMat = useMemo(() => makeStarMaterial({ opacity: 0 }), [])

  useFrame((state, dt) => {
    if (group.current) group.current.rotation.z += 0.0008 * dt
    const target = portalRuntime.ambience === 'destiny' ? 1 : 0.36
    const v = approach(vis, target, dt, 1.9)
    const w = smoothstep(0.4, 0.9, portalRuntime.reveal)
    lineMat.opacity = v * 0.09 * w
    dotsMat.uniforms.uOpacity.value = v * 0.55 * w
    dotsMat.uniforms.uTime.value = portalRuntime.t
    dotsMat.uniforms.uProjScale.value =
      ((state.size.height * state.viewport.dpr) / 2) /
      Math.tan(((state.camera as THREE.PerspectiveCamera).fov * Math.PI) / 360)
  })

  return (
    <group ref={group} position={[0, 4, -46]} rotation={[0.14, 0.06, 0]}>
      <lineLoop geometry={ring} material={lineMat} frustumCulled={false} />
      <lineSegments geometry={spokes} material={lineMat} frustumCulled={false} />
      <points geometry={dotsGeo} material={dotsMat} frustumCulled={false} />
    </group>
  )
}

// ─────────── 六爻线组:下三实、上三虚(卜筮 hover 浮现) ───────────

function HexagramLines() {
  const group = useRef<THREE.Group>(null)
  const vis = useRef(0.36)

  const geo = useMemo(() => {
    // 自下而上:初、二、三爻实;四、五、上爻虚
    const pos = new Float32Array((3 + 3 * 2) * 2 * 3)
    let i = 0
    const seg = (y: number, x0: number, x1: number) => {
      pos[i++] = x0
      pos[i++] = y
      pos[i++] = 0
      pos[i++] = x1
      pos[i++] = y
      pos[i++] = 0
    }
    seg(-5, -10, 10)
    seg(-3, -10, 10)
    seg(-1, -10, 10)
    seg(1, -10, -1.5)
    seg(1, 1.5, 10)
    seg(3, -10, -1.5)
    seg(3, 1.5, 10)
    seg(5, -10, -1.5)
    seg(5, 1.5, 10)
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return g
  }, [])

  const mat = useMemo(() => makeLineMat('#7d8aa0'), [])

  useFrame((_, dt) => {
    if (group.current)
      group.current.rotation.z = -0.07 + Math.sin(portalRuntime.t * 0.08 + 0.9) * 0.03
    const target = portalRuntime.ambience === 'divination' ? 1 : 0.36
    mat.opacity =
      0.09 * approach(vis, target, dt, 1.9) * smoothstep(0.45, 0.9, portalRuntime.reveal)
  })

  return (
    <group ref={group} position={[26, 20, -40]}>
      <lineSegments geometry={geo} material={mat} frustumCulled={false} />
    </group>
  )
}

// ─────────── 星图节点碎片(知识 hover 浮现) ───────────

const NODE_POINTS: [number, number][] = [
  [0, 0], [9, 6], [6, 14], [-4, 12], [-10, 8], [-9, -2], [-2, -9], [8, -8],
]

const NODE_EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0],
]

function KnowledgeNodes() {
  const group = useRef<THREE.Group>(null)
  const vis = useRef(0.38)

  const dots = useMemo(() => {
    const pos = new Float32Array(NODE_POINTS.length * 3)
    NODE_POINTS.forEach(([x, y], i) => {
      pos[i * 3] = x
      pos[i * 3 + 1] = y
      pos[i * 3 + 2] = 0
    })
    return makeStarGeometry(pos, {
      size: 2.2,
      alpha: 0.5,
      color: [0.62, 0.7, 0.82],
      coreRatio: 0.42,
      twinkle: 0.03,
      seed: 13,
    })
  }, [])

  const lines = useMemo(() => {
    const pos = new Float32Array(NODE_EDGES.length * 2 * 3)
    NODE_EDGES.forEach(([a, b], i) => {
      pos[i * 6] = NODE_POINTS[a][0]
      pos[i * 6 + 1] = NODE_POINTS[a][1]
      pos[i * 6 + 2] = 0
      pos[i * 6 + 3] = NODE_POINTS[b][0]
      pos[i * 6 + 4] = NODE_POINTS[b][1]
      pos[i * 6 + 5] = 0
    })
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return g
  }, [])

  const lineMat = useMemo(() => makeLineMat('#5c7a88'), [])
  const dotMat = useMemo(() => makeStarMaterial({ opacity: 0 }), [])

  useFrame((state, dt) => {
    if (group.current) group.current.rotation.z += 0.0004 * dt
    const target = portalRuntime.ambience === 'knowledge' ? 1 : 0.38
    const v = approach(vis, target, dt, 1.9)
    const w = smoothstep(0.35, 0.85, portalRuntime.reveal)
    lineMat.opacity = v * 0.085 * w
    dotMat.uniforms.uOpacity.value = v * 0.5 * w
    dotMat.uniforms.uTime.value = portalRuntime.t
    dotMat.uniforms.uProjScale.value =
      ((state.size.height * state.viewport.dpr) / 2) /
      Math.tan(((state.camera as THREE.PerspectiveCamera).fov * Math.PI) / 360)
  })

  return (
    <group ref={group} position={[38, -22, -42]} rotation={[0, 0, 0.25]}>
      <lineSegments geometry={lines} material={lineMat} frustumCulled={false} />
      <points geometry={dots} material={dotMat} frustumCulled={false} />
    </group>
  )
}

// ─────────── 古字(知识 hover 浮现) ───────────

const GLYPHS = [
  // 方向取「接近视线轴」的浅角:置于屏幕边缘内侧(相机 fov 50°,位于 z=28 望原点)
  { ch: '天', dir: [0.24, 0.2, -0.95] as const, scale: 26, phase: 0 },
  { ch: '星', dir: [-0.26, -0.08, -0.96] as const, scale: 22, phase: 2.1 },
  { ch: '文', dir: [-0.05, 0.35, -0.94] as const, scale: 19, phase: 4.2 },
]

function KnowledgeGlyphs() {
  const refs = useRef<(THREE.Sprite | null)[]>([])
  const vis = useRef(0.42)
  const maps = useMemo(() => GLYPHS.map((g) => makeTextSprite(g.ch)), [])
  const basePos = useMemo(
    () =>
      GLYPHS.map((g) =>
        new THREE.Vector3(g.dir[0], g.dir[1], g.dir[2]).normalize().multiplyScalar(108),
      ),
    [],
  )

  useFrame((_, dt) => {
    const target = portalRuntime.ambience === 'knowledge' ? 1 : 0.42
    const base = approach(vis, target, dt, 2) * 0.085 * smoothstep(0.3, 0.8, portalRuntime.reveal)
    GLYPHS.forEach((g, i) => {
      const s = refs.current[i]
      if (!s) return
      ;(s.material as THREE.SpriteMaterial).opacity = base
      s.position.set(
        basePos[i].x,
        basePos[i].y + Math.sin(portalRuntime.t * 0.09 + g.phase) * 2.5,
        basePos[i].z,
      )
    })
  })

  return (
    <>
      {GLYPHS.map((g, i) => (
        <sprite
          key={g.ch}
          ref={(el) => {
            refs.current[i] = el
          }}
          scale={[g.scale, g.scale, 1]}
        >
          <spriteMaterial
            map={maps[i]}
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

// ─────────── 时间与相机 ───────────

function TimeKeeper() {
  useFrame((_, dt) => {
    portalRuntime.t += Math.min(dt, 0.1)
    portalRuntime.reveal = Math.min(1, portalRuntime.reveal + Math.min(dt, 0.1) * 0.38)
  })
  return null
}

/** 相机极慢漂移:不同深度层的视差让背景「活着」 */
function CameraRig() {
  const { camera } = useThree()
  useFrame(() => {
    const t = portalRuntime.t
    camera.position.x = 28 * Math.sin(t * 0.02) * 0.12
    camera.position.y = 28 * Math.sin(t * 0.027 + 1.3) * 0.08
    camera.position.z = 28
    camera.lookAt(0, 0, 0)
  })
  return null
}

// ─────────── 组合 ───────────

export default function PortalSkyScene() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <Canvas
        flat
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ fov: 50, near: 0.5, far: 600, position: [0, 0, 28] }}
      >
        <TimeKeeper />
        <CameraRig />
        {DUST.map((def, i) => (
          <StarDust key={i} def={def} seed={100 + i * 53} />
        ))}
        <MilkyWayBand />
        <CelestialArc def={ARCS[0]} color="#5a7396" />
        <CelestialArc def={ARCS[1]} color="#4c6688" />
        <PolarPlate />
        <YinCurve />
        <TrigramMarks />
        <DestinyChart />
        <HexagramLines />
        <KnowledgeNodes />
        <KnowledgeGlyphs />
      </Canvas>
    </div>
  )
}
