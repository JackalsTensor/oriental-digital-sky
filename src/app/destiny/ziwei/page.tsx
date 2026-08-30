import type { Metadata } from 'next'
import ModulePlaceholder from '@/components/portal/ModulePlaceholder'

export const metadata: Metadata = {
  title: '紫微斗数 · 命理 · 东方数字天穹',
  description: '以命宫与星曜体系解析人生结构:十二宫、紫微星曜、四化。排盘功能构建中。',
}

export default function ZiweiPage() {
  return (
    <ModulePlaceholder
      name="紫微斗数"
      en="ZIWEI · PURPLE STAR"
      desc="以命宫与星曜体系解析人生结构。将以历史方法与文化文本的视角呈现其源流、方法与文献,排盘功能正在构建。"
      items={['十二宫', '紫微星曜', '四化']}
      backHref="/destiny"
      backLabel="返回命理"
    />
  )
}
