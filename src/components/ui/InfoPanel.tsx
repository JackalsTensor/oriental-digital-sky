/**
 * 信息面板:星宿详情 / 四象概览 / 北斗。
 * 层级展开(手风琴),极简玻璃质感。
 */
'use client'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { focusTarget, useSkyStore } from '@/store/sky'
import { MANSIONS, QUADRANT_MANSIONS } from '@/data/mansions'
import { QUADRANTS } from '@/data/quadrants'
import { DIPPER, DIPPER_COMPANION, DIPPER_INFO, POLARIS } from '@/data/dipper'

const EASE = [0.22, 1, 0.36, 1] as const
const CN_NUM = ['一', '二', '三', '四', '五', '六', '七', '八', '九']

function Section({
  title,
  en,
  defaultOpen = false,
  children,
}: {
  title: string
  en: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="hairline-b">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-3.5 text-left"
      >
        <span className="font-serif-cn text-[13.5px] tracking-[0.2em] text-paper/90">{title}</span>
        <span className="flex items-center gap-3">
          <span className="caps-label text-[7.5px] text-mist/60">{en}</span>
          <motion.span
            className="text-paper/50"
            animate={{ rotate: open ? 45 : 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            style={{ fontSize: 14, lineHeight: 1 }}
          >
            +
          </motion.span>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="selectable pb-4 text-[12.5px] leading-[1.95] text-paper/70">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-3 py-1.5">
      <span className="w-[68px] shrink-0 text-[10px] tracking-[0.25em] text-mist/70">{label}</span>
      <span className="text-[12.5px] text-paper/85">{value}</span>
    </div>
  )
}

export default function InfoPanel() {
  const selectedMansion = useSkyStore((s) => s.selectedMansion)
  const selectedQuadrant = useSkyStore((s) => s.selectedQuadrant)
  const guideMode = useSkyStore((s) => s.guideMode)
  const selectMansion = useSkyStore((s) => s.selectMansion)
  const close = useSkyStore((s) => s.selectMansion)

  const mansion = selectedMansion ? MANSIONS[selectedMansion] : null
  const quadrant = !mansion && selectedQuadrant ? QUADRANTS[selectedQuadrant] : null
  const showDipper = !mansion && guideMode === 'dipper'

  const open = Boolean(mansion || quadrant || showDipper)

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          key={mansion?.id ?? (quadrant ? `q-${quadrant.id}` : 'dipper')}
          className="glass-panel-soft absolute right-5 top-1/2 z-30 max-h-[76vh] w-[min(348px,88vw)] -translate-y-1/2 overflow-y-auto thin-scrollbar"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          transition={{ duration: 0.55, ease: EASE }}
        >
          <button
            onClick={() => close(null)}
            className="absolute right-4 top-4 z-10 flex h-6 w-6 items-center justify-center text-paper/50 transition-colors duration-300 hover:text-paper"
            aria-label="关闭"
          >
            <span className="text-[15px] leading-none">×</span>
          </button>

          {mansion && (
            <div className="px-6 pb-6 pt-6">
              <div className="flex items-baseline gap-3">
                <h2 className="font-serif-cn text-[34px] font-medium tracking-[0.2em] text-paper">
                  {mansion.name}
                </h2>
                <span className="font-latin text-[11px] tracking-[0.15em] text-mist">
                  {mansion.pinyin}
                </span>
              </div>
              <p className="mt-2 text-[11px] tracking-[0.14em] text-mist/90">
                {QUADRANTS[mansion.quadrant].name.replace(/^(东方|南方|西方|北方)/, '')} · 第
                {CN_NUM[mansion.index - 1]}宿 · {mansion.beast}
              </p>
              <div className="mt-4 h-px w-full bg-paper/10" />

              {/* 摘要(常显,一两句) */}
              <p className="selectable mt-3.5 text-[12px] leading-[1.95] text-paper/65">
                {mansion.astronomy.split('。')[0]}。
              </p>

              {/* 概要(常显) */}
              <div className="py-2.5">
                <Row
                  label="距星"
                  value={
                    <>
                      {mansion.determinative.name}
                      <span className="ml-2 text-[10.5px] text-mist/70">
                        {mansion.determinative.nameEn} · 约{mansion.determinative.mag}等
                      </span>
                    </>
                  }
                />
                <Row label="星官" value={`${mansion.officials} 座(据《步天歌》)`} />
                <Row
                  label="主星"
                  value={
                    <>
                      {mansion.members
                        .filter((m) => m.mag < 2.5)
                        .slice(0, 2)
                        .map((m, i) => (
                          <span key={i}>
                            {i > 0 && <span className="mx-1.5 text-mist/60">·</span>}
                            {m.name}
                            <span className="ml-1 text-[10.5px] text-mist/70">{m.nameEn}</span>
                          </span>
                        ))}
                    </>
                  }
                />
              </div>
              <div className="h-px w-full bg-paper/10" />

              <div className="caps-label py-2 text-[7.5px] text-mist/50">View Details</div>

              <Section title="古代天文学" en="ASTRONOMY">
                {mansion.astronomy}
              </Section>
              <Section title="文化意义" en="CULTURE">
                {mansion.culture}
              </Section>
              {mansion.quote && (
                <Section title="古籍" en="CLASSICS">
                  <span className="font-serif-cn text-[13px] text-paper/85">{mansion.quote.text}</span>
                  <span className="mt-1 block text-[10.5px] text-mist/70">{mansion.quote.source}</span>
                </Section>
              )}

              <p className="mt-4 text-[9.5px] leading-relaxed text-mist/45">
                天文数据基于现代天文学计算;文化内容反映中国古代传统观念。
              </p>
            </div>
          )}

          {quadrant && (
            <div className="px-6 pb-6 pt-6">
              <h2 className="font-serif-cn text-[26px] font-medium tracking-[0.2em] text-paper">
                {quadrant.name}
              </h2>
              <p className="caps-label mt-1.5 text-[8px] text-mist/80">{quadrant.enName}</p>
              <div className="mt-3 flex gap-4 text-[11px] text-mist/85">
                <span>方位 · {quadrant.direction}</span>
                <span>季节 · {quadrant.season}</span>
                <span>五行 · {quadrant.element}</span>
              </div>
              <div className="mt-4 h-px w-full bg-paper/10" />
              <p className="selectable mt-4 text-[12.5px] leading-[2] text-paper/70">
                {quadrant.intro}
              </p>
              <div className="mt-5 grid grid-cols-7 gap-1">
                {QUADRANT_MANSIONS[quadrant.id].map((id) => (
                  <button
                    key={id}
                    onClick={() => {
                      selectMansion(id)
                      focusTarget(id)
                    }}
                    className="flex flex-col items-center gap-1 py-2 transition-colors duration-300 hover:bg-paper/5"
                  >
                    <span className="font-serif-cn text-[15px] text-paper/85">{id}</span>
                    <span className="text-[8px] text-mist/60">{CN_NUM[MANSIONS[id].index - 1]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {showDipper && (
            <div className="px-6 pb-6 pt-6">
              <div className="flex items-baseline gap-3">
                <h2 className="font-serif-cn text-[30px] font-medium tracking-[0.2em] text-paper">
                  北斗七星
                </h2>
                <span className="caps-label text-[8px] text-mist/80">The Northern Dipper</span>
              </div>
              <div className="mt-4 h-px w-full bg-paper/10" />

              <div className="py-3">
                <div className="mb-1 text-[10px] tracking-[0.25em] text-mist/70">斗身 · 斗魁</div>
                <div className="flex gap-2">
                  {DIPPER.slice(0, 4).map((d) => (
                    <div key={d.id} className="flex-1 text-center">
                      <div className="font-serif-cn text-[13px] text-paper/90">{d.name}</div>
                      <div className="mt-0.5 text-[9px] text-mist/60">{d.nameEn}</div>
                    </div>
                  ))}
                </div>
                <div className="mb-1 mt-4 text-[10px] tracking-[0.25em] text-mist/70">斗柄 · 斗杓</div>
                <div className="flex gap-2">
                  {DIPPER.slice(4).map((d) => (
                    <div key={d.id} className="flex-1 text-center">
                      <div className="font-serif-cn text-[13px] text-paper/90">{d.name}</div>
                      <div className="mt-0.5 text-[9px] text-mist/60">{d.nameEn}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between text-[10.5px] text-mist/70">
                  <span>
                    辅星({DIPPER_COMPANION.nameEn}) · 开阳伴星,古人以能否分辨测试目力
                  </span>
                </div>
                <div className="mt-2 text-[10.5px] text-mist/70">
                  北极星({POLARIS.nameEn}) · 天枢、天璇连线延长约五倍所指
                </div>
              </div>
              <div className="h-px w-full bg-paper/10" />

              <Section title="古代天文学" en="ASTRONOMY">
                {DIPPER_INFO.astronomy}
              </Section>
              <Section title="传统文化 · 道教" en="CULTURE">
                {DIPPER_INFO.culture}
              </Section>
              {DIPPER_INFO.quote && (
                <Section title="古籍" en="CLASSICS">
                  <span className="font-serif-cn text-[13px] text-paper/85">{DIPPER_INFO.quote.text}</span>
                  <span className="mt-1 block text-[10.5px] text-mist/70">
                    {DIPPER_INFO.quote.source}
                  </span>
                </Section>
              )}

              <p className="mt-4 text-[10px] tracking-[0.12em] text-gold/70">
                {DIPPER_INFO.hint}
              </p>
              <p className="mt-3 text-[9.5px] leading-relaxed text-mist/45">
                天文数据基于现代天文学计算;文化内容反映中国古代传统观念。
              </p>
            </div>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
