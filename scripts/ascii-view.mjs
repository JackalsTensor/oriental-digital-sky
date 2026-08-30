/**
 * 把截图渲染成 ASCII 亮度图(终端"看图")。
 * 用法: node scripts/ascii-view.mjs <file> [x0 y0 x1 y1] [cols] [exposure]
 *   exposure: 1=线性, 2=平方根, 3=立方根(看暗部结构)
 * 每格输出两字符:亮度 + 色相(W=暖 r>b, C=青绿 g>r, N=中性)
 */
import fs from 'node:fs'
import { PNG } from 'pngjs'

const [file, ...args] = process.argv.slice(2)
const png = PNG.sync.read(fs.readFileSync(`artifacts/screenshots/${file}`))
const cols = Number(args[4] ?? 120)
const exposure = Number(args[5] ?? 1.6)
const [x0, y0, x1, y1] = args.length >= 4 ? args.slice(0, 4).map(Number) : [0, 0, png.width, png.height]
const rows = Math.max(8, Math.round(((y1 - y0) / (x1 - x0)) * cols * 0.45))
const chars = ' .·:;+=xX$#'
const px = (x, y) => {
  const i = (y * png.width + x) * 4
  return [png.data[i], png.data[i + 1], png.data[i + 2]]
}
let out = ''
for (let r = 0; r < rows; r++) {
  let line = ''
  for (let cIdx = 0; cIdx < cols; cIdx++) {
    const x = Math.floor(x0 + ((cIdx + 0.5) / cols) * (x1 - x0))
    const y = Math.floor(y0 + ((r + 0.5) / rows) * (y1 - y0))
    const [rr, gg, bb] = px(x, y)
    const l = 0.2126 * rr + 0.7152 * gg + 0.0722 * bb
    const le = Math.min(1, Math.pow(l / 255, 1 / exposure))
    const ch = chars[Math.min(chars.length - 1, Math.floor(le * chars.length))]
    const hue = rr > bb * 1.3 && rr > 35 ? 'W' : gg > rr * 1.15 && gg > 35 ? 'C' : ' '
    line += ch + hue
  }
  out += line + '\n'
}
console.log(out)
