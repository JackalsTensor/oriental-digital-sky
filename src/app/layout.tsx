import type { Metadata, Viewport } from 'next'
// 本地字体(fontsource,构建时打包,无外部网络依赖)
import '@fontsource/noto-serif-sc/chinese-simplified-400.css'
import '@fontsource/noto-serif-sc/chinese-simplified-500.css'
import '@fontsource/noto-serif-sc/chinese-simplified-600.css'
import '@fontsource/noto-sans-sc/chinese-simplified-300.css'
import '@fontsource/noto-sans-sc/chinese-simplified-400.css'
import '@fontsource/noto-sans-sc/chinese-simplified-500.css'
import '@fontsource/space-grotesk/300.css'
import '@fontsource/space-grotesk/400.css'
import '@fontsource/space-grotesk/500.css'
import './globals.css'

export const metadata: Metadata = {
  title: '二十八宿 · The Twenty-Eight Mansions',
  description:
    '以现代 Web3D 技术重新呈现中国古代星空:二十八宿、四象、北斗,以及相关的古代天文学与道教文化。',
}

export const viewport: Viewport = {
  themeColor: '#04060d',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="h-full bg-ink-950">{children}</body>
    </html>
  )
}
