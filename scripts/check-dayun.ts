/**
 * 大运专项校验。
 * 覆盖:顺逆规则、月柱递进、三天一岁起运、节气边界、男女差异、阴阳年差异。
 */
import {
  computeBaziChart,
  computeDayun,
  dayunDirectionOf,
  dayunStartAgeFromDays,
  jdOfCst,
  yearJies,
  type BaziInput,
} from '../src/lib/bazi'

let failed = 0
const ok = (name: string, cond: boolean, detail = '') => {
  console.log(`${cond ? '✓' : '✗'} ${name}${detail ? ' — ' + detail : ''}`)
  if (!cond) failed++
}

const chart = (input: BaziInput) => computeBaziChart(input)
const gz = (input: BaziInput) => computeDayun(input, chart(input)).steps.map((s) => s.pillar.stem.char + s.pillar.branch.char)

const maleYang: BaziInput = { year: 2024, month: 2, day: 5, hour: 12, minute: 0, gender: 'male', place: '' }
const femaleYang: BaziInput = { ...maleYang, gender: 'female' }
const maleYin: BaziInput = { year: 2023, month: 12, day: 31, hour: 12, minute: 0, gender: 'male', place: '' }
const femaleYin: BaziInput = { ...maleYin, gender: 'female' }

ok('顺逆:阳年男顺', dayunDirectionOf(maleYang, chart(maleYang)) === 'forward')
ok('顺逆:阳年女逆', dayunDirectionOf(femaleYang, chart(femaleYang)) === 'backward')
ok('顺逆:阴年男逆', dayunDirectionOf(maleYin, chart(maleYin)) === 'backward')
ok('顺逆:阴年女顺', dayunDirectionOf(femaleYin, chart(femaleYin)) === 'forward')

ok('大运干支:阳男从月柱丙寅顺排第一步丁卯', gz(maleYang)[0] === '丁卯', gz(maleYang).slice(0, 4).join(' '))
ok('大运干支:阳女从月柱丙寅逆排第一步乙丑', gz(femaleYang)[0] === '乙丑', gz(femaleYang).slice(0, 4).join(' '))
ok('大运干支:后续每十年顺排递进', gz(maleYang).slice(0, 5).join(' ') === '丁卯 戊辰 己巳 庚午 辛未')
ok('大运干支:后续每十年逆排递进', gz(femaleYang).slice(0, 5).join(' ') === '乙丑 甲子 癸亥 壬戌 辛酉')
ok('大运干支:使用最终 BAZI 月柱', (() => {
  const c = chart(maleYang)
  const d = computeDayun(maleYang, c)
  return c.pillars[1].stem.char + c.pillars[1].branch.char === '丙寅' &&
    d.sourceMonthPillar === c.pillars[1] &&
    d.steps[0].pillar.stem.char + d.steps[0].pillar.branch.char === '丁卯'
})())

ok('起运换算:9天=3岁0月0日', (() => {
  const a = dayunStartAgeFromDays(9)
  return a.years === 3 && a.months === 0 && a.days === 0
})())
ok('起运换算:17天=5岁8月0日', (() => {
  const a = dayunStartAgeFromDays(17)
  return a.years === 5 && a.months === 8 && a.days === 0
})())
ok('起运换算:1小时≈5天(传统折算)', (() => {
  const a = dayunStartAgeFromDays(1 / 24)
  return a.years === 0 && a.months === 0 && a.days === 5
})())

{
  const nearBefore: BaziInput = { year: 2024, month: 2, day: 4, hour: 16, minute: 0, gender: 'male', place: '' }
  const nearAfter: BaziInput = { ...nearBefore, minute: 40 }
  const c1 = chart(nearBefore)
  const c2 = chart(nearAfter)
  const d1 = computeDayun(nearBefore, c1)
  const d2 = computeDayun(nearAfter, c2)
  ok('立春边界:16:00仍为癸卯年乙丑月', c1.pillars[0].stem.char + c1.pillars[0].branch.char === '癸卯' && c1.pillars[1].stem.char + c1.pillars[1].branch.char === '乙丑')
  ok('立春边界:16:40转为甲辰年丙寅月', c2.pillars[0].stem.char + c2.pillars[0].branch.char === '甲辰' && c2.pillars[1].stem.char + c2.pillars[1].branch.char === '丙寅')
  ok('立春边界:月柱变化后第一柱跟随月柱', d1.steps[0].pillar.stem.char + d1.steps[0].pillar.branch.char === '甲子' && d2.steps[0].pillar.stem.char + d2.steps[0].pillar.branch.char === '丁卯')
}

{
  const beforeJingzhe: BaziInput = { year: 2024, month: 3, day: 5, hour: 9, minute: 0, gender: 'male', place: '' }
  const afterJingzhe: BaziInput = { year: 2024, month: 3, day: 5, hour: 12, minute: 0, gender: 'male', place: '' }
  const c1 = chart(beforeJingzhe)
  const c2 = chart(afterJingzhe)
  ok('节气切换:惊蛰前后月柱不同', c1.pillars[1].branch.char === '寅' && c2.pillars[1].branch.char === '卯')
  ok('节气切换:大运第一柱跟随最终月柱', gz(beforeJingzhe)[0] === '丁卯' && gz(afterJingzhe)[0] === '戊辰')
}

{
  const lateZi: BaziInput = { year: 2023, month: 12, day: 31, hour: 23, minute: 30, gender: 'male', place: '' }
  const c = chart(lateZi)
  const d = computeDayun(lateZi, c)
  ok('子时:日柱换日至次日但月柱保持甲子', c.effectiveDate.year === 2024 && c.pillars[1].stem.char + c.pillars[1].branch.char === '甲子')
  ok('子时:阴年男逆排第一步癸亥', d.direction === 'backward' && d.steps[0].pillar.stem.char + d.steps[0].pillar.branch.char === '癸亥')
}

{
  const input: BaziInput = { year: 2024, month: 2, day: 5, hour: 12, minute: 0, gender: 'male', place: '' }
  const d = computeDayun(input, chart(input))
  const jingzhe = yearJies(2024)[1]
  const expectedDays = jingzhe.jd - jdOfCst(input.year, input.month, input.day, input.hour, input.minute)
  ok('起运计算:顺排取后一个节(惊蛰)', d.targetTerm.name === '惊蛰' && Math.abs(d.daysToTerm - expectedDays) < 1e-9)
  ok('起运计算:起运年龄由节气日差确定', Math.abs(d.startAge.totalMonths - d.daysToTerm * 4) < 1 / 30)
  ok('起运日期:后续大运每十年换运', d.steps[1].startAge.years - d.steps[0].startAge.years === 10 && d.steps[1].startDate.year - d.steps[0].startDate.year === 10)
}

console.log(failed === 0 ? '\n大运校验全部通过' : `\n${failed} 项失败`)
process.exit(failed === 0 ? 0 : 1)
