/**
 * 大运 V1:
 *  - 顺逆:阳年男、阴年女顺行;阴年男、阳年女逆行。
 *  - 起运:顺行取出生后下一个「节」,逆行取出生前上一个「节」。
 *  - 换算:采用常见「三天一岁」口径,即 1 天 = 4 个月,1 小时约 = 5 天。
 *
 * 这是本项目 V1 选定的可复现传统算法口径;不同流派对起运取整、
 * 起运日期折算、真太阳时等有差异,后续如支持需显式分支,不可混用。
 */
import { branchInfo, stemInfo } from './ganzhi'
import { jdOfCst } from './calendar'
import { cycleIndexOf } from './nayin'
import { yearJies } from './solarTerms'
import type { BaziChart, BaziInput, Pillar } from './types'

export type DayunDirection = 'forward' | 'backward'

export interface DayunAge {
  years: number
  months: number
  days: number
  totalMonths: number
}

export interface DayunTermRef {
  name: string
  jd: number
}

export interface DayunStep {
  sequence: number
  pillar: Pillar
  direction: DayunDirection
  startAge: DayunAge
  endAge: DayunAge
  startDate: { year: number; month: number; day: number }
  endDate: { year: number; month: number; day: number }
}

export interface DayunChart {
  direction: DayunDirection
  sourceMonthPillar: Pillar
  targetTerm: DayunTermRef
  birthJd: number
  daysToTerm: number
  startAge: DayunAge
  steps: DayunStep[]
}

const DAYUN_COUNT = 8
const MONTHS_PER_DAY = 4

/** 阳年男、阴年女顺;阴年男、阳年女逆。年干阴阳取现有 BAZI 年柱。 */
export function dayunDirectionOf(input: BaziInput, chart: BaziChart): DayunDirection {
  const yearStemIsYang = chart.pillars[0].stem.yinYang === '阳'
  return (yearStemIsYang && input.gender === 'male') || (!yearStemIsYang && input.gender === 'female')
    ? 'forward'
    : 'backward'
}

function surroundingJies(year: number): DayunTermRef[] {
  const out: DayunTermRef[] = []
  for (let y = year - 1; y <= year + 1; y++) {
    for (const { def, jd } of yearJies(y)) out.push({ name: def.name, jd })
  }
  return out.sort((a, b) => a.jd - b.jd)
}

export function dayunTargetTerm(input: BaziInput, direction: DayunDirection): DayunTermRef {
  const birthJd = jdOfCst(input.year, input.month, input.day, input.hour, input.minute)
  const terms = surroundingJies(input.year)
  const target =
    direction === 'forward'
      ? terms.find((t) => t.jd > birthJd)
      : [...terms].reverse().find((t) => t.jd < birthJd)
  if (!target) throw new Error('无法找到起运所需的前后节气')
  return target
}

/** 三天一岁:真实日差 × 4 = 起运总月数;余数折为传统日数展示。 */
export function dayunStartAgeFromDays(days: number): DayunAge {
  const totalTraditionalDays = Math.max(0, Math.round(days * MONTHS_PER_DAY * 30))
  const years = Math.floor(totalTraditionalDays / 360)
  const remAfterYears = totalTraditionalDays % 360
  const months = Math.floor(remAfterYears / 30)
  const restDays = remAfterYears % 30
  return {
    years,
    months,
    days: restDays,
    totalMonths: years * 12 + months + restDays / 30,
  }
}

function ageAfterYears(age: DayunAge, yearsToAdd: number): DayunAge {
  const totalTraditionalDays = Math.round(age.totalMonths * 30) + yearsToAdd * 360
  const years = Math.floor(totalTraditionalDays / 360)
  const remAfterYears = totalTraditionalDays % 360
  const months = Math.floor(remAfterYears / 30)
  const days = remAfterYears % 30
  return { years, months, days, totalMonths: years * 12 + months + days / 30 }
}

function addAgeToBirth(input: BaziInput, age: DayunAge): { year: number; month: number; day: number } {
  const d = new Date(Date.UTC(input.year, input.month - 1, input.day))
  d.setUTCFullYear(d.getUTCFullYear() + age.years)
  d.setUTCMonth(d.getUTCMonth() + age.months)
  d.setUTCDate(d.getUTCDate() + age.days)
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() }
}

function luckPillarFromMonth(monthPillar: Pillar, direction: DayunDirection, sequence: number): Pillar {
  const monthCycle = cycleIndexOf(monthPillar.stem.index, monthPillar.branch.index)
  const delta = direction === 'forward' ? sequence : -sequence
  const idx = ((monthCycle + delta) % 60 + 60) % 60
  return {
    name: '月柱',
    stem: stemInfo(idx % 10),
    branch: branchInfo(idx % 12),
  }
}

export function computeDayun(input: BaziInput, chart: BaziChart, count = DAYUN_COUNT): DayunChart {
  const direction = dayunDirectionOf(input, chart)
  const birthJd = jdOfCst(input.year, input.month, input.day, input.hour, input.minute)
  const targetTerm = dayunTargetTerm(input, direction)
  const daysToTerm = Math.abs(targetTerm.jd - birthJd)
  const startAge = dayunStartAgeFromDays(daysToTerm)
  const sourceMonthPillar = chart.pillars[1]

  const steps: DayunStep[] = Array.from({ length: count }, (_, i) => {
    const startAgeForStep = ageAfterYears(startAge, i * 10)
    const endAge = ageAfterYears(startAge, (i + 1) * 10)
    return {
      sequence: i + 1,
      pillar: luckPillarFromMonth(sourceMonthPillar, direction, i + 1),
      direction,
      startAge: startAgeForStep,
      endAge,
      startDate: addAgeToBirth(input, startAgeForStep),
      endDate: addAgeToBirth(input, endAge),
    }
  })

  return { direction, sourceMonthPillar, targetTerm, birthJd, daysToTerm, startAge, steps }
}
