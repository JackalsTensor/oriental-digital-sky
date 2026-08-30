/**
 * 场景内省:相机姿态、可交互目标的屏幕投影、节点透明度。
 * 用法: node scripts/debug-sky.mjs
 */
import { chromium } from 'playwright-core'

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const browser = await chromium.launch({
  executablePath: EDGE,
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
})
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } })
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))

await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' })
await page.waitForSelector('text=Enter the Sky', { timeout: 30000 })
await page.mouse.click(800, 480)
await page.waitForTimeout(3500)

const info = await page.evaluate(() => {
  const cam = window.__SKY.camera
  cam.updateMatrixWorld()
  const view = cam.matrixWorldInverse.elements
  const proj = cam.projectionMatrix.elements
  const w = 1600
  const h = 900

  const project = (p) => {
    const x = p.x, y = p.y, z = p.z
    const vx = view[0] * x + view[4] * y + view[8] * z + view[12]
    const vy = view[1] * x + view[5] * y + view[9] * z + view[13]
    const vz = view[2] * x + view[6] * y + view[10] * z + view[14]
    const vw = view[3] * x + view[7] * y + view[11] * z + view[15]
    const cx = proj[0] * vx + proj[4] * vy + proj[8] * vz + proj[12] * vw
    const cy = proj[1] * vx + proj[5] * vy + proj[9] * vz + proj[13] * vw
    const cw = proj[3] * vx + proj[7] * vy + proj[11] * vz + proj[15] * vw
    const nx = cx / cw
    const ny = cy / cw
    return {
      sx: ((nx + 1) / 2) * w,
      sy: ((1 - ny) / 2) * h,
      behind: cw <= 0 || nx < -1.2 || nx > 1.2 || ny < -1.2 || ny > 1.2,
    }
  }

  const camPos = cam.position
  const anchor = window.__runtime.anchorDir
  const hit = window.__runtime.hit
  const inView = hit
    .map((t) => ({ id: t.id, pos: t.pos, s: project(t.pos) }))
    .filter((t) => !t.s.behind)

  // 节点 aAlpha 当前值(从场景图找 points 对象不方便,改由 runtime 推断)
  return {
    camPos: [camPos.x.toFixed(1), camPos.y.toFixed(1), camPos.z.toFixed(1)],
    camFwd: [-view[2], -view[6], -view[10]].map((v) => v.toFixed(3)),
    anchorDir: anchor ? [anchor.x.toFixed(3), anchor.y.toFixed(3), anchor.z.toFixed(3)] : null,
    reveal: window.__runtime.reveal,
    entered: window.__runtime.entered,
    focus: window.__runtime.focus ? 'active' : null,
    hitCount: hit.length,
    inViewCount: inView.length,
    inView: inView.slice(0, 12).map((t) => ({
      id: t.id,
      sx: Math.round(t.s.sx),
      sy: Math.round(t.s.sy),
    })),
    xin: (() => {
      const t = hit.find((h) => h.id === '心')
      return t ? project(t.pos) : null
    })(),
  }
})

console.log(JSON.stringify(info, null, 2))
console.log('页面错误:', errors.length ? errors.join('\n') : '无')
await browser.close()
