/**
 * 二十八宿核心场景:
 *  - 28 宿节点(距星,可交互)+ 成员星 + 宿内连线
 *  - 四象脊线(七宿距星连线)与沿线流动粒子
 *  - 北斗七星 + 辅星 + 北极星
 *  - 地平环与方位标记
 *
 * 所有天体位置由天文学管线计算,随时间/地点变更整体重建。
 * 悬停/选中/四象揭示等视觉状态在 useFrame 内插值,不触发 React 渲染。
 */
'use client'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  MANSIONS,
  MANSION_ORDER,
  QUADRANT_MANSIONS,
  type MansionId,
} from '@/data/mansions'
import { QUADRANTS, QUADRANT_ORDER, type QuadrantId } from '@/data/quadrants'
import { DIPPER, DIPPER_COMPANION, POLARIS } from '@/data/dipper'
import { computeSkyFrame } from '@/lib/astronomy'
import { makeStarMaterial, makeStarGeometry } from '@/components/stars/starMaterial'
import { makeTextSprite } from '@/lib/utils/textures'
import { runtime, smoothstep, useSkyStore } from '@/store/sky'

const DOME_R = 520
const DIPPER_R = 522

const QUAD_COLOR: Record<QuadrantId, THREE.Color> = {
  青龙: new THREE.Color('#8fb8ae'),
  朱雀: new THREE.Color('#c08a72'),
  白虎: new THREE.Color('#b7bcc6'),
  玄武: new THREE.Color('#8fa3b8'),
}
const DIM_COLOR = new THREE.Color('#5a6680')
const BASE_COLOR = new THREE.Color('#dfe3ea')
const GOLD = new THREE.Color('#d8b878')
const LINE_BASE = new THREE.Color('#8fa3bd')

/** 所有可交互目标(供 Controls 投影拾取) */
interface Hit {
  id: string
  kind: 'mansion' | 'dipper' | 'polaris'
  pos: THREE.Vector3
  label: string
  sub: string
}

function makeHitList(): Hit[] {
  const list: Hit[] = []
  for (const id of MANSION_ORDER) {
    const m = MANSIONS[id]
    list.push({
      id,
      kind: 'mansion',
      pos: new THREE.Vector3(),
      label: m.name,
      sub: `${QUADRANTS[m.quadrant].name} · 第${'一二三四五六七'[m.index - 1]}宿`,
    })
  }
  for (const d of DIPPER) {
    list.push({
      id: `dipper:${d.name}`,
      kind: 'dipper',
      pos: new THREE.Vector3(),
      label: d.name,
      sub: '北斗七星',
    })
  }
  list.push({ id: 'polaris', kind: 'polaris', pos: new THREE.Vector3(), label: '北极星', sub: '勾陈一' })
  return list
}

export default function MansionSystem() {
  const s = useSkyStore.getState()
  const frame = useMemo(() => computeSkyFrame(s.site, s.time), []) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── 几何与材质(创建一次) ───
  const geo = useMemo(() => {
    const n = MANSION_ORDER.length
    const memberCount = MANSION_ORDER.reduce((acc, id) => acc + MANSIONS[id].members.length, 0)
    const dipperCount = DIPPER.length + 2 // 辅星 + 北极星

    const nodePos = new Float32Array(n * 3)
    const nodeSize = new Float32Array(n)
    MANSION_ORDER.forEach((id, i) => {
      const m = MANSIONS[id]
      nodeSize[i] = Math.min(52, Math.max(26, 26 + (3.8 - m.determinative.mag) * 8))
    })
    const nodes = makeStarGeometry(nodePos, {
      size: nodeSize,
      alpha: 0,
      color: BASE_COLOR.toArray() as [number, number, number],
      coreRatio: 0.13,
      twinkle: 0.035,
      seed: 3,
    })

    const memberPos = new Float32Array(memberCount * 3)
    const memberSize = new Float32Array(memberCount)
    const memberColor = new Float32Array(memberCount * 3)
    let mi = 0
    for (const id of MANSION_ORDER) {
      for (const star of MANSIONS[id].members) {
        memberSize[mi] = Math.min(5.2, Math.max(1.3, 1.6 + (4.6 - star.mag) * 1.1))
        memberColor[mi * 3] = 0.9
        memberColor[mi * 3 + 1] = 0.92
        memberColor[mi * 3 + 2] = 0.98
        mi++
      }
    }
    const members = makeStarGeometry(memberPos, {
      size: memberSize,
      alpha: 0,
      color: memberColor,
      coreRatio: 0.42,
      twinkle: 0.04,
      seed: 11,
    })

    // 宿内连线(LineSegments)
    const lines = {} as Record<MansionId, THREE.BufferGeometry>
    const lineMats = {} as Record<MansionId, THREE.LineBasicMaterial>
    for (const id of MANSION_ORDER) {
      const m = MANSIONS[id]
      const segs = Math.max(0, m.members.length - 1)
      const lineGeo = new THREE.BufferGeometry()
      lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(segs * 2 * 3), 3))
      lineGeo.setDrawRange(0, segs * 2)
      lines[id] = lineGeo
      lineMats[id] = new THREE.LineBasicMaterial({
        color: LINE_BASE,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    }

    // 四象脊线(七宿距星,稠密采样以支持绘制进度动画)
    const SPINE_POINTS = 96
    const spines = {} as Record<
      QuadrantId,
      { geo: THREE.BufferGeometry; curve: THREE.CatmullRomCurve3 }
    >
    const spineMats = {} as Record<QuadrantId, THREE.LineBasicMaterial>
    const spineLines = {} as Record<QuadrantId, THREE.Line>
    for (const q of QUADRANT_ORDER) {
      const geoQ = new THREE.BufferGeometry()
      geoQ.setAttribute('position', new THREE.BufferAttribute(new Float32Array(SPINE_POINTS * 3), 3))
      geoQ.setDrawRange(0, SPINE_POINTS)
      spines[q] = { geo: geoQ, curve: new THREE.CatmullRomCurve3([], false, 'centripetal', 0.5) }
      spineMats[q] = new THREE.LineBasicMaterial({
        color: QUAD_COLOR[q],
        transparent: true,
        opacity: 0.06,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
      spineLines[q] = new THREE.Line(geoQ, spineMats[q])
      spineLines[q].frustumCulled = false
    }

    // 四象回响线:距星径向外偏的第二重极淡曲线 —— 如古星图的双线勾边,
    // 与脊线共同形成「星象轮廓」的暗示(不构成任何具象模型)
    const ECHO_OFFSET = 15
    const echoSpines = {} as Record<QuadrantId, THREE.BufferGeometry>
    const echoMats = {} as Record<QuadrantId, THREE.LineBasicMaterial>
    const echoLines = {} as Record<QuadrantId, THREE.Line>
    for (const q of QUADRANT_ORDER) {
      const g = new THREE.BufferGeometry()
      g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(SPINE_POINTS * 3), 3))
      g.setDrawRange(0, SPINE_POINTS)
      echoSpines[q] = g
      echoMats[q] = new THREE.LineBasicMaterial({
        color: QUAD_COLOR[q],
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
      echoLines[q] = new THREE.Line(g, echoMats[q])
      echoLines[q].frustumCulled = false
    }

    // 星线辉光点:沿宿内连线取点(成员 + 段中点),
    // 星线亮起时形成「被光轻轻勾勒」的雾状质感
    let glowCount = 0
    const glowRange = new Map<MansionId, [number, number]>()
    for (const id of MANSION_ORDER) {
      const pts = MANSIONS[id].members.length * 2 - 1
      glowRange.set(id, [glowCount, glowCount + pts])
      glowCount += pts
    }
    const glow = makeStarGeometry(new Float32Array(glowCount * 3), {
      size: 4.4,
      alpha: 0,
      color: [0.68, 0.77, 0.9],
      coreRatio: 0.3,
      twinkle: 0.02,
      seed: 23,
    })

    // 流动粒子(每象 8 个,细密缓慢的粒子流)
    const FLOW_PER_Q = 8
    const flow = makeStarGeometry(new Float32Array(4 * FLOW_PER_Q * 3), {
      size: 6.5,
      alpha: 0,
      color: [1, 1, 1],
      coreRatio: 0.2,
      twinkle: 0,
      seed: 5,
    })

    // 北斗 + 辅星 + 北极星
    const dipperPos = new Float32Array(dipperCount * 3)
    const dipperSize = new Float32Array(dipperCount)
    const dipperColor = new Float32Array(dipperCount * 3)
    const all = [...DIPPER, DIPPER_COMPANION, POLARIS]
    all.forEach((st, i) => {
      dipperSize[i] = i < 7 ? 20 + (2.5 - st.mag) * 6 : i === 7 ? 4 : 24
      dipperColor[i * 3] = i < 7 ? 1.0 : 0.82
      dipperColor[i * 3 + 1] = i < 7 ? 0.96 : 0.86
      dipperColor[i * 3 + 2] = i < 7 ? 0.9 : 1.0
    })
    const dipper = makeStarGeometry(dipperPos, {
      size: dipperSize,
      alpha: 0,
      color: dipperColor,
      coreRatio: 0.16,
      twinkle: 0.03,
      seed: 17,
    })

    // 斗魁四星闭合成斗身:天枢0 天璇1 天玑2 天权3;斗柄:3-4-5-6(玉衡4 开阳5 摇光6);辅7;北极星8
    const dipperBowl = new THREE.BufferGeometry()
    dipperBowl.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(3 * 4 * 2), 3),
    )
    dipperBowl.setDrawRange(0, 8)
    dipperBowl.userData.pairs = [[0, 1], [1, 2], [2, 3], [3, 0]]
    const dipperHandle = new THREE.BufferGeometry()
    dipperHandle.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(3 * 3 * 2), 3),
    )
    dipperHandle.setDrawRange(0, 6)
    dipperHandle.userData.pairs = [[3, 4], [4, 5], [5, 6]]
    const dipperComp = new THREE.BufferGeometry()
    dipperComp.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3))
    dipperComp.setDrawRange(0, 2)
    dipperComp.userData.pairs = [[5, 7]]
    const polarisGuide = new THREE.BufferGeometry()
    polarisGuide.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3))
    polarisGuide.setDrawRange(0, 2)
    polarisGuide.userData.pairs = [[0, 8]]

    // 地平环
    const RING = 128
    const ringPos = new Float32Array((RING + 1) * 3)
    for (let i = 0; i <= RING; i++) {
      const a = (i / RING) * Math.PI * 2
      ringPos[i * 3] = Math.cos(a) * DOME_R
      ringPos[i * 3 + 1] = 0
      ringPos[i * 3 + 2] = Math.sin(a) * DOME_R
    }
    const horizon = new THREE.BufferGeometry()
    horizon.setAttribute('position', new THREE.BufferAttribute(ringPos, 3))

    return {
      nodes, members, lines, lineMats, spines, spineMats, spineLines, flow,
      echoSpines, echoMats, echoLines,
      glow, glowRange,
      dipper, dipperBowl, dipperHandle, dipperComp, polarisGuide, horizon,
      nodeCount: n,
      nodeBaseSize: nodeSize,
      memberCount,
      dipperCount,
      nodeAlpha: new Float32Array(n),
      nodeAlphaT: new Float32Array(n),
      memberAlpha: new Float32Array(memberCount),
      memberAlphaT: new Float32Array(memberCount),
      dipperAlpha: new Float32Array(dipperCount),
      dipperAlphaT: new Float32Array(dipperCount),
      lineOpacity: Object.fromEntries(MANSION_ORDER.map((id) => [id, 0])) as Record<MansionId, number>,
      lineOpacityT: Object.fromEntries(MANSION_ORDER.map((id) => [id, 0])) as Record<MansionId, number>,
      spineOpacity: QUADRANT_ORDER.map(() => 0.06),
      spineOpacityT: QUADRANT_ORDER.map(() => 0.06),
      dipperLineOpacity: [0, 0, 0, 0],
      dipperLineOpacityT: [0, 0, 0, 0],
      glowAlpha: new Float32Array(glowCount),
      flowAlpha: new Float32Array(4 * FLOW_PER_Q),
      flowPerQ: FLOW_PER_Q,
      hit: makeHitList(),
    }
  }, [])

  const mats = useMemo(
    () => {
      const lineMat = () =>
        new THREE.LineBasicMaterial({
          color: new THREE.Color('#b9c4d8'),
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      return {
        nodes: makeStarMaterial({ opacity: 1 }),
        members: makeStarMaterial({ opacity: 1 }),
        glow: makeStarMaterial({ opacity: 1 }),
        flow: makeStarMaterial({ opacity: 1 }),
        dipper: makeStarMaterial({ opacity: 1 }),
        dipperBowl: lineMat(),
        dipperHandle: lineMat(),
        dipperComp: lineMat(),
        polarisLine: lineMat(),
        horizon: new THREE.LineBasicMaterial({
          color: new THREE.Color('#5f7391'),
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      }
    },
    [],
  )

  const cardinals = useMemo(
    () =>
      [
        { t: '北', x: 0, z: -1 },
        { t: '东', x: 1, z: 0 },
        { t: '南', x: 0, z: 1 },
        { t: '西', x: -1, z: 0 },
      ].map((c) => ({ ...c, tex: makeTextSprite(c.t) })),
    [],
  )

  // ─── 时间/地点变更 → 重建天体位置 ───
  useEffect(() => {
    const rebuild = (revision: number) => {
      const { site, time } = useSkyStore.getState()
      const f = computeSkyFrame(site, time)

      // 节点 + 成员星
      const nodeAttr = geo.nodes.getAttribute('position') as THREE.BufferAttribute
      const memAttr = geo.members.getAttribute('position') as THREE.BufferAttribute
      const hitByMansion = new Map<MansionId, THREE.Vector3>()
      let mi = 0
      for (const id of MANSION_ORDER) {
        const m = MANSIONS[id]
        const idx = MANSION_ORDER.indexOf(id)
        const dv = f.radecToWorld(m.determinative.ra, m.determinative.dec)
        nodeAttr.setXYZ(idx, dv[0] * DOME_R, dv[1] * DOME_R, dv[2] * DOME_R)
        hitByMansion.set(id, new THREE.Vector3(dv[0] * DOME_R, dv[1] * DOME_R, dv[2] * DOME_R))
        for (const star of m.members) {
          const v = f.radecToWorld(star.ra, star.dec)
          memAttr.setXYZ(mi, v[0] * DOME_R, v[1] * DOME_R, v[2] * DOME_R)
          mi++
        }
        // 宿内连线
        const lineAttr = geo.lines[id].getAttribute('position') as THREE.BufferAttribute
        for (let k = 0; k < m.members.length - 1; k++) {
          const a = f.radecToWorld(m.members[k].ra, m.members[k].dec)
          const b = f.radecToWorld(m.members[k + 1].ra, m.members[k + 1].dec)
          lineAttr.setXYZ(k * 2, a[0] * DOME_R, a[1] * DOME_R, a[2] * DOME_R)
          lineAttr.setXYZ(k * 2 + 1, b[0] * DOME_R, b[1] * DOME_R, b[2] * DOME_R)
        }
        lineAttr.needsUpdate = true
      }
      nodeAttr.needsUpdate = true
      memAttr.needsUpdate = true

      // 四象脊线
      for (const q of QUADRANT_ORDER) {
        const pts = QUADRANT_MANSIONS[q].map((id) => hitByMansion.get(id)!)
        const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal', 0.5)
        geo.spines[q].curve = curve
        const sampled = curve.getPoints(96)
        const attr = geo.spines[q].geo.getAttribute('position') as THREE.BufferAttribute
        sampled.forEach((p, i) => attr.setXYZ(i, p.x, p.y, p.z))
        attr.needsUpdate = true
        // 回响线(径向外偏 15 单位)
        const echoPts = pts.map((p) => p.clone().multiplyScalar(1 + 15 / DOME_R))
        const echoCurve = new THREE.CatmullRomCurve3(echoPts, false, 'centripetal', 0.5)
        const echoSampled = echoCurve.getPoints(96)
        const echoAttr = geo.echoSpines[q].getAttribute('position') as THREE.BufferAttribute
        echoSampled.forEach((p, i) => echoAttr.setXYZ(i, p.x, p.y, p.z))
        echoAttr.needsUpdate = true
      }

      // 星线辉光点
      const glowAttr = geo.glow.getAttribute('position') as THREE.BufferAttribute
      for (const id of MANSION_ORDER) {
        const m = MANSIONS[id]
        let gi = geo.glowRange.get(id)![0]
        for (let k = 0; k < m.members.length; k++) {
          const v = f.radecToWorld(m.members[k].ra, m.members[k].dec)
          glowAttr.setXYZ(gi++, v[0] * DOME_R, v[1] * DOME_R, v[2] * DOME_R)
          if (k < m.members.length - 1) {
            const w = f.radecToWorld(m.members[k + 1].ra, m.members[k + 1].dec)
            glowAttr.setXYZ(
              gi++,
              ((v[0] + w[0]) / 2) * DOME_R,
              ((v[1] + w[1]) / 2) * DOME_R,
              ((v[2] + w[2]) / 2) * DOME_R,
            )
          }
        }
      }
      glowAttr.needsUpdate = true

      // 北斗 + 辅 + 北极星
      const dipAttr = geo.dipper.getAttribute('position') as THREE.BufferAttribute
      const all = [...DIPPER, DIPPER_COMPANION, POLARIS]
      const dipPts = all.map((st) => {
        const v = f.radecToWorld(st.ra, st.dec)
        return new THREE.Vector3(v[0] * DIPPER_R, v[1] * DIPPER_R, v[2] * DIPPER_R)
      })
      dipPts.forEach((p, i) => dipAttr.setXYZ(i, p.x, p.y, p.z))
      dipAttr.needsUpdate = true
      const setLine = (g: THREE.BufferGeometry) => {
        const a = g.getAttribute('position') as THREE.BufferAttribute
        ;(g.userData.pairs as [number, number][]).forEach(([p, q], i) => {
          a.setXYZ(i * 2, dipPts[p].x, dipPts[p].y, dipPts[p].z)
          a.setXYZ(i * 2 + 1, dipPts[q].x, dipPts[q].y, dipPts[q].z)
        })
        a.needsUpdate = true
      }
      setLine(geo.dipperBowl)
      setLine(geo.dipperHandle)
      setLine(geo.dipperComp)
      setLine(geo.polarisGuide)

      // 可交互目标
      for (const h of geo.hit) {
        if (h.kind === 'mansion') {
          h.pos.copy(hitByMansion.get(h.id as MansionId)!)
        } else if (h.kind === 'dipper') {
          const name = h.id.replace('dipper:', '')
          const st = DIPPER.find((d) => d.name === name)!
          const v = f.radecToWorld(st.ra, st.dec)
          h.pos.set(v[0] * DIPPER_R, v[1] * DIPPER_R, v[2] * DIPPER_R)
        } else {
          const v = f.radecToWorld(POLARIS.ra, POLARIS.dec)
          h.pos.set(v[0] * DIPPER_R, v[1] * DIPPER_R, v[2] * DIPPER_R)
        }
      }
      runtime.hit = geo.hit
    }
    rebuild(useSkyStore.getState().revision)
    return useSkyStore.subscribe((st, prev) => {
      if (st.revision !== prev.revision) rebuild(st.revision)
    })
  }, [geo])

  // ─── 每帧:揭示、悬停、选中、四象动画、流动粒子 ───
  const memberOffset = useRef(new Map<MansionId, number>())
  if (memberOffset.current.size === 0) {
    let acc = 0
    for (const id of MANSION_ORDER) {
      memberOffset.current.set(id, acc)
      acc += MANSIONS[id].members.length
    }
  }

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.1)
    runtime.t += dt
    runtime.reveal = Math.min(1, runtime.reveal + dt * (runtime.entered ? 1.5 : 0.115))
    const st = useSkyStore.getState()
    const reveal = runtime.reveal
    const mansionReveal = smoothstep(0.52, 0.9, reveal)
    // 快/慢两档过渡:悬停即时,选择/降权缓慢(约 2s 完全过渡)
    const lamFast = 1 - Math.exp(-dt * 4.2)
    const lamSlow = 1 - Math.exp(-dt * 1.7)
    const lam = lamSlow

    // 四象揭示动画
    const qAnim = runtime.quadrantAnim
    if (qAnim.id !== st.selectedQuadrant) {
      qAnim.id = st.selectedQuadrant
      qAnim.t = 0
    }
    if (qAnim.id) qAnim.t = Math.min(1.6, qAnim.t + dt)
    const qWindow = (mIdx: number) => smoothstep(mIdx * 0.15, mIdx * 0.15 + 0.55, qAnim.t)

    // 北斗逐星点亮
    const dAnim = runtime.dipperAnim
    if (st.guideMode === 'dipper' && !dAnim.active) {
      dAnim.active = true
      dAnim.t = 0
    } else if (st.guideMode !== 'dipper' && dAnim.active) {
      dAnim.active = false
      dAnim.t = 0
    }
    if (dAnim.active) dAnim.t = Math.min(2.2, dAnim.t + dt)
    const dWindow = (j: number) => smoothstep(j * 0.16, j * 0.16 + 0.5, dAnim.t)

    // 节点/成员/连线目标
    // 属性写入门控:仅当数值变化超过阈值时才上传 GPU 缓冲(避免每帧无谓的 bufferSubData)
    const nodeAlphaAttr = geo.nodes.getAttribute('aAlpha') as THREE.BufferAttribute
    const nodeSizeAttr = geo.nodes.getAttribute('aSize') as THREE.BufferAttribute
    const memAlphaAttr = geo.members.getAttribute('aAlpha') as THREE.BufferAttribute
    const glowAlphaAttr = geo.glow.getAttribute('aAlpha') as THREE.BufferAttribute
    let nodeDirty = false
    let sizeDirty = false
    let memDirty = false
    let glowDirty = false
    for (const id of MANSION_ORDER) {
      const m = MANSIONS[id]
      const qi = QUADRANT_MANSIONS[m.quadrant].indexOf(id)
      const idx = MANSION_ORDER.indexOf(id)
      const isSel = st.selectedMansion === id
      const isHov = st.hovered === id
      const isSelQ = st.selectedQuadrant === m.quadrant
      const otherSel = st.selectedQuadrant !== null && !isSelQ
      const lamM = isSel || isHov ? lamFast : lamSlow

      let nodeT: number
      if (isSel || isHov) nodeT = 1
      else if (isSelQ) nodeT = 0.3 + 0.7 * qWindow(qi)
      else if (otherSel) nodeT = 0.13
      else nodeT = 0.62
      nodeT *= isSel || isHov ? 1 : mansionReveal
      geo.nodeAlphaT[idx] = nodeT
      const prevA = geo.nodeAlpha[idx]
      geo.nodeAlpha[idx] += (nodeT - prevA) * lamM
      if (Math.abs(geo.nodeAlpha[idx] - prevA) > 1e-4) nodeDirty = true

      // 节点尺寸:选中放大 + 柔和光晕感;象限选中时象首/象尾微强调
      let boost = 0
      if (isSel) boost = 0.3
      else if (isHov) boost = 0.16
      else if (isSelQ && qi === 0) boost = 0.13
      else if (isSelQ && qi === 6) boost = 0.06
      const sizeTarget = geo.nodeBaseSize[idx] * (1 + boost)
      const prevS = nodeSizeAttr.getX(idx)
      const nextS = prevS + (sizeTarget - prevS) * (1 - Math.exp(-dt * 3))
      nodeSizeAttr.setX(idx, nextS)
      if (Math.abs(nextS - prevS) > 1e-4) sizeDirty = true

      let lineT: number
      if (isSel) {
        // 选中星宿:极缓慢的「呼吸」(约 4.7s 周期,0.6 → 0.9)
        lineT = 0.75 + 0.15 * Math.sin(runtime.t * 1.35)
      } else if (isHov) lineT = 0.55
      else if (isSelQ) lineT = 0.06 + 0.4 * qWindow(qi)
      else if (otherSel) lineT = 0.025
      else lineT = 0.14
      lineT *= mansionReveal
      geo.lineOpacityT[id] = lineT
      geo.lineOpacity[id] += (lineT - geo.lineOpacity[id]) * lamM
      geo.lineMats[id].opacity = geo.lineOpacity[id]

      // 节点颜色:选中金、象限色、其余基础白
      let cr: number, cg: number, cb: number
      if (isSel) {
        cr = GOLD.r; cg = GOLD.g; cb = GOLD.b
      } else if (isHov) {
        cr = 1; cg = 1; cb = 1
      } else if (isSelQ) {
        const c = QUAD_COLOR[m.quadrant]
        cr = c.r; cg = c.g; cb = c.b
      } else if (otherSel) {
        cr = DIM_COLOR.r; cg = DIM_COLOR.g; cb = DIM_COLOR.b
      } else {
        cr = BASE_COLOR.r; cg = BASE_COLOR.g; cb = BASE_COLOR.b
      }
      const na = nodeAlphaAttr
      const ck = 1 - Math.exp(-dt * 4)
      na.setXYZ(idx, na.getX(idx) + (cr - na.getX(idx)) * ck, na.getY(idx) + (cg - na.getY(idx)) * ck, na.getZ(idx) + (cb - na.getZ(idx)) * ck)

      // 成员星
      const off = memberOffset.current.get(id)!
      for (let k = 0; k < m.members.length; k++) {
        const midx = off + k
        let memT: number
        if (isSel || isHov) memT = 0.95
        else if (isSelQ) memT = 0.2 + 0.75 * qWindow(qi)
        else if (otherSel) memT = 0.07
        else memT = 0.5
        memT *= mansionReveal
        geo.memberAlphaT[midx] = memT
        const prevM = geo.memberAlpha[midx]
        geo.memberAlpha[midx] += (memT - prevM) * lamM
        if (Math.abs(geo.memberAlpha[midx] - prevM) > 1e-4) memDirty = true
      }

      // 星线辉光点:随星线亮度起伏
      const [gs, ge] = geo.glowRange.get(id)!
      const glowT = geo.lineOpacity[id] * 0.34
      for (let gi = gs; gi < ge; gi++) {
        const prevG = geo.glowAlpha[gi]
        const nextG = prevG + (glowT - prevG) * lamM
        geo.glowAlpha[gi] = nextG
        if (Math.abs(nextG - prevG) > 1e-4) {
          glowAlphaAttr.setX(gi, nextG)
          glowDirty = true
        }
      }
    }
    if (nodeDirty) {
      for (let i = 0; i < geo.nodeCount; i++) nodeAlphaAttr.setX(i, geo.nodeAlpha[i])
      nodeAlphaAttr.needsUpdate = true
    }
    if (sizeDirty) nodeSizeAttr.needsUpdate = true
    if (memDirty) {
      for (let i = 0; i < geo.memberCount; i++) memAlphaAttr.setX(i, geo.memberAlpha[i])
      memAlphaAttr.needsUpdate = true
    }
    if (glowDirty) glowAlphaAttr.needsUpdate = true

    // 四象脊线 + 回响线 + 流动粒子
    for (const q of QUADRANT_ORDER) {
      const qi = QUADRANT_ORDER.indexOf(q)
      const selQ = st.selectedQuadrant === q
      const target = selQ ? 0.42 : 0.05
      geo.spineOpacityT[qi] = target
      geo.spineOpacity[qi] += (target - geo.spineOpacity[qi]) * lamSlow
      geo.spineMats[q].opacity = geo.spineOpacity[qi] * mansionReveal
      geo.echoMats[q].opacity = geo.spineOpacity[qi] * mansionReveal * 0.45
      // 绘制进度(约 3.6s 完整揭示)
      const prog = runtime.spineProgress[q]
      runtime.spineProgress[q] = selQ ? Math.min(1, prog + dt / 3.6) : 0
      const count = 96
      geo.spines[q].geo.setDrawRange(0, Math.max(1, Math.floor(runtime.spineProgress[q] * (count - 1)) + 1))
      // 流动粒子:细密、缓慢的粒子流
      const curve = geo.spines[q].curve
      if (!curve || curve.points.length === 0) continue
      const fp = geo.flowPerQ
      for (let k = 0; k < fp; k++) {
        const pi = qi * fp + k
        const frac = (runtime.t * 0.03 + k / fp + qi * 0.31) % 1
        const p = curve.getPoint(frac)
        if (!p) continue
        const fa = geo.flow.getAttribute('position') as THREE.BufferAttribute
        fa.setXYZ(pi, p.x, p.y, p.z)
        const alpha = Math.sin(Math.PI * frac)
        geo.flowAlpha[pi] = alpha * (selQ ? 0.26 : 0)
        ;(geo.flow.getAttribute('aAlpha') as THREE.BufferAttribute).setX(pi, geo.flowAlpha[pi])
      }
      ;(geo.flow.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true
      ;(geo.flow.getAttribute('aAlpha') as THREE.BufferAttribute).needsUpdate = true
    }

    // 北斗
    const dipAlphaAttr = geo.dipper.getAttribute('aAlpha') as THREE.BufferAttribute
    const dipperReveal = smoothstep(0.52, 0.9, reveal)
    let dipDirty = false
    for (let j = 0; j < geo.dipperCount; j++) {
      let t: number
      if (dAnim.active && j < 7) t = 0.25 + 0.75 * dWindow(j)
      else if (dAnim.active) t = 0.55
      else t = 0.5
      t *= dipperReveal
      geo.dipperAlphaT[j] = t
      const prevD = geo.dipperAlpha[j]
      geo.dipperAlpha[j] += (t - prevD) * lam
      if (Math.abs(geo.dipperAlpha[j] - prevD) > 1e-4) dipDirty = true
      dipAlphaAttr.setX(j, geo.dipperAlpha[j])
    }
    if (dipDirty) dipAlphaAttr.needsUpdate = true

    // 北斗连线:斗身 → 斗柄 → 辅 → 天枢-北极星
    const bowlT = dAnim.active ? smoothstep(0.1, 0.6, dAnim.t) * 0.6 : 0.14
    const handleT = dAnim.active ? smoothstep(0.5, 1.0, dAnim.t) * 0.6 : 0.12
    const compT = dAnim.active ? smoothstep(0.8, 1.3, dAnim.t) * 0.5 : 0.1
    const guideT = dAnim.active ? smoothstep(1.0, 1.5, dAnim.t) * 0.4 : 0.09
    const dl = [bowlT, handleT, compT, guideT].map((t) => t * dipperReveal)
    dl.forEach((t, i) => {
      geo.dipperLineOpacity[i] += (t - geo.dipperLineOpacity[i]) * lam
    })
    mats.dipperBowl.opacity = geo.dipperLineOpacity[0]
    mats.dipperHandle.opacity = geo.dipperLineOpacity[1]
    mats.dipperComp.opacity = geo.dipperLineOpacity[2]
    mats.polarisLine.opacity = geo.dipperLineOpacity[3]
    mats.horizon.opacity = 0.12 * smoothstep(0.5, 0.9, reveal)

    // 全局 uniform
    const proj =
      ((state.size.height * state.viewport.dpr) / 2) /
      Math.tan(((state.camera as THREE.PerspectiveCamera).fov * Math.PI) / 360)
    for (const m of [mats.nodes, mats.members, mats.glow, mats.flow, mats.dipper]) {
      m.uniforms.uTime.value = runtime.t
      m.uniforms.uProjScale.value = proj
    }
  })

  return (
    <group>
      <points geometry={geo.nodes} material={mats.nodes} frustumCulled={false} />
      <points geometry={geo.members} material={mats.members} frustumCulled={false} />
      <points geometry={geo.glow} material={mats.glow} frustumCulled={false} />
      <points geometry={geo.flow} material={mats.flow} frustumCulled={false} />
      <points geometry={geo.dipper} material={mats.dipper} frustumCulled={false} />

      {MANSION_ORDER.map((id) => (
        <lineSegments key={id} geometry={geo.lines[id]} material={geo.lineMats[id]} frustumCulled={false} />
      ))}
      {QUADRANT_ORDER.map((q) => (
        <primitive key={q} object={geo.spineLines[q]} />
      ))}
      {QUADRANT_ORDER.map((q) => (
        <primitive key={`echo-${q}`} object={geo.echoLines[q]} />
      ))}

      <lineSegments geometry={geo.dipperBowl} material={mats.dipperBowl} frustumCulled={false} />
      <lineSegments geometry={geo.dipperHandle} material={mats.dipperHandle} frustumCulled={false} />
      <lineSegments geometry={geo.dipperComp} material={mats.dipperComp} frustumCulled={false} />
      <lineSegments geometry={geo.polarisGuide} material={mats.polarisLine} frustumCulled={false} />
      <lineLoop geometry={geo.horizon} material={mats.horizon} frustumCulled={false} />

      {cardinals.map((c) => (
        <sprite
          key={c.t}
          position={[c.x * DOME_R * 0.94, 0, c.z * DOME_R * 0.94]}
          scale={[30, 30, 1]}
        >
          <spriteMaterial
            map={c.tex}
            transparent
            opacity={0.16}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </sprite>
      ))}
    </group>
  )
}
