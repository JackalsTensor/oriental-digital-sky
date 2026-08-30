/**
 * 程序化纹理:星点光晕、柔粒子、星云。
 * 全部在 canvas 上生成,无外部素材依赖。
 */
import * as THREE from 'three'

/** 柔和径向光晕(用于星点与粒子) */
export function makeGlowTexture(size = 128, falloff = 2.6): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.18, 'rgba(255,255,255,0.85)')
  g.addColorStop(0.4, 'rgba(255,255,255,0.28)')
  g.addColorStop(0.7, 'rgba(255,255,255,0.05)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.needsUpdate = true
  return tex
}

/** 极柔的大范围辉光(用于星云) */
export function makeNebulaTexture(size = 256, seed = 1, octaves = 5): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = 'rgba(0,0,0,1)'
  ctx.fillRect(0, 0, size, size)
  // 简单伪随机(mulberry32)
  let s = seed >>> 0
  const rnd = () => {
    s |= 0
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  ctx.globalCompositeOperation = 'lighter'
  const blobs = 90
  for (let i = 0; i < blobs; i++) {
    const x = rnd() * size
    const y = rnd() * size
    const r = (0.05 + rnd() * 0.22) * size
    const a = 0.012 + rnd() * 0.03
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, `rgba(255,255,255,${a})`)
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.needsUpdate = true
  return tex
}

/** 文字贴图(方位标记等小标签) */
export function makeTextSprite(text: string, size = 128, font = '42px "Noto Serif SC", "Songti SC", serif'): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, size, size)
  ctx.font = font
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = 'rgba(233,231,223,0.85)'
  ctx.fillText(text, size / 2, size / 2)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.needsUpdate = true
  return tex
}
