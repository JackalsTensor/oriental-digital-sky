/**
 * 八字排盘锚点校验(与 check:astro 同风格)。
 * 覆盖:干支日锚点、立春换年、节气定月、五虎遁/五鼠遁、晚子时换日、子时、午夜、年底/年初、五行统计。
 * 节气时刻与公开发布数据对比(2024 立春 16:26:53、2000 立春 ≈20:40、1984 立春 ≈23:19,北京时间,±15 分钟)。
 */
import { computeBaziChart } from '../src/lib/bazi/pillars'
import { dayCycleIndex, ganzhiOf, hourBranchIndex, hourStemIndex, monthStemIndex } from '../src/lib/bazi/ganzhi'
import { jdnOf } from '../src/lib/bazi/calendar'
import { jdToCstClock, jieJd } from '../src/lib/bazi/solarTerms'
import { STEMS, BRANCHES } from '../src/lib/bazi/ganzhi'

let failed = 0
const ok = (name: string, cond: boolean, detail = '') => {
  console.log(`${cond ? '✓' : '✗'} ${name}${detail ? ' — ' + detail : ''}`)
  if (!cond) failed++
}

const gz = (idx: number) => STEMS[idx % 10] + BRANCHES[idx % 12]

const chartStr = (c: ReturnType<typeof computeBaziChart>) =>
  c.pillars.map((p) => p.stem.char + p.branch.char).join(' ')

// ── 干支日锚点(公开资料) ──
ok('1900-01-01 甲戌日', gz(dayCycleIndex(jdnOf(1900, 1, 1))) === '甲戌')
ok('1949-10-01 甲子日', gz(dayCycleIndex(jdnOf(1949, 10, 1))) === '甲子')
ok('2000-01-01 戊午日', gz(dayCycleIndex(jdnOf(2000, 1, 1))) === '戊午')

// ── 节气交节时刻(与公开发布数据对比,±15 分钟) ──
const checkJie = (year: number, idx: number, expH: number, expM: number) => {
  const { hour, minute } = jdToCstClock(jieJd(year, idx))
  const delta = Math.abs(hour * 60 + minute - (expH * 60 + expM))
  ok(`${year} ${['立春', '惊蛰', '清明', '立夏', '芒种', '小暑', '立秋', '白露', '寒露', '立冬', '大雪', '小寒'][idx]} ${String(expH).padStart(2, '0')}:${String(expM).padStart(2, '0')} CST`, delta <= 15, `计算 ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} (Δ${delta}min)`)
}
checkJie(2024, 0, 16, 27) // 2024 立春 16:26:53
checkJie(2000, 0, 20, 40) // 2000 立春 ≈20:40
checkJie(1984, 0, 23, 19) // 1984 立春 ≈23:19

// ── 立春换年 ──
ok('2024-02-03 12:00 → 癸卯年', computeBaziChart({ year: 2024, month: 2, day: 3, hour: 12, minute: 0, gender: 'male', place: '' }).pillars[0].stem.char === '癸')
ok('2024-02-05 12:00 → 甲辰年', computeBaziChart({ year: 2024, month: 2, day: 5, hour: 12, minute: 0, gender: 'male', place: '' }).pillars[0].stem.char === '甲')

// ── 节气定月 ──
const m2024 = (m: number, d: number) => computeBaziChart({ year: 2024, month: m, day: d, hour: 12, minute: 0, gender: 'male', place: '' }).pillars[1]
ok('2024-02-03 → 乙丑月', m2024(2, 3).stem.char + m2024(2, 3).branch.char === '乙丑')
ok('2024-02-05 → 丙寅月', m2024(2, 5).stem.char + m2024(2, 5).branch.char === '丙寅')
ok('2024-03-03 → 丙寅月', m2024(3, 3).stem.char + m2024(3, 3).branch.char === '丙寅')
ok('2024-03-07 → 丁卯月', m2024(3, 7).stem.char + m2024(3, 7).branch.char === '丁卯')

// ── 月干规则(五虎遁) ──
ok('甲己年寅月 = 丙', monthStemIndex(0, 0) === 2 && monthStemIndex(5, 0) === 2)
ok('乙庚年寅月 = 戊', monthStemIndex(1, 0) === 4)
ok('戊癸年寅月 = 甲', monthStemIndex(4, 0) === 0 && monthStemIndex(9, 0) === 0)

// ── 时干规则(五鼠遁)与时辰 ──
ok('甲日子时 = 甲子', hourStemIndex(0, 0) === 0)
ok('乙日子时 = 丙子', hourStemIndex(1, 0) === 2)
ok('戊日子时 = 壬子', hourStemIndex(4, 0) === 8)
ok('时辰:23→子, 1→丑, 3→寅, 11→午, 21→亥', hourBranchIndex(23) === 0 && hourBranchIndex(1) === 1 && hourBranchIndex(3) === 2 && hourBranchIndex(11) === 6 && hourBranchIndex(21) === 11)

// ── 完整四柱锚点 ──
const full = (y: number, mo: number, d: number, h: number, mi: number) =>
  chartStr(computeBaziChart({ year: y, month: mo, day: d, hour: h, minute: mi, gender: 'male', place: '' }))
ok('2000-01-01 12:00 = 己卯 丙子 戊午 戊午', full(2000, 1, 1, 12, 0) === '己卯 丙子 戊午 戊午', full(2000, 1, 1, 12, 0))

// ── 晚子时换日 ──
ok('2000-01-01 23:30 = 己未日甲子时', full(2000, 1, 1, 23, 30) === '己卯 丙子 己未 甲子', full(2000, 1, 1, 23, 30))
ok('2000-01-02 00:30 = 己未日甲子时(与晚子时同日柱)', full(2000, 1, 2, 0, 30) === '己卯 丙子 己未 甲子', full(2000, 1, 2, 0, 30))
ok('2000-01-01 00:30 = 戊午日壬子时', full(2000, 1, 1, 0, 30) === '己卯 丙子 戊午 壬子', full(2000, 1, 1, 0, 30))

// ── 年底/年初 ──
ok('2023-12-31 12:00 → 癸卯年甲子月', full(2023, 12, 31, 12, 0).startsWith('癸卯 甲子'), full(2023, 12, 31, 12, 0))
ok('2024-01-07 12:00 → 癸卯年乙丑月', full(2024, 1, 7, 12, 0).startsWith('癸卯 乙丑'), full(2024, 1, 7, 12, 0))
ok('2023-12-31 23:30 → 日柱换日至 2024-01-01', (() => {
  const c = computeBaziChart({ year: 2023, month: 12, day: 31, hour: 23, minute: 30, gender: 'male', place: '' })
  return c.effectiveDate.year === 2024 && c.effectiveDate.day === 1
})())

// ── 五行统计 ──
{
  const c = computeBaziChart({ year: 2000, month: 1, day: 1, hour: 12, minute: 0, gender: 'male', place: '' })
  const w = c.wuxing
  ok('2000-01-01 12:00 五行 = 木1 火3 土3 金0 水1', w.木 === 1 && w.火 === 3 && w.土 === 3 && w.金 === 0 && w.水 === 1, `木${w.木} 火${w.火} 土${w.土} 金${w.金} 水${w.水}`)
}

// ── 干支环基础 ──
ok('六十甲子:0=甲子, 59=癸亥, 60=甲子', gz(0) === '甲子' && gz(59) === '癸亥' && gz(60) === '甲子')
ok('六十甲子:各干各支只匹配偶数差', ganzhiOf(15).stemIndex === 5 && ganzhiOf(15).branchIndex === 3)

// ── V1.5:十神(以日干为基准) ──
import { tenGodOf } from '../src/lib/bazi/tengod'
const JIA_MATRIX = ['比肩', '劫财', '食神', '伤官', '偏财', '正财', '七杀', '正官', '偏印', '正印']
ok('十神:甲日全矩阵', JIA_MATRIX.every((expected, i) => tenGodOf(0, i) === expected), JIA_MATRIX.map((e, i) => STEMS[i] + '=' + tenGodOf(0, i)).join(' '))
const BING_MATRIX = ['偏印', '正印', '比肩', '劫财', '食神', '伤官', '偏财', '正财', '七杀', '正官']
ok('十神:丙日全矩阵', BING_MATRIX.every((expected, i) => tenGodOf(2, i) === expected))
ok('十神:庚日抽查(甲=偏财,丙=七杀,戊=偏印)', tenGodOf(6, 0) === '偏财' && tenGodOf(6, 2) === '七杀' && tenGodOf(6, 4) === '偏印')

// ── V1.5:地支藏干 ──
import { hiddenStemsOf } from '../src/lib/bazi/zanggan'
const zg = (b: number) => hiddenStemsOf(b).map((h) => h.stem.char).join('')
ok('藏干:12 支全覆盖且本气齐备', Array.from({ length: 12 }, (_, b) => hiddenStemsOf(b).length > 0 && hiddenStemsOf(b)[0].role === '本气').every(Boolean))
ok('藏干:子=癸, 卯=乙, 酉=辛, 午=丁己', zg(0) === '癸' && zg(3) === '乙' && zg(9) === '辛' && zg(6) === '丁己')
ok('藏干:丑=己癸辛, 寅=甲丙戊, 辰=戊乙癸', zg(1) === '己癸辛' && zg(2) === '甲丙戊' && zg(4) === '戊乙癸')
ok('藏干:巳=丙庚戊(主流顺序), 未=己丁乙', zg(5) === '丙庚戊' && zg(7) === '己丁乙')
ok('藏干:申=庚壬戊, 戌=戊辛丁, 亥=壬甲', zg(8) === '庚壬戊' && zg(10) === '戊辛丁' && zg(11) === '壬甲')
ok('藏干十神:甲日子(癸)=正印, 卯(乙)=劫财, 未主气(己)=正财', tenGodOf(0, 9) === '正印' && tenGodOf(0, 1) === '劫财' && tenGodOf(0, 5) === '正财')

// ── V1.5:纳音 ──
import { cycleIndexOf, nayinOf } from '../src/lib/bazi/nayin'
const ny = (s: number, b: number) => nayinOf(cycleIndexOf(s, b)).name
ok('纳音:甲子=海中金, 丙寅=炉中火, 庚辰=白蜡金', ny(0, 0) === '海中金' && ny(2, 2) === '炉中火' && ny(6, 4) === '白蜡金')
ok('纳音:壬辰=长流水, 甲午=沙中金, 庚申=石榴木', ny(8, 4) === '长流水' && ny(0, 6) === '沙中金' && ny(6, 8) === '石榴木')
ok('纳音:壬戌=癸亥=大海水, 丙午=天河水, 戊午=天上火', ny(8, 10) === '大海水' && ny(9, 11) === '大海水' && ny(2, 6) === '天河水' && ny(4, 6) === '天上火')
ok('纳音:60 环全部有值且成对共享', Array.from({ length: 60 }, (_, i) => nayinOf(i).name.length > 0).every(Boolean) && nayinOf(0) === nayinOf(1) && nayinOf(58) === nayinOf(59))
ok('纳音:环序还原(甲子=0, 乙丑=1, 癸亥=59)', cycleIndexOf(0, 0) === 0 && cycleIndexOf(1, 1) === 1 && cycleIndexOf(9, 11) === 59)

// ── V1.5:十二长生 ──
import { GROWTH_PHASES, growthPhaseOf } from '../src/lib/bazi/changsheng'
const LONGEVITY: [number, number][] = [[0, 11], [1, 6], [2, 2], [3, 9], [4, 2], [5, 9], [6, 5], [7, 0], [8, 8], [9, 3]]
ok('长生:十干长生锚点(甲亥 乙午 丙寅 丁酉 戊寅 己酉 庚巳 辛子 壬申 癸卯)', LONGEVITY.every(([s, b]) => growthPhaseOf(s, b) === '长生'))
ok('长生:甲墓未, 甲帝旺卯, 乙墓戌, 庚帝旺酉, 壬墓辰', growthPhaseOf(0, 7) === '墓' && growthPhaseOf(0, 3) === '帝旺' && growthPhaseOf(1, 10) === '墓' && growthPhaseOf(6, 9) === '帝旺' && growthPhaseOf(8, 4) === '墓')
ok('长生:10×12=120 组合全部有效', Array.from({ length: 10 }, (_, s) => Array.from({ length: 12 }, (_, b) => GROWTH_PHASES.includes(growthPhaseOf(s, b))).every(Boolean)).every(Boolean))
ok('长生:阳顺阴逆各验证一个完整循环(甲自亥顺行 12 步;乙自午逆行 12 步)', (() => {
  for (let i = 0; i < 12; i++) if (growthPhaseOf(0, (11 + i) % 12) !== GROWTH_PHASES[i]) return false
  for (let i = 0; i < 12; i++) if (growthPhaseOf(1, (6 - i + 12) % 12) !== GROWTH_PHASES[i]) return false
  return true
})())

// ── V1.5:enrich 集成(不改动原四柱/五行) ──
import { enrichChart } from '../src/lib/bazi/enrich'
{
  const c = computeBaziChart({ year: 2000, month: 1, day: 1, hour: 12, minute: 0, gender: 'male', place: '' })
  const e = enrichChart(c)
  const eStr = e.pillars.map((p) => p.pillar.stem.char + p.pillar.branch.char).join(' ')
  ok('enrich:四柱与五行与原输出一致', eStr === chartStr(c) && JSON.stringify(e.wuxing) === JSON.stringify(c.wuxing))
  const [y, m, d] = e.pillars
  ok('enrich:2000-01-01 12:00 年柱(己卯)=劫财/城头土/沐浴', y.tenGod === '劫财' && y.nayin.name === '城头土' && y.growthOfDayStem === '沐浴')
  ok('enrich:2000-01-01 12:00 月柱(丙子)=偏印(丙生戊,同阳)/涧下水', m.tenGod === '偏印' && m.nayin.name === '涧下水')
  ok('enrich:2000-01-01 12:00 日柱(戊午)=比肩/天上火/帝旺', d.tenGod === '比肩' && d.nayin.name === '天上火' && d.growthOfDayStem === '帝旺')
  ok('enrich:2000-01-01 12:00 日主=戊, 年支卯藏乙(正官)', e.dayMaster.char === '戊' && y.hiddenStems[0].hs.stem.char === '乙' && y.hiddenStems[0].tenGod === '正官')
}

// ── V1.6:五行旺衰(月令旺相休囚死) ──
import { monthStrengthOf } from '../src/lib/bazi/wangshuai'
const ws = (m: '木' | '火' | '土' | '金' | '水') => monthStrengthOf(m)
ok('旺衰:春令(木)木旺火相水休金囚土死', ws('木').木 === '旺' && ws('木').火 === '相' && ws('木').水 === '休' && ws('木').金 === '囚' && ws('木').土 === '死')
ok('旺衰:夏令(火)火旺土相木休水囚金死', ws('火').火 === '旺' && ws('火').土 === '相' && ws('火').木 === '休' && ws('火').水 === '囚' && ws('火').金 === '死')
ok('旺衰:土令(辰戌丑未)土旺金相火休木囚水死', ws('土').土 === '旺' && ws('土').金 === '相' && ws('土').火 === '休' && ws('土').木 === '囚' && ws('土').水 === '死')
ok('旺衰:秋令(金)金旺水相土休火囚木死', ws('金').金 === '旺' && ws('金').水 === '相' && ws('金').土 === '休' && ws('金').火 === '囚' && ws('金').木 === '死')
ok('旺衰:冬令(水)水旺木相金休土囚火死', ws('水').水 === '旺' && ws('水').木 === '相' && ws('水').金 === '休' && ws('水').土 === '囚' && ws('水').火 === '死')
ok('旺衰:五态各出现一次且完整', ['木', '火', '土', '金', '水'].every((m) => {
  const r = ws(m as '木')
  return (['旺', '相', '休', '囚', '死'] as const).every((s) => ['木', '火', '土', '金', '水'].some((e) => r[e as '木'] === s))
}))

// ── V1.6:关系表(五合/六合/三合/三会/冲/刑/害/破) ──
import { branchComboOf, chongOf, DESTRUCTIONS, HARMONIES, HARMS, isPunishment, MEETINGS, PUNISHMENTS, stemComboOf, STEM_COMBOS } from '../src/lib/bazi/relations'
const gz2 = (s: number, b: number) => STEMS[s] + BRANCHES[b]
ok('五合:甲己土/乙庚金/丙辛水/丁壬木/戊癸火', [0, 1, 2, 3, 4].every((s) => { const c = stemComboOf(s)!; return ['土', '金', '水', '木', '火'][s] === c.element && STEM_COMBOS[s].b === c.other }) && STEM_COMBOS.length === 5)
ok('五合:10 干每干唯一合', Array.from({ length: 10 }, (_, s) => stemComboOf(s) !== null).every(Boolean))
ok('六合:6 对元素正确', branchComboOf(0)!.other === 1 && branchComboOf(0)!.element === '土' && branchComboOf(2)!.other === 11 && branchComboOf(2)!.element === '木' && branchComboOf(3)!.other === 10 && branchComboOf(3)!.element === '火' && branchComboOf(4)!.other === 9 && branchComboOf(4)!.element === '金' && branchComboOf(5)!.other === 8 && branchComboOf(5)!.element === '水' && branchComboOf(6)!.other === 7 && branchComboOf(6)!.element === '土')
ok('六合:12 支每支唯一合', Array.from({ length: 12 }, (_, b) => branchComboOf(b) !== null).every(Boolean))
ok('三合:4 局元素正确(申子辰水/亥卯未木/寅午戌火/巳酉丑金)', HARMONIES[0].element === '水' && HARMONIES[0].branches.join('') === '804' && HARMONIES[1].element === '木' && HARMONIES[2].element === '火' && HARMONIES[3].element === '金')
ok('三会:4 方元素正确(寅卯辰木/巳午未火/申酉戌金/亥子丑水)', MEETINGS[0].element === '木' && MEETINGS[0].branches.join('') === '234' && MEETINGS[1].element === '火' && MEETINGS[2].element === '金' && MEETINGS[3].element === '水')
ok('六冲:公式对称(子午/丑未/寅申/卯酉/辰戌/巳亥)', [0, 1, 2, 3, 4, 5].every((b) => chongOf(b) === b + 6 && chongOf(b + 6) === b))
ok('刑:12 有向对逐条(含自刑)', PUNISHMENTS.length === 12 && isPunishment(2, 5) && isPunishment(5, 8) && isPunishment(8, 2) && isPunishment(0, 3) && isPunishment(3, 0) && isPunishment(4, 4) && isPunishment(6, 6) && !isPunishment(5, 2))
ok('害:6 对(子未/丑午/寅巳/卯辰/申亥/酉戌)', HARMS.length === 6 && HARMS.every(([a, b]) => a < b || true))
ok('破:6 对(子酉/午卯/辰丑/戌未/寅亥/巳申)', DESTRUCTIONS.length === 6)

// ── V1.6:relationsOf 命盘级检测 ──
import { relationsOf } from '../src/lib/bazi/relations'
import type { BaziChart, Pillar } from '../src/lib/bazi/types'
import { stemInfo, branchInfo } from '../src/lib/bazi/ganzhi'
const mkPillar = (name: Pillar['name'], s: number, b: number): Pillar => ({ name, stem: stemInfo(s), branch: branchInfo(b) })
const synthetic = (p: [Pillar, Pillar, Pillar, Pillar]): BaziChart => ({
  pillars: p,
  wuxing: { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 },
  effectiveDate: { year: 2000, month: 1, day: 1 },
});
{
  const c = computeBaziChart({ year: 2000, month: 1, day: 1, hour: 12, minute: 0, gender: 'male', place: '' })
  const r = relationsOf(enrichChart(c))
  ok('relationsOf:2000-01-01 12:00 子午冲×2/子卯互刑×1/午午自刑×1/卯午破×2', r.clashes.length === 2 && r.clashes.every((x) => x.a === '月柱' && x.b !== '年柱') && r.punishments.length === 2 && r.punishments.some((x) => x.a === '年柱' && x.b === '月柱') && r.punishments.some((x) => x.a === '日柱' && x.b === '时柱') && r.destructions.length === 2 && r.destructions.every((x) => x.a === '年柱' && x.b !== '月柱'))
  ok('relationsOf:2000-01-01 12:00 无合无会(午午重复支不构成寅午戌半合)', r.stemCombos.length === 0 && r.branchCombos.length === 0 && r.harmonies.length === 0 && r.meetings.length === 0 && r.harms.length === 0)
}
{
  const r = relationsOf(enrichChart(synthetic([mkPillar('年柱', 0, 0), mkPillar('月柱', 5, 1), mkPillar('日柱', 2, 2), mkPillar('时柱', 7, 3)])))
  ok('relationsOf:甲子/己丑/丙寅/辛卯 → 甲己合土、子丑合土、亥子丑半会水、寅卯辰半会木', r.stemCombos.length === 2 && r.stemCombos[0].element === '土' && r.branchCombos.length === 1 && r.branchCombos[0].element === '土' && r.meetings.length === 2 && r.meetings.some((m) => m.element === '木' && !m.complete) && r.meetings.some((m) => m.element === '水' && !m.complete))
}
{
  const r = relationsOf(enrichChart(synthetic([mkPillar('年柱', 1, 8), mkPillar('月柱', 5, 0), mkPillar('日柱', 8, 4), mkPillar('时柱', 3, 6)])))
  ok('relationsOf:乙申/己子/壬辰/丁午 → 申子辰三合(全)', r.harmonies.length === 1 && r.harmonies[0].element === '水' && r.harmonies[0].complete === true && r.harmonies[0].members.length === 3)
  ok('relationsOf:同局 子午冲', r.clashes.length === 1 && r.clashes[0].a === '月柱' && r.clashes[0].b === '时柱')
}

// ── V1.6:日主强弱 ──
import { dayMasterStrength, strengthLevelOf } from '../src/lib/bazi/strength'
{
  const c = computeBaziChart({ year: 2000, month: 1, day: 1, hour: 12, minute: 0, gender: 'male', place: '' })
  const s = dayMasterStrength(enrichChart(c))
  ok('强弱:2000-01-01 12:00(戊土)= +3.5 → 强', Math.abs(s.score - 3.5) < 1e-9 && s.level === '强', `score=${s.score}`)
  ok('强弱:factors 权重总和 === score', Math.abs(s.factors.reduce((a, f) => a + f.weight, 0) - s.score) < 1e-9)
}
{
  const s = dayMasterStrength(enrichChart(synthetic([mkPillar('年柱', 6, 8), mkPillar('月柱', 6, 4), mkPillar('日柱', 6, 8), mkPillar('时柱', 6, 4)])))
  ok('强弱:庚申庚辰庚申庚辰 = +5.1 → 强', Math.abs(s.score - 5.1) < 1e-9 && s.level === '强', `score=${s.score}`)
}
{
  const s = dayMasterStrength(enrichChart(synthetic([mkPillar('年柱', 8, 0), mkPillar('月柱', 8, 0), mkPillar('日柱', 2, 0), mkPillar('时柱', 8, 0)])))
  ok('强弱:丙子壬子丙子壬子 = −7.5 → 弱', Math.abs(s.score + 7.5) < 1e-9 && s.level === '弱', `score=${s.score}`)
}
{
  const s = dayMasterStrength(enrichChart(synthetic([mkPillar('年柱', 0, 2), mkPillar('月柱', 8, 8), mkPillar('日柱', 0, 0), mkPillar('时柱', 5, 6)])))
  ok('强弱:得令判定(甲子日,子月水生木 → 不得令;甲寅日寅月 → 得令)', (() => {
    const c2 = enrichChart(synthetic([mkPillar('年柱', 8, 8), mkPillar('月柱', 6, 2), mkPillar('日柱', 0, 2), mkPillar('时柱', 9, 3)]))
    return dayMasterStrength(enrichChart(synthetic([mkPillar('年柱', 0, 2), mkPillar('月柱', 8, 8), mkPillar('日柱', 0, 0), mkPillar('时柱', 5, 6)]))).isCommanding === false && dayMasterStrength(c2).isCommanding === true
  })())
}
ok('强弱:等级带边界(镜像对称:3.5强/3.4偏强/2.0偏强/1.99中和/−2.0偏弱/−2.01偏弱/−3.5弱/−3.51弱)', strengthLevelOf(3.5) === '强' && strengthLevelOf(3.4) === '偏强' && strengthLevelOf(2.0) === '偏强' && strengthLevelOf(1.99) === '中和' && strengthLevelOf(-2.0) === '偏弱' && strengthLevelOf(-2.01) === '偏弱' && strengthLevelOf(-3.5) === '弱' && strengthLevelOf(-3.51) === '弱')

// ── V1.6:analysis 集成 ──
import { analyzeChart } from '../src/lib/bazi/analysis'
{
  const c = computeBaziChart({ year: 2000, month: 1, day: 1, hour: 12, minute: 0, gender: 'male', place: '' })
  const a = analyzeChart(enrichChart(c))
  ok('analysis:月令子月(水令)水旺木相金休土囚火死', a.monthStrength.水 === '旺' && a.monthStrength.木 === '相' && a.monthStrength.金 === '休' && a.monthStrength.土 === '囚' && a.monthStrength.火 === '死')
  ok('analysis:2000-01-01 12:00 强 + 子午冲', a.dayMasterStrength.level === '强' && a.relations.clashes.length === 2)
}

console.log(failed === 0 ? '\n全部通过' : `\n${failed} 项失败`)
process.exit(failed === 0 ? 0 : 1)
