/**
 * 截图像素分析(无法人工看图时的客观验证):
 * 亮度分布、色彩统计、区域检查。
 * 用法: node scripts/analyze-shots.mjs
 */
import fs from 'node:fs'
import { PNG } from 'pngjs'

const DIR = 'artifacts/screenshots'

const stats = (png) => {
  const { data, width, height } = png
  let sum = 0
  let max = 0
  let bright = 0 // > 40 亮度
  let jade = 0 // 青色系 (g > r*1.1 && g > b*1.05)
  let warm = 0 // 暖金 (r > b*1.15 && g > b*1.05)
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
    sum += lum
    if (lum > max) max = lum
    if (lum > 40) bright++
    if (g > r * 1.1 && g > b * 1.05 && g > 30) jade++
    if (r > b * 1.15 && g > b * 1.02 && r > 40) warm++
  }
  const n = width * height
  return {
    mean: (sum / n).toFixed(2),
    max,
    brightPct: ((bright / n) * 100).toFixed(2),
    jadePx: jade,
    warmPx: warm,
  }
}

/** 区域平均亮度(用于检查 UI 元素位置) */
const regionLum = (png, x0, y0, x1, y1) => {
  const { data, width } = png
  let sum = 0
  let n = 0
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * width + x) * 4
      sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]
      n++
    }
  }
  return (sum / n).toFixed(2)
}

for (const f of fs.readdirSync(DIR).filter((f) => f.endsWith('.png') && !f.startsWith('small-'))) {
  const png = PNG.sync.read(fs.readFileSync(`${DIR}/${f}`))
  const s = stats(png)
  const ui = {
    topLeft: regionLum(png, 0, 0, 220, 80),
    bottomCenter: regionLum(png, Math.floor(png.width * 0.3), png.height - 90, Math.floor(png.width * 0.7), png.height),
    rightPanel: regionLum(png, png.width - 380, Math.floor(png.height * 0.2), png.width, Math.floor(png.height * 0.8)),
    leftNav: regionLum(png, 0, Math.floor(png.height * 0.3), 250, Math.floor(png.height * 0.7)),
  }
  console.log(`\n${f}  (${png.width}x${png.height})`)
  console.log(`  亮度: mean=${s.mean} max=${s.max} bright=${s.brightPct}%  青色px=${s.jadePx} 暖色px=${s.warmPx}`)
  console.log(`  区域: 左上=${ui.topLeft} 底部中央=${ui.bottomCenter} 右面板=${ui.rightPanel} 左导航=${ui.leftNav}`)
}
