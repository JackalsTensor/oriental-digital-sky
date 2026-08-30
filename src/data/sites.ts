/**
 * 观测地点预设。
 * 经纬度为近似值(度,北正东正)。
 */
import type { Site } from '@/lib/astronomy'

export const SITES: Site[] = [
  { id: 'beijing', name: '北京', nameEn: 'Beijing', lat: 39.904, lon: 116.407, note: '元明清三代观象台所在,古观象台至今犹存' },
  { id: 'xian', name: '西安', nameEn: "Xi'an", lat: 34.341, lon: 108.94, note: '唐代长安,一行、南宫说等曾在此主持大规模天文测量' },
  { id: 'luoyang', name: '洛阳', nameEn: 'Luoyang', lat: 34.619, lon: 112.454, note: '东汉灵台所在,张衡曾于此观测天象' },
  { id: 'wudang', name: '武当山', nameEn: 'Wudang Mountains', lat: 32.4, lon: 111.007, note: '真武大帝道场,北方玄武信仰名山' },
  { id: 'longhu', name: '龙虎山', nameEn: 'Mount Longhu', lat: 28.112, lon: 116.975, note: '道教正一派祖庭' },
  { id: 'qingcheng', name: '青城山', nameEn: 'Mount Qingcheng', lat: 30.899, lon: 103.566, note: '道教发祥地之一,天师道圣地' },
  { id: 'taishan', name: '泰山', nameEn: 'Mount Tai', lat: 36.256, lon: 117.104, note: '五岳之首,历代封禅之地' },
  { id: 'huashan', name: '华山', nameEn: 'Mount Hua', lat: 34.487, lon: 110.09, note: '西岳,道教全真派圣地' },
  { id: 'maoshan', name: '茅山', nameEn: 'Mount Mao', lat: 31.792, lon: 119.311, note: '上清派祖庭,三茅真君修炼之地' },
]

export const DEFAULT_SITE = SITES[0]
