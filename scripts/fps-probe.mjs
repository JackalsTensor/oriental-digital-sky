/**
 * 分阶段 FPS 探针:各状态稳定后测量(排除动画瞬态)。
 * 用法: node scripts/fps-probe.mjs
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

const fps = () =>
  page.evaluate(
    () =>
      new Promise((resolve) => {
        let frames = 0
        const t0 = performance.now()
        const loop = () => {
          frames++
          if (performance.now() - t0 > 2000) resolve(Math.round((frames / (performance.now() - t0)) * 1000))
          else requestAnimationFrame(loop)
        }
        requestAnimationFrame(loop)
      }),
  )

await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' })
await page.waitForSelector('text=Enter the Sky', { timeout: 30000 })
await page.mouse.click(800, 480)
await page.waitForTimeout(4000)
console.log('1. 全景(稳定后):', await fps(), 'FPS')

// 青龙选中,等待揭示动画完全结束
await page.mouse.move(4, 450)
await page.waitForTimeout(900)
await page.locator('nav button', { hasText: '青龙' }).first().click()
await page.waitForTimeout(6000)
console.log('2. 青龙选中(动画结束后):', await fps(), 'FPS')

// 选中视野内的任意星宿(通过投影点击)
const target = await page.evaluate(() => {
  const { camera } = window.__SKY
  camera.updateMatrixWorld()
  const rect = document.querySelector('canvas').getBoundingClientRect()
  for (const hit of window.__runtime.hit) {
    if (hit.kind !== 'mansion') continue
    const v = hit.pos.clone().project(camera)
    if (v.z < 1 && Math.abs(v.x) < 1.1 && Math.abs(v.y) < 1.1) {
      return {
        id: hit.id,
        x: rect.left + ((v.x + 1) / 2) * rect.width,
        y: rect.top + ((1 - v.y) / 2) * rect.height,
        ok: true,
      }
    }
  }
  return null
})
if (target?.ok) {
  await page.mouse.move(4, 450).then(async () => {
    await page.mouse.click(target.x, target.y)
  })
  await page.waitForTimeout(5000)
  console.log('3. 星宿选中 + 面板(稳定后):', await fps(), 'FPS')
  // 展开全部三个 section,稳定后再测
  for (const t of ['古代天文学', '文化意义', '古籍']) {
    const btn = page.locator('aside button', { hasText: t }).first()
    if ((await btn.count()) > 0) await btn.click()
    await page.waitForTimeout(700)
  }
  await page.waitForTimeout(1500)
  console.log('4. 面板全展开(稳定后):', await fps(), 'FPS')
} else {
  console.log('3. 井宿不在视野,跳过')
}

// 北斗模式
await page.mouse.move(4, 450)
await page.waitForTimeout(900)
await page.locator('nav button', { hasText: '北斗' }).first().click()
await page.waitForTimeout(5000)
console.log('5. 北斗模式(稳定后):', await fps(), 'FPS')

console.log('页面错误:', errors.length ? errors.join('; ') : '无')
await browser.close()
