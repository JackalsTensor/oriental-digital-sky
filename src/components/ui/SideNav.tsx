/**
 * 左侧导航:默认隐藏,悬停左缘时滑出。
 * 二十八宿(全景) / 四象 / 北斗 / 全部星宿。
 */
'use client'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { focusDipper, focusTarget, useSkyStore } from '@/store/sky'
import { QUADRANT_ORDER, QUADRANTS, type QuadrantId } from '@/data/quadrants'
import { QUADRANT_MANSIONS, type MansionId } from '@/data/mansions'

export default function SideNav() {
  const phase = useSkyStore((s) => s.phase)
  const selectedQuadrant = useSkyStore((s) => s.selectedQuadrant)
  const selectedMansion = useSkyStore((s) => s.selectedMansion)
  const guideMode = useSkyStore((s) => s.guideMode)
  const selectQuadrant = useSkyStore((s) => s.selectQuadrant)
  const selectMansion = useSkyStore((s) => s.selectMansion)
  const setGuideMode = useSkyStore((s) => s.setGuideMode)
  const [open, setOpen] = useState(false)

  const pickQuadrant = (q: QuadrantId | null) => {
    selectQuadrant(q)
    if (q) {
      // 选四象后镜头缓缓转向该象中心
      const ids = QUADRANT_MANSIONS[q]
      const mid = ids[Math.floor(ids.length / 2)]
      focusTarget(mid)
    }
  }

  const pickMansion = (id: MansionId) => {
    selectMansion(id)
    focusTarget(id)
  }

  const pickOverview = () => {
    selectQuadrant(null)
    selectMansion(null)
    setGuideMode('free')
  }

  const pickDipper = () => {
    setGuideMode('dipper')
    focusDipper()
  }

  if (phase !== 'interactive') return null

  return (
    <div
      className={`absolute left-0 top-0 z-30 flex h-full items-center ${
        open ? 'w-[248px]' : 'w-3'
      }`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* 左缘提示条 */}
      <div
        className={`h-40 w-[3px] transition-opacity duration-500 ${open ? 'opacity-0' : 'opacity-25'}`}
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(233,231,223,0.7), transparent)' }}
      />

      <motion.nav
        className="glass-panel ml-2 flex max-h-[80vh] w-[218px] flex-col overflow-y-auto py-4 thin-scrollbar"
        initial={{ x: -240 }}
        animate={{ x: open ? 0 : -240 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="caps-label px-5 pb-3 text-[8px] text-mist/80">Mansions · 二十八宿</div>

        <NavItem
          label="全景"
          en="OVERVIEW"
          active={selectedQuadrant === null && selectedMansion === null && guideMode === 'free'}
          onClick={pickOverview}
        />

        {QUADRANT_ORDER.map((q) => {
          const d = QUADRANTS[q]
          const active = selectedQuadrant === q
          return (
            <div key={q}>
              <NavItem
                label={d.name.replace('东方', '').replace('南方', '').replace('西方', '').replace('北方', '')}
                en={d.enName.split(' of')[0].toUpperCase()}
                dot={d.color}
                active={active}
                onClick={() => pickQuadrant(active ? null : q)}
              />
              <AnimatePresence initial={false}>
                {active && (
                  <motion.div
                    className="mb-1 mt-0.5 flex flex-wrap gap-x-0 gap-y-1 border-l border-paper/10 pl-4 pr-3"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                  >
                    {QUADRANT_MANSIONS[q].map((id) => (
                      <button
                        key={id}
                        onClick={() => pickMansion(id)}
                        className={`w-1/3 py-1.5 text-center font-serif-cn text-[12px] tracking-[0.3em] transition-colors duration-300 ${
                          selectedMansion === id ? 'text-gold' : 'text-paper/60 hover:text-paper'
                        }`}
                      >
                        {id}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}

        <div className="mx-5 my-2 h-px bg-paper/8" />

        <NavItem
          label="北斗"
          en="NORTHERN DIPPER"
          active={guideMode === 'dipper'}
          onClick={pickDipper}
        />
        <NavItem
          label="全部星宿"
          en="ALL MANSIONS"
          active={selectedQuadrant === null && selectedMansion === null && guideMode === 'free'}
          onClick={pickOverview}
        />
      </motion.nav>
    </div>
  )
}

function NavItem({
  label,
  en,
  active,
  dot,
  onClick,
}: {
  label: string
  en: string
  active?: boolean
  dot?: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`group flex items-center justify-between px-5 py-2.5 text-left transition-colors duration-300 ${
        active ? '' : 'hover:bg-paper/4'
      }`}
    >
      <span className="flex items-center gap-2.5">
        {dot && (
          <span
            className="inline-block h-1.5 w-1.5 rounded-full transition-opacity duration-300"
            style={{ background: dot, opacity: active ? 1 : 0.35 }}
          />
        )}
        <span
          className={`font-serif-cn text-[14px] tracking-[0.25em] transition-colors duration-300 ${
            active ? 'text-gold' : 'text-paper/75 group-hover:text-paper'
          }`}
        >
          {label}
        </span>
      </span>
      <span
        className={`caps-label text-[7px] transition-colors duration-300 ${
          active ? 'text-gold/70' : 'text-mist/50 group-hover:text-mist'
        }`}
      >
        {en}
      </span>
    </button>
  )
}
