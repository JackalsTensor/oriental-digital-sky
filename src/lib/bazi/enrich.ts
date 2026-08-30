/**
 * 命盘派生层汇总:十神 / 地支藏干 / 纳音 / 十二长生。
 * 不改动 computeBaziChart 的四柱与五行输出,仅在其结果之上派生。
 */
import { growthPhaseOf } from './changsheng'
import { cycleIndexOf, nayinOf } from './nayin'
import { tenGodOf } from './tengod'
import { hiddenStemsOf } from './zanggan'
import type { BaziChart, EnrichedBaziChart, EnrichedPillar } from './types'

export function enrichChart(chart: BaziChart): EnrichedBaziChart {
  const dayStemIdx = chart.pillars[2].stem.index
  const pillars = chart.pillars.map((p) => {
    const enriched: EnrichedPillar = {
      pillar: p,
      tenGod: tenGodOf(dayStemIdx, p.stem.index),
      hiddenStems: hiddenStemsOf(p.branch.index).map((hs) => ({
        hs,
        tenGod: tenGodOf(dayStemIdx, hs.stem.index),
      })),
      nayin: nayinOf(cycleIndexOf(p.stem.index, p.branch.index)),
      growthOfDayStem: growthPhaseOf(dayStemIdx, p.branch.index),
    }
    return enriched
  })
  return {
    ...chart,
    dayMaster: chart.pillars[2].stem,
    pillars: [pillars[0], pillars[1], pillars[2], pillars[3]],
  }
}
