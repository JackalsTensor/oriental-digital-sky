/**
 * 四柱排盘核心:
 *  - 年柱:立春换年
 *  - 月柱:十二「节」定月(立春…大雪 + 次年小寒),五虎遁起月干
 *  - 日柱:儒略日序数干支(晚子时换日)
 *  - 时柱:传统时辰,五鼠遁起时干
 * 输入为公历北京时间(UTC+8);地点为文本记录,未做真太阳时换算。
 */
import { branchInfo, dayCycleIndex, hourBranchIndex, hourStemIndex, monthStemIndex, stemInfo, yearCycleIndex } from './ganzhi'
import { effectiveDate, isValidDate, jdOfCst, jdnOf } from './calendar'
import { yearJies } from './solarTerms'
import type { BaziChart, BaziInput, Pillar, Wuxing } from './types'

/** 五行顺序(展示用) */
export const WUXING_ORDER: Wuxing[] = ['木', '火', '土', '金', '水']

export interface BaziError {
  code: 'invalid-date' | 'out-of-range'
  message: string
}

/** 输入支持的公历年份范围 */
export const MIN_YEAR = 1900
export const MAX_YEAR = 2100

/** 输入校验(返回错误信息或 null) */
export function validateInput(input: BaziInput): BaziError | null {
  if (input.year < MIN_YEAR || input.year > MAX_YEAR)
    return { code: 'out-of-range', message: `公历年份需在 ${MIN_YEAR}–${MAX_YEAR} 之间` }
  if (!isValidDate(input.year, input.month, input.day))
    return { code: 'invalid-date', message: '日期无效,请检查公历出生日期' }
  if (input.hour < 0 || input.hour > 23 || input.minute < 0 || input.minute > 59)
    return { code: 'invalid-date', message: '时间无效,请检查出生时间' }
  return null
}

/** 四柱排盘(输入须先通过 validateInput) */
export function computeBaziChart(input: BaziInput): BaziChart {
  // 晚子时换日:日柱与年/月边界均按换日后的日期判定
  const eff = effectiveDate(input.year, input.month, input.day, input.hour)
  const jd = jdOfCst(input.year, input.month, input.day, input.hour, input.minute)

  // 年柱:立春换年
  const lichunJd = yearJies(input.year)[0].jd
  const baziYear = jd >= lichunJd ? input.year : input.year - 1
  const yearIdx = yearCycleIndex(baziYear)
  const yearStem = stemInfo(yearIdx % 10)
  const yearBranch = branchInfo(yearIdx % 12)

  // 月柱:在立春(baziYear)…大雪(baziYear)+ 小寒(baziYear+1) 的十二节中取最近已过的节
  const jies = [...yearJies(baziYear).slice(0, 11), yearJies(baziYear + 1)[11]]
  let monthDef = jies[0].def
  for (const { def, jd: jieJd } of jies) {
    if (jieJd <= jd) monthDef = def
    else break
  }
  const monthStem = stemInfo(monthStemIndex(yearIdx % 10, monthDef.monthNumber))
  const monthBranch = branchInfo(monthDef.monthBranch)

  // 日柱:JDN 干支
  const jdn = jdnOf(eff.year, eff.month, eff.day)
  const dayIdx = dayCycleIndex(jdn)
  const dayStem = stemInfo(dayIdx % 10)
  const dayBranch = branchInfo(dayIdx % 12)

  // 时柱:时辰 + 五鼠遁
  const hBranchIdx = hourBranchIndex(input.hour)
  const hourStem = stemInfo(hourStemIndex(dayIdx % 10, hBranchIdx))
  const hourBranch = branchInfo(hBranchIdx)

  const pillars: [Pillar, Pillar, Pillar, Pillar] = [
    { name: '年柱', stem: yearStem, branch: yearBranch },
    { name: '月柱', stem: monthStem, branch: monthBranch },
    { name: '日柱', stem: dayStem, branch: dayBranch },
    { name: '时柱', stem: hourStem, branch: hourBranch },
  ]

  // 五行统计(八字共 8 字)
  const wuxing: Record<Wuxing, number> = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 }
  for (const p of pillars) {
    wuxing[p.stem.wuxing]++
    wuxing[p.branch.wuxing]++
  }

  return { pillars, wuxing, effectiveDate: eff }
}
