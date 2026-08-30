/**
 * Next.js 16.3 静态导出修正(部署必需):
 * 段预取文件以目录形式生成(out/destiny/__next.destiny/__PAGE__.txt),
 * 而客户端按扁平点号形式请求(/destiny/__next.destiny.__PAGE__.txt?_rsc=…)。
 * next start 有服务端改写所以无此问题;纯静态托管(Cloudflare Pages)不做改写,
 * 故导出后补一份扁平副本。仅复制构建产物,不改动任何源码。
 *
 * 用法: next build 之后自动执行(见 package.json build script)。
 */
import fs from 'node:fs'
import path from 'node:path'

const OUT = path.resolve('out')
let count = 0

const walk = (dir, segs) => {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    const st = fs.statSync(p)
    if (st.isDirectory()) {
      walk(p, [...segs, name])
    } else if (name === '__PAGE__.txt' && segs.some((s) => s.startsWith('__next.'))) {
      // segs = [..路由段, '__next.x', ...后续段]
      // 客户端请求扁平点号形式:__next.x[.后续段].__PAGE__.txt
      const i = segs.findIndex((s) => s.startsWith('__next.'))
      const route = segs.slice(0, i)
      const tail = segs.length > i + 1 ? '.' + segs.slice(i + 1).join('.') : ''
      const flat = segs[i] + tail + '.__PAGE__.txt'
      const target = path.join(OUT, ...route, flat)
      fs.copyFileSync(p, target)
      count++
    }
  }
}

walk(OUT, [])
console.log(`fix-static-prefetch: 扁平化 ${count} 个段预取文件`)
