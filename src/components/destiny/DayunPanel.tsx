import { motion } from 'framer-motion'
import type { DayunAge, DayunChart } from '@/lib/bazi'

const EASE = [0.22, 1, 0.36, 1] as const

const pad = (n: number) => String(n).padStart(2, '0')

function ageText(age: DayunAge) {
  const parts = [`${age.years}岁`]
  if (age.months > 0) parts.push(`${age.months}个月`)
  if (age.days > 0) parts.push(`${age.days}日`)
  return parts.join('')
}

function dateText(date: { year: number; month: number; day: number }) {
  return `${date.year}-${pad(date.month)}-${pad(date.day)}`
}

export default function DayunPanel({ dayun }: { dayun: DayunChart }) {
  return (
    <div className="mt-5 border-t border-paper/8 pt-5">
      <div className="flex items-center justify-between">
        <span className="font-serif-cn text-[12px] tracking-[0.3em] text-paper/80">大运</span>
        <span className="caps-label text-[7.5px] text-mist/55">Ten-Year Luck</span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] tracking-[0.15em] text-mist/70">
        <span>
          顺逆 · <span className="text-paper/70">{dayun.direction === 'forward' ? '顺排' : '逆排'}</span>
        </span>
        <span>
          取节 · <span className="text-paper/70">{dayun.targetTerm.name}</span>
        </span>
        <span>
          起运 · <span className="text-paper/70">{ageText(dayun.startAge)}</span>
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
        {dayun.steps.map((step, i) => (
          <motion.div
            key={step.sequence}
            className="border border-paper/8 bg-ink-900/20 px-3 py-3"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.15 + i * 0.05 }}
          >
            <div className="flex items-center justify-between">
              <span className="caps-label text-[7px] text-mist/55">DAYUN {pad(step.sequence)}</span>
              <span className="font-latin text-[9px] text-mist/45">
                {step.startAge.years}-{step.endAge.years}岁
              </span>
            </div>
            <div className="mt-2 flex items-end gap-1.5">
              <span className="font-serif-cn text-[27px] leading-none text-paper">{step.pillar.stem.char}</span>
              <span className="font-serif-cn text-[27px] leading-none text-paper/85">{step.pillar.branch.char}</span>
            </div>
            <div className="mt-2 text-[9px] leading-relaxed tracking-[0.08em] text-mist/60">
              <div>起运 {ageText(step.startAge)}</div>
              <div>{dateText(step.startDate)} 起</div>
            </div>
          </motion.div>
        ))}
      </div>

      <p className="mt-3 text-[9px] leading-relaxed tracking-[0.06em] text-mist/40">
        大运 V1 采用年干阴阳配合性别定顺逆,顺排取出生后下一个节,逆排取出生前上一个节;起运按三天一岁折算。不同流派对取整、真太阳时与起运日期换算存在差异。
      </p>
    </div>
  )
}
