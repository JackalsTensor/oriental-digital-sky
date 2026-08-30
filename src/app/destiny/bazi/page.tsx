import type { Metadata } from 'next'
import ModulePlaceholder from '@/components/portal/ModulePlaceholder'

export const metadata: Metadata = {
  title: '八字 · 问命 · 东方数字天穹',
  description: '以出生时间建立四柱命局:天干地支、四柱五行、大运流年。排盘功能构建中。',
}

export default function BaziPage() {
  return (
    <ModulePlaceholder
      name="八字"
      en="BAZI · FOUR PILLARS"
      desc="以出生时间建立四柱命局。将以历史方法与文化文本的视角呈现其源流、方法与文献,排盘功能正在构建。"
      items={['天干地支', '四柱五行', '大运流年']}
      backHref="/destiny"
      backLabel="返回问命"
    />
  )
}
