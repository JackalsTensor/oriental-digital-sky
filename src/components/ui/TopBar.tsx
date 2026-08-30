/**
 * 顶栏:左侧品牌,右侧观测地点/时间读数(点击打开时间地点面板)。
 */
'use client'
import { AnimatePresence, motion } from 'framer-motion'
import { useSkyStore } from '@/store/sky'

const pad = (n: number) => String(n).padStart(2, '0')

export default function TopBar() {
  const phase = useSkyStore((s) => s.phase)
  const site = useSkyStore((s) => s.site)
  const time = useSkyStore((s) => s.time)
  const setTimePanel = useSkyStore((s) => s.setTimePanel)

  const yearLabel = time.year < 0 ? `前${-time.year}` : String(time.year)

  return (
    <AnimatePresence>
      {phase === 'interactive' && (
        <motion.header
          className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between px-6 py-5 md:px-8"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.0, ease: 'easeOut', delay: 0.3 }}
        >
          <div className="flex flex-col">
            <h1 className="font-serif-cn text-lg font-medium tracking-[0.35em] text-paper/90">
              二十八宿
            </h1>
            <p className="caps-label mt-1 text-[8px] text-mist/80">
              The Twenty-Eight Mansions
            </p>
          </div>

          <button
            onClick={() => setTimePanel(true)}
            className="glass-panel pointer-events-auto flex items-center gap-3 px-4 py-2.5 transition-colors duration-300 hover:border-gold/40"
          >
            <span className="font-serif-cn text-[13px] tracking-[0.15em] text-paper/90">
              {site.name}
            </span>
            <span className="h-3 w-px bg-paper/15" />
            <span className="font-latin text-[11px] tracking-[0.08em] text-mist">
              {yearLabel}-{pad(time.month)}-{pad(time.day)} {pad(time.hour)}:{pad(time.minute)}
            </span>
          </button>
        </motion.header>
      )}
    </AnimatePresence>
  )
}
