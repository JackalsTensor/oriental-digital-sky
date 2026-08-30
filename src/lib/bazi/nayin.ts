/**
 * 纳音五行(《三命通会》六十甲子纳音,共 30 组,每相邻两干支同纳音)。
 * 纯数据表 + 通用索引:nayinOf(cycleIndex) = 表[floor(idx/2)]。
 */
import type { Nayin } from './types'

const NAYIN_TABLE: readonly Nayin[] = [
  { name: '海中金', element: '金' }, // 0  甲子 乙丑
  { name: '炉中火', element: '火' }, // 1  丙寅 丁卯
  { name: '大林木', element: '木' }, // 2  戊辰 己巳
  { name: '路旁土', element: '土' }, // 3  庚午 辛未
  { name: '剑锋金', element: '金' }, // 4  壬申 癸酉
  { name: '山头火', element: '火' }, // 5  甲戌 乙亥
  { name: '涧下水', element: '水' }, // 6  丙子 丁丑
  { name: '城头土', element: '土' }, // 7  戊寅 己卯
  { name: '白蜡金', element: '金' }, // 8  庚辰 辛巳
  { name: '杨柳木', element: '木' }, // 9  壬午 癸未
  { name: '泉中水', element: '水' }, // 10 甲申 乙酉
  { name: '屋上土', element: '土' }, // 11 丙戌 丁亥
  { name: '霹雳火', element: '火' }, // 12 戊子 己丑
  { name: '松柏木', element: '木' }, // 13 庚寅 辛卯
  { name: '长流水', element: '水' }, // 14 壬辰 癸巳
  { name: '沙中金', element: '金' }, // 15 甲午 乙未
  { name: '山下火', element: '火' }, // 16 丙申 丁酉
  { name: '平地木', element: '木' }, // 17 戊戌 己亥
  { name: '壁上土', element: '土' }, // 18 庚子 辛丑
  { name: '金箔金', element: '金' }, // 19 壬寅 癸卯
  { name: '覆灯火', element: '火' }, // 20 甲辰 乙巳
  { name: '天河水', element: '水' }, // 21 丙午 丁未
  { name: '大驿土', element: '土' }, // 22 戊申 己酉
  { name: '钗钏金', element: '金' }, // 23 庚戌 辛亥
  { name: '桑柘木', element: '木' }, // 24 壬子 癸丑
  { name: '大溪水', element: '水' }, // 25 甲寅 乙卯
  { name: '沙中土', element: '土' }, // 26 丙辰 丁巳
  { name: '天上火', element: '火' }, // 27 戊午 己未
  { name: '石榴木', element: '木' }, // 28 庚申 辛酉
  { name: '大海水', element: '水' }, // 29 壬戌 癸亥
]

/** 六十甲子序号(0=甲子)的纳音 */
export function nayinOf(cycleIndex: number): Nayin {
  const i = ((cycleIndex % 60) + 60) % 60
  return NAYIN_TABLE[Math.floor(i / 2)]
}

/** 由干支序号求六十甲子环序号(0=甲子):满足 idx%10=stem 且 idx%12=branch 的 0–59 值 */
export function cycleIndexOf(stemIndex: number, branchIndex: number): number {
  const s = ((stemIndex % 10) + 10) % 10
  const b = ((branchIndex % 12) + 12) % 12
  for (let k = 0; k < 6; k++) {
    const idx = s + 10 * k
    if (idx % 12 === b) return idx
  }
  // 干支不构成合法组合(奇偶不符)时不会到达;兜底返回按干序
  return s
}
