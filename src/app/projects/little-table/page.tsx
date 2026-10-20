"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import s from "./little-table.module.css";

export default function LittleTableProject() {
  const [en, setEn] = useState(false);
  useEffect(() => {
    const query = new URLSearchParams(location.search).get("lang");
    let saved = "zh";
    try { saved = localStorage.getItem("zoya-house-language") || "zh"; } catch {}
    setEn((query || saved) === "en");
  }, []);
  function toggle() {
    const next = !en; setEn(next);
    try { localStorage.setItem("zoya-house-language", next ? "en" : "zh"); } catch {}
    const address = new URL(location.href); address.searchParams.set("lang", next ? "en" : "zh");
    history.replaceState(history.state, "", address);
  }
  const lang = en ? "en" : "zh";
  const features = [
    ["从剩余食材出发", "Start with what’s left", "输入冰箱里已有的食材，自由调整还能补充几样。", "Find recipes from ingredients you already have and set how many extras to buy."],
    ["把菜单摆成一桌", "Set your own table", "独立滚动的私房菜单，搭配错落摆放、三档大小的菜品。", "A separately scrolling private menu with playful plates in three sizes."],
    ["把买菜变得可见", "Make groceries tangible", "俯视购物车中，虚影变成实物；区分待买、已买与已有。", "Ghost ingredients become tangible in a top-view cart, distinguishing to-buy, bought and already-owned items."],
    ["日常，也照顾健身", "Everyday food, fitness-friendly", "地域、食材、健身与早饭交叉筛选，健身版显示每份营养估算。", "Filter by cuisine, ingredient, fitness and breakfast; fitness recipes show estimated nutrition per serving."],
    ["记住自己的味道", "Keep your own recipes", "记录自创食谱、实际花费，以及每一餐的采购历史。", "Keep personal recipes, actual ingredient costs and the shopping history of each meal."],
    ["一套设计，两种语言", "Two languages, one experience", "中文与英文切换，电脑与手机保留各自适合的布局。", "Switch between Chinese and English, with layouts adapted for desktop and mobile."],
  ];
  return <div className={s.page}>
    <header className={s.header}><Link href={`/?lang=${lang}`}>ZOYA YIN</Link><button onClick={toggle} aria-label={en ? "Switch to Chinese" : "切换到英文"}>中 / EN</button></header>
    <main className={s.main}>
      <section className={s.hero}><p className={s.eyebrow}>UI / UX · PRODUCT DESIGN · 2026</p><h1>{en ? "Little Table" : "小饭桌"}</h1><p className={s.subtitle}>{en ? "A little joy in every meal." : "每一顿，都值得期待。"}</p>
        <div className={s.parade}>{["fav-sweet-sour-ribs", "fav-tuscan", "s1", "home-spinach", "jiangsu-rice", "zhejiang-shrimp"].map(id => <div key={id}><img src={`/little-table/assets/ui/dish/${id}.svg`} width="200" height="200" alt="" /></div>)}</div>
        <div className={s.actions}><a href={`/little-table/index.html?lang=${lang}#home`} target="_blank" rel="noopener noreferrer">{en ? "Try Little Table ↗" : "打开小饭桌 ↗"}</a><span>{en ? "Early preview · Desktop & mobile" : "早期试用 · 电脑与手机"}</span></div>
      </section>
      <section className={s.intro}><h2>{en ? "From ingredients to a meal." : "从食材，到一顿饭。"}</h2><p>{en ? "A bilingual recipe and meal-planning experience designed around a small daily question: what should I cook today? Flat food illustrations, a playful dining table and a tangible grocery cart make that decision easier to explore." : "从“今天吃什么”这个日常问题出发，把食谱收藏、食材匹配、点菜和买菜清单串成一个轻松的流程。用扁平食物图形、可摆放的餐桌和直观的购物车，让做饭前的选择更有趣。"}</p></section>
      <section className={s.features}>{features.map(([zh, eng, copyZh, copyEn], i) => <article key={zh}><small>0{i + 1}</small><h3>{en ? eng : zh}</h3><p>{en ? copyEn : copyZh}</p></article>)}</section>
      <section className={s.preview}><img src="/projects/little-table/preview.webp" width="1440" height="1050" alt={en ? "Little Table recipe library" : "小饭桌食谱库界面"} loading="lazy" /></section>
      <footer className={s.footer}><Link href={`/?lang=${lang}`}>{en ? "← Back to portfolio" : "← 返回作品集"}</Link><a href={`/little-table/index.html?lang=${lang}#register`} target="_blank" rel="noopener noreferrer">{en ? "Request early access ↗" : "申请内测 ↗"}</a></footer>
    </main>
  </div>;
}
