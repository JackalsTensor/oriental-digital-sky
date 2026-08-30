import type { Metadata } from 'next'
import ModulePlaceholder from '@/components/portal/ModulePlaceholder'

export const metadata: Metadata = {
  title: '知识 · 东方数字天穹',
  description: '古籍、星官、二十八宿、古代天文学与历史文化资料。',
}

export default function KnowledgePage() {
  return (
    <ModulePlaceholder
      name="知识"
      en="KNOWLEDGE"
      desc="东方天文学知识库:古籍原文、星官体系、古代天文学史与相关历史文化资料。"
      items={['古籍', '星官', '二十八宿', '古代天文学', '历史文化资料']}
    />
  )
}
