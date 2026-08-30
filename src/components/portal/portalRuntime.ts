/**
 * 首页背景运行时(非响应式):
 * 卡片 hover 写入 ambience,PortalSkyScene 每帧读取并缓动到对应氛围参数。
 * 与 store/runtime 同模式 —— 高频渐变不经过 React 渲染。
 */

export type PortalAmbience = 'observe' | 'destiny' | 'divination' | 'knowledge'

export const portalRuntime = {
  ambience: null as PortalAmbience | null,
  /** 挂载以来秒数 */
  t: 0,
  /** 天穹渐显进度 0→1(约 2.6s 完成) */
  reveal: 0,
}
