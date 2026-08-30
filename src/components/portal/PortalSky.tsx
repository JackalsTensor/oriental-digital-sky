'use client'
import dynamic from 'next/dynamic'

/** 首页天穹背景:仅客户端渲染(与 SkyClient 同模式) */
const PortalSkyScene = dynamic(() => import('./PortalSkyScene'), { ssr: false })

export default function PortalSky() {
  return <PortalSkyScene />
}
