'use client'
import dynamic from 'next/dynamic'

/** WebGL 场景仅客户端渲染(next/dynamic ssr:false 需在客户端组件中使用) */
const Sky = dynamic(() => import('./Sky'), { ssr: false })

export default function SkyClient() {
  return <Sky />
}
