/**
 * 二十八宿完整数据。
 *
 * 坐标说明:赤经(小时)/赤纬(度)为 J2000 历元近似值,取自各宿距星与主要成员星;
 * 成员星按连线顺序排列(首星即距星)。星等为近似目视星等。
 * 坐标数据用于天球可视化,非精密天文计算 —— 见 README「天文学计算层」。
 *
 * 星官数为各宿所辖星官数,依据《步天歌》(陈卓星官体系),与《开元占经》等互证。
 * 距星表依据《新唐书·历志》等所载传统距星并对照现代星名。
 */
import type { QuadrantId } from './quadrants'

export type MansionId =
  | '角' | '亢' | '氐' | '房' | '心' | '尾' | '箕'
  | '斗' | '牛' | '女' | '虚' | '危' | '室' | '壁'
  | '奎' | '娄' | '胃' | '昴' | '毕' | '觜' | '参'
  | '井' | '鬼' | '柳' | '星' | '张' | '翼' | '轸'

export interface StarRef {
  /** 中国传统星名 */
  name: string
  /** 现代西文名 */
  nameEn?: string
  /** J2000 赤经(小时) */
  ra: number
  /** J2000 赤纬(度) */
  dec: number
  /** 近似目视星等 */
  mag: number
}

export interface Mansion {
  id: MansionId
  name: string
  pinyin: string
  quadrant: QuadrantId
  /** 所属象限内序号 1–7 */
  index: number
  /** 七曜禽象(如「角木蛟」) */
  beast: string
  /** 所辖星官数(据《步天歌》) */
  officials: number
  /** 距星 */
  determinative: StarRef
  /** 成员星(首星即距星,按连线顺序) */
  members: StarRef[]
  /** 古代天文学(基于现代天文学对古代体系的描述) */
  astronomy: string
  /** 文化意义(传统观念,非现代科学事实) */
  culture: string
  /** 古籍引用(可选) */
  quote?: { text: string; source: string }
}

/** 二十八宿固定次序(自角宿始) */
export const MANSION_ORDER: MansionId[] = [
  '角', '亢', '氐', '房', '心', '尾', '箕',
  '斗', '牛', '女', '虚', '危', '室', '壁',
  '奎', '娄', '胃', '昴', '毕', '觜', '参',
  '井', '鬼', '柳', '星', '张', '翼', '轸',
]

export const MANSIONS: Record<MansionId, Mansion> = {
  // ─────────────── 东方青龙 ───────────────
  角: {
    id: '角', name: '角宿', pinyin: 'Jiǎo', quadrant: '青龙', index: 1,
    beast: '角木蛟', officials: 11,
    determinative: { name: '角宿一', nameEn: 'Spica', ra: 13.4198, dec: -11.1614, mag: 0.98 },
    members: [
      { name: '角宿一', nameEn: 'Spica', ra: 13.4198, dec: -11.1614, mag: 0.98 },
      { name: '角宿二', nameEn: 'ζ Vir', ra: 13.5775, dec: -0.5958, mag: 3.4 },
    ],
    astronomy:
      '二十八宿之首,由角宿一、角宿二两星南北相对,如苍龙双角。距星角宿一即室女座α(Spica),为全天第16亮星,距黄道仅约2°,是古代测定日月位置的天然标尺。古人以角宿黄昏升于东方为春季到来的标志。',
    culture:
      '角为龙角,在四象中位居苍龙之首,古称「寿星」。道教二十八宿星君中,角宿与亢宿、氐宿等各有星官之名。民间「二月二,龙抬头」的习俗,正是以初春角宿初升的星象为背景。',
  },
  亢: {
    id: '亢', name: '亢宿', pinyin: 'Kàng', quadrant: '青龙', index: 2,
    beast: '亢金龙', officials: 7,
    determinative: { name: '亢宿一', nameEn: 'κ Vir', ra: 14.215, dec: -10.2737, mag: 4.18 },
    members: [
      { name: '亢宿一', nameEn: 'κ Vir', ra: 14.215, dec: -10.2737, mag: 4.18 },
      { name: '亢宿二', nameEn: 'ι Vir', ra: 14.267, dec: -6.0036, mag: 4.08 },
      { name: '亢宿三', nameEn: 'φ Vir', ra: 14.4705, dec: -2.2303, mag: 4.8 },
      { name: '亢宿四', nameEn: 'λ Vir', ra: 14.3205, dec: -13.3708, mag: 4.52 },
    ],
    astronomy:
      '亢宿四星,位于角宿之东,为苍龙之颈。距星亢宿一即室女座κ。《史记·天官书》记「亢为疏庙,主疾」。亢宿天区还包含著名的大角星(牧夫座α,今属亢宿星官「大角」),为北天最亮星之一。',
    culture:
      '亢宿在传统星占中与疾疫、庙堂之事相关。作为苍龙七宿的第二宿,其位置正当龙颈,是二十八宿自东方起首的第二站。',
  },
  氐: {
    id: '氐', name: '氐宿', pinyin: 'Dī', quadrant: '青龙', index: 3,
    beast: '氐土貉', officials: 11,
    determinative: { name: '氐宿一', nameEn: 'α² Lib', ra: 14.8483, dec: -16.0417, mag: 2.75 },
    members: [
      { name: '氐宿一', nameEn: 'α² Lib', ra: 14.8483, dec: -16.0417, mag: 2.75 },
      { name: '氐宿二', nameEn: 'ι Lib', ra: 15.2045, dec: -19.7933, mag: 4.54 },
      { name: '氐宿三', nameEn: 'γ Lib', ra: 15.5933, dec: -14.7889, mag: 3.91 },
      { name: '氐宿四', nameEn: 'β Lib', ra: 15.2833, dec: -9.383, mag: 2.61 },
    ],
    astronomy:
      '氐宿四星,形如侧放之斗,为苍龙之胸与前爪。距星氐宿一即天秤座α²。氐宿天区南接骑官诸星,北连亢池。《史记·天官书》记「氐为天根,主疫」,《尔雅》亦称「氐,天根也」——古人视氐宿为苍龙立足的根基。',
    culture:
      '「氐为天根」是二十八宿中著名的观念:角、亢如龙首,而氐宿则是苍龙身躯生根之处。氐宿星官众多(《步天歌》载11星官54星),包括骑官、阵车、车骑等,皆与军事、仪仗有关。',
  },
  房: {
    id: '房', name: '房宿', pinyin: 'Fáng', quadrant: '青龙', index: 4,
    beast: '房日兔', officials: 8,
    determinative: { name: '房宿一', nameEn: 'π Sco', ra: 15.98, dec: -26.1144, mag: 2.89 },
    members: [
      { name: '房宿一', nameEn: 'π Sco', ra: 15.98, dec: -26.1144, mag: 2.89 },
      { name: '房宿二', nameEn: 'ρ Sco', ra: 15.9483, dec: -29.2094, mag: 3.87 },
      { name: '房宿三', nameEn: 'δ Sco', ra: 16.005, dec: -22.6219, mag: 2.29 },
      { name: '房宿四', nameEn: 'β Sco', ra: 16.089, dec: -19.8063, mag: 2.56 },
    ],
    astronomy:
      '房宿四星几乎排成一条直线,横贯天蝎座北部,为苍龙之腹。距星房宿一即天蝎座π。《史记·天官书》记「房为府,曰天驷」——四星如驾车的四匹天马,房宿东侧又有键闭、钩钤等小星,如同马的缰辔。',
    culture:
      '「天驷」之名源远流长:四星横列如驷马,古人以房宿观测时令并附会车驾之象。房宿星官中有东咸、西咸、罚等,与刑罚、宫禁有关,体现星官体系对人间制度的映射。',
  },
  心: {
    id: '心', name: '心宿', pinyin: 'Xīn', quadrant: '青龙', index: 5,
    beast: '心月狐', officials: 2,
    determinative: { name: '心宿一', nameEn: 'σ Sco', ra: 16.3533, dec: -25.5942, mag: 2.9 },
    members: [
      { name: '心宿一', nameEn: 'σ Sco', ra: 16.3533, dec: -25.5942, mag: 2.9 },
      { name: '心宿二', nameEn: 'Antares', ra: 16.4901, dec: -26.432, mag: 0.96 },
      { name: '心宿三', nameEn: 'τ Sco', ra: 16.5983, dec: -28.2156, mag: 2.82 },
    ],
    astronomy:
      '心宿三星,为苍龙之心。中央的心宿二即天蝎座α(Antares),是一颗红超巨星,直径约为太阳的数百倍,因色红如火,中国古代称之为「大火」。心宿是上古观象授时的核心星宿:黄昏时大火星的位置被用来确定季节,《诗经》「七月流火」描述的正是初秋大火西行的天象——「流火」并非形容炎热,而是星行渐西。',
    culture:
      '心宿即上古之「大火」,与参宿(商星)一东一西,此升彼落,永不相见,遂有「参商永隔」之典——杜甫《赠卫八处士》「人生不相见,动如参与商」即用此意。心宿亦名商星,《左传》记高辛氏二子阏伯、实沈不睦,被分迁商丘与大夏,「辰为商星」即出于此。心宿二古称「天王」,在星占中地位极重。',
    quote: { text: '七月流火,九月授衣。', source: '《诗经·豳风·七月》' },
  },
  尾: {
    id: '尾', name: '尾宿', pinyin: 'Wěi', quadrant: '青龙', index: 6,
    beast: '尾火虎', officials: 6,
    determinative: { name: '尾宿一', nameEn: 'μ¹ Sco', ra: 16.865, dec: -38.0478, mag: 3.0 },
    members: [
      { name: '尾宿一', nameEn: 'μ¹ Sco', ra: 16.865, dec: -38.0478, mag: 3.0 },
      { name: '尾宿二', nameEn: 'ε Sco', ra: 16.8367, dec: -34.2925, mag: 2.3 },
      { name: '尾宿三', nameEn: 'ζ² Sco', ra: 16.9067, dec: -42.3617, mag: 3.6 },
      { name: '尾宿四', nameEn: 'η Sco', ra: 17.2033, dec: -43.2392, mag: 3.3 },
      { name: '尾宿五', nameEn: 'θ Sco', ra: 17.6217, dec: -42.9975, mag: 1.87 },
      { name: '尾宿六', nameEn: 'ι¹ Sco', ra: 17.7933, dec: -40.1264, mag: 3.0 },
      { name: '尾宿七', nameEn: 'κ Sco', ra: 17.7083, dec: -39.0306, mag: 2.4 },
      { name: '尾宿八', nameEn: 'λ Sco', ra: 17.56, dec: -37.1017, mag: 1.6 },
      { name: '尾宿九', nameEn: 'υ Sco', ra: 17.5133, dec: -37.295, mag: 2.7 },
    ],
    astronomy:
      '尾宿九星,弯曲如钩,正当天蝎座的尾钩,为苍龙之尾,是二十八宿中星数最多的宿之一。距星尾宿一即天蝎座μ¹。《史记·天官书》记「尾为九子」。尾宿天区有傅说、鱼、神宫、天江等星官。',
    culture:
      '尾宿如龙尾摆动,在传统星占中与后宫、子嗣相关(「尾为九子」)。尾宿星官「傅说」以殷商贤相命名,「傅说骑箕尾」的典故即指贤臣逝世后升于箕尾之间,与星辰相伴。',
  },
  箕: {
    id: '箕', name: '箕宿', pinyin: 'Jī', quadrant: '青龙', index: 7,
    beast: '箕水豹', officials: 3,
    determinative: { name: '箕宿一', nameEn: 'γ Sgr', ra: 18.0967, dec: -30.4242, mag: 3.0 },
    members: [
      { name: '箕宿一', nameEn: 'γ Sgr', ra: 18.0967, dec: -30.4242, mag: 3.0 },
      { name: '箕宿二', nameEn: 'δ Sgr', ra: 18.35, dec: -29.8297, mag: 2.7 },
      { name: '箕宿三', nameEn: 'ε Sgr', ra: 18.4033, dec: -34.3836, mag: 1.79 },
      { name: '箕宿四', nameEn: 'η Sgr', ra: 18.2933, dec: -36.7644, mag: 3.1 },
    ],
    astronomy:
      '箕宿四星,形如簸箕,位于人马座西侧,为苍龙之尾末。《史记·天官书》记「箕为敖客,曰口舌」。古人认为箕宿与风有关——簸箕扬谷生风,故有「箕主簸扬,能致风气」之说。',
    culture:
      '箕宿是东方七宿的最后一宿,与斗宿相接,「箕斗」连称常见于古诗文。苏轼《赤壁赋》「月出于东山之上,徘徊于斗牛之间」,正是箕、斗、牛一带的天区——月行至此,已近天汉。',
  },

  // ─────────────── 北方玄武 ───────────────
  斗: {
    id: '斗', name: '斗宿', pinyin: 'Dǒu', quadrant: '玄武', index: 1,
    beast: '斗木獬', officials: 10,
    determinative: { name: '斗宿一', nameEn: 'φ Sgr', ra: 18.7617, dec: -26.9914, mag: 3.2 },
    members: [
      { name: '斗宿一', nameEn: 'φ Sgr', ra: 18.7617, dec: -26.9914, mag: 3.2 },
      { name: '斗宿二', nameEn: 'λ Sgr', ra: 18.4667, dec: -25.4219, mag: 2.82 },
      { name: '斗宿三', nameEn: 'μ Sgr', ra: 18.23, dec: -21.0597, mag: 3.85 },
      { name: '斗宿四', nameEn: 'σ Sgr', ra: 18.9217, dec: -26.2978, mag: 2.05 },
      { name: '斗宿五', nameEn: 'τ Sgr', ra: 19.115, dec: -27.6706, mag: 3.3 },
      { name: '斗宿六', nameEn: 'ζ Sgr', ra: 19.0433, dec: -29.8797, mag: 2.6 },
    ],
    astronomy:
      '斗宿即南斗六星,形如北斗,故称「南斗」,位于人马座。距星斗宿一即人马座φ。《史记·天官书》记「南斗为庙」,斗宿天区包含建、天弁、狗、天鸡、天渊等众多星官,是二十八宿中宿度最宽的一宿。',
    culture:
      '南斗与北斗并称:「南斗注生,北斗注死」之说见于道教文献与志怪故事(如《搜神记》所载管辂为颜超延寿事)。南斗六星亦为道教斋醮科仪中礼拜的星神之一。',
  },
  牛: {
    id: '牛', name: '牛宿', pinyin: 'Niú', quadrant: '玄武', index: 2,
    beast: '牛金牛', officials: 11,
    determinative: { name: '牛宿一', nameEn: 'β Cap', ra: 20.35, dec: -14.7819, mag: 3.05 },
    members: [
      { name: '牛宿一', nameEn: 'β Cap', ra: 20.35, dec: -14.7819, mag: 3.05 },
      { name: '牛宿二', nameEn: 'α² Cap', ra: 20.3017, dec: -12.5453, mag: 3.57 },
      { name: '牛宿三', nameEn: 'ξ² Cap', ra: 20.2067, dec: -12.3686, mag: 5.8 },
      { name: '牛宿四', nameEn: 'π Cap', ra: 20.455, dec: -18.2136, mag: 5.1 },
      { name: '牛宿五', nameEn: 'ο Cap', ra: 20.4983, dec: -18.5847, mag: 5.9 },
      { name: '牛宿六', nameEn: 'ρ Cap', ra: 20.4817, dec: -17.8147, mag: 4.8 },
    ],
    astronomy:
      '牛宿六星,古称「牵牛」,位于摩羯座。距星牛宿一即摩羯座β。牛宿天区横跨银河两侧,著名的河鼓(牛郎星所在)与织女星官均属牛宿天区——牛郎织女隔河相望的天象,正是这片星空的真实图景。',
    culture:
      '牛宿是七夕传说的星空背景:「迢迢牵牛星,皎皎河汉女」(《古诗十九首》)。牛宿与女宿相邻,隔银河与织女相对,形成了中国最具人情味的星象故事。牛宿星官中还有天田、九坎等,与农事相关。',
    quote: { text: '迢迢牵牛星,皎皎河汉女。', source: '《古诗十九首·迢迢牵牛星》' },
  },
  女: {
    id: '女', name: '女宿', pinyin: 'Nǚ', quadrant: '玄武', index: 3,
    beast: '女土蝠', officials: 8,
    determinative: { name: '女宿一', nameEn: 'ε Aqr', ra: 20.795, dec: -9.4953, mag: 3.78 },
    members: [
      { name: '女宿一', nameEn: 'ε Aqr', ra: 20.795, dec: -9.4953, mag: 3.78 },
      { name: '女宿二', nameEn: 'μ Aqr', ra: 20.8783, dec: -8.9064, mag: 4.7 },
      { name: '女宿三', nameEn: '4 Aqr', ra: 20.8567, dec: -5.6283, mag: 6.0 },
      { name: '女宿四', nameEn: '5 Aqr', ra: 20.8733, dec: -5.7278, mag: 5.6 },
    ],
    astronomy:
      '女宿四星,古称「须女」或「婺女」,位于宝瓶座。《史记·天官书》记「婺女,其北织女」。距星女宿一即宝瓶座ε。女宿天区有离珠、败瓜、瓠瓜等星官,又有「十二国」——以越、齐、燕、韩、魏等诸侯国命名的一串小星。',
    culture:
      '女宿主布帛、婚姻之事。它与牛宿、织女构成七夕故事中的星空背景:织女星官恰在牛宿天区之北,「盈盈一水间,脉脉不得语」的银河,正从这片星空中流过。',
  },
  虚: {
    id: '虚', name: '虚宿', pinyin: 'Xū', quadrant: '玄武', index: 4,
    beast: '虚日鼠', officials: 10,
    determinative: { name: '虚宿一', nameEn: 'β Aqr', ra: 21.5267, dec: -5.5711, mag: 2.9 },
    members: [
      { name: '虚宿一', nameEn: 'β Aqr', ra: 21.5267, dec: -5.5711, mag: 2.9 },
      { name: '虚宿二', nameEn: 'α Equ', ra: 21.2633, dec: 5.2472, mag: 3.9 },
    ],
    astronomy:
      '虚宿两星,南北相对,为玄武七宿的中央。距星虚宿一即宝瓶座β。虚宿之名取自「虚」——此宿正当天球黄道与赤道交点附近的空阔天区(今秋分点已移入室女座,但古人命名时,虚宿一带星稀,故名为虚)。',
    culture:
      '《史记·天官书》记「虚为哭泣之事」,虚宿天区有司命、司禄、司危、司非、哭、泣等星官,多与祭祀、生死观念相关——古人把对生死的关切投射到这片空阔的星空上。',
  },
  危: {
    id: '危', name: '危宿', pinyin: 'Wēi', quadrant: '玄武', index: 5,
    beast: '危月燕', officials: 11,
    determinative: { name: '危宿一', nameEn: 'α Aqr', ra: 22.0967, dec: -0.3197, mag: 2.95 },
    members: [
      { name: '危宿一', nameEn: 'α Aqr', ra: 22.0967, dec: -0.3197, mag: 2.95 },
      { name: '危宿二', nameEn: 'θ Peg', ra: 22.17, dec: 6.1967, mag: 3.5 },
      { name: '危宿三', nameEn: 'ε Peg', ra: 21.7367, dec: 9.8747, mag: 2.4 },
    ],
    astronomy:
      '危宿三星,位于宝瓶座与飞马座之间。《史记·天官书》记「危为盖屋」。距星危宿一即宝瓶座α。危宿天区有坟墓、虚梁、盖屋等星官,又有车府、天钩、造父、杵臼诸星。',
    culture:
      '危宿之名源于其星形——三星如屋脊之高危。传统星占中危宿主屋宇、营造之事,星官「坟墓」「虚梁」则与丧葬相关。造父星官以周穆王善御者命名,是星空中少见的御者之名。',
  },
  室: {
    id: '室', name: '室宿', pinyin: 'Shì', quadrant: '玄武', index: 6,
    beast: '室火猪', officials: 11,
    determinative: { name: '室宿一', nameEn: 'α Peg', ra: 23.08, dec: 15.205, mag: 2.48 },
    members: [
      { name: '室宿一', nameEn: 'α Peg', ra: 23.08, dec: 15.205, mag: 2.48 },
      { name: '室宿二', nameEn: 'β Peg', ra: 23.0633, dec: 28.0825, mag: 2.42 },
    ],
    astronomy:
      '室宿两星,古称「营室」,即飞马座α、β——它们是「秋季四边形」的东侧两星。距星室宿一即飞马座α(Markab)。营室两星与其南的壁宿两星构成一个醒目的四边形,古人视为宫室之象。《史记·天官书》记「营室为清庙」。',
    culture:
      '营室又名「定星」,《诗经·鄘风·定之方中》「定之方中,作于楚宫」——古人以定星昏中之时营建宫室,故有此诗。室宿天区有离宫、雷电、垒壁阵、羽林军等星官,是星空中最壮观的「天上军营」。',
    quote: { text: '定之方中,作于楚宫。', source: '《诗经·鄘风·定之方中》' },
  },
  壁: {
    id: '壁', name: '壁宿', pinyin: 'Bì', quadrant: '玄武', index: 7,
    beast: '壁水貐', officials: 6,
    determinative: { name: '壁宿一', nameEn: 'γ Peg', ra: 0.22, dec: 15.1836, mag: 2.83 },
    members: [
      { name: '壁宿一', nameEn: 'γ Peg', ra: 0.22, dec: 15.1836, mag: 2.83 },
      { name: '壁宿二', nameEn: 'α And', ra: 0.14, dec: 29.0904, mag: 2.06 },
    ],
    astronomy:
      '壁宿两星,古称「东壁」,位于飞马座与仙女座之间,是「秋季四边形」的东北角。距星壁宿一即飞马座γ(Algenib)。壁宿为北方七宿之末,其后即接西方奎宿。',
    culture:
      '壁宿主图书、文章,「东壁图书府」之说即源于此——古人以壁宿为藏书之所的星象。壁宿天区有霹雳、云雨等星官,又接奎宿,为二十八宿东北—西北的转角。',
  },

  // ─────────────── 西方白虎 ───────────────
  奎: {
    id: '奎', name: '奎宿', pinyin: 'Kuí', quadrant: '白虎', index: 1,
    beast: '奎木狼', officials: 9,
    determinative: { name: '奎宿一', nameEn: 'ζ And', ra: 0.7883, dec: 24.2672, mag: 4.1 },
    members: [
      { name: '奎宿一', nameEn: 'ζ And', ra: 0.7883, dec: 24.2672, mag: 4.1 },
      { name: '奎宿二', nameEn: 'δ And', ra: 0.655, dec: 30.8611, mag: 3.3 },
      { name: '奎宿三', nameEn: 'π And', ra: 0.6167, dec: 33.72, mag: 4.4 },
      { name: '奎宿四', nameEn: 'β And', ra: 1.1617, dec: 35.6206, mag: 2.05 },
      { name: '奎宿五', nameEn: 'μ And', ra: 0.9433, dec: 38.4983, mag: 3.9 },
      { name: '奎宿六', nameEn: 'η And', ra: 0.95, dec: 23.4186, mag: 4.4 },
      { name: '奎宿七', nameEn: 'ε And', ra: 0.6417, dec: 29.3114, mag: 4.4 },
    ],
    astronomy:
      '奎宿为西方七宿之首,十六星跨仙女座与双鱼座,如人跨步之形。距星奎宿一即仙女座ζ。《史记·天官书》记「奎曰封豕,为沟渎」——封豕即大猪,沟渎指水渠,奎宿之星多而散,如野豕涉水。',
    culture:
      '奎宿主沟渠、水事,传统星占中亦与文章有关(奎星后被附会为文运之星,「奎星点斗」之说流行于后世科举文化,但此「奎」已与天上奎宿渐行渐远)。奎宿天区有阁道、王良、附路等星官——王良即春秋善御者,驾车行于天上的「阁道」。',
  },
  娄: {
    id: '娄', name: '娄宿', pinyin: 'Lóu', quadrant: '白虎', index: 2,
    beast: '娄金狗', officials: 6,
    determinative: { name: '娄宿一', nameEn: 'β Ari', ra: 1.91, dec: 20.8081, mag: 2.64 },
    members: [
      { name: '娄宿一', nameEn: 'β Ari', ra: 1.91, dec: 20.8081, mag: 2.64 },
      { name: '娄宿二', nameEn: 'γ Ari', ra: 1.8917, dec: 19.2942, mag: 4.8 },
      { name: '娄宿三', nameEn: 'α Ari', ra: 2.12, dec: 23.4619, mag: 2.0 },
    ],
    astronomy:
      '娄宿三星,位于白羊座,为白虎之身。《史记·天官书》记「娄为聚众」。距星娄宿一即白羊座β(Sheratan)。娄宿天区有左更、右更、天仓、天庾等星官,又有著名的天大将军十一星。',
    culture:
      '娄宿主牧养、牺牲之事——古人祭祀所用的牲畜,其天上之象即在娄宿。天大将军星官横跨娄、胃两宿,是星空中罕见的人物星官,其形象常出现在古代星图中。',
  },
  胃: {
    id: '胃', name: '胃宿', pinyin: 'Wèi', quadrant: '白虎', index: 3,
    beast: '胃土雉', officials: 7,
    determinative: { name: '胃宿一', nameEn: '35 Ari', ra: 2.725, dec: 27.7169, mag: 4.65 },
    members: [
      { name: '胃宿一', nameEn: '35 Ari', ra: 2.725, dec: 27.7169, mag: 4.65 },
      { name: '胃宿二', nameEn: '39 Ari', ra: 2.7983, dec: 29.2433, mag: 4.5 },
      { name: '胃宿三', nameEn: '41 Ari', ra: 2.8333, dec: 27.2631, mag: 3.6 },
    ],
    astronomy:
      '胃宿三星,鼎足而立于白羊座北部。《史记·天官书》记「胃为天仓」——三星如粮仓。距星胃宿一即白羊座35。胃宿天区有大陵、天船、积尸、积水等星官。',
    culture:
      '胃为天之仓廪,主谷粮积蓄。胃宿之星虽不亮,却是古代判断仓储丰歉的星占对象。大陵星官中有著名的变星大陵五(英仙座β,Algol),其亮度周期性变化,阿拉伯人称之为「恶魔之眼」,中国古代则以其入「积尸」之象。',
  },
  昴: {
    id: '昴', name: '昴宿', pinyin: 'Mǎo', quadrant: '白虎', index: 4,
    beast: '昴日鸡', officials: 9,
    determinative: { name: '昴宿一', nameEn: '17 Tau', ra: 3.7483, dec: 24.1133, mag: 3.7 },
    members: [
      { name: '昴宿一', nameEn: '17 Tau', ra: 3.7483, dec: 24.1133, mag: 3.7 },
      { name: '昴宿二', nameEn: '19 Tau', ra: 3.7583, dec: 24.4686, mag: 4.3 },
      { name: '昴宿三', nameEn: '20 Tau', ra: 3.7633, dec: 24.285, mag: 3.87 },
      { name: '昴宿四', nameEn: '23 Tau', ra: 3.775, dec: 23.9486, mag: 4.2 },
      { name: '昴宿五', nameEn: 'η Tau', ra: 3.7917, dec: 24.1053, mag: 2.87 },
      { name: '昴宿六', nameEn: '27 Tau', ra: 3.8217, dec: 24.05, mag: 3.6 },
      { name: '昴宿七', nameEn: '28 Tau', ra: 3.8183, dec: 24.1319, mag: 5.1 },
    ],
    astronomy:
      '昴宿即著名的昴星团(Pleiades),一簇明亮的疏散星团聚于金牛座,肉眼可见六至七颗星,古人以「昴」为七姊妹。距星昴宿一即金牛座17。《史记·天官书》记「昴曰髦头,胡星也」——「髦头」指旄头,即仪仗中先导的旄旗,星团之形如旗帜之旄。',
    culture:
      '昴宿是中国星空中最著名的星团,与参宿同为《诗经》所咏:「嘒彼小星,维参与昴」。昴宿星官昴日鸡即《西游记》中降伏蝎子精的昴日星官——唐僧师徒西行,天上的昴星正居西方。',
    quote: { text: '嘒彼小星,维参与昴。', source: '《诗经·召南·小星》' },
  },
  毕: {
    id: '毕', name: '毕宿', pinyin: 'Bì', quadrant: '白虎', index: 5,
    beast: '毕月乌', officials: 15,
    determinative: { name: '毕宿一', nameEn: 'ε Tau', ra: 4.4767, dec: 19.1803, mag: 3.53 },
    members: [
      { name: '毕宿一', nameEn: 'ε Tau', ra: 4.4767, dec: 19.1803, mag: 3.53 },
      { name: '毕宿二', nameEn: 'δ¹ Tau', ra: 4.3833, dec: 17.5436, mag: 3.77 },
      { name: '毕宿三', nameEn: 'γ Tau', ra: 4.33, dec: 15.6275, mag: 3.65 },
      { name: '毕宿四', nameEn: 'θ² Tau', ra: 4.4817, dec: 15.8706, mag: 3.4 },
      { name: '毕宿五', nameEn: 'Aldebaran', ra: 4.5983, dec: 16.5093, mag: 0.87 },
      { name: '毕宿六', nameEn: 'λ Tau', ra: 4.0117, dec: 12.4903, mag: 3.4 },
    ],
    astronomy:
      '毕宿八星,位于金牛座,形如带网的捕兔之器(毕)。距星毕宿一即金牛座ε。毕宿五即金牛座α(Aldebaran),是全天第13亮星,橙色巨星,正对着著名的毕星团(Hyades)——而昴星团就在其北不远。',
    culture:
      '毕为雨师之象,《诗经·小雅·渐渐之石》「月离于毕,俾滂沱矣」——月亮经过毕宿,古人认为是降雨之兆,后世「毕星好雨」成为气象星占的经典命题。毕宿是二十八宿中星官最多的宿之一(15星官),含五车、天关、咸池、参旗等,「天关」即著名的蟹状星云附近之星。',
    quote: { text: '月离于毕,俾滂沱矣。', source: '《诗经·小雅·渐渐之石》' },
  },
  觜: {
    id: '觜', name: '觜宿', pinyin: 'Zī', quadrant: '白虎', index: 6,
    beast: '觜火猴', officials: 3,
    determinative: { name: '觜宿一', nameEn: 'λ Ori', ra: 5.585, dec: 9.9342, mag: 3.5 },
    members: [
      { name: '觜宿一', nameEn: 'λ Ori', ra: 5.585, dec: 9.9342, mag: 3.5 },
      { name: '觜宿二', nameEn: 'φ¹ Ori', ra: 5.58, dec: 9.4956, mag: 4.4 },
      { name: '觜宿三', nameEn: 'φ² Ori', ra: 5.6167, dec: 9.2892, mag: 4.1 },
    ],
    astronomy:
      '觜宿三星,小而锐,位于猎户座头部。觜即觜觿(鸟喙),三星紧聚如鸟之喙。《史记·天官书》记「觜觿为虎首,主葆旅事」。距星觜宿一即猎户座λ(Meissa)。',
    culture:
      '觜宿为白虎之口,星虽小却是西方七宿的关节点——其与参宿同处猎户座,觜为虎首,参为虎身,共同构成白虎星象的头部与躯干。',
  },
  参: {
    id: '参', name: '参宿', pinyin: 'Shēn', quadrant: '白虎', index: 7,
    beast: '参水猿', officials: 7,
    determinative: { name: '参宿一', nameEn: 'ζ Ori', ra: 5.68, dec: -1.9428, mag: 1.74 },
    members: [
      { name: '参宿一', nameEn: 'ζ Ori', ra: 5.68, dec: -1.9428, mag: 1.74 },
      { name: '参宿二', nameEn: 'ε Ori', ra: 5.6033, dec: -1.2014, mag: 1.69 },
      { name: '参宿三', nameEn: 'δ Ori', ra: 5.5333, dec: -0.2992, mag: 2.25 },
      { name: '参宿四', nameEn: 'Betelgeuse', ra: 5.92, dec: 7.4071, mag: 0.5 },
      { name: '参宿五', nameEn: 'Bellatrix', ra: 5.4183, dec: 6.3497, mag: 1.64 },
      { name: '参宿六', nameEn: 'κ Ori', ra: 5.7967, dec: -9.6703, mag: 2.1 },
      { name: '参宿七', nameEn: 'Rigel', ra: 5.2417, dec: -8.2061, mag: 0.18 },
    ],
    astronomy:
      '参宿七星,位于猎户座——参宿一、二、三即著名的猎户腰带三星,参宿四(猎户座α,Betelgeuse)为红超巨星,参宿七(猎户座β,Rigel)为蓝白超巨星。《史记·天官书》记「参为白虎」,三星在腰,四星为四肢,正是虎踞之形。',
    culture:
      '参宿为「三星高照」之三星——「绸缪束薪,三星在天」(《诗经·唐风·绸缪》),冬季黄昏参宿三星升于东方,正值岁末婚嫁之时。参宿与心宿(商星)此升彼落、永不相见,遂成「参商永隔」之典。参宿天区还有伐、玉井、军井、屏、厕、屎等星官,「伐」三星即猎户大星云(M42)所在。',
    quote: { text: '绸缪束薪,三星在天。', source: '《诗经·唐风·绸缪》' },
  },

  // ─────────────── 南方朱雀 ───────────────
  井: {
    id: '井', name: '井宿', pinyin: 'Jǐng', quadrant: '朱雀', index: 1,
    beast: '井木犴', officials: 20,
    determinative: { name: '井宿一', nameEn: 'μ Gem', ra: 6.3833, dec: 22.5136, mag: 2.87 },
    members: [
      { name: '井宿一', nameEn: 'μ Gem', ra: 6.3833, dec: 22.5136, mag: 2.87 },
      { name: '井宿二', nameEn: 'ν Gem', ra: 6.4833, dec: 20.2122, mag: 4.1 },
      { name: '井宿三', nameEn: 'γ Gem', ra: 6.6283, dec: 16.3997, mag: 1.93 },
      { name: '井宿四', nameEn: 'ξ Gem', ra: 6.755, dec: 12.8958, mag: 3.4 },
      { name: '井宿五', nameEn: 'ε Gem', ra: 6.7317, dec: 25.1322, mag: 3.0 },
      { name: '井宿六', nameEn: 'ζ Gem', ra: 7.0717, dec: 20.5703, mag: 4.0 },
      { name: '井宿七', nameEn: 'λ Gem', ra: 7.3017, dec: 16.5408, mag: 3.6 },
    ],
    astronomy:
      '井宿八星,位于双子座,横跨银河两岸,形如水井。距星井宿一即双子座μ。《史记·天官书》记「东井为水事」。井宿是二十八宿中星官最多的宿(20星官),天区包含北河、南河、积水、水府等,皆与水相关。',
    culture:
      '井宿主水事,古代星占以井宿关乎水利、酒食。井宿天区有著名的「南河三」(小犬座α,Procyon)与「北河三」(双子座β,Pollux)两颗亮星,分属南河、北河星官,隔银河相望。',
  },
  鬼: {
    id: '鬼', name: '鬼宿', pinyin: 'Guǐ', quadrant: '朱雀', index: 2,
    beast: '鬼金羊', officials: 7,
    determinative: { name: '鬼宿一', nameEn: 'θ Cnc', ra: 8.5267, dec: 18.1031, mag: 5.3 },
    members: [
      { name: '鬼宿一', nameEn: 'θ Cnc', ra: 8.5267, dec: 18.1031, mag: 5.3 },
      { name: '鬼宿二', nameEn: 'η Cnc', ra: 8.545, dec: 20.4447, mag: 5.3 },
      { name: '鬼宿三', nameEn: 'γ Cnc', ra: 8.7217, dec: 21.4683, mag: 4.7 },
      { name: '鬼宿四', nameEn: 'δ Cnc', ra: 8.745, dec: 18.1561, mag: 3.9 },
    ],
    astronomy:
      '鬼宿四星,位于巨蟹座,星皆黯淡,为二十八宿中最暗的一宿。距星鬼宿一即巨蟹座θ。《史记·天官书》记「舆鬼,鬼祠事;中白者为质」。鬼宿四星围成一方小院落,中央一团模糊光斑即「积尸气」——今天我们知道,那是疏散星团M44(蜂巢星团)。',
    culture:
      '鬼宿之星暗而居中天,传统星占中与鬼祠、丧葬相关,「积尸气」之名尤令人印象深刻——古人以目力观察,见四星之中有一团如云似雾的光气,遂以尸气名之,实为星团的柔光。',
  },
  柳: {
    id: '柳', name: '柳宿', pinyin: 'Liǔ', quadrant: '朱雀', index: 3,
    beast: '柳土獐', officials: 2,
    determinative: { name: '柳宿一', nameEn: 'δ Hya', ra: 8.6283, dec: 5.7039, mag: 4.1 },
    members: [
      { name: '柳宿一', nameEn: 'δ Hya', ra: 8.6283, dec: 5.7039, mag: 4.1 },
      { name: '柳宿二', nameEn: 'σ Hya', ra: 8.6467, dec: 3.3389, mag: 4.4 },
      { name: '柳宿三', nameEn: 'η Hya', ra: 8.72, dec: 3.3972, mag: 4.3 },
      { name: '柳宿四', nameEn: 'ρ Hya', ra: 8.8067, dec: 5.8383, mag: 4.4 },
      { name: '柳宿五', nameEn: 'ε Hya', ra: 8.78, dec: 6.4186, mag: 3.4 },
      { name: '柳宿六', nameEn: 'ζ Hya', ra: 8.9233, dec: 5.9436, mag: 3.1 },
      { name: '柳宿七', nameEn: 'ω Hya', ra: 9.085, dec: 5.1367, mag: 4.9 },
      { name: '柳宿八', nameEn: 'θ Hya', ra: 9.2383, dec: 2.3042, mag: 3.9 },
    ],
    astronomy:
      '柳宿八星,弯曲如柳,位于长蛇座的蛇头。《史记·天官书》记「柳为鸟注,主木草」——「鸟注」即鸟喙,柳宿是朱雀之喙。距星柳宿一即长蛇座δ。',
    culture:
      '柳宿主草木,古代星占以柳宿关乎农桑。柳宿八星弯弯如垂柳,是南方七宿中最具形态之美的星群之一,与星、张、翼诸宿共同勾出朱雀的头颈与翅翼。',
  },
  星: {
    id: '星', name: '星宿', pinyin: 'Xīng', quadrant: '朱雀', index: 4,
    beast: '星日马', officials: 6,
    determinative: { name: '星宿一', nameEn: 'α Hya', ra: 9.46, dec: -8.6586, mag: 1.98 },
    members: [
      { name: '星宿一', nameEn: 'Alphard', ra: 9.46, dec: -8.6586, mag: 1.98 },
      { name: '星宿二', nameEn: 'τ¹ Hya', ra: 9.485, dec: -2.7636, mag: 4.6 },
      { name: '星宿三', nameEn: 'τ² Hya', ra: 9.5217, dec: -1.1897, mag: 4.5 },
      { name: '星宿四', nameEn: 'ι Hya', ra: 9.665, dec: -1.1428, mag: 3.9 },
      { name: '星宿五', nameEn: '26 Hya', ra: 9.33, dec: -11.8883, mag: 4.8 },
      { name: '星宿六', nameEn: '27 Hya', ra: 9.3417, dec: -9.5686, mag: 5.0 },
    ],
    astronomy:
      '星宿七星,古称「七星」,为朱雀之颈。距星星宿一即长蛇座α(Alphard,星宿一),是长蛇座最亮星,孤悬南天,阿拉伯人称「孤独者」——其周围确实再无亮星。《史记·天官书》记「七星,颈,为员官,主急事」。',
    culture:
      '星宿主衣裳、急事。星宿一孤明于天,是辨认南方星空的重要路标。七星之形如颈,与柳(喙)、张(嗉)、翼(翅)相连,朱雀的形象由此展开。',
  },
  张: {
    id: '张', name: '张宿', pinyin: 'Zhāng', quadrant: '朱雀', index: 5,
    beast: '张月鹿', officials: 2,
    determinative: { name: '张宿一', nameEn: 'υ¹ Hya', ra: 9.8583, dec: -14.8469, mag: 4.1 },
    members: [
      { name: '张宿一', nameEn: 'υ¹ Hya', ra: 9.8583, dec: -14.8469, mag: 4.1 },
      { name: '张宿二', nameEn: 'λ Hya', ra: 10.1767, dec: -12.3539, mag: 3.6 },
      { name: '张宿三', nameEn: 'μ Hya', ra: 10.435, dec: -16.8353, mag: 3.8 },
      { name: '张宿四', nameEn: 'φ Hya', ra: 10.645, dec: -16.8358, mag: 4.9 },
      { name: '张宿五', nameEn: 'κ Hya', ra: 9.6717, dec: -14.3319, mag: 5.0 },
    ],
    astronomy:
      '张宿六星,位于长蛇座中部,为朱雀之嗉(食囊)。距星张宿一即长蛇座υ¹。《史记·天官书》记「张,素,为厨,主觞客」——嗉为鸟之食袋,故张宿与饮食、宴客相关。',
    culture:
      '张宿主宴饮、宾客。张宿之名即「张罗以待」之意,星官天庙又在此宿,与祭祀相合。张宿之星虽不甚明,却是朱雀身体的关键一环。',
  },
  翼: {
    id: '翼', name: '翼宿', pinyin: 'Yì', quadrant: '朱雀', index: 6,
    beast: '翼火蛇', officials: 2,
    determinative: { name: '翼宿一', nameEn: 'α Crt', ra: 10.9967, dec: -18.2983, mag: 4.08 },
    members: [
      { name: '翼宿一', nameEn: 'α Crt', ra: 10.9967, dec: -18.2983, mag: 4.08 },
      { name: '翼宿二', nameEn: 'γ Crt', ra: 11.415, dec: -17.6842, mag: 4.1 },
      { name: '翼宿三', nameEn: 'δ Crt', ra: 11.3217, dec: -14.7781, mag: 3.6 },
      { name: '翼宿四', nameEn: 'ε Crt', ra: 11.41, dec: -10.8569, mag: 4.8 },
      { name: '翼宿五', nameEn: 'ζ Crt', ra: 11.7467, dec: -18.3506, mag: 4.7 },
      { name: '翼宿六', nameEn: 'λ Crt', ra: 11.39, dec: -18.7756, mag: 5.1 },
      { name: '翼宿七', nameEn: 'η Crt', ra: 11.9333, dec: -17.1553, mag: 5.2 },
    ],
    astronomy:
      '翼宿二十二星,分布于巨爵座与长蛇座之间,是二十八宿中星数最多的一宿——如鸟之双翼,「翼为羽翮」。《史记·天官书》记「翼为羽翮,主远客」。距星翼宿一即巨爵座α(Alkes)。',
    culture:
      '翼宿主远客、乐府,一说翼宿与歌舞音乐相关。二十二星分列两侧,如朱雀展翅,是四象星象中最为舒展的一宿。',
  },
  轸: {
    id: '轸', name: '轸宿', pinyin: 'Zhěn', quadrant: '朱雀', index: 7,
    beast: '轸水蚓', officials: 8,
    determinative: { name: '轸宿一', nameEn: 'γ Crv', ra: 12.2633, dec: -17.5417, mag: 2.58 },
    members: [
      { name: '轸宿一', nameEn: 'γ Crv', ra: 12.2633, dec: -17.5417, mag: 2.58 },
      { name: '轸宿二', nameEn: 'ε Crv', ra: 12.1683, dec: -22.6192, mag: 3.0 },
      { name: '轸宿三', nameEn: 'δ Crv', ra: 12.4983, dec: -16.5147, mag: 3.0 },
      { name: '轸宿四', nameEn: 'β Crv', ra: 12.5733, dec: -23.3967, mag: 2.65 },
      { name: '轸宿五', nameEn: 'α Crv', ra: 12.14, dec: -24.7281, mag: 4.0 },
    ],
    astronomy:
      '轸宿四星,位于乌鸦座,形如车厢,为朱雀之尾。《史记·天官书》记「轸为车,主风」。距星轸宿一即乌鸦座γ(Gienah)。轸宿天区有长沙、左辖、右辖等星官——「长沙」星(乌鸦座ζ)以城为名,是二十八宿中唯一以具体城市命名的星。',
    culture:
      '轸宿为南方七宿之末,如车行至终点。长沙星之设,古人以为对应长沙一地的分野;王勃《滕王阁序》「星分翼轸,地接衡庐」,说的正是翼、轸两宿所对应的地方分野。',
    quote: { text: '星分翼轸,地接衡庐。', source: '王勃《滕王阁序》' },
  },
}

/** 各象限所辖七宿(按顺序) */
export const QUADRANT_MANSIONS: Record<QuadrantId, MansionId[]> = {
  青龙: ['角', '亢', '氐', '房', '心', '尾', '箕'],
  朱雀: ['井', '鬼', '柳', '星', '张', '翼', '轸'],
  白虎: ['奎', '娄', '胃', '昴', '毕', '觜', '参'],
  玄武: ['斗', '牛', '女', '虚', '危', '室', '壁'],
}
