import type { Metadata } from 'next'
import ModulePlaceholder from '@/components/portal/ModulePlaceholder'

export const metadata: Metadata = {
  title: '卜筮 · 东方数字天穹',
  description: '传统占法体系:六爻、奇门遁甲、梅花易数、大六壬、太乙。以历史方法与文化文本的视角呈现。',
}

export default function DivinationPage() {
  return (
    <ModulePlaceholder
      name="卜筮"
      en="DIVINATION"
      desc="传统占法体系。将以历史方法与文化文本的视角呈现,梳理其源流、方法与文献,不作现代科学论断。"
      items={['六爻', '奇门遁甲', '梅花易数', '大六壬', '太乙']}
    />
  )
}
