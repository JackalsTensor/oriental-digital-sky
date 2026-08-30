/**
 * 一级模块占位页(规划中)。
 * 仅呈现模块职责与未来内容边界,不实现任何功能。
 */
import Link from 'next/link'

interface PlaceholderProps {
  name: string
  en: string
  desc: string
  items: string[]
  /** 返回目标(默认:门户 /) */
  backHref?: string
  /** 返回按钮文案(默认:返回门户) */
  backLabel?: string
}

export default function ModulePlaceholder({
  name,
  en,
  desc,
  items,
  backHref = '/',
  backLabel = '返回门户',
}: PlaceholderProps) {
  return (
    <main className="fixed inset-0 overflow-hidden bg-ink-950 text-paper">
      <div className="vignette absolute inset-0 z-10" />
      <div className="grain absolute inset-0 z-10" />

      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6">
        <p className="caps-label text-[9px] text-mist/60">{en}</p>
        <h1 className="mt-3 font-serif-cn text-[30px] font-medium tracking-[0.35em] text-paper">
          {name}
        </h1>
        <span className="mt-4 border border-paper/20 px-3 py-1 text-[10px] tracking-[0.3em] text-mist/80">
          规划中
        </span>
        <div className="mt-8 h-px w-40 bg-paper/15" />
        <p className="mt-6 max-w-[420px] text-center text-[12px] leading-[2] text-mist/80">
          {desc}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {items.map((it) => (
            <span key={it} className="text-[11px] tracking-[0.18em] text-paper/55">
              {it}
            </span>
          ))}
        </div>
        <Link
          href={backHref}
          className="glass-panel mt-12 px-8 py-3 text-[10.5px] tracking-[0.3em] text-paper/70 transition-colors duration-500 hover:border-gold/40 hover:text-gold"
        >
          {backLabel}
        </Link>
      </div>
    </main>
  )
}
