/**
 * 八字排盘 V1 内容层:
 *  - 输入:公历出生日期/时间(北京时间)、性别、出生地点(文本)
 *  - 排盘:年柱(立春换年)/月柱(节气定月)/日柱(JDN 干支,晚子时换日)/时柱(传统时辰)
 *  - 展示:四柱命盘(天干/地支/五行·阴阳)+ 五行分布
 * 计算与 UI 分离 —— 全部排盘逻辑在 src/lib/bazi(纯函数,锚点校验见 scripts/check-bazi.ts)。
 * 视觉沿用平台设计系统:玻璃面板、serif 中文、低饱和五行色、克制动画。
 */
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { computeBaziChart, MAX_YEAR, MIN_YEAR, validateInput, WUXING_ORDER, type BaziChart as BaziChartData, type Wuxing } from '@/lib/bazi'

const EASE = [0.22, 1, 0.36, 1] as const

const WUXING_COLOR: Record<Wuxing, string> = {
  木: '#8fb8ae',
  火: '#c08a72',
  土: '#c2a05f',
  金: '#b7bcc6',
  水: '#8fa3b8',
}

const pad = (n: number) => String(n).padStart(2, '0')

interface FormState {
  date: string // YYYY-MM-DD
  time: string // HH:mm
  gender: 'male' | 'female'
  place: string
}

export default function BaziChart() {
  const [form, setForm] = useState<FormState>({ date: '', time: '', gender: 'male', place: '' })
  const [chart, setChart] = useState<BaziChartData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const dateParts = form.date ? form.date.split('-').map(Number) : null
  const timeParts = form.time ? form.time.split(':').map(Number) : null
  const dateValid = Boolean(dateParts && dateParts.length === 3 && !Number.isNaN(dateParts[0]))
  const timeValid = Boolean(timeParts && timeParts.length === 2 && !Number.isNaN(timeParts[0]))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!dateParts || !timeParts || !dateValid || !timeValid) return
    const input = {
      year: dateParts[0],
      month: dateParts[1],
      day: dateParts[2],
      hour: timeParts[0],
      minute: timeParts[1] ?? 0,
      gender: form.gender,
      place: form.place.trim(),
    }
    const err = validateInput(input)
    if (err) {
      setError(err.message)
      setChart(null)
      return
    }
    setError(null)
    setChart(computeBaziChart(input))
  }

  const ready = dateValid && timeValid

  return (
    <div className="absolute inset-0 z-20 overflow-y-auto thin-scrollbar">
      <div className="portal-glow" aria-hidden />

      <Link
        href="/destiny"
        className="absolute left-6 top-6 z-30 text-[10px] tracking-[0.25em] text-mist/50 transition-colors duration-300 hover:text-paper"
      >
        ← 命理
      </Link>

      <div className="relative m-auto flex min-h-full w-full flex-col items-center justify-center px-6 py-12">
        {/* 标题区 */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.3, ease: EASE, delay: 0.2 }}
        >
          <p className="caps-label text-[9px] text-mist/60">Celestial Realm · Bazi</p>
          <h1 className="mt-3 font-serif-cn text-[32px] font-medium tracking-[0.4em] text-paper md:text-[36px]">
            八字
          </h1>
          <p className="mt-4 font-serif-cn text-[12px] tracking-[0.3em] text-paper/60">
            从时间中寻找命局
          </p>
        </motion.div>

        <div className="mt-9 h-px w-40 bg-paper/15" />

        {/* 输入面板 */}
        <motion.form
          onSubmit={submit}
          className="glass-panel-soft mt-9 w-full max-w-[620px] px-6 py-6 md:px-8"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, ease: EASE, delay: 0.45 }}
        >
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <label className="flex flex-col gap-2">
              <span className="text-[10px] tracking-[0.25em] text-mist/70">公历出生日期</span>
              <input
                type="date"
                min={`${MIN_YEAR}-01-01`}
                max={`${MAX_YEAR}-12-31`}
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="sky-input w-full"
                aria-label="公历出生日期"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[10px] tracking-[0.25em] text-mist/70">出生时间</span>
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="sky-input w-full"
                aria-label="出生时间"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[10px] tracking-[0.25em] text-mist/70">性别</span>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value as 'male' | 'female' })}
                className="sky-input w-full"
                aria-label="性别"
              >
                <option value="male">男</option>
                <option value="female">女</option>
              </select>
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[10px] tracking-[0.25em] text-mist/70">出生地点</span>
              <input
                type="text"
                value={form.place}
                onChange={(e) => setForm({ ...form, place: e.target.value })}
                placeholder="城市名(记录用)"
                className="sky-input w-full"
                aria-label="出生地点"
              />
            </label>
          </div>

          <p className="mt-4 text-[9.5px] leading-relaxed text-mist/45">
            输入为公历,按北京时间(UTC+8)计算;23:00–23:59 按「子初换日」计入次日(传统排盘规则);地点暂作记录,未做真太阳时换算。
          </p>

          <div className="mt-5 flex flex-col items-center gap-2">
            <button
              type="submit"
              disabled={!ready}
              className={`pointer-events-auto border px-12 py-3 text-[11px] tracking-[0.35em] transition-all duration-500 ${
                ready
                  ? 'border-gold/55 text-gold hover:border-gold hover:bg-gold/8'
                  : 'border-paper/15 text-mist/50'
              }`}
            >
              开始排盘
            </button>
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[10px] tracking-[0.15em] text-verm/80"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.form>

        {/* 排盘结果 */}
        <AnimatePresence>
          {chart && (
            <motion.div
              key="chart"
              className="mt-10 w-full max-w-[620px]"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: EASE }}
            >
              {/* 四柱命盘 */}
              <div className="glass-panel-soft px-6 py-6 md:px-8">
                <div className="flex items-center justify-between">
                  <span className="font-serif-cn text-[13px] tracking-[0.3em] text-paper/85">四柱命盘</span>
                  <span className="caps-label text-[7.5px] text-mist/55">Four Pillars</span>
                </div>

                <div className="mt-5 grid grid-cols-4 gap-2">
                  {chart.pillars.map((p, i) => (
                    <motion.div
                      key={p.name}
                      className="flex flex-col items-center gap-1.5 border border-paper/8 px-1 py-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7, ease: EASE, delay: 0.25 + i * 0.12 }}
                    >
                      <span className="caps-label text-[7.5px] text-mist/55">{p.name}</span>
                      <span
                        className="font-serif-cn text-[34px] leading-none text-paper md:text-[38px]"
                        style={{ textShadow: '0 0 24px rgba(194,160,95,0.25)' }}
                      >
                        {p.stem.char}
                      </span>
                      <span className="font-serif-cn text-[34px] leading-none text-paper/90 md:text-[38px]">
                        {p.branch.char}
                      </span>
                      <span
                        className="text-[9.5px] tracking-[0.2em]"
                        style={{ color: `${WUXING_COLOR[p.stem.wuxing]}b0` }}
                      >
                        {p.stem.yinYang}
                        {p.stem.wuxing} · {p.branch.yinYang}
                        {p.branch.wuxing}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* 五行分布 */}
                <div className="mt-6 border-t border-paper/8 pt-5">
                  <div className="flex items-center justify-between">
                    <span className="font-serif-cn text-[12px] tracking-[0.3em] text-paper/80">五行分布</span>
                    <span className="caps-label text-[7.5px] text-mist/55">Five Elements</span>
                  </div>
                  <div className="mt-4 flex flex-col gap-2.5">
                    {WUXING_ORDER.map((w, i) => {
                      const count = chart.wuxing[w]
                      return (
                        <motion.div
                          key={w}
                          className="flex items-center gap-3"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.6, delay: 0.7 + i * 0.08 }}
                        >
                          <span
                            className="w-6 font-serif-cn text-[13px]"
                            style={{ color: WUXING_COLOR[w] }}
                          >
                            {w}
                          </span>
                          <div className="h-[3px] flex-1 overflow-hidden bg-paper/8">
                            <motion.div
                              className="h-full"
                              style={{ background: `${WUXING_COLOR[w]}90` }}
                              initial={{ width: 0 }}
                              animate={{ width: `${(count / 8) * 100}%` }}
                              transition={{ duration: 1.0, ease: EASE, delay: 0.8 + i * 0.08 }}
                            />
                          </div>
                          <span className="w-4 text-right font-latin text-[10.5px] text-mist/75">{count}</span>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* 排盘信息与免责声明 */}
              <p className="mt-4 text-center text-[9.5px] leading-relaxed tracking-[0.06em] text-mist/40">
                排盘基于公历 {chart.effectiveDate.year}-{pad(chart.effectiveDate.month)}-
                {pad(chart.effectiveDate.day)} 日柱(晚子时已换日)· 节气时刻精度约 ±15 分钟 · 本系统用于传统命理文化研究与数字化体验,排盘结果仅供文化研究与娱乐参考,不构成医疗、法律、投资或其他专业建议。
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
