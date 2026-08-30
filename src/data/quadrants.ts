/**
 * 四象(四方神)数据。
 * 颜色为场景与 UI 的强调色(低饱和)。
 */
export type QuadrantId = '青龙' | '朱雀' | '白虎' | '玄武'

export interface Quadrant {
  id: QuadrantId
  name: string
  enName: string
  /** 方位 */
  direction: string
  /** 季节(四象与四季的传统对应) */
  season: string
  /** 五行对应(传统观念) */
  element: string
  /** 主色(低饱和) */
  color: string
  /** 暗色变体(用于微弱光晕) */
  colorDim: string
  /** 星宿顺序说明 */
  intro: string
}

export const QUADRANTS: Record<QuadrantId, Quadrant> = {
  青龙: {
    id: '青龙',
    name: '东方青龙',
    enName: 'Azure Dragon of the East',
    direction: '东',
    season: '春',
    element: '木',
    color: '#8fb8ae',
    colorDim: '#4f7d75',
    intro:
      '东方七宿:角、亢、氐、房、心、尾、箕。初春黄昏,苍龙七宿自东方地平升起,古人以此判断春季到来——「二月二,龙抬头」之说即与角宿初升相关。湖北随州曾侯乙墓出土漆箱(约公元前433年)上已绘有二十八宿名称与青龙、白虎图像,是目前所见最早的四象与二十八宿相配的实物。',
  },
  朱雀: {
    id: '朱雀',
    name: '南方朱雀',
    enName: 'Vermilion Bird of the South',
    direction: '南',
    season: '夏',
    element: '火',
    color: '#c08a72',
    colorDim: '#8a5a47',
    intro:
      '南方七宿:井、鬼、柳、星、张、翼、轸。夏季黄昏见于南方天空,七宿相连形如展翅之鸟。《史记·天官书》以柳为「鸟注」、星为「鸟颈」、张为「鸟嗉」、翼为「鸟翼」,将七宿一一对应朱雀的身体。',
  },
  白虎: {
    id: '白虎',
    name: '西方白虎',
    enName: 'White Tiger of the West',
    direction: '西',
    season: '秋',
    element: '金',
    color: '#b7bcc6',
    colorDim: '#767d8a',
    intro:
      '西方七宿:奎、娄、胃、昴、毕、觜、参。秋季黄昏见于西方天空。《史记·天官书》记「参为白虎」,参宿与觜宿正处于虎首位置,昴、毕为虎身。秋日天高气爽,西方七宿与西方五行属金相应。',
  },
  玄武: {
    id: '玄武',
    name: '北方玄武',
    enName: 'Black Tortoise of the North',
    direction: '北',
    season: '冬',
    element: '水',
    color: '#8fa3b8',
    colorDim: '#5b7089',
    intro:
      '北方七宿:斗、牛、女、虚、危、室、壁。冬季黄昏见于北方天空。玄武为龟蛇合体之象,居北方,属水。后世道教将北方之神尊为「真武大帝」,武当山即其道场。',
  },
}

export const QUADRANT_ORDER: QuadrantId[] = ['青龙', '朱雀', '白虎', '玄武']
