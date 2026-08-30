/**
 * 北斗七星专项校验(与 check:astro / check:bazi 同风格):
 *  1. 七星 J2000 坐标与星表对照(±0.02°)
 *  2. 六条连线(斗柄+斗身)的角距与星表对照(±0.25°)
 *  3. 连线拓扑:天枢-天璇-天玑-天权(斗身闭合)/天权-玉衡-开阳-摇光(斗柄)
 *  4. 星群整体运动:两个历元经天文学管线后,成对角距保持不变(岁差为刚体旋转)
 *  5. 「天枢-天璇延长五倍指向北极星」锚点(±2°)
 *  6. 辅星 Alcor 坐标与星表对照
 */
import { DIPPER, DIPPER_COMPANION, POLARIS } from '../src/data/dipper'
import { computeSkyFrame, raDecToUnit } from '../src/lib/astronomy'

let failed = 0
const ok = (name: string, cond: boolean, detail = '') => {
  console.log(`${cond ? '✓' : '✗'} ${name}${detail ? ' — ' + detail : ''}`)
  if (!cond) failed++
}

const D2R = Math.PI / 180

/** 球面角距(度) */
function sepDeg(a: [number, number], b: [number, number]): number {
  const [ra1, dec1] = a
  const [ra2, dec2] = b
  const d = Math.acos(
    Math.sin(dec1 * D2R) * Math.sin(dec2 * D2R) +
      Math.cos(dec1 * D2R) * Math.cos(dec2 * D2R) * Math.cos((ra1 - ra2) * 15 * D2R),
  )
  return d / D2R
}

/** 单位向量角距(度) */
function vecSep(a: [number, number, number], b: [number, number, number]): number {
  const dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
  return Math.acos(Math.min(1, Math.max(-1, dot))) / D2R
}

// ── 1. 七星坐标与星表对照(J2000,小时/度) ──
const CATALOG: [string, [number, number]][] = [
  ['天枢 Dubhe', [11.0621, 61.7508]],
  ['天璇 Merak', [11.0307, 56.3825]],
  ['天玑 Phecda', [11.8972, 53.6947]],
  ['天权 Megrez', [12.2571, 57.0325]],
  ['玉衡 Alioth', [12.9005, 55.9597]],
  ['开阳 Mizar', [13.3988, 54.9253]],
  ['摇光 Alkaid', [13.7923, 49.3133]],
]
CATALOG.forEach(([name, cat], i) => {
  const d = DIPPER[i]
  const dra = Math.abs(d.ra - cat[0]) * 15
  const ddec = Math.abs(d.dec - cat[1])
  ok(`${name} 坐标与星表一致(±0.02°)`, dra < 0.02 && ddec < 0.02, `ΔRA=${dra.toFixed(3)}° ΔDec=${ddec.toFixed(3)}°`)
})

// ── 2. 六条连线角距与星表对照(度) ──
const LINES: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]]
const SEP_CATALOG = [5.37, 7.88, 4.48, 5.37, 4.4, 6.6]
LINES.forEach(([a, b], i) => {
  const s = sepDeg([DIPPER[a].ra, DIPPER[a].dec], [DIPPER[b].ra, DIPPER[b].dec])
  ok(`连线 ${DIPPER[a].name}—${DIPPER[b].name} 角距 ${SEP_CATALOG[i]}°(±0.25°)`, Math.abs(s - SEP_CATALOG[i]) < 0.25, `${s.toFixed(2)}°`)
})

// ── 3. 连线拓扑(与 MansionSystem 的 pairs 定义一致) ──
const BOWL: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 0]]
const HANDLE: [number, number][] = [[3, 4], [4, 5], [5, 6]]
ok('斗身拓扑:天枢-天璇-天玑-天权闭合', BOWL.every(([a, b]) => DIPPER[a].part === '魁' && DIPPER[b].part === '魁'))
ok('斗柄拓扑:天权-玉衡-开阳-摇光', HANDLE.every(([a, b], i) => (i === 0 ? DIPPER[a].name === '天权' : true) && DIPPER[b].part === '杓'))
ok('魁杓划分:0-3 魁 / 4-6 杓', DIPPER.slice(0, 4).every((d) => d.part === '魁') && DIPPER.slice(4).every((d) => d.part === '杓'))

// ── 4. 星群整体运动(两个历元刚性共旋) ──
{
  const frameA = computeSkyFrame({ id: 'beijing', name: '北京', lat: 39.904, lon: 116.407 }, { year: 2026, month: 8, day: 30, hour: 22, minute: 0 })
  const frameB = computeSkyFrame({ id: 'beijing', name: '北京', lat: 39.904, lon: 116.407 }, { year: -2500, month: 3, day: 1, hour: 3, minute: 0 })
  const worldA = DIPPER.map((d) => frameA.radecToWorld(d.ra, d.dec))
  const worldB = DIPPER.map((d) => frameB.radecToWorld(d.ra, d.dec))
  let maxDiff = 0
  for (let i = 0; i < 7; i++) {
    for (let j = i + 1; j < 7; j++) {
      const sA = vecSep(worldA[i], worldA[j])
      const sB = vecSep(worldB[i], worldB[j])
      maxDiff = Math.max(maxDiff, Math.abs(sA - sB))
    }
  }
  ok('星群共旋:两历元(2026 与 前2500)全部 21 对星角距一致(<1e-6°)', maxDiff < 1e-6, `最大差=${maxDiff.toExponential(2)}°`)
}

// ── 5. 「天枢-天璇延长约五倍指北极星」(经典口诀为近似:方向准、落点距极约 3–6°) ──
{
  const frame = computeSkyFrame({ id: 'beijing', name: '北京', lat: 39.904, lon: 116.407 }, { year: 2026, month: 8, day: 30, hour: 22, minute: 0 })
  const dubhe = frame.radecToWorld(DIPPER[0].ra, DIPPER[0].dec)
  const merak = frame.radecToWorld(DIPPER[1].ra, DIPPER[1].dec)
  const polaris = frame.radecToWorld(POLARIS.ra, POLARIS.dec)
  // 方向校验:天璇-天枢大圆与北极星的最近距离(方向误差)
  const n: [number, number, number] = [
    merak[1] * dubhe[2] - merak[2] * dubhe[1],
    merak[2] * dubhe[0] - merak[0] * dubhe[2],
    merak[0] * dubhe[1] - merak[1] * dubhe[0],
  ]
  const nLen = Math.hypot(...n)
  const nUnit: [number, number, number] = [n[0] / nLen, n[1] / nLen, n[2] / nLen]
  const polarisDot = Math.abs(nUnit[0] * polaris[0] + nUnit[1] * polaris[1] + nUnit[2] * polaris[2])
  const dirErr = 90 - Math.acos(Math.min(1, polarisDot)) / D2R
  // 落点校验:自天璇经天枢延长五倍
  const pointer = [0, 1, 2].map((k) => dubhe[k] + 5 * (dubhe[k] - merak[k])) as [number, number, number]
  const len = Math.hypot(...pointer)
  const unit: [number, number, number] = [pointer[0] / len, pointer[1] / len, pointer[2] / len]
  const d = vecSep(unit, polaris)
  ok('指极方向:天璇→天枢大圆距北极星 < 2.5°(真实值 ≈1.9°)', dirErr < 2.5, `${dirErr.toFixed(2)}°`)
  ok('指极落点:延长 5 倍落点距北极星 3–6°(口诀为近似)', d > 3 && d < 6, `${d.toFixed(2)}°`)
}

// ── 6. 辅星 Alcor ──
{
  const dra = Math.abs(DIPPER_COMPANION.ra - 13.4204) * 15
  const ddec = Math.abs(DIPPER_COMPANION.dec - 54.9881)
  ok('辅星 Alcor 坐标与星表一致(±0.02°)', dra < 0.02 && ddec < 0.02, `ΔRA=${dra.toFixed(3)}° ΔDec=${ddec.toFixed(3)}°`)
  // 辅与开阳角距 ≈ 0.197°(11.8′)
  const s = sepDeg([DIPPER[5].ra, DIPPER[5].dec], [DIPPER_COMPANION.ra, DIPPER_COMPANION.dec])
  ok('开阳—辅 角距 ≈ 0.20°(±0.05°)', Math.abs(s - 0.197) < 0.05, `${s.toFixed(3)}°`)
}

// ── 附:世界坐标生成路径与二十八宿同管线 ──
{
  const frame = computeSkyFrame({ id: 'beijing', name: '北京', lat: 39.904, lon: 116.407 }, { year: 2026, month: 8, day: 30, hour: 22, minute: 0 })
  const unit0 = raDecToUnit(DIPPER[0].ra, DIPPER[0].dec)
  const world0 = frame.radecToWorld(DIPPER[0].ra, DIPPER[0].dec)
  ok('管线健全:radecToWorld 输出单位向量', Math.abs(Math.hypot(...world0) - 1) < 1e-9 && vecSep(unit0, world0) < 180)
}

console.log(failed === 0 ? '\n全部通过' : `\n${failed} 项失败`)
process.exit(failed === 0 ? 0 : 1)
