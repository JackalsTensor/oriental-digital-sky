/**
 * 公历/儒略日换算与晚子时换日。
 * 输入时间一律视为北京时间(UTC+8)。
 */
import { toJulianDate, utHoursFromLocal } from '@/lib/astronomy'

/** 北京时间 UTC+8 对应经度 */
export const CST_LON = 120

/**
 * 公历日期的儒略日序数(当日正午 UT,整数)。
 * 用于日柱干支(见 ganzhi.dayCycleIndex)。
 */
export function jdnOf(year: number, month: number, day: number): number {
  return Math.floor(toJulianDate({ year, month, day, hour: 12, minute: 0 }) + 0.5)
}

/** 北京时间的时刻(时:分)换算为该日的儒略日 */
export function jdOfCst(year: number, month: number, day: number, hour: number, minute: number): number {
  const ut = utHoursFromLocal(hour, minute, CST_LON)
  return toJulianDate({ year, month, day, hour: ut, minute: 0 })
}

/**
 * 晚子时换日:23:00–23:59 按「子初换日」计入次日(传统排盘规则)。
 * 返回换日后的公历日期(用于日柱,也用于年/月节气边界判断)。
 */
export function effectiveDate(
  year: number,
  month: number,
  day: number,
  hour: number,
): { year: number; month: number; day: number } {
  if (hour < 23) return { year, month, day }
  const next = new Date(Date.UTC(year, month - 1, day + 1))
  return { year: next.getUTCFullYear(), month: next.getUTCMonth() + 1, day: next.getUTCDate() }
}

/** 日期合法性(公历,支持 1900–2100 范围内的检查由调用方决定) */
export function isValidDate(year: number, month: number, day: number): boolean {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return false
  if (month < 1 || month > 12 || day < 1 || day > 31) return false
  const d = new Date(Date.UTC(year, month - 1, day))
  return d.getUTCFullYear() === year && d.getUTCMonth() === month - 1 && d.getUTCDate() === day
}
