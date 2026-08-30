import type { Metadata } from 'next'
import DestinyCards from '@/components/destiny/DestinyCards'

export const metadata: Metadata = {
  title: '问命 · 东方数字天穹',
  description:
    '探索东方传统命理体系:八字、紫微斗数、七政四余。以历史方法与文化文本的视角呈现。',
}

export default function DestinyPage() {
  return (
    <main className="portal-ink fixed inset-0 overflow-hidden text-paper">
      <div className="vignette absolute inset-0 z-10" />
      <div className="grain absolute inset-0 z-10" />
      <DestinyCards />
    </main>
  )
}
