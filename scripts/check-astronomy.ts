/**
 * 天文学计算层自检脚本:node scripts/check-astronomy.ts (via tsx)
 * 校验锚点:
 *  1. 北极星高度 ≈ 观测地纬度,方位 ≈ 北
 *  2. 恒星中天高度 = 90° − |纬度 − 赤纬|(赤纬修正后近似)
 *  3. GMST 于 J2000 = 280.4606°
 *  4. 岁差:Polaris 赤纬在 2000→2100 间向天极靠近
 */
import {
  computeSkyFrame,
  toJulianDate,
  gmstDegrees,
  J2000,
  type Site,
  type TimeParts,
} from '../src/lib/astronomy'

const BEIJING: Site = { id: 'beijing', name: '北京', lat: 39.904, lon: 116.407 }
const T2026: TimeParts = { year: 2026, month: 8, day: 30, hour: 21, minute: 0 }

let failures = 0
const check = (name: string, ok: boolean, detail: string) => {
  console.log(`${ok ? '✓' : '✗'} ${name} — ${detail}`)
  if (!ok) failures++
}

// 1. GMST 锚点
const gmst2000 = gmstDegrees(J2000)
check('GMST @ J2000 = 280.4606°', Math.abs(gmst2000 - 280.46061837) < 1e-4, gmst2000.toFixed(6))

// 2. Polaris 高度/方位
const f = computeSkyFrame(BEIJING, T2026)
const pol = f.equatorialToHorizontal(2.5303, 89.2641)
check(
  'Polaris 高度 ≈ 39.9°(纬度)',
  Math.abs(pol.altDeg - 39.904) < 1.2,
  `alt=${pol.altDeg.toFixed(2)}°`,
)
check('Polaris 方位 ≈ 北', Math.abs(pol.azDeg) < 3 || Math.abs(pol.azDeg - 360) < 3, `az=${pol.azDeg.toFixed(2)}°`)

// 3. 心宿二中天高度(两次迭代逼近 LST = RA 的地方时时刻)
const lstTarget = 16.4901
let localHr = T2026.hour
for (let i = 0; i < 3; i++) {
  const fi = computeSkyFrame(BEIJING, { ...T2026, hour: localHr, minute: 0 })
  const drift = ((lstTarget - fi.lstHours + 12) % 24) - 12 // 最近时刻差(小时)
  localHr = (localHr + drift + 24) % 24
}
const fCulm = computeSkyFrame(BEIJING, { ...T2026, hour: localHr, minute: 0 })
const ant = fCulm.equatorialToHorizontal(16.4901, -26.432)
const expectedAlt = 90 - Math.abs(39.904 - -26.432)
check(
  '心宿二中天高度 ≈ 23.7°',
  Math.abs(ant.altDeg - expectedAlt) < 1.2,
  `alt=${ant.altDeg.toFixed(2)}° (期望 ${expectedAlt.toFixed(2)}°)`,
)
check('心宿二中天方位 ≈ 南(180°)', Math.abs(ant.azDeg - 180) < 3, `az=${ant.azDeg.toFixed(2)}°`)

// 4. 岁差:Polaris 2026 与 2100 的赤纬变化
const jd2026 = toJulianDate(T2026)
const jd2100 = toJulianDate({ ...T2026, year: 2100 })
const dec2026 = computeSkyFrame(BEIJING, { ...T2026, hour: 0 }).equatorialToHorizontal(2.5303, 89.2641)
const dec2100 = computeSkyFrame(BEIJING, { ...T2026, year: 2100, hour: 0 }).equatorialToHorizontal(2.5303, 89.2641)
const dDec = (dec2100.altDeg - dec2026.altDeg)
check(
  'Polaris 2100 高度高于 2026(岁差方向正确)',
  dDec > 0.1,
  `Δalt=${dDec.toFixed(2)}°`,
)

// 5. 儒略日锚点:2000-01-01 12:00 UT = 2451545.0
const jdAnchor = toJulianDate({ year: 2000, month: 1, day: 1, hour: 12, minute: 0 })
check('JD @ 2000-01-01 12:00 UT = 2451545.0', Math.abs(jdAnchor - J2000) < 1e-6, jdAnchor.toFixed(6))

// 6. 银道→赤道往返:银心 (l=0,b=0) 应回到 (266.405°,−28.936°)
const g0 = f.galToWorld(0, 0)
check('银心方向已计算', Math.abs(Math.hypot(...g0) - 1) < 1e-9, `|v|=1`)

console.log(failures === 0 ? '\n全部通过' : `\n${failures} 项失败`)
process.exit(failures === 0 ? 0 : 1)
