import SkyClient from '@/components/universe/SkyClient'
import TopBar from '@/components/ui/TopBar'
import SideNav from '@/components/ui/SideNav'
import InfoPanel from '@/components/ui/InfoPanel'
import Timeline from '@/components/ui/Timeline'
import HoverLabel from '@/components/ui/HoverLabel'
import Hints from '@/components/ui/Hints'
import OpeningOverlay from '@/components/ui/OpeningOverlay'
import EdgeCardinals from '@/components/ui/EdgeCardinals'
import FocusLabel from '@/components/ui/FocusLabel'

export default function ObservePage() {
  return (
    <main className="fixed inset-0 overflow-hidden bg-ink-950 text-paper">
      <SkyClient />
      <div className="vignette absolute inset-0 z-10" />
      <div className="grain absolute inset-0 z-10" />
      <OpeningOverlay />
      <TopBar />
      <SideNav />
      <InfoPanel />
      <Timeline />
      <HoverLabel />
      <FocusLabel />
      <EdgeCardinals />
      <Hints />
    </main>
  )
}
