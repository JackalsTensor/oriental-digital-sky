/**
 * 命理体系选择页内容层:标题 + 三张体系卡片(八字 / 紫微斗数 / 七政四余)+ 天球背环。
 * 与首页同属一个视觉系统,但独立成章 —— 纯 CSS 深空底 + 极慢天球背环 + 每卡独有母题:
 *  - 八字:四柱竖柱(天干/地支两刻,极慢浮沉)—— 从时间中寻找命局
 *  - 紫微斗数:十二宫环(十二刻度 + 内环 + 紫微星,极慢旋转)—— 从星曜中观见命宫
 *  - 七政四余:日月双环轨道 + 行星点(正反极慢旋转)—— 从天体运行观测命运
 * hover:卡片轻浮、边缘光增强、母题提亮、背景光晕随体系色微变。
 * 静 → 动:入场依次浮现;环境只有极慢旋转与呼吸,无夸张动效。
 */
'use client'
import { useState, type CSSProperties, type ReactNode } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const EASE = [0.22, 1, 0.36, 1] as const

/** 四柱母题:四根竖柱,每柱带天干/地支两刻,底部一横为地基 */
const PillarMotif: ReactNode = (
  <svg viewBox="0 0 120 120" className="destiny-motif h-full w-auto" aria-hidden>
    <g className="destiny-bob">
      {[28, 52, 76, 100].map((x) => (
        <g key={x}>
          <line x1={x} y1="30" x2={x} y2="86" className="motif-line" />
          <line x1={x - 6} y1="34" x2={x + 6} y2="34" className="motif-line" />
          <line x1={x - 6} y1="82" x2={x + 6} y2="82" className="motif-line" />
        </g>
      ))}
      <line x1="20" y1="94" x2="108" y2="94" className="motif-line" />
    </g>
  </svg>
)

/** 十二宫母题:外环十二刻(四正刻更长)+ 内环 + 中央紫微星 */
const PalaceMotif: ReactNode = (
  <svg viewBox="0 0 120 120" className="destiny-motif h-full w-auto" aria-hidden>
    <g className="destiny-rotate">
      <circle cx="60" cy="60" r="38" className="motif-line" />
      <circle cx="60" cy="60" r="22" className="motif-line" opacity="0.45" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2
        const r1 = i % 3 === 0 ? 33 : 36
        return (
          <line
            key={i}
            x1={60 + Math.cos(a) * r1}
            y1={60 + Math.sin(a) * r1}
            x2={60 + Math.cos(a) * 38}
            y2={60 + Math.sin(a) * 38}
            className="motif-line"
          />
        )
      })}
      <circle cx="60" cy="60" r="2.2" className="motif-dot" />
    </g>
  </svg>
)

/** 七政母题:黄道大环 + 倾斜月道,日月行星两点随环极慢运行(内外反向) */
const OrbitMotif: ReactNode = (
  <svg viewBox="0 0 120 120" className="destiny-motif h-full w-auto" aria-hidden>
    <g className="destiny-rotate">
      <circle cx="60" cy="60" r="40" className="motif-line" />
      <ellipse cx="60" cy="60" rx="30" ry="12" className="motif-line" />
      <circle cx="100" cy="60" r="3" className="motif-dot" />
      <circle cx="23" cy="57" r="2" className="motif-dot" />
    </g>
    <g className="destiny-rotate-rev">
      <ellipse cx="60" cy="60" rx="13" ry="34" className="motif-line" />
      <circle cx="60" cy="27" r="2" className="motif-dot" />
    </g>
    <circle cx="60" cy="60" r="2.2" className="motif-dot" />
  </svg>
)

/** 天球背环:圆心置于屏幕下方,双环巨弧横扫画面上部 + 十二刻,极慢旋转 */
function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-1/2 top-[950px] h-[1500px] w-[1500px] -translate-x-1/2 -translate-y-1/2 opacity-[0.05]">
        <svg viewBox="0 0 1500 1500" className="h-full w-full">
          <g className="destiny-rotate-slower">
            <circle cx="750" cy="750" r="740" className="motif-line" stroke="rgba(233,231,223,0.8)" />
            <circle cx="750" cy="750" r="590" className="motif-line" stroke="rgba(233,231,223,0.55)" />
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i / 12) * Math.PI * 2
              return (
                <line
                  key={i}
                  x1={750 + Math.cos(a) * 700}
                  y1={750 + Math.sin(a) * 700}
                  x2={750 + Math.cos(a) * 740}
                  y2={750 + Math.sin(a) * 740}
                  className="motif-line"
                  stroke="rgba(233,231,223,0.5)"
                />
              )
            })}
          </g>
        </svg>
      </div>
    </div>
  )
}

interface SystemDef {
  href: string
  name: string
  en: string
  tagline: string
  desc: string
  items: string[]
  accent: string
  motif: ReactNode
}

const SYSTEMS: SystemDef[] = [
  {
    href: '/destiny/bazi',
    name: '八字',
    en: 'BAZI · FOUR PILLARS',
    tagline: '从时间中寻找命局',
    desc: '以出生时间建立四柱命局',
    items: ['天干地支', '四柱五行', '大运流年'],
    accent: '#c2a05f',
    motif: PillarMotif,
  },
  {
    href: '/destiny/ziwei',
    name: '紫微斗数',
    en: 'ZIWEI · PURPLE STAR',
    tagline: '从星曜中观见命宫',
    desc: '以命宫与星曜体系解析人生结构',
    items: ['十二宫', '紫微星曜', '四化'],
    accent: '#8d83ad',
    motif: PalaceMotif,
  },
  {
    href: '/destiny/qizheng',
    name: '七政四余',
    en: 'QIZHENG · SEVEN LUMINARIES',
    tagline: '从天体运行观测命运',
    desc: '以出生时刻的天体位置构建命盘',
    items: ['日月五星', '黄道十二宫', '天体运行'],
    accent: '#7d9bb8',
    motif: OrbitMotif,
  },
]

export default function DestinyCards() {
  const [hovered, setHovered] = useState<string | null>(null)

  const setHover = (href: string | null) => setHovered(href)

  return (
    <div className="absolute inset-0 z-20 overflow-y-auto thin-scrollbar">
      <Backdrop />
      <div className="portal-glow" aria-hidden />
      {/* 各体系 hover 时背景光晕轻微偏色(与首页命理变体同模式) */}
      <div className={`portal-glow-bazi ${hovered === '/destiny/bazi' ? 'is-on' : ''}`} aria-hidden />
      <div className={`portal-glow-ziwei ${hovered === '/destiny/ziwei' ? 'is-on' : ''}`} aria-hidden />
      <div className={`portal-glow-qizheng ${hovered === '/destiny/qizheng' ? 'is-on' : ''}`} aria-hidden />

      <Link
        href="/"
        className="absolute left-6 top-6 z-30 text-[10px] tracking-[0.25em] text-mist/50 transition-colors duration-300 hover:text-paper"
      >
        ← 门户
      </Link>

      <div className="relative m-auto flex min-h-full w-full flex-col items-center justify-center px-6 py-12">
        {/* 标题区 */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.3, ease: EASE, delay: 0.3 }}
        >
          <p className="caps-label text-[9px] text-mist/60">Celestial Realm · Destiny</p>
          <h1 className="mt-3 font-serif-cn text-[32px] font-medium tracking-[0.4em] text-paper md:text-[36px]">
            命理
          </h1>
          <p className="mt-4 text-[11px] tracking-[0.3em] text-mist/75">
            探索东方传统命理体系
          </p>
        </motion.div>

        <div className="mt-10 h-px w-44 bg-paper/15 md:w-60" />

        {/* 三体系卡片 */}
        <div className="mt-10 grid w-full max-w-[880px] grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
          {SYSTEMS.map((s, i) => (
            <motion.div
              key={s.href}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, ease: EASE, delay: 0.7 + i * 0.15 }}
            >
              <Link
                href={s.href}
                onMouseEnter={() => setHover(s.href)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(s.href)}
                onBlur={() => setHover(null)}
                style={{ '--accent': s.accent } as CSSProperties}
                className="portal-card group relative flex flex-col items-center px-5 py-6 text-center"
              >
                <span className="portal-card-glow" aria-hidden />

                <div className="relative flex h-24 items-center justify-center">{s.motif}</div>

                <h2 className="relative mt-3 font-serif-cn text-[22px] tracking-[0.25em] text-paper transition-colors duration-500">
                  {s.name}
                </h2>
                <span className="caps-label relative mt-2 text-[8px] text-mist/60">{s.en}</span>

                <p className="destiny-tagline relative mt-3 font-serif-cn text-[12.5px] tracking-[0.18em] text-paper/65">
                  {s.tagline}
                </p>
                <div className="relative mt-4 h-px w-24 bg-paper/10" />

                <p className="relative mt-3 text-[11px] leading-relaxed tracking-[0.06em] text-mist/80">
                  {s.desc}
                </p>
                <p className="relative mt-2 text-[10px] tracking-[0.16em] text-mist/55">
                  {s.items.join(' · ')}
                </p>

                <span className="portal-card-hint relative mt-4 text-[9.5px] tracking-[0.3em] text-paper/65">
                  进入 · ENTER
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* 底注 */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, ease: 'easeOut', delay: 1.4 }}
        >
          <p className="text-[10px] tracking-[0.3em] text-mist/55">选择一个体系,开始探索</p>
          <p className="mt-2 text-[9px] tracking-[0.18em] text-mist/40">
            排盘功能正在构建 · 体系内容以历史方法与文化文本定位
          </p>
        </motion.div>
      </div>
    </div>
  )
}
