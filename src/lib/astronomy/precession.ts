/**
 * 岁差:J2000 平赤道坐标 → 目标历元的平赤道坐标。
 * IAU 1976 岁差角公式(Meeus 第 21 章),适用于数千年尺度。
 */
import type { Vec3 } from './types'
import { J2000 } from './time'

const ARCSEC = Math.PI / (180 * 3600)

/** 绕 +Z 轴旋转的 3×3 矩阵(行主序) */
function rotZ(angle: number): number[] {
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  return [c, -s, 0, s, c, 0, 0, 0, 1]
}

/** 绕 +Y 轴旋转的 3×3 矩阵(行主序) */
function rotY(angle: number): number[] {
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  return [c, 0, s, 0, 1, 0, -s, 0, c]
}

function matMul(a: number[], b: number[]): number[] {
  const out = new Array<number>(9).fill(0)
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      out[r * 3 + c] =
        a[r * 3 + 0] * b[0 * 3 + c] + a[r * 3 + 1] * b[1 * 3 + c] + a[r * 3 + 2] * b[2 * 3 + c]
    }
  }
  return out
}

function applyMat(m: number[], v: Vec3): Vec3 {
  return [
    m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
    m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
    m[6] * v[0] + m[7] * v[1] + m[8] * v[2],
  ]
}

/** 目标历元(儒略日)的岁差矩阵:r_date = Rz(−z)·Ry(θ)·Rz(−ζ)·r_J2000 */
export function precessionMatrix(jd: number): number[] {
  const T = (jd - J2000) / 36525
  const zeta = (2306.2181 * T + 0.30188 * T * T + 0.017998 * T * T * T) * ARCSEC
  const z = (2306.2181 * T + 1.09468 * T * T + 0.018203 * T * T * T) * ARCSEC
  const theta = (2004.3109 * T - 0.42665 * T * T - 0.041833 * T * T * T) * ARCSEC
  return matMul(rotZ(-z), matMul(rotY(theta), rotZ(-zeta)))
}

/** 将 J2000 平赤道单位向量岁差修正到目标历元 */
export function precessVector(jd: number, v: Vec3): Vec3 {
  return applyMat(precessionMatrix(jd), v)
}
