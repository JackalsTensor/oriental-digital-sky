/**
 * 十二长生:日干在四支的旺衰相位。
 * 阳干顺行、阴干逆行(长生起始支表 + 通用索引公式),非逐格硬编码。
 * 长生起始:甲亥 乙午 丙寅 丁酉 戊寅 己酉 庚巳 辛子 壬申 癸卯。
 */
import type { GrowthPhase } from './types'

export const GROWTH_PHASES: readonly GrowthPhase[] = [
  '长生', '沐浴', '冠带', '临官', '帝旺', '衰', '病', '死', '墓', '绝', '胎', '养',
]

/** 十干长生起始地支索引(0=子 … 11=亥) */
const START: readonly number[] = [11, 6, 2, 9, 2, 9, 5, 0, 8, 3]

/** 某干在某支的十二长生相位 */
export function growthPhaseOf(stemIndex: number, branchIndex: number): GrowthPhase {
  const s = ((stemIndex % 10) + 10) % 10
  const b = ((branchIndex % 12) + 12) % 12
  const yang = s % 2 === 0
  const pos = yang ? (b - START[s] + 12) % 12 : (START[s] - b + 12) % 12
  return GROWTH_PHASES[pos]
}
