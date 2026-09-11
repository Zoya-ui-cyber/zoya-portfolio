"use client";
import {useLayoutEffect,useRef,useState,type ReactNode} from 'react';
import s from './craft.module.css';
const titles=[['聚碳酸酯顶棚','POLYCARBONATE ROOF'],['石质铺面','STONE FLOOR'],['轻钢龙骨及玻璃幕墙结构','LIGHT STEEL + CURTAIN WALL']];
const files=['polycarbonate-roof','stone-floor','steel-curtain-wall'];
const descriptions=[['轻质聚碳酸酯板覆盖新增钢结构，在提供遮蔽的同时过滤自然光，并降低新增屋面的视觉重量。','Lightweight polycarbonate panels cover the new steel structure, filtering natural light while providing shelter and reducing the roof’s visual weight.'],['架空石材铺面形成连续公共地面，为排水和设备预留空间，并与主体结构保持相对独立。','Raised stone paving creates a continuous public surface, allowing space for drainage and services while remaining independent of the main structure.'],['轻钢龙骨与玻璃幕墙共同形成轻质、透明的建筑界面，让新增体系与既有结构保持清晰的层次。','Light steel framing and glass form a lightweight, transparent enclosure, retaining a clear distinction between new additions and the existing structure.']];
const path=(name:string)=>`/projects/craft-academy/page-06-exhibition-details/${name}.png`;
export default function DetailCallouts({lang,view,heading}:{lang:'zh'|'en';view:(v:{src:string;label:string})=>void;heading:ReactNode}){
 const [open,setOpen]=useState<number|null>(0),[lines,setLines]=useState<string[]>([]);
 const root=useRef<HTMLDivElement>(null),left=useRef<HTMLDivElement>(null),right=useRef<HTMLButtonElement>(null),buttons=useRef<(HTMLButtonElement|null)[]>([]);
 const li=lang==='zh'?0:1;
 useLayoutEffect(()=>{
  const outer=root.current,scroll=left.current,picture=right.current;if(!outer||!scroll||!picture)return;let raf=0;
  const measure=()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{
   const r=outer.getBoundingClientRect(),l=scroll.getBoundingClientRect(),p=picture.getBoundingClientRect(),anchors=[[.6,.21],[.58,.48],[.57,.68]];
   setLines(buttons.current.map((el,i)=>{if(!el)return '';const t=el.getBoundingClientRect();if(t.top<l.top||t.top>=l.bottom)return '';const x=t.left-r.left,y=t.top-r.top,elbow=l.right-r.left+8,ex=p.left-r.left+p.width*anchors[i][0],ey=p.top-r.top+p.height*anchors[i][1];return `${x},${y} ${elbow},${y} ${elbow+12},${ey} ${ex},${ey}`;}));
  });};
  const ro=new ResizeObserver(measure);ro.observe(outer);ro.observe(scroll);buttons.current.forEach(t=>{if(t)ro.observe(t);});scroll.addEventListener('scroll',measure,{passive:true});measure();
  return()=>{cancelAnimationFrame(raf);ro.disconnect();scroll.removeEventListener('scroll',measure);};
 },[open,lang]);
 return <div ref={root} className={s.detailLayout}><div className={s.detailColumn}>{heading}<div ref={left} className={s.detailScroll} tabIndex={0} aria-label={lang==='zh'?'构造大样，左侧可独立滚动':'Construction details; scroll this panel'}>
 {titles.map((title,i)=>{const src=path(`p06-detail-${String(i+1).padStart(2,'0')}-${files[i]}`);return <article key={i} className={s.detailItem}><button ref={el=>{buttons.current[i]=el;}} className={s.detailTitle} aria-expanded={open===i} aria-controls={`detail-panel-${i}`} onClick={()=>setOpen(v=>v===i?null:i)}><span>{String(i+1).padStart(2,'0')} {title[li]}</span><span aria-hidden>{open===i?'−':'↗'}</span></button>{open===i&&<div id={`detail-panel-${i}`} className={s.detailPanel}><button className={s.squareDetail} onClick={()=>view({src,label:title[li]})}><img src={src} alt={title[li]}/></button><p>{descriptions[i][li]}</p></div>}</article>;})}
 <div className={s.locator}><p>{lang==='zh'?'位置示意':'LOCATION'}</p><button onClick={()=>view({src:path('p06-location'),label:lang==='zh'?'位置示意':'Location'})}><img src={path('p06-location')} alt={lang==='zh'?'位置示意':'Location'} loading="lazy"/></button></div></div></div>
 <button ref={right} className={s.perspective} onClick={()=>view({src:path('p06-section-perspective'),label:lang==='zh'?'展览空间剖透视':'Exhibition section perspective'})}><img src={path('p06-section-perspective')} alt={lang==='zh'?'展览空间剖透视':'Exhibition section perspective'} loading="lazy"/></button>
 <svg className={s.leaders} aria-hidden>{lines.map((points,i)=>points&&<polyline key={i} points={points} fill="none" stroke={open===i?'#435298':'#aaa9a2'} strokeWidth="1"/>)}</svg></div>;
}
