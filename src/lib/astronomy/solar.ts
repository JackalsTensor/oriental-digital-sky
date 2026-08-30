/**
 * 太阳视黄经(低精度)—— Meeus《Astronomical Algorithms》第 25 章公式。
 * 用于二十四节气的交节时刻求解(太阳黄经每 15° 一节)。
 * 精度约 0.01°(即节气时刻约 ±15 分钟)—— 对排盘节气判定足够,并如实声明。
 */
import { normalizeDegrees } from './time'

const DEG = Math.PI / 180

/** 太阳视黄经(未归一化,单调增长,供节气二分求解使用) */
export function solarApparentLongitudeRaw(jd: number): number {
  const T = (jd - 2451545.0) / 36525
  // 几何平黄经
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T
  // 平近点角
  const M = (357.52911 + 35999.05029 * T - 0.0001537 * T * T) * DEG
  // 中心差
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * M) +
    0.000289 * Math.sin(3 * M)
  // 真黄经
  const trueLong = L0 + C
  // 升交点黄经(用于光行差/章动近似)
  const omega = (125.04 - 1934.136 * T) * DEG
  // 视黄经
  return trueLong - 0.00569 - 0.00478 * Math.sin(omega)
}

/** 太阳视黄经(0–360) */
export function solarApparentLongitude(jd: number): number {
  return normalizeDegrees(solarApparentLongitudeRaw(jd))
}
