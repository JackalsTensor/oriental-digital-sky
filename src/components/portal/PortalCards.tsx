/**
 * 总入口内容层:标题 + 2×2 模块卡片 + 分层宣言。
 * 卡片 hover 将氛围写入 portalRuntime(非响应式),由 PortalSkyScene 每帧缓动响应背景;
 * 中央光晕呼吸与「问命」光晕微变在本组件(DOM/CSS)完成。
 * 观星是当前主入口:默认即略亮、暖金描边;其余三个保持「世界正在形成」的微弱存在感。
 */
'use client'
import { useState, type CSSProperties } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { portalRuntime, type PortalAmbience } from './portalRuntime'

const EASE = [0.22, 1, 0.36, 1] as const

interface ModuleDef {
  href: string
  name: string
  en: string
  status: string
  desc: string
  ready: boolean
  ambience: PortalAmbience
  /** hover 强调色(低饱和,取自项目色系) */
  accent: string
}

const MODULES: ModuleDef[] = [
  {
    href: '/observe',
    name: '观星',
    en: 'OBSERVE',
    status: '可用',
    desc: '二十八宿 · 四象 · 北斗 · 天球运动',
    ready: true,
    ambience: 'observe',
    accent: '#c2a05f',
  },
  {
    href: '/destiny',
    name: '问命',
    en: 'DESTINY',
    status: '规划中',
    desc: '紫微斗数 · 八字 · 七政四余',
    ready: false,
    ambience: 'destiny',
    accent: '#8fa3b8',
  },
  {
    href: '/divination',
    name: '卜筮',
    en: 'DIVINATION',
    status: '规划中',
    desc: '六爻 · 奇门遁甲 · 梅花易数 · 大六壬 · 太乙',
    ready: false,
    ambience: 'divination',
    accent: '#b7bcc6',
  },
  {
    href: '/knowledge',
    name: '知识',
    en: 'KNOWLEDGE',
    status: '规划中',
    desc: '古籍 · 星官 · 古代天文学 · 历史文化',
    ready: false,
    ambience: 'knowledge',
    accent: '#8fb8ae',
  },
]

export default function PortalCards() {
  const [amb, setAmb] = useState<PortalAmbience | null>(null)

  const enter = (a: PortalAmbience) => {
    setAmb(a)
    portalRuntime.ambience = a
  }
  const leave = () => {
    setAmb(null)
    portalRuntime.ambience = null
  }

  return (
    <div className="absolute inset-0 z-20 overflow-y-auto thin-scrollbar">
      {/* 中央光晕:轻微呼吸(14s);问命 hover 时微偏紫 */}
      <div className="portal-glow" aria-hidden />
      <div className={`portal-glow-destiny ${amb === 'destiny' ? 'is-on' : ''}`} aria-hidden />

      <div className="relative m-auto flex min-h-full w-full flex-col items-center justify-center px-6 py-10">
        {/* 品牌区 */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: EASE, delay: 0.5 }}
        >
          <p className="caps-label text-[10px] text-mist/60">Celestial Realm</p>
          <h1 className="mt-4 font-serif-cn text-[30px] font-medium tracking-[0.35em] text-paper md:text-[40px]">
            东方数字天穹
          </h1>
          <p className="mt-5 text-[11px] tracking-[0.34em] text-mist/75">
            观星 · 问命 · 卜筮 · 知识
          </p>
        </motion.div>

        <div className="mt-11 h-px w-44 bg-paper/15 md:mt-12 md:w-60" />

        {/* 四模块卡片(2×2) */}
        <div className="mt-10 grid w-full max-w-[640px] grid-cols-2 gap-3 md:mt-12 md:gap-4">
          {MODULES.map((m, i) => (
            <motion.div
              key={m.href}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, ease: EASE, delay: 1.15 + i * 0.14 }}
            >
              <Link
                href={m.href}
                onMouseEnter={() => enter(m.ambience)}
                onMouseLeave={leave}
                onFocus={() => enter(m.ambience)}
                onBlur={leave}
                style={{ '--accent': m.accent } as CSSProperties}
                className={`portal-card group relative flex flex-col px-4 py-4 sm:px-6 sm:py-6 ${
                  m.ready ? 'portal-card-ready' : ''
                }`}
              >
                <span className="portal-card-glow" aria-hidden />

                <span className="relative flex items-center justify-between">
                  <span
                    className={`font-serif-cn text-[19px] tracking-[0.28em] transition-colors duration-500 sm:text-[22px] ${
                      m.ready
                        ? 'text-paper group-hover:text-gold'
                        : 'text-paper/85 group-hover:text-paper'
                    }`}
                  >
                    {m.name}
                  </span>
                  <span
                    className={`caps-label whitespace-nowrap px-2 py-0.5 text-[7px] sm:text-[7.5px] ${
                      m.ready
                        ? 'border border-gold/50 bg-gold/8 text-gold'
                        : 'border border-paper/15 text-mist/70'
                    }`}
                  >
                    {m.status}
                  </span>
                </span>

                <span className="caps-label relative mt-2 text-[8px] text-mist/60">{m.en}</span>

                <span className="relative mt-2.5 hidden text-[11.5px] leading-relaxed tracking-[0.08em] text-mist/85 transition-colors duration-500 group-hover:text-paper/75 sm:mt-3 sm:block">
                  {m.desc}
                </span>

                <span
                  className={`portal-card-hint relative mt-3 text-[9px] tracking-[0.3em] sm:mt-4 sm:text-[10px] ${
                    m.ready ? 'text-gold/85' : 'text-mist/70'
                  }`}
                >
                  {m.ready ? '进入 · ENTER' : '预览 · PREVIEW'}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* 分层声明 */}
        <motion.p
          className="mt-12 text-center text-[10px] tracking-[0.22em] text-mist/55 md:mt-14"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.6, ease: 'easeOut', delay: 2.0 }}
        >
          天文事实 · 历史文化 · 传统术数 —— 分层呈现,各守其界
        </motion.p>
      </div>
    </div>
  )
}
