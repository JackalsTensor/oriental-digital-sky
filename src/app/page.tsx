import type { Metadata } from 'next'
import PortalSky from '@/components/portal/PortalSky'
import PortalCards from '@/components/portal/PortalCards'

export const metadata: Metadata = {
  title: '东方数字天穹 · Celestial Realm',
  description:
    '东方传统宇宙观数字平台:观星、问命、卜筮、知识。天文事实、历史文化与传统术数,分层呈现。',
}

export default function Home() {
  return (
    <main className="portal-ink fixed inset-0 overflow-hidden text-paper">
      <PortalSky />
      <div className="vignette absolute inset-0 z-10" />
      <div className="grain absolute inset-0 z-10" />
      <PortalCards />
    </main>
  )
}
