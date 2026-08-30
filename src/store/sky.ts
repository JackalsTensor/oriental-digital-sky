/**
 * 全局状态。
 * 原则:React/Zustand 只管 UI 相关的离散状态;
 * 3D 场景的高频状态(相机、渐变、光晕)走 runtime 可变对象,避免重渲染。
 */
import { create } from 'zustand'
import * as THREE from 'three'
import type { MansionId } from '@/data/mansions'
import type { QuadrantId } from '@/data/quadrants'
import type { Site, TimeParts } from '@/lib/astronomy'
import { DEFAULT_SITE } from '@/data/sites'

export type AppPhase = 'opening' | 'interactive'
export type GuideMode = 'free' | 'dipper'

const now = new Date()

interface SkyStore {
  phase: AppPhase
  selectedQuadrant: QuadrantId | null
  selectedMansion: MansionId | null
  hovered: string | null
  guideMode: GuideMode
  site: Site
  time: TimeParts
  /** 时间/地点变更计数,场景订阅此值重建天球几何 */
  revision: number
  /** 时间/地点面板开关 */
  timePanelOpen: boolean

  enter: () => void
  setTimePanel: (open: boolean) => void
  selectQuadrant: (q: QuadrantId | null) => void
  selectMansion: (m: MansionId | null) => void
  setHovered: (id: string | null) => void
  setGuideMode: (g: GuideMode) => void
  setSite: (s: Site) => void
  setTime: (t: TimeParts) => void
}

export const useSkyStore = create<SkyStore>((set) => ({
  phase: 'opening',
  selectedQuadrant: null,
  selectedMansion: null,
  hovered: null,
  guideMode: 'free',
  site: DEFAULT_SITE,
  time: {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
    hour: now.getHours(),
    minute: now.getMinutes(),
  },
  revision: 0,
  timePanelOpen: false,

  enter: () => set({ phase: 'interactive' }),
  setTimePanel: (open) => set({ timePanelOpen: open }),
  selectQuadrant: (q) => set({ selectedQuadrant: q, selectedMansion: null }),
  selectMansion: (m) => set({ selectedMansion: m }),
  setHovered: (id) => set({ hovered: id }),
  setGuideMode: (g) =>
    set({ guideMode: g, selectedMansion: null, selectedQuadrant: null }),
  setSite: (s) => set((st) => ({ site: s, revision: st.revision + 1 })),
  setTime: (t) => set((st) => ({ time: t, revision: st.revision + 1 })),
}))

// ─────────── 3D 运行时(非响应式) ───────────

export interface FocusState {
  pos: THREE.Vector3
  look: THREE.Vector3
}

export interface HitTarget {
  /** mansion id,或 'dipper:星名',或 'polaris' */
  id: string
  kind: 'mansion' | 'dipper' | 'polaris'
  pos: THREE.Vector3
  label: string
  sub: string
}

export const runtime = {
  /** 挂载以来的秒数 */
  t: 0,
  /** 开屏揭示进度 0→1 */
  reveal: 0,
  entered: false,
  dragging: false,
  dragMoved: 0,
  /** 相机聚焦(点击星宿后) */
  focus: null as FocusState | null,
  /** 四象选中后的逐宿揭示动画 */
  quadrantAnim: { id: null as QuadrantId | null, t: 0 },
  /** 北斗逐星点亮动画 */
  dipperAnim: { active: false, t: 0 },
  /** 四象脊线绘制进度 */
  spineProgress: { 青龙: 0, 朱雀: 0, 白虎: 0, 玄武: 0 } as Record<QuadrantId, number>,
  /** 悬停标签的屏幕坐标(px,由 Controls 写入,UI 直接读) */
  hoverScreen: null as null | { x: number; y: number },
  /** 可交互目标(由 MansionSystem 维护,Controls 用于投影拾取) */
  hit: [] as HitTarget[],
  /** 开屏构图锚点:心宿二的世界方向(Controls 初始化时计算) */
  anchorDir: null as THREE.Vector3 | null,
}

// 调试句柄(仅用于开发检查)
if (typeof window !== 'undefined')
  (window as unknown as Record<string, unknown>).__runtime = runtime

/** 常见缓动工具(与 UI 动画风格一致) */
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3)
export const smoothstep = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)))
  return t * t * (3 - 2 * t)
}

/** 相机聚焦到某个可交互目标(星宿 / 北斗星 / 北极星) */
export function focusTarget(id: string) {
  const hit = runtime.hit.find((h) => h.id === id)
  if (!hit) return
  runtime.focus = { pos: hit.pos.clone().multiplyScalar(0.34), look: hit.pos.clone() }
}

/** 相机聚焦到北斗区域 */
export function focusDipper() {
  const center = new THREE.Vector3()
  let n = 0
  for (const h of runtime.hit) {
    if (h.kind === 'dipper') {
      center.add(h.pos)
      n++
    }
  }
  if (n > 0) {
    center.divideScalar(n)
    runtime.focus = { pos: center.clone().multiplyScalar(0.34), look: center.clone() }
  }
}
