/**
 * Astronomy calculation layer — shared types.
 *
 * 设计原则(见 README「天文学计算层」):
 *  - 本层是可替换的纯计算层,不依赖 Three.js,便于单元校验与将来替换为专业天文库。
 *  - 坐标采用 J2000 平赤道坐标(儒略历前的日期按儒略历外推,年份用天文纪年,0 = 前 1 年)。
 *  - 输入时间视为观测地的地方平时(近似),内部换算为 UT。
 *  - 不含章动、光行差、自行等修正 —— 对「天球运动」的可视化已足够,并在文档中如实说明。
 */

/** 观测地点(经度东正,纬度北正,单位:度) */
export interface Site {
  id: string
  name: string
  nameEn?: string
  note?: string
  lat: number
  lon: number
}

/** 观测时刻(地方平时) */
export interface TimeParts {
  year: number
  /** 1–12 */
  month: number
  /** 1–31 */
  day: number
  /** 0–24 */
  hour: number
  /** 0–60 */
  minute: number
}

/** J2000 平赤道坐标 */
export interface Equatorial {
  /** 赤经,小时 */
  raHours: number
  /** 赤纬,度 */
  decDeg: number
}

/** 地平坐标(以观测地为原点) */
export interface Horizontal {
  /** 高度角,度,-90…90 */
  altDeg: number
  /** 方位角,自北向东起算,度,0…360 */
  azDeg: number
}

/** 三维单位向量(场景约定:+Y 天顶,−Z 北,+X 东) */
export type Vec3 = [number, number, number]
