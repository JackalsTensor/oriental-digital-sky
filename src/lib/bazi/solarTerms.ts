/**
 * 二十四节气的十二「节」—— 月柱的节气边界。
 * 交节时刻由太阳视黄经(Meeus 公式,精度约 ±15 分钟)二分求解,
 * 而非查表或估算;年份适用范围约 1900–2100。
 */
import { solarApparentLongitudeRaw } from '@/lib/astronomy'

export interface JieDef {
  name: string
  /** 太阳黄经(度) */
  angle: number
  /** 该节起始的月支 */
  monthBranch: number
  /** 该月序号:寅 = 0 … 丑 = 11(用于五虎遁) */
  monthNumber: number
}

/** 十二节(自立春始,月柱以此定月) */
export const JIE: JieDef[] = [
  { name: '立春', angle: 315, monthBranch: 2, monthNumber: 0 },
  { name: '惊蛰', angle: 345, monthBranch: 3, monthNumber: 1 },
  { name: '清明', angle: 15, monthBranch: 4, monthNumber: 2 },
  { name: '立夏', angle: 45, monthBranch: 5, monthNumber: 3 },
  { name: '芒种', angle: 75, monthBranch: 6, monthNumber: 4 },
  { name: '小暑', angle: 105, monthBranch: 7, monthNumber: 5 },
  { name: '立秋', angle: 135, monthBranch: 8, monthNumber: 6 },
  { name: '白露', angle: 165, monthBranch: 9, monthNumber: 7 },
  { name: '寒露', angle: 195, monthBranch: 10, monthNumber: 8 },
  { name: '立冬', angle: 225, monthBranch: 11, monthNumber: 9 },
  { name: '大雪', angle: 255, monthBranch: 0, monthNumber: 10 },
  { name: '小寒', angle: 285, monthBranch: 1, monthNumber: 11 },
]

/** 各节公历近似日期(月/日),用于定位搜索窗口 */
const APPROX: [number, number][] = [
  [2, 4], [3, 6], [4, 5], [5, 6], [6, 6], [7, 7],
  [8, 8], [9, 8], [10, 8], [11, 7], [12, 7], [1, 6],
]

/**
 * 求解某年某节的交节时刻(儒略日)。
 * 在近似日期 ±1.5 天内对太阳视黄经做二分(未归一化黄经单调增长)。
 */
export function jieJd(year: number, jieIndex: number): number {
  const def = JIE[jieIndex]
  const [am, ad] = APPROX[jieIndex]
  const approx = new Date(Date.UTC(year, am - 1, ad))
  const t0 = approx.getTime() / 86400000 + 2440587.5 - 1.5
  const t1 = t0 + 3

  const raw0 = solarApparentLongitudeRaw(t0)
  // 目标黄经:补齐到 raw0 附近的下一个 angle 值(保持单调比较)
  let target = def.angle + 360 * Math.floor(raw0 / 360)
  if (target < raw0) target += 360

  let lo = t0
  let hi = t1
  for (let i = 0; i < 48; i++) {
    const mid = (lo + hi) / 2
    if (solarApparentLongitudeRaw(mid) < target) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

/** 某年全部十二节的儒略日(自该年立春至小寒) */
export function yearJies(year: number): { def: JieDef; jd: number }[] {
  return JIE.map((def, i) => ({ def, jd: jieJd(year, i) }))
}

/** 儒略日 → 北京时间读数(时:分,用于展示与测试) */
export function jdToCstClock(jd: number): { hour: number; minute: number } {
  const ms = (jd - 2440587.5) * 86400000 + 8 * 3600000
  const d = new Date(ms)
  return { hour: d.getUTCHours(), minute: d.getUTCMinutes() }
}
