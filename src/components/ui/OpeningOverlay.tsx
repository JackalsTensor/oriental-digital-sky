/**
 * 开屏体验:
 *   黑暗中一个极小的光点(3D 中)逐渐变亮,星空缓缓浮现,摄像机后拉。
 *   DOM 层依次呈现:仰观天文 → THE TWENTY-EIGHT MANSIONS → ENTER THE SKY。
 *   点击后淡出进入自由观察。
 */
'use client'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { runtime, useSkyStore } from '@/store/sky'

const EASE = [0.22, 1, 0.36, 1] as const

export default function OpeningOverlay() {
  const phase = useSkyStore((s) => s.phase)
  const enter = useSkyStore((s) => s.enter)
  const [leaving, setLeaving] = useState(false)

  const handleEnter = () => {
    if (phase !== 'opening' || leaving) return
    setLeaving(true)
    runtime.entered = true // 加速 3D 揭示
    setTimeout(() => enter(), 550)
  }

  const show = phase === 'opening'

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="opening"
          className="absolute inset-0 z-50 cursor-pointer"
          onClick={handleEnter}
          animate={leaving ? { opacity: 0 } : { opacity: 1 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          {/* 底部小标 */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            transition={{ delay: 1.0, duration: 2.4, ease: 'easeOut' }}
          >
            <div className="font-serif-cn text-[11px] tracking-[0.5em] text-paper">二十八宿</div>
            <div className="caps-label mt-1 text-[8px] text-mist">The Twenty-Eight Mansions</div>
          </motion.div>

          {/* 序列文字 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {/* 仰观天文 */}
            <motion.div
              className="absolute font-serif-cn text-2xl font-normal tracking-[0.55em] text-paper/85 md:text-[28px]"
              initial={{ opacity: 0, y: 8, letterSpacing: '0.3em' }}
              animate={{ opacity: [0, 0.9, 0.9, 0], y: [8, 0, 0, -10], letterSpacing: ['0.3em', '0.55em', '0.55em', '0.6em'] }}
              transition={{
                duration: 3.8,
                times: [0, 0.22, 0.6, 1],
                ease: 'easeInOut',
                delay: 0.9,
              }}
            >
              仰观天文
            </motion.div>

            {/* 标题 */}
            <motion.div
              className="absolute caps-label text-center text-[13px] text-paper/75 md:text-[15px]"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: [0, 0.8, 0.8, 0], y: [6, 0, 0, -8] }}
              transition={{
                duration: 3.0,
                times: [0, 0.28, 0.62, 1],
                ease: 'easeInOut',
                delay: 3.5,
              }}
            >
              THE TWENTY-EIGHT MANSIONS
            </motion.div>

            {/* 进入按钮 */}
            <motion.div
              className="absolute flex flex-col items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 5.0, duration: 1.1, ease: 'easeOut' }}
            >
              <motion.div
                className="group flex items-center gap-4 border border-paper/25 px-10 py-4 transition-colors duration-500 hover:border-gold/60"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                <span className="caps-label text-[11px] tracking-[0.35em] text-paper/90 group-hover:text-gold">
                  Enter the Sky
                </span>
              </motion.div>
              <motion.div
                className="mt-4 text-[10px] tracking-[0.4em] text-mist/70"
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                点击进入
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
