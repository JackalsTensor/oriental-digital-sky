/**
 * 操作提示:进入后短暂出现,随后淡出。
 */
'use client'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSkyStore } from '@/store/sky'

export default function Hints() {
  const phase = useSkyStore((s) => s.phase)
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (phase !== 'interactive') return
    setShow(true)
    const t = setTimeout(() => setShow(false), 15000)
    return () => clearTimeout(t)
  }, [phase])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="pointer-events-none absolute bottom-24 left-6 z-30 flex flex-col gap-1.5"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 1.5 }}
        >
          <span className="text-[10px] tracking-[0.25em] text-paper/45">
            拖动 旋转 · 滚轮 远近 · WASD 航行 · ESC 返回
          </span>
          <span className="caps-label text-[7.5px] text-mist/45">
            Drag to look · Scroll to zoom · WASD to drift
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
