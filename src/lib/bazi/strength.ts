/**
 * 日主强弱 —— 通行简化打分模型之一(非唯一标准,UI 已声明)。
 *  帮扶方 = 比肩/劫财 + 偏印/正印;克泄方 = 正官/七杀 + 正财/偏财 + 食神/伤官。
 *  计分:柱干 1.0;支藏干 本气 1.0 / 中气 0.5 / 余气 0.3;月支藏干再 ×1.5(得令体现);
 *  日干自身为基准不计。
 *  score = Σ帮扶 − Σ克泄。
 *  等级带(镜像对称):≥3.5 强,[2,3.5) 偏强,(−2,2) 中和,(−3.5,−2] 偏弱,≤−3.5 弱。
 *  权重集中为常量表,可调整;factors 明细供 UI 与后续喜用神复用。
 */
import type { DayMasterStrength, EnrichedBaziChart, StrengthFactor, StrengthLevel, TenGod } from './types'

/** 柱干权重 */
export const STEM_WEIGHT = 1
/** 支藏干权重 */
export const HIDDEN_WEIGHT: Record<'本气' | '中气' | '余气', number> = { 本气: 1, 中气: 0.5, 余气: 0.3 }
/** 月令乘数(得令体现) */
export const MONTH_MULTIPLIER = 1.5

const HELPING: TenGod[] = ['比肩', '劫财', '偏印', '正印']

export function strengthLevelOf(score: number): StrengthLevel {
  if (score >= 3.5) return '强'
  if (score >= 2) return '偏强'
  if (score > -2) return '中和'
  if (score > -3.5) return '偏弱'
  return '弱'
}

export function dayMasterStrength(chart: EnrichedBaziChart): DayMasterStrength {
  const monthBranchWuxing = chart.pillars[1].pillar.branch.wuxing
  const isCommanding = monthBranchWuxing === chart.dayMaster.wuxing

  let score = 0
  const factors: StrengthFactor[] = []

  chart.pillars.forEach((p, idx) => {
    const isMonth = idx === 1
    const isDay = idx === 2
    const sign = (kind: '帮扶' | '克泄') => (kind === '帮扶' ? 1 : -1)

    // 柱干(日干自身不计)
    if (!isDay) {
      const kind = HELPING.includes(p.tenGod) ? '帮扶' : '克泄'
      const w = sign(kind) * STEM_WEIGHT
      score += w
      factors.push({ label: `${p.pillar.name}干 ${p.pillar.stem.char}(${p.tenGod})`, kind, weight: w, source: p.pillar.name })
    }

    // 支藏干(月支 ×1.5)
    for (const { hs, tenGod } of p.hiddenStems) {
      const kind = HELPING.includes(tenGod) ? '帮扶' : '克泄'
      const mult = isMonth ? MONTH_MULTIPLIER : 1
      const w = sign(kind) * HIDDEN_WEIGHT[hs.role] * mult
      score += w
      factors.push({
        label: `${p.pillar.name}支藏${hs.stem.char}(${hs.role},${tenGod})${isMonth ? ' ×1.5' : ''}`,
        kind,
        weight: w,
        source: isMonth ? '月令加成' : p.pillar.name,
      })
    }
  })

  return { score, level: strengthLevelOf(score), factors, isCommanding }
}
