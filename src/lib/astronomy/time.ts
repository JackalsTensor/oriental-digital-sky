/**
 * 时间换算:儒略日、格林尼治恒星时、地方恒星时。
 * 公式依据 Jean Meeus《Astronomical Algorithms》(第 7、12 章)。
 */
import type { TimeParts } from './types'

const J2000 = 2451545.0

const norm360 = (deg: number) => ((deg % 360) + 360) % 360

/** 由地方平时换算为 UT 的小时数(地方平时 − 东经/15) */
export function utHoursFromLocal(localHour: number, localMinute: number, lonDeg: number): number {
  return localHour + localMinute / 60 - lonDeg / 15
}

/** 儒略日(UT)。日期采用公历,1582 年之前按外推公历(proleptic Gregorian)计算 */
export function toJulianDate(t: TimeParts): number {
  const y = t.year
  const m = t.month
  const dayFrac = t.day + (t.hour + t.minute / 60) / 24
  const a = Math.floor((14 - m) / 12)
  const yp = y + 4800 - a
  const mp = m + 12 * a - 3
  const jdn =
    dayFrac +
    Math.floor((153 * mp + 2) / 5) +
    365 * yp +
    Math.floor(yp / 4) -
    Math.floor(yp / 100) +
    Math.floor(yp / 400) -
    32045
  // jdn 是正午起算的日数(含小数),儒略日 = jdn − 0.5
  return jdn - 0.5
}

/** 格林尼治平恒星时,度(Meeus 12.4) */
export function gmstDegrees(jd: number): number {
  const d = jd - J2000
  const T = d / 36525
  const gmst =
    280.46061837 +
    360.98564736629 * d +
    0.000387933 * T * T -
    (T * T * T) / 38710000
  return norm360(gmst)
}

/** 地方平恒星时,小时 */
export function lstHours(jd: number, lonDeg: number): number {
  const deg = norm360(gmstDegrees(jd) + lonDeg)
  return deg / 15
}

/** 归一化工具 */
export const normalizeDegrees = norm360
export const normalizeHours = (h: number) => ((h % 24) + 24) % 24

export { J2000 }
