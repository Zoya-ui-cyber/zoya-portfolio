"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import s from "./programs.module.css";
const programs = [
  {id:"ai-rename",name:"AI Rename",subtitle:["批量识图命名工作流","Batch Visual Naming Workflow"],size:[1084,1426],exe:"NamingApp.exe",
    description:["在批量管理新模型时，我自主优化了识图命名工作流，并借助 AI 开发为桌面工具。将逐张向 AI 提问、手动整理名称的重复操作，转化为基于表格的批量处理流程，也可用于电商商品等需要批量识图命名的场景。","While managing new models in batches, I independently refined the visual naming workflow and developed a desktop tool with AI assistance. It replaces repeated image-by-image prompts and manual naming with a spreadsheet-based batch workflow, also applicable to e-commerce product naming."],
    steps:["准备包含网络图片链接的 Excel → 映射列名 → 选择模型并填写 API Key → 批量生成名称，另存结果。","Prepare an Excel sheet with image URLs → map columns → select a model and enter an API key → generate names in batches and save a new file."],
    note:["支持通义千问与豆包；需自行提供对应平台的 API Key。可调整生成温度，建议将结果另存为新表格。","Supports Qwen and Doubao; your own provider API key is required. Generation temperature is adjustable; saving results to a new spreadsheet is recommended."]},
  {id:"ai-voice",name:"AI Voice",subtitle:["批量文稿配音","Batch Text-to-Speech"],size:[1023,1276],exe:"VoiceApp.exe",
    description:["借助 AI 开发的批量配音工具，将文件夹中的文稿转为语音，减少逐篇导入与重复设置，让文稿整理和音频输出保持对应。","A batch narration tool developed with AI assistance. It converts a folder of scripts into speech, reducing repeated imports and settings while keeping scripts and audio outputs aligned."],
    steps:["选择 TXT / DOCX 文稿文件夹 → 选择配音员并调节语速 → 试听 → 批量输出与文稿同名的 MP3。","Select a folder of TXT / DOCX scripts → choose a voice and adjust speed → preview → export MP3 files named after the source scripts."],
    note:["支持配音试听，语速可在 −50% 至 +50% 之间调节。","Includes voice preview and a speech-rate adjustment from −50% to +50%."]},
  {id:"smart-crop",name:"SmartCrop",subtitle:["智能修剪 · 图像数据集整理","Smart Cropping · Image Dataset Preparation"],size:[979,1186],exe:"SmartCropApp.exe",
    description:["在为 Sora 模型训练准备图像数据库时，素材的格式、尺寸和主体位置不统一。我借助 AI 开发了这款批量修剪工具，将图像整理为统一尺寸，减少数据集准备中的重复操作。","While preparing an image database for Sora model training, I encountered inconsistent formats, dimensions and subject placement. I developed this batch cropping tool with AI assistance to standardize image sizes and reduce repetitive dataset preparation."],
    steps:["选择输入与输出文件夹 → 选择中心裁剪或智能主体居中 → 设置 512、1024 或自定义尺寸 → 批量输出。","Select input and output folders → choose center cropping or smart subject centering → set 512, 1024 or a custom size → batch export."],
    note:["支持 PNG、JPG、JPEG、WebP、BMP。智能主体居中模式面向白底、灰底、绿幕等纯色背景，依据背景色定位主体。","Supports PNG, JPG, JPEG, WebP and BMP. Smart centering is intended for solid-color backgrounds such as white, gray or green screens, locating the subject from the background color."]},
];
export default function Programs(){
 const [en,setEn]=useState(false);const l=en?1:0;
 useEffect(()=>{try{setEn((new URL(location.href).searchParams.get("lang")||localStorage.getItem("zoya-house-language"))==="en");}catch{}},[]);
 function toggle(){const next=!en;setEn(next);try{localStorage.setItem("zoya-house-language",next?"en":"zh");}catch{}const u=new URL(location.href);u.searchParams.set("lang",next?"en":"zh");history.replaceState(history.state,"",u);}
 return <div className={s.root} lang={en?"en":"zh-CN"}>
  <div className={s.navigation} onClick={e=>{if((e.target as HTMLElement).closest("button.language-switch"))toggle();}}><Header/></div>
  <main className={s.main}>
   <header className={s.intro}><p className={s.label}>INTERNSHIP / AI-ASSISTED DEVELOPMENT</p><h1>{en?"Workflow Tools":"程序类"}</h1><p>{en?"Small desktop tools developed with AI assistance to solve repetitive tasks in my internship.":"从实习中的重复任务出发，借助 AI 开发桌面工具，将具体需求转化为可复用的工作流。"}</p></header>
   {programs.map((p,i)=><section className={s.project} key={p.id}>
    <div className={s.copy}><p className={s.label}>0{i+1} / WINDOWS</p><h2>{p.name}</h2><h3>{p.subtitle[l]}</h3><p>{p.description[l]}</p><p className={s.steps}>{p.steps[l]}</p><p className={s.note}>{p.note[l]}</p></div>
    <figure className={s.figure}>
     {/* Original screenshot; no recompression or cropping. */}
     {/* eslint-disable-next-line @next/next/no-img-element */}
     <img src={`/projects/programs/${p.id}/interface.png`} width={p.size[0]} height={p.size[1]} alt={`${p.name} ${en?"interface":"程序界面"}`} loading={i===0?"eager":"lazy"} decoding="async"/>
    </figure>
    <div className={s.download}>{p.exe?<a href={`/projects/programs/${p.id}/${p.exe}`} download={p.exe}>{en?"Download EXE ↓":"下载 EXE ↓"}<span>Windows · {p.id==="ai-rename"?"48.0 MB":p.id==="smart-crop"?"28.3 MB":"EXE"}</span></a>:<button disabled>{en?"EXE coming soon":"EXE 安装包待补充"}</button>}</div>
   </section>)}
  </main><footer className={s.footer}><Link href={`/?lang=${en?"en":"zh"}`}>{en?"← Back to directory":"← 返回作品目录"}</Link></footer>
 </div>
}
