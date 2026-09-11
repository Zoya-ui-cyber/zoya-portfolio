"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import assets from "./assets.json";
import s from "./internship.module.css";
type Asset = {src:string;width:number;height:number};
function Picture({asset,alt,first=false}:{asset:Asset;alt:string;first?:boolean}) {
  // Keep supplied images at their original resolution without recompression.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={asset.src} width={asset.width} height={asset.height} alt={alt} loading={first?"eager":"lazy"} fetchPriority={first?"high":"auto"} decoding="async" />;
}
export default function InternshipPortfolio({mode}:{mode:"models"|"renders"}) {
  const [en,setEn]=useState(false);
  const [open,setOpen]=useState<Record<number,boolean>>({});
  useEffect(()=>{try {setEn((new URL(location.href).searchParams.get("lang")||localStorage.getItem("zoya-house-language"))==="en");}catch{}},[]);
  const t=(zh:string,english:string)=>en?english:zh;
  function toggle(){const next=!en;setEn(next);try{localStorage.setItem("zoya-house-language",next?"en":"zh");}catch{}const url=new URL(location.href);url.searchParams.set("lang",next?"en":"zh");history.replaceState(history.state,"",url);}
  const titles=mode==="models" ? [["日式室内陈设","Japanese Interior Styling"],["日式节庆陈设","Japanese Seasonal Celebrations"]] : [["自然光下的客厅","Living Room in Daylight"],["开放式起居空间","Open-plan Living"],["木构屋顶下的卧室","Bedroom beneath a Timber Roof"],["梁下的客餐厅","Living and Dining beneath Exposed Beams"]];
  return <div className={s.root} lang={en?"en":"zh-CN"}>
    <div className={s.header} onClick={e=>{if((e.target as HTMLElement).closest("button.language-switch"))toggle();}}><Header /></div>
    <main>
      {mode==="models" ? <>
        <header className={s.intro}><p className={s.eyebrow}>INTERNSHIP / MODEL COLLECTIONS</p><h1>{t("模型专题网站","Model Collection Websites")}</h1><p>{t("以电子棚拍为基础、AI 生图为辅助，完成专题 Banner 与类目视觉。专题中的全部模型由我选取，其中一部分由我使用 AI 建模生成。","The topic banners and category visuals are based on virtual studio photography, supplemented by AI image generation. I selected every model in the collections and generated some of them using AI modeling.")}</p></header>
        {[assets.interior,assets.festival].map((pages,i)=><section className={s.topic} key={i}>
          <h2><span>0{i+1}</span>{t(...titles[i] as [string,string])}</h2>
          {pages.slice(0,4).map((a,j)=><figure className={s.banner} key={a.src}><figcaption>{j===0?t("模型专题 Banner","Collection Banner"):t(`类目视觉 0${j}`,`Category Visual 0${j}`)}</figcaption><Picture asset={a} alt={`${t(...titles[i] as [string,string])} ${j+1}`} first={i===0&&j===0}/></figure>)}
          <button className={s.preview} aria-expanded={!!open[i]} aria-controls={`final-${i}`} onClick={()=>setOpen(v=>({...v,[i]:!v[i]}))}>{open[i]?t("收起最终页面 −","Close final page −"):t("预览最终页面 +","Preview final page +")}</button>
          {open[i]&&<div id={`final-${i}`} className={s.final}><Picture asset={pages[4]} alt={t("专题网站最终页面","Final collection webpage")} first /></div>}
        </section>)}
      </> : assets.renders.map((images,i)=><section key={i}>
        <div className={s.screen}>
          <header className={s.sceneTitle}><p className={s.eyebrow}>{t("效果图还原","RENDER RECREATION")} / 0{i+1}</p><h1>{t(...titles[i] as [string,string])}</h1><p>{i===0?t("全部场景均由我在渲染器中搭建并完成渲染，渲染过程未使用任何 AI 辅助。为贴近参考图，部分模型由我使用 AI 建模生成并上传使用。","I built and rendered every scene entirely in the renderer, without any AI assistance in the rendering process. To match the references, I generated and uploaded some models using AI modeling."):t("对照参考图，调整空间构成、陈设、材质与光线。","Recreating the spatial composition, furnishings, materials and lighting of the reference.")}</p></header>
          <div className={s.pair}>{images.slice(0,2).map((a,j)=><figure key={a.src}><figcaption>{j===0?t("参考图","REFERENCE"):t("还原渲染 · 01","RECREATED RENDER · 01")}</figcaption><Picture asset={a} alt={`${t(...titles[i] as [string,string])} — ${j===0?t("参考图","Reference"):t("还原渲染图1","Recreated render 1")}`} first={i===0}/></figure>)}</div>
        </div>
        <div className={s.screen}><header className={s.sceneTitle}><p className={s.eyebrow}>0{i+1} / {t("更多视角","ADDITIONAL VIEWS")}</p><h2>{t(...titles[i] as [string,string])}</h2></header><div className={s.pair}>{images.slice(2).map((a,j)=><figure key={a.src}><figcaption>{t(`还原渲染 · 0${j+2}`,`RECREATED RENDER · 0${j+2}`)}</figcaption><Picture asset={a} alt={t(`还原渲染图 ${j+2}`,`Recreated render ${j+2}`)}/></figure>)}</div></div>
      </section>)}
    </main>
    <footer className={s.footer}><Link href={`/?lang=${en?"en":"zh"}`}>{t("← 返回作品目录","← Back to directory")}</Link><Link href={`/projects/${mode==="models"?"render-recreation":"model-topics"}?lang=${en?"en":"zh"}`}>{mode==="models"?t("效果图还原 →","Render recreation →"):t("模型专题网站 →","Model collection websites →")}</Link></footer>
  </div>;
}
