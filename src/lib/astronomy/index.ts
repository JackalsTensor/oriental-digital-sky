/**
 * Astronomy Engine —— 计算层统一入口。
 *
 * 管线(可替换):
 *   Site × Time
 *     → 儒略日 / 地方恒星时
 *     → 岁差矩阵(J2000 → 历元)
 *     → 赤道(历元) → 地平
 *     → 场景世界单位向量
 *
 * 本层只做纯计算,场景层(Three.js)调用 radecToWorld / galToWorld 取数。
 */
import { toJulianDate, lstHours, utHoursFromLocal } from './time'
import { precessionMatrix } from './precession'
import {
  raDecToUnit,
  galacticToEquatorialUnit,
  equatorialToHorizontal,
  horizontalToUnit,
} from './coords'
import type { Horizontal, Site, TimeParts, Vec3 } from './types'

export interface SkyFrame {
  /** 儒略日(UT) */
  jd: number
  /** 地方平恒星时,小时 */
  lstHours: number
  /** J2000 赤道单位向量 → 场景世界单位向量(含岁差与地平变换) */
  radecToWorld: (raHours: number, decDeg: number) => Vec3
  /** 银道(l,b)单位向量 → 场景世界单位向量 */
  galToWorld: (lDeg: number, bDeg: number) => Vec3
  /** J2000 赤道坐标 → 地平坐标(与观测地、时刻一致) */
  equatorialToHorizontal: (raHours: number, decDeg: number) => Horizontal
}

/**
 * 由观测地点与地方平时构建天空参考系。
 * 输入时间按观测地地方平时理解,内部换算为 UT(地方时 − 东经/15)。
 */
export function computeSkyFrame(site: Site, time: TimeParts): SkyFrame {
  const ut = utHoursFromLocal(time.hour, time.minute, site.lon)
  const jd = toJulianDate({ ...time, hour: ut, minute: 0 })
  const lst = lstHours(jd, site.lon)
  const P = precessionMatrix(jd)
  const lat = site.lat

  const j2000ToDate = (v: Vec3): Vec3 => [
    P[0] * v[0] + P[1] * v[1] + P[2] * v[2],
    P[3] * v[0] + P[4] * v[1] + P[5] * v[2],
    P[6] * v[0] + P[7] * v[1] + P[8] * v[2],
  ]

  const radecToWorld = (raHours: number, decDeg: number): Vec3 => {
    const v0 = raDecToUnit(raHours, decDeg)
    const v = j2000ToDate(v0)
    // 由历元赤道单位向量反推赤经赤纬,再走地平变换
    const dec = Math.asin(Math.min(1, Math.max(-1, v[1])))
    const ra =
      (((Math.atan2(v[2], v[0]) * 180) / Math.PI) % 360) / 15
    const eq = {
      raHours: ra < 0 ? ra + 24 : ra,
      decDeg: (dec * 180) / Math.PI,
    }
    const h = equatorialToHorizontal(eq, lst, lat)
    return horizontalToUnit(h.altDeg, h.azDeg)
  }

  const galToWorld = (lDeg: number, bDeg: number): Vec3 => {
    const v0 = galacticToEquatorialUnit(lDeg, bDeg)
    const v = j2000ToDate(v0)
    const dec = Math.asin(Math.min(1, Math.max(-1, v[1])))
    const ra = (((Math.atan2(v[2], v[0]) * 180) / Math.PI) % 360) / 15
    const eq = {
      raHours: ra < 0 ? ra + 24 : ra,
      decDeg: (dec * 180) / Math.PI,
    }
    const h = equatorialToHorizontal(eq, lst, lat)
    return horizontalToUnit(h.altDeg, h.azDeg)
  }

  const equatorialToHorizontalAt = (raHours: number, decDeg: number): Horizontal => {
    const v = j2000ToDate(raDecToUnit(raHours, decDeg))
    const dec = Math.asin(Math.min(1, Math.max(-1, v[1])))
    const ra = (((Math.atan2(v[2], v[0]) * 180) / Math.PI) % 360) / 15
    const eq = {
      raHours: ra < 0 ? ra + 24 : ra,
      decDeg: (dec * 180) / Math.PI,
    }
    return equatorialToHorizontal(eq, lst, lat)
  }

  return { jd, lstHours: lst, radecToWorld, galToWorld, equatorialToHorizontal: equatorialToHorizontalAt }
}

export * from './types'
export { toJulianDate, lstHours, gmstDegrees, utHoursFromLocal, J2000 } from './time'
export { precessionMatrix } from './precession'
export {
  raDecToUnit,
  unitToRaDec,
  equatorialToHorizontal,
  horizontalToUnit,
  galacticToEquatorialUnit,
  vecScale,
} from './coords'
