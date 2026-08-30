/**
 * 八字排盘类型。
 * 历法约定(见 README 与页面说明):
 *  - 输入为公历,北京时间(UTC+8);
 *  - 年柱以立春换年,月柱以十二「节」定月;
 *  - 日柱用儒略日序数干支(已验证锚点:1900-01-01 甲戌、1949-10-01 甲子、2000-01-01 戊午);
 *  - 23:00–23:59 按「子初换日」计入次日(传统排盘规则);
 *  - 地点为文本记录,未做真太阳时/地方时换算(后续阶段)。
 */

export type Wuxing = '木' | '火' | '土' | '金' | '水'

export type YinYang = '阳' | '阴'

/** 天干(甲…癸) */
export interface StemInfo {
  char: string
  index: number
  wuxing: Wuxing
  yinYang: YinYang
}

/** 地支(子…亥) */
export interface BranchInfo {
  char: string
  index: number
  wuxing: Wuxing
  yinYang: YinYang
}

/** 一柱(干支) */
export interface Pillar {
  /** 柱名:年柱/月柱/日柱/时柱 */
  name: '年柱' | '月柱' | '日柱' | '时柱'
  stem: StemInfo
  branch: BranchInfo
}

/** 出生信息输入(公历,北京时间) */
export interface BaziInput {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  gender: 'male' | 'female'
  place: string
}

/** 排盘结果 */
export interface BaziChart {
  /** 四柱:年/月/日/时 */
  pillars: [Pillar, Pillar, Pillar, Pillar]
  /** 五行统计(八字共 8 字) */
  wuxing: Record<Wuxing, number>
  /** 排盘时使用的日柱日期(晚子时已换日) */
  effectiveDate: { year: number; month: number; day: number }
}

// ─────────── V1.5 派生层(十神 / 藏干 / 纳音 / 十二长生) ───────────

/** 十神(以日干为基准) */
export type TenGod = '比肩' | '劫财' | '食神' | '伤官' | '偏财' | '正财' | '七杀' | '正官' | '偏印' | '正印'

/** 纳音(干支对的纳音五行,每两干支同一纳音) */
export interface Nayin {
  name: string
  element: Wuxing
}

/** 十二长生相位 */
export type GrowthPhase =
  | '长生' | '沐浴' | '冠带' | '临官' | '帝旺'
  | '衰' | '病' | '死' | '墓' | '绝' | '胎' | '养'

/** 地支藏干(顺序即本气/中气/余气,不含权重数值) */
export interface HiddenStem {
  stem: StemInfo
  role: '本气' | '中气' | '余气'
}

/** 派生后的单柱 */
export interface EnrichedPillar {
  pillar: Pillar
  /** 柱干对日干的十神 */
  tenGod: TenGod
  /** 地支藏干(各带其十神) */
  hiddenStems: { hs: HiddenStem; tenGod: TenGod }[]
  /** 本柱干支的纳音 */
  nayin: Nayin
  /** 日干在此柱地支的十二长生相位 */
  growthOfDayStem: GrowthPhase
}

/** 派生后的完整命盘 */
export interface EnrichedBaziChart extends Omit<BaziChart, 'pillars'> {
  /** 日主(日柱天干) */
  dayMaster: StemInfo
  pillars: [EnrichedPillar, EnrichedPillar, EnrichedPillar, EnrichedPillar]
}

// ─────────── V1.6 分析层(旺衰 / 日主强弱 / 合冲刑害破) ───────────

/** 五行旺衰(月令旺相休囚死) */
export type WangShuai = '旺' | '相' | '休' | '囚' | '死'

/** 日主强弱等级 */
export type StrengthLevel = '强' | '偏强' | '中和' | '偏弱' | '弱'

/** 四柱位名 */
export type PillarName = '年柱' | '月柱' | '日柱' | '时柱'

/** 强弱打分明细项 */
export interface StrengthFactor {
  /** 如「月干 偏印」「月支 本气(×1.5)」 */
  label: string
  kind: '帮扶' | '克泄'
  /** 带符号的计入分数 */
  weight: number
  source: PillarName | '月令加成'
}

/** 日主强弱结果 */
export interface DayMasterStrength {
  score: number
  level: StrengthLevel
  factors: StrengthFactor[]
  /** 得令:月支本气五行与日主相同 */
  isCommanding: boolean
}

/** 命局关系汇总 */
export interface BaziRelations {
  /** 天干五合 */
  stemCombos: { a: PillarName; b: PillarName; element: Wuxing }[]
  /** 地支六合 */
  branchCombos: { a: PillarName; b: PillarName; element: Wuxing }[]
  /** 三合局(两字为半合,complete=false;不判定成局吉凶) */
  harmonies: { members: PillarName[]; element: Wuxing; complete: boolean }[]
  /** 三会方(同上) */
  meetings: { members: PillarName[]; element: Wuxing; complete: boolean }[]
  /** 六冲 */
  clashes: { a: PillarName; b: PillarName }[]
  /** 刑(有向)+ 自刑 */
  punishments: { a: PillarName; b: PillarName }[]
  /** 六害 */
  harms: { a: PillarName; b: PillarName }[]
  /** 六破 */
  destructions: { a: PillarName; b: PillarName }[]
}

/** 命局分析汇总(供 UI 与后续格局/喜用神/大运消费) */
export interface BaziAnalysis {
  /** 月令五行旺衰(五元素全映射) */
  monthStrength: Record<Wuxing, WangShuai>
  dayMasterStrength: DayMasterStrength
  relations: BaziRelations
}
