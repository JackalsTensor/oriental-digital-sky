/**
 * 悬停标签:极小的名称标签,跟随星宿的屏幕投影位置。
 * 位置由 rAF 直接写 style,不经过 React 渲染。
 */
'use client'
import { useEffect, useRef } from 'react'
import { runtime, useSkyStore } from '@/store/sky'

export default function HoverLabel() {
  const hovered = useSkyStore((s) => s.hovered)
  const ref = useRef<HTMLDivElement>(null)

  const hit = hovered ? runtime.hit.find((h) => h.id === hovered) : null
  const label = hit?.label ?? ''
  const sub = hit?.sub ?? ''
  const visible = Boolean(hit)

  useEffect(() => {
    let raf = 0
    const loop = () => {
      const el = ref.current
      if (el) {
        if (runtime.hoverScreen) {
          el.style.opacity = '1'
          el.style.transform = `translate(${runtime.hoverScreen.x + 18}px, ${runtime.hoverScreen.y - 12}px)`
        } else {
          el.style.opacity = '0'
        }
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed left-0 top-0 z-30 opacity-0 transition-opacity duration-300"
    >
      <div
        className="glass-panel px-3 py-2"
        style={{ display: visible ? 'block' : 'none' }}
      >
        <div className="flex items-baseline gap-2 whitespace-nowrap">
          <span className="font-serif-cn text-[13px] tracking-[0.2em] text-paper">{label}</span>
          <span className="text-[9px] tracking-[0.12em] text-mist/80">{sub}</span>
        </div>
      </div>
    </div>
  )
}
