/**
 * 五行旺衰:月令旺相休囚死(通用公式,非逐格硬表)。
 *  当令者旺;令生者相;生令者休;克令者囚;令克者死。
 * 月支五行以本气论(寅卯木、巳午火、辰戌丑未土、申酉金、亥子水);
 * 土月司令分野等过渡细分不在本轮范围(页面已声明边界)。
 */
import type { WangShuai, Wuxing } from './types'
import { WUXING_CONTROLS, WUXING_GENERATES } from './tengod'

function strengthOf(monthElement: Wuxing, e: Wuxing): WangShuai {
  if (e === monthElement) return '旺'
  if (WUXING_GENERATES[monthElement] === e) return '相'
  if (WUXING_GENERATES[e] === monthElement) return '休'
  if (WUXING_CONTROLS[e] === monthElement) return '囚'
  return '死' // WUXING_CONTROLS[monthElement] === e
}

/** 月令五行对五元素的旺相休囚死全映射 */
export function monthStrengthOf(monthElement: Wuxing): Record<Wuxing, WangShuai> {
  return {
    木: strengthOf(monthElement, '木'),
    火: strengthOf(monthElement, '火'),
    土: strengthOf(monthElement, '土'),
    金: strengthOf(monthElement, '金'),
    水: strengthOf(monthElement, '水'),
  }
}
