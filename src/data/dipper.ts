/**
 * 北斗七星与北极星数据。
 * 坐标:J2000 近似值(小时/度)。
 */
import type { StarRef } from './mansions'

export interface DipperStar extends StarRef {
  id: string
  /** 斗身(魁)或斗柄(杓) */
  part: '魁' | '杓'
}

export const DIPPER: DipperStar[] = [
  { id: 'tianshu', name: '天枢', nameEn: 'Dubhe', part: '魁', ra: 11.0617, dec: 61.75, mag: 1.79 },
  { id: 'tianxuan', name: '天璇', nameEn: 'Merak', part: '魁', ra: 11.03, dec: 56.3833, mag: 2.37 },
  { id: 'tianji', name: '天玑', nameEn: 'Phecda', part: '魁', ra: 11.8967, dec: 53.6942, mag: 2.44 },
  { id: 'tianquan', name: '天权', nameEn: 'Megrez', part: '魁', ra: 12.2567, dec: 57.0319, mag: 3.31 },
  { id: 'yuheng', name: '玉衡', nameEn: 'Alioth', part: '杓', ra: 12.9, dec: 55.9597, mag: 1.77 },
  { id: 'kaiyang', name: '开阳', nameEn: 'Mizar', part: '杓', ra: 13.3983, dec: 54.925, mag: 2.27 },
  { id: 'yaoguang', name: '摇光', nameEn: 'Alkaid', part: '杓', ra: 13.7917, dec: 49.3133, mag: 1.86 },
]

/** 辅星(开阳伴星 Alcor,古人以能否分辨「辅」测试目力)。J2000:13h25m13.5s / +54°59′17″ */
export const DIPPER_COMPANION: StarRef = { name: '辅', nameEn: 'Alcor', ra: 13.4204, dec: 54.9881, mag: 4.0 }

/** 北极星(勾陈一) */
export const POLARIS: StarRef = { name: '北极星', nameEn: 'Polaris', ra: 2.5303, dec: 89.2641, mag: 2.0 }

export const DIPPER_INFO = {
  title: '北斗七星',
  enTitle: 'The Northern Dipper',
  astronomy:
    '北斗七星位于大熊座,由天枢、天璇、天玑、天权、玉衡、开阳、摇光组成。前四星构成斗身(斗魁),后三星构成斗柄(斗杓)。将天枢与天璇连线延长约五倍,即指向北极星——这是北半球最古老也最可靠的寻北方法。因地球自转,北斗绕北极星昼夜旋转;因岁差,数千年前的北斗形状与今日略有不同。',
  culture:
    '《史记·天官书》:「斗为帝车,运于中央,临制四乡。」北斗在古代既是观象授时之器,也是人间秩序的天上象征。《鹖冠子》记「斗柄东指,天下皆春」——黄昏时斗柄的指向,被古人用作判断四季的指针。道教视北斗为众星之主,有拜斗、礼斗之科仪,「北斗注死,南斗注生」之说流传甚广。',
  quote: { text: '斗柄东指,天下皆春;斗柄南指,天下皆夏。', source: '《鹖冠子·环流》' },
  /** 拖动时间轴时斗柄随天球旋转 —— 场景提示 */
  hint: '拖动时间轴,观察斗柄随天球旋转',
}
