/**
 * 地支藏干(通行表,子平传统)。
 * 顺序即本气/中气/余气;不存权重数值(V1.5 约定)。
 * 注意:巳藏干采用主流「丙庚戊」(本气丙、中气庚、余气戊)。
 */
import type { HiddenStem } from './types'
import { stemInfo } from './ganzhi'

interface ZangganEntry {
  branchIndex: number
  items: readonly { stemIndex: number; role: '本气' | '中气' | '余气' }[]
}

const TABLE: readonly ZangganEntry[] = [
  { branchIndex: 0, items: [{ stemIndex: 9, role: '本气' }] }, // 子:癸
  { branchIndex: 1, items: [{ stemIndex: 5, role: '本气' }, { stemIndex: 9, role: '中气' }, { stemIndex: 7, role: '余气' }] }, // 丑:己癸辛
  { branchIndex: 2, items: [{ stemIndex: 0, role: '本气' }, { stemIndex: 2, role: '中气' }, { stemIndex: 4, role: '余气' }] }, // 寅:甲丙戊
  { branchIndex: 3, items: [{ stemIndex: 1, role: '本气' }] }, // 卯:乙
  { branchIndex: 4, items: [{ stemIndex: 4, role: '本气' }, { stemIndex: 1, role: '中气' }, { stemIndex: 9, role: '余气' }] }, // 辰:戊乙癸
  { branchIndex: 5, items: [{ stemIndex: 2, role: '本气' }, { stemIndex: 6, role: '中气' }, { stemIndex: 4, role: '余气' }] }, // 巳:丙庚戊
  { branchIndex: 6, items: [{ stemIndex: 3, role: '本气' }, { stemIndex: 5, role: '中气' }] }, // 午:丁己
  { branchIndex: 7, items: [{ stemIndex: 5, role: '本气' }, { stemIndex: 3, role: '中气' }, { stemIndex: 1, role: '余气' }] }, // 未:己丁乙
  { branchIndex: 8, items: [{ stemIndex: 6, role: '本气' }, { stemIndex: 8, role: '中气' }, { stemIndex: 4, role: '余气' }] }, // 申:庚壬戊
  { branchIndex: 9, items: [{ stemIndex: 7, role: '本气' }] }, // 酉:辛
  { branchIndex: 10, items: [{ stemIndex: 4, role: '本气' }, { stemIndex: 7, role: '中气' }, { stemIndex: 3, role: '余气' }] }, // 戌:戊辛丁
  { branchIndex: 11, items: [{ stemIndex: 8, role: '本气' }, { stemIndex: 0, role: '中气' }] }, // 亥:壬甲
]

/** 地支藏干(顺序 = 本气/中气/余气) */
export function hiddenStemsOf(branchIndex: number): HiddenStem[] {
  const entry = TABLE.find((e) => e.branchIndex === branchIndex)
  if (!entry) return []
  return entry.items.map((it) => ({ stem: stemInfo(it.stemIndex), role: it.role }))
}
