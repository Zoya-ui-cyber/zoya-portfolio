import type { Project } from "@/types/project";

export const projects: Project[] = [
  {
    slug: "craft-academy",

    collection: "selected",
    
    title: {
      zh: "手工艺学院改造",
      en: "Craft Academy Renovation",
    },

    subtitle: {
      zh: "边界之上：自发生长的秩序",
      en: "Above the Boundary: A Spontaneously Grown Order",
    },

    year: 2025,

    category: ["architecture"],

    projectType: {
      zh: "毕业设计 · 个人作品",
      en: "Graduation Project · Individual Work",
    },

    instructors: ["吴昊文"],

    period: "2025.02 — 2025.06",

    description: {
      zh: "从松阳新华路沿线的自发性增建出发，从本土建筑逻辑中提取空间秩序，将原行政办公楼改造为一座开放的非物质文化遗产工艺学院。",
      en: "An adaptive reuse project that transforms a former administrative building into an open craft academy, drawing spatial logic from spontaneous additions along Xinhua Road in Songyang.",
    },

    cover: "/projects/craft-academy/cover.webp",

    featured: true,

    order: 1,
  },

  {
    slug: "xinhua-road",
    mode: "pdf",
    pages: [{"src": "/projects/xinhua-road/pdf/page-01.webp", "width": 3000, "height": 2122}, {"src": "/projects/xinhua-road/pdf/page-02.webp", "width": 3000, "height": 2122}, {"src": "/projects/xinhua-road/pdf/page-03.webp", "width": 3000, "height": 2122}, {"src": "/projects/xinhua-road/pdf/page-04.webp", "width": 3000, "height": 2122}],

    collection: "selected",

    title: {
      zh: "新华路城市改造设计",
      en: "Xinhua Road Urban Renewal",
    },

    subtitle: {
      zh: "边边角角：街区边角空间更新",
      en: "Edges and Corners: Urban Fringe Renewal",
    },

    year: 2025,

    category: ["urban"],

    projectType: {
      zh: "学校课程设计 · 个人作品",
      en: "Academic Project · Individual Work",
    },

    instructors: ["吴昊文", "吕嘉伟"],

    period: "2024.10 — 2025.01",

    description: {
      zh: "通过研究新华路沿线居民自发形成的遮篷、楼梯、摊位与连接构筑物，提取一种源于日常生活的边缘空间秩序，并将其转化为街区更新策略。",
      en: "A study of informal additions along Xinhua Road, translating everyday structures such as canopies, stairs and temporary stalls into an urban renewal strategy.",
    },

    cover: "/projects/xinhua-road/cover.webp",

    featured: true,

    order: 2,
  },

  {
    slug: "whale-pier",
    mode: "pdf",
    pages: [{"src": "/projects/whale-pier/pdf/page-01.webp", "width": 3000, "height": 2122}, {"src": "/projects/whale-pier/pdf/page-02.webp", "width": 3000, "height": 2122}, {"src": "/projects/whale-pier/pdf/page-03.webp", "width": 3000, "height": 2122}, {"src": "/projects/whale-pier/pdf/page-04.webp", "width": 3000, "height": 2122}],

    collection: "selected",

    title: {
      zh: "观鲸码头",
      en: "Whale Watching Pier",
    },

    subtitle: {
      zh: "声之形",
      en: "The Form of Sound",
    },

    year: 2023,

    category: ["architecture"],

    projectType: {
      zh: "竞赛设计 · 个人作品",
      en: "Competition Project · Individual Work",
    },

    instructors: ["付振"],

    period: "2023.04 — 2023.07",

    description: {
      zh: "以鲸类发声与海洋运动为设计起点，将声波几何转化为空间与结构系统，构建一个连接陆地、建筑与海洋的开放界面。",
      en: "A coastal project that translates whale vocalizations and ocean movement into spatial and structural systems, forming an open interface between land, architecture and sea.",
    },

    cover: "/projects/whale-pier/cover.webp",

    featured: true,

    order: 3,
  },

  {
    slug: "zhejiang-museum",
    mode: "pdf",
    pages: [{"src": "/projects/zhejiang-museum/pdf/page-01.webp", "width": 3000, "height": 2122}, {"src": "/projects/zhejiang-museum/pdf/page-02.webp", "width": 3000, "height": 2122}, {"src": "/projects/zhejiang-museum/pdf/page-03.webp", "width": 3000, "height": 2122}, {"src": "/projects/zhejiang-museum/pdf/page-04.webp", "width": 3000, "height": 2122}],

    collection: "selected",

    title: {
      zh: "浙江博物馆扩建工程",
      en: "Zhejiang Museum Extension",
    },

    subtitle: {
      zh: "苔下阶石：博物馆空间更新",
      en: "Stone Beneath Moss: Museum Spatial Renewal",
    },

    year: 2022,

    category: ["architecture"],

    projectType: {
      zh: "学校课程设计 · 个人成果",
      en: "Academic Project · Individual Work",
    },

    instructors: ["余林峻"],

    period: "2022.02 — 2022.07",

    description: {
      zh: "通过下沉空间、地下通道与多层流线组织，将新增展览与公共功能嵌入既有博物馆体系，形成连接周边建筑的空间枢纽。",
      en: "A museum extension organized through sunken spaces, underground passages and layered circulation, creating a spatial hub between existing buildings.",
    },

    cover: "/projects/zhejiang-museum/cover.webp",

    featured: true,

    order: 4,
  },

  {
    slug: "bamboo",
    mode: "pdf",
    pages: [{"src": "/projects/bamboo/pdf/page-01.webp", "width": 3000, "height": 2122}],

    collection: "selected",

    title: {
      zh: "竹结构搭建建设项目",
      en: "Bamboo Structure Installation",
    },

    subtitle: {
      zh: "竹芽",
      en: "Bamboo Shoot",
    },

    year: 2024,

    category: ["spatial", "installation"],

    projectType: {
      zh: "团队工作 · 方案推演及主要结构搭建",
      en: "Team Project · Design Development & Construction",
    },

    instructors: ["余林峻"],

    period: "2024.05 — 2024.08",

    description: {
      zh: "以竹笋生长为概念，通过不同直径竹材与多层倾斜结构完成一座六米高的竹构装置，并参与方案推演与主要结构搭建。",
      en: "A six-meter bamboo installation inspired by the upward growth of bamboo shoots, developed through layered structural systems and hands-on construction.",
    },

    cover: "/projects/bamboo/cover.webp",

    featured: true,

    order: 5,
  },

  {
    slug: "seen-light",
    mode: "pdf",
    pages: [{"src": "/projects/seen-light/pdf/page-01.webp", "width": 3000, "height": 2122}],

    collection: "selected",
    
    title: {
      zh: "所见之光",
      en: "The Light We See",
    },

    subtitle: {
      zh: "剧本转化装置",
      en: "A Spatial Translation of Theatre",
    },

    year: 2025,

    category: ["spatial", "installation"],

    projectType: {
      zh: "小组成果",
      en: "Group Project",
    },

    instructors: ["Ms. Anna Gulinska", "Ms. Zsuzsa Peter"],

    period: "2025.03 — 2025.04",

    description: {
      zh: "以话剧《雷雨》为灵感，将六个剧情节点转化为六个连续空间，通过尺度、光线与流线变化构建戏剧性的空间叙事。",
      en: "Inspired by the play Thunderstorm, six narrative moments are translated into six connected spaces shaped through changes in scale, light and movement.",
    },

    cover: "/projects/seen-light/cover.webp",

    featured: true,

    order: 6,
  },
  { slug: "model-topics", collection: "digital", title: { zh: "模型专题网站", en: "Model Collection Websites" }, year: 2026, category: ["visual"], projectType: { zh: "实习作品", en: "Internship Work" }, cover: "", order: 7 },
  { slug: "render-recreation", collection: "digital", title: { zh: "效果图还原", en: "Interior Render Recreation" }, year: 2026, category: ["visual"], projectType: { zh: "实习作品", en: "Internship Work" }, cover: "", order: 8 },
  { slug: "programs", collection: "digital", title: { zh: "程序类", en: "Workflow Tools" }, year: 2026, category: ["visual"], projectType: { zh: "AI 辅助开发 · 实习工具", en: "AI-assisted Development · Internship Tools" }, cover: "", order: 9 },
];