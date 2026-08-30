import type { Metadata } from 'next'
import ModulePlaceholder from '@/components/portal/ModulePlaceholder'

export const metadata: Metadata = {
  title: '七政四余 · 命理 · 东方数字天穹',
  description: '以出生时刻的天体位置构建命盘:日月五星、黄道十二宫、天体运行。排盘功能构建中。',
}

export default function QizhengPage() {
  return (
    <ModulePlaceholder
      name="七政四余"
      en="QIZHENG · SEVEN LUMINARIES"
      desc="以出生时刻的天体位置构建命盘。将以历史方法与文化文本的视角呈现其源流、方法与文献,排盘功能正在构建。"
      items={['日月五星', '黄道十二宫', '天体运行']}
      backHref="/destiny"
      backLabel="返回命理"
    />
  )
}
