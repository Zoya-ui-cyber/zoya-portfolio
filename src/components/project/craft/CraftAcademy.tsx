"use client";
import {useEffect,useRef,useState,type ReactNode,type PointerEvent} from 'react';
import Link from 'next/link';
import frames from './frames.json';
import {scenes} from './scenes';
import DetailCallouts from './DetailCallouts';
import s from './craft.module.css';
type Lang='zh'|'en';
type Viewer={src:string;label:string};
const base='/projects/craft-academy/';
const imagePath=(page:string,name:string)=>`${base}page-${page}/${name}.png`;
const sceneSrc=(i:number)=>imagePath('05-spatial-scenes',`p05-scene-${String(i+1).padStart(2,'0')}`);
function ImageViewer({src,label,close}:Viewer&{close:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null);const [zoom,setZoom]=useState(1);
 useEffect(()=>{dialog.current?.showModal();},[]);
 return <dialog ref={dialog} className={s.dialog} onClose={close} aria-label={label}><div className={s.tools}><span>{label}</span><button onClick={()=>setZoom(z=>Math.max(1,z-.5))} aria-label="Zoom out">−</button><button onClick={()=>setZoom(z=>Math.min(5,z+.5))} aria-label="Zoom in">+</button><button onClick={()=>setZoom(1)}>100%</button><button autoFocus onClick={()=>dialog.current?.close()} aria-label="Close">×</button></div><div className={s.zoomViewport}><img src={src} alt={label} style={{width:`${zoom*100}%`,maxWidth:'none',height:zoom===1?'100%':'auto',objectFit:'contain'}}/></div></dialog>;
}
export default function CraftAcademy(){
 const [lang,setLang]=useState<Lang>('zh'),[compare,setCompare]=useState(50),[scene,setScene]=useState(3),[stage,setStage]=useState(2),[activePage,setActivePage]=useState(1),[viewer,setViewer]=useState<Viewer|null>(null);
 const scroller=useRef<HTMLDivElement>(null),video=useRef<HTMLVideoElement>(null);
 const choose=(zh:string,en:string)=>lang==='zh'?zh:en;
 const copy=(page:number,name:string)=>frames.find(f=>f.page===page&&f.lang===lang)?.root.children.find(n=>n.name===name)?.text||'';
 const jump=(page:number)=>{const target=document.getElementById(`craft-${page}`);if(target&&scroller.current)scroller.current.scrollTo({top:target.offsetTop,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});};
 useEffect(()=>{
  const query=new URLSearchParams(location.search).get('lang');let saved:string|null=null;try{saved=localStorage.getItem('portfolio-language');}catch{}
  setLang(query==='en'||query==='zh'?query:saved==='en'?'en':'zh');
  const root=scroller.current;if(!root)return;let current=1;
  const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting&&e.intersectionRatio>=.55){current=Number(e.target.getAttribute('data-page'));setActivePage(current);}}),{root,threshold:[.55]});root.querySelectorAll('[data-page]').forEach(e=>io.observe(e));
  let lastWidth=root.clientWidth,lastHeight=root.clientHeight;
  const ro=new ResizeObserver(()=>{if(root.clientWidth!==lastWidth||root.clientHeight!==lastHeight){lastWidth=root.clientWidth;lastHeight=root.clientHeight;root.scrollTo({top:(current-1)*root.clientHeight,behavior:'instant'});}});ro.observe(root);
  return()=>{io.disconnect();ro.disconnect();};
 },[]);
 useEffect(()=>{document.documentElement.lang=lang==='zh'?'zh-CN':'en';},[lang]);
 useEffect(()=>{if(activePage!==3)video.current?.pause();},[activePage]);
 function toggleLanguage(){const next=lang==='zh'?'en':'zh';setLang(next);try{localStorage.setItem('portfolio-language',next);}catch{}const url=new URL(location.href);url.searchParams.set('lang',next);history.replaceState(null,'',url);}
 function seek(index:number){setStage(index);if(video.current){video.current.currentTime=index*3;void video.current.play().catch(()=>{});}}
 function updateCompare(e:PointerEvent<HTMLDivElement>){const r=e.currentTarget.getBoundingClientRect();setCompare(Math.max(0,Math.min(100,(e.clientX-r.left)/r.width*100)));}
 const heading=(page:number)=><div className={s.sectionHeading}><p>{copy(page,'Section no')}<span>{copy(page,'Section en')}</span></p><h1>{copy(page,'Section zh')}</h1></div>;
 const foot=(page:number,text?:string)=><footer className={s.pageFooter}><button onClick={()=>jump(page<9?page+1:1)}>{text||copy(page,'Footer cue')}</button></footer>;
 const photo=(src:string,label:string,cls=s.photo,fit:'contain'|'cover'='contain')=><button className={cls} onClick={()=>setViewer({src,label})}><img src={src} alt={label} loading="lazy" style={{objectFit:fit}}/></button>;
 const thumbnails=(overview:boolean)=><nav className={s.thumbnails} aria-label={choose('选择空间场景','Select spatial scene')}>{scenes.map((item,i)=><button key={i} aria-pressed={scene===i} onClick={()=>{setScene(i);if(overview)jump(5);}}><img src={overview?imagePath('04-spatial-overview',`p04-scene-${String(i+1).padStart(2,'0')}-thumbnail`):sceneSrc(i)} alt={item[lang==='zh'?1:0]} loading="lazy"/><span>{String(i+1).padStart(2,'0')}</span></button>)}</nav>;
 const screen=(page:number,content:ReactNode)=><section id={`craft-${page}`} data-page={page} className={s.screen} aria-label={`${page} / ${choose('项目页面','Project page')}`}>{content}</section>;
 return <main className={s.portfolio}><header className={s.fixedHeader}><Link href={`/?lang=${lang}`}>YIN ZHENGJIE</Link><nav aria-label={choose('主导航','Main navigation')}><Link href={`/?lang=${lang}`}>{choose('作品','WORK')}</Link><Link href={`/about?lang=${lang}`}>{choose('关于','ABOUT')}</Link><button onClick={toggleLanguage} aria-label={choose('切换至英文','Switch to Chinese')}>{choose('中 / EN','EN / 中')}</button></nav></header>
 <div ref={scroller} className={s.scroller} tabIndex={0} aria-label={choose('滚动浏览九个项目页面','Scroll through nine project pages')}>
 {screen(1,<><div className={s.heroCompare} role="slider" tabIndex={0} aria-label={choose('改造前后对比','Before and after comparison')} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(compare)} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);updateCompare(e);}} onPointerMove={e=>{if(e.currentTarget.hasPointerCapture(e.pointerId))updateCompare(e);}} onKeyDown={e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();setCompare(v=>e.key==='Home'?0:e.key==='End'?100:Math.max(0,Math.min(100,v+(e.key==='ArrowLeft'?-2:2))));}}}>
 <img className={s.compareImage} src={imagePath('01-hero','p01-after')} alt={choose('改造后航拍','After renovation')} draggable={false}/><img className={s.compareImage} src={imagePath('01-hero','p01-before')} alt={choose('改造前航拍','Before renovation')} draggable={false} style={{clipPath:`inset(0 ${100-compare}% 0 0)`}}/><div className={s.compareLine} style={{left:`${compare}%`}}><span/></div></div>
 <div className={s.heroInfo}><div><p className={s.kicker}>{copy(1,'Project label')}</p><h1>{copy(1,'Project title')}</h1></div><p className={s.heroEnglish}>{lang==='zh'?'CRAFT ACADEMY RENOVATION':''}</p><div className={s.compareControl}><label htmlFor="compare-position">BEFORE ↔ AFTER</label><small>{choose('拖动对比','DRAG TO COMPARE')}</small><input id="compare-position" type="range" min={0} max={100} value={compare} onChange={e=>setCompare(Number(e.target.value))}/></div><p className={s.heroMeta}>SONGYANG · ZHEJIANG<br/>2025</p></div>{foot(1,copy(1,'Scroll cue'))}</>)}
 {screen(2,<><div className={s.contextImage}>{photo(imagePath('02-context','p02-context-research'),choose('场地背景与研究','Context and research'))}</div>{foot(2,choose('继续 / 设计生成 ↓','NEXT / DESIGN GENERATION ↓'))}</>)}
 {screen(3,<>{heading(3)}<div className={s.videoWrap}><video ref={video} controls muted playsInline preload="metadata" src={`${base}page-03-generation/p03-design-generation.mp4`} onLoadedMetadata={()=>{if(video.current)video.current.currentTime=6;}} onTimeUpdate={e=>setStage(Math.min(5,Math.floor(e.currentTarget.currentTime/3)))} aria-label={choose('设计生成视频','Design generation video')}/></div><nav className={s.timeline} aria-label={choose('视频阶段','Video stages')}>{Array.from({length:6},(_,i)=><button key={i} aria-pressed={stage===i} onClick={()=>seek(i)}>{copy(3,`time t ${i}`)}</button>)}</nav><p className={s.hint}>{choose('点击阶段，跳转到对应的设计过程。','Select a stage to explore the design process.')}</p>{foot(3)}</>)}
 {screen(4,<>{heading(4)}{photo(imagePath('04-spatial-overview','p04-main-section'),choose('空间序列总剖面','Spatial sequence section'))}{thumbnails(true)}<p className={s.hint}>{choose('点击缩略图查看对应空间。','Select a thumbnail to explore the corresponding space.')}</p>{foot(4)}</>)}
 {screen(5,<>{thumbnails(false)}<div className={s.sceneView}>{photo(sceneSrc(scene),scenes[scene][lang==='zh'?1:0],s.scenePhoto,'cover')}<div className={s.sceneInfo} tabIndex={0}><strong>{String(scene+1).padStart(2,'0')}　{scenes[scene][0]}{lang==='zh'?` / ${scenes[scene][1]}`:''}</strong><p>{choose('查看空间说明','Explore this space')}</p><div className={s.description}>{scenes[scene][lang==='zh'?2:3]}</div></div><span className={s.sceneCount}>{String(scene+1).padStart(2,'0')} / 08</span></div>{foot(5)}</>)}
 {screen(6,<><DetailCallouts lang={lang} view={setViewer} heading={heading(6)}/>{foot(6)}</>)}
 {screen(7,<><div className={s.transformation}><div className={s.transformationLeft}>{heading(7)}<div className={s.beforeModels}>{photo(imagePath('07-transformation','p07-before-model-01'),choose('既有模型1','Existing model 1'))}{photo(imagePath('07-transformation','p07-before-model-02'),choose('既有模型2','Existing model 2'))}</div></div>{photo(imagePath('07-transformation','p07-exploded-axonometric'),choose('完整拆解轴测图','Exploded axonometric'),s.exploded)}</div>{foot(7,choose('继续 / 图纸与模型档案 ↓','NEXT / DRAWINGS & MODEL ARCHIVE ↓'))}</>)}
 {screen(8,<><div className={s.archiveHeading}><p className={s.kicker}>{copy(8,'Section no')}　 {copy(8,'Section en')}</p><h1 className={s.archiveTitle}>{copy(8,'Title')}</h1><p className={s.hint}>{copy(8,'Subcopy')}</p></div><div className={s.archiveGrid}>{photo(imagePath('08-model-archive','p08-technical-drawings'),choose('技术图纸','Technical drawings'),s.drawings)}<div className={s.modelColumn}><div className={s.modelLabel}><span>MODEL PHOTOS</span><span>SCROLL ↓</span></div><div className={s.modelScroll} tabIndex={0} aria-label={choose('独立滚动浏览模型照片','Scroll model photos independently')}>{Array.from({length:6},(_,i)=><figure key={i}>{photo(imagePath('08-model-archive',`p08-model-${String(i+1).padStart(2,'0')}`),`${choose('模型照片','Model photo')} ${i+1}`,s.modelPhoto)}<figcaption>{String(i+1).padStart(2,'0')} / 06</figcaption></figure>)}</div></div></div><footer className={s.pageFooter}><button onClick={()=>jump(1)}>{copy(8,'Footer left')}</button><Link href={`/projects/xinhua-road?lang=${lang}`}>{copy(8,'Footer next')}</Link></footer></>)}
 {screen(9,<><div className={s.endIntro}><p className={s.kicker}>{copy(9,'Kicker')}</p><h1>{copy(9,'End title')}</h1><p>{copy(9,'End copy')}</p></div><Link className={s.nextCard} href={`/projects/xinhua-road?lang=${lang}`}><small>{copy(9,'Next no')}</small><h2>{copy(9,'Next title')}</h2><p>{lang==='zh'?copy(9,'Next en'):''}</p><small>{copy(9,'Next note')}</small><span>{copy(9,'Enter')}</span></Link><Link className={s.back} href={`/?lang=${lang}`}>{copy(9,'Back')}</Link>{foot(9)}</>)}
 </div>{viewer&&<ImageViewer src={viewer.src} label={viewer.label} close={()=>setViewer(null)}/>}</main>;
}
