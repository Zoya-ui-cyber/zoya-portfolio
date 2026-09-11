const style=document.createElement('link');style.rel='stylesheet';style.href='/house/profile-content.css';document.head.append(style);
const records=[
 ['graduation-silver.jpg','毕业创作暨林风眠创作奖 · 银奖','Graduation & Lin Fengmian Creation Award · Silver','中国美术学院 · 2025年毕业创作获奖。','China Academy of Art · Award for the 2025 graduation project.'],
 ['crystal-kylin-silver.jpg','晶麒麟未来奖 · 银奖','Crystal Kylin Future Award · Silver','2025「陈设中国·晶麒麟」未来奖。','2025 China Interior Decoration · Crystal Kylin Future Award.'],
 ['popular-choice.jpg','晶麒麟未来奖 · 网络最受欢迎奖','Crystal Kylin Future Award · Popular Choice','2025「陈设中国·晶麒麟」未来奖网络评选获奖。','Popular Choice recognition in the 2025 Crystal Kylin Future Award.'],
 ['bamboo-third.png','全国高校筇竹创意设计大赛 · 三等奖','National University Qiong Bamboo Design Competition · Third Prize','2024年第一届全国高校筇竹创意设计大赛，获奖作品《筇境》。','First National University Qiong Bamboo Creative Design Competition, 2024; awarded work: Qiong Jing.'],
 ['outstanding-reporter.jpg','中国美术学院 · 优秀记者','China Academy of Art · Outstanding Reporter','2022–2023学年，在融媒体新闻宣传报道工作中获评优秀记者。','Recognition for university multimedia news reporting in the 2022–2023 academic year.'],
 ['furnishing-designer.jpg','陈设设计师证书','Furnishing Designer Certificate','陈设设计专业水平证书。','Professional qualification in furnishing and decorative design.'],
 ['ielts.jpg','雅思学术类成绩证明','IELTS Academic Test Report','英语语言能力成绩证明。','Academic English language proficiency test report.'],
];
const dialog=document.createElement('dialog');dialog.id='certificate-dialog';dialog.dataset.noTranslate='';dialog.setAttribute('aria-labelledby','certificate-title');dialog.innerHTML='<button class="certificate-close" aria-label="关闭 / Close">×</button><h2 id="certificate-title"></h2><img alt="">';document.body.append(dialog);
dialog.querySelector('button').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
export function renderProfile(active,container,language){
 const en=language==='en';
 if(active==='about'){
  const old=container.querySelector('.resume-download');if(!old)return;
  const downloads=document.createElement('div');downloads.className='profile-resumes';downloads.dataset.noTranslate='';
  for(const [label,file] of [[en?'Chinese CV ↓':'下载中文简历 ↓','resume-zh.pdf'],[en?'English CV ↓':'下载英文简历 ↓','resume-en.pdf']]){const link=document.createElement('a');link.textContent=label;link.href='/profile/'+file;link.download=file;downloads.append(link)}old.replaceWith(downloads);
 }
 if(active==='awards'){
  container.replaceChildren();container.dataset.noTranslate='';
  for(const [start,end,title] of [[0,5,en?'Awards':'奖状'],[5,7,en?'Certificates':'资格证书']]){
   const heading=document.createElement('h2');heading.textContent=title;container.append(heading);
   for(const r of records.slice(start,end)){
    const row=document.createElement('div');row.className='certificate-row';const copy=document.createElement('div'),h=document.createElement('h3'),p=document.createElement('p'),button=document.createElement('button');h.textContent=r[en?2:1];p.textContent=r[en?4:3];copy.append(h,p);button.textContent=en?'View certificate ↗':'查看证书大图 ↗';button.setAttribute('aria-label',(en?'View ':'查看 ')+r[en?2:1]);button.onclick=()=>{dialog.querySelector('h2').textContent=r[en?2:1];const img=dialog.querySelector('img');img.src='/profile/'+r[0];img.alt=r[en?2:1];dialog.showModal()};row.append(copy,button);container.append(row);
   }
  }
 } else {delete container.dataset.noTranslate;}
}
export async function loadPortrait(apply){
 const img=new Image();img.src='/profile/portrait.jpg';
 try{await img.decode();await apply(img);const preview=document.querySelector('#portrait-preview');preview.src=img.src;preview.hidden=false;document.querySelector('#photo-empty').hidden=true;document.querySelector('.photo-upload').hidden=true;document.querySelector('#photo-note').hidden=true;}catch{document.querySelector('#photo-note').textContent='照片加载失败，请刷新重试。 / Please refresh to load the portrait.';}
}
