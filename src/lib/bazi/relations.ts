/**
 * 命局关系:天干五合、地支六合/三合/三会、六冲/刑/害/破。
 * 全部为通行数据表 + 查询纯函数;relationsOf 在命盘中检测存在的关系。
 * 边界(页面已声明):不判定合化条件、不判定成局吉凶;
 * 三合/三会两字即报并标 complete=false(半合/半会);刑按通行表(有向)+ 自刑。
 */
import type { BaziRelations, EnrichedBaziChart, PillarName, Wuxing } from './types'

// ── 数据表 ──

/** 天干五合(化出五行) */
export const STEM_COMBOS: readonly { a: number; b: number; element: Wuxing }[] = [
  { a: 0, b: 5, element: '土' }, // 甲己
  { a: 1, b: 6, element: '金' }, // 乙庚
  { a: 2, b: 7, element: '水' }, // 丙辛
  { a: 3, b: 8, element: '木' }, // 丁壬
  { a: 4, b: 9, element: '火' }, // 戊癸
]

/** 地支六合 */
export const BRANCH_COMBOS: readonly { a: number; b: number; element: Wuxing }[] = [
  { a: 0, b: 1, element: '土' }, // 子丑
  { a: 2, b: 11, element: '木' }, // 寅亥
  { a: 3, b: 10, element: '火' }, // 卯戌
  { a: 4, b: 9, element: '金' }, // 辰酉
  { a: 5, b: 8, element: '水' }, // 巳申
  { a: 6, b: 7, element: '土' }, // 午未
]

/** 三合局 */
export const HARMONIES: readonly { branches: readonly [number, number, number]; element: Wuxing }[] = [
  { branches: [8, 0, 4], element: '水' }, // 申子辰
  { branches: [11, 3, 7], element: '木' }, // 亥卯未
  { branches: [2, 6, 10], element: '火' }, // 寅午戌
  { branches: [5, 9, 1], element: '金' }, // 巳酉丑
]

/** 三会方 */
export const MEETINGS: readonly { branches: readonly [number, number, number]; element: Wuxing }[] = [
  { branches: [2, 3, 4], element: '木' }, // 寅卯辰
  { branches: [5, 6, 7], element: '火' }, // 巳午未
  { branches: [8, 9, 10], element: '金' }, // 申酉戌
  { branches: [11, 0, 1], element: '水' }, // 亥子丑
]

/** 三刑(有向)+ 自刑 */
export const PUNISHMENTS: readonly [number, number][] = [
  [2, 5], [5, 8], [8, 2], // 寅刑巳, 巳刑申, 申刑寅
  [1, 10], [10, 7], [7, 1], // 丑刑戌, 戌刑未, 未刑丑
  [0, 3], [3, 0], // 子卯互刑
  [4, 4], [6, 6], [9, 9], [11, 11], // 辰午酉亥自刑
]

/** 六害 */
export const HARMS: readonly [number, number][] = [
  [0, 7], // 子未
  [1, 6], // 丑午
  [2, 5], // 寅巳
  [3, 4], // 卯辰
  [8, 11], // 申亥
  [9, 10], // 酉戌
]

/** 六破 */
export const DESTRUCTIONS: readonly [number, number][] = [
  [0, 9], // 子酉
  [6, 3], // 午卯
  [4, 1], // 辰丑
  [10, 7], // 戌未
  [2, 11], // 寅亥
  [5, 8], // 巳申
]

// ── 查询 ──

/** 六冲(子午冲等):相冲支 = 本支 + 6 */
export function chongOf(branchIndex: number): number {
  return (((branchIndex + 6) % 12) + 12) % 12
}

/** 天干五合的另一干与化出五行 */
export function stemComboOf(stemIndex: number): { other: number; element: Wuxing } | null {
  const combo = STEM_COMBOS.find((c) => c.a === stemIndex || c.b === stemIndex)
  if (!combo) return null
  return { other: combo.a === stemIndex ? combo.b : combo.a, element: combo.element }
}

/** 地支六合的另支与合出五行 */
export function branchComboOf(branchIndex: number): { other: number; element: Wuxing } | null {
  const combo = BRANCH_COMBOS.find((c) => c.a === branchIndex || c.b === branchIndex)
  if (!combo) return null
  return { other: combo.a === branchIndex ? combo.b : combo.a, element: combo.element }
}

/** a 刑 b(有向,含自刑) */
export function isPunishment(a: number, b: number): boolean {
  return PUNISHMENTS.some(([x, y]) => x === a && y === b)
}

const pairIn = (list: readonly [number, number][], a: number, b: number) =>
  list.some(([x, y]) => (x === a && y === b) || (x === b && y === a))

// ── 命盘级检测 ──

/** 在四柱中检测全部关系 */
export function relationsOf(chart: EnrichedBaziChart): BaziRelations {
  const names = chart.pillars.map((p) => p.pillar.name)
  const stems = chart.pillars.map((p) => p.pillar.stem.index)
  const branches = chart.pillars.map((p) => p.pillar.branch.index)

  const stemCombos: BaziRelations['stemCombos'] = []
  const branchCombos: BaziRelations['branchCombos'] = []
  const clashes: BaziRelations['clashes'] = []
  const punishments: BaziRelations['punishments'] = []
  const harms: BaziRelations['harms'] = []
  const destructions: BaziRelations['destructions'] = []

  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      const sc = stemComboOf(stems[i])
      if (sc && sc.other === stems[j]) stemCombos.push({ a: names[i], b: names[j], element: sc.element })
      const bc = branchComboOf(branches[i])
      if (bc && bc.other === branches[j]) branchCombos.push({ a: names[i], b: names[j], element: bc.element })
      if (chongOf(branches[i]) === branches[j]) clashes.push({ a: names[i], b: names[j] })
      if (branches[i] === branches[j] && isPunishment(branches[i], branches[i])) {
        // 自刑:报两柱对一次
        punishments.push({ a: names[i], b: names[j] })
      } else {
        const p1 = isPunishment(branches[i], branches[j])
        const p2 = isPunishment(branches[j], branches[i])
        if (p1 && p2) {
          // 互刑(子卯):一对报一次
          punishments.push({ a: names[i], b: names[j] })
        } else if (p1) {
          punishments.push({ a: names[i], b: names[j] })
        } else if (p2) {
          punishments.push({ a: names[j], b: names[i] })
        }
      }
      if (pairIn(HARMS, branches[i], branches[j])) harms.push({ a: names[i], b: names[j] })
      if (pairIn(DESTRUCTIONS, branches[i], branches[j])) destructions.push({ a: names[i], b: names[j] })
    }
  }

  const groupOf = (groups: readonly { branches: readonly number[]; element: Wuxing }[]) => {
    const out: BaziRelations['harmonies'] = []
    for (const g of groups) {
      const members: PillarName[] = []
      const seen: number[] = []
      for (let i = 0; i < 4; i++) {
        // 按唯一地支计(午午等重复支不重复计入)
        if (g.branches.includes(branches[i]) && !seen.includes(branches[i])) {
          seen.push(branches[i])
          members.push(names[i])
        }
      }
      if (members.length >= 2) out.push({ members, element: g.element, complete: members.length === 3 })
    }
    return out
  }

  return {
    stemCombos,
    branchCombos,
    harmonies: groupOf(HARMONIES),
    meetings: groupOf(MEETINGS),
    clashes,
    punishments,
    harms,
    destructions,
  }
}
