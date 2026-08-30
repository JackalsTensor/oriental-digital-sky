/**
 * 浏览器驱动检查(开发用):用系统 Edge 无头打开应用,分阶段截图并收集控制台错误。
 * 用法: node scripts/screenshot.mjs [stage]
 *   stage: opening | entered | mansion | quadrant | dipper | timeline (默认全部)
 * 截图输出: artifacts/screenshots/
 */
import { chromium } from 'playwright-core'
import fs from 'node:fs'

const OUT = 'artifacts/screenshots'
fs.mkdirSync(OUT, { recursive: true })

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const URL = process.env.URL ?? 'http://localhost:3000'
const only = process.argv[2]

const errors = []

const browser = await chromium.launch({
  executablePath: EDGE,
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--window-size=1600,900'],
})
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } })
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(msg.text())
})
page.on('pageerror', (err) => errors.push(String(err)))

const shot = (name) => page.screenshot({ path: `${OUT}/${name}.png` })

/** 页面内测量 FPS(2 秒) */
async function fps() {
  return page.evaluate(
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
}

console.log('→ 打开页面')
await page.goto(URL, { waitUntil: 'domcontentloaded' })

if (!only || only === 'opening') {
  await page.waitForTimeout(2200)
  await shot('1-opening-light')
  console.log('  ✓ 2.2s 开屏光点')
}

// 等待 ENTER THE SKY 出现
try {
  await page.waitForSelector('text=Enter the Sky', { timeout: 30000 })
  await page.waitForTimeout(600)
  if (!only || only === 'opening') {
    await shot('2-enter-ready')
    console.log('  ✓ 进入按钮出现')
  }
} catch {
  console.log('  ✗ 未等到 Enter the Sky')
  await shot('2-failed')
}

// 点击进入
await page.mouse.click(800, 480)
await page.waitForSelector('text=古代', { timeout: 20000 })
await page.waitForTimeout(2500)
if (!only || only === 'entered') {
  await shot('3-entered')
  console.log('  ✓ 进入交互模式')
}
const fps1 = await fps()
console.log(`  FPS(全景): ${fps1}`)

// 选择青龙(通过导航文本点击)
if (!only || only === 'quadrant') {
  await page.mouse.move(4, 450)
  await page.waitForTimeout(900)
  const dragon = page.locator('nav button', { hasText: '青龙' })
  await dragon.first().click()
  await page.waitForTimeout(4000)
  await shot('4-quadrant-dragon')
  console.log('  ✓ 东方青龙选中(脊线绘制 4s)')
  await page.mouse.move(1600, 900) // 移开鼠标,收起导航
  await page.waitForTimeout(1200)
  await shot('5-quadrant-dragon-clean')
}

// 点击心宿(导航子列表)
if (!only || only === 'mansion') {
  // 先测 3D 悬停/点击:投影心宿到屏幕,移动鼠标 → 悬停标签 → 点击 → 面板
  const xin = await page.evaluate(() => {
    const { camera, THREE } = window.__SKY
    const hit = window.__runtime.hit.find((h) => h.id === '心')
    if (!hit) return null
    camera.updateMatrixWorld()
    const v = hit.pos.clone().project(camera)
    const rect = document.querySelector('canvas').getBoundingClientRect()
    return {
      x: rect.left + ((v.x + 1) / 2) * rect.width,
      y: rect.top + ((1 - v.y) / 2) * rect.height,
      ok: v.z < 1 && Math.abs(v.x) < 1.2 && Math.abs(v.y) < 1.2,
    }
  })
  if (xin?.ok) {
    await page.mouse.move(xin.x, xin.y, { steps: 12 })
    await page.waitForTimeout(900)
    await shot('5b-hover-xin')
    const hovered = (await page.locator('div', { hasText: '东方青龙 · 第五宿' }).count()) > 0
    console.log(`  ${hovered ? '✓' : '✗'} 悬停标签出现`)
    await page.mouse.click(xin.x, xin.y)
    await page.waitForTimeout(3200)
    await shot('6-mansion-xin')
    // 面板首屏:名称 + 摘要(不含展开内容)
    const firstScreen =
      (await page.locator('aside', { hasText: '心宿' }).count()) > 0 &&
      (await page.locator('aside', { hasText: '距星' }).count()) > 0
    // 展开「古代天文学」→ 出现古籍内容
    await page.locator('aside button', { hasText: '古代天文学' }).first().click()
    await page.waitForTimeout(800)
    const panel = (await page.locator('aside', { hasText: '七月流火' }).count()) > 0
    console.log(`  ${firstScreen && panel ? '✓' : '✗'} 心宿面板(首屏摘要 + 展开后古籍引用)`)
    await shot('6b-mansion-xin-expanded')
    const fps2 = await fps()
    console.log(`  FPS(面板开启): ${fps2}`)
  } else {
    console.log('  ✗ 心宿不在视野内,跳过 3D 交互测试')
    await page.mouse.move(4, 450)
    await page.waitForTimeout(900)
    const heart = page.locator('nav button', { hasText: '心' })
    if ((await heart.count()) > 0) {
      await heart.first().click()
      await page.waitForTimeout(3000)
      await shot('6-mansion-xin')
      console.log('  ✓ 心宿面板(经导航)')
    }
  }
}

// 北斗模式
if (!only || only === 'dipper') {
  await page.mouse.move(4, 450)
  await page.waitForTimeout(900)
  const dipper = page.locator('nav button', { hasText: '北斗' })
  if ((await dipper.count()) > 0) {
    await dipper.first().click()
    await page.waitForTimeout(4000)
    await shot('7-dipper')
    console.log('  ✓ 北斗模式')
  }
}

// 时间轴拖动(古代)
if (!only || only === 'timeline') {
  const slider = page.locator('input[type=range][aria-label="年份"]')
  if ((await slider.count()) > 0) {
    const box = await slider.boundingBox()
    await page.mouse.click(box.x + box.width * 0.05, box.y + box.height / 2)
    await page.waitForTimeout(2600)
    await shot('8-ancient-sky')
    console.log('  ✓ 时间轴拖到古代')
  }
}

console.log('\n控制台错误:', errors.length ? `\n${errors.join('\n')}` : '无')
await browser.close()
