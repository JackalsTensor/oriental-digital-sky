import type { Metadata } from 'next'
import BaziChart from '@/components/destiny/BaziChart'

export const metadata: Metadata = {
  title: '八字 · 命理 · 东方数字天穹',
  description:
    '八字排盘:以公历出生时间建立四柱命局(年柱立春换年、月柱节气定月、日柱干支、时柱时辰),呈现天干地支与五行分布。以历史方法与文化文本定位。',
}

export default function BaziPage() {
  return (
    <main className="portal-ink fixed inset-0 overflow-hidden text-paper">
      <div className="vignette absolute inset-0 z-10" />
      <div className="grain absolute inset-0 z-10" />
      <BaziChart />
    </main>
  )
}
