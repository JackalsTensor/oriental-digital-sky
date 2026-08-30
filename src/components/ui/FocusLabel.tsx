/**
 * 聚焦标签:选中星宿后,在其星点上方的屏幕位置出现名称。
 * 位置由 rAF 直接写 style;星宿移出视野时自动隐藏。
 */
'use client'
import { useEffect, useRef } from 'react'
import { runtime, useSkyStore } from '@/store/sky'
import { MANSIONS } from '@/data/mansions'
import { QUADRANTS } from '@/data/quadrants'

const CN_NUM = ['一', '二', '三', '四', '五', '六', '七', '八', '九']

interface SkyDebugHandle {
  camera: {
    updateMatrixWorld: () => void
  }
  THREE: {
    Vector3: new (...args: number[]) => unknown
  }
}

export default function FocusLabel() {
  const selectedMansion = useSkyStore((s) => s.selectedMansion)
  const hovered = useSkyStore((s) => s.hovered)
  const phase = useSkyStore((s) => s.phase)
  const ref = useRef<HTMLDivElement>(null)

  const mansion = selectedMansion ? MANSIONS[selectedMansion] : null
  // 悬停时不重复显示(悬停标签已出现)
  const visible = Boolean(mansion) && hovered !== selectedMansion && phase === 'interactive'

  useEffect(() => {
    if (!mansion) return
    let raf = 0
    const loop = () => {
      const el = ref.current
      const sk = (window as unknown as { __SKY?: SkyDebugHandle }).__SKY
      if (!el || !sk) {
        raf = requestAnimationFrame(loop)
        return
      }
      const hit = runtime.hit.find((h) => h.id === mansion.id)
      if (!hit) {
        el.style.opacity = '0'
        raf = requestAnimationFrame(loop)
        return
      }
      sk.camera.updateMatrixWorld()
      // hit.pos 是页面内 THREE 的 Vector3 实例,直接调用其 project
      const v = (hit.pos as unknown as {
        clone: () => { project: (c: object) => { x: number; y: number; z: number } }
      }).clone().project(sk.camera)
      const w = window.innerWidth
      const h = window.innerHeight
      if (v.z < 1 && Math.abs(v.x) < 1.1 && Math.abs(v.y) < 1.1) {
        const sx = ((v.x + 1) / 2) * w
        const sy = ((1 - v.y) / 2) * h
        el.style.opacity = '1'
        el.style.transform = `translate(${sx}px, ${sy - 44}px) translate(-50%, -100%)`
      } else {
        el.style.opacity = '0'
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [mansion])

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed left-0 top-0 z-30 opacity-0 transition-opacity duration-500"
      style={{ display: visible ? 'block' : 'none' }}
    >
      <div className="flex flex-col items-center whitespace-nowrap">
        <span className="font-serif-cn text-[15px] tracking-[0.3em] text-paper/90">
          {mansion?.name}
        </span>
        <span className="mt-1 text-[9px] tracking-[0.14em] text-mist/75">
          {mansion
            ? `${QUADRANTS[mansion.quadrant].name.replace(/^(东方|南方|西方|北方)/, '')} · 第${CN_NUM[mansion.index - 1]}宿`
            : ''}
        </span>
      </div>
    </div>
  )
}
