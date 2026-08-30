/**
 * 干支基础:六十甲子、天干地支的五行与阴阳、五虎遁(月干)与五鼠遁(时干)。
 * 全部为纯函数,不依赖 UI。
 */
import type { BranchInfo, StemInfo, Wuxing, YinYang } from './types'

export const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const

export const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const

const STEM_WUXING: Wuxing[] = ['木', '木', '火', '火', '土', '土', '金', '金', '水', '水']
const STEM_YINYANG: YinYang[] = ['阳', '阴', '阳', '阴', '阳', '阴', '阳', '阴', '阳', '阴']

const BRANCH_WUXING: Wuxing[] = ['水', '土', '木', '木', '土', '火', '火', '土', '金', '金', '土', '水']
const BRANCH_YINYANG: YinYang[] = ['阳', '阴', '阳', '阴', '阳', '阴', '阳', '阴', '阳', '阴', '阳', '阴']

/** 六十甲子第 index 个的干支(0 = 甲子) */
export function ganzhiOf(index: number): { stemIndex: number; branchIndex: number } {
  const i = ((index % 60) + 60) % 60
  return { stemIndex: i % 10, branchIndex: i % 12 }
}

export function stemInfo(index: number): StemInfo {
  const i = ((index % 10) + 10) % 10
  return { char: STEMS[i], index: i, wuxing: STEM_WUXING[i], yinYang: STEM_YINYANG[i] }
}

export function branchInfo(index: number): BranchInfo {
  const i = ((index % 12) + 12) % 12
  return { char: BRANCHES[i], index: i, wuxing: BRANCH_WUXING[i], yinYang: BRANCH_YINYANG[i] }
}

/** 公历年(1 = 公元 1 年)的干支年序号,0 = 甲子(1984 年 = 甲子) */
export function yearCycleIndex(year: number): number {
  return ((year - 4) % 60 + 60) % 60
}

/**
 * 日柱干支序号:儒略日序数(JDN,当日正午 UT)换干支日。
 * 已验证锚点:JDN 2415021(1900-01-01)= 甲戌;2433191(1949-10-01)= 甲子;2451545(2000-01-01)= 戊午。
 */
export function dayCycleIndex(jdn: number): number {
  return (((jdn + 49) % 60) + 60) % 60
}

/**
 * 五虎遁:由年干与月支求月干。
 * 寅月(立春后)起:甲己之年丙作首;monthNumber 0 = 寅月 … 11 = 丑月。
 */
export function monthStemIndex(yearStemIndex: number, monthNumber: number): number {
  const first = (2 + 2 * (yearStemIndex % 5)) % 10
  return (first + ((monthNumber % 12) + 12) % 12) % 10
}

/**
 * 五鼠遁:由日干与时支求时干。
 * 子时起:甲己还加甲;hourBranchIndex 0 = 子 … 11 = 亥。
 */
export function hourStemIndex(dayStemIndex: number, hourBranchIndex: number): number {
  return ((dayStemIndex % 5) * 2 + hourBranchIndex) % 10
}

/** 时辰地支:子 23:00–00:59,丑 01:00–02:59 … 亥 21:00–22:59 */
export function hourBranchIndex(hour: number): number {
  return Math.floor(((hour + 1) % 24) / 2)
}
