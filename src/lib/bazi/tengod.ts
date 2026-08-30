/**
 * 十神:以日干为基准,由五行生克与阴阳推导(纯函数,无硬编码矩阵)。
 *  同五行:同干=比肩,异干=劫财
 *  我生者:同阴阳=食神,异阴阳=伤官
 *  我克者:同阴阳=偏财,异阴阳=正财
 *  克我者:同阴阳=七杀,异阴阳=正官
 *  生我者:同阴阳=偏印,异阴阳=正印
 */
import type { TenGod, Wuxing } from './types'
import { stemInfo } from './ganzhi'

/** 五行相生:木→火→土→金→水 */
export const WUXING_GENERATES: Record<Wuxing, Wuxing> = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' }
/** 五行相克:木克土,土克水,水克火,火克金,金克木 */
export const WUXING_CONTROLS: Record<Wuxing, Wuxing> = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' }

/** other 干相对 day 干(日主)的十神 */
export function tenGodOf(dayStemIndex: number, otherStemIndex: number): TenGod {
  const day = stemInfo(dayStemIndex)
  const other = stemInfo(otherStemIndex)
  if (other.index === day.index) return '比肩'
  if (other.wuxing === day.wuxing) return '劫财' // 同五行两天干阴阳必相反
  if (WUXING_GENERATES[day.wuxing] === other.wuxing) {
    return other.yinYang === day.yinYang ? '食神' : '伤官'
  }
  if (WUXING_CONTROLS[day.wuxing] === other.wuxing) {
    return other.yinYang === day.yinYang ? '偏财' : '正财'
  }
  if (WUXING_CONTROLS[other.wuxing] === day.wuxing) {
    return other.yinYang === day.yinYang ? '七杀' : '正官'
  }
  return other.yinYang === day.yinYang ? '偏印' : '正印'
}
