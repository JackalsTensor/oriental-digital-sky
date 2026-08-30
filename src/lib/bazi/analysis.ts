/**
 * 命局分析汇总:月令旺衰 + 日主强弱 + 合冲刑害破。
 * 纯派生层,不改动 computeBaziChart / enrichChart 的任何输出;
 * 供 UI 展示与后续格局/喜用神/大运消费。
 */
import { relationsOf } from './relations'
import { dayMasterStrength } from './strength'
import { monthStrengthOf } from './wangshuai'
import type { BaziAnalysis, EnrichedBaziChart } from './types'

export function analyzeChart(chart: EnrichedBaziChart): BaziAnalysis {
  const monthElement = chart.pillars[1].pillar.branch.wuxing
  return {
    monthStrength: monthStrengthOf(monthElement),
    dayMasterStrength: dayMasterStrength(chart),
    relations: relationsOf(chart),
  }
}
