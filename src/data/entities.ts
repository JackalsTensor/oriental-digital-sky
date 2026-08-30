/**
 * 知识图谱数据层(Phase 4/5 预留)。
 * 当前仅定义数据形状与少量示例关系;
 * 未来可接入完整知识库、古籍索引与 AI 检索(RAG)。
 *
 * 图谱结构示例:
 *   心宿 ──partOf──▶ 东方青龙 ──partOf──▶ 二十八宿
 *   心宿 ──contains──▶ 心宿二 ──associatedWith──▶ 大火 ──quotedIn──▶ 《诗经·七月》
 *   心宿 ──relatedTo──▶ 参宿(参商永隔)
 *   心宿 ──taoistAspect──▶ 道教文化(二十八宿星君、心月狐)
 */
import { MANSIONS, type MansionId } from './mansions'
import { QUADRANTS, type QuadrantId } from './quadrants'

export type EntityType =
  | 'mansion'
  | 'quadrant'
  | 'star'
  | 'concept'
  | 'historicalText'
  | 'taoistCulture'
  | 'system'

export type RelationKind =
  | 'partOf'
  | 'contains'
  | 'associatedWith'
  | 'quotedIn'
  | 'relatedTo'
  | 'taoistAspect'

export interface KnowledgeEntity {
  id: string
  type: EntityType
  name: string
  nameEn?: string
  /** 检索用关键词/别名 */
  aliases?: string[]
  /** 供未来 RAG 检索的正文(来自 mansions/quadrants 数据) */
  content?: string
  related: { targetId: string; kind: RelationKind; note?: string }[]
}

const entityOf = (id: MansionId): KnowledgeEntity => {
  const m = MANSIONS[id]
  return {
    id,
    type: 'mansion',
    name: m.name,
    aliases: [m.pinyin, m.beast],
    content: `${m.astronomy}\n${m.culture}`,
    related: [
      { targetId: m.quadrant, kind: 'partOf' },
      { targetId: 'er-shi-ba-xiu', kind: 'partOf' },
      { targetId: `star:${m.determinative.name}`, kind: 'contains', note: '距星' },
      ...m.members
        .filter((s) => s.name !== m.determinative.name)
        .map((s) => ({ targetId: `star:${s.name}`, kind: 'contains' as RelationKind })),
    ],
  }
}

/** 示例图谱(未来可扩展为完整 Knowledge Graph) */
export const KNOWLEDGE_ENTITIES: KnowledgeEntity[] = [
  {
    id: 'er-shi-ba-xiu',
    type: 'system',
    name: '二十八宿',
    nameEn: 'The Twenty-Eight Mansions',
    aliases: ['28宿', '二十八舍'],
    related: [],
  },
  ...(Object.keys(QUADRANTS) as QuadrantId[]).map((q) => {
    const d = QUADRANTS[q]
    return {
      id: q,
      type: 'quadrant' as EntityType,
      name: d.name,
      nameEn: d.enName,
      aliases: ['四象', d.direction, d.season],
      content: d.intro,
      related: [{ targetId: 'er-shi-ba-xiu', kind: 'partOf' as RelationKind }],
    }
  }),
  ...(Object.keys(MANSIONS) as MansionId[]).map(entityOf),
  {
    id: 'star:心宿二',
    type: 'star',
    name: '心宿二',
    nameEn: 'Antares',
    aliases: ['大火', '天王', '商星'],
    related: [
      { targetId: '心', kind: 'partOf' },
      { targetId: 'concept:大火', kind: 'associatedWith' },
    ],
  },
  {
    id: 'concept:大火',
    type: 'concept',
    name: '大火',
    aliases: ['大火星', '七月流火'],
    related: [{ targetId: 'text:诗经七月', kind: 'quotedIn' }],
  },
  {
    id: 'text:诗经七月',
    type: 'historicalText',
    name: '《诗经·豳风·七月》',
    content: '七月流火,九月授衣。',
    related: [],
  },
  {
    id: 'taoist:星君',
    type: 'taoistCulture',
    name: '二十八宿星君',
    content:
      '道教将二十八宿神格化为星君,各有名号(如角宿属木蛟、心宿属月狐),见于斋醮科仪与《北斗经》等经典。此为宗教文化观念,与现代天文学无关。',
    related: [{ targetId: 'er-shi-ba-xiu', kind: 'taoistAspect' }],
  },
]
