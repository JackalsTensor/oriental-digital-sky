/**
 * 四方宇宙定位:屏幕边缘极淡的方位提示(北玄武 / 东青龙 / 南朱雀 / 西白虎)。
 * 默认几乎融入背景(6%),选中某象时对应方向微微增强(→30%)。
 * 不是导航,只是空间提示。
 */
'use client'
import { AnimatePresence, motion } from 'framer-motion'
import { useSkyStore } from '@/store/sky'

const ITEMS = [
  { dir: '北', quad: '玄武', en: 'North · Black Tortoise', cls: 'left-1/2 top-7 -translate-x-1/2' },
  { dir: '南', quad: '朱雀', en: 'South · Vermilion Bird', cls: 'bottom-[112px] left-1/2 -translate-x-1/2 md:bottom-28' },
  { dir: '西', quad: '白虎', en: 'West · White Tiger', cls: 'left-6 top-1/2 -translate-y-1/2' },
  { dir: '东', quad: '青龙', en: 'East · Azure Dragon', cls: 'right-6 top-1/2 -translate-y-1/2' },
] as const

export default function EdgeCardinals() {
  const phase = useSkyStore((s) => s.phase)
  const selectedQuadrant = useSkyStore((s) => s.selectedQuadrant)

  return (
    <AnimatePresence>
      {phase === 'interactive' && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2.0, ease: 'easeOut', delay: 1.2 }}
        >
          {ITEMS.map((it) => {
            const active = selectedQuadrant === it.quad
            return (
              <div
                key={it.dir}
                className="absolute flex flex-col items-center text-center transition-opacity duration-[1400ms] ease-out"
                style={{ opacity: active ? 0.3 : 0.06 }}
              >
                <span className="font-serif-cn text-[13px] tracking-[0.3em] text-paper">
                  {it.dir}
                </span>
                <span className="mt-1 font-serif-cn text-[10px] tracking-[0.3em] text-paper/80">
                  {it.quad}
                </span>
                <span className="caps-label mt-1.5 text-[6.5px] text-paper/70">{it.en}</span>
              </div>
            )
          })}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
