# ARCHITECTURE BLUEPRINT — 东方数字天穹 · CELESTIAL REALM

> 2026-08-30 架构审计版。原则:先设计骨架,再开发功能;二十八宿系统保持不动。
> 本文档是平台架构的唯一事实来源;未来每个 Phase 开工前先更新本文档。

---

## 1. 当前架构(现状)

```
src/
├── app/
│   ├── layout.tsx              # 根布局:本地字体、全局 metadata、globals.css
│   └── page.tsx                # 唯一路由 /:二十八宿 Web3D 页面组合(DOM 叠层 + SkyClient)
├── lib/
│   ├── astronomy/              # ★ 纯函数天文学计算层(零 Three.js 依赖)
│   │   ├── types.ts            #   Site / TimeParts / Equatorial / Horizontal / Vec3
│   │   ├── time.ts             #   儒略日、GMST/LST(Meeus)
│   │   ├── precession.ts       #   IAU 1976 岁差矩阵
│   │   ├── coords.ts           #   赤道↔单位向量、赤道→地平、银道→赤道
│   │   └── index.ts            #   computeSkyFrame(site, time) → SkyFrame 门面
│   └── utils/textures.ts       # 程序化纹理(光晕/星云/文字),canvas 生成
├── data/                       # 静态领域数据(TS 模块,无数据库)
│   ├── mansions.ts             #   28 宿:距星/成员星/星官数/astronomy/culture/quote
│   ├── quadrants.ts            #   四象
│   ├── dipper.ts               #   北斗 + 北极星
│   ├── sites.ts                #   9 个观测地 + DEFAULT_SITE
│   └── entities.ts             #   知识图谱数据层(Phase 4/5 预留,UI 未消费)
├── store/sky.ts                # zustand 离散 UI 状态 + runtime 可变对象(3D 高频态,非响应式)
└── components/
    ├── universe/               # SkyClient(dynamic ssr:false 装载)/ Sky(Canvas 组合)/ Controls(相机+输入+投影拾取)
    ├── stars/                  # starMaterial(单 ShaderMaterial 工厂)/ BackgroundStars / MilkyWay / Nebulae
    ├── mansions/               # MansionSystem:28 宿节点/成员星/连线/四象脊线/北斗/地平环
    └── ui/                     # OpeningOverlay / TopBar / SideNav / InfoPanel / Timeline / HoverLabel / Hints / EdgeCardinals / FocusLabel
```

关键事实(审计结论):

- **单路由应用**:全部内容在 `/`,页面组合写在 `app/page.tsx`,没有可复用的一级模块边界。
- **天文学层已是事实上的共享 Core**:`lib/astronomy` 纯函数、无 Three.js 依赖、有 8 项锚点校验(`npm run check:astro`),场景层通过 `computeSkyFrame` 门面取数——这正是未来所有模块应共享的形态。
- **数据层已具雏形**:`entities.ts` 的知识图谱(EntityType 含 mansion/star/historicalText/taoistCulture)已经在字段层面区分「现代天文」与「传统观念」;`Mansion` 的 `astronomy` / `culture` / `quote` 三个字段即三层内容的雏形。
- **状态分层成熟**:React/zustand 只管离散 UI 态;3D 高频态走 `runtime` 可变对象;时间/地点变更以 `revision` 计数触发场景重建。
- **尚不存在**:历法(干支/节气/农历)、Core 目录、一级路由、任何术数体系——均为规划,不要当作已完成。

## 2. 目标架构

```
                            ┌────────────────────────────┐
                            │  / 东方数字天穹(总入口)     │
                            │  CELESTIAL REALM          │
                            └──────────┬─────────────────┘
          ┌────────────────┬──────────┴─────────┬─────────────────┐
          ▼                ▼                    ▼                 ▼
   ┌─────────────┐  ┌─────────────┐      ┌─────────────┐   ┌─────────────┐
   │ /observe    │  │ /destiny    │      │ /divination │   │ /knowledge  │
   │ 观星 ✅     │  │ 命理 规划中 │      │ 卜筮 规划中 │   │ 知识 规划中 │
   │ (现有系统)  │  │             │      │             │   │             │
   └──────┬──────┘  └──────┬──────┘      └──────┬──────┘   └──────┬──────┘
          │                │                    │                 │
          └────────────────┴────────┬───────────┴─────────────────┘
                                    ▼
                    ┌────────────────────────────┐
                    │  /core 共享层(设计见 §5)    │
                    │  astronomy · calendar      │
                    │  location · knowledge      │
                    └────────────────────────────┘
```

原则:

- 一级路由 = 一级模块;**模块之间不互相 import**,只允许依赖 `@/core` 与自有目录。
- `/observe` 承载现有二十八宿系统,**零改动迁移**(物理移动 page 文件,内容不动)。
- 未来每个模块先声明自己在 `core` 中的依赖域,再开工;缺什么先补 core。

## 3. 路由树

```
/               总入口 —— 四模块集散,不做具体功能
├── /observe    观星 ✅(现有二十八宿 Web3D 全量内容)
├── /destiny    命理 —— 命理体系选择页(八字 / 紫微斗数 / 七政四余 入口)
│   ├── /destiny/bazi      八字 —— 占位(四柱命局)
│   ├── /destiny/ziwei     紫微斗数 —— 占位(十二宫星曜)
│   └── /destiny/qizheng   七政四余 —— 占位(日月五星)
├── /divination 卜筮 —— 占位页(六爻 · 奇门遁甲 · 梅花易数 · 大六壬 · 太乙)
└── /knowledge  知识 —— 占位页(古籍 · 星官 · 古代天文学 · 历史文化)

未来嵌套路由(仅设计,不创建):
  /observe/mansions/[id]     星宿专题页
  /observe/asterisms         古代星官
  /knowledge/texts/[id]      古籍条目
  /divination/liuyao        六爻
```

## 4. 推荐目录树(目标形态)

```
src/
├── app/
│   ├── layout.tsx                # 全局根布局(不动)
│   ├── globals.css               # 设计令牌(不动)
│   ├── page.tsx                  # ★ / 总入口(本次新建)
│   ├── observe/page.tsx          # ★ /observe(原 page.tsx 原样迁移)
│   ├── destiny/page.tsx          # 占位(本次新建)
│   ├── divination/page.tsx       # 占位(本次新建)
│   └── knowledge/page.tsx        # 占位(本次新建)
├── core/                         # ★ 平台共享层(设计已定,首个新模块开工时创建)
│   ├── index.ts                  #   总出口:各模块只从 @/core 导入跨域能力
│   ├── astronomy.ts              #   re-export @/lib/astronomy(现成)
│   ├── calendar.ts               #   未来新写:干支/节气/历法(纯函数)
│   ├── location.ts               #   re-export @/data/sites + Site(现成)
│   ├── celestial.ts              #   未来:统一星体目录接口(恒星/七政)
│   └── knowledge.ts              #   re-export @/data/entities(现成)
├── lib/                          # (现状不动)
│   ├── astronomy/                #   天文学计算层 —— 保持不动
│   └── utils/textures.ts         #   程序化纹理 —— 保持不动
├── data/                         # (现状不动;未来按层分目录,见 §6)
│   ├── mansions.ts / quadrants.ts / dipper.ts / sites.ts / entities.ts
│   ├── astronomy/                #   未来:现代天文事实(恒星目录、行星数据)
│   ├── culture/                  #   未来:历史文化资料(古籍原文、星官考据)
│   └── practice/                 #   未来:传统术数体系(斗数星曜、卦象、局式)
├── store/
│   └── sky.ts                    # observe 专属状态(不动;未来模块各自建 store/)
└── components/
    ├── portal/                   # ★ 总入口专用组件(本次新建:PortalCards / ModulePlaceholder)
    ├── universe/ stars/ mansions/ ui/   # observe 场景与 UI(全部不动)
```

## 5. Core 设计

**创建时机**:第一个新模块(destiny/divination/knowledge 任一)真正开工时创建。现在仅定义契约。

**形态**:re-export 薄封装,物理迁移延迟到「第二个消费者出现」之后;届时移动文件、保留桶文件,消费方无感知。

```
src/core/index.ts        export * from './astronomy' 等 —— 统一出口
src/core/astronomy.ts    export * from '@/lib/astronomy'          ← 复用现有 5 个纯函数模块
src/core/location.ts     export { SITES, DEFAULT_SITE } from '@/data/sites'; export type { Site } from '@/lib/astronomy'
src/core/knowledge.ts    export * from '@/data/entities'          ← 复用现有图谱数据层
src/core/calendar.ts     未来新写(纯函数,不依赖 UI):
                         - ganzhi:      天干地支、六十甲子、年/月/日/时干支
                         - solarTerms:  二十四节气(依赖 astronomy 层新增黄经函数)
                         - lunar:       农历换算(表驱动)
src/core/celestial.ts    未来:统一星体目录接口(名称 → J2000 坐标 → 场景向量),
                         为七政四余、古星官提供取数契约;28 宿数据届时亦可适配此接口
```

纪律:

- core 内只有**纯计算与纯数据**,不 import React / Three.js / zustand。
- 术数逻辑(排盘、起卦)**不属于 core**:它们依赖 calendar 但本身是模块领域,放在各模块自己的 `lib/` 下。
- core 不反向依赖任何一级模块。

## 6. Data 设计(内容分层)

三层内容,在任何 UI 中都必须可区分:

| 层 | 含义 | 现状 | 未来落点 |
| --- | --- | --- | --- |
| **ASTRONOMY** 现代天文事实 | 可验证的天文计算与数据 | `lib/astronomy` + `Mansion.astronomy` 字段 + 距星/坐标数据 | `data/astronomy/` |
| **HISTORY/CULTURE** 历史文化资料 | 古籍文本、星官体系、文化观念(以史料定位) | `Mansion.culture` / `quote` + `entities.ts` 图谱 | `data/culture/` |
| **TRADITIONAL PRACTICE** 传统术数体系 | 斗数/八字/六爻等(以「历史方法与文化文本」定位,不作科学论断) | 不存在 | `data/practice/` |

约定:

- 现有 `mansions.ts` 等**不拆分、不迁移**——其字段级分层(`astronomy`/`culture`/`quote`)已满足当前需要。
- 新数据按层落目录;每个实体标注层级来源;UI 呈现时保持边界声明(现有 InfoPanel 底部的声明句式即为模板)。
- 数据形态:继续用 TS 静态模块,不建数据库(个人项目,保持简单)。

## 7. Web3D 层级(现有组件归类)

| 层 | 现有组件 | 归属 |
| --- | --- | --- |
| **Core** 共享底层 | `lib/astronomy`(坐标/时间/岁差)、`lib/utils/textures`(程序化纹理)、`data/*`(领域数据)、`store/runtime` 状态约定 | 跨模块共享 |
| **Scene** 场景渲染 | `universe/Sky`(Canvas 组合)、`universe/SkyClient`(ssr:false 装载)、`stars/BackgroundStars`、`stars/MilkyWay`、`stars/Nebulae`、`stars/starMaterial`(通用 GPU 点渲染工厂)、`mansions/MansionSystem` | starMaterial 可共享;其余当前为 observe 专属 |
| **Interaction** 交互 | `universe/Controls`(相机模型 + 输入 + 投影拾取) | observe 专属(模式可参考) |
| **UI** DOM 叠层 | `ui/*` 全部 9 个组件 | observe 专属 |
| **Data** 数据/状态 | `data/*` + `store/sky.ts` | data 跨模块共享(部分);store 为 observe 专属 |

未来模块的 3D 场景约定:复用 `core/astronomy` + `starMaterial` + SkyClient 式动态装载模式;各自拥有独立的 Canvas 组合与相机控制;**不复用** MansionSystem / Controls 内部实现(除非届时提炼出真正通用的部分,再移入 core,不提前抽象)。

## 8. 一级模块职责

- **/observe 观星**:现有二十八宿 Web3D(不动)。未来扩展:七政四余、古代星官、古星图模式(Phase 4 已预留)、古代天文学层。依赖 core/astronomy + core/celestial。
- **/destiny 命理**:紫微斗数、八字、七政四余。传统命理体系,以历史方法与文化文本定位。依赖 core/calendar + core/location + data/practice。
- **/divination 卜筮**:六爻、奇门遁甲、梅花易数、大六壬、太乙。传统占法体系,定位同上。依赖 core/calendar + data/practice。
- **/knowledge 知识**:古籍、星官、二十八宿、古代天文学、历史文化资料。文本优先,零 3D 风险最低,是验证 Core 分层的第一个候选模块。依赖 core/knowledge + data/culture。

## 9. 数据流

**现有(不动)**:

```
store(site, time) ──revision++──▶ 订阅者(MilkyWay / Nebulae / MansionSystem)
                                        │
                                  computeSkyFrame(site, time)
                                        │
                                重写 BufferAttribute 位置(时间/地点变更时)
                                        │
                    runtime.hit(36 目标)──▶ Controls 屏幕投影拾取
                                        │
                              hover/select ──▶ zustand ──▶ UI 面板
                                        │
                        useFrame 每帧插值视觉态(GPU attribute 直写,零 React 渲染)
```

**未来(模块间)**:

```
一级模块 ──▶ @/core(纯计算/纯数据) ──▶ 模块自身 scene/UI/store
                  ▲
                  └── 模块之间永不直接 import
```

## 10. 路由流

```
/ ──点击 观星──▶ /observe ──开屏──▶ ENTER THE SKY ──▶ 交互
/ ──点击 命理/卜筮/知识──▶ 占位页 ──返回──▶ /
(浏览器返回键在 /observe 内同样可用;未来在 TopBar 加「门户」回链,本次不动现有 UI)
```

## 11. 本次修改内容(2026-08-30)

1. `src/app/observe/page.tsx` —— 新建,原 `page.tsx` 内容原样迁移(函数名 Home → ObservePage,其余零改动)。
2. `src/app/page.tsx` —— 重写为总入口:品牌区 + 四模块卡片(2×2,观星可用、其余规划中)+ 分层声明。服务器组件 + 轻量入场动画(复用 framer-motion 与现有设计令牌)。
3. `src/components/portal/PortalCards.tsx` —— 新建,总入口卡片(客户端组件,仅动画)。
4. `src/components/portal/ModulePlaceholder.tsx` —— 新建,三个占位页共用的静态占位组件。
5. `src/app/{destiny,divination,knowledge}/page.tsx` —— 新建,各 ~10 行占位页 + 各自 metadata。
6. `docs/architecture.md` —— 本蓝图。

## 12. 保持不变的内容(禁止触碰清单)

- `src/lib/astronomy/*`(5 个文件)—— 天文学计算层,一字不动
- `src/data/{mansions,quadrants,dipper,sites,entities}.ts` —— 恒星/星宿/地点数据,一字不动
- `src/store/sky.ts` —— 状态层,一字不动
- `src/components/{universe,stars,mansions,ui}/*` —— 全部场景与 UI,一字不动
- `src/app/layout.tsx`、`src/app/globals.css` —— 根布局与设计系统,一字不动
- `src/lib/utils/textures.ts`、`scripts/*`、`package.json`、`next.config.ts`、`tsconfig.json` —— 不动

注意:`scripts/screenshot.mjs` 默认打开 `http://localhost:3000`(现为总入口),验证 observe 流程需 `URL=http://localhost:3000/observe node scripts/screenshot.mjs`。脚本本身不改。

## 13. 未来扩展路线

| 阶段 | 内容 | 前置 |
| --- | --- | --- |
| Stage 0 ✅ | 路由骨架 + 本蓝图 | —— |
| Stage 1 | `/knowledge` 知识模块(文本优先,零 3D) | 创建 core 桶文件;补 data/culture |
| Stage 2 | `/observe` 扩展:七政四余、古星官、古图模式(Phase 4) | core/celestial 接口 |
| Stage 3 | `/destiny`、`/divination`(先 calendar core,再术数) | core/calendar(干支/节气)+ data/practice |

每阶段纪律:开工前更新本蓝图;模块间零直接依赖;内容始终三层分明、各守其界。
