/**
 * 底部时间轴(古代 → 现代)与时间/地点面板。
 * 拖动年份 → 天球连续转动(周日运动 + 岁差),星空随之改变。
 */
'use client'
import { AnimatePresence, motion } from 'framer-motion'
import { useSkyStore } from '@/store/sky'
import { SITES } from '@/data/sites'

const pad = (n: number) => String(n).padStart(2, '0')
const EASE = [0.22, 1, 0.36, 1] as const

const MIN_YEAR = -2500
const MAX_YEAR = 2100

const yearLabel = (y: number) => (y < 0 ? `前${-y}年` : `${y}年`)

export default function Timeline() {
  const phase = useSkyStore((s) => s.phase)
  const time = useSkyStore((s) => s.time)
  const site = useSkyStore((s) => s.site)
  const setTime = useSkyStore((s) => s.setTime)
  const setSite = useSkyStore((s) => s.setSite)
  const panelOpen = useSkyStore((s) => s.timePanelOpen)
  const setTimePanel = useSkyStore((s) => s.setTimePanel)

  if (phase !== 'interactive') return null

  return (
    <div className="absolute inset-x-0 bottom-0 z-30 flex flex-col items-center pb-5">
      {/* 时间/地点面板 */}
      <AnimatePresence>
        {panelOpen && (
          <motion.div
            className="glass-panel-soft mb-3 w-[min(560px,92vw)] px-6 py-5"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <div className="flex items-center justify-between">
              <span className="font-serif-cn text-[14px] tracking-[0.25em] text-paper/90">
                观测地点
              </span>
              <button
                onClick={() => setTimePanel(false)}
                className="text-paper/50 transition-colors hover:text-paper"
              >
                ×
              </button>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-1.5 md:grid-cols-5">
              {SITES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSite(s)}
                  title={s.note}
                  className={`px-2 py-1.5 text-[11.5px] tracking-[0.1em] transition-colors duration-300 ${
                    site.id === s.id
                      ? 'border border-gold/60 bg-gold/8 text-gold'
                      : 'border border-paper/10 text-paper/65 hover:border-paper/25 hover:text-paper'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
            {/* 自定义经纬度 */}
            <CustomCoord site={site} setSite={setSite} />

            <div className="mt-4 h-px w-full bg-paper/10" />
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3">
              <span className="font-serif-cn text-[14px] tracking-[0.25em] text-paper/90">时间</span>
              <label className="flex items-center gap-1.5 text-[10px] text-mist/70">
                月
                <select
                  className="sky-input"
                  value={time.month}
                  onChange={(e) => setTime({ ...time, month: Number(e.target.value) })}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-1.5 text-[10px] text-mist/70">
                日
                <input
                  className="sky-input w-[52px]"
                  type="number"
                  min={1}
                  max={31}
                  value={time.day}
                  onChange={(e) =>
                    setTime({ ...time, day: Math.min(31, Math.max(1, Number(e.target.value) || 1)) })
                  }
                />
              </label>
              <label className="flex items-center gap-1.5 text-[10px] text-mist/70">
                时
                <input
                  className="sky-slider w-[90px]"
                  type="range"
                  min={0}
                  max={23}
                  step={1}
                  value={time.hour}
                  onChange={(e) => setTime({ ...time, hour: Number(e.target.value) })}
                />
                <span className="font-latin text-[10.5px] text-paper/80">{pad(time.hour)}</span>
              </label>
              <label className="flex items-center gap-1.5 text-[10px] text-mist/70">
                分
                <input
                  className="sky-input w-[48px]"
                  type="number"
                  min={0}
                  max={59}
                  value={time.minute}
                  onChange={(e) =>
                    setTime({ ...time, minute: Math.min(59, Math.max(0, Number(e.target.value) || 0)) })
                  }
                />
              </label>
            </div>
            <p className="mt-3 text-[9.5px] leading-relaxed text-mist/45">
              时间按观测地地方时计算;年份采用天文纪年(0 = 前1年)。星空旋转包含周日运动与岁差。
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 时间轴 */}
      <motion.div
        className="glass-panel-soft w-[min(620px,94vw)] px-6 pb-3.5 pt-3"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, ease: EASE, delay: 0.5 }}
      >
        <div className="flex items-center gap-4">
          <span className="caps-label text-[7.5px] text-mist/50">古代</span>
          <input
            className="sky-slider flex-1"
            type="range"
            min={MIN_YEAR}
            max={MAX_YEAR}
            step={1}
            value={time.year}
            onChange={(e) => setTime({ ...time, year: Number(e.target.value) })}
            aria-label="年份"
          />
          <span className="caps-label text-[7.5px] text-mist/50">现代</span>
        </div>
        <div className="mt-1.5 flex items-baseline justify-between">
          <span className="font-serif-cn text-[15px] font-medium tracking-[0.18em] text-gold/95">
            {yearLabel(time.year)}
          </span>
          <button
            onClick={() => setTimePanel(!panelOpen)}
            className="font-latin text-[10px] tracking-[0.08em] text-mist/80 transition-colors duration-300 hover:text-paper"
          >
            {site.name} · {yearLabel(time.year).replace('年', '')}-{pad(time.month)}-{pad(time.day)}{' '}
            {pad(time.hour)}:{pad(time.minute)}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function CustomCoord({
  site,
  setSite,
}: {
  site: { lat: number; lon: number }
  setSite: (s: (typeof SITES)[number]) => void
}) {
  return (
    <div className="mt-3 flex items-center gap-2 text-[10px] text-mist/70">
      <span>自定义:</span>
      <span className="flex items-center gap-1.5">
        纬度
        <input
          className="sky-input w-[64px]"
          type="number"
          step="0.01"
          min={-90}
          max={90}
          defaultValue={site.lat.toFixed(2)}
          onBlur={(e) => {
            const lat = Number(e.target.value)
            if (!Number.isNaN(lat) && lat >= -90 && lat <= 90)
              setSite({ ...site, id: 'custom', name: '自定义', lat, lon: site.lon })
          }}
        />
        经度
        <input
          className="sky-input w-[64px]"
          type="number"
          step="0.01"
          min={-180}
          max={180}
          defaultValue={site.lon.toFixed(2)}
          onBlur={(e) => {
            const lon = Number(e.target.value)
            if (!Number.isNaN(lon) && lon >= -180 && lon <= 180)
              setSite({ ...site, id: 'custom', name: '自定义', lat: site.lat, lon })
          }}
        />
      </span>
    </div>
  )
}
