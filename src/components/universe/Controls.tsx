/**
 * 相机与交互控制:
 *  - 拖动旋转 / 滚轮缩放 / WASD·方向键移动 / Q E 升降 / 双指缩放(触屏)
 *  - 缓慢惯性、自动漂浮、点击星宿聚焦
 *  - 悬停投影拾取(与 MansionSystem 的 runtime.hit 协作)
 *
 * 相机模型:pos = target − forward·dist,target 悬浮在天球内,
 * 拖拽改变 forward 方向,移动同时平移 target 与 pos —— 如在天穹中航行。
 */
'use client'
import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { runtime, useSkyStore } from '@/store/sky'
import { computeSkyFrame } from '@/lib/astronomy'
import { MANSIONS, MANSION_ORDER, type MansionId } from '@/data/mansions'

const DOME_R = 520
const REST_DIST = 470
const OPEN_DIST = 85
const MIN_DIST = 90
const MAX_DIST = 620

const syncYawPitch = (c: CamState) => {
  c.yaw = Math.atan2(c.forward.x, c.forward.z)
  c.pitch = Math.asin(THREE.MathUtils.clamp(c.forward.y, -1, 1))
}

interface CamState {
  forward: THREE.Vector3
  target: THREE.Vector3
  pos: THREE.Vector3
  dist: number
  yaw: number
  pitch: number
  vel: THREE.Vector3
  keys: Set<string>
  inited: boolean
  pinch: number
}

export default function Controls() {
  const { camera, gl } = useThree()
  const store = useSkyStore

  const c = useRef<CamState>({
    forward: new THREE.Vector3(0, 0, 1),
    target: new THREE.Vector3(),
    pos: new THREE.Vector3(0, 0, 60),
    dist: OPEN_DIST,
    yaw: 0,
    pitch: 0,
    vel: new THREE.Vector3(),
    keys: new Set(),
    inited: false,
    pinch: 0,
  }).current

  // 初始化:面向二十八宿带的方向重心(宿带在视野中舒展)
  useEffect(() => {
    const { site, time } = useSkyStore.getState()
    const frame = computeSkyFrame(site, time)
    const sum = new THREE.Vector3()
    for (const id of MANSION_ORDER) {
      const m = MANSIONS[id].determinative
      const v = frame.radecToWorld(m.ra, m.dec)
      sum.add(new THREE.Vector3(v[0], v[1], v[2]))
    }
    const anchor = sum.normalize()
    runtime.anchorDir = anchor
    c.forward.copy(anchor)
    c.target.copy(anchor).multiplyScalar(DOME_R)
    c.pos.copy(c.target).addScaledVector(anchor, -OPEN_DIST)
    syncYawPitch(c)
    c.inited = true
  }, [c])

  // ─── 事件绑定 ───
  useEffect(() => {
    const el = gl.domElement
    const pointers = new Map<number, { x: number; y: number }>()
    let downXY = { x: 0, y: 0 }

    /** 投影拾取(共用) */
    const pick = (x: number, y: number): (typeof runtime.hit)[number] | null => {
      const rect = el.getBoundingClientRect()
      const px = x - rect.left
      const py = y - rect.top
      const v = new THREE.Vector3()
      let best: (typeof runtime.hit)[number] | null = null
      let bestD = 30
      for (const h of runtime.hit) {
        v.copy(h.pos).project(camera)
        if (v.z > 1) continue
        const sx = ((v.x + 1) / 2) * rect.width
        const sy = ((1 - v.y) / 2) * rect.height
        const d = Math.hypot(sx - px, sy - py)
        if (d < bestD) {
          bestD = d
          best = h
        }
      }
      return best
    }

    const onDown = (e: PointerEvent) => {
      if (store.getState().phase !== 'interactive') return
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (pointers.size === 1) {
        downXY = { x: e.clientX, y: e.clientY }
        runtime.dragging = true
        runtime.dragMoved = 0
      } else if (pointers.size === 2) {
        const [a, b] = [...pointers.values()]
        c.pinch = Math.hypot(a.x - b.x, a.y - b.y)
      }
      el.setPointerCapture(e.pointerId)
    }

    const onMove = (e: PointerEvent) => {
      if (store.getState().phase !== 'interactive') return

      // 拖动/双指缩放(仅当该指针处于按下状态)
      if (pointers.has(e.pointerId)) {
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
        if (pointers.size === 1) {
          const dx = e.movementX
          const dy = e.movementY
          if (runtime.dragging) {
            runtime.dragMoved += Math.abs(dx) + Math.abs(dy)
            if (runtime.dragMoved > 6 && runtime.focus) {
              // 用户接管相机:同步朝向,避免跳变
              runtime.focus = null
              syncYawPitch(c)
            }
            c.yaw -= dx * 0.0023
            c.pitch = THREE.MathUtils.clamp(c.pitch - dy * 0.0021, -1.42, 1.42)
          }
        } else if (pointers.size === 2) {
          const [a, b] = [...pointers.values()]
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (c.pinch > 0) {
            runtime.focus = null
            c.dist = THREE.MathUtils.clamp(c.dist * (c.pinch / d), MIN_DIST, MAX_DIST)
          }
          c.pinch = d
        }
      }

      // 悬停拾取(普通移动即生效;36 次投影代价极小,无需节流——
      // 节流会跳过移动的最后一步,导致鼠标恰好停在星宿上时反而拾取不到)
      if (!runtime.dragging) {
        const h = pick(e.clientX, e.clientY)
        if (h) {
          store.getState().setHovered(h.id)
          const rect = el.getBoundingClientRect()
          runtime.hoverScreen = { x: e.clientX - rect.left, y: e.clientY - rect.top }
          el.style.cursor = 'pointer'
        } else {
          if (store.getState().hovered !== null) store.getState().setHovered(null)
          runtime.hoverScreen = null
          el.style.cursor = 'default'
        }
      }
    }

    const onUp = (e: PointerEvent) => {
      if (!pointers.has(e.pointerId)) return
      pointers.delete(e.pointerId)
      if (pointers.size === 1) {
        const [a] = [...pointers.values()]
        c.pinch = 0
        downXY = { x: a.x, y: a.y }
      }
      if (pointers.size === 0) {
        if (runtime.dragging && runtime.dragMoved < 7 && store.getState().phase === 'interactive') {
          const h = pick(e.clientX, e.clientY)
          if (h) {
            const st = store.getState()
            if (h.kind === 'mansion') {
              st.selectMansion(h.id as MansionId)
              runtime.focus = { pos: h.pos.clone().multiplyScalar(0.34), look: h.pos.clone() }
            } else {
              st.setGuideMode('dipper')
              const center = new THREE.Vector3()
              let n = 0
              for (const d of runtime.hit) {
                if (d.kind === 'dipper') {
                  center.add(d.pos)
                  n++
                }
              }
              if (n > 0) {
                center.divideScalar(n)
                runtime.focus = { pos: center.clone().multiplyScalar(0.34), look: center.clone() }
              }
            }
          }
        }
        runtime.dragging = false
        c.pinch = 0
      }
    }

    const onWheel = (e: WheelEvent) => {
      if (store.getState().phase !== 'interactive') return
      e.preventDefault()
      runtime.focus = null
      c.dist = THREE.MathUtils.clamp(c.dist * (1 + e.deltaY * 0.0011), MIN_DIST, MAX_DIST)
    }

    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase()
      if (e.key === 'Escape') {
        const st = store.getState()
        if (st.phase !== 'interactive') return
        st.selectMansion(null)
        st.selectQuadrant(null)
        st.setGuideMode('free')
        if (runtime.focus) {
          runtime.focus = null
          syncYawPitch(c)
        }
        return
      }
      const moveKeys = new Set([
        'w', 'a', 's', 'd',
        'arrowup', 'arrowdown', 'arrowleft', 'arrowright',
        'q', 'e',
      ])
      if (moveKeys.has(k)) {
        c.keys.add(k)
        if (runtime.focus) {
          runtime.focus = null
          syncYawPitch(c)
        }
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      c.keys.delete(e.key.toLowerCase())
    }

    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)
    el.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKey)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
      el.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [gl, camera, c, store])

  // ─── 每帧相机 ───
  useFrame((_, rawDt) => {
    if (!c.inited) return
    const dt = Math.min(rawDt, 0.1)
    const st = store.getState()
    const t = runtime.t

    if (runtime.focus) {
      // 聚焦:缓慢移向目标星宿(用户可随时接管)
      const desired = new THREE.Vector3().subVectors(runtime.focus.look, c.pos).normalize()
      const d = runtime.focus.pos.distanceTo(runtime.focus.look)
      const converged =
        c.target.distanceTo(runtime.focus.look) < 10 && Math.abs(c.dist - d) < 10
      if (converged && !runtime.dragging && c.keys.size === 0) {
        // 聚焦完成后:轻微自动漂浮,让场景保持「活着」
        c.yaw += Math.sin(t * 0.05) * 0.0003
        c.pitch += Math.sin(t * 0.037 + 2.1) * 0.00018
        const cp = Math.cos(c.pitch)
        const driftF = new THREE.Vector3(
          Math.sin(c.yaw) * cp,
          Math.sin(c.pitch),
          Math.cos(c.yaw) * cp,
        )
        c.forward.lerp(driftF, 1 - Math.exp(-dt * 2)).normalize()
      } else {
        c.forward.lerp(desired, 1 - Math.exp(-dt * 1.5)).normalize()
      }
      c.target.lerp(runtime.focus.look, 1 - Math.exp(-dt * 2))
      c.dist += (d - c.dist) * (1 - Math.exp(-dt * 1.5))
    } else {
      // 自动缓慢漂浮(无输入时)
      const idle = !runtime.dragging && c.keys.size === 0 && st.phase === 'interactive'
      if (idle) {
        c.yaw += Math.sin(t * 0.05) * 0.00032
        c.pitch += Math.sin(t * 0.037 + 2.1) * 0.0002
      }
      // 开屏阶段:从近处缓缓拉远
      const pull = st.phase === 'opening'
      const distTarget = pull
        ? OPEN_DIST + (REST_DIST - OPEN_DIST) * Math.min(1, runtime.reveal * 1.3)
        : REST_DIST
      c.dist += (distTarget - c.dist) * (1 - Math.exp(-dt * 1.4))

      const cp = Math.cos(c.pitch)
      const targetF = new THREE.Vector3(
        Math.sin(c.yaw) * cp,
        Math.sin(c.pitch),
        Math.cos(c.yaw) * cp,
      )
      c.forward.lerp(targetF, 1 - Math.exp(-dt * 6)).normalize()
    }

    // WASD / 方向键 / Q E:平移 target 与 pos
    const speed = 3.4 * (c.dist / REST_DIST)
    const dir = new THREE.Vector3()
    const fwd = new THREE.Vector3(c.forward.x, 0, c.forward.z).normalize()
    const right = new THREE.Vector3(-fwd.z, 0, fwd.x)
    if (c.keys.has('w') || c.keys.has('arrowup')) dir.add(fwd)
    if (c.keys.has('s') || c.keys.has('arrowdown')) dir.sub(fwd)
    if (c.keys.has('d') || c.keys.has('arrowright')) dir.add(right)
    if (c.keys.has('a') || c.keys.has('arrowleft')) dir.sub(right)
    if (c.keys.has('e')) dir.y += 1
    if (c.keys.has('q')) dir.y -= 1
    if (dir.lengthSq() > 0) {
      dir.normalize()
      c.vel.lerp(dir.multiplyScalar(speed), 1 - Math.exp(-dt * 2.2))
    } else {
      c.vel.multiplyScalar(Math.exp(-dt * 3.5))
    }
    if (st.phase === 'interactive') {
      c.target.addScaledVector(c.vel, dt)
      const len = c.target.length()
      if (len > DOME_R * 1.4) c.target.multiplyScalar((DOME_R * 1.4) / len)
    }

    // 位置与朝向
    c.pos.copy(c.target).addScaledVector(c.forward, -c.dist)
    camera.position.copy(c.pos)
    camera.lookAt(c.target)
  })

  return null
}
