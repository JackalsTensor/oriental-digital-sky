/**
 * 坐标变换:
 *  - J2000 平赤道(赤经/赤纬)↔ 三维单位向量
 *  - 平赤道 → 地平坐标(高度角/方位角)
 *  - 地平坐标 → 场景世界单位向量(ENU:+Y 天顶,−Z 北,+X 东)
 *  - 银道坐标 → J2000 平赤道(用于银河粒子带)
 */
import type { Equatorial, Horizontal, Vec3 } from './types'

const D2R = Math.PI / 180

const norm360 = (deg: number) => ((deg % 360) + 360) % 360

export function raDecToUnit(raHours: number, decDeg: number): Vec3 {
  const ra = raHours * 15 * D2R
  const dec = decDeg * D2R
  const cd = Math.cos(dec)
  return [cd * Math.cos(ra), Math.sin(dec), cd * Math.sin(ra)]
}

export function unitToRaDec(v: Vec3): Equatorial {
  const dec = Math.asin(clamp(v[1], -1, 1)) / D2R
  const ra = norm360(Math.atan2(v[2], v[0]) / D2R) / 15
  return { raHours: ra, decDeg: dec }
}

/**
 * 赤道(历元) → 地平。方位角自北向东起算。
 * H = LST − α;sin alt = sinφ·sinδ + cosφ·cosδ·cosH;
 * az = atan2(sinH, cosH·sinφ − tanδ·cosφ) + π(即从北起算)。
 */
export function equatorialToHorizontal(
  eq: Equatorial,
  lstHours: number,
  latDeg: number,
): Horizontal {
  const H = ((lstHours - eq.raHours) * 15) * D2R
  const dec = eq.decDeg * D2R
  const lat = latDeg * D2R
  const sinAlt = Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(H)
  const alt = Math.asin(clamp(sinAlt, -1, 1))
  const az = norm360(
    (Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(lat) - Math.tan(dec) * Math.cos(lat)) +
      Math.PI) /
      D2R,
  )
  return { altDeg: alt / D2R, azDeg: az }
}

/** 地平坐标 → 世界单位向量(ENU) */
export function horizontalToUnit(altDeg: number, azDeg: number): Vec3 {
  const alt = altDeg * D2R
  const az = azDeg * D2R
  const ca = Math.cos(alt)
  return [ca * Math.sin(az), Math.sin(alt), -ca * Math.cos(az)]
}

/**
 * 银道坐标 → J2000 平赤道单位向量。
 * 以标准极点定义构建正交基:北银极、银心(l=0°)在赤道系中的方向。
 */
const GC_RA_H = 266.40499 / 15 // 银心 J2000 赤经
const GC_DEC = -28.93617
const NGP_RA_H = 192.85948 / 15 // 北银极 J2000 赤经
const NGP_DEC = 27.12825

const XG = raDecToUnit(GC_RA_H, GC_DEC) // 指向银心的单位向量
const ZG = raDecToUnit(NGP_RA_H, NGP_DEC) // 北银极
const YG: Vec3 = [
  ZG[1] * XG[2] - ZG[2] * XG[1],
  ZG[2] * XG[0] - ZG[0] * XG[2],
  ZG[0] * XG[1] - ZG[1] * XG[0],
] // ZG × XG

export function galacticToEquatorialUnit(lDeg: number, bDeg: number): Vec3 {
  const l = lDeg * D2R
  const b = bDeg * D2R
  const cb = Math.cos(b)
  const x = cb * Math.cos(l)
  const y = cb * Math.sin(l)
  const z = Math.sin(b)
  return [
    XG[0] * x + YG[0] * y + ZG[0] * z,
    XG[1] * x + YG[1] * y + ZG[1] * z,
    XG[2] * x + YG[2] * y + ZG[2] * z,
  ]
}

/** 三维向量工具 */
export function vecScale(v: Vec3, s: number): Vec3 {
  return [v[0] * s, v[1] * s, v[2] * s]
}

export function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v))
}
